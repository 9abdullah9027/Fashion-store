'use client';

import { useWishlist } from '@/context/GlobalWishlist';
import Link from 'next/link';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="bg-gray-50 p-6 rounded-full mb-4">
          <Heart size={48} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-light text-brand-dark mb-2">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-8 max-w-md">Save items you love here and check out later.</p>
        <Link href="/shop" className="px-8 py-3 bg-brand-dark text-white text-sm font-bold uppercase tracking-widest hover:bg-brand-magenta transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-light text-brand-dark mb-8 flex items-center gap-3">
        My <span className="font-bold">Wishlist</span> <span className="text-sm text-gray-400 font-normal">({wishlist.length} items)</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => (
          <div key={item.id} className="group relative border border-gray-100 rounded-sm hover:shadow-lg transition-shadow">
            <button 
              onClick={() => removeFromWishlist(item.id)}
              className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full hover:text-red-500 hover:bg-white transition-colors"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
            
            <Link href={`/product/${item.id}`}>
              <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4">
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">{item.brand}</p>
                <h3 className="text-sm font-medium text-brand-dark line-clamp-1 mb-2">{item.title}</h3>
                <p className="text-brand-magenta font-bold">OMR {item.price}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}