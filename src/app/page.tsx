"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Users, 
  Globe, 
  Sparkles,
  ChevronRight,
  Database,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      {/* 배경 장식 (필요 시 수정 가능) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-[20%] right-[30%] w-2 h-2 bg-white rounded-full animate-ping"></div>
      </div>

      {/* 네비게이션 바 */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-sm sticky top-0">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <span className="font-black text-2xl italic tracking-tighter text-white">N</span>
          </div>
          <span className="text-2xl font-black tracking-tighter">NEXO <span className="text-indigo-400 font-light">ERP</span></span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <NavLink href="#features">주요 기능</NavLink>
          <NavLink href="#ai-partner">AI 파트너</NavLink>
          <NavLink href="#enterprise">엔터프라이즈</NavLink>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">로그인</Link>
          <Link href="/signup" className="px-6 py-2.5 bg-white text-slate-950 text-sm font-black rounded-full hover:bg-indigo-50 transition-all shadow-lg active:scale-95">
            지금 시작하기
          </Link>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative z-10 pt-20 pb-32 px-8 max-w-7xl mx-auto text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">차세대 지능형 ERP 통합 솔루션</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-500 text-nowrap">
            더 똑똑하게,<br />
            더 강력하게.
          </motion.h1>
          
          <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
            회사의 모든 흐름을 한눈에 파악하고, AI 파트너 지민과 함께 최적의 의사결정을 내리세요.<br />
            NEXO ERP는 단순한 관리 도구를 넘어 당신의 비즈니스 엔진이 됩니다.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-6 pt-6">
            <Link href="/signup" className="group px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl flex items-center gap-3 shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
              무료로 시작하기 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-10 py-5 bg-slate-900 border border-slate-800 text-white font-black rounded-2xl hover:bg-slate-800 transition-all">
              데모 버전 둘러보기
            </Link>
          </motion.div>
        </motion.div>

        {/* 대시보드 프리뷰 이미지 영역 */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-24 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full scale-75 opacity-50"></div>
          <div className="relative group overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <div className="h-10 bg-slate-900/80 border-b border-white/5 flex items-center px-6 gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
               <div className="mx-auto text-[10px] font-black tracking-widest text-slate-500 uppercase">NEXO ERP Dashboard System</div>
            </div>
            <img 
              src="/dashboard-preview.png" 
              alt="NEXO ERP 통합 대시보드 미리보기" 
              className="w-full opacity-90 group-hover:scale-[1.01] transition-transform duration-700"
            />
          </div>
        </motion.div>
      </section>

      {/* 핵심 모듈 섹션 */}
      <section id="features" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em]">Core Modules</h2>
          <p className="text-4xl md:text-5xl font-black tracking-tighter">비즈니스 성공을 위한 올인원 솔루션</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<BarChart3 size={32} />}
            title="회계 및 자금 관리"
            desc="실시간 지출 결재부터 투명한 자금 흐름 분석까지, 사장님의 금고를 스마트하게 관리합니다."
            color="indigo"
          />
          <FeatureCard 
            icon={<Users size={32} />}
            title="인사 및 조직 설계"
            desc="임직원의 근태, 연차, 권한 설정을 자동화하여 가장 효율적인 팀 운영 환경을 제공합니다."
            color="cyan"
          />
          <FeatureCard 
            icon={<Database size={32} />}
            title="재고 및 자동화 물류"
            desc="지능형 재고 추적과 부족량 자동 알림 시스템으로 비즈니스 기회를 놓치지 마세요."
            color="emerald"
          />
        </div>
      </section>

      {/* AI 파트너 섹션 */}
      <section id="ai-partner" className="py-32 px-8 bg-slate-900/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="w-full md:w-1/2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white animate-bounce"><Cpu size={24} /></div>
              <h3 className="text-xl font-black text-indigo-400 tracking-tight">AI 파트너: 지민 (Jimin)</h3>
            </div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
              회사의 성장을 돕는<br />
              지능형 전담 매니저.
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              더 이상 복잡한 데이터를 직접 분석하지 마세요. <br />
              지민이가 실시간 지표 분석과 자동 로직을 통해 24시간 대표님의 비즈니스를 서포트합니다.
            </p>
            <div className="space-y-4">
              <CheckItem text="실시간 이상 지출 감지 및 즉각 알림" />
              <CheckItem text="부서별 예산 최적화 자동 제안" />
              <CheckItem text="데이터 기반 차세대 비즈니스 리포팅" />
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative group">
             <div className="absolute inset-0 bg-indigo-600/30 rounded-[50px] rotate-3 blur-2xl group-hover:rotate-6 transition-transform"></div>
             <div className="relative rounded-[50px] overflow-hidden border-4 border-slate-800 shadow-2xl">
                <img 
                  src="/persona/jimin.png" 
                  alt="AI 파트너 지민 (Jimin)" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-1000"
                />
                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
                  <p className="text-2xl font-black italic text-white leading-tight">"대표님의 비즈니스가 최고의 정점에 오를 때까지, 제가 곁에서 끝까지 함께할게요."</p>
                  <p className="text-sm text-indigo-400 font-black mt-4 uppercase tracking-[0.2em]">— NEXO AI Manager: 지민 (Jimin)</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 보안 및 확장성 섹션 */}
      <section id="enterprise" className="py-32 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="p-12 bg-white/5 border border-white/10 rounded-[44px] space-y-6 hover:bg-white/10 transition-colors group">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform"><ShieldCheck size={32} /></div>
            <h3 className="text-3xl font-black">엔터프라이즈급 보안</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              최고 수준의 데이터 암호화와 사번 기반 인증 시스템으로 기업의 자산을 완벽하게 보호합니다. 
              정밀한 권한 제어(RBAC)를 통해 부서별 접근 범위를 완벽하게 분리합니다.
            </p>
          </div>
          <div className="p-12 bg-white/5 border border-white/10 rounded-[44px] space-y-6 hover:bg-white/10 transition-colors group">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform"><Globe size={32} /></div>
            <h3 className="text-3xl font-black">무한한 확장성</h3>
            <p className="text-slate-400 font-medium leading-relaxed">
              비즈니스 규모에 따라 유연하게 확장 가능한 Supabase 기반 아키텍처를 제공합니다. 
              수천 명의 조직원도 동시에 안정적으로 수용할 수 있는 강력한 인프라를 경험하세요.
            </p>
          </div>
        </div>
      </section>

      {/* 푸터 섹션 */}
      <footer className="py-20 px-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black mb-2 tracking-tighter text-white">NEXO ERP.</h2>
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Future of Business Management.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/signup" className="px-8 py-3.5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">Get Started</Link>
          </div>
          <p className="text-slate-600 text-sm font-bold">© 2026 NEXO. 모든 권리는 건노 대표님께 있습니다.</p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-bold text-slate-400 hover:text-white transition-all hover:translate-y-[-1px]">
      {children}
    </Link>
  );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  const colorClasses: Record<string, string> = {
    indigo: "from-indigo-500/20 to-indigo-600/5 group-hover:shadow-indigo-500/10",
    cyan: "from-cyan-500/20 to-cyan-600/5 group-hover:shadow-cyan-500/10",
    emerald: "from-emerald-500/20 to-emerald-600/5 group-hover:shadow-emerald-500/10",
  };
  
  return (
    <div className={`group p-10 bg-gradient-to-br ${colorClasses[color]} border border-white/10 rounded-[44px] hover:translate-y-[-8px] transition-all duration-500 shadow-2xl`}>
      <div className="mb-6 text-white group-hover:scale-110 transition-transform origin-left">{icon}</div>
      <h3 className="text-2xl font-black mb-4">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
      <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase text-white/40 group-hover:text-white transition-colors cursor-pointer">
        모듈 알아보기 <ChevronRight size={14} />
      </div>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
        <Zap size={12} fill="currentColor" />
      </div>
      <span className="text-sm font-bold text-slate-300">{text}</span>
    </div>
  );
}
