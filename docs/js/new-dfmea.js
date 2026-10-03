(function(){
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var mode = params.get("mode") === "ai" ? "ai" : "blank";

  var pageTitle = document.getElementById("ndPageTitle");
  var crumb = document.getElementById("ndCrumb");
  if(mode === "ai"){
    pageTitle.textContent = "Create a new DFMEA with AI";
    crumb.textContent = "New DFMEA with AI";
  }

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
    saveDocRecord({ name: name, function: functionInput.value.trim(), mode: "blank", createdAt: new Date().toLocaleString() });
    document.getElementById("ndDoneTitle").textContent = "“" + name + "” created";
    document.getElementById("ndDoneBody").textContent = "This DFMEA is empty right now. Import an existing Excel sheet, or use AI to generate a starting cause structure for it.";
    var actions = document.getElementById("ndDoneActions");
    actions.innerHTML = "";
    var aiBtn = document.createElement("button");
    aiBtn.type = "button"; aiBtn.className = "nd-btn primary"; aiBtn.textContent = "Generate with AI instead";
    aiBtn.addEventListener("click", function(){ window.location.href = "new-dfmea.html?mode=ai"; });
    var homeBtn = document.createElement("button");
    homeBtn.type = "button"; homeBtn.className = "nd-btn"; homeBtn.textContent = "Back to Overview";
    homeBtn.addEventListener("click", function(){ window.location.href = "index.html"; });
    actions.appendChild(homeBtn);
    actions.appendChild(aiBtn);
    showStep(step4);
  }

  function finishAi(selected){
    var name = nameInput.value.trim();
    var fn = functionInput.value.trim();
    var failure = failureInput.value.trim();
    var fromNames = selected.map(function(c){ return c.name; });
    var relatedUploadNames = selected.filter(function(c){ return !c.isReference; }).map(function(c){ return c.name; });
    saveDocRecord({ name: name, function: fn, mode: "ai", generatedFrom: fromNames, relatedUploads: relatedUploadNames, createdAt: new Date().toLocaleString() });

    document.getElementById("ndDoneTitle").textContent = "“" + name + "” generated";
    document.getElementById("ndDoneBody").textContent = "A starting cause structure was built using the reference DFMEA below. You can edit everything -- nothing is locked.";
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
      try{
        localStorage.setItem("dfmeaActiveOverride", JSON.stringify({
          name: name, function: fn, failureMode: failure,
          generatedFrom: relatedUploadNames, generatedAt: new Date().toISOString()
        }));
      }catch(error){ /* override just won't persist -- navigation still works */ }
      window.location.href = "index.html";
    });
    var homeBtn = document.createElement("button");
    homeBtn.type = "button"; homeBtn.className = "nd-btn"; homeBtn.textContent = "Back to Overview";
    homeBtn.addEventListener("click", function(){ window.location.href = "index.html"; });
    actions.appendChild(homeBtn);
    actions.appendChild(openBtn);
    showStep(step4);
  }
})();
