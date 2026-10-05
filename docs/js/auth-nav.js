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

  // "Projects" (id="navDfmea" in the markup, named for the sidebar slot
  // it occupies) is the one real entry point into the Projects browsing
  // pages, wired here so it works the same on every page that loads it.
  var isDashboard = !!document.getElementById("treeWrap");
  var projectsNav = document.getElementById("navDfmea");
  if(projectsNav) projectsNav.addEventListener("click", function(){
    window.location.href = "projects.html";
  });

  // "Contact resistance too high" / "Aster EV Connector" are hardcoded as
  // CURRENT in the tree page-setup.js builds, because that's correct on
  // the dashboard itself -- but the exact same tree markup is reused on
  // every other page too, where nothing is actually "current". Strip that
  // signal everywhere except the real dashboard, and make the tree's own
  // project/document names navigate properly instead of just expanding.
  var urlParams = new URLSearchParams(window.location.search);
  var activeDocId = isDashboard ? urlParams.get("doc") : null;
  if(!isDashboard || activeDocId){
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
    var docId = docEl.getAttribute("data-doc-id");
    var nameEl = docEl.querySelector(":scope > summary .tree-name");
    var projectEl = docEl.closest(".tree-project");
    var projectId = projectEl ? projectEl.getAttribute("data-id") : null;
    if(!nameEl) return;
    nameEl.addEventListener("click", function(event){
      event.preventDefault();
      event.stopPropagation();
      if(isReal) window.location.href = "index.html" + (docId ? "?doc=" + encodeURIComponent(docId) : "");
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
  var currentProjectId = isDashboard ? "aster-ev-connector" : urlParams.get("id");
  var activeDocEl = null;
  if(activeDocId){
    // Viewing a document other than the Crimp DFMEA: the tree should show
    // THAT document as current (and its project expanded), not leave the
    // Crimp DFMEA branch highlighted as if it were still the open page.
    activeDocEl = Array.prototype.slice.call(document.querySelectorAll(".tree-document[data-doc-id]")).find(function(el){
      return el.getAttribute("data-doc-id") === activeDocId;
    }) || null;
    if(activeDocEl){
      var activeProjectEl = activeDocEl.closest(".tree-project");
      currentProjectId = activeProjectEl ? activeProjectEl.getAttribute("data-id") : null;
      Array.prototype.slice.call(document.querySelectorAll(".tree-project-active")).forEach(function(el){
        el.classList.remove("tree-project-active");
      });
      Array.prototype.slice.call(document.querySelectorAll(".tree-document[open]")).forEach(function(el){
        el.removeAttribute("open");
      });
      Array.prototype.slice.call(document.querySelectorAll(".tree-project[open]")).forEach(function(el){
        if(el !== activeProjectEl) el.removeAttribute("open");
      });
      if(activeProjectEl){
        activeProjectEl.classList.add("tree-project-active");
        var activeSummary = activeProjectEl.querySelector(":scope > summary");
        if(activeSummary && !activeSummary.querySelector(".project-state")){
          var badge = document.createElement("span");
          badge.className = "project-state";
          badge.textContent = "CURRENT";
          activeSummary.appendChild(badge);
        }
      }
      activeDocEl.classList.add("tree-doc-current");
      activeDocEl.setAttribute("aria-current", "page");
    }
  }
  if(currentProjectId){
    var currentProjectEl = Array.prototype.slice.call(document.querySelectorAll(".tree-project")).find(function(el){
      return el.getAttribute("data-id") === currentProjectId;
    });
    if(currentProjectEl) currentProjectEl.setAttribute("open", "");
  }

  // The sidebar tree relies on native <details>/<summary> for expand and
  // collapse, but the browser's own default marker looks inconsistent
  // and dated next to the rest of the app -- swap in a small chevron
  // that rotates open, same icon language as every other control here.
  Array.prototype.slice.call(document.querySelectorAll(".risk-tree summary")).forEach(function(summary){
    if(summary.querySelector(".tree-chev") || summary.querySelector(".tree-chev-spacer")) return;
    if(!summary.parentElement.querySelector(":scope > .tree-children")){
      // A project with no documents yet has nothing to expand, but its
      // name should still line up with the sibling projects that do.
      if(summary.parentElement.classList.contains("tree-project")){
        var spacer = document.createElement("span");
        spacer.className = "tree-chev-spacer";
        summary.insertBefore(spacer, summary.firstChild);
      }
      return;
    }
    var chev = document.createElementNS ? document.createElement("span") : null;
    chev.className = "tree-chev";
    chev.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
    summary.insertBefore(chev, summary.firstChild);
  });

  // "+ New DFMEA" defaults to whichever project this page is already
  // showing (the dashboard is always Aster EV Connector; a project page
  // carries its id in the URL), so creating one doesn't force picking the
  // project again when it's already obvious from context.
  var newDfmeaProjectId = currentProjectId;
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
    "seed-terminal-durability": { name: "Terminal Durability DFMEA", function: "Terminal Contact Resistance After Cycling", failureMode: "Missing or Degraded Function", mode: "sample" },
    "seed-harness-design": { name: "Harness Splice DFMEA", function: "Splice Crimp Contact Resistance", failureMode: "Missing or Degraded Function", mode: "sample" },
    "seed-connector-retention": { name: "Sensor Terminal Crimp DFMEA", function: "Sensor Terminal Crimp Resistance", failureMode: "Missing or Degraded Function", mode: "sample" },
    "seed-terminal-assembly": { name: "Inlet Terminal Crimp DFMEA", function: "Inlet Terminal Crimp Resistance", failureMode: "Missing or Degraded Function", mode: "sample" }
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
    if(titleEl && titleEl.firstChild) titleEl.firstChild.textContent = (override.function || override.name) + " ";
    var crumbEl = document.querySelector(".crumb");
    if(crumbEl){
      var crumbProjectEl = activeDocEl ? activeDocEl.closest(".tree-project") : null;
      var crumbProjectName = crumbProjectEl ? crumbProjectEl.querySelector(":scope > summary .tree-name").textContent.trim() : "";
      crumbEl.textContent = "";
      if(crumbProjectName) crumbEl.appendChild(document.createTextNode(crumbProjectName + " › "));
      crumbEl.appendChild(document.createTextNode(override.name + " › "));
      var crumbLeaf = document.createElement("b");
      crumbLeaf.textContent = "Risk Analysis";
      crumbEl.appendChild(crumbLeaf);
    }
    var wsn = document.querySelector(".wsn");
    if(wsn) wsn.textContent = override.name;

    // The worksheet and risk tree below are the one real dataset in this
    // build, reused under every renamed document -- without this, a
    // document named "Harness Design DFMEA" would still show "Crimp
    // Contact Resistance" as its function throughout the worksheet and
    // diagram, which reads as broken, not as a starting template. This
    // brings the function/failure-mode text that's actually shown
    // everywhere in line with what was typed when the document was made.
    if(override.function){
      // Severity belongs to the failure mode/effect, same for every cause
      // path under it (see the readonly note on the worksheet's own
      // Severity field) -- so one value from the creation form applies to
      // every row here too, exactly like Crimp DFMEA's own severity does.
      var sevValue = Number(override.severity);
      var sevValid = Number.isInteger(sevValue) && sevValue >= 1 && sevValue <= 10;
      var sevTier = sevValue >= 9 ? "s-crit" : (sevValue >= 6 ? "s-high" : "s-low");
      Array.prototype.slice.call(document.querySelectorAll("#wsBody tr")).forEach(function(row){
        if(!row.cells || row.cells.length < 5) return;
        var fnEl = row.cells[2].querySelector(".t1") || row.cells[2];
        fnEl.textContent = override.function;
        row.cells[4].textContent = override.failureMode || override.function;
        if(sevValid){
          var sevChip = row.cells[6].querySelector(".chip");
          if(sevChip){
            sevChip.textContent = sevValue;
            sevChip.className = "chip " + sevTier;
          }
        }
      });
      var fnNode = Array.prototype.slice.call(document.querySelectorAll("#treeZoom .hitbox")).find(function(g){
        var tag = g.querySelector(".ttag");
        return tag && tag.textContent.trim() === "FUNCTION";
      });
      if(fnNode){
        var fnTitle = fnNode.querySelector(".ttl2 tspan") || fnNode.querySelector(".ttl2");
        if(fnTitle) fnTitle.textContent = override.function;
        var fnTip = fnNode.getAttribute("data-tip");
        if(fnTip) fnNode.setAttribute("data-tip", fnTip.replace("Crimp Contact Resistance", override.function));
      }
      var fmNode = Array.prototype.slice.call(document.querySelectorAll("#treeZoom .hitbox")).find(function(g){
        var tag = g.querySelector(".ttag");
        return tag && tag.textContent.trim() === "FAILURE MODE";
      });
      if(fmNode){
        var fmTitle = fmNode.querySelector(".ttl2 tspan") || fmNode.querySelector(".ttl2");
        var fmText = override.failureMode || override.function;
        if(fmTitle) fmTitle.textContent = fmText;
        var fmTip = fmNode.getAttribute("data-tip");
        if(fmTip) fmNode.setAttribute("data-tip", fmTip.replace("Missing or Degraded Function", fmText));
        if(sevValid){
          var fmSub = fmNode.querySelector(".tsub");
          if(fmSub) fmSub.textContent = "Severity " + sevValue;
          var fmTip2 = fmNode.getAttribute("data-tip");
          if(fmTip2) fmNode.setAttribute("data-tip", fmTip2.replace(/Severity \d+/, "Severity " + sevValue));
        }
      }
      if(window.refreshDfmeaMetrics) window.refreshDfmeaMetrics();
    }

    // Announcing "this was generated from X" is the point when AI
    // generation is the feature being shown off -- but sample/starter
    // documents should just look like real documents, not carry a
    // disclaimer banner explaining they're reused data underneath.
    if(override.mode !== "ai") return;

    var banner = document.createElement("div");
    banner.style.cssText = "margin:0 0 14px;padding:10px 14px;border-radius:9px;background:#EEF2FF;"
      + "border:1px solid #C7D2FE;color:#3730A3;font-size:11.5px;display:flex;align-items:center;gap:10px";
    var sourceText = 'was generated from the <b>Crimp Contact Resistance</b> reference DFMEA'
      + (override.generatedFrom && override.generatedFrom.length ? ' and ' + override.generatedFrom.length + ' related upload' + (override.generatedFrom.length === 1 ? "" : "s") : "");
    banner.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"/></svg>'
      + '<span><b>' + String(override.name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</b> ' + sourceText
      + '. Everything below is a real, editable starting structure, not a locked preview.</span>'
      + '<button type="button" id="dismissOverrideBtn" style="margin-left:auto;background:none;border:none;color:#4338CA;font-weight:700;font-size:11px;cursor:pointer;flex:none">View the original Crimp DFMEA</button>';
    var content = document.querySelector(".content");
    if(content) content.insertBefore(banner, content.firstChild);
    var dismissBtn = document.getElementById("dismissOverrideBtn");
    if(dismissBtn) dismissBtn.addEventListener("click", function(){
      window.location.href = "index.html";
    });
  }

  // it1_app.js (dashboard only) defines a richer showToast -- this is a
  // minimal fallback so every other page can show the same honest
  // "not available yet" feedback instead of a nav item just doing nothing.
  if(!window.showToast){
    var toastTimer = null;
    window.showToast = function(message){
      var toast = document.getElementById("dfmeaToast");
      if(!toast){
        toast = document.createElement("div");
        toast.id = "dfmeaToast";
        document.body.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function(){ toast.classList.remove("show"); }, 2600);
    };
  }

  // Every other sidebar module (Requirements, DVP&R, Reports, Settings...)
  // exists to make this look like a real product, but isn't built out --
  // a nav item with a pointer cursor that silently does nothing on click
  // reads as broken. Giving it the same honest toast as Import Excel and
  // the create-DFMEA stub buttons use is cheap and closes that gap
  // everywhere at once, without having to fake a whole module per click.
  Array.prototype.slice.call(document.querySelectorAll(".side .nav")).forEach(function(item){
    if(item === projectsNav || item.id === "navHome" || item.id === "navUploadData") return;
    item.addEventListener("click", function(){
      window.showToast(item.textContent.trim() + " isn't available in this preview yet.");
    });
  });
})();
