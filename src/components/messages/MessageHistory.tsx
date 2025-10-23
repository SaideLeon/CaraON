
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Bot, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getInstanceMessages } from '@/services/api';
import type { Contact, Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageHistoryProps {
  instanceId: string;
  contact: Contact | null;
}

export function MessageHistory({ instanceId, contact }: MessageHistoryProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            scrollAreaRef.current?.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'auto' });
        }, 100);
    }
  };

  useEffect(() => {
    if (contact && instanceId) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await getInstanceMessages(instanceId, contact.id, 1, 1000); // Fetch a large number of messages
          // The API returns most recent first, so we reverse it for display
          setMessages((response.data || []).reverse());
          scrollToBottom();
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro ao buscar mensagens',
            description: 'Não foi possível carregar o histórico da conversa.',
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
  }, [contact, instanceId, toast]);

  if (!contact) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MessageSquare className="mx-auto h-12 w-12" />
          <p className="mt-4">Selecione uma conversa para ver o histórico.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b flex-row items-center gap-3 space-y-0">
        <Avatar>
            <AvatarFallback><User /></AvatarFallback>
        </Avatar>
        <div>
            <CardTitle className="text-xl">{contact.name || contact.pushName || contact.phoneNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">{contact.phoneNumber.split('@')[0]}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {loading ? (
             <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
                {messages.map((message) => {
                    const isOutgoing = message.direction === 'OUTGOING';
                    return (
                        <div
                            key={message.id}
                            className={cn(
                                'flex items-start gap-4',
                                !isOutgoing ? 'justify-start' : 'justify-end'
                            )}
                        >
                            {isOutgoing && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                    'max-w-3xl rounded-lg px-4 py-3',
                                    !isOutgoing ? 'bg-muted' : 'bg-primary text-primary-foreground'
                                )}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    className="prose prose-sm dark:prose-invert prose-p:before:hidden prose-p:after:hidden"
                                    components={{
                                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline" />,
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                                <p className={cn('text-xs mt-2', isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                                  {format(new Date(message.sentAt), 'dd MMM, HH:mm', { locale: ptBR })}
                                </p>
                            </div>
                            {!isOutgoing && (
                                 <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    );
                })}
                {messages.length === 0 && !loading && (
                    <div className="text-center text-muted-foreground py-10">
                        <p>Não há mensagens nesta conversa ainda.</p>
                    </div>
                )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
