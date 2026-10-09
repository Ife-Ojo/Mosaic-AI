'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { NotionModal } from './NotionModal';

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isNotionModalOpen, setIsNotionModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Collapsible sidebar */}
      <Sidebar onOpenNotionModal={() => setIsNotionModalOpen(true)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 bg-black">
        <Navbar onOpenNotionModal={() => setIsNotionModalOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Notion Connection Modal accessible from Navbar and Sidebar */}
      <NotionModal
        isOpen={isNotionModalOpen}
        onClose={() => setIsNotionModalOpen(false)}
      />
    </div>
  );
}
