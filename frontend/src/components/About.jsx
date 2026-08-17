import React from 'react';
import { Shield, Users, Globe, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-600 py-16 md:py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About Marketa</h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            We are India's leading classifieds platform, connecting millions of buyers and sellers across thousands of cities.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 font-sans">Our Mission</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Our mission is to empower every person in the country to independently connect with buyers and sellers online. 
              We want to make the process of buying, selling, and renting as simple, safe, and transparent as possible.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-primary-600 font-bold text-3xl">10M+</span>
                <span className="text-gray-500 text-sm">Monthly Users</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-primary-600 font-bold text-3xl">1000+</span>
                <span className="text-gray-500 text-sm">Cities Covered</span>
              </div>
            </div>
          </div>
          <div className="bg-primary-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">Why Choose Us?</h2>
            <ul className="space-y-6">
              {[
                { icon: Shield, title: 'Safe & Secure', desc: 'We prioritize your safety with verified profiles and secure communication.' },
                { icon: Users, title: 'Community Driven', desc: 'Built for the community, by the community. We thrive on user feedback.' },
                { icon: Globe, title: 'Local Presence', desc: 'Find deals right in your neighborhood, no matter where you are.' },
                { icon: Target, title: 'Easy to Use', desc: 'Simple interface designed for everyone to start selling in seconds.' },
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-900">{item.title}</h3>
                    <p className="text-primary-700 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Team/Values Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { title: 'Customer Obsession', desc: 'Everything we build starts with the user in mind.' },
              { title: 'Integrity', desc: 'We act with honesty and build trust with our community.' },
              { title: 'Innovation', desc: 'Constantly evolving to make classifieds better and faster.' },
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
