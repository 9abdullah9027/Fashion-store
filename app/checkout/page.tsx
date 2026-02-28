'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { CheckCircle, Landmark, MapPin, Smartphone, Mail, User, Copy, Loader2, Tag } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CheckoutPage() {
  // NEW: Pull coupon data and discountAmount
  const { cartItems, cartTotal, clearCart, cartDeliveryFee, discountAmount, appliedCoupon } = useCart();
  
  // Calculate final total (ensure it doesn't drop below zero)
  const finalTotal = Math.max(0, cartTotal + cartDeliveryFee - discountAmount);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [orderId, setOrderId] = useState('');
  
  // Freeze total for success screen
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', area: 'Al Seeb', address: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true); 
    const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderId: newOrderId,
      customer: formData,
      items: cartItems,
      subtotal: cartTotal,
      deliveryFee: cartDeliveryFee,
      discount: discountAmount, // SAVE DISCOUNT
      couponCode: appliedCoupon ? appliedCoupon.code : null, // SAVE CODE
      total: finalTotal,
      status: 'Pending Bank Transfer', 
      createdAt: serverTimestamp(),
    };

    try {
      setConfirmedTotal(finalTotal);
      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      setOrderId(newOrderId);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error saving order: ", error);
      alert("Something went wrong while placing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- SUCCESS SCREEN ---
  if (isSubmitted) {
    const whatsappMessage = encodeURIComponent(
      `Hello Fabricated Fabrics! 🌸\nI just placed an order.\n\n*Order ID:* ${orderId}\n*Total:* OMR ${confirmedTotal.toFixed(3)}\n*Name:* ${formData.firstName} ${formData.lastName}\n\nI have attached my Bank Muscat transfer receipt below.`
    );

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 py-20">
        <CheckCircle size={64} className="text-brand-emerald mb-6" />
        <h1 className="text-4xl font-light text-brand-dark tracking-tight mb-2">Order Received!</h1>
        <p className="text-gray-500 mb-8">Your Order ID is <span className="font-bold text-brand-dark">{orderId}</span></p>

        <div className="bg-gray-50 p-8 rounded-sm w-full max-w-xl border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-6 flex items-center gap-2">
            <Landmark size={18} /> Payment Instructions
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            To finalize your order, please transfer exactly <strong className="text-brand-dark">OMR {confirmedTotal.toFixed(3)}</strong> to our Bank Muscat account below. 
          </p>
          
          <div className="bg-white p-4 rounded-sm border border-gray-200 space-y-3 mb-8">
            <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Bank:</span><span className="font-bold text-brand-dark">Bank Muscat</span></div>
            <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Account Name:</span><span className="font-bold text-brand-dark">Fabricated Fabrics</span></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-magenta">0412 3456 7890 1234</span>
                <Copy size={14} className="text-gray-400 cursor-pointer hover:text-brand-dark" />
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-brand-dark mb-2">Next Step:</h3>
          <p className="text-sm text-gray-500 mb-6">Send a screenshot of your transfer receipt to our WhatsApp to instantly confirm your delivery.</p>
          
          <Link 
            href={`https://api.whatsapp.com/send?phone=96893845217&text=${whatsappMessage}`} 
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white py-4 rounded-sm font-bold text-sm uppercase tracking-widest hover:bg-[#1ebe5d] transition-colors flex justify-center items-center gap-2 shadow-md"
          >
            <Smartphone size={18} /> Confirm via WhatsApp
          </Link>
        </div>
      </div>
    );
  }

  // --- CHECKOUT FORM SCREEN ---
  return (
    <div className="bg-white min-h-screen pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-light text-brand-dark tracking-tight mb-12">Secure <span className="font-bold">Checkout</span></h1>
        <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="w-full lg:w-2/3 space-y-10">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-6 border-b border-gray-100 pb-2">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                  <div className="relative"><User size={16} className="absolute left-3 top-3.5 text-gray-400" /><input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-200 p-3 pl-10 text-sm focus:outline-none focus:border-brand-magenta" placeholder="Aisha" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-magenta" placeholder="Khan" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative"><Mail size={16} className="absolute left-3 top-3.5 text-gray-400" /><input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-200 p-3 pl-10 text-sm focus:outline-none focus:border-brand-magenta" placeholder="aisha@example.com" /></div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number (WhatsApp)</label>
                  <div className="relative"><Smartphone size={16} className="absolute left-3 top-3.5 text-gray-400" /><input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-200 p-3 pl-10 text-sm focus:outline-none focus:border-brand-magenta" placeholder="+968 9123 4567" /></div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-6 border-b border-gray-100 pb-2">Delivery Details</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Muscat Area</label>
                  <select required name="area" value={formData.area} onChange={handleInputChange} className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-magenta bg-white">
                    <option value="Al Seeb">Al Seeb</option><option value="Bousher">Bousher</option><option value="Muttrah">Muttrah</option><option value="Al Amrat">Al Amrat</option><option value="Ruwi">Ruwi</option><option value="Al Khuwair">Al Khuwair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Address (Way, House/Flat No.)</label>
                  <div className="relative"><MapPin size={16} className="absolute left-3 top-3.5 text-gray-400" /><input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-200 p-3 pl-10 text-sm focus:outline-none focus:border-brand-magenta" placeholder="Way 1234, Villa 56..." /></div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-50 p-8 rounded-sm sticky top-32">
              <h2 className="text-lg font-bold uppercase tracking-widest text-brand-dark mb-6">Summary</h2>
              <div className="space-y-4 mb-6 max-h-40 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex justify-between items-center text-sm"><span className="text-gray-600 line-clamp-1 flex-1 pr-4">{item.quantity}x {item.title}</span><span className="font-medium text-brand-dark">OMR {(item.price * item.quantity).toFixed(3)}</span></div>
                ))}
              </div>
              <div className="space-y-4 pb-6 border-b border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span className="font-medium text-brand-dark">OMR {cartTotal.toFixed(3)}</span></div>
                <div className="flex justify-between text-gray-600">
                    <span>Delivery (Muscat)</span>
                    <span className="font-medium text-brand-dark">OMR {cartDeliveryFee.toFixed(3)}</span>
                </div>
                {/* DISCOUNT ROW */}
                {appliedCoupon && (
                  <div className="flex justify-between text-brand-magenta">
                    <span className="flex items-center gap-1"><Tag size={12} /> Discount ({appliedCoupon.code})</span>
                    <span className="font-bold">- OMR {discountAmount.toFixed(3)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center py-6"><span className="text-lg font-bold text-brand-dark">Total</span><span className="text-2xl font-bold text-brand-magenta">OMR {finalTotal.toFixed(3)}</span></div>
              <div className="bg-white p-4 rounded-sm border border-brand-lavender/30 mb-8 flex gap-3 items-start">
                <Landmark size={20} className="text-brand-lavender shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">Payment is securely processed via direct <strong className="text-brand-dark">Bank Muscat Transfer</strong>. Details provided on the next screen.</p>
              </div>
              <button type="submit" disabled={isProcessing} className="w-full bg-brand-dark text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-brand-magenta transition-colors flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                {isProcessing ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Place Order & Get Details'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}