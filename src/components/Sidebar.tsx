'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Headphones, 
  Sparkles, 
  FileCheck2, 
  Library, 
  Database,
  Flame,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Link2
} from 'lucide-react';
import { MosaicTesseraIcon } from './MosaicPattern';
import { useSidebar } from './SidebarContext';
import { getStoredNotionWorkspace } from '@/lib/storage';
import { NotionWorkspaceInfo } from '@/types';

export function Sidebar({ onOpenNotionModal }: { onOpenNotionModal?: () => void }) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [workspace, setWorkspace] = useState<NotionWorkspaceInfo | null>(null);

  useEffect(() => {
    setWorkspace(getStoredNotionWorkspace());
  }, [pathname]);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Lecture Companion',
      href: '/lecture-companion',
      icon: Headphones,
      badge: 'Bilingual',
    },
    {
      name: 'AI Study Studio',
      href: '/study-studio',
      icon: Sparkles,
      badge: 'Transform',
    },
    {
      name: 'Assignment Simplifier',
      href: '/assignment-simplifier',
      icon: FileCheck2,
      badge: 'Rubrics',
    },
    {
      name: 'My Learning',
      href: '/my-learning',
      icon: Library,
      badge: null,
    },
  ];

  return (
    <aside
      className={`border-r border-zinc-800 bg-black/95 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 hidden md:flex transition-all duration-300 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div>
        <div className={`p-4 border-b border-zinc-850 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-600 p-0.5 shadow-md shadow-orange-950/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                  <MosaicTesseraIcon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    Mosaic
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-950/80 text-orange-400 border border-orange-700/60">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">Multilingual Notion Companion</p>
              </div>
            </Link>
          ) : (
            <Link href="/" className="group" title="Mosaic AI">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-600 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                  <MosaicTesseraIcon className="w-4 h-4" />
                </div>
              </div>
            </Link>
          )}

          {/* Collapse/Expand button */}
          <button
            onClick={toggleSidebar}
            className={`p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ${
              isCollapsed ? 'hidden' : 'block'
            }`}
            title="Collapse sidebar (fullscreen view)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* When collapsed, show a center uncollapse button */}
        {isCollapsed && (
          <div className="p-2 flex justify-center border-b border-zinc-850">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-orange-400 hover:bg-zinc-900 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center ${
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-300 border border-orange-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-orange-400' : 'text-zinc-400 group-hover:text-orange-400'
                    }`}
                  />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-orange-500/25 text-orange-300'
                        : 'bg-zinc-850 text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Notion Workspace Banner in Sidebar */}
      {!isCollapsed ? (
        <div className="p-4 border-t border-zinc-850 space-y-3">
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-zinc-400 font-medium flex items-center gap-1.5 text-[11px]">
                <Database className="w-3.5 h-3.5 text-orange-400" />
                Notion Status
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  workspace?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
            </div>
            {workspace?.connected ? (
              <>
                <div className="font-semibold text-white text-xs truncate">
                  {workspace.workspaceName}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                  <span>{workspace.syncedItemsCount || 0} pages synced</span>
                  <Link href="/my-learning" className="text-orange-400 hover:underline flex items-center gap-0.5">
                    <span>View</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="text-zinc-400 text-[11px]">Not connected yet</div>
                <button
                  type="button"
                  onClick={onOpenNotionModal}
                  className="w-full py-1.5 px-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors shadow-sm"
                >
                  <Link2 className="w-3 h-3" />
                  <span>Connect Notion</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-zinc-850 flex justify-center">
          <button
            onClick={onOpenNotionModal}
            className="p-2 rounded-xl text-zinc-400 hover:text-orange-400 hover:bg-zinc-900 transition-colors"
            title={workspace?.connected ? `Connected: ${workspace.workspaceName}` : 'Connect Notion'}
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
