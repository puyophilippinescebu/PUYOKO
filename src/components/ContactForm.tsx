import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';
import { supabase } from '../lib/supabaseClient';

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
  const location = useLocation();
  const { properties } = useProperties();
  const searchParams = new URLSearchParams(location.search);
  const propertyId = searchParams.get('propertyId') || (location.state as any)?.propertyId || '';
  const initialInquiryType = searchParams.get('inquiryType') || (location.state as any)?.inquiryType || 'General Inquiry';

  const [formData, setFormData] = useState({
    inquireAs: 'Interested Buyer',
    inquiryType: initialInquiryType,
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    countryCode: 'ph',
    phone: '',
    message: '',
    agreePrivacy: false,
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [hasSetInitialMessage, setHasSetInitialMessage] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId);

  useEffect(() => {
    if (selectedPropertyId && properties.length > 0 && !hasSetInitialMessage) {
      const property = properties.find(p => p.id === selectedPropertyId);
      if (property) {
        let msg = '';
        if (initialInquiryType === 'Property Viewing') {
          msg = `Hi, I would like to schedule a viewing for "${property.title}" (ID: ${property.id}) located in ${property.address}, ${property.city}. Please let me know when we can arrange a visit.`;
        } else if (initialInquiryType === 'Pricing Details') {
          msg = `Hi, I am interested in "${property.title}" (ID: ${property.id}) and would like to receive pricing and availability details.`;
        } else {
          msg = `Hi, I am interested in your property: "${property.title}" (ID: ${property.id}). Please contact me with more information.`;
        }
        setFormData(prev => ({
          ...prev,
          message: msg,
          inquiryType: initialInquiryType,
        }));
        setHasSetInitialMessage(true);
      }
    }
  }, [properties, selectedPropertyId, initialInquiryType, hasSetInitialMessage]);

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const selectedCountry = COUNTRIES.find(c => c.code === formData.countryCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreePrivacy) {
      alert('Please agree to the privacy policy.');
      return;
    }

    setStatus('loading');

    try {
      const payload: any = {
        access_key: WEB3FORMS_KEY,
        subject: selectedProperty
          ? `Property Inquiry from ${formData.firstName} ${formData.lastName} — ${selectedProperty.title} (${selectedProperty.id})`
          : `New Inquiry from ${formData.firstName} ${formData.lastName} — ${formData.inquiryType}`,
        from_name: 'PUYOKO Website',
        'Inquire As': formData.inquireAs,
        'Inquiry Type': formData.inquiryType,
        Name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
        Email: formData.email,
        Phone: `${selectedCountry?.dial ?? ''} ${formData.phone}`,
        Message: formData.message || '(No message provided)',
      };

      if (selectedProperty) {
        payload['Property ID'] = selectedProperty.id;
        payload['Property Title'] = selectedProperty.title;
        payload['Property Price'] = new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: selectedProperty.currency || 'PHP',
          maximumFractionDigits: 0
        }).format(selectedProperty.price);
        payload['Property Address'] = `${selectedProperty.address}, ${selectedProperty.city}`;
      }

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        // Save to Supabase inquiries table
        try {
          const inquiryId = `INQ-${Math.floor(Math.random() * 90000) + 10000}`;
          const dbPayload = {
            id: inquiryId,
            name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
            email: formData.email,
            phone: `${selectedCountry?.dial ?? ''} ${formData.phone}`,
            message: formData.message || '(No message provided)',
            property_title: selectedProperty?.title || null,
            property_price: selectedProperty ? new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: selectedProperty.currency || 'PHP',
              maximumFractionDigits: 0
            }).format(selectedProperty.price) : null,
            property_address: selectedProperty ? `${selectedProperty.address}, ${selectedProperty.city}` : null,
            form_type: 'Contact Inquiry',
            status: 'New'
          };
          console.log("Inserting contact inquiry into Supabase...");
          const { error: dbError } = await supabase
            .from('inquiries')
            .insert([dbPayload]);
          
          if (dbError) {
            console.error("Supabase inquiries insertion failed:", dbError);
          } else {
            console.log("Successfully inserted contact inquiry into Supabase!");
          }
        } catch (dbErr) {
          console.error("Error preparing/inserting inquiry to Supabase:", dbErr);
        }

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

      {selectedProperty && (
        <div className="mb-8 p-4 rounded-2xl bg-surface-muted border border-outline/30 flex flex-col sm:flex-row gap-4 items-center animate-fade-in relative shadow-sm hover:shadow-md transition-shadow">
          <button
            type="button"
            onClick={() => {
              setSelectedPropertyId('');
              setFormData(prev => ({ ...prev, message: '' }));
            }}
            className="absolute top-3 right-3 text-on-surface-variant/60 hover:text-on-surface transition-colors p-1.5 rounded-full hover:bg-outline-variant/30 active:scale-90"
            title="Clear selected property"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="w-full sm:w-32 h-20 rounded-xl overflow-hidden bg-black/10 shrink-0">
            {selectedProperty.images && selectedProperty.images[0] ? (
              selectedProperty.images[0].startsWith('data:video/') || 
              selectedProperty.images[0].endsWith('.mp4') || 
              selectedProperty.images[0].endsWith('.mov') || 
              selectedProperty.images[0].endsWith('.webm') ? (
                <video src={selectedProperty.images[0]} className="w-full h-full object-cover" muted playsInline />
              ) : (
                <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold font-mono">
                NO IMAGE
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left pr-6">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full select-none font-display">
              Inquiring about
            </span>
            <h3 className="font-serif text-base font-bold text-on-surface mt-1 leading-tight">
              {selectedProperty.title}
            </h3>
            <p className="font-mono text-[10px] text-on-surface-variant/70 mt-0.5 animate-pulse">
              ID: {selectedProperty.id} • {selectedProperty.city}, {selectedProperty.address}
            </p>
          </div>
          <div className="sm:text-right shrink-0">
            <p className="font-display text-base font-extrabold text-on-surface">
              {new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: selectedProperty.currency || 'PHP',
                maximumFractionDigits: 0,
              }).format(selectedProperty.price)}
            </p>
            {selectedProperty.type === 'For Rent' && (
              <span className="text-[10px] text-on-surface-variant/70 lowercase block mt-0.5">
                / {selectedProperty.pricePeriod || 'mo'}
              </span>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label htmlFor="privacy" className="ml-3 text-[11px] text-on-surface-variant/80 leading-relaxed cursor-pointer select-none">
              By submitting this form, I certify that I have read and accept the <Link to="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</Link> and authorize Puyoko, its representatives to use and process my personal information to contact me.
            </label>
          </div>

          <div className="flex-shrink-0 self-end md:self-auto flex flex-col items-end">
            {(() => {
              const isComplete = formData.firstName && formData.lastName && formData.email && formData.phone && formData.agreePrivacy;
              const buttonClass = isComplete 
                ? "flex items-center gap-2 bg-primary hover:bg-primary-light disabled:opacity-60 text-white px-10 py-3.5 rounded-full font-sans text-sm font-semibold tracking-wide transition-colors shadow-sm cursor-pointer" 
                : "flex items-center gap-2 bg-gray-400 hover:bg-gray-500 disabled:opacity-60 text-white px-10 py-3.5 rounded-full font-sans text-sm font-semibold tracking-wide transition-colors shadow-sm cursor-not-allowed";
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
