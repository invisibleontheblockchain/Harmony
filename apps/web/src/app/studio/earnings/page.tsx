'use client';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';

export default function EarningsPage() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Earnings Overview</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Earnings', value: '$3,240.50' },
          { label: 'Pending Payout', value: '$420.00' },
          { label: 'This Month', value: '$195.80' },
        ].map((item) => (
          <div key={item.label} className="card">
            <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
            <p className="text-3xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Revenue Breakdown</h2>
          <button className="btn-secondary"><Download size={16} /> Export CSV</button>
        </div>
        <div className="h-48 flex items-end gap-4">
          {[
            { label: 'Streaming', value: 65, color: 'bg-[var(--accent-purple)]' },
            { label: 'NFT', value: 25, color: 'bg-[var(--accent-pink)]' },
            { label: 'Subs', value: 10, color: 'bg-[var(--accent-cyan)]' },
          ].map((item) => (
            <div key={item.label} className="flex-1 flex flex-col items-center">
              <div className={`w-full rounded-t-md ${item.color}`} style={{ height: `${item.value * 2}px` }} />
              <span className="text-xs text-[var(--text-tertiary)] mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Payout History</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[var(--border-subtle)]"><th className="text-left py-2 text-[var(--text-tertiary)]">Batch ID</th><th className="text-left py-2 text-[var(--text-tertiary)]">Amount</th><th className="text-left py-2 text-[var(--text-tertiary)]">Status</th><th className="text-left py-2 text-[var(--text-tertiary)]">Date</th></tr></thead>
          <tbody>
            {[{ id: 'batch-1', amount: '$240.00', status: 'Completed', date: 'Jun 15' }, { id: 'batch-2', amount: '$180.00', status: 'Completed', date: 'Jun 8' }].map((p) => (
              <tr key={p.id} className="border-b border-[var(--border-subtle)]">
                <td className="py-2">{p.id}</td>
                <td className="py-2">{p.amount}</td>
                <td className="py-2"><span className="px-2 py-1 rounded-full text-xs bg-[var(--success)]/10 text-[var(--success)]">{p.status}</span></td>
                <td className="py-2 text-[var(--text-secondary)]">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/studio/earnings/ledger" className="btn-secondary">View Ledger</Link>
    </div>
  );
}
