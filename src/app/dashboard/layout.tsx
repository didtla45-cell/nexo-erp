"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  CreditCard, 
  Users, 
  User as UserIcon,
  Settings, 
  ChevronRight,
  LogOut,
  Calendar,
  Building2,
  Package,
  TrendingUp,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<{ 
    full_name: string, 
    role: string, 
    company_id: string,
    department_id?: string,
    erp_departments?: { name: string }
  } | null>(null);
  const [companyName, setCompanyName] = useState<string>("Loading...");

  useEffect(() => {
    const initialize = async () => {
      let { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (user) {
        // 1. Fetch profile
        let { data: existingProfile } = await supabase
          .from("erp_profiles")
          .select("full_name, role, company_id, department_id, erp_departments(name)")
          .eq("id", user.id)
          .single();

        // 2. If no profile, create one linked to '지민컴퍼니' (Default for Phase 2)
        if (!existingProfile) {
          const { data: companies } = await supabase.from("erp_companies").select("id, name").eq("name", "지민컴퍼니");
          const company = companies?.[0];
          
          if (company) {
            const newProfile = {
              id: user.id,
              company_id: company.id,
              full_name: "NEXO 대표님",
              role: "owner"
            };
            await supabase.from("erp_profiles").upsert(newProfile);
            existingProfile = { 
              ...newProfile, 
              department_id: undefined, 
              erp_departments: undefined 
            } as any;
          }
        }

        if (existingProfile) {
          const profileWithDept = {
            ...existingProfile,
            erp_departments: Array.isArray(existingProfile.erp_departments) 
              ? existingProfile.erp_departments[0] 
              : existingProfile.erp_departments
          };
          setProfile(profileWithDept as any);
          
          // 3. Fetch company name
          const { data: companyData } = await supabase
            .from("erp_companies")
            .select("name")
            .eq("id", existingProfile.company_id)
            .single();
          
          if (companyData) setCompanyName(companyData.name);
        }
      }
    };

    initialize();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-3 group/logo">
            <div className="relative w-10 h-10 flex items-center justify-center transition-transform group-hover/logo:scale-110">
              {/* Nexo Stylized 'N' Logo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-xl rotate-12 opacity-20 animate-pulse"></div>
              <div className="relative w-8 h-8 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 overflow-hidden">
                 <span className="font-black text-xl italic tracking-tighter">N</span>
                 <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-white/20 rotate-45"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-slate-800 tracking-tighter leading-none group-hover/logo:text-indigo-600 transition-colors">NEXO</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">{companyName}</span>
                {profile?.erp_departments?.name && (
                  <>
                    <span className="text-[8px] text-slate-300">•</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {(profile.erp_departments as any).name || profile.erp_departments.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="대시보드" href="/dashboard" />
          <SidebarItem icon={<FileText size={20} />} label="지출 결재" href="/dashboard/accounting" />
          <SidebarItem icon={<Calendar size={20} />} label="연차/반차 결재" href="/dashboard/hr" />
          <SidebarItem icon={<CreditCard size={20} />} label="회계 통계" href="/dashboard/finance" />
          <SidebarItem icon={<Users size={20} />} label="임직원 관리" href="/dashboard/members" />
          <SidebarItem icon={<Package size={20} />} label="재고 관리" href="/dashboard/inventory" />
          <SidebarItem icon={<TrendingUp size={20} />} label="영업 관리" href="/dashboard/sales" />
          <SidebarItem icon={<FileText size={20} />} label="견적서 관리" href="/dashboard/quotations" />
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            시스템
          </div>
          <SidebarItem icon={<Settings size={20} />} label="설정" href="/dashboard/settings" />
          <SidebarItem icon={<Briefcase size={20} />} label="부서/사번 관리" href="/dashboard/settings/departments" />
        </nav>

        {/* AI Partner Section */}
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100/50 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl border-2 border-white shadow-md overflow-hidden bg-slate-200">
                <img 
                  src="/persona/jimin.png" 
                  alt="Jimin - AI Partner" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-green-100 transition-all"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-indigo-700 tracking-tight">AI PARTNER</span>
                <span className="text-[10px] py-0.5 px-1.5 bg-indigo-600 text-white rounded-md font-black animate-pulse">LIVE</span>
              </div>
              <p className="text-sm font-black text-slate-800 leading-tight mt-0.5">지민 (Jimin)</p>
              <p className="text-[10px] text-indigo-600/70 font-bold uppercase tracking-wider">Manager</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden text-indigo-500">
             <UserIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{profile?.full_name || "사용자"}</p>
            <p className="text-xs text-slate-500 truncate font-black text-indigo-500 uppercase tracking-tighter">
              {profile?.erp_departments?.name?.split('(')[0] || profile?.role || "직원"}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-[60] shadow-sm relative">
          <h1 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
            <span className="text-indigo-600">NEXO</span> Intelligence <ChevronRight size={14} className="text-slate-300" /> <span className="text-slate-400">{companyName} Ops</span>
          </h1>
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <NotificationSystem companyId={profile?.company_id} userRole={profile?.role} />
            
            <div className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              시스템 정상
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active 
          ? "bg-blue-50 text-blue-600 shadow-sm border border-blue-100" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      }`}
    >
      <span className={active ? "text-blue-600" : "text-slate-400"}>{icon}</span>
      {label}
    </Link>
  );
}

function NotificationSystem({ companyId, userRole }: { companyId?: string, userRole?: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreads, setUnreads] = useState(0);

  const fetchNotifs = async () => {
    try {
      if (!companyId) return;
      const { data, error } = await supabase
        .from("erp_notifications")
        .select("*")
        .eq("company_id", companyId)
        .or(`target_role.eq.${userRole},target_role.eq.all,target_role.eq.owner`)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      if (data) {
        setNotifications(data);
        setUnreads(data.filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.warn("Notifications table not found yet. Please run the SQL setup.");
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifs();
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('erp_notifications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'erp_notifications',
        filter: `company_id=eq.${companyId}` 
      }, (payload) => {
        // Simple role check (client side)
        const newNotif = payload.new;
        if (newNotif.target_role === 'all' || newNotif.target_role === userRole || userRole === 'owner') {
          setNotifications(prev => [newNotif, ...prev].slice(0, 10));
          setUnreads(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [companyId, userRole]);

  const markAllAsRead = async () => {
    if (!companyId) return;
    await supabase
      .from("erp_notifications")
      .update({ is_read: true })
      .eq("company_id", companyId)
      .or(`target_role.eq.${userRole},target_role.eq.all,target_role.eq.owner`);
    
    setUnreads(0);
    fetchNotifs();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={14} className="text-amber-500" />;
      case 'quotation': return <FileText size={14} className="text-indigo-500" />;
      default: return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) setUnreads(0); }}
        className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <Bell size={20} />
        {unreads > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
            {unreads}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-4 w-80 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[100] overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Notifications</span>
                <button onClick={markAllAsRead} className="text-[9px] font-black text-indigo-600 uppercase hover:underline">Mark all as read</button>
              </div>
              <div className="max-h-96 overflow-y-auto flex flex-col bg-white divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-300 text-xs font-bold italic bg-white">No recent alerts</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors relative bg-white block w-full ${!n.is_read ? 'bg-indigo-50/10' : ''}`}>
                      <div className="mt-1 shrink-0">{getTypeIcon(n.type)}</div>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <p className="text-xs font-black text-slate-800 leading-normal mb-0.5 break-all block">{n.title}</p>
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed break-words block">{n.message}</p>
                        <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase block">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
