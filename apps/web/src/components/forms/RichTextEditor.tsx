'use client';
import { useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  return (
    <div className="border border-[var(--border-subtle)] rounded-[var(--radius-md)] overflow-hidden">
      <div className="flex items-center gap-1 p-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)]">
        {['B', 'I', 'UL', 'OL', 'H2', 'QUOTE'].map((btn) => (
          <button key={btn} className="w-8 h-8 rounded text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition">
            {btn}
          </button>
        ))}
      </div>
      <textarea
        className="w-full p-3 bg-transparent text-[var(--text-primary)] text-sm focus:outline-none resize-none"
        rows={8}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your proposal..."
      />
    </div>
  );
}
