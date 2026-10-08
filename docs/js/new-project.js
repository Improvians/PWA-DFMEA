(function(){
  "use strict";

  // page-setup.js overwrites .crumb/.ttl with the dashboard's own title --
  // this page sets its own right after, same pattern as new-dfmea.js.
  var crumbEl = document.querySelector(".crumb");
  if(crumbEl) crumbEl.innerHTML = 'DFMEA Studio &rsaquo; <a href="projects.html" style="color:inherit">Projects</a> &rsaquo; <b>New Project with AI</b>';
  var pageTitle = document.querySelector(".ttl");
  if(pageTitle) pageTitle.textContent = "Create a new project with AI";

  var nameInput = document.getElementById("npName");
  var descInput = document.getElementById("npDesc");
  var standardInput = document.getElementById("npStandard");
  var step1 = document.getElementById("npStep1");
  var step2 = document.getElementById("npStep2");
  var step3 = document.getElementById("npStep3");
  function showStep(step){
    [step1, step2, step3].forEach(function(s){ s.classList.remove("on"); });
    step.classList.add("on");
  }

  document.getElementById("npCancel").addEventListener("click", function(){
    window.location.href = "projects.html";
  });

  // Same built-in project list projects.js uses, kept in sync, so the
  // duplicate-name check here means the same thing it does there.
  var BUILT_IN_PROJECT_NAMES = ["Aster EV Connector"];
  function readMyProjects(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
  }
  function existingProjectNames(){
    return BUILT_IN_PROJECT_NAMES.concat(readMyProjects().map(function(p){ return p.name; }));
  }

  function escapeHtml(value){
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }
  function wordsOf(text){
    return (text || "").toLowerCase().match(/[a-z0-9]+/g) || [];
  }
  function sharesWord(a, b){
    var setB = new Set(wordsOf(b));
    return wordsOf(a).some(function(w){ return w.length > 3 && setB.has(w); });
  }

  // Same shared library Data Warehouse and New DFMEA with AI both draw
  // on -- used here to find which existing DFMEAs "match" the product
  // description, shown as the reference table on the results screen.
  var REFERENCE_DOCS = [
    { name: "Crimp Contact Resistance", meta: "Reference DFMEA in this workspace" },
    { name: "Sensor_Bracket_DFMEA.xlsx", meta: "In this workspace's library" },
    { name: "Busbar_Joint_DFMEA.xlsx", meta: "In this workspace's library" },
    { name: "Wire_Harness_DFMEA_2023.xlsx", meta: "In this workspace's library" },
    { name: "Connector_Housing_DFMEA.xlsx", meta: "In this workspace's library" },
    { name: "Terminal_Retention_DFMEA_Rev3.xlsx", meta: "In this workspace's library" }
  ];

  // A lightweight "AI": keyword overlap against the product description,
  // same honest, visible substitute used everywhere else in this build --
  // no real model behind this, a static front-end can't run one.
  var SPEC_POOL = [
    { words: ["crimp", "terminal", "wire", "conductor"], spec: "Mechanical — Crimp pull-out force ≥ 80 N per terminal, verified per tensile test to the chosen reference standard" },
    { words: ["crimp", "terminal", "resistance", "contact", "current"], spec: "Electrical — Contact resistance ≤ 0.55 mΩ after crimping, measured by 4-wire Kelvin method" },
    { words: ["housing", "seal", "waterproof", "ip", "moisture"], spec: "Environmental — Housing sealing rated to IP67 (1m, 30 min submersion) at the connector mating face per IEC 60529" },
    { words: ["mating", "cycle", "connector", "durability"], spec: "Mechanical — Minimum 50 mating/unmating cycles without contact degradation or increased insertion force" },
    { words: ["retention", "lock", "latch", "housing"], spec: "Mechanical — Terminal retention force ≥ 60 N in the housing cavity; locking mechanism ≥ 80 N before primary lock release" },
    { words: ["vibration", "shock", "mount"], spec: "Environmental — Withstand random vibration per ISO 16750-3, 10-2000 Hz, with no electrical discontinuity greater than 1μs" },
    { words: ["temperature", "thermal", "heat", "battery", "power"], spec: "Environmental — Operating temperature range -40°C to +125°C; 100 thermal cycles with no cracking or deformation" },
    { words: ["current", "power", "busbar", "battery", "high"], spec: "Electrical — Continuous current rating meets design load with ≤ 20K temperature rise at rated current" },
    { words: ["corrosion", "salt", "humidity", "outdoor"], spec: "Environmental — Salt spray resistance per ISO 9227, 96h minimum, no red rust on base metal" },
    { words: ["connector", "plastic", "housing", "material"], spec: "Material — Housing material flammability rating UL94 V-0, verified by flame test" },
    { words: ["dimension", "tolerance", "fit", "housing", "mold"], spec: "Mechanical — Housing dimensional tolerance ±0.15mm on all mating interface features, verified by CMM inspection" },
    { words: ["humidity", "moisture", "outdoor", "environment"], spec: "Environmental — Humidity resistance: 10 cycles minimum, no corrosion or contact resistance drift greater than 20%" },
    { words: ["insulation", "voltage", "electrical", "power"], spec: "Electrical — Insulation resistance ≥ 100 MΩ at 500V DC between adjacent current-carrying paths" },
    { words: ["uv", "outdoor", "sun", "exposure"], spec: "Environmental — UV resistance: 500 hours per SAE J2527 with no significant color change or material degradation" },
    { words: ["shock", "drop", "impact"], spec: "Mechanical — Mechanical shock resistance: 50g half-sine pulse, 11ms duration, no functional degradation" },
    { words: ["assembly", "manufacture", "production", "quality"], spec: "Manufacturing — Process capability Cpk ≥ 1.33 on all critical-to-function dimensions at full production rate" },
    { words: ["wire", "conductor", "strain", "pull"], spec: "Mechanical — Wire strain relief must withstand 5 N axial pull for 1 minute with no conductor movement at the termination" },
    { words: ["plating", "corrosion", "contact", "material"], spec: "Material — Contact plating minimum 2μm thickness over base alloy, no exposed base metal after assembly" },
    { words: ["voltage", "dielectric", "power", "electrical"], spec: "Electrical — Dielectric withstand voltage 1500V AC for 60 seconds between adjacent conductive paths, no breakdown" },
    { words: ["fretting", "vibration", "micro", "contact"], spec: "Environmental — Fretting corrosion resistance under micro-vibration, no contact resistance increase greater than 10%" },
    { words: ["quality", "production", "inspection", "trace"], spec: "Quality — Lot traceability required for all critical raw material and plating batches used in production" },
    { words: ["mold", "manufacture", "production", "void"], spec: "Manufacturing — Mold flow analysis required to confirm no sink marks or voids on load-bearing wall sections" }
  ];
  var DEFAULT_SPECS = [0, 1, 2, 3, 4, 5, 6, 10, 12, 15].map(function(i){ return SPEC_POOL[i].spec; });

  // One DFMEA per major function a connector-style product needs covered
  // -- fixed, not derived from the description, so generation is always
  // predictable and every one opens as a real, editable document exactly
  // like New DFMEA (with AI) already produces for a single function.
  var FUNCTION_SET = [
    { suffix: "Crimp Contact Resistance", failure: "Contact resistance exceeds limit after crimping", severity: 9 },
    { suffix: "Terminal Retention Force", failure: "Terminal backs out of housing cavity under load", severity: 8 },
    { suffix: "Housing Seal Integrity", failure: "Seal fails to maintain IP rating after repeated mating", severity: 7 },
    { suffix: "Mating Cycle Durability", failure: "Contact performance degrades after repeated mating cycles", severity: 7 }
  ];

  function validateStep1(){
    var ok = true;
    var name = nameInput.value.trim();
    var nameField = document.getElementById("npNameField");
    var nameErr = document.getElementById("npNameErr");
    var duplicate = !!name && existingProjectNames().some(function(n){ return n.toLowerCase() === name.toLowerCase(); });
    var nameOk = !!name && !duplicate;
    nameErr.textContent = !name ? "Give this project a name." : "A project named “" + name + "” already exists.";
    nameField.classList.toggle("has-err", !nameOk);
    nameInput.classList.toggle("err", !nameOk);
    if(!nameOk) ok = false;

    var descField = document.getElementById("npDescField");
    var descOk = descInput.value.trim().length > 0;
    descField.classList.toggle("has-err", !descOk);
    descInput.classList.toggle("err", !descOk);
    if(!descOk) ok = false;

    return ok;
  }
  [nameInput, descInput].forEach(function(input){
    input.addEventListener("input", function(){
      var field = input.closest(".nd-field");
      field.classList.remove("has-err");
      input.classList.remove("err");
    });
  });

  function makeDocId(){ return "doc-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function saveDocRecord(record){
    try{
      var list = JSON.parse(localStorage.getItem("dfmeaMyDocuments") || "[]");
      list.push(record);
      localStorage.setItem("dfmeaMyDocuments", JSON.stringify(list));
    }catch(error){ /* storage unavailable -- the flow still works, just won't be listed anywhere */ }
  }
  function saveOverride(id, override){
    try{
      var map = JSON.parse(localStorage.getItem("dfmeaDocOverrides") || "{}");
      map[id] = override;
      localStorage.setItem("dfmeaDocOverrides", JSON.stringify(map));
    }catch(error){ /* override just won't persist -- navigation still works */ }
  }
  function saveRequirementDoc(doc){
    try{
      window.DfmeaReqDocs.add(doc);
    }catch(error){ /* storage unavailable -- the project still works, just has no spec card */ }
  }
  function saveProject(project){
    try{
      var list = readMyProjects();
      list.push(project);
      localStorage.setItem("dfmeaMyProjects", JSON.stringify(list));
      sessionStorage.setItem("dfmeaJustCreatedProjectId", project.id);
    }catch(error){ /* storage unavailable -- the flow still works, just won't be listed */ }
  }

  document.getElementById("npStep1Next").addEventListener("click", function(){
    if(!validateStep1()){
      document.querySelector(".nd-field.has-err input, .nd-field.has-err textarea").focus();
      return;
    }
    showStep(step2);
    runGenerate();
  });

  function runGenerate(){
    var fill = document.getElementById("npProgressFill");
    var label = document.getElementById("npProgressLabel");
    var steps = [
      [20, "Analysing product description..."],
      [45, "Matching related DFMEAs in this workspace..."],
      [70, "Generating design requirement specification..."],
      [95, "Building DFMEA structures for each function..."],
      [100, "Finishing up..."]
    ];
    var i = 0;
    fill.style.width = "0%";
    (function tick(){
      if(i >= steps.length){
        setTimeout(finish, 350);
        return;
      }
      fill.style.width = steps[i][0] + "%";
      label.textContent = steps[i][1];
      i++;
      setTimeout(tick, 420);
    })();
  }

  function finish(){
    var name = nameInput.value.trim();
    var description = descInput.value.trim();
    var standard = standardInput.value;
    var projectId = "custom-" + Date.now().toString(36);

    // --- requirement specification: matched specs first, then defaults, deduped, capped ---
    var matchedSpecs = SPEC_POOL.filter(function(entry){
      return wordsOf(description).some(function(w){ return w.length > 3 && entry.words.indexOf(w) !== -1; });
    }).map(function(entry){ return entry.spec; });
    var specs = Array.from(new Set(matchedSpecs.concat(DEFAULT_SPECS))).slice(0, 18);

    // --- related DFMEAs and existing requirement specs that matched the
    // description -- shown together as one simple "what this was built
    // from" list, so the result is explainable, not a black box.
    var matched = REFERENCE_DOCS.filter(function(doc){ return sharesWord(description, doc.name); });
    var matchedReqDocs = window.DfmeaReqDocs.readAll().filter(function(d){ return sharesWord(description, d.productName); });

    // --- project ---
    saveProject({ id: projectId, name: name, description: description, createdAt: new Date().toLocaleString() });

    // --- requirement doc ---
    saveRequirementDoc({ id: "req-" + Date.now().toString(36), projectId: projectId, productName: name,
      standard: standard, specs: specs, createdAt: new Date().toLocaleString() });

    // --- generated DFMEAs, each a real, editable document like New DFMEA (with AI) produces ---
    var generatedRows = FUNCTION_SET.map(function(f){
      var docId = makeDocId();
      var docName = name + " " + f.suffix + " DFMEA";
      saveDocRecord({ id: docId, name: docName, function: f.suffix, severity: f.severity, projectId: projectId,
        mode: "ai", generatedFrom: matched.map(function(m){ return m.name; }), createdAt: new Date().toLocaleString() });
      saveOverride(docId, { name: docName, function: f.suffix, failureMode: f.failure, severity: f.severity,
        mode: "ai", projectId: projectId, generatedFrom: matched.map(function(m){ return m.name; }), generatedAt: new Date().toISOString() });
      return { docId: docId, name: docName, fn: f.suffix, severity: f.severity };
    });

    // --- render results ---
    document.getElementById("npDoneTitle").textContent = "“" + name + "” created";
    document.getElementById("npReqProduct").textContent = name;
    document.getElementById("npReqStandard").textContent = standard === "None" ? "No specific standard" : standard;
    document.getElementById("npReqSpecs").innerHTML = specs.map(function(s){
      return '<li><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + escapeHtml(s) + '</li>';
    }).join("");

    var dfmeaBody = document.getElementById("npDfmeaTable");
    dfmeaBody.innerHTML = generatedRows.map(function(r){
      return '<tr class="clickable" data-doc-id="' + r.docId + '"><td>' + escapeHtml(r.name) + '</td><td>' + escapeHtml(r.fn) + '</td><td>' + r.severity + '</td></tr>';
    }).join("");
    Array.prototype.slice.call(dfmeaBody.querySelectorAll("tr")).forEach(function(row){
      row.addEventListener("click", function(){
        window.location.href = "index.html?doc=" + encodeURIComponent(row.dataset.docId);
      });
    });

    // Capped to a handful -- this is meant to explain the result at a
    // glance, not list every loose keyword match.
    var references = matched.map(function(m){ return { name: m.name, type: "DFMEA" }; })
      .concat(matchedReqDocs.map(function(d){ return { name: d.productName, type: "Requirement spec" }; }))
      .slice(0, 4);
    if(references.length){
      document.getElementById("npMatchedTitle").hidden = false;
      document.getElementById("npMatchedTable").hidden = false;
      document.getElementById("npMatchedBody").innerHTML = references.map(function(r){
        var badgeClass = r.type === "DFMEA" ? "np-reftype" : "np-reftype spec";
        return '<tr><td>' + escapeHtml(r.name) + '</td><td><span class="' + badgeClass + '">' + escapeHtml(r.type) + '</span></td></tr>';
      }).join("");
    }

    var actions = document.getElementById("npDoneActions");
    var openBtn = document.createElement("button");
    openBtn.type = "button"; openBtn.className = "nd-btn primary"; openBtn.textContent = "Open project";
    openBtn.addEventListener("click", function(){ window.location.href = "project.html?id=" + encodeURIComponent(projectId); });
    var homeBtn = document.createElement("button");
    homeBtn.type = "button"; homeBtn.className = "nd-btn"; homeBtn.textContent = "Back to Projects";
    homeBtn.addEventListener("click", function(){ window.location.href = "projects.html"; });
    actions.innerHTML = "";
    actions.appendChild(homeBtn);
    actions.appendChild(openBtn);

    showStep(step3);
  }
})();
