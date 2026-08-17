import React, { useState } from 'react';
import { 
  Search, MapPin, ChevronRight, Hammer, Zap, Droplet, Users, ChefHat, Baby, 
  Car, Briefcase, Shirt, ShieldAlert, Truck, PaintBucket, Camera,
  Monitor, Stethoscope, Wrench, Volume2, Home, ZapOff,
  Rocket, X, Clock, Sparkles, Shield, Star
} from 'lucide-react';

// Data Structures for Sections
const DAY_TO_DAY = [
  { name: 'Carpenter', icon: Hammer },
  { name: 'Electrician', icon: Zap },
  { name: 'Plumber', icon: Droplet },
  { name: 'Maid', icon: Users },
  { name: 'Cook', icon: ChefHat },
  { name: 'Baby Sitter', icon: Baby },
  { name: 'Driver', icon: Car },
  { name: 'Tiffin Services', icon: Briefcase },
  { name: 'Laundry', icon: Shirt },
];

const TRENDING = [
  { name: 'Pest Control', img: 'https://images.unsplash.com/photo-1584820927498-cafe8c122dc8?w=300&q=80' },
  { name: 'Packers & Movers', img: 'https://images.unsplash.com/photo-1600518464441-9154a4de21bf?w=300&q=80' },
  { name: 'Interior Design', img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300&q=80' },
  { name: 'Home Cleaning', img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80' },
  { name: 'Security Devices', img: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=300&q=80' },
  { name: 'Tour Packages', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&q=80' },
];

const BUSINESS = [
  { name: 'Website & App Development' },
  { name: 'Advertisement Solutions' },
  { name: 'Business Opportunities' },
  { name: 'CA Services' },
  { name: 'Loans' },
  { name: 'Insurance' },
];

const REPAIR = [
  { name: 'Water Motor Repair', subtitle: 'Electric Motor | Alternator', icon: ZapOff },
  { name: 'Home Appliance Repair', subtitle: 'AC | TV | Fridge', icon: Home },
  { name: 'Mobile - Tablet Repair', subtitle: 'Apple | Samsung | Xiaomi', icon: Monitor },
  { name: 'Kitchen Appliances Repair', subtitle: 'Microwave | Purifier', icon: Wrench },
];

const MOVING = [
  'Packers & Movers', 'DTH & Set-Top Boxes', 'Internet Broadband', 
  'Pest Control', 'Catering Services', 'Invertor & Batteries'
];

const EVENTS = [
  'Florists & Decorators', 'Bar Counter', 'Generator Rental', 
  'Vehicle Rentals', 'Valet Parking', 'DJs', 'Live Musicians', 'Catering Services'
];

// A-Z Directory List (Sampled)
const DIRECTORY = {
  A: ['Air Conditioner Rental', 'Alteration Service', 'Alternator Servicing', 'Alternate Medicine', 'Adhesive Tapes', 'Accounting Services', 'Access Control System', 'Alarm System', 'Audio Video Equipment', 'Air Conditioner', 'Air Cooler Repair', 'Audit and Assurance', 'Advertising Solutions', 'Aerobics Classes', 'Ambulance Service', 'Ambulatory Aid', 'Architect'],
  B: ['Borewell Drilling', 'Bike Rentals', 'Beautician Training', 'Bus - Mini Bus Rental', 'Bolt Dealers', 'Baby Sitter', 'Between Cities', 'Basic Home Cleaning', 'Bathroom Cleaning', 'Bus - Train Tickets', 'Business Loans', 'Blood Bank', 'Bar Counter', 'Battery Repair & Service', 'Bank Accounts', 'Building Plan - Design & Sanction', 'Baking Classes'],
  C: ['Craft & Modelling', 'Computer Rentals', 'Commercial gardening', 'Cargo - Shipping', 'Construction Material Supply', 'Corporate Gifting Solutions', 'Correction of Certificate - Document'],
};

// Features coming soon
const UPCOMING_FEATURES = [
  { icon: Search, title: 'Smart Service Search', desc: 'AI-powered search to find the perfect service provider near you' },
  { icon: Shield, title: 'Verified Professionals', desc: 'Background-checked, rated, and reviewed service providers' },
  { icon: Star, title: 'Ratings & Reviews', desc: 'Detailed ratings from real customers to help you choose' },
  { icon: Clock, title: 'Instant Booking', desc: 'Book services with one click and get instant confirmation' },
  { icon: MapPin, title: 'Location-Based Matching', desc: 'Find professionals closest to your location automatically' },
  { icon: Sparkles, title: 'Price Estimates', desc: 'Transparent upfront pricing before you book any service' },
];


export default function ServicesPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBlockedClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPopup(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 relative">
      
      {/* ─── Coming Soon Banner ──────────────────────── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-bold">
          <Rocket className="w-4 h-4 animate-bounce" />
          <span>🚧 All Services is Coming Soon! We're building something amazing for you.</span>
          <Rocket className="w-4 h-4 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>

      {/* ─── Click Blocker Overlay (covers entire content) ──── */}
      <div 
        className="absolute inset-0 z-40 cursor-pointer" 
        style={{ top: '48px' }}
        onClick={handleBlockedClick}
      />

      {/* ─── Hero Section ──────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16 px-4 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-4">Find Expert Services Near You</h1>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            From home cleaning to app development, connect with verified professionals instantly.
          </p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleBlockedClick(e); }} className="max-w-2xl mx-auto flex items-center bg-white rounded-lg overflow-hidden p-1 shadow-lg opacity-60">
            <div className="flex-1 flex items-center px-4 bg-white">
              <Search className="w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search for any service..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 px-3 text-gray-800 outline-none placeholder-gray-400"
                disabled
              />
            </div>
            <button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-md opacity-60 cursor-not-allowed">
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 mt-12 opacity-50 pointer-events-none select-none">
        
        {/* ─── Day to Day Services ──────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Day to Day Services</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
            {DAY_TO_DAY.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{service.name}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Trending Services ────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Services</h2>
          <p className="text-gray-500 text-sm mb-6">The most searched services on Marketa</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRENDING.map((service, idx) => (
              <div 
                key={idx}
                className="relative rounded-xl overflow-hidden shadow-sm aspect-[4/5]"
              >
                <img src={service.img} alt={service.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <h3 className="text-white font-bold leading-tight">{service.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Boost Your Business ──────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Boost your Business</h2>
          <p className="text-gray-500 text-sm mb-6">Tailored services for businesses</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BUSINESS.map((service, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <span className="font-semibold text-gray-800">{service.name}</span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            ))}
          </div>
        </section>

        {/* ─── Repair & Servicing ───────────────────────── */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Repair & Servicing</h2>
          <p className="text-gray-500 text-sm mb-6">Our top repair services to fix everything</p>
          <div className="grid md:grid-cols-2 gap-6">
            {REPAIR.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-xl border border-transparent"
                >
                  <div className="w-14 h-14 shrink-0 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{service.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{service.subtitle}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ─── Moving Out & Event Arrangements ──────────── */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Moving out?</h2>
            <p className="text-gray-500 text-sm mb-6">Help to settle in your new home</p>
            <div className="flex flex-col gap-2">
              {MOVING.map((service, idx) => (
                <div key={idx} className="text-gray-600 py-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> {service}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Arrangements</h2>
            <p className="text-gray-500 text-sm mb-6">Organize your events with ease</p>
            <div className="flex flex-col gap-2">
              {EVENTS.map((service, idx) => (
                <div key={idx} className="text-gray-600 py-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> {service}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ─── A-Z Directory ────────────────────────────── */}
        <section className="pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">View all services (A-Z)</h2>
          
          <div className="space-y-10">
            {Object.keys(DIRECTORY).map(letter => (
              <div key={letter} className="flex flex-col md:flex-row gap-6">
                <div className="w-12 h-12 shrink-0 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xl shadow-lg">
                  {letter}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 flex-1 pt-2">
                  {DIRECTORY[letter].map((service, idx) => (
                    <span 
                      key={idx} 
                      className="text-sm text-gray-600 truncate"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ─── Coming Soon Popup Modal ────────────────────── */}
      {showPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowPopup(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-6 py-8 text-center relative">
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">Coming Soon! 🚀</h2>
              <p className="text-indigo-100 text-sm">
                We're building a powerful services marketplace for you
              </p>
            </div>

            {/* Features Grid */}
            <div className="p-6">
              <p className="text-sm font-bold text-gray-700 mb-4 text-center">Here's what you'll get:</p>
              <div className="grid grid-cols-2 gap-3">
                {UPCOMING_FEATURES.map((feature, idx) => {
                  const Icon = feature.icon;
                  return (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                        <Icon className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 mb-0.5">{feature.title}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 text-center">
                <button 
                  onClick={() => setShowPopup(false)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200/50 transition-all"
                >
                  Got it, I'll wait! ✨
                </button>
                <p className="text-[10px] text-gray-400 mt-3">
                  Meanwhile, explore our classifieds marketplace →
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
