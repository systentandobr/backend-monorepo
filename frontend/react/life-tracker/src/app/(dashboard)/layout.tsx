import '../globals.css';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/utils/cn';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import StoreProvider from '@/providers/store-provider';
import { ToasterProvider } from '@/components/ui/toaster';

// Configuração da fonte
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

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

// Layout principal da aplicação
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        fontSans.variable
      )}>
        <StoreProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ToasterProvider>
              <Toaster />
            </ToasterProvider>
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}