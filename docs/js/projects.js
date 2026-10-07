(function(){
  "use strict";
  // page-setup.js overwrites .ttl/.crumb with the dashboard's own title --
  // put this page's real title back afterward.
  var pageTitle = document.querySelector(".ttl");
  if(pageTitle) pageTitle.textContent = "Projects";
  var crumbEl = document.querySelector(".crumb");
  if(crumbEl) crumbEl.innerHTML = 'DFMEA Studio &rsaquo; <b>Projects</b>';

  // Built-in projects with their built-in document counts and a normal
  // lifecycle status, like a real workspace would show.
  var BUILT_IN_PROJECTS = [
    { id: "aster-ev-connector", name: "Aster EV Connector", baseDocs: 2, status: "active" }
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
      + '<div class="proj-meta">' + docCountLabel(docCount) + '</div>'
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
    // and a ghost card in the grid itself is a more discoverable entry
    // point exactly where someone's eye already is after scanning the
    // existing projects -- every project is now created through the AI
    // flow (it's what generates the design requirement specification),
    // so this links straight there instead of a separate plain dialog.
    html += '<a href="new-project.html" class="proj-card proj-card-add" id="projAddCard">'
      + '<div class="proj-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></div>'
      + '<div class="proj-name">Create project with AI</div>'
      + '<div class="proj-meta">Start a new product or system</div>'
      + '</a>';
    grid.innerHTML = html;

    Array.prototype.slice.call(grid.querySelectorAll(".proj-card:not(.proj-card-add)")).forEach(function(card){
      card.addEventListener("click", function(){
        if(card.dataset.real === "true") window.location.href = "project.html?id=" + encodeURIComponent(card.dataset.id);
      });
    });
  }
  render();
})();
