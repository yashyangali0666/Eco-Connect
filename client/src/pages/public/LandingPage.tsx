import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { WasteCategory } from '../../types';
import {
  Recycle,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Sparkles,
  HelpCircle,
  Package,
  Layers,
  Search,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [stats, setStats] = useState({
    totalPickups: '1,250+',
    activeStreams: '8 Categories',
    trackingRate: '99.8%',
    cleanCommunities: '12 Districts',
  });

  // Smart waste classification helper state
  const [selectedHelperItem, setSelectedHelperItem] = useState<string>('Old Smartphone');

  const smartHelperData: Record<
    string,
    { category: string; slug: string; guidance: string; badge: string }
  > = {
    'Old Smartphone': {
      category: 'E-Waste',
      slug: 'e-waste',
      guidance: 'Contains precious rare metals and heavy minerals. Wipe private data and request e-waste pickup.',
      badge: 'High Value Recycling',
    },
    'Cardboard Shipping Box': {
      category: 'Recyclable Waste',
      slug: 'recyclable-waste',
      guidance: 'Flatten completely to save truck space and keep strictly dry from moisture.',
      badge: 'Standard Pulp Stream',
    },
    'Vegetable Peels & Coffee': {
      category: 'Organic / Wet Waste',
      slug: 'organic-waste',
      guidance: 'Drain liquids and place in compostable caddy liner for city nutrient composting.',
      badge: 'Soil Regeneration',
    },
    'Alkaline AA Batteries': {
      category: 'Hazardous Waste',
      slug: 'hazardous-waste',
      guidance: 'Never discard in municipal bin! Seal terminals with tape and request hazardous disposal.',
      badge: 'Toxic Safety Control',
    },
    'PET Soda Bottles': {
      category: 'Plastic Waste',
      slug: 'plastic-waste',
      guidance: 'Rinse out soda residues, crush bottle flat, and screw the bottle cap back on.',
      badge: 'Polymer Reprocessing',
    },
    'Old Winter Jacket': {
      category: 'Textile Waste',
      slug: 'textile-waste',
      guidance: 'Wash and pack in clean moisture-proof bag for fiber repurposing or charitable reuse.',
      badge: 'Circular Fashion',
    },
    'Wooden Bookcase': {
      category: 'Bulk Waste',
      slug: 'bulk-waste',
      guidance: 'Disassemble shelves if possible and place on ground-level accessible loading point.',
      badge: 'Oversize Collection',
    },
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/waste-categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-brand-50/60 via-slate-50 to-white dark:from-brand-950/20 dark:via-charcoal-950 dark:to-charcoal-950">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-400/10 dark:bg-brand-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Next-Gen Municipal & Household Recycling</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 dark:text-white tracking-tight leading-[1.15]"
              >
                Smart Waste Collection for{' '}
                <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Cleaner Communities.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-charcoal-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Request waste pickups, understand proper disposal, schedule collections,
                and track every request from one simple, transparent platform.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
              >
                <Link
                  to="/request-pickup"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/35 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request a Pickup</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/waste-categories"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-charcoal-800 dark:text-slate-100 bg-white dark:bg-charcoal-800/80 hover:bg-slate-50 dark:hover:bg-charcoal-800 border border-slate-200 dark:border-charcoal-700 rounded-xl shadow-xs transition-all hover:scale-[1.02]"
                >
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>Explore Waste Categories</span>
                </Link>
              </motion.div>

              {/* Feature Highlights */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-charcoal-500 dark:text-slate-400 font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Zero landfill diversion</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Doorstep pickup tracking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Certified e-waste recycling</span>
                </div>
              </motion.div>
            </div>

            {/* Right Visual with Interactive Floating Cards */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 p-2">
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80"
                  alt="Modern clean recycling facility"
                  className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                />

                {/* Floating Card 1: Pickup Scheduled */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-6 -left-6 sm:-left-8 bg-white/95 dark:bg-charcoal-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 dark:border-charcoal-700 flex items-center gap-3 z-20"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      Confirmed
                    </span>
                    <p className="text-xs font-bold text-charcoal-900 dark:text-slate-100">
                      Pickup Scheduled
                    </p>
                    <p className="text-[10px] text-slate-400">Today, 10:00 AM</p>
                  </div>
                </motion.div>

                {/* Floating Card 2: Plastic Waste Stream */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-16 -right-4 sm:-right-6 bg-white/95 dark:bg-charcoal-800/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-100 dark:border-charcoal-700 flex items-center gap-3 z-20"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block">
                      Segregated
                    </span>
                    <p className="text-xs font-bold text-charcoal-900 dark:text-slate-100">
                      Clean Plastic Stream
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      +4.5 kg diverted
                    </p>
                  </div>
                </motion.div>

                {/* Floating Card 3: Collection Completed */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-5 left-10 bg-white/95 dark:bg-charcoal-800/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-charcoal-700 flex items-center gap-2.5 z-20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-charcoal-800 dark:text-slate-200">
                    Collection Completed & Recycled
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm">
          <div className="text-center p-3">
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">
              {stats.totalPickups}
            </p>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Pickup Requests
            </p>
          </div>
          <div className="text-center p-3 border-l border-slate-100 dark:border-charcoal-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">
              {stats.activeStreams}
            </p>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Segregated Streams
            </p>
          </div>
          <div className="text-center p-3 border-l border-slate-100 dark:border-charcoal-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400 tracking-tight">
              {stats.trackingRate}
            </p>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Requests Tracked
            </p>
          </div>
          <div className="text-center p-3 border-l border-slate-100 dark:border-charcoal-800">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.cleanCommunities}
            </p>
            <p className="text-xs font-semibold text-charcoal-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
              Communities Served
            </p>
          </div>
        </div>
      </section>

      {/* 3. WASTE CATEGORY EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Segregation Directory
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-white">
            Explore Waste Categories
          </h2>
          <p className="text-sm text-charcoal-600 dark:text-slate-400">
            Understanding how to separate materials ensures high recovery rates and prevents landfill contamination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="group rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={
                      category.imageUrl ||
                      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="font-bold text-base tracking-tight">{category.name}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-charcoal-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Accepted Examples:
                    </span>
                    <ul className="text-xs text-charcoal-700 dark:text-slate-300 space-y-1">
                      {category.acceptedItems.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/waste-categories/${category.slug}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-charcoal-700 dark:text-slate-200 bg-slate-100 dark:bg-charcoal-800 group-hover:bg-brand-600 group-hover:text-white rounded-xl transition-all"
                >
                  <span>View Guidelines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. SMART WASTE CLASSIFIER HELPER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-charcoal-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Helper</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Not sure how to dispose of an item?
              </h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                Click any common household object below to instantly check its designated category
                and responsible handling instructions.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {Object.keys(smartHelperData).map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedHelperItem(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedHelperItem === item
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              {smartHelperData[selectedHelperItem] && (
                <motion.div
                  key={selectedHelperItem}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-emerald-300 font-bold block">
                        Category Matched
                      </span>
                      <h4 className="text-2xl font-extrabold text-white">
                        {smartHelperData[selectedHelperItem].category}
                      </h4>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 rounded-full text-xs font-semibold">
                      {smartHelperData[selectedHelperItem].badge}
                    </span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">
                    {smartHelperData[selectedHelperItem].guidance}
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <Link
                      to={`/waste-categories/${smartHelperData[selectedHelperItem].slug}`}
                      className="px-4 py-2 bg-white text-charcoal-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      View Category Details
                    </Link>
                    <Link
                      to="/request-pickup"
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-400 transition-colors"
                    >
                      Schedule Collection
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS TIMELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Simple 4-Step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-white">
            How EcoCollect Works
          </h2>
          <p className="text-sm text-charcoal-600 dark:text-slate-400">
            From doorstep request to certified sorting facilities in four transparent stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Select Waste Stream',
              desc: 'Choose from 8 distinct waste categories and review prep guidelines.',
              icon: Layers,
            },
            {
              step: '02',
              title: 'Enter Pickup Location',
              desc: 'Pinpoint your address accurately using our Leaflet interactive map.',
              icon: Truck,
            },
            {
              step: '03',
              title: 'Schedule Collection',
              desc: 'Select a convenient date and time slot for our eco-fleet vehicle.',
              icon: Calendar,
            },
            {
              step: '04',
              title: 'Track Doorstep Pickup',
              desc: 'Monitor collector route progression with live milestone updates.',
              icon: CheckCircle2,
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-sm space-y-4"
              >
                <span className="text-4xl font-black text-slate-100 dark:text-charcoal-800 select-none absolute top-4 right-4">
                  {item.step}
                </span>
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 dark:text-slate-100">
                  {item.title}
                </h3>
                <p className="text-xs text-charcoal-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-teal-700 p-8 sm:p-14 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold max-w-2xl mx-auto tracking-tight">
            Ready to make your community cleaner and greener?
          </h2>
          <p className="text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Submit your first waste collection request today and join thousands of conscious
            citizens recycling responsibly with EcoCollect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/request-pickup"
              className="px-8 py-3.5 bg-white text-brand-700 hover:bg-slate-100 font-bold text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Request a Pickup Now
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 bg-brand-700/60 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl border border-brand-400/40 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
