'use client';
import { useState } from 'react';
import { Send, Search } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

const THREADS = [
  { id: '1', user: 'Aurora Veil', lastMessage: 'Thanks for the support!', time: '2h ago' },
  { id: '2', user: 'Solar Flare', lastMessage: 'Let me know about the collab', time: '1d ago' },
  { id: '3', user: 'Rhythm Theory', lastMessage: 'Check out this new track', time: '3d ago' },
];

export default function MessagesPage() {
  const [activeThread, setActiveThread] = useState<string | null>(null);

  if (activeThread) {
    return (
      <div className="flex h-[calc(100vh-72px)]">
        <div className="w-[320px] border-r border-[var(--border-subtle)] hidden md:block" />
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
            <button onClick={() => setActiveThread(null)} className="text-[var(--text-secondary)]">← Back</button>
            <div className="w-8 h-8 rounded-full bg-[var(--bg-tertiary)]" />
            <span className="font-semibold">Aurora Veil</span>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {[{ from: 'them', text: 'Hey! Thanks for following.' }, { from: 'me', text: 'Love your new track!' }, { from: 'them', text: 'Thanks for the support!' }].map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`card max-w-[70%] ${m.from === 'me' ? 'bg-[var(--accent-purple)]/20' : ''}`}>
                  <p className="text-sm">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[var(--border-subtle)] flex gap-2">
            <input className="input flex-1" placeholder="Type a message..." />
            <button className="btn-primary"><Send size={18} /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
        <input className="input pl-10" placeholder="Search conversations..." />
      </div>
      <div className="card divide-y divide-[var(--border-subtle)]">
        {THREADS.map((t) => (
          <button key={t.id} onClick={() => setActiveThread(t.id)} className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-hover)] transition text-left">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-tertiary)]" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{t.user}</p>
              <p className="text-sm text-[var(--text-secondary)] truncate">{t.lastMessage}</p>
            </div>
            <span className="text-xs text-[var(--text-tertiary)]">{t.time}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
