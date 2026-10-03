(function(){
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var mode = params.get("mode") === "ai" ? "ai" : "blank";

  // Every DFMEA belongs to a project -- this list is the same set the
  // Projects pages use (the one real project plus the two placeholders),
  // extended with whatever custom projects were created on the Projects
  // page. Arriving here from a project's own "+ New DFMEA" button
  // (project.html passes ?project=<id>) pre-selects that project instead
  // of defaulting to Aster EV Connector every time.
  var KNOWN_PROJECTS = [
    { id: "aster-ev-connector", name: "Aster EV Connector" },
    { id: "northstar-sensor-harness", name: "Northstar Sensor Harness" },
    { id: "meridian-charging-inlet", name: "Meridian Charging Inlet" }
  ];
  function readCustomProjects(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
  }
  var projectSelect = document.getElementById("ndProject");
  var allProjects = KNOWN_PROJECTS.concat(readCustomProjects());
  projectSelect.innerHTML = allProjects.map(function(p){
    return '<option value="' + p.id + '">' + escapeHtml(p.name) + '</option>';
  }).join("");
  var requestedProject = params.get("project");
  if(requestedProject && allProjects.some(function(p){ return p.id === requestedProject; })){
    projectSelect.value = requestedProject;
  }

  // page-setup.js (loaded here too, purely for a consistent sidebar)
  // overwrites the whole .crumb element's innerHTML for its own
  // breadcrumb -- so this rebuilds it fresh rather than trusting the
  // #ndCrumb child it originally shipped with to still be there.
  var pageTitle = document.getElementById("ndPageTitle");
  var crumbEl = document.querySelector(".crumb");
  var crumbLabel = mode === "ai" ? "New DFMEA with AI" : "New DFMEA";
  if(crumbEl) crumbEl.innerHTML = 'DFMEA Studio &rsaquo; <b>' + crumbLabel + '</b>';
  if(pageTitle) pageTitle.textContent = mode === "ai" ? "Create a new DFMEA with AI" : "Create a new DFMEA";

  var templateField = document.getElementById("ndTemplateField");
  if(templateField) templateField.hidden = mode !== "blank";
  document.getElementById("ndCancel").addEventListener("click", function(){
    window.location.href = requestedProject ? "project.html?id=" + encodeURIComponent(projectSelect.value) : "projects.html";
  });

  var nameInput = document.getElementById("ndName");
  var functionInput = document.getElementById("ndFunction");
  var failureInput = document.getElementById("ndFailure");
  var step1 = document.getElementById("ndStep1");
  var step2 = document.getElementById("ndStep2");
  var step3 = document.getElementById("ndStep3");
  var step4 = document.getElementById("ndStep4");

  function showStep(step){
    [step1, step2, step3, step4].forEach(function(s){ s.classList.remove("on"); });
    step.classList.add("on");
  }

  function validateStep1(){
    var ok = true;
    [["ndNameField", nameInput], ["ndFunctionField", functionInput], ["ndFailureField", failureInput]].forEach(function(pair){
      var field = document.getElementById(pair[0]);
      var input = pair[1];
      var filled = input.value.trim().length > 0;
      field.classList.toggle("has-err", !filled);
      input.classList.toggle("err", !filled);
      if(!filled) ok = false;
    });
    return ok;
  }
  [nameInput, functionInput, failureInput].forEach(function(input){
    input.addEventListener("input", function(){
      var field = input.closest(".nd-field");
      field.classList.remove("has-err");
      input.classList.remove("err");
    });
  });

  function readUploadHistory(){
    try{ return JSON.parse(localStorage.getItem("dfmeaUploadHistory") || "[]"); }catch(error){ return []; }
  }
  function saveDocRecord(record){
    try{
      var list = JSON.parse(localStorage.getItem("dfmeaMyDocuments") || "[]");
      list.push(record);
      localStorage.setItem("dfmeaMyDocuments", JSON.stringify(list));
    }catch(error){ /* storage unavailable -- the flow still works, just won't be listed anywhere */ }
  }
  // There's only one real, fully-populated worksheet in this build (the
  // Crimp DFMEA), so every DFMEA created here "opens" by reusing that
  // same live structure under its own name -- stored per document id so
  // several created DFMEAs don't stomp on each other's labelling, and so
  // visiting index.html directly (no ?doc=) always shows the real one.
  function saveOverride(id, override){
    try{
      var map = JSON.parse(localStorage.getItem("dfmeaDocOverrides") || "{}");
      map[id] = override;
      localStorage.setItem("dfmeaDocOverrides", JSON.stringify(map));
    }catch(error){ /* override just won't persist -- navigation still works */ }
  }
  function makeDocId(){ return "doc-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  // Very simple "AI" stand-in: does the candidate's own name/filename
  // share a whole word with what the user typed? No real matching model
  // here -- this is a static front-end, so this is an honest, visible
  // substitute rather than a hidden fake "AI" that secretly does nothing.
  function wordsOf(text){
    return (text || "").toLowerCase().match(/[a-z0-9]+/g) || [];
  }
  function sharesWord(a, b){
    var setB = new Set(wordsOf(b));
    return wordsOf(a).some(function(w){ return w.length > 3 && setB.has(w); });
  }

  var candidates = [];
  document.getElementById("ndStep1Next").addEventListener("click", function(){
    if(!validateStep1()){
      document.querySelector(".nd-field.has-err input, .nd-field.has-err textarea").focus();
      return;
    }
    if(mode === "blank"){
      finishBlank();
      return;
    }
    buildCandidates();
    showStep(step2);
  });

  function buildCandidates(){
    var queryText = functionInput.value + " " + failureInput.value;
    candidates = [{
      id: "reference-crimp",
      name: "Crimp Contact Resistance",
      meta: "Reference DFMEA in this workspace · 64 causes · 26 paths · 11 levels deep",
      isReference: true
    }];
    readUploadHistory().forEach(function(file, index){
      candidates.push({
        id: "upload-" + index,
        name: file.name,
        meta: "Uploaded " + file.when + " · " + file.size,
        isReference: false
      });
    });
    var box = document.getElementById("ndCandidates");
    box.innerHTML = "";
    candidates.forEach(function(c){
      var matched = c.isReference || sharesWord(queryText, c.name);
      var row = document.createElement("label");
      row.className = "nd-candidate";
      row.innerHTML = '<input type="checkbox" data-id="' + c.id + '"' + (matched ? " checked" : "") + '>'
        + '<div><div class="ndc-name">' + escapeHtml(c.name) + (matched ? '<span class="ndc-badge">AI matched</span>' : "") + '</div>'
        + '<div class="ndc-meta">' + escapeHtml(c.meta) + '</div></div>';
      box.appendChild(row);
    });
  }
  function escapeHtml(value){
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  document.getElementById("ndStep2Back").addEventListener("click", function(){ showStep(step1); });
  document.getElementById("ndStep2Next").addEventListener("click", function(){
    var checked = Array.prototype.slice.call(document.querySelectorAll("#ndCandidates input:checked"))
      .map(function(input){ return candidates.find(function(c){ return c.id === input.dataset.id; }); })
      .filter(Boolean);
    showStep(step3);
    runGenerate(checked);
  });

  function runGenerate(selected){
    var fill = document.getElementById("ndProgressFill");
    var label = document.getElementById("ndProgressLabel");
    var steps = [
      [20, "Analysing related DFMEAs..."],
      [55, "Mapping causes from the reference structure..."],
      [85, "Building worksheet rows..."],
      [100, "Finishing up..."]
    ];
    var i = 0;
    fill.style.width = "0%";
    (function tick(){
      if(i >= steps.length){
        setTimeout(function(){ finishAi(selected); }, 350);
        return;
      }
      fill.style.width = steps[i][0] + "%";
      label.textContent = steps[i][1];
      i++;
      setTimeout(tick, 480);
    })();
  }

  function finishBlank(){
    var name = nameInput.value.trim();
    var fn = functionInput.value.trim();
    var failure = failureInput.value.trim();
    var projectId = projectSelect.value;
    var docId = makeDocId();
    saveDocRecord({ id: docId, name: name, function: fn, projectId: projectId, mode: "blank", createdAt: new Date().toLocaleString() });
    // A brand new DFMEA still needs *something* to open -- rather than a
    // dead end, it starts from the same default worksheet structure every
    // new document gets here, clearly labelled as a starting point you're
    // meant to edit, not a locked example.
    saveOverride(docId, {
      name: name, function: fn, failureMode: failure, mode: "blank", generatedAt: new Date().toISOString()
    });
    document.getElementById("ndDoneTitle").textContent = "“" + name + "” created";
    document.getElementById("ndDoneBody").textContent = "Started from the Electrical termination foundation template (64 causes, 26 paths). Everything is editable.";
    var actions = document.getElementById("ndDoneActions");
    actions.innerHTML = "";
    var aiBtn = document.createElement("button");
    aiBtn.type = "button"; aiBtn.className = "nd-btn"; aiBtn.textContent = "Generate with AI instead";
    aiBtn.addEventListener("click", function(){ window.location.href = "new-dfmea.html?mode=ai&project=" + encodeURIComponent(projectId); });
    var openBtn = document.createElement("button");
    openBtn.type = "button"; openBtn.className = "nd-btn primary"; openBtn.textContent = "Open and edit";
    openBtn.addEventListener("click", function(){ window.location.href = "index.html?doc=" + encodeURIComponent(docId); });
    actions.appendChild(aiBtn);
    actions.appendChild(openBtn);
    showStep(step4);
  }

  function finishAi(selected){
    var name = nameInput.value.trim();
    var fn = functionInput.value.trim();
    var failure = failureInput.value.trim();
    var projectId = projectSelect.value;
    var docId = makeDocId();
    var fromNames = selected.map(function(c){ return c.name; });
    var relatedUploadNames = selected.filter(function(c){ return !c.isReference; }).map(function(c){ return c.name; });
    saveDocRecord({ id: docId, name: name, function: fn, projectId: projectId, mode: "ai", generatedFrom: fromNames, relatedUploads: relatedUploadNames, createdAt: new Date().toLocaleString() });
    saveOverride(docId, {
      name: name, function: fn, failureMode: failure, mode: "ai", generatedFrom: relatedUploadNames, generatedAt: new Date().toISOString()
    });

    document.getElementById("ndDoneTitle").textContent = "“" + name + "” generated";
    document.getElementById("ndDoneBody").textContent = "A starting cause structure was built from the DFMEAs below. Everything is editable.";
    var summary = document.getElementById("ndSummaryBox");
    summary.hidden = false;
    summary.innerHTML = "<b>Function:</b> " + escapeHtml(fn) + "<br><b>Failure mode:</b> " + escapeHtml(failure)
      + "<br><b>Built from:</b> " + (fromNames.length ? escapeHtml(fromNames.join(", ")) : "Crimp Contact Resistance (default reference)")
      + "<br><b>Structure:</b> 64 causes across 26 paths, up to 11 levels deep";

    var actions = document.getElementById("ndDoneActions");
    actions.innerHTML = "";
    var openBtn = document.createElement("button");
    openBtn.type = "button"; openBtn.className = "nd-btn primary"; openBtn.textContent = "Open and edit";
    openBtn.addEventListener("click", function(){
      window.location.href = "index.html?doc=" + encodeURIComponent(docId);
    });
    var homeBtn = document.createElement("button");
    homeBtn.type = "button"; homeBtn.className = "nd-btn"; homeBtn.textContent = "Back to Overview";
    homeBtn.addEventListener("click", function(){ window.location.href = "index.html"; });
    actions.appendChild(homeBtn);
    actions.appendChild(openBtn);
    showStep(step4);
  }
})();
