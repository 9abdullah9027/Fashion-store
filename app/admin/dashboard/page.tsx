'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { 
  Package, MapPin, Smartphone, Calendar, Search, Loader2, LogOut, Plus, Layers, 
  TrendingUp, DollarSign, CheckCircle, Clock, Tag
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PrintInvoiceBtn from '@/components/admin/PrintInvoiceBtn'; // NEW IMPORT

// Define what an order looks like
interface Order {
  id: string;
  orderId: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    area: string;
    address: string;
    email: string;
  };
  items: any[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: any;
}

const ORDER_STATUSES = ['Pending Bank Transfer', 'Payment Received', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // --- ANALYTICS STATE ---
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });

  // 1. SECURITY CHECK
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  // 2. FETCH DATA & CALCULATE STATS
  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        
        setOrders(fetchedOrders);
        calculateStats(fetchedOrders);

      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsFetching(false);
      }
    }

    fetchOrders();
  }, [user]);

  // 3. ANALYTICS ENGINE
  const calculateStats = (data: Order[]) => {
    const totalRevenue = data.reduce((acc, order) => {
      return order.status !== 'Cancelled' ? acc + order.total : acc;
    }, 0);

    const pending = data.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
    const delivered = data.filter(o => o.status === 'Delivered').length;

    setStats({
      revenue: totalRevenue,
      totalOrders: data.length,
      pendingOrders: pending,
      deliveredOrders: delivered
    });
  };

  // 4. STATUS UPDATE HANDLER
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      
      setOrders(updatedOrders);
      calculateStats(updatedOrders);
      
    } catch (error) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-OM', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  const filteredOrders = orders.filter(order => 
    order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'Pending Bank Transfer': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  if (loading || isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-dark" size={40} />
        <p className="text-sm font-bold uppercase tracking-widest text-gray-400">Loading Business Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* HEADER BAR */}
      <div className="bg-brand-dark text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-light tracking-tight mb-2">
              Enterprise <span className="font-bold">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Analytics & Order Management
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <Link 
               href="/admin/coupons" 
               className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-3 rounded-sm hover:bg-white hover:text-brand-dark transition-all border border-transparent hover:border-white"
             >
               <Tag size={16} /> Coupons
             </Link>

            <Link 
               href="/admin/inventory" 
               className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-3 rounded-sm hover:bg-white hover:text-brand-dark transition-all border border-transparent hover:border-white"
             >
               <Layers size={16} /> Inventory
             </Link>

             <Link 
               href="/admin/products"
               className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-brand-magenta text-white px-6 py-3 rounded-sm hover:bg-white hover:text-brand-magenta transition-all shadow-lg"
             >
               <Plus size={16} /> Add Product
             </Link>

            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-red-500/20 text-red-200 px-4 py-3 rounded-sm hover:bg-red-600 hover:text-white transition-all ml-2"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 space-y-8">
        
        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-sm shadow-lg border-b-4 border-brand-magenta flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-brand-dark">OMR {stats.revenue.toFixed(3)}</h3>
            </div>
            <div className="bg-brand-magenta/10 p-3 rounded-full text-brand-magenta"><DollarSign size={24} /></div>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-lg border-b-4 border-blue-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Active / Pending</p>
              <h3 className="text-2xl font-bold text-brand-dark">{stats.pendingOrders}</h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Clock size={24} /></div>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-lg border-b-4 border-green-500 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Delivered</p>
              <h3 className="text-2xl font-bold text-brand-dark">{stats.deliveredOrders}</h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600"><CheckCircle size={24} /></div>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-lg border-b-4 border-gray-300 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">All Time Orders</p>
              <h3 className="text-2xl font-bold text-brand-dark">{stats.totalOrders}</h3>
            </div>
            <div className="bg-gray-100 p-3 rounded-full text-gray-500"><TrendingUp size={24} /></div>
          </div>
        </div>

        {/* ORDER TABLE */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
            <div className="relative w-full sm:w-96">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-200 p-2.5 pl-10 text-sm focus:outline-none focus:border-brand-magenta transition-colors rounded-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
               <div className="w-2 h-2 rounded-full bg-green-500"></div> Real-time Sync
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No orders found.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100">
                    <th className="p-4">Order Details</th>
                    <th className="p-4">Customer Info</th>
                    <th className="p-4">Items</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4 w-64">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 align-top">
                        <span className="font-bold text-brand-dark block">{order.orderId}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar size={12} /> {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <span className="font-medium text-brand-dark block">{order.customer.firstName} {order.customer.lastName}</span>
                        <span className="text-xs text-gray-500 block mt-1">{order.customer.phone}</span>
                        <span className="text-xs text-gray-400 block mt-0.5 max-w-[180px] truncate">{order.customer.area}</span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="space-y-1">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="text-xs text-gray-600 flex justify-between gap-4 max-w-[200px]">
                                <span className="truncate">{item.quantity}x {item.title}</span>
                                <span className="text-gray-400 shrink-0">{item.size}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-top font-bold text-brand-dark">
                        OMR {order.total.toFixed(3)}
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-2">
                          <div className="relative flex-1">
                            {updatingId === order.id && (
                              <div className="absolute right-2 top-2 z-10">
                                <Loader2 size={16} className="animate-spin text-brand-magenta" />
                              </div>
                            )}
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              disabled={updatingId === order.id}
                              className={`w-full p-2 text-[10px] font-bold uppercase tracking-widest border rounded-sm cursor-pointer outline-none transition-colors ${getStatusColor(order.status)}`}
                            >
                              {ORDER_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                          
                          {/* THE NEW PRINT BUTTON */}
                          <PrintInvoiceBtn order={order} />
                        </div>
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
  );
}