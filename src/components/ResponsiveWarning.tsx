import { Smartphone } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function ResponsiveWarning() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Card className="bg-background/95 backdrop-blur-sm border-primary/50 shadow-lg animate-in fade-in-50 slide-in-from-bottom-5">
        <CardContent className="p-3 flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold">Experiência Otimizada</p>
            <p className="text-xs text-muted-foreground">
              Para uma melhor visualização, recomendamos o acesso por um computador.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
