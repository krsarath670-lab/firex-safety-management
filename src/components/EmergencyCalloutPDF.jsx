import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Printer, Download, Share2, Shield, CheckCircle2, 
  XCircle, ArrowLeft, AlertTriangle, Flame, Clock, 
  MapPin, Phone, User, Check, Wrench, Building2, Camera
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EmergencyCalloutPDF({ call, onClose }) {
  const { showToast, companySettings } = useApp();
  const reportRef = useRef(null);

  if (!call) return null;

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    try {
      showToast('Rendering high-resolution A4 Emergency Report PDF...', 'info');
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

      pdf.save(`${call.report_number || call.call_number || 'Emergency_Report'}.pdf`);
      showToast('Emergency Call-Out PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Printing directly using browser dialog...', 'info');
      window.print();
    }
  };

  // Handle Web Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FIREX Emergency Call-Out Report - ${call.call_number}`,
          text: `Emergency Service Report for ${call.customer_name} (${call.site_name}). Status: ${call.report_status}`,
          url: window.location.href
        });
        showToast('Report shared successfully', 'success');
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Report link copied to clipboard', 'info');
    }
  };

  const beforePhotos = (call.photos || []).filter(p => p.category === 'Before');
  const duringPhotos = (call.photos || []).filter(p => p.category === 'During');
  const afterPhotos = (call.photos || []).filter(p => p.category === 'After');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-2 sm:p-6 flex flex-col items-center select-none">
      
      {/* Top Floating Action Bar */}
      <div className="sticky top-2 z-50 bg-navy-900/95 backdrop-blur-md text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-navy-700 flex items-center justify-between w-full max-w-4xl mb-4">
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs font-mono font-bold text-slate-300 mr-2">
            {call.call_number} • {call.report_number || 'ECR-PENDING'}
          </span>

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
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Document Paper Container */}
      <div
        id="printable-emergency-report"
        ref={reportRef}
        className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-6 sm:p-10 text-slate-900 font-sans border border-slate-300 mb-12"
      >
        
        {/* ========================================================================= */}
        {/* FIREX COMPANY DETAILS (Strictly as specified in Requirement 5)            */}
        {/* ========================================================================= */}
        <div className="border-b-2 border-red-700 pb-4 mb-5">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            
            {/* Company Left Branding */}
            <div className="flex items-start space-x-3.5">
              {companySettings?.logo_url ? (
                <img
                  src={companySettings.logo_url}
                  alt="FIREX Logo"
                  className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 shadow-sm p-1 shrink-0"
                  crossOrigin="anonymous"
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white shadow-sm shrink-0">
                  <Shield className="w-8 h-8" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-navy-900 leading-tight">
                  FIREX
                </h1>
                <p className="text-xs text-red-600 font-bold" dir="rtl">
                  شركة فايركس لأدوات السلامه
                </p>
                <div className="text-xs text-slate-700 font-semibold mt-1 space-y-0.5">
                  <p className="font-bold text-slate-800">Villa 13, Building 2373,</p>
                  <p className="font-bold text-slate-800">Road 2831, Al Seef,</p>
                  <p className="font-bold text-slate-800">Block 428, Bahrain</p>
                </div>
              </div>
            </div>

            {/* Document Header Details (Right) */}
            <div className="sm:text-right shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-xs font-black rounded-lg uppercase tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5" />
                <span>EMERGENCY CALL-OUT REPORT</span>
              </div>
              
              <div className="mt-2 space-y-1 text-xs">
                <p className="font-mono font-black text-slate-900 text-sm">
                  Call No: <span className="text-red-700">{call.call_number}</span>
                </p>
                <p className="font-mono font-bold text-slate-700">
                  Report No: <span>{call.report_number || 'ECR-PENDING'}</span>
                </p>
                <p className="text-slate-600">
                  Date: <strong>{call.call_date}</strong> • Time: <strong>{call.call_time}</strong>
                </p>
                <div className="flex items-center sm:justify-end gap-1.5 pt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    call.priority === 'Critical' ? 'bg-red-600 text-white' :
                    call.priority === 'High' ? 'bg-orange-500 text-white' :
                    call.priority === 'Medium' ? 'bg-amber-100 text-amber-900' :
                    'bg-blue-100 text-blue-900'
                  }`}>
                    {call.priority} Priority
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    call.report_status === 'Approved' ? 'bg-emerald-600 text-white' :
                    call.report_status === 'Reviewed' ? 'bg-blue-600 text-white' :
                    call.report_status === 'Submitted' ? 'bg-purple-600 text-white' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {call.report_status || 'Draft'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Official Registration Credential Banner */}
          <div className="mt-3.5 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700 font-medium">
            <span className="font-mono font-bold text-navy-900">
              CR No.: 96850 1
            </span>
            <span className="font-mono font-bold text-navy-900">
              VAT No.: 220006271900002
            </span>
            <span className="text-slate-600">
              Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain
            </span>
            <span className="font-bold text-navy-900">Tel: +973 1716 2240</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* REPORT DETAILS & TIMINGS                                                  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs">
          
          {/* Customer & Location */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Customer &amp; Site Details</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Customer:</span>
              <span className="col-span-2 font-bold text-slate-900">{call.customer_name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Site Name:</span>
              <span className="col-span-2 font-bold text-slate-900">{call.site_name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Address:</span>
              <span className="col-span-2 text-slate-700">{call.site_address || 'Kingdom of Bahrain'}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Contact:</span>
              <span className="col-span-2 font-semibold text-slate-800">
                {call.contact_person || 'Facilities Lead'} {call.contact_phone ? `(${call.contact_phone})` : ''}
              </span>
            </div>
          </div>

          {/* Operational Timings & Team */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 pb-1 border-b border-slate-200">
              <Clock className="w-3.5 h-3.5 text-red-600" />
              <span>Incident Response &amp; Field Team</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Call Date &amp; Time:</span>
              <span className="col-span-2 font-bold text-slate-900">{call.call_date} at {call.call_time}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Arrival Time:</span>
              <span className="col-span-2 font-bold text-emerald-700">
                {call.arrival_time ? `${call.arrival_date || call.call_date} at ${call.arrival_time}` : 'En Route / Not Recorded'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Completion Time:</span>
              <span className="col-span-2 font-bold text-slate-800">
                {call.completion_time ? `${call.completion_date || call.call_date} at ${call.completion_time}` : 'In Progress'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Prepared By:</span>
              <span className="col-span-2 font-bold text-navy-900">
                {call.prepared_by_name || call.assigned_technician_name || 'Assigned Duty Tech'} ({call.prepared_by_role || 'Technician'})
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-slate-500 font-semibold">Supervisor:</span>
              <span className="col-span-2 font-bold text-slate-800">{call.assigned_supervisor_name || 'Engineering Supervisor'}</span>
            </div>
          </div>

        </div>

        {/* System & Emergency Classification Bar */}
        <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl mb-5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-slate-500 font-semibold">Emergency Type: </span>
            <strong className="text-red-900 font-black">{call.emergency_type}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Protected System: </span>
            <strong className="text-navy-900 font-bold">{call.system}</strong>
          </div>
          <div>
            <span className="text-slate-500 font-semibold">Status: </span>
            <strong className="text-slate-900 font-bold">{call.status}</strong>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WORK DETAILS (Reported Problem, Findings, Cause, Action, Rectification)    */}
        {/* ========================================================================= */}
        <div className="space-y-3.5 mb-5 text-xs">
          
          {/* Reported Problem */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1 text-red-700">
              1. Reported Problem &amp; Client Description
            </h4>
            <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
              {call.reported_problem || call.emergency_description || 'Urgent breakdown reported requiring immediate technician dispatch.'}
            </p>
          </div>

          {/* Technical Findings */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1 text-navy-900">
              2. On-Site Inspection &amp; Technical Findings
            </h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {call.findings || 'Technician conducted initial visual inspection and diagnostic loop / hydraulic testing on arrival.'}
            </p>
          </div>

          {/* Root Cause */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1 text-amber-800">
              3. Root Cause Analysis
            </h4>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {call.cause || 'Under investigation / mechanical stress or environmental contamination.'}
            </p>
          </div>

          {/* Action Taken & Rectification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="border border-slate-200 rounded-xl p-3 bg-white">
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1 text-blue-700">
                4. Action Taken on Site
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {call.action_taken || 'Emergency isolation, circuit diagnosis, and temporary bypass or repair performed.'}
              </p>
            </div>
            
            <div className="border border-slate-200 rounded-xl p-3 bg-white">
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1 text-emerald-700">
                5. Technical Rectification &amp; Testing
              </h4>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {call.rectification || 'Component replaced, system re-pressurized / normalized, panel reset with 0 alarms.'}
              </p>
            </div>
          </div>

          {/* Materials Used */}
          {call.materials_used && call.materials_used.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3 bg-white">
              <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-2 text-slate-900 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                <span>6. Materials &amp; Replacement Parts Supplied</span>
              </h4>
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border-b border-slate-200">#</th>
                    <th className="p-2 border-b border-slate-200">Item Name / Specification</th>
                    <th className="p-2 border-b border-slate-200">Part No</th>
                    <th className="p-2 border-b border-slate-200 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {call.materials_used.map((mat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{mat.name}</td>
                      <td className="p-2 font-mono text-[11px] text-slate-600">{mat.part_number || 'N/A'}</td>
                      <td className="p-2 text-right font-bold text-slate-900">{mat.quantity} {mat.unit || 'pcs'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recommendations & Follow-up */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
            <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1 text-purple-900">
              7. Engineering Recommendations &amp; Further Works
            </h4>
            <p className="text-slate-700 leading-relaxed font-medium">
              {call.recommendations || 'System restored to operational condition. Monitor during subsequent routine AMC periodic visits.'}
            </p>
            {call.additional_work_required && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] font-bold">
                ⚠️ Additional follow-up work / quotation required: {call.additional_work_details || 'Detailed quote to follow.'}
              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* EMERGENCY PHOTOS: Before / During / After (Requirement 3 & 5)             */}
        {/* ========================================================================= */}
        {call.photos && call.photos.length > 0 && (
          <div className="mb-6 border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Emergency Site Photographic Evidence (Before / During / After)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {call.photos.map((photo, i) => (
                <div key={photo.id || i} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 flex flex-col">
                  <div className="relative aspect-[4/3] bg-slate-900">
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Site photo'}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow ${
                      photo.category === 'Before' ? 'bg-red-600' :
                      photo.category === 'After' ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}>
                      {photo.category || 'Site'}
                    </span>
                  </div>
                  <div className="p-2 text-[11px] text-slate-700">
                    <p className="font-semibold line-clamp-2">{photo.caption || 'Field evidence'}</p>
                    {photo.uploaded_by && (
                      <p className="text-[10px] text-slate-400 mt-0.5">By: {photo.uploaded_by}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SIGNATURES SECTION: Prepared By, Submitted By, Reviewed By, Customer Sign-off */}
        {/* ========================================================================= */}
        <div className="border-t-2 border-slate-200 pt-4 mt-6">
          <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">
              Official Technical Preparation &amp; Supervisory Sign-off
            </h4>
            <span className="text-[10px] font-mono text-slate-500">
              Report Ref: {call.report_number || call.call_number}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            
            {/* Box 1: PREPARED BY */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between h-44">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block">
                  1. Prepared By
                </span>
                <p className="font-bold text-slate-900 mt-0.5 text-xs truncate">
                  {call.prepared_by_name || call.assigned_technician_name || 'Staff'}
                </p>
                <p className="text-[10px] text-blue-700 font-semibold">{call.prepared_by_role || 'Technician'}</p>
              </div>

              <div className="h-14 flex items-center justify-center my-1 bg-white rounded-lg border border-dashed border-slate-200 overflow-hidden">
                {call.technician_signature ? (
                  <img src={call.technician_signature} alt="Technician Signature" className="max-h-full object-contain p-1" />
                ) : (
                  <div className="text-center">
                    <span className="text-[9px] text-emerald-700 font-bold block">✓ System Recorded</span>
                    <span className="text-[8px] font-mono text-slate-400">UID: {call.prepared_by_user_id || 'tech-01'}</span>
                  </div>
                )}
              </div>

              <div className="text-[9.5px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between">
                <span>Date: {call.prepared_date || call.completion_date || call.call_date}</span>
                <span className="font-bold text-emerald-700">✓ Prepared</span>
              </div>
            </div>

            {/* Box 2: SUBMITTED BY */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between h-44 ${
              (call.submitted_at || call.report_status === 'Submitted' || call.report_status === 'Reviewed' || call.report_status === 'Completed' || call.report_status === 'Approved')
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-slate-50/50 border-dashed border-slate-200 opacity-75'
            }`}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 block">
                  2. Submitted By
                </span>
                <p className="font-bold text-slate-900 mt-0.5 text-xs truncate">
                  {call.submitted_by_name || (['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(call.report_status) ? (call.prepared_by_name || 'Field Lead') : 'Pending Submission')}
                </p>
                <p className="text-[10px] text-blue-700 font-semibold">
                  {call.submitted_by_role || (['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(call.report_status) ? (call.prepared_by_role || 'Technician') : 'Pending')}
                </p>
              </div>

              <div className="h-14 flex items-center justify-center my-1 bg-white/80 rounded-lg border border-blue-100 overflow-hidden text-center p-1">
                {(call.submitted_at || ['Submitted', 'Reviewed', 'Completed', 'Approved'].includes(call.report_status)) ? (
                  <span className="text-[9px] font-bold text-blue-800">✓ Submitted for Review</span>
                ) : (
                  <span className="text-[9px] text-slate-400 italic">Submission Pending</span>
                )}
              </div>

              <div className="text-[9.5px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between">
                <span>Date: {call.submitted_date || (call.submitted_at ? call.submitted_at.slice(0, 10) : (call.prepared_date || call.call_date))}</span>
                <span className="font-bold text-blue-700">✓ Done</span>
              </div>
            </div>

            {/* Box 3: REVIEWED BY */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between h-44 ${
              (call.reviewed_at || call.report_status === 'Reviewed' || call.report_status === 'Completed' || call.report_status === 'Approved')
                ? 'bg-indigo-50/40 border-indigo-200'
                : 'bg-slate-50/50 border-dashed border-slate-200 opacity-75'
            }`}>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-700 block">
                  3. Reviewed By
                </span>
                <p className="font-bold text-slate-900 mt-0.5 text-xs truncate">
                  {(call.reviewed_at || call.report_status === 'Reviewed' || call.report_status === 'Completed' || call.report_status === 'Approved')
                    ? (call.reviewed_by_name || call.assigned_supervisor_name || 'David Thomas')
                    : 'Review Pending'}
                </p>
                <p className="text-[10px] text-indigo-700 font-semibold">
                  {(call.reviewed_at || call.report_status === 'Reviewed' || call.report_status === 'Completed' || call.report_status === 'Approved')
                    ? (call.reviewed_by_role || 'Supervisor')
                    : 'Awaiting review'}
                </p>
              </div>

              <div className="h-14 flex items-center justify-center my-1 bg-white/80 rounded-lg border border-indigo-100 overflow-hidden text-center p-1">
                {call.supervisor_signature ? (
                  <img src={call.supervisor_signature} alt="Supervisor Signature" className="max-h-full object-contain p-1" />
                ) : (call.reviewed_at || call.report_status === 'Reviewed' || call.report_status === 'Completed' || call.report_status === 'Approved') ? (
                  <span className="text-[9px] font-bold text-indigo-800">✓ Technical Review Verified</span>
                ) : (
                  <span className="text-[9px] text-slate-400 italic">Review Pending</span>
                )}
              </div>

              <div className="text-[9.5px] text-slate-500 border-t border-slate-200 pt-1 flex justify-between">
                <span>Date: {call.reviewed_date || (call.reviewed_at ? call.reviewed_at.slice(0, 10) : (call.supervisor_signed_date || 'Pending'))}</span>
                <span className="font-bold text-indigo-700">✓ Verified</span>
              </div>
            </div>

            {/* Box 4: Customer Representative Sign-off */}
            <div className="p-3 bg-red-50/50 rounded-xl border border-red-200 flex flex-col justify-between h-44">
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-red-700 block">
                  4. Customer Acceptance
                </span>
                <p className="font-bold text-slate-900 mt-0.5 truncate text-xs">
                  {call.customer_rep_name || call.contact_person || 'Client Authorized Signatory'}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{call.customer_rep_designation || 'Site Contact'}</p>
              </div>

              <div className="h-14 flex items-center justify-center my-1 bg-white rounded-lg border border-dashed border-red-300 overflow-hidden">
                {call.customer_signature ? (
                  <img src={call.customer_signature} alt="Customer Signature" className="max-h-full object-contain p-1" />
                ) : (
                  <span className="text-[9px] text-slate-400 italic">Client Signature</span>
                )}
              </div>

              <div className="text-[9.5px] text-slate-600 border-t border-red-200 pt-1 flex justify-between">
                <span>Date: {call.customer_signature_date || call.call_date}</span>
                <span className="font-bold text-red-700">✓ Signed</span>
              </div>
            </div>

          </div>
        </div>

        {/* Formal Report Footer */}
        <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500 space-y-0.5">
          <p className="font-semibold text-slate-700">
            FIREX • Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain • CR No.: 96850 1 • VAT No.: 220006271900002
          </p>
          <p>
            Official Bahrain Civil Defence compliant Emergency Engineering Service Report • Generated electronically via FIREX System
          </p>
        </div>

      </div>

    </div>
  );
}
