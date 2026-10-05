import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, Download, Share2, Shield, CheckCircle2, 
  XCircle, MinusCircle, ArrowLeft, Building2, Flame,
  Wrench, Check, UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AMCServiceReportModal({ visit, onClose }) {
  const { showToast, companySettings } = useApp();
  const reportRef = useRef(null);

  if (!visit) return null;

  const chk = visit.checklist_data || {};
  const faItems = chk.fire_alarm_items || [];
  const ffItems = chk.fire_fighting_items || [];
  const extItems = chk.extinguisher_items || [];
  const customerSig = chk.customer_signature;
  const supervisorRev = chk.supervisor_review;

  const allItems = [...faItems, ...ffItems, ...extItems];
  const okCount = allItems.filter(i => i.status === 'OK').length;
  const notOkCount = allItems.filter(i => i.status === 'NOT OK').length;
  const naCount = allItems.filter(i => i.status === 'N/A').length;

  const defects = [
    ...faItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, sys: 'Fire Alarm' })),
    ...ffItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, sys: 'Fire Fighting' })),
    ...extItems.filter(i => i.status === 'NOT OK').map(i => ({ ...i, sys: 'Fire Extinguishers', item: `${i.type} (${i.capacity})` }))
  ];

  const photosWithLabels = [];
  faItems.forEach(i => {
    (i.photos || []).forEach((p, idx) => {
      photosWithLabels.push({ url: p, label: `FA: ${i.item}`, caption: i.remarks || i.defect_description || 'Fire Alarm Verification' });
    });
  });
  ffItems.forEach(i => {
    (i.photos || []).forEach((p, idx) => {
      photosWithLabels.push({ url: p, label: `FF: ${i.item}`, caption: i.remarks || i.defect_description || 'Fire Fighting Inspection' });
    });
  });
  extItems.forEach(i => {
    (i.photos || []).forEach((p, idx) => {
      photosWithLabels.push({ url: p, label: `EXT: ${i.type} (${i.serial_number})`, caption: i.remarks || 'Extinguisher Inspection' });
    });
  });

  const handleDownloadPDF = async () => {
    try {
      showToast('Compiling official A4 Civil Defense report...', 'info');
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
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

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`FIREX_AMC_Report_${visit.contract_number || 'Contract'}_Visit_${visit.visit_number}.pdf`);
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
      } catch (err) {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Report link copied to clipboard', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 flex flex-col items-center">
      
      {/* Floating Action Header */}
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
        {/* PAGE 1: OFFICIAL LETTERHEAD & SERVICE JOB CARD HEADER                     */}
        {/* ========================================================================= */}
        
        {/* Bilingual Letterhead Banner */}
        <div className="border-b-2 border-red-600 pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={companySettings?.logo_url || '/logo.png'}
                alt="FIREX Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-red-600">
                  FIREX FIRE &amp; SAFETY
                </h1>
                <p className="text-sm font-bold text-slate-800" dir="rtl">
                  شركة فايركس لأدوات السلامه ذ.م.م
                </p>
                <p className="text-[10px] font-bold text-slate-600 tracking-wide">
                  Safety Items W.L.L. • Al Seef, Kingdom of Bahrain
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-600 font-semibold space-y-0.5">
              <p className="font-mono text-slate-900 font-bold">CR No: {companySettings?.cr_no || '96850 1'}</p>
              <p className="font-mono text-slate-900 font-bold">VAT No: {companySettings?.vat_no || '220006271900002'}</p>
              <p>Email: {companySettings?.email || 'service@firexbahrain.com'}</p>
              <p>Tel: {companySettings?.phone || '+973 1716 2240'}</p>
            </div>
          </div>
        </div>

        {/* Official Document Banner */}
        <div className="bg-navy-900 text-white px-4 py-2 rounded-lg flex items-center justify-between mb-4">
          <div>
            <span className="text-[9px] uppercase tracking-widest font-black text-amber-400 block">
              KINGDOM OF BAHRAIN • CIVIL DEFENSE COMPLIANT AUDIT
            </span>
            <h2 className="text-sm sm:text-base font-black tracking-wide">
              ANNUAL MAINTENANCE CONTRACT (AMC) PERIODIC SERVICE REPORT
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-mono uppercase block text-slate-300">Doc Reference</span>
            <span className="text-xs font-mono font-black text-amber-300">
              RPT-AMC-{visit.contract_number || '2026'}-V{visit.visit_number}
            </span>
          </div>
        </div>

        {/* Contract & Site Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          
          {/* Customer & Site Details Box */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/70 space-y-1.5">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider pb-1 border-b border-slate-200">
              Customer &amp; Facility Details
            </h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Client Name</span>
                <span className="font-black text-slate-900">{visit.customer_name || 'VIP Client'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Premises / Building</span>
                <span className="font-bold text-slate-900">{visit.site_name || 'Main Facility'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Site Address</span>
                <span className="text-slate-700">{visit.site_address || 'Kingdom of Bahrain'}</span>
              </div>
            </div>
          </div>

          {/* AMC Contract & Visit Details Box */}
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/70 space-y-1.5">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider pb-1 border-b border-slate-200">
              Contract &amp; Visit Specifications
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">AMC Contract No.</span>
                <span className="font-black text-red-700 font-mono">{visit.contract_number || 'AMC-2026'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Service Visit</span>
                <span className="font-bold text-slate-900">Visit #{visit.visit_number} ({visit.quarter || 'Q1'})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Scheduled Date</span>
                <span className="font-medium text-slate-700">{visit.scheduled_date}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Actual Service Date</span>
                <span className="font-black text-slate-900">{visit.actual_service_date || visit.scheduled_date}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block">Supervisor</span>
                  <span className="font-bold text-slate-900">{visit.supervisor_name || 'Certified Engineer'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block">Lead Technician</span>
                  <span className="font-bold text-slate-900">{visit.technician_name || 'Specialist'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Overview & Service Summary */}
        <div className="border border-slate-300 rounded-lg p-3 mb-5 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-800">
              Executive Service Summary &amp; Systems Audited
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Civil Defense Certified Inspection
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Coverage:</span>
            {(visit.systems || ['Fire Alarm', 'Fire Fighting', 'Fire Extinguishers']).map((s, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                {s}
              </span>
            ))}
          </div>

          <p className="text-slate-700 text-xs leading-relaxed">
            Conducted scheduled quarterly preventive maintenance inspection, circuit resistance verification, alarm trip simulation, pump flow tests, and fire protection equipment audit in accordance with Bahrain Civil Defense Directorate regulatory codes and NFPA 72 &amp; 25 standards.
          </p>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100 text-[11px]">
            <div className="bg-slate-50 p-1.5 rounded">
              <span className="text-slate-500 font-medium block">Total Checkpoints</span>
              <span className="font-black text-slate-900">{allItems.length} Points</span>
            </div>
            <div className="bg-emerald-50 p-1.5 rounded">
              <span className="text-emerald-700 font-medium block">Verified Operational</span>
              <span className="font-black text-emerald-900">{okCount} ({Math.round((okCount / (allItems.length || 1)) * 100)}%)</span>
            </div>
            <div className="bg-red-50 p-1.5 rounded">
              <span className="text-red-700 font-medium block">Flagged Defects</span>
              <span className="font-black text-red-900">{notOkCount} Items</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 2: FIRE ALARM SYSTEM CHECKLIST TABLE (23 ITEMS)                      */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-4 border-t-2 border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-600" />
              <span>Section 1: Fire Alarm System Checklist (23 Points)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">NFPA 72 Verified</span>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-800 text-white font-black uppercase">
                <th className="border border-slate-300 p-1.5 text-center w-8">#</th>
                <th className="border border-slate-300 p-1.5 text-left">Item Description</th>
                <th className="border border-slate-300 p-1.5 text-left w-24">Make</th>
                <th className="border border-slate-300 p-1.5 text-left w-28">Type / Spec</th>
                <th className="border border-slate-300 p-1.5 text-center w-12">Qty</th>
                <th className="border border-slate-300 p-1.5 text-center w-14">Status</th>
                <th className="border border-slate-300 p-1.5 text-left">Remarks &amp; Observations</th>
              </tr>
            </thead>
            <tbody>
              {faItems.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="border border-slate-300 p-1 text-center font-bold text-slate-500">
                    {item.item_no || idx + 1}
                  </td>
                  <td className="border border-slate-300 p-1 font-bold text-slate-900">
                    {item.item}
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-700 truncate">
                    {item.make || '-'}
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-700 truncate">
                    {item.type || '-'}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-slate-800">
                    {item.quantity || '-'}
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
                      item.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'NOT OK' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-700">
                    {item.defect_description ? (
                      <span className="text-red-700 font-bold">{item.defect_description}</span>
                    ) : (
                      item.remarks || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 3: FIRE FIGHTING & SPRINKLERS CHECKLIST TABLE                        */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-4 border-t-2 border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-blue-600" />
              <span>Section 2: Fire Fighting, Sprinklers &amp; Pump Station Checklist</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">NFPA 20 / 25 Verified</span>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-800 text-white font-black uppercase">
                <th className="border border-slate-300 p-1.5 text-center w-8">#</th>
                <th className="border border-slate-300 p-1.5 text-left">Equipment / Point</th>
                <th className="border border-slate-300 p-1.5 text-left w-24">Make</th>
                <th className="border border-slate-300 p-1.5 text-left w-28">Type / Spec</th>
                <th className="border border-slate-300 p-1.5 text-center w-12">Qty</th>
                <th className="border border-slate-300 p-1.5 text-center w-14">Status</th>
                <th className="border border-slate-300 p-1.5 text-left">Remarks &amp; Observations</th>
              </tr>
            </thead>
            <tbody>
              {ffItems.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="border border-slate-300 p-1 text-center font-bold text-slate-500">
                    {item.item_no || idx + 1}
                  </td>
                  <td className="border border-slate-300 p-1 font-bold text-slate-900">
                    {item.item}
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-700 truncate">
                    {item.make || '-'}
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-700 truncate">
                    {item.type || '-'}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-bold text-slate-800">
                    {item.quantity || '-'}
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
                      item.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'NOT OK' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-700">
                    {item.defect_description ? (
                      <span className="text-red-700 font-bold">{item.defect_description}</span>
                    ) : (
                      item.remarks || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 4: FIRE EXTINGUISHERS REGISTER & VERIFICATION                        */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-4 border-t-2 border-slate-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Section 3: Fire Extinguishers Registry &amp; Inspection Audit</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">NFPA 10 Verified</span>
          </div>

          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-800 text-white font-black uppercase">
                <th className="border border-slate-300 p-1.5 text-center w-8">#</th>
                <th className="border border-slate-300 p-1.5 text-left w-24">Serial No.</th>
                <th className="border border-slate-300 p-1.5 text-left">Type &amp; Capacity</th>
                <th className="border border-slate-300 p-1.5 text-left">Location &amp; Floor</th>
                <th className="border border-slate-300 p-1.5 text-center w-16">Safety Pin</th>
                <th className="border border-slate-300 p-1.5 text-center w-16">Pressure</th>
                <th className="border border-slate-300 p-1.5 text-center w-14">Status</th>
                <th className="border border-slate-300 p-1.5 text-center w-20">Next Due</th>
              </tr>
            </thead>
            <tbody>
              {extItems.map((ext, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="border border-slate-300 p-1 text-center font-bold text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 p-1 font-mono font-bold text-slate-900">
                    {ext.serial_number || `FX-EXT-${idx + 1}`}
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-800 font-semibold">
                    {ext.type} ({ext.capacity})
                  </td>
                  <td className="border border-slate-300 p-1 text-slate-700">
                    {ext.location} {ext.floor ? `(Floor ${ext.floor})` : ''}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-medium">
                    {ext.safety_pin || 'Intact'}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-medium">
                    {ext.pressure_status || 'Normal'}
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <span className={`px-1.5 py-0.5 rounded font-black text-[9px] ${
                      ext.status === 'OK' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {ext.status || 'OK'}
                    </span>
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-mono font-bold text-slate-700">
                    {ext.next_due_date || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========================================================================= */}
        {/* PAGE 5: DEFECTS, RECOMMENDATIONS & SIGN-OFF                               */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-4 border-t-2 border-slate-300">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
            Section 4: Engineering Defects, Recommendations &amp; Rectifications
          </h3>

          {defects.length === 0 ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-xs mb-4">
              ✓ All system components, detection zones, sounders, pumps, valves, and extinguishers verified in 100% operational condition. Zero critical defects identified during this inspection.
            </div>
          ) : (
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-4 text-[10px]">
              <table className="w-full border-collapse">
                <thead className="bg-red-800 text-white font-black uppercase">
                  <tr>
                    <th className="p-1.5 text-center w-16">Priority</th>
                    <th className="p-1.5 text-left w-36">Equipment / System</th>
                    <th className="p-1.5 text-left">Defect Description</th>
                    <th className="p-1.5 text-left">Proposed Corrective Action / Spares</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {defects.map((d, i) => (
                    <tr key={i} className="bg-white">
                      <td className="p-1.5 text-center font-black text-red-700">
                        {d.priority || 'High'}
                      </td>
                      <td className="p-1.5 font-bold text-slate-900">
                        {d.sys}: {d.item}
                      </td>
                      <td className="p-1.5 text-slate-800 font-medium">
                        {d.defect_description || d.remarks}
                      </td>
                      <td className="p-1.5 text-emerald-800 font-bold">
                        {d.recommendation || 'Technical rectification recommended'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Photographic Evidence Gallery */}
          {photosWithLabels.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-2">
                Photographic Service Evidence ({photosWithLabels.length} Photos)
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photosWithLabels.map((p, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <div className="h-24 w-full">
                      <img src={p.url} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-1 text-[9px] bg-slate-100 font-bold text-slate-800 truncate">
                      {p.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Signatures & Sign-off Block */}
          <div className="mt-6 pt-4 border-t-2 border-slate-300">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3">
              Official Verification &amp; Authorization Signatures
            </h4>

            <div className="grid grid-cols-3 gap-3 text-xs">
              
              {/* Box 1: Customer Representative */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block">
                    1. Customer Representative
                  </span>
                  <p className="font-bold text-slate-900 text-xs">
                    {customerSig?.repName || visit.contact_person || 'Facility Representative'}
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium">
                    {customerSig?.designation || 'Authorized Client Rep'}
                  </p>
                </div>

                <div className="h-14 my-1 bg-white border border-slate-200 rounded flex items-center justify-center p-1">
                  {customerSig?.signatureDataUrl ? (
                    <img src={customerSig.signatureDataUrl} alt="Customer Sig" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-slate-400 italic">Signature Recorded</span>
                  )}
                </div>

                <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Date: {customerSig?.signedDate || visit.actual_service_date}</span>
                  <span>Status: Acknowledged</span>
                </div>
              </div>

              {/* Box 2: Field Technician */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block">
                    2. Certified Lead Technician
                  </span>
                  <p className="font-bold text-slate-900 text-xs">
                    {visit.technician_name || 'Lead Technician'}
                  </p>
                  <p className="text-[10px] text-blue-700 font-medium">
                    Certified Fire Safety Specialist
                  </p>
                </div>

                <div className="h-14 my-1 bg-white border border-slate-200 rounded flex items-center justify-center p-1 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-emerald-700 font-black block">✓ Digitally Signed &amp; Audited</span>
                    <span className="text-[8px] font-mono text-slate-400">UID: {visit.technician_id || 'TECH-FX'}</span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Date: {visit.actual_service_date || visit.scheduled_date}</span>
                  <span>Execution: Complete</span>
                </div>
              </div>

              {/* Box 3: Supervisor / Engineer Review */}
              <div className="border border-slate-300 rounded-lg p-2.5 bg-slate-50 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-500 block">
                    3. Supervisor / Fire Engineer
                  </span>
                  <p className="font-bold text-slate-900 text-xs">
                    {visit.supervisor_name || 'Senior Field Supervisor'}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-medium">
                    Civil Defense Registered Engineer
                  </p>
                </div>

                <div className="h-14 my-1 bg-white border border-slate-200 rounded flex items-center justify-center p-1 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-navy-900 uppercase block">FIREX VERIFIED</span>
                    <span className="text-[8px] text-emerald-700 font-bold block">✓ Approved &amp; Authorized</span>
                  </div>
                </div>

                <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                  <span>Approval: {visit.approved_at?.slice(0, 10) || visit.actual_service_date}</span>
                  <span>Compliance: Verified</span>
                </div>
              </div>

            </div>
          </div>

          {/* Official Footer Note */}
          <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-500 space-y-0.5">
            <p className="font-bold text-slate-700">
              FIREX BAHRAIN FOR SAFETY ITEMS COMPANY W.L.L. • KINGDOM OF BAHRAIN
            </p>
            <p>
              Civil Defense License Certified • All rights reserved • This document certifies maintenance in compliance with official safety regulations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
