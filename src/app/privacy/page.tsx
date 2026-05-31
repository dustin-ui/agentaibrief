import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'AgentAIBrief privacy policy — how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#888] mb-8">Last updated: February 9, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-[#555] text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">1. Who We Are</h2>
            <p>AgentAIBrief.com (&quot;AgentAIBrief,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is operated by Dustin Fox / Fox Homes Team, located in Fairfax, Virginia. You can reach us at <a href="mailto:dustin@foxhomesteam.com" className="text-[#e85d26] hover:underline">dustin@foxhomesteam.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">2. Information We Collect</h2>
            <p><strong>Account &amp; Subscription Data:</strong> When you subscribe or create an account, we collect your email address, name (if provided), and subscription preferences.</p>
            <p><strong>Payment Information:</strong> If you purchase a paid plan, payment is processed securely by Stripe. We do not store your full credit card number. Stripe may collect billing details in accordance with their own privacy policy.</p>
            <p><strong>Usage Data:</strong> We may collect anonymous analytics such as pages visited, time on site, and device type to improve our service.</p>
            <p><strong>Cookies:</strong> We use essential cookies for authentication and may use analytics cookies (e.g., Google Analytics) to understand site usage.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To deliver our daily/weekly AI briefing emails via Constant Contact</li>
              <li>To process payments and manage your subscription</li>
              <li>To personalize content and email frequency based on your preferences</li>
              <li>To send transactional emails (welcome, receipts, account changes)</li>
              <li>To improve our website and service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services that may process your data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Constant Contact</strong> — email delivery and list management</li>
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Vercel</strong> — website hosting and analytics</li>
            </ul>
            <p>Each service has its own privacy policy governing its use of your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">5. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information to third parties. We share data only with the service providers listed above, solely to operate AgentAIBrief.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">6. Data Retention</h2>
            <p>We retain your data for as long as your account is active or as needed to provide our services. You may request deletion at any time by emailing us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">7. Your Rights</h2>
            <p>You may at any time:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Unsubscribe from emails using the link in any email</li>
              <li>Request a copy of your data</li>
              <li>Request deletion of your data</li>
              <li>Update your email preferences</li>
            </ul>
            <p>Contact us at <a href="mailto:dustin@foxhomesteam.com" className="text-[#e85d26] hover:underline">dustin@foxhomesteam.com</a> for any requests.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">8. Security</h2>
            <p>We use industry-standard security measures including HTTPS encryption, secure payment processing via Stripe, and access controls to protect your data.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">9. Children&apos;s Privacy</h2>
            <p>AgentAIBrief is not intended for individuals under 18. We do not knowingly collect data from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated date. Continued use of our service constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#2a2a2a] mt-8 mb-3">Contact</h2>
            <p>Questions? Email us at <a href="mailto:dustin@foxhomesteam.com" className="text-[#e85d26] hover:underline">dustin@foxhomesteam.com</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[#e0dcd4] text-center">
          <Link href="/" className="text-sm text-[#e85d26] hover:underline">← Back to AgentAIBrief</Link>
        </div>
      </div>
    </div>
  );
}
