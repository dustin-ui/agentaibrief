import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'AgentAIBrief terms of service — rules and conditions for using our platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 9, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using AgentAIBrief.com (&quot;the Service&quot;), operated by Dustin Fox / Fox Homes Team, Fairfax, Virginia, you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">2. Description of Service</h2>
            <p>AgentAIBrief provides AI-curated news briefings, analysis, and tools for real estate professionals. The Service includes free and paid subscription tiers delivered via email and our website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">3. Accounts &amp; Registration</h2>
            <p>You must provide a valid email address to subscribe. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old to use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">4. Subscriptions &amp; Payments</h2>
            <p><strong>Free Tier:</strong> Access to daily briefing emails and limited website content at no cost.</p>
            <p><strong>Paid Plans (Pro, Inner Circle):</strong> Billed monthly via Stripe. Prices are listed on our subscribe page and may change with 30 days&apos; notice.</p>
            <p><strong>Cancellation:</strong> You may cancel your paid subscription at any time. Access continues through the end of the current billing period. No refunds for partial periods.</p>
            <p><strong>Promotional Codes:</strong> Discount codes are subject to terms specified at the time of the offer and may be revoked at our discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">5. Content &amp; Intellectual Property</h2>
            <p>All content on AgentAIBrief — including text, analysis, summaries, and design — is owned by AgentAIBrief or its licensors. You may share excerpts with attribution but may not republish full articles or emails without written permission.</p>
            <p>News stories linked from AgentAIBrief are the property of their respective publishers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Scrape, crawl, or automatically extract content from the Service</li>
              <li>Share paid content with non-subscribers</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Use the Service to send spam or unsolicited messages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">7. Disclaimer of Warranties</h2>
            <p>The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any content. AgentAIBrief content is for informational purposes only and does not constitute professional, legal, or financial advice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">8. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, AgentAIBrief and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">9. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the Service at any time for violation of these terms or for any other reason at our sole discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">10. Changes to Terms</h2>
            <p>We may modify these terms at any time. Material changes will be communicated via email or website notice. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">11. Governing Law</h2>
            <p>These terms are governed by the laws of the Commonwealth of Virginia. Any disputes shall be resolved in the courts of Fairfax County, Virginia.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">Contact</h2>
            <p>Questions about these terms? Email <a href="mailto:dustin@foxhomesteam.com" className="text-blue-600 hover:underline">dustin@foxhomesteam.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">← Back to AgentAIBrief</a>
        </div>
      </div>
    </div>
  );
}
