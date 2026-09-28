import React from 'react';
import { useApp } from '../context/AppContext';
import { Battery, Wifi, Signal } from 'lucide-react';

export default function DeviceFrame({ children }) {
  const { deviceView } = useApp();

  if (deviceView === 'desktop') {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  const isTablet = deviceView === 'tablet';

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-0 sm:p-4 md:p-8">
      
      {/* Smartphone or Tablet Frame */}
      <div
        className={`w-full bg-slate-100 shadow-2xl relative overflow-hidden transition-all duration-300 ${
          isTablet
            ? 'max-w-2xl rounded-3xl border-8 border-slate-800 min-h-[90vh]'
            : 'max-w-[420px] rounded-[40px] border-[10px] border-slate-800 min-h-[850px] shadow-black/80'
        }`}
      >
        {/* Android Punch-hole Camera & Speaker Earpiece */}
        {!isTablet && (
          <div className="sticky top-0 z-50 bg-navy-950 px-6 py-1.5 flex items-center justify-between text-white text-[11px] font-semibold border-b border-navy-900 select-none">
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            
            {/* Center Front Camera Hole */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800/80 shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/70" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Inner Content Viewport */}
        <div className="overflow-y-auto max-h-[85vh] sm:max-h-[800px]">
          {children}
        </div>

        {/* Android Gesture Bar */}
        {!isTablet && (
          <div className="absolute bottom-1 left-0 right-0 h-3 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-1 bg-slate-400/80 rounded-full" />
          </div>
        )}

      </div>

    </div>
  );
}
