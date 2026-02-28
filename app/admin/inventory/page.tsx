'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { Pencil, Trash2, Plus, ArrowLeft, Loader2, CalendarClock, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Fetch Inventory
  useEffect(() => {
    async function fetchInventory() {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInventory();
  }, []);

  // Trigger Modal
  const confirmDelete = (id: string) => {
    setProductToDelete(id);
    setShowDeleteModal(true);
  };

  // Actual Delete Action
  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteDoc(doc(db, 'products', productToDelete));
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      setShowDeleteModal(false); // Close modal
    } catch (error) {
      alert("Error deleting product.");
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-brand-dark">Inventory <span className="font-bold">Manager</span></h1>
            <p className="text-gray-500 text-sm">Edit, delete, and schedule your products.</p>
          </div>
          <div className="flex gap-4">
             <Link href="/admin/dashboard" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest hover:bg-gray-50">
                <ArrowLeft size={16} /> Back
             </Link>
             <Link href="/admin/products" className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white text-xs font-bold uppercase tracking-widest hover:bg-brand-magenta">
                <Plus size={16} /> Add New
             </Link>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Category</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const now = new Date().toISOString().split('T')[0];
                const isScheduled = product.startDate && product.startDate > now;
                const isExpired = product.endDate && product.endDate < now;
                
                let statusBadge = <span className="text-green-600 bg-green-50 px-2 py-1 rounded-sm text-xs font-bold">Active</span>;
                if (isScheduled) statusBadge = <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1 w-fit"><CalendarClock size={12}/> Scheduled</span>;
                if (isExpired) statusBadge = <span className="text-red-600 bg-red-50 px-2 py-1 rounded-sm text-xs font-bold">Expired</span>;

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50">
                    <td className="p-4 flex items-center gap-4">
                      <div className="w-12 h-16 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                        <img src={product.images ? product.images[0] : product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-medium text-brand-dark">{product.title}</span>
                    </td>
                    <td className="p-4">OMR {product.price}</td>
                    <td className="p-4 text-gray-500">{product.category}</td>
                    <td className="p-4">{statusBadge}</td>
                    <td className="p-4 text-right space-x-2">
                      <Link href={`/admin/products/edit/${product.id}`} className="inline-block p-2 text-gray-400 hover:text-brand-magenta transition-colors" title="Edit">
                        <Pencil size={18} />
                      </Link>
                      <button onClick={() => confirmDelete(product.id)} className="inline-block p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && <div className="p-8 text-center text-gray-500">No products found.</div>}
        </div>
      </div>

      {/* CUSTOM ANIMATED DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-sm shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Delete Product?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to remove this item? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-sm font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors rounded-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-sm font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-colors rounded-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}