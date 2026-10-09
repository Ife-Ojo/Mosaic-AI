'use client';

import React from 'react';
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
  ArrowUpRight
} from 'lucide-react';
import { MosaicTesseraIcon } from './MosaicPattern';

export function Sidebar() {
  const pathname = usePathname();

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
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-xl flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 hidden md:flex">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-950/50 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <MosaicTesseraIcon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-300">
                  Mosaic
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Multilingual Notion Companion</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-200 border border-purple-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-purple-400' : 'text-slate-500 group-hover:text-purple-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isActive
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
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
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-stone-400 font-medium flex items-center gap-1.5 text-[11px]">
              <Database className="w-3.5 h-3.5 text-purple-400" />
              Notion Synced
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="font-semibold text-stone-200 text-xs truncate">
            Aiden's Academic Vault
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center justify-between">
            <span>18 materials linked</span>
            <Link href="/my-learning" className="text-purple-400 hover:underline flex items-center gap-0.5">
              <span>View</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Student Study Streak */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-950/30 border border-purple-800/30 text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-medium">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>5-Day Study Streak</span>
          </div>
          <span className="text-[11px] font-bold text-amber-300">Level 4</span>
        </div>
      </div>
    </aside>
  );
}
