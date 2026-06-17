import React, { useEffect } from 'react';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-32">
      <div className="mx-auto max-w-4xl px-gutter">
        {/* Header Section */}
        <div className="mb-16 border-b-2 border-outline/30 pb-8">
          <div className="mb-4 flex items-center gap-4">
            <span className="text-primary-light text-xs font-mono tracking-[0.4em] uppercase">Legal / 法律</span>
            <div className="h-[1px] w-20 bg-primary/20"></div>
          </div>
          <h1 className="font-display text-5xl font-light text-primary mb-4">Terms of <span className="italic-serif">Service</span></h1>
          <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
            Website: Puyoko &nbsp;|&nbsp; Last Updated: June 17, 2026
          </div>
        </div>

        {/* Content Section */}
        <div className="prose prose-lg prose-p:text-on-surface-variant prose-headings:text-primary max-w-none font-sans">
          <p className="lead text-xl mb-8">
            Welcome to the website of <strong>PUYOKO</strong>. The Platform is owned, engineered, and operated by <strong>PUYOKO PREMIUM ESTATES</strong>.
          </p>
          
          <p className="mb-12">
            By accessing, browsing, or submitting information through this Platform, you (the "User") explicitly agree to be bound by these Terms of Service, Legal Disclosures, and Privacy Policies in accordance with the laws of the Republic of the Philippines.
          </p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">1. Statutory Declaration & Non-Brokerage Status</h2>
          
          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">1.1. Compliance with Republic Act No. 9646 (RESA Law)</h3>
          <p className="mb-6">
            The Company is a digital marketing solutions and technology infrastructure provider. The Company, its software systems, and its platform managers do not act as licensed real estate brokers, appraisers, or consultants.
          </p>

          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">1.2. Platform Operational Nature</h3>
          <p className="mb-6">
            This Platform serves strictly as an interactive web portal and strategic advertising database designed to showcase architectural beauty and heritage listings. The Platform does not engage in unlicensed real estate brokerage ("colorum" activity) as prohibited under Section 29 of Republic Act No. 9646.
          </p>

          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">1.3. Exclusive Licensed Broker Tie-Up</h3>
          <p className="mb-12">
            All properties featured, listed, or advertised on this Platform are handled exclusively through our legally binding strategic alliances with PRC-Licensed and DHSUD-Registered Real Estate Brokers. Any real estate advisory services, physical property walkthroughs, contract negotiations, financial transactions, or closings are executed solely by said licensed professionals.
          </p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">2. The "Inquiry Tracker" Data Disclosure</h2>
          
          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">2.1. Lead Routing Infrastructure</h3>
          <p className="mb-6">
            When a User fills out a form or requests information through the Platform, the data is collected and processed through our proprietary "Inquiry Tracker" backend ecosystem. By submitting your contact details, budget parameters, and location preferences, you explicitly authorize the Platform to instantly transmit this information to our accredited, licensed partner broker for transactional processing.
          </p>

          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">2.2. Compliance with R.A. No. 10173 (Data Privacy Act of 2012)</h3>
          <p className="mb-12">
            The Company values your data privacy. All information routed into the Inquiry Tracker is processed with strict server-side validation and security protocols. The Company handles this data solely for marketing optimization and lead delivery to the designated licensed real estate professional, and will never sell your information to unvetted third parties.
          </p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">3. Limitation of Liability & Listing Disclaimers</h2>
          
          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">3.1. Promotional Material Only</h3>
          <p className="mb-6">
            All text, image layouts, videos, high-production renderings, and descriptions published on this Platform are for strategic advertising and promotional purposes only. They do not constitute a formal, binding contract to sell or an endorsement of property titles.
          </p>

          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">3.2. Verification of Inventory</h3>
          <p className="mb-12">
            While Puyoko strives for 100% database accuracy, the physical state, availability, pricing structures, and legal title conditions of featured assets are subject to change without prior notice. The final verification of all land titles, building permits, and contractual clauses remains the sole responsibility of the buyer and the dealing Licensed Broker. The Company shall not be held liable for any transactional disputes, property defects, or legal title issues between buyers and developers.
          </p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">4. Prohibition of Direct Revenue and Commissions</h2>
          <p className="mb-12">
            Pursuant to Section 31 of R.A. No. 9646, the collection of real estate transaction commissions by unlicensed entities is strictly prohibited. The Platform does not demand, collect, or split brokerage commissions. All revenue generated by the Company represents independent, standard service fees invoiced for digital marketing solutions, content creation, and software infrastructure delivery.
          </p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">5. Electronic Commerce Act Compliance</h2>
          <p className="mb-12">
            In accordance with Republic Act No. 8792 (The Electronic Commerce Act), any digital clicks, checkbox agreements, or electronic submissions made by the User on this Platform hold the same legal weight and enforceability as handwritten signatures, signifying full acknowledgment of these terms.
          </p>
          
          <p className="font-semibold text-primary/80 mt-12 border-t border-outline/20 pt-8">
            If you do not agree to these legal conditions and non-brokerage disclosures, you must immediately cease usage of this Platform.
          </p>
        </div>
      </div>
    </div>
  );
};
