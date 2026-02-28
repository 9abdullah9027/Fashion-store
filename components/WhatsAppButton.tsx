'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // We don't want this button on the Admin Dashboard
  if (pathname.startsWith('/admin')) return null;

  // Your Phone Number (Oman code 968)
  const phoneNumber = '96893845217';
  
  // Custom message based on where they are
  const getMessage = () => {
    if (pathname.includes('/product/')) {
      return "Hello! I am looking at this product and have a question.";
    }
    if (pathname === '/cart') {
      return "Hello! I need help with my cart/checkout.";
    }
    return "Hello Fabricated Fabrics! I have a query regarding your collection.";
  };

  // UPDATED: Using the full API link instead of wa.me to prevent connection errors
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(getMessage())}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20bd55] transition-all duration-300 hover:scale-110 group flex items-center gap-2"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} fill="white" className="animate-pulse" />
      
      {/* Tooltip text that slides out on hover */}
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold">
        Chat with Us
      </span>
    </a>
  );
}