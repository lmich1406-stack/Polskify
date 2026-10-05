// Polskify - publiczne dane klienta Supabase
window.POLSKIFY_CONFIG = {
  supabaseUrl: "https://etsbemxlrjaceomamrsg.supabase.co",
  supabaseAnonKey: "sb_publishable_-VUu-V8E1-_mkSu_Wll4Jg_IGlkoW2h"
};

(function () {
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'metamorphosis-d.css?v=14';
  document.head.appendChild(css);

  var scrollStyle = document.createElement('style');
  scrollStyle.textContent = [
    'header.topbar-only{height:0!important;min-height:0!important;padding:0!important;margin:0!important;background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;overflow:visible!important;pointer-events:none!important;}',
    'header.topbar-only:after{display:none!important;}',
    'header.topbar-only .account-bar{position:fixed!important;top:12px!important;right:18px!important;left:auto!important;width:auto!important;margin:0!important;padding:0!important;gap:8px!important;background:transparent!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;z-index:1500!important;pointer-events:auto!important;align-items:center!important;}',
    'header.topbar-only .account-actions{display:flex!important;align-items:center!important;gap:8px!important;}',
    'header.topbar-only .xp-chip,header.topbar-only .streak-chip,header.topbar-only .account-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;line-height:1!important;min-height:38px!important;height:38px!important;padding-top:0!important;padding-bottom:0!important;white-space:nowrap!important;}',
    'body.polskify-scrolled .account-copy,',
    'body.polskify-scrolled .account-bar .xp-chip,',
    'body.polskify-scrolled #account-open,',
    'body.polskify-scrolled #account-logout{display:none!important;}',
    'body.polskify-scrolled .account-actions{display:flex!important;gap:8px!important;align-items:center!important;}',
    'body.polskify-scrolled #account-admin-open[hidden]{display:none!important;}',
    'body.polskify-scrolled #account-admin-open:not([hidden]){display:inline-flex!important;}',
    'body.polskify-scrolled .streak-chip{display:inline-flex!important;min-height:36px!important;height:36px!important;padding:0 10px!important;}',
    'body.polskify-scrolled #account-admin-open{min-height:36px!important;height:36px!important;padding:0 10px!important;}',
    '#account-panel{display:none!important;}',
    '#admin-backdrop{position:fixed!important;inset:0!important;z-index:1480!important;background:rgba(2,8,15,.24)!important;pointer-events:auto!important;}',
    '#admin-backdrop[hidden]{display:none!important;}',
    '#admin-panel{position:fixed!important;top:62px!important;right:16px!important;left:auto!important;bottom:auto!important;width:min(560px,calc(100vw - 32px))!important;max-width:560px!important;max-height:calc(100vh - 78px)!important;overflow:auto!important;margin:0!important;padding:14px!important;z-index:1490!important;border-radius:14px!important;box-shadow:0 24px 70px rgba(0,0,0,.48)!important;transform:none!important;pointer-events:auto!important;}',
    '#admin-panel *{pointer-events:auto!important;}',
    '#admin-panel[hidden]{display:none!important;}',
    '#admin-panel .admin-regions{grid-template-columns:repeat(2,minmax(0,1fr))!important;}',
    'body.admin-modal-open{overflow:hidden!important;}',
    '@media(max-width:680px){header.topbar-only .account-bar{top:8px!important;right:8px!important;}#admin-panel{top:54px!important;right:8px!important;width:calc(100vw - 16px)!important;max-width:none!important;max-height:calc(100vh - 66px)!important;}#admin-panel .admin-regions{grid-template-columns:1fr!important;}}'
  ].join('\n');
  document.head.appendChild(scrollStyle);

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
    var brandRow = document.createElement('div');
    brandRow.className = 'polskify-brand-row';
    brandRow.setAttribute('style','display:flex;align-items:center;gap:10px;width:100%;');

    var mark = document.createElement('img');
    mark.src = 'polskify-mark.png?v=2';
    mark.alt = 'Polskify';
    mark.className = 'polskify-brand-mark';
    mark.setAttribute('style','width:48px!important;height:48px!important;object-fit:contain!important;flex:0 0 48px!important;filter:none!important;');

    var brandText = document.createElement('div');
    brandText.className = 'polskify-brand-copy';
    brandText.setAttribute('style','min-width:0;line-height:1;');
    brandText.innerHTML = '<div style="font-family:Georgia,Times New Roman,serif;font-size:24px;font-weight:800;letter-spacing:.04em;color:#f4c542;white-space:nowrap;">POLSKIFY</div><div style="margin-top:5px;font-family:Arial,Helvetica,sans-serif;font-size:7px;font-weight:700;letter-spacing:.22em;color:#f8f6ef;white-space:nowrap;">POLSKA REGION PO REGIONIE</div>';
    brandRow.appendChild(mark);
    brandRow.appendChild(brandText);
    head.appendChild(brandRow);

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
      foot.innerHTML = '<strong>WIEDZA O POLSCE</strong><small>w jednym miejscu</small>';
      sidebar.appendChild(foot);
      wrap.insertBefore(sidebar, header);
    }

    header.classList.add('topbar-only');
    var flag = document.querySelector('.flag');
    if (flag) flag.setAttribute('aria-hidden', 'true');

    var accountOpen = document.getElementById('account-open');
    var accountPanel = document.getElementById('account-panel');
    if (accountPanel) accountPanel.hidden = true;
    if (accountOpen) {
      accountOpen.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.location.href = 'login.html';
      }, true);
    }

    var adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
      if (adminPanel.parentNode !== document.body) document.body.appendChild(adminPanel);
      var adminBackdrop = document.getElementById('admin-backdrop');
      if (!adminBackdrop) {
        adminBackdrop = document.createElement('div');
        adminBackdrop.id = 'admin-backdrop';
        adminBackdrop.hidden = true;
        document.body.appendChild(adminBackdrop);
      }
      function syncAdminModal() {
        var open = !adminPanel.hidden;
        adminBackdrop.hidden = !open;
        document.body.classList.toggle('admin-modal-open', open);
      }
      new MutationObserver(syncAdminModal).observe(adminPanel, { attributes: true, attributeFilter: ['hidden'] });
      adminBackdrop.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); }, true);
      adminBackdrop.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); adminPanel.hidden = true; syncAdminModal(); }, true);
      adminPanel.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      adminPanel.addEventListener('click', function (e) { e.stopPropagation(); });
      syncAdminModal();
    }

    function updateScrollState() {
      document.body.classList.toggle('polskify-scrolled', window.scrollY > 90);
    }
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
  });
})();
