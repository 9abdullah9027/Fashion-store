'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronRight, Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [queryText, setQueryText] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. FETCH PRODUCTS ON OPEN (For Instant Filtering)
  useEffect(() => {
    if (isOpen) {
      // Focus input instantly
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // Fetch data if not already loaded
      if (products.length === 0) {
        setLoading(true);
        const fetchAll = async () => {
          try {
            // We fetch top 50 recent items to keep it fast. 
            // For larger stores, we'd use server-side search (Algolia/Typesense).
            const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(data);
          } catch (error) {
            console.error("Search Error:", error);
          } finally {
            setLoading(false);
          }
        };
        fetchAll();
      }
    }
  }, [isOpen]);

  // 2. FILTER LOGIC (Instant)
  useEffect(() => {
    if (!queryText.trim()) {
      setResults([]);
      return;
    }
    
    const searchTerms = queryText.toLowerCase().split(' ');
    
    const filtered = products.filter(product => {
      const title = product.title?.toLowerCase() || '';
      const category = product.category?.toLowerCase() || '';
      const brand = product.brand?.toLowerCase() || '';
      
      // Check if ALL search terms are present in title, category, or brand
      return searchTerms.every(term => 
        title.includes(term) || category.includes(term) || brand.includes(term)
      );
    });

    setResults(filtered.slice(0, 6)); // Show top 6 matches
  }, [queryText, products]);

  // Prevent scrolling when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col"
        >
          {/* HEADER BAR */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
             <div className="flex-1 max-w-4xl mx-auto flex items-center gap-4">
                <Search size={24} className="text-gray-400" />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Search for velvet, lawn, embroidered..." 
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  className="w-full text-2xl font-light bg-transparent placeholder:text-gray-300 focus:outline-none text-brand-dark"
                />
                {loading && <Loader2 className="animate-spin text-brand-magenta" />}
             </div>
             <button 
               onClick={onClose}
               className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
             >
               <X size={24} className="text-gray-500" />
             </button>
          </div>

          {/* RESULTS AREA */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              
              {!queryText && (
                <div className="mt-20 text-center">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-300 mb-4">Popular Suggestions</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Velvet', 'Lawn 2024', 'Bridal', 'Zelbury', 'Chiffon'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setQueryText(tag)}
                        className="px-4 py-2 border border-gray-200 rounded-full text-sm text-gray-500 hover:border-brand-magenta hover:text-brand-magenta transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {queryText && results.length === 0 && !loading && (
                <div className="mt-20 text-center text-gray-400">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No products found for "{queryText}"</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {results.map((product) => (
                  <Link 
                    key={product.id} 
                    href={`/product/${product.id}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-4 rounded-sm hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                  >
                    <div className="w-16 h-20 bg-gray-100 shrink-0 overflow-hidden rounded-sm">
                      <img src={product.images?.[0] || product.image} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{product.brand}</p>
                      <h4 className="font-medium text-brand-dark group-hover:text-brand-magenta transition-colors">{product.title}</h4>
                      <p className="text-sm font-bold text-brand-dark mt-1">OMR {product.price}</p>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-magenta opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                ))}
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}