'use client';

import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
           <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
                href="/analysis"
                className="transition-colors hover:text-primary text-foreground/80"
            >
                Analysis
            </Link>
            <Link
                href="/features"
                className="transition-colors hover:text-primary text-foreground/80"
            >
                Features
            </Link>
        </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          <Button asChild>
            <Link href="/analysis">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
