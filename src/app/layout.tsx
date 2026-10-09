import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';
import { MosaicPatternBackground } from '@/components/MosaicPattern';

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
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
        <ToastProvider>
          <MosaicPatternBackground />
          <div className="flex min-h-screen">
            {/* Sidebar navigation for desktop */}
            <Sidebar />

            {/* Main content body */}
            <div className="flex-1 flex flex-col min-w-0">
              <Navbar />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
