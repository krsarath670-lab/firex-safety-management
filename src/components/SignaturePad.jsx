import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, User, Briefcase } from 'lucide-react';

export default function SignaturePad({
  title = "Customer Representative Signature",
  initialName = "",
  initialDesignation = "",
  onSave,
  onCancel
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [repName, setRepName] = useState(initialName);
  const [designation, setDesignation] = useState(initialDesignation);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Scale for crisp high-DPI display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = '#0F1E36';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave({
      signatureDataUrl: hasDrawn ? dataUrl : null,
      repName,
      designation,
      signedDate: new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-slate-200 max-w-md w-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-blue-600" />
          <span>{title}</span>
        </h3>
        {onCancel && (
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
            ✕
          </button>
        )}
      </div>

      <div className="mt-3.5 space-y-3 text-xs">
        
        {/* Name Input */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Signatory Name *</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Eng. Omar Farooq"
            value={repName}
            onChange={(e) => setRepName(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
          />
        </div>

        {/* Designation Input */}
        <div>
          <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Designation / Authority *</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Director of Facilities & Life Safety"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white text-xs"
          />
        </div>

        {/* Interactive Canvas Drawing Pad */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-slate-700">Digital Touch Signature</label>
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden relative touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 cursor-crosshair block"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-semibold">
                Sign here with finger or stylus
              </div>
            )}
            <div className="absolute bottom-1 right-2 pointer-events-none text-[9px] text-slate-400 font-mono">
              Date: {new Date().toISOString().slice(0, 10)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-xs"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn && !repName}
            className="flex-1 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Confirm &amp; Embed Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
}
