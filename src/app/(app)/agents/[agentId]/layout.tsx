
'use client';

import { ArrowLeft, Edit, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { getAgentById } from '@/services/api';
import type { Agent } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function AgentDetailLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const agentId = params.agentId as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (agentId) {
      const fetchAgent = async () => {
        try {
          setLoading(true);
          const foundAgent = await getAgentById(agentId);
          setAgent(foundAgent);
        } catch (error) {
          console.error('Failed to fetch agent', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAgent();
    }
  }, [agentId]);

  const navLinks = [
    { href: `/agents/${agentId}/edit`, label: 'Editar Persona', icon: Edit },
    { href: `/agents/${agentId}/tune`, label: 'Afinar com IA', icon: Wand2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href={agent ? `/agents?instanceId=${agent.instanceId}` : '/agents'}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Voltar para Agentes</span>
          </Link>
        </Button>
        <div>
          {loading ? (
            <>
              <Skeleton className="h-7 w-48 mb-1" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold font-headline">{agent?.name}</h1>
              <p className="text-muted-foreground text-sm">Gerencie a configuração do seu agente.</p>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <Card className="p-2 sticky top-20">
            <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
                <Button
                    key={link.href}
                    asChild
                    variant={pathname === link.href ? 'secondary' : 'ghost'}
                    className="justify-start"
                >
                    <Link href={link.href} className="flex items-center gap-3">
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                    </Link>
                </Button>
            ))}
            </nav>
        </Card>

        <div className="flex-1">
            <Card>
                {children}
            </Card>
        </div>
      </div>
    </div>
  );
}
