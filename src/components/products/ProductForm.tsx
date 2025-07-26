
'use client';

import type { UseFormReturn } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Brand, Category } from '@/lib/types';
import type { ProductFormValues } from './CreateProductDialog';
import { DialogFooter } from '../ui/dialog';

interface ProductFormProps {
  form: UseFormReturn<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
  brands: Brand[];
  categories: Category[];
  loading: boolean;
  loadingDependencies: boolean;
}

export function ProductForm({ form, onSubmit, brands, categories, loading, loadingDependencies }: ProductFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className="max-h-[60vh] w-full pr-6">
          <div className="space-y-6 p-1">

            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm mb-4">Informações Básicas</h4>
              <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome do Produto</FormLabel> <FormControl> <Input placeholder="Ex: Smartphone XYZ" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="slug" render={({ field }) => ( <FormItem> <FormLabel>Slug</FormLabel> <FormControl> <Input placeholder="ex: smartphone-xyz" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descrição Completa</FormLabel> <FormControl> <Textarea placeholder="Descreva detalhadamente o produto..." {...field} rows={5}/> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="shortDescription" render={({ field }) => ( <FormItem> <FormLabel>Descrição Curta (Opcional)</FormLabel> <FormControl> <Textarea placeholder="Descreva brevemente o produto..." {...field} rows={2}/> </FormControl> <FormMessage /> </FormItem> )} />
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm mb-4">Preços</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => ( <FormItem> <FormLabel>Preço (R$)</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder="99.90" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="comparePrice" render={({ field }) => ( <FormItem> <FormLabel>Preço Comp. (R$)</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder="129.90" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="cost" render={({ field }) => ( <FormItem> <FormLabel>Custo (R$)</FormLabel> <FormControl> <Input type="number" step="0.01" placeholder="50.00" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm mb-4">Inventário e Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="sku" render={({ field }) => ( <FormItem> <FormLabel>SKU</FormLabel> <FormControl> <Input placeholder="PROD-001" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="stock" render={({ field }) => ( <FormItem> <FormLabel>Estoque</FormLabel> <FormControl> <Input type="number" placeholder="100" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Ativo</SelectItem>
                          <SelectItem value="DRAFT">Rascunho</SelectItem>
                          <SelectItem value="INACTIVE">Inativo</SelectItem>
                          <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
                <h4 className="font-medium text-sm mb-4">Organização</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brandId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={loadingDependencies}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingDependencies ? 'Carregando...' : 'Selecione uma marca'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brands.map((brand) => (
                                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={loadingDependencies}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingDependencies ? 'Carregando...' : 'Selecione uma categoria'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm mb-4">Opções</h4>
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                <FormField control={form.control} name="featured" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">Produto em Destaque</FormLabel>
                    </div>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isDigital" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                     <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">Produto Digital</FormLabel>
                    </div>
                  </FormItem>
                )} />
                <FormField control={form.control} name="trackStock" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                     <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">Rastrear Estoque</FormLabel>
                     </div>
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-medium text-sm mb-4">SEO e Tags</h4>
              <FormField control={form.control} name="tags" render={({ field }) => ( <FormItem> <FormLabel>Tags (separadas por vírgula)</FormLabel> <FormControl> <Input placeholder="smartphone, android, tech" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="seoTitle" render={({ field }) => ( <FormItem> <FormLabel>Título SEO</FormLabel> <FormControl> <Input placeholder="Ex: Comprar Smartphone XYZ com Desconto" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="seoDescription" render={({ field }) => ( <FormItem> <FormLabel>Descrição SEO</FormLabel> <FormControl> <Textarea placeholder="Descreva o produto para os motores de busca..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
            </div>

          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 mt-4 border-t">
          <Button type="submit" disabled={loading || loadingDependencies}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Produto
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
