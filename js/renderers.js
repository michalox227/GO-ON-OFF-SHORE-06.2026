/* renderers.js — stosuje GoShoreSettings (z settings-config.js) na DOM-ie strony:
   kolory/font/zaokrąglenie/cień jako CSS-variable, tryb jasny/ciemny, nazwa/slogan, widoczność zakładek.
   Wywoływane przy starcie strony oraz przy każdej zmianie w panelu ustawień (settings-panel.js). */
(function () {
  const GS = window.GoShoreSettings || {};
  let brandTitleOriginal = null;

  function applyGlobalStyles(settings) {
    const DEFAULTS = GS.DEFAULTS || {};
    const FONT_STACKS = GS.FONT_STACKS || {};
    const root = document.documentElement;

    root.style.setProperty('--teal', settings.accentColor || DEFAULTS.accentColor);
    root.style.setProperty('--gold', settings.accentColor2 || DEFAULTS.accentColor2);
    root.style.setProperty('--bg', settings.bgColor || DEFAULTS.bgColor);
    root.style.setProperty('--text', settings.textColor || DEFAULTS.textColor);
    root.style.setProperty('--panel', settings.cardColor || DEFAULTS.cardColor);

    const fonts = FONT_STACKS[settings.fontFamily] || FONT_STACKS.default;
    if (fonts) {
      root.style.setProperty('--display', fonts.display);
      root.style.setProperty('--body', fonts.body);
    }

    root.style.setProperty('--card-radius', (Number(settings.cardRadius) || 0) + 'px');
    root.style.setProperty('--shadow-strength', String((Number(settings.shadowStrength) || 0) / 100));
    root.setAttribute('data-theme', settings.darkMode ? 'light' : 'dark');

    const h1 = document.querySelector('header.cover h1');
    if (h1) {
      if (brandTitleOriginal === null) brandTitleOriginal = h1.innerHTML;
      if (settings.siteName && settings.siteName.trim()) {
        h1.textContent = settings.siteName.trim();
      } else {
        h1.innerHTML = brandTitleOriginal;
      }
    }

    let sloganEl = document.getElementById('gsSloganDisplay');
    const header = document.querySelector('header.cover');
    if (header && !sloganEl) {
      sloganEl = document.createElement('p');
      sloganEl.id = 'gsSloganDisplay';
      sloganEl.className = 'sub';
      header.appendChild(sloganEl);
    }
    if (sloganEl) sloganEl.textContent = settings.slogan || '';
    document.title = (settings.siteName && settings.siteName.trim()) ? settings.siteName.trim() : document.title.split(' · ')[0];

    applyVisibility(settings.visibility);
  }

  function applyVisibility(visibility) {
    const visMap = { businessPlan: 'business-plan', presentation: 'presentation', roadmap: 'roadmap', organization: 'organization' };
    let hiddenActiveViewId = null;
    Object.keys(visMap).forEach(key => {
      const viewId = visMap[key];
      const visible = visibility ? visibility[key] !== false : true;
      const btn = document.querySelector('.view-btn[data-view="' + viewId + '"]');
      const view = document.getElementById(viewId);
      if (btn) btn.style.display = visible ? '' : 'none';
      if (view) view.style.display = visible ? '' : 'none';
      if (!visible && view && view.classList.contains('active')) hiddenActiveViewId = viewId;
    });
    if (hiddenActiveViewId) {
      const firstVisibleKey = Object.keys(visMap).find(key => (visibility ? visibility[key] !== false : true));
      if (firstVisibleKey) {
        const targetViewId = visMap[firstVisibleKey];
        document.querySelectorAll('.page-view').forEach(v => v.classList.toggle('active', v.id === targetViewId));
        document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === targetViewId));
      }
    }
  }

  window.GoShoreSettings = window.GoShoreSettings || {};
  Object.assign(window.GoShoreSettings, { applyGlobalStyles, applyVisibility });
})();

/* Prezentacja — uzupełnienie slajdu 06: Analiza konkurencji i przewaga obronna.
   Utrzymuje zgodność numeracji: jeśli slajd 5 jest pusty, przenosi tam aktualny model biznesowy ze slajdu 6. */
(function () {
  function patchCompetitionSlide() {
    const slide5 = document.querySelector('.deck-slide[data-slide="5"]');
    const slide6 = document.querySelector('.deck-slide[data-slide="6"]');
    if (!slide6 || slide6.dataset.competitionPatched === '1') return;

    if (slide5 && !slide5.textContent.trim() && slide6.textContent.includes('Platforma monetyzuje cały cykl kontraktu')) {
      slide5.innerHTML = slide6.innerHTML;
    }

    slide6.innerHTML = `
      <div class="slide-content competition-slide-content">
        <p class="slide-thesis">Rynek ma wiele kanałów rekrutacji, ale nie ma jednej warstwy zaufania operacyjnego.</p>

        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:16px;">
          <div class="slide-card accent-amber">
            <h4>1. Obecne kanały</h4>
            <p>LinkedIn / Indeed / Pracuj.pl / OLX / Facebook / agencje / job boardy offshore / polecenia.</p>
            <p style="margin-top:8px; color:#fff; font-weight:700;">Problem: kandydat i firma nadal ręcznie sprawdzają dokumenty, dostępność, certyfikaty i ryzyko.</p>
          </div>
          <div class="slide-card accent-teal">
            <h4>2. Luka rynkowa</h4>
            <p>Brakuje jednego miejsca do potwierdzenia: kim jest specjalista, jakie ma certyfikaty, czy jest dostępny i czy spełnia wymagania projektu.</p>
            <p style="margin-top:8px; color:#fff; font-weight:700;">Rynek nie ma statusu: „ten człowiek jest gotowy do wyjazdu na ten projekt”.</p>
          </div>
          <div class="slide-card accent-green">
            <h4>3. Przewaga GO ON [OFF] SHORE</h4>
            <p>Nie sam AI matching, tylko infrastruktura zaufania operacyjnego.</p>
            <p style="margin-top:8px; color:#fff; font-weight:700;">Professional Identity + Certificate Vault + Compliance Layer + Availability Status + Marketplace + Trust Score + Digital Offshore ID.</p>
          </div>
        </div>

        <div class="slide-tablewrap" style="margin-bottom:14px;">
          <table class="slide-table" style="min-width:0; font-size:11.5px;">
            <thead>
              <tr><th>Kryterium</th><th>LinkedIn / Indeed / OLX / Pracuj</th><th>Agencje</th><th>Job boardy offshore</th><th>GO ON [OFF] SHORE</th></tr>
            </thead>
            <tbody>
              <tr><td style="font-weight:800; color:#fff;">Oferty pracy</td><td>✅</td><td>✅</td><td>✅</td><td style="color:#34D399; font-weight:800;">✅</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Profil zawodowy high-risk</td><td>◐</td><td>◐</td><td>◐</td><td style="color:#34D399; font-weight:800;">✅</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Certyfikaty i daty ważności</td><td>❌</td><td>◐</td><td>◐</td><td style="color:#34D399; font-weight:800;">✅</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Alerty wygasania</td><td>❌</td><td>◐</td><td>❌</td><td style="color:#34D399; font-weight:800;">✅</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Gotowość mobilizacyjna</td><td>❌</td><td>◐</td><td>❌</td><td style="color:#34D399; font-weight:800;">✅</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Compliance per projekt</td><td>❌</td><td>◐</td><td>◐</td><td style="color:#34D399; font-weight:800;">✅</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Marketplace szkoleń/usług/produktów</td><td>❌</td><td>❌</td><td>❌</td><td style="color:#34D399; font-weight:800;">✅</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Trust Score / Digital Offshore ID</td><td>◐ / ❌</td><td>◐ / ❌</td><td>❌ / ❌</td><td style="color:#34D399; font-weight:800;">✅ / ✅</td></tr>
            </tbody>
          </table>
        </div>

        <div class="responsive-grid-3b" style="margin-bottom:14px;">
          <div style="background:rgba(45,212,191,.06); border:1px solid rgba(45,212,191,.28); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#2DD4BF; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">UE — substytuty</strong>
            <p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">Energy Jobline, Rigzone, Atlas Professionals, Brunel/Taylor Hopkinson, NES Fircroft, Airswift, Orion Group, Sea Career, Maritime Connector, LinkedIn/Indeed.</p>
          </div>
          <div style="background:rgba(251,191,36,.07); border:1px solid rgba(251,191,36,.32); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#FBBF24; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Polska — kanały</strong>
            <p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">Pracuj.pl, OLX Praca, LinkedIn Polska, grupy Facebook, agencje, centra GWO/OPITO/STCW, sklepy BHP i brokerzy/ubezpieczyciele.</p>
          </div>
          <div style="background:rgba(52,211,153,.06); border:1px solid rgba(52,211,153,.28); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#34D399; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Luka produktów i kompetencji</strong>
            <p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">Sklepy, szkolenia i doradcy istnieją osobno, ale nie są dopasowane do zawodu, kraju, projektu, certyfikatów i ścieżki wyższej stawki.</p>
          </div>
        </div>

        <div class="slide-conclusion">Konkurenci pomagają znaleźć ofertę albo kandydata. GO ON [OFF] SHORE ma potwierdzić, kto realnie jest gotowy do projektu.</div>
      </div>`;

    slide6.dataset.competitionPatched = '1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchCompetitionSlide);
  else patchCompetitionSlide();
})();
