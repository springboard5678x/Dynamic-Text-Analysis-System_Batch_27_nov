
import { User, Target, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BrainBackground from '@/components/phoenix-background';

export default function AboutPage() {
  return (
    <div className="bg-transparent text-foreground fade-in-up">
      <section className="relative w-full py-20 md:py-32 lg:py-40 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full">
          <BrainBackground />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="container relative px-4 md:px-6">
          <div className="max-w-3xl mx-auto animate-scroll" style={{ animationDelay: '100ms' }}>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              About ReCreative AI
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
              This project was brought to life by Debraj Mistry, a passionate innovator, AI Engineer and developer. It was developed as part of the Infosys Springboard internship program, under the invaluable mentorship of Surbhi ma'am.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-slide-in-left">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30">
                <CardHeader>
                  <div className="mx-auto p-4 bg-primary/10 rounded-full mb-6 border border-primary/20 shadow-inner w-fit">
                    <Eye className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-headline">My Vision</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">To build a world where technology doesn't just process information, but truly understands and enriches human communication.</p>
                </CardContent>
              </Card>
            </div>
            <div className="animate-fade-in-up">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30">
                <CardHeader>
                  <div className="mx-auto p-4 bg-primary/10 rounded-full mb-6 border border-primary/20 shadow-inner w-fit">
                    <Target className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-headline">My Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">To empower individuals and organizations with intuitive AI tools that transform raw text into clear, actionable, and meaningful insights.</p>
                </CardContent>
              </Card>
            </div>
            <div className="animate-slide-in-right">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30">
                <CardHeader>
                  <div className="mx-auto p-4 bg-primary/10 rounded-full mb-6 border border-primary/20 shadow-inner w-fit">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-headline">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">I am a developer and AI enthusiast, driven by a curiosity for language, data, and building impactful technology.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
