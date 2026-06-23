import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface ProposalCardProps {
  proposal: {
    id: string;
    title: string;
    description: string;
    category?: string;
    voting_ends_at: string;
    status: string;
    proposer_name: string;
    votes_for?: number;
    votes_against?: number;
    votes_abstain?: number;
  };
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
  const total = (proposal.votes_for || 0) + (proposal.votes_against || 0) + (proposal.votes_abstain || 0);
  const forPct = total ? Math.round((proposal.votes_for || 0) / total * 100) : 0;

  return (
    <Link href={`/dao/${proposal.id}`}>
      <div className="card hover:border-[var(--border-accent)] transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold">{proposal.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">{proposal.description}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">by {proposal.proposer_name} • {proposal.category || 'General'} • ends {new Date(proposal.voting_ends_at).toLocaleDateString()}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${proposal.status === 'active' ? 'bg-[var(--success)]/10 text-[var(--success)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>
            {proposal.status}
          </span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[var(--success)]">For {forPct}%</span>
            <span className="text-[var(--text-tertiary)]">{total} votes</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)]">
            <div className="h-1.5 rounded-full bg-[var(--success)]" style={{ width: `${forPct}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
