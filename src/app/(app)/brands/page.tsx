
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, ServerCrash, Bookmark } from 'lucide-react';
import { CreateBrandDialog } from '@/components/brands/CreateBrandDialog';
import type { Brand } from '@/lib/types';
import { BrandCard } from '@/components/brands/BrandCard';
import { getBrands, deleteBrand } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const response = await getBrands();
        setBrands(response);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar as marcas.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [toast]);

  const handleBrandCreated = (newBrand: Brand) => {
    setBrands(prev => [newBrand, ...prev]);
  };

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
  }

  const confirmDelete = async () => {
    if (!brandToDelete) return;

    setIsDeleting(true);
    try {
      await deleteBrand(brandToDelete.id);
      setBrands(prev => prev.filter(brand => brand.id !== brandToDelete.id));
      toast({
        title: 'Marca Excluída',
        description: `A marca "${brandToDelete.name}" foi excluída permanentemente.`
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro de Exclusão',
        description: 'Não foi possível excluir a marca.'
      });
    } finally {
      setIsDeleting(false);
      setBrandToDelete(null);
    }
  }
  
  return (
    <>
       <AlertDialog open={!!brandToDelete} onOpenChange={() => setBrandToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto excluirá permanentemente a marca "{brandToDelete?.name}".
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
            <h1 className="text-2xl font-bold font-headline">Marcas</h1>
            <p className="text-muted-foreground">Crie e gira as marcas dos produtos da sua loja.</p>
          </div>
          <CreateBrandDialog onBrandCreated={handleBrandCreated}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Criar Marca</span>
              </Button>
          </CreateBrandDialog>
        </div>

        {loading && (
           <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Carregando marcas...</p>
          </div>
        )}

        {!loading && brands.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {brands.map(brand => <BrandCard key={brand.id} brand={brand} onDelete={handleDeleteClick} />)}
          </div>
        )}

        {!loading && brands.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Bookmark className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Nenhuma marca encontrada</h3>
            <p className="text-muted-foreground mt-2">
              Comece por criar a sua primeira marca.
            </p>
             <div className="mt-6">
               <CreateBrandDialog onBrandCreated={handleBrandCreated}>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Criar Marca</span>
                  </Button>
              </CreateBrandDialog>
             </div>
          </div>
        )}
      </div>
    </>
  );
}
