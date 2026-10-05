import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, Building2, Calendar, UserCheck, Shield, 
  CheckCircle2, Clock, AlertTriangle, ArrowRight, X, 
  Sparkles, Wrench, Flame, Eye, Plus, Check
} from 'lucide-react';

export default function CreateAMCReportModal({ 
  onClose, 
  onOpenChecklist, 
  onViewReport,
  initialCustomerId = '',
  initialContractId = '',
  initialQuarter = ''
}) {
  const { currentUser, showToast } = useApp();

  const [customers, setCustomers] = useState([]);
  const [amcContracts, setAmcContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Selections
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);
  const [selectedContractId, setSelectedContractId] = useState(initialContractId);
  const [selectedQuarter, setSelectedQuarter] = useState(initialQuarter || 'Q1');
  const [actualServiceDate, setActualServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSupervisorId, setSelectedSupervisorId] = useState('');
  const [selectedSupervisorName, setSelectedSupervisorName] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [selectedTechnicianName, setSelectedTechnicianName] = useState('');

  // Load Customers, Contracts, and Staff
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [resCust, resAmc, resUsers] = await Promise.all([
          fetch('/api/customers', {
            headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
          }),
          fetch('/api/amc-contracts', {
            headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
          }),
          fetch('/api/users', {
            headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
          })
        ]);

        if (resCust.ok) setCustomers(await resCust.json());
        if (resAmc.ok) setAmcContracts(await resAmc.json());
        if (resUsers.ok) setEmployees(await resUsers.json());
      } catch (err) {
        console.error('Failed to load AMC report selection data:', err);
        showToast('Error loading selection data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [currentUser]);

  // Filter contracts strictly to the selected customer (Prevent Customer A + Customer B AMC)
  const filteredContracts = amcContracts.filter(c => c.customer_id === selectedCustomerId);

  // When customer changes, reset or auto-select contract
  const handleCustomerChange = (custId) => {
    setSelectedCustomerId(custId);
    const available = amcContracts.filter(c => c.customer_id === custId);
    if (available.length === 1) {
      handleContractChange(available[0].id, available[0]);
    } else {
      setSelectedContractId('');
      setSelectedQuarter('Q1');
    }
  };

  // Selected contract object
  const activeContract = amcContracts.find(c => c.id === selectedContractId) || null;

  // When contract changes, initialize default supervisor, technician, and quarter
  const handleContractChange = (contractId, contractObj = null) => {
    const contract = contractObj || amcContracts.find(c => c.id === contractId);
    setSelectedContractId(contractId);
    if (contract) {
      setSelectedSupervisorId(contract.supervisor_id || '');
      setSelectedSupervisorName(contract.assigned_supervisor || contract.supervisor_name || 'Unassigned Supervisor');
      setSelectedTechnicianId(contract.technician_id || '');
      setSelectedTechnicianName(contract.assigned_technician || contract.technician_name || 'Unassigned Technician');
      if (!initialQuarter) setSelectedQuarter('Q1');
    }
  };

  // Helper to compute quarter schedule dates based on service_start_date (Requirement 3 & 4)
  const getQuarterDetails = (quarterKey) => {
    if (!activeContract) return null;

    // First check existing generated visits on the contract
    const visits = activeContract.visits || [];
    const matchedVisit = visits.find(v => v.quarter === quarterKey);
    if (matchedVisit) {
      return {
        visit_id: matchedVisit.id,
        quarter: quarterKey,
        visit_number: matchedVisit.visit_number || (quarterKey === 'Q1' ? 1 : quarterKey === 'Q2' ? 2 : quarterKey === 'Q3' ? 3 : 4),
        scheduled_date: matchedVisit.scheduled_date,
        actual_service_date: matchedVisit.actual_service_date || actualServiceDate,
        supervisor_id: matchedVisit.supervisor_id || selectedSupervisorId,
        supervisor_name: matchedVisit.supervisor_name || selectedSupervisorName,
        technician_id: matchedVisit.technician_id || selectedTechnicianId,
        technician_name: matchedVisit.technician_name || selectedTechnicianName,
        status: matchedVisit.status || 'Scheduled',
        checklist_status: matchedVisit.checklist_status || 'Pending',
        report_id: matchedVisit.report_id || null,
        report_number: matchedVisit.report_number || null,
        systems: matchedVisit.systems || activeContract.systems_covered || activeContract.systems || ['Fire Alarm', 'Fire Fighting']
      };
    }

    // Fallback: calculate using service_start_date without wrong contract calculation
    const baseDateStr = activeContract.service_start_date || activeContract.start_date || new Date().toISOString().slice(0, 10);
    const baseDate = new Date(baseDateStr);
    const offsetMonths = quarterKey === 'Q1' ? 0 : quarterKey === 'Q2' ? 3 : quarterKey === 'Q3' ? 6 : 9;
    const calcDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + offsetMonths, baseDate.getDate());
    const schedDateStr = calcDate.toISOString().slice(0, 10);

    return {
      visit_id: `vis-${activeContract.id}-${quarterKey}`,
      quarter: quarterKey,
      visit_number: quarterKey === 'Q1' ? 1 : quarterKey === 'Q2' ? 2 : quarterKey === 'Q3' ? 3 : 4,
      scheduled_date: schedDateStr,
      actual_service_date: actualServiceDate,
      supervisor_id: selectedSupervisorId,
      supervisor_name: selectedSupervisorName,
      technician_id: selectedTechnicianId,
      technician_name: selectedTechnicianName,
      status: 'Scheduled',
      checklist_status: 'Pending',
      report_id: null,
      report_number: null,
      systems: activeContract.systems_covered || activeContract.systems || ['Fire Alarm', 'Fire Fighting']
    };
  };

  const selectedVisit = activeContract ? getQuarterDetails(selectedQuarter) : null;
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  // Proceed to digital checklist & report preparation
  const handleProceed = () => {
    if (!selectedCustomerId) {
      showToast('Please select a customer first', 'warning');
      return;
    }
    if (!selectedContractId) {
      showToast('Please select an AMC contract', 'warning');
      return;
    }
    if (!selectedVisit) {
      showToast('Please select a service quarter', 'warning');
      return;
    }

    const fullVisitPayload = {
      ...selectedVisit,
      id: selectedVisit.visit_id,
      contract_id: activeContract.id,
      amc_contract_id: activeContract.id,
      amc_id: activeContract.id,
      contract_number: activeContract.contract_number,
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      customer_code: selectedCustomer.customer_code,
      site_id: activeContract.site_id,
      site_name: activeContract.site_name,
      site_address: activeContract.site_address,
      contract_start_date: activeContract.start_date,
      contract_end_date: activeContract.end_date,
      service_start_date: activeContract.service_start_date || activeContract.start_date,
      quarter: selectedQuarter,
      scheduled_date: selectedVisit.scheduled_date,
      actual_service_date: actualServiceDate,
      supervisor_id: selectedSupervisorId,
      supervisor_name: selectedSupervisorName,
      technician_id: selectedTechnicianId,
      technician_name: selectedTechnicianName,
      systems: selectedVisit.systems,
      systems_covered: selectedVisit.systems,
      status: selectedVisit.status,
      prepared_by_name: currentUser?.name || selectedTechnicianName,
      prepared_by_user_id: currentUser?.id
    };

    onClose();
    if (onOpenChecklist) {
      onOpenChecklist(fullVisitPayload);
    }
  };

  const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  AMC Workflow
                </span>
                <span className="text-xs text-slate-400">Civil Defense Compliant</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Create AMC Periodic Service Report
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* 1. SELECT CUSTOMER (Requirement 1) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>1. Select Customer *</span>
              <span className="text-[10px] text-slate-400 font-semibold lowercase">from customer database</span>
            </label>
            <div className="relative">
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
              >
                <option value="">-- Choose Registered Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.customer_code ? `(${c.customer_code})` : ''} • {c.area || 'Bahrain'}
                  </option>
                ))}
              </select>
            </div>
            {customers.length === 0 && !loading && (
              <p className="text-[11px] text-amber-600 font-medium">
                No customers registered yet. Please add a customer first in the Customers module.
              </p>
            )}
          </div>

          {/* 2. SELECT AMC CONTRACT (Requirement 2 & 6 - Filtered strictly to selected customer) */}
          {selectedCustomerId && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>2. Select AMC Agreement *</span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {filteredContracts.length} contract(s) found
                </span>
              </label>

              {filteredContracts.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>No AMC Contracts for this Customer</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    This customer does not have any active or registered AMC agreements yet. Please create an AMC contract under this customer to enable service visit reporting.
                  </p>
                </div>
              ) : (
                <select
                  value={selectedContractId}
                  onChange={(e) => handleContractChange(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                >
                  <option value="">-- Choose AMC Contract --</option>
                  {filteredContracts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contract_number} • {c.site_name} (Period: {c.start_date} to {c.end_date})
                    </option>
                  ))}
                </select>
              )}

              {/* Active Contract Info Banner */}
              {activeContract && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-navy-900 text-sm">
                      {activeContract.contract_number}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {activeContract.status || 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">Premises / Site</span>
                      <strong className="text-slate-900">{activeContract.site_name || 'Main Facility'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">Contract Dates</span>
                      <strong className="text-slate-900">{activeContract.start_date} → {activeContract.end_date}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-semibold">Service Starting Date</span>
                      <strong className="text-blue-700">{activeContract.service_start_date || activeContract.start_date}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-blue-200/60">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Coverage:</span>
                    {(activeContract.systems_covered || activeContract.systems || ['Fire Alarm', 'Fire Fighting']).map((sys, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-navy-900 border border-slate-200">
                        {sys}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. SELECT QUARTER (Requirement 3) */}
          {activeContract && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>3. Select AMC Quarter *</span>
                <span className="text-[10px] text-slate-400 font-semibold">from scheduled service dates</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUARTERS.map((q) => {
                  const qDet = getQuarterDetails(q);
                  const isSelected = selectedQuarter === q;
                  const isDone = qDet?.status === 'Completed' || qDet?.checklist_status === 'Approved';
                  const isInProgress = qDet?.checklist_status === 'In Progress' || qDet?.checklist_status === 'Submitted';

                  return (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuarter(q)}
                      className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
                        isSelected
                          ? 'bg-navy-900 text-white border-navy-900 shadow-md ring-2 ring-blue-500/50'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-base font-black ${isSelected ? 'text-amber-400' : 'text-navy-900'}`}>
                          {q}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isDone 
                            ? (isSelected ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40' : 'bg-emerald-100 text-emerald-800')
                            : isInProgress
                            ? (isSelected ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40' : 'bg-amber-100 text-amber-800')
                            : (isSelected ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-600')
                        }`}>
                          {isDone ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                        </span>
                      </div>

                      <div className="space-y-0.5 mt-2">
                        <span className={`text-[9px] block uppercase font-semibold ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          Service Date
                        </span>
                        <span className={`text-xs font-bold truncate block ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {qDet?.scheduled_date || 'TBD'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. SERVICE VISIT SPECIFICATIONS & PERSONNEL (Requirement 4) */}
          {selectedVisit && (
            <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                4. Scheduled Service Visit Specifications
              </label>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Quarter &amp; Visit</span>
                    <strong className="text-slate-900 text-sm font-black text-navy-900">
                      {selectedQuarter} • Visit #{selectedVisit.visit_number} of 4
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheduled Date</span>
                    <strong className="text-slate-900 text-sm font-mono">
                      {selectedVisit.scheduled_date}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Actual Service Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Actual Service Date *
                    </label>
                    <input
                      type="date"
                      value={actualServiceDate}
                      onChange={(e) => setActualServiceDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  {/* Assigned Supervisor */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Supervisor
                    </label>
                    <select
                      value={selectedSupervisorId}
                      onChange={(e) => {
                        const sup = employees.find(u => u.id === e.target.value);
                        setSelectedSupervisorId(e.target.value);
                        setSelectedSupervisorName(sup ? sup.name : '');
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    >
                      <option value="">{selectedSupervisorName || '-- Supervisor --'}</option>
                      {employees.filter(u => ['GM', 'Engineer', 'Supervisor'].includes(u.role)).map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Assigned Technician */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                      Lead Technician / Engineer
                    </label>
                    <select
                      value={selectedTechnicianId}
                      onChange={(e) => {
                        const tech = employees.find(u => u.id === e.target.value);
                        setSelectedTechnicianId(e.target.value);
                        setSelectedTechnicianName(tech ? tech.name : '');
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    >
                      <option value="">{selectedTechnicianName || '-- Technician --'}</option>
                      {employees.filter(u => ['Engineer', 'Supervisor', 'Technician'].includes(u.role)).map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Report link if already prepared */}
                {selectedVisit.report_id && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">Official Report Generated</span>
                      <span className="text-xs font-mono font-black text-emerald-950">{selectedVisit.report_number || 'RPT-AMC'}</span>
                    </div>
                    {onViewReport && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onViewReport(selectedVisit);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-200"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!selectedCustomerId || !selectedContractId || !selectedVisit}
            onClick={handleProceed}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all transform hover:scale-[1.02]"
          >
            <Wrench className="w-4 h-4 text-emerald-200" />
            <span>Load AMC Checklist &amp; Make Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
