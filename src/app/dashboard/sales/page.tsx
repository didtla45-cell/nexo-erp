"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  Target, 
  Briefcase, 
  Calendar, 
  Search, 
  ChevronRight,
  Filter,
  UserPlus,
  CreditCard,
  LogOut,
  DollarSign,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  company_name: string;
  status: string;
};

type Deal = {
  id: string;
  title: string;
  amount: number;
  stage: string;
  expected_closing_date: string;
  customer: { name: string };
};

export default function SalesPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddQuotation, setShowAddQuotation] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const fetchData = async () => {
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
      const { data: dealsData } = await supabase
        .from("erp_sales_deals")
        .select("*, customer:erp_customers(name)")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });
      
      if (dealsData) setDeals(dealsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPipeline = deals.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const activeDeals = deals.filter(d => !["Closed Won", "Closed Lost"].includes(d.stage)).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-white/50 px-6 py-3 rounded-3xl w-fit shadow-sm">
          <div className="p-2 bg-emerald-600 rounded-xl text-white"><TrendingUp size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Management</p>
            <p className="text-xs font-black text-slate-700 tracking-tight">매출 및 영업 기회 통합 관리</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowAddCustomer(true)} className="px-6 py-3.5 bg-white text-slate-600 border border-slate-100 text-sm font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center gap-2">
            <UserPlus size={18} /> 고객 등록
          </button>
          <button onClick={() => setShowAddDeal(true)} className="px-8 py-3.5 bg-emerald-600 text-white text-sm font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2">
            <Plus size={20} /> 신규 딜 생성
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="전체 파이프라인" value={`₩${(totalPipeline / 1000000).toFixed(1)}M`} icon={<DollarSign className="text-emerald-500" />} sub="진행 중인 전체 거래 규모" />
        <StatCard label="활성 딜 (Active Deals)" value={activeDeals.toString()} icon={<Activity className="text-blue-500" />} sub="현재 협상 중인 건수" />
        <StatCard label="성공 확률 (Win Rate)" value="68%" icon={<Target className="text-indigo-500" />} sub="최근 3개월 평균" highlight />
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div key="pipeline-header" className="flex items-center justify-between px-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={16} className="text-emerald-500" /> 세일즈 파이프라인
            </h3>
            <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">전체보기</button>
          </div>
          
          <div key="pipeline-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {loading ? (
                <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-widest">영업 데이터를 불러오는 중...</div>
             ) : deals.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300 font-black uppercase tracking-widest">
                   진행 중인 딜이 없습니다.
                </div>
             ) : (
                deals.map(deal => (
                  <DealCard key={deal.id} deal={deal} onAddQuotation={(d) => { setSelectedDeal(d); setShowAddQuotation(true); }} />
                ))
             )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="p-8 bg-white rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">최근 주요 고객</h4>
                <ChevronRight size={16} className="text-slate-300" />
             </div>
             <div className="space-y-4">
                <MiniProfile key="customer-samsung" name="삼성전자" company="반도체 사업부" status="Active" color="bg-blue-500" />
                <MiniProfile key="customer-hyundai" name="현대자동차" company="자율주행팀" status="Lead" color="bg-amber-500" />
                <MiniProfile key="customer-naver" name="네이버" company="클라우드" status="Active" color="bg-emerald-500" />
             </div>
           </div>

           <div className="p-8 bg-indigo-900 rounded-[44px] text-white shadow-xl shadow-indigo-900/40 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform"><Target size={120} /></div>
             <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] mb-4">Goal Tracker</p>
             <h4 className="text-2xl font-black tracking-tighter mb-2">분기 목표 달성</h4>
             <p className="text-sm font-bold opacity-80 mb-6">목표 ₩2.0B / 현재 ₩1.3B</p>
             <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="w-[65%] h-full bg-white rounded-full"></div>
             </div>
             <p className="text-[10px] font-black text-right opacity-60">65% COMPLETED</p>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddCustomer && (
          <AddCustomerModal 
            companyId={companyId!} 
            onClose={() => setShowAddCustomer(false)} 
            onSuccess={() => { setShowAddCustomer(false); fetchData(); }} 
          />
        )}
        {showAddDeal && (
          <AddDealModal 
            companyId={companyId!} 
            onClose={() => setShowAddDeal(false)} 
            onSuccess={() => { setShowAddDeal(false); fetchData(); }} 
          />
        )}
        {showAddQuotation && selectedDeal && (
          <AddQuotationModal 
            companyId={companyId!} 
            deal={selectedDeal} 
            onClose={() => setShowAddQuotation(false)} 
            onSuccess={() => { setShowAddQuotation(false); fetchData(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, sub, highlight }: { label: string, value: string, icon: React.ReactNode, sub?: string, highlight?: boolean }) {
  return (
    <div className={`p-8 rounded-[44px] border shadow-xl shadow-slate-200/40 flex flex-col gap-4 bg-white border-slate-100 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div className="p-4 bg-slate-50 rounded-3xl">{icon}</div>
        <div className={highlight ? 'px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-full' : 'px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-full'}>TRENDING</div>
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-4xl font-black tracking-tighter text-slate-800">{value}</p>
        {sub && <p className="text-[10px] font-bold mt-1 text-slate-300 uppercase tracking-widest">{sub}</p>}
      </div>
    </div>
  );
}

function DealCard({ deal, onAddQuotation }: { deal: Deal, onAddQuotation: (deal: Deal) => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-lg shadow-slate-200/20 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-xl transition-colors">
          <Briefcase size={20} />
        </div>
        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[8px] font-black rounded-full uppercase tracking-widest">
          {deal.stage}
        </span>
      </div>
      <h4 className="font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{deal.title}</h4>
      <p className="text-xs font-bold text-slate-400 mb-6">{deal.customer?.name || "Unknown Customer"}</p>
      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <p className="text-lg font-black text-slate-800 tracking-tighter">₩{Number(deal.amount).toLocaleString()}</p>
        <button 
          onClick={(e) => { e.stopPropagation(); onAddQuotation(deal); }}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest"
        >
          견적서 생성
        </button>
      </div>
    </motion.div>
  );
}

function AddQuotationModal({ companyId, deal, onClose, onSuccess }: { companyId: string, deal: Deal, onClose: () => void, onSuccess: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("erp_inventory_items").select("*").eq("company_id", companyId).then(({ data }) => {
      if (data) setItems(data);
      setLoading(false);
    });
  }, []);

  const addItem = (item: any) => {
    if (selectedItems.find(si => si.id === item.id)) return;
    setSelectedItems([...selectedItems, { ...item, quantity: 1, subtotal: item.unit_price }]);
  };

  const updateQty = (id: string, qty: number) => {
    setSelectedItems(selectedItems.map(si => si.id === id ? { ...si, quantity: qty, subtotal: si.unit_price * qty } : si));
  };

  const removeItem = (id: string) => {
    setSelectedItems(selectedItems.filter(si => si.id !== id));
  };

  const total = selectedItems.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert("품목을 추가해 주세요.");
    
    for (const si of selectedItems) {
      const currentItem = items.find(i => i.id === si.id);
      if (!currentItem || currentItem.current_stock < si.quantity) {
        return alert(`재고가 부족하여 견적서를 발행할 수 없습니다.\n품목: ${si.name}\n현재고: ${currentItem?.current_stock || 0}\n필요량: ${si.quantity}`);
      }
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const qNum = `QT-${Date.now().toString().slice(-6)}`;
    
    const { data: qData, error: qError } = await supabase.from("erp_sales_quotations").insert([{
      company_id: companyId,
      deal_id: deal.id,
      customer_id: (deal as any).customer_id || null,
      quotation_number: qNum,
      total_amount: total,
      status: 'Sent',
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }]).select();

    if (qData) {
      const qId = qData[0].id;

      const itemsToInsert = selectedItems.map(si => ({
        quotation_id: qId,
        item_id: si.id,
        quantity: si.quantity,
        unit_price: si.unit_price,
        subtotal: si.subtotal
      }));
      await supabase.from("erp_sales_quotation_items").insert(itemsToInsert);

      for (const si of selectedItems) {
        const currentItem = items.find(i => i.id === si.id);
        const newStock = (currentItem?.current_stock || 0) - si.quantity;

        await supabase.from("erp_inventory_items")
          .update({ current_stock: newStock })
          .eq("id", si.id);

        await supabase.from("erp_inventory_transactions").insert([{
          company_id: companyId,
          item_id: si.id,
          user_id: user?.id,
          type: 'out',
          quantity: si.quantity,
          reason: `견적서 발행 자동 차감 (${qNum})`
        }]);
      }

      const netAmount = total;
      const vatAmount = Math.floor(netAmount * 0.1);
      const totalAmount = netAmount + vatAmount;

      await supabase.from("erp_revenue_vouchers").insert([{
        company_id: companyId,
        quotation_id: qId,
        customer_id: (deal as any).customer_id || null,
        voucher_number: `REV-${Date.now().toString().slice(-6)}`,
        net_amount: netAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        description: `[영업] ${deal.title} 견적 발행 매출 연동`
      }]);

      await supabase.from("erp_notifications").insert([{
        company_id: companyId,
        title: "🚀 견적-재고-매출 연동 성공",
        message: `${deal.title} 견적 발행으로 재고가 실시간 차감되고 매출 전표가 생성되었습니다.`,
        type: "success",
        target_role: "owner"
      }]);

      onSuccess();
    } else {
      alert(qError?.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[44px] shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">프리미엄 견적서 생성 (Premium)</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{deal.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><Plus className="rotate-45" size={24} /></button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 print:block print:overflow-visible">
          {/* Inventory Side */}
          <div className="p-8 border-r border-slate-100 overflow-y-auto bg-slate-20/30 print:hidden">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">재고 품목 선택</h4>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-indigo-200 transition-all">
                  <div>
                    <p className="text-sm font-black text-slate-700">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">₩{item.unit_price.toLocaleString()} | <span className={item.current_stock < 10 ? 'text-rose-500' : 'text-emerald-500'}>재고: {item.current_stock}</span></p>
                  </div>
                  <button onClick={() => addItem(item)} className="p-1.5 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-all"><Plus size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Preview Side */}
          <div className="p-8 overflow-y-auto flex flex-col quotation-print-container bg-white">
            <div className="flex-1 space-y-10 group/quote">
              <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8">
                <div className="space-y-3">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">QUOTATION</h1>
                  <div className="flex items-center gap-2">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Premium Sales System</p>
                  </div>
                </div>
                
                <div className="w-[380px] border-2 border-slate-800 rounded-3xl p-5 bg-slate-50/50 relative shadow-sm">
                  <div className="absolute -top-3.5 left-5 bg-slate-800 text-white px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-widest">Supplier (공급자)</div>
                  <div className="grid grid-cols-6 gap-x-3 gap-y-2">
                    <div className="col-span-1 text-[9px] font-black text-slate-400 uppercase">Reg No</div>
                    <div className="col-span-5 text-sm font-black text-slate-900">123-45-67890</div>
                    <div className="col-span-1 text-[9px] font-black text-slate-400 uppercase">Owner</div>
                    <div className="col-span-2 text-xs font-black text-slate-800">이 건 노 (인)</div>
                    <div className="col-span-3 text-[9px] font-bold text-slate-400 text-right uppercase">지민컴퍼니</div>
                    <div className="col-span-1 text-[9px] font-black text-slate-400 uppercase align-top">Addr</div>
                    <div className="col-span-5 text-[10px] font-bold text-slate-500 leading-tight">서울특별시 강남구 테헤란로 2026, 10F</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                <div>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">To. Client</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tighter underline underline-offset-4 decoration-slate-200">{deal.customer?.name || "귀중"}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Quote Date</p>
                  <p className="text-sm font-black text-slate-600">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="min-h-[200px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-[10px] font-black text-white uppercase tracking-widest text-center">
                      <td className="py-3 px-2 rounded-l-xl w-12 border-r border-white/10">No</td>
                      <td className="py-3 px-4 text-left">Item (품목)</td>
                      <td className="py-3 px-2 w-20">Qty</td>
                      <td className="py-3 px-4 text-right rounded-r-xl">Amount (Net)</td>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">품목을 추가해 주세요</td>
                      </tr>
                    )}
                    {selectedItems.map((si, idx) => (
                      <tr key={si.id} className="group/row">
                        <td className="py-4 text-center font-bold text-slate-300 text-xs">{idx + 1}</td>
                        <td className="py-4 px-4">
                          <p className="font-black text-slate-800 text-sm">{si.name}</p>
                        </td>
                        <td className="py-4 px-2 text-center">
                           <div className="flex items-center justify-center gap-1 group/qty">
                              <input type="number" min="1" className="w-12 p-1 bg-slate-50 rounded-lg text-center font-black text-xs outline-none print:hidden" value={si.quantity} onChange={e => updateQty(si.id, Number(e.target.value))} />
                              <span className="hidden print:inline font-black text-slate-800 text-xs">{si.quantity} EA</span>
                              <button onClick={() => removeItem(si.id)} className="text-rose-300 hover:text-rose-500 p-0.5 print:hidden"><Plus className="rotate-45" size={14} /></button>
                           </div>
                        </td>
                        <td className="py-4 px-4 text-right font-black text-slate-700 text-sm">₩{(si.unit_price * si.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-900">
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Total</td>
                      <td className="py-4 px-4 text-right font-black text-slate-800">₩{total.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-2 px-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">VAT 10%</td>
                      <td className="py-2 px-4 text-right font-bold text-slate-400">₩{Math.floor(total * 0.1).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100">
                 <div className="col-span-2 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard size={14} className="text-indigo-400" />
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">입금 안내</h4>
                    </div>
                    <p className="text-sm font-black text-slate-700 italic">우리은행 1002-2026-NEXO-01 (지민컴퍼니)</p>
                 </div>
                 <div className="flex flex-col items-center justify-center relative">
                    <div className="absolute w-16 h-16 bg-rose-500/5 rounded-full border-2 border-rose-500/20 rotate-[-15deg] flex items-center justify-center">
                       <p className="text-[9px] font-black text-rose-500 leading-none">이 건 노<br />(인)</p>
                    </div>
                 </div>
              </div>

              <div className="mt-10 pt-8 border-t-4 border-slate-900">
                <div className="flex justify-between items-end mb-8 px-2">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Grand Total</p>
                  <p className="text-5xl font-black text-indigo-600 tracking-tighter">₩{(total * 1.1).toLocaleString()}</p>
                </div>
                <div className="flex gap-3 print:hidden">
                  <button onClick={() => window.print()} className="flex-1 py-5 bg-white border-2 border-slate-100 text-slate-600 font-black rounded-3xl uppercase tracking-widest text-xs">PDF 인쇄</button>
                  <button onClick={handleSubmit} disabled={submitting} className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-[28px] uppercase tracking-widest text-xs">
                    {submitting ? '생성 중...' : '최종 발행'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <style jsx global>{`
        @media print {
          body, html { background: white !important; }
          #sidebar, nav, header, .print-hidden, button, .print\:hidden { display: none !important; }
          .quotation-print-container {
            position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important;
            padding: 40px !important; visibility: visible !important; display: block !important;
            z-index: 9999 !important; background: white !important;
          }
          .fixed.inset-0 { background: transparent !important; position: static !important; }
          #__next > div, main { display: block !important; }
        }
      `}</style>
    </div>
  );
}

function AddCustomerModal({ companyId, onClose, onSuccess }: { companyId: string, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", company_name: "", business_registration_number: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("erp_customers").insert([{ ...formData, company_id: companyId }]);
    if (!error) onSuccess(); else alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[44px] p-12 shadow-2xl relative">
        <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight text-center">신규 고객 등록</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">담당자 이름</label>
          <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">회사명</label>
          <input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">사업자등록번호</label>
          <input placeholder="000-00-00000" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.business_registration_number} onChange={e => setFormData({...formData, business_registration_number: e.target.value})} /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">연락처</label>
          <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">이메일</label>
          <input type="email" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest">취소</button>
            <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20">
              {submitting ? "등록 중..." : "고객 등록 완료"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function AddDealModal({ companyId, onClose, onSuccess }: { companyId: string, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ title: "", amount: "", customer_id: "", stage: "Prospecting" });
  const [customers, setCustomers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("erp_customers").select("id, name, company_name").eq("company_id", companyId).then(({ data }) => {
      if (data) setCustomers(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("erp_sales_deals").insert([{
      ...formData,
      amount: Number(formData.amount),
      company_id: companyId,
      expected_closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    }]);
    if (!error) onSuccess(); else alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[44px] p-12 shadow-2xl relative">
        <h3 className="text-2xl font-black text-slate-800 mb-8 tracking-tight text-center">새로운 영업 딜 생성</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">딜 제목</label>
          <input required placeholder="예: 서버 인프라 구축 건" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
          
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">거래 금액 (₩)</label>
            <input type="number" required placeholder="0" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} /></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">영업 단계</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
              <option>Prospecting</option>
              <option>Proposal</option>
              <option>Negotiation</option>
              <option>Closed Won</option>
              <option>Closed Lost</option>
            </select></div>
          </div>

          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">관리 고객사</label>
          <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-none" value={formData.customer_id} onChange={e => setFormData({...formData, customer_id: e.target.value})}>
            <option value="">고객을 선택하세요</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.company_name} ({c.name})</option>
            ))}
          </select></div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest">취소</button>
            <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20">
              {submitting ? "생성 중..." : "영업 딜 생성 완료"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function MiniProfile({ name, company, status, color }: { name: string, company: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center text-white font-black text-sm`}>
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-black text-slate-700 tracking-tight">{name}</p>
          <p className="text-[10px] font-bold text-slate-400">{company}</p>
        </div>
      </div>
      <div className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase ${status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
        {status}
      </div>
    </div>
  );
}
