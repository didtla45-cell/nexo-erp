"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  RefreshCw, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  Clock,
  Briefcase,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  role: string;
  company_id: string;
  created_at: string;
};

export default function MembersPage() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch current user's role
    const { data: myProfile } = await supabase
      .from("erp_profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (myProfile) {
      setCurrentUserRole(myProfile.role);
      
      // Fetch all members in the same company
      const { data } = await supabase
        .from("erp_profiles")
        .select("*")
        .eq("company_id", myProfile.company_id)
        .order("created_at", { ascending: true });
      
      if (data) setMembers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const updateRole = async (memberId: string, newRole: string) => {
    if (currentUserRole !== 'owner') {
      alert("권한 부여는 대표님(Owner)만 가능합니다.");
      return;
    }

    const { error } = await supabase
      .from("erp_profiles")
      .update({ role: newRole })
      .eq("id", memberId);
    
    if (!error) {
      fetchMembers();
      setActiveMenuId(null);
    } else {
      alert(error.message);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'sales': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'accounting': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <ShieldCheck size={12} />;
      case 'sales': return <Briefcase size={12} />;
      case 'accounting': return <Shield size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-white/50 px-6 py-3 rounded-3xl w-fit shadow-sm">
          <div className="p-2 bg-indigo-600 rounded-xl text-white"><Users size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Management</p>
            <p className="text-xs font-black text-slate-700 tracking-tight">임직원 권한 및 보안 관리 시스템</p>
          </div>
        </div>
        
        <div className="flex gap-4">
           {currentUserRole === 'owner' && (
             <Link href="/dashboard/settings/departments" className="px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all">
               <UserPlus size={16} /> 신규 팀원 초대
             </Link>
           )}
           <button onClick={fetchMembers} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-colors">
             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Role Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RoleCard 
          title="OWNER (대표님)" 
          desc="시스템의 모든 권한을 가집니다. 팀원 초대 및 권한 수정이 가능합니다." 
          icon={<ShieldCheck className="text-indigo-600" />} 
          color="indigo"
        />
        <RoleCard 
          title="SALES (영업팀)" 
          desc="영업 관리 및 견적서 발행 권한을 가집니다. 관련 팀 알림을 수신합니다." 
          icon={<Briefcase className="text-blue-600" />} 
          color="blue"
        />
        <RoleCard 
          title="ACCOUNTING (회계팀)" 
          desc="회계 통계 및 지출 결재 권한을 가집니다. 재무 관련 알림을 수신합니다." 
          icon={<Shield className="text-emerald-600" />} 
          color="emerald"
        />
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="이름, 역할 검색..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none placeholder:text-slate-300"
          />
        </div>
        <button className="px-6 py-2.5 bg-slate-50 text-slate-400 text-xs font-black rounded-xl hover:bg-slate-100 transition-all flex items-center gap-2">
          <Filter size={14} /> 필터
        </button>
      </div>

      {/* Members List Table */}
      <div className="bg-white rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">팀원 정보</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">현재 역할</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">합류 일자</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">보안 상태</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">데이터 로딩 중...</td></tr>
            ) : (
              members.filter(m => m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.role?.toLowerCase().includes(searchTerm.toLowerCase())).map(member => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-6 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                        {member.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{member.full_name || "Guest User"}</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-0.5">ID: {member.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 border-b border-slate-50">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border ${getRoleBadge(member.role)}`}>
                      {getRoleIcon(member.role)} {member.role?.toUpperCase()}
                    </div>
                  </td>
                  <td className="p-6 border-b border-slate-50">
                    <p className="text-xs font-bold text-slate-500">{new Date(member.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="p-6 border-b border-slate-50 text-center">
                    <div className="flex justify-center">
                      <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg border border-green-100">ACTIVE</div>
                    </div>
                  </td>
                  <td className="p-6 border-b border-slate-50 text-center relative">
                    {currentUserRole === 'owner' && (
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                        className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>
                    )}
                    
                    <AnimatePresence>
                      {activeMenuId === member.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                          className="absolute right-6 top-14 w-48 bg-white border border-slate-100 rounded-3xl shadow-2xl z-20 flex flex-col p-2 overflow-hidden"
                        >
                          <p className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">권한 변경</p>
                          <button 
                            onClick={() => updateRole(member.id, 'owner')}
                            className="flex items-center gap-3 p-3 text-[11px] font-black text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"
                          >
                            <ShieldCheck size={14} /> Representative (Owner)
                          </button>
                          <button 
                            onClick={() => updateRole(member.id, 'sales')}
                            className="flex items-center gap-3 p-3 text-[11px] font-black text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                          >
                            <Briefcase size={14} /> Sales Team
                          </button>
                          <button 
                            onClick={() => updateRole(member.id, 'accounting')}
                            className="flex items-center gap-3 p-3 text-[11px] font-black text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                          >
                            <Shield size={14} /> Accounting Team
                          </button>
                          <div className="h-px bg-slate-50 my-1 mx-2" />
                          <button 
                            className="flex items-center gap-3 p-3 text-[11px] font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                          >
                            <XCircle size={14} /> 탈퇴 처리
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
    </div>
  );
}

function RoleCard({ title, desc, icon, color }: { title: string, desc: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    indigo: "border-indigo-100 bg-indigo-50/30",
    blue: "border-blue-100 bg-blue-50/30",
    emerald: "border-emerald-100 bg-emerald-50/30"
  };

  return (
    <div className={`p-6 rounded-[32px] border ${colorMap[color]} space-y-3`}>
      <div className="p-3 bg-white w-fit rounded-2xl shadow-sm">{icon}</div>
      <h4 className="text-xs font-black text-slate-800 tracking-tight uppercase">{title}</h4>
      <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
