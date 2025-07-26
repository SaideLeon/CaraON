
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Product, Brand, Category } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { createProduct, getBrands, getCategories } from '@/services/api';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';

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

type ProductFormValues = z.infer<typeof productSchema>;

interface CreateProductDialogProps {
  children: ReactNode;
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="space-y-6 py-4 pr-6">

                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium text-sm">Informações Básicas</h4>
                  <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome do Produto</FormLabel> <FormControl> <Input placeholder="Ex: Smartphone XYZ" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="slug" render={({ field }) => ( <FormItem> <FormLabel>Slug</FormLabel> <FormControl> <Input placeholder="ex: smartphone-xyz" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descrição Completa</FormLabel> <FormControl> <Textarea placeholder="Descreva detalhadamente o produto..." {...field} rows={5}/> </FormControl> <FormMessage /> </FormItem> )} />
                </div>

                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium text-sm">Preços</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Preço (R$)</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder="99.90" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="comparePrice" render={({ field }) => ( <FormItem> <FormLabel>Preço de Comparação (R$)</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder="129.90" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="cost" render={({ field }) => ( <FormItem> <FormLabel>Custo (R$)</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder="50.00" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                </div>
                
                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium text-sm">Inventário e Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="sku" render={({ field }) => ( <FormItem> <FormLabel>SKU</FormLabel> <FormControl> <Input placeholder="PROD-001" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Estoque</FormLabel> <FormControl> <Input type="number" placeholder="100" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecione um status" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="ACTIVE">Ativo</SelectItem> <SelectItem value="DRAFT">Rascunho</SelectItem> <SelectItem value="INACTIVE">Inativo</SelectItem> <SelectItem value="ARCHIVED">Arquivado</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  </div>
                </div>

                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium text-sm">Organização</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="brandId" render={({ field }) => ( <FormItem> <FormLabel>Marca</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingDependencies}> <FormControl> <SelectTrigger> <SelectValue placeholder={loadingDependencies ? 'Carregando...' : 'Selecione uma marca'} /> </SelectTrigger> </FormControl> <SelectContent> {brands.map((brand) => ( <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="categoryId" render={({ field }) => ( <FormItem> <FormLabel>Categoria</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingDependencies}> <FormControl> <SelectTrigger> <SelectValue placeholder={loadingDependencies ? 'Carregando...' : 'Selecione uma categoria'} /> </SelectTrigger> </FormControl> <SelectContent> {categories.map((category) => ( <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  </div>
                </div>
                
                <div className="space-y-4 rounded-md border p-4">
                    <h4 className="font-medium text-sm">Opções</h4>
                    <div className="flex flex-wrap gap-x-8 gap-y-4">
                        <FormField
                            control={form.control}
                            name="featured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Produto em Destaque
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isDigital"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Produto Digital
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="trackStock"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Rastrear Estoque
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                
                <div className="space-y-4 rounded-md border p-4">
                  <h4 className="font-medium text-sm">SEO e Tags</h4>
                  <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem> <FormLabel>Tags</FormLabel> <FormControl> <Input placeholder="smartphone, android, tech (separado por vírgulas)" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="seoTitle" render={({ field }) => ( <FormItem> <FormLabel>Título SEO</FormLabel> <FormControl> <Input placeholder="Ex: Comprar Smartphone XYZ com Desconto" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="seoDescription" render={({ field }) => ( <FormItem> <FormLabel>Descrição SEO</FormLabel> <FormControl> <Textarea placeholder="Descreva o produto para os motores de busca..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-6 pr-6">
              <Button type="submit" disabled={loading || loadingDependencies}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Produto
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
