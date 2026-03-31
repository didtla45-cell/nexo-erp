"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  ChevronRight,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Printer,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  ArrowUpRight,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { emailService } from "@/lib/email-service";

type Quotation = {
  id: string;
  quotation_number: string;
  total_amount: number;
  status: string;
  valid_until: string;
  created_at: string;
  customer: {
    name: string;
    company_name: string;
  };
  deal: {
    title: string;
  };
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'logs'>('list');
  const [sentLogs, setSentLogs] = useState<any[]>([]);

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
      
      // Fetch Quotations
      const { data: qData } = await supabase
        .from("erp_sales_quotations")
        .select(`
          *,
          customer:erp_customers(name, company_name, email),
          deal:erp_sales_deals(title)
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });
      
      if (qData) setQuotations(qData);

      // Fetch Sent Logs
      const { data: lData } = await supabase
        .from("erp_email_logs")
        .select(`
          *,
          quotation:erp_sales_quotations(quotation_number)
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });
      
      if (lData) setSentLogs(lData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("erp_sales_quotations")
      .update({ status: status })
      .eq("id", id);
    
    if (!error) {
      fetchData();
      setActiveMenuId(null);
    } else {
      alert(error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Declined': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Sent': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return <CheckCircle2 size={12} />;
      case 'Declined': return <XCircle size={12} />;
      case 'Sent': return <ArrowUpRight size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-white/50 px-6 py-3 rounded-3xl w-fit shadow-sm">
          <div className="p-2 bg-indigo-600 rounded-xl text-white"><FileText size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Quotations</p>
            <p className="text-xs font-black text-slate-700 tracking-tight">발행 견적서 통합 관리 시스템</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button onClick={fetchData} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="전체 견적서" 
          value={quotations.length.toString()} 
          icon={<FileText className="text-slate-400" />} 
          sub="총 누적 발행 건수"
        />
        <StatCard 
          label="승인 완료 (Accepted)" 
          value={quotations.filter(q => q.status === 'Accepted').length.toString()} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
          sub="계약 확정된 견적서" 
          highlight="bg-emerald-600"
        />
        <StatCard 
          label="대기 중 (Sent/Draft)" 
          value={quotations.filter(q => ['Sent', 'Draft'].includes(q.status)).length.toString()} 
          icon={<Clock className="text-blue-500" />} 
          sub="회신 대기 중인 항목"
        />
        <StatCard 
          label="견적 총액" 
          value={`₩${(quotations.reduce((acc, curr) => acc + Number(curr.total_amount), 0) / 10000).toFixed(1)}만`} 
          icon={<DollarSign className="text-indigo-500" />} 
          sub="발행 전체 가액"
        />
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            견적 리스트
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'logs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            발송 기록함
          </button>
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder={activeTab === 'list' ? "견적 번호, 고객사명 검색..." : "수신인, 제목 검색..."}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Content Rendering based on Tab */}
      {activeTab === 'list' ? (
        <div className="bg-white rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">견적 번호 / 일자</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">고객사 / 프로젝트</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">금액 (Total)</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">상태</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">유효 기간</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">데이터를 불러오는 중...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">발행된 견적서가 없습니다.</td></tr>
              ) : (
                quotations.map(q => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-6 border-b border-slate-50">
                      <p className="font-black text-slate-800 text-sm">{q.quotation_number}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(q.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-6 border-b border-slate-50">
                      <p className="font-black text-slate-700 text-sm">{q.customer?.company_name || q.customer?.name}</p>
                      <p className="text-[10px] font-bold text-indigo-400 mt-0.5 truncate max-w-[200px] italic">{q.deal?.title}</p>
                    </td>
                    <td className="p-6 border-b border-slate-50 text-right">
                      <p className="font-black text-slate-800 text-sm">₩{Number(q.total_amount).toLocaleString()}</p>
                    </td>
                    <td className="p-6 border-b border-slate-50 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border ${getStatusColor(q.status)}`}>
                        {getStatusIcon(q.status)} {q.status.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-6 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-500">{q.valid_until || "제한 없음"}</p>
                    </td>
                    <td className="p-6 border-b border-slate-50 text-center relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === q.id ? null : q.id)}
                        className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenuId === q.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute right-6 top-14 w-44 bg-white border border-slate-100 rounded-3xl shadow-2xl z-20 flex flex-col p-2 overflow-hidden"
                          >
                            <button 
                              onClick={() => { setSelectedQuotation(q); setShowPreview(true); setActiveMenuId(null); }}
                              className="flex items-center gap-3 p-3 text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all"
                            >
                              <Eye size={16} /> 상세 보기
                            </button>
                            <div className="h-px bg-slate-50 my-1 mx-2" />
                            <button 
                              onClick={() => updateStatus(q.id, 'Sent')}
                              className="flex items-center gap-3 p-3 text-xs font-black text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                            >
                              <ArrowUpRight size={16} /> 발송됨 (Sent)
                            </button>
                            <button 
                              onClick={() => updateStatus(q.id, 'Accepted')}
                              className="flex items-center gap-3 p-3 text-xs font-black text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                            >
                              <CheckCircle2 size={16} /> 승인 완료
                            </button>
                            <div className="h-px bg-slate-50 my-1 mx-2" />
                            <button 
                              className="flex items-center gap-3 p-3 text-xs font-black text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all"
                            >
                              <Trash2 size={16} /> 삭제하기
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sentLogs.length === 0 ? (
            <div className="col-span-full p-20 bg-white rounded-[44px] border border-slate-100 text-center">
              <RefreshCw size={40} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-300 font-black uppercase tracking-widest">아직 발송된 이메일 기록이 없습니다.</p>
            </div>
          ) : (
            sentLogs.map(log => (
              <div key={log.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Printer size={16} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recipient</p>
                      <p className="text-sm font-black text-slate-800">{log.recipient_email}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg border border-green-100 uppercase tracking-widest">
                    {log.status}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-700">{log.subject}</p>
                  <p className="text-[10px] font-bold text-slate-400 italic">Quotation Ref: {log.quotation?.quotation_number}</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-300">{new Date(log.created_at).toLocaleString()}</p>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">상세 로그 보기</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {showPreview && selectedQuotation && (
          <QuotationPreviewModal 
            quotation={selectedQuotation} 
            onClose={() => setShowPreview(false)} 
            onSuccess={() => { setShowPreview(false); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, sub, highlight }: { label: string, value: string, icon: React.ReactNode, sub?: string, highlight?: string }) {
  return (
    <div className={`p-8 rounded-[44px] border shadow-xl shadow-slate-200/40 flex flex-col gap-4 transition-all ${highlight ? `${highlight} text-white border-none` : 'bg-white border-slate-100 text-slate-800'}`}>
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-3xl ${highlight ? 'bg-white/20' : 'bg-slate-50'}`}>{icon}</div>
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
        <p className="text-4xl font-black tracking-tighter">{value}</p>
        {sub && <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${highlight ? 'text-white/40' : 'text-slate-300'}`}>{sub}</p>}
      </div>
    </div>
  );
}

function QuotationPreviewModal({ quotation, onClose, onSuccess }: { quotation: Quotation, onClose: () => void, onSuccess: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("erp_sales_quotation_items")
      .select("*, item:erp_inventory_items(name)")
      .eq("quotation_id", quotation.id)
      .then(({ data }) => {
        if (data) setItems(data);
        setLoading(false);
      });
  }, [quotation.id]);

  const handleSendEmail = async () => {
    setSending(true);
    
    const result = await emailService.sendQuotationEmail({
      recipientEmail: (quotation as any).customer?.email || "customer@example.com",
      customerName: quotation.customer?.company_name || "고객사",
      quotationNumber: quotation.quotation_number,
      quotationId: quotation.id,
      amount: quotation.total_amount,
      dealTitle: quotation.deal?.title
    }, (quotation as any).company_id || "");

    if (result.success) {
      // Update status
      await supabase
        .from("erp_sales_quotations")
        .update({ status: 'Sent' })
        .eq("id", quotation.id);
      
      alert(`이메일 발송 성공! \n\n고객용 공개 URL:\n${result.publicUrl}`);
      onSuccess();
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[44px] shadow-2xl relative flex flex-col overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">발행 견적서 상세 정보</h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{quotation.quotation_number}</p>
          </div>
          <div className="flex gap-2">
             <button onClick={() => window.print()} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors"><Printer size={20} /></button>
             <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors"><XCircle size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-12">
          {/* Business Info Header */}
          <div className="flex justify-between items-start pb-8 border-b-2 border-slate-100">
             <div>
                <h1 className="text-5xl font-black text-indigo-900 tracking-tighter mb-4">QUOTATION</h1>
                <div className="space-y-1">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Issued To</p>
                   <p className="text-2xl font-black text-slate-800">{quotation.customer?.company_name}</p>
                   <p className="text-sm font-bold text-slate-500">{quotation.customer?.name} 담당자님 귀하</p>
                </div>
             </div>
             <div className="text-right space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
                   <Calendar size={14} className="text-indigo-600" />
                   <span className="text-xs font-black text-indigo-900">{new Date(quotation.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Due Date</p>
                   <p className="text-sm font-black text-slate-800">{quotation.valid_until || "제한 없음"}</p>
                </div>
             </div>
          </div>

          {/* Project Context */}
          <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform"><FileText size={80} /></div>
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Project Title</p>
             <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight italic">"{quotation.deal?.title}"</h4>
          </div>

          {/* Items Table */}
          <div className="space-y-6">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">세부 품목 내역 (Item Details)</h4>
             <table className="w-full">
                <thead>
                   <tr className="border-b border-slate-100">
                      <th className="py-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Description</th>
                      <th className="py-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="py-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unit Price</th>
                      <th className="py-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Subtotal</th>
                   </tr>
                </thead>
                <tbody>
                   {loading ? (
                      <tr><td colSpan={4} className="py-10 text-center text-slate-300">Loading details...</td></tr>
                   ) : (
                      items.map(item => (
                         <tr key={item.id} className="border-b border-slate-50">
                            <td className="py-6 px-2 font-black text-slate-800">{item.item?.name || item.description}</td>
                            <td className="py-6 px-2 text-center font-black text-slate-500">{item.quantity} EA</td>
                            <td className="py-6 px-2 text-right font-bold text-slate-500">₩{Number(item.unit_price).toLocaleString()}</td>
                            <td className="py-6 px-2 text-right font-black text-indigo-600">₩{Number(item.subtotal).toLocaleString()}</td>
                         </tr>
                      ))
                   )}
                </tbody>
             </table>
          </div>

          {/* Footer Summary */}
          <div className="pt-10 flex flex-col md:flex-row justify-between items-end gap-8 mt-auto">
             <div className="max-w-xs">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms & Conditions</p>
                <p className="text-[10px] text-slate-300 italic leading-relaxed">
                   - 본 견적서는 발행일로부터 유효 기간 내에만 효력을 가집니다.<br />
                   - 상기 금액에는 부가세가 포함되어 있지 않습니다.<br />
                   - 공급 시점의 재고 상황에 따라 품목이 변경될 수 있습니다.
                </p>
             </div>
             <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Amount Due</p>
                <p className="text-6xl font-black text-indigo-600 tracking-tighter shadow-indigo-600/10">₩{Number(quotation.total_amount).toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
           <button 
             onClick={() => window.print()}
             className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
           >
             <Download size={16} /> PDF 다운로드
           </button>
           <button 
             onClick={handleSendEmail}
             disabled={sending}
             className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
           >
             {sending ? <RefreshCw size={16} className="animate-spin" /> : <Printer size={16} />}
             {sending ? "이메일 & PDF 전송 중..." : "이메일 발송 & 팀 알림"}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
