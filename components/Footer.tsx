'use client';

import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. BRAND & LOGO */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <img 
                src="/logos/logo.png" 
                alt="Fabricated Fabrics Logo" 
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-gray-500 text-sm font-light leading-relaxed max-w-xs">
              Bringing the absolute pinnacle of Pakistani craftsmanship directly to your wardrobe in Oman. 100% authentic designer wear.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/pakistani_dresses_muscat_/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-brand-dark hover:bg-brand-magenta hover:text-white transition-all duration-300"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* 2. SHOP LINKS (Dynamic) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark mb-6">Shop Collections</h4>
            <ul className="space-y-4">
              {[
                { name: 'New Arrivals', href: '/shop?category=New Arrivals' },
                { name: 'Unstitched', href: '/shop?category=Unstitched' },
                { name: 'Ready to Wear', href: '/shop?category=Ready to Wear' },
                { name: 'Bridal & Formal', href: '/shop?category=Bridal & Formal' },
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-brand-magenta transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. CUSTOMER ASSISTANCE */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark mb-6">Assistance</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/track" className="text-sm text-gray-500 hover:text-brand-magenta transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-gray-500 hover:text-brand-magenta transition-colors">
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. CONTACT */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-dark mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={18} className="text-brand-magenta shrink-0" />
                <a href="mailto:9adullah9027@gmail.com" className="hover:text-brand-magenta transition-colors">
                  9adullah9027@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            © {currentYear} Fabricated Fabrics. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3 opacity-30 grayscale" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-5 opacity-30 grayscale" />
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Bank Muscat Transfer</span>
          </div>
        </div>

      </div>
    </footer>
  );
}