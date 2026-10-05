// Polskify - publiczne dane klienta Supabase
window.POLSKIFY_CONFIG = {
  supabaseUrl: "https://etsbemxlrjaceomamrsg.supabase.co",
  supabaseAnonKey: "sb_publishable_-VUu-V8E1-_mkSu_Wll4Jg_IGlkoW2h"
};

(function () {
  // Dołącz nowy motyw Concept D bez ruszania starego CSS.
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'metamorphosis-d.css?v=1';
  document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded', function () {
    // Usuń przypadkowy tekst "\\n", który trafiał na samą górę strony.
    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 3 && /^\s*\\n\s*$/.test(node.nodeValue || '')) node.remove();
    });

    var header = document.querySelector('header');
    var head = document.querySelector('.head');
    var tabs = document.querySelector('.tabs');
    var accountBar = document.querySelector('.account-bar');
    if (!header || !head || !tabs || !accountBar) return;

    // Logo Concept D.
    head.innerHTML = '';
    var logo = document.createElement('img');
    logo.src = 'polskify-concept-d.svg?v=1';
    logo.alt = 'Polskify';
    logo.className = 'concept-d-logo';
    head.appendChild(logo);

    // Nawigacja ma być na górze, pomiędzy logo a profilem.
    header.insertBefore(tabs, accountBar);

    // Krótsze ikonowe etykiety tylko przez aria/tekst — logika zakładek zostaje ta sama.
    var tabIcons = {
      'tab-home':'⌂ ',
      'tab-quiz':'🏆 ',
      'tab-draw':'✎ ',
      'tab-badges':'◆ ',
      'tab-ranking':'▥ ',
      'tab-profile':'● ',
      'tab-learn':'▤ ',
      'tab-challenges':'★ '
    };
    Object.keys(tabIcons).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.dataset.conceptDIcon === '1') return;
      var text = (el.textContent || '').replace(/^🔒\s*/, '').trim();
      el.textContent = tabIcons[id] + text;
      el.dataset.conceptDIcon = '1';
    });

    // Ukryj starą dekoracyjną linię — nowy header ma własną linię premium.
    var flag = document.querySelector('.flag');
    if (flag) flag.setAttribute('aria-hidden', 'true');
  });
})();
