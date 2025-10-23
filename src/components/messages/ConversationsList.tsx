
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { getInstanceContacts } from '@/services/api';
import type { Contact } from '@/lib/types';
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
        // Fetch all contacts
        const response = await getInstanceContacts(instanceId, 1, 10000);
        const sortedContacts = (response.data || []).sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setContacts(sortedContacts);

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar contatos',
          description: 'Não foi possível carregar a lista de contatos.',
        });
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [instanceId, toast]);

  const filteredContacts = contacts.filter(contact => {
    const name = contact.name || contact.pushName || '';
    const number = contact.phoneNumber;
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
          ) : filteredContacts.length > 0 ? (
            <div className="space-y-1 p-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => onSelectContact(contact)}
                  className={cn(
                    'w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors',
                    selectedContact?.id === contact.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'
                  )}
                >
                  <Avatar className="h-10 w-10 mt-1">
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className="font-semibold truncate">{contact.name || contact.pushName || contact.phoneNumber}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {contact.phoneNumber.split('@')[0]}
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
