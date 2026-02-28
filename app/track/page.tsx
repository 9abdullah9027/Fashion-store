'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, CheckCircle, Truck, Package, CreditCard, ClipboardList, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STEPS = [
  { status: 'Pending Bank Transfer', label: 'Order Placed', icon: ClipboardList, desc: 'Waiting for payment confirmation.' },
  { status: 'Payment Received', label: 'Payment Confirmed', icon: CreditCard, desc: 'We have received your transfer.' },
  { status: 'Processing', label: 'Processing', icon: Package, desc: 'Your order is being prepared.' },
  { status: 'Out for Delivery', label: 'On the Way', icon: Truck, desc: 'Our driver is delivering your order.' },
  { status: 'Delivered', label: 'Delivered', icon: CheckCircle, desc: 'Package delivered successfully.' },
];

export default function TrackOrderPage() {
  const [inputId, setInputId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  // --- SMART PERSISTENCE LOGIC ---
  useEffect(() => {
    // 1. Check if the page was REFRESHED or NAVIGATED to
    const navEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';

    if (!isReload) {
      // If we arrived here from Home/Navbar (Navigate), clear any previous search
      localStorage.removeItem('last_tracked_order');
      setOrder(null);
      setInputId('');
    } else {
      // If it's a REFRESH, try to restore the last searched ID
      const savedId = localStorage.getItem('last_tracked_order');
      if (savedId) {
        setInputId(savedId);
        performTracking(savedId);
      }
    }
  }, []);

  const performTracking = async (idToTrack: string) => {
    if (!idToTrack) return;
    setLoading(true);
    setError('');
    
    try {
      const q = query(collection(db, 'orders'), where('orderId', '==', idToTrack.trim().toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("We couldn't find an order with that ID. Please check and try again.");
        setOrder(null);
      } else {
        const orderData = snapshot.docs[0].data();
        setOrder(orderData);
        // Save to local storage so it survives a refresh
        localStorage.setItem('last_tracked_order', idToTrack.trim().toUpperCase());
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputId.trim()) {
      performTracking(inputId);
    }
  };

  const getCurrentStepIndex = (status: string) => {
    return STEPS.findIndex(s => s.status === status);
  };

  const currentStep = order ? getCurrentStepIndex(order.status) : -1;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-3xl w-full space-y-8">
        
        <div className="text-center">
          <h1 className="text-3xl font-light text-brand-dark mb-2">Track Your <span className="font-bold">Order</span></h1>
          <p className="text-gray-500 mb-8">Enter your Order ID (e.g., ORD-849201) to see live updates.</p>

          <form onSubmit={handleTrackSubmit} className="relative max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Enter Order ID..." 
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="w-full pl-5 pr-14 py-4 rounded-full border border-gray-200 shadow-sm focus:outline-none focus:border-brand-magenta focus:ring-2 focus:ring-brand-magenta/20 transition-all text-sm font-bold uppercase tracking-widest text-brand-dark"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-brand-dark text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-magenta transition-colors disabled:opacity-70"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </form>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-4 font-medium flex items-center justify-center gap-2"
            >
              <XCircle size={16} /> {error}
            </motion.p>
          )}
        </div>

        <AnimatePresence>
          {order && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-sm shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="bg-brand-dark text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-70">Order ID</p>
                  <p className="text-xl font-bold">{order.orderId}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Amount</p>
                   <p className="text-xl font-bold">OMR {order.total.toFixed(3)}</p>
                </div>
              </div>

              {isCancelled ? (
                 <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                       <XCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Order Cancelled</h2>
                    <p className="text-gray-500 max-w-sm">This order has been cancelled. If you have any questions, please contact our support.</p>
                 </div>
              ) : (
                <div className="p-8 md:p-12">
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-100 md:hidden"></div>
                    <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-gray-100"></div>

                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }} 
                      transition={{ duration: 1, delay: 0.5 }}
                      className="hidden md:block absolute top-6 left-0 h-1 bg-brand-emerald z-0"
                    />

                    <div className="flex flex-col md:flex-row justify-between relative z-10 gap-8 md:gap-0">
                      {STEPS.map((step, index) => {
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                          <div key={index} className="flex md:flex-col items-center gap-4 md:gap-4 md:w-1/5">
                            <motion.div 
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: index * 0.2 }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500 ${
                                isCompleted ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/30' : 'bg-gray-100 text-gray-400'
                              } ${isCurrent ? 'ring-4 ring-brand-emerald/20' : ''}`}
                            >
                              <step.icon size={20} />
                            </motion.div>

                            <div className="md:text-center">
                              <p className={`text-sm font-bold uppercase tracking-wide mb-1 ${isCompleted ? 'text-brand-dark' : 'text-gray-400'}`}>
                                {step.label}
                              </p>
                              <p className="text-xs text-gray-500 font-light hidden md:block">
                                {step.desc}
                              </p>
                              <p className="text-xs text-gray-500 font-light md:hidden">
                                {isCurrent ? step.desc : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-12 bg-gray-50 p-4 rounded-sm border border-gray-100 flex items-center justify-between">
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Current Status</p>
                        <p className="text-lg font-bold text-brand-dark">{order.status}</p>
                     </div>
                     <Link href="/" className="text-xs font-bold uppercase tracking-widest text-brand-magenta hover:text-brand-dark flex items-center gap-1">
                        Continue Shopping <ArrowRight size={14} />
                     </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}