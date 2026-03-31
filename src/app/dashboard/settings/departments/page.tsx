"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  Plus, 
  Trash2, 
  Key, 
  RefreshCw, 
  Copy, 
  CheckCircle2,
  Briefcase,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
      
      // Fetch Departments
      const { data: depts } = await supabase
        .from("erp_departments")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("name", { ascending: true });
      
      if (depts) setDepartments(depts);

      // Fetch Codes
      const { data: ecodes } = await supabase
        .from("erp_employee_codes")
        .select(`
          *,
          department:erp_departments(name)
        `)
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });
      
      if (ecodes) setCodes(ecodes);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addDepartment = async () => {
    if (!newDeptName || !companyId) return;
    const { error } = await supabase
      .from("erp_departments")
      .insert({ name: newDeptName, company_id: companyId });
    
    if (!error) {
      setNewDeptName("");
      fetchData();
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm("부서를 삭제하시겠습니까? 관련 사번과 멤버 정보에 영향을 줄 수 있습니다.")) return;
    await supabase.from("erp_departments").delete().eq("id", id);
    fetchData();
  };

  const generateCode = async (deptId: string, deptName: string) => {
    if (!companyId) return;
    
    const prefix = deptName.substring(0, 1).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    const newCode = `NEXO-${prefix}-${random}`;

    const { error } = await supabase
      .from("erp_employee_codes")
      .insert({
        company_id: companyId,
        department_id: deptId,
        code: newCode
      });
    
    if (!error) fetchData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyInviteLink = (code: string) => {
    const baseUrl = window.location.origin;
    const inviteUrl = `${baseUrl}/signup?code=${code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(`link-${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-3 rounded-3xl shadow-sm">
          <div className="p-2 bg-indigo-600 rounded-xl text-white"><Briefcase size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Architecture</p>
            <p className="text-xs font-black text-slate-700 tracking-tight">부서 및 유동적 가입 코드 관리</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
             <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
               <Building2 size={16} className="text-indigo-600" /> 부서 추가
             </h3>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={newDeptName}
                 onChange={(e) => setNewDeptName(e.target.value)}
                 placeholder="부서명 (예: 인사팀)"
                 className="flex-1 px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none"
               />
               <button 
                 onClick={addDepartment}
                 className="p-2 bg-indigo-600 text-white rounded-xl hover:scale-105 transition-transform"
               >
                 <Plus size={20} />
               </button>
             </div>
          </div>

          <div className="bg-white rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">등록된 부서</h3>
            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept.id} className="group flex items-center justify-between p-4 bg-slate-50/50 hover:bg-indigo-50/50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                  <span className="text-sm font-black text-slate-700">{dept.name?.split('(')[0]}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => generateCode(dept.id, dept.name)}
                      className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                      title="가입 코드 생성"
                    >
                      <Key size={14} />
                    </button>
                    <button 
                      onClick={() => deleteDepartment(dept.id)}
                      className="p-2 text-rose-300 hover:text-rose-500 hover:bg-white rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {departments.length === 0 && (
                <p className="text-center py-6 text-[10px] font-bold text-slate-300">등록된 부서가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        {/* Generated Codes List */}
        <div className="lg:col-span-2 bg-white rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Key size={18} className="text-indigo-600" /> 사번(가입 코드) 현황
            </h3>
            <button onClick={fetchData} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">발행된 사번 코드</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">배정 부서</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">사용 여부</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">발행일</th>
                  <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">복사</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 border-b border-slate-50">
                      <span className="font-black text-slate-800 text-sm font-mono tracking-tighter">{code.code}</span>
                    </td>
                    <td className="p-6 border-b border-slate-50">
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{code.department?.name?.split('(')[0]}</span>
                    </td>
                    <td className="p-6 border-b border-slate-50 text-center">
                      {code.is_used ? (
                        <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-3 py-1 rounded-full uppercase">Used</span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase border border-emerald-100 animate-pulse">Available</span>
                      )}
                    </td>
                    <td className="p-6 border-b border-slate-50 text-xs font-bold text-slate-400">
                      {new Date(code.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-6 border-b border-slate-50 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(code.code)}
                          title="사번 복사"
                          className={`p-2 rounded-xl transition-all ${copiedCode === code.code ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-indigo-600'}`}
                        >
                          {copiedCode === code.code ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        </button>
                        <button 
                          onClick={() => copyInviteLink(code.code)}
                          title="초대 링크 복사"
                          className={`p-2 rounded-xl transition-all ${copiedCode === `link-${code.code}` ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-indigo-600 border border-transparent hover:border-indigo-100'}`}
                        >
                          {copiedCode === `link-${code.code}` ? <CheckCircle2 size={16} /> : <Link2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr><td colSpan={5} className="p-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">부서를 선택하고 가입 코드를 생성해 주세요.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
