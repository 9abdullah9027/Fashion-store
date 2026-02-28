'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const availableCategories = ['Unstitched', 'Ready to Wear', 'Bridal & Formal', 'New Arrivals', 'Girls Festive', 'Waistcoats'];
const availableBrands = ['Fabricated Fabrics', 'Zelbury', 'Limelight', 'Generation', 'Khaadi', 'Sana Safinaz'];

function ShopContent() {
  const searchParams = useSearchParams();
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedProducts: any[] = [];
        querySnapshot.forEach((doc) => fetchedProducts.push({ id: doc.id, ...doc.data() }));
        setInventory(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    const urlBrand = searchParams.get('brand');
    if (urlCategory) setSelectedCategories([urlCategory]);
    if (urlBrand) setSelectedBrands([urlBrand]);
  }, [searchParams]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  // --- FILTER LOGIC WITH DATE CHECK ---
  const today = new Date().toISOString().split('T')[0]; // Get Today's Date (YYYY-MM-DD)

  const filteredProducts = inventory.filter((product) => {
    // 1. DATE CHECK: Hide if future start date OR past end date
    if (product.startDate && product.startDate > today) return false;
    if (product.endDate && product.endDate < today) return false;

    // 2. STANDARD FILTERS
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(cat => cat === 'New Arrivals' ? product.isNew : product.category === cat);
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const urlGender = searchParams.get('gender');
    const matchesGender = !urlGender || product.gender === urlGender;
    const productPrice = parseFloat(product.price);
    const matchesMin = minPrice === '' || productPrice >= parseFloat(minPrice);
    const matchesMax = maxPrice === '' || productPrice <= parseFloat(maxPrice);

    return matchesCategory && matchesBrand && matchesGender && matchesMin && matchesMax;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12">
      <aside className="w-full lg:w-1/4 flex-shrink-0 space-y-10">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-5">Categories</h3>
          <div className="space-y-3">
            {availableCategories.map((cat, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={() => handleCategoryToggle(cat)} className="w-4 h-4 rounded-sm border-gray-300 text-brand-magenta focus:ring-brand-magenta cursor-pointer" />
                <span className="text-sm text-gray-600 group-hover:text-brand-magenta transition-colors">{cat}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-5">Brands</h3>
          <div className="space-y-3">
            {availableBrands.map((brand, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => handleBrandToggle(brand)} className="w-4 h-4 rounded-sm border-gray-300 text-brand-magenta focus:ring-brand-magenta cursor-pointer" />
                <span className="text-sm text-gray-600 group-hover:text-brand-magenta transition-colors">{brand}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-5">Price (OMR)</h3>
          <div className="flex items-center gap-4">
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-brand-magenta" />
            <span className="text-gray-400">-</span>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-full border border-gray-200 p-2 text-sm focus:outline-none focus:border-brand-magenta" />
          </div>
        </div>
      </aside>

      <div className="w-full lg:w-3/4">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
          <span className="text-sm text-gray-500 font-medium">Showing {filteredProducts.length} results</span>
          <select className="border-none bg-transparent text-sm font-bold text-brand-dark uppercase tracking-widest focus:ring-0 cursor-pointer">
            <option>Sort by Latest</option><option>Price: Low to High</option><option>Price: High to Low</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-brand-magenta">
            <Loader2 size={40} className="animate-spin mb-4" /><p className="text-sm font-bold uppercase tracking-widest text-brand-dark">Loading Collection...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                id={product.id} 
                // FIX: Check for the new 'images' list first. If it exists, use the first one.
                image={product.images ? product.images[0] : product.image} 
                brand={product.brand} 
                title={product.title} 
                price={product.price} 
                isNew={product.isNew} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-xl font-light text-brand-dark mb-2">No items found.</h3>
            <p className="text-gray-500">Try adjusting your filters.</p>
            <button onClick={() => { setSelectedCategories([]); setSelectedBrands([]); setMinPrice(''); setMaxPrice(''); }} className="mt-6 text-sm font-bold text-brand-magenta uppercase tracking-widest hover:text-brand-dark transition-colors">Clear All Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="bg-white min-h-screen pt-10 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-light text-brand-dark tracking-tight mb-4">
          The <span className="font-bold">Collection</span>
        </h1>
        <p className="text-gray-500 font-light">Explore authentic Pakistani fashion tailored for Muscat.</p>
      </div>
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Loading collections...</div>}>
        <ShopContent />
      </Suspense>
    </div>
  );
}