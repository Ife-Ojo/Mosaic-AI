import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';
import { SidebarProvider } from '@/components/SidebarContext';
import { MosaicPatternBackground } from '@/components/MosaicPattern';
import { AppLayoutWrapper } from '@/components/AppLayoutWrapper';

export const metadata: Metadata = {
  title: 'Mosaic AI — Multilingual Learning Companion for Notion',
  description: 'Translate, summarize, and transform lecture transcripts and assignment briefs into Notion-ready study materials in your native language.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased selection:bg-orange-600 selection:text-white">
        <ToastProvider>
          <SidebarProvider>
            <MosaicPatternBackground />
            <AppLayoutWrapper>
              {children}
            </AppLayoutWrapper>
          </SidebarProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
