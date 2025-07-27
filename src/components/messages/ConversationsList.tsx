
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getInstanceContacts } from '@/services/api';
import type { Contact, PaginatedContacts } from '@/lib/types';
import { Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

interface ConversationsListProps {
  instanceId: string;
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

export function ConversationsList({ instanceId, selectedContact, onSelectContact }: ConversationsListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const data: PaginatedContacts = await getInstanceContacts(instanceId, 1, 100); // Fetch more contacts for local filtering
        setContacts(data.data || []);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar conversas',
          description: 'Não foi possível carregar a lista de contatos.',
        });
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [instanceId, toast]);

  const filteredContacts = contacts.filter(contact => 
    (contact.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.phone.includes(searchTerm))
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">Conversas</CardTitle>
        <div className="pt-2">
            <Input 
                placeholder="Pesquisar por nome ou telefone..."
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
          ) : filteredContacts.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors',
                    selectedContact?.id === contact.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className="font-semibold truncate">{contact.name || contact.phone}</p>
                    <p className="text-xs text-muted-foreground truncate">Clique para ver a conversa...</p>
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
