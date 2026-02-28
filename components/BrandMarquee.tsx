'use client';

import React from 'react';
const BRANDS = [
  { name: 'Zelbury', filename: '/images/Zellbury.png' },
  { name: 'Limelight', filename: '/images/Limelight.png' },
  { name: 'Khaadi', filename: '/images/khaadi.png' },
  { name: 'Sana Safinaz', filename: '/images/Sana Safinaz.png' },
];

export default function BrandMarquee() {
  return (
    <section className="py-16 bg-white border-y border-gray-100 overflow-hidden flex flex-col items-center">
      <p className="text-sm font-bold text-brand-lavender uppercase tracking-[0.3em] mb-12">
        Proudly Sourcing From
      </p>
      
      <div className="relative w-full overflow-hidden flex bg-white">
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll {
            animation: scroll 25s linear infinite;
            display: flex;
            width: max-content;
          }
        `}</style>
        
        <div className="animate-scroll flex items-center">
          {[...BRANDS, ...BRANDS, ...BRANDS, ...BRANDS].map((brand, index) => (
            <div key={index} className="flex-shrink-0 px-12 md:px-20">
              <img 
                src={brand.filename} 
                alt={`${brand.name} Logo`}
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/600x200/FAFAFA/1A1A24?font=Montserrat&text=${brand.name}`;
                }}
                className="w-[180px] md:w-[250px] lg:w-[300px] h-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}