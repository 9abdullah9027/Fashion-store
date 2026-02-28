'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, Truck, ShieldCheck, Ruler, Minus, Plus, ShoppingBag, Loader2, X, ZoomIn, Heart, Flame } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/GlobalWishlist'; 
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import SizeGuideModal from '@/components/SizeGuideModal';
import ProductCard from '@/components/ProductCard';

const ALL_SIZES_DISPLAY = ['Unstitched', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const mainImageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState('center center');

  // Hover Zoom Logic
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current || !containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // 1. Fetch Main Product
        const docRef = doc(db, 'products', params.id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentProduct = { id: docSnap.id, ...data };
          setProduct(currentProduct);
          setActiveImage(data.images?.[0] || data.image);
          if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
          else setSelectedSize('Unstitched');

          // 2. Fetch Related Products (Same Category)
          const relatedQuery = query(
            collection(db, 'products'),
            where('category', '==', data.category),
            limit(5)
          );
          const relatedSnap = await getDocs(relatedQuery);
          const relatedData = relatedSnap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .filter(p => p.id !== params.id) // Exclude current product
            .slice(0, 4); // Show only 4
          setRelatedProducts(relatedData);
        }
      } catch (error) { 
        console.error("Error fetching data:", error); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchData();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      title: product.title,
      price: parseFloat(product.price),
      deliveryFee: parseFloat(product.deliveryFee || '2.500'),
      image: activeImage,
      size: selectedSize,
      quantity: quantity
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleWishlist = () => {
    if (!product) return;
    const item = { id: product.id, title: product.title, price: parseFloat(product.price), image: activeImage, brand: product.brand };
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist(item);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-brand-magenta"><Loader2 className="animate-spin" size={40} /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500 uppercase tracking-widest text-xs font-bold">Product Not Found</div>;

  const imageList = Array.isArray(product.images) ? product.images : [product.image];
  const isLiked = isInWishlist(product.id);
  const stockLevel = product.stock !== undefined ? product.stock : 100; 
  const isLowStock = stockLevel < 5 && stockLevel > 0;

  // Structured Data (JSON-LD) for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: activeImage,
    description: product.description,
    brand: { '@type': 'Brand', name: product.brand },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'OMR',
      availability: stockLevel > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="bg-white min-h-screen pt-8 pb-24 relative">
      {/* SEO Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-brand-magenta transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          
          {/* IMAGE SECTION */}
          <div className="space-y-4">
            <div 
              ref={containerRef}
              className="aspect-[2/3] w-full bg-gray-50 relative overflow-hidden rounded-sm shadow-md cursor-zoom-in group"
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomOpen(true)}
            >
              <img 
                ref={mainImageRef}
                src={activeImage} 
                alt={`${product.title} by ${product.brand}`} 
                className="w-full h-full object-cover transition-transform duration-300 ease-out origin-center group-hover:scale-[2.0]"
                style={{ transformOrigin: zoomOrigin }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 pointer-events-none">
                <div className="bg-white/80 p-3 rounded-full backdrop-blur-sm shadow-xl text-brand-dark">
                    <ZoomIn size={24} />
                </div>
              </div>
            </div>

            {imageList.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {imageList.map((img: string, idx: number) => (
                  <button key={idx} onClick={() => setActiveImage(img)} className={`relative w-20 h-24 flex-shrink-0 border-2 rounded-sm overflow-hidden transition-all ${activeImage === img ? 'border-brand-dark opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS SECTION */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-sm font-bold text-brand-lavender uppercase tracking-[0.2em] mb-3">{product.brand}</p>
                  <h1 className="text-3xl md:text-5xl font-light text-brand-dark leading-tight mb-4">{product.title}</h1>
               </div>
               <button 
                 onClick={toggleWishlist}
                 className={`p-3 rounded-full border transition-all ${isLiked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'}`}
               >
                 <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
               </button>
            </div>
            
            <div className="flex items-center gap-6 mb-6 border-b border-gray-100 pb-6">
              <span className="text-3xl font-medium text-brand-dark">OMR {product.price}</span>
              <div className="flex items-center gap-1 text-brand-gold">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                <span className="text-sm text-gray-400 ml-2">(12 Reviews)</span>
              </div>
            </div>

            {/* SCARCITY ALERT */}
            {isLowStock && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-red-50 border border-red-100 p-4 rounded-sm flex items-center gap-3 text-red-600"
              >
                <div className="p-2 bg-white rounded-full shadow-sm animate-pulse">
                  <Flame size={20} className="text-orange-500" fill="currentColor" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest">Selling Fast!</p>
                  <p className="text-xs">Only <span className="font-bold text-lg">{stockLevel}</span> items left in stock.</p>
                </div>
              </motion.div>
            )}

            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Description</h3>
              <p className="text-gray-600 font-light leading-relaxed whitespace-pre-line">{product.description || "No description available."}</p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark">Select Size</h3>
                <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-magenta transition-colors">
                  <Ruler size={14} /> Size Guide
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {ALL_SIZES_DISPLAY.map((size) => {
                  const isAvailable = product.sizes && product.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-6 py-3 text-sm font-medium border rounded-sm transition-all relative overflow-hidden
                        ${!isAvailable 
                          ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed decoration-slice line-through' 
                          : selectedSize === size 
                            ? 'border-brand-dark bg-brand-dark text-white shadow-md' 
                            : 'border-gray-200 text-gray-600 hover:border-brand-magenta hover:text-brand-magenta'
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 mb-10">
              <div className="flex items-center border border-gray-200 rounded-sm">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-4 text-gray-500 hover:text-brand-magenta"><Minus size={16} /></button>
                <span className="w-8 text-center font-medium text-brand-dark">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-4 text-gray-500 hover:text-brand-magenta"><Plus size={16} /></button>
              </div>
              
              <button onClick={handleAddToCart} className={`flex-1 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-bold transition-all shadow-lg ${isAdded ? 'bg-brand-emerald text-white' : 'bg-brand-dark text-white hover:bg-brand-magenta'}`}>
                <ShoppingBag size={18} /> {isAdded ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            <div className="space-y-4 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-4 text-gray-600">
                <Truck size={20} className="text-brand-magenta" />
                <span className="text-sm font-light">
                  Delivery Fee: <span className="font-bold">OMR {product.deliveryFee || '2.500'}</span> (Muscat 2-3 Days)
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <ShieldCheck size={20} className="text-brand-emerald" />
                <span className="text-sm font-light">100% Authentic Brand Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* YOU MAY ALSO LIKE SECTION */}
        {relatedProducts.length > 0 && (
          <section className="py-24 border-t border-gray-100">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-light text-brand-dark mb-2">You May Also <span className="font-bold">Like</span></h2>
                <p className="text-gray-500 font-light">More stunning pieces from our {product.category} collection.</p>
              </div>
              <Link href="/shop" className="text-sm font-bold uppercase tracking-widest text-brand-magenta hover:text-brand-dark transition-colors border-b-2 border-brand-magenta/20 pb-1">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <ProductCard 
                  key={p.id}
                  id={p.id}
                  image={p.image}
                  brand={p.brand}
                  title={p.title}
                  price={p.price}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsZoomOpen(false)}
          >
            <button onClick={() => setIsZoomOpen(false)} className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-all">
              <X size={24} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-7xl max-h-[90vh] shadow-2xl overflow-hidden rounded-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={activeImage} alt="Zoomed" className="w-auto h-full max-h-[90vh] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
}