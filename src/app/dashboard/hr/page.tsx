"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  User as UserIcon,
  RefreshCw,
  Trash2,
  Edit3,
  ShieldCheck,
  Plane,
  Sun,
  Moon,
  Info,
  Check,
  Ban,
  X,
  Calendar as CalendarIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type LeaveRequest = {
  id: string;
  user_id: string;
  company_id: string;
  leave_type: string;
  half_day_type: string | null;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function HRPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const openDetail = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setIsDetailModalOpen(true);
  };
  const openEdit = (req: LeaveRequest) => {
    setSelectedRequest(req);
    setIsEditModalOpen(true);
  };

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("staff");
  const [joinedAt, setJoinedAt] = useState<string | null>(null);

  // 연차 계산 로직 (근로기준법 기준)
  const calculateStats = () => {
    if (!joinedAt) return { total: 15, used: 0, remaining: 15 };

    const joinDate = new Date(joinedAt);
    const today = new Date();
    
    // 개월 수 차이 계산
    const diffMonths = (today.getFullYear() - joinDate.getFullYear()) * 12 + (today.getMonth() - joinDate.getMonth());
    const diffYears = Math.floor(diffMonths / 12);

    let totalLeave = 0;
    if (diffMonths < 12) {
      // 1년 미만: 1개월 개근 시 1일 발생 (최대 11일)
      totalLeave = Math.max(0, diffMonths); 
    } else {
      // 1년 이상: 기본 15일 + 3년부터 2년마다 1일 가산 (최대 25일)
      totalLeave = 15 + Math.floor((Math.max(1, diffYears) - 1) / 2);
      if (totalLeave > 25) totalLeave = 25;
    }

    // 사용한 연차 계산 (반차는 0.5로 계산)
    const usedLeave = requests
      .filter(r => r.status === 'approved')
      .reduce((acc, curr) => {
        if (curr.leave_type === 'half_day') return acc + 0.5;
        
        // 연차는 시작일과 종료일 차이 계산
        const start = new Date(curr.start_date);
        const end = new Date(curr.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return acc + diffDays;
      }, 0);

    return {
      total: totalLeave,
      used: usedLeave,
      remaining: Math.max(0, totalLeave - usedLeave)
    };
  };

  const { total, used, remaining } = calculateStats();

  const initialize = async () => {
    let { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const { data: anon } = await supabase.auth.signInAnonymously();
      user = anon.user;
    }

    if (user) {
      const { data: profile } = await supabase
        .from("erp_profiles")
        .select("company_id, role, joined_at")
        .eq("id", user.id)
        .single();

      if (profile) {
        setCompanyId(profile.company_id);
        setUserRole(profile.role || "staff");
        setJoinedAt(profile.joined_at);
        return { companyId: profile.company_id };
      } else {
        const { data: companies } = await supabase.from("erp_companies").select("id").eq("name", "지민컴퍼니");
        const company = companies?.[0];
        if (company) {
          const role = "admin"; 
          const defaultJoinDate = '2025-01-01'; // 기본값
          await supabase.from("erp_profiles").upsert({
            id: user.id,
            company_id: company.id,
            full_name: "지민컴퍼니 대표님",
            role: role,
            joined_at: defaultJoinDate
          });
          setCompanyId(company.id);
          setUserRole(role);
          setJoinedAt(defaultJoinDate);
          return { companyId: company.id };
        }
      }
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    const context = await initialize();
    if (context?.companyId) {
      const { data } = await supabase
        .from("erp_leave_requests")
        .select("*")
        .eq("company_id", context.companyId)
        .order("created_at", { ascending: false });
      if (data) setRequests(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    const { error } = await supabase.from("erp_leave_requests").update({ status: newStatus }).eq("id", id);
    if (!error) fetchData(); // 통계 갱신을 위해 재페치
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 신청 건을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("erp_leave_requests").delete().eq("id", id);
    if (!error) fetchData();
  };

  const isAdmin = userRole === "admin" || userRole === "owner";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-white/50 px-6 py-3 rounded-3xl w-fit shadow-sm">
          <div className="p-2 bg-indigo-600 rounded-xl text-white"><Plane size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">HR Management</p>
            <p className="text-xs font-black text-slate-700 tracking-tight">근로기준법 기반 연차 관리</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white/60 text-slate-500 rounded-2xl border border-white text-[10px] font-black flex items-center gap-2">
            <CalendarIcon size={14} className="text-indigo-400" />
            Join Date: {joinedAt || '미등록'}
          </div>
          <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={14} />
            Role: {userRole.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-indigo-900">
        <StatCard label="나의 잔여 연차" value={remaining.toString()} icon={<Sun className="text-blue-500" />} sub={`총 ${total}일 발생`} highlight />
        <StatCard label="사용 완료" value={used.toString()} icon={<CheckCircle2 className="text-emerald-500" />} sub="승인된 신청 건" />
        <StatCard label="대기 중인 결재" value={requests.filter(r => r.status === 'pending').length.toString()} icon={<Clock className="text-amber-500" />} />
        <StatCard label="총 발생 연차" value={total.toString()} icon={<Plane className="text-indigo-400" />} sub="입사일 기준 자동 계산" />
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">휴가 신청 현황</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">입사일 기준 근로기준법에 따라 관리되는 스마트 HR 리스트입니다.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-8 py-3.5 bg-indigo-600 text-white text-sm font-black rounded-[22px] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2">
            <Plus size={20} /> 휴가 신청
          </button>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-indigo-400 mb-4" /> <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading...</p></div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[32px]">신청 내역이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map(req => (
                <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-50/50 hover:bg-white p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 transition-all group hover:shadow-xl hover:shadow-indigo-500/5 relative flex flex-col justify-between">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-100"><UserIcon size={18} /></div>
                        <div><p className="font-black text-slate-800 text-sm">임직원</p><p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Team HQ</p></div>
                      </div>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${req.leave_type === 'half_day' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{req.leave_type === 'annual' ? '연차' : '반차'}</span>
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">{req.leave_type === 'half_day' ? <Moon size={12} className="text-indigo-400" /> : <Sun size={12} className="text-blue-400" />}{req.leave_type === 'annual' ? '전일 휴가' : `${req.half_day_type === 'am' ? '오전' : '오후'} 반차`}</div>
                      </div>
                      <p className="text-sm font-black text-slate-800">{req.start_date}</p>
                      {req.start_date !== req.end_date && <p className="text-[10px] text-slate-400 font-bold mt-1">~ {req.end_date}</p>}
                    </div>
                    <div className="px-1"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">신청 사유</p><button onClick={() => openDetail(req)} className="text-xs text-slate-500 font-bold leading-relaxed text-left line-clamp-2 hover:text-indigo-600 transition-colors">{req.reason || '사유가 입력되지 않았습니다.'}</button></div>
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                    <div className="flex items-center gap-2">
                       {isAdmin && req.status === 'pending' && (
                         <>
                           <button onClick={() => handleUpdateStatus(req.id, 'approved')} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Check size={18} /></button>
                           <button onClick={() => handleUpdateStatus(req.id, 'rejected')} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Ban size={18} /></button>
                         </>
                       )}
                       {(req.status === 'pending' || req.status === 'rejected') && (<button onClick={() => openEdit(req)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={18} /></button>)}
                    </div>
                    <button onClick={() => handleDelete(req.id)} className="p-2.5 text-slate-200 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (<LeaveEntryModal onClose={() => setIsModalOpen(false)} companyId={companyId} onSuccess={() => { setIsModalOpen(false); fetchData(); }} />)}
        {isDetailModalOpen && selectedRequest && (<LeaveDetailModal request={selectedRequest} onClose={() => setIsDetailModalOpen(false)} />)}
        {isEditModalOpen && selectedRequest && (<LeaveEditModal request={selectedRequest} onClose={() => setIsEditModalOpen(false)} onSuccess={() => { setIsEditModalOpen(false); fetchData(); }} />)}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, sub, highlight }: { label: string, value: string, icon: React.ReactNode, sub?: string, highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-[32px] border shadow-sm flex flex-col gap-4 transition-all ${highlight ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-100 text-indigo-900'}`}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${highlight ? 'bg-white/10' : 'bg-slate-50'}`}>{icon}</div>
        <Info size={14} className={highlight ? 'text-white/40' : 'text-slate-200'} />
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
        <p className="text-3xl font-black tracking-tighter">{value}</p>
        {sub && <p className={`text-[9px] font-bold mt-1 uppercase tracking-widest ${highlight ? 'text-white/40' : 'text-slate-300'}`}>{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pending": return <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg border border-amber-100">결재 대기</span>;
    case "approved": return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg border border-emerald-100">승인 완료</span>;
    case "rejected": return <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[9px] font-black rounded-lg border border-rose-100">반려</span>;
    default: return null;
  }
}

function LeaveEntryModal({ onClose, companyId, onSuccess }: { onClose: () => void, companyId: string | null, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: 'annual', halfType: 'am', startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user && companyId) {
      const { error } = await supabase.from('erp_leave_requests').insert([{ user_id: user.id, company_id: companyId, leave_type: formData.type, half_day_type: formData.type === 'half_day' ? formData.halfType : null, start_date: formData.startDate, end_date: formData.type === 'annual' ? formData.endDate : formData.startDate, reason: formData.reason }]);
      if (!error) onSuccess(); else alert(error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-slate-800">휴가 신청서 작성</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4"><button type="button" onClick={() => setFormData({...formData, type: 'annual'})} className={`p-4 rounded-2xl border transition-all text-sm font-black ${formData.type === 'annual' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>연차 (종일)</button><button type="button" onClick={() => setFormData({...formData, type: 'half_day'})} className={`p-4 rounded-2xl border transition-all text-sm font-black ${formData.type === 'half_day' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>반차 (0.5)</button></div>
          {formData.type === 'half_day' && (<div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl"><button type="button" onClick={() => setFormData({...formData, halfType: 'am'})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.halfType === 'am' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>오전 반차</button><button type="button" onClick={() => setFormData({...formData, halfType: 'pm'})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.halfType === 'pm' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>오후 반차</button></div>)}
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">시작 일자</label><input required type="date" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
            {formData.type === 'annual' && (<div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">종료 일자</label><input required type="date" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} /></div>)}
          </div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">휴가 사유</label><textarea required rows={3} className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none resize-none" placeholder="사유를 상세히 입력해 주세요." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} /></div>
          <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20">{isSubmitting ? '처리 중...' : '신청 상신'}</button>
        </form>
      </motion.div>
    </div>
  );
}

function LeaveEditModal({ request, onClose, onSuccess }: { request: LeaveRequest, onClose: () => void, onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: request.leave_type, halfType: request.half_day_type || 'am', startDate: request.start_date, endDate: request.end_date, reason: request.reason || '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('erp_leave_requests').update({ leave_type: formData.type, half_day_type: formData.type === 'half_day' ? formData.halfType : null, start_date: formData.startDate, end_date: formData.type === 'annual' ? formData.endDate : formData.startDate, reason: formData.reason, status: 'pending' }).eq('id', request.id);
    if (!error) onSuccess(); else alert(error.message);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-slate-800">휴가 신청서 수정</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4"><button type="button" onClick={() => setFormData({...formData, type: 'annual'})} className={`p-4 rounded-2xl border transition-all text-sm font-black ${formData.type === 'annual' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>연차 (종일)</button><button type="button" onClick={() => setFormData({...formData, type: 'half_day'})} className={`p-4 rounded-2xl border transition-all text-sm font-black ${formData.type === 'half_day' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>반차 (0.5)</button></div>
          {formData.type === 'half_day' && (<div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl"><button type="button" onClick={() => setFormData({...formData, halfType: 'am'})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.halfType === 'am' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>오전 반차</button><button type="button" onClick={() => setFormData({...formData, halfType: 'pm'})} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.halfType === 'pm' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>오후 반차</button></div>)}
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">시작 일자</label><input required type="date" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
            {formData.type === 'annual' && (<div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">종료 일자</label><input required type="date" className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} /></div>)}
          </div>
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">휴가 사유</label><textarea required rows={3} className="w-full p-4 bg-slate-50 rounded-xl font-bold border-none outline-none resize-none" placeholder="사유를 수정해 주세요." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} /></div>
          <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20">{isSubmitting ? '수정 중...' : '수정 완료'}</button>
        </form>
      </motion.div>
    </div>
  );
}

function LeaveDetailModal({ request, onClose }: { request: LeaveRequest, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-4"><div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm"><Plane size={24} /></div><h2 className="text-2xl font-black text-slate-800 tracking-tight">휴가 신청 상세</h2></div><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4"><div className="p-5 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">신청 유형</p><p className="font-black text-slate-800">{request.leave_type === 'annual' ? '연차 (종일)' : `반차 (${request.half_day_type === 'am' ? '오전' : '오후'})`}</p></div><div className="p-5 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">현재 상태</p><StatusBadge status={request.status} /></div></div>
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">신청 기간</p><p className="font-black text-slate-800 text-lg">{request.start_date} {request.start_date !== request.end_date ? `~ ${request.end_date}` : ''}</p></div>
          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">신청 사유</p><p className="font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">{request.reason || '입력된 사유가 없습니다.'}</p></div>
        </div>
        <button onClick={onClose} className="w-full mt-10 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl text-xs tracking-widest uppercase hover:bg-slate-200 transition-colors">닫기</button>
      </motion.div>
    </div>
  );
}
