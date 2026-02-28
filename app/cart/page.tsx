'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, ArrowRight, ShoppingBag, Tag, Loader2, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, cartDeliveryFee, applyCoupon, removeCoupon, appliedCoupon, discountAmount } = useCart();
  
  const [couponInput, setCouponInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [couponError, setCouponError] = useState('');

  const finalTotal = Math.max(0, cartTotal + cartDeliveryFee - discountAmount); // Ensure never negative

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setVerifying(true);
    setCouponError('');

    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponInput.toUpperCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setCouponError('Invalid Coupon Code');
      } else {
        const couponData = snapshot.docs[0].data();
        if (!couponData.isActive) {
          setCouponError('This coupon has expired');
        } else {
          // Success! Update Context
          applyCoupon({
            code: couponData.code,
            type: couponData.type,
            value: couponData.value
          });
          setCouponInput('');
        }
      }
    } catch (error) {
      setCouponError('Error verifying coupon');
    } finally {
      setVerifying(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white px-4">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <ShoppingBag size={48} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-light text-brand-dark mb-2">Your Bag is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
        <Link 
          href="/shop" 
          className="bg-brand-dark text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-brand-magenta transition-colors shadow-lg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-light text-brand-dark tracking-tight mb-12">
          Your <span className="font-bold">Shopping Bag</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          
          {/* LEFT: CART ITEMS LIST */}
          <div className="w-full lg:w-2/3">
            <div className="space-y-8">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-6 py-6 border-b border-gray-100">
                  <div className="w-24 h-32 bg-gray-50 flex-shrink-0 overflow-hidden rounded-sm border border-gray-100">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-brand-dark text-lg">{item.title}</h3>
                        <p className="font-bold text-brand-dark">OMR {(item.price * item.quantity).toFixed(3)}</p>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">Size: {item.size}</p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-gray-200 rounded-sm h-10">
                        <button onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))} className="px-3 h-full text-gray-500 hover:text-brand-magenta transition-colors">-</button>
                        <span className="w-8 text-center text-sm font-medium text-brand-dark">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="px-3 h-full text-gray-500 hover:text-brand-magenta transition-colors">+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.size)} className="text-gray-400 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 p-8 rounded-sm sticky top-32">
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-6">Order Summary</h2>
              
              <div className="space-y-4 pb-6 border-b border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-brand-dark">OMR {cartTotal.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery (Muscat)</span>
                  <span className="font-medium text-brand-dark">OMR {cartDeliveryFee.toFixed(3)}</span>
                </div>
                
                {/* DISCOUNT DISPLAY */}
                {appliedCoupon && (
                  <div className="flex justify-between text-brand-magenta animate-in fade-in slide-in-from-right-2">
                    <span className="flex items-center gap-1"><Tag size={12} /> Discount ({appliedCoupon.code})</span>
                    <span className="font-bold">- OMR {discountAmount.toFixed(3)}</span>
                  </div>
                )}
              </div>

              {/* COUPON INPUT */}
              <div className="mb-6">
                 {appliedCoupon ? (
                   <div className="bg-brand-magenta/10 border border-brand-magenta/20 p-3 flex justify-between items-center rounded-sm">
                      <span className="text-xs font-bold text-brand-magenta uppercase tracking-widest">Code Applied</span>
                      <button onClick={removeCoupon} className="text-brand-magenta hover:text-brand-dark"><X size={14} /></button>
                   </div>
                 ) : (
                   <div>
                     <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={couponInput}
                          onChange={e => setCouponInput(e.target.value)}
                          placeholder="Discount Code"
                          className="flex-1 border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-magenta uppercase"
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={verifying || !couponInput}
                          className="bg-brand-dark text-white px-4 text-xs font-bold uppercase tracking-widest hover:bg-brand-magenta disabled:opacity-50 transition-colors"
                        >
                          {verifying ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                        </button>
                     </div>
                     {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                   </div>
                 )}
              </div>

              <div className="flex justify-between items-center py-6 mb-2 border-t border-gray-200">
                <span className="text-lg font-bold text-brand-dark">Total</span>
                <span className="text-2xl font-bold text-brand-dark">OMR {finalTotal.toFixed(3)}</span>
              </div>

              <Link 
                href="/checkout"
                className="w-full bg-brand-dark text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-brand-magenta transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}