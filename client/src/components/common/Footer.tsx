import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-charcoal-900 border-t border-slate-200 dark:border-charcoal-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Recycle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-charcoal-900 dark:text-white">
                Eco<span className="text-brand-600 dark:text-brand-400">Collect</span>
              </span>
            </Link>

            <p className="text-sm text-charcoal-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Dispose Smart. Collect Better. Recycle More.
              Connecting conscious citizens with responsible collection networks for cleaner, greener communities.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-charcoal-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Landfill Certified Operations</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-slate-100 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-charcoal-600 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/waste-categories" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Waste Categories
                </Link>
              </li>
              <li>
                <Link to="/smart-guide" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Smart Waste Guide
                </Link>
              </li>
              <li>
                <Link to="/request-pickup" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Request a Pickup
                </Link>
              </li>
            </ul>
          </div>

          {/* Waste Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-slate-100 mb-4">
              Streams
            </h4>
            <ul className="space-y-2.5 text-sm text-charcoal-600 dark:text-slate-400">
              <li>
                <Link to="/waste-categories/e-waste" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  E-Waste Recycling
                </Link>
              </li>
              <li>
                <Link to="/waste-categories/plastic-waste" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Plastic Recycling
                </Link>
              </li>
              <li>
                <Link to="/waste-categories/organic-waste" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Organic Composting
                </Link>
              </li>
              <li>
                <Link to="/waste-categories/hazardous-waste" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Hazardous Disposal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-slate-100 mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-3 text-sm text-charcoal-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>support@ecocollect.demo</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>+1 800-ECO-COLLECT</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Metro Clean Hub #4</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-charcoal-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} EcoCollect Inc. All rights reserved. Smart Waste. Cleaner Communities.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for a cleaner planet</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};
