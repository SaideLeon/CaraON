import type { Tool } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Wrench, Database, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface ToolCardProps {
  tool: Tool;
  onDelete: (tool: Tool) => void;
}

export function ToolCard({ tool, onDelete }: ToolCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 bg-card/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className='flex items-center gap-3 mb-2'>
              <Wrench className="h-8 w-8 text-primary" />
              <Badge variant="secondary">{tool.type}</Badge>
            </div>
            <CardTitle className="font-headline text-xl truncate" title={tool.name}>{tool.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">ID: {tool.id}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
            {tool.description}
        </p>

        <div className="space-y-2">
            <h4 className="text-sm font-semibold">Configuração</h4>
            <ScrollArea className="h-32 w-full rounded-md border bg-muted/30 p-2">
                <pre className="text-xs whitespace-pre-wrap break-all">
                    {JSON.stringify(tool.config, null, 2)}
                </pre>
            </ScrollArea>
        </div>

      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4 mt-auto">
         <Button variant="outline" size="sm" disabled>
            <Pencil className="mr-2 h-3 w-3"/>
            Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(tool)}>
            <Trash2 className="mr-2 h-3 w-3"/>
            Excluir
        </Button>
      </CardFooter>
    </Card>
  );
}
