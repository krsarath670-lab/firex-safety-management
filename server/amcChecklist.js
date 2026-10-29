/**
 * FIREX Digital AMC Checklist & Service Report Engine
 * Complies with Bahrain Civil Defense inspection requirements and FIREX standard procedures.
 * Supports Multi-Building Sites and Independent Checklists per Building.
 */

const SYSTEM_DEFINITIONS = [
  { key: 'fire_alarm', label: 'Fire Alarm System', description: 'Addressable & Conventional Control Panels, Detectors, Call Points, Audio/Visuals & Interlocks' },
  { key: 'fire_fighting', label: 'Fire Fighting System', description: 'Pumps, Jockey, Diesel, Water Tanks, Sprinklers, Hydrants & Valves' },
  { key: 'fire_hose_reels', label: 'Fire Hose Reel System', description: 'Swing Drums, Hoses, Shut-Off Nozzles, Inlets & Water Flow Verification' },
  { key: 'landing_valves', label: 'Landing Valve System', description: 'Dry/Wet Riser Landing Valves, Couplings, Handwheels, Pressure & Seals' },
  { key: 'fire_extinguishers', label: 'Fire Extinguishers', description: 'DCP, CO2, Foam, Wet Chemical, Clean Agent Inspection & Weight/Pressure Verification' },
  { key: 'fm200_suppression', label: 'FM200 / Clean Agent Fire Suppression', description: 'Cylinder Pressure/Weight, Solenoid, Abort Switch, Room Enclosure & Gas Interlocks' },
  { key: 'lpg_detection', label: 'LPG Gas Detection System', description: 'Gas Sensors, Panel, Solenoid Shut-off Valve, Fan Interlock & Calibration' },
  { key: 'emergency_lights', label: 'Emergency Lights', description: 'Twin Spot & Maintained Emergency Luminaires, Battery Duration & Charging' },
  { key: 'exit_lights', label: 'Exit Lights', description: 'Maintained LED Exit Signs, Pictograms, Directional Arrows & Battery Backup' },
  { key: 'voice_evacuation', label: 'Voice Evacuation / Other Systems', description: 'Voice Alarm Console, Microphones, Audio Zones Clarity & Recorded Alerts' }
];

const DEFAULT_FIRE_ALARM_ITEMS = [
  { item_no: 1, item: "Main Fire Alarm Control Panel (FACP)", make: "", type: "Addressable FACP", quantity: "", status: "OK", remarks: "Standby normal, zero active faults" },
  { item_no: 2, item: "No. of Zones / Addressable Loops", make: "", type: "Addressable Loop", quantity: "", status: "OK", remarks: "All loops reporting normal communication" },
  { item_no: 3, item: "Loop Circuit Continuity & Isolators", make: "", type: "Loop Isolators", quantity: "", status: "OK", remarks: "Full loop continuity confirmed" },
  { item_no: 4, item: "Protocol & Polling Speed", make: "", type: "FlashScan / CLIP", quantity: "", status: "OK", remarks: "Polling speed normal" },
  { item_no: 5, item: "A/C Primary Mains Power Supply", make: "", type: "230V AC Dedicated Supply", quantity: "", status: "OK", remarks: "Mains healthy, breaker locked ON" },
  { item_no: 6, item: "Standby Battery Backup & Charger", make: "", type: "12V 17Ah SLA Standby", quantity: "", status: "OK", remarks: "Float voltage 27.4V, load test passed" },
  { item_no: 7, item: "Optical Smoke Detectors", make: "", type: "Optical Smoke Detector", quantity: "", status: "OK", remarks: "Sample aerosol response within 10s" },
  { item_no: 8, item: "Thermal / Heat Detectors", make: "", type: "Rate-of-Rise / Fixed Temp", quantity: "", status: "OK", remarks: "Kitchen and plant room sensors tested" },
  { item_no: 9, item: "Multi-Criteria Optical/Heat Sensors", make: "", type: "Optical / Heat Multi", quantity: "", status: "OK", remarks: "Clean, sensitivity verified" },
  { item_no: 10, item: "Manual Call Points / Break Glass", make: "", type: "Manual Call Point (Resettable)", quantity: "", status: "OK", remarks: "Tested with key, alarm initiated at FACP" },
  { item_no: 11, item: "Monitor & Control Modules", make: "", type: "I/O Interface Modules", quantity: "", status: "OK", remarks: "Interlock signals verified" },
  { item_no: 12, item: "Electronic Alarm Sounders", make: "", type: "Electronic Sounder 24V", quantity: "", status: "OK", remarks: "Sound level > 85 dB(A) at 3m" },
  { item_no: 13, item: "Sounder Beacon / Strobe Lights", make: "", type: "Sounder Beacon VAD", quantity: "", status: "OK", remarks: "Audible & flashing synchronized" },
  { item_no: 14, item: "Motorized Fire Alarm Bells", make: "", type: "Motorized 6\" / 8\" Fire Bell", quantity: "", status: "OK", remarks: "Clear audible strike confirmed" },
  { item_no: 15, item: "Auxiliary Warning Devices / Horns", make: "", type: "Aux Voice / Warning Device", quantity: "", status: "OK", remarks: "Auxiliary warning horn operational" },
  { item_no: 16, item: "Optical Beam Smoke Detectors", make: "", type: "Reflective Optical Beam", quantity: "", status: "OK", remarks: "Atrium beam alignment and obscuration test passed" },
  { item_no: 17, item: "Auxiliary Contacts (AHU / Elevator / Doors)", make: "", type: "Interlock Contacts", quantity: "", status: "OK", remarks: "AHU trip and elevator grounding interlocks tested" },
  { item_no: 18, item: "Civil Defense Auto-Dialer Link", make: "", type: "24/7 Transmitter Link", quantity: "", status: "OK", remarks: "Civil Defense communication line healthy" },
  { item_no: 19, item: "Network Link to Master Panel / Repeater", make: "", type: "RS-485 / Fiber Optic Link", quantity: "", status: "OK", remarks: "Repeater receiving events normally" },
  { item_no: 20, item: "FACP LEDs, Buzzer & Display", make: "", type: "LED Status Bar & Backlit LCD", quantity: "", status: "OK", remarks: "Lamp test function executed, zero dead pixels" },
  { item_no: 21, item: "Fire Resistant Cabling & Conduits", make: "", type: "2-Core 1.5mm Fire Resistant", quantity: "", status: "OK", remarks: "Insulation and conduit sound" }
];

const DEFAULT_FIRE_FIGHTING_ITEMS = [
  { item_no: 1, item: "Main Electric Fire Pump", make: "", type: "Centrifugal 750 GPM @ 10 Bar", quantity: "", status: "OK", remarks: "Bearing temperature & auto-start normal" },
  { item_no: 2, item: "Standby Diesel Fire Pump", make: "", type: "Emergency Diesel Backup Pump", quantity: "", status: "OK", remarks: "Battery cranking normal, fuel & coolant level 100%" },
  { item_no: 3, item: "Jockey Pressure-Maintenance Pump", make: "", type: "Vertical Multistage 15 GPM", quantity: "", status: "OK", remarks: "Cut-in at 8.5 bar, cut-out at 10.5 bar" },
  { item_no: 4, item: "UL/FM Dual Pump Controller", make: "", type: "Automatic Electric/Diesel Controller", quantity: "", status: "OK", remarks: "Phase monitoring & auto-transfer switch tested" },
  { item_no: 5, item: "Dedicated Fire Water Storage Tank", make: "", type: "10,000 Gallon Water Tank", quantity: "", status: "OK", remarks: "Water level 100%, float valve operational" },
  { item_no: 6, item: "Suction & Discharge OS&Y Gate Valves", make: "", type: "OS&Y Gate & Butterfly Valves", quantity: "", status: "OK", remarks: "All valves supervised and locked in OPEN position" },
  { item_no: 7, item: "Glycerin-Filled Pressure Gauges", make: "", type: "0-25 bar Dial Gauges", quantity: "", status: "OK", remarks: "Zero calibration verified, readable dials" },
  { item_no: 8, item: "Automatic Fire Sprinkler System", make: "", type: "Pendent Glass Bulb 68°C", quantity: "", status: "OK", remarks: "Glass bulbs intact, deflectors unobstructed" },
  { item_no: 9, item: "Sprinkler Alarm Check Valve & Water Gong", make: "", type: "Alarm Check Valve & Motor Gong", quantity: "", status: "OK", remarks: "Retard chamber & water motor gong tested" },
  { item_no: 10, item: "Outdoor Pillar Fire Hydrants 2.5\"", make: "", type: "Pillar Hydrant 2-Way 2.5\"", quantity: "", status: "OK", remarks: "Valve spindle lubricated, caps greased" },
  { item_no: 11, item: "4-Way Dry/Wet Riser Breeching Inlet", make: "", type: "4-Way Breeching Inlet", quantity: "", status: "OK", remarks: "Drain valve clear, clack valves seated properly" },
  { item_no: 12, item: "Fire Brigade Connection (FBC)", make: "", type: "Storz FBC 4\" Inlet", quantity: "", status: "OK", remarks: "Caps chained, clear access from road" },
  { item_no: 13, item: "Heavy Duty Fire Blankets", make: "", type: "Fiberglass 1.2m x 1.8m", quantity: "", status: "OK", remarks: "Pouch clean, release straps accessible" }
];

const DEFAULT_HOSE_REELS = [
  {
    id: "hr-1",
    reel_id: "HR-01",
    building_number: "1",
    floor: "Ground Floor",
    location: "Main Entrance Corridor by Core A",
    type: "Manual Swing Arm Drum",
    make: "",
    cabinet_condition: "OK",
    hose_condition: "OK",
    nozzle_operation: "OK",
    valve_operation: "OK",
    leakage_test: "OK",
    water_flow_test: "OK",
    status: "OK",
    remarks: "Unreeled 30m, dynamic jet spray tested, smooth rewind",
    photos: []
  },
  {
    id: "hr-2",
    reel_id: "HR-02",
    building_number: "1",
    floor: "1st Floor",
    location: "Corridor Outside Unit 101",
    type: "Manual Swing Arm Drum",
    make: "",
    cabinet_condition: "OK",
    hose_condition: "OK",
    nozzle_operation: "OK",
    valve_operation: "OK",
    leakage_test: "OK",
    water_flow_test: "OK",
    status: "OK",
    remarks: "Cabinet glass clean, pressure and jet flow normal",
    photos: []
  }
];

const DEFAULT_LANDING_VALVES = [
  {
    id: "lv-1",
    valve_id: "LV-01",
    building_number: "1",
    floor: "Ground Floor",
    location: "Emergency Staircase Enclosure Landing",
    valve_condition: "OK",
    accessibility: "OK",
    cabinet_condition: "OK",
    cap_chain: "OK",
    handwheel_operation: "OK",
    coupling_condition: "OK",
    leakage_check: "OK",
    pressure_flow_test: "OK",
    status: "OK",
    remarks: "Instantaneous 2.5\" coupling washer intact, no seal weeping under 10 bar",
    photos: []
  },
  {
    id: "lv-2",
    valve_id: "LV-02",
    building_number: "1",
    floor: "1st Floor",
    location: "Emergency Staircase Enclosure Landing",
    valve_condition: "OK",
    accessibility: "OK",
    cabinet_condition: "OK",
    cap_chain: "OK",
    handwheel_operation: "OK",
    coupling_condition: "OK",
    leakage_check: "OK",
    pressure_flow_test: "OK",
    status: "OK",
    remarks: "Handwheel lubricated, blank cap chain secured",
    photos: []
  }
];

const DEFAULT_EXTINGUISHERS = [
  {
    id: "ext-1",
    ext_id: "EXT-01",
    building_number: "1",
    type: "CO2 (Carbon Dioxide)",
    make: "",
    capacity: "5 kg",
    serial_number: "FX-CO2-9841",
    location: "Main Electrical Switchgear Room",
    floor: "Basement 1",
    condition: "OK",
    pressure_gauge: "N/A", // Gauge not applicable for CO2
    weight_status: "OK", // Critical for CO2
    safety_pin: "OK",
    hose_nozzle: "OK",
    cylinder_body: "OK",
    signage_bracket: "OK",
    status: "OK",
    remarks: "Gross weight 11.8 kg (Tare 6.8 kg + Charge 5.0 kg), horn clean",
    photos: [],
    date_done: new Date().toISOString().slice(0, 10),
    next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  },
  {
    id: "ext-2",
    ext_id: "EXT-02",
    building_number: "1",
    type: "ABC Dry Chemical Powder",
    make: "",
    capacity: "6 kg",
    serial_number: "FX-DCP-5520",
    location: "Corridor by Staircase Core A",
    floor: "Ground Floor",
    condition: "OK",
    pressure_gauge: "OK", // Needle in green
    weight_status: "OK",
    safety_pin: "OK",
    hose_nozzle: "OK",
    cylinder_body: "OK",
    signage_bracket: "OK",
    status: "OK",
    remarks: "Pressure gauge in green band (14 bar), tamper seal intact",
    photos: [],
    date_done: new Date().toISOString().slice(0, 10),
    next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  },
  {
    id: "ext-3",
    ext_id: "EXT-03",
    building_number: "1",
    type: "Wet Chemical (Class K/F)",
    make: "",
    capacity: "6 Liters",
    serial_number: "FX-WC-3312",
    location: "Commercial Kitchen Cooking Line",
    floor: "1st Floor",
    condition: "OK",
    pressure_gauge: "OK",
    weight_status: "OK",
    safety_pin: "OK",
    hose_nozzle: "OK",
    cylinder_body: "OK",
    signage_bracket: "OK",
    status: "OK",
    remarks: "Applicator lance clean and unobstructed, charge pressure healthy",
    photos: [],
    date_done: new Date().toISOString().slice(0, 10),
    next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  }
];

const DEFAULT_FM200 = [
  {
    id: "fm-1",
    system_tag: "FM200-SYS-01",
    building_number: "1",
    room_name: "Primary Data Center & Server Room",
    floor: "1st Floor",
    cylinder_pressure: "OK",
    liquid_weight: "OK",
    piping_nozzles: "OK",
    actuator_solenoid: "OK",
    manual_release: "OK",
    abort_switch: "OK",
    cross_zoning_detection: "OK",
    warning_devices: "OK",
    damper_interlock: "OK",
    room_integrity_enclosure: "OK",
    main_reserve_switch: "OK",
    status: "OK",
    remarks: "Cylinder pressure 25 bar @ 21°C. 1st & 2nd stage cross-zoning sirens verified. Door seals tight.",
    photos: []
  }
];

const DEFAULT_LPG = [
  {
    id: "lpg-1",
    detector_id: "LPG-DET-01",
    building_number: "1",
    location: "Central Kitchen Cooking Range",
    floor: "Ground Floor",
    type: "Catalytic Gas Detector",
    panel_status: "OK",
    power_battery: "OK",
    sensor_head: "OK",
    shutoff_valve: "OK",
    fan_interlock: "OK",
    sounder_strobe: "OK",
    calibration_record: "OK",
    status: "OK",
    remarks: "Bump test with butane mixture triggered gas shutoff solenoid and kitchen exhaust fan in 4s",
    photos: []
  }
];

const DEFAULT_EMERGENCY_LIGHTS = [
  {
    id: "em-1",
    light_id: "EM-01",
    building_number: "1",
    floor: "Ground Floor",
    location: "Corridor Core A",
    type: "Twin Spot 2x5W LED Unit",
    ac_power_indicator: "OK",
    duration_test_passed: "OK",
    lamp_condition: "OK",
    charging_circuit: "OK",
    status: "OK",
    remarks: "Push-to-test button engaged, dual lamps illuminated on battery",
    photos: []
  },
  {
    id: "em-2",
    light_id: "EM-02",
    building_number: "1",
    floor: "1st Floor",
    location: "Main Hallway",
    type: "Twin Spot 2x5W LED Unit",
    ac_power_indicator: "OK",
    duration_test_passed: "OK",
    lamp_condition: "OK",
    charging_circuit: "OK",
    status: "OK",
    remarks: "Mains charging LED green, battery duration satisfactory",
    photos: []
  }
];

const DEFAULT_EXIT_LIGHTS = [
  {
    id: "ex-1",
    sign_id: "EX-01",
    building_number: "1",
    floor: "Ground Floor",
    location: "Final Exit Door Core A",
    illumination: "OK",
    battery_backup: "OK",
    pictogram_condition: "OK",
    housing_condition: "OK",
    status: "OK",
    remarks: "Maintained LED exit luminaire, Running Man symbol clearly illuminated",
    photos: []
  },
  {
    id: "ex-2",
    sign_id: "EX-02",
    building_number: "1",
    floor: "1st Floor",
    location: "Staircase Landing Exit",
    illumination: "OK",
    battery_backup: "OK",
    pictogram_condition: "OK",
    housing_condition: "OK",
    status: "OK",
    remarks: "Directional arrow intact, 3-hour backup battery tested",
    photos: []
  }
];

const DEFAULT_VOICE_EVACUATION = [
  {
    id: "ve-1",
    item: "Master Voice Alarm Controller",
    building_number: "1",
    location: "Fire Control Centre / Security Desk",
    amplifier_status: "OK",
    microphone_test: "OK",
    prerecorded_messages: "OK",
    speaker_clarity: "OK",
    ambient_noise_coverage: "OK",
    status: "OK",
    remarks: "Bilingual English/Arabic evacuation message broadcast tested. Paging mic priority verified.",
    photos: []
  }
];

/**
 * Returns default items for a specific system key
 */
function getDefaultSystemItems(systemKey, buildingNumber = "1") {
  const ensureDefaults = (item, extra = {}) => ({
    ...item,
    make: item.make !== undefined ? item.make : "",
    quantity: item.quantity !== undefined ? item.quantity : "",
    building_number: buildingNumber,
    photos: item.photos || [],
    ...extra
  });

  switch (systemKey) {
    case 'fire_alarm':
      return DEFAULT_FIRE_ALARM_ITEMS.map((item, idx) => ensureDefaults(item, {
        id: `fa-${buildingNumber}-${idx + 1}`
      }));
    case 'fire_fighting':
      return DEFAULT_FIRE_FIGHTING_ITEMS.map((item, idx) => ensureDefaults(item, {
        id: `ff-${buildingNumber}-${idx + 1}`
      }));
    case 'fire_hose_reels':
      return DEFAULT_HOSE_REELS.map((item, idx) => ensureDefaults(item, {
        id: `hr-${buildingNumber}-${idx + 1}`,
        reel_id: `HR-${buildingNumber}-${String(idx + 1).padStart(2, '0')}`
      }));
    case 'landing_valves':
      return DEFAULT_LANDING_VALVES.map((item, idx) => ensureDefaults(item, {
        id: `lv-${buildingNumber}-${idx + 1}`,
        valve_id: `LV-${buildingNumber}-${String(idx + 1).padStart(2, '0')}`
      }));
    case 'fire_extinguishers':
      return DEFAULT_EXTINGUISHERS.map((item, idx) => ensureDefaults(item, {
        id: `ext-${buildingNumber}-${idx + 1}`,
        ext_id: `EXT-${buildingNumber}-${String(idx + 1).padStart(2, '0')}`
      }));
    case 'fm200_suppression':
      return DEFAULT_FM200.map((item, idx) => ensureDefaults(item, {
        id: `fm-${buildingNumber}-${idx + 1}`,
        system_tag: `FM200-${buildingNumber}-${String(idx + 1).padStart(2, '0')}`
      }));
    case 'lpg_detection':
      return DEFAULT_LPG.map((item, idx) => ensureDefaults(item, {
        id: `lpg-${buildingNumber}-${idx + 1}`,
        detector_id: `LPG-${buildingNumber}-${String(idx + 1).padStart(2, '0')}`
      }));
    case 'emergency_lights':
      return DEFAULT_EMERGENCY_LIGHTS.map((item, idx) => ensureDefaults(item, {
        id: `em-${buildingNumber}-${idx + 1}`,
        light_id: `EM-${buildingNumber}-${String(idx + 1).padStart(2, '0')}`
      }));
    case 'exit_lights':
      return DEFAULT_EXIT_LIGHTS.map((item, idx) => ensureDefaults(item, {
        id: `ex-${buildingNumber}-${idx + 1}`,
        sign_id: `EX-${buildingNumber}-${String(idx + 1).padStart(2, '0')}`
      }));
    case 'voice_evacuation':
      return DEFAULT_VOICE_EVACUATION.map((item, idx) => ensureDefaults(item, {
        id: `ve-${buildingNumber}-${idx + 1}`
      }));
    default:
      return [];
  }
}

/**
 * Initializes a single building's independent checklist structure
 */
function buildInitialBuildingChecklist(building, selectedSystems = []) {
  const bNumber = building.building_number || "1";
  const systems = (selectedSystems && selectedSystems.length > 0)
    ? selectedSystems
    : (building.systems || ['fire_alarm', 'fire_fighting', 'fire_hose_reels', 'landing_valves', 'fire_extinguishers']);

  const checklists = {};
  systems.forEach(sysKey => {
    checklists[sysKey] = getDefaultSystemItems(sysKey, bNumber);
  });

  return {
    building_id: building.id || `bld-${Date.now()}-${bNumber}`,
    building_number: bNumber,
    building_name: building.name || building.building_name || `Building ${bNumber}`,
    location: building.location || building.address || '',
    selected_systems: systems,
    system_makes: {},
    system_qtys: {},
    system_make: '',
    system_qty: '',
    checklists,
    defects: [],
    remarks: '',
    photos: []
  };
}

/**
 * Main function: builds or restores checklist for visit
 */
function buildInitialChecklist(site, contract, visit, previousVisit, siteEquipmentList = []) {
  // If visit already has multi-building checklists saved, return them
  if (visit && visit.checklist_data && visit.checklist_data.buildings && visit.checklist_data.buildings.length > 0) {
    return visit.checklist_data;
  }

  // Backward compatibility: If visit has older flat checklist data, migrate smoothly into Building 1
  if (visit && visit.checklist_data && (visit.checklist_data.fire_alarm_items?.length || visit.checklist_data.fire_fighting_items?.length)) {
    const prev = visit.checklist_data;
    const legacyBuilding = {
      building_id: 'bld-legacy-1',
      building_number: '1',
      building_name: site?.site_name || 'Main Building',
      location: site?.site_address || '',
      selected_systems: ['fire_alarm', 'fire_fighting', 'fire_extinguishers'],
      checklists: {
        fire_alarm: prev.fire_alarm_items || [],
        fire_fighting: prev.fire_fighting_items || [],
        fire_extinguishers: prev.extinguisher_items || []
      },
      defects: prev.defects || [],
      remarks: prev.technician_notes || '',
      photos: []
    };

    return {
      status: prev.status || "In Progress",
      buildings: [legacyBuilding],
      // preserve legacy root fields for any legacy consumer
      fire_alarm_items: prev.fire_alarm_items || [],
      fire_fighting_items: prev.fire_fighting_items || [],
      extinguisher_items: prev.extinguisher_items || [],
      customer_signature: prev.customer_signature || null,
      technician_signature: prev.technician_signature || null,
      technician_notes: prev.technician_notes || '',
      supervisor_review: prev.supervisor_review || null
    };
  }

  // Determine site or contract buildings
  let targetBuildings = [];
  if (site && Array.isArray(site.buildings) && site.buildings.length > 0) {
    targetBuildings = site.buildings;
  } else if (contract && Array.isArray(contract.buildings) && contract.buildings.length > 0) {
    targetBuildings = contract.buildings;
  } else {
    // Default: Single Main Building
    targetBuildings = [
      {
        id: 'bld-1',
        building_number: '1',
        name: site?.site_name ? `${site.site_name} - Main Building` : 'Building 1',
        location: site?.site_address || ''
      }
    ];
  }

  // Systems covered by contract or default
  const defaultSystems = ['fire_alarm', 'fire_fighting', 'fire_hose_reels', 'landing_valves', 'fire_extinguishers'];

  const buildingsData = targetBuildings.map((bld, idx) => {
    return buildInitialBuildingChecklist(bld, defaultSystems);
  });

  return {
    status: "Draft",
    buildings: buildingsData,
    // Flatten primary building into root for legacy fallback
    fire_alarm_items: buildingsData[0]?.checklists?.fire_alarm || [],
    fire_fighting_items: buildingsData[0]?.checklists?.fire_fighting || [],
    extinguisher_items: buildingsData[0]?.checklists?.fire_extinguishers || [],
    customer_signature: null,
    technician_signature: null,
    technician_notes: "",
    supervisor_review: null
  };
}

module.exports = {
  SYSTEM_DEFINITIONS,
  DEFAULT_FIRE_ALARM_ITEMS,
  DEFAULT_FIRE_FIGHTING_ITEMS,
  DEFAULT_HOSE_REELS,
  DEFAULT_LANDING_VALVES,
  DEFAULT_EXTINGUISHERS,
  DEFAULT_FM200,
  DEFAULT_LPG,
  DEFAULT_EMERGENCY_LIGHTS,
  DEFAULT_EXIT_LIGHTS,
  DEFAULT_VOICE_EVACUATION,
  getDefaultSystemItems,
  buildInitialBuildingChecklist,
  buildInitialChecklist
};
