import React from 'react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

export default function TermsOfUse() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using Marketa, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
      icon: CheckCircle
    },
    {
      title: '2. User Accounts',
      content: 'To use certain features of the platform, you must register for an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.',
      icon: FileText
    },
    {
      title: '3. Posting Content',
      content: 'Users are solely responsible for the content they post. You must not post illegal, offensive, or infringing material. Marketa reserves the right to remove any content at its sole discretion.',
      icon: Shield
    },
    {
      title: '4. Prohibited Activities',
      content: 'You may not use the platform for any fraudulent purposes, to harass others, or to interfere with the proper working of the site. Scraping or automated access is strictly prohibited without prior consent.',
      icon: Lock
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white">
          <h1 className="text-3xl font-extrabold mb-2">Terms of Use</h1>
          <p className="text-indigo-100">Last Updated: April 29, 2026</p>
        </div>
        
        <div className="p-10 space-y-10">
          <p className="text-gray-600 leading-relaxed">
            Welcome to Marketa. Please read these terms carefully before using our services. Our goal is to provide a safe and reliable marketplace for everyone.
          </p>

          <div className="grid gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 text-sm">
              If you have any questions about these Terms, please contact our legal team at legal@marketa.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
