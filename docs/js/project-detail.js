(function(){
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var projectId = params.get("id") || "";

  var KNOWN_PROJECTS = {
    "aster-ev-connector": {
      name: "Aster EV Connector",
      docs: [
        { name: "Crimp DFMEA", real: true, meta: "26 cause paths · last updated recently" },
        { name: "Terminal Durability DFMEA", real: false, meta: "No data yet" }
      ]
    },
    "northstar-sensor-harness": {
      name: "Northstar Sensor Harness",
      docs: [
        { name: "Harness Design DFMEA", real: false, meta: "No data yet" },
        { name: "Connector Retention DFMEA", real: false, meta: "No data yet" }
      ]
    },
    "meridian-charging-inlet": {
      name: "Meridian Charging Inlet",
      docs: [
        { name: "Terminal Assembly DFMEA", real: false, meta: "No data yet" }
      ]
    }
  };

  function readMyProjects(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
  }
  var project = KNOWN_PROJECTS[projectId];
  if(!project){
    var custom = readMyProjects().find(function(p){ return p.id === projectId; });
    project = { name: custom ? custom.name : "Unknown project", docs: [] };
  }

  var pageTitle = document.querySelector(".ttl");
  if(pageTitle) pageTitle.textContent = project.name;
  var crumbEl = document.querySelector(".crumb");
  if(crumbEl) crumbEl.innerHTML = '347352010pdp000_01 &rsaquo; <a href="projects.html" style="color:inherit">Projects</a> &rsaquo; <b>' + escapeHtml(project.name) + '</b>';

  var navHome = document.getElementById("navHome");
  if(navHome) navHome.addEventListener("click", function(){ window.location.href = "index.html"; });

  var newDfmeaBtn = document.getElementById("tabNewDfmea");
  if(newDfmeaBtn) newDfmeaBtn.addEventListener("click", function(){ window.location.href = "new-dfmea.html?mode=blank"; });
  var newDfmeaAiBtn = document.getElementById("tabNewDfmeaAi");
  if(newDfmeaAiBtn) newDfmeaAiBtn.addEventListener("click", function(){ window.location.href = "new-dfmea.html?mode=ai"; });

  function escapeHtml(value){
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  var listEl = document.getElementById("docList");
  if(!project.docs.length){
    listEl.innerHTML = '<div class="uh-empty" style="padding:30px;text-align:center;color:#94A3B8;border:1px dashed #E4EAF2;border-radius:11px">'
      + 'No DFMEA documents in this project yet. Use "New DFMEA" or "New DFMEA with AI" above to add one.</div>';
    return;
  }
  listEl.innerHTML = project.docs.map(function(doc){
    var icon = doc.real
      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg>'
      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>';
    return '<div class="doc-row' + (doc.real ? "" : " disabled") + '" data-real="' + doc.real + '"'
      + (doc.real ? "" : ' data-tip="No DFMEA data has been added for this document yet."') + '>'
      + '<div class="doc-icon">' + icon + '</div>'
      + '<div><div class="doc-name">' + escapeHtml(doc.name) + '</div><div class="doc-meta">' + escapeHtml(doc.meta) + '</div></div>'
      + '<span class="doc-badge ' + (doc.real ? "ok" : "empty") + '">' + (doc.real ? "Open" : "No data yet") + '</span>'
      + '</div>';
  }).join("");
  Array.prototype.slice.call(listEl.querySelectorAll(".doc-row")).forEach(function(row){
    row.addEventListener("click", function(){
      if(row.dataset.real === "true") window.location.href = "index.html";
    });
  });
})();
