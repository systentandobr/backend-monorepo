
import type { Metadata } from 'next';
// Metadados da aplicação
export const metadata: Metadata = {
  title: 'Life Tracker - Transforme objetivos em realidade',
  description: 'Aplicativo para monitoramento de hábitos e objetivos de vida com visão holística e personalizável',
  keywords: 'hábitos, metas, saúde, desenvolvimento pessoal, produtividade',
  authors: [{ name: 'Life Tracker Team' }],
  creator: 'Life Tracker',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
};