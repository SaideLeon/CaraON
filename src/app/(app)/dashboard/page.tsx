
'use client';

import { useEffect, useState, useCallback } from 'react';
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
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as suas instâncias.' });
      } finally {
        setLoading(false);
      }
    };
    fetchInstances();
  }, [token, toast]);

  const closeDialogs = useCallback(() => {
    setIsCreateDialogOpen(false);
    setQrCodeData(null);
    setReconnectingInstance(null);
  }, []);

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'qr_code' && lastMessage.data) {
        setQrCodeData({ clientId: lastMessage.clientId, data: lastMessage.data });
      }
      if (lastMessage.type === 'instance_status') {
        let instanceName = 'uma instância';
        const instance = instances.find(inst => inst.clientId === lastMessage.clientId);
        if (instance) {
          instanceName = `"${instance.name}"`;
        }

        if (lastMessage.status === 'connected') {
            toast({ title: 'Conectado!', description: `A instância ${instanceName} está agora conectada.` });
            closeDialogs();
        }
        if (lastMessage.status === 'disconnected') {
            toast({ title: 'Desconectado', description: `A instância ${instanceName} foi desconectada.` });
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
  }, [lastMessage, instances, toast, closeDialogs]);

  const handleInstanceCreated = (newInstance: Instance) => {
    // API now returns status, so we can use it directly
    const initialStatus = (newInstance.status?.toLowerCase() as any) || 'pending';
    setInstances(prev => [...prev, { ...newInstance, status: initialStatus }]);
    // We don't set isCreateDialogOpen to true here anymore, the dialog handles its own QR code state
  };

  const handleReconnect = async (instance: Instance) => {
    setReconnectingInstance(instance);
    setIsCreateDialogOpen(true);
    setQrCodeData(null); 
    try {
        await api.post(`/instances/${instance.id}/reconnect`);
        toast({
            title: 'Reconexão Iniciada',
            description: `Aguardando código QR para "${instance.name}"...`
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Falha ao iniciar o processo de reconexão.'
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
        const message = error.response?.data?.error || 'Falha ao desconectar instância.';
        toast({
            variant: 'destructive',
            title: 'Erro',
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
                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Isto irá desconectar a sessão do WhatsApp para a instância "{disconnectingInstance?.name}". Terá de digitalizar um novo código QR para se reconectar.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDisconnect} disabled={isDisconnecting}>
                        {isDisconnecting ? 'A desconectar...' : 'Desconectar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Instância
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : instances.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map(instance => (
            <InstanceCard key={instance.id} instance={instance} onReconnect={handleReconnect} onDisconnect={handleDisconnect} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Nenhuma instância encontrada</h3>
          <p className="text-muted-foreground mt-2">Comece por criar a sua primeira instância do WhatsApp.</p>
           <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Instância
            </Button>
        </div>
      )}
    </>
  );
}
