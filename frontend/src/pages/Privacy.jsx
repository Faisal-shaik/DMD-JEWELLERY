import React from 'react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-gold-400/20 pb-6 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient uppercase">PRIVACY POLICY</h1>
        <p className="text-xs text-gray-400 mt-2 font-mono">Last Updated: October 2026</p>
      </div>

      <div className="bg-dark-800 p-8 rounded-3xl border border-gold-400/20 text-gray-300 text-sm leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">1. Information Collection</h2>
          <p>
            DMD JEWELLERY respects your privacy. We collect personal information (such as your full name, phone number, and email address) only when voluntarily submitted by you through our customer enquiry forms or direct contact channels (Phone, WhatsApp, Email).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">2. Use of Collected Data</h2>
          <p>
            The information collected is strictly used for responding to your jewellery inquiries, scheduling store visits, sharing product specifications, and providing customer support. We do not sell, rent, or trade your personal data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">3. Third-Party Integrations</h2>
          <p>
            Our website integrates third-party services such as WhatsApp (for direct chat) and Google Maps (for store location directions). Clicking these links navigates you to external services governed by their respective privacy policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">4. Data Security & Storage</h2>
          <p>
            Enquiry data submitted on our website is stored securely in our database. We employ administrative, technical, and physical safeguards to prevent unauthorized access, alteration, or disclosure of customer information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">5. Contact Us</h2>
          <p>
            If you have questions regarding our Privacy Policy or data handling, please contact our showroom via our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
