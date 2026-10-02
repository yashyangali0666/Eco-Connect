import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { WasteCategory } from '../../types';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Layers, Check, X, ShieldCheck } from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModalCat, setEditModalCat] = useState<WasteCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const [formState, setFormState] = useState({
    name: '',
    slug: '',
    description: '',
    icon: 'Recycle',
    color: '#10B981',
    imageUrl: '',
    acceptedItemsStr: '',
    rejectedItemsStr: '',
    disposalInstructions: '',
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/waste-categories', {
        params: { includeInactive: true },
      });
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openEditModal = (cat: WasteCategory) => {
    setEditModalCat(cat);
    setFormState({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon || 'Recycle',
      color: cat.color || '#10B981',
      imageUrl: cat.imageUrl || '',
      acceptedItemsStr: cat.acceptedItems.join(', '),
      rejectedItemsStr: cat.rejectedItems.join(', '),
      disposalInstructions: cat.disposalInstructions,
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: formState.name,
      slug: formState.slug,
      description: formState.description,
      icon: formState.icon,
      color: formState.color,
      imageUrl: formState.imageUrl || null,
      acceptedItems: formState.acceptedItemsStr.split(',').map((s) => s.trim()).filter(Boolean),
      rejectedItems: formState.rejectedItemsStr.split(',').map((s) => s.trim()).filter(Boolean),
      disposalInstructions: formState.disposalInstructions,
    };

    try {
      if (editModalCat) {
        const res = await api.put(`/waste-categories/${editModalCat.id}`, payload);
        if (res.data.success) {
          success('Category Updated', 'Waste category updated successfully.');
          setEditModalCat(null);
          fetchCategories();
        }
      } else {
        const res = await api.post('/waste-categories', payload);
        if (res.data.success) {
          success('Category Added', 'New waste category created.');
          setShowAddModal(false);
          fetchCategories();
        }
      }
    } catch (err: any) {
      error('Failed to save category', err.response?.data?.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white tracking-tight">
            Waste Category Management
          </h1>
          <p className="text-xs text-charcoal-500 dark:text-slate-400">
            Define segregated municipal streams, accepted materials, and citizen guidelines
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormState({
              name: '',
              slug: '',
              description: '',
              icon: 'Recycle',
              color: '#10B981',
              imageUrl: '',
              acceptedItemsStr: '',
              rejectedItemsStr: '',
              disposalInstructions: '',
            });
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Waste Category</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="h-40 relative">
                  <img
                    src={
                      cat.imageUrl ||
                      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                    <h3 className="font-bold text-base">{cat.name}</h3>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
                      /{cat.slug}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-charcoal-600 dark:text-slate-400 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                      Accepted:
                    </span>
                    <p className="text-slate-500 line-clamp-2">{cat.acceptedItems.join(', ')}</p>
                  </div>

                  <div className="space-y-1 text-xs border-t border-slate-100 dark:border-charcoal-800 pt-2">
                    <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                      Rejected:
                    </span>
                    <p className="text-slate-500 line-clamp-1">{cat.rejectedItems.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 dark:border-charcoal-800 mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {cat._count?.pickupRequests ?? 0} tickets logged
                </span>

                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-charcoal-700 hover:bg-slate-50 dark:hover:bg-charcoal-800 text-xs font-semibold text-charcoal-800 dark:text-slate-200 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={showAddModal || !!editModalCat}
        onClose={() => {
          setShowAddModal(false);
          setEditModalCat(null);
        }}
        maxWidth="lg"
        title={editModalCat ? `Edit ${editModalCat.name}` : 'Create New Waste Stream'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="e.g. Glass & Metal Waste"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Slug (URL Path) *
              </label>
              <input
                type="text"
                required
                value={formState.slug}
                onChange={(e) => setFormState({ ...formState, slug: e.target.value })}
                placeholder="glass-metal-waste"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Description *
            </label>
            <textarea
              rows={2}
              required
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Accepted Items (comma-separated) *
            </label>
            <input
              type="text"
              required
              value={formState.acceptedItemsStr}
              onChange={(e) => setFormState({ ...formState, acceptedItemsStr: e.target.value })}
              placeholder="e.g. Glass bottles, Metal lids, Clean tins"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Rejected Items / Contaminants (comma-separated) *
            </label>
            <input
              type="text"
              required
              value={formState.rejectedItemsStr}
              onChange={(e) => setFormState({ ...formState, rejectedItemsStr: e.target.value })}
              placeholder="e.g. Broken mirrors, Porcelain, Lightbulbs"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Preparation & Safety Instructions *
            </label>
            <textarea
              rows={2}
              required
              value={formState.disposalInstructions}
              onChange={(e) =>
                setFormState({ ...formState, disposalInstructions: e.target.value })
              }
              placeholder="Rinse clean and dry before collection..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
              Image URL (Optional)
            </label>
            <input
              type="url"
              value={formState.imageUrl}
              onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-xs text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditModalCat(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
