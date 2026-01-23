
'use client';

import { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="bg-transparent text-foreground fade-in-up">
      <section className="w-full py-20 md:py-32 text-center bg-secondary/20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto animate-scroll" style={{animationDelay: '100ms'}}>
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Terms of Service
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24">
        <div className="container max-w-4xl mx-auto px-4 md:px-6 space-y-8 text-muted-foreground">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using ReCreative AI (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">2. Description of Service</h2>
            <p className="leading-relaxed">
              Our service provides AI-powered text analysis, including summarization, sentiment analysis, and topic extraction. The Service is provided "as is" and we assume no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings. You are responsible for obtaining access to the Service, and that access may involve third-party fees (such as Internet service provider or airtime charges).
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">3. User Conduct</h2>
            <p className="leading-relaxed">
              You agree not to use the Service to upload, post, email, transmit, or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable. You acknowledge that we are not responsible for the content you provide and that we have the right, but not the obligation, to pre-screen, refuse, or remove any content that is available via the Service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">4. Intellectual Property</h2>
            <p className="leading-relaxed">
              You acknowledge and agree that the Service and any necessary software used in connection with the Service ("Software") contain proprietary and confidential information that is protected by applicable intellectual property and other laws. You further acknowledge and agree that you will not modify, rent, lease, loan, sell, distribute, or create derivative works based on the Service or the Software, in whole or in part.
            </p>
          </div>
          
           <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">5. Disclaimer of Warranties</h2>
            <p className="leading-relaxed">
              YOU EXPRESSLY UNDERSTAND AND AGREE THAT: YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK. THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. RECREATIVE AI AND ITS SUBSIDIARIES, AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, PARTNERS AND LICENSORS EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
            </p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">6. Limitation of Liability</h2>
            <p className="leading-relaxed">
              YOU EXPRESSLY UNDERSTAND AND AGREE THAT RECREATIVE AI AND ITS SUBSIDIARIES, AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, PARTNERS AND LICENSORS SHALL NOT BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY DAMAGES, INCLUDING, BUT NOT LIMITED TO, DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA OR OTHER INTANGIBLE LOSSES (EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM THE USE OR THE INABILITY TO USE THE SERVICE.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">7. Changes to the Terms</h2>
            <p className="leading-relaxed">
             We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review this page periodically. Your continued use of the Website or our service after any such change constitutes your acceptance of the new Terms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
