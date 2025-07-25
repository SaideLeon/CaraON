'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, ServerCrash, Wrench } from 'lucide-react';
import { CreateToolDialog } from '@/components/tools/CreateToolDialog';
import type { Tool } from '@/lib/types';
import { ToolCard } from '@/components/tools/ToolCard';
import { getTools, deleteTool } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      try {
        const response = await getTools();
        setTools(response);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar as suas ferramentas.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, [toast]);

  const handleToolCreated = (newTool: Tool) => {
    setTools(prev => [newTool, ...prev]);
  };

  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
  }

  const confirmDelete = async () => {
    if (!toolToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTool(toolToDelete.id);
      setTools(prev => prev.filter(tool => tool.id !== toolToDelete.id));
      toast({
        title: 'Ferramenta Excluída',
        description: `A ferramenta "${toolToDelete.name}" foi excluída permanentemente.`
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro de Exclusão',
        description: 'Não foi possível excluir a ferramenta.'
      });
    } finally {
      setIsDeleting(false);
      setToolToDelete(null);
    }
  }
  
  return (
    <>
       <AlertDialog open={!!toolToDelete} onOpenChange={() => setToolToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto excluirá permanentemente a ferramenta "{toolToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'A excluir...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-headline">Ferramentas</h1>
            <p className="text-muted-foreground">Crie e gira ferramentas para dar novas habilidades aos seus agentes.</p>
          </div>
          <CreateToolDialog onToolCreated={handleToolCreated}>
              <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Ferramenta
              </Button>
          </CreateToolDialog>
        </div>

        {loading && (
           <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Carregando ferramentas...</p>
          </div>
        )}

        {!loading && tools.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tools.map(tool => <ToolCard key={tool.id} tool={tool} onDelete={handleDeleteClick} />)}
          </div>
        )}

        {!loading && tools.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Nenhuma ferramenta encontrada</h3>
            <p className="text-muted-foreground mt-2">
              Comece por criar a sua primeira ferramenta.
            </p>
             <div className="mt-6">
               <CreateToolDialog onToolCreated={handleToolCreated}>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Criar Ferramenta
                  </Button>
              </CreateToolDialog>
             </div>
          </div>
        )}
      </div>
    </>
  );
}
