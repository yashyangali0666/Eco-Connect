import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { WasteCategory } from '../../types';
import { useToast } from '../../context/ToastContext';
import { MapPicker } from '../../components/maps/MapPicker';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Upload,
  ArrowRight,
  ArrowLeft,
  Package,
  Layers,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

const TIME_SLOTS = [
  '08:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 02:00 PM',
  '02:00 PM – 04:00 PM',
  '04:00 PM – 06:00 PM',
];

export const RequestPickupPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCatId = searchParams.get('category');
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [isLoadingCats, setIsLoadingCats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('kg');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Location State
  const [pickupAddress, setPickupAddress] = useState<string>('742 Evergreen Terrace, Apt 4B');
  const [city, setCity] = useState<string>('Springfield');
  const [state, setState] = useState<string>('IL');
  const [postalCode, setPostalCode] = useState<string>('62704');
  const [landmark, setLandmark] = useState<string>('Near Community Garden');
  const [latitude, setLatitude] = useState<number>(39.7817);
  const [longitude, setLongitude] = useState<number>(-89.6501);

  // Schedule State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState<string>(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[1]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/waste-categories');
        if (res.data.success) {
          setCategories(res.data.data);
          if (preselectedCatId) {
            const found = res.data.data.find((c: WasteCategory) => c.id === preselectedCatId);
            if (found) setSelectedCategory(found);
          } else if (res.data.data.length > 0) {
            setSelectedCategory(res.data.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoadingCats(false);
      }
    };
    fetchCategories();
  }, [preselectedCatId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedCategory) {
      error('Selection required', 'Please pick a waste category to proceed');
      return;
    }
    if (step === 2 && (!quantity || quantity <= 0)) {
      error('Invalid quantity', 'Please specify a valid quantity greater than zero');
      return;
    }
    if (step === 3 && (!pickupAddress.trim() || !city.trim() || !postalCode.trim())) {
      error('Missing address', 'Please enter your pickup address, city, and postal code');
      return;
    }
    if (step === 4 && (!pickupDate || !timeSlot)) {
      error('Missing schedule', 'Please pick a pickup date and time slot');
      return;
    }
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);

    try {
      let uploadedImageUrl: string | null = null;

      // Optional image upload
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          const uploadRes = await api.post('/requests/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadRes.data.success) {
            uploadedImageUrl = uploadRes.data.data.url;
          }
        } catch (uploadErr) {
          console.warn('Image upload failed, proceeding without attachment:', uploadErr);
        }
      }

      const payload = {
        wasteCategoryId: selectedCategory.id,
        quantity: Number(quantity),
        unit,
        description: description || null,
        pickupAddress,
        city,
        state,
        postalCode,
        landmark: landmark || null,
        latitude,
        longitude,
        pickupDate: new Date(pickupDate).toISOString(),
        timeSlot,
        imageUrl: uploadedImageUrl,
      };

      const res = await api.post('/requests', payload);

      if (res.data.success) {
        success('Pickup Scheduled!', `Request ${res.data.data.requestNumber} logged.`);
        setSubmittedRequest(res.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit pickup request';
      error('Submission Error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-xl text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-white">
              Pickup Request Submitted!
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 max-w-md mx-auto">
              Our collection logistics team has received your request and will assign a nearby collector soon.
            </p>
          </div>

          {/* Details Ticket */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-200 dark:border-charcoal-700 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-charcoal-700">
              <span className="text-xs text-slate-400 uppercase font-semibold">Request ID</span>
              <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">
                {submittedRequest.requestNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Waste Stream</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200">
                  {selectedCategory?.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Quantity</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200">
                  {quantity} {unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Scheduled Date</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200">
                  {new Date(pickupDate).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Time Slot</span>
                <span className="font-semibold text-charcoal-800 dark:text-slate-200">
                  {timeSlot}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-charcoal-700 text-xs">
              <span className="text-slate-400 block">Pickup Address</span>
              <span className="font-semibold text-charcoal-800 dark:text-slate-200">
                {pickupAddress}, {city}, {state} {postalCode}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/requests/${submittedRequest.id}`}
              className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-105"
            >
              Track Request Live
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Step Progress Tracker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Step {step} of 5</span>
          <span className="text-charcoal-900 dark:text-slate-100">
            {step === 1 && 'Select Waste Category'}
            {step === 2 && 'Waste Quantity & Details'}
            {step === 3 && 'Pickup Address & Map'}
            {step === 4 && 'Choose Date & Time Slot'}
            {step === 5 && 'Review & Submit'}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-charcoal-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-teal-500 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: SELECT WASTE CATEGORY */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-charcoal-900 dark:text-white">
              Select Waste Category
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Pick the primary stream for this collection request to view prep guidelines.
            </p>
          </div>

          {isLoadingCats ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading categories...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-44 overflow-hidden group ${
                      isSelected
                        ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/40 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 hover:border-slate-300 dark:hover:border-charcoal-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-charcoal-900 dark:text-slate-100">
                          {cat.name}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-500 dark:text-slate-400 line-clamp-3">
                        {cat.description}
                      </p>
                    </div>

                    <span className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                      <span>Guidelines</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Category Guideline Notice */}
          {selectedCategory && (
            <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-start gap-3.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-emerald-900 dark:text-emerald-200">
                  Preparation Advice for {selectedCategory.name}
                </span>
                <p className="text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {selectedCategory.disposalInstructions}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* STEP 2: WASTE DETAILS */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-charcoal-900 dark:text-white">
              Estimated Quantity & Notes
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Provide an estimate of the volume and any special instructions for the collector.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-6 shadow-sm">
            {/* Quantity and Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                  Estimated Quantity *
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                  Unit of Measurement *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="kg">kg (Kilograms by weight)</option>
                  <option value="bags">bags (Standard recycling bags)</option>
                  <option value="items">items (Individual appliances/furniture items)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Item Description & Contents (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 2 cardboard shipping boxes, 4 laptop chargers, clean glass wine bottles..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Photo Upload with preview */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300 flex items-center justify-between">
                <span>Attach Photo (Optional)</span>
                <span className="text-[11px] text-slate-400">JPG, PNG, WEBP up to 5MB</span>
              </label>

              {imagePreview ? (
                <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-charcoal-700 group">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 dark:border-charcoal-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-500 dark:hover:border-brand-400 transition-colors">
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                    Click to upload waste photo
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 3: PICKUP LOCATION & LEAFLET MAP */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-charcoal-900 dark:text-white">
              Pickup Location
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Confirm your pickup address and adjust the map pin to the exact doorstep location.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-5 shadow-sm">
            {/* Street Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Street Address *
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="742 Evergreen Terrace, Apt 4B"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Landmark or Access Notes (Optional)
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Front porch, side gate, near apartment lobby reception"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Leaflet Map Picker */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Interactive Pin Location
              </label>
              <MapPicker
                latitude={latitude}
                longitude={longitude}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                height="280px"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 4: SCHEDULE PICKUP */}
      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-charcoal-900 dark:text-white">
              Schedule Collection
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Select a date and available time slot for our collection officer to arrive.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 space-y-6 shadow-sm">
            {/* Pickup Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Pickup Date *
              </label>
              <input
                type="date"
                required
                min={tomorrowStr}
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 bg-slate-50 dark:bg-charcoal-800 text-sm text-charcoal-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-charcoal-700 dark:text-slate-300">
                Available Time Slots *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                          : 'border-slate-200 dark:border-charcoal-700 hover:border-slate-300 dark:hover:border-charcoal-600 bg-slate-50/50 dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>{slot}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-600 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {step === 5 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-charcoal-900 dark:text-white">
              Review Pickup Request
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              Please verify all details before submitting your collection ticket.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-charcoal-900 border border-slate-200 dark:border-charcoal-800 shadow-md space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1 p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700">
                <span className="text-slate-400 font-medium">Waste Category</span>
                <p className="text-sm font-bold text-charcoal-900 dark:text-white">
                  {selectedCategory?.name}
                </p>
              </div>

              <div className="space-y-1 p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700">
                <span className="text-slate-400 font-medium">Estimated Volume</span>
                <p className="text-sm font-bold text-charcoal-900 dark:text-white">
                  {quantity} {unit}
                </p>
              </div>

              <div className="space-y-1 p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700">
                <span className="text-slate-400 font-medium">Pickup Schedule</span>
                <p className="text-sm font-bold text-charcoal-900 dark:text-white">
                  {new Date(pickupDate).toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  • {timeSlot}
                </p>
              </div>

              <div className="space-y-1 p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700">
                <span className="text-slate-400 font-medium">Pickup Address</span>
                <p className="text-sm font-bold text-charcoal-900 dark:text-white truncate">
                  {pickupAddress}, {city}, {state} {postalCode}
                </p>
              </div>
            </div>

            {description && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-charcoal-800/60 border border-slate-100 dark:border-charcoal-700 text-xs">
                <span className="text-slate-400 font-medium block mb-1">Citizen Notes</span>
                <p className="text-charcoal-700 dark:text-slate-300">{description}</p>
              </div>
            )}

            {imagePreview && (
              <div className="space-y-1 text-xs">
                <span className="text-slate-400 font-medium">Attached Image</span>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-slate-200 dark:border-charcoal-700"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-charcoal-800">
        {step > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-charcoal-700 text-xs font-semibold text-charcoal-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-charcoal-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-600/25 transition-all"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-teal-600 hover:from-brand-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Submit Pickup Request</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
