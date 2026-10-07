import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Shield, Save, Upload, Image as ImageIcon, CheckCircle, RotateCcw, Eye, FileText, Check, AlertCircle, Calendar } from 'lucide-react';

export default function CompanySettingsView() {
  const { currentUser, showToast, fetchCompanySettings } = useApp();
  const [settings, setSettings] = useState({
    company_name: 'FIREX',
    arabic_name: 'شركة فايركس لأدوات السلامه',
    logo_url: '/logo.png',
    letterhead_url: '/letterhead.png',
    use_custom_letterhead: true,
    cr_number: '96850 1',
    cr_no: '96850 1',
    vat_number: '220006271900002',
    vat_no: '220006271900002',
    address_line_1: 'Villa 13, Building 2373',
    address_line_2: 'Road 2831, Al Seef',
    address_line_3: 'Block 428, Bahrain',
    address: 'Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain',
    phone: '+973 1716 2240',
    email: 'service@firexbahrain.com',
    cr_vat_number: 'CR No.: 96850 1 | VAT No.: 220006271900002',
    report_footer: 'FIREX • Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain • CR No.: 96850 1 • VAT No.: 220006271900002',
    report_number_prefix: 'RPT',
    reminder_days: [90, 60, 30, 7],
    amc_next_service_rule: 'from_actual_date'
  });

  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState('letterhead'); // 'letterhead' | 'logo'
  const letterheadInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Allowed to edit: GM, Managing Director (MD) or Supervisor
  const canEdit = currentUser?.role === 'GM' || currentUser?.role === 'Managing Director (MD)' || currentUser?.role === 'Managing Director' || currentUser?.role === 'managing_director' || currentUser?.role === 'Supervisor';

  useEffect(() => {
    fetch('/api/settings', {
      headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
    })
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({
          ...prev,
          ...data,
          company_name: data.company_name || prev.company_name,
          arabic_name: data.arabic_name || prev.arabic_name,
          logo_url: data.logo_url || prev.logo_url,
          letterhead_url: data.letterhead_url || prev.letterhead_url,
          cr_number: data.cr_number || data.cr_no || prev.cr_number,
          cr_no: data.cr_no || data.cr_number || prev.cr_no,
          vat_number: data.vat_number || data.vat_no || prev.vat_number,
          vat_no: data.vat_no || data.vat_number || prev.vat_no,
          address_line_1: data.address_line_1 || prev.address_line_1,
          address_line_2: data.address_line_2 || prev.address_line_2,
          address_line_3: data.address_line_3 || prev.address_line_3,
          address: data.address || prev.address,
          report_footer: data.report_footer || prev.report_footer,
          use_custom_letterhead: data.use_custom_letterhead !== undefined ? data.use_custom_letterhead : true,
          amc_next_service_rule: data.amc_next_service_rule || 'from_actual_date'
        }));
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, [currentUser]);

  // Client-side image compressor to prevent huge base64 strings
  const compressImage = (file, maxWidth, maxHeight, quality = 0.88) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png', quality));
        };
        img.onerror = reject;
        img.src = readerEvent.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Letterhead upload
  const handleLetterheadUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processing and compressing letterhead banner...', 'info');
      // Max 1400px wide for crisp A4 PDF rendering
      const compressedDataUrl = await compressImage(file, 1400, 400, 0.9);
      setSettings(prev => ({
        ...prev,
        letterhead_url: compressedDataUrl,
        use_custom_letterhead: true
      }));
      showToast('Letterhead loaded! Click Save to apply system-wide.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to process image file', 'error');
    }
  };

  // Handle Logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processing logo image...', 'info');
      const compressedDataUrl = await compressImage(file, 400, 400, 0.9);
      setSettings(prev => ({
        ...prev,
        logo_url: compressedDataUrl
      }));
      showToast('Logo loaded! Click Save to apply system-wide.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to process logo file', 'error');
    }
  };

  // Reset to default Bahrain letterhead & logo
  const handleResetToDefault = () => {
    setSettings(prev => ({
      ...prev,
      letterhead_url: '/letterhead.png',
      logo_url: '/logo.png',
      use_custom_letterhead: true
    }));
    showToast('Reset to official Bahrain FIREX letterhead and logo', 'info');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast('Restricted: GM or Supervisor permission required', 'error');
      return;
    }

    const cr = (settings.cr_number || settings.cr_no || '96850 1').trim();
    const vat = (settings.vat_number || settings.vat_no || '220006271900002').trim();
    const line1 = (settings.address_line_1 || 'Villa 13, Building 2373').trim();
    const line2 = (settings.address_line_2 || 'Road 2831, Al Seef').trim();
    const line3 = (settings.address_line_3 || 'Block 428, Bahrain').trim();
    const combinedAddress = [line1, line2, line3].filter(Boolean).join(', ') || settings.address || 'Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain';

    const payload = {
      ...settings,
      company_name: (settings.company_name || 'FIREX').trim(),
      cr_number: cr,
      cr_no: cr,
      vat_number: vat,
      vat_no: vat,
      cr_vat_number: `CR No.: ${cr} | VAT No.: ${vat}`,
      address_line_1: line1,
      address_line_2: line2,
      address_line_3: line3,
      address: combinedAddress,
      report_footer: (settings.report_footer || `FIREX • ${combinedAddress} • CR No.: ${cr} • VAT No.: ${vat}`).trim()
    };

    setSaving(true);
    try {
      // 1. Save settings
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedData = await res.json();
        setSettings(prev => ({ ...prev, ...savedData }));
        showToast('Company settings & report details saved successfully!', 'success');
        if (fetchCompanySettings) {
          await fetchCompanySettings();
        }
      } else {
        const err = await res.json();
        showToast(err.message || 'Permission denied', 'error');
      }
    } catch {
      showToast('Network error saving settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span>Company Branding &amp; Letterhead</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage official Bahrain Civil Defence credentials, custom letterhead banners, and A4 PDF styling.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-red-50 text-safety-red border border-red-200 rounded-lg">
            Bahrain Approved
          </span>
        </div>
      </div>

      {/* SECTION 1: Letterhead & Logo Upload Center */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-black text-navy-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-safety-red" />
              <span>Official Company Letterhead &amp; Logo</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Upload your company letterhead banner or emblem. This automatically brands your A4 inspection and AMC reports.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-600 hover:text-navy-900 font-bold flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Reset to pre-loaded official Bahrain FIREX letterhead"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset to Default</span>
          </button>
        </div>

        {/* Letterhead Banner Preview Card */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <span>Current Letterhead Banner (Top of A4 Reports)</span>
              {settings.use_custom_letterhead && (
                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-bold">
                  Active
                </span>
              )}
            </label>
            <span className="text-[10px] text-slate-400">Recommended: 1200 x 200px (PNG / JPG)</span>
          </div>

          <div className="relative group bg-slate-50 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-3 flex flex-col items-center justify-center transition-all min-h-[110px]">
            {settings.letterhead_url ? (
              <div className="w-full flex flex-col items-center">
                <img
                  src={settings.letterhead_url}
                  alt="Company Letterhead Banner"
                  className="max-h-24 sm:max-h-28 w-auto object-contain rounded-lg shadow-sm border border-slate-200 bg-white"
                  onError={(e) => {
                    // Fallback to /letterhead.png if custom base64 fails
                    e.target.src = '/letterhead.png';
                  }}
                />
                <p className="text-[10px] text-slate-500 mt-2 font-medium">
                  Official Letterhead Banner Active (FIREX Bahrain)
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-600">No letterhead uploaded yet</p>
                <p className="text-[10px] text-slate-400">Click below to upload your official banner</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              type="file"
              ref={letterheadInputRef}
              onChange={handleLetterheadUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => letterheadInputRef.current?.click()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Letterhead Banner</span>
            </button>

            <label className="flex items-center gap-2 ml-auto cursor-pointer select-none text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                disabled={!canEdit}
                checked={settings.use_custom_letterhead}
                onChange={(e) => setSettings(p => ({ ...p, use_custom_letterhead: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Render full letterhead banner on A4 reports</span>
            </label>
          </div>
        </div>

        {/* Logo and Emblem Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block font-bold text-slate-700 text-xs mb-1">Company Emblem / Square Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden p-1">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = '/logo.png'; }}
                  />
                ) : (
                  <Shield className="w-8 h-8 text-safety-red" />
                )}
              </div>
              <div className="space-y-1">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                >
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>Change Logo</span>
                </button>
                <p className="text-[10px] text-slate-400">Used in mobile app bar &amp; compact forms</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900 leading-relaxed">
              <p className="font-bold">Official Document Compliance</p>
              <p className="text-blue-700 text-[10px] mt-0.5">
                Bahrain Civil Defence and ISO 9001 audits require all engineering service inspection reports to display registered company letterheads with valid CR &amp; VAT credentials.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 2: Legal Details & Registration */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-navy-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Official Company Credentials &amp; Legal Details</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Registered commercial data printed on certificates, quotations, and maintenance logs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Trading Name *</label>
            <input
              type="text"
              disabled={!canEdit}
              value={settings.company_name}
              onChange={(e) => setSettings(p => ({ ...p, company_name: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 font-semibold text-slate-900"
              placeholder="FIREX"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Legal Name (Arabic Calligraphy)</label>
            <input
              type="text"
              dir="rtl"
              disabled={!canEdit}
              value={settings.arabic_name || ''}
              onChange={(e) => setSettings(p => ({ ...p, arabic_name: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 font-bold text-slate-900 text-right"
              placeholder="شركة فايركس لأدوات السلامه"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Commercial Registration (CR No.) *</label>
            <input
              type="text"
              disabled={!canEdit}
              value={settings.cr_number || settings.cr_no || ''}
              onChange={(e) => setSettings(p => ({ ...p, cr_number: e.target.value, cr_no: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 font-mono font-bold"
              placeholder="96850 1"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">VAT Number *</label>
            <input
              type="text"
              disabled={!canEdit}
              value={settings.vat_number || settings.vat_no || ''}
              onChange={(e) => setSettings(p => ({ ...p, vat_number: e.target.value, vat_no: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 font-mono font-bold"
              placeholder="220006271900002"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Telephone &amp; Contact Phone</label>
            <input
              type="text"
              disabled={!canEdit}
              value={settings.phone}
              onChange={(e) => setSettings(p => ({ ...p, phone: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Service &amp; Dispatch Email</label>
            <input
              type="email"
              disabled={!canEdit}
              value={settings.email}
              onChange={(e) => setSettings(p => ({ ...p, email: e.target.value }))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100"
            />
          </div>
        </div>

        {/* Structured Address Fields */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <label className="block font-bold text-slate-900 text-xs uppercase tracking-wide">
            Registered Head Office Address (Bahrain)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-600 mb-1 text-[11px]">Address Line 1 *</label>
              <input
                type="text"
                disabled={!canEdit}
                value={settings.address_line_1 || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings(p => ({
                    ...p,
                    address_line_1: val,
                    address: [val, p.address_line_2, p.address_line_3].filter(Boolean).join(', ')
                  }));
                }}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                placeholder="Villa 13, Building 2373"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1 text-[11px]">Address Line 2 *</label>
              <input
                type="text"
                disabled={!canEdit}
                value={settings.address_line_2 || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings(p => ({
                    ...p,
                    address_line_2: val,
                    address: [p.address_line_1, val, p.address_line_3].filter(Boolean).join(', ')
                  }));
                }}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                placeholder="Road 2831, Al Seef"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-1 text-[11px]">Address Line 3 *</label>
              <input
                type="text"
                disabled={!canEdit}
                value={settings.address_line_3 || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setSettings(p => ({
                    ...p,
                    address_line_3: val,
                    address: [p.address_line_1, p.address_line_2, val].filter(Boolean).join(', ')
                  }));
                }}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                placeholder="Block 428, Bahrain"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1 text-[11px]">Full Address (Single-Line Storage)</label>
            <input
              type="text"
              disabled={!canEdit}
              value={settings.address}
              onChange={(e) => setSettings(p => ({ ...p, address: e.target.value }))}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">A4 PDF Report Company Footer</label>
          <textarea
            rows={2}
            disabled={!canEdit}
            value={settings.report_footer}
            onChange={(e) => setSettings(p => ({ ...p, report_footer: e.target.value }))}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100"
            placeholder="FIREX • Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain • CR No.: 96850 1 • VAT No.: 220006271900002"
          />
        </div>

        {/* AMC System Frequencies Configuration */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>AMC System Inspection Frequencies (Civil Defence Standards)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Default automated visit generation intervals for annual maintenance contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Fire Alarm</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  4 Visits/Year
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Every 3 months (Quarterly inspection)</p>
              <div className="text-[10px] text-slate-400 font-mono">Interval: 3 months</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Fire Fighting</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                  4 Visits/Year
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Every 3 months (Quarterly inspection)</p>
              <div className="text-[10px] text-slate-400 font-mono">Interval: 3 months</div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Fire Extinguishers</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  2 Visits/Year
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Every 6 months (Semi-Annual inspection)</p>
              <div className="text-[10px] text-slate-400 font-mono">Interval: 6 months</div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <span className="font-bold">Multi-System AMC Support:</span>
            <span>A combined contract covering Fire Alarm, Fire Fighting, and Fire Extinguishers automatically schedules <strong>10 visits</strong> (4 + 4 + 2) spread throughout the contract term.</span>
          </div>

          {/* AMC Service Cycle Calculation Rule (Requirement 3) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                AMC Service Cycle Calculation Rule
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Determine how subsequent AMC service dates are calculated when a service visit is completed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                (settings.amc_next_service_rule || 'from_actual_date') === 'from_actual_date'
                  ? 'bg-blue-50/70 border-blue-400 text-blue-950 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50'
              }`}>
                <input
                  type="radio"
                  name="amc_next_service_rule"
                  value="from_actual_date"
                  checked={(settings.amc_next_service_rule || 'from_actual_date') === 'from_actual_date'}
                  onChange={() => setSettings(s => ({ ...s, amc_next_service_rule: 'from_actual_date' }))}
                  disabled={!canEdit}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold block">From Actual Completed Service Date (Default)</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Next Service = Actual Completed Service Date + 3 months. Ensures field maintenance cadence adapts to realistic completion timing.
                  </span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                settings.amc_next_service_rule === 'from_scheduled_date'
                  ? 'bg-blue-50/70 border-blue-400 text-blue-950 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50'
              }`}>
                <input
                  type="radio"
                  name="amc_next_service_rule"
                  value="from_scheduled_date"
                  checked={settings.amc_next_service_rule === 'from_scheduled_date'}
                  onChange={() => setSettings(s => ({ ...s, amc_next_service_rule: 'from_scheduled_date' }))}
                  disabled={!canEdit}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold block">From Original Scheduled Date</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Next Service = Original Scheduled Date + 3 months. Maintains fixed calendar intervals regardless of when work is completed.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {canEdit ? (
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Changes apply instantly to newly generated PDFs and application headers.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:bg-slate-400 text-white font-bold rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-blue-400" />
                  <span>Save All Settings</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 rounded-xl text-amber-800 border border-amber-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Settings can only be altered by General Manager (GM) or Supervisor roles.</span>
          </div>
        )}
      </form>
    </div>
  );
}
