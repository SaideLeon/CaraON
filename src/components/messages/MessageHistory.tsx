
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, User, MessageSquare, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getMessages, deleteMessage } from '@/services/api';
import type { Contact, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';


interface MessageHistoryProps {
  instanceId: string;
  contact: Contact | null;
}

export function MessageHistory({ instanceId, contact }: MessageHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }, 100);
    }
  };

  useEffect(() => {
    if (contact) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await getMessages(instanceId, contact.id);
          setMessages(response.data.reverse() || []); // API might return newest first, so we reverse
          scrollToBottom();
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao buscar mensagens',
            description: 'Não foi possível carregar o histórico de mensagens.',
          });
          setMessages([]);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [instanceId, contact, toast]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(!input.trim()) return;
    toast({ title: "Envio de Mensagens", description: "A funcionalidade de envio de mensagens ainda não está implementada."});
    setInput('');
  }

  const handleDelete = async () => {
    if (!messageToDelete) return;

    try {
        await deleteMessage(messageToDelete.id);
        setMessages(prev => prev.filter(m => m.id !== messageToDelete.id));
        toast({ title: 'Mensagem Excluída' });
    } catch(error) {
         toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível excluir a mensagem.' });
    } finally {
        setMessageToDelete(null);
    }
  }


  if (!contact) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="mx-auto h-12 w-12" />
          <p className="mt-4">Selecione uma conversa para ver as mensagens.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
    <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Excluir mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
                Esta ação não pode ser desfeita. A mensagem será removida permanentemente.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">
                Excluir
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex-row items-center gap-3 space-y-0">
        <Avatar>
            <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div>
            <CardTitle className="text-xl">{contact.name || contact.phone}</CardTitle>
            <p className="text-sm text-muted-foreground">{contact.phone}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {loading ? (
             <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={cn(
                        'flex items-end gap-2 group',
                        message.fromMe ? 'justify-end' : 'justify-start'
                    )}
                    >
                    
                    {!message.fromMe && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                    )}

                     <div className='flex items-center gap-2'>
                        {message.fromMe && (
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className='h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'
                            onClick={() => setMessageToDelete(message)}
                           >
                            <Trash2 className='h-4 w-4' />
                           </Button>
                        )}
                        <div
                            className={cn(
                            'max-w-xs rounded-lg px-3 py-2 md:max-w-md lg:max-w-xl',
                            message.fromMe
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                             <p className={cn("text-xs mt-1", message.fromMe ? 'text-primary-foreground/70' : 'text-muted-foreground/80')}>
                                {format(parseISO(message.timestamp), 'HH:mm')}
                            </p>
                        </div>
                    </div>


                    {message.fromMe && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isSending && (
                    <div className="flex items-end gap-2 justify-end">
                         <div className="max-w-xs rounded-lg px-3 py-2 bg-primary flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" />
                        </div>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                        </Avatar>
                    </div>
                )}
                 {messages.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Não há mensagens nesta conversa ainda.</p>
                    </div>
                )}
            </div>
          )}
        </ScrollArea>
        <CardFooter className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escreva a sua mensagem..."
                disabled={isSending}
            />
            <Button type="submit" disabled={isSending || !input.trim()}>
                {isSending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Enviar</span>
            </Button>
            </form>
        </CardFooter>
      </CardContent>
    </Card>
    </>
  );
}
