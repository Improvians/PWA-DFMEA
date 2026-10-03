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

  var newDfmeaBtn = document.getElementById("tabNewDfmea");
  if(newDfmeaBtn) newDfmeaBtn.addEventListener("click", function(){
    window.location.href = "new-dfmea.html?mode=blank";
  });
  var newDfmeaAiBtn = document.getElementById("tabNewDfmeaAi");
  if(newDfmeaAiBtn) newDfmeaAiBtn.addEventListener("click", function(){
    window.location.href = "new-dfmea.html?mode=ai";
  });

  // A DFMEA "generated" through the New DFMEA (with AI) flow doesn't get
  // its own separate dashboard -- there's only one real, fully-wired
  // worksheet/tree in this build. Instead it reuses THIS SAME page's
  // live, editable structure (it really was cloned from it) and just
  // relabels the name/function/breadcrumb, with a banner saying so
  // plainly rather than pretending it's a distinct document underneath.
  // Scoped to the dashboard page only (identified by #treeWrap, unique to
  // index.html) -- upload.html and new-dfmea.html load this same script
  // but must never have their own title/breadcrumb hijacked by a leftover
  // override from a DFMEA generated earlier.
  var override = null;
  if(document.getElementById("treeWrap")){
    try{ override = JSON.parse(localStorage.getItem("dfmeaActiveOverride") || "null"); }catch(error){ override = null; }
  }
  if(override && override.name){
    var titleEl = document.querySelector(".ttl");
    if(titleEl && titleEl.firstChild) titleEl.firstChild.textContent = override.function || override.name;
    var crumbEl = document.querySelector(".crumb");
    if(crumbEl) crumbEl.innerHTML = override.name + " &rsaquo; Crimp DFMEA &rsaquo; <b>Risk Analysis</b>";
    var wsl = document.querySelector(".wsl");
    var wsn = document.querySelector(".wsn");
    if(wsn) wsn.textContent = override.name;

    var banner = document.createElement("div");
    banner.style.cssText = "margin:0 0 14px;padding:10px 14px;border-radius:9px;background:#EEF2FF;"
      + "border:1px solid #C7D2FE;color:#3730A3;font-size:11.5px;display:flex;align-items:center;gap:10px";
    banner.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6l2.1-2.1"/></svg>'
      + '<span><b>' + override.name + '</b> was generated from the <b>Crimp Contact Resistance</b> reference DFMEA'
      + (override.generatedFrom && override.generatedFrom.length ? ' and ' + override.generatedFrom.length + ' related upload' + (override.generatedFrom.length === 1 ? "" : "s") : "")
      + '. Everything below is a real, editable starting structure, not a locked preview.</span>'
      + '<button type="button" id="dismissOverrideBtn" style="margin-left:auto;background:none;border:none;color:#4338CA;font-weight:700;font-size:11px;cursor:pointer;flex:none">Reset to original</button>';
    var content = document.querySelector(".content");
    if(content) content.insertBefore(banner, content.firstChild);
    var dismissBtn = document.getElementById("dismissOverrideBtn");
    if(dismissBtn) dismissBtn.addEventListener("click", function(){
      try{ localStorage.removeItem("dfmeaActiveOverride"); }catch(error){ /* nothing to clean up then */ }
      window.location.reload();
    });
  }
})();
