import Link from 'next/link';

export default function AboutSection() {
  return (
    <section className="bg-white py-24 md:py-32 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16 md:gap-24">
          
          {/* Left Side: Clean, High-End Image Placeholder */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] w-full rounded-none overflow-hidden bg-gray-50 relative">
              <img 
                src="/images/collection.png" 
                alt="About Fabricated Fabrics" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          {/* Right Side: Editorial Copy */}
          <div className="w-full md:w-1/2 space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">
                Our Story
              </p>
              <h2 className="text-3xl md:text-5xl font-light text-brand-dark leading-[1.2]">
                Bridging the gap between Pakistan's finest fashion and your wardrobe in <span className="font-bold">Oman.</span>
              </h2>
            </div>

            <div className="space-y-6 text-gray-500 font-light leading-relaxed text-lg">
              <p>
                Fabricated Fabrics is an Oman-based page created to bring authentic Pakistani fashion closer to you. We help our customers order original clothing directly from trusted and verified websites in Pakistan, eliminating the hassle of international logistics.
              </p>
              <p>
                From everyday wear to formal outfits, unstitched to ready-to-wear, we offer pieces in all styles, all sizes, and for every occasion.
              </p>
              <p className="text-brand-dark font-medium border-l-2 border-brand-magenta pl-6 py-2">
                Quality, authenticity, and convenience—making sure you get exactly what you choose, with confidence and ease.
              </p>
            </div>

            <div className="pt-8">
              <Link 
                href="/about" 
                className="group flex items-center gap-4 text-sm font-bold text-brand-dark uppercase tracking-widest hover:text-brand-magenta transition-colors"
              >
                Read More 
                <span className="w-12 h-[1px] bg-brand-dark group-hover:bg-brand-magenta transition-colors"></span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}