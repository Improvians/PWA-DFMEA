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
})();
