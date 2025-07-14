'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Button } from '@/components/ui/button';
import { CreateInstanceDialog } from '@/components/dashboard/CreateInstanceDialog';
import { InstanceCard } from '@/components/dashboard/InstanceCard';
import type { Instance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function DashboardPage() {
  const { token } = useAuth();
  const { lastMessage } = useWebSocket();
  const { toast } = useToast();

  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ clientId: string, data: string } | null>(null);
  const [reconnectingInstance, setReconnectingInstance] = useState<Instance | null>(null);

  const [disconnectingInstance, setDisconnectingInstance] = useState<Instance | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);


  useEffect(() => {
    const fetchInstances = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api.get('/user/instances');
        const data: Instance[] = response.data;
        // Convert status to lowercase as the UI components expect it that way
        setInstances(data.map(inst => ({ ...inst, status: inst.status?.toLowerCase() as any || 'pending' })));
      } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load your instances.' });
      } finally {
        setLoading(false);
      }
    };
    fetchInstances();
  }, [token, toast]);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'qr_code' && lastMessage.data) {
        setQrCodeData({ clientId: lastMessage.clientId, data: lastMessage.data });
      }
      if (lastMessage.type === 'instance_status') {
        if (lastMessage.status === 'connected') {
            const connectedInstance = instances.find(inst => inst.clientId === lastMessage.clientId);
            if(connectedInstance) {
                toast({ title: 'Connected!', description: `Instance "${connectedInstance.name}" is now connected.` });
                closeDialogs();
            }
        }
        if (lastMessage.status === 'disconnected') {
            const disconnectedInstance = instances.find(inst => inst.clientId === lastMessage.clientId);
            if(disconnectedInstance) {
                toast({ title: 'Disconnected', description: `Instance "${disconnectedInstance.name}" has been disconnected.` });
            }
        }
        setInstances(prev =>
          prev.map(inst =>
            inst.clientId === lastMessage.clientId
              ? { ...inst, status: lastMessage.status }
              : inst
          )
        );
      }
    }
  }, [lastMessage, instances, toast]);

  const handleInstanceCreated = (newInstance: Instance) => {
    // API now returns status, so we can use it directly
    const initialStatus = (newInstance.status?.toLowerCase() as any) || 'pending';
    setInstances(prev => [...prev, { ...newInstance, status: initialStatus }]);
    setIsCreateDialogOpen(true);
  };
  
  const closeDialogs = () => {
    setIsCreateDialogOpen(false);
    setQrCodeData(null);
    setReconnectingInstance(null);
  }

  const handleReconnect = async (instance: Instance) => {
    setReconnectingInstance(instance);
    setIsCreateDialogOpen(true);
    setQrCodeData(null); 
    try {
        await api.post(`/instances/${instance.id}/reconnect`);
        toast({
            title: 'Reconnection Initiated',
            description: `Waiting for QR code for "${instance.name}"...`
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to start reconnection process.'
        });
        closeDialogs();
    }
  }

  const handleDisconnect = (instance: Instance) => {
    setDisconnectingInstance(instance);
  }

  const confirmDisconnect = async () => {
    if (!disconnectingInstance) return;

    setIsDisconnecting(true);
    try {
        await api.post(`/instances/${disconnectingInstance.id}/disconnect`);
        setInstances(prev => prev.map(inst => 
            inst.id === disconnectingInstance.id ? { ...inst, status: 'disconnected' } : inst
        ));
    } catch (error: any) {
        const message = error.response?.data?.error || 'Failed to disconnect instance.';
        toast({
            variant: 'destructive',
            title: 'Error',
            description: message,
        });
    } finally {
        setIsDisconnecting(false);
        setDisconnectingInstance(null);
    }
  }


  return (
    <>
       <CreateInstanceDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onInstanceCreated={handleInstanceCreated}
            qrCodeData={qrCodeData}
            onDialogClose={closeDialogs}
            reconnectingInstance={reconnectingInstance}
        />
        
        <AlertDialog open={!!disconnectingInstance} onOpenChange={() => setDisconnectingInstance(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will disconnect the WhatsApp session for the instance "{disconnectingInstance?.name}". You will need to scan a new QR code to reconnect.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDisconnect} disabled={isDisconnecting}>
                        {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>


      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : instances.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instances.map(instance => (
            <InstanceCard key={instance.id} instance={instance} onReconnect={handleReconnect} onDisconnect={handleDisconnect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No instances found</h3>
          <p className="text-muted-foreground mt-2">Get started by creating your first WhatsApp instance.</p>
           <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Instance
            </Button>
        </div>
      )}
    </>
  );
}
