(function(){
  "use strict";
  // Shared storage for every design requirement specification -- the two
  // samples this workspace already has on file, and every real one
  // generated through "Create project with AI". Kept in one place (not
  // duplicated per page) so editing a spec on the viewer page, listing it
  // in Data Warehouse, and showing it on a project's page all agree.
  var KEY = "dfmeaRequirementDocs";
  var DEFAULTS = [
    { id: "default-0", projectId: null, productName: "Titan Connector Housing", standard: "USCAR-2", createdAt: "Feb 11, 2024", specs: [
      "Housing material flammability rating UL94 V-0, verified per USCAR-2 Section 5.4 flame test",
      "Housing sealing rated to IP67 (1m, 30 min submersion) at the connector mating face per IEC 60529",
      "Minimum 50 mating/unmating cycles without contact degradation, verified per USCAR-2 durability test method",
      "Operating temperature range -40°C to +105°C per USCAR-2 thermal cycling requirements",
      "Connector mating force ≤ 60 N, unmating force ≤ 50 N per USCAR-2 Section 5.2",
      "Housing dimensional tolerance ±0.15mm on all mating interface features",
      "Vibration resistance per USCAR-2 Section 5.6, random vibration 10-2000 Hz, no electrical discontinuity >1μs",
      "Thermal shock resistance: 100 cycles -40°C to +105°C, 30 min dwell each, no cracking or deformation",
      "UV resistance: 500 hours per SAE J2527, no significant color change or material degradation",
      "Locking mechanism retention force ≥ 80 N before primary lock release"
    ]},
    { id: "default-1", projectId: null, productName: "Nova Terminal Block", standard: "LV214", createdAt: "Sep 3, 2024", specs: [
      "Crimp pull-out force ≥ 70 N per terminal, verified per LV214 Section 4.2 tensile test",
      "Contact resistance ≤ 0.6 mΩ after crimping, measured per LV214 4-wire Kelvin method",
      "Terminal retention force ≥ 55 N in the housing cavity per LV214 Section 4.5",
      "Salt spray resistance per ISO 9227, 96h minimum, no red rust on base metal",
      "Insertion/extraction force within LV214 Table 6 limits for the terminal size class",
      "Crimp height and width within ±0.05mm of nominal per LV214 crimp cross-section inspection",
      "Current rating verified per LV214 Section 7, temperature rise ≤ 40K at rated current",
      "Insulation resistance ≥ 100 MΩ at 500V DC between adjacent terminals",
      "Mechanical shock resistance per LV214 Section 4.8, 50g half-sine pulse, 11ms duration",
      "Humidity resistance: 10 cycles per LV214 Annex, no corrosion or contact resistance drift >20%"
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
    }else if(!list.some(function(d){ return d.id === "default-0"; })){
      // Seeded once, on whichever page loads first -- if an earlier
      // session already has real docs saved, the samples just get
      // prepended ahead of them rather than replacing anything.
      list = DEFAULTS.concat(list);
      save(list);
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
