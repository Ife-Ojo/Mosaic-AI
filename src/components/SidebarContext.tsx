'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSidebarCollapsed, saveSidebarCollapsed } from '@/lib/storage';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsedState] = useState(false);

  useEffect(() => {
    setIsCollapsedState(getSidebarCollapsed());
  }, []);

  const setIsCollapsed = (collapsed: boolean) => {
    setIsCollapsedState(collapsed);
    saveSidebarCollapsed(collapsed);
  };

  const toggleSidebar = () => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      saveSidebarCollapsed(next);
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
