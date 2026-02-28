'use client';

import Link from 'next/link';
import { ShoppingBag, Search, Menu, ChevronDown, Heart, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/GlobalWishlist'; // Fixed Casing Error
import SearchOverlay from '@/components/SearchOverlay';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [logoFailed, setLogoFailed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const categories = [
    { 
      name: 'Women', 
      href: '/shop?gender=Women',
      items: ['New Arrivals', 'Unstitched', 'Ready to Wear', 'Eid Collection', 'Bridal & Formal'] 
    },
    { 
      name: 'Men', 
      href: '/shop?gender=Men',
      items: ['New Arrivals', 'Shalwar Kameez', 'Waistcoats', 'Unstitched'] 
    },
    { 
      name: 'Kids', 
      href: '/shop?gender=Kids',
      items: ['Girls Festive', 'Boys Traditional', 'Casual Wear'] 
    }
  ];

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="bg-brand-dark text-white text-[10px] sm:text-xs text-center py-2.5 font-medium tracking-[0.2em] uppercase">
          Premium Pakistani Fashion | Fast Delivery Across Muscat, Oman
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            
            {/* MOBILE MENU BUTTON */}
            <div className="flex items-center md:hidden flex-1">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="text-gray-900 hover:text-brand-magenta transition-colors p-2"
              >
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex flex-1 items-center justify-start gap-10 h-full">
              {/* SHOP ALL / BRANDS OPTION */}
              <Link href="/shop" className="text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-brand-magenta transition-colors">
                Store
              </Link>
              
              {categories.map((cat) => (
                <div key={cat.name} className="group relative h-full flex items-center">
                  <Link href={cat.href} className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gray-900 group-hover:text-brand-magenta transition-colors">
                    {cat.name} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                  </Link>
                  <div className="absolute top-[100%] left-0 w-60 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 rounded-b-sm">
                    <div className="py-3">
                      {cat.items.map((item) => (
                        <Link key={item} href={`/shop?category=${item}&gender=${cat.name}`} className="block px-6 py-3 text-sm text-gray-600 hover:text-brand-magenta hover:bg-gray-50 transition-colors">
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/track" className="text-sm font-bold uppercase tracking-widest text-brand-magenta hover:text-brand-dark transition-colors border-b-2 border-brand-magenta/20 pb-0.5">
                Track Order
              </Link>
            </nav>

            {/* LOGO */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <Link href="/" className="flex items-center justify-center">
                {!logoFailed ? (
                  <img 
                    src="/logos/logo.png" 
                    alt="Fabricated Fabrics" 
                    className="h-16 md:h-24 w-auto object-contain drop-shadow-sm"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span className="font-extrabold text-xl tracking-tighter text-brand-dark uppercase">
                    Fabricated <span className="text-brand-lavender">Fabrics</span>
                  </span>
                )}
              </Link>
            </div>

            {/* ICONS */}
            <div className="flex items-center justify-end gap-4 md:gap-6 flex-1">
              <button onClick={() => setIsSearchOpen(true)} className="text-gray-900 hover:text-brand-magenta p-1 transition-colors">
                <Search size={22} strokeWidth={1.5} />
              </button>

              <Link href="/wishlist" className="text-gray-900 hover:text-brand-magenta relative p-1" title="My Wishlist">
                <Heart size={22} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="text-gray-900 hover:text-brand-magenta relative p-1" title="Shopping Cart">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-magenta text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Menu</p>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-900 hover:text-brand-magenta transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <Link 
                  href="/shop" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-6 py-5 text-sm font-bold uppercase tracking-widest text-brand-dark border-b border-gray-50"
                >
                  Shop All / Brands
                </Link>
                {categories.map((cat) => (
                  <div key={cat.name} className="border-b border-gray-50">
                    <Link 
                      href={cat.href} 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-between px-6 py-5 text-sm font-bold uppercase tracking-widest text-brand-dark hover:text-brand-magenta bg-white"
                    >
                      {cat.name} <ChevronRight size={16} />
                    </Link>
                  </div>
                ))}
                <Link 
                  href="/track" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-6 py-5 text-sm font-bold uppercase tracking-widest text-brand-magenta"
                >
                  Track Order
                </Link>
              </div>

              <div className="p-8 border-t border-gray-100 bg-gray-50 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Fabricated Fabrics | Muscat
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}