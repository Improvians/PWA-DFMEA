(function(){
  "use strict";
  // Shared storage for every design requirement specification -- the two
  // samples this workspace already has on file, and every real one
  // generated through "Create project with AI". Kept in one place (not
  // duplicated per page) so editing a spec on the viewer page, listing it
  // in Data Warehouse, and showing it on a project's page all agree.
  var KEY = "dfmeaRequirementDocs";
  var DEFAULTS_VERSION_KEY = "dfmeaRequirementDocsDefaultsVersion";
  var DEFAULTS_VERSION = "3";
  var DEFAULTS = [
    { id: "default-0", projectId: null, productName: "Titan Connector Housing", standard: "USCAR-2", createdAt: "Feb 11, 2024", specs: [
      "Mechanical — Housing dimensional tolerance ±0.15mm on all mating interface features, verified by CMM inspection",
      "Mechanical — Connector mating force ≤ 60 N, unmating force ≤ 50 N per USCAR-2 Section 5.2",
      "Mechanical — Locking mechanism retention force ≥ 80 N before primary lock release",
      "Mechanical — Secondary lock (TPA) must prevent terminal insertion unless fully seated, verified per USCAR-2 Section 5.3",
      "Mechanical — Minimum 50 mating/unmating cycles without contact degradation, verified per USCAR-2 durability test method",
      "Mechanical — Polarization features prevent incorrect orientation assembly under 20 N applied force",
      "Electrical — Dielectric withstand voltage 1500V AC for 60 seconds between adjacent terminal positions, no breakdown",
      "Electrical — Insulation resistance ≥ 100 MΩ at 500V DC, measured after humidity conditioning",
      "Electrical — Low-level contact resistance ≤ 10 mΩ per terminal position across the full mating cycle life",
      "Environmental — Housing sealing rated to IP67 (1m, 30 min submersion) at the connector mating face per IEC 60529",
      "Environmental — Operating temperature range -40°C to +105°C per USCAR-2 thermal cycling requirements",
      "Environmental — Thermal shock resistance: 100 cycles -40°C to +105°C, 30 min dwell each, no cracking or deformation",
      "Environmental — Vibration resistance per USCAR-2 Section 5.6, random vibration 10-2000 Hz, no electrical discontinuity >1μs",
      "Environmental — UV resistance: 500 hours per SAE J2527, no significant color change or material degradation",
      "Environmental — Chemical resistance to engine bay fluids (coolant, brake fluid, fuel) per USCAR-2 Section 5.8, no swelling or cracking",
      "Material — Housing material flammability rating UL94 V-0, verified per USCAR-2 Section 5.4 flame test",
      "Material — Housing resin must retain ≥ 80% tensile strength after 1000h at +105°C thermal aging",
      "Manufacturing — Process capability Cpk ≥ 1.33 on all critical-to-function housing dimensions at full production rate",
      "Manufacturing — Mold flow analysis required to confirm no sink marks or voids on load-bearing wall sections",
      "Quality — 100% automated vision inspection of locking tab geometry at final assembly, zero escape rate target"
    ]},
    { id: "default-1", projectId: null, productName: "Nova Terminal Block", standard: "LV214", createdAt: "Sep 3, 2024", specs: [
      "Mechanical — Crimp pull-out force ≥ 70 N per terminal, verified per LV214 Section 4.2 tensile test",
      "Mechanical — Terminal retention force ≥ 55 N in the housing cavity per LV214 Section 4.5",
      "Mechanical — Insertion/extraction force within LV214 Table 6 limits for the terminal size class",
      "Mechanical — Crimp height and width within ±0.05mm of nominal per LV214 crimp cross-section inspection",
      "Mechanical — Mechanical shock resistance per LV214 Section 4.8, 50g half-sine pulse, 11ms duration",
      "Mechanical — Wire strain relief must withstand 5 N axial pull for 1 minute with no conductor movement at the crimp",
      "Electrical — Contact resistance ≤ 0.6 mΩ after crimping, measured per LV214 4-wire Kelvin method",
      "Electrical — Current rating verified per LV214 Section 7, temperature rise ≤ 40K at rated current",
      "Electrical — Insulation resistance ≥ 100 MΩ at 500V DC between adjacent terminals",
      "Electrical — Voltage drop ≤ 30 mV at rated current across the full crimp joint after thermal cycling",
      "Environmental — Salt spray resistance per ISO 9227, 96h minimum, no red rust on base metal",
      "Environmental — Humidity resistance: 10 cycles per LV214 Annex, no corrosion or contact resistance drift >20%",
      "Environmental — Operating temperature range -40°C to +120°C with no plating discoloration or base metal exposure",
      "Environmental — Fretting corrosion resistance under micro-vibration per LV214 Section 4.9, no resistance increase >10%",
      "Material — Terminal base material and plating thickness per drawing, verified by cross-section metallurgical analysis",
      "Material — Tin plating minimum 2μm thickness over copper alloy base, no exposed base metal after crimping",
      "Manufacturing — Crimp force monitoring on 100% of production units with automatic reject of out-of-window crimps",
      "Manufacturing — Process capability Cpk ≥ 1.33 on crimp height, width, and pull-out force at full production rate",
      "Quality — First-article crimp cross-sections reviewed and approved before production release, per LV214 Annex C",
      "Quality — Lot traceability required for terminal plating batch and wire conductor batch used in each crimp"
    ]},
    { id: "default-2", projectId: null, productName: "Orion Busbar Assembly", standard: "LV214", createdAt: "Nov 20, 2024", specs: [
      "Mechanical — Busbar-to-terminal joint torque 8 ± 1 N·m, verified at 100% of production units",
      "Mechanical — Busbar bend radius ≥ 3x material thickness to avoid stress concentration cracking",
      "Mechanical — Fastener retention torque must be maintained within 10% after 50 thermal cycles",
      "Mechanical — Insulating boot/cover must remain seated under 15 N pull force in any direction",
      "Electrical — Joint resistance ≤ 0.3 mΩ per connection, measured by 4-wire Kelvin method after torque-down",
      "Electrical — Continuous current rating meets design load with ≤ 30K temperature rise at the busbar joint",
      "Electrical — Dielectric withstand voltage 2200V AC for 60 seconds between busbar and chassis ground",
      "Electrical — Isolation resistance ≥ 10 MΩ between high-voltage busbar and any exposed conductive part",
      "Environmental — Operating temperature range -40°C to +120°C with no joint loosening or plating degradation",
      "Environmental — Vibration resistance per ISO 16750-3, 10-2000 Hz, no joint resistance increase >15%",
      "Environmental — Salt spray resistance per ISO 9227, 240h minimum for exposed busbar sections, no red rust",
      "Environmental — Humidity resistance: 10 cycles per LV214 Annex, no corrosion at the joint interface",
      "Material — Busbar copper alloy conductivity ≥ 97% IACS, verified by eddy-current testing on incoming stock",
      "Material — Plating (tin or nickel) minimum 3μm thickness, no exposed base metal at bend or punch edges",
      "Manufacturing — Torque monitoring with automatic reject on 100% of production fasteners",
      "Manufacturing — Process capability Cpk ≥ 1.33 on joint resistance and torque at full production rate",
      "Quality — First-article joint cross-sections reviewed before production release",
      "Quality — Lot traceability required for busbar copper stock and plating batch"
    ]},
    { id: "default-3", projectId: null, productName: "Vantage Sensor Harness", standard: "USCAR-2", createdAt: "Jan 6, 2025", specs: [
      "Mechanical — Harness branch retention ≥ 40 N pull force at each wire exit point without conductor exposure",
      "Mechanical — Connector-to-harness strain relief withstands 50 N axial pull for 1 minute, no wire movement",
      "Mechanical — Minimum bend radius 5x cable OD maintained at all routing clips and brackets",
      "Mechanical — Clip/bracket retention force ≥ 25 N in the vehicle-mounted orientation",
      "Electrical — Signal line crosstalk ≤ -40dB between adjacent sensor channels at rated frequency",
      "Electrical — Shield continuity resistance ≤ 50 mΩ end-to-end, verified on 100% of harness assemblies",
      "Electrical — Insulation resistance ≥ 100 MΩ at 500V DC between any two conductors or conductor-to-shield",
      "Environmental — Operating temperature range -40°C to +125°C per USCAR-2 thermal cycling requirements",
      "Environmental — Abrasion resistance per USCAR-2 Section 5.9, no conductor exposure after 2500 scrape cycles",
      "Environmental — Chemical resistance to engine bay fluids, no insulation cracking or swelling",
      "Environmental — Vibration resistance per USCAR-2 Section 5.6, no intermittent signal dropout >1μs",
      "Material — Wire insulation material rated to the full operating temperature range with no embrittlement",
      "Material — Connector housing flammability rating UL94 V-0",
      "Manufacturing — Automated continuity and hipot test on 100% of finished harness assemblies",
      "Manufacturing — Process capability Cpk ≥ 1.33 on critical wire length and connector seating dimensions",
      "Quality — Lot traceability required for wire, terminal, and connector housing batches used per harness"
    ]}
  ];

  function save(list){
    try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(error){ /* storage unavailable */ }
  }
  function readAll(){
    var list;
    try{ list = JSON.parse(localStorage.getItem(KEY) || "null"); }catch(error){ list = null; }
    if(!list){
      list = DEFAULTS.slice();
      save(list);
      try{ localStorage.setItem(DEFAULTS_VERSION_KEY, DEFAULTS_VERSION); }catch(error){ /* storage unavailable */ }
    }else if(!list.some(function(d){ return d.id === "default-0"; })){
      // Seeded once, on whichever page loads first -- if an earlier
      // session already has real docs saved, the samples just get
      // prepended ahead of them rather than replacing anything.
      list = DEFAULTS.concat(list);
      save(list);
      try{ localStorage.setItem(DEFAULTS_VERSION_KEY, DEFAULTS_VERSION); }catch(error){ /* storage unavailable */ }
    }else{
      // The sample docs got more detailed, and more of them were added, in
      // later builds -- refresh existing ones in-place and append any new
      // ones for anyone whose browser already cached an older, shorter
      // version, without touching any real project docs mixed in among them.
      var storedVersion = null;
      try{ storedVersion = localStorage.getItem(DEFAULTS_VERSION_KEY); }catch(error){ storedVersion = null; }
      if(storedVersion !== DEFAULTS_VERSION){
        list = list.map(function(d){
          var fresh = DEFAULTS.find(function(f){ return f.id === d.id; });
          return fresh ? fresh : d;
        });
        DEFAULTS.forEach(function(def, i){
          if(!list.some(function(d){ return d.id === def.id; })) list.splice(i, 0, def);
        });
        save(list);
        try{ localStorage.setItem(DEFAULTS_VERSION_KEY, DEFAULTS_VERSION); }catch(error){ /* storage unavailable */ }
      }
    }
    return list;
  }
  function getById(id){
    return readAll().find(function(d){ return d.id === id; }) || null;
  }
  function updateSpecs(id, specs){
    var list = readAll();
    var doc = list.find(function(d){ return d.id === id; });
    if(!doc) return false;
    doc.specs = specs;
    save(list);
    return true;
  }
  function add(doc){
    var list = readAll();
    list.push(doc);
    save(list);
  }

  window.DfmeaReqDocs = { readAll: readAll, getById: getById, updateSpecs: updateSpecs, add: add };
})();
