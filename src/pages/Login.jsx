import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    
    const result = await login(email, password);
    setLoading(false);
    
    if (!result.success) {
      setErrorMsg(result.error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative premium shapes */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-premium-lg border border-slate-100 overflow-hidden relative z-10">
        <div className="bg-primary p-8 text-center text-white relative">
          <div className="absolute inset-0 bg-gradient-primary opacity-90 z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo placeholder or branding */}
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-3 border border-red-500/20">
              <span className="text-primary font-bold text-2xl tracking-tighter font-serif">EH</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">ELHAKIM UMROH HAJI</h1>
            <p className="text-xs text-red-100 mt-1 uppercase tracking-widest font-medium">Sistem Keuangan Umroh & Haji</p>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-6 text-center">Masuk ke Sistem</h2>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-primary text-primary text-xs rounded">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Alamat Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="name@elhakim.co.id"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Kata Sandi</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2 mt-6 active:scale-95"
            >
              {loading ? 'Memproses...' : 'Masuk Log'}
              <KeyRound size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}