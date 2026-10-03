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
  var PLACEHOLDER_PROJECTS = [
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

  function cardHtml(project, disabled){
    var icon = disabled
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
    return '<div class="proj-card' + (disabled ? ' disabled' : '') + '" data-id="' + project.id + '" data-real="' + (!disabled) + '"'
      + (disabled ? ' data-tip="No DFMEA data has been added for this project yet."' : '') + '>'
      + '<div class="proj-icon">' + icon + '</div>'
      + '<div class="proj-name">' + escapeHtml(project.name) + '</div>'
      + '<div class="proj-meta">' + escapeHtml(project.desc || "") + '</div>'
      + '<span class="proj-badge ' + (disabled ? "empty" : "current") + '">' + (disabled ? "No data yet" : "Active") + '</span>'
      + '</div>';
  }

  function render(){
    var grid = document.getElementById("projGrid");
    var html = cardHtml(REAL_PROJECT, false);
    PLACEHOLDER_PROJECTS.forEach(function(p){ html += cardHtml(p, true); });
    readMyProjects().forEach(function(p){ html += cardHtml(p, true); });
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
    var list = readMyProjects();
    list.push({ id: "custom-" + Date.now().toString(36), name: name, desc: desc || "0 DFMEA documents", createdAt: new Date().toLocaleString() });
    saveMyProjects(list);
    render();
    dialog.close();
    if(window.showToast) window.showToast("“" + name + "” created. Add a DFMEA to it to get started.");
  });
})();
