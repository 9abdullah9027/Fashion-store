'use client';

import Link from 'next/link';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/GlobalWishlist';
import { motion } from 'framer-motion';

interface ProductCardProps {
  id: string;
  image: string;
  brand: string;
  title: string;
  price: string | number;
  isNew?: boolean;
}

export default function ProductCard({ id, image, brand, title, price, isNew }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    // FIXED: Added deliveryFee to match your CartItem type requirement
    addToCart({
      id: id.toString(),
      title: title,
      price: typeof price === 'string' ? parseFloat(price) : price,
      deliveryFee: 2.500, // Default Muscat delivery fee
      image: image,
      size: 'Unstitched', // Default size for quick-add
      quantity: 1
    });
  };

  const isLiked = isInWishlist(id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        title,
        price: typeof price === 'string' ? parseFloat(price) : price,
        image,
        brand
      });
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-white"
    >
      <Link href={`/product/${id}`} className="block overflow-hidden relative aspect-[2/3] rounded-sm bg-gray-50">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {isNew && (
            <span className="bg-brand-magenta text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm">
              New
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all duration-300 ${
            isLiked ? 'bg-white text-red-500' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
        >
          <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
        </button>

        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        
        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent">
          <button 
            onClick={handleQuickAdd}
            className="w-full bg-white text-brand-dark py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-magenta hover:text-white transition-colors flex items-center justify-center gap-2 shadow-xl"
          >
            <ShoppingBag size={14} /> Quick Add
          </button>
        </div>
      </Link>

      <div className="mt-4 space-y-1">
        <p className="text-[10px] font-bold text-brand-lavender uppercase tracking-[0.2em]">{brand}</p>
        <Link href={`/product/${id}`}>
          <h3 className="text-sm font-medium text-brand-dark group-hover:text-brand-magenta transition-colors line-clamp-1">
            {title}
          </h3>
        </Link>
        <p className="text-sm font-bold text-brand-dark">OMR {typeof price === 'number' ? price.toFixed(3) : parseFloat(price).toFixed(3)}</p>
      </div>
    </motion.div>
  );
}