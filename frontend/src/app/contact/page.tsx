
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Mail, Linkedin, Github, User } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: 'Email',
      value: 'debrajmistryofficial@gmail.com',
      href: 'mailto:debrajmistryofficial@gmail.com',
    },
    {
      icon: <Linkedin className="w-6 h-6 text-primary" />,
      title: 'LinkedIn',
      value: 'in/debraj-mistry',
      href: 'https://www.linkedin.com/in/debraj-mistry/',
    },
    {
      icon: <Github className="w-6 h-6 text-primary" />,
      title: 'GitHub',
      value: 'DMHACKERZ',
      href: 'https://github.com/DMHACKERZ',
    },
    {
      icon: <User className="w-6 h-6 text-primary" />,
      title: 'Portfolio',
      value: 'dm-portfolio17.vercel.app',
      href: 'https://dm-portfolio17.vercel.app/',
    },
  ];

  return (
    <div className="bg-transparent text-foreground fade-in-up">
      <section className="w-full py-20 md:py-32 text-center bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto animate-scroll" style={{ animationDelay: '100ms' }}>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Get in Touch
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
              I'd love to hear from you. Whether you have a question, a project idea, or just want to connect, feel free to reach out.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container max-w-3xl mx-auto">
          <div className="animate-fade-in-up">
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold tracking-tighter font-headline mb-8 text-center">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {contactInfo.map((item) => (
                    <div key={item.title} className="flex items-center gap-4 group">
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20 group-hover:scale-110 group-hover:bg-primary/20 transition-transform duration-300">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <Link href={item.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          {item.value}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
