import React from 'react';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import Head from 'next/head';

const TermsOfService: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Head>
        <title>Terms of Service - AllChat</title>
        <meta name="description" content="AllChat Terms of Service" />
      </Head>
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <section>
            <h1 className="text-4xl font-bold mb-6 text-primary">Terms of Service</h1>
            <p className="text-muted-foreground mb-4">
              Last Updated: January 2024
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">1. Acceptance of Terms</h2>
            <p className="text-foreground mb-4">
              By accessing or using AllChat, you agree to be bound by these Terms of Service. If you do not agree with these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">2. User Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Users must be at least 18 years old to use AllChat.</li>
              <li>You must provide accurate and current information during registration.</li>
              <li>Only one account per individual is permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">3. User Conduct</h2>
            <p className="text-foreground mb-4">
              When using AllChat, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground">
              <li>Engage in harassment, bullying, or hate speech</li>
              <li>Share explicit, offensive, or inappropriate content</li>
              <li>Impersonate other users or use fake identities</li>
              <li>Attempt to exploit or hack the platform</li>
              <li>Violate any local, state, national, or international laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">4. Privacy</h2>
            <p className="text-foreground mb-4">
              We respect your privacy. Please review our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> to understand how we collect, use, and protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">5. Intellectual Property</h2>
            <p className="text-foreground mb-4">
              All content on AllChat, including design, graphics, and software, is the property of AllChat and protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">6. Limitation of Liability</h2>
            <p className="text-foreground mb-4">
              AllChat is provided "as is" without any warranties. We are not liable for any damages, losses, or harm resulting from the use of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">7. Termination</h2>
            <p className="text-foreground mb-4">
              We reserve the right to suspend or terminate your account at our discretion, especially if you violate these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">8. Changes to Terms</h2>
            <p className="text-foreground mb-4">
              We may update these Terms of Service periodically. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-primary">9. Contact Information</h2>
            <p className="text-foreground mb-4">
              For any questions about these Terms of Service, please contact us at: 
              <a href="mailto:legal@allchat.com" className="text-primary hover:underline ml-2">
                legal@allchat.com
              </a>
            </p>
          </section>

          <section className="bg-card p-4 rounded-lg border border-border">
            <p className="text-muted-foreground text-sm">
              By using AllChat, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
