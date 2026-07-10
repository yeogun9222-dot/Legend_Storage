/* ============================================================================
   LONGRISE PC — skin switcher (reskin comparison control)
   Flips html[data-skin] between original / indigo / vault, persisted in
   localStorage 'lr-skin'. Pure presentation — no app structure touched.
   ============================================================================ */
(function () {
  "use strict";
  var KEY = "lr-skin";
  var SKINS = [
    { id: "",       label: "Original", sw: "#b99a6b" },
    { id: "indigo", label: "Indigo",   sw: "#5b8cff" },
    { id: "vault",  label: "Vault",    sw: "#0356f8" }
  ];

  function apply(id) {
    if (id) document.documentElement.setAttribute("data-skin", id);
    else document.documentElement.removeAttribute("data-skin");
  }
  /* apply persisted skin ASAP (also done inline in <head> to avoid flash) */
  var current = "";
  try { current = localStorage.getItem(KEY) || ""; } catch (e) {}
  apply(current);

  function build() {
    if (document.getElementById("lr-skin-switch")) return;
    var bar = document.createElement("div");
    bar.id = "lr-skin-switch";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Theme skin");
    bar.innerHTML =
      '<span class="lrs-label">SKIN</span>' +
      SKINS.map(function (s) {
        return '<button type="button" class="lrs-btn" data-skin-id="' + s.id + '">' +
                 '<span class="lrs-dot" style="background:' + s.sw + '"></span>' + s.label +
               '</button>';
      }).join("");
    document.body.appendChild(bar);

    function sync() {
      var cur = document.documentElement.getAttribute("data-skin") || "";
      Array.prototype.forEach.call(bar.querySelectorAll(".lrs-btn"), function (b) {
        b.classList.toggle("on", (b.getAttribute("data-skin-id") || "") === cur);
      });
    }
    bar.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".lrs-btn") : null;
      if (!b) return;
      var id = b.getAttribute("data-skin-id") || "";
      apply(id);
      try { localStorage.setItem(KEY, id); } catch (err) {}
      sync();
    });
    sync();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
