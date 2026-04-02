"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Settings, 
  FileText, 
  Calendar, 
  CreditCard, 
  Users, 
  Package, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function PermissionMatrix() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

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
      
      const { data: depts } = await supabase
        .from("erp_departments")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("name", { ascending: true });
      
      if (depts) setDepartments(depts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePermission = async (deptId: string, currentPerms: any, key: string) => {
    const newPerms = { ...currentPerms, [key]: !currentPerms[key] };
    
    // Optimistic UI update
    setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, menu_permissions: newPerms } : d));

    const { error } = await supabase
      .from("erp_departments")
      .update({ menu_permissions: newPerms })
      .eq("id", deptId);
    
    if (error) {
      // Revert if error
      fetchData();
    }
  };

  const PERMISSION_KEYS = [
    { key: 'accounting', label: '지출 결재', icon: <FileText size={14} /> },
    { key: 'hr', label: '연차 결재', icon: <Calendar size={14} /> },
    { key: 'finance', label: '회계 통계', icon: <CreditCard size={14} /> },
    { key: 'members', label: '임직원 관리', icon: <Users size={14} /> },
    { key: 'inventory', label: '재고 관리', icon: <Package size={14} /> },
    { key: 'sales', label: '영업 관리', icon: <TrendingUp size={14} /> },
    { key: 'quotations', label: '견적 관리', icon: <FileText size={14} /> },
    { key: 'settings', label: '시스템 설정', icon: <Settings size={14} /> },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200/50">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/10">
               <ShieldCheck size={12} className="text-indigo-400" />
               Security Configuration
             </div>
             <h1 className="text-4xl font-black tracking-tighter mb-4 leading-tight">부서별 전용 <span className="text-indigo-400">권한 매트릭스</span></h1>
             <p className="text-slate-400 font-medium text-lg leading-relaxed">
               각 고객사 관리자가 직접 부서별 메뉴 접근권을 제어할 수 있는 보안 콘솔입니다. 
               부서의 성격에 맞춰 필요한 메뉴만 활성화해 주세요.
             </p>
          </div>
          <button onClick={fetchData} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all">
            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Permission Table */}
      <div className="bg-white rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-8 border-b border-slate-100 bg-white sticky left-0 z-20">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">부서 상세</span>
                </th>
                {PERMISSION_KEYS.map((perm) => (
                  <th key={perm.key} className="p-6 text-center border-b border-slate-100 min-w-[120px]">
                    <div className="flex flex-col items-center gap-2">
                       <div className="p-2 bg-slate-100 rounded-xl text-slate-400 group-hover:bg-indigo-50 transition-colors">
                         {perm.icon}
                       </div>
                       <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{perm.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="p-8 border-b border-slate-50 bg-white sticky left-0 z-10 group-hover:bg-indigo-50/10 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 tracking-tight">{dept.name?.split('(')[0]}</span>
                      <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-1">
                        {Object.values(dept.menu_permissions || {}).filter(v => v === true).length}개 활성
                      </span>
                    </div>
                  </td>
                  {PERMISSION_KEYS.map((perm) => (
                    <td key={`${dept.id}-${perm.key}`} className="p-6 border-b border-slate-50 text-center">
                       <button 
                         onClick={() => togglePermission(dept.id, dept.menu_permissions || {}, perm.key)}
                         className={`relative inline-flex h-8 w-14 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${
                           dept.menu_permissions?.[perm.key] 
                             ? "bg-indigo-600 shadow-lg shadow-indigo-600/30" 
                             : "bg-slate-200"
                         }`}
                       >
                         <div className={`absolute h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                           dept.menu_permissions?.[perm.key] ? "translate-x-3" : "-translate-x-3"
                         }`} />
                         {dept.menu_permissions?.[perm.key] ? (
                           <CheckCircle2 size={10} className="absolute left-2.5 text-white/40" />
                         ) : (
                           <XCircle size={10} className="absolute right-2.5 text-slate-400/40" />
                         )}
                       </button>
                    </td>
                  ))}
                </tr>
              ))}
              {departments.length === 0 && !loading && (
                <tr>
                   <td colSpan={PERMISSION_KEYS.length + 1} className="p-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                     <div className="flex flex-col items-center gap-4">
                       <Info size={40} className="opacity-10" />
                       부서를 먼저 등록해 주세요.
                     </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guidance */}
      <div className="flex items-center gap-6 p-10 bg-indigo-50/50 rounded-[40px] border border-indigo-100">
         <div className="w-16 h-16 shrink-0 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100/50">
            <ShieldCheck className="text-indigo-600" size={32} />
         </div>
         <div>
            <h4 className="text-lg font-black text-slate-800 mb-1 tracking-tight">지능형 일괄 권한 관리</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
               각 스위치를 클릭하면 해당 부서원들의 사이드바 메뉴가 실시간으로 제어됩니다. 
               대표님과 시스템 관리자는 부서 권장 템플릿을 사용하여 빠르게 초기 세팅을 마칠 수도 있습니다.
            </p>
         </div>
      </div>
    </div>
  );
}
