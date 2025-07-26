
'use client';

import { useState, useEffect, type ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Product, Brand, Category, ProductImage } from '@/lib/types';
import { createProduct, getBrands, getCategories } from '@/services/api';
import { ProductForm } from './ProductForm';

const imageSchema = z.object({
  url: z.string().min(1, 'URL da imagem não pode estar vazia.'),
  altText: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  slug: z.string().min(2, 'O slug deve ter pelo menos 2 caracteres.'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'O SKU é obrigatório.'),
  price: z.coerce.number().min(0, 'O preço deve ser positivo.'),
  comparePrice: z.coerce.number().optional().nullable(),
  cost: z.coerce.number().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  length: z.coerce.number().optional().nullable(),
  width: z.coerce.number().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']),
  isDigital: z.boolean().default(false),
  trackStock: z.boolean().default(true),
  stock: z.coerce.number().int('O estoque deve ser um número inteiro.').default(0),
  minStock: z.coerce.number().int('O estoque mínimo deve ser um número inteiro.').default(0),
  maxStock: z.coerce.number().int('O estoque máximo deve ser um número inteiro.').optional().nullable(),
  featured: z.boolean().default(false),
  categoryId: z.string({ required_error: 'Selecione uma categoria.' }),
  brandId: z.string().optional().nullable(),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: z.array(imageSchema).optional().default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  children: ReactElement;
  onProductCreated: (product: Product) => void;
}

export function CreateProductDialog({ children, onProductCreated }: CreateProductDialogProps) {
  const { toast } = useToast();
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
      shortDescription: '',
      sku: '',
      price: 0,
      comparePrice: undefined,
      cost: undefined,
      weight: undefined,
      length: undefined,
      width: undefined,
      height: undefined,
      status: 'DRAFT',
      isDigital: false,
      trackStock: true,
      stock: 0,
      minStock: 0,
      maxStock: undefined,
      featured: false,
      tags: '',
      seoTitle: '',
      seoDescription: '',
      images: [],
    },
  });

  useEffect(() => {
    if (open) {
      const fetchDependencies = async () => {
        setLoadingDependencies(true);
        try {
          const [brandsData, categoriesData] = await Promise.all([getBrands(), getCategories()]);
          setBrands(brandsData);
          setCategories(categoriesData);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar as marcas e categorias.',
          });
        } finally {
          setLoadingDependencies(false);
        }
      };
      fetchDependencies();
    }
  }, [open, toast]);

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const payload = { 
        ...data, 
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
        brandId: data.brandId || undefined,
        comparePrice: data.comparePrice || undefined,
        cost: data.cost || undefined,
        weight: data.weight || undefined,
        length: data.length || undefined,
        width: data.width || undefined,
        height: data.height || undefined,
        maxStock: data.maxStock || undefined,
      };
      
      const newProduct = await createProduct(payload as any);

      toast({
        title: 'Produto Criado',
        description: `O produto "${newProduct.name}" foi criado com sucesso.`,
      });
      onProductCreated(newProduct);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha ao criar o produto.';
      toast({ variant: 'destructive', title: 'Erro', description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Criar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para configurar seu novo produto.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          form={form}
          onSubmit={onSubmit}
          brands={brands}
          categories={categories}
          loadingDependencies={loadingDependencies}
        />
      </DialogContent>
    </Dialog>
  );
}
