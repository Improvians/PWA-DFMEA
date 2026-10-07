(function(){
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var projectId = params.get("id") || "";

  // Every document here is real in the sense that it opens and works --
  // "Crimp DFMEA" is the one with its own populated data, the rest reuse
  // that same editable structure under their own name/function (exactly
  // like a DFMEA created through New DFMEA does), clearly labelled as
  // sample data in the dashboard banner rather than pretending otherwise.
  var KNOWN_PROJECTS = {
    "aster-ev-connector": {
      name: "Aster EV Connector",
      docs: [
        { name: "Crimp DFMEA", real: true, meta: "64 causes · 26 paths · updated today" },
        { name: "Terminal Durability DFMEA", real: true, docId: "seed-terminal-durability", meta: "64 causes · 26 paths · updated 3 days ago" }
      ]
    },
    "northstar-sensor-harness": {
      name: "Northstar Sensor Harness",
      docs: [
        { name: "Harness Splice DFMEA", real: true, docId: "seed-harness-design", meta: "64 causes · 26 paths · updated last week" },
        { name: "Sensor Terminal Crimp DFMEA", real: true, docId: "seed-connector-retention", meta: "64 causes · 26 paths · updated 2 weeks ago" }
      ]
    },
    "meridian-charging-inlet": {
      name: "Meridian Charging Inlet",
      docs: [
        { name: "Inlet Terminal Crimp DFMEA", real: true, docId: "seed-terminal-assembly", meta: "64 causes · 26 paths · released last month" }
      ]
    }
  };

  function readMyProjects(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
  }
  function readMyDocuments(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyDocuments") || "[]"); }catch(error){ return []; }
  }
  var project = KNOWN_PROJECTS[projectId];
  if(!project){
    var custom = readMyProjects().find(function(p){ return p.id === projectId; });
    project = { name: custom ? custom.name : "Unknown project", docs: [] };
  }
  // Documents created through New DFMEA (blank or AI) for this project
  // belong on this list too, not just the hardcoded examples -- each one
  // really does open (it reuses the one live worksheet, renamed).
  project = { name: project.name, docs: project.docs.slice() };
  readMyDocuments().filter(function(d){ return d.projectId === projectId; }).forEach(function(d){
    project.docs.push({
      name: d.name, real: true, docId: d.id,
      meta: d.mode === "ai" ? "Generated with AI · " + d.createdAt : "Created " + d.createdAt
    });
  });

  var pageTitle = document.querySelector(".ttl");
  if(pageTitle) pageTitle.textContent = project.name;
  var crumbEl = document.querySelector(".crumb");
  if(crumbEl) crumbEl.innerHTML = 'DFMEA Studio &rsaquo; <a href="projects.html" style="color:inherit">Projects</a> &rsaquo; <b>' + escapeHtml(project.name) + '</b>';

  var navHome = document.getElementById("navHome");
  if(navHome) navHome.addEventListener("click", function(){ window.location.href = "projects.html"; });

  var newDfmeaBtn = document.getElementById("tabNewDfmea");
  if(newDfmeaBtn) newDfmeaBtn.addEventListener("click", function(){ window.location.href = "new-dfmea.html?mode=blank&project=" + encodeURIComponent(projectId); });
  var newDfmeaAiBtn = document.getElementById("tabNewDfmeaAi");
  if(newDfmeaAiBtn) newDfmeaAiBtn.addEventListener("click", function(){ window.location.href = "new-dfmea.html?mode=ai&project=" + encodeURIComponent(projectId); });

  function escapeHtml(value){
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  // A project created through "Create project with AI" has a generated
  // design requirement specification attached to it -- shown above the
  // document list when one exists, same section-numbering pattern as
  // everywhere else in the app (not hardcoded, since most projects won't
  // have one).
  function readRequirementDocs(){
    try{ return JSON.parse(localStorage.getItem("dfmeaRequirementDocs") || "[]"); }catch(error){ return []; }
  }
  var reqDoc = readRequirementDocs().find(function(r){ return r.projectId === projectId; });
  if(reqDoc){
    document.getElementById("reqSection").hidden = false;
    document.getElementById("reqProduct").textContent = reqDoc.productName;
    document.getElementById("reqStandard").textContent = reqDoc.standard === "None" ? "No specific standard" : reqDoc.standard;
    document.getElementById("reqSpecs").innerHTML = (reqDoc.specs || []).map(function(s){
      return '<li><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>' + escapeHtml(s) + '</li>';
    }).join("");
    document.getElementById("docsSecn").textContent = "2";
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
    return '<div class="doc-row' + (doc.real ? "" : " disabled") + '" data-real="' + doc.real + '" data-doc-id="' + (doc.docId || "") + '"'
      + (doc.real ? "" : ' data-tip="No DFMEA data has been added for this document yet."') + '>'
      + '<div class="doc-icon">' + icon + '</div>'
      + '<div><div class="doc-name">' + escapeHtml(doc.name) + '</div><div class="doc-meta">' + escapeHtml(doc.meta) + '</div></div>'
      + '<span class="doc-badge ' + (doc.real ? "ok" : "empty") + '">' + (doc.real ? "Open" : "No data yet") + '</span>'
      + '</div>';
  }).join("");
  Array.prototype.slice.call(listEl.querySelectorAll(".doc-row")).forEach(function(row){
    row.addEventListener("click", function(){
      if(row.dataset.real !== "true") return;
      var docId = row.dataset.docId;
      window.location.href = "index.html" + (docId ? "?doc=" + encodeURIComponent(docId) : "");
    });
  });
})();
