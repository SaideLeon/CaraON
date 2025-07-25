
import type { Product } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { ShoppingCart, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ProductCardProps {
  product: Product;
  onDelete: (product: Product) => void;
}

export function ProductCard({ product, onDelete }: ProductCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <ShoppingCart className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline text-xl truncate" title={product.name}>{product.name}</CardTitle>
             <CardDescription className="text-xs text-muted-foreground truncate">SKU: {product.sku}</CardDescription>
          </div>
            <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'} className={product.status === 'ACTIVE' ? 'bg-green-500' : ''}>
                {product.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
        </p>
         <div className='flex justify-between items-center text-sm'>
            <span className='font-semibold'>Preço:</span>
            <span className='font-mono text-primary'>R$ {product.price.toFixed(2)}</span>
         </div>
          <div className='flex justify-between items-center text-sm'>
            <span className='font-semibold'>Estoque:</span>
            <span className='font-mono'>{product.stock}</span>
         </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
         <Button variant="outline" size="sm" disabled>
            <Pencil className="mr-2 h-3 w-3"/>
            Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(product)}>
            <Trash2 className="mr-2 h-3 w-3"/>
            Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
