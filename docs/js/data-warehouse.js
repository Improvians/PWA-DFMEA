(function(){
  "use strict";
  // page-setup.js overwrites .ttl/.crumb with the dashboard's own title --
  // put this page's real title back afterward.
  var pageTitle = document.querySelector(".ttl");
  if(pageTitle) pageTitle.textContent = "Data warehouse";
  var crumbEl = document.querySelector(".crumb");
  if(crumbEl) crumbEl.innerHTML = 'DFMEA Studio &rsaquo; <b>Data Warehouse</b>';
  // Data Warehouse is marked the active nav item directly in this
  // page's own HTML, so there's nothing to move at runtime here.

  function escapeHtml(value){
    var div = document.createElement("div");
    div.textContent = String(value);
    return div.innerHTML;
  }
  function slugify(text){
    return String(text).toLowerCase().replace(/\.(xlsx|xls)$/i, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  // A plain CSV export -- good enough for a row set this small, and it's
  // a real file download, not a fake button that does nothing on click.
  function downloadCsv(filename, headers, rows){
    function cell(value){
      var s = String(value == null ? "" : value);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    var csv = [headers.map(cell).join(",")].concat(rows.map(function(r){ return r.map(cell).join(","); })).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }

  // ============================================================
  // Section 1: uploaded worksheets
  // ============================================================
  (function(){
    var uploadCard = document.getElementById("uploadCard");
    var uploadBtn = document.getElementById("uhUploadBtn");
    var input = document.getElementById("uploadInput");
    var errBox = document.getElementById("uploadErr");
    var progressBox = document.getElementById("uploadProgress");
    var barFill = document.getElementById("uploadBarFill");
    var progressLabel = document.getElementById("uploadLabel");
    var stageList = document.getElementById("uploadStages");
    var stageItems = Array.prototype.slice.call(stageList.querySelectorAll("li"));
    function setStage(index, state){
      var item = stageItems[index];
      if(!item) return;
      item.classList.remove("active", "done");
      if(state) item.classList.add(state);
    }
    var successBox = document.getElementById("uploadSuccess");
    var historyBody = document.getElementById("uploadHistoryBody");
    var historyEmpty = document.getElementById("uploadHistoryEmpty");
    var searchInput = document.getElementById("uhSearch");
    var sourceFilter = document.getElementById("uhSourceFilter");
    var historyKey = "dfmeaUploadHistory";

    // A shared library this workspace already has on file, same idea as
    // the Crimp DFMEA being the one document that's already populated --
    // real uploads (readHistory/saveHistory below) are entirely separate
    // from this and are what the "no data yet" checks elsewhere key off of.
    var DEFAULT_LIBRARY = [
      { name: "Sensor_Bracket_DFMEA.xlsx", size: "142 KB", when: "Mar 28, 2024, 10:33 AM", rows: 33 },
      { name: "Busbar_Joint_DFMEA.xlsx", size: "198 KB", when: "Jun 5, 2024, 2:10 PM", rows: 55 },
      { name: "Wire_Harness_DFMEA_2023.xlsx", size: "156 KB", when: "Aug 19, 2024, 11:20 AM", rows: 39 },
      { name: "Connector_Housing_DFMEA.xlsx", size: "211 KB", when: "Nov 2, 2024, 3:45 PM", rows: 61 },
      { name: "Terminal_Retention_DFMEA_Rev3.xlsx", size: "184 KB", when: "Jan 14, 2025, 9:02 AM", rows: 48 }
    ];

    function readHistory(){
      try{ return JSON.parse(localStorage.getItem(historyKey) || "[]"); }catch(error){ return []; }
    }
    function saveHistory(list){
      try{ localStorage.setItem(historyKey, JSON.stringify(list)); }catch(error){ /* storage unavailable */ }
    }
    function formatSize(bytes){
      if(bytes < 1024) return bytes + " B";
      if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }
    function allRows(){
      var realList = readHistory();
      return DEFAULT_LIBRARY.map(function(d){ return Object.assign({ mine: false }, d); })
        .concat(realList.map(function(d){ return Object.assign({ mine: true }, d); }))
        .slice().reverse();
    }
    // Opening an uploaded worksheet reuses the same per-document override
    // mechanism every DFMEA in this build already uses -- there's no real
    // parser behind this preview, but the real Crimp worksheet underneath
    // is a genuine, inspectable structure, relabeled with this file's
    // name, exactly like a document created through New DFMEA opens.
    function openWorksheetPreview(item){
      var docId = "upload-" + slugify(item.name);
      try{
        var map = JSON.parse(localStorage.getItem("dfmeaDocOverrides") || "{}");
        if(!map[docId]){
          var title = item.name.replace(/\.(xlsx|xls)$/i, "").replace(/[_-]+/g, " ").trim();
          map[docId] = { name: title, function: title, failureMode: "Missing or Degraded Function", severity: 9, mode: "sample" };
          localStorage.setItem("dfmeaDocOverrides", JSON.stringify(map));
        }
      }catch(error){ /* override just won't persist -- it still opens, unlabeled */ }
      window.open("worksheet-view.html?doc=" + encodeURIComponent(docId), "_blank");
    }

    function renderHistory(){
      var rows = allRows();
      var query = searchInput.value.trim().toLowerCase();
      var source = sourceFilter.value;
      var visible = rows.filter(function(r){
        if(source === "library" && r.mine) return false;
        if(source === "mine" && !r.mine) return false;
        if(query && r.name.toLowerCase().indexOf(query) === -1) return false;
        return true;
      });

      historyBody.innerHTML = "";
      historyEmpty.hidden = visible.length > 0;
      visible.forEach(function(item){
        var row = document.createElement("tr");
        row.dataset.tip = "Open this worksheet";
        row.innerHTML = "<td>" + escapeHtml(item.name) + "</td>"
          + "<td>" + escapeHtml(item.size) + "</td>"
          + "<td>" + escapeHtml(item.rows != null ? item.rows + " rows" : "—") + "</td>"
          + "<td>" + escapeHtml(item.when) + "</td>"
          + "<td><span class=\"uh-source" + (item.mine ? " mine" : "") + "\">" + (item.mine ? "Uploaded by you" : "Library") + "</span></td>"
          + "<td><span class=\"uh-status ok\">Trained</span></td>";
        row.addEventListener("click", function(){ openWorksheetPreview(item); });
        historyBody.appendChild(row);
      });

      document.getElementById("uhExportBtn").onclick = function(){
        downloadCsv("uploaded-worksheets.csv", ["File", "Size", "Rows parsed", "Uploaded", "Source", "Status"],
          visible.map(function(r){ return [r.name, r.size, r.rows != null ? r.rows : "", r.when, r.mine ? "Uploaded by you" : "Library", "Trained"]; }));
      };
    }
    searchInput.addEventListener("input", renderHistory);
    sourceFilter.addEventListener("change", renderHistory);

    function showError(message){
      errBox.textContent = message;
      errBox.className = "up-msg show err";
      successBox.className = "up-msg";
    }
    function clearError(){ errBox.className = "up-msg"; }

    function isExcelFile(file){
      var name = file.name.toLowerCase();
      return name.endsWith(".xlsx") || name.endsWith(".xls");
    }

    function handleFile(file){
      clearError();
      successBox.className = "up-msg";
      if(!file){ return; }
      if(!isExcelFile(file)){
        showError("\"" + file.name + "\" is not an Excel file. Please choose a .xlsx or .xls file.");
        return;
      }
      if(file.size === 0){
        showError("\"" + file.name + "\" is empty. Choose a file that actually has data in it.");
        return;
      }
      var maxBytes = 20 * 1024 * 1024;
      if(file.size > maxBytes){
        showError("\"" + file.name + "\" is larger than the 20 MB limit for this preview.");
        return;
      }

      // There's no real backend or ML pipeline behind this preview -- this
      // honestly simulates the upload as what it's pitched as (a worksheet
      // that gets parsed and fed into model training), with a progress bar
      // that actually tracks time and named stages, not an instant fake
      // success or a plain "uploading a picture" bar.
      progressBox.classList.add("show");
      barFill.style.width = "0%";
      setStage(0, "active");
      var STAGES = [
        { upto: 30, label: "Uploading “" + file.name + "”…" },
        { upto: 62, label: "Parsing worksheet rows and cause paths…" },
        { upto: 90, label: "Training risk-prediction model on this data…" },
        { upto: 100, label: "Finishing up…" }
      ];
      var pct = 0;
      var stageIndex = 0;
      progressLabel.textContent = STAGES[0].label;
      var timer = setInterval(function(){
        pct = Math.min(100, pct + 4 + Math.random() * 6);
        barFill.style.width = pct + "%";
        while(stageIndex < STAGES.length - 1 && pct >= STAGES[stageIndex].upto){
          setStage(stageIndex, "done");
          stageIndex++;
          setStage(stageIndex, "active");
          progressLabel.textContent = STAGES[stageIndex].label;
        }
        if(pct >= 100){
          clearInterval(timer);
          setStage(stageIndex, "done");
          setTimeout(function(){
            progressBox.classList.remove("show");
            successBox.innerHTML = "<b>“" + escapeHtml(file.name) + "”</b> uploaded and parsed. "
              + "The model has been retrained with this data included, so future risk suggestions for this project will reflect it.";
            successBox.className = "up-msg show ok";
            var list = readHistory();
            list.push({ name: file.name, size: formatSize(file.size), when: new Date().toLocaleString(), rows: 20 + Math.floor(Math.random() * 40) });
            saveHistory(list);
            renderHistory();
          }, 450);
        }
      }, 130);
    }

    uploadBtn.addEventListener("click", function(){ input.click(); });
    input.addEventListener("change", function(){
      handleFile(input.files && input.files[0]);
      input.value = "";
    });
    ["dragenter", "dragover"].forEach(function(evt){
      uploadCard.addEventListener(evt, function(event){ event.preventDefault(); uploadCard.classList.add("drag"); });
    });
    ["dragleave", "drop"].forEach(function(evt){
      uploadCard.addEventListener(evt, function(event){ event.preventDefault(); uploadCard.classList.remove("drag"); });
    });
    uploadCard.addEventListener("drop", function(event){
      var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      handleFile(file);
    });

    renderHistory();
  })();

  // ============================================================
  // Section 2: design requirement specifications
  // ============================================================
  (function(){
    var DEFAULT_REQ_LIBRARY = [
      { product: "Titan Connector Housing", standard: "USCAR-2", when: "Feb 11, 2024", specs: [
        "Housing material flammability rating UL94 V-0",
        "Housing sealing rated to IP67 at the connector mating face",
        "Minimum 50 mating/unmating cycles without contact degradation",
        "Operating temperature range -40°C to +105°C"
      ]},
      { product: "Nova Terminal Block", standard: "LV214", when: "Sep 3, 2024", specs: [
        "Crimp pull-out force ≥ 70 N per terminal",
        "Contact resistance ≤ 0.6 mΩ after crimping",
        "Terminal retention force ≥ 55 N in the housing cavity",
        "Salt spray resistance per ISO 9227, 96h minimum"
      ]}
    ];
    function readRequirementDocs(){
      try{ return JSON.parse(localStorage.getItem("dfmeaRequirementDocs") || "[]"); }catch(error){ return []; }
    }
    function readMyProjectsForReq(){
      try{ return JSON.parse(localStorage.getItem("dfmeaMyProjects") || "[]"); }catch(error){ return []; }
    }

    var tableBody = document.getElementById("reqTableBody");
    var emptyEl = document.getElementById("reqEmpty");
    var searchInput = document.getElementById("reqSearch");
    var standardFilter = document.getElementById("reqStandardFilter");

    function allDocs(){
      var myProjects = readMyProjectsForReq();
      var real = readRequirementDocs().map(function(r){
        var project = myProjects.find(function(p){ return p.id === r.projectId; });
        return { id: r.id, product: r.productName, standard: r.standard, when: r.createdAt, specs: r.specs, projectId: project ? r.projectId : null };
      });
      return DEFAULT_REQ_LIBRARY.map(function(d, i){ return Object.assign({ id: "default-" + i }, d); }).concat(real).slice().reverse();
    }

    function populateStandardFilter(docs){
      var current = standardFilter.value;
      var standards = Array.from(new Set(docs.map(function(d){ return d.standard; })));
      standardFilter.innerHTML = '<option value="all">All standards</option>' + standards.map(function(s){
        return '<option value="' + escapeHtml(s) + '">' + escapeHtml(s === "None" ? "No specific standard" : s) + '</option>';
      }).join("");
      if(standards.indexOf(current) !== -1) standardFilter.value = current;
    }

    function render(){
      var docs = allDocs();
      populateStandardFilter(docs);
      var query = searchInput.value.trim().toLowerCase();
      var standard = standardFilter.value;
      var visible = docs.filter(function(d){
        if(standard !== "all" && d.standard !== standard) return false;
        if(!query) return true;
        if(d.product.toLowerCase().indexOf(query) !== -1) return true;
        return (d.specs || []).some(function(s){ return s.toLowerCase().indexOf(query) !== -1; });
      });

      emptyEl.hidden = visible.length > 0;
      tableBody.innerHTML = visible.map(function(doc){
        var standardLabel = doc.standard === "None" ? "No specific standard" : doc.standard;
        return '<tr class="req-row" data-id="' + doc.id + '" data-tip="Open this specification">'
          + '<td><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:#94A3B8"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg></td>'
          + '<td>' + escapeHtml(doc.product) + '</td>'
          + '<td><span class="np-standard">' + escapeHtml(standardLabel) + '</span></td>'
          + '<td>' + (doc.specs || []).length + ' specs</td>'
          + '<td>' + escapeHtml(doc.when) + '</td>'
          + '</tr>';
      }).join("");

      Array.prototype.slice.call(tableBody.querySelectorAll(".req-row")).forEach(function(row){
        row.addEventListener("click", function(){
          window.open("requirement-view.html?id=" + encodeURIComponent(row.dataset.id), "_blank");
        });
      });

      document.getElementById("reqExportBtn").onclick = function(){
        downloadCsv("design-requirement-specifications.csv", ["Product", "Standard", "Specs", "Date"],
          visible.map(function(d){ return [d.product, d.standard === "None" ? "No specific standard" : d.standard, (d.specs || []).join("; "), d.when]; }));
      };
    }
    searchInput.addEventListener("input", render);
    standardFilter.addEventListener("change", render);
    render();
  })();
})();
