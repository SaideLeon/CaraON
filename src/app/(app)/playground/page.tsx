
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Send, Bot, User, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserParentAgents } from '@/services/api';
import type { Agent } from '@/lib/types';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

export default function PlaygroundPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { lastMessage, sendMessage } = useWebSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoadingAgents(true);
      try {
        const parentAgents = await getUserParentAgents();
        setAgents(parentAgents);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os agentes.',
        });
      } finally {
        setLoadingAgents(false);
      }
    };
    fetchAgents();
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
        if (lastMessage.type === 'playground_response') {
            const agentMessage: Message = { sender: 'agent', text: lastMessage.message || 'O agente respondeu.' };
            setMessages((prev) => [...prev, agentMessage]);
            setIsSending(false);
        } else if (lastMessage.type === 'playground_error') {
            toast({
                variant: 'destructive',
                title: 'Erro do Agente',
                description: lastMessage.message || 'Ocorreu um erro no backend.',
            });
            setIsSending(false);
            setMessages(prev => prev.slice(0, prev.length -1)); // Remove user message on error
        }
    }
  }, [lastMessage, toast, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAgent = agents.find(a => a.id === selectedAgentId);
    if (!input.trim() || !selectedAgent || isSending) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsSending(true);
    
    sendMessage({
        type: 'playground_test',
        routerAgentId: selectedAgent.id,
        instanceId: selectedAgent.instanceId,
        organizationId: selectedAgent.organizationId,
        messageContent: input,
        userPhone: 'playground_user'
    });

    setInput('');
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <BrainCircuit className="h-6 w-6" />
            <span>Playground do Agente</span>
          </CardTitle>
          <CardDescription>
            Selecione um agente pai e inicie uma conversa para testar a orquestração e as ferramentas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedAgentId} disabled={loadingAgents || agents.length === 0}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder={loadingAgents ? 'Carregando agentes...' : 'Selecione um Agente Pai'} />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <Card className="flex flex-1 flex-col">
        {selectedAgentId ? (
            <>
                <CardHeader className="border-b">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarFallback><Bot /></AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-xl">{selectedAgent?.name}</CardTitle>
                            <CardDescription className="text-xs line-clamp-1">{selectedAgent?.persona}</CardDescription>
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
                    <p className="mt-4">Por favor, selecione um agente para começar.</p>
                </div>
          </div>
        )}
      </Card>
    </div>
  );
}
