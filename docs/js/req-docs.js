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
      "Housing material flammability rating UL94 V-0",
      "Housing sealing rated to IP67 at the connector mating face",
      "Minimum 50 mating/unmating cycles without contact degradation",
      "Operating temperature range -40°C to +105°C"
    ]},
    { id: "default-1", projectId: null, productName: "Nova Terminal Block", standard: "LV214", createdAt: "Sep 3, 2024", specs: [
      "Crimp pull-out force ≥ 70 N per terminal",
      "Contact resistance ≤ 0.6 mΩ after crimping",
      "Terminal retention force ≥ 55 N in the housing cavity",
      "Salt spray resistance per ISO 9227, 96h minimum"
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
