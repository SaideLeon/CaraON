
'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Product, Brand, Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { createProduct, getBrands, getCategories } from '@/services/api';
import { ProductForm } from './ProductForm';

const productSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  slug: z.string().min(3, 'O slug deve ter pelo menos 3 caracteres.'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU é obrigatório.'),
  price: z.coerce.number().min(0, 'O preço deve ser positivo.'),
  comparePrice: z.coerce.number().optional(),
  cost: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  length: z.coerce.number().optional(),
  width: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']),
  isDigital: z.boolean().default(false),
  trackStock: z.boolean().default(true),
  stock: z.coerce.number().min(0, 'O estoque deve ser positivo.'),
  minStock: z.coerce.number().optional(),
  maxStock: z.coerce.number().optional(),
  featured: z.boolean().default(false),
  categoryId: z.string({ required_error: 'Selecione uma categoria.' }),
  brandId: z.string({ required_error: 'Selecione uma marca.' }),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  children: ReactElement;
  onProductCreated: (product: Product) => void;
}

export function CreateProductDialog({ children, onProductCreated }: CreateProductDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingDependencies, setLoadingDependencies] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      sku: '',
      status: 'ACTIVE',
      isDigital: false,
      trackStock: true,
      featured: false,
      stock: 0,
      tags: '',
      seoTitle: '',
      seoDescription: '',
    },
  });

  useEffect(() => {
    const fetchDependencies = async () => {
      if (open) {
        setLoadingDependencies(true);
        try {
          const [brandsData, categoriesData] = await Promise.all([
            getBrands(),
            getCategories(),
          ]);
          setBrands(brandsData);
          setCategories(categoriesData);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar marcas e categorias.' });
        } finally {
          setLoadingDependencies(false);
        }
      }
    };
    fetchDependencies();
  }, [open, toast]);

  const onSubmit = async (data: ProductFormValues) => {
    setLoading(true);
    try {
      const productData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
      };
      const newProduct = await createProduct(productData as any);
      toast({ title: 'Produto Criado', description: `O produto "${newProduct.name}" foi criado com sucesso.` });
      onProductCreated(newProduct);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar o produto.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Criar Novo Produto</DialogTitle>
          <DialogDescription>Preencha os detalhes abaixo para adicionar um novo produto à sua loja.</DialogDescription>
        </DialogHeader>
        <ProductForm
          form={form}
          onSubmit={onSubmit}
          brands={brands}
          categories={categories}
          loading={loading}
          loadingDependencies={loadingDependencies}
        />
      </DialogContent>
    </Dialog>
  );
}
