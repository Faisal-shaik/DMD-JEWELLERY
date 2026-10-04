import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-gold-400/20 pb-6 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gold-gradient uppercase">TERMS & CONDITIONS</h1>
        <p className="text-xs text-gray-400 mt-2 font-mono">Last Updated: October 2026</p>
      </div>

      <div className="bg-dark-800 p-8 rounded-3xl border border-gold-400/20 text-gray-300 text-sm leading-relaxed space-y-6">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">1. Catalogue & Pricing Disclaimer</h2>
          <p>
            DMD JEWELLERY operates a digital catalogue to display our jewellery designs. Products, prices, gold rates, and purity values listed on the website are subject to daily market gold rate fluctuations and physical store availability. Final prices and weights will be confirmed at our showroom.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">2. No Online Checkout</h2>
          <p>
            This website is an informational catalogue and enquiry platform. We do not process direct online financial transactions or online checkouts. All purchases, payments, and product handovers take place in person at our authorized showroom or via verified store representative contact.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">3. Intellectual Property</h2>
          <p>
            All brand assets, logos, design images, and content displayed on this website belong exclusively to DMD JEWELLERY. Unauthorized reproduction or commercial misuse is strictly prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-bold text-gold-300">4. Governed Laws</h2>
          <p>
            These terms are governed in accordance with the laws of India. Any disputes arising out of the use of this website shall be subject to the jurisdiction of local courts.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
