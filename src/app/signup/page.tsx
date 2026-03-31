"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  User, 
  Mail, 
  Lock, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

function SignupForm() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    employeeCode: searchParams.get("code") || ""
  });

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      setFormData(prev => ({ ...prev, employeeCode: code }));
    }
  }, [searchParams]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Validate Employee Code
      const { data: codeData, error: codeError } = await supabase
        .from("erp_employee_codes")
        .select("id, department_id, company_id, is_used")
        .eq("code", formData.employeeCode)
        .single();

      if (codeError || !codeData) {
        throw new Error("유효하지 않은 사번 코드입니다. 관리자에게 문의하세요.");
      }

      if (codeData.is_used) {
        throw new Error("이미 사용된 사번 코드입니다.");
      }

      // 2. Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 3. Create Profile with Department
        const { error: profileError } = await supabase
          .from("erp_profiles")
          .upsert({
            id: authData.user.id,
            company_id: codeData.company_id,
            department_id: codeData.department_id,
            employee_id: formData.employeeCode,
            full_name: formData.fullName,
            role: formData.employeeCode === 'NEXO-OWNER-2026' ? 'owner' : 'member'
          });

        if (profileError) throw profileError;

        // 4. Mark code as used
        await supabase
          .from("erp_employee_codes")
          .update({ is_used: true })
          .eq("id", codeData.id);

        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[44px] shadow-2xl shadow-slate-200 p-12 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-emerald-500">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">회원가입 완료!</h1>
          <p className="text-slate-500 font-bold leading-relaxed">
            환영합니다, {formData.fullName}님!<br />
            입력하신 이메일({formData.email})로 확인 메일이 발송되었습니다. 
            인증 후 로그인이 가능합니다.
          </p>
          <Link href="/login" className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all">
            로그인하러 가기
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-hidden">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden items-center justify-center p-20">
         <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-cyan-400 rounded-full blur-[150px]"></div>
         </div>
         <div className="relative space-y-8 max-w-lg">
           <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center text-indigo-600 font-black text-5xl shadow-2xl skew-x-3 rotate-3">N</div>
           <div className="space-y-4">
             <h2 className="text-5xl font-black text-white leading-tight tracking-tighter">
               NEXO ERP<br />
               <span className="text-indigo-200">Smart Workspace</span>
             </h2>
             <p className="text-indigo-100 text-lg font-bold leading-relaxed opacity-80">
               사번 하나로 시작하는 지능형 업무 환경.<br />
               귀하의 열정을 NEXO와 함께 펼쳐보세요.
             </p>
           </div>
         </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 relative">
        <div className="max-w-md w-full space-y-10">
          <div className="space-y-2">
            <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Start Your Journey</p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Join NEXO Team</h1>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="성함"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  placeholder="사번(Employee ID)"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black font-mono text-indigo-600 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all uppercase"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                />
              </div>

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
              {loading ? <Loader2 className="animate-spin" /> : <>NEXO 팀 합류하기 <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="text-center text-sm font-bold text-slate-400">
            이미 계정이 있으신가요? <Link href="/login" className="text-indigo-600 underline underline-offset-4 decoration-indigo-200 hover:decoration-indigo-600 transition-all">로그인</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    }>
      <SignupForm />
    </React.Suspense>
  );
}
