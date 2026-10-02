import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, Check, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';

interface WasteItemRule {
  keywords: string[];
  name: string;
  category: string;
  categorySlug: string;
  guidance: string;
  badge: string;
  isHazardous?: boolean;
}

const RULES: WasteItemRule[] = [
  {
    keywords: ['laptop', 'notebook', 'macbook', 'computer', 'pc', 'desktop'],
    name: 'Old Laptop / Computer',
    category: 'E-Waste',
    categorySlug: 'e-waste',
    guidance: 'Never discard in municipal trash. Back up and factory reset your device to protect personal data. Schedule an E-Waste collection.',
    badge: 'Certified E-Steward Recycling',
  },
  {
    keywords: ['phone', 'mobile', 'smartphone', 'iphone', 'android', 'tablet', 'ipad'],
    name: 'Mobile Phone / Tablet',
    category: 'E-Waste',
    categorySlug: 'e-waste',
    guidance: 'Contains cobalt, lithium, and precious metals. Remove SIM and memory cards before handover.',
    badge: 'Precious Metals Recovery',
  },
  {
    keywords: ['battery', 'batteries', 'cell', 'lithium', 'alkaline', 'car battery'],
    name: 'Household & Vehicle Batteries',
    category: 'Hazardous Waste',
    categorySlug: 'hazardous-waste',
    guidance: 'Fire hazard! Tape the positive and negative terminals with clear tape to prevent short circuits.',
    badge: 'Toxic Safety Protocol',
    isHazardous: true,
  },
  {
    keywords: ['paint', 'thinner', 'varnish', 'chemical', 'solvent', 'pesticide'],
    name: 'Paint & Chemical Cans',
    category: 'Hazardous Waste',
    categorySlug: 'hazardous-waste',
    guidance: 'Keep in original sealed tins with visible labels. Never pour down domestic storm drains.',
    badge: 'Chemical Neutralization',
    isHazardous: true,
  },
  {
    keywords: ['sofa', 'couch', 'chair', 'table', 'desk', 'mattress', 'bed', 'furniture'],
    name: 'Bulky Furniture & Mattresses',
    category: 'Bulk Waste',
    categorySlug: 'bulk-waste',
    guidance: 'Disassemble removable components and place near ground-level freight loading area.',
    badge: 'Oversized Logistics',
  },
  {
    keywords: ['clothes', 'shirt', 'pants', 'jacket', 'textile', 'fabric', 'shoes', 'curtains'],
    name: 'Clothing & Domestic Textiles',
    category: 'Textile Waste',
    categorySlug: 'textile-waste',
    guidance: 'Must be clean and dry. Bag securely in clear bags to protect fibers from dampness.',
    badge: 'Circular Fiber Stream',
  },
  {
    keywords: ['food', 'vegetable', 'fruit', 'scraps', 'leftovers', 'coffee', 'leaves', 'garden', 'grass'],
    name: 'Kitchen Scraps & Garden Waste',
    category: 'Organic / Wet Waste',
    categorySlug: 'organic-waste',
    guidance: 'Drain liquids and place in compostable liner. Feeds municipal bio-digesters and organic compost.',
    badge: 'Composting & Biogas',
  },
  {
    keywords: ['plastic', 'bottle', 'jug', 'container', 'wrapper', 'pet', 'hdpe'],
    name: 'Plastic Containers & Bottles',
    category: 'Plastic Waste',
    categorySlug: 'plastic-waste',
    guidance: 'Rinse out food residues, compress to reduce volume, and replace screw caps firmly.',
    badge: 'Polymer Repurposing',
  },
  {
    keywords: ['cardboard', 'box', 'paper', 'newspaper', 'magazine', 'carton', 'book'],
    name: 'Cardboard & Paper Packaging',
    category: 'Paper Waste',
    categorySlug: 'paper-waste',
    guidance: 'Flatten shipping boxes. Keep away from oil, grease, or liquids to prevent pulp contamination.',
    badge: 'Pulping & Mill Stream',
  },
];

export const SmartWasteGuidePage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<WasteItemRule | null>(RULES[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.toLowerCase().trim();
    const matched = RULES.find((rule) =>
      rule.keywords.some((kw) => q.includes(kw) || kw.includes(q))
    );

    if (matched) {
      setResult(matched);
    } else {
      setResult(null);
    }
  };

  const handleSelectPredefined = (rule: WasteItemRule) => {
    setQuery(rule.name);
    setResult(rule);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Segregation Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-white">
          Smart Waste Disposal Guide
        </h1>
        <p className="text-sm text-charcoal-600 dark:text-slate-400 max-w-xl mx-auto">
          Type an item description below or click popular objects to see how to properly dispose of them.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="e.g. What should I do with an old laptop? or batteries..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Live match on change
              const q = e.target.value.toLowerCase().trim();
              if (q.length > 2) {
                const matched = RULES.find((r) =>
                  r.keywords.some((kw) => q.includes(kw) || kw.includes(q))
                );
                if (matched) setResult(matched);
              }
            }}
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 text-sm text-charcoal-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Classify
          </button>
        </div>

        {/* Quick Click Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
          <span className="text-xs text-slate-400 font-medium">Quick examples:</span>
          {RULES.slice(0, 5).map((r, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPredefined(r)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 dark:hover:bg-charcoal-700 text-xs font-medium text-charcoal-700 dark:text-slate-300 transition-colors"
            >
              {r.name}
            </button>
          ))}
        </div>
      </form>

      {/* Result Card */}
      {result ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-charcoal-800 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                Official Category Recommendation
              </span>
              <h3 className="text-2xl font-extrabold text-charcoal-900 dark:text-white mt-1">
                {result.category}
              </h3>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto ${
                result.isHazardous
                  ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                  : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {result.badge}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-charcoal-800 dark:text-slate-200">
              Guidance for: <span className="text-brand-600 dark:text-brand-400">{result.name}</span>
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-charcoal-800/60 p-4 rounded-xl border border-slate-200 dark:border-charcoal-700">
              {result.guidance}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/request-pickup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <span>Schedule Pickup for this Item</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={`/waste-categories/${result.categorySlug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              <span>View {result.category} Standards</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-charcoal-800 dark:text-slate-200">
            No specific rule matched for &quot;{query}&quot;
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try searching with simplified terms like &quot;laptop&quot;, &quot;battery&quot;, &quot;paint&quot;, or browse our full waste category list.
          </p>
          <Link
            to="/waste-categories"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-charcoal-800 text-xs font-semibold rounded-xl text-charcoal-700 dark:text-slate-200"
          >
            <span>Explore All 8 Streams</span>
          </Link>
        </div>
      )}
    </div>
  );
};
