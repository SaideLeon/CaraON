import type { ReactNode } from "react";
import { SariacIcon } from "@/components/icons/SariacIcon";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <SariacIcon className="h-8 w-8" />
            </div>
          <h1 className="font-headline text-4xl font-bold text-foreground">ARIAVIS</h1>
          <p className="mt-2 text-muted-foreground">Agentes Robóticos de Interação para Atendimento Virtual Integrado em Serviços</p>
        </div>
        {children}
      </div>
    </main>
  );
}
