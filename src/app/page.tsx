import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, MessageCircleCode, Zap } from 'lucide-react';
import Image from 'next/image';

// Since this is the new root page, we import the LandingLayout directly.
// The file is moved to src/app/(landing)/layout.tsx, so we need a new file `src/app/(landing)/page.tsx`
// which will be wrapped by the layout. The content below goes into that page.

export default function Home() {
  return (
    <>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircleCode className="h-8 w-8" />
          </div>
          <h1 className="text-center text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl font-headline">
            Automatize seu Atendimento no WhatsApp com{' '}
            <span className="text-primary">Agentes de IA</span>
          </h1>
          <p className="max-w-[700px] text-center text-lg text-muted-foreground sm:text-xl">
            Crie, treine e gerencie agentes virtuais que respondem seus clientes 24/7,
            direto do seu número de WhatsApp. Sem complicações.
          </p>
        </div>
        <div className="mx-auto flex w-full max-w-sm items-center space-x-4">
          <Button asChild className="flex-1">
            <Link href="/register">
              Comece Grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </section>

      <section id="features" className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-headline text-3xl leading-[1.1] sm:text-3xl md:text-4xl">
            Recursos Poderosos
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Tudo que você precisa para criar uma experiência de atendimento excepcional.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Bot className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Agentes Personalizáveis</h3>
                <p className="text-sm text-muted-foreground">
                  Defina a persona, o tom de voz e as instruções específicas para cada agente.
                </p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <Zap className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">Conexão Instantânea</h3>
                <p className="text-sm text-muted-foreground">
                  Conecte seu número de WhatsApp em segundos com um simples QR Code.
                </p>
              </div>
            </div>
          </div>
           <div className="relative overflow-hidden rounded-lg border bg-background p-2">
            <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
              <MessageCircleCode className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h3 className="font-bold">IA Inteligente</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa IA sugere melhorias para a persona dos seus agentes com base no desempenho.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-6xl items-center justify-center">
              <Image
                src="https://placehold.co/1200x600.png"
                alt="Dashboard do Produto"
                width={1200}
                height={600}
                className="rounded-lg border shadow-lg"
                data-ai-hint="dashboard product"
              />
          </div>
      </section>
    </>
  );
}
