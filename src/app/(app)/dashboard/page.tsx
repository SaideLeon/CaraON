'use client';

import { useEffect, useState } from 'react';
import { PlusCircle, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Button } from '@/components/ui/button';
import { CreateInstanceDialog } from '@/components/dashboard/CreateInstanceDialog';
import { InstanceCard } from '@/components/dashboard/InstanceCard';
import type { Instance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/api';

export default function DashboardPage() {
  const { token } = useAuth();
  const { lastMessage, isConnected } = useWebSocket();
  const { toast } = useToast();

  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{ clientId: string, data: string } | null>(null);

  useEffect(() => {
    const fetchInstances = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await api.get('/user/instances');
        const data: Instance[] = response.data;
        setInstances(data.map(inst => ({ ...inst, status: 'pending' })));
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
        // This assumes the dialog for the new instance is already open
        // We might need to find a way to open it if it's not
      }
      if (lastMessage.type === 'instance_status') {
        setInstances(prev =>
          prev.map(inst =>
            inst.clientId === lastMessage.clientId
              ? { ...inst, status: lastMessage.status }
              : inst
          )
        );
      }
    }
  }, [lastMessage]);

  const handleInstanceCreated = (newInstance: Instance) => {
    setInstances(prev => [...prev, { ...newInstance, status: 'pending' }]);
    setIsDialogOpen(true);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
    setQrCodeData(null);
  }


  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-headline font-bold">Instances</h1>
          <p className="text-muted-foreground">Manage your WhatsApp connections.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-sm ${isConnected ? 'text-green-600' : 'text-destructive'}`}>
                {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <CreateInstanceDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onInstanceCreated={handleInstanceCreated}
              qrCodeData={qrCodeData}
              onDialogClose={closeDialog}
            >
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Instance
              </Button>
            </CreateInstanceDialog>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : instances.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instances.map(instance => (
            <InstanceCard key={instance.id} instance={instance} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No instances found</h3>
          <p className="text-muted-foreground mt-2">Get started by creating your first WhatsApp instance.</p>
          <CreateInstanceDialog 
            onInstanceCreated={handleInstanceCreated} 
            onDialogClose={closeDialog}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            >
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Instance
            </Button>
          </CreateInstanceDialog>
        </div>
      )}
    </div>
  );
}
