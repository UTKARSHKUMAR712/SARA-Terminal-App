// telegram_theme.js
// All Telegram Web CSS overrides in one place.
// Update selectors here when Telegram Web changes its DOM.

export const TELEGRAM_CSS = `
  /* ---- AUTH / LOGIN: never hide ---- */
  #auth-pages { display: block !important; }

  /* ---- SIDEBAR: hide the entire left column ---- */
  #column-left,
  #column-right,
  .folders-sidebar,
  .sidebar-left-placeholder,
  .sidebar-left-overlay,
  #folders-sidebar {
    display: none !important;
    width: 0 !important;
    min-width: 0 !important;
    max-width: 0 !important;
    visibility: hidden !important;
    overflow: hidden !important;
  }

  /* ---- CHAT HEADER: hide back arrow only ---- */
  #column-center .chat-info-container > .btn-icon:first-child {
    display: none !important;
  }

  /* ---- MAIN COLUMNS: full width ---- */
  #main-columns {
    display: flex !important;
    flex-direction: column !important;
  }

  #column-center {
    width: 100vw !important;
    max-width: 100vw !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 1 !important;
  }

  ::-webkit-scrollbar { display: none !important; }
`;

export const INTERCEPT_SCRIPT = `
(function() {
  function isFileBrowser(url) {
    return url.indexOf('/files') !== -1 && url.indexOf('trycloudflare.com') !== -1;
  }
  function isTerminal(url) {
    return url.indexOf('/t/') !== -1;
  }
  function handleUrl(url) {
    if (isTerminal(url)) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'terminal',url:url}));
      return true;
    }
    if (isFileBrowser(url)) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'files',url:url}));
      return true;
    }
    return false;
  }
  var origOpen = window.open;
  window.open = function(url, name, specs) {
    if (url && handleUrl(url)) return null;
    return origOpen.apply(window, arguments);
  };
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[href]');
    if (link) {
      var href = link.getAttribute('href');
      if (href && handleUrl(href)) e.preventDefault();
    }
  }, true);
})();
true;
`;

export function buildInjectionScript() {
  return (
    '(function(){' +
    'function inject(){' +
    'if(document.getElementById("sara-css"))return;' +
    'var s=document.createElement("style");' +
    's.id="sara-css";' +
    's.textContent=`' + TELEGRAM_CSS + '`;' +
    'document.head.appendChild(s);' +
    '}' +
    'inject();' +
    'new MutationObserver(function(){inject();}).observe(document.body,{childList:true,subtree:true});' +
    'new MutationObserver(function(){inject();}).observe(document.head,{childList:true});' +
    '})();' +
    'true;'
  );
}
