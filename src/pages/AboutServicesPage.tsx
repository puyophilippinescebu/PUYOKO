import React, { useState } from 'react';
import { Award, Paintbrush, Megaphone, ShieldCheck, Building2, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import puyokoLogo from '../../Puyoko Logo/Puyoko Animated Logo.svg';

interface ServiceItem {
  id: string;
  num: string;
  title: string;
  tagline: string;
  icon: React.ComponentType<any>;
  description: string;
  highlights: string[];
  chineseTranslation: string;
}

export const AboutServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const services: ServiceItem[] = [
    {
      id: 'brokerage',
      num: '01',
      title: 'Brokerage & Advisory',
      chineseTranslation: '房产经纪与咨询',
      tagline: 'Accredited Expertise for Discerning Transactions',
      icon: Award,
      description: 'We partner exclusively with Cebu’s most prestigious, accredited realtors to guarantee security and elite-level expertise. Whether you are acquiring a permanent estate, finding a temporary sanctuary, or listing your own property, our job is to connect you with the region\'s most coveted spaces and quality services.',
      highlights: [
        'Exclusive partnerships with verified, accredited local brokers',
        'Tailored market valuations and deep local architectural insights',
        'End-to-end legal verification and compliance assurance',
        'Comprehensive curation of premium residential sales & rentals'
      ]
    },
    {
      id: 'interior',
      num: '02',
      title: 'Interior Design & Contracting',
      chineseTranslation: '室内设计与施工',
      tagline: 'Curating Spaces of Silent Luxury',
      icon: Paintbrush,
      description: 'In partnership with local design visionaries, we craft minimalist, culturally resonant interiors. From conceptual spatial planning to interior contracting and execution, we curate environments that balance modern functionality with the organic warmth of local craftsmanship.',
      highlights: [
        'Minimalist, tropical-modern space planning and zoning',
        'Bespoke curation of Cebuano materials (rattan, local wood, stone)',
        'Experienced interior contractual execution and project management',
        'Sourcing of local artisan furniture and heritage accents'
      ]
    },
    {
      id: 'marketing',
      num: '03',
      title: 'Strategic Asset Marketing',
      chineseTranslation: '资产战略营销',
      tagline: 'Elevating Properties into Coveted Narratives',
      icon: Megaphone,
      description: 'We transform real estate assets into compelling lifestyle stories. Through professional high-production visuals, immersive digital media, and strategic target market positioning, we showcase Cebu’s premier developments to local and international connoisseurs.',
      highlights: [
        'Premium architectural photography and cinematic videography',
        'Immersive virtual tours and detailed digital walkthroughs',
        'Strategic brand positioning for high-end developments',
        'Targeted marketing to high-net-worth local and overseas buyers'
      ]
    },
    {
      id: 'maintenance',
      num: '04',
      title: 'Property Stewardship & Upkeep',
      chineseTranslation: '物业托管与维护',
      tagline: 'Preserving the Integrity of Your Investment',
      icon: ShieldCheck,
      description: 'We protect and preserve your legacy. Our comprehensive property stewardship services provide meticulous maintenance and upkeep, ensuring that every minimalist detail, landscape, and structural element remains pristine and functions flawlessly.',
      highlights: [
        'Routine preventative maintenance inspections and reporting',
        'Landscape curation and structural integrity stewardship',
        'Coordination of local contractors for repairs and technical tasks',
        'Proactive asset preservation for remote owners and investors'
      ]
    },
    {
      id: 'corporate',
      num: '05',
      title: 'Corporate Alliances',
      chineseTranslation: '企业伙伴关系',
      tagline: 'Bespoke Corporate Property Solutions',
      icon: Building2,
      description: 'We build tailored corporate partnerships to support local and multinational organizations. From executive housing and relocation assistance to commercial property acquisitions, we streamline operations with elite corporate real estate support.',
      highlights: [
        'Customized relocation packages for multinational executives',
        'Corporate housing leases and strategic asset portfolios',
        'Dedicated corporate liaison for seamless account management',
        'Preferred rates and priority support for partner entities'
      ]
    }
  ];

  const activeService = services[activeTab];
  const ActiveIcon = activeService.icon;

  return (
    <div className="pt-32 pb-24 px-gutter mx-auto max-w-container-max min-h-screen">
      {/* Intro Header */}
      <section className="mb-20 text-center max-w-3xl mx-auto">
        <div className="mb-6 flex flex-col items-center justify-center gap-3">
          <img 
            src={puyokoLogo} 
            alt="Puyoko Animated Logo" 
            className="h-32 w-auto object-contain mix-blend-multiply drop-shadow-sm transition-all duration-700 ease-in-out hover:scale-105" 
          />
          <span className="text-primary-light text-xs font-mono tracking-widest uppercase">Our Offerings / 服务</span>
        </div>
        <h1 className="font-display text-5xl font-light text-primary mb-8">
          Core <span className="italic-serif text-primary-light">Services</span>
        </h1>
        <p className="font-sans text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto">
          Puyoko Premium Estates believes that a home is more than a physical space, it's the foundation of that shapes our culture. 
          Guided by our Visayan origin "Puyo ko" ("I am staying"), we curate residential and commercial experiences that invite 
          you to dwell deeply. Our services blend Cebu’s rich local heritage and minimalist architectural design with a meticulous, 
          modern approach to housing properties.
        </p>
      </section>

      {/* Services Main Panel */}
      <section className="grid lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
        
        {/* Left Column: Sidebar "Quicklinks" Navigation */}
        <div className="lg:col-span-4 bg-white/40 backdrop-blur-md p-8 border border-outline/20 shadow-lg sticky top-28 rounded-sm">
          <div className="mb-6 pb-4 border-b border-outline/20">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-primary-light">Quicklinks</h4>
            <p className="text-[10px] text-on-surface-variant/60 font-sans tracking-wide">Explore Puyoko Ecosystem</p>
          </div>
          
          <nav className="flex flex-col gap-2">
            {services.map((service, index) => {
              const isActive = index === activeTab;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(index)}
                  className={`w-full flex items-center gap-4 text-left py-3 px-4 transition-all duration-300 rounded-sm border-l-2 ${
                    isActive 
                      ? 'bg-primary text-white border-primary-light shadow-md translate-x-1' 
                      : 'border-transparent text-on-surface-variant/70 hover:text-primary hover:bg-outline/10 hover:border-outline/40'
                  }`}
                >
                  <span className={`font-mono text-xs font-bold tracking-widest ${isActive ? 'text-primary-neon' : 'text-primary-light/70'}`}>
                    {service.num}
                  </span>
                  <span className="font-display text-sm font-semibold tracking-wide flex-1">
                    {service.title}
                  </span>
                  <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'translate-x-1 text-primary-neon' : 'opacity-0'}`} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Column: Detailed Service Content View */}
        <div className="lg:col-span-8 bg-white/60 backdrop-blur-md p-8 md:p-12 border border-outline/20 shadow-xl relative min-h-[500px] flex flex-col justify-between rounded-sm">
          
          {/* Background Watermark */}
          <div className="absolute top-10 right-10 text-9xl opacity-[0.03] font-serif select-none pointer-events-none font-bold">
            {activeService.num}
          </div>

          <div>
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-primary-light text-xs font-mono tracking-widest uppercase">{activeService.chineseTranslation}</span>
                </div>
                <h2 className="font-display text-3xl font-light text-primary tracking-tight">
                  {activeService.title}
                </h2>
              </div>
              <div className="bg-primary/5 text-primary p-3 rounded-full border border-outline/25">
                <ActiveIcon className="h-6 w-6 text-primary-light" />
              </div>
            </div>

            {/* Tagline */}
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-primary-light mb-6">
              // {activeService.tagline}
            </p>

            {/* Description */}
            <p className="font-sans text-on-surface text-base leading-relaxed mb-8 border-l-2 border-primary-light/30 pl-4 py-1">
              {activeService.description}
            </p>

            {/* Key Offerings List */}
            <div className="space-y-4 mb-10">
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-primary-light/80 mb-3">Key Solutions</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {activeService.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary-light shrink-0 mt-0.5" />
                    <span className="font-sans text-sm text-on-surface-variant leading-relaxed">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Link to Contact */}
          <div className="pt-8 border-t border-outline/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-on-surface-variant font-mono">
              Ready to learn more about our {activeService.title.toLowerCase()} service?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-light text-white text-xs font-mono uppercase tracking-widest py-3 px-6 transition-all duration-300 shadow-md hover:shadow-lg rounded-sm shrink-0"
            >
              Inquire Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

        </div>

      </section>

      {/* Corporate Alliances / Footer CTA Section */}
      <section className="mt-32 max-w-5xl mx-auto px-8 py-16 bg-primary text-white relative overflow-hidden shadow-2xl rounded-sm">
        <div className="absolute inset-0 bg-jade-deep opacity-40"></div>
        <div className="absolute inset-0 heritage-pattern opacity-20 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-8 right-8 text-8xl opacity-5 font-serif select-none pointer-events-none">合</div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="text-primary-neon text-xs font-mono tracking-widest uppercase">Custom Consultations / 业务咨询</span>
          </div>
          <h2 className="font-display text-3xl font-light text-white mb-6">
            Seeking a <span className="italic-serif text-primary-neon">Tailored Alliance?</span>
          </h2>
          <p className="font-sans text-white/80 text-sm leading-relaxed mb-8">
            Whether representing a corporation looking to secure executive housing in Cebu, or a property owner seeking exclusive advisory representation, Puyoko Premium Estates creates customized, compliant partnership models that protect and promote your assets.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary-neon text-jade-deep hover:bg-white text-xs font-mono font-bold uppercase tracking-widest py-4 px-8 transition-all duration-300 shadow-xl"
          >
            Connect With Our Advisors
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
