'use client';

import { X, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'women' | 'men'>('women');

  // STANDARD PAKISTANI READY-TO-WEAR MEASUREMENTS (IN INCHES)
  const womenSizes = [
    { size: 'XS', chest: '34-36', waist: '28-30', hips: '36-38', kameezLength: '36-38', trouserLength: '36' },
    { size: 'S', chest: '36-38', waist: '30-32', hips: '38-40', kameezLength: '38-40', trouserLength: '38' },
    { size: 'M', chest: '40-42', waist: '34-36', hips: '42-44', kameezLength: '40-42', trouserLength: '38-40' },
    { size: 'L', chest: '44-46', waist: '38-40', hips: '46-48', kameezLength: '42', trouserLength: '40' },
    { size: 'XL', chest: '48-50', waist: '42-44', hips: '50-52', kameezLength: '42', trouserLength: '40' },
  ];

  const menSizes = [
    { size: 'S', chest: '38-40', collar: '14.5-15', length: '38-40', sleeve: '24' },
    { size: 'M', chest: '40-42', collar: '15.5-16', length: '40-42', sleeve: '25' },
    { size: 'L', chest: '44-46', collar: '16.5-17', length: '42-44', sleeve: '26' },
    { size: 'XL', chest: '48-50', collar: '17.5-18', length: '44-46', sleeve: '27' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3 text-brand-dark">
                <div className="bg-white p-2 rounded-full shadow-sm text-brand-magenta">
                   <Ruler size={20} />
                </div>
                <div>
                   <h2 className="text-lg font-bold uppercase tracking-widest">Size Guide</h2>
                   <p className="text-xs text-gray-500">Standard Pakistani Ready-to-Wear Measurements (Inches)</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-red-500">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('women')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'women' ? 'bg-white text-brand-magenta border-b-2 border-brand-magenta' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
              >
                Women's Chart
              </button>
              <button 
                onClick={() => setActiveTab('men')}
                className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'men' ? 'bg-white text-brand-emerald border-b-2 border-brand-emerald' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
              >
                Men's Chart
              </button>
            </div>

            {/* Table Content */}
            <div className="p-6 overflow-x-auto">
              
              {activeTab === 'women' ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Chest (Bust)</th>
                      <th className="px-4 py-3">Waist</th>
                      <th className="px-4 py-3">Hips</th>
                      <th className="px-4 py-3">Kameez Length</th>
                      <th className="px-4 py-3">Trouser Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {womenSizes.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-brand-dark">{row.size}</td>
                        <td className="px-4 py-3">{row.chest}"</td>
                        <td className="px-4 py-3">{row.waist}"</td>
                        <td className="px-4 py-3">{row.hips}"</td>
                        <td className="px-4 py-3">{row.kameezLength}"</td>
                        <td className="px-4 py-3">{row.trouserLength}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Chest</th>
                      <th className="px-4 py-3">Collar</th>
                      <th className="px-4 py-3">Kurta Length</th>
                      <th className="px-4 py-3">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {menSizes.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-brand-dark">{row.size}</td>
                        <td className="px-4 py-3">{row.chest}"</td>
                        <td className="px-4 py-3">{row.collar}"</td>
                        <td className="px-4 py-3">{row.length}"</td>
                        <td className="px-4 py-3">{row.sleeve}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="mt-6 bg-brand-light/30 p-4 rounded-sm border border-brand-light flex items-start gap-3">
                 <div className="mt-1 min-w-[16px] h-4 rounded-full bg-brand-dark text-white text-[10px] flex items-center justify-center font-bold">i</div>
                 <p className="text-xs text-gray-500 leading-relaxed">
                   <strong>Note:</strong> These are garment measurements. We recommend choosing a size that is 2-3 inches larger than your actual body measurement for a comfortable fit. 
                   For "Unstitched" suits, standard fabric length is provided (approx. 7-8 meters for 3pc suits).
                 </p>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}