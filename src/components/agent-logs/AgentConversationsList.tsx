
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getAgentSessions, getInstanceContacts } from '@/services/api';
import type { AgentSession, Contact } from '@/lib/types';
import { Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgentConversationsListProps {
  instanceId: string;
  selectedSession: AgentSession | null;
  onSelectSession: (session: AgentSession) => void;
}

export function AgentConversationsList({ instanceId, selectedSession, onSelectSession }: AgentConversationsListProps) {
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchAndCombineData = async () => {
      setLoading(true);
      try {
        // Fetch both sessions and contacts in parallel
        const [sessionsResponse, contactsResponse] = await Promise.all([
          getAgentSessions(instanceId),
          getInstanceContacts(instanceId, 1, 10000) // Fetch a large number to get all contacts
        ]);

        const contacts = contactsResponse.data || [];
        const contactMap = new Map<string, string>();
        contacts.forEach(contact => {
          const phoneNumber = contact.phoneNumber.split('@')[0];
          contactMap.set(phoneNumber, contact.name || contact.pushName || phoneNumber);
        });

        // Combine session data with contact names
        const combinedSessions = (sessionsResponse.sessions || []).map(session => ({
          ...session,
          contactName: contactMap.get(session.session_id.replace('+', '')) || session.session_id,
        }));
        
        // Sort sessions by most recent update
        const sortedSessions = combinedSessions.sort((a, b) => 
            parseISO(b.updated_at).getTime() - parseISO(a.updated_at).getTime()
        );

        setSessions(sortedSessions);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar dados',
          description: 'Não foi possível carregar a lista de conversas e contatos.',
        });
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCombineData();
  }, [instanceId, toast]);

  const filteredSessions = sessions.filter(session => {
    const name = session.contactName || '';
    const number = session.session_id;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(lowerCaseSearchTerm) || number.toLowerCase().includes(lowerCaseSearchTerm);
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Conversas</CardTitle>
        <div className="pt-2">
            <Input 
                placeholder="Pesquisar por nome ou número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          {loading ? (
            <div className="flex justify-center items-center h-full p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredSessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => onSelectSession(session)}
                  className={cn(
                    'w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors',
                    selectedSession?.session_id === session.session_id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
                  )}
                >
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className="font-semibold truncate">{session.contactName}</p>
                    <p className="text-xs text-muted-foreground">
                        {session.message_count} mensagens
                    </p>
                     <p className="text-xs text-muted-foreground capitalize">
                        Última atividade: {format(parseISO(session.updated_at), "dd MMM, HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-sm text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
