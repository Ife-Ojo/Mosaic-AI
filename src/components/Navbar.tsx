'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, X, Sparkles, Database, Plus, Search, 
  HelpCircle, ChevronDown, Check, Globe
} from 'lucide-react';
import { MosaicTesseraIcon } from './MosaicPattern';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { SupportedLanguageCode } from '@/types';
import { getPreferredTargetLanguage, savePreferredTargetLanguage, getStoredNotionWorkspace } from '@/lib/storage';
import { useToast } from './Toast';

export function Navbar({ onOpenNotionOverview }: { onOpenNotionOverview?: () => void }) {
  const pathname = usePathname();
  const { info } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [targetLang, setTargetLang] = useState<SupportedLanguageCode>('es');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [workspace, setWorkspace] = useState(getStoredNotionWorkspace());

  useEffect(() => {
    setTargetLang(getPreferredTargetLanguage());
    setWorkspace(getStoredNotionWorkspace());
  }, [pathname]);

  const handleLanguageChange = (code: SupportedLanguageCode) => {
    setTargetLang(code);
    savePreferredTargetLanguage(code);
    setLangDropdownOpen(false);
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
    info('Study Language Preference', `Default target language set to ${lang?.name} (${lang?.flag})`);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang) || SUPPORTED_LANGUAGES[1];

  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Lecture Companion', href: '/lecture-companion' },
    { name: 'AI Study Studio', href: '/study-studio' },
    { name: 'Assignment Simplifier', href: '/assignment-simplifier' },
    { name: 'Notes Exchange', href: '/notes-exchange' },
    { name: 'My Learning', href: '/my-learning' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile trigger & brand for mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <MosaicTesseraIcon className="w-6 h-6" />
            <span className="font-bold text-white text-base">Mosaic</span>
          </Link>
        </div>

        {/* Center: Context Breadcrumb or Active Page Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-300">Workspace:</span>
          <span className="text-purple-300 font-semibold">{workspace.workspaceName}</span>
          <span className="text-slate-600">/</span>
          <span className="capitalize text-slate-400 font-medium">
            {pathname === '/' ? 'Dashboard' : pathname.replace('/', '').replace('-', ' ')}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Target Language Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-750 hover:border-purple-500/50 text-xs text-slate-200 transition-colors shadow-sm"
              title="Target study language preference"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="hidden sm:inline font-medium">{currentLangObj.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-purple-500/30 shadow-2xl py-1.5 z-50 backdrop-blur-xl max-h-80 overflow-y-auto">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Target Study Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                      targetLang === lang.code ? 'bg-purple-900/30 text-purple-200 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span className="text-slate-400 text-[11px]">({lang.nativeName})</span>
                    </div>
                    {targetLang === lang.code && <Check className="w-3.5 h-3.5 text-purple-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notion Status Pill */}
          <button
            onClick={onOpenNotionOverview}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-purple-500/50 text-xs text-stone-200 transition-colors group"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline text-slate-400">Notion:</span>
            <span className="font-semibold text-white">Academic Vault</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* Quick Action Button */}
          <Link
            href="/study-studio"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-950/40 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Transform</span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
