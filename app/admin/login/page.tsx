'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin/dashboard'); 
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Access temporarily locked for security.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center px-4">
      <div className="bg-white p-8 rounded-sm shadow-2xl w-full max-w-md text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-dark">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-light text-brand-dark mb-2">Enterprise Access</h1>
        <p className="text-gray-500 text-sm mb-8">Authorized Personnel Only</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-sm mb-6 flex items-center gap-2 text-left">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Admin Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-brand-magenta transition-colors rounded-sm"
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-brand-magenta transition-colors rounded-sm"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-dark text-white py-4 text-sm uppercase tracking-widest font-bold hover:bg-brand-magenta transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}