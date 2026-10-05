(function(){
  "use strict";
  // page-setup.js overwrites .ttl/.crumb with the dashboard's own title --
  // put this page's real title back afterward.
  var pageTitle = document.querySelector(".ttl");
  if(pageTitle) pageTitle.textContent = "Projects";
  var crumbEl = document.querySelector(".crumb");
  if(crumbEl) crumbEl.innerHTML = 'DFMEA Studio &rsaquo; <b>Projects</b>';

  var navHome = document.getElementById("navHome");
  if(navHome) navHome.addEventListener("click", function(){ window.location.href = "projects.html"; });

  var dialog = document.getElementById("createProjectDialog");
  var form = document.getElementById("createProjectForm");
  var nameInput = document.getElementById("cpName");
  function openCreateDialog(){
    form.reset();
    nameInput.classList.remove("err");
    var cpNameFieldEl = document.getElementById("cpNameField");
    if(cpNameFieldEl) cpNameFieldEl.classList.remove("has-err");
    dialog.showModal();
    nameInput.focus();
  }

  // Built-in projects with their built-in document counts and a normal
  // lifecycle status, like a real workspace would show.
  var BUILT_IN_PROJECTS = [
    { id: "aster-ev-connector", name: "Aster EV Connector", baseDocs: 2, status: "active" },
    { id: "northstar-sensor-harness", name: "Northstar Sensor Harness", baseDocs: 2, status: "review" },
    { id: "meridian-charging-inlet", name: "Meridian Charging Inlet", baseDocs: 1, status: "released" }
  ];
  var STATUS_LABELS = { active: "Active", review: "In review", released: "Released", draft: "Draft", empty: "No DFMEA yet" };

  function readMyProjects(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
  }
  function readMyDocuments(){
    try{ return JSON.parse(localStorage.getItem("dfmeaMyDocuments") || "[]"); }catch(error){ return []; }
  }
  function docCountLabel(count){
    return count + " DFMEA document" + (count === 1 ? "" : "s");
  }
  // Older custom projects stored the count text itself as their
  // description -- that's not a real description, so don't show it twice.
  function realDescription(project){
    var d = (project.description != null ? project.description : project.desc) || "";
    return /^\d+ DFMEA documents?$/.test(d) ? "" : d;
  }
  function saveMyProjects(list){
    try{ localStorage.setItem("dfmeaMyProjects", JSON.stringify(list)); }catch(error){ /* storage unavailable */ }
  }
  function escapeHtml(value){
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }

  // Every project card is clickable -- nothing in this app is a dead end.
  // A project created here with no DFMEA yet says so, same as a real tool
  // would right after creating one.
  function cardHtml(project, status, docCount, description){
    var icon = status === "empty"
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
    return '<div class="proj-card" data-id="' + escapeHtml(project.id) + '" data-real="true"'
      + (status === "empty" ? ' data-tip="Open this project, then use + New DFMEA to add one."' : "") + '>'
      + '<div class="proj-icon">' + icon + '</div>'
      + '<div class="proj-name">' + escapeHtml(project.name) + '</div>'
      + (description ? '<div class="proj-meta">' + escapeHtml(description) + '</div>' : "")
      + '<div class="proj-meta">' + escapeHtml(docCountLabel(docCount)) + '</div>'
      + '<span class="proj-badge ' + status + '">' + STATUS_LABELS[status] + '</span>'
      + '</div>';
  }

  function render(){
    var grid = document.getElementById("projGrid");
    var myDocs = readMyDocuments();
    function createdCount(id){
      return myDocs.filter(function(d){ return d.projectId === id; }).length;
    }
    var html = "";
    BUILT_IN_PROJECTS.forEach(function(p){
      html += cardHtml(p, p.status, p.baseDocs + createdCount(p.id), "");
    });
    readMyProjects().forEach(function(p){
      var count = createdCount(p.id);
      html += cardHtml(p, count ? "draft" : "empty", count, realDescription(p));
    });
    // A grid that ends mid-row with nothing after it reads as unfinished,
    // and the only way to create a project was a small button up in the
    // header -- a ghost card in the grid itself is a second, more
    // discoverable entry point exactly where someone's eye already is
    // after scanning the existing projects.
    html += '<button type="button" class="proj-card proj-card-add" id="projAddCard">'
      + '<div class="proj-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></div>'
      + '<div class="proj-name">Create project</div>'
      + '<div class="proj-meta">Start a new product or system</div>'
      + '</button>';
    grid.innerHTML = html;

    Array.prototype.slice.call(grid.querySelectorAll(".proj-card:not(.proj-card-add)")).forEach(function(card){
      card.addEventListener("click", function(){
        if(card.dataset.real === "true") window.location.href = "project.html?id=" + encodeURIComponent(card.dataset.id);
      });
    });
    document.getElementById("projAddCard").addEventListener("click", openCreateDialog);
  }
  render();

  // Two projects (or two DFMEAs within one project, handled in
  // new-dfmea.js) with the same name is exactly the kind of thing that's
  // confusing later -- which one is which in the sidebar tree, in a
  // dropdown, in a search result -- so it's blocked at creation time,
  // the same way an empty name already was meant to be.
  var cpNameField = document.getElementById("cpNameField");
  var cpNameErr = document.getElementById("cpNameErr");
  function existingProjectNames(){
    return BUILT_IN_PROJECTS.map(function(p){ return p.name; })
      .concat(readMyProjects().map(function(p){ return p.name; }));
  }
  document.getElementById("createProjectBtn").addEventListener("click", openCreateDialog);
  document.getElementById("cpCancel").addEventListener("click", function(){ dialog.close(); });
  dialog.addEventListener("click", function(event){ if(event.target === dialog) dialog.close(); });
  nameInput.addEventListener("input", function(){
    cpNameField.classList.remove("has-err");
    nameInput.classList.remove("err");
  });
  form.addEventListener("submit", function(event){
    event.preventDefault();
    var name = nameInput.value.trim();
    var duplicate = !!name && existingProjectNames().some(function(n){ return n.toLowerCase() === name.toLowerCase(); });
    if(!name || duplicate){
      cpNameErr.textContent = !name ? "Give this project a name." : "A project named “" + name + "” already exists.";
      cpNameField.classList.add("has-err");
      nameInput.classList.add("err");
      nameInput.focus();
      return;
    }
    var desc = document.getElementById("cpDesc").value.trim();
    var newProject = { id: "custom-" + Date.now().toString(36), name: name, description: desc, createdAt: new Date().toLocaleString() };
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
      entry.innerHTML = '<summary><span class="tree-chev-spacer"></span><span class="tree-name"></span></summary>';
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
