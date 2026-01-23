import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  title: {
    default: 'ReCreative AI: AI-Powered Text Analysis & Insights',
    template: '%s | ReCreative AI',
  },
  description: 'Unlock actionable insights from text data. ReCreative AI provides AI-powered summarization, sentiment analysis, topic extraction, and keyword density for researchers and professionals.',
  keywords: ['AI text analysis', 'sentiment analysis', 'text summarization', 'natural language processing', 'NLP', 'data analysis', 'customer feedback analysis', 'market research', 'topic extraction', 'keyword density', 'ReCreative AI', 'AI for researchers'],
  authors: [{ name: 'ReCreative AI Team', url: '/about' }],
  creator: 'ReCreative AI Team',
  applicationName: 'ReCreative AI',
  openGraph: {
    type: 'website',
    title: 'ReCreative AI: AI-Powered Text Analysis & Insights',
    description: 'Unlock actionable insights from text data with AI. Summarization, sentiment analysis, topic extraction, and more.',
    siteName: 'ReCreative AI',
  },
  twitter: {
    card: 'summary',
    title: 'ReCreative AI: AI-Powered Text Analysis',
    description: 'Transform text into insights. AI-powered analysis for summarization, sentiment, and topics.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
