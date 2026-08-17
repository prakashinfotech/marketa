import React from 'react';
import { Eye, ShieldCheck, Database, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us when you create an account, post an ad, or communicate with other users. This includes your name, email, phone number, and location.',
      icon: Database
    },
    {
      title: 'How We Use Information',
      content: 'Your data is used to provide and improve our services, facilitate transactions, verify identity, and send important platform updates. We do not sell your personal information to third parties.',
      icon: UserCheck
    },
    {
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.',
      icon: ShieldCheck
    },
    {
      title: 'Your Privacy Choices',
      content: 'You can update your account information at any time through your profile settings. You also have the right to request the deletion of your account and associated data.',
      icon: Eye
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-10 text-white">
          <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
          <p className="text-emerald-100">Last Updated: April 29, 2026</p>
        </div>
        
        <div className="p-10 space-y-10">
          <p className="text-gray-600 leading-relaxed">
            Your privacy is extremely important to us. This policy explains how we handle your data and the steps we take to ensure your personal information remains protected while you use Marketa.
          </p>

          <div className="grid gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-gray-100 bg-gray-50/50 -mx-10 px-10 pb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cookies & Tracking</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We use cookies to enhance your experience, remember your preferences, and analyze our traffic. By continuing to use our site, you consent to our use of cookies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
