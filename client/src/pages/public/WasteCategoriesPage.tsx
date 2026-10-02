import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { WasteCategory } from '../../types';
import { Search, ArrowRight, Check, X, Calendar, Layers } from 'lucide-react';

export const WasteCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/waste-categories');
        if (res.data.success) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load waste categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const q = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q) ||
      cat.acceptedItems.some((i) => i.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Disposal Guidelines
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-white">
          Waste Categories & Segregation
        </h1>
        <p className="text-sm text-charcoal-600 dark:text-slate-400 leading-relaxed">
          Proper segregation at source is essential for successful recycling. Explore all 8 municipal
          streams, what items are accepted, and how to prepare them for collection.
        </p>

        {/* Search input */}
        <div className="pt-2 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items (e.g., laptop, cardboard, paint, bottles)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-sm text-charcoal-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading waste streams...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No matching categories found
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for another term like &quot;plastic&quot; or &quot;battery&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-48 relative overflow-hidden">
                  <img
                    src={
                      category.imageUrl ||
                      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-charcoal-600 dark:text-slate-400 leading-relaxed">
                    {category.description}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Accepted Materials:
                    </span>
                    <ul className="text-xs text-charcoal-700 dark:text-slate-300 space-y-1">
                      {category.acceptedItems.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-charcoal-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Do NOT Include:
                    </span>
                    <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                      {category.rejectedItems.slice(0, 2).map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-2">
                <Link
                  to={`/waste-categories/${category.slug}`}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 dark:hover:bg-charcoal-700 text-xs font-semibold text-charcoal-800 dark:text-slate-200 transition-colors"
                >
                  <span>Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to={`/request-pickup?category=${category.id}`}
                  className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Pickup</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
