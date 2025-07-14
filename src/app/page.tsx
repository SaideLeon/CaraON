
'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, MessageCircleCode, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EnhancedLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse opacity-50 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-pink-400/20"></div>
        
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-40 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60 [animation-delay:-0.5s]"></div>
        <div className="absolute bottom-20 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-60 [animation-delay:-1s]"></div>
        
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:scale-110 transition-transform duration-300">
            <MessageCircleCode className="h-10 w-10 animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight font-headline">
            <span className="block mb-2 animate-fade-in">Automatize seu Atendimento</span>
            <span className="block mb-2 animate-fade-in [animation-delay:500ms]">no WhatsApp com</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse [animation-delay:1000ms]">
              Agentes de IA
            </span>
          </h1>
          
          <p className="max-w-3xl text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed animate-fade-in [animation-delay:1500ms]">
            Crie, treine e gerencie agentes virtuais que respondem seus clientes 24/7,
            direto do seu número de WhatsApp. Sem complicações.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mt-8 animate-fade-in [animation-delay:2000ms]">
            <Button asChild className="flex-1 group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 h-auto">
              <Link href="/register">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center">
                  Comece Grátis 
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="flex-1 rounded-lg border-2 border-slate-300 bg-white/80 backdrop-blur-sm px-8 py-4 text-slate-700 font-semibold hover:bg-white hover:shadow-lg hover:scale-105 transition-all duration-300 h-auto">
              <Link href="/login">Fazer Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-white/50 dark:bg-slate-800/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in font-headline">
              <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent dark:from-slate-200 dark:to-slate-400">
                Recursos Poderosos
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed animate-fade-in [animation-delay:500ms]">
              Tudo que você precisa para criar uma experiência de atendimento excepcional.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in [animation-delay:1000ms]">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Bot className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                  Agentes Personalizáveis
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Defina a persona, o tom de voz e as instruções específicas para cada agente.
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in [animation-delay:1500ms]">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/10 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                  Conexão Instantânea
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Conecte seu número de WhatsApp em segundos com um simples QR Code.
                </p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900/50 p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-fade-in [animation-delay:2000ms]">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-green-400/10 to-green-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">
                  IA Inteligente
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Nossa IA sugere melhorias para a persona dos seus agentes com base no desempenho.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 bg-slate-100 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="relative group animate-fade-in [animation-delay:1000ms]">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
              
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                <div className="bg-slate-200 dark:bg-slate-800 h-96 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <MessageCircleCode className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2 font-headline">
                      Dashboard Preview
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Interface intuitiva e poderosa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-indigo-900/20"></div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in font-headline">
            Pronto para transformar seu atendimento?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-fade-in [animation-delay:500ms]">
            Junte-se a milhares de empresas que já automatizaram seu atendimento
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto animate-fade-in [animation-delay:1000ms]">
            <Button asChild size="lg" className="bg-white text-slate-800 font-semibold text-lg hover:bg-slate-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <Link href="/register">Começar Agora - É Grátis</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-2 border-white/70 text-white font-semibold text-lg hover:bg-white/10 hover:border-white transition-all duration-300 hover:scale-105">
              <Link href="#">Ver Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
