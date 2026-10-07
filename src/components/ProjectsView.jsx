import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatBHD } from '../utils/formatters';
import { exportProjectsListToExcel, exportProjectDetailToExcel as exportProjectToExcel } from '../utils/excelExport';
import PDFReportGenerator from './PDFReportGenerator';
import { 
  Briefcase, FolderKanban, Plus, Search, Filter, Calendar, Clock, 
  CheckCircle2, AlertTriangle, Building2, UserCheck, DollarSign, 
  Receipt, FileText, Camera, Wrench, Package, Shield, Download, 
  ChevronRight, X, Edit, Trash2, Eye, AlertCircle, ArrowLeft,
  FileSpreadsheet, Sparkles, RefreshCw, Layers, CheckCircle
} from 'lucide-react';

export default function ProjectsView({ initialFilter = null }) {
  const { 
    currentUser, showToast, allUsers, fetchAllUsers, 
    projectsFilter, setProjectsFilter, setActiveTab, companySettings 
  } = useApp();

  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Active Filter Tab: 'All' | 'Active' | 'Starting Soon' | 'Due Soon' | 'Completed' | 'Delayed' | 'Defects'
  const [activeFilter, setActiveFilter] = useState(projectsFilter || initialFilter || 'All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null); // When viewing a project detail
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'jobs' | 'photos' | 'materials' | 'defects' | 'reports' | 'financials'
  
  // Sub-modals inside Project Detail
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showAddDefectModal, setShowAddDefectModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [previewingReport, setPreviewingReport] = useState(null);
  const [editingDefect, setEditingDefect] = useState(null);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    project_number: '',
    customer_id: '',
    site_id: '',
    project_name: '',
    project_type: 'Installation',
    project_value: '',
    vat_percent: 10,
    start_date: new Date().toISOString().slice(0, 10),
    expected_completion_date: '',
    project_manager_id: currentUser?.id || '',
    engineer_id: '',
    supervisor_id: '',
    technician_id: '',
    status: 'Scheduled',
    progress_percentage: 0,
    description: '',
    notes: ''
  });

  // New Sub-Job Form State
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    supervisor_id: '',
    technician_id: '',
    status: 'Scheduled'
  });

  // New Photo Form State
  const [newPhotoForm, setNewPhotoForm] = useState({
    caption: '',
    location: '',
    tag: 'progress', // 'before' | 'progress' | 'after' | 'defect'
    image_data: ''
  });

  // New Material Form State
  const [newMaterialForm, setNewMaterialForm] = useState({
    name: '',
    part_number: '',
    quantity: 1,
    unit: 'pcs',
    date_installed: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  // New Defect Form State
  const [newDefectForm, setNewDefectForm] = useState({
    description: '',
    severity: 'Medium', // 'Low' | 'Medium' | 'High' | 'Critical'
    location: '',
    assigned_to_id: '',
    assigned_to_name: '',
    notes: ''
  });

  // New Project Report Form State
  const [newReportForm, setNewReportForm] = useState({
    work_description: '',
    testing_findings: 'All installed devices inspected and operational as per NFPA/Civil Defense standards.',
    defects_rectified: '',
    recommendations: 'Conduct regular quarterly maintenance and maintain 24V backup batteries.',
    customer_rep_name: '',
    customer_rep_contact: ''
  });

  // Synchronize global projectsFilter from AppContext
  useEffect(() => {
    if (projectsFilter) {
      setActiveFilter(projectsFilter);
    }
  }, [projectsFilter]);

  // Load Customers, Sites, and Projects
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [projRes, custRes, sitesRes] = await Promise.all([
        fetch('/api/projects', {
          headers: { 'x-user-role': currentUser?.role, 'x-user-id': currentUser?.id }
        }),
        fetch('/api/customers', {
          headers: { 'x-user-role': currentUser?.role, 'x-user-id': currentUser?.id }
        }),
        fetch('/api/sites', {
          headers: { 'x-user-role': currentUser?.role, 'x-user-id': currentUser?.id }
        })
      ]);

      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData);
        // Refresh selected project if opened
        if (selectedProject) {
          const updated = pData.find(p => p.id === selectedProject.id);
          if (updated) setSelectedProject(updated);
        }
      }
      if (custRes.ok) {
        const cData = await custRes.json();
        setCustomers(cData);
      }
      if (sitesRes.ok) {
        const sData = await sitesRes.json();
        setSites(sData);
      }
    } catch (e) {
      console.error('Error fetching projects data:', e);
      showToast('Error loading projects data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    if (fetchAllUsers) fetchAllUsers();
  }, []);

  // Filtered Sites for Customer selection
  const customerSites = sites.filter(s => s.customer_id === newProject.customer_id);

  // Auto-fill project managers, engineers, supervisors, technicians
  const usersList = allUsers || [];
  const projectManagers = usersList.filter(u => ['Projects Manager', 'projects_manager', 'Project Manager', 'GM', 'Managing Director', 'managing_director', 'CEO'].includes(u.role));
  const engineers = usersList.filter(u => ['Engineer', 'GM', 'Managing Director', 'managing_director', 'CEO'].includes(u.role));
  const supervisors = usersList.filter(u => ['Supervisor', 'Engineer'].includes(u.role));
  const technicians = usersList.filter(u => ['Technician', 'Supervisor'].includes(u.role));

  // Handle Customer Change in New Project
  const handleCustomerChange = (customerId) => {
    const cust = customers.find(c => c.id === customerId);
    const relatedSites = sites.filter(s => s.customer_id === customerId);
    setNewProject(prev => ({
      ...prev,
      customer_id: customerId,
      site_id: relatedSites.length > 0 ? relatedSites[0].id : '',
      project_name: cust ? `${cust.name} - Fire Protection Project` : prev.project_name
    }));
  };

  // Create Project Submission
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.customer_id) {
      showToast('Please select a customer', 'warning');
      return;
    }
    if (!newProject.project_name.trim()) {
      showToast('Please enter a project name', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify(newProject)
      });

      if (res.ok) {
        const created = await res.json();
        showToast(`Project ${created.project_number} created successfully!`, 'success');
        setShowCreateModal(false);
        fetchAllData();
        setSelectedProject(created);
        setDetailTab('overview');
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to create project', 'error');
      }
    } catch (err) {
      showToast('Network error while creating project', 'error');
    }
  };

  // Update Project Status & Progress
  const handleUpdateProjectStatus = async (projectId, updates) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        const updated = await res.json();
        showToast('Project updated successfully', 'success');
        setSelectedProject(updated);
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Failed to update project', 'error');
      }
    } catch (e) {
      showToast('Error updating project', 'error');
    }
  };

  // Add Sub-Job
  const handleAddJob = async (e) => {
    e.preventDefault();
    if (!newJobForm.title.trim()) {
      showToast('Please enter a job title', 'warning');
      return;
    }

    try {
      const sup = usersList.find(u => u.id === newJobForm.supervisor_id);
      const tech = usersList.find(u => u.id === newJobForm.technician_id);

      const res = await fetch(`/api/projects/${selectedProject.id}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify({
          ...newJobForm,
          supervisor_name: sup ? sup.name : '',
          technician_name: tech ? tech.name : ''
        })
      });

      if (res.ok) {
        showToast('Project job added successfully!', 'success');
        setShowAddJobModal(false);
        setNewJobForm({
          title: '',
          description: '',
          start_date: new Date().toISOString().slice(0, 10),
          due_date: '',
          supervisor_id: '',
          technician_id: '',
          status: 'Scheduled'
        });
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error adding project job', 'error');
      }
    } catch (err) {
      showToast('Network error adding job', 'error');
    }
  };

  // Upload Photo
  const handleAddPhoto = async (e) => {
    e.preventDefault();
    if (!newPhotoForm.image_data) {
      showToast('Please select or capture a photo', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify(newPhotoForm)
      });

      if (res.ok) {
        showToast('Site photo logged successfully!', 'success');
        setShowAddPhotoModal(false);
        setNewPhotoForm({ caption: '', location: '', tag: 'progress', image_data: '' });
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving photo', 'error');
      }
    } catch (err) {
      showToast('Network error uploading photo', 'error');
    }
  };

  // Add Material
  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMaterialForm.name.trim()) {
      showToast('Please enter material/item name', 'warning');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify(newMaterialForm)
      });

      if (res.ok) {
        showToast('Material recorded successfully!', 'success');
        setShowAddMaterialModal(false);
        setNewMaterialForm({
          name: '',
          part_number: '',
          quantity: 1,
          unit: 'pcs',
          date_installed: new Date().toISOString().slice(0, 10),
          notes: ''
        });
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error recording material', 'error');
      }
    } catch (err) {
      showToast('Network error recording material', 'error');
    }
  };

  // Add Defect
  const handleAddDefect = async (e) => {
    e.preventDefault();
    if (!newDefectForm.description.trim()) {
      showToast('Please describe the defect', 'warning');
      return;
    }

    try {
      const assigned = usersList.find(u => u.id === newDefectForm.assigned_to_id);

      const res = await fetch(`/api/projects/${selectedProject.id}/defects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify({
          ...newDefectForm,
          assigned_to_name: assigned ? assigned.name : 'Unassigned'
        })
      });

      if (res.ok) {
        showToast('Defect logged on site punch list!', 'success');
        setShowAddDefectModal(false);
        setNewDefectForm({
          description: '',
          severity: 'Medium',
          location: '',
          assigned_to_id: '',
          assigned_to_name: '',
          notes: ''
        });
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error logging defect', 'error');
      }
    } catch (err) {
      showToast('Network error logging defect', 'error');
    }
  };

  // Resolve / Update Defect
  const handleUpdateDefect = async (defectId, updates) => {
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/defects/${defectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify(updates)
      });

      if (res.ok) {
        showToast('Defect status updated successfully', 'success');
        setEditingDefect(null);
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error updating defect', 'error');
      }
    } catch (err) {
      showToast('Network error updating defect', 'error');
    }
  };

  // Generate Project Report (Auto FX PRJ RPT-MM-XXX)
  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newReportForm.work_description.trim()) {
      showToast('Please enter work description for report', 'warning');
      return;
    }

    try {
      const payload = {
        project_id: selectedProject.id,
        project_number: selectedProject.project_number,
        job_number: selectedProject.project_number,
        job_type: 'Project',
        report_type: 'Project Handover & Inspection Report',
        customer_id: selectedProject.customer_id,
        customer_name: selectedProject.customer_name,
        site_id: selectedProject.site_id,
        site_name: selectedProject.site_name,
        system: selectedProject.project_type || 'Fire Protection Installation',
        work_description: newReportForm.work_description,
        testing_findings: newReportForm.testing_findings,
        defects_rectified: newReportForm.defects_rectified,
        recommendations: newReportForm.recommendations,
        customer_rep_name: newReportForm.customer_rep_name,
        customer_rep_contact: newReportForm.customer_rep_contact,
        technician_name: selectedProject.technician_name || currentUser?.name,
        supervisor_name: selectedProject.supervisor_name || currentUser?.name,
        status: 'Submitted',
        created_at: new Date().toISOString()
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role,
          'x-user-id': currentUser?.id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdReport = await res.json();
        showToast(`Report ${createdReport.document_number || createdReport.report_number} generated!`, 'success');
        setShowCreateReportModal(false);
        fetchAllData();
        setPreviewingReport(createdReport);
      } else {
        const err = await res.json();
        showToast(err.message || 'Error generating report', 'error');
      }
    } catch (err) {
      showToast('Network error generating report', 'error');
    }
  };

  // Handle Image File Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoForm(prev => ({ ...prev, image_data: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter projects according to tab and search query
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = new Date(todayStr);

  const filteredProjects = projects.filter(p => {
    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (
        (p.project_number && p.project_number.toLowerCase().includes(q)) ||
        (p.project_name && p.project_name.toLowerCase().includes(q)) ||
        (p.customer_name && p.customer_name.toLowerCase().includes(q)) ||
        (p.site_name && p.site_name.toLowerCase().includes(q))
      );
      if (!match) return false;
    }

    // Tab Filter
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Active') {
      return ['In Progress', 'Scheduled', 'Approved'].includes(p.status);
    }
    if (activeFilter === 'Starting Soon') {
      if (!p.start_date || p.status === 'Completed' || p.status === 'Cancelled') return false;
      const sDate = new Date(p.start_date);
      const diff = Math.ceil((sDate - today) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 14;
    }
    if (activeFilter === 'Due Soon') {
      if (!p.expected_completion_date || p.status === 'Completed' || p.status === 'Cancelled') return false;
      const dDate = new Date(p.expected_completion_date);
      const diff = Math.ceil((dDate - today) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 14;
    }
    if (activeFilter === 'Completed') {
      return p.status === 'Completed';
    }
    if (activeFilter === 'Delayed') {
      if (!p.expected_completion_date || ['Completed', 'Cancelled'].includes(p.status)) return false;
      const dDate = new Date(p.expected_completion_date);
      return dDate < today;
    }
    if (activeFilter === 'Defects') {
      return Array.isArray(p.defects) && p.defects.some(d => d.status === 'Open' || d.status === 'In Progress');
    }

    return true;
  });

  return (
    <div className="space-y-4 pb-24">
      
      {/* Header & Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-cyan-100 text-cyan-800 rounded-lg">
              <Briefcase className="w-5 h-5 text-cyan-700" />
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Projects Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete lifecycle management: contracts, installation jobs, staff assignment, site photos, materials, punch lists &amp; reports.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => exportProjectsListToExcel(projects)}
            className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-initial px-4 py-2 bg-cyan-700 hover:bg-cyan-800 active:bg-cyan-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'All', label: 'All Projects', count: projects.length },
            { id: 'Active', label: 'Active', count: projects.filter(p => ['In Progress', 'Scheduled', 'Approved'].includes(p.status)).length },
            { id: 'Starting Soon', label: 'Starting Soon', count: projects.filter(p => {
              if (!p.start_date || ['Completed', 'Cancelled'].includes(p.status)) return false;
              const diff = Math.ceil((new Date(p.start_date) - today) / (1000 * 60 * 60 * 24));
              return diff >= 0 && diff <= 14;
            }).length },
            { id: 'Due Soon', label: 'Due Soon', count: projects.filter(p => {
              if (!p.expected_completion_date || ['Completed', 'Cancelled'].includes(p.status)) return false;
              const diff = Math.ceil((new Date(p.expected_completion_date) - today) / (1000 * 60 * 60 * 24));
              return diff >= 0 && diff <= 14;
            }).length },
            { id: 'Completed', label: 'Completed', count: projects.filter(p => p.status === 'Completed').length },
            { id: 'Delayed', label: 'Delayed', count: projects.filter(p => {
              if (!p.expected_completion_date || ['Completed', 'Cancelled'].includes(p.status)) return false;
              return new Date(p.expected_completion_date) < today;
            }).length },
            { id: 'Defects', label: 'Open Defects', count: projects.filter(p => (p.defects || []).some(d => d.status === 'Open' || d.status === 'In Progress')).length }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setActiveFilter(f.id); setProjectsFilter(f.id); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === f.id
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilter === f.id ? 'bg-cyan-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project #, customer, building, or project title..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading project files...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? 'No projects match your search query.' : 'No projects found in this filter category.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredProjects.map(proj => {
            const openDefects = (proj.defects || []).filter(d => d.status === 'Open' || d.status === 'In Progress').length;
            const jobsCount = (proj.jobs || []).length;
            const photosCount = (proj.photos || []).length;
            const progress = Number(proj.progress_percentage || (proj.status === 'Completed' ? 100 : 0));

            return (
              <div
                key={proj.id}
                onClick={() => { setSelectedProject(proj); setDetailTab('overview'); }}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
              >
                {/* Header line: Project # and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      {proj.project_number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {proj.project_type || 'Installation'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    proj.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    proj.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    proj.status === 'On Hold' ? 'bg-amber-100 text-amber-800' :
                    proj.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                {/* Project Title & Client Details */}
                <div>
                  <h3 className="text-sm font-black text-slate-900 group-hover:text-cyan-900 transition-colors">
                    {proj.project_name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <span className="font-semibold text-slate-800">{proj.customer_name}</span>
                    <span>•</span>
                    <span className="text-slate-500">{proj.site_name}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress === 100 ? 'bg-emerald-500' :
                        progress >= 60 ? 'bg-cyan-600' :
                        progress >= 25 ? 'bg-blue-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta details: Team and Dates */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Lead Engineer</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {proj.engineer_name || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Lead Tech</span>
                    <span className="font-semibold text-slate-800 truncate block">
                      {proj.technician_name || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Expected Due</span>
                    <span className="font-mono text-slate-700">
                      {proj.expected_completion_date || 'TBD'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Value (BHD)</span>
                    <span className="font-mono font-bold text-cyan-800">
                      {formatBHD(proj.total_value || proj.project_value || 0)}
                    </span>
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-slate-400" />
                      <span>{jobsCount} jobs</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3 text-slate-400" />
                      <span>{photosCount} photos</span>
                    </span>
                    {openDefects > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-rose-600 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{openDefects} defects</span>
                        </span>
                      </>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-cyan-900 via-navy-900 to-cyan-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-cyan-300" />
                <h2 className="text-base font-extrabold">Create New Project</h2>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateProject} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Step 1: Select Customer */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Select Customer <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newProject.customer_id}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- Choose Registered Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Building / Site */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Select Building / Site Premises <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newProject.site_id}
                  onChange={(e) => setNewProject({ ...newProject, site_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500"
                  disabled={!newProject.customer_id}
                >
                  <option value="">-- Choose Facility / Site --</option>
                  {customerSites.map(s => (
                    <option key={s.id} value={s.id}>{s.site_name} ({s.site_address || 'Bahrain'})</option>
                  ))}
                </select>
                {newProject.customer_id && customerSites.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">No sites registered for this customer yet.</p>
                )}
              </div>

              {/* Step 3: Project Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Project Name / Scope <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fire Fighting Piping & Sprinkler Installation"
                    value={newProject.project_name}
                    onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Project Type</label>
                  <select
                    value={newProject.project_type}
                    onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Installation">Installation</option>
                    <option value="Modification">Modification / Fit-Out</option>
                    <option value="Testing & Commissioning">Testing &amp; Commissioning</option>
                    <option value="Turnkey">Turnkey Fire Safety Project</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Project Status</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Financials: Value & VAT */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Project Value (BHD, Excl. VAT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="0.000"
                    value={newProject.project_value}
                    onChange={(e) => setNewProject({ ...newProject, project_value: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">VAT &amp; Total (10%)</label>
                  <div className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-xl text-cyan-950 font-mono font-bold">
                    {formatBHD(
                      (Number(newProject.project_value) || 0) * 1.10
                    )} BHD Total
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expected Completion Date</label>
                  <input
                    type="date"
                    value={newProject.expected_completion_date}
                    onChange={(e) => setNewProject({ ...newProject, expected_completion_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Step 4: Staff Assignment */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide text-[11px] mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Assign Staff Members</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Projects Manager</label>
                    <select
                      value={newProject.project_manager_id}
                      onChange={(e) => setNewProject({ ...newProject, project_manager_id: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="">-- Choose Manager --</option>
                      {projectManagers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Assigned Lead Engineer</label>
                    <select
                      value={newProject.engineer_id}
                      onChange={(e) => setNewProject({ ...newProject, engineer_id: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="">-- Choose Engineer --</option>
                      {engineers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Assigned Site Supervisor</label>
                    <select
                      value={newProject.supervisor_id}
                      onChange={(e) => setNewProject({ ...newProject, supervisor_id: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="">-- Choose Supervisor --</option>
                      {supervisors.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Assigned Lead Technician</label>
                    <select
                      value={newProject.technician_id}
                      onChange={(e) => setNewProject({ ...newProject, technician_id: e.target.value })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    >
                      <option value="">-- Choose Technician --</option>
                      {technicians.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Description & Notes */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scope of Work / Description</label>
                  <textarea
                    rows="2"
                    placeholder="Enter project specifications, installation phases, or equipment details..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold shadow-md"
                >
                  Create Project File
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DEDICATED PROJECT DETAILS MODAL WITH 8 COMPREHENSIVE TABS */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col animate-in fade-in zoom-in-95">
            
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-cyan-950 via-navy-900 to-cyan-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-black bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                    {selectedProject.project_number}
                  </span>
                  <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                    {selectedProject.project_type}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-1">
                  {selectedProject.project_name}
                </h2>
                <p className="text-xs text-slate-300">
                  {selectedProject.customer_name} • {selectedProject.site_name}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => exportProjectToExcel(selectedProject)}
                  title="Export to Excel"
                  className="p-2 text-white bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="px-4 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-thin">
              {[
                { id: 'overview', label: 'Overview & Financials', icon: Layers },
                { id: 'jobs', label: `Jobs (${(selectedProject.jobs || []).length})`, icon: Wrench },
                { id: 'photos', label: `Site Photos (${(selectedProject.photos || []).length})`, icon: Camera },
                { id: 'materials', label: `Materials (${(selectedProject.materials || []).length})`, icon: Package },
                { id: 'defects', label: `Defects (${(selectedProject.defects || []).filter(d => d.status !== 'Closed').length})`, icon: AlertTriangle },
                { id: 'reports', label: `Reports (${(selectedProject.reports || []).length})`, icon: FileText },
                { id: 'financials', label: 'Invoices & Quotations', icon: Receipt }
              ].map(t => {
                const Icon = t.icon;
                const isActive = detailTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setDetailTab(t.id)}
                    className={`px-3 py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all ${
                      isActive
                        ? 'border-cyan-700 text-cyan-800 bg-white'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: OVERVIEW & PROGRESS */}
              {detailTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  {/* Status & Progress Card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Project Status</span>
                      <select
                        value={selectedProject.status}
                        onChange={(e) => handleUpdateProjectStatus(selectedProject.id, { status: e.target.value })}
                        className="mt-1 p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 w-full"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Completion: {selectedProject.progress_percentage || 0}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedProject.progress_percentage || 0}
                        onChange={(e) => handleUpdateProjectStatus(selectedProject.id, { progress_percentage: Number(e.target.value) })}
                        className="mt-3 w-full accent-cyan-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Milestone Dates</span>
                      <p className="mt-1 font-mono font-medium text-slate-700">
                        Start: {selectedProject.start_date || 'N/A'}<br />
                        Due: {selectedProject.expected_completion_date || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Financial Breakdown Card */}
                  <div className="bg-gradient-to-br from-cyan-950 to-navy-950 text-white rounded-2xl p-4 border border-cyan-800 shadow-md">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-800/80">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-cyan-400" />
                        <span>Project Financial Ledger</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Bahrain Dinars (BHD)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] font-bold text-slate-300 uppercase block">Contract Total</span>
                        <span className="text-base sm:text-lg font-black text-white font-mono block mt-1">
                          {formatBHD(selectedProject.total_value || selectedProject.project_value || 0)}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Incl. 10% VAT</span>
                      </div>

                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] font-bold text-slate-300 uppercase block">Invoiced</span>
                        <span className="text-base sm:text-lg font-black text-cyan-300 font-mono block mt-1">
                          {formatBHD(selectedProject.invoiced_amount || 0)}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Master accounts</span>
                      </div>

                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] font-bold text-slate-300 uppercase block">Collected</span>
                        <span className="text-base sm:text-lg font-black text-emerald-400 font-mono block mt-1">
                          {formatBHD(selectedProject.paid_amount || 0)}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Paid receipts</span>
                      </div>

                      <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                        <span className="text-[10px] font-bold text-slate-300 uppercase block">Outstanding</span>
                        <span className="text-base sm:text-lg font-black text-amber-400 font-mono block mt-1">
                          {formatBHD(selectedProject.outstanding_amount || 0)}
                        </span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">Pending collection</span>
                      </div>
                    </div>
                  </div>

                  {/* Assigned Operations Team */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-cyan-700" />
                      <span>Assigned Operations &amp; Engineering Team</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Projects Manager</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{selectedProject.project_manager_name || 'Unassigned'}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Assigned Engineer</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{selectedProject.engineer_name || 'Unassigned'}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Site Supervisor</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{selectedProject.supervisor_name || 'Unassigned'}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-bold uppercase text-slate-400 block">Lead Technician</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{selectedProject.technician_name || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description / Scope */}
                  {selectedProject.description && (
                    <div className="bg-white rounded-2xl p-4 border border-slate-200">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Scope of Work &amp; Technical Specifications
                      </h3>
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROJECT JOBS */}
              {detailTab === 'jobs' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Work Orders &amp; Sub-Jobs ({(selectedProject.jobs || []).length})
                    </h3>
                    <button
                      onClick={() => setShowAddJobModal(true)}
                      className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create Project Job</span>
                    </button>
                  </div>

                  {(selectedProject.jobs || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-slate-500 font-medium">No project work orders created yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.jobs.map(job => (
                        <div key={job.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-cyan-800">{job.job_number}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                                {job.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 mt-0.5">{job.title || job.description}</h4>
                            <p className="text-[11px] text-slate-500">
                              Assigned Tech: {job.technician_name || 'N/A'} • Due: {job.due_date || job.expected_completion_date || 'N/A'}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SITE PHOTOS */}
              {detailTab === 'photos' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Site Photos &amp; Progress Evidence ({(selectedProject.photos || []).length})
                    </h3>
                    <button
                      onClick={() => setShowAddPhotoModal(true)}
                      className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>+ Upload Site Photo</span>
                    </button>
                  </div>

                  {(selectedProject.photos || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Camera className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-slate-500 font-medium">No site photos uploaded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedProject.photos.map((photo, i) => (
                        <div key={photo.id || i} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                          <img src={photo.url || photo.image_data} alt="Site" className="w-full h-32 object-cover" />
                          <div className="p-2 space-y-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-700 block">
                              {photo.tag || 'Progress'} • {photo.date}
                            </span>
                            <p className="text-slate-800 font-semibold truncate">{photo.caption || 'Site Photo'}</p>
                            {photo.location && <p className="text-[10px] text-slate-500 truncate">{photo.location}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: MATERIALS */}
              {detailTab === 'materials' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Materials &amp; Spare Parts Installed ({(selectedProject.materials || []).length})
                    </h3>
                    <button
                      onClick={() => setShowAddMaterialModal(true)}
                      className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Material</span>
                    </button>
                  </div>

                  {(selectedProject.materials || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <Package className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-slate-500 font-medium">No installed materials recorded yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase border-b border-slate-200">
                            <th className="p-2.5">Item Name</th>
                            <th className="p-2.5">Part #</th>
                            <th className="p-2.5">Quantity</th>
                            <th className="p-2.5">Installed Date</th>
                            <th className="p-2.5">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          {selectedProject.materials.map((m, i) => (
                            <tr key={m.id || i} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                              <td className="p-2.5 font-mono">{m.part_number || 'N/A'}</td>
                              <td className="p-2.5 font-bold text-cyan-800">{m.quantity} {m.unit}</td>
                              <td className="p-2.5 font-mono">{m.date_installed}</td>
                              <td className="p-2.5 text-slate-600">{m.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: DEFECTS */}
              {detailTab === 'defects' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Site Defects &amp; Snags ({(selectedProject.defects || []).length})
                    </h3>
                    <button
                      onClick={() => setShowAddDefectModal(true)}
                      className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Log Defect</span>
                    </button>
                  </div>

                  {(selectedProject.defects || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                      <p className="text-slate-600 font-bold">Zero open defects on site!</p>
                      <p className="text-slate-400 text-[11px]">All installations comply with specifications.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.defects.map(defect => (
                        <div key={defect.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                {defect.defect_number}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                defect.severity === 'Critical' ? 'bg-rose-600 text-white' :
                                defect.severity === 'High' ? 'bg-orange-500 text-white' :
                                defect.severity === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {defect.severity}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {defect.status !== 'Closed' && defect.status !== 'Resolved' ? (
                                <button
                                  onClick={() => handleUpdateDefect(defect.id, { status: 'Resolved' })}
                                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Mark Resolved</span>
                                </button>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                                  Resolved
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="font-bold text-slate-900">{defect.description}</p>
                          <div className="text-[11px] text-slate-500 flex items-center justify-between">
                            <span>Location: {defect.location || 'Site wide'}</span>
                            <span>Assigned: {defect.assigned_to_name || 'Unassigned'}</span>
                            <span>Logged: {defect.date_logged}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: REPORTS */}
              {detailTab === 'reports' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">
                      Project Reports &amp; Certificates ({(selectedProject.reports || []).length})
                    </h3>
                    <button
                      onClick={() => setShowCreateReportModal(true)}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Create Project Report</span>
                    </button>
                  </div>

                  {(selectedProject.reports || []).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-slate-500 font-medium">No project inspection reports generated yet.</p>
                      <button
                        onClick={() => setShowCreateReportModal(true)}
                        className="mt-2 px-3 py-1 bg-cyan-700 text-white rounded-lg text-xs font-bold"
                      >
                        Generate First Report (FX PRJ RPT)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedProject.reports.map(rep => (
                        <div key={rep.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {rep.document_number || rep.report_number}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                                {rep.status || 'Submitted'}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-900 mt-1">{rep.report_type || 'Project Handover Report'}</h4>
                            <p className="text-[11px] text-slate-500">
                              Date: {rep.created_at ? new Date(rep.created_at).toLocaleDateString() : 'Recent'} • Prepared By: {rep.technician_name || rep.supervisor_name}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setPreviewingReport(rep)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View / PDF</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: FINANCIALS (INVOICES & QUOTATIONS) - VIEW-ONLY FOR PROJECTS MANAGER */}
              {detailTab === 'financials' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                    <span className="font-bold">Projects Operations Access:</span> Projects Managers can review quotations, invoices, and payment statuses. Permanent invoice creation or financial deletion is governed by the Accounts module.
                  </div>

                  {/* Quotations List */}
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-2">
                      Project Quotations ({(selectedProject.quotations || []).length})
                    </h4>
                    {(selectedProject.quotations || []).length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No quotation linked to this project number.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedProject.quotations.map(q => (
                          <div key={q.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-purple-800">{q.quotation_number || q.id}</span>
                              <span className="text-[11px] text-slate-600 block">{q.title || 'Project Proposal'}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900 block">{formatBHD(q.total_amount || q.amount || 0)}</span>
                              <span className="text-[10px] font-bold text-purple-700">{q.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Invoices List */}
                  <div className="pt-2 border-t border-slate-200">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-2">
                      Project Invoices ({(selectedProject.invoices || []).length})
                    </h4>
                    {(selectedProject.invoices || []).length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No invoices billed for this project yet.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedProject.invoices.map(inv => (
                          <div key={inv.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <span className="font-mono font-bold text-teal-800">{inv.invoice_number || inv.id}</span>
                              <span className="text-[11px] text-slate-600 block">{inv.invoice_date || 'N/A'}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-900 block">{formatBHD(inv.total_amount || 0)}</span>
                              <span className={`text-[10px] font-bold ${
                                inv.status === 'Paid' ? 'text-emerald-700' :
                                inv.status === 'Partial' ? 'text-amber-700' : 'text-rose-700'
                              }`}>
                                {inv.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ADD SUB-JOB */}
      {showAddJobModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm">Add Project Job</h3>
              <button onClick={() => setShowAddJobModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddJob} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Job Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Pipe Pressure Test & Flushing"
                  value={newJobForm.title}
                  onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newJobForm.start_date}
                    onChange={(e) => setNewJobForm({ ...newJobForm, start_date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newJobForm.due_date}
                    onChange={(e) => setNewJobForm({ ...newJobForm, due_date: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Technician</label>
                <select
                  value={newJobForm.technician_id}
                  onChange={(e) => setNewJobForm({ ...newJobForm, technician_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="">-- Choose Tech --</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  value={newJobForm.description}
                  onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddJobModal(false)} className="px-3 py-1.5 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-cyan-700 text-white rounded-xl font-bold">Save Job</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ADD SITE PHOTO */}
      {showAddPhotoModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm">Upload Site Photo</h3>
              <button onClick={() => setShowAddPhotoModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddPhoto} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Photo File / Camera *</label>
                <input
                  required
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              {newPhotoForm.image_data && (
                <div className="rounded-xl overflow-hidden max-h-40 border border-slate-200">
                  <img src={newPhotoForm.image_data} alt="Preview" className="w-full h-36 object-cover" />
                </div>
              )}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Photo Caption</label>
                <input
                  type="text"
                  placeholder="e.g. Zone 2 Riser Valve Installed"
                  value={newPhotoForm.caption}
                  onChange={(e) => setNewPhotoForm({ ...newPhotoForm, caption: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location Tag</label>
                  <input
                    type="text"
                    placeholder="Floor / Zone"
                    value={newPhotoForm.location}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stage Tag</label>
                  <select
                    value={newPhotoForm.tag}
                    onChange={(e) => setNewPhotoForm({ ...newPhotoForm, tag: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="progress">In Progress</option>
                    <option value="before">Before Work</option>
                    <option value="after">Completed / After</option>
                    <option value="defect">Defect / Snag</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddPhotoModal(false)} className="px-3 py-1.5 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-cyan-700 text-white rounded-xl font-bold">Save Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: ADD MATERIAL */}
      {showAddMaterialModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm">Add Material / Part</h3>
              <button onClick={() => setShowAddMaterialModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddMaterial} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item / Component Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Optical Smoke Detector (Hochiki)"
                  value={newMaterialForm.name}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Part / Model #</label>
                  <input
                    type="text"
                    placeholder="SOC-E3N"
                    value={newMaterialForm.part_number}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, part_number: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMaterialForm.quantity}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, quantity: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddMaterialModal(false)} className="px-3 py-1.5 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-cyan-700 text-white rounded-xl font-bold">Save Material</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: LOG DEFECT */}
      {showAddDefectModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm">Log Site Defect / Snag</h3>
              <button onClick={() => setShowAddDefectModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddDefect} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Defect Description *</label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Sprinkler pipe hanger missing at corridor 3"
                  value={newDefectForm.description}
                  onChange={(e) => setNewDefectForm({ ...newDefectForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Severity</label>
                  <select
                    value={newDefectForm.severity}
                    onChange={(e) => setNewDefectForm({ ...newDefectForm, severity: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Floor 4 / Plant Room"
                    value={newDefectForm.location}
                    onChange={(e) => setNewDefectForm({ ...newDefectForm, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Assign for Rectification</label>
                <select
                  value={newDefectForm.assigned_to_id}
                  onChange={(e) => setNewDefectForm({ ...newDefectForm, assigned_to_id: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="">-- Choose Tech / Staff --</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddDefectModal(false)} className="px-3 py-1.5 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-rose-700 text-white rounded-xl font-bold">Log Defect</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: CREATE PROJECT REPORT (FX PRJ RPT) */}
      {showCreateReportModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-5 space-y-4 animate-in fade-in my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Generate Project Report</h3>
                <span className="text-[10px] text-indigo-700 font-mono font-bold">
                  Format: FX PRJ RPT-MM-XXX
                </span>
              </div>
              <button onClick={() => setShowCreateReportModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateReport} className="space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Work Description / Milestones Tested *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Completed installation of fire pump control panel, wired flow switch inputs, conducted hydrostatic pressure test at 200 PSI..."
                  value={newReportForm.work_description}
                  onChange={(e) => setNewReportForm({ ...newReportForm, work_description: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Testing &amp; Commissioning Findings</label>
                <textarea
                  rows="2"
                  value={newReportForm.testing_findings}
                  onChange={(e) => setNewReportForm({ ...newReportForm, testing_findings: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Recommendations &amp; Handover Notes</label>
                <textarea
                  rows="2"
                  value={newReportForm.recommendations}
                  onChange={(e) => setNewReportForm({ ...newReportForm, recommendations: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client Representative</label>
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newReportForm.customer_rep_name}
                    onChange={(e) => setNewReportForm({ ...newReportForm, customer_rep_name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Client Phone</label>
                  <input
                    type="text"
                    placeholder="+973 ..."
                    value={newReportForm.customer_rep_contact}
                    onChange={(e) => setNewReportForm({ ...newReportForm, customer_rep_contact: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowCreateReportModal(false)} className="px-3 py-1.5 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-700 text-white rounded-xl font-bold shadow-md">
                  Generate FX Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF REPORT VIEWER MODAL */}
      {previewingReport && (
        <PDFReportGenerator
          report={previewingReport}
          onClose={() => setPreviewingReport(null)}
        />
      )}

    </div>
  );
}
