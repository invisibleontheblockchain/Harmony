'use client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export default function DAOProposalPage({ params }: { params: { proposalId: string } }) {
  const { data } = useQuery({
    queryKey: ['/api/dao/proposals', params.proposalId],
    queryFn: () => fetch(`/api/dao/proposals/${params.proposalId}`).then(r => r.json()),
  });
  const [vote, setVote] = useState<string | null>(null);

  if (!data?.proposal) return <div className="px-6 py-8 text-[var(--text-secondary)]">Proposal not found.</div>;

  const { proposal, votes } = data;
  const total = votes?.reduce((acc: number, v: any) => acc + Number(v.total_power || v.vote_count || 0), 0) || 0;

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Proposed by {proposal.proposer_name} • Ends {new Date(proposal.voting_ends_at).toLocaleDateString()}</p>

      <div className="card mb-6">
        <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{proposal.description}</p>
      </div>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4">Vote</h2>
        <div className="flex gap-3 mb-6">
          {['for', 'against', 'abstain'].map((choice) => (
            <button key={choice} onClick={() => setVote(choice)} className={`flex-1 py-3 rounded-[var(--radius-md)] border transition capitalize ${vote === choice ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/20' : 'border-[var(--border-default)] hover:border-[var(--border-accent)]'}`}>
              {choice}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {['for', 'against', 'abstain'].map((c) => {
            const voteData = votes?.find((v: any) => v.choice === c);
            const count = voteData?.vote_count || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            const color = c === 'for' ? 'bg-[var(--success)]' : c === 'against' ? 'bg-[var(--error)]' : 'bg-[var(--text-tertiary)]';
            return (
              <div key={c}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{c}</span>
                  <span className="text-[var(--text-secondary)]">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-tertiary)]">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-3">{total} total votes • Quorum: {proposal.quorum}</p>
      </div>

      <button className="btn-primary">Cast Vote</button>
    </div>
  );
}
