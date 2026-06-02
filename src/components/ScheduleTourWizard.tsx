import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Check, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Info 
} from 'lucide-react';
import { useProperties } from '../contexts/PropertiesContext';
import { useBlockedDates } from '../hooks/useBlockedDates';
import { normalizeLocation } from '../lib/utils';

interface ScheduleTourWizardProps {
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
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  countryCode: 'ph',
  phone: '',
  agreePrivacy: false,
};

const TIME_SLOTS = [
  '09:00 am',
  '10:00 am',
  '11:00 am',
  '01:00 pm',
  '02:00 pm',
  '03:00 pm',
  '04:00 pm'
];

export const ScheduleTourWizard: React.FC<ScheduleTourWizardProps> = ({ standalone = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { properties } = useProperties();

  // Route/Url Query parameters
  const searchParams = new URLSearchParams(location.search);
  const urlPropertyId = searchParams.get('propertyId') || (location.state as any)?.propertyId || '';

  // Wizard Steps: 1 = Select Home, 2 = Select Schedule, 3 = Contact Info
  const [currentStep, setCurrentStep] = useState<number>(urlPropertyId ? 2 : 1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(urlPropertyId);
  const [selectedTime, setSelectedTime] = useState<string>('09:00 am');
  const [tourType, setTourType] = useState<'In Person' | 'In Video Chat'>('In Person');
  
  // Calculate dynamic scheduling dates based on Philippine Standard Time (PST, UTC+8)
  // Must be minimum 2 days advanced, up to 2 weeks maximum (range: 2 to 14 days in advance)
  const getPSTDates = () => {
    const dates = [];
    const now = new Date();
    
    // Shift now to UTC then to Philippine Time (UTC+8)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const pstOffset = 8;
    const pstTime = new Date(utc + (3600000 * pstOffset));
    
    // Generate dates: 2 days advanced up to 14 days maximum (13 dates total)
    for (let i = 2; i <= 14; i++) {
      const d = new Date(pstTime);
      d.setDate(pstTime.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const { isDateBlocked, blockedDates } = useBlockedDates();
  const calendarDays = getPSTDates();
  
  const formatDateString = (d: Date) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [selectedDateStr, setSelectedDateStr] = useState<string>(formatDateString(calendarDays[0]));
  const allDaysBlocked = calendarDays.every(d => isDateBlocked(formatDateString(d)));

  // Smart Fallback Selection: If default or selected date is blocked, find the first available unblocked date
  useEffect(() => {
    if (isDateBlocked(selectedDateStr)) {
      const firstAvailable = calendarDays.find(d => !isDateBlocked(formatDateString(d)));
      if (firstAvailable) {
        setSelectedDateStr(formatDateString(firstAvailable));
      }
    }
  }, [blockedDates, isDateBlocked, selectedDateStr]);

  // Filters for Step 1
  const [filterType, setFilterType] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterPriceRange, setFilterPriceRange] = useState<string>('All');

  // Dynamic location list based on the actual properties, standardized to prevent duplicates
  const locationOptions = Array.from(new Set(properties.map(p => normalizeLocation(p.city)))).filter(Boolean).sort();

  // Contact Info states (Step 3)
  const [formData, setFormData] = useState(emptyForm);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Sync state if URL search query changes
  useEffect(() => {
    if (urlPropertyId) {
      setSelectedPropertyId(urlPropertyId);
      setCurrentStep(2);
    }
  }, [urlPropertyId]);

  const selectedProperty = properties.find(p => {
    const normalize = (s: string) => s.replace(/[\s-]/g, '').toLowerCase();
    return normalize(p.id) === normalize(selectedPropertyId);
  });

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
          ? `[Tour Booking] ${formData.firstName} ${formData.lastName} — ${selectedProperty.title} (${selectedProperty.id})`
          : `New Inquiry from ${formData.firstName} ${formData.lastName}`,
        from_name: 'PUYOKO Booking Center',
        'Inquiring As': formData.inquireAs,
        Name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
        Email: formData.email,
        Phone: `${selectedCountry?.dial ?? ''} ${formData.phone}`,
      };

      if (selectedProperty) {
        payload['Property ID'] = selectedProperty.id;
        payload['Property Title'] = selectedProperty.title;
        payload['Property Price'] = new Intl.NumberFormat('en-PH', { style: 'currency', currency: selectedProperty.currency || 'PHP', maximumFractionDigits: 0 }).format(selectedProperty.price);
        payload['Property Address'] = `${selectedProperty.address}, ${selectedProperty.city}`;
        payload['Selected Tour Date'] = selectedDateStr;
        payload['Tour Mode'] = tourType;
        payload['Selected Time Slot'] = selectedTime;
      }

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

  // Horizontal scroll helper for calendar dates
  const scrollCalendar = (direction: 'left' | 'right') => {
    const container = document.getElementById('calendar-scroll-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtered Properties for Step 1
  const filteredProperties = properties.filter(p => {
    if (filterType !== 'All' && p.type !== filterType) return false;
    if (filterCity !== 'All' && normalizeLocation(p.city) !== filterCity) return false;
    if (filterPriceRange !== 'All') {
      if (filterPriceRange === 'Under 30M' && p.price >= 30000000) return false;
      if (filterPriceRange === '30M - 100M' && (p.price < 30000000 || p.price > 100000000)) return false;
      if (filterPriceRange === 'Above 100M' && p.price <= 100000000) return false;
    }
    return true;
  });

  const inputClass = "w-full border border-outline/30 bg-white/80 rounded-md px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm text-on-surface font-sans";
  const labelClass = "block text-[11px] font-bold uppercase tracking-wider text-on-surface mb-1.5 font-display";

  return (
    <div className={standalone ? "pt-32 pb-24 px-gutter mx-auto max-w-6xl min-h-[85vh] relative z-10" : "py-20 px-gutter border-t border-outline/20 relative z-10 max-w-6xl mx-auto"}>
      <div className="absolute inset-0 heritage-pattern opacity-[0.03] pointer-events-none -z-10"></div>
      
      {/* ── Wizard Header ── */}
      <div className="text-center mb-10 select-none">
        <h2 className="font-serif italic text-4xl text-primary mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          {currentStep === 1 && "Select Your Estate"}
          {currentStep === 2 && "Schedule A Private Tour"}
          {currentStep === 3 && "Tell Us About Yourself"}
        </h2>
        <p className="font-mono text-[9px] uppercase tracking-widest text-primary/75 mt-1">
          {currentStep === 1 && "Select which home you are interested in exploring"}
          {currentStep === 2 && "Choose your preferred date, tour type, and time slot (Dates reflect Manila Standard Time)"}
          {currentStep === 3 && "Review your booking details and confirm your inquiry"}
        </p>
      </div>

      {/* ── Step Tracker progress bar ── */}
      <div className="max-w-xl mx-auto mb-12 relative flex items-center justify-between select-none">
        <div className="absolute left-0 right-0 h-[2px] bg-outline-variant/30 -z-10"></div>
        <div className="absolute left-0 right-0 h-[2px] bg-primary transition-all duration-500 -z-10" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
        
        {/* Step 1 */}
        <button 
          onClick={() => { if (selectedPropertyId) setCurrentStep(1); }}
          className={`flex flex-col items-center gap-1.5 focus:outline-none ${selectedPropertyId ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
          disabled={!selectedPropertyId}
        >
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-display text-xs font-bold transition-all duration-300 ${
            currentStep === 1 ? 'bg-primary text-white border-primary shadow-md scale-105' :
            currentStep > 1 ? 'bg-primary-light border-primary-light text-white' : 'bg-white text-on-surface-variant/50 border-outline-variant/50'
          }`}>
            {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : "1"}
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider ${currentStep === 1 ? 'text-primary font-bold' : 'text-on-surface-variant/60'}`}>Select Home</span>
        </button>

        {/* Step 2 */}
        <button 
          onClick={() => { if (selectedPropertyId) setCurrentStep(2); }}
          className={`flex flex-col items-center gap-1.5 focus:outline-none ${selectedPropertyId ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
          disabled={!selectedPropertyId}
        >
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-display text-xs font-bold transition-all duration-300 ${
            currentStep === 2 ? 'bg-primary text-white border-primary shadow-md scale-105' :
            currentStep > 2 ? 'bg-primary-light border-primary-light text-white' : 
            selectedPropertyId ? 'bg-white text-primary border-primary/40' : 'bg-white text-on-surface-variant/50 border-outline-variant/50'
          }`}>
            {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : "2"}
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider ${currentStep === 2 ? 'text-primary font-bold' : 'text-on-surface-variant/60'}`}>Schedule</span>
        </button>

        {/* Step 3 */}
        <button 
          className="flex flex-col items-center gap-1.5 focus:outline-none cursor-default"
          disabled
        >
          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-display text-xs font-bold transition-all duration-300 ${
            currentStep === 3 ? 'bg-primary text-white border-primary shadow-md scale-105' :
            'bg-white text-on-surface-variant/50 border-outline-variant/50'
          }`}>
            3
          </div>
          <span className={`font-mono text-[9px] uppercase tracking-wider ${currentStep === 3 ? 'text-primary font-bold' : 'text-on-surface-variant/60'}`}>Contact</span>
        </button>
      </div>

      {/* ── STEP 1: SELECT YOUR HOME ── */}
      {currentStep === 1 && (
        <div className="animate-page-enter">
          {/* Category Filter Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-white/40 border border-outline/20 p-4 rounded-2xl backdrop-blur-sm shadow-sm">
            <div>
              <label className={labelClass}>Property Type</label>
              <select 
                className={inputClass + " bg-white appearance-none cursor-pointer"} 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Location (City)</label>
              <select 
                className={inputClass + " bg-white appearance-none cursor-pointer"} 
                value={filterCity} 
                onChange={(e) => setFilterCity(e.target.value)}
              >
                <option value="All">All Locations</option>
                {locationOptions.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Price Category</label>
              <select 
                className={inputClass + " bg-white appearance-none cursor-pointer"} 
                value={filterPriceRange} 
                onChange={(e) => setFilterPriceRange(e.target.value)}
              >
                <option value="All">All Budgets</option>
                <option value="Under 30M">Under ₱30M</option>
                <option value="30M - 100M">₱30M - ₱100M</option>
                <option value="Above 100M">Above ₱100M</option>
              </select>
            </div>
          </div>

          {/* Properties Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map(p => (
                <div 
                  key={p.id}
                  onClick={() => {
                    setSelectedPropertyId(p.id);
                    setSelectedDateStr(formatDateString(calendarDays[0]));
                    setCurrentStep(2);
                  }}
                  className={`group bg-white rounded-2xl overflow-hidden border border-outline/25 hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col relative ${
                    selectedPropertyId === p.id ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                >
                  <div className="relative h-48 w-full overflow-hidden bg-black/10">
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[8.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm border bg-green-500/90 text-white border-green-400">
                        Ready to Tour
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full select-none font-display">
                        {p.type}
                      </span>
                      <h3 className="font-serif text-base font-bold text-primary mt-2 group-hover:text-primary-light transition-colors leading-tight">
                        {p.title}
                      </h3>
                      <p className="font-mono text-[9px] text-on-surface-variant/70 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary/60 shrink-0" />
                        {normalizeLocation(p.city)} • {p.area} sqm
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-outline/10 flex items-center justify-between">
                      <p className="font-display text-sm font-extrabold text-on-surface">
                        {new Intl.NumberFormat('en-PH', { style: 'currency', currency: p.currency || 'PHP', maximumFractionDigits: 0 }).format(p.price)}
                        {p.type === 'For Rent' && <span className="text-[10px] font-normal text-on-surface-variant/70">/mo</span>}
                      </p>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Schedule Tour <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/30 border border-outline/25 rounded-2xl">
              <p className="font-serif text-lg italic text-primary/75">No matching estates found. Try clearing your filters!</p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: SELECT A SCHEDULE ── */}
      {currentStep === 2 && selectedProperty && (
        <div className="animate-page-enter max-w-4xl mx-auto space-y-10">
          
          {/* Selected Property Details */}
          <div className="p-4 bg-white border border-outline/35 rounded-2xl flex flex-col sm:flex-row gap-4 items-center shadow-sm relative">
            <div className="w-full sm:w-32 h-20 rounded-xl overflow-hidden bg-black/10 shrink-0">
              <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left pr-4">
              <span className="font-mono text-[8px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full select-none font-display">
                Selected Estate
              </span>
              <h3 className="font-serif text-base font-bold text-on-surface mt-1 leading-tight">
                {selectedProperty.title}
              </h3>
              <p className="font-mono text-[9px] text-on-surface-variant/70 mt-0.5">
                ID: {selectedProperty.id} • {normalizeLocation(selectedProperty.city)}, {selectedProperty.address}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-center sm:items-end gap-2">
              <p className="font-display text-sm font-extrabold text-on-surface">
                {new Intl.NumberFormat('en-PH', { style: 'currency', currency: selectedProperty.currency || 'PHP', maximumFractionDigits: 0 }).format(selectedProperty.price)}
              </p>
              <button 
                onClick={() => setCurrentStep(1)}
                className="font-mono text-[9px] font-bold uppercase tracking-widest text-primary hover:text-primary-light border-b border-primary/20 pb-0.5 transition-colors cursor-pointer"
              >
                Change Property &gt;
              </button>
            </div>
          </div>

          {/* Select a Date (Horizontal Calendar Picker - WIDER date cards, scrolls beautifully) */}
          <div className="bg-white/40 border border-outline/25 p-6 rounded-2xl backdrop-blur-sm shadow-sm space-y-4">
            <div className="flex items-center justify-between select-none">
              <h3 className="font-serif italic text-lg text-primary flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <CalendarIcon className="w-5 h-5 text-primary-light" /> Select a Date
              </h3>
              {/* Manual scrolling arrows */}
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCalendar('left')}
                  className="p-1.5 rounded-full bg-white hover:bg-surface-muted border border-outline/20 text-primary transition-colors cursor-pointer active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCalendar('right')}
                  className="p-1.5 rounded-full bg-white hover:bg-surface-muted border border-outline/20 text-primary transition-colors cursor-pointer active:scale-90"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div 
                id="calendar-scroll-container"
                className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory py-1 px-1 w-full"
              >
                {calendarDays.map((date, idx) => {
                  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }); // Wider day name (e.g. Thursday)
                  const dayOfMonth = date.getDate().toString().padStart(2, '0');
                  const monthName = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const fullStr = formatDateString(date);
                  const isSelected = selectedDateStr === fullStr;
                  const isBlocked = isDateBlocked(fullStr);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => { if (!isBlocked) setSelectedDateStr(fullStr); }}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all min-w-[125px] snap-center select-none flex-shrink-0 ${
                        isBlocked
                          ? 'bg-gray-50 border-outline/10 text-on-surface-variant/40 cursor-not-allowed opacity-60'
                          : isSelected 
                            ? 'bg-primary border-primary text-white shadow-md scale-[1.02] cursor-pointer' 
                            : 'bg-white hover:bg-surface-muted/50 border-outline/30 text-on-surface cursor-pointer'
                      }`}
                    >
                      <span className={`font-mono text-[8.5px] uppercase tracking-wider ${
                        isBlocked ? 'text-red-500/50' : isSelected ? 'text-white/80' : 'text-on-surface-variant/60'
                      }`}>
                        {dayOfWeek}
                      </span>
                      <span className="font-display text-xl font-bold my-1 leading-none">
                        {dayOfMonth}
                      </span>
                      {isBlocked ? (
                        <span className="font-mono text-[7.5px] uppercase tracking-widest text-red-500 font-extrabold mt-0.5">Unavailable</span>
                      ) : (
                        <span className={`font-mono text-[8.5px] uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-on-surface-variant/60'}`}>
                          {monthName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-primary/70 bg-primary/5 p-3 rounded-lg border border-primary/10 select-none">
              <Info className="w-4 h-4 shrink-0 text-primary-light" />
              <p className="font-sans text-[10px] leading-relaxed">
                Tours must be scheduled at least **2 days in advance** to coordinate details, up to a **2-week limit** maximum.
              </p>
            </div>

            {allDaysBlocked && (
              <div className="flex items-start gap-3 text-red-800 bg-red-50 border border-red-200 p-4 rounded-xl font-sans text-xs select-none">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-2 leading-relaxed">
                  <span className="font-mono text-[9px] uppercase tracking-wider font-extrabold text-red-700 block">Fully Booked / No Slots Available</span>
                  <p>
                    We are currently unable to accommodate automated tour bookings online for the next 2 weeks. Please reach out to our team directly through our contact page to arrange a private viewing.
                  </p>
                  <Link
                    to={`/contact?propertyId=${selectedPropertyId}`}
                    className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-widest font-extrabold text-red-700 hover:text-red-950 border-b border-red-700/30 pb-0.5 transition-all"
                  >
                    Contact Us Direct ↗
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Selector Type & Time Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tour Type */}
            <div className="bg-white/40 border border-outline/25 p-6 rounded-2xl backdrop-blur-sm shadow-sm space-y-4">
              <h3 className="font-serif italic text-lg text-primary flex items-center gap-2 select-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                <User className="w-5 h-5 text-primary-light" /> How would you like to tour?
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTourType('In Person')}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all gap-2 cursor-pointer ${
                    tourType === 'In Person'
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white hover:bg-surface-muted/50 border-outline/30 text-on-surface'
                  }`}
                >
                  <MapPin className={`w-6 h-6 ${tourType === 'In Person' ? 'text-white' : 'text-primary/70'}`} />
                  <span className="font-display text-xs font-bold uppercase tracking-wider">In Person</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTourType('In Video Chat')}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 transition-all gap-2 cursor-pointer ${
                    tourType === 'In Video Chat'
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-white hover:bg-surface-muted/50 border-outline/30 text-on-surface'
                  }`}
                >
                  <Video className={`w-6 h-6 ${tourType === 'In Video Chat' ? 'text-white' : 'text-primary/70'}`} />
                  <span className="font-display text-xs font-bold uppercase tracking-wider">Video Chat</span>
                </button>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="bg-white/40 border border-outline/25 p-6 rounded-2xl backdrop-blur-sm shadow-sm space-y-4">
              <h3 className="font-serif italic text-lg text-primary flex items-center gap-2 select-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Clock className="w-5 h-5 text-primary-light" /> Select a Time
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((time, idx) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 px-3 rounded-lg border text-center font-mono text-[10px] font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-primary border-primary text-white shadow-sm'
                          : 'bg-white hover:bg-surface-muted/50 border-outline/35 text-on-surface'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Navigation Action */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors border border-outline/35 rounded-full cursor-pointer bg-white"
            >
              &lt; Back to Properties
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={allDaysBlocked}
              className="px-10 py-3.5 bg-primary hover:bg-primary-light disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none text-white font-sans text-sm font-semibold tracking-wide rounded-full shadow-sm hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: CONTACT INFORMATION & SUMMARY ── */}
      {currentStep === 3 && selectedProperty && (
        <div className="animate-page-enter max-w-5xl mx-auto">
          {status === 'success' ? (
            <div className="text-center py-16 bg-white border border-outline/20 rounded-2xl shadow-sm space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto border border-green-200">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-serif italic text-3xl text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tour Requested!
              </h2>
              <p className="font-sans text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                Thank you! Your private viewing booking for **{selectedProperty.title}** has been sent to our Gmail. An agent will contact you shortly to confirm your visit.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setStatus('idle');
                    setCurrentStep(1);
                    setSelectedPropertyId('');
                  }}
                  className="px-8 py-3 bg-primary hover:bg-primary-light text-white font-sans text-xs font-bold uppercase tracking-widest rounded-full transition-colors cursor-pointer"
                >
                  Schedule Another Tour
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              
              {/* Left Column: Summary */}
              <div className="lg:col-span-2 space-y-6 bg-white/40 border border-outline/25 p-6 rounded-2xl backdrop-blur-sm shadow-sm select-none">
                <h3 className="font-serif italic text-lg text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Summary of Tour
                </h3>
                
                {/* Visual Listing */}
                <div className="rounded-xl overflow-hidden bg-white border border-outline/20 shadow-sm">
                  <div className="h-32 w-full bg-black/10">
                    <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <span className="font-mono text-[7px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full select-none font-display">
                      {selectedProperty.type}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-primary mt-1.5 leading-tight">
                      {selectedProperty.title}
                    </h4>
                    <p className="font-mono text-[9px] text-on-surface-variant/60">
                      ID: {selectedProperty.id} • {selectedProperty.city}
                    </p>
                  </div>
                </div>

                {/* Details Summary slots */}
                <div className="space-y-4 pt-4 border-t border-outline/10">
                  <div className="flex gap-3.5 items-start">
                    <CalendarIcon className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-mono text-[8px] uppercase tracking-wider text-on-surface-variant/50">Selected Date</span>
                      <span className="font-sans text-xs font-bold text-on-surface">{selectedDateStr}</span>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <User className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-mono text-[8px] uppercase tracking-wider text-on-surface-variant/50">Tour Type</span>
                      <span className="font-sans text-xs font-bold text-on-surface">{tourType}</span>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <Clock className="w-4 h-4 text-primary-light mt-0.5 shrink-0" />
                    <div>
                      <span className="block font-mono text-[8px] uppercase tracking-wider text-on-surface-variant/50">Time Slot</span>
                      <span className="font-sans text-xs font-bold text-on-surface">{selectedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="font-mono text-[8px] font-bold uppercase tracking-wider text-primary-light hover:text-primary border-b border-primary/20 pb-0.5 cursor-pointer"
                  >
                    &lt; Change Schedule / Mode
                  </button>
                </div>
              </div>

              {/* Right Column: Contact details form */}
              <form onSubmit={handleSubmit} className="lg:col-span-3 bg-white border border-outline/25 p-8 rounded-2xl shadow-sm space-y-6">
                <h3 className="font-serif italic text-lg text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Your Contact Information
                </h3>
                
                {/* Inquiry Level */}
                <div>
                  <label className={labelClass}>I'm inquiring as a/an *</label>
                  <div className="relative">
                    <select
                      className={inputClass + " appearance-none cursor-pointer bg-white font-sans"}
                      value={formData.inquireAs}
                      onChange={(e) => setFormData({ ...formData, inquireAs: e.target.value })}
                    >
                      <option>Interested Buyer</option>
                      <option>Interested to Rent</option>
                      <option>Homeowner</option>
                      <option>Broker/Agent</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-primary">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>FIRST NAME *</label>
                    <input
                      type="text"
                      required
                      placeholder="Juan"
                      className={inputClass}
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>MIDDLE NAME</label>
                    <input
                      type="text"
                      placeholder="Dela"
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
                      placeholder="Cruz"
                      className={inputClass}
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>EMAIL ADDRESS *</label>
                    <input
                      type="email"
                      required
                      placeholder="juandelacruz@gmail.com"
                      className={inputClass}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>CONTACT NUMBER *</label>
                    <div className="flex">
                      <div className="relative flex-shrink-0 w-[95px] border border-r-0 border-outline/30 bg-background-warm rounded-l-md overflow-hidden">
                        <select
                          className="w-full h-full appearance-none bg-transparent cursor-pointer pl-9 pr-6 outline-none text-xs font-semibold text-on-surface-variant focus:ring-1 focus:ring-primary focus:border-primary font-sans"
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                          title="Country Code"
                        >
                          {COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>{c.dial}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
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

                {/* Privacy agreement checkbox */}
                <div className="flex items-start mt-4 bg-background-warm/30 p-3 rounded-lg border border-outline/10 font-sans">
                  <input
                    type="checkbox"
                    id="wizard-privacy"
                    required
                    className="mt-1 w-4 h-4 text-primary border-outline/40 rounded focus:ring-primary cursor-pointer flex-shrink-0"
                    checked={formData.agreePrivacy}
                    onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
                  />
                  <label htmlFor="wizard-privacy" className="ml-3 text-[10px] text-on-surface-variant/80 leading-relaxed cursor-pointer select-none">
                    By submitting this request, I certify that I have read and agree to the <Link to="/privacy" className="text-primary font-semibold hover:underline">Privacy Policy</Link> and authorize Puyoko representatives to contact me through my details with promotional tour updates.
                  </label>
                </div>

                {/* Navigation Back and Submit actions */}
                <div className="flex justify-between items-center pt-4 border-t border-outline/10">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-light transition-colors border border-outline/25 rounded-full cursor-pointer bg-white"
                  >
                    &lt; Back
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-8 py-3 bg-primary hover:bg-primary-light disabled:bg-gray-400 text-white font-sans text-xs font-bold uppercase tracking-widest rounded-full shadow-sm hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {status === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {status === 'loading' ? 'Submitting...' : 'Confirm booking request'}
                  </button>
                </div>

                {status === 'error' && (
                  <div className="mt-4 flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3.5 text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-xs font-semibold">Something went wrong. Please check your network and try again.</p>
                  </div>
                )}
              </form>

            </div>
          )}
        </div>
      )}

    </div>
  );
};
