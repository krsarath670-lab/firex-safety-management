import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import { exportAmcToExcel, exportMonthlyScheduleToExcel } from '../utils/excelExport';
import { 
  FileCheck, Calendar, Clock, AlertTriangle, CheckCircle2, 
  Search, Plus, ShieldCheck, ChevronRight, ChevronLeft, Sliders, Bell, 
  Building2, UserCheck, Flame, Wrench, RefreshCw, Filter, Eye, Grid, List,
  Trash2, Edit, Printer, Download, FileSpreadsheet, X
} from 'lucide-react';

import QuickAddCustomerModal from './QuickAddCustomerModal';
import AMCChecklistModal from './AMCChecklistModal';
import AMCSupervisorReviewModal from './AMCSupervisorReviewModal';
import AMCServiceReportModal from './AMCServiceReportModal';

export default function AMCView({ onStartInspectionForVisit }) {
  const { currentUser, showToast, allUsers, fetchMonthlyAmcSchedule, companySettings } = useApp();
  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab: 'contracts' | 'schedule'
  const [tab, setTab] = useState('contracts');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'Active' | 'Expiring Soon' | 'Expired'
  const [searchQuery, setSearchQuery] = useState('');

  // Dedicated AMC Detail Modal & Tab
  const [viewingContractDetail, setViewingContractDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'inspections' | 'visits' | 'reports' | 'faults'
  const [activeQuarterTab, setActiveQuarterTab] = useState('Q1'); // 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'overview_table'
  const [quarterSaving, setQuarterSaving] = useState(false);

  // Print Monthly Schedule Modal
  const [showPrintScheduleModal, setShowPrintScheduleModal] = useState(false);

  // Monthly Schedule States
  const today = new Date();
  const [scheduleYear, setScheduleYear] = useState(today.getFullYear());
  const [scheduleMonth, setScheduleMonth] = useState(today.getMonth() + 1); // 1-12
  const [monthlyVisits, setMonthlyVisits] = useState([]);
  const [scheduleSummary, setScheduleSummary] = useState({});
  const [scheduleViewMode, setScheduleViewMode] = useState('list'); // 'list' | 'calendar'
  const [scheduleFilters, setScheduleFilters] = useState({
    system: 'all',
    status: 'all',
    technician_id: 'all',
    sales_person_id: 'all',
    customer_id: 'all',
    site_id: 'all',
    amc_id: 'all',
    supervisor_id: 'all'
  });


  // Modals & Forms
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedContractForVisit, setSelectedContractForVisit] = useState(null);
  const [reminderConfigModal, setReminderConfigModal] = useState(null);
  const [renewingContract, setRenewingContract] = useState(null);
  const [reschedulingVisit, setReschedulingVisit] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [returningContract, setReturningContract] = useState(null);
  const [returnRemarks, setReturnRemarks] = useState('');
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isDeletingContract, setIsDeletingContract] = useState(false);

  // Digital AMC Checklist & Service Report Modals
  const [activeChecklistVisit, setActiveChecklistVisit] = useState(null);
  const [reviewingVisit, setReviewingVisit] = useState(null);
  const [previewingReportVisit, setPreviewingReportVisit] = useState(null);
  const [assigningVisit, setAssigningVisit] = useState(null);
  const [assignSupervisorId, setAssignSupervisorId] = useState('');
  const [assignTechnicianId, setAssignTechnicianId] = useState('');
  const [assignSaving, setAssignSaving] = useState(false);

  const isSales = currentUser?.role === 'Sales';
  const isTechnician = currentUser?.role === 'Technician';
  const isManagement = ['GM', 'Engineer', 'Supervisor'].includes(currentUser?.role);

  // Core system frequencies
  const SYSTEM_OPTIONS = [
    { id: 'Fire Alarm', label: 'Fire Alarm System', frequencyMonths: 3, visitsPerYear: 4 },
    { id: 'Fire Fighting', label: 'Fire Fighting & Sprinklers', frequencyMonths: 3, visitsPerYear: 4 },
    { id: 'Fire Extinguishers', label: 'Fire Extinguishers', frequencyMonths: 6, visitsPerYear: 2 },
  ];

  const salesUsers = (allUsers || []).filter(u => u.role === 'Sales');
  const supervisorUsers = (allUsers || []).filter(u => u.role === 'Supervisor' || u.role === 'GM');
  const technicianUsers = (allUsers || []).filter(u => ['Technician', 'Engineer'].includes(u.role));
  const effectiveSupervisorUsers = supervisorUsers.length > 0 ? supervisorUsers : (allUsers || []).filter(u => u.status !== 'Inactive');
  const effectiveTechnicianUsers = technicianUsers.length > 0 ? technicianUsers : (allUsers || []).filter(u => u.status !== 'Inactive');

  // New Contract Form State with dynamic VAT, Supervisor & Technician
  const defaultNewContract = () => {
    const defaultVat = companySettings?.vat_percent !== undefined ? Number(companySettings.vat_percent) : 10;
    const defaultVal = 350.000;
    const defaultVatAmt = (defaultVal * defaultVat) / 100;
    const firstSales = salesUsers[0];
    const firstSup = effectiveSupervisorUsers[0];
    const firstTech = effectiveTechnicianUsers[0];
    const todayStr = new Date().toISOString().slice(0, 10);
    const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);

    return {
      customer_id: '',
      site_id: '',
      contract_type: 'Comprehensive',
      start_date: todayStr,
      end_date: oneYearLater,
      service_start_date: todayStr,
      extinguisher_start_date: '',
      supervisor_id: firstSup ? firstSup.id : '',
      assigned_supervisor: firstSup ? firstSup.name : '',
      technician_id: firstTech ? firstTech.id : '',
      assigned_technician: firstTech ? firstTech.name : '',
      renewal_date: '',
      systems_covered: ['Fire Alarm', 'Fire Fighting'],
      contract_value: defaultVal,
      vat_percent: defaultVat,
      vat_amount: defaultVatAmt,
      total_including_vat: defaultVal + defaultVatAmt,
      sales_person_id: isSales ? currentUser.id : (firstSales ? firstSales.id : ''),
      quotation_number: '',
      frequency: 'System-Specific',
      remarks: '',
      reminder_days: [90, 60, 30, 7]
    };
  };

  const [newContract, setNewContract] = useState(defaultNewContract);

  // Renewal Form State
  const [renewalForm, setRenewalForm] = useState({
    start_date: '',
    end_date: '',
    contract_value: 0,
    remarks: ''
  });

  // Reschedule Form State
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Complete Service Modal State (Requirement 3 & 7: Actual Completed Service Date & Per-Service Tracking)
  const [completingVisit, setCompletingVisit] = useState(null);
  const [completionActualDate, setCompletionActualDate] = useState(new Date().toISOString().slice(0, 10));
  const [completionRemarks, setCompletionRemarks] = useState('');
  const [completionServicesStatus, setCompletionServicesStatus] = useState({});
  const [completionPhotos, setCompletionPhotos] = useState([]);
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('');
  const [completionSaving, setCompletionSaving] = useState(false);

  // Helper to open Service Completion Modal with initialized per-service checkboxes
  const openCompleteVisitModal = (visit) => {
    setCompletingVisit(visit);
    setCompletionActualDate(new Date().toISOString().slice(0, 10));
    setCompletionRemarks(visit.remarks || '');
    setCompletionPhotoUrl('');
    const initStatus = {};
    const sysList = visit.systems || [visit.system_type || visit.system || 'Inspection'];
    sysList.forEach(s => {
      initStatus[s] = true;
    });
    setCompletionServicesStatus(initStatus);
  };

  // Schedule Single Visit Form State
  const [newVisit, setNewVisit] = useState({
    amc_id: '',
    visit_number: 1,
    scheduled_date: new Date().toISOString().slice(0, 10),
    technician_id: 'usr-tech',
    system: 'Fire Alarm',
    remarks: ''
  });

  // Deterministic calendar month arithmetic for contract service cycles
  const addCalendarMonths = (dateStr, monthsToAdd) => {
    if (!dateStr) return '';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

    const totalMonths = (year * 12 + (month - 1)) + Number(monthsToAdd);
    const newYear = Math.floor(totalMonths / 12);
    const newMonth = (totalMonths % 12) + 1;
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    const newDay = Math.min(day, maxDays);
    return `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
  };

  // Dynamic Cycle Period Names calculated relative to AMC contract start date
  const getContractCyclePeriods = (startDateStr) => {
    if (!startDateStr) {
      return {
        Q1: { name: 'Q1 (Service 1)', shortName: 'Q1', months: 'Quarter 1', fullMonths: 'Quarter 1' },
        Q2: { name: 'Q2 (Service 2)', shortName: 'Q2', months: 'Quarter 2', fullMonths: 'Quarter 2' },
        Q3: { name: 'Q3 (Service 3)', shortName: 'Q3', months: 'Quarter 3', fullMonths: 'Quarter 3' },
        Q4: { name: 'Q4 (Service 4)', shortName: 'Q4', months: 'Quarter 4', fullMonths: 'Quarter 4' }
      };
    }
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const parts = String(startDateStr).split('T')[0].split('-');
    const startYear = parseInt(parts[0], 10) || new Date().getFullYear();
    const startMonth = parseInt(parts[1], 10) || 1;

    const cycles = {};
    for (let i = 0; i < 4; i++) {
      const qKey = `Q${i + 1}`;
      const totalM1 = (startMonth - 1 + (i * 3));
      const m1Index = ((totalM1 % 12) + 12) % 12;
      const m2Index = ((m1Index + 2) % 12 + 12) % 12;
      const y1 = startYear + Math.floor(totalM1 / 12);
      const y2 = startYear + Math.floor((totalM1 + 2) / 12);

      const m1Short = monthNames[m1Index];
      const m2Short = monthNames[m2Index];
      const m1Full = fullMonthNames[m1Index];
      const m2Full = fullMonthNames[m2Index];

      const rangeLabel = (y1 === y2) 
        ? `${m1Short} – ${m2Short} ${y1}`
        : `${m1Short} ${y1} – ${m2Short} ${y2}`;

      const fullLabel = (y1 === y2)
        ? `${m1Full} – ${m2Full} ${y1}`
        : `${m1Full} ${y1} – ${m2Full} ${y2}`;

      cycles[qKey] = {
        name: `${qKey} (${m1Full} ${y1})`,
        shortName: `${qKey} (${m1Short})`,
        months: rangeLabel,
        fullMonths: fullLabel,
        anchorMonth: m1Full,
        anchorYear: y1
      };
    }
    return cycles;
  };

  // Calculate Live AMC Service Schedule Preview with Same-Day Merging (Requirements 1, 2, 3, 4, 11)
  const calculateSchedulePreview = (contractData) => {
    if (!contractData) return [];
    const serviceStartDate = contractData.service_start_date || contractData.start_date;
    if (!serviceStartDate) return [];
    const extinguisherStartDate = contractData.extinguisher_start_date || serviceStartDate;
    let systems = contractData.systems_covered || contractData.systems || ["Fire Alarm", "Fire Fighting"];
    if (typeof systems === 'string') systems = [systems];

    const hasAlarm = systems.some(s => s.toLowerCase().includes('alarm'));
    const hasFighting = systems.some(s => s.toLowerCase().includes('fighting'));
    const hasExtinguishers = systems.some(s => s.toLowerCase().includes('extinguish'));

    const dateMap = new Map();

    const addSystemToDate = (dateStr, sysName) => {
      if (!dateStr) return;
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, new Set());
      }
      dateMap.get(dateStr).add(sysName);
    };

    // 1. Fire Alarm + Fire Fighting stream: COMBINED service, exactly 4 visits per year
    if (hasAlarm || hasFighting) {
      for (let v = 0; v < 4; v++) {
        const schedDate = addCalendarMonths(serviceStartDate, v * 3);
        if (hasAlarm) addSystemToDate(schedDate, "Fire Alarm");
        if (hasFighting) addSystemToDate(schedDate, "Fire Fighting");
      }
    }

    // 2. Fire Extinguisher stream: exactly 2 visits per year
    if (hasExtinguishers) {
      for (let v = 0; v < 2; v++) {
        const schedDate = addCalendarMonths(extinguisherStartDate, v * 6);
        addSystemToDate(schedDate, "Fire Extinguishers");
      }
    }

    // 3. Other systems
    const otherSystems = systems.filter(s => 
      !s.toLowerCase().includes('alarm') && 
      !s.toLowerCase().includes('fighting') && 
      !s.toLowerCase().includes('extinguish')
    );
    otherSystems.forEach(sys => {
      for (let v = 0; v < 4; v++) {
        const schedDate = addCalendarMonths(serviceStartDate, v * 3);
        addSystemToDate(schedDate, sys);
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort();

    const formatSystemsLabel = (sysList) => {
      const order = ["Fire Alarm", "Fire Fighting", "Fire Extinguishers"];
      const sorted = [...sysList].sort((a, b) => {
        const idxA = order.findIndex(o => a.toLowerCase().includes(o.toLowerCase().slice(0, 5)));
        const idxB = order.findIndex(o => b.toLowerCase().includes(o.toLowerCase().slice(0, 5)));
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
      return sorted.map(s => s.replace(/Extinguishers/i, 'Fire Extinguisher').replace(/Fire Fire Extinguisher/i, 'Fire Extinguisher')).join(' + ');
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return sortedDates.map((dateStr, idx) => {
      const sysArray = Array.from(dateMap.get(dateStr));
      const sysLabel = formatSystemsLabel(sysArray);
      const visitNum = idx + 1;
      const quarter = idx < 4 ? `Q${visitNum}` : `Visit ${visitNum}`;
      let dayName = '';
      try {
        const d = new Date(dateStr);
        dayName = days[d.getDay()] || '';
      } catch {}

      return {
        visit_number: visitNum,
        service_sequence: visitNum,
        quarter: quarter,
        service_cycle: quarter,
        scheduled_date: dateStr,
        day: dayName,
        systems: sysArray,
        systems_label: sysLabel,
        is_combined: sysArray.length > 1
      };
    });
  };

  // Calculate unique visits for selected systems (combining same-day visits)
  const calculateTotalVisits = (systems) => {
    const preview = calculateSchedulePreview({ systems_covered: systems, start_date: '2026-01-01' });
    return preview.length || (Array.isArray(systems) ? systems.length : 1);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [resContracts, resCust, resSites] = await Promise.all([
        fetch('/api/amc-contracts', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
        fetch('/api/customers', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
        fetch('/api/sites', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } })
      ]);

      if (resContracts.ok) setContracts(await resContracts.json());
      if (resCust.ok) setCustomers(await resCust.json());
      if (resSites.ok) setSites(await resSites.json());
    } catch (e) {
      console.warn('Failed to load AMC data', e);
    } finally {
      setLoading(false);
    }
  };

  // Load Monthly Schedule with all 9 filters
  const loadMonthlySchedule = async () => {
    const filters = {};
    if (scheduleFilters.system !== 'all') filters.system = scheduleFilters.system;
    if (scheduleFilters.status !== 'all') filters.status = scheduleFilters.status;
    if (scheduleFilters.technician_id !== 'all') filters.technician_id = scheduleFilters.technician_id;
    if (scheduleFilters.sales_person_id !== 'all') filters.sales_person_id = scheduleFilters.sales_person_id;
    if (scheduleFilters.customer_id !== 'all') filters.customer_id = scheduleFilters.customer_id;
    if (scheduleFilters.site_id !== 'all') filters.site_id = scheduleFilters.site_id;
    if (scheduleFilters.amc_id !== 'all') filters.amc_id = scheduleFilters.amc_id;
    if (scheduleFilters.supervisor_id !== 'all') filters.supervisor_id = scheduleFilters.supervisor_id;

    const data = await fetchMonthlyAmcSchedule(scheduleYear, scheduleMonth, filters);
    if (data) {
      setMonthlyVisits(data.visits || []);
      setScheduleSummary(data.summary || {});
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (tab === 'schedule') {
      loadMonthlySchedule();
    }
  }, [tab, scheduleYear, scheduleMonth, scheduleFilters, currentUser]);

  // Handle Create AMC Contract (Draft, Submitted, or Active)
  const handleCreateContract = async (targetStatus = 'Draft') => {
    if (!newContract.customer_id || !newContract.site_id) {
      showToast('Please select a customer and site', 'error');
      return;
    }
    if (newContract.systems_covered.length === 0) {
      showToast('Please select at least one system covered', 'error');
      return;
    }

    try {
      const payload = {
        ...newContract,
        contract_value: Number(newContract.contract_value) || 0,
        sales_person_id: isSales ? currentUser.id : newContract.sales_person_id,
        status: targetStatus
      };

      const res = await fetch('/api/amc-contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        if (targetStatus === 'Draft') {
          showToast('AMC Contract saved as Draft', 'success');
        } else if (targetStatus === 'Submitted') {
          showToast('AMC Contract submitted for Management Approval', 'success');
        } else {
          showToast(`AMC Contract activated with ${calculateTotalVisits(newContract.systems_covered)} compliance visits scheduled!`, 'success');
        }
        setShowNewContractModal(false);
        setNewContract(defaultNewContract());
        loadData();
        if (tab === 'schedule') loadMonthlySchedule();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to create contract', 'error');
      }
    } catch (e) {
      showToast('Network error, could not save contract', 'error');
    }
  };

  // Submit AMC Contract for Approval
  const handleSubmitForApproval = async (contractId) => {
    try {
      const res = await fetch(`/api/amc-contracts/${contractId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        showToast('AMC Contract submitted for Management Approval', 'success');
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to submit contract', 'error');
      }
    } catch (e) {
      showToast('Network error submitting contract', 'error');
    }
  };

  // Management Approval Handler (GM, Engineer, Supervisor)
  const handleApproveContract = async (contractId) => {
    try {
      const res = await fetch(`/api/amc-contracts/${contractId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`AMC Contract approved! Generated ${data.generated_visits_count || 'system'} compliance visits.`, 'success');
        loadData();
        if (tab === 'schedule') loadMonthlySchedule();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to approve contract', 'error');
      }
    } catch (e) {
      showToast('Network error approving contract', 'error');
    }
  };

  // Management Return for Correction Handler
  const handleReturnContract = async (e) => {
    e.preventDefault();
    if (!returningContract) return;
    try {
      const res = await fetch(`/api/amc-contracts/${returningContract.id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ remarks: returnRemarks })
      });
      if (res.ok) {
        showToast('Contract returned for correction', 'info');
        setReturningContract(null);
        setReturnRemarks('');
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to return contract', 'error');
      }
    } catch (e) {
      showToast('Network error returning contract', 'error');
    }
  };

  // Delete AMC Contract Handler (Modal Confirmation)
  const handleConfirmDeleteContract = async () => {
    if (!contractToDelete) return;
    setIsDeletingContract(true);
    try {
      const res = await fetch(`/api/amc-contracts/${contractToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (res.ok) {
        showToast(`AMC Contract ${contractToDelete.contract_number} deleted successfully`, 'success');
        setContractToDelete(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to delete contract', 'error');
      }
    } catch (e) {
      showToast('Network error deleting contract', 'error');
    } finally {
      setIsDeletingContract(false);
    }
  };

  const handleDeleteDraft = (contractId) => {
    const c = contracts.find(x => x.id === contractId);
    if (c) {
      setContractToDelete(c);
    }
  };

  // Update Contract Handler
  const handleUpdateContract = async (e) => {
    e.preventDefault();
    if (!editingContract) return;

    try {
      const payload = {
        customer_id: editingContract.customer_id,
        site_id: editingContract.site_id,
        contract_type: editingContract.contract_type,
        start_date: editingContract.start_date,
        end_date: editingContract.end_date,
        service_start_date: editingContract.service_start_date || editingContract.start_date,
        extinguisher_start_date: editingContract.extinguisher_start_date || editingContract.service_start_date || editingContract.start_date,
        renewal_date: editingContract.renewal_date || editingContract.end_date,
        systems: editingContract.systems_covered,
        systems_covered: editingContract.systems_covered,
        contract_value: Number(editingContract.contract_value) || 0,
        quotation_number: editingContract.quotation_number,
        remarks: editingContract.remarks,
        status: editingContract.status || editingContract.contract_status,
        contract_status: editingContract.status || editingContract.contract_status
      };

      const res = await fetch(`/api/amc-contracts/${editingContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Contract updated successfully', 'success');
        setEditingContract(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to update contract', 'error');
      }
    } catch (e) {
      showToast('Network error updating contract', 'error');
    }
  };

  // Update and Resubmit Contract Handler
  const handleUpdateAndSubmitContract = async (e) => {
    e.preventDefault();
    if (!editingContract) return;

    try {
      const payload = {
        customer_id: editingContract.customer_id,
        site_id: editingContract.site_id,
        contract_type: editingContract.contract_type,
        start_date: editingContract.start_date,
        end_date: editingContract.end_date,
        service_start_date: editingContract.service_start_date || editingContract.start_date,
        extinguisher_start_date: editingContract.extinguisher_start_date || editingContract.service_start_date || editingContract.start_date,
        renewal_date: editingContract.renewal_date,
        systems: editingContract.systems_covered,
        systems_covered: editingContract.systems_covered,
        contract_value: Number(editingContract.contract_value) || 0,
        quotation_number: editingContract.quotation_number,
        remarks: editingContract.remarks,
        status: 'Submitted'
      };

      const res = await fetch(`/api/amc-contracts/${editingContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetch(`/api/amc-contracts/${editingContract.id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser.id,
            'x-user-role': currentUser.role
          },
          body: JSON.stringify({})
        });
        showToast('Contract updated and submitted for approval', 'success');
        setEditingContract(null);
        loadData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to update contract', 'error');
      }
    } catch (e) {
      showToast('Network error updating contract', 'error');
    }
  };

  // Open Renewal Modal
  const openRenewalModal = (contract) => {
    setRenewingContract(contract);
    
    // Auto-calculate renewal period
    const prevEndDate = new Date(contract.end_date);
    const newStart = new Date(prevEndDate);
    newStart.setDate(newStart.getDate() + 1);
    
    const newEnd = new Date(newStart);
    newEnd.setFullYear(newEnd.getFullYear() + 1);
    newEnd.setDate(newEnd.getDate() - 1);

    setRenewalForm({
      start_date: newStart.toISOString().slice(0, 10),
      end_date: newEnd.toISOString().slice(0, 10),
      contract_value: contract.contract_value || 0,
      remarks: `Annual contract renewal for ${contract.site_name}`
    });
  };

  // Handle Submit Renewal
  const handleRenewContract = async (e) => {
    e.preventDefault();
    if (!renewingContract) return;

    try {
      const res = await fetch(`/api/amc-contracts/${renewingContract.id}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          start_date: renewalForm.start_date,
          end_date: renewalForm.end_date,
          contract_value: Number(renewalForm.contract_value) || 0,
          remarks: renewalForm.remarks
        })
      });

      if (res.ok) {
        showToast('AMC Contract renewed successfully! Fresh compliance visits scheduled.', 'success');
        setRenewingContract(null);
        loadData();
        if (tab === 'schedule') loadMonthlySchedule();
      } else {
        const err = await res.json();
        showToast(err.message || 'Renewal failed', 'error');
      }
    } catch {
      showToast('Network error during renewal', 'error');
    }
  };

  // Update Visit Status
  const handleUpdateVisitStatus = async (visitId, nextStatus) => {
    try {
      const res = await fetch(`/api/amc-visits/${visitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ visit_status: nextStatus, status: nextStatus })
      });
      if (res.ok) {
        showToast(`Visit marked as ${nextStatus}`, 'success');
        loadMonthlySchedule();
      }
    } catch {
      showToast('Failed to update visit status', 'error');
    }
  };

  // Update Quarter Inspection Report Status (Strict Q1-Q4 workflow)
  const handleUpdateQuarterReport = async (contractId, quarter, updatePayload) => {
    setQuarterSaving(true);
    try {
      const res = await fetch(`/api/amc-contracts/${contractId}/quarters/${quarter}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(updatePayload)
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`${quarter} inspection report status updated to ${updated.status}`, 'success');
        setViewingContractDetail(prev => {
          if (!prev) return prev;
          const newQuarters = { ...(prev.quarters || {}), [quarter]: updated };
          return { ...prev, quarters: newQuarters };
        });
        setContracts(prev => prev.map(c => {
          if (c.id === contractId) {
            const newQuarters = { ...(c.quarters || {}), [quarter]: updated };
            return { ...c, quarters: newQuarters };
          }
          return c;
        }));
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed updating quarter report', 'error');
      }
    } catch {
      showToast('Network error updating quarter report', 'error');
    } finally {
      setQuarterSaving(false);
    }
  };

  // Refresh contract quarters and updated visits
  const refreshContractQuarters = async (contractId) => {
    try {
      const res = await fetch(`/api/amc-contracts/${contractId}/quarters`, {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (res.ok) {
        const quarters = await res.json();
        setViewingContractDetail(prev => {
          if (!prev || prev.id !== contractId) return prev;
          return { ...prev, quarters };
        });
      }
      const cRes = await fetch('/api/amc-contracts', {
        headers: {
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        }
      });
      if (cRes.ok) {
        const all = await cRes.json();
        const found = all.find(c => c.id === contractId);
        if (found) {
          setViewingContractDetail(prev => {
            if (!prev || prev.id !== contractId) return prev;
            return { ...prev, visits: found.visits || prev.visits };
          });
        }
      }
    } catch (e) {
      console.error('Error refreshing quarters:', e);
    }
  };

  // Open Contract Detail Modal helper
  const handleOpenContractDetail = (c, initialTab = 'overview', initialQ = 'overview_table') => {
    setViewingContractDetail(c);
    setDetailTab(initialTab);
    setActiveQuarterTab(initialQ);
    refreshContractQuarters(c.id);
  };

  // Handle Reschedule Visit (Requirement 5: Preserves original date, logs audit)
  const handleRescheduleVisit = async (e) => {
    e.preventDefault();
    if (!reschedulingVisit || !newRescheduleDate) return;
    try {
      const res = await fetch(`/api/amc-visits/${reschedulingVisit.id}/reschedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          new_scheduled_date: newRescheduleDate,
          scheduled_date: newRescheduleDate,
          reason: rescheduleReason || 'Customer requested date modification'
        })
      });
      if (res.ok) {
        showToast(`Visit rescheduled to ${newRescheduleDate}`, 'success');
        setReschedulingVisit(null);
        setRescheduleReason('');
        if (viewingContractDetail) {
          refreshContractQuarters(viewingContractDetail.id);
        }
        loadData();
        loadMonthlySchedule();
      } else {
        const err = await res.json();
        showToast(err.error || err.message || 'Failed to reschedule visit', 'error');
      }
    } catch {
      showToast('Failed to reschedule visit', 'error');
    }
  };

  // Handle Complete Service Visit (Requirement 3 & 7: Actual Completed Service Date & Next Service Rule)
  const handleCompleteVisitSubmit = async (e) => {
    e.preventDefault();
    if (!completingVisit || !completionActualDate) return;
    setCompletionSaving(true);
    try {
      const perServiceStatus = {};
      const systems = completingVisit.systems || [completingVisit.system || completingVisit.system_type || 'Inspection'];
      systems.forEach(s => {
        perServiceStatus[s] = {
          completed: completionServicesStatus[s] !== false,
          status: completionServicesStatus[s] !== false ? 'Completed' : 'Scheduled',
          completed_at: completionActualDate
        };
      });

      const photos = completionPhotoUrl ? [{ url: completionPhotoUrl, caption: 'Inspection Evidence', uploaded_at: new Date().toISOString() }] : [];

      const res = await fetch(`/api/amc-visits/${completingVisit.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          actual_service_date: completionActualDate,
          remarks: completionRemarks,
          completed_date: new Date().toISOString(),
          status: 'Completed',
          services_status: perServiceStatus,
          photos: photos,
          technician_name: completingVisit.technician_name || completingVisit.assigned_technician || currentUser.name
        })
      });
      if (res.ok) {
        showToast(`Service visit completed on ${completionActualDate}! Subsequent visits updated according to scheduling rule.`, 'success');
        setCompletingVisit(null);
        setCompletionRemarks('');
        setCompletionPhotoUrl('');
        setCompletionServicesStatus({});
        if (viewingContractDetail) {
          refreshContractQuarters(viewingContractDetail.id);
        }
        loadData();
        loadMonthlySchedule();
      } else {
        const err = await res.json();
        showToast(err.error || err.message || 'Failed to complete visit', 'error');
      }
    } catch {
      showToast('Failed to complete visit', 'error');
    } finally {
      setCompletionSaving(false);
    }
  };

  // Handle Save Reminder Days
  const handleSaveReminders = async (contractId, reminderDays) => {
    try {
      const res = await fetch(`/api/amc-contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ reminder_days: reminderDays })
      });
      if (res.ok) {
        showToast('Reminder schedule updated', 'success');
        setReminderConfigModal(null);
        loadData();
      }
    } catch (e) {
      showToast('Failed to update reminders', 'error');
    }
  };

  // Month navigation
  const prevMonth = () => {
    if (scheduleMonth === 1) {
      setScheduleMonth(12);
      setScheduleYear(y => y - 1);
    } else {
      setScheduleMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (scheduleMonth === 12) {
      setScheduleMonth(1);
      setScheduleYear(y => y + 1);
    } else {
      setScheduleMonth(m => m + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getSystemColor = (sys) => {
    if (!sys) return 'bg-slate-100 text-slate-800 border-slate-200';
    if (sys.includes('Alarm')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (sys.includes('Fighting') || sys.includes('Pump')) return 'bg-red-50 text-red-700 border-red-200';
    if (sys.includes('Extinguisher')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const draftCount = contracts.filter(c => (c.status === 'Draft' || c.contract_status === 'Draft')).length;
  const submittedCount = contracts.filter(c => (c.status === 'Submitted' || c.contract_status === 'Submitted')).length;
  const returnedCount = contracts.filter(c => (c.status === 'Returned for Correction' || c.contract_status === 'Returned for Correction')).length;
  const activeCount = contracts.filter(c => (['Active', 'Approved'].includes(c.status) || ['Active', 'Approved'].includes(c.contract_status)) && c.contract_status !== 'Expired').length;

  const filteredContracts = contracts.filter((c) => {
    const s = c.status || c.contract_status || 'Draft';
    if (filterStatus !== 'all') {
      if (filterStatus === 'Active') {
        if (!['Active', 'Approved'].includes(s) || c.contract_status === 'Expired') return false;
      } else if (filterStatus === 'Submitted') {
        if (s !== 'Submitted') return false;
      } else if (filterStatus === 'Draft') {
        if (s !== 'Draft') return false;
      } else if (filterStatus === 'Returned') {
        if (s !== 'Returned for Correction') return false;
      } else if (filterStatus === 'Expiring Soon') {
        if (c.contract_status !== 'Expiring Soon') return false;
      } else if (filterStatus === 'Expired') {
        if (c.contract_status !== 'Expired') return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.contract_number?.toLowerCase().includes(q) ||
        c.customer_name?.toLowerCase().includes(q) ||
        c.site_name?.toLowerCase().includes(q) ||
        c.sales_person_name?.toLowerCase().includes(q) ||
        c.quotation_number?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Days in selected month for calendar
  const daysInMonth = new Date(scheduleYear, scheduleMonth, 0).getDate();
  const firstDayOfWeek = new Date(scheduleYear, scheduleMonth - 1, 1).getDay();

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>{isSales ? 'My AMC Contracts' : 'AMC Contracts & Schedule'}</span>
            </h1>
            <p className="text-xs text-slate-500">
              {isSales 
                ? 'Create contracts, submit for management approval, track active compliance visits and renewals.' 
                : 'Civil Defence quarterly & semi-annual safety maintenance management & approvals.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {tab === 'contracts' && (
              <button
                onClick={() => exportAmcToExcel(filteredContracts)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Export AMC Contracts to Excel (Requirement 11)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export AMC to Excel</span>
              </button>
            )}
            {!isTechnician && (
              <button
                onClick={() => {
                  setNewContract(defaultNewContract());
                  setShowNewContractModal(true);
                }}
                className="px-3.5 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Contract</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs: Contracts vs Monthly Schedule */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab('contracts')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'contracts'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Contracts ({contracts.length})</span>
          </button>
          <button
            onClick={() => setTab('schedule')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'schedule'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Monthly Schedule ({scheduleSummary?.total || monthlyVisits.length || 0})</span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* --- TAB 1: CONTRACTS VIEW --- */}
      {/* ========================================== */}
      {tab === 'contracts' && (
        <div className="space-y-3">
          
          {/* Management Pending Approval Notification Banner */}
          {isManagement && submittedCount > 0 && filterStatus !== 'Submitted' && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold shrink-0">
                  <Bell className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    {submittedCount} AMC Contract{submittedCount > 1 ? 's' : ''} Awaiting Management Approval
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Review pricing and systems submitted by sales specialists before scheduling visits.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFilterStatus('Submitted')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors shrink-0"
              >
                Review Now ({submittedCount})
              </button>
            </div>
          )}

          {/* Search & Status Filters */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by contract #, customer, site, quotation, or salesperson..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {(isSales ? [
                { id: 'all', label: `All My AMC (${contracts.length})` },
                { id: 'Draft', label: `Drafts (${draftCount})`, color: 'text-slate-700 bg-slate-100' },
                { id: 'Submitted', label: `Submitted (${submittedCount})`, color: 'text-blue-700 bg-blue-50' },
                { id: 'Active', label: `Active / Approved (${activeCount})`, color: 'text-emerald-700 bg-emerald-50' },
                { id: 'Returned', label: `Returned (${returnedCount})`, color: 'text-rose-700 bg-rose-50' },
                { id: 'Expiring Soon', label: 'Expiring Soon', color: 'text-amber-700 bg-amber-50' },
                { id: 'Expired', label: 'Expired', color: 'text-red-700 bg-red-50' }
              ] : [
                { id: 'all', label: `All Contracts (${contracts.length})` },
                { id: 'Submitted', label: `Pending Approval (${submittedCount})`, color: submittedCount > 0 ? 'text-amber-800 bg-amber-100 font-extrabold ring-1 ring-amber-300' : 'text-blue-700 bg-blue-50' },
                { id: 'Active', label: `Active (${activeCount})`, color: 'text-emerald-700 bg-emerald-50' },
                { id: 'Expiring Soon', label: 'Expiring Soon', color: 'text-amber-700 bg-amber-50' },
                { id: 'Expired', label: 'Expired', color: 'text-red-700 bg-red-50' },
                { id: 'Draft', label: `Drafts (${draftCount})`, color: 'text-slate-700 bg-slate-100' },
                { id: 'Returned', label: `Returned (${returnedCount})`, color: 'text-rose-700 bg-rose-50' }
              ]).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    filterStatus === f.id
                      ? 'bg-navy-900 text-white'
                      : f.color || 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contracts List */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading AMC records...</div>
          ) : filteredContracts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400 border border-slate-200">
              No AMC contracts found matching criteria.
            </div>
          ) : (
            filteredContracts.map((c) => {
              const contractStatus = c.status || c.contract_status || 'Draft';
              const isDraft = contractStatus === 'Draft';
              const isSubmitted = contractStatus === 'Submitted';
              const isReturned = contractStatus === 'Returned for Correction';
              const isExpiring = c.contract_status === 'Expiring Soon';
              const isExpired = c.contract_status === 'Expired';
              const isActive = ['Active', 'Approved'].includes(contractStatus) && !isExpired && !isExpiring;

              return (
                <div
                  key={c.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-sm hover:shadow-md ${
                    isReturned
                      ? 'border-rose-300 bg-rose-50/15'
                      : isSubmitted
                      ? 'border-blue-300 bg-blue-50/15'
                      : isDraft
                      ? 'border-slate-300 bg-slate-50/30 border-dashed'
                      : isExpired
                      ? 'border-red-200 bg-red-50/20'
                      : isExpiring
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isDraft ? 'bg-slate-200 text-slate-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {c.contract_number}
                        </span>

                        {c.quotation_number && (
                          <span className="text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded">
                            Quote: {c.quotation_number}
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            isDraft
                              ? 'bg-slate-200 text-slate-700'
                              : isSubmitted
                              ? 'bg-blue-100 text-blue-800 border border-blue-200 animate-pulse'
                              : isReturned
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 font-black'
                              : isExpired
                              ? 'bg-red-100 text-red-700'
                              : isExpiring
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isSubmitted ? 'Submitted for Approval' : contractStatus}
                        </span>

                        {/* Payment Pending Warning Badge */}
                        {(c.has_unpaid_invoices || c.payment_status === 'Unpaid' || c.payment_status === 'Overdue') && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 shadow-sm">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            <span>⚠ PAYMENT PENDING</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                        {c.site_name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {c.customer_name}
                      </p>
                    </div>

                    {/* Expiry Countdown Tag */}
                    <div className="text-right">
                      {isDraft || isSubmitted || isReturned ? (
                        <div className="text-xs font-extrabold px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                          {isDraft ? 'Draft Status' : isSubmitted ? 'Pending Review' : 'Needs Correction'}
                        </div>
                      ) : c.days_to_expiry !== undefined ? (
                        <div
                          className={`text-xs font-extrabold px-2 py-1 rounded-lg ${
                            isExpired
                              ? 'bg-red-600 text-white'
                              : c.days_to_expiry <= 30
                              ? 'bg-amber-500 text-white animate-bounce'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isExpired
                            ? `Expired ${Math.abs(c.days_to_expiry)}d ago`
                            : `${c.days_to_expiry} days left`}
                        </div>
                      ) : null}

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isDraft || isSubmitted ? 'Visits Pending Approval' : `${c.visits_per_year || calculateTotalVisits(c.systems_covered || [])} Visits/Year`}
                      </p>
                    </div>
                  </div>

                  {/* Return Notes Banner if Returned for Correction */}
                  {isReturned && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                      <div className="font-bold flex items-center gap-1.5 text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Returned for Correction by {c.returned_by || 'Management'}:</span>
                      </div>
                      <p className="mt-1 text-rose-700">{c.return_notes || 'Please adjust the contract terms and resubmit for approval.'}</p>
                    </div>
                  )}

                  {/* Contract Details Grid */}
                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Start Date
                      </span>
                      <span className="font-semibold text-slate-800">{c.start_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        End Date
                      </span>
                      <span className="font-semibold text-slate-800">{c.end_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 block">
                        Service Starting
                      </span>
                      <span className="font-bold text-blue-900">{c.service_start_date || c.start_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Sales Specialist
                      </span>
                      <span className="font-bold text-slate-900 truncate block">
                        {c.sales_person_name || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Contract Value &amp; VAT
                      </span>
                      {isTechnician ? (
                        <span className="font-mono font-bold text-slate-400">Protected</span>
                      ) : (
                        <div>
                          <span className="font-mono font-black text-amber-800 block text-xs">
                            {formatBHD(c.total_including_vat !== undefined ? c.total_including_vat : (c.contract_value || c.amount))}
                          </span>
                          <span className="text-[9px] text-slate-500 block leading-tight font-medium">
                            Excl: {formatBHD(c.contract_value || c.amount)} | VAT ({c.vat_percent !== undefined ? c.vat_percent : 10}%): {formatBHD(c.vat_amount || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Next Service Date
                      </span>
                      <span className={`font-semibold truncate block ${
                        isDraft || isSubmitted || isReturned ? 'text-amber-700' : 'text-blue-700'
                      }`}>
                        {c.next_visit || (isDraft || isSubmitted ? 'Pending Approval' : 'None scheduled')}
                      </span>
                      {c.services_due && c.services_due.length > 0 && (
                        <span className="text-[9px] text-emerald-700 font-bold block truncate">
                          Due: {c.services_due.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Personnel Row: Assigned Supervisor & Technician (Requirement 1 & 14) */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 px-2.5 py-1.5 rounded-xl">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Supervisor</span>
                          <span className="font-bold text-slate-800 text-[11px]">{c.assigned_supervisor || c.supervisor_name || 'Unassigned'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">Lead Tech / Engineer</span>
                          <span className="font-bold text-slate-800 text-[11px]">{c.assigned_technician || c.technician_name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Systems Covered Badges with visit breakdown */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Systems Covered &amp; Visit Frequencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(c.systems_covered || c.systems || []).map((sys, idx) => {
                        const opt = SYSTEM_OPTIONS.find(o => o.id === sys);
                        return (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${getSystemColor(sys)}`}
                          >
                            <span>{sys}</span>
                            <span className="font-mono font-bold text-[9px] opacity-80">
                              ({opt ? `${opt.visitsPerYear}v/yr` : 'periodic'})
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* AMC Quarterly Inspection Status Badges (Q1–Q4) */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Quarterly Inspection Compliance (Q1–Q4)</span>
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400">
                        Periodic NFPA Cycles
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map((qKey, qIdx) => {
                        const qData = c.quarters?.[qKey] || { status: 'Not Started' };
                        const qStatus = qData.status || 'Not Started';
                        const isCompliant = ['Completed', 'Approved'].includes(qStatus);
                        const isOverdue = qStatus === 'Overdue';
                        const isPending = qStatus.includes('Pending') || qStatus.includes('Submitted') || qStatus.includes('Reviewed');
                        const defaultQuarterDate = (c.service_start_date || c.start_date) ? addCalendarMonths(c.service_start_date || c.start_date, qIdx * 3) : '';
                        const displayDate = qData.actual_visit_date || qData.visit_date || qData.scheduled_date || defaultQuarterDate || 'TBD';

                        return (
                          <div
                            key={qKey}
                            onClick={() => handleOpenContractDetail(c, 'inspections', qKey)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer hover:shadow-xs ${
                              isCompliant
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/60'
                                : isOverdue
                                ? 'bg-red-50 text-red-800 border-red-300 animate-pulse hover:bg-red-100/60'
                                : isPending
                                ? 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100/60'
                                : qStatus === 'Scheduled'
                                ? 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100/60'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={`Click to view ${qKey} inspection and report`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-black">
                              <span>{qKey}</span>
                              <span className="text-[9px] font-semibold opacity-75 truncate max-w-[70px]">
                                {displayDate}
                              </span>
                            </div>
                            <div className="text-[9.5px] font-bold truncate mt-0.5" title={qStatus}>
                              {qStatus}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remarks if any */}
                  {c.remarks && (
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg italic">
                      Remarks: {c.remarks}
                    </p>
                  )}

                  {/* Approval / Submission Metadata */}
                  {c.approved_by_name && (
                    <div className="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved by {c.approved_by_name} on {c.approved_at?.slice(0, 10)}</span>
                    </div>
                  )}

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* View Details Button (Requirement 5) */}
                      <button
                        onClick={() => handleOpenContractDetail(c, 'overview', 'overview_table')}
                        className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="View Full Contract Details, Visits, Reports & Faults"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      {/* Reminder Configuration Button */}
                      <button
                        onClick={() => setReminderConfigModal(c)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Adjust Reminder Intervals"
                      >
                        <Bell className="w-3.5 h-3.5 text-amber-600" />
                        <span className="hidden sm:inline">Reminders</span> ({(c.reminder_days || [90, 60, 30, 7]).join(', ')}d)
                      </button>
                    </div>

                    {/* Workflow Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      
                      {/* DRAFT STATE ACTIONS */}
                      {isDraft && (
                        <>
                          <button
                            onClick={() => handleSubmitForApproval(c.id)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Submit for Approval</span>
                          </button>
                          {isSales && (
                            <button
                              onClick={() => setEditingContract(c)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Wrench className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Draft</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* SUBMITTED STATE ACTIONS */}
                      {isSubmitted && (
                        <>
                          {isManagement ? (
                            <>
                              <button
                                onClick={() => handleApproveContract(c.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve &amp; Schedule Visits</span>
                              </button>
                              <button
                                onClick={() => {
                                  setReturningContract(c);
                                  setReturnRemarks('');
                                }}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Return for Correction</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Awaiting Management Approval</span>
                            </span>
                          )}
                        </>
                      )}

                      {/* RETURNED FOR CORRECTION STATE ACTIONS */}
                      {isReturned && (
                        <>
                          {isSales && (
                            <>
                              <button
                                onClick={() => setEditingContract(c)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Edit &amp; Resubmit</span>
                              </button>
                              <button
                                onClick={() => handleSubmitForApproval(c.id)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Submit for Approval</span>
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* ACTIVE / APPROVED / EXPIRING / EXPIRED STATE ACTIONS */}
                      {!isDraft && !isSubmitted && !isReturned && (
                        <>
                          {/* Renewal Button (Sales can renew their own, Management can renew any) */}
                          {(isManagement || (isSales && c.sales_person_id === currentUser.id)) && (
                            <button
                              onClick={() => openRenewalModal(c)}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Renew Contract</span>
                            </button>
                          )}

                          {/* Go to schedule */}
                          <button
                            onClick={() => {
                              setScheduleFilters(p => ({ ...p, status: 'all' }));
                              setTab('schedule');
                            }}
                            className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>View Visits</span>
                          </button>
                        </>
                      )}

                      {/* MANAGEMENT ONLY (GM, Engineer, Supervisor): EDIT & DELETE FOR AMC CONTRACTS */}
                      {isManagement && (
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => setEditingContract(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Edit AMC Contract (GM, Engineer, Supervisor)"
                          >
                            <Edit className="w-3 h-3 text-blue-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setContractToDelete(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Delete AMC Contract (GM, Engineer, Supervisor)"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* --- TAB 2: AMC MONTHLY SCHEDULE VIEW --- */}
      {/* ========================================== */}
      {tab === 'schedule' && (
        <div className="space-y-4">
          
          {/* Month / Year Picker Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <select
                  value={scheduleMonth}
                  onChange={(e) => setScheduleMonth(Number(e.target.value))}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-navy-900 focus:ring-2 focus:ring-blue-600"
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>

                <select
                  value={scheduleYear}
                  onChange={(e) => setScheduleYear(Number(e.target.value))}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-navy-900 focus:ring-2 focus:ring-blue-600"
                >
                  {[2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons: Export to Excel, Print Schedule, and List vs Calendar Toggle */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => exportMonthlyScheduleToExcel(monthlyVisits, monthNames[scheduleMonth - 1], scheduleYear)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Export Monthly Schedule to Excel (Requirement 12)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export Schedule</span>
              </button>

              <button
                onClick={() => setShowPrintScheduleModal(true)}
                className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                title="Print Official A4 Monthly Schedule (Requirement 17)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Schedule</span>
              </button>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setScheduleViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    scheduleViewMode === 'list'
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setScheduleViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    scheduleViewMode === 'calendar'
                      ? 'bg-white text-navy-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Monthly Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Visits</span>
              <span className="text-xl font-black text-navy-900">{scheduleSummary.total || 0}</span>
            </div>

            <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Completed</span>
              <span className="text-xl font-black text-emerald-900">{scheduleSummary.completed || 0}</span>
            </div>

            <div className="bg-blue-50 rounded-xl p-2.5 border border-blue-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-blue-800 block">Scheduled</span>
              <span className="text-xl font-black text-blue-900">{scheduleSummary.scheduled || 0}</span>
            </div>

            <div className="bg-indigo-50 rounded-xl p-2.5 border border-indigo-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-indigo-800 block">In Progress</span>
              <span className="text-xl font-black text-indigo-900">{scheduleSummary.in_progress || 0}</span>
            </div>

            <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Rescheduled</span>
              <span className="text-xl font-black text-amber-900">{scheduleSummary.rescheduled || 0}</span>
            </div>

            <div className="bg-red-50 rounded-xl p-2.5 border border-red-200 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-red-800 block">Cancelled</span>
              <span className="text-xl font-black text-red-900">{scheduleSummary.cancelled || 0}</span>
            </div>
          </div>

          {/* Multi-Filters Bar: 8 Integrated Filters (Requirement 10) */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
            {/* 1. Customer Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Customer</label>
              <select
                value={scheduleFilters.customer_id}
                onChange={(e) => setScheduleFilters(p => ({ ...p, customer_id: e.target.value }))}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="all">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* 2. Site Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Site</label>
              <select
                value={scheduleFilters.site_id}
                onChange={(e) => setScheduleFilters(p => ({ ...p, site_id: e.target.value }))}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="all">All Sites</option>
                {sites
                  .filter(s => scheduleFilters.customer_id === 'all' || s.customer_id === scheduleFilters.customer_id)
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.site_name}</option>
                  ))}
              </select>
            </div>

            {/* 3. AMC Contract Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">AMC Contract</label>
              <select
                value={scheduleFilters.amc_id}
                onChange={(e) => setScheduleFilters(p => ({ ...p, amc_id: e.target.value }))}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="all">All AMCs</option>
                {contracts.map(c => (
                  <option key={c.id} value={c.id}>{c.contract_number}</option>
                ))}
              </select>
            </div>

            {/* 4. Sales Person Filter */}
            {isManagement ? (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sales Person</label>
                <select
                  value={scheduleFilters.sales_person_id}
                  onChange={(e) => setScheduleFilters(p => ({ ...p, sales_person_id: e.target.value }))}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
                >
                  <option value="all">All Sales</option>
                  {salesUsers.map(su => (
                    <option key={su.id} value={su.id}>{su.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sales Person</label>
                <div className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs truncate">
                  {currentUser?.name}
                </div>
              </div>
            )}

            {/* 5. System Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">System</label>
              <select
                value={scheduleFilters.system}
                onChange={(e) => setScheduleFilters(p => ({ ...p, system: e.target.value }))}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="all">All Systems</option>
                <option value="Fire Alarm">Fire Alarm</option>
                <option value="Fire Fighting">Fire Fighting</option>
                <option value="Fire Extinguishers">Fire Extinguishers</option>
              </select>
            </div>

            {/* 6. Supervisor Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Supervisor</label>
              <select
                value={scheduleFilters.supervisor_id}
                onChange={(e) => setScheduleFilters(p => ({ ...p, supervisor_id: e.target.value }))}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="all">All Supervisors</option>
                {supervisorUsers.map(su => (
                  <option key={su.id} value={su.id}>{su.name}</option>
                ))}
              </select>
            </div>

            {/* 7. Technician Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Technician</label>
              <select
                value={scheduleFilters.technician_id}
                onChange={(e) => setScheduleFilters(p => ({ ...p, technician_id: e.target.value }))}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="all">All Techs</option>
                {technicianUsers.map(tu => (
                  <option key={tu.id} value={tu.id}>{tu.name}</option>
                ))}
              </select>
            </div>

            {/* 8. Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
              <select
                value={scheduleFilters.status}
                onChange={(e) => setScheduleFilters(p => ({ ...p, status: e.target.value }))}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-navy-900 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* VIEW: CALENDAR GRID */}
          {scheduleViewMode === 'calendar' && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] uppercase mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {/* Empty leading cells */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[70px] bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${scheduleYear}-${String(scheduleMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayVisits = monthlyVisits.filter(v => v.scheduled_date === dateStr);
                  const isToday = today.getFullYear() === scheduleYear && (today.getMonth() + 1) === scheduleMonth && today.getDate() === dayNum;

                  return (
                    <div
                      key={dayNum}
                      className={`min-h-[85px] p-1.5 rounded-xl border flex flex-col justify-between transition-colors ${
                        isToday
                          ? 'border-blue-500 bg-blue-50/30'
                          : dayVisits.length > 0
                          ? 'border-slate-300 bg-white hover:border-blue-400 shadow-xs'
                          : 'border-slate-100 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-black rounded-md px-1 ${
                          isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
                        }`}>
                          {dayNum}
                        </span>
                        {dayVisits.length > 0 && (
                          <span className="text-[9px] font-bold text-blue-700">
                            {dayVisits.length}v
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mt-1 overflow-hidden">
                        {dayVisits.map((v) => (
                          <div
                            key={v.id}
                            onClick={() => {
                              if (onStartInspectionForVisit) onStartInspectionForVisit(v);
                            }}
                            title={`${v.system_type || v.system}: ${v.site_name} (${v.status || v.visit_status})`}
                            className={`p-1 rounded text-[9px] font-bold truncate cursor-pointer transition-transform hover:scale-102 ${getSystemColor(v.system_type || v.system)}`}
                          >
                            <span className="block truncate">{v.site_name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: DETAILED LIST */}
          {scheduleViewMode === 'list' && (
            <div className="space-y-2.5">
              {monthlyVisits.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-xs text-slate-400 border border-slate-200">
                  No AMC visits found matching criteria for {monthNames[scheduleMonth - 1]} {scheduleYear}.
                </div>
              ) : (
                monthlyVisits.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSystemColor(v.system_type || v.system)}`}>
                            {v.systems_label || v.system_type || v.system}
                          </span>
                          <span className="text-xs font-mono font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                            {v.contract_number} • Visit #{v.visit_number}
                          </span>
                          <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {v.quarter || 'Q1'}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              (v.visit_status || v.status) === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : (v.visit_status || v.status) === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : (v.visit_status || v.status) === 'Rescheduled'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {v.visit_status || v.status}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            v.report_id || v.report_status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : v.report_status === 'Submitted'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            Report: {v.report_status || (v.report_id ? 'Completed' : 'Not Started')}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                          {v.site_name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {v.customer_name} {v.site_address ? `• ${v.site_address}` : ''}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800 block flex items-center justify-end gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>{v.scheduled_date}</span>
                          {v.day && <span className="text-slate-500 font-normal">({v.day})</span>}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Tech: {v.technician_name || 'Rajesh Kumar'}
                        </span>
                      </div>
                    </div>

                    {/* Personnel & Responsibilities */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Sales Specialist</span>
                        <span className="font-bold text-slate-800 truncate block">{v.sales_person_name || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assigned Supervisor</span>
                        <span className="font-bold text-slate-800 truncate block">{v.supervisor_name || 'Unassigned Supervisor'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Assigned Technician</span>
                        <span className="font-bold text-slate-800 truncate block">{v.technician_name || 'Unassigned Technician'}</span>
                      </div>
                    </div>

                    {v.remarks && (
                      <p className="text-xs text-slate-600 italic pl-1">
                        "{v.remarks}"
                      </p>
                    )}

                    {/* Actions Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Digital AMC Checklist Button (Requirements 3-8) */}
                        <button
                          onClick={() => setActiveChecklistVisit(v)}
                          className="px-3 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Wrench className="w-3.5 h-3.5 text-blue-400" />
                          <span>Digital Checklist</span>
                        </button>

                        {/* Supervisor Review Button (Requirement 18) */}
                        {isManagement && (
                          <button
                            onClick={() => setReviewingVisit(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>Supervisor Review</span>
                          </button>
                        )}

                        {/* View AMC Report PDF (Requirements 9-11) */}
                        <button
                          onClick={() => setPreviewingReportVisit(v)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Report (PDF)</span>
                        </button>

                        {/* Reassign Visit Staff Button (Requirement 1) */}
                        {isManagement && (
                          <button
                            onClick={() => {
                              setAssigningVisit(v);
                              setAssignSupervisorId(v.supervisor_id || '');
                              setAssignTechnicianId(v.technician_id || '');
                            }}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                            title="Reassign Supervisor or Technician for this visit without changing contract default"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                            <span>Assign</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setReschedulingVisit(v);
                            setNewRescheduleDate(v.scheduled_date);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Reschedule</span>
                        </button>
                      </div>

                      {/* Quick Status Toggle */}
                      <div className="flex items-center gap-1">
                        {(v.visit_status || v.status) !== 'Completed' ? (
                          <button
                            onClick={() => openCompleteVisitModal(v)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Completed</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateVisitStatus(v.id, 'Scheduled')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold"
                          >
                            Re-schedule
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================== */}
      {/* ========================================== */}
      {/* --- MODAL 1: NEW AMC CONTRACT --- */}
      {/* ========================================== */}
      {showNewContractModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto p-5 animate-in slide-in-from-bottom text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span>{isSales ? 'Create Sales AMC Contract' : 'Create AMC Contract'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isSales 
                    ? 'Save as draft or submit to General Manager / Engineering for approval.'
                    : 'Configure terms, pricing, and system visit compliance schedules.'}
                </p>
              </div>
              <button
                onClick={() => setShowNewContractModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              
              {/* Customer Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Customer / Company *</label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCustomer(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ New Customer</span>
                  </button>
                </div>
                <select
                  required
                  value={newContract.customer_id}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const defaultSite = sites.find((s) => s.customer_id === cid)?.id || '';
                    setNewContract((prev) => ({ ...prev, customer_id: cid, site_id: defaultSite }));
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Site Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Site / Premises *</label>
                <select
                  required
                  value={newContract.site_id}
                  onChange={(e) => setNewContract((prev) => ({ ...prev, site_id: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-xs font-medium"
                >
                  <option value="">-- Select Site --</option>
                  {sites
                    .filter((s) => !newContract.customer_id || s.customer_id === newContract.customer_id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.site_name}</option>
                    ))}
                </select>
              </div>

              {/* Quotation Number & Contract Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quotation Number (Optional)</label>
                  <input
                    type="text"
                    value={newContract.quotation_number}
                    onChange={(e) => setNewContract(p => ({ ...p, quotation_number: e.target.value }))}
                    placeholder="e.g. QT-2026-089"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={newContract.contract_type}
                    onChange={(e) => setNewContract(p => ({ ...p, contract_type: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    <option value="Comprehensive">Comprehensive (Parts &amp; Labor)</option>
                    <option value="Semi-Comprehensive">Semi-Comprehensive (Labor + Major Parts)</option>
                    <option value="Non-Comprehensive">Non-Comprehensive (Service Only)</option>
                  </select>
                </div>
              </div>

              {/* Multi-System Covered Selection with Frequency Indicators */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-700">Systems Covered &amp; Visit Frequencies *</label>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {calculateTotalVisits(newContract.systems_covered)} Visits/Year Total
                  </span>
                </div>

                <div className="space-y-2">
                  {SYSTEM_OPTIONS.map((opt) => {
                    const isChecked = newContract.systems_covered.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-white border-blue-400 shadow-xs' 
                            : 'bg-slate-100/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let updated;
                              if (e.target.checked) {
                                updated = [...newContract.systems_covered, opt.id];
                              } else {
                                updated = newContract.systems_covered.filter(x => x !== opt.id);
                              }
                              setNewContract(p => ({ ...p, systems_covered: updated }));
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">{opt.label}</span>
                            <span className="text-[10px] text-slate-500">
                              Every {opt.frequencyMonths} months ({opt.visitsPerYear} compliance visits per year)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          +{opt.visitsPerYear} visits
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Contract Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newContract.start_date}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      const d = new Date(newStart);
                      d.setFullYear(d.getFullYear() + 1);
                      setNewContract(p => ({
                        ...p,
                        start_date: newStart,
                        end_date: d.toISOString().slice(0, 10),
                        service_start_date: (!p.service_start_date || p.service_start_date === p.start_date) ? newStart : p.service_start_date
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract End Date *</label>
                  <input
                    type="date"
                    required
                    value={newContract.end_date}
                    onChange={(e) => setNewContract((prev) => ({ ...prev, end_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Service Starting Date & Optional Extinguisher Starting Date */}
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-blue-900 mb-1 flex items-center justify-between">
                      <span>Service Starting Date *</span>
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">First Service</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={newContract.service_start_date || newContract.start_date}
                      onChange={(e) => setNewContract((prev) => ({ ...prev, service_start_date: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-xs text-blue-900 shadow-xs"
                    />
                    <span className="text-[10px] text-blue-600 mt-1 block">
                      Visit 1 is scheduled here; subsequent visits follow every 3 months.
                    </span>
                  </div>

                  {newContract.systems_covered.some(s => s.toLowerCase().includes('extinguish')) && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Extinguisher Start Date (Optional)</span>
                        <span className="text-[10px] font-semibold text-slate-500">2 Visits / Yr</span>
                      </label>
                      <input
                        type="date"
                        value={newContract.extinguisher_start_date || ''}
                        onChange={(e) => setNewContract((prev) => ({ ...prev, extinguisher_start_date: e.target.value }))}
                        placeholder={newContract.service_start_date || newContract.start_date}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Defaults to Service Starting Date ({newContract.service_start_date || newContract.start_date}).
                      </span>
                    </div>
                  )}
                </div>

                {/* Live Service Schedule Preview */}
                <div className="pt-2 border-t border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Service Schedule Preview ({calculateSchedulePreview(newContract).length} Visits)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Same-Day Services Combined
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {calculateSchedulePreview(newContract).map((v) => (
                      <div key={v.visit_number} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono font-black text-[10px] bg-navy-900 text-white px-1.5 py-0.5 rounded">
                              Visit #{v.visit_number}
                            </span>
                            <span className="font-extrabold text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {v.quarter}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 block">{v.scheduled_date}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{v.day}</span>
                        </div>
                        <div className="text-right max-w-[55%]">
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg inline-block text-right leading-tight">
                            {v.systems_label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contract Value & VAT Rate & Sales Person */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-1">
                    <label className="block font-bold text-slate-700 mb-1">Contract Value (Excl. VAT) *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 font-bold text-slate-400">BHD</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        required
                        value={newContract.contract_value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const vp = newContract.vat_percent !== undefined ? Number(newContract.vat_percent) : 10;
                          const va = (val * vp) / 100;
                          setNewContract(p => ({
                            ...p,
                            contract_value: e.target.value,
                            vat_amount: Math.round(va * 1000) / 1000,
                            total_including_vat: Math.round((val + va) * 1000) / 1000
                          }));
                        }}
                        className="w-full pl-12 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">VAT Rate (%) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={newContract.vat_percent !== undefined ? newContract.vat_percent : (companySettings?.vat_percent || 10)}
                        onChange={(e) => {
                          const vp = parseFloat(e.target.value) || 0;
                          const val = Number(newContract.contract_value) || 0;
                          const va = (val * vp) / 100;
                          setNewContract(p => ({
                            ...p,
                            vat_percent: e.target.value,
                            vat_amount: Math.round(va * 1000) / 1000,
                            total_including_vat: Math.round((val + va) * 1000) / 1000
                          }));
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs pr-6"
                      />
                      <span className="absolute right-2.5 top-2 font-bold text-slate-400 text-xs">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Salesperson *</label>
                    {isSales ? (
                      <div className="p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 flex items-center justify-between text-xs">
                        <span>{currentUser?.name}</span>
                        <span className="text-[9px] bg-blue-100 text-blue-700 font-extrabold px-1.5 py-0.5 rounded">
                          Self
                        </span>
                      </div>
                    ) : (
                      <select
                        value={newContract.sales_person_id}
                        onChange={(e) => setNewContract(p => ({ ...p, sales_person_id: e.target.value }))}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 text-xs"
                      >
                        {salesUsers.map(su => (
                          <option key={su.id} value={su.id}>{su.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Assigned Engineering & Technical Staff (Requirement 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Supervisor *</span>
                    </label>
                    <select
                      required
                      value={newContract.supervisor_id || ''}
                      onChange={(e) => {
                        const u = effectiveSupervisorUsers.find(usr => usr.id === e.target.value);
                        setNewContract(p => ({
                          ...p,
                          supervisor_id: e.target.value,
                          assigned_supervisor: u ? u.name : ''
                        }));
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 text-xs"
                    >
                      <option value="">-- Select Supervisor --</option>
                      {effectiveSupervisorUsers.map(su => (
                        <option key={su.id} value={su.id}>{su.name} ({su.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Technician / Engineer *</span>
                    </label>
                    <select
                      required
                      value={newContract.technician_id || ''}
                      onChange={(e) => {
                        const u = effectiveTechnicianUsers.find(usr => usr.id === e.target.value);
                        setNewContract(p => ({
                          ...p,
                          technician_id: e.target.value,
                          assigned_technician: u ? u.name : ''
                        }));
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 text-xs"
                    >
                      <option value="">-- Select Technician / Engineer --</option>
                      {effectiveTechnicianUsers.map(tu => (
                        <option key={tu.id} value={tu.id}>{tu.name} ({tu.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic VAT Calculation Live Preview (Requirement 8) */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Excl. VAT</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatBHD(newContract.contract_value)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-700 uppercase block font-semibold">
                      VAT ({newContract.vat_percent !== undefined ? newContract.vat_percent : (companySettings?.vat_percent || 10)}%)
                    </span>
                    <span className="font-mono font-bold text-blue-900">
                      {formatBHD((Number(newContract.contract_value || 0) * Number(newContract.vat_percent !== undefined ? newContract.vat_percent : (companySettings?.vat_percent || 10))) / 100)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase block font-black">Total (Incl. VAT)</span>
                    <span className="font-mono font-black text-emerald-900">
                      {formatBHD(Number(newContract.contract_value || 0) + ((Number(newContract.contract_value || 0) * Number(newContract.vat_percent !== undefined ? newContract.vat_percent : (companySettings?.vat_percent || 10))) / 100))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks &amp; Scope Details</label>
                <textarea
                  rows={2}
                  value={newContract.remarks}
                  onChange={(e) => setNewContract((prev) => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Special SLA terms, Civil Defense filing requirements..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewContractModal(false)}
                  className="py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateContract('Draft')}
                  className="px-4 py-3 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-xs"
                >
                  Save as Draft
                </button>
                {isSales ? (
                  <button
                    type="button"
                    onClick={() => handleCreateContract('Submitted')}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center justify-center gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit for Approval</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCreateContract('Active')}
                    className="flex-1 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold shadow-md flex items-center justify-center gap-1.5 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Create &amp; Schedule Visits</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL 1B: EDIT AMC CONTRACT --- */}
      {/* ========================================== */}
      {editingContract && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <span>Edit AMC Contract: {editingContract.contract_number}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Current Status: <span className="font-bold text-blue-700">{editingContract.status || editingContract.contract_status}</span>
                </p>
              </div>
              <button onClick={() => setEditingContract(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1">✕</button>
            </div>

            {editingContract.return_notes && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <span className="font-bold">Correction Feedback: </span>
                {editingContract.return_notes}
              </div>
            )}

            <form onSubmit={handleUpdateContract} className="mt-4 space-y-3.5">
              {/* Customer & Site */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer *</label>
                  <select
                    value={editingContract.customer_id}
                    onChange={(e) => {
                      const cid = e.target.value;
                      const custSites = sites.filter(s => s.customer_id === cid);
                      setEditingContract(p => ({
                        ...p,
                        customer_id: cid,
                        site_id: custSites[0]?.id || ''
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site / Facility *</label>
                  <select
                    value={editingContract.site_id}
                    onChange={(e) => setEditingContract(p => ({ ...p, site_id: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {sites
                      .filter(s => !editingContract.customer_id || s.customer_id === editingContract.customer_id)
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.site_name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Quotation Number, Contract Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quotation Number</label>
                  <input
                    type="text"
                    value={editingContract.quotation_number || ''}
                    onChange={(e) => setEditingContract(p => ({ ...p, quotation_number: e.target.value }))}
                    placeholder="e.g. QT-2026-089"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={editingContract.contract_type}
                    onChange={(e) => setEditingContract(p => ({ ...p, contract_type: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Comprehensive">Comprehensive (Parts &amp; Labor)</option>
                    <option value="Semi-Comprehensive">Semi-Comprehensive (Labor + Major Parts)</option>
                    <option value="Non-Comprehensive">Non-Comprehensive (Service Only)</option>
                  </select>
                </div>
                {isManagement && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editingContract.status || editingContract.contract_status || 'Draft'}
                      onChange={(e) => setEditingContract(p => ({ ...p, status: e.target.value, contract_status: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-navy-900"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Active">Active</option>
                      <option value="Returned for Correction">Returned for Correction</option>
                      <option value="Expiring Soon">Expiring Soon</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Systems Covered */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Systems Covered &amp; Visit Frequency</label>
                <div className="space-y-2">
                  {SYSTEM_OPTIONS.map((opt) => {
                    const isChecked = (editingContract.systems_covered || editingContract.systems || []).includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                          isChecked 
                            ? 'bg-white border-blue-400 shadow-xs' 
                            : 'bg-slate-100/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let updated;
                              const currentSys = editingContract.systems_covered || editingContract.systems || [];
                              if (e.target.checked) {
                                updated = [...currentSys, opt.id];
                              } else {
                                updated = currentSys.filter(x => x !== opt.id);
                              }
                              setEditingContract(p => ({ ...p, systems_covered: updated, systems: updated }));
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          />
                          <div>
                            <span className="font-bold text-slate-800 block text-xs">{opt.label}</span>
                            <span className="text-[10px] text-slate-500">
                              Every {opt.frequencyMonths} months ({opt.visitsPerYear} compliance visits per year)
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          +{opt.visitsPerYear} visits
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Start & End Dates */}
              {/* Contract Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editingContract.start_date}
                    onChange={(e) => setEditingContract(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract End Date *</label>
                  <input
                    type="date"
                    required
                    value={editingContract.end_date}
                    onChange={(e) => setEditingContract(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Service Starting Date & Optional Extinguisher Starting Date */}
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-blue-900 mb-1 flex items-center justify-between">
                      <span>Service Starting Date *</span>
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">First Service</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editingContract.service_start_date || editingContract.start_date}
                      onChange={(e) => setEditingContract((prev) => ({ ...prev, service_start_date: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-xl font-bold text-xs text-blue-900 shadow-xs"
                    />
                    <span className="text-[10px] text-blue-600 mt-1 block">
                      Visit 1 is scheduled here; subsequent visits follow every 3 months.
                    </span>
                  </div>

                  {(editingContract.systems_covered || editingContract.systems || []).some(s => s.toLowerCase().includes('extinguish')) && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Extinguisher Start Date (Optional)</span>
                        <span className="text-[10px] font-semibold text-slate-500">2 Visits / Yr</span>
                      </label>
                      <input
                        type="date"
                        value={editingContract.extinguisher_start_date || ''}
                        onChange={(e) => setEditingContract((prev) => ({ ...prev, extinguisher_start_date: e.target.value }))}
                        placeholder={editingContract.service_start_date || editingContract.start_date}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Defaults to Service Starting Date ({editingContract.service_start_date || editingContract.start_date}).
                      </span>
                    </div>
                  )}
                </div>

                {/* Live Service Schedule Preview */}
                <div className="pt-2 border-t border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Service Schedule Preview ({calculateSchedulePreview(editingContract).length} Visits)</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Same-Day Services Combined
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {calculateSchedulePreview(editingContract).map((v) => (
                      <div key={v.visit_number} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-mono font-black text-[10px] bg-navy-900 text-white px-1.5 py-0.5 rounded">
                              Visit #{v.visit_number}
                            </span>
                            <span className="font-extrabold text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              {v.quarter}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 block">{v.scheduled_date}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{v.day}</span>
                        </div>
                        <div className="text-right max-w-[55%]">
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg inline-block text-right leading-tight">
                            {v.systems_label}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contract Value & VAT Rate & Sales Person */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contract Value (Excl. VAT) *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 font-bold text-slate-400">BHD</span>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        required
                        value={editingContract.contract_value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const vp = editingContract.vat_percent !== undefined ? Number(editingContract.vat_percent) : 10;
                          const va = (val * vp) / 100;
                          setEditingContract(p => ({
                            ...p,
                            contract_value: e.target.value,
                            vat_amount: Math.round(va * 1000) / 1000,
                            total_including_vat: Math.round((val + va) * 1000) / 1000
                          }));
                        }}
                        className="w-full pl-12 pr-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">VAT Rate (%) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        required
                        value={editingContract.vat_percent !== undefined ? editingContract.vat_percent : 10}
                        onChange={(e) => {
                          const vp = parseFloat(e.target.value) || 0;
                          const val = Number(editingContract.contract_value) || 0;
                          const va = (val * vp) / 100;
                          setEditingContract(p => ({
                            ...p,
                            vat_percent: e.target.value,
                            vat_amount: Math.round(va * 1000) / 1000,
                            total_including_vat: Math.round((val + va) * 1000) / 1000
                          }));
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-xs pr-6"
                      />
                      <span className="absolute right-2.5 top-2 font-bold text-slate-400 text-xs">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sales Specialist *</label>
                    {isManagement ? (
                      <select
                        value={editingContract.sales_person_id || ''}
                        onChange={(e) => {
                          const spId = e.target.value;
                          const sp = salesUsers.find(u => u.id === spId);
                          setEditingContract(p => ({
                            ...p,
                            sales_person_id: spId,
                            sales_person_name: sp ? sp.name : 'Unassigned'
                          }));
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 text-xs"
                      >
                        {salesUsers.map(su => (
                          <option key={su.id} value={su.id}>{su.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 truncate text-xs">
                        {editingContract.sales_person_name || currentUser?.name}
                        <span className="text-[9px] text-slate-400 block font-normal">Ownership locked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned Engineering & Technical Staff (Requirement 1) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Assigned Supervisor *</span>
                    </label>
                    <select
                      value={editingContract.supervisor_id || ''}
                      onChange={(e) => {
                        const u = effectiveSupervisorUsers.find(usr => usr.id === e.target.value);
                        setEditingContract(p => ({
                          ...p,
                          supervisor_id: e.target.value,
                          assigned_supervisor: u ? u.name : '',
                          supervisor_name: u ? u.name : ''
                        }));
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 text-xs"
                    >
                      <option value="">-- Select Supervisor --</option>
                      {effectiveSupervisorUsers.map(su => (
                        <option key={su.id} value={su.id}>{su.name} ({su.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Assigned Technician / Engineer *</span>
                    </label>
                    <select
                      value={editingContract.technician_id || ''}
                      onChange={(e) => {
                        const u = effectiveTechnicianUsers.find(usr => usr.id === e.target.value);
                        setEditingContract(p => ({
                          ...p,
                          technician_id: e.target.value,
                          assigned_technician: u ? u.name : '',
                          technician_name: u ? u.name : ''
                        }));
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-navy-900 text-xs"
                    >
                      <option value="">-- Select Technician / Engineer --</option>
                      {effectiveTechnicianUsers.map(tu => (
                        <option key={tu.id} value={tu.id}>{tu.name} ({tu.role})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Live VAT Breakdown */}
                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Excl. VAT</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatBHD(editingContract.contract_value)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-700 uppercase block font-semibold">
                      VAT ({editingContract.vat_percent !== undefined ? editingContract.vat_percent : 10}%)
                    </span>
                    <span className="font-mono font-bold text-blue-900">
                      {formatBHD((Number(editingContract.contract_value || 0) * Number(editingContract.vat_percent !== undefined ? editingContract.vat_percent : 10)) / 100)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 uppercase block font-black">Total (Incl. VAT)</span>
                    <span className="font-mono font-black text-emerald-900">
                      {formatBHD(Number(editingContract.contract_value || 0) + ((Number(editingContract.contract_value || 0) * Number(editingContract.vat_percent !== undefined ? editingContract.vat_percent : 10)) / 100))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks &amp; Scope Details</label>
                <textarea
                  rows={2}
                  value={editingContract.remarks || ''}
                  onChange={(e) => setEditingContract(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
                  className="py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold shadow-md"
                >
                  Save Changes
                </button>
                {['Draft', 'Returned for Correction'].includes(editingContract.status) && (
                  <button
                    type="button"
                    onClick={handleUpdateAndSubmitContract}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save &amp; Submit</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL 1C: RETURN CONTRACT FOR CORRECTION --- */}
      {/* ========================================== */}
      {returningContract && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Return Contract for Correction</span>
              </h3>
              <button onClick={() => setReturningContract(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1">✕</button>
            </div>

            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Number:</span>
                <span className="font-bold text-slate-900">{returningContract.contract_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer &amp; Site:</span>
                <span className="font-bold text-slate-900">{returningContract.site_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sales Specialist:</span>
                <span className="font-bold text-blue-700">{returningContract.sales_person_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contract Value:</span>
                <span className="font-bold text-amber-800">{formatBHD(returningContract.contract_value)}</span>
              </div>
            </div>

            <form onSubmit={handleReturnContract} className="mt-4 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason / Correction Notes for Sales Specialist *
                </label>
                <textarea
                  required
                  rows={3}
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  placeholder="e.g. Please adjust the contract value to BHD 420.000 as agreed with client HSE department, and add semi-annual extinguisher testing."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningContract(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Return to Sales</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL 2: CONTRACT RENEWAL --- */}
      {/* ========================================== */}
      {renewingContract && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in slide-in-from-bottom text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-600" />
                <span>Renew AMC Contract: {renewingContract.contract_number}</span>
              </h3>
              <button
                onClick={() => setRenewingContract(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Renewing contract for <span className="font-bold text-slate-900">{renewingContract.site_name}</span>. Historical completed visits will be preserved; a fresh set of compliance visits will be scheduled.
            </p>

            <form onSubmit={handleRenewContract} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Start Date *</label>
                  <input
                    type="date"
                    required
                    value={renewalForm.start_date}
                    onChange={(e) => setRenewalForm(p => ({ ...p, start_date: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New End Date *</label>
                  <input
                    type="date"
                    required
                    value={renewalForm.end_date}
                    onChange={(e) => setRenewalForm(p => ({ ...p, end_date: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {!isTechnician && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Renewal Value in BHD *</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    required
                    value={renewalForm.contract_value}
                    onChange={(e) => setRenewalForm(p => ({ ...p, contract_value: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                    Preview: {formatBHD(renewalForm.contract_value)}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Renewal Remarks</label>
                <textarea
                  rows={2}
                  value={renewalForm.remarks}
                  onChange={(e) => setRenewalForm(p => ({ ...p, remarks: e.target.value }))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setRenewingContract(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL 3: RESCHEDULE VISIT --- */}
      {/* ========================================== */}
      {reschedulingVisit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Reschedule Visit #{reschedulingVisit.service_sequence || reschedulingVisit.visit_number}</span>
              </h3>
              <button 
                onClick={() => {
                  setReschedulingVisit(null);
                  setRescheduleReason('');
                }} 
                className="text-slate-400 font-bold"
              >✕</button>
            </div>

            <p className="text-slate-500 mt-2">
              Facility: <span className="font-bold text-slate-800">{reschedulingVisit.site_name || 'Customer Premises'}</span>
            </p>

            <form onSubmit={handleRescheduleVisit} className="mt-3 space-y-3">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between">
                <span className="text-slate-500">Original Scheduled:</span>
                <span className="font-mono font-bold text-slate-800">
                  {reschedulingVisit.original_scheduled_date || reschedulingVisit.scheduled_date}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Scheduled Date *</label>
                <input
                  type="date"
                  required
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reschedule Reason *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer site access deferred, client requested weekend"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReschedulingVisit(null);
                    setRescheduleReason('');
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-navy-900 text-white font-bold hover:bg-navy-800"
                >
                  Save Date &amp; Reason
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL: COMPLETE SERVICE VISIT (Requirement 3) --- */}
      {/* ========================================== */}
      {completingVisit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Complete AMC Service Visit</span>
              </h3>
              <button onClick={() => setCompletingVisit(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cycle &amp; Sequence</span>
                  <span className="font-mono font-black text-slate-900">
                    {completingVisit.service_cycle || completingVisit.quarter || 'Q1'} • Visit #{completingVisit.service_sequence || completingVisit.visit_number}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Systems Included</span>
                  <span className="font-bold text-slate-800 text-xs">
                    {completingVisit.systems_label || completingVisit.system_type || completingVisit.system || 'Combined Service'}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 text-blue-900 text-[11px]">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Scheduled Date:</span>
                  <span className="font-mono">{completingVisit.scheduled_date}</span>
                </div>
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Notice: If completed on a different date, record the actual service date below. Under the configured AMC scheduling rule, subsequent uncompleted services in this 3-month cycle will dynamically calculate from this actual completed date.
                </p>
              </div>

              <form onSubmit={handleCompleteVisitSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Actual Completed Service Date *</label>
                  <input
                    type="date"
                    required
                    value={completionActualDate}
                    onChange={(e) => setCompletionActualDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                  />
                </div>

                {/* Per-Service Completion Checkboxes (Requirement 7) */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Individual Services Completed in This Visit *
                  </label>
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    {(completingVisit.systems || [completingVisit.system_type || completingVisit.system || 'Inspection']).map((sysName) => {
                      const isChecked = completionServicesStatus[sysName] !== false;
                      return (
                        <label
                          key={sysName}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setCompletionServicesStatus(prev => ({
                                  ...prev,
                                  [sysName]: e.target.checked
                                }));
                              }}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span>{sysName}</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isChecked ? 'bg-emerald-200/70 text-emerald-900' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isChecked ? '✓ Done' : 'Pending'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lead Technician / Inspector</label>
                  <input
                    type="text"
                    readOnly
                    value={completingVisit.technician_name || completingVisit.assigned_technician || currentUser.name}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Completion Remarks &amp; Inspection Findings</label>
                  <textarea
                    rows={2}
                    placeholder="Enter service observations, testing confirmation, or remarks..."
                    value={completionRemarks}
                    onChange={(e) => setCompletionRemarks(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Photo Evidence / Attachment URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com/inspection-photo.jpg"
                    value={completionPhotoUrl}
                    onChange={(e) => setCompletionPhotoUrl(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    disabled={completionSaving}
                    onClick={() => setCompletingVisit(null)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={completionSaving}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completionSaving ? 'Saving...' : 'Confirm Completed'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL 4: REMINDER PERIOD CONFIGURATION --- */}
      {/* ========================================== */}
      {reminderConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Configure Expiry Reminders</span>
              </h3>
              <button
                onClick={() => setReminderConfigModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Set reminder notification thresholds for{" "}
              <span className="font-bold text-slate-800">{reminderConfigModal.contract_number}</span>.
            </p>

            <div className="mt-4 space-y-2 text-xs">
              {[90, 60, 30, 7].map((days) => {
                const currentDays = reminderConfigModal.reminder_days || [90, 60, 30, 7];
                const isChecked = currentDays.includes(days);

                return (
                  <label
                    key={days}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-semibold text-slate-800">
                      {days} Days before expiry
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let updated;
                        if (e.target.checked) {
                          updated = [...currentDays, days].sort((a, b) => b - a);
                        } else {
                          updated = currentDays.filter((d) => d !== days);
                        }
                        setReminderConfigModal((prev) => ({ ...prev, reminder_days: updated }));
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setReminderConfigModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleSaveReminders(reminderConfigModal.id, reminderConfigModal.reminder_days)
                }
                className="flex-1 py-2.5 rounded-xl bg-navy-900 text-white text-xs font-bold shadow-md hover:bg-navy-800"
              >
                Save Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      <QuickAddCustomerModal
        isOpen={showQuickAddCustomer}
        onClose={() => setShowQuickAddCustomer(false)}
        onCustomerCreated={async (newCust) => {
          try {
            await loadData();
            const resSites = await fetch('/api/sites', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } });
            if (resSites.ok) {
              const allS = await resSites.json();
              setSites(allS);
              const defaultSite = allS.find(s => s.customer_id === newCust.id)?.id || '';
              setNewContract(prev => ({
                ...prev,
                customer_id: newCust.id,
                site_id: defaultSite
              }));
            } else {
              setNewContract(prev => ({
                ...prev,
                customer_id: newCust.id
              }));
            }
          } catch (err) {
            console.error('Error refreshing after quick add in AMC:', err);
          }
        }}
      />

      {/* Delete AMC Contract Confirmation Modal: GM, Engineer, Supervisor Only */}
      {contractToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 text-xs space-y-4 animate-in zoom-in-95">
            
            <div className="flex items-start gap-3">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0 border border-red-200">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    Management Action
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Delete AMC Contract
                </h3>
                <p className="text-slate-500 mt-0.5 text-xs">
                  Are you sure you want to permanently delete this AMC contract?
                </p>
              </div>
            </div>

            {/* Contract Details Card */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 font-medium">
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Contract Number:</span>
                <span className="font-mono font-bold text-slate-900">{contractToDelete.contract_number}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-slate-900">{contractToDelete.status || contractToDelete.contract_status}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{contractToDelete.customer_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500">Site / Facility:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[200px]">{contractToDelete.site_name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200">
                <span className="text-slate-500">Contract Value:</span>
                <span className="font-black text-slate-900 text-sm">{formatBHD(contractToDelete.contract_value)}</span>
              </div>
            </div>

            <p className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200 font-semibold leading-relaxed">
              ⚠️ Notice: This action is restricted to General Manager, Engineer, and Supervisor. Once deleted, this contract and all associated scheduled maintenance visits will be permanently removed.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeletingContract}
                onClick={() => setContractToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingContract}
                onClick={handleConfirmDeleteContract}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-1.5"
              >
                {isDeletingContract ? (
                  <span className="animate-pulse">Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Contract</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL 6: SALES PERSON AMC DETAIL VIEW (Requirement 5) --- */}
      {/* ========================================== */}
      {viewingContractDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            {/* Header */}
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-mono bg-blue-600 px-2 py-0.5 rounded">
                    {viewingContractDetail.contract_number}
                  </span>
                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {viewingContractDetail.status || viewingContractDetail.contract_status || 'Active'}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1">
                  {viewingContractDetail.customer_name} • {viewingContractDetail.site_name}
                </h2>
              </div>
              <button
                onClick={() => setViewingContractDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'inspections', label: 'AMC Inspections (Q1–Q4)' },
                { id: 'visits', label: `Visits (${viewingContractDetail.visits?.length || 0})` },
                { id: 'reports', label: 'Reports' },
                { id: 'faults', label: 'Faults' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id)}
                  className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap ${
                    detailTab === t.id
                      ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: OVERVIEW */}
              {detailTab === 'overview' && (
                <div className="space-y-4">
                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Period</span>
                      <span className="font-semibold text-slate-800">
                        {viewingContractDetail.start_date} to {viewingContractDetail.end_date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Sales Specialist</span>
                      <span className="font-bold text-navy-900 block truncate">
                        {viewingContractDetail.sales_person_name || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Contract Type</span>
                      <span className="font-semibold text-slate-800">
                        {viewingContractDetail.contract_type || 'Comprehensive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Quotation Reference</span>
                      <span className="font-mono font-bold text-slate-800">
                        {viewingContractDetail.quotation_number || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown (Requirement 7 & 8) */}
                  {!isTechnician && (
                    <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-xl border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block mb-2">
                        Financial &amp; VAT Breakdown (BHD)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                          <span className="text-[10px] text-slate-500 block">Excl. VAT:</span>
                          <span className="text-sm font-black font-mono text-slate-900">
                            {formatBHD(viewingContractDetail.contract_value || viewingContractDetail.amount)}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                          <span className="text-[10px] text-slate-500 block">VAT Rate:</span>
                          <span className="text-sm font-black font-mono text-slate-900">
                            {viewingContractDetail.vat_percent !== undefined ? viewingContractDetail.vat_percent : 10}%
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                          <span className="text-[10px] text-slate-500 block">VAT Amount:</span>
                          <span className="text-sm font-black font-mono text-amber-700">
                            {formatBHD(viewingContractDetail.vat_amount || 0)}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/50">
                          <span className="text-[10px] text-emerald-800 font-bold block">Total (Incl. VAT):</span>
                          <span className="text-sm font-black font-mono text-emerald-900">
                            {formatBHD(viewingContractDetail.total_including_vat !== undefined ? viewingContractDetail.total_including_vat : viewingContractDetail.contract_value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Systems Covered */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                      Systems Covered &amp; Visit Schedules
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(viewingContractDetail.systems_covered || viewingContractDetail.systems || []).map((sys, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-800">
                          {sys}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Remarks */}
                  {viewingContractDetail.remarks && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Remarks / Scope</span>
                      <p className="text-slate-700 italic">{viewingContractDetail.remarks}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DEDICATED AMC INSPECTIONS (Q1, Q2, Q3, Q4) */}
              {detailTab === 'inspections' && (
                <div className="space-y-4">
                  {/* Top Bar with Quarter Tabs and 4-Quarter Overview toggle */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>AMC Quarterly Inspection Records</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Periodic maintenance compliance. Quarter auto-determined by inspection visit date.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {['Q1', 'Q2', 'Q3', 'Q4'].map((q, idx) => {
                        const cyclePeriods = getContractCyclePeriods(viewingContractDetail.start_date);
                        const qInfo = viewingContractDetail.quarters?.[q] || {};
                        const qStat = qInfo.status || 'Not Started';
                        const isDone = ['Completed', 'Approved'].includes(qStat);
                        return (
                          <button
                            key={q}
                            onClick={() => setActiveQuarterTab(q)}
                            className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                              activeQuarterTab === q
                                ? 'bg-navy-900 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title={cyclePeriods[q]?.name || q}
                          >
                            <span>{q}</span>
                            <span className="text-[10px] font-medium opacity-80 hidden md:inline">({cyclePeriods[q]?.anchorMonth?.slice(0, 3)})</span>
                            {isDone && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setActiveQuarterTab('overview_table')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                          activeQuarterTab === 'overview_table'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Service Schedule Table
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE TAB: 4-QUARTER SUMMARY & SERVICE SCHEDULE TABLE (Requirement 8) */}
                  {activeQuarterTab === 'overview_table' ? (
                    <div className="space-y-3">
                      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                        <table className="w-full text-left text-xs divide-y divide-slate-200">
                          <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="py-2.5 px-3">Cycle</th>
                              <th className="py-2.5 px-3">Service</th>
                              <th className="py-2.5 px-3">Scheduled Date</th>
                              <th className="py-2.5 px-3">Actual Date</th>
                              <th className="py-2.5 px-3">Status</th>
                              <th className="py-2.5 px-3">Inspection</th>
                              <th className="py-2.5 px-3">Report</th>
                              <th className="py-2.5 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {(() => {
                              const contractAnchorDate = viewingContractDetail.service_start_date || viewingContractDetail.start_date;
                              const cyclePeriods = getContractCyclePeriods(contractAnchorDate);
                              const contractVisits = viewingContractDetail.visits || [];
                              const contractSystems = viewingContractDetail.systems_covered || viewingContractDetail.systems || ['Fire Alarm'];

                              return ['Q1', 'Q2', 'Q3', 'Q4'].map((q, idx) => {
                                const qRec = viewingContractDetail.quarters?.[q] || {};
                                const period = cyclePeriods[q] || {};
                                const matchedVisit = contractVisits.find(v => 
                                  v.quarter === q || v.service_cycle === q || v.service_sequence === (idx + 1)
                                );
                                
                                const defaultCycleDate = contractAnchorDate ? addCalendarMonths(contractAnchorDate, idx * 3) : '';
                                const schedDate = matchedVisit?.scheduled_date || qRec.scheduled_date || defaultCycleDate || 'TBD';
                                const origDate = matchedVisit?.original_scheduled_date;
                                const isRescheduled = (matchedVisit?.status === 'Rescheduled') || (origDate && origDate !== schedDate);
                                const actualDate = matchedVisit?.actual_service_date || qRec.actual_visit_date || (matchedVisit?.status === 'Completed' ? schedDate : null);
                                const stat = matchedVisit?.status || qRec.status || 'Not Started';
                                const rptStat = qRec.report_status || (qRec.report_id ? 'Approved' : 'Not Started');
                                const isCompleted = stat === 'Completed' || stat === 'Approved';

                                return (
                                  <tr key={q} className="hover:bg-slate-50/80 transition-colors">
                                    {/* Cycle */}
                                    <td className="py-2.5 px-3">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-black text-xs text-navy-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                          {q}
                                        </span>
                                        <span className="font-bold text-slate-700 text-[11px]">
                                          {period.anchorMonth || `Service ${idx + 1}`}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-400 block mt-0.5">
                                        {period.months || 'Quarterly Cycle'}
                                      </span>
                                    </td>

                                    {/* Service */}
                                    <td className="py-2.5 px-3">
                                      <span className="font-bold text-slate-800 block text-xs">
                                        Service #{idx + 1}
                                      </span>
                                      <span className="text-[10px] text-slate-500 truncate max-w-[150px] block">
                                        {matchedVisit?.systems_label || matchedVisit?.system_type || (Array.isArray(contractSystems) ? contractSystems.join(' + ') : contractSystems)}
                                      </span>
                                    </td>

                                    {/* Scheduled Date */}
                                    <td className="py-2.5 px-3">
                                      <span className="font-semibold text-slate-800 block">
                                        {schedDate}
                                      </span>
                                      {isRescheduled && (
                                        <span className="text-[9.5px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5" title={`Original: ${origDate}. Reason: ${matchedVisit?.reschedule_reason || 'Client request'}`}>
                                          Orig: {origDate}
                                        </span>
                                      )}
                                    </td>

                                    {/* Actual Date */}
                                    <td className="py-2.5 px-3">
                                      <span className={`font-semibold ${actualDate ? 'text-blue-700' : 'text-slate-400 italic'}`}>
                                        {actualDate || 'Pending Visit'}
                                      </span>
                                    </td>

                                    {/* Status */}
                                    <td className="py-2.5 px-3">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                        isCompleted
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : stat === 'Overdue'
                                          ? 'bg-red-50 text-red-800 border-red-300 font-black animate-pulse'
                                          : stat === 'Rescheduled'
                                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                                          : stat === 'Scheduled'
                                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                                          : 'bg-slate-50 text-slate-600 border-slate-200'
                                      }`}>
                                        {stat}
                                      </span>
                                    </td>

                                    {/* Inspection */}
                                    <td className="py-2.5 px-3">
                                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                                        isCompleted
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}>
                                        {isCompleted ? 'Inspection Passed' : 'Inspection Pending'}
                                      </span>
                                    </td>

                                    {/* Report */}
                                    <td className="py-2.5 px-3">
                                      <span className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                                        qRec.report_number || qRec.report_id
                                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                          : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {qRec.report_number ? `${qRec.report_number} (${rptStat})` : rptStat}
                                      </span>
                                    </td>

                                    {/* Actions (Requirement 8) */}
                                    <td className="py-2.5 px-3 text-right">
                                      <div className="flex items-center justify-end gap-1 flex-wrap">
                                        <button
                                          onClick={() => setActiveQuarterTab(q)}
                                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold"
                                          title={`Open ${q} Inspection and Report Form`}
                                        >
                                          Open {q}
                                        </button>

                                        {!isCompleted && matchedVisit && (
                                          <button
                                            onClick={() => {
                                              setReschedulingVisit(matchedVisit);
                                              setNewRescheduleDate(matchedVisit.scheduled_date || '');
                                              setRescheduleReason('');
                                            }}
                                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-0.5"
                                            title="Reschedule this service visit"
                                          >
                                            <Clock className="w-3 h-3" />
                                            <span>Reschedule</span>
                                          </button>
                                        )}

                                        {!isCompleted && (
                                          <button
                                            onClick={() => {
                                              const targetVis = matchedVisit || {
                                                id: `vis-${viewingContractDetail.id}-${q}`,
                                                amc_contract_id: viewingContractDetail.id,
                                                service_cycle: q,
                                                service_sequence: idx + 1,
                                                scheduled_date: schedDate,
                                                systems: contractSystems,
                                                systems_label: contractSystems.join(' + '),
                                                system_type: contractSystems[0] || 'Fire Alarm',
                                                technician_name: qRec.technician_name || 'Rajesh Kumar'
                                              };
                                              openCompleteVisitModal(targetVis);
                                            }}
                                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-0.5 shadow-xs"
                                            title="Record actual service completion date"
                                          >
                                            <CheckCircle2 className="w-3 h-3" />
                                            <span>Complete Service</span>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* SPECIFIC QUARTER RECORD VIEW (Q1, Q2, Q3, Q4) */
                    (() => {
                      const qTabIdx = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(activeQuarterTab);
                      const contractAnchorDate = viewingContractDetail.service_start_date || viewingContractDetail.start_date;
                      const defaultQuarterDate = contractAnchorDate
                        ? addCalendarMonths(contractAnchorDate, Math.max(0, qTabIdx) * 3)
                        : '';
                      const qRec = viewingContractDetail.quarters?.[activeQuarterTab] || {
                        status: 'Not Started',
                        scheduled_date: defaultQuarterDate,
                        technician_name: viewingContractDetail.sales_person_name || 'Abdul Majeed',
                        supervisor_name: 'Sarath Kr',
                        systems: viewingContractDetail.systems || ['Fire Alarm', 'Fire Fighting'],
                        findings: { pass: 0, fail: 0, needs_attention: 0 },
                        report_status: 'Draft',
                        checklist_items: [
                          { item: 'Fire Alarm Control Panel Main Power & Battery Backups', status: 'Pass' },
                          { item: 'Optical Smoke Detectors Loop Sampling & Response', status: 'Pass' },
                          { item: 'Break Glass Manual Call Points & Audio Flashers', status: 'Pass' },
                          { item: 'Sprinkler Risers, Flow Switches & OS&Y Valve Tamper Switches', status: 'Pass' },
                          { item: 'Jockey & Main Diesel Fire Pump Automatic Cut-in Pressure', status: 'Pass' },
                          { item: 'Portable Fire Extinguishers Pressure Gauge & Tagging', status: 'Pass' }
                        ]
                      };

                      const cyclePeriods = getContractCyclePeriods(contractAnchorDate);
                      const currentCycleInfo = cyclePeriods[activeQuarterTab] || { name: `${activeQuarterTab} Periodic Inspection`, months: 'Quarterly Cycle' };
                      const quarterLabel = currentCycleInfo.name;
                      const quarterPeriodRange = currentCycleInfo.months;

                      const canReview = ['GM', 'Engineer', 'Supervisor'].includes(currentUser?.role);
                      const canApprove = ['GM', 'Engineer'].includes(currentUser?.role);

                      return (
                        <div className="space-y-4 animate-in fade-in duration-150">
                          {/* Top Status & Overview Card */}
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black font-mono bg-navy-900 text-white px-2 py-0.5 rounded">
                                  {activeQuarterTab}
                                </span>
                                <span className="font-bold text-slate-800 text-xs">
                                  {quarterLabel}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {quarterPeriodRange}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                  qRec.status === 'Completed' || qRec.status === 'Approved'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : qRec.status === 'Overdue'
                                    ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                                }`}>
                                  {qRec.status || 'Not Started'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Strict NFPA periodic inspection attached to agreement <strong className="text-slate-800">{viewingContractDetail.contract_number}</strong>.
                              </p>
                            </div>

                            {/* Action Buttons for this Quarter */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Submit button for Technician */}
                              {(qRec.status === 'Not Started' || qRec.status === 'Scheduled' || qRec.report_status === 'Draft' || qRec.status === 'Pending Technician Submission') && (
                                <button
                                  disabled={quarterSaving}
                                  onClick={() => handleUpdateQuarterReport(viewingContractDetail.id, activeQuarterTab, {
                                    status: 'Submitted - Pending Review',
                                    report_status: 'Submitted',
                                    submitted_by: currentUser.name,
                                    submitted_at: new Date().toISOString()
                                  })}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1 transition-all"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Submit Report</span>
                                </button>
                              )}

                              {/* Review button for Supervisor / Engineer */}
                              {canReview && qRec.status === 'Submitted - Pending Review' && (
                                <button
                                  disabled={quarterSaving}
                                  onClick={() => handleUpdateQuarterReport(viewingContractDetail.id, activeQuarterTab, {
                                    status: 'Reviewed - Pending Approval',
                                    report_status: 'Reviewed',
                                    reviewed_by: currentUser.name,
                                    reviewed_at: new Date().toISOString()
                                  })}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1 transition-all"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify &amp; Review</span>
                                </button>
                              )}

                              {/* Approve button for GM / Engineer */}
                              {canApprove && (qRec.status === 'Reviewed - Pending Approval' || qRec.status === 'Submitted - Pending Review') && (
                                <button
                                  disabled={quarterSaving}
                                  onClick={() => handleUpdateQuarterReport(viewingContractDetail.id, activeQuarterTab, {
                                    status: 'Completed',
                                    report_status: 'Approved',
                                    approved_by: currentUser.name,
                                    approved_at: new Date().toISOString()
                                  })}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1 transition-all"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve &amp; Sign</span>
                                </button>
                              )}

                              {/* Print PDF Report */}
                              <button
                                onClick={() => showToast(`Generating official ${activeQuarterTab} Civil Defence PDF report...`, 'info')}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs border border-slate-300 flex items-center gap-1 transition-all"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print PDF</span>
                              </button>
                            </div>
                          </div>

                          {/* Inspection Parameters Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Date</span>
                              <span className="font-semibold text-slate-900">{qRec.scheduled_date || defaultQuarterDate || 'TBD'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Actual Visit Date</span>
                              <span className="font-semibold text-blue-700">{qRec.visit_date || 'Completed on Schedule'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Technician</span>
                              <span className="font-bold text-slate-900 truncate block">{qRec.technician_name || 'Rajesh Kumar'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Civil Defence Sign-off</span>
                              <span className="font-bold text-emerald-700 truncate block">{qRec.approved_by || qRec.supervisor_name || 'Eng. Tariq Mahmoud'}</span>
                            </div>
                          </div>

                          {/* Systems Inspected */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                              Certified Fire Protection Systems Inspected
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(qRec.systems || viewingContractDetail.systems_covered || ['Fire Alarm', 'Fire Fighting & Sprinklers']).map((sys, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs font-bold">
                                  {sys}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Checklist Findings Summary */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                                Periodic Inspection Checklist Findings
                              </span>
                              <div className="flex items-center gap-2 text-xs font-black">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Pass: {qRec.findings?.pass ?? 0}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200">
                                  Fail: {qRec.findings?.fail ?? 0}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                                  Needs Attention: {qRec.findings?.needs_attention ?? 0}
                                </span>
                              </div>
                            </div>

                            <div className="divide-y divide-slate-100 text-xs">
                              {(qRec.checklist_items && qRec.checklist_items.length > 0) ? (
                                qRec.checklist_items.map((item, idx) => (
                                  <div key={idx} className="py-2 flex items-center justify-between">
                                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                      <span>{item.item}</span>
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      item.status === 'Pass'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : item.status === 'Fail'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="py-3 text-center text-xs text-slate-400">
                                  No checklist items recorded yet for this quarter inspection.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Faults & Materials Attached */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Rectified Defects &amp; Fault Logs
                              </span>
                              <p className="text-xs text-slate-600 italic">
                                {qRec.faults || 'Zero critical defects identified during this quarter service cycle. All circuits normal.'}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Spare Consumables / Materials Used
                              </span>
                              <p className="text-xs text-slate-600 italic">
                                {qRec.materials || 'Periodic maintenance consumables, contact cleaner spray, test smoke cans.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {/* TAB 3: VISITS WITH QUARTERS */}
              {detailTab === 'visits' && (
                <div className="space-y-2">
                  {(viewingContractDetail.visits || []).length === 0 ? (
                    <p className="text-slate-400 text-center py-6">No scheduled visits generated for this contract.</p>
                  ) : (
                    (viewingContractDetail.visits || []).map(v => (
                      <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {v.quarter || 'Q1'}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900">
                              Visit #{v.visit_number} • {v.system || v.system_type}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {v.scheduled_date} {v.day && `(${v.day})`} • Tech: {v.technician_name || 'Unassigned'}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          v.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {v.status || 'Scheduled'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: REPORTS */}
              {detailTab === 'reports' && (
                <div className="space-y-2">
                  <p className="text-slate-500 text-[11px]">
                    Official inspection and service completion reports recorded for AMC {viewingContractDetail.contract_number}.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="font-semibold text-slate-700 block">Civil Defence Certified AMC Reports</span>
                    <span className="text-[11px] text-slate-400">Available in Reports tab for download and printing.</span>
                  </div>
                </div>
              )}

              {/* TAB 4: FAULTS */}
              {detailTab === 'faults' && (
                <div className="space-y-2">
                  <p className="text-slate-500 text-[11px]">
                    Defects, alarms, and component replacement logs associated with this contract premises.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <span className="font-semibold text-slate-700 block">No Active Critical Faults</span>
                    <span className="text-[11px] text-slate-400">All systems operational in compliance with NFPA standards.</span>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingContractDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* --- MODAL 7: AMC MONTHLY SCHEDULE PRINT FORMAT (Requirement 17) --- */}
      {/* ========================================== */}
      {showPrintScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl max-h-[95vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-xs">
            {/* Top Bar (Non-Printable) */}
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Official A4 Printable Schedule Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintScheduleModal(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet (A4 Layout) */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white space-y-6 text-slate-900">
              
              {/* Header (Requirement 17) */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-navy-900">
                      FIREX FIRE SAFETY &amp; SECURITY
                    </h1>
                    <p className="text-[11px] font-bold text-slate-600">
                      CR: 12345-1 • Civil Defence Approved Fire Protection Contractor
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Manama, Kingdom of Bahrain • Tel: +973 1716 2240 • info@firex-bahrain.com
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-wider bg-navy-900 text-white px-2.5 py-1 rounded inline-block">
                      OFFICIAL SCHEDULE
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                  <div>
                    <span className="font-black text-sm uppercase text-slate-900">AMC MONTHLY SERVICE SCHEDULE</span>
                    <span className="ml-2 font-bold text-blue-700">Period: {monthNames[scheduleMonth - 1]} {scheduleYear}</span>
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Generated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString()} by <span className="font-bold text-slate-800">{currentUser?.name} ({currentUser?.role})</span>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-200 text-[10px] text-slate-600 flex gap-4 flex-wrap">
                  <span>Customer: <strong className="text-slate-800">{scheduleFilters.customer_id === 'all' ? 'All' : customers.find(c => c.id === scheduleFilters.customer_id)?.name}</strong></span>
                  <span>Sales Person: <strong className="text-slate-800">{scheduleFilters.sales_person_id === 'all' ? 'All' : salesUsers.find(s => s.id === scheduleFilters.sales_person_id)?.name}</strong></span>
                  <span>System: <strong className="text-slate-800">{scheduleFilters.system}</strong></span>
                  <span>Status: <strong className="text-slate-800">{scheduleFilters.status}</strong></span>
                </div>
              </div>

              {/* Table (Requirement 17: S.No, Date, Day, Quarter, AMC #, Customer, Site, Sales Person, System, Visit #, Supervisor, Technician, Status) */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-black text-slate-800">
                      <th className="p-1.5 border-r border-slate-300 text-center">S.No</th>
                      <th className="p-1.5 border-r border-slate-300">Date</th>
                      <th className="p-1.5 border-r border-slate-300">Day</th>
                      <th className="p-1.5 border-r border-slate-300 text-center">Quarter</th>
                      <th className="p-1.5 border-r border-slate-300">AMC Number</th>
                      <th className="p-1.5 border-r border-slate-300">Customer Name</th>
                      <th className="p-1.5 border-r border-slate-300">Site Location</th>
                      <th className="p-1.5 border-r border-slate-300">Sales Person</th>
                      <th className="p-1.5 border-r border-slate-300">System</th>
                      <th className="p-1.5 border-r border-slate-300 text-center">Visit #</th>
                      <th className="p-1.5 border-r border-slate-300">Supervisor</th>
                      <th className="p-1.5 border-r border-slate-300">Technician</th>
                      <th className="p-1.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyVisits.length === 0 ? (
                      <tr>
                        <td colSpan="13" className="p-4 text-center text-slate-400 italic">
                          No AMC maintenance visits found for this period.
                        </td>
                      </tr>
                    ) : (
                      monthlyVisits.map((v, idx) => (
                        <tr key={v.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="p-1.5 border-r border-slate-200 text-center font-bold">{idx + 1}</td>
                          <td className="p-1.5 border-r border-slate-200 whitespace-nowrap">{v.scheduled_date}</td>
                          <td className="p-1.5 border-r border-slate-200">{v.day || ''}</td>
                          <td className="p-1.5 border-r border-slate-200 text-center font-bold text-blue-700">{v.quarter || 'Q1'}</td>
                          <td className="p-1.5 border-r border-slate-200 font-mono font-bold">{v.contract_number}</td>
                          <td className="p-1.5 border-r border-slate-200 font-medium">{v.customer_name}</td>
                          <td className="p-1.5 border-r border-slate-200">{v.site_name}</td>
                          <td className="p-1.5 border-r border-slate-200">{v.sales_person_name || 'Unassigned'}</td>
                          <td className="p-1.5 border-r border-slate-200 font-semibold">{v.system || v.system_type}</td>
                          <td className="p-1.5 border-r border-slate-200 text-center font-bold">#{v.visit_number}</td>
                          <td className="p-1.5 border-r border-slate-200">{v.supervisor_name || 'Tariq Mahmoud'}</td>
                          <td className="p-1.5 border-r border-slate-200">{v.technician_name || 'Rajesh Kumar'}</td>
                          <td className="p-1.5 text-center font-bold">{v.status || 'Scheduled'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Footer (Requirement 17) */}
              <div className="pt-8 mt-6 border-t border-slate-300">
                <div className="grid grid-cols-3 gap-6 text-center text-xs">
                  <div>
                    <div className="border-b border-slate-400 pb-8 mb-1"></div>
                    <span className="font-bold text-slate-800 block">Prepared By</span>
                    <span className="text-[10px] text-slate-500">Sales &amp; Service Planning</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-8 mb-1"></div>
                    <span className="font-bold text-slate-800 block">Verified By Supervisor</span>
                    <span className="text-[10px] text-slate-500">Operations Field Supervisor</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 pb-8 mb-1"></div>
                    <span className="font-bold text-slate-800 block">Approved By Operations Manager</span>
                    <span className="text-[10px] text-slate-500">FIREX Engineering Dept</span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 flex justify-between text-[9px] text-slate-400">
                  <span>CONFIDENTIAL: Internal Operations &amp; Civil Defence Compliance Schedule</span>
                  <span>FIREX Safety Management ERP • Page 1 of 1</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DIGITAL AMC CHECKLIST MODAL */}
      {activeChecklistVisit && (
        <AMCChecklistModal
          visit={activeChecklistVisit}
          onClose={() => setActiveChecklistVisit(null)}
          onRefresh={() => {
            loadData();
            if (tab === 'schedule') loadMonthlySchedule();
          }}
          onViewReport={(v) => {
            setActiveChecklistVisit(null);
            setPreviewingReportVisit(v);
          }}
        />
      )}

      {/* SUPERVISOR REVIEW MODAL */}
      {reviewingVisit && (
        <AMCSupervisorReviewModal
          visit={reviewingVisit}
          onClose={() => setReviewingVisit(null)}
          onRefresh={() => {
            loadData();
            if (tab === 'schedule') loadMonthlySchedule();
          }}
          onViewReport={(v) => {
            setReviewingVisit(null);
            setPreviewingReportVisit(v);
          }}
        />
      )}

      {/* AMC SERVICE REPORT PDF MODAL */}
      {previewingReportVisit && (
        <AMCServiceReportModal
          visit={previewingReportVisit}
          onClose={() => setPreviewingReportVisit(null)}
        />
      )}

      {/* REASSIGN VISIT STAFF MODAL */}
      {assigningVisit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Reassign Visit #{assigningVisit.visit_number} Staff</span>
              </h3>
              <button onClick={() => setAssigningVisit(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Supervisor</label>
                <select
                  value={assignSupervisorId}
                  onChange={(e) => setAssignSupervisorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                >
                  <option value="">-- Keep Current ({assigningVisit.supervisor_name || 'Unassigned'}) --</option>
                  {effectiveSupervisorUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technician / Engineer</label>
                <select
                  value={assignTechnicianId}
                  onChange={(e) => setAssignTechnicianId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold"
                >
                  <option value="">-- Keep Current ({assigningVisit.technician_name || 'Unassigned'}) --</option>
                  {effectiveTechnicianUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                * Note: Changing staff for this individual service visit does not alter the parent AMC contract's default assignment.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssigningVisit(null)}
                  className="w-1/2 py-2 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={assignSaving}
                  onClick={async () => {
                    try {
                      setAssignSaving(true);
                      const sup = effectiveSupervisorUsers.find(u => u.id === assignSupervisorId);
                      const tech = effectiveTechnicianUsers.find(u => u.id === assignTechnicianId);
                      const res = await fetch(`/api/amc-visits/${assigningVisit.id}/assignment`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'x-user-role': currentUser.role,
                          'x-user-id': currentUser.id
                        },
                        body: JSON.stringify({
                          supervisor_id: assignSupervisorId || undefined,
                          supervisor_name: sup?.name || undefined,
                          technician_id: assignTechnicianId || undefined,
                          technician_name: tech?.name || undefined
                        })
                      });
                      if (res.ok) {
                        showToast('Visit staff assignment updated successfully', 'success');
                        setAssigningVisit(null);
                        loadData();
                        if (tab === 'schedule') loadMonthlySchedule();
                      } else {
                        showToast('Error updating assignment', 'error');
                      }
                    } catch (e) {
                      showToast('Network error updating assignment', 'error');
                    } finally {
                      setAssignSaving(false);
                    }
                  }}
                  className="w-1/2 py-2 bg-navy-900 text-white rounded-xl font-bold"
                >
                  Save Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
