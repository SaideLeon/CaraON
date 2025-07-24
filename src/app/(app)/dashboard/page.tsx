
'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Button } from '@/components/ui/button';
import { CreateInstanceDialog } from '@/components/dashboard/CreateInstanceDialog';
import type { Instance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import api, { deleteInstance } from '@/services/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { InstanceCard } from '@/components/dashboard/InstanceCard';

type ConnectionAttemptStatus = 'idle' | 'loading' | 'awaiting_qr' | 'connected' | 'error';
interface ConnectionAttempt {
  instance: Instance | null;
  status: ConnectionAttemptStatus;
  qrCode: string | null;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const { lastMessage } = useWebSocket();
  const { toast } = useToast();

  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectingInstance, setDisconnectingInstance] = useState<Instance | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingInstance, setDeletingInstance] = useState<Instance | null>(null);

  const [connectionAttempt, setConnectionAttempt] = useState<ConnectionAttempt>({
    instance: null,
    status: 'idle',
    qrCode: null,
  });

  const fetchInstances = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await api.get('/user/instances');
      const data: Instance[] = response.data;
      setInstances(data.map(inst => ({ ...inst, status: inst.status?.toLowerCase() as any || 'pending' })));
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar as suas instâncias.' });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchInstances();
  }, [fetchInstances]);

  const resetConnectionAttempt = useCallback(() => {
    setConnectionAttempt({ instance: null, status: 'idle', qrCode: null });
  }, []);

  useEffect(() => {
    if (!lastMessage || !connectionAttempt.instance) return;

    if (lastMessage.type === 'qr_code' && lastMessage.data && lastMessage.clientId === connectionAttempt.instance.clientId) {
        setConnectionAttempt(prev => ({ ...prev, status: 'awaiting_qr', qrCode: lastMessage.data }));
    }

    if (lastMessage.type === 'instance_status') {
      let instanceName = 'uma instância';
      let isRelevantUpdate = false;
      
      setInstances(prevInstances => 
        prevInstances.map(inst => {
          if (inst.clientId === lastMessage.clientId) {
            instanceName = `"${inst.name}"`;
            isRelevantUpdate = true;
            return { ...inst, status: lastMessage.status?.toLowerCase() as any };
          }
          return inst;
        })
      );

      if (isRelevantUpdate) {
        if (lastMessage.status === 'connected') {
          toast({ title: 'Conectado!', description: `A instância ${instanceName} está agora conectada.` });
          if(connectionAttempt.instance?.clientId === lastMessage.clientId) {
            resetConnectionAttempt();
          }
        }
        if (lastMessage.status === 'disconnected') {
          toast({ title: 'Desconectado', description: `A instância ${instanceName} foi desconectada.` });
        }
      }
    }
  }, [lastMessage, connectionAttempt.instance, toast, resetConnectionAttempt]);

  const handleCreateInstance = () => {
    setConnectionAttempt({
        instance: null, // This is a new instance, so no existing data
        status: 'loading',
        qrCode: null,
    });
  };

  const onInstanceCreated = (newInstance: Instance) => {
    fetchInstances(); // Re-fetch all instances to get the complete and updated list
    setConnectionAttempt(prev => ({
        ...prev,
        instance: newInstance,
        status: 'loading', // Still loading while waiting for QR
    }));
  }

  const handleReconnect = async (instance: Instance) => {
    setConnectionAttempt({
      instance,
      status: 'loading',
      qrCode: connectionAttempt.instance?.id === instance.id ? connectionAttempt.qrCode : null,
    });
    try {
      await api.post(`/instances/${instance.id}/reconnect`);
      toast({
        title: 'Reconexão Iniciada',
        description: `Aguardando novo código QR para "${instance.name}"...`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de Reconexão',
        description: 'Falha ao iniciar o processo de reconexão.'
      });
      resetConnectionAttempt();
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
      // Optimistic update
      setInstances(prev => prev.map(inst => 
          inst.id === disconnectingInstance.id ? { ...inst, status: 'disconnected' } : inst
      ));
      toast({ title: 'Desconectado', description: `A instância "${disconnectingInstance.name}" foi desconectada.`});
    } catch (error: any) {
      const message = error.response?.data?.error || 'Falha ao desconectar instância.';
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: message,
      });
      fetchInstances(); // Re-fetch to get the real state
    } finally {
      setIsDisconnecting(false);
      setDisconnectingInstance(null);
    }
  }

  const handleDelete = (instance: Instance) => {
    setDeletingInstance(instance);
  }

  const confirmDelete = async () => {
    if (!deletingInstance) return;

    setIsDeleting(true);
    try {
      await deleteInstance(deletingInstance.id);
      setInstances(prev => prev.filter(inst => inst.id !== deletingInstance.id));
      toast({ title: 'Instância Excluída', description: `A instância "${deletingInstance.name}" foi excluída permanentemente.`});
    } catch (error: any) {
      const message = error.response?.data?.error || 'Falha ao excluir a instância.';
      toast({
        variant: 'destructive',
        title: 'Erro de Exclusão',
        description: message,
      });
    } finally {
      setIsDeleting(false);
      setDeletingInstance(null);
    }
  }

  return (
    <>
      <CreateInstanceDialog
        open={connectionAttempt.status !== 'idle'}
        onOpenChange={(isOpen) => !isOpen && resetConnectionAttempt()}
        connectionAttempt={connectionAttempt}
        onInstanceCreated={onInstanceCreated}
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

      <AlertDialog open={!!deletingInstance} onOpenChange={() => setDeletingInstance(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto excluirá permanentemente a instância "{deletingInstance?.name}" e todos os seus dados associados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'A excluir...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex justify-end mb-6">
        <Button onClick={handleCreateInstance}>
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
            <InstanceCard key={instance.id} instance={instance} onReconnect={handleReconnect} onDisconnect={handleDisconnect} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Nenhuma instância encontrada</h3>
          <p className="text-muted-foreground mt-2">Comece por criar a sua primeira instância do WhatsApp.</p>
           <Button className="mt-4" onClick={handleCreateInstance}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Instância
            </Button>
        </div>
      )}
    </>
  );
}
