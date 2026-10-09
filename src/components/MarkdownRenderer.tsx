'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) return null;

  // Split content into blocks: code blocks vs text blocks
  const parts: Array<{ type: 'code' | 'text'; text: string; lang?: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || 'text', text: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }

  // Parse inline text (bold, inline code, links)
  const formatInline = (text: string) => {
    // Escape or handle basic inline styling
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return tokens.map((token, i) => {
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-[11px] border border-slate-700/60"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return (
          <em key={i} className="italic text-purple-200">
            {token.slice(1, -1)}
          </em>
        );
      }
      return token;
    });
  };

  const renderTextBlock = (text: string, blockKey: number) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: string[] = [];
    let inList = false;

    const flushList = (keySuffix: number) => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul key={`ul-${blockKey}-${keySuffix}`} className="my-2 space-y-1 pl-5 list-disc marker:text-purple-400 text-slate-300">
            {listBuffer.map((item, liIdx) => (
              <li key={liIdx} className="leading-relaxed">
                {formatInline(item)}
              </li>
            ))}
          </ul>
        );
        listBuffer = [];
        inList = false;
      }
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Heading 1
      if (trimmed.startsWith('# ')) {
        flushList(idx);
        elements.push(
          <h1 key={`h1-${blockKey}-${idx}`} className="text-lg sm:text-xl font-extrabold text-white mt-4 mb-2 pb-1 border-b border-slate-800 flex items-center gap-2">
            {formatInline(trimmed.replace(/^#\s+/, ''))}
          </h1>
        );
        return;
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        flushList(idx);
        elements.push(
          <h2 key={`h2-${blockKey}-${idx}`} className="text-base sm:text-lg font-bold text-purple-200 mt-4 mb-2">
            {formatInline(trimmed.replace(/^##\s+/, ''))}
          </h2>
        );
        return;
      }

      // Heading 3
      if (trimmed.startsWith('### ')) {
        flushList(idx);
        elements.push(
          <h3 key={`h3-${blockKey}-${idx}`} className="text-sm sm:text-base font-semibold text-indigo-300 mt-3 mb-1.5">
            {formatInline(trimmed.replace(/^###\s+/, ''))}
          </h3>
        );
        return;
      }

      // Heading 4
      if (trimmed.startsWith('#### ')) {
        flushList(idx);
        elements.push(
          <h4 key={`h4-${blockKey}-${idx}`} className="text-xs sm:text-sm font-semibold text-slate-200 mt-2.5 mb-1">
            {formatInline(trimmed.replace(/^####\s+/, ''))}
          </h4>
        );
        return;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList(idx);
        elements.push(
          <blockquote
            key={`quote-${blockKey}-${idx}`}
            className="my-3 pl-3.5 py-1.5 border-l-2 border-indigo-400/80 bg-indigo-950/20 rounded-r-lg text-slate-300 italic text-xs leading-relaxed"
          >
            {formatInline(trimmed.replace(/^>\s+/, ''))}
          </blockquote>
        );
        return;
      }

      // Bullet List item
      if (/^[-*]\s+/.test(trimmed)) {
        inList = true;
        listBuffer.push(trimmed.replace(/^[-*]\s+/, ''));
        return;
      }

      // Numbered list item
      if (/^\d+\.\s+/.test(trimmed)) {
        inList = true;
        listBuffer.push(trimmed.replace(/^\d+\.\s+/, ''));
        return;
      }

      // Empty line
      if (trimmed === '') {
        flushList(idx);
        return;
      }

      // Regular paragraph
      flushList(idx);
      elements.push(
        <p key={`p-${blockKey}-${idx}`} className="my-1.5 leading-relaxed text-slate-300 text-xs sm:text-sm">
          {formatInline(line)}
        </p>
      );
    });

    flushList(lines.length);
    return elements;
  };

  let codeBlockCounter = 0;

  return (
    <div className={`space-y-2 text-xs sm:text-sm leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (part.type === 'code') {
          const currentCodeIdx = codeBlockCounter++;
          const isCopied = copiedIndex === currentCodeIdx;
          return (
            <div
              key={`code-${index}`}
              className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/90 shadow-md"
            >
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="font-mono text-purple-400 uppercase tracking-wider text-[10px]">
                  {part.lang || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(part.text, currentCodeIdx)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px]">Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 text-[11px] sm:text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed whitespace-pre">
                <code>{part.text}</code>
              </pre>
            </div>
          );
        }

        return <div key={`text-${index}`}>{renderTextBlock(part.text, index)}</div>;
      })}
    </div>
  );
}
