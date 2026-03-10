import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-900 border-t border-primary-800 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-accent-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-xs">II</span>
              </div>
              <span className="text-white font-bold text-sm">Infinity Investment Property Solutions</span>
            </div>
            <p className="text-primary-500 text-xs max-w-xs">
              Private real estate investment opportunities in the Phoenix Metro. For accredited and qualified investors only.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 text-sm text-primary-400">
            <div className="flex flex-col gap-2">
              <span className="text-primary-300 font-semibold text-xs uppercase tracking-wide">Company</span>
              <Link to="/#about" className="hover:text-white transition-colors">About Isaac</Link>
              <Link to="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link to="/#opportunities" className="hover:text-white transition-colors">Opportunities</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-primary-300 font-semibold text-xs uppercase tracking-wide">Contact</span>
              <a href="mailto:isaac@garciacapital.com" className="hover:text-white transition-colors">isaac@garciacapital.com</a>
              <a href="tel:+16025550100" className="hover:text-white transition-colors">(602) 555-0100</a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-primary-600 text-xs">
            © {new Date().getFullYear()} Infinity Investment Property Solutions. All rights reserved.
          </p>
          <p className="text-primary-700 text-xs text-center">
            Investment opportunities are for informational purposes only and do not constitute an offer to sell or solicitation of an offer to buy any security.
          </p>
        </div>
      </div>
    </footer>
  );
}
