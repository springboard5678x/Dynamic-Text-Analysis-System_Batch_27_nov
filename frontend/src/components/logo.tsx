import { BrainCircuit } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <span className="font-headline text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary/90 via-primary to-cyan-400">
        ReCreative AI
      </span>
    </div>
  );
}
