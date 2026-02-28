'use client';

import Link from 'next/link';
import { ShoppingBag, Search, Menu, ChevronDown, Truck, Heart } from 'lucide-react'; // Added Heart
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/GlobalWishlist';
import SearchOverlay from '@/components/SearchOverlay';

export default function Navbar() {
  const [logoFailed, setLogoFailed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist(); // Get the count

  const womenCategories = [
    { name: 'New Arrivals', href: '/shop?category=New Arrivals&gender=Women' },
    { name: 'Unstitched', href: '/shop?category=Unstitched&gender=Women' },
    { name: 'Ready to Wear', href: '/shop?category=Ready to Wear&gender=Women' },
    { name: 'Eid Collection', href: '/shop?category=Eid Collection&gender=Women' },
    { name: 'Bridal & Formal', href: '/shop?category=Bridal & Formal&gender=Women' },
  ];

  const menCategories = [
    { name: 'New Arrivals', href: '/shop?category=New Arrivals&gender=Men' },
    { name: 'Shalwar Kameez', href: '/shop?category=Ready to Wear&gender=Men' },
    { name: 'Waistcoats', href: '/shop?category=Waistcoats&gender=Men' },
    { name: 'Unstitched', href: '/shop?category=Unstitched&gender=Men' },
  ];

  const kidsCategories = [
    { name: 'Girls Festive', href: '/shop?category=Girls Festive&gender=Kids' },
    { name: 'Boys Traditional', href: '/shop?category=Boys Traditional&gender=Kids' },
    { name: 'Casual Wear', href: '/shop?category=Casual Wear&gender=Kids' },
  ];

  return (
    <>
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="bg-brand-dark text-white text-[10px] sm:text-xs text-center py-2.5 font-medium tracking-[0.2em] uppercase">
          Premium Pakistani Fashion | Fast Delivery Across Muscat, Oman
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            
            <div className="flex items-center md:hidden flex-1">
              <button className="text-gray-900 hover:text-brand-magenta transition-colors">
                <Menu size={24} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="hidden md:flex flex-1 items-center justify-start gap-10 h-full">
              {/* WOMEN MENU */}
              <div className="group relative h-full flex items-center">
                <Link href="/shop?gender=Women" className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gray-900 group-hover:text-brand-magenta transition-colors">
                  Women <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </Link>
                <div className="absolute top-[100%] left-0 w-60 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 rounded-b-sm">
                  <div className="py-3">
                    {womenCategories.map((cat, i) => (
                      <Link key={i} href={cat.href} className="block px-6 py-3 text-sm text-gray-600 hover:text-brand-magenta hover:bg-gray-50 transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* MEN MENU */}
              <div className="group relative h-full flex items-center">
                <Link href="/shop?gender=Men" className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gray-900 group-hover:text-brand-emerald transition-colors">
                  Men <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </Link>
                <div className="absolute top-[100%] left-0 w-60 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 rounded-b-sm">
                  <div className="py-3">
                    {menCategories.map((cat, i) => (
                      <Link key={i} href={cat.href} className="block px-6 py-3 text-sm text-gray-600 hover:text-brand-emerald hover:bg-gray-50 transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* KIDS MENU */}
              <div className="group relative h-full flex items-center">
                <Link href="/shop?gender=Kids" className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-widest text-gray-900 group-hover:text-brand-gold transition-colors">
                  Kids <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                </Link>
                <div className="absolute top-[100%] left-0 w-60 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 rounded-b-sm">
                  <div className="py-3">
                    {kidsCategories.map((cat, i) => (
                      <Link key={i} href={cat.href} className="block px-6 py-3 text-sm text-gray-600 hover:text-brand-gold hover:bg-gray-50 transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-full flex items-center gap-10">
                <Link href="/shop" className="text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-brand-lavender transition-colors">
                  Brands
                </Link>
                <Link href="/track" className="text-sm font-bold uppercase tracking-widest text-brand-magenta hover:text-brand-dark transition-colors border-b-2 border-brand-magenta/20 hover:border-brand-dark pb-0.5">
                  Track Order
                </Link>
              </div>
            </nav>
            

            <div className="flex-shrink-0 flex items-center justify-center">
              <Link href="/" className="flex items-center justify-center">
                {!logoFailed ? (
                  <img 
                    src="/logos/logo.png" 
                    alt="Fabricated Fabrics" 
                    className="h-20 md:h-24 lg:h-28 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
                    onError={() => setLogoFailed(true)}
                  />
                ) : (
                  <span className="font-extrabold text-2xl tracking-tighter text-brand-dark uppercase">
                    Fabricated <span className="text-brand-lavender">Fabrics</span>
                  </span>
                )}
              </Link>
            </div>

            <div className="flex items-center justify-end gap-6 flex-1">
              
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-900 hover:text-brand-magenta transition-colors"
                title="Search Products"
              >
                <Search size={22} strokeWidth={1.5} />
              </button>

              {/* NEW: WISHLIST HEART ICON */}
              <Link href="/wishlist" className="text-gray-900 hover:text-brand-magenta transition-colors relative" title="My Wishlist">
                <Heart size={22} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-dark text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" className="text-gray-900 hover:text-brand-magenta transition-colors relative" title="Shopping Cart">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-magenta text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}