"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  XSquare,
  FileText,
  DollarSign,
  X,
  Check,
  Ban,
  Calendar,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wallet,
  Trash2,
  XCircle,
  Edit3,
  Building2,
  ShieldCheck,
  UserCheck,
  CreditCard,
  PieChart,
  Upload,
  Image as ImageIcon,
  Paperclip,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type ERPRequest = {
  id: string;
  user_id: string;
  company_id: string;
  type: string;
  title: string;
  content: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  profiles?: {
    full_name: string;
    erp_departments?: {
      name: string;
    }
  }
};

type ERPIncome = {
  id: string;
  user_id: string;
  company_id: string;
  type: string;
  title: string;
  content: string;
  amount: number;
  date: string;
  created_at: string;
};

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [requests, setRequests] = useState<ERPRequest[]>([]);
  const [incomeList, setIncomeList] = useState<ERPIncome[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: "expense" | "income", data: any } | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ERPRequest | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<ERPIncome | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("staff");

  const initializeUserContext = async () => {
    let { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { data: anon } = await supabase.auth.signInAnonymously();
      user = anon.user;
    }

    if (user) {
      const { data: profile } = await supabase
        .from("erp_profiles")
        .select("company_id, role")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCompanyId(profile.company_id);
        setUserRole(profile.role || "staff");
        return { companyId: profile.company_id, role: profile.role || "staff" };
      } else {
        const { data: companies } = await supabase.from("erp_companies").select("id").eq("name", "지민컴퍼니");
        const company = companies?.[0];
        if (company) {
          const role = "admin";
          await supabase.from("erp_profiles").upsert({
            id: user.id,
            company_id: company.id,
            full_name: "지민컴퍼니 대표님",
            role: role
          });
          setCompanyId(company.id);
          setUserRole(role);
          return { companyId: company.id, role: role };
        }
      }
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    const context = await initializeUserContext();
    if (context?.companyId) {
      const { data: reqData } = await supabase
        .from("erp_requests")
        .select("*, profiles:erp_profiles(full_name, erp_departments(name))")
        .eq("company_id", context.companyId)
        .order("created_at", { ascending: false });
      const { data: incData } = await supabase.from("erp_income").select("*").eq("company_id", context.companyId).order("date", { ascending: false });
      if (reqData) setRequests(reqData);
      if (incData) setIncomeList(incData);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    if (userRole !== "admin" && userRole !== "owner") {
      alert("결재 권한이 없습니다.");
      return;
    }
    const { error } = await supabase.from("erp_requests").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      if (selectedRequest?.id === id) setSelectedRequest(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDelete = async (id: string, type: "expense" | "income") => {
    if (!confirm("삭제하시겠습니까?")) return;
    const table = type === "expense" ? "erp_requests" : "erp_income";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) {
      if (type === "expense") setRequests(prev => prev.filter(r => r.id !== id));
      else setIncomeList(prev => prev.filter(i => i.id !== id));
      setSelectedRequest(null);
      setSelectedIncome(null);
    }
  };

  const totalExpense = requests.filter(r => r.status === "approved").reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalIncome = incomeList.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const netProfit = totalIncome - totalExpense;
  const isAdmin = userRole === "admin" || userRole === "owner";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-wrap items-center gap-4">
        {companyId && (
          <div className="flex items-center gap-3 bg-white/40 border border-white/50 px-6 py-3 rounded-3xl shadow-sm">
            <div className="p-2 bg-blue-600 rounded-xl text-white"><Building2 size={18} /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise</p>
              <p className="text-xs font-black text-slate-700 tracking-tight">지민컴퍼니</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 bg-white/40 border border-white/50 px-6 py-3 rounded-3xl shadow-sm">
          <div className={`p-2 ${isAdmin ? "bg-emerald-500" : "bg-slate-400"} rounded-xl text-white`}>{isAdmin ? <ShieldCheck size={18} /> : <UserCheck size={18} />}</div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</p>
            <p className={`text-xs font-black ${isAdmin ? "text-emerald-600" : "text-slate-600"} tracking-tight italic`}>{userRole.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard icon={<TrendingUp size={24} className="text-emerald-500" />} label="총 수입" value={`₩${totalIncome.toLocaleString()}`} color="emerald" trend="매출 실적" />
        <StatusCard icon={<TrendingDown size={24} className="text-rose-500" />} label="총 지출" value={`₩${totalExpense.toLocaleString()}`} color="rose" trend="승인 완료" />
        <StatusCard icon={<Wallet size={24} className={netProfit >= 0 ? "text-blue-500" : "text-rose-600"} />} label="순이익" value={`₩${netProfit.toLocaleString()}`} color={netProfit >= 0 ? "blue" : "rose"} trend="수입-지출" highlight={true} />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden">
        <div className="p-8 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            <div className="flex bg-slate-100 p-1.5 rounded-[22px] w-fit shadow-inner">
              <button onClick={() => setActiveTab("expense")} className={`px-8 py-3 rounded-[18px] text-sm font-black transition-all ${activeTab === "expense" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>지출 결재 관리</button>
              <button onClick={() => setActiveTab("income")} className={`px-8 py-3 rounded-[18px] text-sm font-black transition-all ${activeTab === "income" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>수입 내역 관리</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchData()} className="p-3.5 text-slate-500 hover:bg-slate-50 rounded-2xl border border-slate-100"><RefreshCw size={20} /></button>
              <button onClick={() => setIsModalOpen(true)} className="px-8 py-3.5 bg-slate-900 text-white text-sm font-black rounded-[22px] flex items-center gap-2"><Plus size={20} /> {activeTab === "expense" ? "새 결재 요청" : "새 수입 등록"}</button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder={activeTab === "expense" ? "검색..." : "검색..."} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm outline-none font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl"><Filter size={14} /> 필터 활성화</div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-32 gap-6">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-black uppercase tracking-widest">데이터 분석 중...</p>
            </div>
          ) : activeTab === "expense" ? (
            <>
              <AnimatePresence>
                {selectedIds.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="sticky top-0 z-10 mx-8 mt-2 p-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">{selectedIds.length}</div>
                      <p className="text-sm font-black">일괄 결재를 진행하시겠습니까?</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setSelectedIds([])} className="px-4 py-2 text-xs font-black text-slate-400 hover:text-white transition-all">취소</button>
                      <button onClick={async () => { if (confirm(`${selectedIds.length}건 승인하시겠습니까?`)) { for (const id of selectedIds) await handleUpdateStatus(id, "approved"); setSelectedIds([]); } }} className="px-6 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all">일괄 승인</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <ExpenseTable 
                data={requests.filter(r => r.title.includes(searchTerm))} 
                selectedIds={selectedIds}
                onToggleSelect={(id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                onSelectAll={(allIds: string[]) => setSelectedIds(prev => prev.length === allIds.length ? [] : allIds)}
                onSelect={setSelectedRequest} onUpdate={handleUpdateStatus} onDelete={(id: string) => handleDelete(id, "expense")} onEdit={(r: any) => setEditingItem({ type: "expense", data: r })} isAdmin={isAdmin}
              />
            </>
          ) : (
            <IncomeTable data={incomeList.filter(i => i.title.includes(searchTerm))} onSelect={setSelectedIncome} onDelete={(id: string) => handleDelete(id, "income")} onEdit={(i: any) => setEditingItem({ type: "income", data: i })} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {(isModalOpen || editingItem) && (
          <DataEntryModal type={activeTab} editData={editingItem?.data} companyId={companyId} onClose={() => { setIsModalOpen(false); setEditingItem(null); }} onSuccess={() => { setIsModalOpen(false); setEditingItem(null); fetchData(); }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRequest && (
          <DetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onUpdateStatus={handleUpdateStatus} onDelete={(id: string) => handleDelete(id, "expense")} onEdit={(r: any) => { setSelectedRequest(null); setEditingItem({ type: "expense", data: r }); }} isAdmin={isAdmin} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIncome && (
          <IncomeDetailModal income={selectedIncome} onClose={() => setSelectedIncome(null)} onDelete={(id: string) => handleDelete(id, "income")} onEdit={(i: any) => { setSelectedIncome(null); setEditingItem({ type: "income", data: i }); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ExpenseTable({ data, selectedIds, onToggleSelect, onSelectAll, onSelect, onUpdate, onDelete, onEdit, isAdmin }: any) {
  if (data.length === 0) return <EmptyState label="내역이 없습니다." />;
  const pendingIds = data.filter((r: any) => r.status === "pending").map((r: any) => r.id);
  return (
    <table className="w-full text-left border-collapse table-auto">
      <thead>
        <tr className="bg-slate-50/50">
          <th className="px-8 py-5 w-10">
            {isAdmin && <input type="checkbox" checked={pendingIds.length > 0 && pendingIds.every((id: string) => selectedIds.includes(id))} onChange={() => onSelectAll(pendingIds)} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />}
          </th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">문서 정보</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">기안부서 / 기안자</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">분류</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">청구 금액</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">상태</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">관리</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((request: any) => (
          <tr key={request.id} className={`hover:bg-slate-50/50 transition-all ${selectedIds.includes(request.id) ? "bg-indigo-50/30" : ""}`}>
            <td className="px-8 py-6">{isAdmin && request.status === "pending" && <input type="checkbox" checked={selectedIds.includes(request.id)} onChange={() => onToggleSelect(request.id)} className="w-4 h-4 rounded border-slate-300 text-indigo-600" />}</td>
            <td className="px-8 py-6"><span onClick={() => onSelect(request)} className="font-black text-slate-800 text-sm hover:text-blue-600 transition-all cursor-pointer">{request.title}</span></td>
            <td className="px-8 py-6">
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-700 tracking-tight">{request.profiles?.full_name || "익명"}</span>
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">
                  {request.profiles?.erp_departments?.name?.split('(')[0] || "미소속"}
                </span>
              </div>
            </td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-xl whitespace-nowrap">지출 결의</span>
                {request.receipt_url && <Paperclip size={14} className="text-indigo-400" />}
              </div>
            </td>
            <td className="px-8 py-6 font-black text-slate-700 text-sm whitespace-nowrap">₩{Number(request.amount).toLocaleString()}</td>
            <td className="px-8 py-6"><StatusBadge status={request.status} /></td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2">
                {isAdmin && request.status === "pending" && (
                  <><button onClick={() => onUpdate(request.id, "approved")} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Check size={18} /></button>
                  <button onClick={() => onUpdate(request.id, "rejected")} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Ban size={18} /></button></>
                )}
                {request.status !== "approved" && <button onClick={() => onEdit(request)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button>}
                <button onClick={() => onDelete(request.id)} className="p-2.5 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IncomeTable({ data, onSelect, onDelete, onEdit }: any) {
  if (data.length === 0) return <EmptyState label="내역이 없습니다." />;
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50/50">
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">수입 항목</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">입금 금액</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">발생일</th>
          <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">관리</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((income: any) => (
          <tr key={income.id} className="hover:bg-slate-50/50 transition-all">
            <td className="px-8 py-6"><span onClick={() => onSelect(income)} className="font-black text-slate-800 text-sm hover:text-emerald-600 transition-all cursor-pointer">{income.title}</span></td>
            <td className="px-8 py-6 font-black text-emerald-600 text-sm">+ ₩{Number(income.amount).toLocaleString()}</td>
            <td className="px-8 py-6 text-slate-400 text-xs font-bold">{new Date(income.date).toLocaleDateString()}</td>
            <td className="px-8 py-6">
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(income)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button>
                <button onClick={() => onDelete(income.id)} className="p-2.5 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DataEntryModal({ type, editData, companyId, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: editData?.title || "", category: editData?.type || (type === "expense" ? "expense" : "sales"), amount: editData?.amount ? Number(editData.amount).toLocaleString() : "", content: editData?.content || "" });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    let { data: { user } } = await supabase.auth.getUser();
    if (!user) { const { data: anon } = await supabase.auth.signInAnonymously(); user = anon.user; }
    
    if (user && companyId) {
      let receiptUrl = editData?.receipt_url || null;

      // Handle File Upload
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${companyId}/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('receipts')
          .upload(filePath, file);
          
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath);
          receiptUrl = publicUrl;
        }
      }

      const table = type === "expense" ? "erp_requests" : "erp_income";
      const payload = type === "expense" ? { 
        user_id: user.id, 
        company_id: companyId, 
        title: formData.title, 
        type: formData.category, 
        amount: Number(formData.amount.replace(/,/g, "")), 
        content: formData.content, 
        status: editData ? (editData.status === "rejected" ? "pending" : editData.status) : "pending",
        receipt_url: receiptUrl
      } : { 
        user_id: user.id, 
        company_id: companyId, 
        title: formData.title, 
        type: formData.category, 
        amount: Number(formData.amount.replace(/,/g, "")), 
        content: formData.content, 
        date: editData?.date || new Date().toISOString().split('T')[0] 
      };

      const query = editData ? supabase.from(table).update(payload).eq("id", editData.id) : supabase.from(table).insert([payload]);
      const { error } = await query; if (!error) onSuccess(); else alert("Error: " + error.message);
    }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[44px] p-12 z-10 border border-slate-100">
        <h2 className="text-2xl font-black mb-8">{editData ? "수정" : "등록"}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input required type="text" placeholder="항목명" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          <input type="text" placeholder="금액" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-right" value={formData.amount} onChange={(e) => { const val = e.target.value.replace(/[^0-9]/g, ""); setFormData({...formData, amount: val.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}); }} />
          <textarea rows={3} placeholder="내용" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-bold resize-none" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
          
          {type === "expense" && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tax Evidence (영수증)</p>
              <label className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border-2 border-dashed border-slate-200">
                <div className="p-2 bg-white rounded-xl text-slate-400"><Upload size={18} /></div>
                <div className="flex-1">
                  <p className="text-xs font-black text-slate-700">{file ? file.name : "영수증 파일 선택"}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">PDF, JPG, PNG (Max 5MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="w-full py-4.5 bg-slate-900 text-white font-black rounded-3xl mt-4 shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all">{loading ? "처리 중..." : (editData ? "수정 완료" : "결재 요청하기")}</button>
        </form>
      </motion.div>
    </div>
  );
}

function DetailModal({ request, onClose, onUpdateStatus, onDelete, onEdit, isAdmin }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/70 backdrop-blur-lg" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[50px] p-12 z-10 border border-slate-100">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-8">{request.title}</h2>
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-[32px] mb-8">
          <p className="text-lg font-black text-blue-600">₩{Number(request.amount).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-500">
             <UserIcon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">기안자 정보</p>
            <p className="text-sm font-black text-slate-800">{request.profiles?.full_name || "알 수 없음"} <span className="text-indigo-400 ml-2">({request.profiles?.erp_departments?.name?.split('(')[0] || "부서 없음"})</span></p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상세 내역</h4>
             <p className="text-slate-600 font-bold whitespace-pre-wrap bg-slate-50 p-6 rounded-3xl border border-slate-100">
               {request.content || "내용이 없습니다."}
             </p>
          </div>
          
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">증빙 자료</h4>
             {request.receipt_url ? (
               <a href={request.receipt_url} target="_blank" rel="noopener noreferrer" className="group block relative w-full aspect-video bg-slate-100 rounded-[32px] overflow-hidden border border-slate-200 shadow-inner">
                 <img src={request.receipt_url} alt="Receipt" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                   <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                     <ExternalLink size={12} /> View Full Receipt
                   </div>
                 </div>
               </a>
             ) : (
               <div className="w-full aspect-video bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-2">
                 <ImageIcon size={32} />
                 <p className="text-[10px] font-black uppercase tracking-widest">No Receipt Attached</p>
               </div>
             )}
          </div>
        </div>
        <div className="flex gap-4 border-t pt-8">
          <button onClick={() => { onDelete(request.id); onClose(); }} className="p-5 bg-rose-50 text-rose-600 rounded-[24px]"><Trash2 size={24} /></button>
          {isAdmin && request.status === "pending" && (
            <><button onClick={() => { onUpdateStatus(request.id, "rejected"); onClose(); }} className="flex-1 py-5 bg-rose-50 text-rose-600 font-black rounded-[24px]">반려</button>
            <button onClick={() => { onUpdateStatus(request.id, "approved"); onClose(); }} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[24px]">승인</button></>
          )}
          <button onClick={onClose} className="px-10 py-5 bg-slate-100 font-black rounded-[24px]">닫기</button>
        </div>
      </motion.div>
    </div>
  );
}

function IncomeDetailModal({ income, onClose, onDelete, onEdit }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/70 backdrop-blur-lg" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl bg-white rounded-[50px] p-12 z-10 border border-slate-100">
        <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-8">{income.title}</h2>
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] mb-8">
          <p className="text-lg font-black text-emerald-600">₩{Number(income.amount).toLocaleString()}</p>
        </div>
        <p className="text-slate-600 font-bold mb-8 whitespace-pre-wrap">{income.content || "상세 내역 없음"}</p>
        <div className="flex gap-4 border-t pt-8">
          <button onClick={() => { onDelete(income.id); onClose(); }} className="flex-1 py-5 bg-rose-50 text-rose-600 font-black rounded-[24px]">삭제</button>
          <button onClick={onClose} className="px-10 py-5 bg-slate-100 font-black rounded-[24px]">닫기</button>
        </div>
      </motion.div>
    </div>
  );
}

function StatusCard({ icon, label, value, color, trend, highlight = false }: any) {
  const colorMap: Record<string, string> = { emerald: "bg-emerald-50 text-emerald-600", rose: "bg-rose-50 text-rose-600", blue: "bg-blue-50 text-blue-600" };
  return (
    <div className={`p-8 rounded-[40px] border ${highlight ? "bg-slate-900 text-white" : "bg-white text-slate-800"} flex flex-col gap-6`}>
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-[22px] ${highlight ? "bg-white/10" : colorMap[color]}`}>{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest">{trend}</span>
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending": return <span className="px-4 py-2 bg-amber-50 text-amber-600 text-[10px] font-black rounded-xl flex items-center gap-2 whitespace-nowrap"><Clock size={14} /> 결재 대기</span>;
    case "approved": return <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-xl flex items-center gap-2 whitespace-nowrap"><CheckCircle2 size={14} /> 승인됨</span>;
    case "rejected": return <span className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black rounded-xl flex items-center gap-2 whitespace-nowrap"><XCircle size={14} /> 반려됨</span>;
    default: return null;
  }
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-32 gap-6 opacity-40">
      <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300"><XSquare size={40} /></div>
      <p className="text-slate-500 font-black text-sm tracking-widest uppercase">{label}</p>
    </div>
  );
}
