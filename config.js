// Polskify - publiczne dane klienta Supabase
window.POLSKIFY_CONFIG = {
  supabaseUrl: "https://etsbemxlrjaceomamrsg.supabase.co",
  supabaseAnonKey: "sb_publishable_-VUu-V8E1-_mkSu_Wll4Jg_IGlkoW2h"
};

(function () {
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'metamorphosis-d.css?v=6';
  document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 3 && /^\s*\\n\s*$/.test(node.nodeValue || '')) node.remove();
    });

    var wrap = document.querySelector('.wrap');
    var header = document.querySelector('header');
    var head = document.querySelector('.head');
    var tabs = document.querySelector('.tabs');
    var accountBar = document.querySelector('.account-bar');
    if (!wrap || !header || !head || !tabs || !accountBar) return;

    head.innerHTML = '';
    var logo = document.createElement('img');
    logo.src = 'polskify-concept-d.svg?v=1';
    logo.alt = 'Polskify';
    logo.className = 'concept-d-logo';
    head.appendChild(logo);

    var tabNames = {
      'tab-home':'Start',
      'tab-quiz':'Quiz regionów',
      'tab-draw':'Narysuj Polskę',
      'tab-badges':'Odznaki',
      'tab-ranking':'Ranking',
      'tab-profile':'Profil',
      'tab-learn':'Nauka',
      'tab-challenges':'Quizy+'
    };
    var tabIcons = {
      'tab-home':'⌂',
      'tab-quiz':'▱',
      'tab-draw':'✎',
      'tab-badges':'✦',
      'tab-ranking':'♜',
      'tab-profile':'○',
      'tab-learn':'▤',
      'tab-challenges':'◇'
    };
    Object.keys(tabNames).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = '<span class="side-icon" aria-hidden="true">'+tabIcons[id]+'</span><span class="side-label">'+tabNames[id]+'</span>';
    });

    var sidebar = document.getElementById('app-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('aside');
      sidebar.id = 'app-sidebar';
      sidebar.className = 'app-sidebar';

      var brand = document.createElement('div');
      brand.className = 'sidebar-brand';
      brand.appendChild(head);
      sidebar.appendChild(brand);

      sidebar.appendChild(tabs);

      var foot = document.createElement('div');
      foot.className = 'sidebar-foot';
      foot.innerHTML = '<span class="sidebar-poland">⌁</span><strong>WIEDZA O POLSCE</strong><small>w jednym miejscu</small>';
      sidebar.appendChild(foot);

      wrap.insertBefore(sidebar, header);
    }

    header.classList.add('topbar-only');
    var flag = document.querySelector('.flag');
    if (flag) flag.setAttribute('aria-hidden', 'true');
  });
})();
