"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message === "Invalid login credentials" ? "이메일 또는 비밀번호가 올바르지 않습니다." : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 relative">
        <div className="max-w-md w-full space-y-10">
          <div className="space-y-2">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Welcome Back</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">NEXO Login</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="이메일"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  placeholder="비밀번호"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-rose-50 text-rose-500 text-xs font-bold rounded-xl border border-rose-100 flex items-center gap-3 overflow-hidden"
                >
                  <AlertCircle size={16} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>로그인 <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="text-center text-sm font-bold text-slate-400">
            아직 계정이 없으신가요? <Link href="/signup" className="text-indigo-600 underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600 transition-all">회원가입</Link>
          </p>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-20">
         <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-900 rounded-full blur-[150px]"></div>
         </div>
         <div className="relative space-y-8 max-w-lg text-white">
           <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black text-5xl shadow-2xl skew-x-3 rotate-3 italic">N</div>
           <div className="space-y-4">
             <h2 className="text-5xl font-black leading-tight tracking-tighter">
               NEXO ERP<br />
               <span className="text-indigo-400">Cloud OS</span>
             </h2>
             <p className="text-slate-400 text-lg font-bold leading-relaxed">
               데이터 중심의 직관적인 의사결정.<br />
               팀의 생산성을 한 차원 더 높여보세요.
             </p>
           </div>
         </div>
      </div>
    </div>
  );
}
