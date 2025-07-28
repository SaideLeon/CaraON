
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, Bot, User, BrainCircuit, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserInstances } from '@/services/api';
import type { Instance } from '@/lib/types';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

const statusConfig = {
    connected: {
        textColor: 'text-green-500',
        bgColor: 'bg-green-500',
    },
    disconnected: {
        textColor: 'text-red-500',
        bgColor: 'bg-red-500',
    },
    pending: {
        textColor: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
    },
    pending_qr: {
        textColor: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
    },
     error: {
        textColor: 'text-destructive',
        bgColor: 'bg-destructive',
    }
}

export default function PlaygroundPage() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { lastMessage, sendMessage } = useWebSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInstances = async () => {
      setLoadingInstances(true);
      try {
        const userInstances = await getUserInstances();
        setInstances(userInstances);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar as suas instâncias.',
        });
      } finally {
        setLoadingInstances(false);
      }
    };
    fetchInstances();
  }, [toast]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    if (lastMessage && isSending) {
        if (lastMessage.type === 'playground_response' && lastMessage.response) {
            const agentMessage: Message = { sender: 'agent', text: lastMessage.response.finalResponse || 'O agente respondeu.' };
            setMessages((prev) => [...prev, agentMessage]);
            setIsSending(false);
        } else if (lastMessage.type === 'playground_error' && lastMessage.error) {
            toast({
                variant: 'destructive',
                title: 'Erro do Agente',
                description: lastMessage.error || 'Ocorreu um erro no backend.',
            });
            setIsSending(false);
            // Remove the user's message that was optimistically added
            setMessages(prev => prev.slice(0, prev.length -1)); 
        }
    }
  }, [lastMessage, toast, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedInstanceId || isSending) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsSending(true);
    
    sendMessage({
        type: 'playground_test',
        instanceId: selectedInstanceId,
        messageContent: input,
        userPhone: 'playground_user'
    });

    setInput('');
  };

  const selectedInstance = instances.find(i => i.id === selectedInstanceId);
  const currentStatus = selectedInstance?.status?.toLowerCase() as keyof typeof statusConfig | undefined;
  const statusColorClass = currentStatus ? statusConfig[currentStatus]?.textColor : 'text-muted-foreground';


  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <BrainCircuit className="h-6 w-6" />
            <span>Playground do Agente</span>
          </CardTitle>
          <CardDescription>
            Selecione uma instância e inicie uma conversa para testar o fluxo de orquestração completo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedInstanceId} disabled={loadingInstances || instances.length === 0}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder={loadingInstances ? 'Carregando instâncias...' : 'Selecione uma Instância'} />
            </SelectTrigger>
            <SelectContent>
              {instances.map((instance) => {
                const status = instance.status?.toLowerCase() as keyof typeof statusConfig | undefined;
                const colorClass = status ? statusConfig[status]?.bgColor : 'bg-muted-foreground';
                return (
                    <SelectItem key={instance.id} value={instance.id}>
                        <div className="flex items-center gap-2">
                            <div className={cn('h-2 w-2 rounded-full', colorClass)} />
                            <span>{instance.name}</span>
                        </div>
                    </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Card className="flex flex-1 flex-col">
        {selectedInstanceId ? (
            <>
                <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback>
                                <Server className={cn("h-5 w-5", statusColorClass)} />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{selectedInstance?.name}</CardTitle>
                            <CardDescription className="text-xs line-clamp-1">Testando a instância: {selectedInstance?.clientId}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col">
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                         <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div
                                key={index}
                                className={cn(
                                    'flex items-end gap-2',
                                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                                )}
                                >
                                {message.sender === 'agent' && (
                                    <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={cn(
                                    'max-w-xs rounded-lg px-4 py-2 md:max-w-md lg:max-w-2xl',
                                    message.sender === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                                </div>
                                {message.sender === 'user' && (
                                    <Avatar className="h-8 w-8">
                                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                                </div>
                            ))}
                            {isSending && (
                                <div className="flex items-end gap-2 justify-start">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="max-w-xs rounded-lg px-4 py-2 bg-muted flex items-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="border-t p-4">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escreva a sua mensagem..."
                            disabled={isSending}
                        />
                        <Button type="submit" disabled={isSending || !input.trim()}>
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Enviar</span>
                        </Button>
                        </form>
                    </div>
                </CardContent>
            </>
        ) : (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <BrainCircuit className="mx-auto h-12 w-12" />
                    <p className="mt-4">Por favor, selecione uma instância para começar.</p>
                </div>
          </div>
        )}
      </Card>
    </div>
  );
}
