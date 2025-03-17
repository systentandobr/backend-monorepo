// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const [loading, setLoading] = useState(true);

  // Simula carregamento de dados
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-12">
      <div className="w-full max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Hoje</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </Button>
        </header>

        {/* Filtros de dia da semana */}
        <div className="mb-6">
          <div className="flex justify-between">
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map((day, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-xs text-gray-500">{day}</span>
                <div className={`w-10 h-10 flex items-center justify-center rounded-full mt-1 ${idx === 5 ? 'bg-primary text-white' : 'text-gray-500'}`}>
                  {idx + 9}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fundo decorativo */}
        <div className="relative h-24 mb-6 bg-dark-card rounded-lg overflow-hidden">
          <div className="absolute left-10 top-5 w-8 h-8 rounded-full bg-primary/20"></div>
          <div className="absolute left-20 top-14 w-6 h-6 rounded-full bg-primary/10"></div>
          <div className="absolute right-12 top-8 w-10 h-10 rounded-full bg-primary/15"></div>
        </div>

        {/* Filtros */}
        <div className="flex justify-around mb-8 border-b border-gray-800 pb-2">
          <button className="text-gray-500 px-2 py-1">Manhã</button>
          <button className="text-white font-medium border-b-2 border-primary px-2 py-1">Todos</button>
          <button className="text-gray-500 px-2 py-1">Tarde</button>
          <button className="text-gray-500 px-2 py-1">Noite</button>
        </div>

        {/* Lista de hábitos */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-card rounded-lg p-4 animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/4 mt-2"></div>
                  </div>
                  <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Exemplo de hábitos - substitua por seus dados reais */}
            <div className="bg-dark-card rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    💧
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-white">Beba água</h3>
                    <span className="text-xs text-gray-400">Série de 3 dias</span>
                  </div>
                </div>
                <div className="w-6 h-6 border-2 border-gray-600 rounded-full flex items-center justify-center">
                </div>
              </div>
            </div>

            <div className="bg-dark-card rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                    📚
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-white">Ler</h3>
                    <span className="text-xs text-gray-400">Série de 2 dias</span>
                  </div>
                </div>
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-card rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    ☕
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-white">Limitar cafeína</h3>
                    <span className="text-xs text-gray-400">Faça um chá de ervas</span>
                  </div>
                </div>
                <div className="w-6 h-6 border-2 border-gray-600 rounded-full flex items-center justify-center">
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botão flutuante */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-accent rounded-full flex items-center justify-center text-white shadow-lg">
        +
      </button>

      {/* Barra de navegação */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gray-800 py-3 px-4">
        <div className="flex justify-around">
          <button className="flex flex-col items-center text-primary">
            <span className="w-6 h-6 flex items-center justify-center">□</span>
            <span className="text-xs mt-1">Hoje</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-500">
            <span className="w-6 h-6 flex items-center justify-center">△</span>
            <span className="text-xs mt-1">Desafios</span>
          </button>
          
          <div className="w-10"></div> {/* Espaço para o botão flutuante */}
          
          <button className="flex flex-col items-center text-gray-500">
            <span className="w-6 h-6 flex items-center justify-center">▭</span>
            <span className="text-xs mt-1">Estat.</span>
          </button>
          
          <button className="flex flex-col items-center text-gray-500">
            <span className="w-6 h-6 flex items-center justify-center">□</span>
            <span className="text-xs mt-1">Explore</span>
          </button>
        </div>
      </nav>
    </main>
  );
}