
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, FolderTree } from 'lucide-react';
import { CreateCategoryDialog } from '@/components/categories/CreateCategoryDialog';
import type { Category } from '@/lib/types';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { getCategories, deleteCategory } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await getCategories();
        setCategories(response);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar as categorias.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [toast]);

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories(prev => [newCategory, ...prev]);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete.id);
      setCategories(prev => prev.filter(category => category.id !== categoryToDelete.id));
      toast({
        title: 'Categoria Excluída',
        description: `A categoria "${categoryToDelete.name}" foi excluída permanentemente.`
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro de Exclusão',
        description: 'Não foi possível excluir a categoria.'
      });
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  }
  
  return (
    <>
       <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto excluirá permanentemente a categoria "{categoryToDelete?.name}".
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
            <h1 className="text-2xl font-bold font-headline">Categorias</h1>
            <p className="text-muted-foreground">Crie e gira as categorias dos produtos da sua loja.</p>
          </div>
          <CreateCategoryDialog onCategoryCreated={handleCategoryCreated}>
              <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Categoria
              </Button>
          </CreateCategoryDialog>
        </div>

        {loading && (
           <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Carregando categorias...</p>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map(category => <CategoryCard key={category.id} category={category} onDelete={handleDeleteClick} />)}
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <FolderTree className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Nenhuma categoria encontrada</h3>
            <p className="text-muted-foreground mt-2">
              Comece por criar a sua primeira categoria.
            </p>
             <div className="mt-6">
               <CreateCategoryDialog onCategoryCreated={handleCategoryCreated}>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Criar Categoria
                  </Button>
              </CreateCategoryDialog>
             </div>
          </div>
        )}
      </div>
    </>
  );
}
