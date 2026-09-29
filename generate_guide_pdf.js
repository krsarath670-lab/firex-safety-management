const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

function createGuidePDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const navy = [15, 30, 54];       // #0F1E36 (FIREX Navy)
  const red = [225, 29, 72];       // #E11D48 (FIREX Red)
  const gold = [217, 119, 6];      // #D97706 (Amber/Gold)
  const slateDark = [30, 41, 59];  // #1E293B
  const slateLight = [241, 245, 249]; // #F1F5F9
  const textMuted = [100, 116, 139]; // #64748B
  const borderCol = [203, 213, 225]; // #CBD5E1

  let totalPages = 5;

  function drawHeader(pageNum, title) {
    // Header Bar
    doc.setFillColor(...navy);
    doc.rect(0, 0, pageWidth, 22, 'F');

    // Accent line
    doc.setFillColor(...red);
    doc.rect(0, 22, pageWidth, 1.5, 'F');

    // Company logo & title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('FIREX SAFETY MANAGEMENT SYSTEM', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('CR No.: 96850 1  |  VAT No.: 220006271900002  |  Civil Defence Approved', margin, 17);

    // Page Subject
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), pageWidth - margin, 14, { align: 'right' });
  }

  function drawFooter(pageNum) {
    const y = pageHeight - 12;
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text('FIREX • Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain • service@firexbahrain.com', margin, y + 2);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, y + 2, { align: 'right' });
  }

  function sectionTitle(title, y, iconChar = '■') {
    doc.setFillColor(...slateLight);
    doc.roundedRect(margin, y, contentWidth, 7.5, 1.5, 1.5, 'F');
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentWidth, 7.5, 1.5, 1.5, 'S');

    doc.setTextColor(...navy);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${iconChar}  ${title}`, margin + 3, y + 5.2);
    return y + 11;
  }

  // ==========================================
  // PAGE 1: TITLE & COMPREHENSIVE USER ROLES MATRIX
  // ==========================================
  drawHeader(1, 'System Overview & Role Architecture');

  let curY = 30;

  // Title Card
  doc.setFillColor(...slateLight);
  doc.roundedRect(margin, curY, contentWidth, 23, 2, 2, 'F');
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, curY, contentWidth, 23, 2, 2, 'S');

  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SYSTEM USER ROLES & WORK ORDER (JOBS) GUIDE', margin + 4, curY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...slateDark);
  doc.text('Standard Operating Procedure (SOP) & Role Responsibilities Guide for FIREX Safety Management Application.', margin + 4, curY + 13);
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text('Covers: 7 Distinct User Roles, Strict Report Preparation Permissions, Job Creation, Scheduling & Financial Governance.', margin + 4, curY + 18);

  curY += 28;

  curY = sectionTitle('1. USER ROLES OVERVIEW & PERMISSION HIERARCHY', curY, '1');

  // Role Matrix Cards
  const rolesP1 = [
    {
      title: 'GENERAL MANAGER (GM)',
      badge: 'Executive / Full Authority',
      badgeColor: [225, 29, 72],
      desc: 'Complete administrative, operational, and financial control over the entire FIREX system.',
      points: [
        'Final review & one-click approval on all AMC contracts, Work Orders, and Official Reports.',
        'Full financial visibility: profit margins, VAT breakdowns, accounts receivables, and job hold overrides.',
        'Sole authority to create/manage user accounts (including Projects Manager and Accounts personnel).',
        'Can review, approve, view, and lock any inspection or emergency report.'
      ]
    },
    {
      title: 'PROJECTS MANAGER',
      badge: 'Operations & Project Delivery',
      badgeColor: [37, 99, 235],
      desc: 'Operational management of Project installations, Fit-Out works, item supplies, and site handovers.',
      points: [
        'AUTHORIZED TO PREPARE REPORTS: Project Reports, Fit-Out Reports, Installation Reports & Supply Reports.',
        'Tracks project milestones, material delivery schedules, job timelines, and contractor coordination.',
        'Monitors technician attendance and oversees job lifecycle from pending status through completion.',
        'Collaborates directly with Engineers and Supervisors for resource allocation.'
      ]
    },
    {
      title: 'FIRE PROTECTION ENGINEER',
      badge: 'Technical & Engineering Compliance',
      badgeColor: [5, 150, 105],
      desc: 'Technical engineering authority ensuring Civil Defence and NFPA standards compliance.',
      points: [
        'AUTHORIZED TO PREPARE REPORTS: Testing & Commissioning Reports, Inspection Reports, Fault Reports & AMC Reports.',
        'Reviews technician checklist findings, approves rectified faults, and verifies hydraulic/panel test results.',
        'Provides engineering sign-off on fire pump flow tests, clean agent concentration, and loop wiring.',
        'Assigns and validates technical procedures on complex jobs and fit-outs.'
      ]
    }
  ];

  rolesP1.forEach(role => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, curY, contentWidth, 31, 1.5, 1.5, 'F');
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, curY, contentWidth, 31, 1.5, 1.5, 'S');

    // Role Header Bar inside box
    doc.setFillColor(...slateLight);
    doc.rect(margin + 0.3, curY + 0.3, contentWidth - 0.6, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(role.title, margin + 3, curY + 4.8);

    // Badge
    doc.setFillColor(...role.badgeColor);
    doc.roundedRect(pageWidth - margin - 52, curY + 1.2, 50, 4.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text(role.badge, pageWidth - margin - 27, curY + 4.3, { align: 'center' });

    // Description
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(...textMuted);
    doc.text(role.desc, margin + 3, curY + 10.5);

    // Bullet points
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...slateDark);
    let pY = curY + 14.5;
    role.points.forEach(pt => {
      doc.text(`•  ${pt}`, margin + 3, pY);
      pY += 3.8;
    });

    curY += 34;
  });

  drawFooter(1);

  // ==========================================
  // PAGE 2: USER ROLES (CONT.) & REPORT PERMISSIONS
  // ==========================================
  doc.addPage();
  drawHeader(2, 'Field, Sales & Accounts Roles');

  curY = 28;

  const rolesP2 = [
    {
      title: 'SENIOR FIELD SUPERVISOR',
      badge: 'Field Operations & Dispatch',
      badgeColor: [217, 119, 6],
      desc: 'Frontline field operations leader directing technician teams, emergency callouts, and daily site work.',
      points: [
        'AUTHORIZED TO PREPARE REPORTS: Work Completion Reports, Fault Reports, AMC Inspection Reports & Emergency Reports.',
        'Dispatches certified technician teams to job sites, AMC quarterly visits, and 24/7 urgent callouts.',
        'Verifies field photographic evidence (Before, During, After) and checks digital customer sign-offs.',
        'Maintains job execution quality, safety compliance, and site access coordination.'
      ]
    },
    {
      title: 'CERTIFIED FIELD TECHNICIAN',
      badge: 'Mobile Field Specialist',
      badgeColor: [109, 40, 217],
      desc: 'Mobile-first hands-on technical specialist executing inspections, repairs, and installations.',
      points: [
        'AUTHORIZED TO PREPARE REPORTS: Drafts and submits official reports for all assigned tasks.',
        'Records site arrival timestamps, executes detailed NFPA checklists (Pass/Fail/Needs Attention).',
        'Uploads high-resolution photographic proof (Before / During / After) with captions.',
        'Captures customer representative digital signature directly on mobile touchscreen on-site.',
        'Protected view: Financial figures and unassigned accounts are hidden for confidentiality.'
      ]
    },
    {
      title: 'SALES SPECIALIST / ACCOUNT MANAGER',
      badge: 'Business Development & Quotations',
      badgeColor: [14, 165, 233],
      desc: 'Manages client relationships, generates work quotations, and books AMC maintenance agreements.',
      points: [
        'Creates new Customers, Site premises, AMC contracts, and Job Work Orders.',
        'Enters Quotation References, contract scopes, and submits proposals for GM approval.',
        'Monitors sales targets, active contract renewal pipeline, and customer billing status.',
        'STRICT RESTRICTION: Read-only access to operational reports. Strictly prohibited from preparing technical reports.'
      ]
    },
    {
      title: 'ACCOUNTS & FINANCE LEAD',
      badge: 'Invoicing, VAT & Job Hold Governance',
      badgeColor: [71, 85, 105],
      desc: 'Complete financial ledger governance, tax invoice creation, payment recording, and debt protection.',
      points: [
        'Issues Tax Invoices with standard 10% Bahrain VAT breakdown and official CR/VAT registration.',
        'Records customer payment receipts (Cash, Cheque, Bank Transfer, BenefitPay) and tracks balances.',
        'JOB ON-HOLD GOVERNANCE: Puts work orders on financial hold when clients have overdue unpaid balances.',
        'Generates Excel customer ledgers. STRICT RESTRICTION: Prohibited from preparing technical reports.'
      ]
    }
  ];

  rolesP2.forEach(role => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, curY, contentWidth, 29, 1.5, 1.5, 'F');
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, curY, contentWidth, 29, 1.5, 1.5, 'S');

    doc.setFillColor(...slateLight);
    doc.rect(margin + 0.3, curY + 0.3, contentWidth - 0.6, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...navy);
    doc.text(role.title, margin + 3, curY + 4.5);

    doc.setFillColor(...role.badgeColor);
    doc.roundedRect(pageWidth - margin - 52, curY + 1, 50, 4.2, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.text(role.badge, pageWidth - margin - 27, curY + 3.8, { align: 'center' });

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.2);
    doc.setTextColor(...textMuted);
    doc.text(role.desc, margin + 3, curY + 9.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...slateDark);
    let pY = curY + 13.5;
    role.points.forEach(pt => {
      doc.text(`•  ${pt}`, margin + 3, pY);
      pY += 3.6;
    });

    curY += 32;
  });

  curY = sectionTitle('2. STRICT REPORT PREPARATION PERMISSIONS POLICY', curY, '2');

  doc.setFillColor(254, 242, 242);
  doc.roundedRect(margin, curY, contentWidth, 26, 1.5, 1.5, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, curY, contentWidth, 26, 1.5, 1.5, 'S');

  doc.setTextColor(...red);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CRITICAL SYSTEM POLICY: WHO CAN CREATE & PREPARE REPORTS', margin + 3, curY + 5);

  doc.setTextColor(...slateDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text('• ONLY 4 ROLES can create/prepare reports: PROJECTS MANAGER, ENGINEER, SUPERVISOR, TECHNICIAN.', margin + 3, curY + 10);
  doc.text('• AUTOMATIC IDENTITY CAPTURE: The system automatically captures the authenticated user name, role, date, and exact timestamp.', margin + 3, curY + 14);
  doc.text('• NO MANUAL TYPING: Users cannot type or alter the "Prepared By" name. Official PDF reports embed this verified signature block.', margin + 3, curY + 18);
  doc.text('• SALES & ACCOUNTS RESTRICTION: Sales and Accounts may VIEW reports where permitted, but CANNOT create or edit technical reports.', margin + 3, curY + 22);

  drawFooter(2);

  // ==========================================
  // PAGE 3: STEP-BY-STEP HOW TO ADD A JOB
  // ==========================================
  doc.addPage();
  drawHeader(3, 'Step-by-Step Guide: How to Add Jobs');

  curY = 28;
  curY = sectionTitle('3. HOW TO CREATE A NEW WORK ORDER (JOB) — STEP-BY-STEP', curY, '3');

  const jobSteps = [
    {
      num: 'STEP 1',
      title: 'Navigate to Jobs Module',
      action: 'From the main navigation bar, click on the "Jobs" tab (or click "+ New Work Order" on the Dashboard).',
      detail: 'This opens the Work Orders management console displaying All, Active, Pending, Completed, and On-Hold jobs.'
    },
    {
      num: 'STEP 2',
      title: 'Click "+ Create Work Order"',
      action: 'Click the primary action button "+ Create Work Order" located at the top right of the Jobs screen.',
      detail: 'The comprehensive "Create New Work Order" modal will slide open with all mandatory compliance fields.'
    },
    {
      num: 'STEP 3',
      title: 'Select Job Type & Safety System',
      action: 'Choose the appropriate category for the work order from the dropdowns:',
      detail: '• Job Type: AMC Maintenance, Fit-out Works, Supply of Items, Project Installation, Breakdown, Installation, Testing & Commissioning, or Site Inspection.\n• System Type: Fire Alarm, Fire Fighting, Fire Extinguishers, FM200 Clean Agent, Emergency Lighting, or All Systems.'
    },
    {
      num: 'STEP 4',
      title: 'Select Customer & Site Premises',
      action: 'Pick the customer company and their specific building/facility site:',
      detail: '• Customer: Select existing customer from list, or click "+ New Customer" to quick-add a new client.\n• Site Premises: Select the exact site location. The site address and Civil Defence details are automatically attached.'
    },
    {
      num: 'STEP 5',
      title: 'Enter Financials & Bahrain 10% VAT',
      action: 'Specify the commercial value and tax rate (protected from technician view):',
      detail: '• Amount (Excl. VAT) in BHD: e.g. 250.000 BHD.\n• VAT Rate (%): Defaults to standard Bahrain VAT 10%.\n• Live Preview: The system automatically computes VAT Amount (25.000 BHD) and Total Incl. VAT (275.000 BHD).\n• Quotation Ref #: Enter official quotation tracking number (e.g. QT-2026-088).'
    },
    {
      num: 'STEP 6',
      title: 'Assign Field Personnel (Sales, Supervisor, Tech)',
      action: 'Assign key personnel responsible for the work order:',
      detail: '• Sales Person: Automatically defaults to current user if created by Sales, or selectable by GM/Supervisor.\n• Assigned Supervisor: Lead engineer/supervisor overseeing quality and safety.\n• Assigned Technician: Certified field specialist dispatched to perform hands-on execution.'
    },
    {
      num: 'STEP 7',
      title: 'Define Schedule, Scope & Submit',
      action: 'Enter Expected Start Date, Expected Completion Date, Work Description, and click "Create Work Order":',
      detail: '• The system instantly generates a formal Job Number (e.g. JOB-2026-008).\n• Notifications appear on the Supervisor and Technician mobile dashboards immediately.'
    }
  ];

  jobSteps.forEach(st => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, curY, contentWidth, 27, 1.5, 1.5, 'F');
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, curY, contentWidth, 27, 1.5, 1.5, 'S');

    // Step Number Badge
    doc.setFillColor(...navy);
    doc.roundedRect(margin + 2.5, curY + 2.5, 18, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(st.num, margin + 11.5, curY + 6, { align: 'center' });

    // Step Title
    doc.setTextColor(...navy);
    doc.setFontSize(8.5);
    doc.text(st.title, margin + 23, curY + 6.2);

    // Step Action
    doc.setTextColor(...slateDark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(st.action, margin + 3, curY + 11.5);

    // Step Details (multi-line)
    doc.setTextColor(...textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    const splitDetail = doc.splitTextToSize(st.detail, contentWidth - 6);
    doc.text(splitDetail, margin + 3, curY + 15.5);

    curY += 29.5;
  });

  drawFooter(3);

  // ==========================================
  // PAGE 4: JOB EXECUTION, REPORTS & JOB HOLD
  // ==========================================
  doc.addPage();
  drawHeader(4, 'Job Execution Lifecycle & Financial Holds');

  curY = 28;
  curY = sectionTitle('4. JOB LIFECYCLE: FROM EXECUTION TO COMPLETION', curY, '4');

  // Workflow Diagram Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, curY, contentWidth, 38, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, curY, contentWidth, 38, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...navy);
  doc.text('JOB WORK ORDER EXECUTION FLOW', margin + 4, curY + 6);

  const wfSteps = [
    { code: 'NEW', label: '1. Create Job', sub: 'Sales / GM / PM' },
    { code: 'ASSIGN', label: '2. Dispatch', sub: 'Supervisor / Tech' },
    { code: 'SITE', label: '3. Attend Site', sub: 'GPS & Arrival Time' },
    { code: 'WORK', label: '4. Checklist', sub: 'Pass / Fail / Photos' },
    { code: 'SIGN', label: '5. Client Sign', sub: 'Digital Touch Sign' },
    { code: 'REPORT', label: '6. Report', sub: 'Auto Prepared-By' },
    { code: 'CLOSE', label: '7. Approval', sub: 'GM / Engineer' }
  ];

  let wfX = margin + 3;
  const wfBoxW = 24.5;
  wfSteps.forEach((ws, idx) => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(wfX, curY + 11, wfBoxW, 20, 1, 1, 'F');
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);
    doc.roundedRect(wfX, curY + 11, wfBoxW, 20, 1, 1, 'S');

    doc.setFillColor(...(idx === 6 ? [5, 150, 105] : (idx === 0 ? navy : [37, 99, 235])));
    doc.rect(wfX, curY + 11, wfBoxW, 4.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(ws.code, wfX + (wfBoxW / 2), curY + 14.2, { align: 'center' });

    doc.setTextColor(...slateDark);
    doc.setFontSize(6.8);
    doc.text(ws.label, wfX + (wfBoxW / 2), curY + 20, { align: 'center' });

    doc.setTextColor(...textMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.text(ws.sub, wfX + (wfBoxW / 2), curY + 26, { align: 'center' });

    if (idx < 6) {
      doc.setTextColor(...navy);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('→', wfX + wfBoxW + 0.3, curY + 21);
    }
    wfX += wfBoxW + 2;
  });

  curY += 44;

  curY = sectionTitle('5. MOBILE FIELD EXECUTION (TECHNICIAN & SUPERVISOR)', curY, '5');

  const execPoints = [
    { title: 'Site Arrival & Attendance Recording', desc: 'Technician opens the work order on mobile and taps "Record Arrival". System logs exact date and time.' },
    { title: 'Digital NFPA Inspection Checklists', desc: 'Each system (Fire Alarm, Pumps, Sprinklers, Extinguishers) has standard items with Pass, Fail, or Needs Attention.' },
    { title: 'Defect & Fault Rectification Logging', desc: 'Record components replaced, test smoke cans used, wiring repairs, and pressure gauge recalibrations.' },
    { title: 'Photographic Evidence (Before, During, After)', desc: 'Direct camera capture or gallery upload. Stored securely with date/time, technician ID, and captions.' },
    { title: 'Customer Representative Touchscreen Signature', desc: 'Customer representative signs on the mobile screen. Name, phone, and time are captured for the official PDF report.' }
  ];

  execPoints.forEach(ep => {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, curY, contentWidth, 11, 1, 1, 'F');
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, curY, contentWidth, 11, 1, 1, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...navy);
    doc.text(`✓  ${ep.title}:`, margin + 3, curY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...slateDark);
    doc.text(ep.desc, margin + 3, curY + 8.5);

    curY += 13.5;
  });

  curY += 2;
  curY = sectionTitle('6. ACCOUNTS FINANCIAL "JOB ON-HOLD" PROTOCOL', curY, '6');

  doc.setFillColor(255, 247, 237);
  doc.roundedRect(margin, curY, contentWidth, 26, 1.5, 1.5, 'F');
  doc.setDrawColor(254, 215, 170);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, curY, contentWidth, 26, 1.5, 1.5, 'S');

  doc.setTextColor(...gold);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('FINANCIAL GOVERNANCE: HOW JOB HOLDS PROTECT COMPANY REVENUE', margin + 3, curY + 5);

  doc.setTextColor(...slateDark);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('• PLACING A JOB ON HOLD: When a client has overdue invoices, Accounts sets job status to "On Hold" with a mandatory reason.', margin + 3, curY + 10);
  doc.text('• FIELD LOCKOUT: Technicians and supervisors are blocked from continuing work until financial clearance is approved.', margin + 3, curY + 14);
  doc.text('• RELEASE PROTOCOL: Once payment receipt is recorded and cleared, Accounts or GM clicks "Release Hold" with recorded reason.', margin + 3, curY + 18);
  doc.text('• COMPLETE AUDIT TRAIL: Every hold and release action is logged with user identity, timestamp, and audit remarks.', margin + 3, curY + 22);

  drawFooter(4);

  // ==========================================
  // PAGE 5: AMC CONTRACTS, EMERGENCY CALL-OUTS & SUMMARY
  // ==========================================
  doc.addPage();
  drawHeader(5, 'AMC Service Scheduling & Quick Reference');

  curY = 28;
  curY = sectionTitle('7. AMC CONTRACT SERVICE SCHEDULING (ACTUAL START MONTH CYCLE)', curY, '7');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, curY, contentWidth, 32, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, curY, contentWidth, 32, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text('DYNAMIC AMC 3-MONTH CYCLE RULES (NEVER FIXED JAN-MAR QUARTERS)', margin + 3, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateDark);
  doc.text('• START MONTH ANCHORING: Service 1 is anchored to the contract start month (e.g. Aug 15 start = Aug 15 Service 1).', margin + 3, curY + 10);
  doc.text('• 3-MONTH CADENCE: Next service = +3 calendar months (e.g. Aug 15 → Nov 15 → Feb 15 → May 15).', margin + 3, curY + 14);
  doc.text('• ACTUAL COMPLETION CASCADE: If completed on Aug 20, subsequent visit automatically shifts to Nov 20 (Actual + 3 mos).', margin + 3, curY + 18);
  doc.text('• RESCHEDULE AUDIT: Rescheduling preserves original scheduled date, logs reason, and records audit trail.', margin + 3, curY + 22);
  doc.text('• DASHBOARD CARDS: All active contracts display real-time service cycle, next date, days remaining, and OVERDUE alerts.', margin + 3, curY + 26);

  curY += 36;

  curY = sectionTitle('8. EMERGENCY CALL-OUT RAPID RESPONSE MODULE', curY, '8');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, curY, contentWidth, 27, 1.5, 1.5, 'F');
  doc.setDrawColor(...borderCol);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, curY, contentWidth, 27, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...navy);
  doc.text('24/7 RAPID RESPONSE WORKFLOW FOR CRITICAL FIRE DEFECTS', margin + 3, curY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...slateDark);
  doc.text('• LOGGING CALL: Log caller, site, system failure (pumps, alarms, leaks), priority (Critical, High, Medium, Low).', margin + 3, curY + 10);
  doc.text('• RAPID DISPATCH: Supervisor immediately assigns certified technician. Live status: Assigned → En Route → On Site.', margin + 3, curY + 14);
  doc.text('• ON-SITE RECTIFICATION: Replace ruptured fittings, clear panel ground faults, re-pressurize sprinkler manifolds.', margin + 3, curY + 18);
  doc.text('• EMERGENCY REPORT (ECR): Generates formal Civil Defence report with photos, customer signature, and GM sign-off.', margin + 3, curY + 22);

  curY += 31;

  curY = sectionTitle('9. QUICK REFERENCE: USER ROLE PERMISSIONS SUMMARY', curY, '9');

  // Summary Table
  const headers = ['User Role', 'View Jobs', 'Create Jobs', 'Prepare Reports', 'Review / Approve', 'Manage Finance'];
  const colW = [38, 25, 25, 32, 32, 30];

  doc.setFillColor(...navy);
  doc.rect(margin, curY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);

  let thX = margin;
  headers.forEach((h, i) => {
    doc.text(h, thX + 2, curY + 4.2);
    thX += colW[i];
  });
  curY += 6;

  const rows = [
    ['General Manager (GM)', 'All Jobs', 'Yes', 'Yes (All)', 'Final Approval', 'Full Financials'],
    ['Projects Manager', 'All Jobs', 'Yes', 'Yes (Projects/Supply)', 'Review Operational', 'View Budgets'],
    ['Engineer', 'All Jobs', 'Yes', 'Yes (Engineering/T&C)', 'Technical Sign-off', 'No Financials'],
    ['Supervisor', 'All Jobs', 'Yes', 'Yes (Work/Inspection)', 'Review Field Drafts', 'No Financials'],
    ['Technician', 'Assigned Only', 'No', 'Yes (Assigned Field)', 'Submit Draft Only', 'No Financials'],
    ['Sales Specialist', 'My / All', 'Yes', 'NO (Read-Only)', 'No Approval', 'Quotes / Pricing'],
    ['Accounts & Finance', 'All Jobs', 'No', 'NO (Read-Only)', 'No Approval', 'Invoices & Holds']
  ];

  rows.forEach((r, idx) => {
    const isAlt = idx % 2 === 1;
    doc.setFillColor(isAlt ? 245 : 255, isAlt ? 247 : 255, isAlt ? 250 : 255);
    doc.rect(margin, curY, contentWidth, 5.5, 'F');
    doc.setDrawColor(...borderCol);
    doc.setLineWidth(0.2);
    doc.line(margin, curY + 5.5, margin + contentWidth, curY + 5.5);

    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...slateDark);

    let tdX = margin;
    r.forEach((cell, i) => {
      if (cell.startsWith('NO')) {
        doc.setTextColor(...red);
        doc.setFont('helvetica', 'bold');
      } else if (cell.startsWith('Yes')) {
        doc.setTextColor(5, 150, 105);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(...slateDark);
        doc.setFont('helvetica', 'normal');
      }
      doc.text(cell, tdX + 2, curY + 3.8);
      tdX += colW[i];
    });

    curY += 5.5;
  });

  // Notice at bottom
  curY += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(...textMuted);
  doc.text('Note: In accordance with FIREX system updates, all hotline numbers have been removed from normal UI interfaces. Only official reports and company settings maintain formal contact information.', margin, curY);

  drawFooter(5);

  return doc;
}

const doc = createGuidePDF();

// 1. Save to public directory for static download
const publicPath = path.join(__dirname, 'public', 'FIREX_User_Roles_and_Jobs_Guide.pdf');
const rootPath = path.join(__dirname, 'FIREX_User_Roles_and_Jobs_Guide.pdf');
const brainPath = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\defede34-5da7-4cdd-b2e1-673bd45e8b88\\FIREX_User_Roles_and_Jobs_Guide.pdf';

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

fs.writeFileSync(publicPath, pdfBuffer);
console.log('Saved to public path:', publicPath);

fs.writeFileSync(rootPath, pdfBuffer);
console.log('Saved to root path:', rootPath);

try {
  fs.writeFileSync(brainPath, pdfBuffer);
  console.log('Saved to brain path:', brainPath);
} catch (e) {
  console.warn('Could not save to brain path:', e.message);
}

console.log('Successfully generated FIREX_User_Roles_and_Jobs_Guide.pdf!');
