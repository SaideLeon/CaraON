
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Zap, Sparkles, GitBranch, ShoppingCart, Wrench, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CaraOnIcon } from '@/components/icons/CaraOnIcon';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';

export default function EnhancedLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/about', label: 'Sobre' },
    { href: '/login', label: 'Entrar', variant: 'ghost' as const },
    { href: '/register', label: 'Comece Agora', variant: 'default' as const },
  ];

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <CaraOnIcon className="h-6 w-6 text-primary" />
              <span className="font-bold font-headline">CaraON</span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button asChild variant="ghost">
              <Link href="/about">Sobre</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Comece Agora</Link>
            </Button>
          </nav>
          
          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px]">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu Principal</SheetTitle>
                  <SheetDescription>Navegação principal para o site.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col space-y-4 pt-10">
                  {navLinks.map((link) => (
                    <Button key={link.href} asChild variant={link.variant} onClick={() => setIsMenuOpen(false)}>
                      <Link href={link.href}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-32">
        <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-blue-950/30 to-purple-950/30"></div>
        </div>
        
        <div className="container relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center md:gap-8">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-110 transition-transform duration-300">
            <CaraOnIcon className="h-10 w-10 animate-pulse" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tighter font-headline">
            <span className="block mb-2">Atendimento Inteligente e</span>
            <span className="block mb-2">Vendas no WhatsApp com</span>
            <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Equipes de IA
            </span>
          </h1>
          
          <p className="max-w-3xl text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Crie, treine e orquestre equipes de agentes virtuais que vendem produtos, dão suporte e gerenciam tarefas 24/7,
            direto do seu número de WhatsApp. Sem complicações.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-6">
            <Button asChild size="lg" className="flex-1 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 h-auto text-base">
              <Link href="/register">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  Comece Grátis 
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="flex-1 rounded-lg border-2 bg-background/80 backdrop-blur-sm text-foreground font-semibold hover:bg-background/90 hover:shadow-lg hover:scale-105 transition-all duration-300 h-auto text-base">
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 font-headline">
              Uma Plataforma Completa para Automação
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Tudo que você precisa para criar uma experiência de atendimento e vendas excepcional, imitando a estrutura de uma empresa real.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
             {[
                { icon: GitBranch, title: 'Hierarquia de Agentes', description: 'Crie agentes "Roteadores" para delegar tarefas a "Departamentos" (Agentes Pais), que por sua vez acionam "Especialistas" (Agentes Filhos).' },
                { icon: Bot, title: 'Agentes Especializados', description: 'Defina a persona, o tom de voz e as instruções para cada agente, seja ele um gerente de departamento ou um especialista em produtos.' },
                { icon: Wrench, title: 'Ferramentas Inteligentes', description: 'Dê superpoderes aos seus agentes. Conecte-os a bancos de dados para consultar estoque, preços, APIs externas e muito mais.' },
                { icon: ShoppingCart, title: 'Gestão de E-commerce', description: 'Gerencie produtos, marcas e categorias. Seus agentes podem se tornar vendedores virtuais e acessar todo o seu catálogo em tempo real.' },
                { icon: Zap, title: 'Conexão Instantânea', description: 'Conecte seu número de WhatsApp em segundos com um simples QR Code. O sistema cria automaticamente seu primeiro agente "Roteador".' },
                { icon: Sparkles, title: 'Otimização com IA', description: 'Nossa IA sugere melhorias para a persona dos seus agentes com base no desempenho e nas interações reais com clientes.' },
             ].map((feature, index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl bg-card p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-border/50">
                    <div className="relative z-10">
                        <div className="mb-6 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <feature.icon className="h-7 w-7 md:h-8 md:w-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-4 text-card-foreground">
                            {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                           {feature.description}
                        </p>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24 bg-muted/20">
        <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 font-headline">
                    Gerencie Tudo em um Só Lugar
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    Nossa dashboard intuitiva oferece controle total sobre suas instâncias, agentes, produtos e ferramentas.
                </p>
            </div>
            <div className="mx-auto max-w-6xl">
                <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
                <div className="relative bg-background/80 backdrop-blur-sm rounded-2xl p-2 shadow-2xl hover:shadow-3xl transition-shadow duration-500 border border-border">
                    <Image 
                        src="https://placehold.co/1200x700.png"
                        alt="Dashboard Preview"
                        width={1200}
                        height={700}
                        className="rounded-lg"
                        data-ai-hint="dashboard interface"
                    />
                </div>
                </div>
            </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-headline">
              Comece em Minutos
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Automatizar seu atendimento nunca foi tão fácil.
            </p>
          </div>
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
            
            <div className="relative grid md:grid-cols-4 gap-8">
                {[
                    { number: 1, title: 'Conecte', description: 'Crie uma instância e conecte seu WhatsApp com um QR Code.' },
                    { number: 2, title: 'Estruture', description: 'Crie departamentos (Organizações) e gerentes (Agentes Pais).' },
                    { number: 3, title: 'Especialize', description: 'Adicione especialistas (Agentes Filhos) com ferramentas e catálogo.' },
                    { number: 4, title: 'Automatize', description: 'Deixe sua equipe de IA trabalhar 24/7, vendendo e atendendo por você.' },
                ].map((step) => (
                     <div key={step.number} className="relative flex flex-col items-center text-center p-4">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-background border-2 border-primary rounded-full flex items-center justify-center text-primary font-bold text-lg z-10">
                            {step.number}
                        </div>
                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                            <p className="text-muted-foreground">{step.description}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/10 relative overflow-hidden">
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-headline">
            Pronto para transformar seu atendimento?
          </h2>
          <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Junte-se às empresas que já estão revolucionando seu atendimento e vendas no WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button asChild size="lg" className="bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <Link href="/register">Começar Agora - É Grátis</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

    