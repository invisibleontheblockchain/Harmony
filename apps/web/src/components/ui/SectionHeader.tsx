import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  href?: string;
}

export default function SectionHeader({ title, href }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-[var(--accent-purple)] hover:underline flex items-center gap-1">
          See all <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
