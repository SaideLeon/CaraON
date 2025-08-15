
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Bot, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAgentConversation } from '@/services/api';
import type { AgentSession, AgentMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AgentMessageHistoryProps {
  session: AgentSession | null;
}

export function AgentMessageHistory({ session }: AgentMessageHistoryProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (session) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await getAgentConversation(session.session_id);
          setMessages(response.conversation || []);
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
  }, [session, toast]);

  if (!session) {
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
            <CardTitle className="text-xl">{session.contactName || session.session_id}</CardTitle>
            <p className="text-sm text-muted-foreground">{session.message_count} mensagens na sessão</p>
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
                {messages.map((message, index) => {
                    const isUser = message.role === 'user';
                    return (
                        <div
                            key={index}
                            className={cn(
                                'flex items-start gap-4',
                                isUser ? 'justify-end' : 'justify-start'
                            )}
                        >
                            {!isUser && (
                                <Avatar className="h-8 w-8 border">
                                    <AvatarFallback>
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                    'max-w-3xl rounded-lg px-4 py-3',
                                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                )}
                            >
                                <p className='font-bold text-sm capitalize mb-1'>{isUser ? 'Usuário' : 'Agente'}</p>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    className="prose prose-sm dark:prose-invert prose-p:before:hidden prose-p:after:hidden"
                                    components={{
                                        a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline" />,
                                    }}
                                >
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                            {isUser && (
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
                        <p>Não há mensagens nesta sessão ainda.</p>
                    </div>
                )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
