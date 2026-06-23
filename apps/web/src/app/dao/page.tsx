'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import ProposalCard from '@/components/dao/ProposalCard';

export default function DAOPage() {
  const [filter, setFilter] = useState('all');
  const { data: proposals } = useQuery({
    queryKey: ['/api/dao/proposals', filter],
    queryFn: () => fetch(`/api/dao/proposals?status=${filter}`).then(r => r.json()),
  });

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Harmony DAO</h1>
      <div className="flex gap-2 mb-6 border-b border-[var(--border-subtle)] pb-2">
        {['Active', 'Passed', 'Failed', 'All'].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab.toLowerCase())} className={`px-4 py-2 text-sm font-medium transition ${filter === tab.toLowerCase() ? 'text-[var(--accent-purple)] border-b-2 border-[var(--accent-purple)]' : 'text-[var(--text-secondary)]'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {proposals?.length ? proposals.map((p: any) => <ProposalCard key={p.id} proposal={p} />) : <EmptyState title="No proposals" description="No active proposals at this time." />}
      </div>
    </div>
  );
}
