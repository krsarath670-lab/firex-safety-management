import * as XLSX from 'xlsx';

/**
 * Auto-fit column widths based on cell content length
 */
function fitColumns(worksheet, data, headers) {
  const colWidths = headers.map(header => ({
    wch: Math.max(header.length + 3, 12)
  }));

  data.forEach(row => {
    headers.forEach((header, colIndex) => {
      const val = row[header];
      const strVal = val !== undefined && val !== null ? String(val) : '';
      if (strVal.length + 3 > colWidths[colIndex].wch) {
        colWidths[colIndex].wch = Math.min(strVal.length + 3, 40);
      }
    });
  });

  worksheet['!cols'] = colWidths;
}

/**
 * Helper to download worksheet as xlsx file in browser
 */
function saveWorkbook(workbook, filename) {
  XLSX.writeFile(workbook, filename, { bookType: 'xlsx', type: 'binary' });
}

/**
 * 11. EXCEL EXPORT - AMC
 */
export function exportAmcToExcel(amcList, filename = 'FIREX_AMC_Contracts.xlsx') {
  const rows = amcList.map(amc => {
    const visits = amc.visits || [];
    const completed = visits.filter(v => v.status === 'Completed').length;
    const remaining = Math.max(0, visits.length - completed);

    const amount = Number(amc.contract_value !== undefined ? amc.contract_value : (amc.amount || 0));
    const vatPercent = Number(amc.vat_percent !== undefined ? amc.vat_percent : 10);
    const vatAmount = Number(amc.vat_amount !== undefined ? amc.vat_amount : ((amount * vatPercent) / 100));
    const total = Number(amc.total_including_vat !== undefined ? amc.total_including_vat : (amount + vatAmount));

    return {
      'AMC Number': amc.contract_number || amc.id,
      'Customer Name': amc.customer_name || 'N/A',
      'Site Name': amc.site_name || 'N/A',
      'Sales Person': amc.sales_person_name || 'Unassigned',
      'Contract Start Date': amc.start_date || '',
      'Contract End Date': amc.end_date || '',
      'System Type': Array.isArray(amc.systems) ? amc.systems.join(', ') : (amc.system_type || 'Fire Protection'),
      'Contract Amount (Excl. VAT)': Number(amount.toFixed(3)),
      'VAT %': Number(vatPercent.toFixed(1)),
      'VAT Amount': Number(vatAmount.toFixed(3)),
      'Total Contract Value (Incl. VAT)': Number(total.toFixed(3)),
      'Total Visits Scheduled': visits.length,
      'Total Completed Visits': completed,
      'Total Remaining Visits': remaining,
      'Contract Status': amc.status || 'Active',
      'Notes': amc.notes || ''
    };
  });

  const headers = [
    'AMC Number',
    'Customer Name',
    'Site Name',
    'Sales Person',
    'Contract Start Date',
    'Contract End Date',
    'System Type',
    'Contract Amount (Excl. VAT)',
    'VAT %',
    'VAT Amount',
    'Total Contract Value (Incl. VAT)',
    'Total Visits Scheduled',
    'Total Completed Visits',
    'Total Remaining Visits',
    'Contract Status',
    'Notes'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'AMC Contracts');
  saveWorkbook(wb, filename);
}

/**
 * 12. EXCEL EXPORT - AMC MONTHLY SCHEDULE
 */
export function exportMonthlyScheduleToExcel(scheduleList, monthName = '', year = '', filename = 'FIREX_AMC_Monthly_Schedule.xlsx') {
  const rows = scheduleList.map(item => {
    return {
      'Date': item.scheduled_date || item.date || '',
      'Day': item.day || '',
      'Quarter': item.quarter || '',
      'AMC Number': item.contract_number || item.amc_number || '',
      'Customer Name': item.customer_name || 'N/A',
      'Site Name': item.site_name || 'N/A',
      'Sales Person': item.sales_person_name || 'Unassigned',
      'System': item.system || item.system_type || '',
      'Visit Number': item.visit_number || '',
      'Assigned Supervisor': item.supervisor_name || 'Unassigned',
      'Assigned Technician': item.technician_name || 'Unassigned',
      'Visit Status': item.status || 'Scheduled',
      'Report Status': item.report_status || (item.report_id ? 'Completed' : 'Pending')
    };
  });

  const headers = [
    'Date',
    'Day',
    'Quarter',
    'AMC Number',
    'Customer Name',
    'Site Name',
    'Sales Person',
    'System',
    'Visit Number',
    'Assigned Supervisor',
    'Assigned Technician',
    'Visit Status',
    'Report Status'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const sheetName = monthName ? `${monthName} ${year}`.trim().slice(0, 31) : 'Monthly Schedule';
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  saveWorkbook(wb, filename);
}

/**
 * 13. EXCEL EXPORT - JOBS
 */
export function exportJobsToExcel(jobsList, filename = 'FIREX_Jobs_List.xlsx') {
  const rows = jobsList.map(job => {
    const amount = Number(job.amount || 0);
    const vatPercent = Number(job.vat_percent !== undefined ? job.vat_percent : 10);
    const vatAmount = Number(job.vat_amount !== undefined ? job.vat_amount : ((amount * vatPercent) / 100));
    const total = Number(job.total_including_vat !== undefined ? job.total_including_vat : (amount + vatAmount));

    return {
      'Job Number': job.job_number || job.id,
      'Customer Name': job.customer_name || 'N/A',
      'Site Name': job.site_name || 'N/A',
      'Sales Person': job.sales_person_name || 'Unassigned',
      'Job Type': job.job_type || 'Job',
      'Assigned Date': job.created_at ? job.created_at.slice(0, 10) : (job.start_date || ''),
      'Due Date': job.due_date || job.target_date || '',
      'Priority': job.priority || 'Medium',
      'Status': job.status || 'Pending',
      'Assigned Supervisor': job.supervisor_name || 'Unassigned',
      'Assigned Technician': job.technician_name || 'Unassigned',
      'Amount (Excl. VAT)': Number(amount.toFixed(3)),
      'VAT %': Number(vatPercent.toFixed(1)),
      'VAT Amount': Number(vatAmount.toFixed(3)),
      'Total Amount (Incl. VAT)': Number(total.toFixed(3)),
      'Payment Status': job.payment_status || 'Pending'
    };
  });

  const headers = [
    'Job Number',
    'Customer Name',
    'Site Name',
    'Sales Person',
    'Job Type',
    'Assigned Date',
    'Due Date',
    'Priority',
    'Status',
    'Assigned Supervisor',
    'Assigned Technician',
    'Amount (Excl. VAT)',
    'VAT %',
    'VAT Amount',
    'Total Amount (Incl. VAT)',
    'Payment Status'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
  saveWorkbook(wb, filename);
}

/**
 * 14. EXCEL EXPORT - FIT-OUT
 */
export function exportFitoutToExcel(fitoutsList, filename = 'FIREX_Fitout_Jobs.xlsx') {
  const rows = fitoutsList.map(item => {
    const amount = Number(item.amount || 0);
    const vatPercent = Number(item.vat_percent !== undefined ? item.vat_percent : 10);
    const vatAmount = Number(item.vat_amount !== undefined ? item.vat_amount : ((amount * vatPercent) / 100));
    const total = Number(item.total_including_vat !== undefined ? item.total_including_vat : (amount + vatAmount));

    return {
      'Fit-out Number / Job Number': item.job_number || item.id,
      'Customer Name': item.customer_name || 'N/A',
      'Site Name': item.site_name || 'N/A',
      'Sales Person': item.sales_person_name || 'Unassigned',
      'Scope of Work': item.title || item.description || 'Fit-out Works',
      'Start Date': item.start_date || (item.created_at ? item.created_at.slice(0, 10) : ''),
      'Completion / Due Date': item.due_date || item.target_date || '',
      'Status': item.status || 'Pending',
      'Assigned Supervisor': item.supervisor_name || 'Unassigned',
      'Assigned Technician': item.technician_name || 'Unassigned',
      'Amount (Excl. VAT)': Number(amount.toFixed(3)),
      'VAT %': Number(vatPercent.toFixed(1)),
      'VAT Amount': Number(vatAmount.toFixed(3)),
      'Total Amount (Incl. VAT)': Number(total.toFixed(3)),
      'Payment Status': item.payment_status || 'Pending'
    };
  });

  const headers = [
    'Fit-out Number / Job Number',
    'Customer Name',
    'Site Name',
    'Sales Person',
    'Scope of Work',
    'Start Date',
    'Completion / Due Date',
    'Status',
    'Assigned Supervisor',
    'Assigned Technician',
    'Amount (Excl. VAT)',
    'VAT %',
    'VAT Amount',
    'Total Amount (Incl. VAT)',
    'Payment Status'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fit-outs');
  saveWorkbook(wb, filename);
}

/**
 * 15. EXCEL EXPORT - PROJECT
 */
export function exportProjectToExcel(projectsList, filename = 'FIREX_Projects_List.xlsx') {
  const rows = projectsList.map(proj => {
    const amount = Number(proj.amount || 0);
    const vatPercent = Number(proj.vat_percent !== undefined ? proj.vat_percent : 10);
    const vatAmount = Number(proj.vat_amount !== undefined ? proj.vat_amount : ((amount * vatPercent) / 100));
    const total = Number(proj.total_including_vat !== undefined ? proj.total_including_vat : (amount + vatAmount));

    return {
      'Project Number / Job Number': proj.job_number || proj.id,
      'Customer Name': proj.customer_name || 'N/A',
      'Site Name': proj.site_name || 'N/A',
      'Sales Person': proj.sales_person_name || 'Unassigned',
      'Scope / Project Title': proj.title || proj.description || 'Project Execution',
      'Start Date': proj.start_date || (proj.created_at ? proj.created_at.slice(0, 10) : ''),
      'Target Date': proj.due_date || proj.target_date || '',
      'Status': proj.status || 'Pending',
      'Assigned Supervisor': proj.supervisor_name || 'Unassigned',
      'Assigned Technician': proj.technician_name || 'Unassigned',
      'Amount (Excl. VAT)': Number(amount.toFixed(3)),
      'VAT %': Number(vatPercent.toFixed(1)),
      'VAT Amount': Number(vatAmount.toFixed(3)),
      'Total Amount (Incl. VAT)': Number(total.toFixed(3)),
      'Payment Status': proj.payment_status || 'Pending'
    };
  });

  const headers = [
    'Project Number / Job Number',
    'Customer Name',
    'Site Name',
    'Sales Person',
    'Scope / Project Title',
    'Start Date',
    'Target Date',
    'Status',
    'Assigned Supervisor',
    'Assigned Technician',
    'Amount (Excl. VAT)',
    'VAT %',
    'VAT Amount',
    'Total Amount (Incl. VAT)',
    'Payment Status'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Projects');
  saveWorkbook(wb, filename);
}

/**
 * 16. EXCEL EXPORT - INVOICES MASTER
 */
export function exportInvoicesToExcel(invoicesList, filename = 'FIREX_Invoices_Master.xlsx') {
  const rows = invoicesList.map(inv => {
    const amountBeforeVat = Number(inv.amount_before_vat || 0);
    const vatPercent = Number(inv.vat_percent !== undefined ? inv.vat_percent : 10);
    const vatAmount = Number(inv.vat_amount || ((amountBeforeVat * vatPercent) / 100));
    const totalAmount = Number(inv.total_amount || (amountBeforeVat + vatAmount));
    const amountPaid = Number(inv.amount_paid || 0);
    const balance = Number(inv.outstanding_balance !== undefined ? inv.outstanding_balance : (totalAmount - amountPaid));

    return {
      'Invoice #': inv.invoice_number,
      'Customer Name': inv.customer_name || 'N/A',
      'Site / Location': inv.site_name || 'N/A',
      'Reference (Job/AMC)': inv.job_number || inv.amc_number || 'Direct',
      'Sales Person': inv.sales_person_name || 'Unassigned',
      'Invoice Date': inv.invoice_date || '',
      'Due Date': inv.due_date || '',
      'Amount Before VAT (BHD)': Number(amountBeforeVat.toFixed(3)),
      'VAT Rate (%)': Number(vatPercent.toFixed(1)),
      'VAT Amount (BHD)': Number(vatAmount.toFixed(3)),
      'Total Amount (BHD)': Number(totalAmount.toFixed(3)),
      'Amount Paid (BHD)': Number(amountPaid.toFixed(3)),
      'Outstanding Balance (BHD)': Number(balance.toFixed(3)),
      'Payment Status': inv.payment_status || 'Pending',
      'Days Overdue': inv.days_overdue || 0,
      'Hold Status': inv.hold_status || 'Active',
      'Description / Scope': inv.description || ''
    };
  });

  const headers = [
    'Invoice #',
    'Customer Name',
    'Site / Location',
    'Reference (Job/AMC)',
    'Sales Person',
    'Invoice Date',
    'Due Date',
    'Amount Before VAT (BHD)',
    'VAT Rate (%)',
    'VAT Amount (BHD)',
    'Total Amount (BHD)',
    'Amount Paid (BHD)',
    'Outstanding Balance (BHD)',
    'Payment Status',
    'Days Overdue',
    'Hold Status',
    'Description / Scope'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoices Master');
  saveWorkbook(wb, filename);
}

/**
 * 17. EXCEL EXPORT - PAYMENT RECEIPTS
 */
export function exportPaymentsToExcel(paymentsList, filename = 'FIREX_Payment_Receipts.xlsx') {
  const rows = paymentsList.map(p => ({
    'Receipt #': p.payment_number,
    'Invoice #': p.invoice_number,
    'Customer Name': p.customer_name || 'N/A',
    'Payment Date': p.payment_date || '',
    'Amount Paid (BHD)': Number((Number(p.amount) || 0).toFixed(3)),
    'Payment Method': p.payment_method || 'Bank Transfer',
    'Reference #': p.reference_number || 'N/A',
    'Received By': p.received_by || 'Accounts',
    'Remarks': p.remarks || ''
  }));

  const headers = [
    'Receipt #',
    'Invoice #',
    'Customer Name',
    'Payment Date',
    'Amount Paid (BHD)',
    'Payment Method',
    'Reference #',
    'Received By',
    'Remarks'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payment Receipts');
  saveWorkbook(wb, filename);
}

/**
 * 18. EXCEL EXPORT - CUSTOMER STATEMENT
 */
export function exportCustomerStatementToExcel(statement, filename = 'FIREX_Customer_Statement.xlsx') {
  const customer = statement.customer || {};
  const rows = (statement.ledger || []).map(row => ({
    'Date': row.date,
    'Transaction Type': row.type,
    'Reference #': row.reference,
    'Description': row.description,
    'Debit (BHD)': Number((Number(row.debit) || 0).toFixed(3)),
    'Credit (BHD)': Number((Number(row.credit) || 0).toFixed(3)),
    'Running Balance (BHD)': Number((Number(row.running_balance) || 0).toFixed(3)),
    'Status': row.status
  }));

  const headers = [
    'Date',
    'Transaction Type',
    'Reference #',
    'Description',
    'Debit (BHD)',
    'Credit (BHD)',
    'Running Balance (BHD)',
    'Status'
  ];

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  fitColumns(ws, rows, headers);
  ws['!views'] = [{ state: 'frozen', ySplit: 1 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Statement - ${customer.name?.slice(0, 20) || 'Account'}`);
  saveWorkbook(wb, filename);
}
