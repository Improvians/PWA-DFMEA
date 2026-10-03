
(function(){
  var projectCard = document.querySelector(".ws");
  if(projectCard) projectCard.remove();
  document.querySelectorAll(".sh").forEach(function(section){
    if(section.textContent.trim() === "ENGINEERING") section.remove();
  });
  var activeModule = document.querySelector(".nav.on");
  if(activeModule){
    activeModule.innerHTML = '<span class="ni"><svg class="ic" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></span>Projects';
    activeModule.setAttribute("aria-current", "page");
  }
  var breadcrumb = document.querySelector(".crumb");
  if(breadcrumb){
    breadcrumb.innerHTML = "Aster EV Connector &rsaquo; Crimp DFMEA &rsaquo; Conductor Crimp &rsaquo; Carry electrical current";
  }
  var pageTitle = document.querySelector(".ttl");
  if(pageTitle && pageTitle.firstChild){
    pageTitle.firstChild.textContent = "Contact resistance too high ";
  }
  var treeSvg = document.querySelector("#treeZoom svg");
  if(treeSvg && !treeSvg.querySelector("#treeContent")){
    var documentNode = Array.prototype.slice.call(treeSvg.querySelectorAll("g.hitbox")).find(function(node){
      var tag = node.querySelector(".ttag");
      return tag && tag.textContent.trim() === "DFMEA DOCUMENT";
    });
    if(documentNode){
      var documentPlus = documentNode.nextElementSibling;
      documentNode.remove();
      if(documentPlus && documentPlus.classList.contains("pl")) documentPlus.remove();
    }
    Array.prototype.slice.call(treeSvg.querySelectorAll("text.lane")).forEach(function(lane){
      if(lane.textContent.trim() === "DFMEA DOCUMENT") lane.remove();
    });
    Array.prototype.slice.call(treeSvg.children).forEach(function(child){
      var path = child.getAttribute("d") || "";
      if(child.tagName.toLowerCase() === "path" && /^M176,/.test(path) && /200,/.test(path)) child.remove();
    });
    var treeContent = document.createElementNS("http://www.w3.org/2000/svg", "g");
    treeContent.setAttribute("id", "treeContent");
    Array.prototype.slice.call(treeSvg.children).forEach(function(child){
      if(child.tagName.toLowerCase() === "defs" || child.tagName.toLowerCase() === "style") return;
      treeContent.appendChild(child);
    });
    // The static cards were laid out with barely any gap between their
    // top edge and the tag text, and between the tag and the title --
    // both got tighter once the fonts and overall scale were bumped up.
    // A first attempt grew every card's height uniformly, but most
    // stacked siblings only had ~16px of gap between them to begin
    // with, so that growth ate straight into it and made cards touch.
    // This version keeps the total growth small enough to stay inside
    // that gap (rect grows by PAD_GROW, split evenly top/bottom so the
    // centre -- and every connector/plus-button anchored to it -- never
    // moves), and gets the rest of the improvement by REDISTRIBUTING
    // internal space rather than adding more of it: the tag-to-title
    // gap (the tightest one) borrows a few px from the title-to-subtitle
    // gap (which had slack to spare), so nothing grows outside the card.
    var PAD_GROW = 6;
    var TAG_SHIFT = PAD_GROW / 2;
    var TITLE_SHIFT = TAG_SHIFT + 5;
    var TSUB_SHIFT = TAG_SHIFT;
    Array.prototype.slice.call(treeContent.querySelectorAll("g.hitbox")).forEach(function(g){
      if(g.classList.contains("local-cause")) return;
      var rects = g.querySelectorAll("rect");
      if(rects.length < 2) return;
      rects.forEach(function(r){
        var y = Number(r.getAttribute("y"));
        var h = Number(r.getAttribute("height"));
        if(!Number.isFinite(y) || !Number.isFinite(h)) return;
        r.setAttribute("y", y - PAD_GROW / 2);
        r.setAttribute("height", h + PAD_GROW);
      });
      var tag = g.querySelector(".ttag");
      var tid = g.querySelector(".tid");
      var title = g.querySelector(".ttl2");
      var tsub = g.querySelector(".tsub");
      [tag, tid].forEach(function(t){
        if(!t) return;
        t.setAttribute("y", Number(t.getAttribute("y")) + TAG_SHIFT);
      });
      if(title) title.setAttribute("y", Number(title.getAttribute("y")) + TITLE_SHIFT);
      if(tsub) tsub.setAttribute("y", Number(tsub.getAttribute("y")) + TSUB_SHIFT);
    });
    var treeScale = 1.3;
    treeContent.setAttribute("transform", "matrix(" + treeScale + " 0 0 " + treeScale + " " + (-192 * treeScale) + " " + (16 * treeScale) + ")");
    treeSvg.appendChild(treeContent);
    var originalViewBox = treeSvg.viewBox.baseVal;
    var originalTreeHeight = originalViewBox.height;
    var treeWidth = Math.max(800, (originalViewBox.width - 192) * treeScale) + 60;
    var treeHeight = originalTreeHeight * treeScale + 60;
    treeSvg.setAttribute("viewBox", "0 0 " + treeWidth + " " + treeHeight);
    treeSvg.setAttribute("width", treeWidth);
    treeSvg.setAttribute("height", treeHeight);
    Array.prototype.slice.call(treeSvg.querySelectorAll("g.pl")).forEach(function(plus){
      var owner = plus.previousElementSibling;
      var tag = owner && owner.querySelector(".ttag");
      if(!tag || /^(FUNCTION|ITEM)$/.test(tag.textContent.trim())) plus.remove();
    });
  }
  var searchShell = document.querySelector(".top .srch");
  if(searchShell){
    searchShell.innerHTML = '<svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg><input id="globalSearch" type="search" aria-label="Search failure modes, causes, and controls" placeholder="Search failure modes, causes, controls" autocomplete="off">';
  }
  var topBar = document.querySelector(".top");
  if(topBar){
    var updateTopBarHeight = function(){
      document.documentElement.style.setProperty("--topbar-height", topBar.offsetHeight + "px");
    };
    updateTopBarHeight();
    if(window.ResizeObserver) new ResizeObserver(updateTopBarHeight).observe(topBar);
    else window.addEventListener("resize", updateTopBarHeight);
  }
  var documentLink = document.querySelector(".subnav.on");
  if(documentLink){
    function readCustomProjects(){
      try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
    }
    function escapeAttr(value){
      var div = document.createElement("div");
      div.textContent = String(value);
      return div.innerHTML;
    }
    var customProjectsHtml = readCustomProjects().map(function(p){
      return '<details class="tree-project inactive-project" data-id="' + escapeAttr(p.id) + '">'
        + '<summary><span class="tree-name">' + escapeAttr(p.name) + '</span></summary>'
        + '</details>';
    }).join("");
    documentLink.outerHTML = `<div class="project-filter">
      <label class="project-search">
        <svg class="ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
        <input id="projectSearch" type="search" aria-label="Search projects" placeholder="Find a project" autocomplete="off">
      </label>
      <nav class="risk-tree" aria-label="Projects and risk hierarchy">
        <details class="tree-project tree-project-active" data-id="aster-ev-connector" open>
          <summary data-tip="Project"><span class="tree-name">Aster EV Connector</span><span class="project-state">CURRENT</span></summary>
          <div class="tree-children">
            <details class="tree-document" data-real="true" open>
              <summary data-tip="DFMEA document"><span class="tree-name">Crimp DFMEA</span></summary>
              <div class="tree-children">
                <details open>
                  <summary data-tip="Item or component"><span class="tree-name">Conductor Crimp</span></summary>
                  <div class="tree-children">
                    <details open>
                      <summary data-tip="Function: what the component should do"><span class="tree-name">Carry electrical current</span></summary>
                      <div class="tree-children">
                        <div class="tree-leaf tree-current" aria-current="page" data-tip="Failure mode: how this function can fail">Contact resistance too high</div>
                        <div class="tree-leaf" data-tip="Failure mode">Wire pulls out of terminal</div>
                      </div>
                    </details>
                    <details>
                      <summary data-tip="Function: what the component should do"><span class="tree-name">Hold the conductor securely</span></summary>
                      <div class="tree-children"><div class="tree-leaf" data-tip="Failure mode">Crimp grip is too weak</div></div>
                    </details>
                  </div>
                </details>
                <details class="tree-document" data-real="false">
                  <summary data-tip="DFMEA document"><span class="tree-name">Terminal Durability DFMEA</span></summary>
                </details>
              </div>
            </details>
          </div>
        </details>
        <details class="tree-project inactive-project" data-id="northstar-sensor-harness">
          <summary><span class="tree-name">Northstar Sensor Harness</span></summary>
          <div class="tree-children">
            <details class="tree-document" data-real="false"><summary><span class="tree-name">Harness Design DFMEA</span></summary></details>
            <details class="tree-document" data-real="false"><summary><span class="tree-name">Connector Retention DFMEA</span></summary></details>
          </div>
        </details>
        <details class="tree-project inactive-project" data-id="meridian-charging-inlet">
          <summary><span class="tree-name">Meridian Charging Inlet</span></summary>
          <div class="tree-children">
            <details class="tree-document" data-real="false"><summary><span class="tree-name">Terminal Assembly DFMEA</span></summary></details>
          </div>
        </details>
        ${customProjectsHtml}
        <div class="project-empty" aria-live="polite" hidden>No matching projects</div>
      </nav>
    </div>`;
    var projectSearch = document.getElementById("projectSearch");
    if(projectSearch){
      var projects = Array.prototype.slice.call(document.querySelectorAll(".tree-project"));
      var initiallyOpen = projects.map(function(project){ return project.open; });
      var emptyState = document.querySelector(".project-empty");
      projectSearch.addEventListener("input", function(){
        var query = projectSearch.value.trim().toLowerCase();
        var visible = 0;
        projects.forEach(function(project, index){
          var name = project.querySelector(":scope > summary").textContent.toLowerCase();
          var matches = !query || name.indexOf(query) !== -1;
          project.hidden = !matches;
          if(query) project.open = matches;
          else project.open = initiallyOpen[index];
          if(matches) visible++;
        });
        emptyState.hidden = visible > 0;
      });
    }
  }
  function refreshDfmeaMetrics(){
  var analysisRows = Array.prototype.slice.call(document.querySelectorAll("#wsBody tr"));
  var summaryRow = analysisRows[0];
  if(summaryRow){
    document.getElementById("summaryFunction").textContent = summaryRow.cells[2].textContent.trim();
    document.getElementById("summaryCriteria").textContent = summaryRow.cells[3].textContent.trim();
    document.getElementById("summaryFailure").textContent = summaryRow.cells[4].textContent.trim();
    document.getElementById("summaryEffect").textContent = summaryRow.cells[5].textContent.trim();
  }
  var svgCauseNodes = Array.prototype.slice.call(document.querySelectorAll("#treeZoom .hitbox")).filter(function(node){
    var tag = node.querySelector(".ttag");
    return tag && tag.textContent.trim().indexOf("CAUSE") === 0;
  });
  function uniqueCellValues(index){
    return Array.from(new Set(analysisRows.map(function(row){ return row.cells[index].textContent.trim(); }).filter(Boolean)));
  }
  function setKpi(previousLabel, label, value, tip){
    var card = Array.prototype.slice.call(document.querySelectorAll(".kp")).find(function(item){
      return item.dataset.kpiKey === previousLabel || item.querySelector(".kpt").textContent.trim().toLowerCase() === previousLabel;
    });
    if(!card) return;
    card.dataset.kpiKey = previousLabel;
    card.querySelector(".kpt").textContent = label;
    card.querySelector(".kpv").textContent = value;
    card.setAttribute("data-tip", tip);
  }
  var stageValues = uniqueCellValues(1);
  var stage = stageValues.length === 1 ? stageValues[0] : "Multiple";
  var stageNumber = stage.match(/^([0-9]+(?:\.[0-9]+)?)/);
  var lifeCycleValue = stageNumber ? stageNumber[1] : stage;
  var tbdPathCount = 0;
  var depthCounts = Object.create(null);
  var controlValues = [];
  analysisRows.forEach(function(row){
    var levelCells = Array.prototype.slice.call(row.cells, 7, 21);
    var deepestLevel = 0;
    var hasTbd = false;
    levelCells.forEach(function(cell, index){
      var value = cell.textContent.trim();
      if(value){
        deepestLevel = index + 1;
        if(value.toUpperCase() === "TBD") hasTbd = true;
      }
    });
    row.setAttribute("data-tbd", hasTbd ? "1" : "0");
    row.setAttribute("data-depth", String(deepestLevel));
    if(hasTbd) tbdPathCount++;
    if(deepestLevel) depthCounts[deepestLevel] = (depthCounts[deepestLevel] || 0) + 1;

    var severity = Number(row.cells[6].textContent.trim());
    [[25, 27, 28], [29, 31, 32]].forEach(function(columns){
      var occurrence = Number(row.cells[columns[0]].textContent.trim());
      var detection = Number(row.cells[columns[1]].textContent.trim());
      if(!Number.isFinite(severity) || !Number.isFinite(occurrence) || !Number.isFinite(detection)) return;
      var result = severity * occurrence * detection;
      var resultCell = row.cells[columns[2]];
      resultCell.textContent = String(result);
      var formula = document.createElement("div");
      formula.className = "dep";
      formula.textContent = severity + " × " + occurrence + " × " + detection;
      resultCell.appendChild(formula);
    });
    [26, 30].forEach(function(index){
      var control = row.cells[index].textContent.trim();
      if(control) controlValues.push(control);
    });
  });
  controlValues = Array.from(new Set(controlValues));
  var severities = uniqueCellValues(6);
  var deepestUsedLevel = Math.max.apply(null, Object.keys(depthCounts).map(Number).concat([0]));
  var tbdNodes = Array.prototype.slice.call(document.querySelectorAll("#treeZoom .hitbox")).filter(function(node){
    var title = node.querySelector(".ttl2");
    return title && title.textContent.trim().toUpperCase() === "TBD";
  });
  tbdNodes.forEach(function(node){
    node.classList.add("is-tbd");
    node.setAttribute("data-tip", "TBD: this cause has not been identified. No countermeasure is documented on this path.");
    var subtitle = node.querySelector(".tsub");
    if(subtitle) subtitle.textContent = "Cause not identified";
  });
  var treeTbdSummary = document.getElementById("treeTbdSummary");
  if(treeTbdSummary) treeTbdSummary.textContent = tbdPathCount + " paths end in TBD";
  var treeControlSummary = document.getElementById("treeControlSummary");
  if(treeControlSummary){
    treeControlSummary.textContent = controlValues.length
      ? controlValues.length + " current controls are recorded."
      : "No current controls are recorded in this DFMEA.";
  }
  var treeSummary = document.getElementById("treeSummary");
  if(treeSummary) treeSummary.textContent = svgCauseNodes.length + " causes across " + analysisRows.length + " paths";
  var kpiPathCount = document.getElementById("kpiPathCount");
  if(kpiPathCount) kpiPathCount.textContent = analysisRows.length;
  var tbdCountLabel = document.getElementById("wsTbdCount");
  if(tbdCountLabel) tbdCountLabel.textContent = tbdPathCount;
  var levelChipContainer = document.getElementById("wsLevelChips");
  if(levelChipContainer){
    Object.keys(depthCounts).map(Number).sort(function(a,b){return a-b;}).forEach(function(depth){
      var existing = levelChipContainer.querySelector('.lvlchip[data-depth="' + depth + '"]');
      if(existing) return;
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "lvlchip";
      chip.setAttribute("data-depth", String(depth));
      chip.setAttribute("data-dynamic-depth", "true");
      chip.setAttribute("data-tip", "Show " + depthCounts[depth] + " paths ending at Level " + depth + ".");
      chip.innerHTML = "L" + depth + " <b>" + depthCounts[depth] + "</b>";
      levelChipContainer.appendChild(chip);
    });
  }
  document.querySelectorAll(".lvlchip").forEach(function(chip){
    var depth = chip.getAttribute("data-depth");
    var count = depth === "all" ? analysisRows.length : (depthCounts[depth] || 0);
    var number = chip.querySelector("b");
    if(number) number.textContent = count;
    if(depth !== "all") chip.setAttribute("data-tip", "Show " + count + " paths ending at Level " + depth + ".");
  });
  setKpi("functions analysed", "Functions analysed", uniqueCellValues(2).length,
    "Number of distinct functions in this DFMEA.");
  setKpi("failure modes", "Failure modes", uniqueCellValues(4).length,
    "Number of distinct failure modes in this DFMEA.");
  setKpi("life cycle stage", "Product life-cycle stage", lifeCycleValue,
    stage + " is the product life-cycle category recorded in this DFMEA; it is not calculated from risk scores.");
  setKpi("causes mapped", "Causes mapped", svgCauseNodes.length,
    "Count of cause nodes shown in the risk tree.");
  setKpi("still marked tbd", "Paths ending in TBD", tbdPathCount,
    "Cause paths whose deepest identified cause is still marked TBD.");
  setKpi("current controls", "Recorded controls", controlValues.length,
    controlValues.length ? controlValues.length + " distinct current controls are recorded." : "No current controls are recorded in this DFMEA.");
  setKpi("severity", "Severity (S)", severities.length === 1 ? severities[0] : "Mixed",
    "Severity rating recorded in the worksheet; it is based on the effect.");
  setKpi("deepest used level", "Deepest cause level", deepestUsedLevel,
    "Deepest identified cause level among the worksheet paths.");

  var failureNode = Array.prototype.slice.call(document.querySelectorAll("#treeZoom .hitbox")).find(function(node){
    var tag = node.querySelector(".ttag");
    return tag && tag.textContent.trim().indexOf("FAILURE MODE") === 0;
  });
  if(failureNode && analysisRows.length){
    var selectedRow = analysisRows[0];
    var selectedSeverity = Number(selectedRow.cells[6].textContent.trim());
    var selectedOccurrence = Number(selectedRow.cells[29].textContent.trim());
    var selectedDetection = Number(selectedRow.cells[31].textContent.trim());
    failureNode.setAttribute("data-tip", "Failure mode: " + selectedRow.cells[4].textContent.trim() +
      ". Severity " + selectedSeverity + ", Occurrence " + selectedOccurrence +
      ", Detection " + selectedDetection + ", RPN " + (selectedSeverity * selectedOccurrence * selectedDetection) + ".");
  }
  document.querySelectorAll("[data-tip]").forEach(function(element){
    var tip = element.getAttribute("data-tip");
    if(/client/i.test(tip)) element.setAttribute("data-tip", tip.replace(/\bclient\b/gi, "DFMEA"));
  });
  }
  window.refreshDfmeaMetrics = refreshDfmeaMetrics;
  refreshDfmeaMetrics();

  var sectionHeads = Array.prototype.slice.call(document.querySelectorAll(".content > .seclab"));
  var tabContainer = document.querySelector(".tabs");
  var sectionLabels = ["Overview", "Risk Tree", "Worksheet"];
  var sectionIds = ["dfmea-overview", "dfmea-risk-tree", "dfmea-worksheet"];
  if(tabContainer && sectionHeads.length >= sectionIds.length){
    sectionHeads = sectionHeads.slice(0, sectionIds.length);
    sectionHeads.forEach(function(section, index){ section.id = sectionIds[index]; });
    tabContainer.outerHTML = '<nav class="tabs" aria-label="DFMEA page sections"></nav>';
    tabContainer = document.querySelector(".tabs");
    tabContainer.innerHTML = sectionLabels.map(function(label, index){
      return '<a class="tab" href="#' + sectionIds[index] + '">' + label + '</a>';
    }).join("") + '<div class="tabs-actions">'
      + '<button type="button" class="tab-add" disabled data-tip="Not available in this preview yet -- causes can already be added from the Risk Tree and Worksheet tabs.">+ Function</button>'
      + '<button type="button" class="tab-add" disabled data-tip="Not available in this preview yet -- causes can already be added from the Risk Tree and Worksheet tabs.">+ Failure mode</button>'
      + '<button type="button" class="tab-add" id="tabImportExcel" data-tip="Import an existing DFMEA from an Excel workbook."><svg class="ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:2px"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>Import Excel</button>'
      + '<input type="file" id="tabImportExcelInput" accept=".xlsx,.xls" hidden>'
      + '<button type="button" class="tab-add" id="tabNewDfmea" data-tip="Start a brand new, empty DFMEA document."><svg class="ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:2px"><path d="M12 5v14M5 12h14"/></svg>New DFMEA</button>'
      + '<button type="button" class="tab-add acc" id="tabNewDfmeaAi" data-tip="Describe the issue and let AI suggest related past DFMEAs to build a starting structure from."><svg class="ic" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:2px"><path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"/></svg>New DFMEA with AI</button>'
      + '</div>';
    var sectionTabs = Array.prototype.slice.call(tabContainer.querySelectorAll(".tab"));
    function setActiveTab(id){
      sectionTabs.forEach(function(tab){
        var active = tab.getAttribute("href") === "#" + id;
        tab.classList.toggle("on", active);
        if(active) tab.setAttribute("aria-current", "location");
        else tab.removeAttribute("aria-current");
      });
    }
    function syncActiveTab(){
      var current = sectionHeads[0];
      sectionHeads.forEach(function(section){
        if(section.getBoundingClientRect().top <= 150) current = section;
      });
      setActiveTab(current.id);
    }
    sectionTabs.forEach(function(tab){
      tab.addEventListener("click", function(){
        setActiveTab(tab.getAttribute("href").slice(1));
      });
    });
    window.addEventListener("scroll", syncActiveTab, {passive:true});
    window.addEventListener("hashchange", syncActiveTab);
    syncActiveTab();
    var importBtn = document.getElementById("tabImportExcel");
    var importInput = document.getElementById("tabImportExcelInput");
    if(importBtn && importInput){
      importBtn.addEventListener("click", function(){ importInput.click(); });
      importInput.addEventListener("change", function(){
        var file = importInput.files && importInput.files[0];
        importInput.value = "";
        if(!file) return;
        if(window.showToast) window.showToast('"' + file.name + '" received. Full Excel import is coming soon.');
      });
    }
  }
})();
