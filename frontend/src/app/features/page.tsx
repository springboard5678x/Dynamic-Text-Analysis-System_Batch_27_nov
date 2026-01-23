'use client';

import { BarChart, FileText, Bot, UploadCloud, Smile, Tags, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: <UploadCloud className="w-10 h-10 text-primary" />,
    title: 'Versatile Data Input',
    description: 'Easily upload your text data in multiple formats, including .txt, .csv, and .docx, or simply paste it directly into the platform.',
  },
  {
    icon: <FileText className="w-10 h-10 text-primary" />,
    title: 'Automated Summarization',
    description: 'My AI condenses large bodies of text into concise, coherent summaries, capturing the core ideas and main points instantly.',
  },
  {
    icon: <Smile className="w-10 h-10 text-primary" />,
    title: 'In-Depth Sentiment Analysis',
    description: 'Gauge the emotional tone of your text. MY platform classifies sentiment as positive, negative, or neutral for each identified topic.',
  },
  {
    icon: <Tags className="w-10 h-10 text-primary" />,
    title: 'Key Topic Extraction',
    description: 'Automatically identify and extract the most relevant topics and themes being discussed in your documents.',
  },
  {
    icon: <Lightbulb className="w-10 h-10 text-primary" />,
    title: 'Actionable Insights',
    description: 'Go beyond data. My platform provides actionable recommendations and insights based on the analysis to drive better decisions.',
  },
  {
    icon: <BarChart className="w-10 h-10 text-primary" />,
    title: 'Interactive Visualizations',
    description: 'Explore your results through intuitive dashboards and charts, making complex data easy to understand and interact with.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-transparent text-foreground fade-in-up">
      <section className="w-full py-20 md:py-32 lg:py-40 text-center bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto animate-scroll" style={{ animationDelay: '100ms' }}>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Platform Features
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
              Discover the powerful tools ReCreative AI offers to transform your text into intelligent insights.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={index % 2 === 0 ? 'animate-slide-in-left' : 'animate-slide-in-right'} style={{ animationDelay: `${(index % 3) * 100}ms` }}>
                <Card
                  className="bg-card/60 backdrop-blur-sm border-border/50 h-full hover:border-primary/80 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30"
                >
                  <CardHeader className="flex flex-col items-center text-center p-8">
                    <div className="p-4 bg-primary/10 rounded-full mb-6 border border-primary/20 shadow-inner">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl font-headline mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center px-8 pb-8">
                    <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
