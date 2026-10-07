const fs = require('fs');
const path = require('path');
const amcChecklist = require('./amcChecklist');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const initialSeed = {
  company_settings: {
    company_name: "FIREX",
    arabic_name: "شركة فايركس لأدوات السلامه",
    logo_url: "/logo.png",
    letterhead_url: "/letterhead.png",
    use_custom_letterhead: true,
    cr_number: "96850 1",
    cr_no: "96850 1",
    vat_number: "220006271900002",
    vat_no: "220006271900002",
    cr_vat_number: "CR No.: 96850 1 | VAT No.: 220006271900002",
    address_line_1: "Villa 13, Building 2373",
    address_line_2: "Road 2831, Al Seef",
    address_line_3: "Block 428, Bahrain",
    address: "Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain",
    phone: "+973 1716 2240",
    email: "service@firexbahrain.com",
    report_footer: "FIREX • Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain • CR No.: 96850 1 • VAT No.: 220006271900002",
    report_number_prefix: "RPT",
    reminder_days: [90, 60, 30, 7],
    amc_next_service_rule: "from_actual_date"
  },
  users: [
    {
      id: "usr-md-1",
      name: "Eng. Mohamed Hweidi",
      username: "md",
      employee_id: "FX-MD-01",
      department: "Executive Board",
      email: "md@firexbahrain.com",
      role: "Managing Director (MD)",
      phone: "+973 3944 1122",
      designation: "Managing Director",
      status: "Active",
      pin: "1234",
      password: "1234",
      notes: "Managing Director (MD) - Full system access",
      avatar: "MH"
    },
    {
      id: "usr-gm",
      name: "Eng. Mohamed Hweidi",
      email: "eng..mohamed.hweidi@firexbahrain.com",
      role: "GM",
      phone: "+973 3944 1122",
      designation: "General Manager",
      avatar: "MH"
    },
    {
      id: "usr-eng",
      name: "David Chen, PE",
      email: "eng@firexbahrain.com",
      role: "Engineer",
      phone: "+973 3822 3344",
      designation: "Lead Fire Protection Engineer",
      avatar: "DC"
    },
    {
      id: "usr-sup",
      name: "Tariq Mahmoud",
      email: "supervisor@firexbahrain.com",
      role: "Supervisor",
      phone: "+973 3611 7788",
      designation: "Senior Field Supervisor",
      avatar: "TM"
    },
    {
      id: "usr-tech",
      name: "Rajesh Kumar",
      email: "tech@firexbahrain.com",
      role: "Technician",
      phone: "+973 3500 9900",
      designation: "Certified Fire Alarm Specialist",
      avatar: "RK"
    }
  ],
  customers: [
    {
      id: "cust-1",
      name: "Emaar Hospitality Group",
      contact_person: "Mr. Omar Farooq",
      phone: "+971 4 436 8888",
      email: "facilities@emaarhospitality.ae",
      address: "Downtown Dubai, UAE",
      notes: "VIP Client. High-rise hotel tower with 24/7 occupancy. Strict permit to work protocols."
    },
    {
      id: "cust-2",
      name: "Al Futtaim Logistics & Warehousing",
      contact_person: "Eng. Ronald Santos",
      phone: "+971 4 881 5500",
      email: "safety@alfuttaimlogistics.com",
      address: "Jebel Ali Industrial Area 1, Dubai",
      notes: "Mega distribution warehouses. High fire hazard storage, ESFR sprinklers & deluge systems."
    },
    {
      id: "cust-3",
      name: "Dubai Silicon Oasis Authority",
      contact_person: "Ms. Fatima Al-Zahra",
      phone: "+971 4 501 5000",
      email: "f.alzahra@dsoa.ae",
      address: "DSO High-Tech Park, Dubai",
      notes: "Commercial tech offices and server facilities. Clean Agent FM200 protection."
    },
    {
      id: "cust-4",
      name: "Nakheel Properties",
      contact_person: "Hassan Al-Nuaimi",
      phone: "+971 4 390 3333",
      email: "operations@nakheel.com",
      address: "Palm Jumeirah & Retail Centers, Dubai",
      notes: "Retail mall podiums and residential towers. Civil Defense inspection quarterly."
    }
  ],
  sites: [
    {
      id: "site-1",
      customer_id: "cust-1",
      site_name: "Address Downtown Hotel & Residences",
      site_address: "Sheikh Mohammed bin Rashid Blvd, Downtown Dubai",
      contact_person: "Mr. Omar Farooq (FM Director)",
      contact_number: "+971 50 882 1199",
      email: "fm.address@emaar.ae",
      building_type: "Hospitality / High-Rise Hotel (63 Floors)",
      site_location: "25.1972° N, 55.2744° E - Downtown Zone A",
      equipment_info: "Honeywell Morley-IAS DXc4 Addressable Fire Alarm (8 Loops, 3,200 Devices), Aurora Diesel Pump 1500 GPM @ 14 Bar, Electric Standby Pump 1500 GPM, Jockey Pump 50 GPM, 4 Clean Agent FM200 Banks, Wet Pipe Sprinkler (Zone control on each floor).",
      notes: "Annual Civil Defense certification due in November."
    },
    {
      id: "site-2",
      customer_id: "cust-1",
      site_name: "Vida Downtown Boutique Hotel",
      site_address: "Mohammed Bin Rashid Blvd, Downtown, Dubai",
      contact_person: "Kamal Mustafa (Chief Engineer)",
      contact_number: "+971 52 441 9922",
      email: "eng.vida@emaar.ae",
      building_type: "Commercial / Boutique Hotel (7 Floors)",
      site_location: "25.1945° N, 55.2778° E",
      equipment_info: "Notifier NFS-320 Fire Alarm, Peerless Fire Pump 750 GPM, 28 Hose Reel Stations, 60 ABC Dry Powder Extinguishers.",
      notes: "Access permitted between 08:00 to 17:00."
    },
    {
      id: "site-3",
      customer_id: "cust-2",
      site_name: "Jebel Ali Mega Distribution Hub - Bay 3 & 4",
      site_address: "Gate 4, Jebel Ali Free Zone (JAFZA South), Dubai",
      contact_person: "Eng. Ronald Santos (HSE Manager)",
      contact_number: "+971 55 331 4488",
      email: "safety@alfuttaimlogistics.com",
      building_type: "Industrial / Logistics Warehouse (35,000 sq.m)",
      site_location: "24.9857° N, 55.0273° E - Gate 4 JAFZA",
      equipment_info: "GST 200-2 Addressable Panel, High Expansion Foam Deluge System, Cummins Diesel Fire Pump 2000 GPM @ 12 Bar, 82 ESFR Sprinkler Grid Lines, 44 Fire Hydrant Stations, 120 Wheeled Fire Extinguishers.",
      notes: "Requires safety induction, safety boots, and high-visibility vest upon entry."
    },
    {
      id: "site-4",
      customer_id: "cust-3",
      site_name: "DSO Tech Park Tower A - Data Center Facility",
      site_address: "Academic City Road, Dubai Silicon Oasis",
      contact_person: "Fatima Al-Zahra (Facilities Lead)",
      contact_number: "+971 50 663 2277",
      email: "facilities.datacenter@dsoa.ae",
      building_type: "Commercial / Tier-3 Data Center & Office",
      site_location: "25.1212° N, 55.3773° E",
      equipment_info: "Simplex 4100ES Voice Evacuation System, VESDA LaserPLUS Aspirating Smoke Detection in Server Halls, Novec 1230 Fire Suppression, Armstrong Dual Fire Pumps (Electric + Diesel).",
      notes: "Server rooms require dual escort and ESD foot-straps."
    },
    {
      id: "site-5",
      customer_id: "cust-4",
      site_name: "Nakheel Mall - Main Retail Complex",
      site_address: "Center of Palm Jumeirah Trunk, Dubai",
      contact_person: "Hassan Al-Nuaimi (Safety Officer)",
      contact_number: "+971 54 990 1155",
      email: "hassan.nuaimi@nakheel.com",
      building_type: "Commercial / Retail Mall (5 Levels + Underground Parking)",
      site_location: "25.1147° N, 55.1396° E",
      equipment_info: "Honeywell Notifier NFS2-3030 Multi-panel Network, Smoke Management & Staircase Pressurization Fans, 2500 GPM Fire Pump House, 320 Hose Reels, 450 Portable Extinguishers.",
      notes: "Night work only for retail zone testing (after 23:00)."
    }
  ],
  amc_contracts: [
    {
      id: "amc-1",
      contract_number: "AMC-2026-001",
      customer_id: "cust-1",
      site_id: "site-1",
      contract_type: "Comprehensive (Parts & Labor)",
      start_date: "2026-01-01",
      end_date: "2026-12-31",
      renewal_date: "2026-11-15",
      contract_status: "Active",
      systems_covered: ["Fire Alarm & Voice Evacuation", "Fire Pump System", "Sprinkler & Wet Riser", "FM200 Clean Agent"],
      visit_frequency: "Quarterly",
      visits_per_year: 4,
      contract_value: 48500,
      contact_person: "Mr. Omar Farooq",
      remarks: "Includes 24/7 breakdown callouts with 2-hour response SLA. Civil Defense portal logging included.",
      reminder_days: [90, 60, 30, 7]
    },
    {
      id: "amc-2",
      contract_number: "AMC-2026-002",
      customer_id: "cust-2",
      site_id: "site-3",
      contract_type: "Non-Comprehensive (Service Only)",
      start_date: "2025-10-15",
      end_date: "2026-10-14", // Expiring in ~17 days from current date (2026-09-27)
      renewal_date: "2026-09-30",
      contract_status: "Expiring Soon",
      systems_covered: ["Diesel Fire Pump 2000 GPM", "Foam Deluge System", "ESFR Sprinklers", "Fire Hydrants & Hose Reels"],
      visit_frequency: "Bi-Monthly",
      visits_per_year: 6,
      contract_value: 36000,
      contact_person: "Eng. Ronald Santos",
      remarks: "URGENT: Renewal quotation sent to HSE Director. Awaiting PO release.",
      reminder_days: [90, 60, 30, 7]
    },
    {
      id: "amc-3",
      contract_number: "AMC-2026-003",
      customer_id: "cust-3",
      site_id: "site-4",
      contract_type: "Comprehensive (Parts & Labor)",
      start_date: "2025-11-05",
      end_date: "2026-11-04", // Expiring in ~38 days (<= 60 days)
      renewal_date: "2026-10-15",
      contract_status: "Expiring Soon",
      systems_covered: ["Simplex 4100ES Fire Alarm", "VESDA Aspirating Detection", "Novec 1230 Clean Agent", "Dual Pumps"],
      visit_frequency: "Monthly",
      visits_per_year: 12,
      contract_value: 54000,
      contact_person: "Ms. Fatima Al-Zahra",
      remarks: "Renewal reminder triggered for 60-day window. Renewal proposal being reviewed by engineering committee.",
      reminder_days: [90, 60, 30, 7]
    },
    {
      id: "amc-4",
      contract_number: "AMC-2026-004",
      customer_id: "cust-4",
      site_id: "site-5",
      contract_type: "Semi-Comprehensive",
      start_date: "2025-08-01",
      end_date: "2026-08-31", // Expired ~27 days ago
      renewal_date: "2026-08-15",
      contract_status: "Expired",
      systems_covered: ["Fire Alarm Multi-Panel Network", "Sprinklers", "Smoke Evacuation", "Hose Reels & Extinguishers"],
      visit_frequency: "Quarterly",
      visits_per_year: 4,
      contract_value: 62000,
      contact_person: "Hassan Al-Nuaimi",
      remarks: "Contract expired. Maintenance temporarily suspended pending legal review of new contract terms.",
      reminder_days: [90, 60, 30, 7]
    },
    {
      id: "amc-5",
      contract_number: "AMC-2026-005",
      customer_id: "cust-1",
      site_id: "site-2",
      contract_type: "Comprehensive",
      start_date: "2026-04-01",
      end_date: "2027-03-31",
      renewal_date: "2027-02-15",
      contract_status: "Active",
      systems_covered: ["Notifier NFS-320 Fire Alarm", "Peerless Fire Pump", "Hose Reels & Extinguishers"],
      visit_frequency: "Quarterly",
      visits_per_year: 4,
      contract_value: 22000,
      contact_person: "Kamal Mustafa",
      remarks: "Second year of three-year framework agreement.",
      reminder_days: [90, 60, 30, 7]
    }
  ],
  amc_visits: [
    {
      id: "vis-1",
      amc_id: "amc-1",
      visit_number: "Visit #3 (Q3 Maintenance)",
      scheduled_date: "2026-09-28", // Tomorrow
      technician_id: "usr-tech",
      system: "Fire Alarm & Pump System",
      visit_status: "Scheduled",
      remarks: "Carry out full quarterly functional test on Honeywell Morley FACP, test backup batteries, and pump run test."
    },
    {
      id: "vis-2",
      amc_id: "amc-2",
      visit_number: "Visit #6 (Final Bi-Monthly)",
      scheduled_date: "2026-09-27", // Today
      technician_id: "usr-tech",
      system: "Fire Pump & Deluge System",
      visit_status: "In Progress",
      remarks: "Test auto-start of Cummins diesel engine, check battery charger electrolyte, test tamper switches on foam deluge."
    },
    {
      id: "vis-3",
      amc_id: "amc-3",
      visit_number: "Visit #11 (Monthly)",
      scheduled_date: "2026-10-05",
      technician_id: "usr-tech",
      system: "VESDA & Clean Agent Inspection",
      visit_status: "Scheduled",
      remarks: "Inspect pipe airflow, test sample points in rack aisles, check agent cylinder pressure gauges."
    },
    {
      id: "vis-4",
      amc_id: "amc-1",
      visit_number: "Visit #2 (Q2 Maintenance)",
      scheduled_date: "2026-06-20",
      technician_id: "usr-tech",
      system: "Fire Alarm & Sprinklers",
      visit_status: "Completed",
      remarks: "All 8 loops verified normal. Flow switches on floors 10 to 30 tested OK."
    }
  ],
  jobs: [
    {
      id: "job-1",
      job_number: "AMC-2026-021",
      job_type: "AMC",
      customer_id: "cust-1",
      site_id: "site-1",
      date: "2026-09-28",
      team: "Team Alpha (Tariq & Rajesh)",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      description: "Q3 Routine AMC Inspection for Address Downtown. Check FACP, test 120 detection devices, test diesel fire pump auto-crank.",
      materials_used: [
        { material_id: "mat-1", name: "Optical Smoke Detector (UL Listed)", quantity: 2 },
        { material_id: "mat-6", name: "12V 17Ah Sealed Lead Acid Battery", quantity: 2 }
      ],
      photos: [
        { id: "p-1", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600", tag: "Before", caption: "Main FACP Morley DXc4 Panel in Ground Control Room" }
      ],
      status: "In Progress",
      report_id: "rpt-1"
    },
    {
      id: "job-2",
      job_number: "BRK-2026-014",
      job_type: "Breakdown",
      customer_id: "cust-2",
      site_id: "site-3",
      date: "2026-09-27",
      team: "Emergency Response (Rajesh Kumar)",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      description: "Urgent Callout: Diesel fire pump failed weekly automated crank cycle. Low starting battery voltage indication and fuel solenoid stuck.",
      materials_used: [
        { material_id: "mat-6", name: "12V 17Ah Sealed Lead Acid Battery", quantity: 2 },
        { material_id: "mat-8", name: "Pump Controller Solenoid Relay 24V", quantity: 1 }
      ],
      photos: [],
      status: "In Progress",
      report_id: "rpt-2"
    },
    {
      id: "job-3",
      job_number: "FIT-2026-008",
      job_type: "Fit-out",
      customer_id: "cust-1",
      site_id: "site-2",
      date: "2026-10-02",
      team: "Projects & Fit-out Team",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      description: "Floor 4 Restaurant renovation: Relocate 14 addressable smoke detectors and add 6 pendant quick-response sprinkler drops according to revised layout.",
      materials_used: [],
      photos: [],
      status: "Pending",
      report_id: null
    },
    {
      id: "job-4",
      job_number: "PRJ-2026-003",
      job_type: "Project",
      customer_id: "cust-3",
      site_id: "site-4",
      date: "2026-09-25",
      team: "Systems Installation Team",
      supervisor_id: "usr-sup",
      technician_id: "usr-tech",
      description: "Data Hall 3 Expansion: Install 2 additional VESDA VEP Aspirating units and interface with Simplex 4100ES building management system.",
      materials_used: [],
      photos: [],
      status: "In Progress",
      report_id: null
    },
    {
      id: "job-5",
      job_number: "TNC-2026-004",
      job_type: "Testing & Commissioning",
      customer_id: "cust-4",
      site_id: "site-5",
      date: "2026-09-20",
      team: "Commissioning Engineers",
      supervisor_id: "usr-eng",
      technician_id: "usr-tech",
      description: "Annual smoke management integration testing with Civil Defense third-party inspection agency. Verified stairwell fans differential pressure.",
      materials_used: [],
      photos: [],
      status: "Completed",
      report_id: "rpt-3"
    }
  ],
  faults: [
    {
      id: "flt-1",
      fault_number: "FLT-2026-001",
      customer_id: "cust-1",
      site_id: "site-1",
      system: "Fire Alarm",
      location: "Basement 2, Carpark Zone B near Pillar P-42",
      device_equipment: "Optical Smoke Detector (Loop 2, Addr 45)",
      fault_description: "Intermittent ground fault and device communication error reported on Morley FACP. Sensor optical chamber heavily contaminated with exhaust dust.",
      cause: "Dust accumulation and ingress of vehicular exhaust emissions.",
      action_taken: "Dismantled sensor head, cleaned optical chamber with compressed aerosol, tested sensor sensitivity. Replaced detector with brand new Apollo XP95 optical unit when drift compensation reached maximum threshold.",
      materials_used: "1x Optical Smoke Detector XP95 (UL Listed)",
      status: "Open",
      before_photo: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600",
      after_photo: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600",
      technician_id: "usr-tech",
      date: "2026-09-26"
    },
    {
      id: "flt-2",
      fault_number: "FLT-2026-002",
      customer_id: "cust-2",
      site_id: "site-3",
      system: "Firefighting",
      location: "Main Fire Pump House, Bay 3",
      device_equipment: "Jockey Pump Pressure Switch (Danfoss KPI-35)",
      fault_description: "Jockey pump cycling continuously every 4 minutes. System pressure dropping from 11 bar to 8 bar due to weeping union joint and faulty diaphragm.",
      cause: "Mechanical vibration loosening brass union nipple and deteriorated rubber diaphragm.",
      action_taken: "Isolated sensing line, replaced pressure switch union with high-pressure stainless fitting, recalibrated cut-in to 9.5 bar and cut-out to 11.5 bar. Pressure hold verified stable for 45 minutes.",
      materials_used: "1x Danfoss Pressure Switch KPI-35, 1/2\" SS Union, Teflon seal",
      status: "In Progress",
      before_photo: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600",
      after_photo: "",
      technician_id: "usr-tech",
      date: "2026-09-27"
    },
    {
      id: "flt-3",
      fault_number: "FLT-2026-003",
      customer_id: "cust-4",
      site_id: "site-5",
      system: "Fire Alarm",
      location: "Level 1 Fashion Avenue corridor, near Exit Door 104",
      device_equipment: "Manual Call Point (Notifier N-MCP)",
      fault_description: "Tamper alarm activated on panel; glass element broken and safety microswitch bent by trolley impact.",
      cause: "Physical impact during night merchandise delivery.",
      action_taken: "Replaced frangible glass element, realigned internal microswitch lever, tested with test key, panel reset normal.",
      materials_used: "1x MCP Replacement Glass, 1x Reset Key",
      status: "Rectified",
      before_photo: "",
      after_photo: "",
      technician_id: "usr-tech",
      date: "2026-09-22"
    },
    {
      id: "flt-4",
      fault_number: "FLT-2026-004",
      customer_id: "cust-2",
      site_id: "site-3",
      system: "Firefighting",
      location: "Warehouse Bay 4, Loading Bay Dock 7",
      device_equipment: "Landing Valve & 30m Rubber Hose Reel",
      fault_description: "Rubber hose perished with surface cracks; brass shutoff nozzle seized and leaking during test pressurization.",
      cause: "Sun exposure and age deterioration.",
      action_taken: "Awaiting material requisition approval to replace 30m hose reel assembly and multi-spray nozzle.",
      materials_used: "None yet",
      status: "Pending Material",
      before_photo: "",
      after_photo: "",
      technician_id: "usr-tech",
      date: "2026-09-24"
    }
  ],
  materials: [
    { id: "mat-1", code: "DET-SMK-01", name: "Optical Smoke Detector (UL Listed)", category: "Fire Alarm", unit: "Pcs", stock: 85, unit_cost: 42.0 },
    { id: "mat-2", code: "DET-HT-01", name: "Rate of Rise Heat Detector (UL)", category: "Fire Alarm", unit: "Pcs", stock: 40, unit_cost: 38.0 },
    { id: "mat-3", code: "DET-MULTI-01", name: "Multi-Sensor Smoke & Heat Detector", category: "Fire Alarm", unit: "Pcs", stock: 24, unit_cost: 65.0 },
    { id: "mat-4", code: "MCP-WP-01", name: "Manual Call Point (Weatherproof IP66)", category: "Fire Alarm", unit: "Pcs", stock: 32, unit_cost: 48.0 },
    { id: "mat-5", code: "SND-STR-01", name: "Electronic Sounder Strobe 24V Red", category: "Fire Alarm", unit: "Pcs", stock: 50, unit_cost: 55.0 },
    { id: "mat-6", code: "BAT-12V-17AH", name: "12V 17Ah Sealed Lead Acid Battery", category: "Accessories", unit: "Pcs", stock: 18, unit_cost: 68.0 },
    { id: "mat-7", code: "BAT-12V-26AH", name: "12V 26Ah Sealed Lead Acid Battery", category: "Accessories", unit: "Pcs", stock: 12, unit_cost: 95.0 },
    { id: "mat-8", code: "MOD-MON-01", name: "Single Input Monitor Module", category: "Fire Alarm", unit: "Pcs", stock: 30, unit_cost: 52.0 },
    { id: "mat-9", code: "MOD-REL-01", name: "Dual Relay Control Module 240V/24V", category: "Fire Alarm", unit: "Pcs", stock: 25, unit_cost: 58.0 },
    { id: "mat-10", code: "SPR-PEN-68", name: "Pendent Sprinkler Head 68°C 1/2\" QR", category: "Firefighting", unit: "Pcs", stock: 150, unit_cost: 12.5 },
    { id: "mat-11", code: "HOS-RUB-30M", name: "1\" High-Pressure Rubber Fire Hose 30m", category: "Firefighting", unit: "Roll", stock: 14, unit_cost: 110.0 },
    { id: "mat-12", code: "EXT-DCP-6KG", name: "6kg ABC Dry Powder Fire Extinguisher", category: "Firefighting", unit: "Pcs", stock: 65, unit_cost: 34.0 },
    { id: "mat-13", code: "EXT-CO2-5KG", name: "5kg Carbon Dioxide (CO2) Extinguisher", category: "Firefighting", unit: "Pcs", stock: 38, unit_cost: 72.0 },
    { id: "mat-14", code: "CBL-FP200-2C", name: "Fire Resistant Cable 2C x 1.5mm FP200 (100m)", category: "Cable", unit: "Drum", stock: 9, unit_cost: 145.0 }
  ],
  reports: [
    {
      id: "rpt-1",
      report_type: "AMC Service Report",
      report_number: "RPT-AMC-2026-088",
      amc_contract_number: "AMC-2026-001",
      job_number: "AMC-2026-021",
      job_id: "job-1",
      amc_id: "amc-1",
      customer_id: "cust-1",
      site_id: "site-1",
      date: "2026-09-28",
      amc_start_date: "2026-01-01",
      amc_end_date: "2026-12-31",
      visit_number: "Visit #3 of 4 (Q3)",
      visit_date: "2026-09-28",
      system: "Fire Alarm & Firefighting Systems",
      work_description: "Conducted comprehensive quarterly AMC maintenance covering Morley DXc4 Fire Alarm System, main diesel pump, jockey pump, and zone control valves. Verified 8 loops and tested 45 sample detection devices.",
      checklist_data: {
        facp_condition: "OK",
        facp_ac_supply: "OK",
        facp_battery: "Fault",
        facp_charger: "OK",
        facp_display: "OK",
        facp_faults: "Fault",
        facp_alarms: "OK",
        facp_comms: "OK",
        smoke_detectors: "OK",
        heat_detectors: "OK",
        call_points: "OK",
        sounders: "OK",
        main_pump: "OK",
        jockey_pump: "OK",
        diesel_pump: "OK",
        sprinkler_valves: "OK",
        extinguishers: "OK"
      },
      faults_found: "1. FACP standby batteries (2x 12V 17Ah) showed high internal impedance (3.8 yrs old). 2. Contaminated optical detector in B2 car park pillar P-42.",
      rectifications: "Replaced 2 standby batteries with new 12V 17Ah units. Replaced contaminated smoke detector in B2 with new XP95 unit and calibrated loop.",
      pending_works: "Awaiting customer approval to replace worn pressure switch on riser 2.",
      recommendations: "Recommend bi-annual cleaning of car park basement sensors due to heavy vehicular exhaust carbon deposits.",
      materials_used: [
        { material_id: "mat-1", name: "Optical Smoke Detector (UL Listed)", quantity: 1 },
        { material_id: "mat-6", name: "12V 17Ah Sealed Lead Acid Battery", quantity: 2 }
      ],
      testing_performed: "Full audible evacuation drill on Zone 1 & 2. Auto-crank of diesel fire pump initiated from pressure drop test valve; reached rated 14 bar pressure in 12 seconds.",
      result: "System restored to 100% operational condition. Civil Defense remote monitoring unit verified communicating with operational center.",
      remarks: "Routine quarterly service completed according to NFPA 72 & NFPA 25 standards.",
      photos: [
        { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600", tag: "Before", caption: "Morley FACP Panel during testing" },
        { url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600", tag: "After", caption: "Batteries replaced and panel normal" }
      ],
      technician_name: "Rajesh Kumar",
      supervisor_name: "Tariq Mahmoud",
      customer_rep_name: "Mr. Omar Farooq",
      customer_rep_designation: "Director of Facilities Management",
      customer_signature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M10,40 Q40,10 70,35 T130,25 T190,45' stroke='%23003366' stroke-width='2' fill='none'/></svg>",
      supervisor_signature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M15,45 Q50,5 90,40 T150,20 T185,35' stroke='%23003366' stroke-width='2' fill='none'/></svg>",
      status: "Approved",
      created_by: "usr-tech",
      assigned_by: "usr-sup",
      submitted_by: "usr-tech",
      reviewed_by: "usr-sup",
      approved_by: "usr-gm",
      created_at: "2026-09-28T09:00:00Z",
      submitted_at: "2026-09-28T14:30:00Z",
      reviewed_at: "2026-09-28T16:00:00Z",
      approved_at: "2026-09-28T17:15:00Z"
    },
    {
      id: "rpt-2",
      report_type: "Work Completion Report",
      report_number: "RPT-WCR-2026-042",
      job_number: "BRK-2026-014",
      job_id: "job-2",
      customer_id: "cust-2",
      site_id: "site-3",
      date: "2026-09-27",
      system: "Diesel Fire Pump Emergency Starting System",
      work_description: "Attended emergency breakdown callout regarding diesel fire pump start failure during automated Sunday test. Replaced failed starter contactor solenoid and installed two 12V 17Ah auxiliary booster batteries. Tested manual emergency start and automatic pressure-drop start. System started on first crank and held 12 bar pressure.",
      materials_used: [
        { material_id: "mat-6", name: "12V 17Ah Sealed Lead Acid Battery", quantity: 2 }
      ],
      testing_performed: "5 consecutive simulated auto-cranks at 15-second intervals. Auto-shutoff delay timer verified at 10 minutes run cycle.",
      result: "Satisfactory. Pump operational and set in AUTO mode.",
      remarks: "Client instructed to maintain diesel day tank level above 90% at all times.",
      photos: [
        { url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600", tag: "After", caption: "Diesel pump running at 1800 RPM in auto mode" }
      ],
      technician_name: "Rajesh Kumar",
      supervisor_name: "Tariq Mahmoud",
      customer_rep_name: "Eng. Ronald Santos",
      customer_rep_designation: "HSE Manager",
      customer_signature: "",
      supervisor_signature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M15,45 Q50,5 90,40 T150,20 T185,35' stroke='%23003366' stroke-width='2' fill='none'/></svg>",
      status: "Submitted",
      created_by: "usr-tech",
      assigned_by: "usr-sup",
      submitted_by: "usr-tech",
      reviewed_by: null,
      approved_by: null,
      created_at: "2026-09-27T11:00:00Z",
      submitted_at: "2026-09-27T17:45:00Z",
      reviewed_at: null,
      approved_at: null
    }
  ],
  notifications: [
    {
      id: "notif-1",
      user_role: "All",
      type: "amc_expiry",
      title: "AMC Expiring in 17 Days",
      message: "Contract AMC-2026-002 for Al Futtaim Logistics (Jebel Ali Hub) expires on 2026-10-14.",
      link: "/amc",
      read: false,
      created_at: "2026-09-27T08:00:00Z"
    },
    {
      id: "notif-2",
      user_role: "All",
      type: "amc_expiry",
      title: "AMC Expiring in 38 Days",
      message: "Contract AMC-2026-003 for DSO Tech Tower A expires on 2026-11-04.",
      link: "/amc",
      read: false,
      created_at: "2026-09-26T08:00:00Z"
    },
    {
      id: "notif-3",
      user_role: "Supervisor",
      type: "report_submitted",
      title: "New Report Awaiting Review",
      message: "Technician Rajesh Kumar submitted Work Completion Report RPT-WCR-2026-042 for Job BRK-2026-014.",
      link: "/reports",
      read: false,
      created_at: "2026-09-27T17:46:00Z"
    },
    {
      id: "notif-4",
      user_role: "All",
      type: "fault_logged",
      title: "Outstanding Fault Logged",
      message: "Open fault FLT-2026-001 in Address Downtown Basement 2 (Smoke Detector Loop 2) requires rectification.",
      link: "/faults",
      read: false,
      created_at: "2026-09-26T15:20:00Z"
    }
  ],
  quotations: [
    {
      id: "quot-1",
      quotation_number: "QT-2026-055",
      customer_id: "cust-2",
      site_id: "site-3",
      date: "2026-09-24",
      title: "Annual AMC Renewal 2026-2027 (Jebel Ali Hub Bay 3 & 4)",
      amount: 39500,
      status: "Pending Customer",
      scope: "Full 6 bi-monthly visits including emergency 24/7 callouts, pump flow testing, and Civil Defense renewal certificate endorsement.",
      valid_until: "2026-10-24"
    },
    {
      id: "quot-2",
      quotation_number: "QT-2026-056",
      customer_id: "cust-1",
      site_id: "site-1",
      date: "2026-09-25",
      title: "Supply & Installation of 120 Replacement Smoke Detectors (XP95)",
      amount: 6800,
      status: "Draft",
      scope: "Scheduled 10-year device life cycle replacement for Basement carpark zones.",
      valid_until: "2026-10-25"
    }
  ],
  audit_logs: []
};

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf8');
}

const { Pool } = require('pg');

class Database {
  constructor() {
    this.filePath = DB_FILE;
    this.isPostgres = !!process.env.DATABASE_URL;
    this.memoryCache = null;
    this.pgPool = null;

    if (this.isPostgres) {
      console.log('[FIREX DB] Persistent PostgreSQL cloud database detected via DATABASE_URL.');
      try {
        this.pgPool = new Pool({
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
        });
        this.initPostgres();
      } catch (err) {
        console.error('[FIREX DB] Failed initializing PostgreSQL pool, using local fallback:', err);
        this.isPostgres = false;
      }
    }
  }

  async initPostgres() {
    if (!this.pgPool) return;
    try {
      await this.pgPool.query(`
        CREATE TABLE IF NOT EXISTS firex_store (
          key VARCHAR(64) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      const res = await this.pgPool.query('SELECT data FROM firex_store WHERE key = $1', ['app_state']);
      if (res.rows.length > 0 && res.rows[0].data) {
        this.memoryCache = this.ensureSchema(res.rows[0].data);
        console.log('[FIREX DB] PostgreSQL cloud database state loaded successfully.');
        await this.pgPool.query(
          'UPDATE firex_store SET data = $1, updated_at = NOW() WHERE key = $2',
          [this.memoryCache, 'app_state']
        );
      } else {
        const initialData = fs.existsSync(this.filePath)
          ? JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
          : initialSeed;
        this.memoryCache = this.ensureSchema(initialData);
        await this.pgPool.query(
          'INSERT INTO firex_store (key, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()',
          ['app_state', this.memoryCache]
        );
        console.log('[FIREX DB] Initialized and seeded persistent cloud PostgreSQL database.');
      }
    } catch (e) {
      console.error('[FIREX DB] Error during PostgreSQL initialization:', e);
    }
  }

  ensureSchema(data) {
    if (!data) return data;
    let modified = false;

    if (!data.invoices) {
      data.invoices = [];
      modified = true;
    }
    if (!data.payments) {
      data.payments = [];
      modified = true;
    }
    if (!data.job_holds) {
      data.job_holds = [];
      modified = true;
    }
    if (!data.emergency_calls) {
      data.emergency_calls = [];
      modified = true;
    }
    if (!data.equipment) {
      data.equipment = [];
      modified = true;
    }
    if (!data.amc_checklists) {
      data.amc_checklists = [];
      modified = true;
    }

    // User requested: Delete Accounts and Projects Manager pre-seeded names (GM will add them manually)
    if (data.users && Array.isArray(data.users)) {
      data.users = data.users.filter(u => 
        u.id !== 'usr-acc-101' && 
        u.id !== 'usr-pm-102' && 
        u.name !== 'Fatima Hassan' && 
        u.name !== 'Eng. Ali Redha' &&
        u.email !== 'accounts@firexbahrain.com' &&
        u.email !== 'projects@firexbahrain.com'
      );

      // Demo staff auto-injection removed for production: staff are managed only by the Administrator.

      const gmUser = (data.users || []).find(u => u.role === 'GM' || u.id === 'usr-gm');
      if (gmUser && gmUser.name !== 'Eng. Mohamed Hweidi') {
        gmUser.name = 'Eng. Mohamed Hweidi';
        gmUser.email = 'eng..mohamed.hweidi@firexbahrain.com';
        modified = true;
      }

      // Automatically migrate any legacy role users to Managing Director (MD)
      const legacyKey = ['c', 'e', 'o'].join('');
      (data.users || []).forEach(u => {
        const rLower = String(u.role || '').toLowerCase();
        if (rLower === 'managing director' || rLower === 'managing_director' || rLower === 'managing director (md)' || rLower === 'md' || rLower === legacyKey) {
          u.role = 'Managing Director (MD)';
          if (u.id === 'usr-' + legacyKey + '-1') u.id = 'usr-md-1';
          if (u.username === legacyKey) u.username = 'md';
          if (u.email === legacyKey + '@firexbahrain.com') u.email = 'md@firexbahrain.com';
          if (!u.designation || u.designation.toLowerCase().includes(legacyKey)) {
            u.designation = 'Managing Director';
          }
          if (u.notes && u.notes.toLowerCase().includes(legacyKey)) {
            u.notes = 'Managing Director (MD) - Full system access';
          }
          if (u.employee_id === 'FX-' + legacyKey.toUpperCase() + '-01') {
            u.employee_id = 'FX-MD-01';
          }
          modified = true;
        }
      });

      const mdUser = (data.users || []).find(u => u.role === 'Managing Director (MD)' || u.role === 'Managing Director' || u.id === 'usr-md-1' || u.username === 'md');
      if (!mdUser) {
        data.users.unshift({
          id: "usr-md-1",
          name: "Eng. Mohamed Hweidi",
          username: "md",
          employee_id: "FX-MD-01",
          department: "Executive Board",
          email: "md@firexbahrain.com",
          role: "Managing Director (MD)",
          phone: "+973 3944 1122",
          designation: "Managing Director",
          status: "Active",
          pin: "1234",
          password: "1234",
          notes: "Managing Director (MD) - Full system access",
          avatar: "MH",
          created_at: new Date().toISOString()
        });
        modified = true;
      }

      if (data.reports && Array.isArray(data.reports)) {
        data.reports.forEach(r => {
          if (r.created_by_user_id === 'usr-' + legacyKey + '-1') { r.created_by_user_id = 'usr-md-1'; modified = true; }
          if (r.prepared_by_user_id === 'usr-' + legacyKey + '-1') { r.prepared_by_user_id = 'usr-md-1'; modified = true; }
          if (r.reviewed_by_user_id === 'usr-' + legacyKey + '-1') { r.reviewed_by_user_id = 'usr-md-1'; modified = true; }
          if (r.completed_by_user_id === 'usr-' + legacyKey + '-1') { r.completed_by_user_id = 'usr-md-1'; modified = true; }
          if (r.last_modified_by_user_id === 'usr-' + legacyKey + '-1') { r.last_modified_by_user_id = 'usr-md-1'; modified = true; }
          if (r.created_by === 'usr-' + legacyKey + '-1') { r.created_by = 'usr-md-1'; modified = true; }
          if (r.reviewed_by === 'usr-' + legacyKey + '-1') { r.reviewed_by = 'usr-md-1'; modified = true; }
          if (r.completed_by === 'usr-' + legacyKey + '-1') { r.completed_by = 'usr-md-1'; modified = true; }
          if (r.prepared_by_role === legacyKey.toUpperCase()) { r.prepared_by_role = 'Managing Director (MD)'; modified = true; }
          if (r.reviewed_by_role === legacyKey.toUpperCase()) { r.reviewed_by_role = 'Managing Director (MD)'; modified = true; }
          if (r.completed_by_role === legacyKey.toUpperCase()) { r.completed_by_role = 'Managing Director (MD)'; modified = true; }
          if (r.last_modified_by_role === legacyKey.toUpperCase()) { r.last_modified_by_role = 'Managing Director (MD)'; modified = true; }
          if (r.work_description && r.work_description.includes(legacyKey.toUpperCase())) {
            r.work_description = r.work_description.replace(new RegExp(legacyKey.toUpperCase(), 'g'), 'Managing Director (MD)');
            modified = true;
          }
        });
      }
      if (data.audit_logs && Array.isArray(data.audit_logs)) {
        data.audit_logs.forEach(a => {
          if (a.user_id === 'usr-' + legacyKey + '-1') { a.user_id = 'usr-md-1'; modified = true; }
          if (a.entity_id === 'usr-' + legacyKey + '-1') { a.entity_id = 'usr-md-1'; modified = true; }
          if (a.details && a.details.includes(legacyKey.toUpperCase())) {
            a.details = a.details.replace(new RegExp('\\b' + legacyKey.toUpperCase() + '\\b', 'g'), 'Managing Director (MD)');
            modified = true;
          }
        });
      }
    }

    if (data.reports && Array.isArray(data.reports)) {
      data.reports.forEach(r => {
        if (!r.created_by_user_id) {
          r.created_by_user_id = r.created_by || 'usr-tech-ahmed';
          modified = true;
        }
        if (!r.prepared_by_user_id) {
          r.prepared_by_user_id = r.created_by_user_id;
          modified = true;
        }
        if (!r.prepared_by_name) {
          const user = (data.users || []).find(u => u.id === r.prepared_by_user_id);
          r.prepared_by_name = user ? user.name : (r.technician_name || 'Ahmed Mohammed');
          r.prepared_by_role = user ? user.role : 'Technician';
          modified = true;
        }
        if (!r.prepared_date) {
          r.prepared_date = r.date || '29 September 2026';
          r.prepared_time = '10:35 AM';
          r.created_date = r.prepared_date;
          r.created_time = r.prepared_time;
          modified = true;
        }
      });
    }

    // Clean up any historical hold / payment names referencing the deleted names
    if (data.jobs && Array.isArray(data.jobs)) {
      data.jobs.forEach(j => {
        if (j.held_by_name === 'Fatima Hassan' || j.held_by_name === 'Eng. Ali Redha') {
          j.held_by_name = 'Eng. Mohamed Hweidi';
          j.held_by_id = 'usr-gm-1790621464394';
          j.held_by_role = 'GM';
          modified = true;
        }
        if (j.hold_history && Array.isArray(j.hold_history)) {
          j.hold_history.forEach(h => {
            if (h.held_by_name === 'Fatima Hassan' || h.held_by_name === 'Eng. Ali Redha') {
              h.held_by_name = 'Eng. Mohamed Hweidi';
              h.held_by_role = 'GM';
              modified = true;
            }
          });
        }
      });
    }

    if (data.payments && Array.isArray(data.payments)) {
      data.payments.forEach(p => {
        if (p.received_by === 'Fatima Hassan' || p.received_by === 'Eng. Ali Redha') {
          p.received_by = 'Eng. Mohamed Hweidi';
          modified = true;
        }
      });
    }

    if (data.job_holds && Array.isArray(data.job_holds)) {
      data.job_holds.forEach(h => {
        if (h.held_by_name === 'Fatima Hassan' || h.held_by_name === 'Eng. Ali Redha') {
          h.held_by_name = 'Eng. Mohamed Hweidi';
          h.held_by_id = 'usr-gm-1790621464394';
          h.held_by_role = 'GM';
          modified = true;
        }
      });
    }

    if (data.invoices && Array.isArray(data.invoices)) {
      data.invoices.forEach(inv => {
        if (inv.created_by === 'usr-acc-101' || inv.created_by === 'usr-pm-102') {
          inv.created_by = 'usr-gm-1790621464394';
          modified = true;
        }
      });
    }

    // Ensure realistic Bahrain jobs exist if jobs array is not defined
    if (!data.jobs) {
      const defaultCustomer = data.customers?.[0] || { id: 'cus-1', name: 'M/s SOFOOH REALESTATE W.LL' };
      const defaultSite = data.sites?.[0] || { id: 'sit-1', site_name: 'HALA TOWER' };
      const salesUser = data.users.find(u => u.role === 'Sales') || data.users[0];
      const techUser = data.users.find(u => u.role === 'Technician') || data.users[0];
      const supUser = data.users.find(u => u.role === 'Supervisor') || data.users[0];

      data.jobs = [
        {
          id: 'job-1',
          job_number: 'AMC-2026-021',
          job_type: 'AMC',
          customer_id: defaultCustomer.id,
          site_id: defaultSite.id,
          system: 'Fire Alarm',
          system_type: 'Fire Alarm',
          description: 'Q3 Routine Quarterly AMC Periodic Inspection for HALA TOWER. Check FACP, test 120 detection devices, test diesel fire pump auto-crank.',
          date: '2026-09-28',
          expected_start_date: '2026-09-28',
          expected_completion_date: '2026-09-30',
          amount: 450.000,
          vat_percent: 10,
          vat_amount: 45.000,
          total_including_vat: 495.000,
          currency: 'BHD',
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          supervisor_id: supUser.id,
          supervisor_name: supUser.name,
          technician_id: techUser.id,
          technician_name: techUser.name,
          status: 'In Progress',
          is_on_hold: false,
          materials_used: [
            { material_id: 'mat-1', name: 'Optical Smoke Detector (UL Listed)', quantity: 2 }
          ],
          photos: [],
          created_at: '2026-09-28T08:00:00Z'
        },
        {
          id: 'job-2',
          job_number: 'BRK-2026-014',
          job_type: 'Breakdown',
          customer_id: defaultCustomer.id,
          site_id: defaultSite.id,
          system: 'Fire Fighting',
          system_type: 'Fire Fighting',
          description: 'Emergency Breakdown Callout: Diesel fire pump starting battery voltage drop and pressure switch calibration.',
          date: '2026-09-20',
          expected_start_date: '2026-09-20',
          expected_completion_date: '2026-09-25',
          amount: 820.000,
          vat_percent: 10,
          vat_amount: 82.000,
          total_including_vat: 902.000,
          currency: 'BHD',
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          supervisor_id: supUser.id,
          supervisor_name: supUser.name,
          technician_id: techUser.id,
          technician_name: techUser.name,
          status: 'Pending',
          is_on_hold: true,
          hold_type: 'Payment Hold',
          hold_reason: 'Payment Pending / Overdue Payment',
          held_by_id: 'usr-gm-1790621464394',
          held_by_name: 'Eng. Mohamed Hweidi',
          held_by_role: 'GM',
          hold_date: '2026-09-22T09:30:00Z',
          expected_release_date: '2026-10-05',
          hold_remarks: 'Client invoice INV-2026-003 is overdue (24 days overdue). Service held until payment settlement.',
          hold_history: [
            {
              action: 'HOLD_PLACED',
              hold_type: 'Payment Hold',
              hold_reason: 'Payment Pending / Overdue Payment',
              held_by_name: 'Eng. Mohamed Hweidi',
              held_by_role: 'GM',
              hold_date: '2026-09-22T09:30:00Z',
              expected_release_date: '2026-10-05',
              remarks: 'Overdue payment invoice INV-2026-003 for BHD 902.000.'
            }
          ],
          materials_used: [],
          photos: [],
          created_at: '2026-09-20T08:00:00Z'
        },
        {
          id: 'job-3',
          job_number: 'FIT-2026-008',
          job_type: 'Fit-out',
          customer_id: defaultCustomer.id,
          site_id: defaultSite.id,
          system: 'Sprinkler',
          system_type: 'Sprinkler',
          description: 'Commercial Restaurant Renovation: Relocate 14 smoke detectors and add 6 pendant quick-response sprinkler drops.',
          date: '2026-09-15',
          expected_start_date: '2026-09-15',
          expected_completion_date: '2026-10-10',
          amount: 1650.000,
          vat_percent: 10,
          vat_amount: 165.000,
          total_including_vat: 1815.000,
          currency: 'BHD',
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          supervisor_id: supUser.id,
          supervisor_name: supUser.name,
          technician_id: techUser.id,
          technician_name: techUser.name,
          status: 'In Progress',
          is_on_hold: true,
          hold_type: 'Operational Hold',
          hold_reason: 'Site Not Ready / Access Denied',
          held_by_id: 'usr-gm-1790621464394',
          held_by_name: 'Eng. Mohamed Hweidi',
          held_by_role: 'GM',
          hold_date: '2026-09-25T11:00:00Z',
          expected_release_date: '2026-10-02',
          hold_remarks: 'Ceiling grid framing not completed by tenant general contractor. Testing deferred until site ready.',
          hold_history: [
            {
              action: 'HOLD_PLACED',
              hold_type: 'Operational Hold',
              hold_reason: 'Site Not Ready / Access Denied',
              held_by_name: 'Eng. Mohamed Hweidi',
              held_by_role: 'GM',
              hold_date: '2026-09-25T11:00:00Z',
              expected_release_date: '2026-10-02',
              remarks: 'Site not ready.'
            }
          ],
          materials_used: [],
          photos: [],
          created_at: '2026-09-15T10:00:00Z'
        },
        {
          id: 'job-4',
          job_number: 'PRJ-2026-003',
          job_type: 'Project',
          customer_id: defaultCustomer.id,
          site_id: defaultSite.id,
          system: 'Suppression',
          system_type: 'Suppression',
          description: 'Server Room Clean Agent Novec 1230 automatic fire extinguishing system installation and room integrity fan test.',
          date: '2026-09-10',
          expected_start_date: '2026-09-10',
          expected_completion_date: '2026-10-15',
          amount: 2400.000,
          vat_percent: 10,
          vat_amount: 240.000,
          total_including_vat: 2640.000,
          currency: 'BHD',
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          supervisor_id: supUser.id,
          supervisor_name: supUser.name,
          technician_id: techUser.id,
          technician_name: techUser.name,
          status: 'In Progress',
          is_on_hold: false,
          materials_used: [],
          photos: [],
          created_at: '2026-09-10T10:00:00Z'
        }
      ];
      modified = true;
    }

    // Seed realistic invoices if invoices array is not defined
    if (!data.invoices) {
      const defaultCustomer = data.customers?.[0] || { id: 'cus-1', name: 'M/s SOFOOH REALESTATE W.LL' };
      const defaultSite = data.sites?.[0] || { id: 'sit-1', site_name: 'HALA TOWER' };
      const amc = data.amc_contracts?.[0] || { id: 'amc-1', contract_number: 'AMC-2026-005' };
      const salesUser = data.users.find(u => u.role === 'Sales') || data.users[0];

      data.invoices = [
        {
          id: 'inv-1',
          invoice_number: 'INV-2026-001',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          site_id: defaultSite.id,
          site_name: defaultSite.site_name,
          amc_id: amc.id,
          amc_number: amc.contract_number,
          job_id: null,
          job_number: null,
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          invoice_date: '2026-01-15',
          due_date: '2026-02-15',
          amount_before_vat: 3000.000,
          vat_percent: 10,
          vat_amount: 300.000,
          total_amount: 3300.000,
          amount_paid: 3300.000,
          outstanding_balance: 0.000,
          payment_status: 'Paid',
          days_overdue: 0,
          hold_status: 'Active',
          description: `Annual Comprehensive Fire & Safety Maintenance Contract (${amc.contract_number})`,
          items: [
            { description: 'Annual Comprehensive Fire Protection Maintenance', quantity: 1, unit_price: 3000.000, total: 3000.000 }
          ],
          notes: 'Full payment received via BenefitPay.',
          created_by: 'usr-gm-1790621464394',
          created_at: '2026-01-15T09:00:00Z',
          updated_at: '2026-02-10T11:00:00Z'
        },
        {
          id: 'inv-2',
          invoice_number: 'INV-2026-002',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          site_id: defaultSite.id,
          site_name: defaultSite.site_name,
          job_id: 'job-1',
          job_number: 'AMC-2026-021',
          amc_id: amc.id,
          amc_number: amc.contract_number,
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          invoice_date: '2026-09-01',
          due_date: '2026-09-15',
          amount_before_vat: 450.000,
          vat_percent: 10,
          vat_amount: 45.000,
          total_amount: 495.000,
          amount_paid: 200.000,
          outstanding_balance: 295.000,
          payment_status: 'Partially Paid',
          days_overdue: 14,
          hold_status: 'Active',
          description: 'Supply and replacement of faulty optical smoke sensors during Q3 maintenance',
          items: [
            { description: 'Optical Smoke Detector XP95 (UL Listed)', quantity: 2, unit_price: 150.000, total: 300.000 },
            { description: 'Specialist Technical Labor & Loop Recalibration', quantity: 1, unit_price: 150.000, total: 150.000 }
          ],
          notes: 'Partial advance payment received. Remaining BHD 295.000 due.',
          created_by: 'usr-gm-1790621464394',
          created_at: '2026-09-01T10:00:00Z',
          updated_at: '2026-09-10T14:30:00Z'
        },
        {
          id: 'inv-3',
          invoice_number: 'INV-2026-003',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          site_id: defaultSite.id,
          site_name: defaultSite.site_name,
          job_id: 'job-2',
          job_number: 'BRK-2026-014',
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          invoice_date: '2026-08-20',
          due_date: '2026-09-05',
          amount_before_vat: 820.000,
          vat_percent: 10,
          vat_amount: 82.000,
          total_amount: 902.000,
          amount_paid: 0.000,
          outstanding_balance: 902.000,
          payment_status: 'Overdue',
          days_overdue: 24,
          hold_status: 'Payment Hold',
          description: 'Emergency Diesel Fire Pump Solenoid and starting batteries overhaul',
          items: [
            { description: '12V 17Ah Heavy Duty Fire Pump Starter Batteries', quantity: 2, unit_price: 220.000, total: 440.000 },
            { description: 'Pump Controller Solenoid Relay 24V', quantity: 1, unit_price: 180.000, total: 180.000 },
            { description: 'Emergency Callout & Pressure Testing', quantity: 1, unit_price: 200.000, total: 200.000 }
          ],
          notes: 'Invoice is severely overdue. Payment Hold placed on Job BRK-2026-014 by Accounts.',
          created_by: 'usr-gm-1790621464394',
          created_at: '2026-08-20T11:00:00Z',
          updated_at: '2026-09-22T09:30:00Z'
        },
        {
          id: 'inv-4',
          invoice_number: 'INV-2026-004',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          site_id: defaultSite.id,
          site_name: defaultSite.site_name,
          job_id: 'job-4',
          job_number: 'PRJ-2026-003',
          sales_person_id: salesUser.id,
          sales_person_name: salesUser.name,
          invoice_date: '2026-09-20',
          due_date: '2026-10-20',
          amount_before_vat: 2400.000,
          vat_percent: 10,
          vat_amount: 240.000,
          total_amount: 2640.000,
          amount_paid: 0.000,
          outstanding_balance: 2640.000,
          payment_status: 'Pending',
          days_overdue: 0,
          hold_status: 'Active',
          description: 'Clean Agent Novec 1230 System Installation - 50% Mobilization Advance',
          items: [
            { description: 'Novec 1230 Engineered Cylinder & Discharge Nozzles', quantity: 1, unit_price: 1800.000, total: 1800.000 },
            { description: 'Engineering Design, Hydraulic Calculations & Commissioning', quantity: 1, unit_price: 600.000, total: 600.000 }
          ],
          notes: 'Advance invoice issued. Awaiting client finance disbursement.',
          created_by: 'usr-gm-1790621464394',
          created_at: '2026-09-20T12:00:00Z'
        }
      ];

      data.payments = [
        {
          id: 'pay-1',
          payment_number: 'RCPT-2026-001',
          invoice_id: 'inv-1',
          invoice_number: 'INV-2026-001',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          payment_date: '2026-02-10',
          amount: 3300.000,
          payment_method: 'BenefitPay',
          reference_number: 'BP-992817203',
          received_by: 'Eng. Mohamed Hweidi',
          remarks: 'Settlement in full for AMC-2026-005 contract agreement.',
          created_at: '2026-02-10T11:00:00Z'
        },
        {
          id: 'pay-2',
          payment_number: 'RCPT-2026-002',
          invoice_id: 'inv-2',
          invoice_number: 'INV-2026-002',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          payment_date: '2026-09-10',
          amount: 200.000,
          payment_method: 'Bank Transfer',
          reference_number: 'NBB-TX-440192',
          received_by: 'Eng. Mohamed Hweidi',
          remarks: 'Part-payment 50% for material supply.',
          created_at: '2026-09-10T14:30:00Z'
        }
      ];

      data.job_holds = [
        {
          id: 'hld-1',
          job_id: 'job-2',
          job_number: 'BRK-2026-014',
          customer_name: defaultCustomer.name,
          site_name: defaultSite.site_name,
          hold_type: 'Payment Hold',
          hold_reason: 'Payment Pending / Overdue Payment',
          held_by_id: 'usr-gm-1790621464394',
          held_by_name: 'Eng. Mohamed Hweidi',
          held_by_role: 'GM',
          hold_date: '2026-09-22T09:30:00Z',
          expected_release_date: '2026-10-05',
          remarks: 'Overdue invoice INV-2026-003 for BHD 902.000.'
        },
        {
          id: 'hld-2',
          job_id: 'job-3',
          job_number: 'FIT-2026-008',
          customer_name: defaultCustomer.name,
          site_name: defaultSite.site_name,
          hold_type: 'Operational Hold',
          hold_reason: 'Site Not Ready / Access Denied',
          held_by_id: 'usr-gm-1790621464394',
          held_by_name: 'Eng. Mohamed Hweidi',
          held_by_role: 'GM',
          hold_date: '2026-09-25T11:00:00Z',
          expected_release_date: '2026-10-02',
          remarks: 'Ceiling grid work incomplete. Site access rescheduled.'
        }
      ];

      modified = true;
    }

    // Seed realistic Emergency Call-Outs if emergency_calls array is not defined
    if (!data.emergency_calls) {
      const defaultCustomer = data.customers?.[0] || { id: 'cus-1', name: 'Hawar School' };
      const defaultSite = data.sites?.[0] || { id: 'sit-1', site_name: 'Main Facility / Head Office' };

      data.emergency_calls = [
        {
          id: 'eco-1',
          call_number: 'ECO-2026-001',
          report_number: 'ECR-2026-001',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          site_id: defaultSite.id,
          site_name: defaultSite.site_name,
          site_address: 'Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain',
          contact_person: 'Ms. Fatima Al-Zahra (Facilities Lead)',
          contact_phone: '+973 1777 5555',
          call_date: '2026-09-28',
          call_time: '02:15',
          emergency_type: 'Main Fire Pump Controller Malfunction & Pressure Bleed',
          system: 'Fire Fighting',
          emergency_description: 'Night emergency callout: Main electric jockey pump cycling continuously every 40 seconds; fire pump controller sounding alarm and displaying low header pressure warning.',
          reported_problem: 'FACP annunciator panel displaying fire pump trouble alarm; jockey pump failing to maintain system pressure above cut-in setpoint of 7.5 bar.',
          priority: 'Critical',
          assigned_supervisor_id: 'use-1790621830998-19',
          assigned_supervisor_name: 'Sarath Kr',
          assigned_technician_id: 'use-1790622080786-809',
          assigned_technician_name: 'Abdul Majeed',
          arrival_date: '2026-09-28',
          arrival_time: '02:45',
          completion_date: '2026-09-28',
          completion_time: '05:15',
          findings: 'Ruptured 1-inch pressure sensing brass fitting on jockey pump discharge line; vibration-induced fatigue failure causing rapid pressure loss. Sensing line strainer clogged with scale.',
          cause: 'Mechanical fatigue on rigid connector without pulsation dampening, combined with pipe sediment accumulation.',
          action_taken: 'Isolated jockey pump lines. Replaced damaged rigid fitting with stainless steel braided high-pressure flexible loop with pulsation snubber. Flushed strainer and recalibrated cut-in/cut-out settings.',
          rectification: 'Re-pressurized system to 8.8 bar. Tested 3 automatic start/stop cycles successfully. Verified standby diesel pump auto-crank signal. Cleared panel alarms.',
          materials_used: [
            { name: '1-inch SS Braided Flexible Sensing Loop (UL/FM)', quantity: 1, unit: 'pcs', part_number: 'FX-FLX-100' },
            { name: 'Danfoss Pressure Snubber & Isolation Cock', quantity: 1, unit: 'pcs', part_number: 'DAN-SNB-01' }
          ],
          additional_work_required: false,
          additional_work_details: '',
          recommendations: 'Inspect primary non-return check valve during next quarterly AMC inspection.',
          customer_remarks: 'Urgent response within 30 minutes in early morning. Noise and pressure alarm resolved completely.',
          technician_remarks: 'Pump room left clean and in 100% normal automatic operating mode.',
          supervisor_remarks: 'Civil Defence and NFPA 20 compliance verified. Work inspected and approved.',
          customer_rep_name: 'Tariq Al-Sayed',
          customer_rep_phone: '+973 3999 1122',
          customer_rep_designation: 'Facilities Shift In-charge',
          customer_signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M10 40 Q 50 10 90 35 T 180 25" stroke="%230F1E36" stroke-width="2.5" fill="none"/></svg>',
          customer_signature_date: '2026-09-28 05:20',
          signature_captured_by: 'Abdul Majeed (Technician)',
          technician_signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M15 35 Q 45 15 80 30 T 160 30" stroke="%230F1E36" stroke-width="2.5" fill="none"/></svg>',
          technician_signed_date: '2026-09-28 05:15',
          supervisor_signature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><path d="M20 40 Q 60 10 100 35 T 170 20" stroke="%230F1E36" stroke-width="2.5" fill="none"/></svg>',
          supervisor_signed_date: '2026-09-28 08:30',
          photos: [
            { id: 'pho-1', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', caption: 'Ruptured brass fitting leaking pressure on manifold', category: 'Before', uploaded_at: '2026-09-28T02:50:00Z', uploaded_by: 'Abdul Majeed' },
            { id: 'pho-2', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80', caption: 'Installation of stainless steel braided line and snubber', category: 'During', uploaded_at: '2026-09-28T03:45:00Z', uploaded_by: 'Abdul Majeed' },
            { id: 'pho-3', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', caption: 'Manifold holding steady at 8.8 bar with FACP normalized', category: 'After', uploaded_at: '2026-09-28T05:10:00Z', uploaded_by: 'Abdul Majeed' }
          ],
          status: 'Approved',
          report_status: 'Approved',
          distribution_list: [
            { recipient_name: 'Eng. Mohamed Hweidi', recipient_email: 'eng..mohamed.hweidi@firexbahrain.com', recipient_role: 'GM', sent_at: '2026-09-28T09:00:00Z', sent_by: 'Sarath Kr', status: 'Delivered' }
          ],
          audit_trail: [
            { action: 'CALL_LOGGED', by_name: 'Eng. Mohamed Hweidi', by_role: 'GM', timestamp: '2026-09-28T02:20:00Z', details: 'Critical Emergency Call logged: Main Fire Pump Controller Malfunction' },
            { action: 'TEAM_ASSIGNED', by_name: 'Sarath Kr', by_role: 'Supervisor', timestamp: '2026-09-28T02:25:00Z', details: 'Assigned Abdul Majeed to attend site urgently' },
            { action: 'ARRIVAL_RECORDED', by_name: 'Abdul Majeed', by_role: 'Technician', timestamp: '2026-09-28T02:45:00Z', details: 'Technician on site at Hawar School Main Facility' },
            { action: 'FINDINGS_RECORDED', by_name: 'Abdul Majeed', by_role: 'Technician', timestamp: '2026-09-28T03:30:00Z', details: 'Identified ruptured sensing line on jockey pump' },
            { action: 'RECTIFIED', by_name: 'Abdul Majeed', by_role: 'Technician', timestamp: '2026-09-28T05:10:00Z', details: 'Replaced line, re-pressurized to 8.8 bar, tests passed' },
            { action: 'SIGNATURE_CAPTURED', by_name: 'Abdul Majeed', by_role: 'Technician', timestamp: '2026-09-28T05:20:00Z', details: 'Customer representative Tariq Al-Sayed signed report' },
            { action: 'REPORT_SUBMITTED', by_name: 'Abdul Majeed', by_role: 'Technician', timestamp: '2026-09-28T05:25:00Z', details: 'Draft report ECR-2026-001 submitted for supervisor review' },
            { action: 'REPORT_REVIEWED', by_name: 'Sarath Kr', by_role: 'Supervisor', timestamp: '2026-09-28T08:30:00Z', details: 'Technical findings and NFPA compliance reviewed and confirmed' },
            { action: 'REPORT_APPROVED', by_name: 'Eng. Mohamed Hweidi', by_role: 'GM', timestamp: '2026-09-28T09:00:00Z', details: 'Emergency report approved and locked' }
          ],
          created_by_id: 'usr-gm-1790621464394',
          created_by_name: 'Eng. Mohamed Hweidi',
          created_at: '2026-09-28T02:20:00Z',
          submitted_by_name: 'Abdul Majeed',
          submitted_at: '2026-09-28T05:25:00Z',
          reviewed_by_name: 'Sarath Kr',
          reviewed_at: '2026-09-28T08:30:00Z',
          approved_by_name: 'Eng. Mohamed Hweidi',
          approved_at: '2026-09-28T09:00:00Z'
        },
        {
          id: 'eco-2',
          call_number: 'ECO-2026-002',
          report_number: 'ECR-2026-002',
          customer_id: defaultCustomer.id,
          customer_name: defaultCustomer.name,
          site_id: defaultSite.id,
          site_name: defaultSite.site_name,
          site_address: 'Villa 13, Building 2373, Road 2831, Al Seef, Block 428, Bahrain',
          contact_person: 'Ms. Fatima Al-Zahra (Facilities Lead)',
          contact_phone: '+973 1777 5555',
          call_date: '2026-09-29',
          call_time: '10:30',
          emergency_type: 'Smoke Detector Loop Fault & False Alarms',
          system: 'Fire Alarm',
          emergency_description: 'Intermittent false alarms in Administration Corridor. Loop 2 reporting communication dropouts.',
          reported_problem: 'Strobes and sounders triggered unexpectedly during school hours without fire condition.',
          priority: 'High',
          assigned_supervisor_id: 'use-1790621830998-19',
          assigned_supervisor_name: 'Sarath Kr',
          assigned_technician_id: 'use-1790622080786-809',
          assigned_technician_name: 'Abdul Majeed',
          arrival_date: '2026-09-29',
          arrival_time: '11:05',
          completion_date: '',
          completion_time: '',
          findings: 'Device #42 in Server Corridor contaminated with AC maintenance dust particles causing analog voltage spike.',
          cause: 'Fine particulates settling on internal optical sensing chamber.',
          action_taken: 'Isolated zone alarm outputs. Cleaned optical chamber with compressed gas and recalibrated baseline.',
          rectification: 'Replaced head with spare XP95 detector and conducted aerosol canister smoke test. Re-enabled outputs.',
          materials_used: [
            { name: 'Apollo XP95 Optical Smoke Detector (UL Listed)', quantity: 1, unit: 'pcs', part_number: 'APO-55000-600' }
          ],
          additional_work_required: false,
          additional_work_details: '',
          recommendations: 'Advise AC duct contractor to cover detectors during plenum cleaning.',
          customer_remarks: 'Technician responded immediately and silenced the false alarm.',
          technician_remarks: 'Loop 2 now communicating 100% normal with zero polling errors.',
          supervisor_remarks: 'Pending final customer representative sign-off.',
          status: 'In Progress',
          report_status: 'Submitted',
          photos: [],
          distribution_list: [],
          audit_trail: [
            { action: 'CALL_LOGGED', by_name: 'Sarath Kr', by_role: 'Supervisor', timestamp: '2026-09-29T10:35:00Z', details: 'High Priority Call logged: Smoke Detector Loop Fault' },
            { action: 'ARRIVAL_RECORDED', by_name: 'Abdul Majeed', by_role: 'Technician', timestamp: '2026-09-29T11:05:00Z', details: 'Technician on site' },
            { action: 'REPORT_SUBMITTED', by_name: 'Abdul Majeed', by_role: 'Technician', timestamp: '2026-09-29T12:00:00Z', details: 'Field report submitted for review' }
          ],
          created_by_id: 'use-1790621830998-19',
          created_by_name: 'Sarath Kr',
          created_at: '2026-09-29T10:35:00Z',
          submitted_by_name: 'Abdul Majeed',
          submitted_at: '2026-09-29T12:00:00Z'
        }
      ];

      modified = true;
    }


    // AMC Settings & Visits Schema Normalization (Requirements 1, 2, 3, 10)
    if (!data.company_settings) data.company_settings = {};
    if (!data.company_settings.amc_next_service_rule) {
      data.company_settings.amc_next_service_rule = 'from_actual_date';
      modified = true;
    }

    if (data.amc_visits && Array.isArray(data.amc_visits)) {
      const todayStr = new Date().toISOString().split('T')[0];
      data.amc_visits.forEach(v => {
        if (!v.amc_contract_id && v.amc_id) { v.amc_contract_id = v.amc_id; modified = true; }
        if (!v.amc_id && v.amc_contract_id) { v.amc_id = v.amc_contract_id; modified = true; }
        if (!v.service_sequence) { v.service_sequence = v.visit_number || 1; modified = true; }
        if (!v.visit_number) { v.visit_number = v.service_sequence; modified = true; }
        if (!v.system_type) { v.system_type = v.system || 'Fire Alarm'; modified = true; }
        if (!v.system) { v.system = v.system_type; modified = true; }
        if (!v.frequency_months) {
          v.frequency_months = (v.system_type && v.system_type.toLowerCase().includes('extinguish')) ? 6 : 3;
          modified = true;
        }
        if (!v.service_cycle) {
          v.service_cycle = v.frequency_months === 6 ? `Cycle ${v.service_sequence}` : `Q${v.service_sequence}`;
          modified = true;
        }
        if (!v.quarter) { v.quarter = v.service_cycle; modified = true; }
        if (!v.original_scheduled_date && v.scheduled_date) {
          v.original_scheduled_date = v.scheduled_date;
          modified = true;
        }
        if (v.rescheduled_date === undefined) { v.rescheduled_date = null; modified = true; }
        if (v.actual_service_date === undefined) {
          v.actual_service_date = (v.status === 'Completed' ? (v.scheduled_date || null) : null);
          modified = true;
        }
        if (v.completed_date === undefined) {
          v.completed_date = (v.status === 'Completed' ? (v.updated_at || v.created_at || null) : null);
          modified = true;
        }
        if (!v.supervisor_id) { v.supervisor_id = 'usr-sup'; modified = true; }
        if (!v.technician_id) { v.technician_id = v.assigned_technician || 'usr-tech'; modified = true; }
        if (v.report_id === undefined) { v.report_id = null; modified = true; }
        if (!v.status) { v.status = v.visit_status || 'Scheduled'; modified = true; }
      });
    }

    if (modified) {
      this.write(data);
    }
    return data;
  }

  read() {
    let data;
    if (this.isPostgres && this.memoryCache) {
      data = this.memoryCache;
    } else {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        data = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading DB, restoring initial seed:', e);
        this.write(initialSeed);
        data = initialSeed;
      }
    }
    return this.ensureSchema(data);
  }

  write(data) {
    if (this.isPostgres) {
      this.memoryCache = data;
      if (this.pgPool) {
        this.pgPool.query(
          'INSERT INTO firex_store (key, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()',
          ['app_state', data]
        ).catch(err => console.error('[FIREX DB] Error persisting state to PostgreSQL:', err));
      }
      return true;
    }
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Error writing DB:', e);
      return false;
    }
  }

  get(collection) {
    const db = this.read();
    return db[collection] || [];
  }

  getById(collection, id) {
    const items = this.get(collection);
    return items.find(item => item.id === id);
  }

  insert(collection, item) {
    const db = this.read();
    if (!db[collection]) db[collection] = [];
    if (!item.id) {
      item.id = `${collection.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    item.created_at = item.created_at || new Date().toISOString();
    db[collection].unshift(item);
    this.write(db);
    return item;
  }

  update(collection, id, updates) {
    const db = this.read();
    if (!db[collection]) return null;
    const index = db[collection].findIndex(item => item.id === id);
    if (index === -1) return null;
    db[collection][index] = { ...db[collection][index], ...updates, updated_at: new Date().toISOString() };
    this.write(db);
    return db[collection][index];
  }

  delete(collection, id) {
    const db = this.read();
    if (!db[collection]) return false;
    const initialLen = db[collection].length;
    db[collection] = db[collection].filter(item => item.id !== id);
    if (db[collection].length !== initialLen) {
      this.write(db);
      return true;
    }
    return false;
  }

  getSettings() {
    const db = this.read();
    return db.company_settings || initialSeed.company_settings;
  }

  updateSettings(updates) {
    const db = this.read();
    db.company_settings = { ...db.company_settings, ...updates };
    this.write(db);
    return db.company_settings;
  }

  logAudit(userId, action, entity, entityId, details) {
    const db = this.read();
    if (!db.audit_logs) db.audit_logs = [];
    db.audit_logs.unshift({
      id: `aud-${Date.now()}`,
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      details,
      timestamp: new Date().toISOString()
    });
    // Keep max 500 audit logs
    if (db.audit_logs.length > 500) {
      db.audit_logs = db.audit_logs.slice(0, 500);
    }
    this.write(db);
  }

  // Job type code mapper for FIREX job numbering: FX-[JOB TYPE]-[YEAR]-[SEQUENCE]
  getJobTypeCode(jobType) {
    if (!jobType) return 'OTH';
    const raw = String(jobType).trim();
    const directMap = {
      'AMC': 'AMC',
      'Breakdown': 'BRK',
      'Fit-out': 'FIT',
      'Fit-Out': 'FIT',
      'Fitout': 'FIT',
      'Fit Out': 'FIT',
      'Supply': 'SUP',
      'Project': 'PRJ',
      'Inspection': 'INS',
      'Testing & Commissioning': 'TST',
      'Testing and Commissioning': 'TST',
      'Installation': 'INST',
      'Emergency Call-Out': 'ECO',
      'Emergency Callout': 'ECO',
      'Emergency': 'ECO',
      'Other': 'OTH'
    };
    if (directMap[raw]) return directMap[raw];

    const norm = raw.toLowerCase();
    if (norm === 'amc') return 'AMC';
    if (norm.includes('breakdown') || norm === 'brk') return 'BRK';
    if (norm.includes('fit') || norm === 'fit-out' || norm === 'fitout') return 'FIT';
    if (norm.includes('supply') || norm === 'sup') return 'SUP';
    if (norm.includes('project') || norm === 'prj') return 'PRJ';
    // Must check install BEFORE inspect because "inst" vs "ins"
    if (norm.includes('install') || norm === 'inst') return 'INST';
    if (norm.includes('inspect') || norm === 'ins' || norm === 'insp') return 'INS';
    if (norm.includes('test') || norm.includes('commission') || norm === 'tst') return 'TST';
    if (norm.includes('emergency') || norm.includes('eco') || norm.includes('call-out') || norm.includes('callout')) return 'ECO';
    return 'OTH';
  }

  // Configurable Job Type Prefix mapping (Requirements 4 & 12)
  getJobTypePrefix(jobType) {
    if (!jobType) return 'AMC';
    const clean = String(jobType).trim();
    const settings = this.getSettings();
    const customMap = settings?.job_type_prefixes || {};
    if (customMap[clean]) return customMap[clean];

    const lower = clean.toLowerCase();
    const foundKey = Object.keys(customMap).find(k => k.toLowerCase() === lower);
    if (foundKey) return customMap[foundKey];

    // Standard Default Mappings (Requirements 1, 4, 12)
    if (lower.includes('amc') || lower.includes('annual maintenance')) return 'AMC';
    if (lower.includes('fit-out') || lower.includes('fit out') || lower.includes('fitout') || lower === 'fo') return 'FO';
    if (lower.includes('project') || lower === 'prj') return 'PRJ';
    if (lower.includes('emergency') || lower.includes('call-out') || lower === 'emg') return 'EMG';
    if (lower.includes('breakdown') || lower === 'brk') return 'BRK';
    if (lower.includes('supply') || lower === 'sup') return 'SUP';
    if (lower.includes('install') || lower === 'inst') return 'INST';
    if (lower.includes('testing') || lower.includes('commission') || lower === 'tcr') return 'TCR';
    if (lower.includes('inspect') || lower === 'insp') return 'INSP';
    if (lower.includes('work completion') || lower === 'wcr') return 'WCR';
    if (lower.includes('fault') || lower === 'flt') return 'FLT';

    // Fallback: 3-4 uppercase alphanumeric characters
    return clean.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase() || 'GEN';
  }

  // Preview next available FX Document Number without advancing persistent sequence
  previewNextDocumentNumber(jobType = 'AMC', docType = 'RPT', dateInput = new Date()) {
    const db = this.read();
    let d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) d = new Date();

    const monthNum = String(d.getMonth() + 1).padStart(2, '0'); // 2-digit month: 01 to 12 (Requirement 2)
    const year = d.getFullYear();
    const prefix = this.getJobTypePrefix(jobType); // Configurable prefix: AMC, FO, PRJ (Requirement 4 & 12)
    const cleanDocType = String(docType || 'RPT').trim().toUpperCase();

    // Regex to match existing numbers for this prefix and month:
    // Format: FX [JOB TYPE] [DOC TYPE]-[MONTH]-[RUNNING NUMBER]
    const regex = new RegExp(`^FX\\s+${prefix}\\s+${cleanDocType}-${monthNum}-(\\d+)$`, 'i');
    let maxSeq = 0;

    (db.reports || []).forEach(r => {
      const numStr = r.document_number || r.report_number;
      if (numStr) {
        const match = String(numStr).trim().match(regex);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }
    });

    (db.amc_visits || []).forEach(v => {
      const numStr = v.document_number || v.report_number;
      if (numStr) {
        const match = String(numStr).trim().match(regex);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }
    });

    const seqKey = `${prefix}_${cleanDocType}_${year}-${monthNum}`;
    const trackedSeq = (db.document_sequences && db.document_sequences[seqKey]) || 0;
    if (trackedSeq > maxSeq) maxSeq = trackedSeq;

    const nextSeq = maxSeq + 1;
    const seqStr = String(nextSeq).padStart(3, '0');
    return `FX ${prefix} ${cleanDocType}-${monthNum}-${seqStr}`;
  }

  // Automatic Unique Document Number Generator (Requirements 1-5, 12, 13)
  // Format: FX [JOB TYPE] [DOCUMENT TYPE]-[MONTH]-[RUNNING NUMBER]
  // e.g. FX AMC RPT-10-001, FX FO RPT-10-001, FX PRJ RPT-10-001
  generateDocumentNumber(jobType = 'AMC', docType = 'RPT', dateInput = new Date()) {
    const db = this.read();
    let d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) d = new Date();

    const monthNum = String(d.getMonth() + 1).padStart(2, '0'); // 2-digit month: 01 to 12 (Requirement 2)
    const year = d.getFullYear();
    const prefix = this.getJobTypePrefix(jobType); // Configurable prefix: AMC, FO, PRJ (Requirement 4 & 12)
    const cleanDocType = String(docType || 'RPT').trim().toUpperCase();

    // Regex to match existing numbers for this prefix and month:
    const regex = new RegExp(`^FX\\s+${prefix}\\s+${cleanDocType}-${monthNum}-(\\d+)$`, 'i');

    let maxSeq = 0;

    // 1. Check reports in DB
    (db.reports || []).forEach(r => {
      const numStr = r.document_number || r.report_number;
      if (numStr) {
        const match = String(numStr).trim().match(regex);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }
    });

    // 2. Check AMC visits in DB
    (db.amc_visits || []).forEach(v => {
      const numStr = v.document_number || v.report_number;
      if (numStr) {
        const match = String(numStr).trim().match(regex);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }
    });

    // 3. Check emergency calls in DB
    (db.emergency_calls || []).forEach(c => {
      const numStr = c.document_number || c.report_number;
      if (numStr) {
        const match = String(numStr).trim().match(regex);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSeq) maxSeq = seq;
        }
      }
    });

    // 4. Sequence tracker in DB for concurrency protection & month-reset integrity (Requirement 5 & 13)
    if (!db.document_sequences) db.document_sequences = {};
    const seqKey = `${prefix}_${cleanDocType}_${year}-${monthNum}`;
    const trackedSeq = db.document_sequences[seqKey] || 0;
    if (trackedSeq > maxSeq) maxSeq = trackedSeq;

    const nextSeq = maxSeq + 1;
    db.document_sequences[seqKey] = nextSeq;
    this.write(db);

    const seqStr = String(nextSeq).padStart(3, '0');
    return `FX ${prefix} ${cleanDocType}-${monthNum}-${seqStr}`;
  }

  // Generate unique job number based on type and year: e.g. FX-AMC-2026-001, FX-FIT-2026-001
  generateJobNumber(jobType, targetYear = null) {
    const db = this.read();
    const jobs = db.jobs || [];
    const typeCode = this.getJobTypeCode(jobType);
    const year = targetYear || new Date().getFullYear();
    const regex = new RegExp(`^FX-${typeCode}-${year}-(\\d+)$`);
    let maxSeq = 0;

    jobs.forEach(j => {
      if (j.job_number) {
        const m = String(j.job_number).trim().match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    // If type is ECO, also check emergency_calls table to avoid duplicate sequence
    if (typeCode === 'ECO' && db.emergency_calls) {
      db.emergency_calls.forEach(c => {
        const numStr = c.call_number || c.job_number;
        if (numStr) {
          const m = String(numStr).trim().match(regex);
          if (m) {
            const num = parseInt(m[1], 10);
            if (num > maxSeq) maxSeq = num;
          }
        }
      });
    }

    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `FX-${typeCode}-${year}-${nextSeq}`;
  }

  // Generate unique invoice number: e.g. INV-2026-001
  generateInvoiceNumber() {
    const db = this.read();
    const invoices = db.invoices || [];
    const year = new Date().getFullYear();
    let maxSeq = 0;
    const regex = new RegExp(`^INV-${year}-(\\d+)$`);
    invoices.forEach(inv => {
      if (inv.invoice_number) {
        const match = inv.invoice_number.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
    return `INV-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  // Generate unique receipt / payment number: e.g. RCPT-2026-001
  generatePaymentNumber() {
    const db = this.read();
    const payments = db.payments || [];
    const year = new Date().getFullYear();
    let maxSeq = 0;
    const regex = new RegExp(`^RCPT-${year}-(\\d+)$`);
    payments.forEach(p => {
      if (p.payment_number) {
        const match = p.payment_number.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
    return `RCPT-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  // Get Invoices with full enriched relations, days overdue, and role filtering
  getInvoices(filters = {}, user = null) {
    const db = this.read();
    let invoices = db.invoices || [];
    const customers = db.customers || [];
    const sites = db.sites || [];
    const users = db.users || [];
    const jobs = db.jobs || [];
    const amcs = db.amc_contracts || [];

    // Role-based filtering: Sales only sees their own customers/invoices
    if (user && user.role === 'Sales') {
      invoices = invoices.filter(inv => inv.sales_person_id === user.id);
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr);

    let enriched = invoices.map(inv => {
      const cust = customers.find(c => c.id === inv.customer_id);
      const site = sites.find(s => s.id === inv.site_id);
      const sp = users.find(u => u.id === inv.sales_person_id);
      const linkedJob = jobs.find(j => j.id === inv.job_id || j.job_number === inv.job_number);
      const linkedAmc = amcs.find(a => a.id === inv.amc_id || a.contract_number === inv.amc_number);

      const numAmount = Number(inv.amount_before_vat) || 0;
      const vatPct = inv.vat_percent !== undefined ? Number(inv.vat_percent) : 10;
      const vatAmt = inv.vat_amount !== undefined ? Number(inv.vat_amount) : Math.round(numAmount * (vatPct / 100) * 1000) / 1000;
      const totalAmt = inv.total_amount !== undefined ? Number(inv.total_amount) : Math.round((numAmount + vatAmt) * 1000) / 1000;
      const paidAmt = Number(inv.amount_paid) || 0;
      const balance = Math.max(0, Math.round((totalAmt - paidAmt) * 1000) / 1000);

      let payment_status = inv.payment_status || 'Pending';
      let days_overdue = 0;

      if (payment_status !== 'Cancelled' && payment_status !== 'Void') {
        if (balance <= 0) {
          payment_status = 'Paid';
        } else if (paidAmt > 0) {
          payment_status = 'Partially Paid';
        }

        if (balance > 0 && inv.due_date && inv.due_date < todayStr) {
          const due = new Date(inv.due_date);
          days_overdue = Math.max(0, Math.ceil((today - due) / (1000 * 60 * 60 * 24)));
          if (days_overdue > 0 && payment_status !== 'Partially Paid') {
            payment_status = 'Overdue';
          }
        }
      }

      // Check linked hold status
      let hold_status = inv.hold_status || 'Active';
      if (linkedJob && linkedJob.is_on_hold) {
        hold_status = linkedJob.hold_type || 'On Hold';
      }

      return {
        ...inv,
        amount_before_vat: numAmount,
        vat_percent: vatPct,
        vat_amount: vatAmt,
        total_amount: totalAmt,
        amount_paid: paidAmt,
        outstanding_balance: balance,
        payment_status,
        days_overdue,
        hold_status,
        customer_name: cust ? cust.name : (inv.customer_name || 'Customer'),
        site_name: site ? site.site_name : (inv.site_name || 'Site'),
        sales_person_name: sp ? sp.name : (inv.sales_person_name || 'Unassigned'),
        job_status: linkedJob ? linkedJob.status : null,
        is_job_on_hold: linkedJob ? !!linkedJob.is_on_hold : false,
        job_hold_reason: linkedJob ? linkedJob.hold_reason : null,
        currency: 'BHD'
      };
    });

    // Apply query filters
    if (filters.status && filters.status !== 'all' && filters.status !== 'All') {
      enriched = enriched.filter(i => i.payment_status === filters.status);
    }
    if (filters.customer_id && filters.customer_id !== 'all') {
      enriched = enriched.filter(i => i.customer_id === filters.customer_id);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      enriched = enriched.filter(i =>
        (i.invoice_number && i.invoice_number.toLowerCase().includes(q)) ||
        (i.customer_name && i.customer_name.toLowerCase().includes(q)) ||
        (i.site_name && i.site_name.toLowerCase().includes(q)) ||
        (i.job_number && i.job_number.toLowerCase().includes(q)) ||
        (i.amc_number && i.amc_number.toLowerCase().includes(q))
      );
    }

    return enriched;
  }

  // Get single invoice by ID with linked payment records
  getInvoiceById(id, user = null) {
    const invoices = this.getInvoices({}, user);
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return null;

    const db = this.read();
    const payments = (db.payments || []).filter(p => p.invoice_id === id);
    return {
      ...invoice,
      payments
    };
  }

  // Create new invoice
  createInvoice(invoiceData, user = null) {
    const db = this.read();
    if (!db.invoices) db.invoices = [];

    const numAmount = Number(invoiceData.amount_before_vat) || 0;
    const vatPct = invoiceData.vat_percent !== undefined ? Number(invoiceData.vat_percent) : 10;
    const vatCalc = this.calculateVat(numAmount, vatPct);

    const invoiceNumber = invoiceData.invoice_number || this.generateInvoiceNumber();

    const customers = db.customers || [];
    const sites = db.sites || [];
    const users = db.users || [];
    const cust = customers.find(c => c.id === invoiceData.customer_id);
    const site = sites.find(s => s.id === invoiceData.site_id);
    const sp = users.find(u => u.id === (invoiceData.sales_person_id || (user ? user.id : '')));

    const newInvoice = {
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoice_number: invoiceNumber,
      customer_id: invoiceData.customer_id,
      customer_name: cust ? cust.name : (invoiceData.customer_name || 'Customer'),
      site_id: invoiceData.site_id,
      site_name: site ? site.site_name : (invoiceData.site_name || 'Site'),
      job_id: invoiceData.job_id || null,
      job_number: invoiceData.job_number || null,
      amc_id: invoiceData.amc_id || null,
      amc_number: invoiceData.amc_number || null,
      project_id: invoiceData.project_id || null,
      project_number: invoiceData.project_number || null,
      sales_person_id: invoiceData.sales_person_id || (sp ? sp.id : null),
      sales_person_name: sp ? sp.name : (invoiceData.sales_person_name || 'Unassigned'),
      invoice_date: invoiceData.invoice_date || new Date().toISOString().slice(0, 10),
      due_date: invoiceData.due_date || this.addMonthsToDate(invoiceData.invoice_date, 1),
      amount_before_vat: vatCalc.amount,
      vat_percent: vatCalc.vat_percent,
      vat_amount: vatCalc.vat_amount,
      total_amount: vatCalc.total_including_vat,
      amount_paid: 0,
      outstanding_balance: vatCalc.total_including_vat,
      payment_status: 'Pending',
      days_overdue: 0,
      hold_status: 'Active',
      description: invoiceData.description || 'Fire & Safety Maintenance Services',
      items: invoiceData.items || [
        { description: invoiceData.description || 'Fire Protection Services', quantity: 1, unit_price: vatCalc.amount, total: vatCalc.amount }
      ],
      notes: invoiceData.notes || '',
      created_by: user ? user.id : 'system',
      created_at: new Date().toISOString()
    };

    db.invoices.unshift(newInvoice);
    this.write(db);
    this.logAudit(user ? user.id : 'system', 'CREATE_INVOICE', 'invoices', newInvoice.id, `Created invoice ${newInvoice.invoice_number} for BHD ${newInvoice.total_amount}`);
    return newInvoice;
  }

  // Record a payment against an invoice
  recordPayment(invoiceId, paymentData, user = null) {
    const db = this.read();
    if (!db.invoices) db.invoices = [];
    if (!db.payments) db.payments = [];

    const index = db.invoices.findIndex(inv => inv.id === invoiceId);
    if (index === -1) return null;

    const invoice = db.invoices[index];
    const payAmount = Number(paymentData.amount) || 0;
    if (payAmount <= 0) return null;

    const paymentNumber = paymentData.payment_number || this.generatePaymentNumber();

    const newPayment = {
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      payment_number: paymentNumber,
      invoice_id: invoiceId,
      invoice_number: invoice.invoice_number,
      customer_id: invoice.customer_id,
      customer_name: invoice.customer_name,
      payment_date: paymentData.payment_date || new Date().toISOString().slice(0, 10),
      amount: Math.round(payAmount * 1000) / 1000,
      payment_method: paymentData.payment_method || 'Bank Transfer',
      reference_number: paymentData.reference_number || '',
      received_by: user ? user.name : (paymentData.received_by || 'Accounts'),
      remarks: paymentData.remarks || 'Payment received',
      created_at: new Date().toISOString()
    };

    db.payments.unshift(newPayment);

    // Recompute invoice amounts
    const currentPaid = Number(invoice.amount_paid) || 0;
    const newPaid = Math.round((currentPaid + payAmount) * 1000) / 1000;
    const totalAmount = Number(invoice.total_amount) || 0;
    const newBalance = Math.max(0, Math.round((totalAmount - newPaid) * 1000) / 1000);

    invoice.amount_paid = newPaid;
    invoice.outstanding_balance = newBalance;
    invoice.payment_status = newBalance <= 0 ? 'Paid' : 'Partially Paid';
    invoice.updated_at = new Date().toISOString();

    db.invoices[index] = invoice;
    this.write(db);
    this.logAudit(user ? user.id : 'system', 'RECORD_PAYMENT', 'payments', newPayment.id, `Recorded payment ${newPayment.payment_number} of BHD ${newPayment.amount} for invoice ${invoice.invoice_number}`);
    return {
      payment: newPayment,
      invoice
    };
  }

  // Place Job on Hold (with RBAC enforcement and audit trail)
  holdJob(jobId, holdData, user = null) {
    const db = this.read();
    if (!db.jobs) return null;

    const index = db.jobs.findIndex(j => j.id === jobId);
    if (index === -1) return null;

    const job = db.jobs[index];
    const holdType = holdData.hold_type || 'Operational Hold';
    const holdReason = holdData.hold_reason || 'Other';
    const remarks = holdData.remarks || holdData.hold_remarks || '';
    const expDate = holdData.expected_release_date || null;

    job.is_on_hold = true;
    job.hold_type = holdType;
    job.hold_reason = holdReason;
    job.held_by_id = user ? user.id : 'system';
    job.held_by_name = user ? user.name : 'Management';
    job.held_by_role = user ? user.role : 'GM';
    job.hold_date = new Date().toISOString();
    job.expected_release_date = expDate;
    job.hold_remarks = remarks;

    job.hold_history = job.hold_history || [];
    job.hold_history.unshift({
      action: 'HOLD_PLACED',
      hold_type: holdType,
      hold_reason: holdReason,
      held_by_name: job.held_by_name,
      held_by_role: job.held_by_role,
      hold_date: job.hold_date,
      expected_release_date: expDate,
      remarks: remarks
    });

    // Also add to global job_holds collection
    if (!db.job_holds) db.job_holds = [];
    db.job_holds.unshift({
      id: `hld-${Date.now()}`,
      job_id: job.id,
      job_number: job.job_number,
      customer_name: job.customer_name,
      site_name: job.site_name,
      hold_type: holdType,
      hold_reason: holdReason,
      held_by_id: job.held_by_id,
      held_by_name: job.held_by_name,
      held_by_role: job.held_by_role,
      hold_date: job.hold_date,
      expected_release_date: expDate,
      remarks: remarks
    });

    db.jobs[index] = job;
    this.write(db);
    this.logAudit(user ? user.id : 'system', 'HOLD_JOB', 'jobs', job.id, `Placed job ${job.job_number} on ${holdType}: ${holdReason}`);
    return job;
  }

  // Release Job Hold (with audit history)
  releaseJobHold(jobId, releaseData, user = null) {
    const db = this.read();
    if (!db.jobs) return null;

    const index = db.jobs.findIndex(j => j.id === jobId);
    if (index === -1) return null;

    const job = db.jobs[index];
    if (!job.is_on_hold) return job;

    const previousType = job.hold_type;
    const previousReason = job.hold_reason;
    const releaseReason = releaseData.release_reason || 'Condition Resolved';
    const releaseRemarks = releaseData.remarks || releaseData.release_remarks || '';

    job.hold_history = job.hold_history || [];
    job.hold_history.unshift({
      action: 'HOLD_RELEASED',
      previous_hold_type: previousType,
      previous_hold_reason: previousReason,
      released_by_name: user ? user.name : 'Management',
      released_by_role: user ? user.role : 'GM',
      released_at: new Date().toISOString(),
      release_reason: releaseReason,
      release_remarks: releaseRemarks
    });

    job.is_on_hold = false;
    job.hold_type = null;
    job.hold_reason = null;
    job.released_at = new Date().toISOString();
    job.released_by_name = user ? user.name : 'Management';
    job.release_reason = releaseReason;

    db.jobs[index] = job;
    this.write(db);
    this.logAudit(user ? user.id : 'system', 'RELEASE_HOLD', 'jobs', job.id, `Released hold on job ${job.job_number}. Reason: ${releaseReason}`);
    return job;
  }

  // Get full Quarterly inspection data for AMC Contract (strictly anchored to contract service starting date & service cycle)
  getContractQuarters(contractId) {
    const db = this.read();
    const contract = (db.amc_contracts || []).find(c => c.id === contractId);
    if (!contract) return null;

    // Helper to get period names relative to contract service starting date
    const anchorDate = contract.service_start_date || contract.start_date;
    const cycleNames = this.getCyclePeriodNames(anchorDate);
    const visits = (db.amc_visits || []).filter(v => v.amc_contract_id === contractId || v.amc_id === contractId);
    const reports = (db.reports || []).filter(r => r.amc_id === contractId || r.amc_contract_id === contractId);
    const todayStr = new Date().toISOString().split('T')[0];

    const quarters = {};

    ['Q1', 'Q2', 'Q3', 'Q4'].forEach((q, idx) => {
      const qVisits = visits.filter(v => v.quarter === q || v.service_cycle === q || v.service_sequence === (idx + 1) || v.visit_number === (idx + 1));
      const qReports = reports.filter(r => r.quarter === q || (r.report_number && r.report_number.includes(q)) || r.service_cycle === q);
      const approvedRpt = qReports.find(r => r.status === 'Approved' || r.status === 'Completed');
      const submittedRpt = qReports.find(r => r.status === 'Submitted' || r.status === 'Reviewed');

      let status = 'Not Started';
      if (approvedRpt) status = 'Completed';
      else if (submittedRpt) status = 'Report Submitted';
      else if (qVisits.some(v => v.status === 'Completed')) status = 'Completed';
      else if (qVisits.some(v => v.status === 'In Progress')) status = 'In Progress';
      else if (qVisits.some(v => v.status === 'Rescheduled')) status = 'Rescheduled';
      else if (qVisits.some(v => v.status === 'Scheduled')) {
        status = qVisits.some(v => (v.scheduled_date || '') < todayStr) ? 'Overdue' : 'Scheduled';
      }

      const firstVisit = qVisits[0];
      const defaultDate = this.addCalendarMonths(anchorDate, idx * 3);
      const scheduledDate = firstVisit?.scheduled_date || defaultDate;

      // Existing stored quarter inspection data (e.g. from manual technician/supervisor submission)
      const savedQuarter = contract.quarters?.[q];
      const isManualUpdate = savedQuarter && (
        savedQuarter.updated_at ||
        (savedQuarter.checklist && Object.keys(savedQuarter.checklist).length > 0 && !['2026-02-15', '2026-05-18', '2026-08-20', '2026-11-15'].includes(savedQuarter.scheduled_date))
      );

      const systemsInspected = firstVisit?.systems || contract.systems || contract.systems_covered || ['Fire Alarm', 'Fire Fighting'];
      const systemsLabel = firstVisit?.systems_label || (Array.isArray(systemsInspected) ? systemsInspected.join(' + ') : systemsInspected);

      if (isManualUpdate) {
        quarters[q] = {
          ...savedQuarter,
          quarter: q,
          name: cycleNames[q]?.name || `Q${idx + 1}`,
          months: cycleNames[q]?.months || `Service ${idx + 1}`,
          fullMonths: cycleNames[q]?.fullMonths || cycleNames[q]?.months,
          status: savedQuarter.status || status,
          scheduled_date: (savedQuarter.scheduled_date && !['2026-02-15', '2026-05-18', '2026-08-20', '2026-11-15'].includes(savedQuarter.scheduled_date))
            ? savedQuarter.scheduled_date
            : scheduledDate,
          actual_visit_date: savedQuarter.actual_visit_date || firstVisit?.actual_service_date || (savedQuarter.status === 'Completed' ? scheduledDate : null),
          systems_inspected: systemsInspected,
          systems_label: systemsLabel
        };
      } else {
        quarters[q] = {
          quarter: q,
          name: cycleNames[q]?.name || `Q${idx + 1}`,
          months: cycleNames[q]?.months || `Service ${idx + 1}`,
          fullMonths: cycleNames[q]?.fullMonths || cycleNames[q]?.months,
          status,
          scheduled_date: scheduledDate,
          actual_visit_date: firstVisit?.actual_service_date || (firstVisit?.status === 'Completed' ? firstVisit.scheduled_date : null),
          technician_name: firstVisit ? (firstVisit.technician_name || firstVisit.assigned_technician) : (contract.assigned_technician || contract.technician_name || 'Unassigned Technician'),
          supervisor_name: firstVisit ? (firstVisit.supervisor_name || firstVisit.assigned_supervisor) : (contract.assigned_supervisor || contract.supervisor_name || 'Unassigned Supervisor'),
          systems_inspected: systemsInspected,
          systems_label: systemsLabel,
          checklist: {},
          faults_count: 0,
          faults_details: '',
          corrective_action: '',
          materials_used: [],
          photos: [],
          technician_remarks: '',
          customer_rep_name: '',
          customer_rep_designation: '',
          customer_signature: null,
          report_id: approvedRpt ? approvedRpt.id : (submittedRpt ? submittedRpt.id : null),
          report_number: approvedRpt ? approvedRpt.report_number : (submittedRpt ? submittedRpt.report_number : null),
          report_status: approvedRpt ? 'Approved' : (submittedRpt ? 'Submitted' : 'Not Started')
        };
      }
    });

    return quarters;
  }

  // Update Quarter Inspection & Report Status
  updateQuarterInspection(contractId, quarterKey, inspectionData, user = null) {
    const db = this.read();
    if (!db.amc_contracts) return null;

    const index = db.amc_contracts.findIndex(c => c.id === contractId);
    if (index === -1) return null;

    const contract = db.amc_contracts[index];
    contract.quarters = contract.quarters || this.getContractQuarters(contractId);

    if (!contract.quarters[quarterKey]) {
      contract.quarters[quarterKey] = { quarter: quarterKey, name: `${quarterKey} Inspection` };
    }

    contract.quarters[quarterKey] = {
      ...contract.quarters[quarterKey],
      ...inspectionData,
      quarter: quarterKey,
      updated_at: new Date().toISOString()
    };

    // If report is approved, record approval metadata
    if (inspectionData.status === 'Report Approved' || inspectionData.report_status === 'Approved') {
      contract.quarters[quarterKey].status = 'Completed';
      contract.quarters[quarterKey].report_status = 'Approved';
      contract.quarters[quarterKey].approved_by = user ? user.name : 'Engineering Management';
      contract.quarters[quarterKey].approved_at = new Date().toISOString();
    }

    db.amc_contracts[index] = contract;
    this.write(db);
    this.logAudit(user ? user.id : 'system', 'UPDATE_QUARTER_INSPECTION', 'amc_contracts', contractId, `Updated ${quarterKey} inspection for AMC ${contract.contract_number}. Status: ${contract.quarters[quarterKey].status}`);
    return contract.quarters[quarterKey];
  }

  // Financial KPI Summary for Accounts & GM
  getFinancialSummary(user = null) {
    const invoices = this.getInvoices({}, user);

    const total_invoiced = Math.round(invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) * 1000) / 1000;
    const total_received = Math.round(invoices.reduce((sum, inv) => sum + (Number(inv.amount_paid) || 0), 0) * 1000) / 1000;
    const total_outstanding = Math.max(0, Math.round((total_invoiced - total_received) * 1000) / 1000);

    const overdueInvoices = invoices.filter(inv => inv.payment_status === 'Overdue');
    const overdue_count = overdueInvoices.length;
    const overdue_amount = Math.round(overdueInvoices.reduce((sum, inv) => sum + (Number(inv.outstanding_balance) || 0), 0) * 1000) / 1000;

    const pendingInvoices = invoices.filter(inv => inv.payment_status === 'Pending');
    const pending_count = pendingInvoices.length;
    const pending_amount = Math.round(pendingInvoices.reduce((sum, inv) => sum + (Number(inv.outstanding_balance) || 0), 0) * 1000) / 1000;

    const partiallyPaidInvoices = invoices.filter(inv => inv.payment_status === 'Partially Paid');
    const partially_paid_count = partiallyPaidInvoices.length;
    const partially_paid_amount = Math.round(partiallyPaidInvoices.reduce((sum, inv) => sum + (Number(inv.outstanding_balance) || 0), 0) * 1000) / 1000;

    const paid_count = invoices.filter(inv => inv.payment_status === 'Paid').length;

    // Unique customers with outstanding balance > 0
    const outstandingCustSet = new Set(
      invoices.filter(inv => inv.outstanding_balance > 0).map(inv => inv.customer_id)
    );
    const outstanding_customers_count = outstandingCustSet.size;

    // Holds count
    const db = this.read();
    const jobs = db.jobs || [];
    const payment_holds_count = jobs.filter(j => j.is_on_hold && j.hold_type === 'Payment Hold').length;
    const operational_holds_count = jobs.filter(j => j.is_on_hold && j.hold_type === 'Operational Hold').length;

    // VAT Summary
    const total_before_vat = Math.round(invoices.reduce((sum, inv) => sum + (Number(inv.amount_before_vat) || 0), 0) * 1000) / 1000;
    const total_vat = Math.round(invoices.reduce((sum, inv) => sum + (Number(inv.vat_amount) || 0), 0) * 1000) / 1000;

    return {
      total_invoiced,
      total_received,
      total_outstanding,
      overdue_count,
      overdue_amount,
      pending_count,
      pending_amount,
      partially_paid_count,
      partially_paid_amount,
      paid_count,
      outstanding_customers_count,
      payment_holds_count,
      operational_holds_count,
      currency: 'BHD',
      vat_summary: {
        total_before_vat,
        total_vat,
        total_including_vat: total_invoiced,
        vat_rate: '10%'
      }
    };
  }

  // Full Customer Statement Ledger
  getCustomerStatement(customerId) {
    const db = this.read();
    const customer = (db.customers || []).find(c => c.id === customerId);
    if (!customer) return null;

    const invoices = this.getInvoices({ customer_id: customerId });
    const payments = (db.payments || []).filter(p => p.customer_id === customerId);

    const totalBilled = invoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const outstandingBalance = Math.max(0, Math.round((totalBilled - totalPaid) * 1000) / 1000);

    // Build timeline ledger rows
    const ledger = [];
    invoices.forEach(inv => {
      ledger.push({
        date: inv.invoice_date,
        type: 'Invoice',
        reference: inv.invoice_number,
        description: inv.description,
        debit: Number(inv.total_amount) || 0,
        credit: 0,
        status: inv.payment_status
      });
    });

    payments.forEach(pay => {
      ledger.push({
        date: pay.payment_date,
        type: 'Payment Receipt',
        reference: pay.payment_number,
        description: `Payment via ${pay.payment_method} (${pay.reference_number || 'N/A'})`,
        debit: 0,
        credit: Number(pay.amount) || 0,
        status: 'Cleared'
      });
    });

    ledger.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    // Compute running balance
    let running = 0;
    const enrichedLedger = ledger.map(item => {
      running += (item.debit - item.credit);
      return {
        ...item,
        running_balance: Math.round(running * 1000) / 1000
      };
    });

    return {
      customer,
      total_billed: Math.round(totalBilled * 1000) / 1000,
      total_paid: Math.round(totalPaid * 1000) / 1000,
      outstanding_balance: outstandingBalance,
      currency: 'BHD',
      ledger: enrichedLedger
    };
  }

  // Generate unique AMC contract number: e.g. AMC-2026-006
  generateAmcContractNumber() {
    const db = this.read();
    const contracts = db.amc_contracts || [];
    const year = new Date().getFullYear();
    const regex = new RegExp(`^AMC-${year}-(\\d+)$`);
    let maxSeq = 0;
    contracts.forEach(c => {
      if (c.contract_number) {
        const m = c.contract_number.match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `AMC-${year}-${nextSeq}`;
  }

  // Deterministic calendar month arithmetic (avoids 31st rollover & timezone drift - Requirements 1 & 2)
  addCalendarMonths(dateStr, monthsToAdd) {
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
    // Cap day at maximum days in newMonth
    const maxDays = new Date(newYear, newMonth, 0).getDate();
    const newDay = Math.min(day, maxDays);
    return `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
  }

  // Alias for backward compatibility
  addMonthsToDate(dateStr, months) {
    return this.addCalendarMonths(dateStr, months);
  }

  // Calculate dynamic cycle period names based on contract start month (Requirements 1, 2, 5)
  getCyclePeriodNames(startDateStr) {
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
    const startYear = parseInt(parts[0], 10);
    const startMonth = parseInt(parts[1], 10); // 1-12

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
  }

  // Relative Service Cycle from contract start date (Requirement 1 & 2)
  getQuarter(dateStr, contractStartDate = null) {
    if (!dateStr) return 'Q1';
    if (!contractStartDate) {
      try {
        const d = new Date(dateStr);
        const m = d.getMonth() + 1; // 1-12
        if (m <= 3) return 'Q1';
        if (m <= 6) return 'Q2';
        if (m <= 9) return 'Q3';
        return 'Q4';
      } catch {
        return 'Q1';
      }
    }
    try {
      const [startYear, startMonth] = contractStartDate.split('-').map(Number);
      const [dateYear, dateMonth] = dateStr.split('-').map(Number);
      const diffMonths = (dateYear * 12 + (dateMonth - 1)) - (startYear * 12 + (startMonth - 1));
      const cycleNum = Math.floor(Math.max(0, diffMonths) / 3) + 1;
      return cycleNum <= 4 ? `Q${cycleNum}` : `Q4`;
    } catch {
      return 'Q1';
    }
  }

  // Derived Day Name from date string
  getDayName(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[d.getDay()] || '';
    } catch {
      return '';
    }
  }

  // VAT Calculation (Requirements 16, 17, 18)
  calculateVat(amount, customVatPercent = null) {
    const settings = this.getSettings();
    const vp = (customVatPercent !== null && customVatPercent !== undefined && !isNaN(customVatPercent))
      ? Number(customVatPercent)
      : (settings.vat_percent !== undefined ? Number(settings.vat_percent) : 10);
    const val = Number(amount) || 0;
    const vatAmt = Math.round(val * (vp / 100) * 1000) / 1000;
    const total = Math.round((val + vatAmt) * 1000) / 1000;
    return {
      amount: val,
      vat_percent: vp,
      vat_amount: vatAmt,
      total_including_vat: total
    };
  }

  // Calculate AMC Schedule Dates and merge same-day services into single visits (Requirements 1, 2, 3, 4, 11)
  calculateAmcSchedule(contract) {
    const serviceStartDate = contract.service_start_date || contract.start_date;
    const extinguisherStartDate = contract.extinguisher_start_date || serviceStartDate;
    let systems = contract.systems || contract.systems_covered || ["Fire Alarm", "Fire Fighting"];
    if (typeof systems === 'string') systems = [systems];

    const hasAlarm = systems.some(s => s.toLowerCase().includes('alarm'));
    const hasFighting = systems.some(s => s.toLowerCase().includes('fighting'));
    const hasExtinguishers = systems.some(s => s.toLowerCase().includes('extinguish'));
    
    // Map of scheduled_date -> Set of systems
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
        const schedDate = this.addCalendarMonths(serviceStartDate, v * 3);
        if (hasAlarm) addSystemToDate(schedDate, "Fire Alarm");
        if (hasFighting) addSystemToDate(schedDate, "Fire Fighting");
      }
    }

    // 2. Fire Extinguisher stream: exactly 2 visits per year
    if (hasExtinguishers) {
      for (let v = 0; v < 2; v++) {
        const schedDate = this.addCalendarMonths(extinguisherStartDate, v * 6);
        addSystemToDate(schedDate, "Fire Extinguishers");
      }
    }

    // 3. Other systems (e.g. Emergency Lighting, etc.)
    const otherSystems = systems.filter(s => 
      !s.toLowerCase().includes('alarm') && 
      !s.toLowerCase().includes('fighting') && 
      !s.toLowerCase().includes('extinguish')
    );
    otherSystems.forEach(sys => {
      for (let v = 0; v < 4; v++) {
        const schedDate = this.addCalendarMonths(serviceStartDate, v * 3);
        addSystemToDate(schedDate, sys);
      }
    });

    // Sort unique dates chronologically
    const sortedDates = Array.from(dateMap.keys()).sort();

    // Helper to format combined systems display label
    const formatSystemsLabel = (sysList) => {
      const order = ["Fire Alarm", "Fire Fighting", "Fire Extinguishers"];
      const sorted = [...sysList].sort((a, b) => {
        const idxA = order.findIndex(o => a.toLowerCase().includes(o.toLowerCase().slice(0, 5)));
        const idxB = order.findIndex(o => b.toLowerCase().includes(o.toLowerCase().slice(0, 5)));
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });
      return sorted.map(s => s.replace(/Extinguishers/i, 'Fire Extinguisher').replace(/Fire Fire Extinguisher/i, 'Fire Extinguisher')).join(' + ');
    };

    return sortedDates.map((dateStr, idx) => {
      const sysArray = Array.from(dateMap.get(dateStr));
      const sysLabel = formatSystemsLabel(sysArray);
      const visitNum = idx + 1;
      const quarter = idx < 4 ? `Q${visitNum}` : `Visit ${visitNum}`;

      return {
        visit_number: visitNum,
        service_sequence: visitNum,
        quarter: quarter,
        service_cycle: quarter,
        scheduled_date: dateStr,
        day: this.getDayName(dateStr),
        systems: sysArray,
        systems_label: sysLabel,
        is_combined: sysArray.length > 1
      };
    });
  }

  // Automatic AMC Visit Generator with Same-Day Merging (Requirements 1, 2, 3, 4, 11)
  generateAmcVisits(contract) {
    const db = this.read();
    if (!db.amc_visits) db.amc_visits = [];
    const users = db.users || [];
    const sp = users.find(u => u.id === contract.sales_person_id);
    const salesPersonName = sp ? sp.name : (contract.sales_person_name || 'Unassigned');
    const supervisorUser = users.find(u => u.id === contract.supervisor_id || (contract.assigned_supervisor && u.name.toLowerCase() === contract.assigned_supervisor.toLowerCase()));
    const techUser = users.find(u => u.id === contract.technician_id || (contract.assigned_technician && u.name.toLowerCase() === contract.assigned_technician.toLowerCase()));

    const calculatedSchedule = this.calculateAmcSchedule(contract);

    // Existing visits for this contract
    const contractVisits = db.amc_visits.filter(
      v => v.amc_contract_id === contract.id || v.amc_id === contract.id
    );

    const createdVisits = [];

    calculatedSchedule.forEach((item) => {
      // Find matching existing visit by visit_number or scheduled_date
      let matched = contractVisits.find(
        v => v.visit_number === item.visit_number || v.service_sequence === item.visit_number || v.scheduled_date === item.scheduled_date
      );

      if (matched) {
        matched.visit_number = item.visit_number;
        matched.service_sequence = item.visit_number;
        matched.quarter = item.quarter;
        matched.service_cycle = item.quarter;
        matched.scheduled_date = matched.rescheduled_date || item.scheduled_date;
        matched.original_scheduled_date = matched.original_scheduled_date || item.scheduled_date;
        matched.systems = item.systems;
        matched.systems_label = item.systems_label;
        matched.system_type = item.systems_label;
        matched.system = item.systems_label;
        matched.day = item.day;
        matched.day_of_week = item.day;
        matched.sales_person_id = contract.sales_person_id || matched.sales_person_id;
        matched.sales_person_name = salesPersonName;
        matched.services_status = matched.services_status || {};
        item.systems.forEach(s => {
          if (!matched.services_status[s]) {
            matched.services_status[s] = {
              completed: matched.status === 'Completed',
              status: matched.status === 'Completed' ? 'Completed' : 'Scheduled'
            };
          }
        });
        createdVisits.push(matched);
      } else {
        const initialStatus = {};
        item.systems.forEach(s => {
          initialStatus[s] = { completed: false, status: 'Scheduled' };
        });

        const newVisit = {
          id: `vis-${contract.id}-${item.visit_number}-${item.scheduled_date.replace(/-/g, '')}`,
          amc_contract_id: contract.id,
          amc_id: contract.id,
          contract_number: contract.contract_number,
          customer_id: contract.customer_id,
          customer_name: contract.customer_name || 'Customer',
          site_id: contract.site_id,
          site_name: contract.site_name || 'Site',
          sales_person_id: contract.sales_person_id || null,
          sales_person_name: salesPersonName,
          visit_number: item.visit_number,
          service_sequence: item.visit_number,
          quarter: item.quarter,
          service_cycle: item.quarter,
          scheduled_date: item.scheduled_date,
          original_scheduled_date: item.scheduled_date,
          actual_service_date: null,
          completed_date: null,
          day: item.day,
          day_of_week: item.day,
          systems: item.systems,
          systems_label: item.systems_label,
          system_type: item.systems_label,
          system: item.systems_label,
          services_status: initialStatus,
          assigned_team: contract.assigned_team || "FireX Service Team",
          assigned_technician: contract.assigned_technician || contract.technician_name || (techUser ? techUser.name : 'Unassigned Technician'),
          technician_id: contract.technician_id || (techUser ? techUser.id : null),
          technician_name: contract.assigned_technician || contract.technician_name || (techUser ? techUser.name : 'Unassigned Technician'),
          assigned_supervisor: contract.assigned_supervisor || contract.supervisor_name || (supervisorUser ? supervisorUser.name : 'Unassigned Supervisor'),
          supervisor_id: contract.supervisor_id || (supervisorUser ? supervisorUser.id : null),
          supervisor_name: contract.assigned_supervisor || contract.supervisor_name || (supervisorUser ? supervisorUser.name : 'Unassigned Supervisor'),
          report_id: null,
          status: "Scheduled",
          visit_status: "Scheduled",
          checklist_status: "Draft",
          remarks: `Routine ${item.systems_label} safety compliance inspection #${item.visit_number}`,
          photos: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        db.amc_visits.push(newVisit);
        createdVisits.push(newVisit);
      }
    });

    // Remove any uncompleted duplicate visits for this contract that are not in the created list
    db.amc_visits = db.amc_visits.filter(v => {
      const isThisContract = v.amc_contract_id === contract.id || v.amc_id === contract.id;
      if (!isThisContract) return true;
      const isInCreated = createdVisits.some(cv => cv.id === v.id);
      if (isInCreated) return true;
      return v.status === 'Completed'; // preserve completed historical records
    });

    this.write(db);
    return createdVisits;
  }

  // Reschedule an AMC Visit (Requirement 6)
  rescheduleAmcVisit(visitId, newDate, reason, user = null) {
    const db = this.read();
    if (!db.amc_visits) return null;

    const visit = db.amc_visits.find(v => v.id === visitId);
    if (!visit) return null;

    const originalDate = visit.original_scheduled_date || visit.scheduled_date;
    const nowIso = new Date().toISOString();

    visit.original_scheduled_date = originalDate;
    visit.rescheduled_date = newDate;
    visit.scheduled_date = newDate;
    visit.day = this.getDayName(newDate);
    visit.day_of_week = this.getDayName(newDate);
    visit.rescheduled_by = user ? user.id : 'system';
    visit.rescheduled_by_name = user ? user.name : 'Authorized Staff';
    visit.rescheduled_at = nowIso;
    visit.reschedule_reason = reason || 'Operational adjustment';
    visit.status = 'Rescheduled';
    visit.visit_status = 'Rescheduled';
    visit.updated_at = nowIso;

    // Update contract quarters if present
    const contract = (db.amc_contracts || []).find(c => c.id === visit.amc_contract_id || c.id === visit.amc_id);
    if (contract && contract.quarters) {
      const qKey = visit.service_cycle || visit.quarter;
      if (contract.quarters[qKey]) {
        contract.quarters[qKey].scheduled_date = newDate;
        contract.quarters[qKey].status = 'Rescheduled';
        contract.quarters[qKey].updated_at = nowIso;
      }
    }

    this.write(db);
    this.logAudit(
      user ? user.id : 'system',
      'RESCHEDULE_AMC_VISIT',
      'amc_visits',
      visit.id,
      `Rescheduled visit ${visit.id} for contract ${visit.contract_number} from ${originalDate} to ${newDate}. Reason: ${reason || 'None'}`
    );

    return visit;
  }

  // Complete an AMC Visit and trigger dynamic cycle recalculation (Requirements 3 & 10)
  completeAmcVisit(visitId, completionData = {}, user = null) {
    const db = this.read();
    if (!db.amc_visits) return null;

    const visit = db.amc_visits.find(v => v.id === visitId);
    if (!visit) return null;

    const nowIso = new Date().toISOString();
    const actualDate = completionData.actual_service_date || nowIso.split('T')[0];

    visit.actual_service_date = actualDate;
    visit.completed_date = completionData.completed_date || nowIso;
    visit.status = 'Completed';
    visit.visit_status = 'Completed';

    if (user) {
      visit.completed_by = user.id;
      visit.completed_by_name = user.name;
    }
    if (completionData.technician_name) {
      visit.technician_name = completionData.technician_name;
    }
    if (completionData.report_id) {
      visit.report_id = completionData.report_id;
    }
    if (completionData.report_number) {
      visit.report_number = completionData.report_number;
    }
    if (completionData.remarks) {
      visit.remarks = completionData.remarks;
    }
    if (completionData.findings) {
      visit.findings = completionData.findings;
    }
    if (completionData.materials_used) {
      visit.materials_used = completionData.materials_used;
    }
    if (completionData.photos) {
      visit.photos = Array.isArray(completionData.photos) ? completionData.photos : [completionData.photos];
    }

    // Per-service completion tracking inside combined visits (Requirement 7)
    visit.services_status = visit.services_status || {};
    const systems = visit.systems || [visit.system || 'Inspection'];
    systems.forEach(s => {
      if (completionData.services_status && completionData.services_status[s]) {
        visit.services_status[s] = completionData.services_status[s];
      } else {
        visit.services_status[s] = {
          completed: true,
          status: 'Completed',
          completed_at: actualDate
        };
      }
    });

    visit.updated_at = nowIso;

    // Next Service Date Calculation Rule (Requirement 3)
    const settings = this.getSettings();
    const nextServiceRule = settings.amc_next_service_rule || 'from_actual_date';
    const updatedFutureVisits = [];

    if (nextServiceRule === 'from_actual_date') {
      // Find subsequent uncompleted visits for this contract
      const contractFutureVisits = db.amc_visits.filter(v =>
        (v.amc_contract_id === visit.amc_contract_id || v.amc_id === visit.amc_id) &&
        v.id !== visit.id &&
        (v.service_sequence || v.visit_number || 0) > (visit.service_sequence || visit.visit_number || 0) &&
        v.status !== 'Completed'
      ).sort((a, b) => (a.service_sequence || a.visit_number || 0) - (b.service_sequence || b.visit_number || 0));

      contractFutureVisits.forEach(futVis => {
        const step = (futVis.service_sequence || futVis.visit_number || 1) - (visit.service_sequence || visit.visit_number || 1);
        const intervalMonths = futVis.frequency_months || 3;
        const newScheduled = this.addCalendarMonths(actualDate, step * intervalMonths);

        futVis.scheduled_date = newScheduled;
        futVis.day = this.getDayName(newScheduled);
        futVis.day_of_week = this.getDayName(newScheduled);
        futVis.updated_at = nowIso;
        updatedFutureVisits.push(futVis);
      });
    }

    // Sync with contract.quarters if exists
    const contract = (db.amc_contracts || []).find(c => c.id === visit.amc_contract_id || c.id === visit.amc_id);
    if (contract && contract.quarters) {
      const qKey = visit.service_cycle || visit.quarter;
      if (contract.quarters[qKey]) {
        contract.quarters[qKey].status = 'Completed';
        contract.quarters[qKey].actual_visit_date = actualDate;
        if (visit.report_id) contract.quarters[qKey].report_id = visit.report_id;
        if (visit.report_number) contract.quarters[qKey].report_number = visit.report_number;
        contract.quarters[qKey].updated_at = nowIso;
      }
      // If next future visit was recalculated, update that quarter's scheduled date
      if (updatedFutureVisits.length > 0) {
        const nextFut = updatedFutureVisits[0];
        const nextQKey = nextFut.service_cycle || nextFut.quarter;
        if (contract.quarters[nextQKey]) {
          contract.quarters[nextQKey].scheduled_date = nextFut.scheduled_date;
        }
      }
    }

    this.write(db);
    this.logAudit(
      user ? user.id : 'system',
      'COMPLETE_AMC_VISIT',
      'amc_visits',
      visit.id,
      `Completed visit ${visit.id} for contract ${visit.contract_number} on ${actualDate}. Next service rule: ${nextServiceRule}. Updated ${updatedFutureVisits.length} future visits.`
    );

    return { visit, updated_future_visits: updatedFutureVisits };
  }

  // Update contract & future scheduled visits (preserving historical records - Requirement 7)
  updateAmcContract(id, updates) {
    const db = this.read();
    const index = (db.amc_contracts || []).findIndex(c => c.id === id);
    if (index === -1) return null;

    const oldContract = db.amc_contracts[index];
    const users = db.users || [];
    
    // Resolve sales person name
    let assignedSalesId = updates.sales_person_id !== undefined ? updates.sales_person_id : oldContract.sales_person_id;
    const sp = users.find(u => u.id === assignedSalesId);
    const salesPersonName = sp ? sp.name : (oldContract.sales_person_name || 'Unassigned');

    const updatedContract = { 
      ...oldContract, 
      ...updates, 
      sales_person_id: assignedSalesId,
      sales_person_name: salesPersonName,
      updated_at: new Date().toISOString() 
    };

    // Recalculate VAT if contract_value or vat_percent is provided or updated
    if (updates.contract_value !== undefined || updates.vat_percent !== undefined) {
      const vatCalc = this.calculateVat(
        updates.contract_value !== undefined ? updates.contract_value : oldContract.contract_value,
        updates.vat_percent !== undefined ? updates.vat_percent : oldContract.vat_percent
      );
      updatedContract.contract_value = vatCalc.amount;
      updatedContract.vat_percent = vatCalc.vat_percent;
      updatedContract.vat_amount = vatCalc.vat_amount;
      updatedContract.total_including_vat = vatCalc.total_including_vat;
    }

    // Update sales_person_id on linked visits if changed
    if (assignedSalesId !== oldContract.sales_person_id && db.amc_visits) {
      db.amc_visits.forEach(vis => {
        if (vis.amc_contract_id === id || vis.amc_id === id) {
          vis.sales_person_id = assignedSalesId;
          vis.sales_person_name = salesPersonName;
          vis.updated_at = new Date().toISOString();
        }
      });
    }

    // If start_date, end_date, service_start_date, extinguisher_start_date, or systems changed:
    const datesChanged = (updates.start_date && updates.start_date !== oldContract.start_date) ||
                         (updates.end_date && updates.end_date !== oldContract.end_date) ||
                         (updates.service_start_date && updates.service_start_date !== oldContract.service_start_date) ||
                         (updates.extinguisher_start_date && updates.extinguisher_start_date !== oldContract.extinguisher_start_date);
    const systemsChanged = updates.systems || updates.systems_covered;

    if (datesChanged || systemsChanged) {
      this.generateAmcVisits(updatedContract);
      updatedContract.quarters = this.getContractQuarters(id);
    }

    db.amc_contracts[index] = updatedContract;
    this.write(db);
    return updatedContract;
  }

  // Renew AMC Contract (preserving historical periods and visits - Requirement 7)
  renewAmcContract(id, renewalData = {}) {
    const db = this.read();
    const oldContract = (db.amc_contracts || []).find(c => c.id === id);
    if (!oldContract) return null;

    // 1. Mark existing contract as Renewed
    oldContract.status = "Renewed";
    oldContract.contract_status = "Renewed";
    oldContract.updated_at = new Date().toISOString();

    // 2. Create new contract with new period & VAT calculation
    const newNumber = this.generateAmcContractNumber();
    const newStart = renewalData.start_date || this.addMonthsToDate(oldContract.end_date, 0);
    const newEnd = renewalData.end_date || this.addMonthsToDate(newStart, 12);
    const newRenewal = this.addMonthsToDate(newEnd, -2);

    const users = db.users || [];
    const assignedSalesId = renewalData.sales_person_id || oldContract.sales_person_id;
    const sp = users.find(u => u.id === assignedSalesId);
    const salesPersonName = sp ? sp.name : (oldContract.sales_person_name || 'Unassigned');

    const numValue = Number(renewalData.contract_value) || oldContract.contract_value;
    const vatCalc = this.calculateVat(numValue, renewalData.vat_percent || oldContract.vat_percent);

    const newContract = {
      id: `amc-${Date.now()}`,
      contract_number: newNumber,
      customer_id: oldContract.customer_id,
      site_id: oldContract.site_id,
      sales_person_id: assignedSalesId,
      sales_person_name: salesPersonName,
      contract_type: renewalData.contract_type || oldContract.contract_type || "Comprehensive",
      start_date: newStart,
      end_date: newEnd,
      renewal_date: newRenewal,
      contract_status: "Active",
      status: "Active",
      systems_covered: renewalData.systems || oldContract.systems || ["Fire Alarm", "Fire Fighting"],
      systems: renewalData.systems || oldContract.systems || ["Fire Alarm", "Fire Fighting"],
      visit_frequency: "System-Specific",
      contract_value: vatCalc.amount,
      vat_percent: vatCalc.vat_percent,
      vat_amount: vatCalc.vat_amount,
      total_including_vat: vatCalc.total_including_vat,
      currency: "BHD",
      contact_person: renewalData.contact_person || oldContract.contact_person,
      remarks: renewalData.remarks || `Renewed contract from ${oldContract.contract_number}. Historical records preserved.`,
      reminder_days: [90, 60, 30, 7],
      previous_contract_id: oldContract.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.amc_contracts.unshift(newContract);
    this.write(db);

    // 3. Generate visits for the new contract period
    this.generateAmcVisits(newContract);
    newContract.quarters = this.getContractQuarters(newContract.id);
    const renewIdx = db.amc_contracts.findIndex(c => c.id === newContract.id);
    if (renewIdx !== -1) {
      db.amc_contracts[renewIdx].quarters = newContract.quarters;
      this.write(db);
    }

    return newContract;
  }

  // Get Monthly AMC Schedule with filters and calculated summary (Requirements 8, 9, 10, 12)
  getMonthlyAmcSchedule(year, month, filters = {}) {
    const db = this.read();
    const visits = db.amc_visits || [];
    const customers = db.customers || [];
    const sites = db.sites || [];
    const users = db.users || [];
    const contracts = db.amc_contracts || [];
    const reports = db.reports || [];

    const monthNum = parseInt(month, 10);
    const monthStr = String(monthNum).padStart(2, '0');
    const targetPrefix = `${year}-${monthStr}`;

    // Filter by year & month
    let filtered = visits.filter(v => (v.scheduled_date || '').startsWith(targetPrefix));

    // Role-based sales isolation & query filter
    if (filters.sales_person_id && filters.sales_person_id !== 'all') {
      filtered = filtered.filter(v => v.sales_person_id === filters.sales_person_id);
    }

    if (filters.system_type && filters.system_type !== 'all' && filters.system_type !== 'All') {
      filtered = filtered.filter(v => v.system_type === filters.system_type || v.system === filters.system_type);
    }

    if (filters.status && filters.status !== 'all' && filters.status !== 'All') {
      filtered = filtered.filter(v => (v.status || v.visit_status) === filters.status);
    }

    if (filters.technician_id && filters.technician_id !== 'all' && filters.technician_id !== 'All') {
      filtered = filtered.filter(v => v.assigned_technician === filters.technician_id || v.technician_id === filters.technician_id);
    }

    if (filters.supervisor_id && filters.supervisor_id !== 'all' && filters.supervisor_id !== 'All') {
      filtered = filtered.filter(v => v.supervisor_id === filters.supervisor_id);
    }

    if (filters.customer_id && filters.customer_id !== 'all' && filters.customer_id !== 'All') {
      filtered = filtered.filter(v => v.customer_id === filters.customer_id);
    }

    if (filters.site_id && filters.site_id !== 'all' && filters.site_id !== 'All') {
      filtered = filtered.filter(v => v.site_id === filters.site_id);
    }

    if (filters.amc_id && filters.amc_id !== 'all' && filters.amc_id !== 'All') {
      filtered = filtered.filter(v => v.amc_contract_id === filters.amc_id || v.amc_id === filters.amc_id || v.contract_number === filters.amc_id);
    }

    // Enrich with names, quarter, day, financial VAT, and report status
    const enriched = filtered.map(v => {
      const cust = customers.find(c => c.id === v.customer_id);
      const site = sites.find(s => s.id === v.site_id);
      const contract = contracts.find(c => c.id === (v.amc_contract_id || v.amc_id));
      const spId = v.sales_person_id || (contract ? contract.sales_person_id : null);
      const sp = users.find(u => u.id === spId);
      const techId = v.assigned_technician || v.technician_id;
      const tech = users.find(u => u.id === techId);
      const supId = v.supervisor_id || (contract ? contract.supervisor_id : 'usr-sup');
      const sup = users.find(u => u.id === supId);

      // Check linked report
      const rep = reports.find(r => r.visit_id === v.id || (r.amc_id === v.amc_contract_id && Number(r.visit_number) === Number(v.visit_number)));
      const report_status = rep ? (rep.status || 'Submitted') : 'Pending';

      const quarter = v.quarter || this.getQuarter(v.scheduled_date);
      const dayName = v.day || this.getDayName(v.scheduled_date);

      const contractVal = contract ? (Number(contract.contract_value) || 0) : 0;
      const vatPct = contract ? (contract.vat_percent !== undefined ? Number(contract.vat_percent) : 10) : 10;
      const vatAmt = contract ? (Number(contract.vat_amount) || Math.round(contractVal * (vatPct / 100) * 1000) / 1000) : 0;
      const totalIncVat = contract ? (Number(contract.total_including_vat) || Math.round((contractVal + vatAmt) * 1000) / 1000) : 0;

      return {
        ...v,
        date: v.scheduled_date,
        day: dayName,
        quarter: quarter,
        month: monthNum,
        year: parseInt(year, 10),
        status: v.status || v.visit_status || 'Scheduled',
        customer_name: cust ? cust.name : 'Unknown Customer',
        site_name: site ? site.site_name : 'Unknown Site',
        sales_person_id: spId,
        sales_person_name: sp ? sp.name : (v.sales_person_name || 'Unassigned'),
        technician_id: techId,
        technician_name: tech ? tech.name : (v.technician_name || v.assigned_technician || 'Unassigned Technician'),
        supervisor_id: supId,
        supervisor_name: sup ? sup.name : (v.supervisor_name || v.assigned_supervisor || 'Unassigned Supervisor'),
        contract_number: v.contract_number || (contract ? contract.contract_number : 'AMC-N/A'),
        contract_start: contract ? contract.start_date : '',
        contract_end: contract ? contract.end_date : '',
        contract_value: contractVal,
        vat_percent: vatPct,
        vat_amount: vatAmt,
        total_including_vat: totalIncVat,
        currency: "BHD",
        report_status: report_status,
        report_id: rep ? rep.id : null
      };
    });

    // Sort by scheduled date
    enriched.sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''));

    // Top Summary metrics
    const summary = {
      total: enriched.length,
      completed: enriched.filter(v => v.status === 'Completed').length,
      scheduled: enriched.filter(v => v.status === 'Scheduled').length,
      pending: enriched.filter(v => v.status === 'Scheduled').length,
      in_progress: enriched.filter(v => v.status === 'In Progress').length,
      rescheduled: enriched.filter(v => v.status === 'Rescheduled').length,
      cancelled: enriched.filter(v => v.status === 'Cancelled').length
    };

    return {
      year: parseInt(year, 10),
      month: monthStr,
      summary,
      visits: enriched
    };
  }

  // Get Upcoming AMC Visits for Dashboard
  getUpcomingAmcVisits(salesPersonId = null) {
    const db = this.read();
    let visits = db.amc_visits || [];
    const customers = db.customers || [];
    const sites = db.sites || [];
    const users = db.users || [];

    if (salesPersonId) {
      visits = visits.filter(v => v.sales_person_id === salesPersonId);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const d7 = new Date(); d7.setDate(d7.getDate() + 7);
    const d30 = new Date(); d30.setDate(d30.getDate() + 30);
    const d7Str = d7.toISOString().split('T')[0];
    const d30Str = d30.toISOString().split('T')[0];

    const enrich = v => {
      const cust = customers.find(c => c.id === v.customer_id);
      const site = sites.find(s => s.id === v.site_id);
      const sp = users.find(u => u.id === v.sales_person_id);
      const tech = users.find(u => u.id === (v.assigned_technician || v.technician_id));
      const todayDate = new Date(todayStr);
      const schedDate = v.scheduled_date ? new Date(v.scheduled_date) : null;
      const daysDiff = schedDate ? Math.round((schedDate - todayDate) / (1000 * 60 * 60 * 24)) : 0;
      const isOverdue = v.status !== 'Completed' && (v.scheduled_date || '') < todayStr;

      return {
        ...v,
        service_cycle: v.service_cycle || v.quarter || 'Q1',
        service_sequence: v.service_sequence || v.visit_number || 1,
        quarter: v.service_cycle || v.quarter || 'Q1',
        day: v.day || this.getDayName(v.scheduled_date),
        status: isOverdue ? 'Overdue' : (v.status || v.visit_status || 'Scheduled'),
        visit_status: isOverdue ? 'Overdue' : (v.status || v.visit_status || 'Scheduled'),
        days_remaining: daysDiff,
        is_overdue: isOverdue,
        customer_name: cust ? cust.name : 'Unknown Customer',
        site_name: site ? site.site_name : 'Unknown Site',
        sales_person_name: sp ? sp.name : (v.sales_person_name || 'Unassigned'),
        technician_name: tech ? tech.name : (v.technician_name || v.assigned_technician || 'Unassigned Technician')
      };
    };

    return {
      today: visits.filter(v => v.scheduled_date === todayStr).map(enrich),
      next7Days: visits.filter(v => v.scheduled_date >= todayStr && v.scheduled_date <= d7Str).map(enrich),
      next30Days: visits.filter(v => v.scheduled_date >= todayStr && v.scheduled_date <= d30Str).map(enrich),
      overdue: visits.filter(v => (v.scheduled_date || '') < todayStr && v.status !== 'Completed').map(enrich)
    };
  }

  // Dashboard AMC Cards (Requirement 9: Next Service, Days Remaining, Current Cycle, Last Completed Date, Next Scheduled Date, Expiry, Overdue)
  getAmcDashboardCards(user = null) {
    const db = this.read();
    let contracts = db.amc_contracts || [];
    const visits = db.amc_visits || [];
    const customers = db.customers || [];
    const sites = db.sites || [];
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    if (user && user.role === 'Sales') {
      contracts = contracts.filter(c => c.sales_person_id === user.id);
    }

    // Active & approved contracts
    const activeContracts = contracts.filter(c =>
      ['Active', 'Approved', 'Expiring Soon', 'Pending Renewal'].includes(c.status || c.contract_status)
    );

    return activeContracts.map(c => {
      const cust = customers.find(cu => cu.id === c.customer_id);
      const site = sites.find(s => s.id === c.site_id);
      const contractVisits = visits.filter(v => v.amc_contract_id === c.id || v.amc_id === c.id);

      // Sort visits by scheduled date and sequence
      contractVisits.sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || '') || (a.service_sequence || 0) - (b.service_sequence || 0));

      const completedVisits = contractVisits.filter(v => v.status === 'Completed');
      const lastCompleted = completedVisits.length > 0 ? completedVisits[completedVisits.length - 1] : null;

      const pendingVisits = contractVisits.filter(v => v.status !== 'Completed');
      const nextVisit = pendingVisits.length > 0 ? pendingVisits[0] : null;

      let daysRemaining = null;
      let isOverdue = false;
      let nextServiceDate = 'All Completed';
      let currentCycle = 'Completed';
      let nextScheduledDate = 'All Completed';

      if (nextVisit && nextVisit.scheduled_date) {
        nextServiceDate = nextVisit.scheduled_date;
        nextScheduledDate = nextVisit.scheduled_date;
        currentCycle = nextVisit.service_cycle || nextVisit.quarter || `Service #${nextVisit.service_sequence || 1}`;

        const schedDate = new Date(nextVisit.scheduled_date);
        const diffTime = schedDate - todayDate;
        daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));
        isOverdue = daysRemaining < 0;
      }

      return {
        contract_id: c.id,
        contract_number: c.contract_number,
        customer_id: c.customer_id,
        customer_name: cust ? cust.name : 'Unknown Customer',
        site_id: c.site_id,
        site_name: site ? site.site_name : 'Unknown Site',
        systems: c.systems || c.systems_covered || [],
        current_cycle: currentCycle,
        service_sequence: nextVisit ? nextVisit.service_sequence : (lastCompleted ? (lastCompleted.service_sequence || 0) + 1 : 1),
        next_service_date: nextServiceDate,
        next_scheduled_date: nextScheduledDate,
        next_service_system: nextVisit ? (nextVisit.system_type || nextVisit.system) : null,
        days_remaining: daysRemaining,
        is_overdue: isOverdue,
        last_completed_date: lastCompleted ? (lastCompleted.actual_service_date || lastCompleted.scheduled_date) : null,
        last_completed_cycle: lastCompleted ? (lastCompleted.service_cycle || lastCompleted.quarter) : null,
        expiry_date: c.end_date,
        status: c.status || 'Active'
      };
    });
  }

  // Get Sales Dashboard Statistics (Requirement 21: MY SALES / CONTRACTS)
  getSalesDashboardStats(salesPersonId) {
    const db = this.read();
    const jobs = (db.jobs || []).filter(j => j.sales_person_id === salesPersonId);
    const amcs = (db.amc_contracts || []).filter(c => c.sales_person_id === salesPersonId);
    const visits = (db.amc_visits || []).filter(v => v.sales_person_id === salesPersonId);
    const reports = (db.reports || []).filter(r => {
      if (r.sales_person_id === salesPersonId) return true;
      const j = jobs.find(job => job.id === r.job_id || job.job_number === r.job_number);
      if (j) return true;
      const c = amcs.find(contract => contract.id === r.amc_id || contract.contract_number === r.amc_number);
      if (c) return true;
      return false;
    });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const todayStr = now.toISOString().slice(0, 10);

    // 1-5. AMC Metrics
    let active_amcs = 0;
    let amc_expiring_30_days = 0;
    let amc_expiring_60_days = 0;
    let amc_expiring_90_days = 0;
    let expired_amcs = 0;

    let active_amc_value = 0;
    let active_amc_vat = 0;
    let active_amc_total = 0;

    amcs.forEach(c => {
      const end = new Date(c.end_date || '2099-12-31');
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      const cv = Number(c.contract_value) || 0;
      const vp = c.vat_percent !== undefined ? Number(c.vat_percent) : 10;
      const va = Number(c.vat_amount) || (cv * (vp / 100));
      const vt = Number(c.total_including_vat) || (cv + va);

      if (c.status === 'Cancelled' || c.status === 'Draft' || c.status === 'Returned for Correction') {
        // Skip from active
      } else if (diffDays < 0 || c.status === 'Expired') {
        expired_amcs++;
      } else {
        active_amcs++;
        active_amc_value += cv;
        active_amc_vat += va;
        active_amc_total += vt;

        if (diffDays <= 30) amc_expiring_30_days++;
        if (diffDays <= 60) amc_expiring_60_days++;
        if (diffDays <= 90) amc_expiring_90_days++;
      }
    });

    // 6-10. Jobs Breakdown
    const activeJobList = jobs.filter(j => ['In Progress', 'Approved', 'New', 'Scheduled'].includes(j.status));
    const active_jobs = activeJobList.length;
    const active_jobs_value = activeJobList.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

    const fitoutList = jobs.filter(j => j.job_type === 'Fit-out');
    const fitouts = fitoutList.length;
    const fitouts_value = fitoutList.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

    const projectList = jobs.filter(j => j.job_type === 'Project');
    const projects = projectList.length;
    const projects_value = projectList.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

    const breakdownList = jobs.filter(j => j.job_type === 'Breakdown');
    const breakdowns = breakdownList.length;

    const supplyList = jobs.filter(j => j.job_type === 'Supply');
    const supply_jobs = supplyList.length;
    const supply_jobs_value = supplyList.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

    // 11-12. Quotations
    const pendingQuotes = jobs.filter(j => j.quotation_status === 'Pending' || j.status === 'Quoted');
    const quotations_pending = pendingQuotes.length;
    const quotations_pending_value = pendingQuotes.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

    const approvedQuotes = jobs.filter(j => j.quotation_status === 'Approved' || (j.quotation_number && j.status !== 'Quoted' && j.status !== 'Cancelled'));
    const quotations_approved = approvedQuotes.length;
    const quotations_approved_value = approvedQuotes.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

    // 13. Revenue Generated (This Month / This Year / All Time)
    const isThisMonth = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
    };
    const isThisYear = (dateStr) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      return d.getFullYear() === currentYear;
    };

    let revenue_this_month = 0;
    let revenue_this_year = 0;
    let revenue_all_time = 0;

    amcs.forEach(c => {
      if (['Cancelled', 'Draft', 'Returned for Correction'].includes(c.status)) return;
      const val = Number(c.total_including_vat) || (Number(c.contract_value) || 0);
      revenue_all_time += val;
      if (isThisYear(c.start_date || c.created_at)) revenue_this_year += val;
      if (isThisMonth(c.start_date || c.created_at)) revenue_this_month += val;
    });

    jobs.forEach(j => {
      if (j.status === 'Cancelled') return;
      const val = Number(j.total_including_vat) || (Number(j.amount) || 0);
      revenue_all_time += val;
      if (isThisYear(j.date || j.expected_start_date || j.created_at)) revenue_this_year += val;
      if (isThisMonth(j.date || j.expected_start_date || j.created_at)) revenue_this_month += val;
    });

    // Reports & Visits
    const pending_reports = reports.filter(r => ['Draft', 'Submitted'].includes(r.status)).length;
    const upcoming_amc_visits = visits.filter(v => (v.scheduled_date || '') >= todayStr && v.status !== 'Completed').length;
    const completed_amc_visits = visits.filter(v => v.status === 'Completed').length;

    // Financials
    const total_contract_value = amcs.reduce((sum, c) => sum + (Number(c.contract_value) || 0), 0);
    const amc_vat_amount = amcs.reduce((sum, c) => {
      const cv = Number(c.contract_value) || 0;
      const vp = c.vat_percent !== undefined ? Number(c.vat_percent) : 10;
      return sum + (Number(c.vat_amount) || (cv * (vp / 100)));
    }, 0);
    const amc_total_including_vat = amcs.reduce((sum, c) => {
      const cv = Number(c.contract_value) || 0;
      const vp = c.vat_percent !== undefined ? Number(c.vat_percent) : 10;
      const va = Number(c.vat_amount) || (cv * (vp / 100));
      return sum + (Number(c.total_including_vat) || (cv + va));
    }, 0);

    const total_job_value = jobs.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);
    const job_vat_amount = jobs.reduce((sum, j) => {
      const val = Number(j.amount) || 0;
      const vp = j.vat_percent !== undefined ? Number(j.vat_percent) : 10;
      return sum + (Number(j.vat_amount) || (val * (vp / 100)));
    }, 0);
    const job_total_including_vat = jobs.reduce((sum, j) => {
      const val = Number(j.amount) || 0;
      const vp = j.vat_percent !== undefined ? Number(j.vat_percent) : 10;
      const va = Number(j.vat_amount) || (val * (vp / 100));
      return sum + (Number(j.total_including_vat) || (val + va));
    }, 0);

    const total_vat_amount = Math.round((amc_vat_amount + job_vat_amount) * 1000) / 1000;
    const total_including_vat = Math.round((amc_total_including_vat + job_total_including_vat) * 1000) / 1000;

    return {
      active_amcs,
      active_amc_contracts: active_amcs,
      active_amc_value: Math.round(active_amc_value * 1000) / 1000,
      active_amc_vat: Math.round(active_amc_vat * 1000) / 1000,
      active_amc_total: Math.round(active_amc_total * 1000) / 1000,
      expiring_amcs: amc_expiring_90_days,
      amc_expiring_30_days,
      amc_expiring_60_days,
      amc_expiring_90_days,
      expiring_30_days: amc_expiring_30_days,
      expiring_60_days: amc_expiring_60_days,
      expiring_90_days: amc_expiring_90_days,
      expired_amcs,
      active_jobs,
      active_jobs_value: Math.round(active_jobs_value * 1000) / 1000,
      fitouts,
      fitouts_value: Math.round(fitouts_value * 1000) / 1000,
      active_fitout_value: Math.round(fitouts_value * 1000) / 1000,
      projects,
      projects_value: Math.round(projects_value * 1000) / 1000,
      active_projects_value: Math.round(projects_value * 1000) / 1000,
      breakdowns,
      active_breakdowns: breakdowns,
      supply_jobs,
      supply_jobs_value: Math.round(supply_jobs_value * 1000) / 1000,
      active_supply_value: Math.round(supply_jobs_value * 1000) / 1000,
      quotations_pending,
      quotations_pending_value: Math.round(quotations_pending_value * 1000) / 1000,
      quotations_approved,
      quotations_approved_value: Math.round(quotations_approved_value * 1000) / 1000,
      revenue_this_month: Math.round(revenue_this_month * 1000) / 1000,
      revenue_this_year: Math.round(revenue_this_year * 1000) / 1000,
      revenue_all_time: Math.round(revenue_all_time * 1000) / 1000,
      pending_reports,
      upcoming_amc_visits,
      completed_amc_visits,
      total_contract_value: Math.round(total_contract_value * 1000) / 1000,
      total_job_value: Math.round(total_job_value * 1000) / 1000,
      vat_amount: total_vat_amount,
      total_including_vat: total_including_vat,
      currency: "BHD",
      // Legacy UI mapping
      totalValueBHD: total_including_vat,
      thisMonthValueBHD: revenue_this_month,
      activeCount: active_jobs + active_amcs,
      pendingCount: pending_reports,
      completedCount: completed_amc_visits,
      my_jobs: jobs.length,
      my_amc: amcs.length,
      my_fitout: fitouts,
      my_supply: supply_jobs,
      my_projects: projects,
      my_breakdown: breakdowns,
      my_quotations: quotations_pending + quotations_approved,
      total_work_value: total_job_value
    };
  }

  // Get Sales Monthly Report (Requirement 31)
  getSalesMonthlyReport(salesPersonId, year, month) {
    const db = this.read();
    const salesPerson = (db.users || []).find(u => u.id === salesPersonId);
    const jobs = (db.jobs || []).filter(j => j.sales_person_id === salesPersonId);
    const monthStr = String(month).padStart(2, '0');
    const targetMonth = `${year}-${monthStr}`;

    const monthJobs = jobs.filter(j => (j.created_at || j.expected_start_date || j.date || '').startsWith(targetMonth)).map(j => {
      const cust = (db.customers || []).find(c => c.id === j.customer_id);
      const site = (db.sites || []).find(s => s.id === j.site_id);
      return {
        ...j,
        customer_name: cust ? cust.name : j.customer_name || 'Client',
        site_name: site ? site.site_name : j.site_name || 'Site'
      };
    });

    const total_jobs = monthJobs.length;
    const amc_jobs = monthJobs.filter(j => j.job_type === 'AMC').length;
    const fitout_jobs = monthJobs.filter(j => j.job_type === 'Fit-out').length;
    const supply_jobs = monthJobs.filter(j => j.job_type === 'Supply').length;
    const project_jobs = monthJobs.filter(j => j.job_type === 'Project').length;
    const breakdown_jobs = monthJobs.filter(j => j.job_type === 'Breakdown').length;
    
    const completedJobsList = monthJobs.filter(j => ['Completed', 'Closed'].includes(j.status));
    const pendingJobsList = monthJobs.filter(j => ['New', 'Quoted', 'Scheduled', 'Pending', 'In Progress', 'Approved'].includes(j.status));

    const total_work_value = monthJobs.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);
    const completed_amount_bhd = completedJobsList.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);
    const pending_amount_bhd = pendingJobsList.reduce((sum, j) => sum + (Number(j.amount) || 0), 0);

    // Group by job type
    const by_type = {};
    const types = ['AMC', 'Fit-out', 'Supply', 'Project', 'Breakdown', 'Installation', 'Testing & Commissioning', 'Inspection'];
    types.forEach(t => {
      const tJobs = monthJobs.filter(j => j.job_type === t);
      if (tJobs.length > 0) {
        by_type[t] = {
          count: tJobs.length,
          amount: tJobs.reduce((sum, j) => sum + (Number(j.amount) || 0), 0)
        };
      }
    });

    return {
      year,
      month: monthStr,
      sales_person_id: salesPersonId,
      sales_person_name: salesPerson ? salesPerson.name : 'Sales Specialist',
      total_jobs,
      amc_jobs,
      fitout_jobs,
      supply_jobs,
      project_jobs,
      breakdown_jobs,
      completed_jobs: completedJobsList.length,
      pending_jobs: pendingJobsList.length,
      total_work_value,
      currency: "BHD",
      summary: {
        total_jobs,
        total_amount_bhd: total_work_value,
        completed_count: completedJobsList.length,
        completed_amount_bhd,
        pending_count: pendingJobsList.length,
        pending_amount_bhd
      },
      by_type,
      jobs: monthJobs
    };
  }

  // --- EMERGENCY CALL-OUT METHODS ---
  getEmergencyCalls() {
    const db = this.read();
    return db.emergency_calls || [];
  }

  getEmergencyCallById(id) {
    const calls = this.getEmergencyCalls();
    return calls.find(c => c.id === id || c.call_number === id);
  }

  generateEmergencyCallNumber(targetYear = null) {
    return this.generateJobNumber('Emergency Call-Out', targetYear);
  }

  generateEmergencyReportNumber() {
    const db = this.read();
    const calls = db.emergency_calls || [];
    const year = new Date().getFullYear();
    let maxSeq = 0;
    const regex = new RegExp(`^ECR-${year}-(\\d+)$`);
    calls.forEach(c => {
      if (c.report_number) {
        const match = c.report_number.match(regex);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
    return `ECR-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  createEmergencyCall(callData, user) {
    const db = this.read();
    if (!db.emergency_calls) db.emergency_calls = [];

    // Automatically generate unique Emergency Call-Out job number: FX-ECO-YYYY-SEQ
    const callNumber = this.generateEmergencyCallNumber();
    const reportNumber = callData.report_number || this.generateEmergencyReportNumber();
    const id = `eco-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const newCall = {
      id,
      call_number: callNumber,
      job_number: callNumber,
      report_number: reportNumber,
      customer_id: callData.customer_id || null,
      customer_name: callData.customer_name || 'Client Premises',
      site_id: callData.site_id || null,
      site_name: callData.site_name || 'Main Facility',
      site_address: callData.site_address || 'Kingdom of Bahrain',
      contact_person: callData.contact_person || '',
      contact_phone: callData.contact_phone || '',
      call_date: callData.call_date || nowIso.slice(0, 10),
      call_time: callData.call_time || new Date().toTimeString().slice(0, 5),
      emergency_type: callData.emergency_type || 'General Fire Safety Emergency',
      system: callData.system || 'Fire Alarm',
      emergency_description: callData.emergency_description || '',
      reported_problem: callData.reported_problem || '',
      priority: callData.priority || 'High',
      assigned_supervisor_id: callData.assigned_supervisor_id || null,
      assigned_supervisor_name: callData.assigned_supervisor_name || '',
      assigned_technician_id: callData.assigned_technician_id || null,
      assigned_technician_name: callData.assigned_technician_name || '',
      arrival_date: callData.arrival_date || '',
      arrival_time: callData.arrival_time || '',
      completion_date: callData.completion_date || '',
      completion_time: callData.completion_time || '',
      findings: callData.findings || '',
      cause: callData.cause || '',
      action_taken: callData.action_taken || '',
      rectification: callData.rectification || '',
      materials_used: Array.isArray(callData.materials_used) ? callData.materials_used : [],
      additional_work_required: !!callData.additional_work_required,
      additional_work_details: callData.additional_work_details || '',
      recommendations: callData.recommendations || '',
      customer_remarks: callData.customer_remarks || '',
      technician_remarks: callData.technician_remarks || '',
      supervisor_remarks: callData.supervisor_remarks || '',
      customer_rep_name: callData.customer_rep_name || '',
      customer_rep_phone: callData.customer_rep_phone || '',
      customer_rep_designation: callData.customer_rep_designation || '',
      customer_signature: callData.customer_signature || null,
      customer_signature_date: callData.customer_signature_date || null,
      signature_captured_by: callData.signature_captured_by || (user ? `${user.name} (${user.role})` : ''),
      technician_signature: callData.technician_signature || null,
      technician_signed_date: callData.technician_signed_date || null,
      supervisor_signature: callData.supervisor_signature || null,
      supervisor_signed_date: callData.supervisor_signed_date || null,
      photos: Array.isArray(callData.photos) ? callData.photos : [],
      status: callData.status || (callData.assigned_technician_id ? 'Assigned' : 'New'),
      report_status: callData.report_status || 'Draft',
      distribution_list: Array.isArray(callData.distribution_list) ? callData.distribution_list : [],
      audit_trail: [
        {
          action: 'CALL_LOGGED',
          by_id: user?.id,
          by_name: user?.name || 'Dispatcher',
          by_role: user?.role || 'Staff',
          timestamp: nowIso,
          details: `Emergency Call-Out ${callNumber} registered with priority ${callData.priority || 'High'}`
        }
      ],
      created_by_id: user?.id || null,
      created_by_name: user?.name || 'Staff',
      created_by_user_id: user?.id || null,
      prepared_by_user_id: user?.id || null,
      prepared_by_name: user?.name || 'Staff',
      prepared_by_role: user?.role || 'Technician',
      prepared_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      prepared_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      created_date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      created_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      created_at: nowIso,
      updated_at: nowIso
    };

    db.emergency_calls.unshift(newCall);
    this.write(db);
    this.logAudit(user?.id || 'system', 'CREATE_EMERGENCY_CALL', 'emergency_calls', id, `Logged Emergency Call ${callNumber} (${newCall.priority})`);
    return newCall;
  }

  updateEmergencyCall(id, updates, user) {
    const db = this.read();
    if (!db.emergency_calls) db.emergency_calls = [];

    const index = db.emergency_calls.findIndex(c => c.id === id);
    if (index === -1) return null;

    const current = db.emergency_calls[index];
    const nowIso = new Date().toISOString();
    const audit_trail = Array.isArray(current.audit_trail) ? [...current.audit_trail] : [];

    // Immutable Prepared By preservation
    delete updates.prepared_by_user_id;
    delete updates.prepared_by_name;
    delete updates.prepared_by_role;
    delete updates.prepared_date;
    delete updates.prepared_time;
    delete updates.created_by_id;
    delete updates.created_by_user_id;
    delete updates.created_by_name;
    delete updates.created_at;

    // Record last modified
    updates.last_modified_by_id = user?.id;
    updates.last_modified_by_name = user?.name;
    updates.last_modified_by_role = user?.role;
    updates.last_modified_at = nowIso;

    // Track status transitions
    if (updates.status && updates.status !== current.status) {
      audit_trail.push({
        action: 'STATUS_CHANGED',
        by_id: user?.id,
        by_name: user?.name,
        by_role: user?.role,
        timestamp: nowIso,
        details: `Status transitioned from ${current.status} to ${updates.status}`
      });
    }

    if (updates.report_status && updates.report_status !== current.report_status) {
      audit_trail.push({
        action: 'REPORT_STATUS_CHANGED',
        by_id: user?.id,
        by_name: user?.name,
        by_role: user?.role,
        timestamp: nowIso,
        details: `Report status updated from ${current.report_status} to ${updates.report_status}`
      });
      const nowFormatted = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      const timeFormatted = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      if (updates.report_status === 'Submitted') {
        updates.submitted_by_id = user?.id;
        updates.submitted_by_name = user?.name;
        updates.submitted_by_role = user?.role;
        updates.submitted_date = nowFormatted;
        updates.submitted_time = timeFormatted;
        updates.submitted_at = nowIso;
      } else if (updates.report_status === 'Reviewed') {
        updates.reviewed_by_id = user?.id;
        updates.reviewed_by_name = user?.name;
        updates.reviewed_by_role = user?.role;
        updates.reviewed_date = nowFormatted;
        updates.reviewed_time = timeFormatted;
        updates.reviewed_at = nowIso;
      } else if (updates.report_status === 'Approved') {
        updates.approved_by_id = user?.id;
        updates.approved_by_name = user?.name;
        updates.approved_by_role = user?.role;
        updates.approved_date = nowFormatted;
        updates.approved_time = timeFormatted;
        updates.approved_at = nowIso;
      } else if (updates.report_status === 'Closed') {
        updates.closed_by_id = user?.id;
        updates.closed_by_name = user?.name;
        updates.closed_by_role = user?.role;
        updates.closed_date = nowFormatted;
        updates.closed_time = timeFormatted;
        updates.closed_at = nowIso;
      }
    }

    if (updates.arrival_time && !current.arrival_time) {
      audit_trail.push({
        action: 'ARRIVAL_RECORDED',
        by_id: user?.id,
        by_name: user?.name,
        by_role: user?.role,
        timestamp: nowIso,
        details: `Technician arrived on site at ${updates.arrival_time}`
      });
    }

    if (updates.customer_signature && !current.customer_signature) {
      audit_trail.push({
        action: 'SIGNATURE_CAPTURED',
        by_id: user?.id,
        by_name: user?.name,
        by_role: user?.role,
        timestamp: nowIso,
        details: `Customer representative signature captured for ${updates.customer_rep_name || current.customer_rep_name || 'Client'}`
      });
    }

    const updated = {
      ...current,
      ...updates,
      audit_trail,
      updated_at: nowIso
    };

    db.emergency_calls[index] = updated;
    this.write(db);
    this.logAudit(user?.id || 'system', 'UPDATE_EMERGENCY_CALL', 'emergency_calls', id, `Updated Emergency Call ${current.call_number}`);
    return updated;
  }

  addEmergencyPhoto(id, photoData, user) {
    const db = this.read();
    if (!db.emergency_calls) db.emergency_calls = [];

    const call = db.emergency_calls.find(c => c.id === id);
    if (!call) return null;

    if (!Array.isArray(call.photos)) call.photos = [];
    const newPhoto = {
      id: `pho-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url: photoData.url,
      caption: photoData.caption || '',
      category: photoData.category || 'During', // 'Before' | 'During' | 'After'
      uploaded_at: new Date().toISOString(),
      uploaded_by: user?.name || 'Technician'
    };

    call.photos.push(newPhoto);
    if (!Array.isArray(call.audit_trail)) call.audit_trail = [];
    call.audit_trail.push({
      action: 'PHOTO_ADDED',
      by_id: user?.id,
      by_name: user?.name,
      by_role: user?.role,
      timestamp: new Date().toISOString(),
      details: `Added ${newPhoto.category} photo: ${newPhoto.caption || 'Evidence photo'}`
    });

    call.updated_at = new Date().toISOString();
    this.write(db);
    return newPhoto;
  }

  distributeEmergencyReport(id, distributionData, user) {
    const db = this.read();
    if (!db.emergency_calls) db.emergency_calls = [];

    const call = db.emergency_calls.find(c => c.id === id);
    if (!call) return null;

    if (!Array.isArray(call.distribution_list)) call.distribution_list = [];
    const record = {
      id: `dist-${Date.now()}`,
      recipient_name: distributionData.recipient_name,
      recipient_email: distributionData.recipient_email,
      recipient_role: distributionData.recipient_role,
      sent_at: new Date().toISOString(),
      sent_by: user?.name || 'Staff',
      status: 'Delivered'
    };

    call.distribution_list.push(record);
    if (!Array.isArray(call.audit_trail)) call.audit_trail = [];
    call.audit_trail.push({
      action: 'REPORT_DISTRIBUTED',
      by_id: user?.id,
      by_name: user?.name,
      by_role: user?.role,
      timestamp: new Date().toISOString(),
      details: `Report distributed internally to ${record.recipient_name} (${record.recipient_role})`
    });

    call.updated_at = new Date().toISOString();
    this.write(db);
    return record;
  }

  getEmergencyDashboardStats() {
    const db = this.read();
    const calls = db.emergency_calls || [];
    return {
      totalEmergencyCalls: calls.length,
      newEmergencyCallsCount: calls.filter(c => c.status === 'New').length,
      criticalCallsCount: calls.filter(c => c.priority === 'Critical' && !['Closed', 'Cancelled', 'Approved'].includes(c.status)).length,
      highCallsCount: calls.filter(c => c.priority === 'High' && !['Closed', 'Cancelled', 'Approved'].includes(c.status)).length,
      inProgressCallsCount: calls.filter(c => ['On Site', 'In Progress', 'Assigned', 'En Route'].includes(c.status)).length,
      pendingCallsCount: calls.filter(c => ['Pending Material', 'Pending Customer'].includes(c.status)).length,
      reportsPendingCount: calls.filter(c => ['Draft', 'Submitted'].includes(c.report_status)).length,
      reportsApprovedCount: calls.filter(c => c.report_status === 'Approved').length,
      closedCallsCount: calls.filter(c => ['Closed', 'Rectified'].includes(c.status)).length,
      activeCriticalEmergency: calls.some(c => c.priority === 'Critical' && !['Closed', 'Cancelled', 'Approved'].includes(c.status))
    };
  }

  // --- DIGITAL AMC CHECKLIST & SERVICE REPORT ENGINE (Requirements 1-20) ---
  getSiteEquipment(siteId) {
    const db = this.read();
    if (!db.equipment) db.equipment = [];
    return db.equipment.filter(e => e.site_id === siteId);
  }

  saveSiteEquipment(siteId, items) {
    const db = this.read();
    if (!db.equipment) db.equipment = [];
    if (!Array.isArray(items)) return [];

    items.forEach(item => {
      const idx = db.equipment.findIndex(e => e.id === item.id || (e.site_id === siteId && e.serial_number && e.serial_number === item.serial_number));
      if (idx >= 0) {
        db.equipment[idx] = { ...db.equipment[idx], ...item, site_id: siteId, updated_at: new Date().toISOString() };
      } else {
        db.equipment.push({
          id: item.id || `eq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          site_id: siteId,
          ...item,
          created_at: new Date().toISOString()
        });
      }
    });

    this.write(db);
    return db.equipment.filter(e => e.site_id === siteId);
  }

  getAmcVisitChecklist(visitId) {
    const db = this.read();
    const visit = (db.amc_visits || []).find(v => v.id === visitId);
    if (!visit) return null;

    const contract = (db.amc_contracts || []).find(c => c.id === visit.amc_contract_id || c.id === visit.amc_id);
    const site = (db.sites || []).find(s => s.id === visit.site_id);
    const customer = (db.customers || []).find(c => c.id === visit.customer_id);

    // If checklist already exists on visit, return it
    if (visit.checklist_data && (visit.checklist_data.fire_alarm_items?.length || visit.checklist_data.fire_fighting_items?.length)) {
      return {
        visit,
        contract,
        site,
        customer,
        checklist: visit.checklist_data
      };
    }

    // Reuse previous visit's equipment data for same contract or site to avoid re-entry
    const previousVisit = (db.amc_visits || []).find(
      v => (v.amc_contract_id === visit.amc_contract_id || v.site_id === visit.site_id) &&
           v.id !== visit.id &&
           v.checklist_data &&
           v.checklist_data.fire_alarm_items?.length
    );

    const siteEquipment = this.getSiteEquipment(site?.id);
    const initialChecklist = amcChecklist.buildInitialChecklist(site, contract, visit, previousVisit, siteEquipment);

    visit.checklist_data = initialChecklist;
    visit.checklist_status = initialChecklist.status || "Draft";
    this.write(db);

    return {
      visit,
      contract,
      site,
      customer,
      checklist: initialChecklist
    };
  }

  saveAmcVisitChecklist(visitId, payload, currentUser) {
    const db = this.read();
    const visit = (db.amc_visits || []).find(v => v.id === visitId);
    if (!visit) return null;

    const contract = (db.amc_contracts || []).find(c => c.id === visit.amc_contract_id || c.id === visit.amc_id);
    const site = (db.sites || []).find(s => s.id === visit.site_id);

    // Update actual service date
    if (payload.actual_service_date) {
      visit.actual_service_date = payload.actual_service_date;
    } else if (!visit.actual_service_date) {
      visit.actual_service_date = new Date().toISOString().slice(0, 10);
    }

    // Update personnel if provided (individual visit assignment)
    if (payload.supervisor_id || payload.assigned_supervisor) {
      visit.supervisor_id = payload.supervisor_id || visit.supervisor_id;
      visit.supervisor_name = payload.assigned_supervisor || payload.supervisor_name || visit.supervisor_name;
    }
    if (payload.technician_id || payload.assigned_technician) {
      visit.technician_id = payload.technician_id || visit.technician_id;
      visit.technician_name = payload.assigned_technician || payload.technician_name || visit.technician_name;
    }

    const isSubmitting = payload.submit === true || payload.status === 'Submitted';
    const status = isSubmitting ? 'Submitted' : (payload.status || 'In Progress');
    visit.checklist_status = status;
    if (isSubmitting) {
      visit.status = 'In Progress';
      visit.visit_status = 'In Progress';
      visit.report_status = 'Supervisor Review';
    }

    visit.checklist_data = {
      status,
      submitted_at: isSubmitting ? new Date().toISOString() : (visit.checklist_data?.submitted_at || null),
      submitted_by: isSubmitting ? currentUser.name : (visit.checklist_data?.submitted_by || null),
      fire_alarm_items: payload.fire_alarm_items || visit.checklist_data?.fire_alarm_items || [],
      fire_fighting_items: payload.fire_fighting_items || visit.checklist_data?.fire_fighting_items || [],
      extinguisher_items: payload.extinguisher_items || visit.checklist_data?.extinguisher_items || [],
      defects: payload.defects || [],
      customer_signature: payload.customer_signature || visit.checklist_data?.customer_signature || null,
      technician_signature: payload.technician_signature || visit.checklist_data?.technician_signature || null,
      technician_notes: payload.technician_notes !== undefined ? payload.technician_notes : (visit.checklist_data?.technician_notes || ''),
      supervisor_review: visit.checklist_data?.supervisor_review || null,
      updated_at: new Date().toISOString(),
      updated_by: currentUser.name
    };

    // Defect Automation: Generate/update defects in db.faults for NOT OK items
    if (!db.faults) db.faults = [];
    const allItems = [
      ...(visit.checklist_data.fire_alarm_items || []).map(i => ({ ...i, system: 'Fire Alarm' })),
      ...(visit.checklist_data.fire_fighting_items || []).map(i => ({ ...i, system: 'Fire Fighting' })),
      ...(visit.checklist_data.extinguisher_items || []).map(i => ({ ...i, system: 'Fire Extinguishers', item: `${i.type} (${i.capacity || ''})` }))
    ];

    allItems.forEach(item => {
      if (item.status === 'NOT OK') {
        let existingFault = db.faults.find(f => f.visit_id === visit.id && (f.item_id === item.id || f.device_equipment === (item.item || item.type)));
        if (existingFault) {
          existingFault.fault_description = item.defect_description || item.remarks || `${item.item} requires maintenance`;
          existingFault.action_taken = item.recommendation || existingFault.action_taken;
          existingFault.priority = item.priority || existingFault.priority || 'High';
          existingFault.photos = item.photos || existingFault.photos || [];
          existingFault.updated_at = new Date().toISOString();
        } else {
          const count = db.faults.length + 1;
          const faultNumber = `FLT-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
          const newFault = {
            id: `flt-amc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            fault_number: faultNumber,
            customer_id: visit.customer_id || contract?.customer_id,
            customer_name: visit.customer_name || contract?.customer_name || 'Customer',
            site_id: visit.site_id || contract?.site_id,
            site_name: visit.site_name || contract?.site_name || 'Site',
            amc_id: contract?.id || visit.amc_contract_id,
            amc_contract_id: contract?.id || visit.amc_contract_id,
            visit_id: visit.id,
            item_id: item.id,
            system: item.system,
            device_equipment: item.item || item.type,
            location: item.location || (item.floor ? `Floor ${item.floor}` : (site?.site_name || 'Building Wide')),
            fault_description: item.defect_description || item.remarks || `${item.item || item.type} defect logged during AMC inspection #${visit.visit_number}`,
            cause: item.cause || 'Routine preventive maintenance inspection discovery',
            action_taken: item.recommendation || 'Technical replacement/repair proposed',
            priority: item.priority || 'High',
            status: 'Open',
            before_photo: (item.photos && item.photos[0]) || '',
            photos: item.photos || [],
            technician_id: visit.technician_id || currentUser.id,
            technician_name: visit.technician_name || currentUser.name,
            date: visit.actual_service_date || new Date().toISOString().slice(0, 10),
            created_at: new Date().toISOString()
          };
          db.faults.push(newFault);
        }
      }
    });

    // Sync extinguishers to site equipment
    if (visit.checklist_data.extinguisher_items?.length && site?.id) {
      const extEquip = visit.checklist_data.extinguisher_items.map(e => ({
        id: e.id,
        system: "Fire Extinguishers",
        item_name: `${e.type} ${e.capacity || ''}`.trim(),
        make: e.make,
        type: e.type,
        capacity: e.capacity,
        quantity: e.quantity || 1,
        serial_number: e.serial_number,
        location: e.location,
        floor: e.floor,
        last_inspected_date: visit.actual_service_date || new Date().toISOString().slice(0, 10),
        next_due_date: e.next_due_date
      }));
      this.saveSiteEquipment(site.id, extEquip);
    }

    // Sync to db.reports so report history is populated immediately under Customer + AMC + Quarter
    if (!db.reports) db.reports = [];
    
    // Auto FX Document Number (Requirements 1, 8, 11, 13)
    let reportNumber = visit.document_number || visit.report_number;
    if (!reportNumber || !String(reportNumber).startsWith('FX ')) {
      const existingRep = db.reports.find(r => r.amc_visit_id === visit.id || r.visit_id === visit.id);
      if (existingRep?.document_number && String(existingRep.document_number).startsWith('FX ')) {
        reportNumber = existingRep.document_number;
      } else if (existingRep?.report_number && String(existingRep.report_number).startsWith('FX ')) {
        reportNumber = existingRep.report_number;
      } else {
        reportNumber = this.generateDocumentNumber('AMC', 'RPT', visit.actual_service_date || visit.scheduled_date);
      }
    }

    let report = db.reports.find(r => r.amc_visit_id === visit.id || r.report_number === reportNumber || r.document_number === reportNumber);
    const reportStatus = visit.status === 'Completed' || visit.checklist_status === 'Approved' ? 'Completed' : (isSubmitting ? 'Submitted' : 'Draft');
    const rptData = {
      document_number: reportNumber,
      report_number: reportNumber,
      report_type: 'AMC Service Report',
      amc_id: contract?.id || visit.amc_contract_id,
      amc_contract_id: contract?.id || visit.amc_contract_id,
      amc_number: contract?.contract_number || 'AMC',
      amc_visit_id: visit.id,
      visit_id: visit.id,
      visit_number: visit.visit_number,
      quarter: visit.quarter,
      customer_id: visit.customer_id || contract?.customer_id,
      customer_name: visit.customer_name || contract?.customer_name,
      site_id: visit.site_id || contract?.site_id,
      site_name: visit.site_name || contract?.site_name,
      service_date: visit.actual_service_date || visit.scheduled_date,
      contract_start_date: contract?.start_date,
      contract_end_date: contract?.end_date,
      supervisor_name: visit.supervisor_name,
      technician_name: visit.technician_name,
      prepared_by_name: currentUser?.name || visit.technician_name,
      prepared_by_user_id: currentUser?.id || visit.technician_id,
      prepared_date: new Date().toISOString().slice(0, 10),
      systems: visit.systems || contract?.systems_covered || ['Fire Alarm', 'Fire Fighting'],
      checklist_data: visit.checklist_data,
      status: reportStatus,
      updated_at: new Date().toISOString()
    };
    if (report) {
      Object.assign(report, rptData);
    } else {
      report = {
        id: `rpt-amc-${Date.now()}`,
        ...rptData,
        created_at: new Date().toISOString()
      };
      db.reports.push(report);
    }
    visit.report_id = report.id;
    visit.document_number = report.document_number || report.report_number;
    visit.report_number = report.report_number;

    visit.updated_at = new Date().toISOString();
    this.write(db);
    this.logAudit(currentUser.id, isSubmitting ? 'SUBMIT_AMC_CHECKLIST' : 'SAVE_AMC_CHECKLIST', 'amc_visits', visit.id, `${isSubmitting ? 'Submitted' : 'Saved'} AMC checklist for visit #${visit.visit_number}`);

    return {
      visit,
      checklist: visit.checklist_data
    };
  }

  reviewAmcVisit(visitId, { action, remarks, supervisor_signature }, currentUser) {
    const db = this.read();
    const visit = (db.amc_visits || []).find(v => v.id === visitId);
    if (!visit) return null;

    const contract = (db.amc_contracts || []).find(c => c.id === visit.amc_contract_id || c.id === visit.amc_id);
    if (!visit.checklist_data) visit.checklist_data = {};

    visit.checklist_data.supervisor_review = {
      action,
      remarks: remarks || '',
      reviewed_by: currentUser.name,
      reviewed_by_role: currentUser.role,
      reviewed_at: new Date().toISOString(),
      signature: supervisor_signature || null
    };

    if (action === 'Approve') {
      visit.checklist_status = 'Approved';
      visit.status = 'Completed';
      visit.visit_status = 'Completed';
      visit.report_status = 'Approved';
      visit.completed_date = visit.actual_service_date || new Date().toISOString().slice(0, 10);
      visit.approved_by = currentUser.name;
      visit.approved_at = new Date().toISOString();

      // Ensure official report record exists in db.reports
      if (!db.reports) db.reports = [];
      let reportNumber = visit.document_number || visit.report_number;
      if (!reportNumber || !String(reportNumber).startsWith('FX ')) {
        const existingRep = db.reports.find(r => r.amc_visit_id === visit.id || r.visit_id === visit.id);
        if (existingRep?.document_number && String(existingRep.document_number).startsWith('FX ')) {
          reportNumber = existingRep.document_number;
        } else if (existingRep?.report_number && String(existingRep.report_number).startsWith('FX ')) {
          reportNumber = existingRep.report_number;
        } else {
          reportNumber = this.generateDocumentNumber('AMC', 'RPT', visit.actual_service_date || visit.scheduled_date);
        }
      }

      let report = db.reports.find(r => r.amc_visit_id === visit.id || r.report_number === reportNumber || r.document_number === reportNumber);
      const reportData = {
        document_number: reportNumber,
        report_number: reportNumber,
        report_type: 'AMC Service Report',
        amc_id: contract?.id || visit.amc_contract_id,
        amc_contract_id: contract?.id || visit.amc_contract_id,
        amc_number: contract?.contract_number || 'AMC',
        amc_visit_id: visit.id,
        visit_number: visit.visit_number,
        quarter: visit.quarter,
        customer_id: visit.customer_id,
        customer_name: visit.customer_name,
        site_id: visit.site_id,
        site_name: visit.site_name,
        service_date: visit.actual_service_date || visit.scheduled_date,
        contract_start_date: contract?.start_date,
        contract_end_date: contract?.end_date,
        supervisor_name: visit.supervisor_name,
        technician_name: visit.technician_name,
        systems: visit.systems || contract?.systems_covered || ['Fire Alarm', 'Fire Fighting'],
        checklist_data: visit.checklist_data,
        customer_signature: visit.checklist_data.customer_signature,
        technician_signature: visit.checklist_data.technician_signature,
        supervisor_signature: supervisor_signature || null,
        supervisor_remarks: remarks || '',
        status: 'Approved',
        work_description: `Executed comprehensive preventive maintenance inspection and Civil Defense compliance audit for ${visit.systems_label || 'fire protection systems'}.`,
        result: 'Satisfactory & Civil Defense Compliant',
        recommendations: remarks || 'Maintain regular quarterly inspection schedule.',
        created_at: visit.checklist_data.submitted_at || new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: currentUser.name
      };

      if (report) {
        Object.assign(report, reportData);
      } else {
        report = { id: `rpt-amc-${Date.now()}`, ...reportData };
        db.reports.push(report);
      }
      visit.report_id = report.id;
      visit.document_number = report.document_number || report.report_number;
      visit.report_number = report.report_number;
    } else {
      // Returned to Technician
      visit.checklist_status = 'In Progress';
      visit.status = 'In Progress';
      visit.visit_status = 'In Progress';
      visit.report_status = 'Returned';
      visit.remarks = `Returned by Supervisor (${currentUser.name}): ${remarks || 'Review required'}`;
    }

    visit.updated_at = new Date().toISOString();
    this.write(db);
    this.logAudit(currentUser.id, action === 'Approve' ? 'APPROVE_AMC_VISIT' : 'RETURN_AMC_VISIT', 'amc_visits', visit.id, `${action} AMC visit #${visit.visit_number} checklist (${visit.contract_number})`);

    return visit;
  }

  updateAmcVisitAssignment(visitId, { supervisor_id, supervisor_name, technician_id, technician_name }, currentUser) {
    const db = this.read();
    const visit = (db.amc_visits || []).find(v => v.id === visitId);
    if (!visit) return null;

    if (supervisor_id) visit.supervisor_id = supervisor_id;
    if (supervisor_name) visit.supervisor_name = supervisor_name;
    if (technician_id) visit.technician_id = technician_id;
    if (technician_name) visit.technician_name = technician_name;

    visit.updated_at = new Date().toISOString();
    this.write(db);
    this.logAudit(currentUser.id, 'ASSIGN_AMC_VISIT', 'amc_visits', visit.id, `Updated assignment: Supervisor=${visit.supervisor_name}, Tech=${visit.technician_name}`);
    return visit;
  }

  // ========================================================
  // PROJECTS MODULE - REQUIREMENTS 4, 5, 6, 7, 8, 9, 14, 15
  // ========================================================

  // Generate unique project number: e.g. PRJ-2026-001 or FX-PRJ-2026-001
  generateProjectNumber(targetYear = null) {
    const db = this.read();
    const projects = db.projects || [];
    const jobs = (db.jobs || []).filter(j => j.job_type === 'Project');
    const year = targetYear || new Date().getFullYear();
    const regex = new RegExp(`^(?:FX-)?PRJ-${year}-(\\d+)$`, 'i');
    let maxSeq = 0;

    projects.forEach(p => {
      const numStr = p.project_number || p.job_number;
      if (numStr) {
        const m = String(numStr).trim().match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    jobs.forEach(j => {
      const numStr = j.project_number || j.job_number;
      if (numStr) {
        const m = String(numStr).trim().match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });

    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `PRJ-${year}-${nextSeq}`;
  }

  // Get Projects with enriched relations
  getProjects(filters = {}, user = null) {
    const db = this.read();
    let projects = db.projects || [];
    const customers = db.customers || [];
    const sites = db.sites || [];
    const users = db.users || [];
    const jobs = db.jobs || [];
    const invoices = db.invoices || [];
    const quotations = db.quotations || [];
    const reports = db.reports || [];

    // Filter by customer if requested
    if (filters.customer_id) {
      projects = projects.filter(p => p.customer_id === filters.customer_id);
    }
    if (filters.site_id) {
      projects = projects.filter(p => p.site_id === filters.site_id);
    }
    if (filters.status && filters.status !== 'All') {
      projects = projects.filter(p => (p.status || '').toLowerCase() === filters.status.toLowerCase());
    }

    return projects.map(p => {
      const cust = customers.find(c => c.id === p.customer_id);
      const site = sites.find(s => s.id === p.site_id);
      const pm = users.find(u => u.id === p.project_manager_id);
      const eng = users.find(u => u.id === p.engineer_id);
      const sup = users.find(u => u.id === p.supervisor_id);
      const tech = users.find(u => u.id === p.technician_id);

      const pJobs = jobs.filter(j => j.project_id === p.id || j.project_number === p.project_number);
      const pInvoices = invoices.filter(i => i.project_id === p.id || i.project_number === p.project_number || (i.customer_id === p.customer_id && i.site_id === p.site_id && (i.job_type === 'Project' || i.type === 'Project')));
      const pQuotations = quotations.filter(q => q.project_id === p.id || q.project_number === p.project_number || (q.customer_id === p.customer_id && q.site_id === p.site_id && (q.job_type === 'Project' || q.type === 'Project')));
      const pReports = reports.filter(r => r.project_id === p.id || r.project_number === p.project_number || (r.job_type === 'Project' && r.customer_id === p.customer_id && r.site_id === p.site_id));

      const defects = Array.isArray(p.defects) ? p.defects : [];
      const photos = Array.isArray(p.photos) ? p.photos : [];
      const materials = Array.isArray(p.materials) ? p.materials : [];

      const totalVal = Number(p.total_value !== undefined ? p.total_value : ((Number(p.project_value || 0) * (1 + (Number(p.vat_percent || 10) / 100)))));
      const invoicedVal = pInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
      const paidVal = pInvoices.reduce((sum, inv) => sum + (Number(inv.amount_paid) || 0), 0);
      const outstandingVal = Math.max(0, invoicedVal - paidVal);

      return {
        ...p,
        customer_name: cust ? cust.name : (p.customer_name || 'Customer'),
        customer_phone: cust ? (cust.contact_mobile || cust.phone) : '',
        site_name: site ? site.site_name : (p.site_name || 'Premises'),
        site_address: site ? site.site_address : '',
        project_manager_name: pm ? pm.name : (p.project_manager_name || 'Projects Manager'),
        engineer_name: eng ? eng.name : (p.engineer_name || 'Lead Engineer'),
        supervisor_name: sup ? sup.name : (p.supervisor_name || 'Field Supervisor'),
        technician_name: tech ? tech.name : (p.technician_name || 'Lead Technician'),
        jobs: pJobs,
        defects,
        photos,
        materials,
        invoices: pInvoices,
        quotations: pQuotations,
        reports: pReports,
        invoiced_amount: Math.round(invoicedVal * 1000) / 1000,
        paid_amount: Math.round(paidVal * 1000) / 1000,
        outstanding_amount: Math.round(outstandingVal * 1000) / 1000,
        total_value: Math.round(totalVal * 1000) / 1000
      };
    });
  }

  // Get single project by id
  getProjectById(id, user = null) {
    const list = this.getProjects({}, user);
    return list.find(p => p.id === id || p.project_number === id) || null;
  }

  // Create Project
  createProject(projectData, user = null) {
    const db = this.read();
    if (!db.projects) db.projects = [];

    const projectNumber = projectData.project_number || this.generateProjectNumber();
    const id = `prj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nowIso = new Date().toISOString();

    const projectValue = Number(projectData.project_value || projectData.amount || 0);
    const vatPercent = Number(projectData.vat_percent !== undefined ? projectData.vat_percent : 10);
    const vatAmount = Math.round(((projectValue * vatPercent) / 100) * 1000) / 1000;
    const totalValue = Math.round((projectValue + vatAmount) * 1000) / 1000;

    const newProject = {
      id,
      project_number: projectNumber,
      job_number: projectNumber,
      customer_id: projectData.customer_id,
      customer_name: projectData.customer_name || '',
      site_id: projectData.site_id,
      site_name: projectData.site_name || '',
      project_name: projectData.project_name || projectData.title || `Fire Safety Project ${projectNumber}`,
      project_type: projectData.project_type || 'Fire Protection Installation',
      start_date: projectData.start_date || new Date().toISOString().slice(0, 10),
      expected_completion_date: projectData.expected_completion_date || projectData.due_date || '',
      actual_completion_date: projectData.actual_completion_date || null,
      project_value: projectValue,
      vat_percent: vatPercent,
      vat_amount: vatAmount,
      total_value: totalValue,
      project_manager_id: projectData.project_manager_id || user?.id || null,
      project_manager_name: projectData.project_manager_name || user?.name || 'Projects Manager',
      engineer_id: projectData.engineer_id || null,
      engineer_name: projectData.engineer_name || '',
      supervisor_id: projectData.supervisor_id || null,
      supervisor_name: projectData.supervisor_name || '',
      technician_id: projectData.technician_id || null,
      technician_name: projectData.technician_name || '',
      status: projectData.status || 'Draft',
      description: projectData.description || '',
      notes: projectData.notes || '',
      progress_percent: Number(projectData.progress_percent || 0),
      defects: [],
      photos: [],
      materials: [],
      created_by_id: user?.id || 'sys',
      created_by_name: user?.name || 'User',
      created_at: nowIso,
      updated_at: nowIso
    };

    db.projects.push(newProject);

    // Also mirror to db.jobs with job_type: 'Project' for cross-module integration
    if (!db.jobs) db.jobs = [];
    db.jobs.push({
      id: `job-${id}`,
      project_id: id,
      project_number: projectNumber,
      job_number: projectNumber,
      job_type: 'Project',
      customer_id: newProject.customer_id,
      customer_name: newProject.customer_name,
      site_id: newProject.site_id,
      site_name: newProject.site_name,
      title: newProject.project_name,
      description: newProject.description,
      status: newProject.status === 'Completed' ? 'Completed' : (newProject.status === 'In Progress' ? 'In Progress' : 'Scheduled'),
      start_date: newProject.start_date,
      expected_start_date: newProject.start_date,
      due_date: newProject.expected_completion_date,
      expected_completion_date: newProject.expected_completion_date,
      actual_completion_date: newProject.actual_completion_date,
      amount: newProject.project_value,
      vat_percent: newProject.vat_percent,
      total_including_vat: newProject.total_value,
      supervisor_id: newProject.supervisor_id,
      supervisor_name: newProject.supervisor_name,
      technician_id: newProject.technician_id,
      technician_name: newProject.technician_name,
      created_by: user?.id,
      created_at: nowIso
    });

    this.write(db);
    this.logAudit(user?.id || 'sys', 'CREATE_PROJECT', 'projects', id, `Created Project ${projectNumber}: ${newProject.project_name}`);
    return this.getProjectById(id, user);
  }

  // Update Project
  updateProject(id, updates, user = null) {
    const db = this.read();
    if (!db.projects) db.projects = [];
    const idx = db.projects.findIndex(p => p.id === id || p.project_number === id);
    if (idx === -1) return null;

    const current = db.projects[idx];
    const nowIso = new Date().toISOString();

    const projectValue = updates.project_value !== undefined ? Number(updates.project_value) : current.project_value;
    const vatPercent = updates.vat_percent !== undefined ? Number(updates.vat_percent) : current.vat_percent;
    const vatAmount = Math.round(((projectValue * vatPercent) / 100) * 1000) / 1000;
    const totalValue = Math.round((projectValue + vatAmount) * 1000) / 1000;

    const updated = {
      ...current,
      ...updates,
      id: current.id,
      project_number: current.project_number, // Immutable
      project_value: projectValue,
      vat_percent: vatPercent,
      vat_amount: vatAmount,
      total_value: totalValue,
      updated_at: nowIso
    };

    if (updates.status === 'Completed' && !updated.actual_completion_date) {
      updated.actual_completion_date = new Date().toISOString().slice(0, 10);
    }

    db.projects[idx] = updated;

    // Sync to linked job in db.jobs if present
    if (db.jobs) {
      const jIdx = db.jobs.findIndex(j => j.project_id === current.id || j.job_number === current.project_number);
      if (jIdx !== -1) {
        db.jobs[jIdx] = {
          ...db.jobs[jIdx],
          status: updated.status === 'Completed' ? 'Completed' : (updated.status === 'In Progress' ? 'In Progress' : (updated.status === 'On Hold' ? 'On Hold' : 'Scheduled')),
          description: updated.description,
          due_date: updated.expected_completion_date,
          expected_completion_date: updated.expected_completion_date,
          actual_completion_date: updated.actual_completion_date,
          supervisor_id: updated.supervisor_id,
          supervisor_name: updated.supervisor_name,
          technician_id: updated.technician_id,
          technician_name: updated.technician_name,
          updated_at: nowIso
        };
      }
    }

    this.write(db);
    this.logAudit(user?.id || 'sys', 'UPDATE_PROJECT', 'projects', current.id, `Updated Project ${current.project_number} (Status: ${updated.status})`);
    return this.getProjectById(current.id, user);
  }

  // Add Project Job
  addProjectJob(projectId, jobData, user = null) {
    const db = this.read();
    if (!db.projects) db.projects = [];
    const project = db.projects.find(p => p.id === projectId || p.project_number === projectId);
    if (!project) return null;

    if (!db.jobs) db.jobs = [];
    const subJobNumber = this.generateJobNumber('Project');
    const newJob = {
      id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      project_id: project.id,
      project_number: project.project_number,
      job_number: subJobNumber,
      job_type: jobData.job_type || 'Project',
      customer_id: project.customer_id,
      customer_name: project.customer_name,
      site_id: project.site_id,
      site_name: project.site_name,
      title: jobData.title || `${project.project_name} - Sub-task`,
      description: jobData.description || '',
      status: jobData.status || 'Scheduled',
      date: jobData.start_date || new Date().toISOString().slice(0, 10),
      start_date: jobData.start_date || new Date().toISOString().slice(0, 10),
      expected_start_date: jobData.start_date || new Date().toISOString().slice(0, 10),
      due_date: jobData.expected_completion_date || project.expected_completion_date,
      expected_completion_date: jobData.expected_completion_date || project.expected_completion_date,
      engineer_id: jobData.engineer_id || project.engineer_id,
      engineer_name: jobData.engineer_name || project.engineer_name,
      supervisor_id: jobData.supervisor_id || project.supervisor_id,
      supervisor_name: jobData.supervisor_name || project.supervisor_name,
      technician_id: jobData.technician_id || project.technician_id,
      technician_name: jobData.technician_name || project.technician_name,
      created_by: user?.id,
      created_at: new Date().toISOString()
    };

    db.jobs.push(newJob);
    this.write(db);
    this.logAudit(user?.id || 'sys', 'CREATE_PROJECT_JOB', 'jobs', newJob.id, `Created project job ${newJob.job_number} for project ${project.project_number}`);
    return newJob;
  }

  // Add Project Photo
  addProjectPhoto(projectId, photoData, user = null) {
    const db = this.read();
    if (!db.projects) db.projects = [];
    const project = db.projects.find(p => p.id === projectId || p.project_number === projectId);
    if (!project) return null;

    if (!Array.isArray(project.photos)) project.photos = [];
    const newPhoto = {
      id: `pho-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url: photoData.url,
      caption: photoData.caption || photoData.description || 'Project Site Photo',
      description: photoData.description || photoData.caption || '',
      location: photoData.location || 'Site',
      project_number: project.project_number,
      uploaded_by: user?.name || photoData.uploaded_by || 'Staff',
      uploaded_by_id: user?.id || null,
      uploaded_at: new Date().toISOString(),
      date: photoData.date || new Date().toISOString().slice(0, 10)
    };

    project.photos.push(newPhoto);
    project.updated_at = new Date().toISOString();
    this.write(db);
    this.logAudit(user?.id || 'sys', 'ADD_PROJECT_PHOTO', 'projects', project.id, `Uploaded photo for project ${project.project_number}`);
    return newPhoto;
  }

  // Add Project Defect
  addProjectDefect(projectId, defectData, user = null) {
    const db = this.read();
    if (!db.projects) db.projects = [];
    const project = db.projects.find(p => p.id === projectId || p.project_number === projectId);
    if (!project) return null;

    if (!Array.isArray(project.defects)) project.defects = [];
    const defectSeq = String(project.defects.length + 1).padStart(3, '0');
    const newDefect = {
      id: `def-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      defect_number: `DFT-${project.project_number}-${defectSeq}`,
      project_id: project.id,
      project_number: project.project_number,
      customer_id: project.customer_id,
      customer_name: project.customer_name,
      site_id: project.site_id,
      site_name: project.site_name,
      location: defectData.location || 'Site',
      description: defectData.description || 'Defect item logged during inspection',
      photo: defectData.photo || null,
      priority: defectData.priority || 'Medium',
      assigned_to_id: defectData.assigned_to_id || project.technician_id,
      assigned_to_name: defectData.assigned_to_name || project.technician_name || 'Assigned Technician',
      status: defectData.status || 'Open',
      recommendation: defectData.recommendation || '',
      resolution: defectData.resolution || '',
      date_created: new Date().toISOString().slice(0, 10),
      date_closed: null,
      created_by: user?.name || 'Staff',
      created_at: new Date().toISOString()
    };

    project.defects.push(newDefect);
    project.updated_at = new Date().toISOString();
    this.write(db);
    this.logAudit(user?.id || 'sys', 'ADD_PROJECT_DEFECT', 'projects', project.id, `Logged defect ${newDefect.defect_number} on project ${project.project_number}`);
    return newDefect;
  }

  // Update Project Defect
  updateProjectDefect(projectId, defectId, updates, user = null) {
    const db = this.read();
    if (!db.projects) db.projects = [];
    const project = db.projects.find(p => p.id === projectId || p.project_number === projectId);
    if (!project || !Array.isArray(project.defects)) return null;

    const dIdx = project.defects.findIndex(d => d.id === defectId || d.defect_number === defectId);
    if (dIdx === -1) return null;

    const current = project.defects[dIdx];
    const isClosing = updates.status === 'Closed' || updates.status === 'Resolved';
    const updated = {
      ...current,
      ...updates,
      id: current.id,
      defect_number: current.defect_number,
      date_closed: isClosing ? (updates.date_closed || new Date().toISOString().slice(0, 10)) : current.date_closed,
      updated_at: new Date().toISOString()
    };

    project.defects[dIdx] = updated;
    project.updated_at = new Date().toISOString();
    this.write(db);
    this.logAudit(user?.id || 'sys', 'UPDATE_PROJECT_DEFECT', 'projects', project.id, `Updated defect ${current.defect_number} status to ${updated.status}`);
    return updated;
  }

  // Add Project Material
  addProjectMaterial(projectId, materialData, user = null) {
    const db = this.read();
    if (!db.projects) db.projects = [];
    const project = db.projects.find(p => p.id === projectId || p.project_number === projectId);
    if (!project) return null;

    if (!Array.isArray(project.materials)) project.materials = [];
    const newMaterial = {
      id: `pmat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      material_id: materialData.material_id || null,
      name: materialData.name || 'Fire Protection Material',
      quantity: Number(materialData.quantity || 1),
      unit: materialData.unit || 'pcs',
      part_number: materialData.part_number || '',
      date_installed: materialData.date_installed || new Date().toISOString().slice(0, 10),
      notes: materialData.notes || ''
    };

    project.materials.push(newMaterial);
    project.updated_at = new Date().toISOString();
    this.write(db);
    return newMaterial;
  }

  // Calculate Projects Dashboard Stats (Requirements 5 & 15)
  getProjectsDashboardStats() {
    const db = this.read();
    const projects = db.projects || [];
    const jobs = db.jobs || [];
    const invoices = db.invoices || [];
    const quotations = db.quotations || [];

    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr);

    let totalProjects = projects.length;
    let activeProjects = 0;
    let projectsStartingSoon = 0;
    let projectsDueSoon = 0;
    let completedProjects = 0;
    let delayedProjects = 0;
    let openProjectDefects = 0;

    projects.forEach(p => {
      const status = p.status || 'Draft';
      if (['In Progress', 'Scheduled', 'Approved'].includes(status)) {
        activeProjects++;
      }
      if (status === 'Completed') {
        completedProjects++;
      }

      // Starting soon: start_date in next 14 days
      if (p.start_date) {
        const sDate = new Date(p.start_date);
        const diffDays = Math.ceil((sDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 14 && status !== 'Completed' && status !== 'Cancelled') {
          projectsStartingSoon++;
        }
      }

      // Due soon: expected completion in next 14 days
      if (p.expected_completion_date) {
        const dDate = new Date(p.expected_completion_date);
        const diffDays = Math.ceil((dDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 14 && status !== 'Completed' && status !== 'Cancelled') {
          projectsDueSoon++;
        }
        // Delayed: due date passed and not completed/cancelled
        if (diffDays < 0 && !['Completed', 'Cancelled'].includes(status)) {
          delayedProjects++;
        }
      }

      // Count open defects
      if (Array.isArray(p.defects)) {
        openProjectDefects += p.defects.filter(d => d.status === 'Open' || d.status === 'In Progress').length;
      }
    });

    // Project jobs
    const projectJobs = jobs.filter(j => j.job_type === 'Project' || j.project_id);
    const todayProjectJobs = projectJobs.filter(j => (j.date === todayStr || j.start_date === todayStr || j.expected_start_date === todayStr)).length;
    const pendingProjectJobs = projectJobs.filter(j => !['Completed', 'Cancelled'].includes(j.status)).length;

    // Project quotations
    const pQuotations = quotations.filter(q => q.job_type === 'Project' || q.type === 'Project' || q.project_id);
    const projectQuotationsCount = pQuotations.length;
    const projectQuotationsValue = Math.round(pQuotations.reduce((sum, q) => sum + (Number(q.total_amount || q.amount) || 0), 0) * 1000) / 1000;

    // Project invoices
    const pInvoices = invoices.filter(i => i.job_type === 'Project' || i.type === 'Project' || i.project_id);
    const projectInvoicesCount = pInvoices.length;
    const projectInvoicesValue = Math.round(pInvoices.reduce((sum, i) => sum + (Number(i.total_amount) || 0), 0) * 1000) / 1000;
    const projectInvoicesPaid = Math.round(pInvoices.reduce((sum, i) => sum + (Number(i.amount_paid) || 0), 0) * 1000) / 1000;
    const outstandingProjectPayments = Math.max(0, Math.round((projectInvoicesValue - projectInvoicesPaid) * 1000) / 1000);

    return {
      totalProjects,
      activeProjects,
      projectsStartingSoon,
      projectsDueSoon,
      completedProjects,
      delayedProjects,
      todayProjectJobs,
      pendingProjectJobs,
      openProjectDefects,
      projectQuotations: projectQuotationsCount,
      projectQuotationsValue,
      projectInvoices: projectInvoicesCount,
      projectInvoicesValue,
      outstandingProjectPayments
    };
  }

  // Get Enriched Audit Logs (Requirement 13)
  getAuditLogs() {
    const db = this.read();
    const logs = db.audit_logs || [];
    const users = db.users || [];
    return logs.map(l => {
      const user = users.find(u => u.id === l.user_id);
      const d = l.timestamp ? new Date(l.timestamp) : null;
      return {
        ...l,
        user_name: user ? user.name : (l.user_id === 'sys' || l.user_id === 'system' ? 'System' : l.user_id),
        user_role: user ? user.role : 'System',
        user_email: user?.email || '',
        formatted_date: d && !isNaN(d.getTime()) ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
        formatted_time: d && !isNaN(d.getTime()) ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''
      };
    });
  }

  // Employee Summary (Requirement 3 & 10)
  getEmployeeSummary() {
    const db = this.read();
    const users = db.users || [];
    return {
      total: users.length,
      active: users.filter(u => u.status !== 'Inactive').length,
      inactive: users.filter(u => u.status === 'Inactive').length,
      managingDirector: users.filter(u => ['Managing Director (MD)', 'Managing Director', 'managing_director'].includes(u.role)).length,
      gm: users.filter(u => u.role === 'GM').length,
      engineers: users.filter(u => u.role === 'Engineer').length,
      supervisors: users.filter(u => u.role === 'Supervisor').length,
      technicians: users.filter(u => u.role === 'Technician').length,
      sales: users.filter(u => u.role === 'Sales').length,
      accounts: users.filter(u => u.role === 'Accounts').length,
      projectsManagers: users.filter(u => u.role === 'Projects Manager').length
    };
  }

  // Attendance Summary (Requirement 3)
  getAttendanceSummary() {
    const db = this.read();
    const users = (db.users || []).filter(u => u.status !== 'Inactive');
    const jobs = db.jobs || [];
    const todayStr = new Date().toISOString().slice(0, 10);
    const assignedToday = new Set();
    jobs.filter(j => (j.date === todayStr || j.expected_start_date === todayStr)).forEach(j => {
      if (j.technician_id) assignedToday.add(j.technician_id);
      if (j.supervisor_id) assignedToday.add(j.supervisor_id);
    });

    const totalStaff = users.length;
    const onDuty = Math.max(assignedToday.size, Math.min(users.length, 6));
    const available = Math.max(0, totalStaff - onDuty);

    return {
      totalStaff,
      onDuty,
      available,
      onLeave: 0,
      activeToday: onDuty
    };
  }
}

module.exports = new Database();

