import React, { useEffect } from 'react';

export const PrivacyPolicyPage: React.FC = () => {
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
          <h1 className="font-display text-5xl font-light text-primary mb-4">Privacy <span className="italic-serif">Policy</span></h1>
          <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
            Website: Puyoko &nbsp;|&nbsp; Last Updated: May 20, 2026
          </div>
        </div>

        {/* Content Section */}
        <div className="prose prose-lg prose-p:text-on-surface-variant prose-headings:text-primary max-w-none font-sans">
          <p className="lead text-xl mb-8">
            Welcome to <strong>Puyoko</strong>. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website, utilize our services, or interact with us.
          </p>
          
          <p className="mb-12">
            Please read this Privacy Policy carefully. By accessing or using our website, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">1. Information We Collect</h2>
          <p className="mb-6">We may collect information about you in a variety of ways depending on how you interact with Puyoko. This includes:</p>
          
          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">Personal Data</h3>
          <p className="mb-6">Personally identifiable information, such as your name, email address, shipping address, billing address, and telephone number, that you voluntarily give to us when you register on our website, place an order, subscribe to our newsletter, or contact us directly.</p>
          
          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">Derivative and Technical Data</h3>
          <p className="mb-6">Information our servers automatically collect when you access the website, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the website.</p>

          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">Financial Data</h3>
          <p className="mb-12">Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the website. Most financial transactions are securely processed by our third-party payment processors.</p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">2. Use of Your Information</h2>
          <p className="mb-6">Having accurate information about you allows us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the website to:</p>
          <ul className="list-disc pl-8 mb-12 space-y-2 text-on-surface-variant">
            <li>Create and manage your account.</li>
            <li>Process your transactions, orders, and fulfillment requests.</li>
            <li>Deliver products, services, or information you requested.</li>
            <li>Email you regarding your account, order updates, or newsletter subscriptions.</li>
            <li>Improve the performance, user interface, and overall quality of our website.</li>
            <li>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</li>
            <li>Respond to customer service requests and support needs.</li>
          </ul>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">3. Disclosure of Your Information</h2>
          <p className="mb-6">We do not sell, rent, or trade your personal data with third parties. We may share information we have collected about you in certain situations, including:</p>
          
          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">By Law or to Protect Rights</h3>
          <p className="mb-6">If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</p>

          <h3 className="font-display text-2xl font-semibold mt-8 mb-4">Third-Party Service Providers</h3>
          <p className="mb-12">We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">4. Tracking Technologies and Cookies</h2>
          <p className="mb-12">We may use cookies, web beacons, tracking pixels, and other tracking technologies on the website to help customize the website and improve your experience. Most browsers are set to accept cookies by default. You can remove or reject cookies through your browser settings, but please be aware that such action could affect the availability and functionality of our website.</p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">5. Data Security</h2>
          <p className="mb-12">We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">6. Your Privacy Rights</h2>
          <p className="mb-12">Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, delete, or limit the use of your personal data. To exercise any of these rights, please contact us using the information provided below.</p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">7. Policy for Children</h2>
          <p className="mb-12">We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us immediately so we can remove the data from our records.</p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">8. Updates to This Policy</h2>
          <p className="mb-12">We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. The "Last Updated" date at the top of this document will reflect the date of the most recent modifications. We encourage you to review this policy periodically to stay informed.</p>

          <h2 className="font-display text-3xl font-bold mt-12 mb-6 border-l-4 border-primary pl-4">9. Contact Us</h2>
          <p className="mb-6">If you have questions or comments about this Privacy Policy, please reach out to us at:</p>
          
          <div className="bg-surface-muted border border-outline/30 rounded-lg p-8 mt-8 inline-block shadow-sm">
            <strong className="block mb-4 font-display text-xl text-primary">Puyoko Support Team</strong>
            <div className="space-y-2 font-mono text-sm">
              <p><span className="text-on-surface-variant uppercase tracking-widest text-[10px]">Email:</span> <a href="mailto:puyokooffcl@gmail.com" className="text-primary hover:underline">puyokooffcl@gmail.com</a></p>
              <p><span className="text-on-surface-variant uppercase tracking-widest text-[10px]">Website:</span> <a href="/" className="text-primary hover:underline">www.puyoko.com</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
