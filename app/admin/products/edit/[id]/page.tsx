'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Loader2, CheckCircle, Save, ArrowLeft, Calendar, UploadCloud, X, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const ALL_SIZES = ['Unstitched', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    price: '',
    deliveryFee: '',
    category: '',
    gender: 'Women',
    description: '',
    startDate: '',
    endDate: '',
  });

  // Image & Size State
  const [existingImages, setExistingImages] = useState<string[]>([]); // URLs from DB
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]); // New uploads
  const [newPreviews, setNewPreviews] = useState<string[]>([]); // Previews for new uploads
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // 1. FETCH DATA
  useEffect(() => {
    async function fetchData() {
      const docRef = doc(db, 'products', params.id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
            title: data.title,
            brand: data.brand,
            price: data.price,
            deliveryFee: data.deliveryFee || '2.500',
            category: data.category,
            gender: data.gender || 'Women',
            description: data.description || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
        });
        // Handle Images (Support old single 'image' and new 'images' array)
        setExistingImages(data.images || [data.image]);
        setSelectedSizes(data.sizes || ['Unstitched']);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [params.id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image Handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...newFiles]);
      setNewPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeExistingImage = (urlToDelete: string) => {
    setExistingImages(prev => prev.filter(url => url !== urlToDelete));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  // 2. UPDATE FUNCTION
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // A. Upload New Images to Cloudinary (if any)
      const newImageUrls = await Promise.all(
        newImageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', 'fabricated_preset'); // <--- CHECK THIS PRESET NAME
          const res = await fetch(
            'https://api.cloudinary.com/v1_1/dnaaavlok/image/upload', // <--- YOUR CLOUD NAME
            { method: 'POST', body: formData }
          );
          const data = await res.json();
          return data.secure_url;
        })
      );

      // B. Combine Old + New Images
      const finalImages = [...existingImages, ...newImageUrls];

      if (finalImages.length === 0) {
        alert("Product must have at least one image.");
        setIsSaving(false);
        return;
      }

      // C. Update Firestore
      const docRef = doc(db, 'products', params.id as string);
      await updateDoc(docRef, {
        ...formData,
        price: parseFloat(formData.price).toFixed(3),
        deliveryFee: parseFloat(formData.deliveryFee).toFixed(3),
        images: finalImages,
        sizes: selectedSizes,
      });

      setSuccess(true);
      setTimeout(() => router.push('/admin/inventory'), 1500);

    } catch (error) {
      console.error(error);
      alert("Failed to update.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <CheckCircle size={64} className="text-brand-emerald mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-brand-dark">Product Updated!</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light text-brand-dark">Edit <span className="font-bold">Product</span></h1>
          <Link href="/admin/inventory" className="text-sm font-bold text-gray-400 hover:text-brand-dark flex items-center gap-2"><ArrowLeft size={16} /> Cancel</Link>
        </div>

        <form onSubmit={handleUpdate} className="bg-white p-8 rounded-sm shadow-sm space-y-8">
          
          {/* IMAGE MANAGER */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-4">Gallery Management</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {/* Existing Images */}
              {existingImages.map((src, idx) => (
                <div key={`old-${idx}`} className="relative aspect-[2/3] border border-gray-200 rounded-sm overflow-hidden group">
                  <img src={src} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => removeExistingImage(src)} className="bg-white text-red-500 p-2 rounded-full"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {/* New Previews */}
              {newPreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative aspect-[2/3] border-2 border-brand-emerald rounded-sm overflow-hidden group">
                  <img src={src} className="w-full h-full object-cover" />
                  <div className="absolute top-1 right-1"><span className="bg-brand-emerald text-white text-[9px] px-1 rounded-sm uppercase font-bold">New</span></div>
                  <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 left-1 bg-white text-gray-500 p-1 rounded-full"><X size={12} /></button>
                </div>
              ))}
              {/* Upload Button */}
              <label className="aspect-[2/3] border-2 border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-brand-magenta hover:bg-gray-50 transition-all">
                <UploadCloud size={24} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase">Add New</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* BASIC INFO */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="col-span-2 md:col-span-1">
                <label className="label">Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className="input" />
            </div>
            <div>
                <label className="label">Brand</label>
                <select name="brand" value={formData.brand} onChange={handleChange} className="input bg-white"><option>Fabricated Fabrics</option><option>Zelbury</option><option>Limelight</option><option>Generation</option><option>Khaadi</option><option>Sana Safinaz</option></select>
            </div>
            <div>
                <label className="label">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input bg-white"><option>Unstitched</option><option>Ready to Wear</option><option>Bridal & Formal</option><option>New Arrivals</option><option>Waistcoats</option><option>Girls Festive</option></select>
            </div>
            <div>
                <label className="label">Price (OMR)</label>
                <input name="price" type="number" step="0.100" value={formData.price} onChange={handleChange} className="input" />
            </div>
            <div>
                <label className="label">Delivery Fee</label>
                <input name="deliveryFee" type="number" step="0.100" value={formData.deliveryFee} onChange={handleChange} className="input" />
            </div>
            <div>
                <label className="label">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="input bg-white"><option>Women</option><option>Men</option><option>Kids</option></select>
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-4">Size Availability</h3>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                {ALL_SIZES.map(size => {
                    const isAvailable = selectedSizes.includes(size);
                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`flex flex-col items-center justify-center p-2 border rounded-sm transition-all ${
                                isAvailable 
                                ? 'bg-brand-dark text-white border-brand-dark shadow-md' 
                                : 'bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300'
                            }`}
                        >
                            <span className="text-sm font-bold">{size}</span>
                            <span className="text-[9px] uppercase tracking-widest mt-1 opacity-80">
                                {isAvailable ? 'Active' : 'N/A'}
                            </span>
                        </button>
                    )
                })}
            </div>
          </div>

          {/* SCHEDULING */}
          <div className="p-4 bg-brand-cream/30 rounded-sm border border-brand-lavender/20">
            <h3 className="text-sm font-bold text-brand-dark mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-brand-magenta" /> Scheduling
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Start Date</label><input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className="input" /></div>
                <div><label className="label">End Date</label><input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className="input" /></div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="label">Description</label>
            <textarea name="description" rows={5} value={formData.description} onChange={handleChange} className="input" />
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-brand-dark text-white py-4 font-bold uppercase tracking-widest hover:bg-brand-magenta transition-colors flex justify-center gap-2 shadow-lg">
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update Product</>}
          </button>
        </form>
      </div>
      <style jsx>{`
        .label { display: block; font-size: 0.75rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .input { width: 100%; border: 1px solid #e5e7eb; padding: 0.75rem; font-size: 0.875rem; outline: none; transition: border-color 0.2s; }
        .input:focus { border-color: #be185d; }
      `}</style>
    </div>
  );
}