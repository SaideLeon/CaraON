
'use client';

import type { UseFormReturn } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Brand, Category } from '@/lib/types';
import type { ProductFormValues } from './CreateProductDialog';
import { DialogFooter } from '../ui/dialog';
import { useRef } from 'react';
import Image from 'next/image';

interface ProductFormProps {
  form: UseFormReturn<ProductFormValues>;
  onSubmit: (data: ProductFormValues) => void;
  brands: Brand[];
  categories: Category[];
  loadingDependencies: boolean;
}

export function ProductForm({ form, onSubmit, brands, categories, loadingDependencies }: ProductFormProps) {
  const { control, formState: { isSubmitting }, getValues, setError } = form;
  const loading = isSubmitting || loadingDependencies;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('images', { type: 'manual', message: 'O arquivo de imagem não pode exceder 4MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          append({ url: result, altText: getValues('name') });
        }
      };
      reader.onerror = () => {
         setError('images', { type: 'manual', message: 'Falha ao ler o arquivo.' });
      }
      reader.readAsDataURL(file);
    }
     // Reset file input to allow selecting the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Camiseta Branca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: camiseta-branca" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Completa (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva os detalhes do produto..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Curta (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Uma breve descrição do produto..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-lg font-medium">Imagens do Produto</h3>
              <div className="flex items-start gap-2">
                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Carregar Imagem
                </Button>
                <Input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleFileSelect}
                />
              </div>
              <FormMessage>{form.formState.errors.images?.message}</FormMessage>
               {fields.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative group">
                      <Image
                        src={field.url}
                        alt={`Imagem do produto ${index + 1}`}
                        width={150}
                        height={150}
                        className="rounded-md object-cover aspect-square"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
               {fields.length === 0 && (
                 <div className="text-center py-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Nenhuma imagem adicionada.</p>
                 </div>
               )}
            </div>

            <div className="space-y-4 rounded-md border p-4">
               <h3 className="text-lg font-medium">Organização</h3>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <FormField
                    control={control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={loadingDependencies}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma marca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingDependencies}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                   <FormField
                    control={control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (separadas por vírgula)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: verão, casual, algodão" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
            </div>

            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-lg font-medium">Preços</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                 <FormField
                    control={control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Venda</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="99.90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="comparePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Comparativo (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="129.90" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custo (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="45.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
            </div>

            <div className="space-y-4 rounded-md border p-4">
               <h3 className="text-lg font-medium">Inventário</h3>
                <FormField
                    control={control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>SKU (Unidade de Manutenção de Estoque)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: CAM-BR-M-01" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
               <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade em Estoque</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={control}
                    name="minStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Mínimo</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={control}
                    name="maxStock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estoque Máximo (Opcional)</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" placeholder="200" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>
               <FormField
                  control={control}
                  name="trackStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Rastrear Estoque</FormLabel>
                         <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
            </div>
            
             <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium">Configurações Adicionais</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                        control={control}
                        name="status"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status do Produto</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Selecione um status" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="DRAFT">Rascunho</SelectItem>
                                <SelectItem value="ACTIVE">Ativo</SelectItem>
                                <SelectItem value="INACTIVE">Inativo</SelectItem>
                                <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <div className="flex flex-col space-y-4">
                    <FormField
                    control={control}
                    name="featured"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Produto em Destaque</FormLabel>
                        </div>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={control}
                    name="isDigital"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>É um Produto Digital</FormLabel>
                        </div>
                        </FormItem>
                    )}
                    />
                </div>
            </div>
            
             <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-medium">SEO (Opcional)</h3>
                 <FormField
                    control={control}
                    name="seoTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título SEO</FormLabel>
                        <FormControl>
                          <Input placeholder="Título para os motores de busca" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="seoDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição SEO</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição para os motores de busca" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
             </div>
          </div>
        </ScrollArea>
        <DialogFooter className="pt-4 border-t">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Produto
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
