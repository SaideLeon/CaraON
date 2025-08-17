
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Code, DollarSign, FlaskConical, Globe, Mail, Newspaper, Pilcrow, Search, TestTube, FileText } from 'lucide-react';

const tools = [
  {
    name: 'DuckDuckGo Search',
    id: 'duckduckgo',
    icon: <Globe className="h-6 w-6" />,
    description: 'Realiza uma pesquisa geral na web usando o DuckDuckGo. Ideal para obter informações atuais ou encontrar respostas para perguntas gerais.',
    config: `{
  "type": "DUCKDUCKGO"
}`,
    example: 'Um agente de suporte ao cliente pode usar esta ferramenta para procurar rapidamente informações sobre um produto ou serviço mencionado por um cliente.',
  },
  {
    name: 'Yahoo Finance',
    id: 'yfinance',
    icon: <DollarSign className="h-6 w-6" />,
    description: 'Acessa dados financeiros do Yahoo Finance, incluindo preços de ações e notícias de empresas. Essencial para agentes focados em finanças.',
    config: `{
  "type": "YFINANCE",
  "config": {
    "stock_price": true,
    "company_news": true
  }
}`,
    example: 'Um agente analista financeiro pode usar esta ferramenta para obter o preço atual das ações da "AAPL" e as últimas notícias relacionadas à Apple Inc.',
  },
  {
    name: 'PubMed Search',
    id: 'pubmed',
    icon: <TestTube className="h-6 w-6" />,
    description: 'Realiza buscas na base de dados de artigos científicos e médicos do PubMed. Perfeito para agentes na área da saúde e pesquisa.',
    config: `{
  "type": "PUBMED"
}`,
    example: 'Um agente assistente de pesquisa médica pode usar esta ferramenta para encontrar os estudos mais recentes sobre "tratamentos para diabetes tipo 2".',
  },
  {
    name: 'Tavily Advanced Search',
    id: 'tavily',
    icon: <Search className="h-6 w-6" />,
    description: 'Uma ferramenta de pesquisa avançada que otimiza resultados para LLMs, fornecendo respostas concisas e relevantes. Ótima para respostas complexas.',
    config: `{
  "type": "TAVILY"
}`,
    example: 'Um agente de pesquisa de mercado pode usar o Tavily para obter um resumo sobre "o estado atual da indústria de veículos elétricos".',
  },
  {
    name: 'Wikipedia Search',
    id: 'wikipedia',
    icon: <Newspaper className="h-6 w-6" />,
    description: 'Busca por artigos e informações na Wikipedia. Excelente para obter conhecimento geral, histórico e definições.',
    config: `{
  "type": "WIKIPEDIA"
}`,
    example: 'Um agente tutor pode usar a Wikipedia para explicar "o que foi a Revolução Francesa" para um estudante.',
  },
  {
    name: 'ArXiv Academic Search',
    id: 'arxiv',
    icon: <FlaskConical className="h-6 w-6" />,
    description: 'Busca por artigos e preprints acadêmicos no repositório ArXiv, focado em física, matemática, ciência da computação, etc.',
    config: `{
  "type": "ARXIV"
}`,
    example: 'Um agente pesquisador de IA pode usar o ArXiv para encontrar os últimos artigos sobre "modelos de linguagem de grande escala".',
  },
  {
    name: 'Email Assistant',
    id: 'email',
    icon: <Mail className="h-6 w-6" />,
    description: 'Permite que o agente envie e-mails. Requer configuração de um servidor SMTP ou credenciais de um serviço de e-mail.',
    config: `{
  "type": "EMAIL",
  "config": {
    "receiver_email": "destino@exemplo.com",
    "sender_email": "seu_email@exemplo.com",
    "sender_name": "Nome do Remetente",
    "sender_passkey": "sua_senha_de_app"
  }
}`,
    example: 'Um agente de vendas pode usar esta ferramenta para enviar um e-mail de acompanhamento a um lead após uma conversa.',
  },
    {
    name: 'Gmail Assistant',
    id: 'gmail',
    icon: <Mail className="h-6 w-6" />,
    description: 'Permite que o agente interaja com uma conta do Gmail, podendo ler, pesquisar e enviar e-mails. Requer autenticação OAuth2.',
    config: `{
  "type": "GMAIL"
}`,
    example: 'Um agente de assistente pessoal pode pesquisar na caixa de entrada do usuário por "confirmação de voo" e resumir os detalhes.',
  },
  {
    name: 'PDF Knowledge Analyzer',
    id: 'pdf_knowledge',
    icon: <FileText className="h-6 w-6" />,
    description: 'Permite ao agente ler e extrair informações de documentos PDF localizados em um diretório específico. Ótimo para criar uma base de conhecimento a partir de documentos existentes.',
    config: `{
  "type": "PDF_KNOWLEDGE",
  "config": {
    "path": "data/pdfs",
    "table_name": "pdf_documents"
  }
}`,
    example: 'Um agente de RH pode usar esta ferramenta para responder perguntas sobre a política de férias da empresa, consultando o manual de RH em PDF.',
  },
];

export default function AboutToolsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guia de Ferramentas para Agentes</CardTitle>
          <CardDescription>
            Aprenda sobre cada ferramenta disponível para capacitar seus agentes de IA.
            Use os exemplos de configuração para montar seus especialistas.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        {tools.map((tool) => (
          <AccordionItem value={tool.id} key={tool.id} className="border-b-0">
             <Card className="overflow-hidden">
              <AccordionTrigger className="p-6 text-left hover:no-underline">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{tool.name}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-muted/50 px-6 py-4 space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Code className="h-4 w-4" /> Configuração</h4>
                        <pre className="p-4 rounded-md bg-background text-sm text-foreground overflow-x-auto">
                            <code>
                                {tool.config}
                            </code>
                        </pre>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Pilcrow className="h-4 w-4" /> Exemplo de Uso</h4>
                        <p className="text-sm text-muted-foreground italic">"{tool.example}"</p>
                    </div>
                </div>
              </AccordionContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
