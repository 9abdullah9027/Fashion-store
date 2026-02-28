'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, UploadCloud, CheckCircle, Plus, ArrowLeft, X, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ALL_SIZES = ['Unstitched', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('Fabricated Fabrics');
  const [price, setPrice] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('2.500');
  const [category, setCategory] = useState('Unstitched');
  const [gender, setGender] = useState('Women');
  const [description, setDescription] = useState('');
  
  // NEW: Scheduling State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Image State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Size State
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['Unstitched']);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImageFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) return alert('Please upload at least one image!');
    if (selectedSizes.length === 0) return alert('Please select at least one size!');
    
    setIsLoading(true);

    try {
      // 1. Upload Images to Cloudinary
      const imageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'fabricated_preset'); // YOUR PRESET
          const res = await fetch(
            'https://api.cloudinary.com/v1_1/dnaaavlok/image/upload', // YOUR CLOUD NAME
            { method: 'POST', body: formData }
          );
          const data = await res.json();
          return data.secure_url;
        })
      );

      // 2. Save to Firebase with Scheduling Dates
      await addDoc(collection(db, 'products'), {
        title,
        brand,
        price: parseFloat(price).toFixed(3),
        deliveryFee: parseFloat(deliveryFee).toFixed(3),
        description: description || 'No description provided.',
        category,
        gender,
        images: imageUrls,
        sizes: selectedSizes,
        startDate: startDate || '', // Save Start Date
        endDate: endDate || '',     // Save End Date
        isNew: true,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setPrice('');
        setDescription('');
        setImageFiles([]);
        setPreviews([]);
        setSelectedSizes(['Unstitched']);
        setStartDate('');
        setEndDate('');
      }, 2000);

    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <CheckCircle size={64} className="text-brand-emerald mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-brand-dark">Product Live!</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-brand-dark">Enterprise <span className="font-bold">Inventory</span></h1>
            <p className="text-gray-500 text-sm">Add rich product details & schedules.</p>
          </div>
          <Link href="/admin/dashboard" className="text-sm font-bold text-gray-400 hover:text-brand-dark flex items-center gap-2">
            <ArrowLeft size={16} /> Cancel
          </Link>
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Gallery */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-4">Product Gallery</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="aspect-[2/3] border-2 border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-brand-magenta hover:bg-gray-50 transition-all">
                  <UploadCloud size={24} className="text-gray-400 mb-2" />
                  <span className="text-xs font-bold text-gray-500 text-center px-2">Add Images</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
                {previews.map((src, idx) => (
                  <div key={idx} className="relative aspect-[2/3] border border-gray-200 rounded-sm overflow-hidden group">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-white text-red-500 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="label-text">Product Title</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Signature Velvet Edit" />
              </div>
              <div>
                <label className="label-text">Brand</label>
                <select value={brand} onChange={e => setBrand(e.target.value)} className="input-field bg-white">
                  <option>Fabricated Fabrics</option><option>Zelbury</option><option>Limelight</option><option>Generation</option><option>Khaadi</option><option>Sana Safinaz</option>
                </select>
              </div>
              <div>
                <label className="label-text">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input-field bg-white">
                  <option>Unstitched</option><option>Ready to Wear</option><option>Bridal & Formal</option><option>New Arrivals</option><option>Waistcoats</option><option>Girls Festive</option>
                </select>
              </div>
              <div>
                <label className="label-text">Price (OMR)</label>
                <input required type="number" step="0.100" value={price} onChange={e => setPrice(e.target.value)} className="input-field" placeholder="15.000" />
              </div>
              <div>
                <label className="label-text">Delivery Fee (OMR)</label>
                <input required type="number" step="0.100" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} className="input-field" placeholder="2.500" />
              </div>
            </div>

            {/* NEW: SCHEDULING SECTION */}
            <div className="p-6 bg-brand-cream/30 rounded-sm border border-brand-lavender/20">
              <h3 className="text-sm font-bold text-brand-dark mb-4 flex items-center gap-2">
                  <Calendar size={16} className="text-brand-magenta" /> Scheduling Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="label-text">Start Showing On</label>
                      <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field bg-white" />
                      <p className="text-[10px] text-gray-400 mt-1">Leave empty to show immediately.</p>
                  </div>
                  <div>
                      <label className="label-text">Stop Showing On</label>
                      <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field bg-white" />
                      <p className="text-[10px] text-gray-400 mt-1">Leave empty to show forever.</p>
                  </div>
              </div>
            </div>

            {/* Description & Sizes */}
            <div>
              <label className="label-text">Description</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="input-field resize-none" placeholder="Describe fabric, embroidery..." />
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-4">Available Sizes</h3>
              <div className="flex flex-wrap gap-3">
                {ALL_SIZES.map(size => (
                  <button key={size} type="button" onClick={() => toggleSize(size)} className={`px-4 py-2 text-sm font-medium border rounded-sm transition-all ${selectedSizes.includes(size) ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-500 border-gray-200 hover:border-brand-magenta'}`}>{size}</button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-brand-dark text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-brand-magenta transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 mt-8">
              {isLoading ? <><Loader2 className="animate-spin" /> Uploading...</> : <><Plus size={18} /> Publish to Store</>}
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        .label-text { display: block; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .input-field { width: 100%; border: 1px solid #e5e7eb; padding: 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #be185d; }
      `}</style>
    </div>
  );
}