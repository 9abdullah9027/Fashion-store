'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  id: string | number;
  image: string;
  brand: string;
  title: string;
  price: string;
  isNew?: boolean;
}

export default function ProductCard({ id, image, brand, title, price, isNew }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the browser from navigating to the product page
    
    addToCart({
      id: id.toString(),
      title: title,
      price: parseFloat(price),
      image: image, // This safely grabs the correct image from your shop page!
      size: 'Unstitched', // Default size for Quick Add
      quantity: 1
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="group flex flex-col relative">
      <Link href={`/product/${id}`} className="block relative aspect-[2/3] w-full bg-gray-50 mb-4 overflow-hidden rounded-sm shadow-sm hover:shadow-md transition-shadow">
        {isNew && (
          <div className="absolute top-4 left-4 z-20 bg-white text-brand-dark text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 shadow-sm">
            New
          </div>
        )}
        
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
        />

        <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-20">
          <button 
            onClick={handleQuickAdd}
            className={`w-full backdrop-blur-sm font-bold text-xs uppercase tracking-widest py-3 shadow-lg transition-colors flex items-center justify-center gap-2 ${
              isAdded 
                ? 'bg-brand-emerald text-white' 
                : 'bg-white/95 text-brand-dark hover:bg-brand-magenta hover:text-white'
            }`}
          >
            {isAdded ? <><Check size={16} /> Added</> : <><ShoppingBag size={16} /> Quick Add</>}
          </button>
        </div>
      </Link>

      <Link href={`/product/${id}`}>
        <p className="text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-widest">{brand}</p>
        <h4 className="font-medium text-brand-dark text-base mb-1.5 group-hover:text-brand-magenta transition-colors line-clamp-1">{title}</h4>
        <p className="font-light text-gray-600">OMR {price}</p>
      </Link>
    </div>
  );
}