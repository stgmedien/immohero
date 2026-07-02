/**
 * Aero One / ImmoHero Pilot-Widget Loader.
 * Einbindung:
 *   <script src="https://immohero.org/pilot-widget.js" data-persona="academy|recruiter" data-lang="de|en" defer></script>
 */
(function () {
  if (window.__ihPilotWidget) return;
  window.__ihPilotWidget = true;

  var script = document.currentScript;
  var origin;
  try {
    origin = new URL(script.src).origin;
  } catch (e) {
    origin = "https://immohero.org";
  }
  var persona = (script && script.dataset.persona) || "academy";
  var lang = (script && script.dataset.lang) || "de";

  var open = false;

  // Button
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", lang === "en" ? "Open pilot guide" : "Pilot-Guide öffnen");
  btn.style.cssText =
    "position:fixed;bottom:20px;right:20px;z-index:2147483000;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;background:#3F5A3A;color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;transition:transform .15s";
  btn.innerHTML =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5z"/></svg>';
  btn.onmouseenter = function () { btn.style.transform = "scale(1.06)"; };
  btn.onmouseleave = function () { btn.style.transform = "scale(1)"; };

  // Panel (iframe)
  var frame = document.createElement("iframe");
  frame.src = origin + "/widget/pilot?persona=" + encodeURIComponent(persona) + "&lang=" + encodeURIComponent(lang);
  frame.title = "Pilot Guide";
  frame.allow = "clipboard-write";
  frame.style.cssText =
    "position:fixed;bottom:92px;right:20px;z-index:2147483000;width:392px;height:600px;max-height:calc(100vh - 112px);border:none;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.3);background:#fff;display:none;";

  function applyMobile() {
    var mobile = window.innerWidth < 480;
    if (mobile) {
      frame.style.width = "100vw";
      frame.style.height = "100dvh";
      frame.style.maxHeight = "100dvh";
      frame.style.bottom = "0";
      frame.style.right = "0";
      frame.style.borderRadius = "0";
    } else {
      frame.style.width = "392px";
      frame.style.height = "600px";
      frame.style.maxHeight = "calc(100vh - 112px)";
      frame.style.bottom = "92px";
      frame.style.right = "20px";
      frame.style.borderRadius = "16px";
    }
  }
  window.addEventListener("resize", applyMobile);
  applyMobile();

  function toggle() {
    open = !open;
    frame.style.display = open ? "block" : "none";
    btn.innerHTML = open
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      : '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5z"/></svg>';
  }
  btn.addEventListener("click", toggle);

  window.addEventListener("message", function (ev) {
    if (ev.origin !== origin) return;
    if (ev.data === "ih-pilot-close" && open) toggle();
  });

  document.body.appendChild(btn);
  document.body.appendChild(frame);
})();
