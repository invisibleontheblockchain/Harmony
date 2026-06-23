import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'track' | 'text' | 'card';
  className?: string;
}

export default function SkeletonLoader({ variant = 'text', className }: SkeletonLoaderProps) {
  if (variant === 'track') {
    return (
      <div className={cn('w-[140px]', className)}>
        <div className="aspect-square rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] animate-pulse mb-2" />
        <div className="h-3 rounded bg-[var(--bg-tertiary)] animate-pulse w-3/4 mb-1" />
        <div className="h-2 rounded bg-[var(--bg-tertiary)] animate-pulse w-1/2" />
      </div>
    );
  }
  if (variant === 'card') {
    return <div className={cn('card h-32 animate-pulse', className)} />;
  }
  return <div className={cn('h-4 rounded bg-[var(--bg-tertiary)] animate-pulse w-full', className)} />;
}
