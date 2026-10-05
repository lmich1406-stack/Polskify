// Polskify - publiczne dane klienta Supabase
window.POLSKIFY_CONFIG = {
  supabaseUrl: "https://etsbemxlrjaceomamrsg.supabase.co",
  supabaseAnonKey: "sb_publishable_-VUu-V8E1-_mkSu_Wll4Jg_IGlkoW2h"
};

// Brand header fix: use the full horizontal logo instead of showing
// a tiny square icon next to a second, separate POLSKIFY wordmark.
document.addEventListener('DOMContentLoaded', function () {
  var head = document.querySelector('.head');
  if (!head) return;

  head.innerHTML = '';
  head.style.display = 'grid';
  head.style.gap = '4px';
  head.style.alignItems = 'start';

  var logo = document.createElement('img');
  logo.src = 'polskify-header-logo.svg';
  logo.alt = 'Polskify';
  logo.style.width = 'min(360px, 78vw)';
  logo.style.height = 'auto';
  logo.style.display = 'block';
  logo.style.objectFit = 'contain';
  logo.style.filter = 'drop-shadow(0 8px 18px rgba(0,0,0,.18))';

  var lead = document.createElement('p');
  lead.className = 'lead';
  lead.textContent = 'Polska region po regionie — quizy i ciekawostki.';
  lead.style.margin = '0 0 0 92px';

  head.appendChild(logo);
  head.appendChild(lead);

  if (window.matchMedia && window.matchMedia('(max-width: 620px)').matches) {
    lead.style.marginLeft = '0';
  }
});
