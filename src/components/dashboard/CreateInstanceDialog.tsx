'use client';

import { useState, type ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import type { Instance } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import api from '@/services/api';

const instanceSchema = z.object({
  name: z.string().min(3, { message: 'O nome da instância deve ter pelo menos 3 caracteres.' }),
});

type InstanceFormValues = z.infer<typeof instanceSchema>;

interface CreateInstanceDialogProps {
  onInstanceCreated: (instance: Instance) => void;
  onDialogClose: () => void;
  qrCodeData?: { clientId: string, data: string } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  reconnectingInstance?: Instance | null;
}

export function CreateInstanceDialog({
  onInstanceCreated,
  onDialogClose,
  qrCodeData,
  open,
  onOpenChange,
  reconnectingInstance
}: CreateInstanceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [createdInstance, setCreatedInstance] = useState<Instance | null>(null);

  const form = useForm<InstanceFormValues>({
    resolver: zodResolver(instanceSchema),
    defaultValues: { name: '' },
  });
  
  const isReconnectMode = !!reconnectingInstance;
  const instanceForQr = reconnectingInstance || createdInstance;
  
  useEffect(() => {
    if (!open) {
        // Reset local state when dialog closes, but don't call the callback
        setCreatedInstance(null);
        setLoading(false);
        form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: InstanceFormValues) => {
    setLoading(true);
    setCreatedInstance(null);
    try {
      const response = await api.post('/new/instance', data);
      const result = response.data;
      
      toast({
        title: 'Criação de Instância Iniciada',
        description: 'Aguardando código QR...',
      });
      setCreatedInstance(result.instance);
      onInstanceCreated(result.instance); // This now signals the parent page
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar instância.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
      setLoading(false);
    } 
    // loading remains true until QR code is received or timeout
  };
  
  const showQRCode = qrCodeData && instanceForQr && qrCodeData.clientId === instanceForQr.clientId;
  
  useEffect(() => {
    // When in reconnect mode, we start in a loading state.
    if(isReconnectMode) {
        setLoading(true);
    }
    // If we receive a QR code, stop loading.
    if (showQRCode && loading) {
        setLoading(false);
    }
  }, [isReconnectMode, showQRCode, loading])
  

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
        onOpenChange(isOpen);
    }
    if (!isOpen) {
      onDialogClose(); // Call the close callback only when dialog is explicitly closed.
    }
  }

  const renderContent = () => {
    if (isReconnectMode || createdInstance) {
        return (
            <div className="flex justify-center items-center py-4 min-h-[250px]">
                {(loading && !showQRCode) && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
                {showQRCode && qrCodeData && (
                    <div className="flex flex-col items-center gap-4">
                        <Image src={qrCodeData.data} alt="WhatsApp QR Code" width={250} height={250} />
                        <p className="text-sm text-muted-foreground">Código QR para: <span className="font-bold">{instanceForQr?.name}</span></p>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Instância</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Equipa de Vendas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar e Obter Código QR
                </Button>
              </DialogFooter>
            </form>
          </Form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { if(loading) {e.preventDefault()}}}>
        <DialogHeader>
          <DialogTitle className="font-headline">
            {isReconnectMode ? 'Reconectar Instância' : (createdInstance ? 'Digitalizar Código QR' : 'Criar Nova Instância')}
          </DialogTitle>
          <DialogDescription>
            {isReconnectMode || createdInstance
              ? `Digitalize o código com a sua aplicação WhatsApp para ligar "${instanceForQr?.name}".`
              : "Dê um nome à sua nova instância do WhatsApp para começar."}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
