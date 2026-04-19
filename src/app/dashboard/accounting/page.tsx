"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  FileText, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Search,
  ChevronRight,
  MoreVertical,
  PlusCircle,
  Briefcase,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  Clock,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Voucher = {
  id: string;
  voucher_date: string;
  type: 'general' | 'purchase' | 'sales';
  description: string;
  total_amount: number;
  status: string;
  partner_id?: string;
  erp_partners?: { name: string };
  account_code: string;
};

export default function AccountingPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vouchers' | 'reports'>('vouchers');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("erp_profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setCompanyId(profile.company_id);
      const { data, error } = await supabase
        .from("erp_accounting_vouchers")
        .select("*, erp_partners(name)")
        .eq("company_id", profile.company_id)
        .order("voucher_date", { ascending: false })
        .limit(20);
      
      if (data) setVouchers(data as any);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-white/50 px-6 py-3 rounded-3xl w-fit shadow-sm">
          <div className="p-2 bg-indigo-600 rounded-xl text-white"><FileText size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">General Ledger & Accounting</p>
            <p className="text-xs font-black text-slate-700 tracking-tight">종합 회계 및 전표 관리</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="px-6 py-3 bg-white text-slate-600 text-xs font-extrabold rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> 데이터 동기화
          </button>
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className="px-8 py-3.5 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
          >
            <Plus size={20} /> 전표 작성
          </button>
        </div>
      </div>

      {/* Jimin AI Insights Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-slate-900 rounded-[44px] p-8 text-white shadow-2xl shadow-indigo-200"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-cyan-900/20"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group shrink-0">
             <div className="absolute inset-0 bg-indigo-500/30 rounded-[32px] blur-xl group-hover:blur-2xl transition-all duration-500"></div>
             <div className="relative w-40 h-40 rounded-[32px] overflow-hidden border-2 border-white/10 shadow-2xl">
                <img src="/persona/jimin.png" alt="Jimin" className="w-full h-full object-cover" />
             </div>
          </div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-indigo-600 text-[10px] font-black tracking-widest uppercase rounded-lg">AI Financial Insight</span>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter leading-tight">
              "대표님, 이번 달 순수익률이 <span className="text-cyan-400">지난달 대비 12% 상승</span>할 것으로 보입니다."
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
              지연된 전표 <span className="text-white font-bold">3건</span>과 승인 대기 중인 지출 내역 <span className="text-white font-bold">5건</span>이 있습니다. 
              현재 시점의 가용 자금은 <span className="text-emerald-400 font-black">₩12,450,000</span> 입니다.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span className="text-[10px] font-black tracking-wider text-slate-300">세금계산서 정산 완료</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                <Clock size={14} className="text-amber-400" />
                <span className="text-[10px] font-black tracking-wider text-slate-300">마감 D-3</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="총 매출 (Sales)" value="₩24.5M" trend="+15%" icon={<TrendingUp className="text-indigo-600" />} />
        <StatCard label="영업 비용 (Base)" value="₩12.1M" trend="-2%" icon={<TrendingDown className="text-rose-500" />} />
        <StatCard label="실시간 순이익" value="₩12.4M" trend="+24%" icon={<DollarSign className="text-emerald-500" />} />
        <StatCard label="가용 자금 현황" value="₩10.8M" trend="Warning" icon={<PieChart className="text-amber-500" />} />
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('vouchers')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all ${activeTab === 'vouchers' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              종합 전표 내역
            </button>
            <button 
              onClick={() => setActiveTab('reports')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all ${activeTab === 'reports' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              재무 분석 리포트
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="검색어 또는 계정과목..." 
                className="pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-xs font-bold w-64 focus:ring-2 ring-indigo-500/10 transition-all" 
              />
            </div>
          </div>
        </div>

        {activeTab === 'vouchers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">일자</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">구분</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">거래처 / 적요</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">금액 (VAT 포함)</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">상태</th>
                  <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-bold italic animate-pulse">데이터를 불러오는 중...</td></tr>
                ) : vouchers.length === 0 ? (
                   <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase tracking-[0.2em]">전표 내역이 없습니다.</td></tr>
                ) : (
                  vouchers.map((v, idx) => (
                    <motion.tr 
                      key={v.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-6">
                        <span className="text-xs font-black text-slate-500">{new Date(v.voucher_date).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-6">
                        <span className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase tracking-wider ${
                          v.type === 'sales' ? 'bg-indigo-50 text-indigo-600' : 
                          v.type === 'purchase' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {v.type === 'sales' ? '매출' : v.type === 'purchase' ? '매입' : '일반'}
                        </span>
                      </td>
                      <td className="px-4 py-6">
                        <p className="text-sm font-black text-slate-800">{v.erp_partners?.name || "일반 기타"}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{v.description}</p>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <span className="text-sm font-black text-slate-800">₩{(v.total_amount).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-6">
                         <div className="flex justify-center">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-wider">승인완료</span>
                         </div>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <button className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><MoreVertical size={16} /></button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-400"><PieChart size={32} /></div>
            <p className="text-sm font-black text-slate-400 tracking-wider">상세 리포트 엔진을 준비 중입니다.</p>
          </div>
        )}
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <Plus size={28} className="relative transition-transform group-hover:rotate-90" />
        </button>
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddVoucherModal 
            companyId={companyId} 
            onClose={() => setIsAddModalOpen(false)} 
            onSuccess={() => { setIsAddModalOpen(false); fetchData(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddVoucherModal({ companyId, onClose, onSuccess }: { companyId: string | null, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    voucher_date: new Date().toISOString().split('T')[0],
    type: 'purchase' as 'sales' | 'purchase' | 'general',
    partner_id: '',
    description: '',
    amount: '',
    vat_amount: '',
    account_code: '101'
  });
  const [partners, setPartners] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      if (!companyId) return;
      const { data } = await supabase.from("erp_partners").select("*").eq("company_id", companyId);
      if (data) setPartners(data);
    };
    fetchPartners();
  }, [companyId]);

  const handleAmountChange = (val: string) => {
    const amt = Number(val);
    setFormData({
      ...formData,
      amount: val,
      vat_amount: (amt * 0.1).toFixed(0).toString()
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    const total = Number(formData.amount) + Number(formData.vat_amount);

    const { error } = await supabase.from("erp_accounting_vouchers").insert([{
      company_id: companyId,
      user_id: user?.id,
      voucher_date: formData.voucher_date,
      type: formData.type,
      partner_id: formData.partner_id || null,
      description: formData.description,
      amount: Number(formData.amount),
      vat_amount: Number(formData.vat_amount),
      total_amount: total,
      account_code: formData.account_code,
      status: 'approved'
    }]);

    if (!error) onSuccess(); else alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-slate-800">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        exit={{ opacity: 0, y: 20, scale: 0.95 }} 
        className="relative bg-white w-full max-w-xl rounded-[44px] p-12 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">New Voucher</span>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">수입/지출 전표 작성</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">전표 일자</label>
              <input type="date" required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-indigo-500/10 transition-all" value={formData.voucher_date} onChange={e => setFormData({...formData, voucher_date: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">거래 유형</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-indigo-500/10 transition-all" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                <option value="purchase">매입 (지출)</option>
                <option value="sales">매출 (수입)</option>
                <option value="general">일반 전표</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">거래처 / 파트너</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-indigo-500/10 transition-all" value={formData.partner_id} onChange={e => setFormData({...formData, partner_id: e.target.value})}>
              <option value="">거래처 선택 안함</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.name} ({p.business_number || 'No Biz Num'})</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">적요 / 거래 내용</label>
            <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-indigo-500/10 transition-all" placeholder="예: 서버 이용료 정산" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">공공가액 (₩)</label>
              <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl font-black text-xl border-none outline-none focus:ring-2 ring-indigo-500/10 transition-all" placeholder="0" value={formData.amount} onChange={e => handleAmountChange(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">부가세 (10%)</label>
              <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-xl border-none outline-none text-slate-400" value={formData.vat_amount} readOnly />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
            {submitting ? '저장 중...' : '회계 전표 발행 및 확정'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, trend, icon }: { label: string, value: string, trend: string, icon: React.ReactNode }) {
  const isNeutral = trend === 'Warning';
  
  return (
    <div className="p-7 rounded-[38px] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col gap-5 hover:y-[-4px] transition-all group">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">{icon}</div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black ${
          isNeutral ? 'bg-amber-50 text-amber-500' : 
          trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend.startsWith('+') ? <ArrowUpRight size={12} /> : trend.startsWith('-') ? <ArrowDownRight size={12} /> : null}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
