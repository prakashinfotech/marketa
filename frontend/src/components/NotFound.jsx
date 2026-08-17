import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg animate-fade-in">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Compass className="w-10 h-10 text-indigo-600" aria-hidden="true" />
        </div>
        <p className="text-sm font-bold text-indigo-600 tracking-widest uppercase mb-2">404</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 btn-primary !px-5 !py-2.5"
          >
            <Home className="w-4 h-4" /> Back to home
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            <Search className="w-4 h-4" /> Browse ads
          </Link>
        </div>
      </div>
    </section>
  );
}
