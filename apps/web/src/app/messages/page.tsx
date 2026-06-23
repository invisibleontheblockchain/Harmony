'use client';
import EmptyState from '@/components/ui/EmptyState';

export default function ThreadPage({ params }: { params: { threadId: string } }) {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Message Thread</h1>
      <div className="space-y-3">
        {[{ from: 'them', text: 'Hey!' }, { from: 'me', text: 'Hi, what\'s up?' }].map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`card max-w-[70%] ${m.from === 'me' ? 'bg-[var(--accent-purple)]/20' : ''}`}>
              <p className="text-sm">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="input flex-1" placeholder="Type a message..." />
        <button className="btn-primary">Send</button>
      </div>
    </div>
  );
}
