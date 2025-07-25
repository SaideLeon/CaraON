
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, ServerCrash, ShoppingCart } from 'lucide-react';
import { CreateProductDialog } from '@/components/products/CreateProductDialog';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/products/ProductCard';
import { getProducts, deleteProduct } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProducts();
        setProducts(response);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os produtos.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const handleProductCreated = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  }

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      setProducts(prev => prev.filter(product => product.id !== productToDelete.id));
      toast({
        title: 'Produto Excluído',
        description: `O produto "${productToDelete.name}" foi excluído permanentemente.`
      });
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Erro de Exclusão',
        description: 'Não foi possível excluir o produto.'
      });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  }
  
  return (
    <>
       <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto excluirá permanentemente o produto "{productToDelete?.name}".
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
            <h1 className="text-2xl font-bold font-headline">Produtos</h1>
            <p className="text-muted-foreground">Crie e gira os produtos da sua loja.</p>
          </div>
          <CreateProductDialog onProductCreated={handleProductCreated}>
              <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Criar Produto
              </Button>
          </CreateProductDialog>
        </div>

        {loading && (
           <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4 text-muted-foreground">Carregando produtos...</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => <ProductCard key={product.id} product={product} onDelete={handleDeleteClick} />)}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mt-2">
              Comece por criar o seu primeiro produto.
            </p>
             <div className="mt-6">
               <CreateProductDialog onProductCreated={handleProductCreated}>
                  <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Criar Produto
                  </Button>
              </CreateProductDialog>
             </div>
          </div>
        )}
      </div>
    </>
  );
}
