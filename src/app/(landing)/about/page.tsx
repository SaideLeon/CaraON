
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
    
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">SARIAC – Sistema de Agentes Robóticos de Interação e Automação Conversacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            
            <section>
                <h2 className="font-headline text-2xl font-semibold mb-2">🧭 Missão</h2>
                <p className="text-muted-foreground">
                    Capacitar empresas e organizações a automatizar o relacionamento com seus públicos através de agentes virtuais inteligentes, promovendo interações mais rápidas, acessíveis e eficazes.
                </p>
            </section>
            
            <Separator />
            
            <section>
                <h2 className="font-headline text-2xl font-semibold mb-2">👁 Visão</h2>
                <p className="text-muted-foreground">
                    Ser referência em inteligência conversacional para WhatsApp em países lusófonos, liderando a transformação digital da comunicação entre marcas e pessoas.
                </p>
            </section>

            <Separator />

            <section>
                <h2 className="font-headline text-2xl font-semibold mb-4">⚖️ Valores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Inovação</h3>
                        <p className="text-muted-foreground">Estamos em constante evolução tecnológica.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Responsividade</h3>
                        <p className="text-muted-foreground">Valorizamos cada mensagem como uma oportunidade.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Confiabilidade</h3>
                        <p className="text-muted-foreground">Segurança e estabilidade são pilares do nosso sistema.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Empatia digital</h3>
                        <p className="text-muted-foreground">Criamos agentes que respeitam e compreendem o usuário.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Autonomia do cliente</h3>
                        <p className="text-muted-foreground">Ferramentas que empoderam, e não que complicam.</p>
                    </div>
                </div>
                 <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground">
                    "Na SARIAC, acreditamos que o futuro da comunicação é automatizado, mas nunca impessoal."
                </blockquote>
            </section>

            <Separator />

             <div>
                <h2 className="font-headline text-2xl font-semibold mb-2">🔧 Versão Técnica</h2>
                <p className="text-muted-foreground">
                    A SARIAC é uma empresa de tecnologia especializada no desenvolvimento de agentes virtuais inteligentes para o WhatsApp, utilizando uma arquitetura escalável com WhatsApp Web API, NLP, automação de fluxos lógicos e integração com sistemas externos como CRMs, bancos de dados e ERPs.
                </p>
                <p className="text-muted-foreground mt-2">
                    Nosso stack inclui: Integração com WhatsApp via sessão persistente, IA conversacional baseada em modelos de linguagem natural, Gerenciamento de múltiplas instâncias com autenticação segura, Painéis de controle com monitoramento em tempo real, Webhooks, eventos e automações personalizadas.
                </p>
                 <blockquote className="mt-6 border-l-2 pl-6 italic text-muted-foreground">
                    Tecnologia que entende. Arquitetura que escala. Automação que converte.
                </blockquote>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
