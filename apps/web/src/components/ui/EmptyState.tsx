import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  cta?: { label: string; href: string };
}

export default function EmptyState({ title, description, cta }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center')}>
      <p className="text-lg font-medium text-[var(--text-secondary)]">{title}</p>
      {description && <p className="text-sm text-[var(--text-tertiary)] mt-1">{description}</p>}
      {cta && (
        <Link href={cta.href} className="btn-primary mt-4">
          {cta.label}
        </Link>
      )}
    </div>
  );
}
