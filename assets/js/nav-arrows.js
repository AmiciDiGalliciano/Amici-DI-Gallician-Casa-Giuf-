(function(){
  const pages = [
    {file:'index.html', label:'Home'},
    {file:'camere.html', label:'Camere'},
    {file:'percorsi.html', label:'Percorsi'},
    {file:'guida.html', label:'Guida'},
    {file:'storia.html', label:'Storia'},
    {file:'rallentare.html', label:'Rallentare'},
    {file:'trattoria.html', label:'Trattoria'},
    {file:'contatti.html', label:'Contatti'}
  ];
  const current = (location.pathname.split('/').pop() || 'index.html').replace(/^$/, 'index.html');
  const idx = pages.findIndex(p => p.file === current);
  if (idx === -1) return;
  const prev = pages[(idx - 1 + pages.length) % pages.length];
  const next = pages[(idx + 1) % pages.length];
  const wrap = document.createElement('nav');
  wrap.className = 'site-nav-arrows';
  wrap.setAttribute('aria-label', 'Navigazione laterale tra le pagine');
  wrap.innerHTML = `
    <a class="site-arrow site-arrow-prev" href="${prev.file}" aria-label="Pagina precedente: ${prev.label}"><span aria-hidden="true">‹</span><small>${prev.label}</small></a>
    <button class="site-arrow site-arrow-top" type="button" aria-label="Torna in alto"><span aria-hidden="true">↑</span><small>Top</small></button>
    <a class="site-arrow site-arrow-next" href="${next.file}" aria-label="Pagina successiva: ${next.label}"><span aria-hidden="true">›</span><small>${next.label}</small></a>
  `;
  document.body.appendChild(wrap);
  wrap.querySelector('.site-arrow-top').addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  const update = () => wrap.classList.toggle('is-visible', window.scrollY > 260);
  window.addEventListener('scroll', update, {passive:true});
  update();
})();
