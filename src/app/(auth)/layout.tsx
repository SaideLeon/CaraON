import type { ReactNode } from "react";
import { CaraOnIcon } from "@/components/icons/CaraOnIcon";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CaraOnIcon className="h-8 w-8" />
            </div>
          <h1 className="font-headline text-4xl font-bold text-foreground">CaraON</h1>
          <p className="mt-2 text-muted-foreground">AI-Powered WhatsApp Agents</p>
        </div>
        {children}
      </div>
    </main>
  );
}
