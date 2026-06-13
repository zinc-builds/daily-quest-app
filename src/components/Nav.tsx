'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'TODAY' },
  { href: '/setup', label: 'SETUP' },
  { href: '/battlepass', label: 'PASS' },
  { href: '/review', label: 'REVIEW' },
  { href: '/history', label: 'LOG' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-black">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <Link href="/" className="group">
            <h1 className="text-xl font-black uppercase tracking-tighter text-white">
              <span className="text-lime">DAILY</span> QUEST
            </h1>
            <p className="text-[10px] font-mono-data text-white/40 tracking-widest">
              FIVE DAILIES // ONE MONTH // REAL REWARDS
            </p>
          </Link>

          <nav className="flex flex-wrap gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 border text-[10px] font-mono-data uppercase tracking-widest transition-all',
                  pathname === link.href
                    ? 'border-lime bg-lime text-black'
                    : 'border-white/20 text-white/60 hover:border-white hover:text-white'
                )}
              >
                [ {link.label} ]
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
