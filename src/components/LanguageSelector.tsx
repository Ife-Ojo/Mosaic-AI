'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/sample-data';
import { SupportedLanguageCode, Language } from '@/types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  selectedCode: SupportedLanguageCode;
  onChange: (code: SupportedLanguageCode) => void;
  label?: string;
  allowAuto?: boolean;
  disabled?: boolean;
}

export function LanguageSelector({
  selectedCode,
  onChange,
  label,
  allowAuto = false,
  disabled = false,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === selectedCode);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (lang) =>
      lang.name.toLowerCase().includes(search.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      lang.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-black border border-zinc-800 hover:border-orange-500/50 rounded-xl text-sm text-zinc-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-lg leading-none">{selectedLang?.flag || '🌐'}</span>
          <span className="font-medium text-white truncate">{selectedLang?.name || 'Select Language'}</span>
          <span className="text-xs text-zinc-500 hidden sm:inline">({selectedLang?.nativeName})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-zinc-850">
            <input
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-black border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === selectedCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onChange(lang.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                    isSelected ? 'bg-orange-950/40 text-orange-200 font-semibold' : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-white">{lang.name}</span>
                    <span className="text-zinc-500">({lang.nativeName})</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
