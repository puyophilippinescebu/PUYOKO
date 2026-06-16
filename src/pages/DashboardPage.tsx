import React, { useState, useEffect, useMemo } from 'react';
import { useProperties } from '../contexts/PropertiesContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Mail, 
  Calendar, 
  LayoutGrid, 
  Activity, 
  ArrowUpRight, 
  Home, 
  DollarSign 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  property_title: string | null;
  tour_date: string | null;
  tour_mode: string | null;
  tour_time: string | null;
  form_type: string;
  status: 'New' | 'Viewing Scheduled' | 'Closed' | 'Spam';
  created_at: string;
}

export const DashboardPage: React.FC = () => {
  const { properties, fetchProperties } = useProperties();
  const { isAuthenticated } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());

  // Dynamically compute selectable years from properties and inquiries, defaulting to range around current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const currentYr = new Date().getFullYear();
    yearsSet.add(currentYr);
    
    inquiries.forEach(inq => {
      if (inq.created_at) {
        const yr = new Date(inq.created_at).getFullYear();
        if (!isNaN(yr)) yearsSet.add(yr);
      }
    });

    properties.forEach(p => {
      const created = (p as any).created_at;
      if (created) {
        const yr = new Date(created).getFullYear();
        if (!isNaN(yr)) yearsSet.add(yr);
      }
    });

    // Add a few years surrounding the current year just in case
    for (let offset = -2; offset <= 2; offset++) {
      yearsSet.add(currentYr + offset);
    }

    return Array.from(yearsSet).sort((a, b) => b - a); // descending order
  }, [inquiries, properties]);

  const timeframeLabel = useMemo(() => {
    if (timeframe === 'monthly') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    } else {
      return `${selectedYear}`;
    }
  }, [timeframe, selectedMonth, selectedYear]);

  // Fetch inquiries
  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) {
        setInquiries(data as Inquiry[]);
      }
    } catch (err) {
      console.error('Failed to fetch inquiries for dashboard:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
      fetchInquiries();
    }
  }, [isAuthenticated]);

  // Compute stats metrics
  const stats = useMemo(() => {
    const totalListings = properties.length;
    const activeListings = properties.filter(p => p.status === 'Active').length;

    // Filter inquiries by timeframe
    const filteredInquiries = inquiries.filter(inq => {
      const date = new Date(inq.created_at);
      if (timeframe === 'monthly') {
        return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
      } else {
        return date.getFullYear() === selectedYear;
      }
    });

    // Filter sold properties by timeframe
    const filteredSoldProperties = properties.filter(p => {
      if (p.status !== 'Sold') return false;
      const date = (p as any).created_at ? new Date((p as any).created_at) : new Date();
      if (timeframe === 'monthly') {
        return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth;
      } else {
        return date.getFullYear() === selectedYear;
      }
    });

    const totalLeads = filteredInquiries.length;
    const activeViewings = filteredInquiries.filter(i => i.status === 'Viewing Scheduled').length;
    const soldListings = filteredSoldProperties.length;
    
    // Conversion rate: Closed leads / Total leads
    const closedLeads = filteredInquiries.filter(i => i.status === 'Closed').length;
    const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0';

    return {
      totalListings,
      activeListings,
      totalLeads,
      activeViewings,
      conversionRate,
      soldListings
    };
  }, [properties, inquiries, timeframe, selectedMonth, selectedYear]);

  // Compute top performing listings (properties ordered by inquiry counts)
  const topListings = useMemo(() => {
    const countsMap: { [key: string]: number } = {};
    
    // Count inquiries per property title
    inquiries.forEach(inq => {
      if (inq.property_title) {
        countsMap[inq.property_title] = (countsMap[inq.property_title] || 0) + 1;
      }
    });

    // Map properties with count and sort
    return properties
      .map(prop => {
        const leadCount = countsMap[prop.title] || 0;
        // Mock views: leads * a multiplier + random, to make the dashboard look premium
        const mockViews = leadCount * 18 + (parseInt(prop.id.replace(/\D/g, '')) % 150) + 50;
        const convRate = mockViews > 0 ? ((leadCount / mockViews) * 100).toFixed(1) : '0.0';

        return {
          ...prop,
          leadCount,
          views: mockViews,
          convRate
        };
      })
      .sort((a, b) => b.leadCount - a.leadCount)
      .slice(0, 5); // Limit to top 5
  }, [properties, inquiries]);

  // Compute trend data based on timeframe
  const trendData = useMemo(() => {
    if (timeframe === 'yearly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const yearlyTrend = monthNames.map((name, index) => ({
        name,
        count: 0
      }));

      inquiries.forEach(inq => {
        const date = new Date(inq.created_at);
        if (date.getFullYear() === selectedYear) {
          const monthIndex = date.getMonth();
          yearlyTrend[monthIndex].count += 1;
        }
      });
      return yearlyTrend;
    } else {
      // Monthly: Group days of the current month
      const intervals = [
        { name: '1-5', start: 1, end: 5, count: 0 },
        { name: '6-10', start: 6, end: 10, count: 0 },
        { name: '11-15', start: 11, end: 15, count: 0 },
        { name: '16-20', start: 16, end: 20, count: 0 },
        { name: '21-25', start: 21, end: 25, count: 0 },
        { name: '26+', start: 26, end: 31, count: 0 }
      ];

      inquiries.forEach(inq => {
        const date = new Date(inq.created_at);
        if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
          const day = date.getDate();
          const match = intervals.find(inv => day >= inv.start && day <= inv.end);
          if (match) {
            match.count += 1;
          }
        }
      });

      return intervals.map(inv => ({
        name: inv.name,
        count: inv.count
      }));
    }
  }, [inquiries, timeframe, selectedMonth, selectedYear]);

  // Generate smooth path coordinates for SVG Area Chart
  const svgPathData = useMemo(() => {
    const maxVal = Math.max(...trendData.map(d => d.count), 5); // Fallback max to avoid divide by zero
    const width = 600;
    const height = 180;
    const paddingLeft = 40;
    const paddingRight = 20;
    const graphWidth = width - paddingLeft - paddingRight;

    // Map each month to X, Y coordinates
    const points = trendData.map((d, index) => {
      const x = paddingLeft + (index / (trendData.length - 1)) * graphWidth;
      const y = height - (d.count / maxVal) * (height - 30) - 10;
      return { x, y };
    });

    // Generate line path (smooth cubic splines or straight lines)
    let linePath = '';
    let areaPath = '';
    
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      points.slice(1).forEach(p => {
        linePath += ` L ${p.x} ${p.y}`;
      });

      // Area path completes the loop to bottom left
      areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
    }

    return {
      linePath,
      areaPath,
      points,
      maxVal,
      height
    };
  }, [trendData]);

  // Relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
      
      let interval = Math.floor(seconds / 31536000);
      if (interval >= 1) return `${interval}y ago`;
      interval = Math.floor(seconds / 2592000);
      if (interval >= 1) return `${interval}mo ago`;
      interval = Math.floor(seconds / 86400);
      if (interval >= 1) return `${interval}d ago`;
      interval = Math.floor(seconds / 3600);
      if (interval >= 1) return `${interval}h ago`;
      interval = Math.floor(seconds / 60);
      if (interval >= 1) return `${interval}m ago`;
      return 'just now';
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-container-max mx-auto space-y-8 animate-page-enter">
      {/* Page Header */}
      <div className="bg-white border border-outline/25 rounded-2xl p-6 shadow-sm relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-jade-deep/5 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-full select-none font-display">
              Overview Dashboard
            </span>
            <h1 className="font-serif italic text-3xl text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
              PropTech Intelligence
            </h1>
            <p className="font-sans text-xs text-on-surface-variant max-w-2xl leading-relaxed">
              Real-time property inventory, conversion rates, and client inquiry analytics.
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* Month & Year Dropdowns */}
            <div className="flex items-center gap-2">
              {timeframe === 'monthly' && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-white border border-outline/25 text-primary rounded-xl px-3 py-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wider shadow-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-primary/5 transition-all"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                    <option key={idx} value={idx}>{m}</option>
                  ))}
                </select>
              )}

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-white border border-outline/25 text-primary rounded-xl px-3 py-1.5 font-mono text-[9.5px] font-bold uppercase tracking-wider shadow-sm focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-primary/5 transition-all"
              >
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Timeframe Selector Toggle */}
            <div className="flex border border-outline/25 p-1 rounded-xl bg-primary/[0.02] shadow-inner select-none">
              <button
                onClick={() => setTimeframe('monthly')}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  timeframe === 'monthly'
                    ? "bg-primary text-white shadow-sm"
                    : "text-outline/70 hover:text-primary hover:bg-primary/5"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeframe('yearly')}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-mono text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer",
                  timeframe === 'yearly'
                    ? "bg-primary text-white shadow-sm"
                    : "text-outline/70 hover:text-primary hover:bg-primary/5"
                )}
              >
                Yearly
              </button>
            </div>

            <Link 
              to="/admin/leads"
              className="bg-primary hover:bg-primary-light text-white px-5 py-3 rounded-xl font-mono text-[9.5px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 hover:shadow active:scale-98 cursor-pointer"
            >
              Manage Leads <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {/* Stats strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-outline/25 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-green-600 font-bold flex items-center gap-0.5">
              +4.2% <TrendingUp className="w-3 h-3" />
            </span>
          </div>
          <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Total Listings</span>
          <h3 className="font-sans text-2xl font-bold text-primary mt-1">{stats.totalListings}</h3>
          <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider">{stats.activeListings} Active Listings</p>
        </div>

        {/* Metric 2: Sold Listings */}
        <div className="bg-white border border-outline/25 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-green-600 font-bold flex items-center gap-0.5">
              Stable <TrendingUp className="w-3 h-3" />
            </span>
          </div>
          <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Properties Sold</span>
          <h3 className="font-sans text-2xl font-bold text-primary mt-1">{stats.soldListings}</h3>
          <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider font-display">Closed Deals</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-outline/25 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-green-600 font-bold flex items-center gap-0.5">
              +18.4% <TrendingUp className="w-3 h-3" />
            </span>
          </div>
          <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Total Leads</span>
          <h3 className="font-sans text-2xl font-bold text-primary mt-1">{stats.totalLeads}</h3>
          <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider">Inquiries & Bookings</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-outline/25 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-red-600 font-bold flex items-center gap-0.5">
              -1.5% <TrendingDown className="w-3 h-3" />
            </span>
          </div>
          <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Active Viewings</span>
          <h3 className="font-sans text-2xl font-bold text-primary mt-1">{stats.activeViewings}</h3>
          <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider">Tours Scheduled</p>
        </div>

        {/* Metric 5 */}
        <div className="bg-white border border-outline/25 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-green-600 font-bold flex items-center gap-0.5">
              Stable <TrendingUp className="w-3 h-3" />
            </span>
          </div>
          <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Conversion Rate</span>
          <h3 className="font-sans text-2xl font-bold text-primary mt-1">{stats.conversionRate}%</h3>
          <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider">Leads Closed / Converted</p>
        </div>
      </section>

      {/* Mid Section: SVG Lead Trends Chart & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Area Chart */}
        <div className="lg:col-span-2 bg-white border border-outline/25 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Inquiries Trends</span>
              <h4 className="font-serif text-lg font-bold text-primary mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                {timeframe === 'monthly' ? `Monthly Inflow Growth (${timeframeLabel})` : `Yearly Inflow Growth (${timeframeLabel})`}
              </h4>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                <span>Leads Inflow</span>
              </div>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative h-64 w-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-1 text-[9px] font-mono text-outline-variant/40">
              <span className="border-b border-outline/5 pb-1">Max</span>
              <span className="border-b border-outline/5 pb-1">Mid</span>
              <span className="border-b border-outline/5 pb-1">Low</span>
              <span>0</span>
            </div>

            <div className="w-full h-full relative overflow-hidden">
              {loadingInquiries ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-outline animate-pulse">
                  Recomputing chart coordinates...
                </div>
              ) : (
                <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
                  {/* Fill Area with Gradient */}
                  {svgPathData.areaPath && (
                    <path 
                      d={svgPathData.areaPath} 
                      fill="url(#gradient-chart)" 
                      opacity="0.12" 
                    />
                  )}

                  {/* Stroke Line */}
                  {svgPathData.linePath && (
                    <path 
                      d={svgPathData.linePath} 
                      fill="none" 
                      stroke="#006d43" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                  )}

                  {/* Coordinate Nodes */}
                  {svgPathData.points.map((p, i) => (
                    <g key={i}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r="4.5" 
                        fill="#ffffff" 
                        stroke="#006d43" 
                        strokeWidth="2" 
                      />
                      <text 
                        x={p.x} 
                        y={p.y - 10} 
                        textAnchor="middle" 
                        className="font-mono text-[9px] font-bold fill-primary"
                      >
                        {trendData[i].count}
                      </text>
                    </g>
                  ))}

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="gradient-chart" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#006d43" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between pl-[40px] pr-[20px] pt-4 border-t border-outline/10 text-[10px] font-mono text-on-surface-variant/80">
            {trendData.map((d, i) => (
              <span key={i}>{d.name}</span>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-outline/25 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="mb-5">
            <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Real-time logs</span>
            <h4 className="font-serif text-lg font-bold text-primary mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Recent Activities
            </h4>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
            {loadingInquiries ? (
              <div className="text-center font-mono text-[10px] text-outline-variant animate-pulse py-10">
                Updating activity stream...
              </div>
            ) : inquiries.length === 0 ? (
              <div className="text-center font-mono text-[10px] text-outline py-10">
                No recent activities logged.
              </div>
            ) : (
              inquiries.slice(0, 4).map((inq, index) => {
                const isBooking = inq.form_type === 'Tour Booking';
                
                return (
                  <div key={inq.id} className="flex gap-3 items-start border-l-2 border-primary/20 pl-3">
                    <div className="mt-0.5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                        isBooking 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isBooking ? <Calendar className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                    <div>
                      <p className="font-sans text-xs text-on-surface">
                        <span className="font-bold">{inq.name}</span>{' '}
                        {isBooking ? 'booked a tour' : 'sent an inquiry'} for{' '}
                        <span className="font-semibold">{inq.property_title || 'Puyoko Estate'}</span>
                      </p>
                      <p className="font-mono text-[9px] text-on-surface-variant/70 mt-0.5">
                        {getRelativeTime(inq.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link 
            to="/admin/leads" 
            className="mt-5 text-center text-primary hover:text-primary-light font-mono text-[9px] font-bold uppercase tracking-wider hover:underline"
          >
            View All Inquiries
          </Link>
        </div>
      </div>

      {/* Bottom Section: Property Performance Table */}
      <section className="bg-white border border-outline/25 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline/10 flex justify-between items-center select-none bg-surface-muted/30">
          <div>
            <span className="block font-mono text-[9px] text-outline uppercase tracking-wider">Lead conversions</span>
            <h4 className="font-serif text-lg font-bold text-primary mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Top Performing Listings
            </h4>
          </div>
          <Link to="/admin/properties" className="text-primary hover:text-primary-light font-mono text-[9px] font-bold uppercase tracking-wider hover:underline">
            Manage Listings Inventory
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-muted/50 border-b border-outline/10 text-on-surface-variant font-mono text-[9px] uppercase tracking-wider select-none">
              <tr>
                <th className="px-6 py-4">Property Listing</th>
                <th className="px-6 py-4">Mock Views</th>
                <th className="px-6 py-4">Total Inquiries</th>
                <th className="px-6 py-4">Est. Conv. Rate</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/10">
              {topListings.map(prop => (
                <tr key={prop.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {prop.images && prop.images[0] ? (
                        <img 
                          alt={prop.title} 
                          className="w-11 h-11 rounded-lg object-cover border border-outline-variant/30" 
                          src={prop.images[0]} 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Home className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-sans text-xs font-bold text-primary">{prop.title}</p>
                        <p className="font-mono text-[10px] text-on-surface-variant/80">{prop.address}, {prop.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface">{prop.views.toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface font-bold">{prop.leadCount}</td>
                  <td className="px-6 py-4 font-mono text-xs text-green-600 font-bold">{prop.convRate}%</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full font-mono text-[8px] font-extrabold uppercase border ${
                      prop.status === 'Active' 
                        ? 'bg-green-500/10 text-green-700 border-green-500/15'
                        : 'bg-outline-variant/10 text-outline border-outline-variant/15'
                    }`}>
                      {prop.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
