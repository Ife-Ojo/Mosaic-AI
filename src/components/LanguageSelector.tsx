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
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-700/80 hover:border-purple-500/50 rounded-xl text-sm text-slate-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
      >
        <div className="flex items-center gap-2.5 truncate">
          <span className="text-lg leading-none">{selectedLang?.flag || '🌐'}</span>
          <span className="font-medium text-white truncate">{selectedLang?.name || 'Select Language'}</span>
          <span className="text-xs text-slate-400 hidden sm:inline">({selectedLang?.nativeName})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/95 border border-purple-500/30 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-slate-800">
            <input
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-750 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                    isSelected ? 'bg-purple-900/40 text-purple-200 font-semibold' : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-white">{lang.name}</span>
                    <span className="text-slate-400">({lang.nativeName})</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
