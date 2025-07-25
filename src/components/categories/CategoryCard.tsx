
import type { Category } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { FolderTree, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

interface CategoryCardProps {
  category: Category;
  onDelete: (category: Category) => void;
}

export function CategoryCard({ category, onDelete }: CategoryCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <FolderTree className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline text-xl truncate" title={category.name}>{category.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">ID: {category.id}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
         <Button variant="outline" size="sm" disabled>
            <Pencil className="mr-2 h-3 w-3"/>
            Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(category)}>
            <Trash2 className="mr-2 h-3 w-3"/>
            Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
