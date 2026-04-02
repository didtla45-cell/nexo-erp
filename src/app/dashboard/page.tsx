"use client";

import React from "react";
import { 
  BarChart3, 
  Users, 
  Wallet, 
  ArrowUpRight, 
  TrendingUp, 
  Calendar,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { generateBusinessInsight } from "@/lib/ai-insights";

export default function DashboardHome() {
  const [stats, setStats] = React.useState({
    totalExpenses: 0,
    employeeCount: 0,
    vacationersCount: 0,
    insight: "데이터를 분석 중입니다...",
    recentRequests: [] as any[]
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // 0. Fetch profile with role/dept
      const { data: profile } = await supabase
        .from("erp_profiles")
        .select("company_id, role, department_id")
        .eq("id", user.id)
        .single();
      
      if (!profile) return;
      const companyId = profile.company_id;
      const userRole = profile.role;
      const deptId = profile.department_id;
      const isAdmin = userRole === 'owner' || userRole === 'admin';

      // 1. 지출 데이터 (Requests) - 권한 필터 적용
      let expQuery = supabase
        .from("erp_requests")
        .select("id, amount, status, title, created_at, department_id")
        .eq("company_id", companyId);
      
      if (!isAdmin && deptId) {
        expQuery = expQuery.eq("department_id", deptId);
      }

      const { data: expenses } = await expQuery;
      
      const totalExp = expenses
        ?.filter(e => e.status === 'approved')
        .reduce((sum, e) => sum + e.amount, 0) || 0;

      // 2. 수입 데이터 (Revenue Vouchers) - 권한 필터 적용
      let revQuery = supabase
        .from("erp_revenue_vouchers")
        .select("total_amount, department_id")
        .eq("company_id", companyId);
      
      if (!isAdmin && deptId) {
        revQuery = revQuery.eq("department_id", deptId);
      }

      const { data: revVouchers } = await revQuery;

      const { data: income } = await supabase
        .from("erp_income")
        .select("amount")
        .eq("company_id", companyId);

      const combinedIncome = [
        ...(income || []),
        ...(revVouchers || []).map(r => ({ amount: r.total_amount }))
      ];

      // 3. 인력 데이터 - 인사는 전체 데이터 유지 (혹은 부서별 필터링 가능)
      const { count: empCount } = await supabase
        .from("erp_profiles")
        .select("*", { count: 'exact', head: true })
        .eq("company_id", companyId);

      const today = new Date().toISOString().split('T')[0];
      const { count: vacCount } = await supabase
        .from("erp_leave_requests")
        .select("*", { count: 'exact', head: true })
        .eq("company_id", companyId)
        .eq("status", "approved")
        .lte("start_date", today)
        .gte("end_date", today);

      // 4. 재고 데이터 (부족 품목 체크)
      const { data: invItems } = await supabase
        .from("erp_inventory_items")
        .select("name, current_stock, min_stock_level")
        .eq("company_id", companyId);
      
      const lowStockItems = (invItems || []).filter(item => item.current_stock < (item.min_stock_level || 10));

      // 5. 영업 데이터 (활성 딜 체크)
      const { data: activeDeals } = await supabase
        .from("erp_sales_deals")
        .select("id")
        .eq("company_id", companyId)
        .not("stage", "in", '("Won", "Lost")');

      // 6. AI 인사이트 생성 (통합 데이터)
      const insight = generateBusinessInsight({
        expenses: expenses || [],
        income: combinedIncome,
        employees: empCount || 0,
        lowStockItems: lowStockItems,
        activeDealsCount: activeDeals?.length || 0
      });

      setStats({
        totalExpenses: totalExp,
        employeeCount: empCount || 0,
        vacationersCount: vacCount || 0,
        insight: insight,
        recentRequests: (expenses || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3)
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <section key="section-welcome" className="relative overflow-hidden bg-slate-900 rounded-[48px] p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
              <Zap size={12} className="text-indigo-400" />
              NEXO Intelligence Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Representative</span>
            </h1>
            <p className="text-slate-400 font-medium text-lg mb-8 leading-relaxed">
              NEXO ERP를 통해 기업의 모든 자원과 인사 정보를 한눈에 관리하세요. 
              오늘도 대표님의 비즈니스는 스마트하게 성장하고 있습니다.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link key="link-accounting" href="/dashboard/accounting" className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10">
                지출 결재 관리
              </Link>
              <Link key="link-hr" href="/dashboard/hr" className="px-8 py-4 bg-white/10 text-white border border-white/20 font-black rounded-2xl text-sm backdrop-blur-md transition-all hover:bg-white/20">
                인사/연차 관리
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative">
             <div className="w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
             <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shadow-2xl">
                <div className="space-y-4">
                  <div key="loader-row-1" className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                    <div className="h-2 w-32 bg-white/20 rounded-full" />
                  </div>
                  <div key="loader-row-2" className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full" />
                    <div className="h-2 w-24 bg-white/20 rounded-full" />
                  </div>
                  <div key="loader-row-3" className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                    <div className="h-2 w-40 bg-white/20 rounded-full" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div key="section-stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard 
          icon={<Wallet className="text-indigo-600" />} 
          title="이번 달 지출" 
          value={`₩${stats.totalExpenses.toLocaleString()}`} 
          trend={loading ? "계산 중..." : "Real-time sync"}
          color="indigo"
        />
        <SummaryCard 
          icon={<Users className="text-emerald-600" />} 
          title="재직 임직원" 
          value={`${stats.employeeCount} 명`} 
          trend="Organization status"
          color="emerald"
        />
        <SummaryCard 
          icon={<Wallet className="text-blue-600" />} 
          title="오늘의 휴가자" 
          value={`${stats.vacationersCount} 명`} 
          trend="Approved leaves only"
          color="blue"
        />
      </div>

      {/* Recent Activity / Insights */}
      <div key="section-recent-activity" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-800">최근 지출 내역</h3>
              <ArrowUpRight className="text-slate-300" size={20} />
           </div>
           <div className="space-y-6">
              {stats.recentRequests.length > 0 ? stats.recentRequests.map((req: any, index: number) => (
                <div key={`dhome-req-${req.id || index}`} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-3xl transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      <BarChart3 size={20} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm truncate max-w-[150px]">{req.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-600 text-sm">₩{req.amount.toLocaleString()}</p>
                </div>
              )) : (
                <div key="empty-requests" className="py-10 text-center text-slate-300 font-black uppercase tracking-widest">내역 없음</div>
              )}
           </div>
        </div>

        <div className="bg-white p-10 rounded-[44px] border border-slate-100 shadow-2xl shadow-indigo-100/40 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-100 shadow-lg">
                    <img src="/persona/jimin.png" alt="Jimin" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">지민이의 AI 브리핑</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-indigo-100">Intelligence Engine</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Now</span>
                  </div>
                </div>
              </div>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <TrendingUp size={24} />
              </motion.div>
            </div>

            <div className="flex-1">
              <div className="p-8 bg-slate-50/50 backdrop-blur-sm rounded-[32px] border border-slate-100 relative group-hover:bg-white transition-all duration-500">
                <div className="absolute top-4 right-4 opacity-10">
                  <Zap size={40} className="text-indigo-600" />
                </div>
                <p className="text-slate-700 font-bold leading-relaxed whitespace-pre-wrap text-sm italic">
                  {stats.insight}
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={`avatar-dot-${i}`} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-400`}>
                    {i === 1 ? 'FIN' : i === 2 ? 'INV' : 'SAL'}
                  </div>
                ))}
              </div>
              <button className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                상세 분석 레포트 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, trend, color }: { icon: React.ReactNode, title: string, value: string, trend: string, color: string }) {
  const colorMap: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  };

  const trendWords = (trend || "").split(' ');
  const firstWord = trendWords[0];
  const restWords = trendWords.slice(1).join(' ');

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40"
    >
      <div className={`w-14 h-14 rounded-3xl flex items-center justify-center mb-6 ${colorMap[color] || colorMap.indigo}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-4">{value}</h4>
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
        <span key="trend-status" className={color === 'indigo' ? 'text-indigo-500' : color === 'emerald' ? 'text-emerald-500' : 'text-blue-500'}>
          {firstWord}
        </span>
        <span key="trend-desc">{restWords}</span>
      </div>
    </motion.div>
  );
}
