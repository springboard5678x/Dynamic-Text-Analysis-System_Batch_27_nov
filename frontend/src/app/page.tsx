'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import World from '@/components/world';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <section className="relative w-full h-[100vh] text-center overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 -z-10 h-full w-full bg-transparent">
           <World />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        <div className="relative z-10 px-4 md:px-6 fade-in-up">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary">
              ReCreative AI
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
              Unlock the story in your data. Instantly analyze text to uncover themes, gauge sentiment, and generate actionable insights with the power of AI.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/analysis">
                  Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
