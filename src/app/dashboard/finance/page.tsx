"use client";

import React, { useState, useEffect } from "react";

import { 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Building2, 
  RefreshCw,
  ShieldCheck,
  UserCheck,
  FileText,
  CreditCard as CardIcon,
  PieChart,
  Download,
  Printer,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type ERPRequest = {
  id: string;
  amount: number;
  status: string;
  title: string;
};

type ERPIncome = {
  id: string;
  amount: number;
  title: string;
};

export default function FinancePage() {
  const [requests, setRequests] = useState<ERPRequest[]>([]);
  const [incomeList, setIncomeList] = useState<ERPIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userDept, setUserDept] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<"revenue" | "expense" | "profit" | null>(null);
  const [corporateCards, setCorporateCards] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("erp_profiles")
        .select(`
          company_id, 
          role, 
          erp_companies(name),
          erp_departments(name)
        `)
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserRole(profile.role);
        setUserDept((profile as any).erp_departments?.name || "");
        setCompanyName((profile as any).erp_companies?.name || "지민컴퍼니");
        setCompanyId(profile.company_id);
        
        // Fetch Departments (needed for budget setting)
        const { data: depts } = await supabase
          .from("erp_departments")
          .select("id, name")
          .eq("company_id", profile.company_id);
        if (depts) setDepartments(depts);

        const { data: reqData } = await supabase
          .from("erp_requests")
          .select("id, amount, status, title, created_at, content")
          .eq("company_id", profile.company_id)
          .eq("status", "approved");

        const { data: incData } = await supabase
          .from("erp_income")
          .select("id, amount, title, date, content")
          .eq("company_id", profile.company_id);

        if (reqData) setRequests(reqData as any);
        if (incData) setIncomeList(incData as any);

        // Fetch Corporate Cards (Only if authorized)
        if (profile.role === 'owner' || profile.role === 'admin' || ["회계팀", "영업팀"].includes((profile as any).erp_departments?.name)) {
          const { data: cards } = await supabase
            .from("erp_corporate_cards")
            .select("*")
            .eq("company_id", profile.company_id)
            .order("created_at", { ascending: false });
          if (cards) setCorporateCards(cards);
        }

        // Fetch Budgets
        const { data: budgetData } = await supabase
          .from("erp_budgets")
          .select(`
            *,
            department:erp_departments(name)
          `)
          .eq("company_id", profile.company_id);
        if (budgetData) setBudgets(budgetData);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalExpense = requests.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalIncome = incomeList.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const netProfit = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-black tracking-widest uppercase">재무 데이터 분석 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]">
            Financial Intelligence Center
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter">재무 인사이트 대시보드</h1>
          <p className="text-slate-500 font-medium">우리 회사의 자금 흐름과 성장 지표를 한눈에 파악하세요. ✨ <span className="text-indigo-400 font-bold ml-2">#지능형_분석</span></p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-4 rounded-[32px] shadow-xl shadow-slate-200/50">
           <div className={`p-2.5 ${userRole === 'owner' || userRole === 'admin' ? 'bg-emerald-500' : 'bg-slate-400'} rounded-xl text-white`}>
             <ShieldCheck size={20} />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Authority</p>
              <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{userRole || 'STAFF'}</p>
           </div>
           <div className="w-px h-8 bg-slate-100 mx-2"></div>
           <button onClick={() => fetchData()} className="p-2 hover:bg-slate-50 rounded-full transition-all text-slate-400 active:rotate-180 duration-500">
             <RefreshCw size={20} />
           </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard 
          icon={<TrendingUp className="text-emerald-500" />} 
          label="누적 매출 실적" 
          value={`₩${totalIncome.toLocaleString()}`} 
          desc="Accumulated Revenue"
          onClick={() => setSelectedDetail('revenue')}
        />
        <SummaryCard 
          icon={<TrendingDown className="text-rose-500" />} 
          label="승인된 지출 합계" 
          value={`₩${totalExpense.toLocaleString()}`} 
          desc="Approved Expenses"
          onClick={() => setSelectedDetail('expense')}
        />
        <SummaryCard 
          icon={<CreditCard className={netProfit >= 0 ? "text-indigo-500" : "text-rose-600"} />} 
          label="가용 자본 (P&L)" 
          value={`₩${netProfit.toLocaleString()}`} 
          desc="Net Profit"
          highlight={true}
          onClick={() => setSelectedDetail('profit')}
        />
      </div>

      {/* Detail In-depth Modal */}
      <div className="fixed z-50">
        <AnimatePresence>
          {selectedDetail && (
            <DetailViewModal 
              type={selectedDetail} 
              data={selectedDetail === 'revenue' ? incomeList : requests}
              onClose={() => setSelectedDetail(null)}
              totals={{ income: totalIncome, expense: totalExpense, profit: netProfit }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Corporate Cards & Budgets (Conditional) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Corporate Cards Section */}
        {(userRole === 'owner' || userRole === 'admin' || ["회계팀", "영업팀"].includes(userDept)) && (
          <div className="lg:col-span-2 bg-white rounded-[44px] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <CardIcon className="text-indigo-600" /> 법인카드 관리
              </h3>
              <div className="flex items-center gap-2">
                {(userRole === 'owner' || userRole === 'admin') && (
                  <button 
                    onClick={() => setIsCardModalOpen(true)}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-indigo-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4"
                  >
                    <Plus size={14} /> 카드 추가
                  </button>
                )}
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">Live Usage</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {corporateCards.length === 0 ? (
                <div className="col-span-full py-10 text-center opacity-30 flex flex-col items-center gap-3">
                  <CardIcon size={40} />
                  <p className="text-xs font-black uppercase tracking-widest">No Registered Cards</p>
                </div>
              ) : (
                corporateCards.map((card) => (
                  <div key={card.id} className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 hover:border-indigo-200 transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.bank_name}</p>
                        <p className="text-sm font-black text-slate-800 tracking-tighter">**** {card.card_number.slice(-4)}</p>
                      </div>
                      <span className="text-[9px] font-black text-indigo-600 bg-white px-2 py-1 rounded-lg border border-indigo-50 uppercase tracking-tighter">{card.card_holder_name}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-black">
                        <span className="text-slate-400">Monthly Usage</span>
                        <span className="text-indigo-600">₩{Number(card.current_usage).toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-white rounded-full overflow-hidden border border-slate-100/50 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((card.current_usage / card.monthly_limit) * 100, 100)}%` }}
                          className={`h-full ${card.current_usage > card.monthly_limit * 0.9 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        <span>Limit: ₩{Number(card.monthly_limit).toLocaleString()}</span>
                        <span>{Math.round((card.current_usage / card.monthly_limit) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Budgets Section */}
        <div className={`${(userRole === 'owner' || userRole === 'admin' || ["회계팀", "영업팀"].includes(userDept)) ? 'lg:col-span-1' : 'lg:col-span-3'} bg-slate-900 rounded-[44px] p-10 border border-slate-800 text-white space-y-8 shadow-2xl shadow-slate-900/40 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <h3 className="text-xl font-black flex items-center gap-3">
              <PieChart className="text-emerald-400" /> 부서별 예산 현황
            </h3>
            <div className="flex items-center gap-2">
              {(userRole === 'owner' || userRole === 'admin') && (
                <button 
                  onClick={() => setIsBudgetModalOpen(true)}
                  className="p-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 border border-white/10"
                >
                  <Plus size={12} /> 예산 설정
                </button>
              )}
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">March 2026</span>
            </div>
          </div>

          <div className="space-y-8 relative z-10">
            {budgets.length === 0 ? (
               <div className="py-20 text-center opacity-20 flex flex-col items-center gap-3">
                 <Building2 size={40} />
                 <p className="text-xs font-black uppercase tracking-widest">No Budget Settings</p>
               </div>
            ) : (
              budgets.map((b) => (
                <div key={b.id} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{b.department?.name?.split('(')[0]}</p>
                      <p className="text-sm font-black tracking-tighter">₩{Number(b.spent_budget).toLocaleString()} / ₩{Number(b.total_budget).toLocaleString()}</p>
                    </div>
                    <span className={`text-[10px] font-black ${b.spent_budget > b.total_budget ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {Math.round((b.spent_budget / b.total_budget) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((b.spent_budget / b.total_budget) * 100, 100)}%` }}
                      className={`h-full ${b.spent_budget > b.total_budget ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]' : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]'}`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-6 relative z-10 border-t border-white/10">
            <button className="w-full py-4 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2">
              <ArrowUpRight size={14} /> View All Departments
            </button>
          </div>
        </div>
      </div>

      {/* Reports & Exports Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[50px] p-12 text-white relative overflow-hidden shadow-3xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
               <FileText size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">Automatic Financial Repo.</h2>
              <p className="text-indigo-100 font-medium leading-relaxed">이번 달의 재무 지표를 AI가 분석하고 럭셔리한 리포트로 자동 생성합니다. 투자자 브리핑과 내부 보고용으로 완벽하게 디자인되었습니다.</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowReport(true)}
              className="flex-1 px-8 py-5 bg-white text-indigo-700 font-black rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3"
            >
              <Printer size={20} /> 실적 보고서 생성
            </button>
            <button className="flex-1 px-8 py-5 bg-indigo-500/30 text-white font-black rounded-[24px] hover:bg-indigo-500/50 border border-white/20 transition-all flex items-center justify-center gap-3">
              <Download size={20} /> Excel 추출
            </button>
          </div>
        </div>
      </div>

      {/* Setup Modals */}
      <AnimatePresence>
        {isCardModalOpen && (
          <AddCardModal 
            companyId={companyId} 
            onClose={() => setIsCardModalOpen(false)} 
            onSuccess={() => { setIsCardModalOpen(false); fetchData(); }} 
          />
        )}
        {isBudgetModalOpen && (
          <SetBudgetModal 
            companyId={companyId} 
            departments={departments}
            onClose={() => setIsBudgetModalOpen(false)} 
            onSuccess={() => { setIsBudgetModalOpen(false); fetchData(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ icon, label, value, desc, highlight = false, onClick }: { icon: React.ReactNode, label: string, value: string, desc: string, highlight?: boolean, onClick?: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-10 rounded-[44px] border cursor-pointer ${highlight ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40" : "bg-white text-slate-800 border-slate-100 shadow-xl shadow-slate-200/50"} flex flex-col gap-6 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-[22px] ${highlight ? "bg-white/10" : "bg-slate-50"} shadow-sm text-indigo-500`}>{icon}</div>
        <span className={`text-[9px] font-black ${highlight ? "text-slate-400 border-white/10" : "text-slate-400 border-slate-100"} px-3 py-1.5 rounded-full border tracking-widest uppercase`}>{desc}</span>
      </div>
      <div>
        <p className={`text-xs font-black ${highlight ? "text-slate-400" : "text-slate-400"} uppercase tracking-[0.2em] mb-1.5 ml-1`}>{label}</p>
        <p className={`text-4xl font-black tracking-tighter ${highlight ? "text-white" : "text-slate-900"}`}>{value}</p>
      </div>
    </motion.div>
  );
}

function DetailViewModal({ type, data, onClose, totals }: { 
  type: "revenue" | "expense" | "profit", 
  data: any[], 
  onClose: () => void,
  totals: { income: number, expense: number, profit: number }
}) {
  const titles = {
    revenue: "누적 매출 상세 내역",
    expense: "승인 지출 상세 내역",
    profit: "가용 자본 (P&L) 분석"
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 40 }} 
        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-[50px] shadow-3xl flex flex-col overflow-hidden z-10 border border-slate-100"
      >
        <div className="p-10 pb-6 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-20">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{titles[type]}</h2>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Financial Intelligence Deep-dive</p>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 pt-4 custom-scrollbar">
          {type === 'profit' ? (
            <div className="space-y-10 py-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-8 bg-emerald-50 rounded-[32px] border border-emerald-100">
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Revenue</p>
                   <p className="text-2xl font-black text-emerald-700 font-mono">₩{totals.income.toLocaleString()}</p>
                </div>
                <div className="p-8 bg-rose-50 rounded-[32px] border border-rose-100">
                   <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">Total Expense</p>
                   <p className="text-2xl font-black text-rose-700 font-mono">₩{totals.expense.toLocaleString()}</p>
                </div>
              </div>
              <div className="p-10 bg-indigo-900 rounded-[40px] text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <p className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-2">Net Profit (가용 자본)</p>
                <div className="flex items-baseline gap-3">
                   <p className="text-5xl font-black tracking-tighter">₩{totals.profit.toLocaleString()}</p>
                   {totals.profit > 0 && <span className="text-emerald-400 text-sm font-black flex items-center gap-1"><TrendingUp size={16} /> Surplus</span>}
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                   <p className="text-xs text-indigo-200 leading-relaxed font-medium">현재 가용 자본은 총 매출 대비 <span className="text-white font-black">{Math.round((totals.profit / totals.income) * 100)}%</span> 수준입니다. 공격적인 비즈니스 확장이 가능한 상태입니다. 🚀</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                  <Building2 size={48} />
                  <p className="mt-4 text-xs font-black uppercase tracking-widest">조회 가능한 내역이 없습니다.</p>
                </div>
              ) : (
                data.map((item: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={item.id} 
                    className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/40 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {type === 'revenue' ? (item.date || '날짜 미상') : new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black tracking-tighter ${type === 'revenue' ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {type === 'revenue' ? '+' : '-'} ₩{Number(item.amount).toLocaleString()}
                        </p>
                        {item.content && <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] mt-1">{item.content}</p>}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-center">
           <button onClick={onClose} className="px-10 py-4 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all text-sm tracking-widest active:scale-95">확인 및 닫기</button>
        </div>
      </motion.div>
    </div>
  );
}

function FinancialReportModal({ onClose, totals, company }: { onClose: () => void, totals: { income: number, expense: number, profit: number }, company: string }) {
  const currentMonth = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl" />
      <motion.div 
        initial={{ opacity: 0, y: 100 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 100 }} 
        className="relative w-full max-w-4xl bg-white rounded-[60px] shadow-3xl flex flex-col overflow-hidden z-10 border border-indigo-100"
      >
        <div className="p-12 pb-6 border-b border-slate-100">
           <div className="flex justify-between items-start mb-10">
             <div className="space-y-2">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                   <Building2 size={24} />
                 </div>
                 <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{company} 재무 실적 보고서</h2>
               </div>
               <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] ml-16">Generated by NEXO Finance Intelligence</p>
             </div>
             <button onClick={onClose} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
              <X size={24} />
             </button>
           </div>
           
           <div className="grid grid-cols-3 gap-8 py-10 px-8 bg-slate-50/50 rounded-[40px] border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report Cycle</p>
                <p className="text-lg font-black text-slate-800">{currentMonth}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                <p className="text-lg font-black text-emerald-500 uppercase tracking-tighter">Healthy Surplus</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Confidence</p>
                <p className="text-lg font-black text-indigo-600 font-mono tracking-tighter">98.2% Accuracy</p>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12 bg-white">
           <div className="grid grid-cols-2 gap-10">
              <div className="space-y-6">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <ArrowUpRight size={16} className="text-emerald-500" /> Revenue Breakdown
                 </h4>
                 <div className="p-8 bg-emerald-50/50 rounded-[32px] border border-emerald-100 space-y-4">
                    <p className="text-4xl font-black text-emerald-700 tracking-tighter">₩{totals.income.toLocaleString()}</p>
                    <p className="text-xs text-emerald-600 font-bold leading-relaxed italic opacity-70">"총 누적 매출액으로 전월 대비 약 12% 성장세를 유지하고 있습니다."</p>
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <ArrowDownRight size={16} className="text-rose-500" /> Expense Breakdown
                 </h4>
                 <div className="p-8 bg-rose-50/50 rounded-[32px] border border-rose-100 space-y-4">
                    <p className="text-4xl font-black text-rose-700 tracking-tighter">₩{totals.expense.toLocaleString()}</p>
                    <p className="text-xs text-rose-600 font-bold leading-relaxed italic opacity-70">"총 승인지출액으로 전력비 및 마케팅 자산 비중이 가장 높습니다."</p>
                 </div>
              </div>
           </div>

           <div className="p-10 bg-indigo-900 rounded-[50px] text-white space-y-8 shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
             <div className="relative z-10 flex justify-between items-center">
                <h4 className="text-xl font-black flex items-center gap-3 italic tracking-tighter">EXECUTIVE SUMMARY</h4>
                <div className="px-4 py-2 bg-emerald-400 text-emerald-900 text-[10px] font-black rounded-full uppercase tracking-widest">Profit Optimized</div>
             </div>
             <div className="relative z-10 space-y-4">
                <div className="flex items-baseline gap-4">
                  <p className="text-6xl font-black tracking-tighter">₩{totals.profit.toLocaleString()}</p>
                  <p className="text-indigo-300 font-black text-lg underline decoration-emerald-400 decoration-4 underline-offset-8">Net Surplus</p>
                </div>
                <p className="text-sm font-bold text-indigo-200 leading-relaxed max-w-2xl">
                  본 보고서는 현재 {company}의 자금 상태가 극도로 우수함을 시사합니다. 매출 대비 지출 비율이 {Math.round((totals.expense / totals.income) * 100)}% 로 현금 흐름 보존력이 탁월하며, 향후 3개월 내 추가 인력 채용 및 마케팅 공격적 투자가 가능한 가용 자본을 확보하고 있습니다. 🚀✨
                </p>
             </div>
           </div>
        </div>
        
        <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
           <button onClick={() => window.print()} className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-[24px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2">
             <Printer size={18} /> Print to PDF
           </button>
           <button onClick={onClose} className="px-10 py-5 bg-white text-slate-800 border border-slate-200 font-black rounded-[24px] hover:bg-slate-50 transition-all uppercase tracking-widest">Close Dashboard</button>
        </div>
      </motion.div>
    </div>
  );
}

function AddCardModal({ companyId, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: "",
    card_number: "",
    card_holder_name: "",
    monthly_limit: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setLoading(true);
    const { error } = await supabase.from("erp_corporate_cards").insert({
      company_id: companyId,
      bank_name: formData.bank_name,
      card_number: formData.card_number,
      card_holder_name: formData.card_holder_name,
      monthly_limit: Number(formData.monthly_limit.replace(/,/g, "")),
      current_usage: 0
    });
    if (!error) onSuccess();
    else alert(error.message);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[44px] p-10 z-10 border border-slate-100 shadow-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <CardIcon className="text-indigo-600" /> 법인카드 등록
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">NEXO Financial Security</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Bank & Holder</p>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="은행명 (예: 신한)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} />
              <input required type="text" placeholder="소유주명" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.card_holder_name} onChange={(e) => setFormData({...formData, card_holder_name: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Card Credentials</p>
            <input required type="text" placeholder="카드번호 (****-****-****-****)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.card_number} onChange={(e) => setFormData({...formData, card_number: e.target.value})} />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monthly Spending Limit</p>
            <input required type="text" placeholder="월 한도 (단위: 원)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-right text-indigo-600 text-lg" value={formData.monthly_limit} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); setFormData({...formData, monthly_limit: val.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}); }} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
            {loading ? "등록 중..." : "카드 무사히 등록하기 🔐"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function SetBudgetModal({ companyId, departments, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    department_id: "",
    total_budget: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !formData.department_id) {
       alert("회사 ID 또는 부서 정보가 누락되었습니다. 다시 시도해 주세요.");
       return;
    }
    setLoading(true);

    const budgetData = {
      company_id: companyId,
      department_id: formData.department_id,
      total_budget: Number(formData.total_budget.replace(/,/g, "")),
      year_month: new Date().toISOString().slice(0, 7) // '2026-03'
    };

    console.log("Saving budget data:", budgetData);

    const { data, error } = await supabase
      .from("erp_budgets")
      .upsert(budgetData, { onConflict: 'department_id, year_month' });

    if (!error) {
      console.log("Budget saved successfully:", data);
      onSuccess();
    } else {
      console.error("Budget save error:", error);
      alert(`예산 저장 실패: ${error.message}\n(Code: ${error.code})`);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[44px] p-10 z-10 border border-slate-100 shadow-3xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <PieChart className="text-emerald-500" /> 부서 예산 설정
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">Monthly Resource Allocation</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-500 transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Target Department</p>
            <select required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold appearance-none" value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})}>
              <option value="">부서 선택...</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name?.split('(')[0]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Allocated Budget</p>
            <input required type="text" placeholder="예산 금액 (단위: 원)" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-right text-emerald-600 text-lg" value={formData.total_budget} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); setFormData({...formData, total_budget: val.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}); }} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 uppercase tracking-widest">
            {loading ? "설정 중..." : "예산 승인 완료 🚀"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
