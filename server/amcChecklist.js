/**
 * FIREX Digital AMC Checklist & Service Report Engine
 * Complies with Bahrain Civil Defense inspection requirements and FIREX standard procedures.
 */

const DEFAULT_FIRE_ALARM_ITEMS = [
  { item_no: 1, item: "Panel", make: "Notifier / Honeywell", type: "Addressable FACP", quantity: "1", status: "OK", remarks: "All visual indicators and normal standby verified" },
  { item_no: 2, item: "No. of Zones / Loops", make: "", type: "Addressable Loop", quantity: "4", status: "OK", remarks: "All 4 loops operational" },
  { item_no: 3, item: "No. of Zones / Loops Connected", make: "", type: "Loop Circuit", quantity: "4", status: "OK", remarks: "Full loop continuity confirmed" },
  { item_no: 4, item: "Protocol", make: "", type: "FlashScan / CLIP", quantity: "1", status: "OK", remarks: "Polling speed normal" },
  { item_no: 5, item: "A/C Power", make: "", type: "230V AC Dedicated Supply", quantity: "1", status: "OK", remarks: "Mains healthy, breaker locked ON" },
  { item_no: 6, item: "Batteries", make: "Yuasa / Power-Sonic", type: "12V 17Ah SLA Standby", quantity: "2", status: "OK", remarks: "Float voltage 27.4V, load test passed" },
  { item_no: 7, item: "Smoke Detectors", make: "System Sensor", type: "Optical Smoke Detector", quantity: "45", status: "OK", remarks: "Sample tested with aerosol, response within 10s" },
  { item_no: 8, item: "Heat Detectors", make: "System Sensor", type: "Rate-of-Rise / Fixed Temp", quantity: "12", status: "OK", remarks: "Kitchen and plant room sensors tested" },
  { item_no: 9, item: "Multisensors", make: "System Sensor", type: "Optical / Heat Multi", quantity: "8", status: "OK", remarks: "Clean, sensitivity normal" },
  { item_no: 10, item: "Break Glass / Manual Call Points", make: "KAC", type: "Manual Call Point (Resettable)", quantity: "16", status: "OK", remarks: "Tested with reset key, signal verified at FACP" },
  { item_no: 11, item: "Modules", make: "Notifier", type: "Monitor / Control Modules", quantity: "10", status: "OK", remarks: "Interlock signals tested" },
  { item_no: 12, item: "Sounders", make: "Notifier", type: "Electronic Sounder 24V", quantity: "20", status: "OK", remarks: "Sound level > 85 dB(A) at 3m" },
  { item_no: 13, item: "Sounder / Strobe Light", make: "System Sensor", type: "Sounder Beacon VAD", quantity: "8", status: "OK", remarks: "Audible & flashing synchronized" },
  { item_no: 14, item: "Bells", make: "FireX", type: "Motorized 6\" / 8\" Fire Bell", quantity: "4", status: "OK", remarks: "Clear audible strike confirmed" },
  { item_no: 15, item: "Yoda Alarms / Auxiliary Alarm Devices", make: "", type: "Aux Voice / Warning Device", quantity: "2", status: "OK", remarks: "Auxiliary horn operational" },
  { item_no: 16, item: "Beam Detectors", make: "FireRay", type: "Reflective Optical Beam", quantity: "2", status: "OK", remarks: "Atrium beam alignment and obscuration test passed" },
  { item_no: 17, item: "Auxiliary Contacts", make: "", type: "AHU / Elevator / Door Release", quantity: "6", status: "OK", remarks: "AHU trip and elevator grounding interlocks tested" },
  { item_no: 18, item: "Signal to Fire Brigade", make: "Civil Defense Auto-dialer", type: "24/7 Transmitter Link", quantity: "1", status: "OK", remarks: "Civil Defense communication line healthy" },
  { item_no: 19, item: "Signal to Master Panel", make: "Notifier Network", type: "RS-485 / Fiber Optic Link", quantity: "1", status: "OK", remarks: "Master BMS repeater receiving events" },
  { item_no: 20, item: "Fire / Fault / Indicators", make: "", type: "LED Status Bar & Buzzer", quantity: "1", status: "OK", remarks: "Lamp test function executed, all LEDs OK" },
  { item_no: 21, item: "Remarks on Whole System", make: "", type: "Full System Audit", quantity: "1", status: "OK", remarks: "System fully healthy and in normal operating state" },
  { item_no: 22, item: "Display of Panel", make: "", type: "Backlit LCD & Keypad", quantity: "1", status: "OK", remarks: "Display legible with zero dead pixels" },
  { item_no: 23, item: "Cabling", make: "FP200 Gold", type: "2-Core 1.5mm Fire Resistant", quantity: "N/A", status: "OK", remarks: "Insulation and conduit physical condition sound" }
];

const DEFAULT_FIRE_FIGHTING_ITEMS = [
  { item_no: 1, item: "Fire Pump", make: "Peerless / Patterson", type: "Centrifugal Fire Pump 750 GPM", quantity: "1", status: "OK", remarks: "Bearing temperature and packing glands normal" },
  { item_no: 2, item: "Jockey Pump", make: "Grundfos / Aurora", type: "Vertical Multistage 15 GPM", quantity: "1", status: "OK", remarks: "Cut-in at 8.5 bar, cut-out at 10.5 bar" },
  { item_no: 3, item: "Main Pump", make: "Peerless", type: "Electric Motor Driven 55 kW", quantity: "1", status: "OK", remarks: "Soft starter operational, auto start verified" },
  { item_no: 4, item: "Diesel Pump", make: "Cummins / Clarke", type: "Emergency Diesel Backup Pump", quantity: "1", status: "OK", remarks: "Battery cranking normal, oil and coolant verified" },
  { item_no: 5, item: "Pump Controller", make: "Firetrol / Tornatech", type: "UL/FM Dual Controller", quantity: "1", status: "OK", remarks: "Phase monitoring and auto-transfer switch tested" },
  { item_no: 6, item: "Fire Tank", make: "GRP Panel", type: "10,000 Gallon Water Tank", quantity: "1", status: "OK", remarks: "Water level 100%, float valve operational" },
  { item_no: 7, item: "Valves", make: "Nibco / Viking", type: "OS&Y Gate & Butterfly Valves", quantity: "12", status: "OK", remarks: "All suction & discharge valves locked in OPEN position" },
  { item_no: 8, item: "Pressure Gauges", make: "WIKA", type: "Glycerin Filled 0-25 bar", quantity: "6", status: "OK", remarks: "Zero calibration verified, readable dials" },
  { item_no: 9, item: "Hydrant", make: "FireX / Mueller", type: "Outdoor Pillar Hydrant 2.5\"", quantity: "2", status: "OK", remarks: "Valve spindle lubricated, caps greased" },
  { item_no: 10, item: "Landing Valve", make: "Giacomini", type: "2.5\" Oblique PRV Landing Valve", quantity: "8", status: "OK", remarks: "Handwheel smooth, no leaks under pressure" },
  { item_no: 11, item: "Hose Reel", make: "FireX / Angus", type: "1\" x 30m Swing Arm Drum", quantity: "8", status: "OK", remarks: "Unreeled 30m, water flow verified, rewind smooth" },
  { item_no: 12, item: "Fire Hose", make: "Angus Duraline", type: "2.5\" Synthetic Delivery Hose", quantity: "4", status: "OK", remarks: "Couplings undamaged, hose fabric sound" },
  { item_no: 13, item: "Sprinklers", make: "Tyco / Viking", type: "Pendent Glass Bulb 68°C", quantity: "120", status: "OK", remarks: "Deflectors unobstructed, clean bulbs" },
  { item_no: 14, item: "Sprinkler Valves", make: "Tyco", type: "Alarm Check Valve & Water Motor Gong", quantity: "2", status: "OK", remarks: "Retard chamber and gong tested successfully" },
  { item_no: 15, item: "Fire Cabinets", make: "FireX", type: "Recessed Steel Cabinet w/ Glass", quantity: "8", status: "OK", remarks: "Door hinges lubricated, break-glass intact" },
  { item_no: 16, item: "Breeching Inlet", make: "FireX", type: "4-Way Dry Riser Breeching Inlet", quantity: "1", status: "OK", remarks: "Drain valve clear, clack valves seated properly" },
  { item_no: 17, item: "Fire Brigade Connection", make: "Civil Defense Spec", type: "Storz FBC 4\" Inlet", quantity: "1", status: "OK", remarks: "Caps chained, clear access from access road" },
  { item_no: 18, item: "Fire Blanket", make: "FireX", type: "Fiberglass 1.2m x 1.8m", quantity: "4", status: "OK", remarks: "Pouch clean, release straps accessible" },
  { item_no: 19, item: "Exit Lights", make: "Cooper / Thorn", type: "Maintained LED Exit Signs 3-Hr", quantity: "14", status: "OK", remarks: "Battery backup illumination tested for 60 min" },
  { item_no: 20, item: "Emergency Lights", make: "FireX / Beghelli", type: "Twin Spot Self-Contained Unit", quantity: "12", status: "OK", remarks: "Test button pressed, twin lamps active on battery" },
  { item_no: 21, item: "Other Fire Fighting Equipment", make: "FireX", type: "Spanner Wrench, Foam Eductors", quantity: "2", status: "OK", remarks: "Tool kit complete and present in pump house" }
];

const DEFAULT_EXTINGUISHERS = [
  {
    id: "ext-demo-1",
    type: "CO2 (Carbon Dioxide)",
    make: "FireX",
    capacity: "5 kg",
    quantity: 1,
    serial_number: "FX-CO2-9841",
    location: "Main Electrical Switchgear Room",
    floor: "Basement 1",
    condition: "Good",
    pressure_status: "Normal",
    safety_pin: "Intact",
    hose: "Intact",
    nozzle: "Clear",
    inspection_status: "OK",
    status: "OK",
    remarks: "Weighed full at 11.8 kg, seal intact",
    photos: [],
    date_done: new Date().toISOString().slice(0, 10),
    next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  },
  {
    id: "ext-demo-2",
    type: "DCP (Dry Chemical Powder)",
    make: "FireX",
    capacity: "6 kg",
    quantity: 1,
    serial_number: "FX-DCP-5520",
    location: "Corridor by Staircase Core A",
    floor: "Ground Floor",
    condition: "Good",
    pressure_status: "Normal",
    safety_pin: "Intact",
    hose: "Intact",
    nozzle: "Clear",
    inspection_status: "OK",
    status: "OK",
    remarks: "Pressure needle in green operating zone (14 bar)",
    photos: [],
    date_done: new Date().toISOString().slice(0, 10),
    next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  },
  {
    id: "ext-demo-3",
    type: "Wet Chemical",
    make: "FireX",
    capacity: "6 Liters",
    quantity: 1,
    serial_number: "FX-WC-3312",
    location: "Commercial Kitchen Cooking Range",
    floor: "1st Floor",
    condition: "Good",
    pressure_status: "Normal",
    safety_pin: "Intact",
    hose: "Intact",
    nozzle: "Clear",
    inspection_status: "OK",
    status: "OK",
    remarks: "Applicator lance clean and unobstructed",
    photos: [],
    date_done: new Date().toISOString().slice(0, 10),
    next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
  }
];

/**
 * Initializes or clones equipment checklist for a visit,
 * reusing previous visit equipment or site equipment register where available.
 */
function buildInitialChecklist(site, contract, visit, previousVisit, siteEquipmentList = []) {
  // Check if visit already has completed or saved checklist
  if (visit && visit.checklist_data && visit.checklist_data.fire_alarm_items?.length) {
    return visit.checklist_data;
  }

  // If previous visit exists for this contract or site, clone equipment specs
  if (previousVisit && previousVisit.checklist_data) {
    const prev = previousVisit.checklist_data;
    return {
      status: "In Progress",
      fire_alarm_items: (prev.fire_alarm_items || []).map(item => ({
        ...item,
        status: "OK", // reset status for fresh inspection
        remarks: "",
        defect_description: "",
        recommendation: "",
        priority: "Medium",
        photos: []
      })),
      fire_fighting_items: (prev.fire_fighting_items || []).map(item => ({
        ...item,
        status: "OK",
        remarks: "",
        defect_description: "",
        recommendation: "",
        priority: "Medium",
        photos: []
      })),
      extinguisher_items: (prev.extinguisher_items || []).map(ext => ({
        ...ext,
        inspection_status: "OK",
        status: "OK",
        remarks: "",
        photos: [],
        date_done: new Date().toISOString().slice(0, 10),
        next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
      })),
      defects: [],
      customer_signature: null,
      technician_notes: "",
      supervisor_review: null,
      created_from_previous_visit_id: previousVisit.id
    };
  }

  // If site has registered equipment list, assemble checklist from it
  if (siteEquipmentList && siteEquipmentList.length > 0) {
    const fa = siteEquipmentList
      .filter(e => e.system === "Fire Alarm")
      .map((e, idx) => ({
        id: `fa-${idx + 1}`,
        item_no: idx + 1,
        item: e.item_name || e.item || `Fire Alarm Device ${idx + 1}`,
        make: e.make || "",
        type: e.type || "",
        quantity: String(e.quantity || "1"),
        status: "OK",
        remarks: e.remarks || "",
        photos: []
      }));

    const ff = siteEquipmentList
      .filter(e => e.system === "Fire Fighting" || e.system === "Fire Protection")
      .map((e, idx) => ({
        id: `ff-${idx + 1}`,
        item_no: idx + 1,
        item: e.item_name || e.item || `Fire Fighting Unit ${idx + 1}`,
        make: e.make || "",
        type: e.type || "",
        quantity: String(e.quantity || "1"),
        status: "OK",
        remarks: e.remarks || "",
        photos: []
      }));

    const ext = siteEquipmentList
      .filter(e => e.system === "Fire Extinguishers" || e.type?.includes("Extinguisher"))
      .map((e, idx) => ({
        id: `ext-${idx + 1}`,
        type: e.type || "DCP 6kg",
        make: e.make || "FireX",
        capacity: e.capacity || "6 kg",
        quantity: e.quantity || 1,
        serial_number: e.serial_number || `FX-${idx + 100}`,
        location: e.location || "Floor Corridor",
        floor: e.floor || "1",
        condition: "Good",
        pressure_status: "Normal",
        safety_pin: "Intact",
        hose: "Intact",
        nozzle: "Clear",
        inspection_status: "OK",
        status: "OK",
        remarks: "",
        photos: [],
        date_done: new Date().toISOString().slice(0, 10),
        next_due_date: new Date(Date.now() + 182 * 24 * 3600 * 1000).toISOString().slice(0, 10)
      }));

    if (fa.length > 0 || ff.length > 0 || ext.length > 0) {
      return {
        status: "Draft",
        fire_alarm_items: fa.length > 0 ? fa : DEFAULT_FIRE_ALARM_ITEMS.map((item, i) => ({ ...item, id: `fa-${i + 1}` })),
        fire_fighting_items: ff.length > 0 ? ff : DEFAULT_FIRE_FIGHTING_ITEMS.map((item, i) => ({ ...item, id: `ff-${i + 1}` })),
        extinguisher_items: ext.length > 0 ? ext : DEFAULT_EXTINGUISHERS,
        defects: [],
        customer_signature: null,
        technician_notes: "",
        supervisor_review: null
      };
    }
  }

  // Fallback: Default standard templates matching Bahrain requirements
  return {
    status: "Draft",
    fire_alarm_items: DEFAULT_FIRE_ALARM_ITEMS.map((item, idx) => ({
      ...item,
      id: `fa-${idx + 1}`,
      photos: []
    })),
    fire_fighting_items: DEFAULT_FIRE_FIGHTING_ITEMS.map((item, idx) => ({
      ...item,
      id: `ff-${idx + 1}`,
      photos: []
    })),
    extinguisher_items: DEFAULT_EXTINGUISHERS.map(e => ({ ...e, photos: [] })),
    defects: [],
    customer_signature: null,
    technician_notes: "",
    supervisor_review: null
  };
}

module.exports = {
  DEFAULT_FIRE_ALARM_ITEMS,
  DEFAULT_FIRE_FIGHTING_ITEMS,
  DEFAULT_EXTINGUISHERS,
  buildInitialChecklist
};
