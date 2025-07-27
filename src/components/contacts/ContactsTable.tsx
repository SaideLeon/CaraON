
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getInstanceContacts } from '@/services/api';
import type { Contact, PaginatedContacts } from '@/lib/types';
import { Loader2, User, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface ContactsTableProps {
  instanceId: string;
}

export function ContactsTable({ instanceId }: ContactsTableProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const data: PaginatedContacts = await getInstanceContacts(
          instanceId,
          page,
          limit
        );
        setContacts(data.data || []);
        setTotal(data.pagination.total || 0);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao buscar contatos',
          description: 'Não foi possível carregar a lista de contatos. O backend pode estar indisponível.',
        });
        setContacts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [instanceId, page, limit, toast]);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Contatos</CardTitle>
        <CardDescription>
          Visualize e gerencie os contatos associados a esta instância.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">
                  <Checkbox disabled />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Adicionado em</TableHead>
                <TableHead>
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <p className="ml-2">Carregando contatos...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : contacts.length > 0 ? (
                contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Checkbox disabled />
                    </TableCell>
                    <TableCell className="font-medium">{contact.name || contact.pushName || 'N/A'}</TableCell>
                    <TableCell>{contact.phoneNumber.split('@')[0]}</TableCell>
                    <TableCell>
                      {contact.isBlocked ? (
                        <Badge variant="destructive">Bloqueado</Badge>
                      ) : (
                        <Badge variant="default" className='bg-green-500'>Ativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contact.createdAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem disabled><User className="mr-2 h-4 w-4" /> Ver Perfil</DropdownMenuItem>
                          <DropdownMenuItem disabled className="text-red-500"><UserX className="mr-2 h-4 w-4" /> Bloquear</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhum contato encontrado para esta instância.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {contacts.length} de {total} contato(s).
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
