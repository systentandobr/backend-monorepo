"use client"

import './globals.css';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/utils/cn';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import StoreProvider from '@/providers/store-provider';
import { ToasterProvider } from '@/components/ui/toaster';
import {Providers} from "./providers";

// Configuração da fonte
const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Layout principal da aplicação
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-2BR" suppressHydrationWarning>
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased',
        fontSans.variable
      )}>
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}