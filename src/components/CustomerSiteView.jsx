import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import { 
  Building2, MapPin, Phone, Mail, User, Shield, 
  FileCheck, Wrench, AlertTriangle, FileText, ChevronRight, Plus, Search,
  CheckCircle2, Clock, Calendar, RefreshCw, Edit, Hash, Globe, Layers, ArrowLeft, Trash2
} from 'lucide-react';
import QuickAddCustomerModal from './QuickAddCustomerModal';
import CreateAMCReportModal from './CreateAMCReportModal';
import AMCServiceReportModal from './AMCServiceReportModal';
import AMCChecklistModal from './AMCChecklistModal';

export default function CustomerSiteView() {
  const { currentUser, showToast, setActiveTab } = useApp();
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // View state: 'customers' | 'sites'
  const [viewTab, setViewTab] = useState('customers');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Active' | 'Inactive'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [customerDetailTab, setCustomerDetailTab] = useState('overview'); // 'overview' | 'sites' | 'amc' | 'jobs' | 'faults' | 'reports' | 'quotations' | 'history'

  // AMC Service Reports Modals & State
  const [showCreateAmcReportModal, setShowCreateAmcReportModal] = useState(false);
  const [selectedAmcForReport, setSelectedAmcForReport] = useState(null);
  const [selectedQuarterForReport, setSelectedQuarterForReport] = useState('Q1');
  const [previewingReportVisit, setPreviewingReportVisit] = useState(null);
  const [activeChecklistVisit, setActiveChecklistVisit] = useState(null);
  
  // Site Modal
  const [showAddSiteModal, setShowAddSiteModal] = useState(false);
  const [selectedCustomerIdForSite, setSelectedCustomerIdForSite] = useState('');
  const [newSiteData, setNewSiteData] = useState({
    site_name: '',
    building_type: 'Commercial',
    site_address: '',
    contact_person: '',
    contact_number: '',
    email: '',
    site_location: '',
    equipment_info: '',
    notes: ''
  });

  const isTechnician = currentUser?.role === 'Technician';
  const isSales = currentUser?.role === 'Sales';
  const isManagement = ['GM', 'Engineer', 'Supervisor'].includes(currentUser?.role);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resCust, resSites] = await Promise.all([
        fetch('/api/customers', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } }),
        fetch('/api/sites', { headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id } })
      ]);
      if (resCust.ok) setCustomers(await resCust.json());
      if (resSites.ok) setSites(await resSites.json());
    } catch (e) {
      console.warn('Failed loading customer data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isTechnician) {
      loadData();
    }
  }, [currentUser]);

  // Load customer full profile and linked entities
  const loadCustomerDetails = async (customerId) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/details`, {
        headers: { 'x-user-role': currentUser.role, 'x-user-id': currentUser.id }
      });
      if (res.ok) {
        const details = await res.json();
        setSelectedCustomerDetails(details);
        setCustomerDetailTab('overview');
      } else {
        showToast('Failed to load customer details', 'error');
      }
    } catch {
      showToast('Network error loading customer details', 'error');
    }
  };

  // Handle Edit Customer Save
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;

    try {
      const res = await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(editingCustomer)
      });
      if (res.ok) {
        showToast('Customer record updated successfully', 'success');
        setEditingCustomer(null);
        loadData();
        if (selectedCustomerDetails?.customer?.id === editingCustomer.id) {
          loadCustomerDetails(editingCustomer.id);
        }
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to update customer', 'error');
      }
    } catch {
      showToast('Network error updating customer', 'error');
    }
  };

  // Handle Delete Customer (Restricted to GM, Engineer, Supervisor)
  const handleDeleteCustomer = async (customer) => {
    if (!customer?.id) return;
    if (!isManagement) {
      showToast('Access Denied: Only GM, Engineer, and Supervisor can delete customers.', 'error');
      return;
    }

    const confirm1 = window.confirm(`Are you sure you want to delete customer "${customer.name}"?`);
    if (!confirm1) return;

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        }
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || 'Customer deleted successfully', 'success');
        if (selectedCustomerDetails?.customer?.id === customer.id) {
          setSelectedCustomerDetails(null);
        }
        if (editingCustomer?.id === customer.id) {
          setEditingCustomer(null);
        }
        loadData();
      } else if (res.status === 400 && data.requires_force) {
        // Linked records exist, ask for confirmation to cascade delete
        const confirmForce = window.confirm(
          `${data.message}\n\nWarning: This will also remove associated sites, AMC contracts, and jobs for this customer.\n\nDo you want to proceed with permanent deletion?`
        );
        if (confirmForce) {
          const forceRes = await fetch(`/api/customers/${customer.id}?force=true`, {
            method: 'DELETE',
            headers: {
              'x-user-role': currentUser.role,
              'x-user-id': currentUser.id
            }
          });
          const forceData = await forceRes.json();
          if (forceRes.ok) {
            showToast(forceData.message || 'Customer and linked records deleted successfully', 'success');
            if (selectedCustomerDetails?.customer?.id === customer.id) {
              setSelectedCustomerDetails(null);
            }
            if (editingCustomer?.id === customer.id) {
              setEditingCustomer(null);
            }
            loadData();
          } else {
            showToast(forceData.message || 'Failed to delete customer', 'error');
          }
        }
      } else {
        showToast(data.message || 'Failed to delete customer', 'error');
      }
    } catch {
      showToast('Network error deleting customer', 'error');
    }
  };

  // Handle Add Site for Customer
  const handleCreateSite = async (e) => {
    e.preventDefault();
    if (!newSiteData.site_name || !selectedCustomerIdForSite) {
      showToast('Site name and Customer are required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify({
          ...newSiteData,
          customer_id: selectedCustomerIdForSite
        })
      });
      if (res.ok) {
        showToast(`Site "${newSiteData.site_name}" added successfully!`, 'success');
        setShowAddSiteModal(false);
        setNewSiteData({
          site_name: '',
          building_type: 'Commercial',
          site_address: '',
          contact_person: '',
          contact_number: '',
          email: '',
          site_location: '',
          equipment_info: '',
          notes: ''
        });
        loadData();
        if (selectedCustomerDetails?.customer?.id === selectedCustomerIdForSite) {
          loadCustomerDetails(selectedCustomerIdForSite);
        }
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to add site', 'error');
      }
    } catch {
      showToast('Network error adding site', 'error');
    }
  };

  // Open Add Site Modal for a specific customer
  const openAddSiteModalForCustomer = (cust) => {
    setSelectedCustomerIdForSite(cust.id);
    setNewSiteData(p => ({
      ...p,
      site_address: cust.formatted_address || cust.address || '',
      contact_person: cust.contact_person || '',
      contact_number: cust.contact_mobile || cust.phone || '',
      email: cust.email || ''
    }));
    setShowAddSiteModal(true);
  };

  if (isTechnician) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-3 my-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Technicians do not have access to full customer management. Customer and premises details are available inside your assigned Jobs and AMC visits.
        </p>
      </div>
    );
  }

  // Filtered customers
  const filteredCustomers = customers.filter(c => {
    if (statusFilter !== 'all' && (c.status || 'Active').toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.customer_code?.toLowerCase().includes(q) ||
        c.cr_no?.toLowerCase().includes(q) ||
        c.vat_no?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.contact_person?.toLowerCase().includes(q) ||
        c.area?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = customers.filter(c => (c.status || 'Active') === 'Active').length;
  const inactiveCount = customers.filter(c => c.status === 'Inactive').length;

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  CUSTOMERS
                </h1>
                <p className="text-[11px] text-slate-500">
                  Manage accounts, CR &amp; VAT registrations, multi-site premises, and contract records.
                </p>
              </div>
            </div>
          </div>

          {/* Prominent + ADD NEW CUSTOMER button */}
          <button
            onClick={() => setShowAddCustomerModal(true)}
            className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-navy-950/20 transition-all transform active:scale-98"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ADD NEW CUSTOMER</span>
          </button>
        </div>

        {/* View Switcher: Customers vs Sites Directory */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs">
          <button
            onClick={() => setViewTab('customers')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              viewTab === 'customers'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Customers ({customers.length})</span>
          </button>
          <button
            onClick={() => setViewTab('sites')}
            className={`flex-1 py-2 font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              viewTab === 'sites'
                ? 'bg-white text-navy-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Sites &amp; Facilities ({sites.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* --- TAB 1: CUSTOMERS LIST --- */}
      {/* ============================================================== */}
      {viewTab === 'customers' && (
        <div className="space-y-3">
          
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by customer name, code, CR No., VAT No., phone, contact person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `All Customers (${customers.length})` },
                { id: 'Active', label: `Active (${activeCount})`, color: 'text-emerald-700 bg-emerald-50' },
                { id: 'Inactive', label: `Inactive (${inactiveCount})`, color: 'text-slate-700 bg-slate-100' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === f.id
                      ? 'bg-navy-900 text-white'
                      : f.color || 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Cards List */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200 space-y-3">
              <p>No customers found matching search criteria.</p>
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Customer</span>
              </button>
            </div>
          ) : (
            filteredCustomers.map((c) => {
              const isActive = (c.status || 'Active') === 'Active';

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {c.customer_code || 'CUST'}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {c.status || 'Active'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {c.sites_count || 0} Sites
                        </span>
                        {(c.active_amc_count || 0) > 0 && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                            {c.active_amc_count} Active AMC
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => loadCustomerDetails(c.id)}
                        className="text-sm font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {c.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCustomer(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Customer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {isManagement && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomer(c);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CR & VAT Badges */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">CR No.</span>
                      <span className="font-mono font-bold text-slate-800 truncate block">
                        {c.cr_no || 'Not specified'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">VAT No.</span>
                      <span className="font-mono font-bold text-slate-800 truncate block">
                        {c.vat_no || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Contact & Address Details */}
                  <div className="pt-1 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{c.contact_person || 'Unassigned'}</span>
                      {c.contact_mobile && (
                        <span className="text-slate-400">({c.contact_mobile})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{c.phone || 'No phone'}</span>
                      {c.email && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-500 truncate">{c.email}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-start gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 leading-snug">
                        {c.formatted_address || c.address || 'Bahrain'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openAddSiteModalForCustomer(c)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>+ Add Site</span>
                    </button>

                    <button
                      onClick={() => loadCustomerDetails(c.id)}
                      className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <span>View Profile &amp; Records</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* --- TAB 2: SITES DIRECTORY --- */}
      {/* ============================================================== */}
      {viewTab === 'sites' && (
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Total Registered Facilities: {sites.length}</span>
            <button
              onClick={() => {
                if (customers.length > 0) {
                  openAddSiteModalForCustomer(customers[0]);
                } else {
                  showToast('Please create a customer first', 'info');
                }
              }}
              className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add New Site</span>
            </button>
          </div>

          {sites.map(site => {
            const cust = customers.find(c => c.id === site.customer_id);

            return (
              <div
                key={site.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {site.building_type || 'Commercial'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {site.site_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Customer: <strong className="text-slate-700">{cust?.name || 'Client Facility'}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{site.site_address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{site.contact_person} ({site.contact_number})</span>
                  </div>
                </div>

                {site.equipment_info && (
                  <div className="bg-slate-50 p-2 rounded-xl text-[11px] text-slate-700 border border-slate-100">
                    <strong className="text-slate-900 block mb-0.5">Installed Fire Safety Systems:</strong>
                    <span>{site.equipment_info}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* --- MODAL 1: ADD NEW CUSTOMER --- */}
      {/* ============================================================== */}
      <QuickAddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onCustomerCreated={(newCust) => {
          loadData();
          loadCustomerDetails(newCust.id);
        }}
      />

      {/* ============================================================== */}
      {/* --- MODAL 2: EDIT CUSTOMER (CR NO. & VAT NO. EDITABLE) --- */}
      {/* ============================================================== */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600" />
                  <span>Edit Customer Details</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  CR No. and VAT No. are editable. Update legal or contact records below.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingCustomer(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="mt-4 space-y-3.5">
              
              {/* Customer Information */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.name || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, name: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Customer Code</label>
                    <input
                      type="text"
                      value={editingCustomer.customer_code || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, customer_code: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CR No. (Editable) *</label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.cr_no || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, cr_no: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">VAT No. (Editable) *</label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.vat_no || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, vat_no: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-navy-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={editingCustomer.status || 'Active'}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, status: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Structured Address */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <h4 className="font-bold text-slate-700 text-xs">Structured Address (Bahrain)</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Villa / Unit</label>
                    <input
                      type="text"
                      value={editingCustomer.villa_unit || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, villa_unit: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Building No.</label>
                    <input
                      type="text"
                      value={editingCustomer.building_no || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, building_no: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Road No.</label>
                    <input
                      type="text"
                      value={editingCustomer.road_no || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, road_no: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Block No.</label>
                    <input
                      type="text"
                      value={editingCustomer.block_no || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, block_no: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Area / City *</label>
                    <input
                      type="text"
                      required
                      value={editingCustomer.area || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, area: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Country</label>
                    <input
                      type="text"
                      value={editingCustomer.country || 'Bahrain'}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, country: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={editingCustomer.contact_person || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, contact_person: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="text"
                      value={editingCustomer.contact_mobile || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, contact_mobile: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telephone</label>
                    <input
                      type="text"
                      value={editingCustomer.phone || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, phone: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editingCustomer.email || ''}
                      onChange={(e) => setEditingCustomer(p => ({ ...p, email: e.target.value }))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    value={editingCustomer.remarks || editingCustomer.notes || ''}
                    onChange={(e) => setEditingCustomer(p => ({ ...p, remarks: e.target.value, notes: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                {isManagement && (
                  <button
                    type="button"
                    onClick={() => {
                      const cust = editingCustomer;
                      setEditingCustomer(null);
                      handleDeleteCustomer(cust);
                    }}
                    className="py-3 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold border border-red-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Customer</span>
                  </button>
                )}
                <div className="flex-1 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    className="py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-6 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* --- MODAL 3: ADD SITE TO CUSTOMER --- */}
      {/* ============================================================== */}
      {showAddSiteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>+ Add New Site / Facility</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Register a branch, warehouse, or building under customer account.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddSiteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="mt-4 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Account *</label>
                <select
                  required
                  value={selectedCustomerIdForSite}
                  onChange={(e) => setSelectedCustomerIdForSite(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.customer_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Site / Premises Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Warehouse Branch Bay 3"
                    value={newSiteData.site_name}
                    onChange={(e) => setNewSiteData(p => ({ ...p, site_name: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Building Type *</label>
                  <select
                    value={newSiteData.building_type}
                    onChange={(e) => setNewSiteData(p => ({ ...p, building_type: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Commercial">Commercial / Office</option>
                    <option value="Industrial Warehouse">Industrial Warehouse</option>
                    <option value="Hospitality Hotel">Hospitality Hotel</option>
                    <option value="High-Rise Tower">High-Rise Tower</option>
                    <option value="Residential">Residential Building</option>
                    <option value="Healthcare">Healthcare / Hospital</option>
                    <option value="Retail Mall">Retail Mall &amp; Podium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Site Physical Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building 2373, Road 2831, Block 428, Al Seef"
                  value={newSiteData.site_address}
                  onChange={(e) => setNewSiteData(p => ({ ...p, site_address: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facility Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Facilities Lead"
                    value={newSiteData.contact_person}
                    onChange={(e) => setNewSiteData(p => ({ ...p, contact_person: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +973 3922 4488"
                    value={newSiteData.contact_number}
                    onChange={(e) => setNewSiteData(p => ({ ...p, contact_number: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Installed Protection Systems / Equipment</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Notifier NFS2-3030 Fire Alarm Panel, 1500 GPM Fire Pump, Wet Sprinklers, Clean Agent FM200..."
                  value={newSiteData.equipment_info}
                  onChange={(e) => setNewSiteData(p => ({ ...p, equipment_info: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSiteModal(false)}
                  className="py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-navy-900 text-white font-bold shadow-md"
                >
                  Create Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* --- CUSTOMER DETAILS FULL DRAWER / MODAL --- */}
      {/* ============================================================== */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-3xl max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 p-5 text-xs animate-in slide-in-from-bottom flex flex-col">
            
            {/* Top Bar */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedCustomerDetails.customer.customer_code}
                  </span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    selectedCustomerDetails.customer.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedCustomerDetails.customer.status || 'Active'}
                  </span>
                </div>
                <h2 className="text-base font-black text-slate-900">
                  {selectedCustomerDetails.customer.name}
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  CR No: <strong>{selectedCustomerDetails.customer.cr_no || 'N/A'}</strong> • VAT No: <strong>{selectedCustomerDetails.customer.vat_no || 'N/A'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingCustomer(selectedCustomerDetails.customer)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                {isManagement && (
                  <button
                    onClick={() => handleDeleteCustomer(selectedCustomerDetails.customer)}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border border-red-200"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedCustomerDetails(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside Customer Details */}
            <div className="flex gap-1 overflow-x-auto py-2 border-b border-slate-100 text-[11px] font-bold">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'sites', label: `Sites (${selectedCustomerDetails.sites?.length || 0})` },
                { id: 'amc', label: `AMC Contracts (${selectedCustomerDetails.amcContracts?.length || 0})` },
                { id: 'jobs', label: `Jobs (${selectedCustomerDetails.jobs?.length || 0})` },
                { id: 'faults', label: `Faults (${selectedCustomerDetails.faults?.length || 0})` },
                { id: 'reports', label: `Reports (${selectedCustomerDetails.reports?.length || 0})` },
                { id: 'quotations', label: `Quotations (${selectedCustomerDetails.quotations?.length || 0})` },
                { id: 'history', label: 'History' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerDetailTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                    customerDetailTab === tab.id
                      ? 'bg-navy-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="mt-3 space-y-3 flex-1 overflow-y-auto">
              
              {/* 1. OVERVIEW */}
              {customerDetailTab === 'overview' && (
                <div className="space-y-3.5">
                  {/* Quick Legal & Contact Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">CR Number</span>
                      <span className="font-mono font-bold text-slate-900">{selectedCustomerDetails.customer.cr_no || 'None'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">VAT Number</span>
                      <span className="font-mono font-bold text-slate-900">{selectedCustomerDetails.customer.vat_no || 'None'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Person</span>
                      <span className="font-bold text-slate-900 truncate block">{selectedCustomerDetails.customer.contact_person || 'N/A'}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Telephone</span>
                      <span className="font-mono font-bold text-slate-900">{selectedCustomerDetails.customer.phone || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Structured Address Card */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Registered Bahrain Address</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">Structured Fields</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Villa / Unit</span>
                        <span className="font-black text-slate-800">{selectedCustomerDetails.customer.villa_unit || '-'}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Building</span>
                        <span className="font-black text-slate-800">{selectedCustomerDetails.customer.building_no || '-'}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Road</span>
                        <span className="font-black text-slate-800">{selectedCustomerDetails.customer.road_no || '-'}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Block</span>
                        <span className="font-black text-slate-800">{selectedCustomerDetails.customer.block_no || '-'}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Area</span>
                        <span className="font-black text-slate-800 truncate block">{selectedCustomerDetails.customer.area || '-'}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Country</span>
                        <span className="font-black text-slate-800">{selectedCustomerDetails.customer.country || 'Bahrain'}</span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Combined Full Address:</span>
                      <p className="font-mono text-slate-800 text-[11px] leading-relaxed">
                        {selectedCustomerDetails.customer.formatted_address || selectedCustomerDetails.customer.address}
                      </p>
                    </div>
                  </div>

                  {/* Remarks */}
                  {selectedCustomerDetails.customer.remarks && (
                    <div className="p-3 bg-blue-50/40 border border-blue-100 rounded-xl text-xs text-slate-700">
                      <strong className="block text-slate-900 mb-0.5">Remarks:</strong>
                      {selectedCustomerDetails.customer.remarks}
                    </div>
                  )}

                  {/* Quick Action Shortcuts */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => openAddSiteModalForCustomer(selectedCustomerDetails.customer)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Site</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCustomerDetails(null);
                        setActiveTab('amc');
                      }}
                      className="px-3 py-2 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Go to AMC View</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCustomerDetails(null);
                        setActiveTab('jobs');
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Go to Jobs View</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. SITES */}
              {customerDetailTab === 'sites' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">
                      Registered Premises ({selectedCustomerDetails.sites?.length || 0})
                    </span>
                    <button
                      onClick={() => openAddSiteModalForCustomer(selectedCustomerDetails.customer)}
                      className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Site</span>
                    </button>
                  </div>

                  {selectedCustomerDetails.sites?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No sites registered for this customer yet. Click "+ Add Site" above.
                    </div>
                  ) : (
                    selectedCustomerDetails.sites?.map(s => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900">{s.site_name}</h4>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {s.building_type}
                          </span>
                        </div>
                        <p className="text-slate-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{s.site_address}</span>
                        </p>
                        {s.contact_person && (
                          <p className="text-slate-500">Contact: {s.contact_person} ({s.contact_number})</p>
                        )}
                        {s.equipment_info && (
                          <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                            <strong>Installed:</strong> {s.equipment_info}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 3. AMC CONTRACTS */}
              {customerDetailTab === 'amc' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 text-xs">
                      Annual Maintenance Contracts ({selectedCustomerDetails.amcContracts?.length || 0})
                    </span>
                  </div>

                  {selectedCustomerDetails.amcContracts?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No AMC contracts linked to this customer yet.
                    </div>
                  ) : (
                    selectedCustomerDetails.amcContracts?.map(a => (
                      <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {a.contract_number}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            {a.status || a.contract_status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div>Period: {a.start_date} to {a.end_date}</div>
                          <div className="font-mono font-bold text-amber-800">{formatBHD(a.contract_value)}</div>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Systems: {(a.systems_covered || a.systems || []).join(', ')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 4. JOBS */}
              {customerDetailTab === 'jobs' && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-700 text-xs block">
                    Customer Work Orders ({selectedCustomerDetails.jobs?.length || 0})
                  </span>

                  {selectedCustomerDetails.jobs?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No jobs recorded for this customer.
                    </div>
                  ) : (
                    selectedCustomerDetails.jobs?.map(j => (
                      <div key={j.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-800">{j.job_number || j.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {j.job_type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>{j.site_name || 'Premises'}</span>
                          <span className="font-bold text-slate-800">{j.status}</span>
                        </div>
                        {j.amount && (
                          <div className="font-mono text-amber-800 font-bold">{formatBHD(j.amount)}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 5. FAULTS */}
              {customerDetailTab === 'faults' && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-700 text-xs block">
                    Outstanding &amp; Historical Faults ({selectedCustomerDetails.faults?.length || 0})
                  </span>

                  {selectedCustomerDetails.faults?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No faults reported for this customer.
                    </div>
                  ) : (
                    selectedCustomerDetails.faults?.map(f => (
                      <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{f.system || 'Fire Safety System'}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            f.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {f.status}
                          </span>
                        </div>
                        <p className="text-slate-600">{f.description || f.issue}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 6. REPORTS */}
              {customerDetailTab === 'reports' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>AMC Service Reports by Quarter</span>
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Official quarterly fire safety service reports &amp; checklists linked to contracts
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAmcForReport(selectedCustomerDetails.amcContracts?.[0] || null);
                        setSelectedQuarterForReport('Q1');
                        setShowCreateAmcReportModal(true);
                      }}
                      className="px-3 py-1.5 bg-navy-900 text-white rounded-xl text-xs font-bold hover:bg-navy-800 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create AMC Report</span>
                    </button>
                  </div>

                  {/* AMC Contracts & Quarterly Service Reports */}
                  {selectedCustomerDetails.amcContracts && selectedCustomerDetails.amcContracts.length > 0 ? (
                    selectedCustomerDetails.amcContracts.map((contract) => (
                      <div key={contract.id} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200 text-xs">
                          <div>
                            <span className="font-mono font-black text-blue-700 text-sm">{contract.contract_number}</span>
                            <span className="ml-2 font-bold text-slate-700">• {contract.site_name}</span>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Period: <strong className="text-slate-700">{contract.start_date} to {contract.end_date}</strong>
                              {contract.systems_covered && (
                                <span className="ml-2 text-slate-600">
                                  ({Array.isArray(contract.systems_covered) ? contract.systems_covered.join(', ') : contract.systems_covered})
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            contract.contract_status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {contract.contract_status || 'Active'}
                          </span>
                        </div>

                        {/* 4 Quarters: Q1, Q2, Q3, Q4 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          {['Q1', 'Q2', 'Q3', 'Q4'].map((qKey, qIdx) => {
                            const visitNumber = qIdx + 1;
                            const v = (contract.visits || []).find(vis => vis.quarter === qKey || vis.visit_number === visitNumber);
                            const hasReport = !!v?.report_id || !!(selectedCustomerDetails.reports || []).find(r => r.amc_id === contract.id && r.quarter === qKey);
                            const isCompleted = v?.status === 'Completed' || v?.checklist?.checklist_status === 'Submitted' || hasReport;
                            const isInProgress = !isCompleted && (v?.status === 'In Progress' || v?.checklist || (selectedCustomerDetails.reports || []).find(r => r.amc_id === contract.id && r.quarter === qKey && r.status === 'Draft'));
                            const statusLabel = isCompleted ? 'Completed' : (isInProgress ? 'Draft / In Progress' : 'Pending');

                            const fallbackVisit = v || {
                              id: `visit-${contract.id}-${qKey}`,
                              amc_id: contract.id,
                              amc_contract_number: contract.contract_number,
                              customer_id: selectedCustomerDetails.customer.id,
                              customer_name: selectedCustomerDetails.customer.name,
                              site_id: contract.site_id,
                              site_name: contract.site_name,
                              visit_number: visitNumber,
                              quarter: qKey,
                              scheduled_date: contract.start_date || '',
                              service_type: 'Quarterly Routine Maintenance',
                              systems_covered: contract.systems_covered || ['Fire Alarm', 'Fire Fighting'],
                              supervisor_name: contract.assigned_supervisor || '',
                              technician_name: contract.assigned_technician || ''
                            };

                            return (
                              <div
                                key={qKey}
                                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                                    : isInProgress
                                      ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold text-xs text-slate-900">{qKey} — Report</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                      isCompleted
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : isInProgress
                                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                                          : 'bg-slate-100 text-slate-600 border-slate-300'
                                    }`}>
                                      {statusLabel}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-600 space-y-0.5">
                                    <div>
                                      <span className="text-slate-400">Scheduled:</span>{' '}
                                      <strong className="text-slate-700">{v?.scheduled_date || v?.date || 'With schedule'}</strong>
                                    </div>
                                    {v?.actual_service_date && (
                                      <div>
                                        <span className="text-slate-400">Serviced:</span>{' '}
                                        <strong className="text-emerald-700">{v.actual_service_date}</strong>
                                      </div>
                                    )}
                                    <div className="truncate">
                                      <span className="text-slate-400">Tech:</span>{' '}
                                      <span className="text-slate-800 font-medium">{v?.technician_name || contract.assigned_technician || 'Not assigned'}</span>
                                    </div>
                                    <div className="truncate">
                                      <span className="text-slate-400">Sup:</span>{' '}
                                      <span className="text-slate-800 font-medium">{v?.supervisor_name || contract.assigned_supervisor || 'Not assigned'}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2 mt-2 border-t border-slate-100">
                                  {isCompleted ? (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewingReportVisit(fallbackVisit)}
                                      className="w-full py-1.5 bg-emerald-700 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1 shadow-sm"
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span>View PDF Report</span>
                                    </button>
                                  ) : isInProgress ? (
                                    <button
                                      type="button"
                                      onClick={() => setActiveChecklistVisit(fallbackVisit)}
                                      className="w-full py-1.5 bg-amber-600 text-white rounded-lg text-[11px] font-bold hover:bg-amber-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                                    >
                                      <Wrench className="w-3.5 h-3.5" />
                                      <span>Continue Checklist</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedAmcForReport(contract);
                                        setSelectedQuarterForReport(qKey);
                                        setShowCreateAmcReportModal(true);
                                      }}
                                      className="w-full py-1.5 bg-navy-900 text-white rounded-lg text-[11px] font-bold hover:bg-navy-800 transition-colors flex items-center justify-center gap-1"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Make Report</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                      No AMC contracts linked to this customer yet. Add an AMC contract to generate quarterly service reports.
                    </div>
                  )}

                  {/* All Customer Reports & Documents */}
                  <div className="pt-2 space-y-2">
                    <span className="font-bold text-slate-700 text-xs block">
                      All Inspection &amp; Service Documents ({selectedCustomerDetails.reports?.length || 0})
                    </span>
                    {selectedCustomerDetails.reports?.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No general inspection reports recorded yet.
                      </div>
                    ) : (
                      selectedCustomerDetails.reports?.map(r => (
                        <div key={r.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 text-xs shadow-xs hover:border-blue-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-blue-700">{r.report_number || r.id}</span>
                              {r.quarter && (
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                  {r.quarter}
                                </span>
                              )}
                              <span className="text-slate-600 font-medium text-[11px]">{r.report_type || 'AMC Service Report'}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              r.status === 'Approved' || r.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {r.status || 'Approved'}
                            </span>
                          </div>
                          <div className="text-slate-500 text-[11px] flex justify-between items-center">
                            <span>{r.date || r.created_at?.slice(0, 10)} • {r.site_name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const matchedVisit = (selectedCustomerDetails.amcContracts || [])
                                  .flatMap(c => c.visits || [])
                                  .find(v => v.id === r.visit_id || v.report_id === r.id);
                                setPreviewingReportVisit(matchedVisit || {
                                  id: r.visit_id || r.id,
                                  report_id: r.id,
                                  report_number: r.report_number,
                                  quarter: r.quarter,
                                  customer_name: selectedCustomerDetails.customer.name,
                                  site_name: r.site_name,
                                  scheduled_date: r.date,
                                  actual_service_date: r.date,
                                  supervisor_name: r.supervisor_name,
                                  technician_name: r.technician_name
                                });
                              }}
                              className="text-blue-700 font-bold hover:underline"
                            >
                              View PDF
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 7. QUOTATIONS */}
              {customerDetailTab === 'quotations' && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-700 text-xs block">
                    Quotations ({selectedCustomerDetails.quotations?.length || 0})
                  </span>

                  {selectedCustomerDetails.quotations?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No quotations recorded for this customer.
                    </div>
                  ) : (
                    selectedCustomerDetails.quotations?.map(q => (
                      <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-purple-700">{q.quotation_number || q.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {q.status}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800">{q.title}</p>
                        <div className="font-mono text-amber-800 font-bold">{formatBHD(q.amount)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 8. HISTORY */}
              {customerDetailTab === 'history' && (
                <div className="space-y-3">
                  <span className="font-bold text-slate-700 text-xs block">
                    Customer Activity Log &amp; Changes
                  </span>

                  {selectedCustomerDetails.history?.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No recent activity recorded for this customer.
                    </div>
                  ) : (
                    selectedCustomerDetails.history?.map((h, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{h.action}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{h.timestamp?.slice(0, 16).replace('T', ' ')}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{h.details}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* AMC CHECKLIST MODAL */}
      {activeChecklistVisit && (
        <AMCChecklistModal
          visit={activeChecklistVisit}
          onClose={() => setActiveChecklistVisit(null)}
          onRefresh={() => {
            if (selectedCustomerDetails?.customer?.id) {
              loadCustomerDetails(selectedCustomerDetails.customer.id);
            }
          }}
          onViewReport={(v) => {
            setActiveChecklistVisit(null);
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

      {/* CREATE AMC REPORT WIZARD (CUSTOMER + CONTRACT + QUARTER + VISIT) */}
      {showCreateAmcReportModal && (
        <CreateAMCReportModal
          initialCustomerId={selectedCustomerDetails?.customer?.id || ''}
          initialContractId={selectedAmcForReport?.id || ''}
          initialQuarter={selectedQuarterForReport || 'Q1'}
          onClose={() => setShowCreateAmcReportModal(false)}
          onOpenChecklist={(v) => {
            setShowCreateAmcReportModal(false);
            setActiveChecklistVisit(v);
          }}
          onViewReport={(v) => {
            setShowCreateAmcReportModal(false);
            setPreviewingReportVisit(v);
          }}
        />
      )}

    </div>
  );
}
