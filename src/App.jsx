import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DeviceFrame from './components/DeviceFrame';
import Dashboard from './components/Dashboard';
import AMCView from './components/AMCView';
import JobsView from './components/JobsView';
import InspectionChecklist from './components/InspectionChecklist';
import FaultsView from './components/FaultsView';
import ReportsView from './components/ReportsView';
import ReportEditor from './components/ReportEditor';
import PDFReportGenerator from './components/PDFReportGenerator';
import CustomerSiteView from './components/CustomerSiteView';
import MaterialsView from './components/MaterialsView';
import CompanySettingsView from './components/CompanySettingsView';
import AccountsView from './components/AccountsView';
import UserManagementView from './components/UserManagementView';
import MoreMenu from './components/MoreMenu';
import EmergencyCalloutView from './components/EmergencyCalloutView';
import AIAssistantModal from './components/AIAssistantModal';
import LoginModal from './components/LoginModal';
import LoginView from './components/LoginView';

function AppContent() {
  const {
    activeTab,
    setActiveTab,
    toast,
    activeModal,
    setActiveModal,
    showToast,
    currentUser,
    isOffline,
    queueOfflineItem,
    fetchStats,
    isAuthenticated,
    isLoginModalOpen,
    setIsLoginModalOpen
  } = useApp();

  // Active sub-states
  const [activeJobForInspection, setActiveJobForInspection] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [previewingReport, setPreviewingReport] = useState(null);
  const [initialJobType, setInitialJobType] = useState(null);

  // If not logged in, enforce Password Login Screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Workflow Handlers
  const handleStartInspection = (jobOrVisit) => {
    setActiveJobForInspection(jobOrVisit);
    setActiveTab('inspection');
  };

  const handleStartJob = (jobType = null) => {
    setInitialJobType(jobType);
    setActiveTab('jobs');
  };

  const handleNewAMC = () => {
    setActiveTab('amc');
  };

  const handleNewReport = (prefillData = null) => {
    setEditingReport(prefillData || {});
    setActiveTab('report_editor');
  };

  // Complete inspection -> transition to report editor
  const handleCompleteInspection = ({ checklist, faultCount, system }) => {
    const reportDraft = {
      report_type: 'AMC Service Report',
      job_number: activeJobForInspection?.job_number || 'FX-AMC-2026-001',
      site_id: activeJobForInspection?.site_id || 'site-1',
      site_name: activeJobForInspection?.site_name || 'Address Downtown Hotel & Residences',
      customer_id: activeJobForInspection?.customer_id || 'cust-1',
      customer_name: activeJobForInspection?.customer_name || 'Emaar Hospitality Group',
      system: system === 'Fire Alarm' ? 'Fire Alarm & Voice Evacuation' : 'Firefighting & Sprinkler Systems',
      checklist_data: Object.fromEntries(
        Object.entries(checklist).map(([k, v]) => [k, v.status])
      ),
      work_description: `Conducted full periodic on-site ${system} maintenance inspection. ${
        faultCount > 0
          ? `${faultCount} defect(s) identified and isolated for technical rectification.`
          : 'All checked circuits, devices, and pump assemblies verified in 100% normal operational condition.'
      }`,
      faults_found: faultCount > 0 ? `${faultCount} item(s) logged requiring parts or attention.` : 'No critical faults detected.',
      rectifications: 'Routine functional testing, cleaning, and loop polling verification completed.',
      status: 'Draft'
    };

    setEditingReport(reportDraft);
    setActiveTab('report_editor');
    showToast('Inspection data compiled into draft report', 'info');
  };

  // Save report (with offline fallback)
  const handleSaveReport = async (reportData) => {
    if (isOffline) {
      queueOfflineItem('reports', {
        ...reportData,
        id: reportData.id || `offline-rpt-${Date.now()}`,
        report_number: reportData.report_number || `RPT-OFFLINE-${Date.now().toString().slice(-4)}`
      });
      setActiveTab('reports');
      return;
    }

    try {
      const url = reportData.id ? `/api/reports/${reportData.id}` : '/api/reports';
      const method = reportData.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-id': currentUser.id
        },
        body: JSON.stringify(reportData)
      });

      if (res.ok) {
        showToast(
          reportData.status === 'Submitted'
            ? 'Report submitted for review and approval'
            : 'Report draft saved successfully',
          'success'
        );
        setEditingReport(null);
        setActiveTab('reports');
        fetchStats();
      } else {
        const err = await res.json();
        showToast(err.message || 'Error saving report', 'error');
      }
    } catch (e) {
      showToast('Network error while saving report', 'error');
    }
  };

  return (
    <DeviceFrame>
      <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
        
        {/* Main Sticky Header */}
        <Header />

        {/* Content Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-4">
          
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xl animate-in fade-in slide-in-from-top-3 flex items-center gap-2 ${
                toast.type === 'error'
                  ? 'bg-red-600 shadow-red-900/30'
                  : toast.type === 'warning'
                  ? 'bg-amber-600 shadow-amber-900/30'
                  : toast.type === 'info'
                  ? 'bg-blue-600 shadow-blue-900/30'
                  : 'bg-navy-900 shadow-slate-900/40'
              }`}
            >
              <span>{toast.message}</span>
            </div>
          )}

          {/* VIEW SWITCHER */}
          {activeTab === 'dashboard' && (
            <Dashboard
              onStartJob={handleStartJob}
              onStartInspection={() => handleStartInspection({ site_name: 'Address Downtown Hotel & Residences' })}
              onNewAMC={handleNewAMC}
              onNewReport={() => handleNewReport()}
            />
          )}

          {(activeTab === 'jobs' || activeTab === 'quotations') && (
            <JobsView
              initialJobType={activeTab === 'quotations' ? 'AMC' : initialJobType}
              onStartJob={handleStartJob}
              onStartInspectionForJob={handleStartInspection}
              onNewReportForJob={(job) =>
                handleNewReport({
                  job_number: job.job_number,
                  site_id: job.site_id,
                  customer_id: job.customer_id,
                  site_name: job.site_name,
                  customer_name: job.customer_name,
                  work_description: job.description
                })
              }
            />
          )}

          {activeTab === 'inspection' && (
            <InspectionChecklist
              initialJob={activeJobForInspection}
              onCompleteInspection={handleCompleteInspection}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              onNewReport={() => handleNewReport()}
              onEditReport={(r) => {
                setEditingReport(r);
                setActiveTab('report_editor');
              }}
              onPreviewReport={(r) => setPreviewingReport(r)}
            />
          )}

          {activeTab === 'report_editor' && (
            <ReportEditor
              initialData={editingReport}
              onSave={handleSaveReport}
              onCancel={() => {
                setEditingReport(null);
                setActiveTab('reports');
              }}
            />
          )}

          {activeTab === 'amc' && (
            <AMCView
              onStartInspectionForVisit={(visit) => handleStartInspection(visit)}
            />
          )}

          {activeTab === 'faults' && <FaultsView />}

          {activeTab === 'customers' && <CustomerSiteView />}

          {activeTab === 'materials' && <MaterialsView />}

          {activeTab === 'settings' && <CompanySettingsView />}

          {activeTab === 'users' && <UserManagementView />}

          {activeTab === 'accounts' && <AccountsView />}

          {activeTab === 'emergency' && <EmergencyCalloutView />}

          {activeTab === 'more' && (
            <MoreMenu
              onSelectView={(targetView) => {
                if (targetView === 'ai') {
                  setActiveModal({ type: 'ai_assistant' });
                } else {
                  setActiveTab(targetView);
                }
              }}
            />
          )}

        </main>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* GLOBAL MODALS */}

        {/* AI Report Assistant Modal */}
        {activeModal?.type === 'ai_assistant' && (
          <AIAssistantModal
            onApplyToReport={(enhancedText) => {
              if (activeModal.onApply) {
                activeModal.onApply(enhancedText);
              } else if (editingReport) {
                setEditingReport((p) => ({ ...p, work_description: enhancedText }));
              }
              setActiveModal(null);
            }}
            onClose={() => setActiveModal(null)}
          />
        )}

        {/* PDF Report Viewer & Generator Modal */}
        {previewingReport && (
          <PDFReportGenerator
            report={previewingReport}
            onClose={() => setPreviewingReport(null)}
          />
        )}

        {/* Account Switcher / Login Modal */}
        {isLoginModalOpen && (
          <LoginModal
            isOpen={true}
            onClose={() => setIsLoginModalOpen(false)}
          />
        )}

      </div>
    </DeviceFrame>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white text-center">
          <div className="max-w-md w-full bg-white text-slate-800 p-6 rounded-3xl shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center font-black text-xl">
              FX
            </div>
            <h2 className="text-base font-black text-navy-900">FIREX Fire &amp; Safety Service Management</h2>
            <p className="text-xs text-slate-600">The application encountered a temporary display issue. Attempting auto-recovery.</p>
            <div className="flex gap-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 shadow-md transition-all"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-all border border-slate-200"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
