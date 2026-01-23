
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';

export default function CareersPage() {
  return (
    <div className="bg-transparent text-foreground fade-in-up">
      <section className="w-full py-20 md:py-32 lg:py-40 text-center bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto animate-scroll" style={{ animationDelay: '100ms' }}>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Collaborate With Me
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
              I'm always looking for passionate individuals to collaborate with on exciting AI projects. If you're interested in building the future of text analysis, let's connect.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 flex justify-center">
          <div className="animate-fade-in-up w-full max-w-2xl">
            <Card
              className="bg-card/60 backdrop-blur-sm border-border/50 h-full flex flex-col hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30 text-center"
            >
              <CardHeader>
                <div className="mx-auto p-4 bg-primary/10 rounded-full mb-6 border border-primary/20 shadow-inner w-fit">
                  <Users className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline mb-2">Become a Collaborator</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">
                  Have an idea for a new feature? Want to contribute to the codebase? Or perhaps explore a new application for this technology?
                  Check out my portfolio to see my work and let's start a conversation.
                </p>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button asChild className="w-full group">
                  <Link href="https://dm-portfolio17.vercel.app/" target="_blank" rel="noopener noreferrer">
                    View My Portfolio <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/contact">Contact Me</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
