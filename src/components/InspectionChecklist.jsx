import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, XCircle, MinusCircle, Camera, MessageSquare, 
  Flame, Wrench, Shield, Check, Plus, AlertTriangle, ArrowRight,
  Sparkles, Trash2, Image as ImageIcon
} from 'lucide-react';

const FIRE_ALARM_SECTIONS = [
  {
    title: "1. Fire Alarm Control Panel (FACP)",
    items: [
      { id: "facp_condition", label: "Panel physical condition & cleanliness" },
      { id: "facp_ac_supply", label: "Primary AC main supply (230V) & indicator" },
      { id: "facp_battery", label: "Secondary standby batteries (12V) condition & impedance" },
      { id: "facp_charger", label: "Integral battery charger float voltage & load test" },
      { id: "facp_display", label: "LCD display & LED indicators functional" },
      { id: "facp_faults", label: "FACP fault warning indication & buzzer" },
      { id: "facp_alarms", label: "FACP fire alarm warning indication & strobe" },
      { id: "facp_event_log", label: "Event log memory check & time synchronization" },
      { id: "facp_comms", label: "Communication cards & RS485 network ports" }
    ]
  },
  {
    title: "2. Detection & Notification Devices",
    items: [
      { id: "smoke_detectors", label: "Optical smoke detectors sensitivity & chamber clean" },
      { id: "heat_detectors", label: "Rate-of-rise / fixed temperature heat detectors" },
      { id: "multi_sensor", label: "Multi-sensor optical/thermal criteria detectors" },
      { id: "call_points", label: "Manual call points (MCPs) glass, flag & reset key" },
      { id: "sounders", label: "Audible alarm sounders (min 85 dB(A) at bedhead)" },
      { id: "strobes", label: "Visual alarm xenon/LED beacon strobes" }
    ]
  },
  {
    title: "3. Addressable Modules & Interfacing",
    items: [
      { id: "monitor_modules", label: "Monitor modules (sprinkler flow, tamper switches)" },
      { id: "control_modules", label: "Control modules (AHU trip, elevator grounding)" }
    ]
  },
  {
    title: "4. System Architecture & Civil Defense Transmission",
    items: [
      { id: "loops", label: "Signaling line circuits (Loops) impedance & isolators" },
      { id: "network", label: "Inter-panel network loop ring integrity" },
      { id: "repeaters", label: "Remote LCD repeater panels communication" },
      { id: "cause_effect", label: "Cause & Effect matrix (smoke damper, door releases)" },
      { id: "interfaces", label: "BMS / Third-party system interfaces" },
      { id: "transmission", label: "Civil Defense remote alarm transmitter (24/7)" }
    ]
  },
  {
    title: "5. Functional Testing & Verification",
    items: [
      { id: "testing_functional", label: "Full building evacuation drill & audible sound test" }
    ]
  }
];

const FIREFIGHTING_SECTIONS = [
  {
    title: "1. Fire Pump System Assembly (NFPA 20)",
    items: [
      { id: "main_pump", label: "Main fire pump casing, bearings & mechanical seals" },
      { id: "jockey_pump", label: "Jockey pressure maintenance pump operation" },
      { id: "diesel_pump", label: "Diesel engine emergency fire pump" },
      { id: "electric_pump", label: "Electric main motor pump & soft starter" },
      { id: "pump_controller", label: "Automatic pump controller & phase sequence" },
      { id: "pump_pressure", label: "System standby pressure & discharge head (bar/psi)" },
      { id: "pump_auto_start", label: "Automatic pressure-drop start sequence" },
      { id: "pump_manual_start", label: "Emergency manual start push-button mechanism" },
      { id: "pump_battery", label: "Engine cranking batteries & electrolyte level" },
      { id: "pump_fuel", label: "Diesel day tank fuel level (min 90% full)" },
      { id: "pump_engine_cond", label: "Engine cooling heat exchanger, oil & filters" }
    ]
  },
  {
    title: "2. Sprinkler & Wet Riser System (NFPA 13 / 25)",
    items: [
      { id: "sprinkler_valves", label: "Main control OS&Y valves (locked in OPEN position)" },
      { id: "alarm_valves", label: "Alarm check valves (ACV) & water motor gong" },
      { id: "flow_switch", label: "Vane-type water flow alarm switches" },
      { id: "pressure_switch", label: "High/low hydraulic pressure supervisory switches" },
      { id: "sprinkler_heads", label: "Sprinkler heads clear of obstruction (min 450mm)" },
      { id: "pressure_gauges", label: "System & supply pressure gauges calibrated" },
      { id: "drain_test", label: "Main drain & inspector's test connection flow" }
    ]
  },
  {
    title: "3. Fire Hose Reels & Hydrants",
    items: [
      { id: "hose_reel", label: "1\" Manual/automatic fire hose reel drum & swing arm" },
      { id: "hose_condition", label: "30m high-pressure rubber hose flexibility & integrity" },
      { id: "nozzle", label: "Jet/spray shut-off nozzle operational" },
      { id: "landing_valve", label: "2.5\" Oblique landing valves & blank caps" },
      { id: "hydrant", label: "Outdoor dry/wet fire hydrants & roadside access" },
      { id: "cabinet", label: "Fire cabinet door glass, locks & signage" }
    ]
  },
  {
    title: "4. Portable Fire Extinguishers",
    items: [
      { id: "ext_location", label: "Physical location & unobstructed accessibility" },
      { id: "ext_type", label: "Correct agent type for hazard (ABC, CO2, Foam, Water)" },
      { id: "ext_pressure", label: "Pressure gauge pointer within green operational zone" },
      { id: "ext_physical", label: "Cylinder body free of corrosion, dents, or damage" },
      { id: "ext_expiry", label: "Annual maintenance service tag & hydrostatic test date" },
      { id: "ext_seal_pin", label: "Safety pull pin and plastic tamper seal intact" }
    ]
  }
];

export default function InspectionChecklist({ initialJob, onCompleteInspection }) {
  const { showToast, setActiveModal } = useApp();
  const [activeSystem, setActiveSystem] = useState('alarm'); // 'alarm' | 'firefighting'
  
  // Checklist item states: { [id]: { status: 'OK'|'Fault'|'N/A', remarks: '', photos: [] } }
  const [checklist, setChecklist] = useState(() => {
    const init = {};
    const populate = (sections) => {
      sections.forEach(sec => {
        sec.items.forEach(it => {
          init[it.id] = { status: 'OK', remarks: '', photos: [] };
        });
      });
    };
    populate(FIRE_ALARM_SECTIONS);
    populate(FIREFIGHTING_SECTIONS);
    return init;
  });

  const [activePhotoItem, setActivePhotoItem] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoTag, setPhotoTag] = useState('Before'); // 'Before' | 'After'

  // Update Item Status
  const setItemStatus = (itemId, status) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), status }
    }));
  };

  // Update Item Remarks
  const setItemRemarks = (itemId, remarks) => {
    setChecklist(prev => ({
      ...prev,
      [itemId]: { ...(prev[itemId] || {}), remarks }
    }));
  };

  // One-click Pass All Items in current system
  const handlePassAll = () => {
    const sections = activeSystem === 'alarm' ? FIRE_ALARM_SECTIONS : FIREFIGHTING_SECTIONS;
    setChecklist(prev => {
      const updated = { ...prev };
      sections.forEach(sec => {
        sec.items.forEach(it => {
          updated[it.id] = { ...(updated[it.id] || {}), status: 'OK' };
        });
      });
      return updated;
    });
    showToast(`All ${activeSystem === 'alarm' ? 'Fire Alarm' : 'Firefighting'} items set to OK`, 'info');
  };

  // Client-side Image Compression via Canvas
  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = Math.min(img.width, MAX_WIDTH);
        canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        callback(dataUrl);
      };
    };
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoItem) return;

    compressImage(file, (compressedBase64) => {
      setChecklist(prev => {
        const existing = prev[activePhotoItem]?.photos || [];
        return {
          ...prev,
          [activePhotoItem]: {
            ...prev[activePhotoItem],
            photos: [
              ...existing,
              {
                id: `p-${Date.now()}`,
                url: compressedBase64,
                tag: photoTag,
                caption: photoCaption || 'Inspection item evidence'
              }
            ]
          }
        };
      });
      showToast('Photo compressed and attached', 'success');
      setShowPhotoModal(false);
      setPhotoCaption('');
    });
  };

  const currentSections = activeSystem === 'alarm' ? FIRE_ALARM_SECTIONS : FIREFIGHTING_SECTIONS;

  // Count faults
  const faultItems = Object.entries(checklist).filter(([_, val]) => val.status === 'Fault');

  return (
    <div className="space-y-4 pb-28">
      
      {/* Header bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-safety-red" />
              <span>AMC Field Inspection</span>
            </h1>
            <p className="text-xs text-slate-500">
              Site: <span className="font-semibold text-slate-800">{initialJob?.site_name || "Address Downtown Hotel"}</span>
            </p>
          </div>
          <button
            onClick={handlePassAll}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Pass All OK</span>
          </button>
        </div>

        {/* System Switcher */}
        <div className="mt-3 flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveSystem('alarm')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSystem === 'alarm'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-safety-red" />
            <span>Fire Alarm Checklist</span>
          </button>
          <button
            onClick={() => setActiveSystem('firefighting')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeSystem === 'firefighting'
                ? 'bg-navy-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-blue-400" />
            <span>Firefighting Checklist</span>
          </button>
        </div>
      </div>

      {/* Fault count notification banner */}
      {faultItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-safety-red" />
            <span className="font-bold">{faultItems.length} fault(s) detected in inspection checklist!</span>
          </div>
          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
            Action Needed
          </span>
        </div>
      )}

      {/* Checklist Sections */}
      <div className="space-y-4">
        {currentSections.map((sec, secIdx) => (
          <div key={secIdx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{sec.title}</span>
              <span className="text-[10px] text-slate-400 font-semibold">{sec.items.length} checks</span>
            </h2>

            <div className="space-y-3">
              {sec.items.map((item) => {
                const state = checklist[item.id] || { status: 'OK', remarks: '', photos: [] };
                const isFault = state.status === 'Fault';
                const isOK = state.status === 'OK';
                const isNA = state.status === 'N/A';

                return (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isFault
                        ? 'border-red-300 bg-red-50/30'
                        : isOK
                        ? 'border-slate-200 bg-white'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 flex-1 leading-snug">
                        {item.label}
                      </span>

                      {/* Large 1-Touch Toggle Buttons (Mobile friendly) */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        
                        {/* OK Button */}
                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'OK')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                            isOK
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>OK</span>
                        </button>

                        {/* FAULT Button */}
                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'Fault')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                            isFault
                              ? 'bg-safety-red text-white shadow-sm animate-pulse'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Fault</span>
                        </button>

                        {/* N/A Button */}
                        <button
                          type="button"
                          onClick={() => setItemStatus(item.id, 'N/A')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                            isNA
                              ? 'bg-slate-700 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span>N/A</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Remarks Input */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add remarks or notes..."
                        value={state.remarks || ''}
                        onChange={(e) => setItemRemarks(item.id, e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-600 focus:bg-white"
                      />

                      {/* Photo Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setActivePhotoItem(item.id);
                          setShowPhotoModal(true);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                          state.photos?.length > 0
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                        title="Attach Photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        {state.photos?.length > 0 && (
                          <span className="font-bold text-[10px]">{state.photos.length}</span>
                        )}
                      </button>
                    </div>

                    {/* Photos Preview Thumbnails */}
                    {state.photos?.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {state.photos.map((p) => (
                          <div key={p.id} className="relative group shrink-0">
                            <img
                              src={p.url}
                              alt="Item evidence"
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200 shadow-sm"
                            />
                            <span className="absolute top-0.5 left-0.5 px-1 bg-black/70 text-white text-[8px] font-bold rounded">
                              {p.tag}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Complete Inspection Sticky Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={() => setActiveModal({ type: 'ai_assistant' })}
            className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors flex items-center justify-center shadow-sm"
            title="AI Technical Wording"
          >
            <Sparkles className="w-5 h-5 text-amber-500" />
          </button>
          <button
            onClick={() => {
              if (onCompleteInspection) {
                onCompleteInspection({
                  checklist,
                  faultCount: faultItems.length,
                  system: activeSystem === 'alarm' ? 'Fire Alarm' : 'Firefighting'
                });
              }
            }}
            className="flex-1 py-3 px-4 bg-navy-900 hover:bg-navy-800 active:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>Proceed to Report &amp; Signatures</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </button>
        </div>
      </div>

      {/* Photo Capture / Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <span>Attach Inspection Photo</span>
              </h3>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              
              {/* Before / After Tagging */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Photo Classification</label>
                <div className="flex gap-2">
                  {['Before', 'After', 'General'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setPhotoTag(tag)}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-colors ${
                        photoTag === tag
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Caption / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Battery impedance test reading 14.2V"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Image Input Options */}
              <div className="pt-2">
                <label className="block w-full py-3 bg-navy-900 hover:bg-navy-800 text-white text-center font-bold rounded-xl cursor-pointer shadow-md">
                  <span>Take Photo or Choose from Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 text-center mt-1">
                  Photos are compressed automatically to keep reports lightweight.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
