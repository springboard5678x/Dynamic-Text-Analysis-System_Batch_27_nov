
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-primary/20">
      <div className="container px-4 py-12 mx-auto md:px-6">
        <div className="grid gap-8 sm:grid-cols-12">
          <div className="sm:col-span-12 lg:col-span-4 space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-powered text analysis for actionable insights. Created by Debraj Mistry.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <Link href="https://github.com/DMHACKERZ" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://www.linkedin.com/in/debraj-mistry/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div className="sm:col-span-6 lg:col-span-2 grid gap-2 text-sm">
            <h3 className="font-semibold text-foreground">Platform</h3>
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              Home
            </Link>
            <Link href="/analysis" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              Analysis
            </Link>
            <Link href="/features" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              Features
            </Link>
          </div>
          <div className="sm:col-span-6 lg:col-span-2 grid gap-2 text-sm">
            <h3 className="font-semibold text-foreground">Company</h3>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              About
            </Link>
            <Link href="/careers" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              Collaborate
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              Contact
            </Link>
          </div>
          <div className="sm:col-span-6 lg:col-span-2 grid gap-2 text-sm">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
              Privacy Policy
            </Link>
          </div>
          <div className="sm:col-span-6 lg:col-span-2 grid gap-2 text-sm">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <a href="mailto:debrajmistryofficial@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">debrajmistryofficial@gmail.com</a>
          </div>
        </div>
        <div className="mt-8 border-t border-primary/20 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Debraj Mistry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
