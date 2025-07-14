import { MessageCircleCode } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <MessageCircleCode className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Construído por{' '}
            <a
              href="https://cognick.com.br"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Cognick
            </a>
            . Todos os direitos reservados. © {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex items-center gap-4">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Termos</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Privacidade</Link>
        </div>
      </div>
    </footer>
  );
}
