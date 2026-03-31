"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Package, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  AlertTriangle, 
  Search, 
  MoreVertical,
  ChevronRight,
  Info,
  X,
  RefreshCw,
  Box,
  Truck,
  History,
  Trash2,
  Edit2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type InventoryItem = {
  id: string;
  company_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  description: string | null;
  unit_price: number;
  min_stock_level: number;
  target_stock_level: number;
  current_stock: number;
  created_at: string;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [stockType, setStockType] = useState<"in" | "out">("in");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [recentTxCount, setRecentTxCount] = useState(0);

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
      const { data } = await supabase
        .from("erp_inventory_items")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });
      
      if (data) setItems(data);

      const today = new Date();
      today.setHours(today.getHours() - 24);
      const { count } = await supabase
        .from("erp_inventory_transactions")
        .select("*", { count: 'exact', head: true })
        .eq("company_id", profile.company_id)
        .gte("created_at", today.toISOString());
      
      setRecentTxCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalValue = items.reduce((acc: number, curr: InventoryItem) => acc + (curr.unit_price * curr.current_stock), 0);
  const lowStockItems = items.filter((item: InventoryItem) => item.current_stock <= item.min_stock_level).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm border border-white/50 px-6 py-3 rounded-3xl w-fit shadow-sm">
          <div className="p-2 bg-indigo-600 rounded-xl text-white"><Package size={18} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Management</p>
            <p className="text-xs font-black text-slate-700 tracking-tight">지능형 자산 및 재고 관리</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-8 py-3.5 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} /> 물품 등록
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="전체 물품 종류" value={items.length.toString()} icon={<Box className="text-indigo-500" />} sub="보관 중인 물품" />
        <StatCard label="재고 부족 알림" value={lowStockItems.toString()} icon={<AlertTriangle className="text-amber-500" />} sub="안전 재고 미달" highlight={lowStockItems > 0} />
        <StatCard label="재고 자산 가치" value={`₩${(totalValue / 10000).toFixed(1)}만`} icon={<Truck className="text-blue-500" />} sub="전체 재고 평가액" />
        <StatCard 
          label="최근 입출고" 
          value={`${recentTxCount}건`} 
          icon={<History className="text-emerald-500" />} 
          sub="최근 24시간 기준" 
          onClick={() => setIsHistoryModalOpen(true)}
        />
      </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="물품명, SKU, 카테고리 검색..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><RefreshCw className="animate-spin mx-auto text-indigo-400 mb-4" /> <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Inventory...</p></div>
        ) : items.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[32px]">등록된 재고가 없습니다.</div>
        ) : (
          items.map(item => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[44px] border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden"
            >
              {item.current_stock <= item.min_stock_level && (
                <div className="absolute top-0 right-0 p-2 bg-amber-500 text-white rounded-bl-3xl">
                  <AlertTriangle size={14} />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 tracking-tight">{item.name}</h3>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category || "General"}</p>
                      <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                        등록: {new Date(item.created_at).toLocaleString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                  <AnimatePresence>
                    {activeMenuId === item.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute right-0 top-12 w-40 bg-white border border-slate-100 rounded-3xl shadow-2xl z-20 flex flex-col p-2 overflow-hidden"
                      >
                        <button 
                          onClick={() => { setSelectedItem(item); setIsEditModalOpen(true); setActiveMenuId(null); }}
                          className="flex items-center gap-3 p-3 text-xs font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all"
                        >
                          <Edit2 size={16} /> 수정하기
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item); setIsDeleteModalOpen(true); setActiveMenuId(null); }}
                          className="flex items-center gap-3 p-3 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                        >
                          <Trash2 size={16} /> 삭제하기
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">현재 재고</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${item.current_stock <= item.min_stock_level ? 'text-amber-500' : 'text-slate-800'}`}>{item.current_stock}</span>
                    <span className="text-xs font-bold text-slate-400">개</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      item.current_stock <= item.min_stock_level 
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' 
                        : item.current_stock >= (item.target_stock_level || 100)
                          ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                          : 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
                    }`} 
                    style={{ width: `${Math.min(100, (item.current_stock / (item.target_stock_level || 100)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => { setSelectedItem(item); setStockType("in"); setIsStockModalOpen(true); }}
                  className="flex-1 py-3 bg-emerald-50 text-emerald-600 text-xs font-black rounded-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <ArrowUpCircle size={16} /> 입고
                </button>
                <button 
                  onClick={() => { setSelectedItem(item); setStockType("out"); setIsStockModalOpen(true); }}
                  className="flex-1 py-3 bg-rose-50 text-rose-600 text-xs font-black rounded-2xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <ArrowDownCircle size={16} /> 출고
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && <AddItemModal companyId={companyId} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); fetchData(); }} />}
        {isEditModalOpen && selectedItem && <EditItemModal item={selectedItem} onClose={() => setIsEditModalOpen(false)} onSuccess={() => { setIsEditModalOpen(false); fetchData(); }} />}
        {isDeleteModalOpen && selectedItem && <DeleteModal item={selectedItem} onClose={() => setIsDeleteModalOpen(false)} onSuccess={() => { setIsDeleteModalOpen(false); fetchData(); }} />}
        {isStockModalOpen && selectedItem && <StockModal item={selectedItem} type={stockType} onClose={() => setIsStockModalOpen(false)} onSuccess={() => { setIsStockModalOpen(false); fetchData(); }} />}
        {isHistoryModalOpen && companyId && <HistoryModal companyId={companyId} onClose={() => setIsHistoryModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, sub, highlight, onClick }: { label: string, value: string, icon: React.ReactNode, sub?: string, highlight?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`p-8 rounded-[44px] border shadow-xl shadow-slate-200/40 flex flex-col gap-4 transition-all ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''} ${highlight ? 'bg-amber-500 border-amber-400 text-white' : 'bg-white border-slate-100 text-indigo-900 group'}`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-3xl ${highlight ? 'bg-white/20' : 'bg-slate-50'}`}>{icon}</div>
        <Info size={16} className={highlight ? 'text-white/40' : 'text-slate-200'} />
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-widest mb-1 ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
        <p className="text-4xl font-black tracking-tighter">{value}</p>
        {sub && <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${highlight ? 'text-white/40' : 'text-slate-300'}`}>{sub}</p>}
      </div>
    </div>
  );
}

function AddItemModal({ companyId, onClose, onSuccess }: { companyId: string | null, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ 
    name: "", 
    category: "Office", 
    sku: "", 
    unit_price: "", 
    min_stock_level: "10", 
    current_stock: "0",
    target_stock_level: "100"
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("erp_inventory_items").insert([{
      company_id: companyId,
      name: formData.name,
      category: formData.category,
      sku: formData.sku,
      unit_price: Number(formData.unit_price),
      min_stock_level: Number(formData.min_stock_level),
      target_stock_level: Number(formData.target_stock_level),
      current_stock: Number(formData.current_stock)
    }]);
    if (!error) onSuccess(); else alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-slate-800 tracking-tight">새 물품 등록</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">물품 이름</label><input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="예: 맥북 프로 14인치" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">카테고리</label><select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Office</option><option>IT Devices</option><option>Furniture</option><option>Supplies</option></select></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">SKU / 모델번호</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="MBP-14-2024" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">단가 (₩)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" placeholder="0" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">초기 재고량</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.current_stock} onChange={e => setFormData({...formData, current_stock: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">안전 재고량 (부족 알림)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.min_stock_level} onChange={e => setFormData({...formData, min_stock_level: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">목표 재고량 (게이지 기준)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.target_stock_level} onChange={e => setFormData({...formData, target_stock_level: e.target.value})} /></div>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20">{submitting ? '등록 중...' : '물품 등록 완료'}</button>
        </form>
      </motion.div>
    </div>
  );
}

function EditItemModal({ item, onClose, onSuccess }: { item: InventoryItem, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ 
    name: item.name, 
    category: item.category || "Office", 
    sku: item.sku || "", 
    unit_price: item.unit_price.toString(), 
    min_stock_level: item.min_stock_level.toString(),
    current_stock: item.current_stock.toString(),
    target_stock_level: item.target_stock_level?.toString() || "100"
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("erp_inventory_items")
      .update({
        name: formData.name,
        category: formData.category,
        sku: formData.sku,
        unit_price: Number(formData.unit_price),
        min_stock_level: Number(formData.min_stock_level),
        target_stock_level: Number(formData.target_stock_level),
        current_stock: Number(formData.current_stock)
      })
      .eq("id", item.id);
    
    if (!error) onSuccess(); else alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-slate-800 tracking-tight">물품 정보 수정</h2><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">물품 이름</label><input required className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">카테고리</label><select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Office</option><option>IT Devices</option><option>Furniture</option><option>Supplies</option></select></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">SKU / 모델번호</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">단가 (₩)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">현재 재고량</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.current_stock} onChange={e => setFormData({...formData, current_stock: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">안전 재고량 (부족 알림)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.min_stock_level} onChange={e => setFormData({...formData, min_stock_level: e.target.value})} /></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">목표 재고량 (게이지 기준)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={formData.target_stock_level} onChange={e => setFormData({...formData, target_stock_level: e.target.value})} /></div>
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-indigo-600/20">{submitting ? '저장 중...' : '수정 사항 저장'}</button>
        </form>
      </motion.div>
    </div>
  );
}

function DeleteModal({ item, onClose, onSuccess }: { item: InventoryItem, onClose: () => void, onSuccess: () => void }) {
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("erp_inventory_items").delete().eq("id", item.id);
    if (!error) onSuccess(); else alert(error.message);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-sm rounded-[44px] p-10 shadow-2xl z-10 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">물품을 삭제할까요?</h2>
        <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">'{item.name}' 물품을 삭제하시면 재고 데이터 및 입출고 내역이 모두 사라집니다.</p>
        <div className="flex flex-col gap-3">
          <button onClick={handleDelete} disabled={submitting} className="w-full py-4 bg-rose-500 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl shadow-rose-500/20">{submitting ? '삭제 중...' : '네, 삭제하겠습니다'}</button>
          <button onClick={onClose} className="w-full py-4 bg-slate-50 text-slate-400 font-black rounded-2xl text-xs tracking-widest uppercase">아니오, 취소할게요</button>
        </div>
      </motion.div>
    </div>
  );
}

function StockModal({ item, type, onClose, onSuccess }: { item: InventoryItem, type: "in" | "out", onClose: () => void, onSuccess: () => void }) {
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const qty = Number(quantity);
    const newStock = type === "in" ? item.current_stock + qty : item.current_stock - qty;

    if (type === "out" && newStock < 0) {
      alert("출고 수량이 현재 재고보다 많을 수 없습니다.");
      setSubmitting(false);
      return;
    }

    const { error: txError } = await supabase.from("erp_inventory_transactions").insert([{
      company_id: item.company_id,
      item_id: item.id,
      user_id: user?.id,
      type: type,
      quantity: qty,
      reason: reason
    }]);

    if (!txError) {
      const { error: itemError } = await supabase.from("erp_inventory_items").update({ current_stock: newStock }).eq("id", item.id);
      if (!itemError) onSuccess(); else alert(itemError.message);
    } else {
      alert(txError.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-lg rounded-[44px] p-12 shadow-2xl z-10">
        <div className="flex justify-between items-center mb-10"><div className="flex items-center gap-4"><div className={`p-3 rounded-2xl shadow-sm ${type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{type === 'in' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}</div><h2 className="text-2xl font-black text-slate-800 tracking-tight">재고 {type === 'in' ? '입고' : '출고'} 처리</h2></div><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button></div>
        <div className="mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">선택된 물품</p><p className="font-black text-lg text-slate-800">{item.name}</p></div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{type === 'in' ? '입고' : '출고'} 수량</label><input required type="number" min="1" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-2xl border-none outline-none" value={quantity} onChange={e => setQuantity(e.target.value)} /></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">사유 / 메모</label><textarea rows={3} className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none resize-none" placeholder="입출고 사유를 입력해 주세요." value={reason} onChange={e => setReason(e.target.value)} /></div>
          </div>
          <button type="submit" disabled={submitting} className={`w-full py-5 text-white font-black rounded-2xl text-xs tracking-widest uppercase shadow-xl transition-all ${type === 'in' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-rose-600 shadow-rose-600/20'}`}>{submitting ? '처리 중...' : `재고 ${type === 'in' ? '입고' : '출고'} 확정`}</button>
        </form>
      </motion.div>
    </div>
  );
}

function HistoryModal({ companyId, onClose }: { companyId: string, onClose: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from("erp_inventory_transactions")
        .select(`
          *,
          item:erp_inventory_items(name, category, sku, unit_price),
          profile:erp_profiles(full_name)
        `)
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [companyId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-[44px] p-12 shadow-2xl z-10 flex flex-col max-h-[80vh] overflow-hidden">
        
        <AnimatePresence mode="wait">
          {!selectedTx ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">최근 입출고 내역</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {loading ? (
                  <div className="py-20 text-center"><RefreshCw className="animate-spin mx-auto text-indigo-400" /></div>
                ) : history.length === 0 ? (
                  <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">내역이 없습니다.</div>
                ) : (
                  history.map(tx => (
                    <div 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${tx.type === 'in' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                          {tx.type === 'in' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{tx.item?.name || "삭제된 품목"}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {new Date(tx.created_at).toLocaleString()} · {tx.reason || "사유 없음"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-lg font-black ${tx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'in' ? '+' : '-'}{tx.quantity}개
                          </p>
                        </div>
                        <ChevronRight className="text-slate-200 group-hover:text-indigo-600 transition-colors" size={20} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <div className="flex items-center gap-4 mb-10">
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all"
                >
                  <ChevronRight className="rotate-180" size={20} />
                </button>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">상세 정보</h2>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                {/* Status Banner */}
                <div className={`p-8 rounded-[38px] flex items-center justify-between ${selectedTx.type === 'in' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-rose-600 text-white shadow-xl shadow-rose-600/20'}`}>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Transaction Type</p>
                    <p className="text-4xl font-black">{selectedTx.type === 'in' ? '입고' : '출고'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Quantity Change</p>
                    <p className="text-4xl font-black">{selectedTx.type === 'in' ? '+' : '-'}{selectedTx.quantity}개</p>
                  </div>
                </div>

                {/* Item & Processor Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">물품명</p>
                    <p className="font-black text-slate-800">{selectedTx.item?.name || "N/A"}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">{selectedTx.item?.category} · {selectedTx.item?.sku}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">처리 담당자</p>
                    <p className="font-black text-slate-800">{selectedTx.profile?.full_name || "매니저"}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">NEXO ERP Team</p>
                  </div>
                </div>

                {/* Date & Reason */}
                <div className="space-y-6">
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">거래 일시</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><History size={16} /></div>
                      <p className="font-black text-slate-700">
                        {new Date(selectedTx.created_at).toLocaleString('ko-KR', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-white border border-slate-100 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">상세 사유 / 비고</p>
                    <div className="p-4 bg-slate-50 rounded-2xl italic text-slate-600 font-bold leading-relaxed">
                      "{selectedTx.reason || "기록된 사유가 없습니다."}"
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50 rounded-[32px] border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
                    <Box size={14} /> Item Valuation
                  </div>
                  <p className="font-black text-indigo-900">₩{((selectedTx.item?.unit_price || 0) * selectedTx.quantity).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
