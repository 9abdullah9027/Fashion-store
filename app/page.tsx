'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';


import BrandMarquee from '@/components/BrandMarquee';
import AboutSection from '@/components/AboutSection';


const HERO_SLIDES = [
  {
    id: 1,
    image: "/images/hero-1.jpeg",
    est: "Pakistan’s Finest Picks",
    title: "Authentic",
    highlight: "Elegance",
    subtitle: "Discover the finest Lawn, Velvet, and Chiffon collections from Pakistan's top designer brands, delivered instantly to your doorstep in Oman."
  },
  {
    id: 2,
    image: "/images/hero-2.jpeg",
    est: "New Collection",
    title: "Signature",
    highlight: "Lawn",
    subtitle: "Experience the warmth of premium Lawn suits, intricately embroidered for the upcoming wedding season."
  },
  {
    id: 3,
    image: "/images/hero-3.jpeg",
    est: "Ready to Wear",
    title: "Festive",
    highlight: "Ready",
    subtitle: "Skip the tailor. Shop our exclusive range of stitched suits, perfect for immediate wear and effortless style."
  }
];

// Helper Component for Scroll Animations
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // HERO AUTO-PLAY
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  // FETCH & SHUFFLE PRODUCTS
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        setFeaturedProducts(shuffled.slice(0, 4));
      } catch (error) {
        console.error("Error loading home products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative w-full h-[650px] md:h-[850px] bg-gray-900 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div 
            key={HERO_SLIDES[currentSlide].id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.6, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
             <img 
              src={HERO_SLIDES[currentSlide].image} 
              alt="Hero" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto mt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.span 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-block py-1 px-4 border border-white/30 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6 backdrop-blur-sm"
              >
                {HERO_SLIDES[currentSlide].est}
              </motion.span>
<motion.h1 
  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
  className="text-5xl md:text-8xl font-light tracking-tight mb-6 leading-tight text-white"
>
  {HERO_SLIDES[currentSlide].title}{" "}
  <span className="font-serif italic font-medium text-amber-400">
    {HERO_SLIDES[currentSlide].highlight}
  </span>
</motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-gray-200 font-light mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                {HERO_SLIDES[currentSlide].subtitle}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/shop" className="px-12 py-4 bg-brand-magenta text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all shadow-xl hover:shadow-brand-magenta/50 rounded-sm">
                  Shop Now
                </Link>
                <Link href="/shop?category=New Arrivals" className="px-12 py-4 bg-transparent border border-white/40 text-white text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all rounded-sm">
                  New Arrivals
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-10 z-20 flex gap-3">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-500 rounded-full ${
                idx === currentSlide ? 'w-8 bg-brand-magenta' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. BRAND MARQUEE (Restored & Visible) */}
      <section className="relative z-20 bg-white border-b border-gray-100">
        <BrandMarquee />
      </section>

      {/* 3. DYNAMIC NEW ARRIVALS */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-light text-brand-dark mb-2">New <span className="font-bold">Arrivals</span></h2>
                <p className="text-gray-500 font-light text-lg">Curated essentials for the modern wardrobe.</p>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-brand-dark hover:text-brand-magenta transition-colors border-b border-brand-dark hover:border-brand-magenta pb-1 group">
                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </FadeIn>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="animate-pulse space-y-4">
                   <div className="bg-gray-100 aspect-[2/3] w-full rounded-sm"></div>
                   <div className="h-4 bg-gray-100 w-2/3 rounded"></div>
                 </div>
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {featuredProducts.map((product, i) => (
                <FadeIn key={product.id} delay={i * 0.1}>
                  <ProductCard 
                    id={product.id}
                    image={product.images ? product.images[0] : product.image}
                    brand={product.brand}
                    title={product.title}
                    price={product.price}
                    isNew={product.isNew}
                  />
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. SHOP BY OCCASION */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-brand-dark">Shop by <span className="font-bold">Occasion</span></h2>
            </div>
          </FadeIn>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[600px] md:h-[500px]">
            <Link href="/shop?category=New Arrivals" className="group relative md:col-span-2 overflow-hidden rounded-sm cursor-pointer h-full block shadow-sm hover:shadow-lg transition-shadow">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full h-full">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                <img src="https://www.nameerabyfarooq.com/cdn/shop/articles/Celebrate_in_Style_Unveiling_the_Most_Stunning_Pakistani_Eid_Dresses_2023_1600x.jpg?v=1678987856" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Eid Edit" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">Latest Collection</span>
                  <h3 className="text-4xl font-serif italic">Eid Edit</h3>
                </div>
              </motion.div>
            </Link>
            <Link href="/shop?category=Unstitched" className="group relative md:col-span-1 overflow-hidden rounded-sm cursor-pointer h-full block shadow-sm hover:shadow-lg transition-shadow">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="w-full h-full">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                <img src="https://www.dressyzone.com/cdn/shop/files/p17941-embroidered-lawn-dress_1024x1024@2x.jpg?v=1747218908" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Ramadan" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                  <h3 className="text-2xl font-serif italic">Ramadan</h3>
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white transition-all pb-1">Shop Unstitched</span>
                </div>
              </motion.div>
            </Link>
            <Link href="/shop?category=Bridal & Formal" className="group relative md:col-span-1 overflow-hidden rounded-sm cursor-pointer h-full block shadow-sm hover:shadow-lg transition-shadow">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="w-full h-full">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                <img src="https://images.unsplash.com/photo-1704119142483-1269733bcedb?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Formal" />
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white">
                  <h3 className="text-2xl font-serif italic">Formal Wear</h3>
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-widest border-b border-transparent group-hover:border-white transition-all pb-1">Shop Luxury</span>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPS */}
      <section className="py-20 bg-brand-dark text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Truck, title: "Fast Delivery", desc: "Direct shipping across Muscat within 2-3 business days." },
              { icon: ShieldCheck, title: "100% Authentic", desc: "Guaranteed original products from Pakistan's top brands." },
              { icon: Clock, title: "Secure Payment", desc: "Pay easily via Bank Muscat Transfer upon order confirmation." }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.2}>
                <div className="flex flex-col items-center group">
                  <div className="bg-white/10 p-5 rounded-full mb-6 group-hover:bg-brand-magenta group-hover:scale-110 transition-all duration-300">
                    <item.icon size={32} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-2">{item.title}</h3>
                  <p className="text-gray-400 font-light text-xs max-w-xs leading-relaxed">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ABOUT SECTION (Restored & Visible) */}
      <section className="bg-white">
        <AboutSection />
      </section>

    </div>
  );
}