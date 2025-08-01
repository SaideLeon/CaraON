
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, Bot, User, BrainCircuit, Server, SwitchCamera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserInstances } from '@/services/api';
import type { Instance } from '@/lib/types';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  const lastProcessedMessageId = useRef<string | null>(null);

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
    if (lastMessage) {
      const messageId = `${lastMessage.type}-${lastMessage.executionId || new Date().getTime()}`;
      if (lastProcessedMessageId.current === messageId) {
        return; 
      }

      if (lastMessage.type === 'playground_response' && lastMessage.response) {
        const agentMessage: Message = { sender: 'agent', text: lastMessage.response.finalResponse || 'O agente respondeu.' };
        setMessages((prev) => [...prev, agentMessage]);
        setIsSending(false);
        lastProcessedMessageId.current = messageId;
      } else if (lastMessage.type === 'playground_error' && lastMessage.error) {
        toast({
          variant: 'destructive',
          title: 'Erro do Agente',
          description: lastMessage.error || 'Ocorreu um erro no backend.',
        });
        setIsSending(false);
        setMessages(prev => prev.slice(0, prev.length - 1));
        lastProcessedMessageId.current = messageId;
      }
    }
  }, [lastMessage, toast]);

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

  const handleSelectInstance = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    setMessages([]); // Clear previous chat history
  }

  const handleChangeInstance = () => {
    setSelectedInstanceId(null);
    setMessages([]);
  }

  const selectedInstance = instances.find(i => i.id === selectedInstanceId);
  const currentStatus = selectedInstance?.status?.toLowerCase() as keyof typeof statusConfig | undefined;
  const statusColorClass = currentStatus ? statusConfig[currentStatus]?.textColor : 'text-muted-foreground';


  if (!selectedInstanceId) {
    return (
        <div className="flex h-full items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6" />
                    <span>Playground do Agente</span>
                </CardTitle>
                <CardDescription>
                    Selecione uma instância para iniciar uma conversa e testar o fluxo completo.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Select onValueChange={handleSelectInstance} disabled={loadingInstances || instances.length === 0}>
                    <SelectTrigger>
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
        </div>
    )
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="border-b shrink-0 flex flex-row items-center justify-between space-y-0">
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
            <Button variant="outline" size="sm" onClick={handleChangeInstance}>
                <SwitchCamera className="mr-2 h-4 w-4" />
                Trocar Instância
            </Button>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
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
                            {message.sender === 'agent' ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    className="prose prose-sm dark:prose-invert prose-p:before:hidden prose-p:after:hidden"
                                    components={{
                                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />,
                                        // You can add more custom components here for styling
                                    }}
                                >
                                    {message.text}
                                </ReactMarkdown>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            )}

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
            <div className="border-t p-4 mt-auto shrink-0">
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
    </Card>
  );
}
