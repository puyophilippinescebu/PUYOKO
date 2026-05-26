import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ContactFormProps {
  standalone?: boolean;
}

const COUNTRIES = [
  { code: 'ph', dial: '+63', name: 'Philippines' },
  { code: 'us', dial: '+1', name: 'United States' },
  { code: 'gb', dial: '+44', name: 'United Kingdom' },
  { code: 'au', dial: '+61', name: 'Australia' },
  { code: 'sg', dial: '+65', name: 'Singapore' },
  { code: 'jp', dial: '+81', name: 'Japan' },
  { code: 'ae', dial: '+971', name: 'United Arab Emirates' },
];

const WEB3FORMS_KEY = '2c966280-088b-4c06-8ce9-bd7c0aee5351';

const emptyForm = {
  inquireAs: 'Interested Buyer',
  inquiryType: 'General Inquiry',
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  countryCode: 'ph',
  phone: '',
  message: '',
  agreePrivacy: false,
};

export const ContactForm: React.FC<ContactFormProps> = ({ standalone = false }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const selectedCountry = COUNTRIES.find(c => c.code === formData.countryCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreePrivacy) {
      alert('Please agree to the privacy policy.');
      return;
    }

    setStatus('loading');

    try {
      const payload = {
        access_key: WEB3FORMS_KEY,
        subject: `New Inquiry from ${formData.firstName} ${formData.lastName} — ${formData.inquiryType}`,
        from_name: 'PUYOKO Website',
        'Inquiring As': formData.inquireAs,
        'Inquiry Type': formData.inquiryType,
        Name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
        Email: formData.email,
        Phone: `${selectedCountry?.dial ?? ''} ${formData.phone}`,
        Message: formData.message || '(No message provided)',
      };

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setFormData(emptyForm);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = "w-full border border-outline/30 bg-white/80 rounded-md px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm text-on-surface";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5";

  const content = (
    <div className="max-w-4xl mx-auto px-6 lg:px-0">
      <div className="text-center mb-12">
        <h2 className="font-serif italic text-5xl text-primary mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Contact Us
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {/* Background heritage pattern faintly behind the form if desired, but we'll keep it clean */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1 */}
          <div>
            <label className={labelClass}>I'M HERE TO INQUIRE AS A/AN</label>
            <div className="relative">
              <select
                className={inputClass + " appearance-none cursor-pointer"}
                value={formData.inquireAs}
                onChange={(e) => setFormData({ ...formData, inquireAs: e.target.value })}
              >
                <option value="" disabled>Select Option</option>
                <option>Interested Buyer</option>
                <option>Interested to Rent</option>
                <option>Homeowner</option>
                <option>Broker/Agent</option>
                <option>Proposals</option>
                <option>Applicant</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>INQUIRY TYPE</label>
            <div className="relative">
              <select
                className={inputClass + " appearance-none cursor-pointer"}
                value={formData.inquiryType}
                onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
              >
                <option>General Inquiry</option>
                <option>Property Viewing</option>
                <option>Pricing Details</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>FIRST NAME *</label>
            <input
              type="text"
              required
              placeholder="First Name"
              className={inputClass}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>MIDDLE NAME</label>
            <input
              type="text"
              placeholder="Middle Name"
              className={inputClass}
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>LAST NAME *</label>
            <input
              type="text"
              required
              placeholder="Last Name"
              className={inputClass}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>YOUR EMAIL *</label>
            <input
              type="email"
              required
              placeholder="email@example.com"
              className={inputClass}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>CONTACT NUMBER *</label>
            <div className="flex">
              <div className="relative flex-shrink-0 w-[100px] border border-r-0 border-outline/30 bg-background-warm rounded-l-md overflow-hidden">
                <select
                  className="w-full h-full appearance-none bg-transparent cursor-pointer pl-10 pr-6 outline-none text-sm font-medium text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary"
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  title="Country Code"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.dial}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <img src={`https://flagcdn.com/w20/${formData.countryCode}.png`} alt="flag" className="h-3 w-4" />
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-primary">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <input
                type="tel"
                required
                placeholder="9123456789"
                className={inputClass + " rounded-l-none"}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Row 4 */}
        <div>
          <label className={labelClass}>MESSAGE (optional)</label>
          <textarea
            rows={3}
            placeholder="Message"
            className={inputClass + " resize-none"}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>
        </div>

        {/* Row 5 - Agreement & Submit */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-8 mt-8">
          <div className="flex items-start max-w-2xl">
            <input
              type="checkbox"
              id="privacy"
              required
              className="mt-1 w-4 h-4 text-primary border-outline/40 rounded focus:ring-primary cursor-pointer flex-shrink-0"
              checked={formData.agreePrivacy}
              onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
            />
            <label htmlFor="privacy" className="ml-3 text-[11px] text-on-surface-variant/80 leading-relaxed cursor-pointer">
              By submitting this form, I certify that I have read and accept the <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> and authorize
              Puyoko, its employees, authorized representatives and third party service providers, and consent to
              the use and processing of my personal information to contact me with marketing or promotional
              information through phone call, mail, email, SMS or any type of electronic message.
            </label>
          </div>

          <div className="flex-shrink-0 self-end md:self-auto flex flex-col items-end">
            {(() => {
              const isComplete = formData.firstName && formData.lastName && formData.email && formData.phone && formData.agreePrivacy;
              const buttonClass = isComplete ? "flex items-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-60 text-white px-10 py-3.5 rounded-full font-sans text-sm font-semibold tracking-wide transition-colors shadow-sm" : "flex items-center gap-2 bg-gray-400 hover:bg-gray-500 disabled:opacity-60 text-white px-10 py-3.5 rounded-full font-sans text-sm font-semibold tracking-wide transition-colors shadow-sm";
              return (
                <button
                  type="submit"
                  disabled={!isComplete || status === 'loading'}
                  className={buttonClass}
                >
                  {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Success / Error feedback */}
        {status === 'success' && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-5 py-4 text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Your inquiry has been sent! We'll get back to you shortly.</p>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-5 py-4 text-red-600">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Something went wrong. Please try again or email us directly.</p>
          </div>
        )}


      </form>
    </div>
  );

  if (standalone) {
    return (
      <div className="pt-32 pb-24 px-gutter mx-auto max-w-container-max min-h-[80vh] flex flex-col justify-center relative z-10">
        <div className="absolute inset-0 heritage-pattern opacity-10 pointer-events-none -z-10"></div>
        {content}
      </div>
    );
  }

  return (
    <section className="py-24 px-gutter border-t border-outline/20 relative z-10">
      <div className="absolute inset-0 heritage-pattern opacity-[0.03] pointer-events-none -z-10"></div>
      <div className="mx-auto max-w-container-max">
        {content}
      </div>
    </section>
  );
};
