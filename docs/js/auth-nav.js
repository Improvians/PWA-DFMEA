(function(){
  "use strict";
  // Kept separate from the existing page scripts on purpose -- this only
  // wires up login/logout/navigation, so it can't interfere with anything
  // the dashboard's own scripts already do.
  var auth = null;
  try{ auth = JSON.parse(localStorage.getItem("dfmeaAuth") || "null"); }catch(error){ auth = null; }

  if(auth && auth.email){
    var sfoot = document.getElementById("sfootUser");
    var nameEl = sfoot && sfoot.querySelector(".un");
    var roleEl = sfoot && sfoot.querySelector(".ur");
    if(nameEl) nameEl.textContent = auth.email;
    if(roleEl) roleEl.textContent = "Signed in";
    if(sfoot) sfoot.setAttribute("data-tip", "Signed in as " + auth.email);
  }

  var logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn) logoutBtn.addEventListener("click", function(){
    try{ localStorage.removeItem("dfmeaAuth"); }catch(error){ /* nothing to clean up then */ }
    window.location.href = "login.html";
  });

  var uploadNav = document.getElementById("navUploadData");
  if(uploadNav) uploadNav.addEventListener("click", function(){
    window.location.href = "upload.html";
  });

  // page-setup.js relabels whichever nav item was ".nav.on" in the static
  // markup into "Projects" and builds the project tree -- that relabeled
  // item is the one real entry point into the new Projects browsing
  // pages, wired here so it works the same on every page that loads it.
  var isDashboard = !!document.getElementById("treeWrap");
  var projectsNav = document.getElementById("navDfmea") || document.querySelector(".nav.on");
  if(projectsNav) projectsNav.addEventListener("click", function(){
    window.location.href = "projects.html";
  });

  // "Contact resistance too high" / "Aster EV Connector" are hardcoded as
  // CURRENT in the tree page-setup.js builds, because that's correct on
  // the dashboard itself -- but the exact same tree markup is reused on
  // every other page too, where nothing is actually "current". Strip that
  // signal everywhere except the real dashboard, and make the tree's own
  // project/document names navigate properly instead of just expanding.
  if(!isDashboard){
    var currentLeaf = document.querySelector(".tree-current");
    if(currentLeaf){
      currentLeaf.classList.remove("tree-current");
      currentLeaf.removeAttribute("aria-current");
    }
    var currentBadge = document.querySelector(".project-state");
    if(currentBadge) currentBadge.remove();
  }
  // Every project and document name in the sidebar tree should actually
  // go somewhere, the same way the Projects pages do -- not just expand
  // its branch. Project rows carry their real id in data-id (page-setup.js
  // writes it, including for custom projects created on the Projects
  // page), and document rows carry data-real -- "Crimp DFMEA" is the one
  // real document and opens the live dashboard, every other document name
  // goes to its own project's page, where it's honestly listed as having
  // no data yet rather than pretending to open one.
  Array.prototype.slice.call(document.querySelectorAll(".tree-project")).forEach(function(projectEl){
    var projectId = projectEl.getAttribute("data-id");
    var nameEl = projectEl.querySelector(":scope > summary .tree-name");
    if(!projectId || !nameEl) return;
    nameEl.addEventListener("click", function(event){
      event.preventDefault();
      event.stopPropagation();
      window.location.href = "project.html?id=" + encodeURIComponent(projectId);
    });
  });
  Array.prototype.slice.call(document.querySelectorAll(".tree-document")).forEach(function(docEl){
    var isReal = docEl.getAttribute("data-real") === "true";
    var nameEl = docEl.querySelector(":scope > summary .tree-name");
    var projectEl = docEl.closest(".tree-project");
    var projectId = projectEl ? projectEl.getAttribute("data-id") : null;
    if(!nameEl) return;
    nameEl.addEventListener("click", function(event){
      event.preventDefault();
      event.stopPropagation();
      if(isReal) window.location.href = "index.html";
      else if(projectId) window.location.href = "project.html?id=" + encodeURIComponent(projectId);
    });
  });

  // The failure-mode leaves under Crimp DFMEA (e.g. "Contact resistance
  // too high") are part of the one real document too -- on every page
  // except the dashboard itself they need to open it, the same as
  // clicking "Crimp DFMEA" one level up does, instead of being dead text.
  if(!isDashboard){
    Array.prototype.slice.call(document.querySelectorAll(".tree-leaf")).forEach(function(leaf){
      leaf.style.cursor = "pointer";
      leaf.addEventListener("click", function(event){
        event.preventDefault();
        event.stopPropagation();
        window.location.href = "index.html";
      });
    });
  }

  // Clicking a project/document name navigates (above); clicking anywhere
  // else on its row (or the chevron) expands/collapses it natively via
  // <details>, so a single click on the row itself does both at once. On
  // top of that, whichever project (and, on the dashboard, document) the
  // CURRENT page actually belongs to should always show expanded in the
  // tree, however the visitor got there -- a direct link, the back
  // button, or a click here -- so the sidebar and the page never disagree.
  var urlParams = new URLSearchParams(window.location.search);
  var currentProjectId = isDashboard ? "aster-ev-connector" : urlParams.get("id");
  if(currentProjectId){
    var currentProjectEl = document.querySelector('.tree-project[data-id="' + currentProjectId.replace(/"/g, '\\"') + '"]');
    if(currentProjectEl) currentProjectEl.setAttribute("open", "");
  }

  // The sidebar tree relies on native <details>/<summary> for expand and
  // collapse, but the browser's own default marker looks inconsistent
  // and dated next to the rest of the app -- swap in a small chevron
  // that rotates open, same icon language as every other control here.
  Array.prototype.slice.call(document.querySelectorAll(".risk-tree summary")).forEach(function(summary){
    if(summary.querySelector(".tree-chev") || !summary.parentElement.querySelector(":scope > .tree-children")) return;
    var chev = document.createElementNS ? document.createElement("span") : null;
    chev.className = "tree-chev";
    chev.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
    summary.insertBefore(chev, summary.firstChild);
  });

  // "+ New DFMEA" defaults to whichever project this page is already
  // showing (the dashboard is always Aster EV Connector; a project page
  // carries its id in the URL), so creating one doesn't force picking the
  // project again when it's already obvious from context.
  var newDfmeaProjectId = isDashboard ? "aster-ev-connector" : urlParams.get("id");
  var newDfmeaSuffix = newDfmeaProjectId ? "&project=" + encodeURIComponent(newDfmeaProjectId) : "";
  var newDfmeaBtn = document.getElementById("tabNewDfmea");
  if(newDfmeaBtn) newDfmeaBtn.addEventListener("click", function(){
    window.location.href = "new-dfmea.html?mode=blank" + newDfmeaSuffix;
  });
  var newDfmeaAiBtn = document.getElementById("tabNewDfmeaAi");
  if(newDfmeaAiBtn) newDfmeaAiBtn.addEventListener("click", function(){
    window.location.href = "new-dfmea.html?mode=ai" + newDfmeaSuffix;
  });

  // A DFMEA created through New DFMEA (blank or with AI) doesn't get its
  // own separate dashboard -- there's only one real, fully-wired
  // worksheet/tree in this build. Instead it reuses THIS SAME page's
  // live, editable structure and just relabels the name/function/
  // breadcrumb, with a banner saying so plainly rather than pretending
  // it's a distinct document underneath. Each created document keeps its
  // own override (keyed by the ?doc= id in the URL) in dfmeaDocOverrides,
  // so visiting index.html plainly (no ?doc=) always shows the real
  // Crimp DFMEA, and several created documents never stomp on each other.
  // Northstar and Meridian's documents, and Aster's "Terminal Durability
  // DFMEA", are sample data built into the app itself (not something a
  // visitor created) -- they're the same kind of override, just seeded
  // here instead of written to localStorage by New DFMEA.
  var SEED_OVERRIDES = {
    "seed-terminal-durability": { name: "Terminal Durability DFMEA", function: "Withstand repeated mating cycles", mode: "sample" },
    "seed-harness-design": { name: "Harness Design DFMEA", function: "Protect and route the sensor harness", mode: "sample" },
    "seed-connector-retention": { name: "Connector Retention DFMEA", function: "Keep the sensor connector seated under vibration", mode: "sample" },
    "seed-terminal-assembly": { name: "Terminal Assembly DFMEA", function: "Align and seat the charging terminal", mode: "sample" }
  };
  var override = null;
  if(isDashboard){
    var docId = urlParams.get("doc");
    if(docId && SEED_OVERRIDES[docId]){
      override = SEED_OVERRIDES[docId];
    }else if(docId){
      try{
        var docOverrides = JSON.parse(localStorage.getItem("dfmeaDocOverrides") || "{}");
        override = docOverrides[docId];
      }catch(error){ override = null; }
    }
  }
  if(override && override.name){
    var titleEl = document.querySelector(".ttl");
    if(titleEl && titleEl.firstChild) titleEl.firstChild.textContent = override.function || override.name;
    var crumbEl = document.querySelector(".crumb");
    if(crumbEl) crumbEl.innerHTML = override.name + " &rsaquo; <b>Risk Analysis</b>";
    var wsn = document.querySelector(".wsn");
    if(wsn) wsn.textContent = override.name;

    var banner = document.createElement("div");
    banner.style.cssText = "margin:0 0 14px;padding:10px 14px;border-radius:9px;background:#EEF2FF;"
      + "border:1px solid #C7D2FE;color:#3730A3;font-size:11.5px;display:flex;align-items:center;gap:10px";
    var sourceText = override.mode === "ai"
      ? ('was generated from the <b>Crimp Contact Resistance</b> reference DFMEA'
        + (override.generatedFrom && override.generatedFrom.length ? ' and ' + override.generatedFrom.length + ' related upload' + (override.generatedFrom.length === 1 ? "" : "s") : ""))
      : override.mode === "sample"
      ? 'is sample data included with this demo, on the same editable structure as the Crimp DFMEA'
      : 'was started from a default worksheet structure';
    banner.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"/></svg>'
      + '<span><b>' + override.name + '</b> ' + sourceText
      + '. Everything below is a real, editable starting structure, not a locked preview.</span>'
      + '<button type="button" id="dismissOverrideBtn" style="margin-left:auto;background:none;border:none;color:#4338CA;font-weight:700;font-size:11px;cursor:pointer;flex:none">View the original Crimp DFMEA</button>';
    var content = document.querySelector(".content");
    if(content) content.insertBefore(banner, content.firstChild);
    var dismissBtn = document.getElementById("dismissOverrideBtn");
    if(dismissBtn) dismissBtn.addEventListener("click", function(){
      window.location.href = "index.html";
    });
  }
})();
