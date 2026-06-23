'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const FILTER_OPTIONS = ['All', 'Stream Credit', 'NFT Sale', 'Tip', 'Payout Debit', 'Adjustment'];

export default function LedgerPage() {
  const [filter, setFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: entries } = useQuery({
    queryKey: ['/api/studio/earnings/ledger'],
    queryFn: () => fetch('/api/studio/earnings/ledger').then(r => r.json()),
  });

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Royalty Ledger</h1>
        <button className="btn-secondary"><Download size={16} /> Export CSV</button>
      </div>

      <div className="card mb-6 bg-[var(--warning)]/10 border-[var(--warning)]/30">
        <p className="text-sm text-[var(--warning)]">⚠️ This is a legal audit trail — display only. No editing or deletion is permitted.</p>
      </div>

      <div className="flex gap-3 mb-4">
        {FILTER_OPTIONS.map((opt) => (
          <button key={opt} onClick={() => setFilter(opt)} className={`px-3 py-1.5 rounded-full text-sm transition ${filter === opt ? 'bg-[var(--accent-purple)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>
            {opt}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <input type="date" className="input w-auto" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="input w-auto" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[var(--border-subtle)]"><th className="text-left py-2 text-[var(--text-tertiary)]">Date</th><th className="text-left py-2 text-[var(--text-tertiary)]">Event Type</th><th className="text-left py-2 text-[var(--text-tertiary)]">Track</th><th className="text-right py-2 text-[var(--text-tertiary)]">Amount</th><th className="text-left py-2 text-[var(--text-tertiary)]">Description</th></tr></thead>
          <tbody>
            {entries?.length ? entries.map((entry: any) => (
              <tr key={entry.id} className="border-b border-[var(--border-subtle)]">
                <td className="py-2">{new Date(entry.created_at).toLocaleDateString()}</td>
                <td className="py-2"><span className="capitalize">{entry.ledger_type}</span></td>
                <td className="py-2">{entry.track_id}</td>
                <td className="py-2 text-right">${(entry.amount_cents / 100).toFixed(2)}</td>
                <td className="py-2 text-[var(--text-secondary)]">{entry.description}</td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-8 text-center text-[var(--text-tertiary)]">No entries found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
