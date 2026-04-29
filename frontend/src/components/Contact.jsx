import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Contact() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  // Update form if user data loads later
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/contact/submit/', formData);
      if (res.data.success) {
        setSubmitted(true);
      } else {
        setError(res.data.msg || 'Failed to send message.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary-600 py-16 md:py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-primary-100 text-lg max-w-2xl mx-auto">
            Have questions or need assistance? Our team is here to help you get the most out of QuikrClone.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                <p className="text-gray-500 text-sm mb-1">Our team will get back to you within 24 hours.</p>
                <a href="mailto:support@quikrclone.sample" className="text-primary-600 font-medium hover:underline text-sm">support@quikrclone.sample</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                <p className="text-gray-500 text-sm mb-1">Mon-Fri from 9am to 6pm.</p>
                <a href="tel:+919876543210" className="text-primary-600 font-medium hover:underline text-sm">+91 98765 43210</a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="bg-primary-50 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Visit Us</h3>
                <p className="text-gray-500 text-sm">
                  123 Tech Park, Electronic City,<br />
                  Bangalore, Karnataka - 560100
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Received!</h2>
                <p className="text-gray-600 max-w-sm">
                  Thank you! We have received your message and our team will call you back shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-primary-600 font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required 
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" 
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                    <input 
                      type="text" 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" 
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required 
                      rows="4" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition" 
                      placeholder="Describe your inquiry..."
                    ></textarea>
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'} 
                    {!loading && <Send className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* FAQ Preview */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500">Quick answers to common questions about our platform.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: 'Is it free to post an ad?', a: 'Yes! You can post basic ads for free. We also offer premium packages for better visibility.' },
              { q: 'How do I contact a seller?', a: 'You can use the built-in chat feature on the product page to connect with sellers safely.' },
              { q: 'How do I stay safe while buying?', a: 'Always meet in public places, inspect items before paying, and never share OTPs or bank details.' },
              { q: 'Can I change my registered phone number?', a: 'Yes, you can update your phone number anytime from your profile settings.' },
            ].map((faq, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="bg-primary-50 p-2 h-fit rounded-lg">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
