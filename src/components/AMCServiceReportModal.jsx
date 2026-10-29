import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, Download, Share2, Shield, CheckCircle2, 
  XCircle, MinusCircle, ArrowLeft, Building2, Flame,
  Wrench, Check, UserCheck, AlertTriangle, Sparkles, Bell, MapPin
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AMCServiceReportModal({ visit, onClose }) {
  const { showToast, companySettings, currentUser } = useApp();
  const reportRef = useRef(null);

  const [checklistData, setChecklistData] = useState(visit?.checklist_data || null);
  const [loadingChecklist, setLoadingChecklist] = useState(!visit?.checklist_data);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [siteDetails, setSiteDetails] = useState(null);
  const [contractDetails, setContractDetails] = useState(null);

  useEffect(() => {
    if (!visit) return;
    const fetchFullDetails = async () => {
      try {
        setLoadingChecklist(true);
        if (visit.id) {
          const res = await fetch(`/api/amc-visits/${visit.id}/checklist`);
          if (res.ok) {
            const data = await res.json();
            if (data?.checklist) setChecklistData(data.checklist);
            if (data?.customer) setCustomerDetails(data.customer);
            if (data?.site) setSiteDetails(data.site);
            if (data?.contract) setContractDetails(data.contract);
          }
        }
        const custId = visit.customer_id;
        if (custId && !customerDetails) {
          const resCust = await fetch(`/api/customers/${custId}/details`);
          if (resCust.ok) {
            const cData = await resCust.json();
            if (cData?.customer) setCustomerDetails(cData.customer);
            if (cData?.sites && cData.sites.length > 0) {
              const matchedSite = cData.sites.find(s => s.id === visit.site_id) || cData.sites[0];
              setSiteDetails(matchedSite);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load full AMC report details:', err);
      } finally {
        setLoadingChecklist(false);
      }
    };
    fetchFullDetails();
  }, [visit?.id, visit?.customer_id]);

  if (!visit) return null;

  const chk = checklistData || visit.checklist_data || {};
  const customerSig = chk.customer_signature;
  const supervisorRev = chk.supervisor_review;

  const preparedByName = visit.prepared_by_name || currentUser?.name || visit.technician_name || 'Certified Inspector';
  const preparationDate = visit.prepared_at?.slice(0, 10) || visit.actual_service_date || new Date().toISOString().slice(0, 10);

  // Normalize multi-building array
  let reportBuildings = [];
  if (Array.isArray(chk.buildings) && chk.buildings.length > 0) {
    reportBuildings = chk.buildings;
  } else if (Array.isArray(visit.buildings) && visit.buildings.length > 0) {
    reportBuildings = visit.buildings;
  } else {
    // Legacy fallback
    reportBuildings = [
      {
        building_id: 'bld-1',
        building_number: '1',
        building_name: visit.site_name ? `${visit.site_name} - Main Building` : 'Main Building',
        location: visit.site_address || '',
        selected_systems: ['fire_alarm', 'fire_fighting', 'fire_extinguishers'],
        checklists: {
          fire_alarm: chk.fire_alarm_items || [],
          fire_fighting: chk.fire_fighting_items || [],
          fire_extinguishers: chk.extinguisher_items || []
        },
        defects: chk.defects || [],
        remarks: chk.technician_notes || ''
      }
    ];
  }

  // Calculate statistics across all buildings
  let totalOk = 0;
  let totalNotOk = 0;
  let totalNa = 0;
  const allDefects = [];
  const allPhotos = [];

  reportBuildings.forEach(bld => {
    const bName = bld.building_name || `Building ${bld.building_number || '1'}`;
    const chks = bld.checklists || {};

    Object.entries(chks).forEach(([sysKey, items]) => {
      if (Array.isArray(items)) {
        items.forEach(i => {
          if (i.status === 'OK') totalOk++;
          else if (i.status === 'NOT OK') {
            totalNotOk++;
            allDefects.push({
              building: bName,
              system: sysKey.replace(/_/g, ' ').toUpperCase(),
              item: i.item || i.reel_id || i.valve_id || i.ext_id || i.system_tag || i.detector_id || i.light_id || i.sign_id || 'Safety Equipment',
              floor: i.floor || '',
              location: i.location || '',
              defect: i.defect_description || i.remarks || 'Inspection defect recorded',
              recommendation: i.recommendation || 'Maintenance / repair required',
              priority: i.priority || 'High'
            });
          } else if (i.status === 'N/A') totalNa++;

          // Photos
          (i.photos || []).forEach(p => {
            allPhotos.push({
              url: p,
              label: `${bName} • ${i.item || i.reel_id || i.valve_id || i.ext_id || sysKey}`,
              caption: i.remarks || 'Inspection Verification'
            });
          });
        });
      }
    });
  });

  const docNumber = visit.document_number || (visit.report_number && visit.report_number.startsWith('FX ') ? visit.report_number : null) || (() => {
    const d = new Date(visit.actual_service_date || visit.scheduled_date || Date.now());
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `FX AMC RPT-${m}-001`;
  })();

  const handleDownloadPDF = async () => {
    try {
      showToast('Compiling official A4 Civil Defense report...', 'info');
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 2) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${docNumber.replace(/\s+/g, '_')}.pdf`);
      showToast('Official AMC Service Report downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Opening native browser print dialog...', 'info');
      window.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FIREX AMC Service Report - ${visit.contract_number} Visit #${visit.visit_number}`,
          text: `Fire & Safety Periodic Service Report for ${visit.site_name || visit.customer_name}. Civil Defense Compliant.`,
          url: window.location.href
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Report link copied to clipboard', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 flex flex-col items-center">
      
      {/* Action Header */}
      <div className="sticky top-2 z-50 bg-navy-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-navy-700 flex items-center justify-between w-full max-w-4xl mb-4">
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors border border-navy-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print A4</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 bg-navy-800 hover:bg-navy-700 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition-colors border border-navy-700"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-black text-white flex items-center gap-1.5 shadow-lg shadow-red-900/40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download A4 PDF</span>
          </button>
        </div>
      </div>

      {/* Main Printable A4 Document Sheet */}
      <div 
        ref={reportRef}
        className="w-full max-w-4xl bg-white text-slate-900 p-6 sm:p-10 shadow-2xl rounded-sm print:p-0 print:shadow-none print:max-w-none text-xs leading-normal"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        
        {/* ========================================================================= */}
        {/* OFFICIAL LETTERHEAD (PART 10 - EXACT GRAPHIC BANNER NO HTML SUBSTITUTE)   */}
        {/* ========================================================================= */}
        <div className="w-full mb-4 border-b-2 border-red-600 pb-2">
          <img
            src={companySettings?.letterhead_url || '/letterhead.png'}
            alt="FIREX Fire & Safety"
            className="w-full h-auto object-contain max-h-28 sm:max-h-32 mx-auto"
            crossOrigin="anonymous"
          />
        </div>

        {/* Document Title Banner */}
        <div className="bg-navy-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-between mb-4 shadow-sm">
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
              ANNUAL MAINTENANCE CONTRACT (AMC) PERIODIC SERVICE REPORT
            </h2>
            <p className="text-[10px] text-slate-300 font-medium">
              Periodic Comprehensive Fire Protection Systems Maintenance &amp; Inspection • Bahrain Civil Defense Compliant
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono uppercase block text-slate-300">Document No.</span>
            <span className="text-xs sm:text-sm font-mono font-black text-amber-300 tracking-wider">
              {docNumber}
            </span>
          </div>
        </div>

        {/* Customer & Contract Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          
          {/* Customer & Facility Box */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/70 space-y-1.5">
            <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>CUSTOMER &amp; FACILITY DETAILS</span>
              <span className="font-mono text-[9px] text-blue-800 font-bold">
                {customerDetails?.customer_code || customerDetails?.code || ''}
              </span>
            </h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Customer / Company Name</span>
                <span className="font-black text-slate-900 text-sm">
                  {customerDetails?.name || visit.customer_name || 'Customer'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Contact Person</span>
                  <span className="font-bold text-slate-800">
                    {customerDetails?.contact_person || siteDetails?.contact_person || 'Facility Representative'}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Phone</span>
                  <span className="font-mono font-bold text-slate-800">
                    {customerDetails?.phone || customerDetails?.contact_mobile || siteDetails?.contact_number || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Site / Facility Name</span>
                <span className="font-bold text-slate-900">
                  {siteDetails?.site_name || visit.site_name || 'Main Site'}
                </span>
              </div>
              <div>
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Site Location / Address</span>
                <span className="text-slate-800">
                  {siteDetails?.site_address || visit.site_address || 'Kingdom of Bahrain'}
                </span>
              </div>
            </div>
          </div>

          {/* AMC Contract & Service Visit Box */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/70 space-y-1.5">
            <h3 className="text-[10px] font-black uppercase text-slate-800 tracking-wider pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>AMC SERVICE SPECIFICATIONS</span>
              <span className="font-mono text-[9px] text-red-600 font-bold">
                {visit.contract_number}
              </span>
            </h3>
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Service Quarter</span>
                  <span className="font-black text-red-700 bg-red-100/70 px-2 py-0.5 rounded text-[11px] inline-block font-mono">
                    {visit.quarter || 'Q1'} (Visit #{visit.visit_number || 1})
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Inspection Date</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {visit.actual_service_date || visit.scheduled_date || preparationDate}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Field Supervisor</span>
                  <span className="font-bold text-slate-800">
                    {visit.supervisor_name || 'Sarath Kr'}
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Certified Technician</span>
                  <span className="font-bold text-slate-800">
                    {visit.technician_name || preparedByName}
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Inspected Buildings</span>
                <span className="font-bold text-slate-900">
                  {reportBuildings.length} Building(s) inspected ({reportBuildings.map(b => b.building_name).join(', ')})
                </span>
              </div>

              <div className="pt-1 border-t border-slate-200 mt-1">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block">System Make / Manufacturer</span>
                <div className="font-bold text-slate-900">
                  {(() => {
                    const entries = [];
                    reportBuildings.forEach((bld, idx) => {
                      const bLabel = bld.building_name || `Building ${bld.building_number || idx + 1}`;
                      if (bld.system_makes) {
                        Object.entries(bld.system_makes).forEach(([sysKey, makeVal]) => {
                          if (makeVal) {
                            const sysName = sysKey === 'fire_alarm' ? 'Fire Alarm Panel' :
                                            sysKey === 'fire_fighting' ? 'Fire Fighting System' :
                                            sysKey === 'fire_extinguishers' ? 'Fire Extinguishers' :
                                            sysKey === 'fire_hose_reels' ? 'Fire Hose Reel' :
                                            sysKey === 'landing_valves' ? 'Landing Valve' :
                                            sysKey === 'fm200_suppression' ? 'FM200 System' :
                                            sysKey === 'lpg_detection' ? 'LPG Detection System' :
                                            sysKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            entries.push(`${bLabel} – ${sysName} – System Make: ${makeVal}`);
                          }
                        });
                      }
                    });
                    if (entries.length === 0) {
                      const visitMakes = visit.system_makes || chk.system_makes || {};
                      Object.entries(visitMakes).forEach(([sysKey, makeVal]) => {
                        if (makeVal) {
                          const sysName = sysKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                          entries.push(`${sysName} – System Make: ${makeVal}`);
                        }
                      });
                    }
                    const generalMake = visit.system_make || chk.system_make || '';
                    if (entries.length > 0) {
                      return (
                        <div className="space-y-0.5 mt-0.5">
                          {entries.map((e, i) => (
                            <div key={i} className="text-slate-900 font-semibold text-[10.5px]">{e}</div>
                          ))}
                        </div>
                      );
                    }
                    if (generalMake) return generalMake;
                    return '-';
                  })()}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* MULTI-BUILDING OVERVIEW SUMMARY TABLE (PART 1)                           */}
        {/* ========================================================================= */}
        <div className="mb-5 border border-slate-300 rounded-lg overflow-hidden shadow-sm">
          <div className="bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between font-black text-[11px] uppercase tracking-wider">
            <span>FACILITY BUILDINGS &amp; SYSTEMS INSPECTION SUMMARY</span>
            <span className="font-mono text-amber-300 font-bold">{reportBuildings.length} Buildings</span>
          </div>

          <table className="w-full border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-left">
                <th className="p-2 border-r border-slate-200 w-16 text-center">Bld #</th>
                <th className="p-2 border-r border-slate-200">Building Name</th>
                <th className="p-2 border-r border-slate-200">Location</th>
                <th className="p-2 border-r border-slate-200">Inspected Systems</th>
                <th className="p-2 border-r border-slate-200">System Make / Manufacturer</th>
                <th className="p-2 border-r border-slate-200 text-center">Items</th>
                <th className="p-2 text-center">Defects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportBuildings.map((bld, idx) => {
                const chks = bld.checklists || {};
                let bldItemsCount = 0;
                let bldNotOk = 0;
                Object.values(chks).forEach(list => {
                  if (Array.isArray(list)) {
                    bldItemsCount += list.length;
                    bldNotOk += list.filter(i => i.status === 'NOT OK').length;
                  }
                });

                return (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-black text-red-600">
                      B-{bld.building_number || idx + 1}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-black text-slate-900">
                      {bld.building_name || `Building ${bld.building_number || idx + 1}`}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-slate-600">
                      {bld.location || 'Site Facility'}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-slate-700 font-semibold">
                      {(bld.selected_systems || []).map(s => s.replace(/_/g, ' ')).join(', ')}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-slate-700 font-medium">
                      {(() => {
                        const bMakes = bld.system_makes || {};
                        const entries = Object.entries(bMakes).filter(([_, m]) => m);
                        if (entries.length > 0) {
                          return entries.map(([s, m]) => `${s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${m}`).join(', ');
                        }
                        return bld.system_make || visit.system_make || '-';
                      })()}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-800">
                      {bldItemsCount}
                    </td>
                    <td className="p-2 text-center font-mono font-bold">
                      {bldNotOk > 0 ? (
                        <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded font-black">
                          {bldNotOk} Defect(s)
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          0
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* DETAILED CHECKLISTS PER BUILDING (PARTS 1-8: SEPARATE & INDEPENDENT)      */}
        {/* ========================================================================= */}
        {reportBuildings.map((bld, bldIdx) => {
          const chks = bld.checklists || {};
          const selectedSys = bld.selected_systems || Object.keys(chks);

          return (
            <div key={bld.building_id || bldIdx} className="mb-6 border-2 border-slate-400 rounded-lg overflow-hidden page-break-inside-avoid">
              
              {/* Building Header Banner */}
              <div className="bg-gradient-to-r from-red-700 to-navy-950 text-white p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-xs bg-white text-red-700 px-2 py-0.5 rounded">
                    BUILDING {bld.building_number || bldIdx + 1}
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wide">
                    {bld.building_name || `Building ${bld.building_number || bldIdx + 1}`}
                  </h3>
                  {bld.location && (
                    <span className="text-[10px] text-slate-300">({bld.location})</span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-amber-300 font-bold">
                  {selectedSys.length} Active System(s)
                </span>
              </div>

              {/* Checklists for each selected system in this building */}
              <div className="p-3 space-y-4 bg-white">
                
                {/* 1. FIRE ALARM CHECKLIST */}
                {selectedSys.includes('fire_alarm') && chks.fire_alarm && chks.fire_alarm.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-red-50 text-red-900 font-black text-[10.5px] px-3 py-1.5 border-b border-red-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-red-600" />
                        <span>1. FIRE ALARM &amp; DETECTION SYSTEM CHECKLIST</span>
                      </span>
                      <span className="text-[10px] text-slate-600 font-normal">
                        Civil Defense Routine Inspection{(bld.system_makes?.fire_alarm || visit.system_makes?.fire_alarm) ? ` • Make: ${bld.system_makes?.fire_alarm || visit.system_makes?.fire_alarm}` : ''}
                      </span>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-10 text-center">No.</th>
                          <th className="p-1.5 border-r border-slate-200">Device / Component</th>
                          <th className="p-1.5 border-r border-slate-200">Type / Make</th>
                          <th className="p-1.5 border-r border-slate-200 w-12 text-center">Qty</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Observations / Findings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.fire_alarm.map((item, idx) => (
                          <tr key={idx} className={item.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{item.item}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-600">{item.type || item.make || '-'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono">{item.quantity || '1'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                item.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                item.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{item.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 2. FIRE FIGHTING SYSTEM (PUMPS & SPRINKLERS) */}
                {selectedSys.includes('fire_fighting') && chks.fire_fighting && chks.fire_fighting.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-blue-50 text-blue-900 font-black text-[10.5px] px-3 py-1.5 border-b border-blue-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span>2. FIRE FIGHTING SYSTEM (PUMPS, TANK &amp; SPRINKLERS)</span>
                      </span>
                      {(bld.system_makes?.fire_fighting || visit.system_makes?.fire_fighting) && (
                        <span className="text-[10px] text-blue-800 font-normal">
                          Make: {bld.system_makes?.fire_fighting || visit.system_makes?.fire_fighting}
                        </span>
                      )}
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-10 text-center">No.</th>
                          <th className="p-1.5 border-r border-slate-200">Equipment Description</th>
                          <th className="p-1.5 border-r border-slate-200">Specification / Make</th>
                          <th className="p-1.5 border-r border-slate-200 w-12 text-center">Qty</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Operational Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.fire_fighting.map((item, idx) => (
                          <tr key={idx} className={item.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{item.item}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-600">{item.type || item.make || '-'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-mono">{item.quantity || '1'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                item.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                item.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{item.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 3. DEDICATED FIRE HOSE REEL CHECKLIST (PART 3) */}
                {selectedSys.includes('fire_hose_reels') && chks.fire_hose_reels && chks.fire_hose_reels.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-amber-50 text-amber-900 font-black text-[10.5px] px-3 py-1.5 border-b border-amber-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>3. FIRE HOSE REEL SYSTEM DEDICATED CHECKLIST</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-bold font-mono">
                        {chks.fire_hose_reels.length} Unit(s)
                      </span>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-16">Reel ID</th>
                          <th className="p-1.5 border-r border-slate-200">Floor &amp; Location</th>
                          <th className="p-1.5 border-r border-slate-200">Cabinet</th>
                          <th className="p-1.5 border-r border-slate-200">Hose &amp; Nozzle</th>
                          <th className="p-1.5 border-r border-slate-200">Valve &amp; Flow</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.fire_hose_reels.map((hr, idx) => (
                          <tr key={idx} className={hr.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-amber-800">{hr.reel_id}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{hr.floor} • {hr.location}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-700">{hr.cabinet_condition || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-700">Hose: {hr.hose_condition || 'OK'} / Nozzle: {hr.nozzle_operation || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-700">Leakage: {hr.leakage_test || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                hr.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                hr.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {hr.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{hr.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 4. DEDICATED LANDING VALVE CHECKLIST (PART 4) */}
                {selectedSys.includes('landing_valves') && chks.landing_valves && chks.landing_valves.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-orange-50 text-orange-900 font-black text-[10.5px] px-3 py-1.5 border-b border-orange-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-orange-600" />
                        <span>4. LANDING VALVE (DRY/WET RISER) DEDICATED CHECKLIST</span>
                      </span>
                      <span className="text-[10px] text-orange-800 font-bold font-mono">
                        {chks.landing_valves.length} Unit(s)
                      </span>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-16">Valve ID</th>
                          <th className="p-1.5 border-r border-slate-200">Floor &amp; Location</th>
                          <th className="p-1.5 border-r border-slate-200">Handwheel &amp; Spindle</th>
                          <th className="p-1.5 border-r border-slate-200">Blank Cap &amp; Chain</th>
                          <th className="p-1.5 border-r border-slate-200">Coupling &amp; Leakage</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.landing_valves.map((lv, idx) => (
                          <tr key={idx} className={lv.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-orange-800">{lv.valve_id}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{lv.floor} • {lv.location}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-700">{lv.handwheel_operation || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-700">{lv.cap_chain || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-700">{lv.coupling_condition || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                lv.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                lv.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {lv.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{lv.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 5. FIRE EXTINGUISHER CHECKLIST (PART 5) */}
                {selectedSys.includes('fire_extinguishers') && chks.fire_extinguishers && chks.fire_extinguishers.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-rose-50 text-rose-900 font-black text-[10.5px] px-3 py-1.5 border-b border-rose-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-rose-600" />
                        <span>5. PORTABLE FIRE EXTINGUISHERS REGISTER &amp; INSPECTION</span>
                      </span>
                      <span className="text-[10px] text-rose-800 font-bold font-mono">
                        {chks.fire_extinguishers.length} Cylinder(s)
                      </span>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-16">Tag ID</th>
                          <th className="p-1.5 border-r border-slate-200">Type &amp; Capacity</th>
                          <th className="p-1.5 border-r border-slate-200">Serial No.</th>
                          <th className="p-1.5 border-r border-slate-200">Floor &amp; Location</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Pressure</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Weight</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Observations / Next Due</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.fire_extinguishers.map((ext, idx) => (
                          <tr key={idx} className={ext.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-rose-800">{ext.ext_id || `EXT-${idx+1}`}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{ext.type} ({ext.capacity})</td>
                            <td className="p-1.5 border-r border-slate-200 font-mono text-slate-600">{ext.serial_number || '-'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-slate-700">{ext.floor} • {ext.location}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center">
                              {ext.type?.includes('CO2') ? (
                                <span className="text-[8.5px] font-bold text-slate-500 bg-slate-100 px-1 py-0.5 rounded">N/A (CO2)</span>
                              ) : (
                                <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${ext.pressure_gauge === 'OK' ? 'text-emerald-700' : 'text-red-700'}`}>
                                  {ext.pressure_gauge || 'OK'}
                                </span>
                              )}
                            </td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold text-slate-700">{ext.weight_status || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                ext.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                ext.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {ext.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">
                              {ext.remarks || 'Standard OK'} {ext.next_due_date ? `(Due: ${ext.next_due_date})` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 6. FM200 / CLEAN AGENT SUPPRESSION (PART 6) */}
                {selectedSys.includes('fm200_suppression') && chks.fm200_suppression && chks.fm200_suppression.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-purple-50 text-purple-900 font-black text-[10.5px] px-3 py-1.5 border-b border-purple-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        <span>6. FM200 / CLEAN AGENT SUPPRESSION SYSTEM CHECKLIST</span>
                      </span>
                      {(bld.system_makes?.fm200_suppression || visit.system_makes?.fm200_suppression) && (
                        <span className="text-[10px] text-purple-800 font-normal">
                          Make: {bld.system_makes?.fm200_suppression || visit.system_makes?.fm200_suppression}
                        </span>
                      )}
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-24">System Tag</th>
                          <th className="p-1.5 border-r border-slate-200">Protected Room / Area</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Pressure</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Abort Switch</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Room Integrity</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.fm200_suppression.map((fm, idx) => (
                          <tr key={idx} className={fm.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-purple-800">{fm.system_tag}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{fm.room_name} ({fm.floor})</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold text-emerald-700">{fm.cylinder_pressure || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{fm.abort_switch || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{fm.room_integrity_enclosure || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                fm.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                fm.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {fm.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{fm.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 7. LPG GAS DETECTION (PART 7) */}
                {selectedSys.includes('lpg_detection') && chks.lpg_detection && chks.lpg_detection.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-yellow-50 text-yellow-900 font-black text-[10.5px] px-3 py-1.5 border-b border-yellow-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                        <span>7. LPG / GAS DETECTION SYSTEM CHECKLIST</span>
                      </span>
                      {(bld.system_makes?.lpg_detection || visit.system_makes?.lpg_detection) && (
                        <span className="text-[10px] text-yellow-900 font-normal">
                          Make: {bld.system_makes?.lpg_detection || visit.system_makes?.lpg_detection}
                        </span>
                      )}
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-24">Detector ID</th>
                          <th className="p-1.5 border-r border-slate-200">Location</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Panel Status</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Solenoid Trip</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Fan Interlock</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Calibration / Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.lpg_detection.map((lpg, idx) => (
                          <tr key={idx} className={lpg.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-yellow-800">{lpg.detector_id}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{lpg.location} ({lpg.floor})</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{lpg.panel_status || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{lpg.shutoff_valve || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{lpg.fan_interlock || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                lpg.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                lpg.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {lpg.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{lpg.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 8. EMERGENCY LIGHTS */}
                {selectedSys.includes('emergency_lights') && chks.emergency_lights && chks.emergency_lights.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-emerald-50 text-emerald-900 font-black text-[10.5px] px-3 py-1.5 border-b border-emerald-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>8. EMERGENCY LIGHTING SYSTEM INSPECTION</span>
                      </span>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-20">Unit ID</th>
                          <th className="p-1.5 border-r border-slate-200">Location</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">AC Indicator</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Duration Test</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.emergency_lights.map((em, idx) => (
                          <tr key={idx} className={em.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-emerald-800">{em.light_id}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{em.floor} • {em.location}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{em.ac_power_indicator || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{em.duration_test_passed || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                em.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                em.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {em.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{em.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* 9. EXIT LIGHTS */}
                {selectedSys.includes('exit_lights') && chks.exit_lights && chks.exit_lights.length > 0 && (
                  <div className="border border-slate-300 rounded overflow-hidden">
                    <div className="bg-teal-50 text-teal-900 font-black text-[10.5px] px-3 py-1.5 border-b border-teal-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>9. EXIT SIGN LUMINAIRES INSPECTION</span>
                      </span>
                    </div>

                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 text-left font-bold">
                          <th className="p-1.5 border-r border-slate-200 w-20">Sign ID</th>
                          <th className="p-1.5 border-r border-slate-200">Location</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Illumination</th>
                          <th className="p-1.5 border-r border-slate-200 text-center">Pictogram &amp; Arrows</th>
                          <th className="p-1.5 border-r border-slate-200 w-16 text-center">Status</th>
                          <th className="p-1.5">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {chks.exit_lights.map((ex, idx) => (
                          <tr key={idx} className={ex.status === 'NOT OK' ? 'bg-red-50/70' : ''}>
                            <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-teal-800">{ex.sign_id}</td>
                            <td className="p-1.5 border-r border-slate-200 font-bold text-slate-900">{ex.floor} • {ex.location}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{ex.illumination || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center text-slate-700">{ex.pictogram_condition || 'OK'}</td>
                            <td className="p-1.5 border-r border-slate-200 text-center font-bold">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                ex.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                                ex.status === 'NOT OK' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {ex.status}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-700">{ex.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* DEFECTS & CORRECTIVE ACTION SCHEDULE                                      */}
        {/* ========================================================================= */}
        {allDefects.length > 0 && (
          <div className="mb-5 border border-red-300 rounded-lg overflow-hidden shadow-sm page-break-inside-avoid">
            <div className="bg-red-700 text-white px-3 py-1.5 flex items-center justify-between font-black text-[11px] uppercase tracking-wider">
              <span>DEFECTS &amp; REPAIR RECOMMENDATIONS SCHEDULE</span>
              <span className="font-mono text-amber-200 font-bold">{allDefects.length} Defect(s) Active</span>
            </div>

            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-red-50 text-red-950 font-bold border-b border-red-200 text-left">
                  <th className="p-1.5 border-r border-red-200 w-28">Building</th>
                  <th className="p-1.5 border-r border-red-200 w-28">System</th>
                  <th className="p-1.5 border-r border-red-200">Defective Component</th>
                  <th className="p-1.5 border-r border-red-200">Observed Defect</th>
                  <th className="p-1.5 border-r border-red-200">Recommended Action</th>
                  <th className="p-1.5 w-16 text-center">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {allDefects.map((d, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-1.5 border-r border-red-100 font-bold text-slate-900">{d.building}</td>
                    <td className="p-1.5 border-r border-red-100 font-mono text-[9px] text-slate-700">{d.system}</td>
                    <td className="p-1.5 border-r border-red-100 font-bold text-red-900">{d.item}</td>
                    <td className="p-1.5 border-r border-red-100 text-slate-800">{d.defect}</td>
                    <td className="p-1.5 border-r border-red-100 text-slate-700 font-semibold">{d.recommendation}</td>
                    <td className="p-1.5 text-center font-bold">
                      <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase">
                        {d.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ATTACHED INSPECTION PHOTOS                                               */}
        {/* ========================================================================= */}
        {allPhotos.length > 0 && (
          <div className="mb-5 border border-slate-300 rounded-lg p-3 bg-slate-50/50 page-break-inside-avoid">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-800 mb-2 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>ATTACHED INSPECTION VERIFICATION PHOTOS</span>
              <span className="font-mono text-slate-600 font-bold">{allPhotos.length} Attached</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allPhotos.map((photo, pIdx) => (
                <div key={pIdx} className="border border-slate-300 rounded bg-white p-1 shadow-sm">
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="w-full h-24 object-cover rounded"
                    crossOrigin="anonymous"
                  />
                  <p className="text-[9px] font-bold text-slate-800 truncate mt-1">{photo.label}</p>
                  <p className="text-[8px] text-slate-500 truncate">{photo.caption}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIGNATURES & CIVIL DEFENSE COMPLIANCE DECLARATION                        */}
        {/* ========================================================================= */}
        <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/80 mb-4 page-break-inside-avoid">
          <p className="text-[9.5px] text-slate-600 leading-relaxed mb-4 text-justify font-medium">
            <strong>CERTIFICATION OF INSPECTION:</strong> This is to certify that the fire protection and life safety installations documented above have been thoroughly inspected and serviced by certified FIREX technical personnel in full compliance with Bahrain Civil Defense standards, NFPA guidelines, and FIREX engineering quality assurance protocols.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-300 text-center">
            
            {/* Customer Signoff */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                Customer Representative Sign-off
              </span>
              <div className="h-16 flex items-center justify-center">
                {customerSig ? (
                  <img src={customerSig} alt="Customer Signature" className="h-12 object-contain" />
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Signature on Record</span>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-900 border-t border-slate-100 pt-1">
                {customerDetails?.contact_person || 'Facility Representative'}
              </p>
              <p className="text-[8.5px] text-slate-500">Authorized Facility Signature</p>
            </div>

            {/* Inspecting Technician */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                Certified Service Technician
              </span>
              <div className="h-16 flex items-center justify-center font-mono font-bold text-slate-800 text-xs">
                {visit.technician_name || preparedByName}
              </div>
              <p className="text-[10px] font-bold text-slate-900 border-t border-slate-100 pt-1">
                {visit.technician_name || preparedByName}
              </p>
              <p className="text-[8.5px] text-slate-500">FIREX Certified Technician</p>
            </div>

            {/* Field Supervisor */}
            <div className="border border-slate-200 rounded-lg p-2.5 bg-white">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">
                Technical Supervisor Review
              </span>
              <div className="h-16 flex items-center justify-center font-mono font-bold text-slate-800 text-xs">
                {visit.supervisor_name || 'Sarath Kr'}
              </div>
              <p className="text-[10px] font-bold text-slate-900 border-t border-slate-100 pt-1">
                {visit.supervisor_name || 'Sarath Kr'}
              </p>
              <p className="text-[8.5px] text-slate-500">Field Operations Supervisor</p>
            </div>

          </div>
        </div>

        {/* Official Document Footer with Accreditation Banner */}
        <div className="border-t border-slate-300 pt-2 space-y-2">
          <img
            src={companySettings?.letterhead_footer_url || '/letterhead_footer.jpg'}
            alt="FIREX Accreditation and Contacts"
            className="w-full h-auto object-contain max-h-16 mx-auto"
            crossOrigin="anonymous"
          />
          <div className="flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-500 font-medium">
            <p>FIREX W.L.L. • Kingdom of Bahrain • CR No: 96850 1 • VAT No: 220006271900002</p>
            <p className="font-mono">Document: {docNumber} • System-Generated Official Record</p>
          </div>
        </div>

      </div>

    </div>
  );
}
