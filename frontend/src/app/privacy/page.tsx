
'use client';

import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
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
              Privacy Policy
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
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">1. Introduction</h2>
            <p className="leading-relaxed">
              Welcome to ReCreative AI ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">2. Information We Collect</h2>
            <p className="leading-relaxed">
              We may collect information about you in a variety of ways. The information we may collect on the Service includes:
            </p>
            <div className="pl-4 space-y-4">
                <h3 className="text-2xl font-bold tracking-tighter font-headline text-foreground">Personal Data</h3>
                <p className="leading-relaxed">
                    While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to, your email address, name, and usage data.
                </p>
                <h3 className="text-2xl font-bold tracking-tighter font-headline text-foreground">Usage Data</h3>
                <p className="leading-relaxed">
                    We may also collect information that your browser sends whenever you visit our Service or when you access the Service by or through a mobile device ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers, and other diagnostic data.
                </p>
                <h3 className="text-2xl font-bold tracking-tighter font-headline text-foreground">Text and File Data</h3>
                <p className="leading-relaxed">
                    When you use our analysis tools, you may provide us with text or files. We process this data to provide you with our services. We treat this data as confidential and do not store it permanently on our servers after the analysis is complete, unless you explicitly save it to an account.
                </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">3. How We Use Your Information</h2>
            <p className="leading-relaxed">
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Create and manage your account.</li>
              <li>Provide and maintain our Service.</li>
              <li>Notify you about changes to our Service.</li>
              <li>Monitor the usage of our Service to improve user experience.</li>
              <li>Detect, prevent and address technical issues.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">4. Security of Your Information</h2>
            <p className="leading-relaxed">
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">5. Changes to This Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter font-headline text-foreground">6. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please <a href="/contact" className="text-primary underline hover:text-primary/80">contact us</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
