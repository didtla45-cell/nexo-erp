"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";

export default function PublicQuotationView() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      // Fetch quotation from DB (Public Select enabled via RLS)
      const { data, error } = await supabase
        .from("erp_sales_quotations")
        .select(`
          *,
          items:erp_sales_quotation_items (*)
        `)
        .eq("id", id)
        .single();
      
      if (data) {
        setQuotation(data);
      }
      setLoading(false);
    };

    if (id) fetchQuotation();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto mb-4" />
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs">NEXO SECURE GATEWAY</p>
        <p className="text-slate-800 font-bold mt-2">견적서를 불러오는 중입니다...</p>
      </div>
    </div>
  );

  if (!quotation) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <ShieldCheck size={48} className="text-slate-300 mx-auto mb-4" />
        <p className="text-slate-800 font-black text-xl">만료되거나 잘못된 링크입니다.</p>
        <p className="text-slate-400 text-sm mt-2">정확한 링크인지 다시 확인해 주세요.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 md:py-20 font-sans selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Brand */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-indigo-600/20">N</div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">NEXO ERP <span className="text-slate-300 font-medium">| Quotation</span></h1>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100">
            <ShieldCheck size={12} /> SECURE VIEW
          </div>
        </div>

        {/* Main Document Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[44px] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
        >
          {/* Top Banner */}
          <div className="bg-indigo-600 p-10 md:p-14 text-white flex flex-wrap justify-between items-start gap-8">
             <div className="space-y-2">
               <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em]">Official Quotation</p>
               <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">#{quotation.quotation_number}</h2>
             </div>
             <div className="text-right space-y-1">
               <p className="text-xs font-bold text-indigo-200">Issue Date: {new Date(quotation.created_at).toLocaleDateString()}</p>
               <p className="text-xs font-bold text-indigo-200 uppercase">Valid Until: {quotation.valid_until || '30 Days'}</p>
             </div>
          </div>

          <div className="p-10 md:p-14 space-y-12">
            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={12} /> ISSUER
                </p>
                <div className="space-y-1">
                  <p className="text-xl font-black text-slate-900">NEXO SOLUTIONS</p>
                  <p className="text-sm text-slate-500 font-medium tracking-tight">지민컴퍼니 대표 지민 (Representative)</p>
                </div>
              </div>
              <div className="text-left md:text-right space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center md:justify-end gap-2">
                  TO CLIENT <CheckCircle2 size={12} />
                </p>
                <div className="space-y-1">
                  <p className="text-xl font-black text-slate-900 uppercase">PROSPECTIVE PARTNER</p>
                  <p className="text-sm text-slate-500 font-medium tracking-tight">귀하의 성공적인 비즈니스를 지원합니다.</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                   <FileText size={20} className="text-indigo-600" /> 상세 품목 리스트
                 </h3>
               </div>
               <div className="border border-slate-100 rounded-3xl overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-slate-50">
                       <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">품목명</th>
                       <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">수량</th>
                       <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">단가</th>
                       <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">금액</th>
                     </tr>
                   </thead>
                   <tbody>
                     {quotation.items?.map((item: any) => (
                       <tr key={item.id} className="border-t border-slate-50">
                         <td className="p-5">
                           <p className="font-bold text-slate-800">{item.description || "상세 내역 없음"}</p>
                         </td>
                         <td className="p-5 text-center font-bold text-slate-500">{item.quantity}</td>
                         <td className="p-5 text-right font-bold text-slate-500">₩{Number(item.unit_price).toLocaleString()}</td>
                         <td className="p-5 text-right font-black text-indigo-600">₩{Number(item.subtotal || (item.quantity * item.unit_price)).toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                   <tfoot>
                     <tr className="bg-indigo-50/50">
                       <td colSpan={3} className="p-6 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Grand Total</td>
                       <td className="p-6 text-right text-2xl font-black text-indigo-600">₩{quotation.total_amount?.toLocaleString()}</td>
                     </tr>
                   </tfoot>
                 </table>
               </div>
            </div>

            {/* Terms */}
            <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 flex flex-wrap gap-10">
               <div className="flex-1 min-w-[200px] space-y-3">
                 <div className="flex items-center gap-2 text-indigo-600">
                   <Calendar size={16} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Delivery & Dates</p>
                 </div>
                 <p className="text-sm font-bold text-slate-600 leading-relaxed">
                   결제 완료 후 즉시 기술 지원이 시작되며, 최종 결과물은 영업일 기준 7일 이내에 제공됩니다.
                 </p>
               </div>
               <div className="flex-1 min-w-[200px] space-y-3">
                 <div className="flex items-center gap-2 text-indigo-600">
                   <CreditCard size={16} />
                   <p className="text-[10px] font-black uppercase tracking-widest">Payment Terms</p>
                 </div>
                 <p className="text-sm font-bold text-slate-600 leading-relaxed">
                   선금 50%, 잔금 50% 분할 결제를 지원하며 계좌 이체 정보를 별도 안내 드립니다.
                 </p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 px-4">
           <p className="text-sm font-medium text-slate-400">
             본 견적서는 NEXO ERP 보안 게이트웨이를 통해 안전하게 생성되었습니다.
           </p>
           <div className="flex gap-4">
             <button className="px-8 py-4 bg-white border border-slate-100 text-slate-900 text-sm font-black rounded-2xl shadow-xl hover:bg-slate-50 transition-all flex items-center gap-2">
               <Download size={18} /> PDF 다운로드
             </button>
             <button className="px-8 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all flex items-center gap-2">
               <MessageSquare size={18} /> 수락 및 상담하기
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
