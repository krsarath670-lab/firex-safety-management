const fs = require('fs');
const path = require('path');

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
    reminder_days: [90, 60, 30, 7]
  },
  users: [
    {
      id: "usr-gm",
      name: "Ahmed Al-Mansoor",
      email: "gm@firexbahrain.com",
      role: "GM",
      phone: "+973 3944 1122",
      designation: "General Manager",
      avatar: "AM"
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
        this.memoryCache = res.rows[0].data;
        console.log('[FIREX DB] PostgreSQL cloud database state loaded successfully.');
      } else {
        const initialData = fs.existsSync(this.filePath)
          ? JSON.parse(fs.readFileSync(this.filePath, 'utf8'))
          : initialSeed;
        this.memoryCache = initialData;
        await this.pgPool.query(
          'INSERT INTO firex_store (key, data, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()',
          ['app_state', initialData]
        );
        console.log('[FIREX DB] Initialized and seeded persistent cloud PostgreSQL database.');
      }
    } catch (e) {
      console.error('[FIREX DB] Error during PostgreSQL initialization:', e);
    }
  }

  read() {
    if (this.isPostgres && this.memoryCache) {
      return this.memoryCache;
    }
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading DB, restoring initial seed:', e);
      this.write(initialSeed);
      return initialSeed;
    }
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

  // Generate unique job number based on type and year: e.g. FIT-2026-003
  generateJobNumber(jobType) {
    const db = this.read();
    const jobs = db.jobs || [];
    const prefixMap = {
      'AMC': 'AMC',
      'Fit-out': 'FIT',
      'Supply': 'SUP',
      'Project': 'PRJ',
      'Breakdown': 'BRK',
      'Installation': 'INS',
      'Testing & Commissioning': 'TST',
      'Inspection': 'INSP'
    };
    const prefix = prefixMap[jobType] || 'JOB';
    const year = new Date().getFullYear();
    const regex = new RegExp(`^${prefix}-${year}-(\\d+)$`);
    let maxSeq = 0;
    jobs.forEach(j => {
      if (j.job_number) {
        const m = j.job_number.match(regex);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    });
    const nextSeq = String(maxSeq + 1).padStart(3, '0');
    return `${prefix}-${year}-${nextSeq}`;
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

  // Helper to add months to date
  // Helper to add months to date
  addMonthsToDate(dateStr, months) {
    const d = new Date(dateStr || new Date());
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  }

  // Derived Quarter from date string (Requirement 9 & 32: Q1, Q2, Q3, Q4)
  getQuarter(dateStr) {
    if (!dateStr) return 'Q1';
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

  // Automatic AMC Visit Generator (Requirements 5, 6, 7, 31, 32)
  generateAmcVisits(contract) {
    const db = this.read();
    if (!db.amc_visits) db.amc_visits = [];
    const settings = this.getSettings();
    const users = db.users || [];
    const sp = users.find(u => u.id === contract.sales_person_id);
    const salesPersonName = sp ? sp.name : (contract.sales_person_name || 'Unassigned');

    const freqs = settings.amc_frequencies || {
      "Fire Alarm": { interval_months: 3, visits_per_year: 4 },
      "Fire Fighting": { interval_months: 3, visits_per_year: 4 },
      "Fire Extinguishers": { interval_months: 6, visits_per_year: 2 }
    };

    let systems = contract.systems || contract.systems_covered || ["Fire Alarm"];
    if (typeof systems === 'string') {
      systems = [systems];
    }

    const createdVisits = [];
    systems.forEach(sys => {
      // Normalize system name to match frequency config
      let matchedConfig = freqs[sys];
      if (!matchedConfig) {
        if (sys.toLowerCase().includes('alarm')) matchedConfig = freqs["Fire Alarm"];
        else if (sys.toLowerCase().includes('extinguish')) matchedConfig = freqs["Fire Extinguishers"];
        else matchedConfig = freqs["Fire Fighting"];
      }
      matchedConfig = matchedConfig || { interval_months: 3, visits_per_year: 4 };

      for (let v = 1; v <= matchedConfig.visits_per_year; v++) {
        // Prevent duplicate visit check: contract.id + sys + visit_number
        const existing = db.amc_visits.find(
          vis => (vis.amc_contract_id === contract.id || vis.amc_id === contract.id) &&
                 (vis.system_type === sys || vis.system === sys) &&
                 vis.visit_number === v
        );

        if (!existing) {
          const scheduledDate = this.addMonthsToDate(contract.start_date, (v - 1) * matchedConfig.interval_months);
          const quarter = this.getQuarter(scheduledDate);
          const dayName = this.getDayName(scheduledDate);

          const newVisit = {
            id: `vis-${contract.id}-${sys.replace(/\s+/g, '').toLowerCase()}-${v}-${Math.floor(Math.random()*1000)}`,
            amc_contract_id: contract.id,
            amc_id: contract.id,
            contract_number: contract.contract_number,
            customer_id: contract.customer_id,
            site_id: contract.site_id,
            sales_person_id: contract.sales_person_id || null,
            sales_person_name: salesPersonName,
            system_type: sys,
            system: sys,
            visit_number: v,
            scheduled_date: scheduledDate,
            quarter: quarter,
            day: dayName,
            day_of_week: dayName,
            assigned_team: "Team Alpha (Tariq & Rajesh)",
            assigned_technician: contract.technician_id || "usr-tech",
            technician_id: contract.technician_id || "usr-tech",
            supervisor_id: contract.supervisor_id || "usr-sup",
            status: "Scheduled",
            visit_status: "Scheduled",
            remarks: `Routine ${sys} safety compliance inspection #${v}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          db.amc_visits.push(newVisit);
          createdVisits.push(newVisit);
        } else {
          // Keep existing, but ensure quarter and sales_person_id are populated
          existing.quarter = existing.quarter || this.getQuarter(existing.scheduled_date);
          existing.day = existing.day || this.getDayName(existing.scheduled_date);
          existing.day_of_week = existing.day_of_week || existing.day || this.getDayName(existing.scheduled_date);
          existing.sales_person_id = contract.sales_person_id || existing.sales_person_id;
          existing.sales_person_name = salesPersonName;
          createdVisits.push(existing);
        }
      }
    });

    this.write(db);
    return createdVisits;
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

    // If start_date, end_date or systems changed (Requirement 7):
    const datesChanged = (updates.start_date && updates.start_date !== oldContract.start_date) ||
                         (updates.end_date && updates.end_date !== oldContract.end_date);
    const systemsChanged = updates.systems || updates.systems_covered;

    if (datesChanged || systemsChanged) {
      const reports = db.reports || [];
      if (db.amc_visits) {
        // PRESERVE historical completed visits and visits with existing reports
        // Remove only future Scheduled visits
        db.amc_visits = db.amc_visits.filter(vis => {
          const isThisContract = (vis.amc_contract_id === id || vis.amc_id === id);
          if (!isThisContract) return true;
          const isCompleted = vis.status === 'Completed' || reports.some(r => r.visit_id === vis.id);
          return isCompleted; // keep completed only, remove scheduled to recalculate
        });

        this.write(db);
        // Re-generate future visits for the updated contract period
        this.generateAmcVisits(updatedContract);
      }
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
        technician_name: tech ? tech.name : 'Rajesh Kumar',
        supervisor_id: supId,
        supervisor_name: sup ? sup.name : 'Tariq Mahmoud',
        contract_number: v.contract_number || (contract ? contract.contract_number : 'AMC-2026'),
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
      return {
        ...v,
        quarter: v.quarter || this.getQuarter(v.scheduled_date),
        day: v.day || this.getDayName(v.scheduled_date),
        status: v.status || v.visit_status || 'Scheduled',
        customer_name: cust ? cust.name : 'Unknown Customer',
        site_name: site ? site.site_name : 'Unknown Site',
        sales_person_name: sp ? sp.name : (v.sales_person_name || 'Unassigned'),
        technician_name: tech ? tech.name : 'Rajesh Kumar'
      };
    };

    return {
      today: visits.filter(v => v.scheduled_date === todayStr).map(enrich),
      next7Days: visits.filter(v => v.scheduled_date >= todayStr && v.scheduled_date <= d7Str).map(enrich),
      next30Days: visits.filter(v => v.scheduled_date >= todayStr && v.scheduled_date <= d30Str).map(enrich)
    };
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
}

module.exports = new Database();
