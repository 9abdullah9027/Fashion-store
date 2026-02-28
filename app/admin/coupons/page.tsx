'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Tag, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [value, setValue] = useState('');

  // Fetch Coupons
  useEffect(() => {
    async function fetchCoupons() {
      try {
        const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching coupons:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCoupons();
  }, []);

  // Add Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    try {
      await addDoc(collection(db, 'coupons'), {
        code: code.toUpperCase(),
        type: discountType,
        value: parseFloat(value),
        isActive: true,
        createdAt: serverTimestamp(),
      });
      // Reload page logic (quick & dirty)
      window.location.reload(); 
    } catch (error) {
      alert("Error adding coupon");
    }
  };

  // Delete Coupon
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await deleteDoc(doc(db, 'coupons', id));
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-brand-dark">Coupon <span className="font-bold">Manager</span></h1>
            <p className="text-gray-500 text-sm">Create discount codes for your customers.</p>
          </div>
          <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-gray-50">
            <ArrowLeft size={16} /> Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CREATE FORM */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 sticky top-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-brand-dark mb-6">Create New</h3>
              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="EID2026" className="w-full border p-2 text-sm uppercase font-bold" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full border p-2 text-sm bg-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (OMR)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1">Value</label>
                  <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="10" className="w-full border p-2 text-sm" required />
                </div>
                <button type="submit" className="w-full bg-brand-dark text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-magenta transition-colors flex justify-center gap-2">
                  <Plus size={16} /> Create Code
                </button>
              </form>
            </div>
          </div>

          {/* COUPON LIST */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500">
                    <tr>
                      <th className="p-4">Code</th>
                      <th className="p-4">Discount</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id}>
                        <td className="p-4 font-bold text-brand-dark flex items-center gap-2">
                          <Tag size={14} className="text-brand-magenta" /> {coupon.code}
                        </td>
                        <td className="p-4">
                          {coupon.type === 'percentage' ? `${coupon.value}% Off` : `OMR ${coupon.value} Off`}
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(coupon.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}