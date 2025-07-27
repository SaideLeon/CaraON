
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";

export default function AboutPage() {

    const Step = ({ number, title, description, children }: { number: number, title: string, description: string, children?: React.ReactNode }) => (
        <div className="relative pl-8">
            <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {number}
            </div>
            <h3 className="font-headline text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
            {children && <div className="mt-4 space-y-4">{children}</div>}
        </div>
    );
    
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Sobre o Sistema CaraON</CardTitle>
          <CardDescription>
            Uma explicação detalhada de todo o processo, desde o cadastro do usuário até a resposta de um agente de IA no WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h2 className="font-headline text-2xl font-semibold mb-2">Visão Geral</h2>
                <p className="text-muted-foreground">
                    O CaraON é uma plataforma de automação de WhatsApp projetada para empresas. A ideia central é permitir que um negócio (o "usuário" da plataforma) conecte uma ou mais contas de WhatsApp ("Instâncias") e configure uma hierarquia de robôs (Agentes de IA) para responder às mensagens dos clientes de forma inteligente e organizada.
                </p>
                <p className="mt-2 text-muted-foreground">
                    O sistema é construído em torno de uma estrutura de três níveis de agentes, que imita a organização de uma empresa:
                </p>
                 <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-base">1. Roteador Principal</CardTitle>
                            <CardDescription>O "recepcionista" geral da sua conta de WhatsApp.</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-muted/30">
                        <CardHeader>
                             <CardTitle className="text-base">2. Agente Pai (Departamento)</CardTitle>
                            <CardDescription>O "gerente de departamento" (ex: Vendas, Suporte).</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-muted/30">
                         <CardHeader>
                             <CardTitle className="text-base">3. Agente Filho (Especialista)</CardTitle>
                            <CardDescription>O "funcionário especialista" que executa a tarefa.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>

            <Separator />

            <div>
                <h2 className="font-headline text-2xl font-semibold mb-4">1. Cadastro e Configuração Inicial</h2>
                <div className="space-y-6">
                    <Step number={1} title="Registro de Usuário" description="Um novo usuário se cadastra com nome, e-mail e senha. O sistema cria um registro para ele no banco de dados." />
                    <Step number={2} title="Criação da Instância" description="O usuário cria uma 'Instância' e, neste momento, o sistema automaticamente cria o Agente Roteador Principal associado a esta nova instância." />
                    <Step number={3} title="Conexão com o WhatsApp" description="O backend gera um QR Code, o usuário escaneia com o celular, e a instância fica com o status CONNECTED." />
                </div>
            </div>
            
             <Separator />
            
            <div>
                <h2 className="font-headline text-2xl font-semibold mb-4">2. Estruturando a Lógica de Negócio</h2>
                <div className="space-y-6">
                     <Step number={1} title="Criação de Organizações" description="O usuário cria 'Organizações' dentro da instância, que funcionam como departamentos (ex: Vendas, Suporte Técnico, Financeiro)." />
                     <Step number={2} title="Criação de Agentes de Departamento" description="Para cada Organização, o usuário cria um Agente Pai. Este agente atua como o 'gerente' daquele departamento." />
                     <Step number={3} title="Criação de Agentes Especialistas" description="Dentro de cada Agente Pai, o usuário cria Agentes Filhos. Estes são os especialistas que executam as tarefas (ex: Especialista em iPhones)." />
                </div>
            </div>

            <Separator />

             <div>
                <h2 className="font-headline text-2xl font-semibold mb-4">3. O Fluxo de uma Mensagem: Passo a Passo</h2>
                 <p className="text-muted-foreground mb-6">
                    Este é o coração do sistema. Quando um cliente final envia uma mensagem para o número de WhatsApp conectado:
                </p>
                <div className="space-y-6">
                    <Step number={1} title="Recebimento da Mensagem" description="O serviço de WhatsApp detecta a mensagem recebida, identifica a instância e salva os dados do contato e da mensagem." />
                    
                    <div className="pl-4">
                        <ArrowDown className="h-5 w-5 text-muted-foreground ml-1.5" />
                    </div>

                    <Step number={2} title="Nível 1: Seleção do Departamento" description="O Agente Roteador Principal da instância analisa a mensagem e decide qual Agente Pai (Departamento) é o mais adequado para responder." />

                     <div className="pl-4">
                        <ArrowDown className="h-5 w-5 text-muted-foreground ml-1.5" />
                    </div>

                    <Step number={3} title="Nível 2: Seleção do Especialista" description="O Agente Pai do departamento selecionado assume, analisa a mensagem e escolhe o melhor Agente Filho (Especialista) para a tarefa." />
                    
                     <div className="pl-4">
                        <ArrowDown className="h-5 w-5 text-muted-foreground ml-1.5" />
                    </div>

                    <Step number={4} title="Nível 3: Execução da Tarefa" description="O Agente Filho especialista finalmente recebe a tarefa e usa sua persona para formular uma resposta.">
                        <div className="p-4 border rounded-md bg-muted/30">
                             <h4 className="font-semibold flex items-center gap-2">Uso de Ferramentas</h4>
                            <p className="text-sm text-muted-foreground">
                                Se necessário (ex: verificar estoque), o agente identifica a necessidade de uma ferramenta. O sistema extrai os parâmetros, executa a ferramenta (ex: busca no banco de dados) e injeta o resultado de volta para o agente, que então formula a resposta final completa.
                            </p>
                        </div>
                    </Step>
                    
                    <div className="pl-4">
                        <ArrowDown className="h-5 w-5 text-muted-foreground ml-1.5" />
                    </div>

                    <Step number={5} title="Registro e Resposta" description="Todo o caminho percorrido é registrado, e a resposta final é enviada de volta ao cliente via WhatsApp." />
                </div>
            </div>

             <Separator />

             <div>
                <h2 className="font-headline text-2xl font-semibold mb-2">Conclusão</h2>
                <p className="text-muted-foreground">
                    O sistema CaraON cria uma esteira de atendimento inteligente e hierárquica. Ele não depende de um único robô monolítico, mas sim de uma equipe de agentes de IA coordenados, onde cada um tem uma função específica, permitindo um atendimento mais preciso, organizado e escalável, exatamente como em uma empresa real.
                </p>
            </div>


        </CardContent>
      </Card>
    </div>
  );
}
