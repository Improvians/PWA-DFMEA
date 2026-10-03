(function(){
  "use strict";
  // page-setup.js overwrites .ttl/.crumb with the dashboard's own title --
  // put this page's real title back afterward.
  var pageTitle = document.querySelector(".ttl");
  if(pageTitle) pageTitle.textContent = "Projects";
  var crumbEl = document.querySelector(".crumb");
  if(crumbEl) crumbEl.innerHTML = '347352010pdp000_01 &rsaquo; <b>Projects</b>';

  var navHome = document.getElementById("navHome");
  if(navHome) navHome.addEventListener("click", function(){ window.location.href = "index.html"; });

  var REAL_PROJECT = {
    id: "aster-ev-connector",
    name: "Aster EV Connector",
    desc: "2 DFMEA documents",
    real: true
  };
  // These two open and work just like the real project -- their DFMEA
  // documents reuse the same underlying worksheet, relabeled, the same
  // way AI-generated and blank DFMEAs do. They're marked "Sample data"
  // rather than "Active" so it's honest about which project is the real
  // one being worked on, without being a dead end that can't be opened.
  var SAMPLE_PROJECTS = [
    { id: "northstar-sensor-harness", name: "Northstar Sensor Harness", desc: "2 DFMEA documents" },
    { id: "meridian-charging-inlet", name: "Meridian Charging Inlet", desc: "1 DFMEA document" }
  ];

  function readMyProjects(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
  }
  function saveMyProjects(list){
    try{ localStorage.setItem("dfmeaMyProjects", JSON.stringify(list)); }catch(error){ /* storage unavailable */ }
  }
  function escapeHtml(value){
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  // Every project card is clickable -- nothing in this app is a dead
  // end. "active" is the one real, being-worked-on project; "sample" is
  // honestly-labelled demo data on the same editable structure; "empty"
  // is a project the visitor created here that has no DFMEA yet, same as
  // it would be in a real tool right after creating one.
  function cardHtml(project, state){
    var icon = state === "active"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>';
    var badgeClass = state === "active" ? "current" : (state === "sample" ? "sample" : "empty");
    var badgeText = state === "active" ? "Active" : (state === "sample" ? "Sample data" : "No DFMEA yet");
    return '<div class="proj-card" data-id="' + project.id + '" data-real="true"'
      + (state === "sample" ? ' data-tip="Sample data on the same editable structure as the real project."' : "")
      + (state === "empty" ? ' data-tip="Open this project, then use + New DFMEA to add one."' : "") + '>'
      + '<div class="proj-icon">' + icon + '</div>'
      + '<div class="proj-name">' + escapeHtml(project.name) + '</div>'
      + '<div class="proj-meta">' + escapeHtml(project.desc || "") + '</div>'
      + '<span class="proj-badge ' + badgeClass + '">' + badgeText + '</span>'
      + '</div>';
  }

  function render(){
    var grid = document.getElementById("projGrid");
    var html = cardHtml(REAL_PROJECT, "active");
    SAMPLE_PROJECTS.forEach(function(p){ html += cardHtml(p, "sample"); });
    readMyProjects().forEach(function(p){ html += cardHtml(p, "empty"); });
    grid.innerHTML = html;

    Array.prototype.slice.call(grid.querySelectorAll(".proj-card")).forEach(function(card){
      card.addEventListener("click", function(){
        if(card.dataset.real === "true") window.location.href = "project.html?id=" + encodeURIComponent(card.dataset.id);
      });
    });
  }
  render();

  var dialog = document.getElementById("createProjectDialog");
  var form = document.getElementById("createProjectForm");
  var nameInput = document.getElementById("cpName");
  document.getElementById("createProjectBtn").addEventListener("click", function(){
    form.reset();
    nameInput.classList.remove("err");
    dialog.showModal();
    nameInput.focus();
  });
  document.getElementById("cpCancel").addEventListener("click", function(){ dialog.close(); });
  dialog.addEventListener("click", function(event){ if(event.target === dialog) dialog.close(); });
  form.addEventListener("submit", function(event){
    event.preventDefault();
    var name = nameInput.value.trim();
    if(!name){ nameInput.classList.add("err"); nameInput.focus(); return; }
    var desc = document.getElementById("cpDesc").value.trim();
    var newProject = { id: "custom-" + Date.now().toString(36), name: name, desc: desc || "0 DFMEA documents", createdAt: new Date().toLocaleString() };
    var list = readMyProjects();
    list.push(newProject);
    saveMyProjects(list);
    render();
    dialog.close();
    // The sidebar tree is built once, at page load, by page-setup.js --
    // a project created here afterward wouldn't show up in it until the
    // next full page load otherwise. Append it live so the sidebar and
    // the grid on this page agree immediately, not just after a refresh.
    var treeNav = document.querySelector(".risk-tree");
    var emptyState = treeNav && treeNav.querySelector(".project-empty");
    if(treeNav){
      var entry = document.createElement("details");
      entry.className = "tree-project inactive-project";
      entry.setAttribute("data-id", newProject.id);
      entry.innerHTML = '<summary><span class="tree-name"></span></summary>';
      entry.querySelector(".tree-name").textContent = newProject.name;
      if(emptyState) treeNav.insertBefore(entry, emptyState);
      else treeNav.appendChild(entry);
      entry.querySelector(".tree-name").addEventListener("click", function(event){
        event.preventDefault();
        event.stopPropagation();
        window.location.href = "project.html?id=" + encodeURIComponent(newProject.id);
      });
    }
    if(window.showToast) window.showToast("“" + name + "” created. Add a DFMEA to it to get started.");
  });
})();
