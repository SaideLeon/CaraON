
'use client';

import { useState, useEffect } from 'react';
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

type ConnectionAttemptStatus = 'idle' | 'loading' | 'awaiting_qr' | 'connected' | 'error';
interface ConnectionAttempt {
  instance: Instance | null;
  status: ConnectionAttemptStatus;
  qrCode: string | null;
}

interface CreateInstanceDialogProps {
  onInstanceCreated: (instance: Instance) => void;
  connectionAttempt: ConnectionAttempt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInstanceDialog({
  onInstanceCreated,
  connectionAttempt,
  open,
  onOpenChange,
}: CreateInstanceDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InstanceFormValues>({
    resolver: zodResolver(instanceSchema),
    defaultValues: { name: '' },
  });

  // Reset form when the dialog opens for a new instance creation
  useEffect(() => {
    if (open && !connectionAttempt.instance) {
      form.reset();
    }
  }, [open, connectionAttempt.instance, form]);
  
  const onSubmit = async (data: InstanceFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/new/instance', data);
      const newInstance = response.data.instance;
      
      toast({
        title: 'Criação de Instância Iniciada',
        description: 'Aguardando código QR...',
      });
      onInstanceCreated(newInstance);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar instância.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
      onOpenChange(false); // Close dialog on error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLoading = connectionAttempt.status === 'loading';
  const showQRCode = connectionAttempt.status === 'awaiting_qr' && connectionAttempt.qrCode;
  const isReconnectMode = !!connectionAttempt.instance;
  
  const renderContent = () => {
    // If it's a reconnect or a new instance waiting for QR, show loader/QR
    if (isReconnectMode || (connectionAttempt.instance && (isLoading || showQRCode))) {
        return (
            <div className="flex justify-center items-center py-4 min-h-[250px]">
                {isLoading && !showQRCode && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
                {showQRCode && (
                    <div className="flex flex-col items-center gap-4">
                        <Image src={connectionAttempt.qrCode!} alt="WhatsApp QR Code" width={250} height={250} />
                        <p className="text-sm text-muted-foreground">Código QR para: <span className="font-bold">{connectionAttempt.instance?.name}</span></p>
                    </div>
                )}
            </div>
        )
    }

    // Otherwise, show the form to create a new instance
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
                      <Input placeholder="ex: Equipa de Vendas" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Criar e Obter Código QR
                </Button>
              </DialogFooter>
            </form>
          </Form>
    )
  }

  const getDialogTitle = () => {
    if (isReconnectMode) return 'Reconectar Instância';
    if (connectionAttempt.instance) return 'Digitalizar Código QR';
    return 'Criar Nova Instância';
  }

  const getDialogDescription = () => {
     if (isReconnectMode || connectionAttempt.instance) {
       return `Digitalize o código com a sua aplicação WhatsApp para ligar "${connectionAttempt.instance?.name}".`
     }
     return "Dê um nome à sua nova instância do WhatsApp para começar.";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { if(isLoading) {e.preventDefault()}}}>
        <DialogHeader>
          <DialogTitle className="font-headline">{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
