import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { WasteCategory } from '../../types';
import { Check, X, Calendar, AlertTriangle, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export const WasteCategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<WasteCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`/waste-categories/${slug}`);
        if (res.data.success) {
          setCategory(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load category:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategory();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-charcoal-900 dark:text-slate-100">
          Category Not Found
        </h2>
        <p className="text-xs text-slate-500">
          The requested waste stream does not exist or has been retired.
        </p>
        <Link
          to="/waste-categories"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Waste Categories</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/waste-categories"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Categories</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-md">
        <div className="h-64 sm:h-80 relative overflow-hidden">
          <img
            src={
              category.imageUrl ||
              'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80'
            }
            alt={category.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Official Stream Standard
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {category.name}
              </h1>
            </div>
            <Link
              to={`/request-pickup?category=${category.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Request {category.name} Pickup</span>
            </Link>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-10 space-y-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
              Overview & Environmental Impact
            </h2>
            <p className="text-sm text-charcoal-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              {category.description}
            </p>
          </div>

          {/* Accepted vs Rejected Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Accepted */}
            <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                  Accepted Materials
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-charcoal-800 dark:text-slate-200">
                {category.acceptedItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rejected */}
            <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/40 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
                  <X className="w-4 h-4 stroke-[3]" />
                </div>
                <h3 className="font-bold text-rose-900 dark:text-rose-200 text-base">
                  Do NOT Include (Contaminants)
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-charcoal-800 dark:text-slate-200">
                {category.rejectedItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Preparation Instructions */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 space-y-3">
            <div className="flex items-center gap-2 text-charcoal-900 dark:text-slate-100 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Preparation & Safety Instructions</span>
            </div>
            <p className="text-xs text-charcoal-600 dark:text-slate-300 leading-relaxed">
              {category.disposalInstructions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
