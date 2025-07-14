'use client';

import { useState, type ReactNode } from 'react';
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
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Instance } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

const API_BASE_URL = 'http://caraonback.cognick.qzz.io/api/v1';

const instanceSchema = z.object({
  name: z.string().min(3, { message: 'Instance name must be at least 3 characters.' }),
});

type InstanceFormValues = z.infer<typeof instanceSchema>;

interface CreateInstanceDialogProps {
  children: ReactNode;
  onInstanceCreated: (instance: Instance) => void;
  onDialogClose: () => void;
  qrCodeData?: { clientId: string, data: string } | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateInstanceDialog({
  children,
  onInstanceCreated,
  onDialogClose,
  qrCodeData,
  open,
  onOpenChange
}: CreateInstanceDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [createdInstance, setCreatedInstance] = useState<Instance | null>(null);

  const form = useForm<InstanceFormValues>({
    resolver: zodResolver(instanceSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: InstanceFormValues) => {
    if (!token) return;
    setLoading(true);
    setCreatedInstance(null);
    try {
      const response = await fetch(`${API_BASE_URL}/new/instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create instance.');
      
      toast({
        title: 'Instance Creation Initiated',
        description: 'Waiting for QR code...',
      });
      setCreatedInstance(result.instance);
      onInstanceCreated(result.instance);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setLoading(false);
    } 
    // loading remains true until QR code is received or timeout
  };
  
  const showQRCode = qrCodeData && createdInstance && qrCodeData.clientId === createdInstance.clientId;
  
  if (showQRCode && loading) {
    setLoading(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
        onOpenChange(isOpen);
    }
    if (!isOpen) {
        onDialogClose();
        form.reset();
        setCreatedInstance(null);
        setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline">
            {createdInstance ? 'Scan QR Code' : 'Create New Instance'}
          </DialogTitle>
          <DialogDescription>
            {createdInstance
              ? "Scan the code with your WhatsApp app to connect."
              : "Give your new WhatsApp instance a name to get started."}
          </DialogDescription>
        </DialogHeader>

        {!createdInstance ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instance Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sales Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create and Get QR Code
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
            <div className="flex justify-center items-center py-4 min-h-[250px]">
                {loading && !showQRCode && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
                {showQRCode && qrCodeData && (
                    <div className="flex flex-col items-center gap-4">
                        <Image src={qrCodeData.data} alt="WhatsApp QR Code" width={250} height={250} />
                        <p className="text-sm text-muted-foreground">QR code for: <span className="font-bold">{createdInstance.name}</span></p>
                    </div>
                )}
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
