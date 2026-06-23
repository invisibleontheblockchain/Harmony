'use client';
import { useQuery } from '@tanstack/react-query';
import { MoreVertical } from 'lucide-react';

export default function CatalogPage() {
  const tracks = [
    { id: '1', title: 'Midnight Echoes', status: 'Live', streams: 4520, earnings: 320 },
    { id: '2', title: 'Neon Drift', status: 'Draft', streams: 0, earnings: 0 },
    { id: '3', title: 'Crystal Caves', status: 'Live', streams: 2100, earnings: 150 },
  ];

  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Catalog</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Cover</th>
              <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Title</th>
              <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Streams</th>
              <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Earnings</th>
              <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">Status</th>
              <th className="text-left py-2 px-3 text-[var(--text-tertiary)] font-medium">NFT</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {tracks.map((t) => (
              <tr key={t.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                <td className="py-3 px-3"><div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-tertiary)]" /></td>
                <td className="py-3 px-3 font-medium">{t.title}</td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">{t.streams.toLocaleString()}</td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">${t.earnings}</td>
                <td className="py-3 px-3"><span className="px-2 py-1 rounded-full text-xs bg-[var(--success)]/10 text-[var(--success)]">{t.status}</span></td>
                <td className="py-3 px-3 text-[var(--text-secondary)]">—</td>
                <td className="py-3 px-3"><button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><MoreVertical size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
