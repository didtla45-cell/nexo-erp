"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { X, Camera, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

export default function Scanner({ onScan, onClose, title = "스마트 바코드 스캐너" }: ScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Handling SSR: Component only mounts on client
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    const scanner = new Html5QrcodeScanner("reader", config, false);
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        // Clean up after success or keep scanning based on requirements
        // scanner.clear(); 
      },
      (errorMessage) => {
        // We usually don't want to show every frame error
        // console.warn(errorMessage);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner cleanup error:", err));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }} 
        className="relative bg-white w-full max-w-sm rounded-[44px] overflow-hidden shadow-2xl z-10"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Jimin Vision AI</span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-red-500 rounded-full flex items-center justify-center transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-square bg-slate-900 overflow-hidden">
          <div id="reader" className="w-full h-full" />
          
          {/* Overlay Decorations */}
          <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-indigo-400/50 rounded-3xl">
             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>
             <motion.div 
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
             />
          </div>
        </div>

        <div className="p-8 bg-slate-50 flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
            <Camera size={18} />
            카메라를 바코드에 맞춰주세요
          </div>
          <p className="text-xs text-slate-400 font-medium">
            일반 바코드 및 NEXO 전용 QR 코드를 모두 인식합니다.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
