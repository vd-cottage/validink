'use client';

import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { AxiosTokenProvider } from '@/components/providers/axios-token-provider';
import { createThemeVariables } from '@/lib/theme/utils';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const themeVariables = createThemeVariables();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={inter.className}
        style={themeVariables as any}
      >
        <ErrorBoundary>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
            >
              <ToastProvider>
                <AxiosTokenProvider>
                  {children}
                </AxiosTokenProvider>
              </ToastProvider>
            </ThemeProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
