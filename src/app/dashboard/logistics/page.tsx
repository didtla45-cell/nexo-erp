"use client";

import React, { useState, useEffect } from "react";
import { 
  Truck, 
  Warehouse, 
  MapPin, 
  Navigation, 
  Package, 
  Search, 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type WarehouseData = {
  id: string;
  name: string;
  location: string;
  capacity: number;
  manager_name: string;
};

type LogisticsOrder = {
  id: string;
  tracking_number: string;
  courier_company: string;
  status: string;
  destination: string;
  created_at: string;
  item_name?: string;
};

export default function LogisticsDashboard() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [orders, setOrders] = useState<LogisticsOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isAddWhOpen, setIsAddWhOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LogisticsOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      
      // Fetch Warehouses
      const { data: whData } = await supabase
        .from("erp_warehouses")
        .select("*")
        .eq("company_id", profile.company_id);
      if (whData) setWarehouses(whData);

      // Fetch Logistics Orders
      const { data: logData } = await supabase
        .from("erp_logistics_orders")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });
      if (logData) setOrders(logData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl border border-white/60 p-10 rounded-[48px] shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
            <Truck size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">지능형 물류 시스템</h1>
            <p className="text-slate-500 font-bold flex items-center gap-2">
              <Navigation size={16} className="text-indigo-500" /> 
              다중 창고 관리 및 실시간 배송 관제
            </p>
          </div>
        </div>
          <button 
            onClick={() => setIsAddWhOpen(true)}
            className="px-8 py-5 bg-white text-indigo-600 font-black rounded-[24px] border border-indigo-100/50 shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Warehouse size={20} /> 창고 추가
          </button>
          <button 
            onClick={() => setIsTransferOpen(true)}
            className="px-8 py-5 bg-indigo-600 text-white font-black rounded-[24px] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Navigation size={20} /> 재고 이동
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Warehouse List */}
        <div className="lg:col-span-1 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <MapPin size={24} className="text-indigo-500" /> 창고 현황
            </h2>
            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">
              {warehouses.length} Active
            </span>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-slate-300" /></div>
            ) : warehouses.length === 0 ? (
              <div className="bg-white p-10 rounded-[38px] border-2 border-dashed border-slate-100 text-center text-slate-300 font-black uppercase tracking-widest">
                등록된 창고가 없습니다.
              </div>
            ) : (
              warehouses.map(wh => (
                <motion.div 
                  key={wh.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-[38px] border border-slate-100 shadow-xl shadow-slate-200/40 relative group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <Warehouse size={24} />
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600"><MoreVertical size={20} /></button>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">{wh.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mb-6">{wh.location}</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">저장 용량</p>
                      <p className="text-xs font-black text-slate-700">65% Used</p>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[65%]" />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Tracking & Shipments */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <Truck size={24} className="text-emerald-500" /> 실시간 배송 관제
            </h2>
          </div>

          <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  placeholder="송장 번호, 보낼 곳 검색..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl text-sm font-bold outline-none shadow-sm placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {loading ? (
                <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-indigo-400" /></div>
              ) : orders.filter(o => 
                  o.tracking_number.includes(searchQuery) || 
                  o.destination.includes(searchQuery) ||
                  o.courier_company.includes(searchQuery)
                ).length === 0 ? (
                <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest bg-white">
                  검색 결과가 없습니다.
                </div>
              ) : (
                orders.filter(o => 
                  o.tracking_number.includes(searchQuery) || 
                  o.destination.includes(searchQuery) ||
                  o.courier_company.includes(searchQuery)
                ).map(order => (
                  <div 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="p-8 hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 
                        order.status === 'shipping' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {order.status === 'delivered' ? <CheckCircle2 size={24} /> : 
                         order.status === 'pending' ? <Clock size={24} /> : <Truck size={24} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{order.courier_company}</p>
                          <span className="text-[10px] font-black text-slate-400">·</span>
                          <p className="text-[10px] font-black text-slate-500 tracking-widest">{order.tracking_number}</p>
                        </div>
                        <p className="text-xs font-bold text-slate-400">목적지: {order.destination}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                       <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                          order.status === 'shipping' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {order.status === 'delivered' ? '배송 완료' : 
                           order.status === 'shipping' ? '배송 중' : '집하 대기'}
                        </span>
                        <p className="text-[10px] font-bold text-slate-300 mt-2 uppercase tracking-widest">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="p-3 bg-slate-50 text-slate-200 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-8 bg-slate-50/50 flex items-center justify-center">
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                모든 배송 내역 보기
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <AnimatePresence>
        {isAddWhOpen && (
          <AddWarehouseModal 
            companyId={companyId} 
            onClose={() => setIsAddWhOpen(false)} 
            onSuccess={() => { setIsAddWhOpen(false); fetchData(); }} 
          />
        )}
        {isTransferOpen && (
          <TransferStockModal 
            companyId={companyId} 
            warehouses={warehouses}
            onClose={() => setIsTransferOpen(false)} 
            onSuccess={() => { setIsTransferOpen(false); fetchData(); }} 
          />
        )}
        {selectedOrder && (
          <TrackingModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TrackingModal({ order, onClose }: { order: LogisticsOrder, onClose: () => void }) {
  const steps = [
    { status: '배송 예약', time: '2026-04-18 10:00', desc: '집하 예약 신청이 완료되었습니다.', icon: <Clock size={16} />, done: true },
    { status: '상품 인수', time: '2026-04-18 14:30', desc: '택배사에서 상품을 인수하였습니다. (인천 Hub)', icon: <Package size={16} />, done: true },
    { status: '배송 중', time: '2026-04-19 09:00', desc: '고객님께 배송 예정입니다. (기사: 김넥소)', icon: <Truck size={16} />, done: order.status !== 'pending' },
    { status: '배송 완료', time: '-', desc: '소중한 상품이 고객님께 전달되었습니다.', icon: <CheckCircle2 size={16} />, done: order.status === 'delivered' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-xl rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Truck size={24} /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">실시간 배송 추적</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{order.courier_company} · {order.tracking_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="space-y-10 relative">
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-100 -z-10" />
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 relative">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm z-10 transition-colors ${
                step.done ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-white border border-slate-100 text-slate-300'
              }`}>
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className={`font-black tracking-tight ${step.done ? 'text-slate-800' : 'text-slate-300'}`}>{step.status}</p>
                  <span className="text-[10px] font-bold text-slate-300 tracking-widest">{step.time}</span>
                </div>
                <p className={`text-xs font-bold leading-relaxed ${step.done ? 'text-slate-500' : 'text-slate-200'}`}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <MapPin size={18} className="text-indigo-400" />
             <p className="text-xs font-black text-slate-800">목적지: {order.destination}</p>
          </div>
          <button className="text-xs font-black text-indigo-600 hover:underline">상세 정보 더보기</button>
        </div>
      </motion.div>
    </div>
  );
}

function AddWarehouseModal({ companyId, onClose, onSuccess }: { companyId: string | null, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: "", location: "", manager_name: "", capacity: "1000" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("erp_warehouses").insert([{
      company_id: companyId,
      ...formData,
      capacity: Number(formData.capacity)
    }]);
    if (!error) onSuccess(); else alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black text-slate-800 tracking-tight">창고 정보 등록</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">창고 명칭</label><input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="예: 인천 메인 물류센터" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">소재지 (주소)</label><input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="부산광역시 영도구..." value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">담당자 성함</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="강물류 팀장" value={formData.manager_name} onChange={e => setFormData({...formData, manager_name: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">수용 가능 용량 (개)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} /></div>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20">{submitting ? '등록 중...' : '창고 등록 완료'}</button>
        </form>
      </motion.div>
    </div>
  );
}

function TransferStockModal({ companyId, warehouses, onClose, onSuccess }: { companyId: string | null, warehouses: WarehouseData[], onClose: () => void, onSuccess: () => void }) {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [formData, setFormData] = useState({ item_id: "", from_wh: "", to_wh: "", quantity: "1", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (companyId) {
      supabase.from("erp_inventory_items").select("id, name, sku, current_stock").eq("company_id", companyId).then(({ data }) => {
        if (data) setInventoryItems(data);
      });
    }
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !formData.item_id || !formData.from_wh || !formData.to_wh) return;
    if (formData.from_wh === formData.to_wh) { alert("출발지와 도착지가 같을 수 없습니다."); return; }
    
    setSubmitting(true);
    // Logic: 
    // 1. Check stock in from_wh (this simplified version uses global stock, but in real scenario would beWH-specific)
    // 2. Create Transfer Record
    // (Actual stock adjustment between WH tables omitted for MVP simplicity as per simplified warehouse design)
    
    const { error } = await supabase.from("erp_inventory_transactions").insert([{
      company_id: companyId,
      item_id: formData.item_id,
      type: 'out',
      quantity: Number(formData.quantity),
      reason: `[이동] ${warehouses.find(w => w.id === formData.from_wh)?.name} -> ${warehouses.find(w => w.id === formData.to_wh)?.name}: ${formData.reason}`
    }]);

    const { error: inError } = await supabase.from("erp_inventory_transactions").insert([{
      company_id: companyId,
      item_id: formData.item_id,
      type: 'in',
      quantity: Number(formData.quantity),
      reason: `[이동] ${warehouses.find(w => w.id === formData.from_wh)?.name} -> ${warehouses.find(w => w.id === formData.to_wh)?.name}`
    }]);

    if (!error && !inError) onSuccess(); else alert("이동 처리 중 오류가 발생했습니다.");
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-black text-slate-800 tracking-tight">창고 간 재고 이동</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
             <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">이동 물품 선택</label>
              <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.item_id} onChange={e => setFormData({...formData, item_id: e.target.value})}>
                <option value="">물품을 선택해 주세요</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} ({item.sku}) - 현재 {item.current_stock}개</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">출발 창고</label>
                <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.from_wh} onChange={e => setFormData({...formData, from_wh: e.target.value})}>
                  <option value="">창고 선택</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">도착 창고</label>
                <select required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.to_wh} onChange={e => setFormData({...formData, to_wh: e.target.value})}>
                  <option value="">창고 선택</option>
                  {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">이동 수량</label><input required type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} /></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">이동 사유 / 비고</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="예: 재고 밸런싱" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} /></div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20">{submitting ? '처리 중...' : '재고 이동 확정'}</button>
        </form>
      </motion.div>
    </div>
  );
}
