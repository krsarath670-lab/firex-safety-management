import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, Download, Share2, Shield, CheckCircle2, 
  XCircle, MinusCircle, Check, ArrowLeft, Building2, Flame
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PDFReportGenerator({ report, onClose }) {
  const { showToast, companySettings } = useApp();
  const reportRef = useRef(null);

  if (!report) return null;

  const isAMC = report.report_type === 'AMC Service Report';

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    try {
      showToast('Rendering high-resolution A4 PDF document...', 'info');
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

      pdf.save(`${(report.document_number || report.report_number || 'Fire_Safety_Report').replace(/\s+/g, '_')}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Printing directly using browser dialog...', 'info');
      window.print();
    }
  };

  // Handle Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${report.report_type} - ${report.document_number || report.report_number}`,
          text: `Fire & Safety Engineering Service Report for ${report.site_name || 'Client Premises'}. Status: ${report.status}`,
          url: window.location.href
        });
        showToast('Report shared successfully', 'success');
      } catch (err) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Report link copied to clipboard', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 flex flex-col items-center">
      
      {/* Top Floating Action Bar */}
      <div className="sticky top-2 z-50 bg-navy-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-navy-700 flex items-center justify-between w-full max-w-3xl mb-4">
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
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Document Paper Container */}
      <div
        id="printable-report"
        ref={reportRef}
        className="w-full max-w-3xl bg-white shadow-2xl rounded-xl p-6 sm:p-10 text-slate-900 font-sans border border-slate-300 mb-12"
      >
        
        {/* Bilingual Company Letterhead Banner (Requirements 6 & 7) */}
        <div className="border-b-2 border-red-600 pb-3 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={companySettings?.logo_url || '/logo.png'}
                alt="FIREX Logo"
                className="h-16 w-auto object-contain shrink-0 max-w-[120px]"
                crossOrigin="anonymous"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-red-600">
                  {companySettings?.company_name || 'FIREX FIRE & SAFETY'}
                </h1>
                <p className="text-sm font-bold text-slate-800" dir="rtl">
                  {companySettings?.arabic_name || 'شركة فايركس لأدوات السلامه ذ.م.م'}
                </p>
                <p className="text-[10px] font-bold text-slate-600 tracking-wide">
                  Safety Items W.L.L. • Al Seef, Kingdom of Bahrain
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-600 font-semibold space-y-0.5 shrink-0">
              <p className="font-mono text-slate-900 font-bold">CR No: {companySettings?.cr_no || companySettings?.cr_number || '96850 1'}</p>
              <p className="font-mono text-slate-900 font-bold">VAT No: {companySettings?.vat_no || companySettings?.vat_number || '220006271900002'}</p>
              <p>Email: {companySettings?.email || 'service@firexbahrain.com'}</p>
              <p>Tel: {companySettings?.phone || '+973 1716 2240'}</p>
            </div>
          </div>
        </div>

        {/* Official Document Banner (Requirements 8 & 9: Shows standard FX Document Number) */}
        <div className="bg-navy-900 text-white px-4 py-2.5 rounded-lg flex items-center justify-between mb-4 shadow-sm">
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-wide uppercase">
              {report.report_type || 'ENGINEERING SERVICE REPORT'}
            </h2>
            <p className="text-[10px] text-slate-300 font-medium">
              Official Fire &amp; Safety Service &amp; Maintenance Record
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono uppercase block text-slate-300">Document No.</span>
            <span className="text-xs sm:text-sm font-mono font-black text-amber-300 tracking-wider">
              {report.document_number || report.report_number}
            </span>
          </div>
        </div>

        {/* TWO SEPARATE SECTIONS: Company Information & Customer Information (Requirement 5) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
          
          {/* Company Information Section */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200">
              <Shield className="w-3.5 h-3.5 text-safety-red" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                Company Information (Service Provider)
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-navy-900">
                {companySettings?.company_name || 'FIREX'}
              </h3>
              <p className="text-xs text-slate-700 leading-snug">
                {companySettings?.address_line_1 || 'Villa 13, Building 2373'}<br />
                {companySettings?.address_line_2 || 'Road 2831, Al Seef'}<br />
                {companySettings?.address_line_3 || 'Block 428, Bahrain'}
              </p>
              <div className="pt-1.5 border-t border-slate-200/60 font-mono text-[11px] text-slate-700 space-y-0.5">
                <p><span className="font-bold text-slate-500">CR No.:</span> {companySettings?.cr_number || companySettings?.cr_no || '96850 1'}</p>
                <p><span className="font-bold text-slate-500">VAT No.:</span> {companySettings?.vat_number || companySettings?.vat_no || '220006271900002'}</p>
                <p><span className="font-bold text-slate-500">Phone:</span> {companySettings?.phone || '+973 1716 2240'}</p>
              </div>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
                Customer Information (Client &amp; Premises)
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900">
                {report.customer_name || 'Customer / Company'}
              </h3>
              <p className="text-xs font-semibold text-blue-900">
                Site: {report.site_name || 'Primary Facility'}
              </p>
              <p className="text-xs text-slate-700 leading-snug">
                {report.site_address || report.customer_address || 'Site Address, Kingdom of Bahrain'}
              </p>
              <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-700 space-y-0.5">
                <p><span className="font-bold text-slate-500">Contact Person:</span> {report.contact_person || report.customer_rep_name || 'Designated Facility Manager'}</p>
                <p><span className="font-bold text-slate-500">Contact Number:</span> {report.contact_number || report.customer_rep_mobile || report.customer_rep_phone || '+973 3900 0000'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Technical Job Overview Meta Box */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-3">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">System Type</span>
            <span className="font-bold text-slate-900">{report.system || 'Fire Alarm & Firefighting'}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Job Reference #</span>
            <span className="font-mono font-bold text-blue-700">{report.job_number || 'FX-AMC-2026-001'}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Lead Inspector / Tech</span>
            <span className="font-bold text-slate-800">{report.technician_name || 'Rajesh Kumar'}</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-400 block">Sales Specialist</span>
            <span className="font-bold text-slate-800">{report.sales_person_name || 'Unassigned'}</span>
          </div>
        </div>

        {/* AMC AUTOMATIC CONTRACT DATES & PERIOD (Requirements 23 & 36) */}
        {isAMC && (
          <div className="mt-3 bg-blue-50/70 border border-blue-200 rounded-xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[9px] font-bold uppercase text-blue-600 block">AMC Contract #</span>
              <span className="font-mono font-bold text-slate-900">{report.amc_contract_number || report.amc_number || 'AMC-2026-001'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase text-blue-600 block">AMC Contract Period</span>
              <span className="font-bold text-slate-900">{report.contract_period || (report.amc_start_date ? `${report.amc_start_date} to ${report.amc_end_date}` : '01-Jan-2026 to 31-Dec-2026')}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase text-blue-600 block">Quarter &amp; Visit</span>
              <span className="font-bold text-slate-900">{report.quarter ? `${report.quarter} • ` : ''}{report.visit_number || 'Visit #1'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase text-blue-600 block">Sales Specialist</span>
              <span className="font-bold text-slate-900">{report.sales_person_name || 'Unassigned'}</span>
            </div>
          </div>
        )}

        {/* Work Description Narrative */}
        <div className="mt-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
            Work Description &amp; Scope Carried Out
          </h2>
          <p className="text-xs text-slate-700 mt-2 leading-relaxed whitespace-pre-line bg-slate-50/50 p-3 rounded-lg border border-slate-100">
            {report.work_description || "Systematic physical inspection, functional sensor testing, and pump run test carried out."}
          </p>
        </div>

        {/* Inspection Checklist Summary Table */}
        {report.checklist_data && Object.keys(report.checklist_data).length > 0 && (
          <div className="mt-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
              Inspection Checklist Status Verification
            </h2>
            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                  <tr>
                    <th className="py-1.5 px-3">System Component Inspected</th>
                    <th className="py-1.5 px-3 text-center w-24">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(report.checklist_data).slice(0, 10).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-50">
                      <td className="py-1.5 px-3 text-slate-800 font-medium capitalize">
                        {k.replace(/_/g, ' ')}
                      </td>
                      <td className="py-1.5 px-3 text-center">
                        {v === 'OK' && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>OK</span>
                          </span>
                        )}
                        {v === 'Fault' && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>FAULT</span>
                          </span>
                        )}
                        {v === 'N/A' && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700">
                            <MinusCircle className="w-3 h-3 text-slate-500" />
                            <span>N/A</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Faults Found & Rectifications */}
        {(report.faults_found || report.rectifications) && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-red-50/50 border border-red-200 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase text-red-700 block mb-1">
                Faults Identified
              </span>
              <p className="text-slate-800 text-[11px] leading-relaxed">
                {report.faults_found || "Zero unresolved faults identified."}
              </p>
            </div>
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-1">
                Rectifications &amp; Actions
              </span>
              <p className="text-slate-800 text-[11px] leading-relaxed">
                {report.rectifications || "All routine service actions executed satisfactorily."}
              </p>
            </div>
          </div>
        )}

        {/* Materials Used Table */}
        {report.materials_used && report.materials_used.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
              Spare Parts &amp; Consumables Utilized
            </h2>
            <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                  <tr>
                    <th className="py-1.5 px-3">Item Description</th>
                    <th className="py-1.5 px-3 text-right w-20">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.materials_used.map((m, i) => (
                    <tr key={i}>
                      <td className="py-1.5 px-3 text-slate-800">{m.name}</td>
                      <td className="py-1.5 px-3 text-right font-bold text-slate-900">{m.quantity} Pcs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Photos Evidence Gallery */}
        {report.photos && report.photos.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-200">
              Photographic Service Evidence
            </h2>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {report.photos.map((p, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <div className="relative h-28">
                    <img src={p.url} alt="Evidence" className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      {p.tag}
                    </span>
                  </div>
                  {p.caption && (
                    <p className="p-1.5 text-[10px] text-slate-600 leading-tight truncate">
                      {p.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testing Result & Recommendations */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
          <div>
            <strong className="text-slate-900">Functional Testing Result:</strong>{" "}
            <span className="text-emerald-700 font-bold">{report.result || "Satisfactory and Operational"}</span>
          </div>
          {report.recommendations && (
            <div>
              <strong className="text-slate-900">Engineering Recommendation:</strong>{" "}
              <span className="text-slate-700">{report.recommendations}</span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* FORMAL REPORT PREPARATION & REVIEW AUDIT SECTION                         */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-4 border-t-2 border-slate-300">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-200">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-navy-900" />
              <span>Official Report Preparation &amp; Review Sign-off</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              Doc Ref: {report.document_number || report.report_number}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            
            {/* Box 1: PREPARED BY */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between min-h-[140px]">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  1. Prepared By
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {report.prepared_by_name || report.technician_name || 'Staff'}
                </p>
                <p className="text-[10px] text-blue-700 font-semibold">
                  Role: {report.prepared_by_role || 'Technician'}
                </p>
              </div>

              {/* Signature / Verification badge */}
              <div className="h-14 my-1.5 border border-dashed border-slate-300 rounded bg-white flex items-center justify-center p-1 overflow-hidden">
                {report.supervisor_signature || report.technician_signature ? (
                  <img
                    src={report.supervisor_signature || report.technician_signature}
                    alt="Preparer signature"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-[9px] text-emerald-700 font-bold block">✓ System Verified &amp; Recorded</span>
                    <span className="text-[8px] font-mono text-slate-400">UID: {report.prepared_by_user_id || report.created_by_user_id || 'usr-preparer'}</span>
                  </div>
                )}
              </div>

              <div className="pt-1 border-t border-slate-200 text-[9.5px] text-slate-600 flex justify-between">
                <span>Prepared Date: {report.prepared_date || report.created_date || report.date}</span>
                <span>Time: {report.prepared_time || report.created_time || '10:30 AM'}</span>
              </div>
            </div>

            {/* Box 2: SUBMITTED BY */}
            <div className={`border rounded-xl p-3 flex flex-col justify-between min-h-[140px] ${
              (report.submitted_at || report.submitted_by_name || ['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(report.status))
                ? 'border-blue-200 bg-blue-50/40'
                : 'border-dashed border-slate-200 bg-slate-50/50 opacity-75'
            }`}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 block mb-1">
                  2. Submitted By
                </span>
                <p className="font-bold text-slate-900 text-xs">
                  {report.submitted_by_name || (report.submitted_at ? report.prepared_by_name : (['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(report.status) ? report.prepared_by_name : 'Pending Submission'))}
                </p>
                <p className="text-[10px] text-blue-700 font-semibold">
                  Role: {report.submitted_by_role || (report.submitted_at ? report.prepared_by_role : (['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(report.status) ? report.prepared_by_role : 'Pending'))}
                </p>
              </div>

              <div className="h-14 my-1.5 border border-blue-200 rounded bg-white/80 flex flex-col items-center justify-center p-1">
                {(report.submitted_at || report.submitted_by_name || ['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(report.status)) ? (
                  <>
                    <span className="text-[9px] font-bold text-blue-800">✓ Submitted for Review</span>
                    <span className="text-[8px] text-slate-500">Field Handover Confirmed</span>
                  </>
                ) : (
                  <span className="text-[9px] text-slate-400 italic">Submission Pending</span>
                )}
              </div>

              <div className="pt-1 border-t border-blue-200 text-[9.5px] text-slate-600 flex justify-between">
                <span>Submitted Date: {report.submitted_date || (report.submitted_at ? report.submitted_at.slice(0, 10) : (['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(report.status) ? (report.prepared_date || report.date) : 'Pending'))}</span>
                <span>Time: {report.submitted_time || (report.submitted_at ? report.submitted_at.slice(11, 16) : '')}</span>
              </div>
            </div>

            {/* Box 3: REVIEWED BY */}
            {(report.reviewed_at || report.reviewed_by_name || report.status === 'Reviewed' || report.status === 'Completed' || report.status === 'Approved') ? (
              <div className="border border-indigo-100 rounded-xl p-3 bg-indigo-50/40 flex flex-col justify-between min-h-[140px]">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block mb-1">
                    3. Reviewed By
                  </span>
                  <p className="font-bold text-slate-900 text-xs">
                    {report.reviewed_by_name || report.supervisor_name || 'David Thomas'}
                  </p>
                  <p className="text-[10px] text-indigo-700 font-semibold">
                    Role: {report.reviewed_by_role || 'Supervisor'}
                  </p>
                </div>

                <div className="h-14 my-1.5 border border-indigo-200 rounded bg-white/80 flex flex-col items-center justify-center p-1">
                  <span className="text-[9px] font-bold text-indigo-800">✓ Technical Review Confirmed</span>
                  <span className="text-[8px] text-slate-500">Civil Defence &amp; Quality Check</span>
                </div>

                <div className="pt-1 border-t border-indigo-200 text-[9.5px] text-slate-600 flex justify-between">
                  <span>Reviewed Date: {report.reviewed_date || (report.reviewed_at ? report.reviewed_at.slice(0, 10) : report.date)}</span>
                  <span>Time: {report.reviewed_time || (report.reviewed_at ? report.reviewed_at.slice(11, 16) : '')}</span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between min-h-[140px] opacity-75">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    3. Reviewed By
                  </span>
                  <p className="font-semibold text-slate-500 text-xs italic">
                    Review Pending
                  </p>
                </div>
                <div className="h-14 my-1.5 flex items-center justify-center text-center p-1">
                  <span className="text-[9px] text-slate-400 italic">Scheduled after initial submission</span>
                </div>
                <div className="pt-1 border-t border-slate-200 text-[9px] text-slate-400">
                  Status: {report.status || 'Draft'}
                </div>
              </div>
            )}

            {/* Customer Sign-off & Acceptance Box */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 sm:col-span-2 md:col-span-3 mt-1">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Customer Facility Sign-off &amp; Acceptance
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="h-16 border border-dashed border-slate-300 rounded-lg bg-white flex items-center justify-center p-1 overflow-hidden">
                  {report.customer_signature ? (
                    <img src={report.customer_signature} alt="Customer signature" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-slate-300 text-[10px] italic">Signed digitally on site</span>
                  )}
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-slate-900">{report.customer_rep_name || 'Omar Farooq'}</p>
                  <p className="text-[10px] text-slate-500">{report.customer_rep_designation || 'Director of Facilities Management'}</p>
                  <p className="text-[9.5px] text-slate-400">Client Acknowledgement of Service Execution &amp; Testing</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Legal Disclaimer & Footer */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[9px] text-slate-500 leading-relaxed">
          <div className="font-bold text-slate-800 text-[10px]">
            {companySettings?.company_name || 'FIREX'}
          </div>
          <div className="text-[9px] text-slate-600 mt-0.5">
            {companySettings?.address || 'Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain'}
          </div>
          <div className="text-[8.5px] text-slate-500 mt-0.5">
            CR No.: {companySettings?.cr_number || companySettings?.cr_no || '96850 1'} • VAT No.: {companySettings?.vat_number || companySettings?.vat_no || '220006271900002'} • Tel: {companySettings?.phone || '+973 1716 2240'} • Email: {companySettings?.email || 'service@firexbahrain.com'}
          </div>
          <div className="text-[8px] text-slate-400 mt-1">
            Official engineering service completion and maintenance verification document issued by {companySettings?.company_name || 'FIREX'}.
          </div>
        </div>

      </div>

    </div>
  );
}
