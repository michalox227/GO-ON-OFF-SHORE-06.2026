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

/* Prezentacja — uzupełnienie slajdu 07: Strategia wejścia na rynek. */
(function () {
  function patchMarketEntrySlide() {
    const slide7 = document.querySelector('.deck-slide[data-slide="7"]');
    if (!slide7 || slide7.dataset.marketEntryPatched === '1') return;

    slide7.innerHTML = `
      <div class="slide-content market-entry-slide-content">
        <p class="slide-thesis">Startujemy wąsko: 8 zawodów, Pomorze i Zachodniopomorskie, ambasadorzy zawodów, ankiety, wywiady i pierwsze firmy. Skalujemy dopiero po walidacji danych, potrzeb i płatności.</p>

        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:14px;">
          <div class="slide-card accent-teal">
            <h4>Beachhead: 8 zawodów</h4>
            <p>Wind Turbine Technician, Rope Access / IRATA, Offshore Electrician, Welder Offshore/Stoczniowy, Rigger/Slinger, NDT Inspector, Marine Engineer, HSE Officer.</p>
            <p style="margin-top:8px; color:#fff; font-weight:800;">3 ambasadorów na zawód = 24 ambasadorów startowych.</p>
          </div>
          <div class="slide-card accent-amber">
            <h4>Proces wejścia</h4>
            <p><strong>Q2 2027:</strong> ankiety, wywiady, ambasadorzy, pierwsze firmy, test profilu i certyfikatów.</p>
            <p><strong>Q3 2027:</strong> oficjalny start, pakiety firmowe, partnerzy, treści zawodowe, kampanie LinkedIn.</p>
            <p><strong>Q4 2027+:</strong> skalowanie zawodów, partnerów, marketplace, webinarów i społeczności.</p>
          </div>
          <div class="slide-card accent-green">
            <h4>Mini-ekosystem per zawód</h4>
            <p>Firmy, projekty, certyfikaty, centra szkoleniowe, produkty, źródła branżowe, ścieżka kariery, doradcy, materiały marketingowe i wywiady z rynkiem.</p>
          </div>
        </div>

        <div class="slide-tablewrap" style="margin-bottom:12px;">
          <table class="slide-table" style="min-width:0; font-size:11.2px;">
            <thead><tr><th>Zawód startowy</th><th>Dlaczego startowy</th><th>Zawód startowy</th><th>Dlaczego startowy</th></tr></thead>
            <tbody>
              <tr><td style="font-weight:800; color:#fff;">Wind Turbine Technician</td><td>rdzeń offshore wind</td><td style="font-weight:800; color:#fff;">Rope Access / IRATA</td><td>wysokość i trudno dostępne miejsca</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Offshore Electrician</td><td>kluczowy profil techniczny</td><td style="font-weight:800; color:#fff;">Welder Offshore / Stoczniowy</td><td>offshore, stocznie, konstrukcje</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Rigger / Slinger Signaller</td><td>lifting i heavy operations</td><td style="font-weight:800; color:#fff;">NDT Inspector</td><td>kontrola jakości i certyfikacja</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Marine Engineer</td><td>maritime, CTV/SOV, serwis</td><td style="font-weight:800; color:#fff;">HSE Officer</td><td>compliance, safety, audyty, BHP</td></tr>
            </tbody>
          </table>
        </div>

        <div class="responsive-grid-3b" style="margin-bottom:12px;">
          <div style="background:rgba(45,212,191,.06); border:1px solid rgba(45,212,191,.28); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#2DD4BF; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Pierwsze firmy — Polska</strong>
            <p style="margin:0; font-size:11.6px; line-height:1.5; color:#dfe6ee;">ORLEN/Baltic Power, PGE Baltica/Baltica 2, Ørsted Polska, Polenergia/Equinor Bałtyk 2 i 3, RWE Offshore Wind Poland, Vestas Poland, Siemens Gamesa/Siemens Energy, CRIST, Remontowa, Port Gdańsk/Port Gdynia.</p>
          </div>
          <div style="background:rgba(251,191,36,.07); border:1px solid rgba(251,191,36,.32); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#FBBF24; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Pierwsze firmy — Europa</strong>
            <p style="margin:0; font-size:11.6px; line-height:1.5; color:#dfe6ee;">Ørsted, Equinor, RWE Offshore Wind, Vestas, Siemens Gamesa, Van Oord, DEME Offshore, Boskalis, Jan De Nul, Seaway7 / Saipem / Heerema.</p>
          </div>
          <div style="background:rgba(52,211,153,.06); border:1px solid rgba(52,211,153,.28); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#34D399; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Partnerzy startowi</strong>
            <p style="margin:0; font-size:11.6px; line-height:1.5; color:#dfe6ee;">10 produktowych, 10 usługowych, 10 doradców/ekspertów i 10 placówek szkoleniowych: PPE, IRATA, GWO, BOSIET, OPITO, STCW, NDT, SEP, UDT, ISO 9606, HSE, offshore medical.</p>
          </div>
        </div>

        <div class="slide-tablewrap" style="margin-bottom:12px;">
          <table class="slide-table" style="min-width:0; font-size:11.2px;">
            <thead><tr><th>Obszar</th><th>Działanie</th><th>KPI Q2–Q3 2027</th></tr></thead>
            <tbody>
              <tr><td style="font-weight:800; color:#fff;">Marketing</td><td>LinkedIn founder-led, ambasadorzy, webinary, newsletter, podcast/video, SEO content hub, case study „od 0 do pierwszego kontraktu offshore”.</td><td>24 ambasadorów, 400–800 ankiet, 40–80 wywiadów, 80–120 publikacji, 8–16 webinarów, 1 500–3 000 kontaktów, 300–800 użytkowników testowych.</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Sprzedaż</td><td>Spotkania z firmami offshore/onshore, agencjami, centrami szkoleń, partnerami produktowymi, doradcami i firmami usługowymi.</td><td>60–100 firm w rozmowach, min. 20 testujących, 10 partnerów produktowych, 10 usługowych, 10 ekspertów, 10 placówek, 10–30 płatnych pakietów.</td></tr>
              <tr><td style="font-weight:800; color:#fff;">Operacje / Product / Community</td><td>Checklisty zawodowe, mapa certyfikatów, test profilu, test centrum certyfikatów, test panelu firmy, Q&A ambasadorów i grupy zawodowe.</td><td>Pełna walidacja profilu, certyfikatów, ofert, statusów aplikacji, partnerów i feedbacku od ambasadorów.</td></tr>
            </tbody>
          </table>
        </div>

        <div style="background:rgba(110,139,168,.08); border-left:3px solid #2DD4BF; border-radius:8px; padding:12px 16px; margin-bottom:12px;">
          <p style="margin:0; font-size:12.5px; line-height:1.55; color:#dfe6ee;">Strategia wejścia na rynek zakłada start w województwach pomorskim i zachodniopomorskim oraz koncentrację na 8 zawodach wysokiego ryzyka. Dla każdego zawodu budujemy mini-ekosystem: ambasadorzy, ankiety, wywiady, mapa firm, mapa projektów, certyfikaty, centra szkoleniowe, produkty, usługi, doradcy i treści edukacyjne. Q2 2027 to faza testów z pierwszymi klientami i partnerami, a Q3 2027 to oficjalny start platformy z pierwszą bazą użytkowników, firm i ambasadorów.</p>
        </div>

        <div class="slide-conclusion">Nie startujemy jako ogólny portal pracy. Startujemy jako wyspecjalizowany system dla 8 zawodów, budowany razem z ludźmi z rynku.</div>
      </div>`;

    slide7.dataset.marketEntryPatched = '1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchMarketEntrySlide);
  else patchMarketEntrySlide();
})();

/* Prezentacja — uzupełnienie slajdu 08: Zespół i Founder-Market Fit. */
(function () {
  function patchTeamSlide() {
    const slide8 = document.querySelector('.deck-slide[data-slide="8"]');
    if (!slide8 || slide8.dataset.teamPatched === '1') return;

    slide8.innerHTML = `
      <div class="slide-content team-slide-content">
        <p class="slide-thesis">Founder zna rynek wysokiego ryzyka od strony realnych potrzeb pracowników: ubezpieczeń, odpowiedzialności, kontraktów, ryzyk i decyzji finansowych. Zespół budowany jest etapowo: od 7 osób w MVP 1.1 do 27 osób w V2.0.</p>

        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:14px;">
          <div class="slide-card accent-teal">
            <h4>Founder-Market Fit</h4>
            <p style="font-size:18px; font-weight:900; color:#fff; margin:0 0 8px;">Michał Ćwikła</p>
            <p>Ekspert ds. ubezpieczeń sektora high-risk. 3. rok pracy w obszarze zawodów wysokiego ryzyka.</p>
            <div class="slide-chips" style="margin-top:10px;"><span class="slide-chip">220+ klientów</span><span class="slide-chip">~7 000 obserwujących</span><span class="slide-chip">kontrakty / ryzyko / odpowiedzialność</span></div>
          </div>
          <div class="slide-card accent-amber">
            <h4>Team Ramp</h4>
            <p style="font-size:26px; font-weight:900; color:#fff; margin:0 0 8px;">7 → 27 osób</p>
            <p><strong>Q3 2026:</strong> core product team.</p>
            <p><strong>Q2 2027:</strong> sprzedaż + obsługa + administracja.</p>
            <p><strong>Q3–Q4 2027:</strong> mobile + HR + AI.</p>
            <p><strong>Q1 2028:</strong> AI + SEO + automatyzacje + kadry/płace.</p>
          </div>
          <div class="slide-card accent-green">
            <h4>Koszt zespołu</h4>
            <table class="slide-table" style="min-width:0; font-size:11.5px; margin-top:4px;">
              <tbody>
                <tr><td style="font-weight:800; color:#fff;">Start MVP 1.1</td><td>65 655,81 zł / msc</td></tr>
                <tr><td style="font-weight:800; color:#fff;">Po MVP 1.4</td><td>152 268,56 zł / msc</td></tr>
                <tr><td style="font-weight:800; color:#fff;">Po V2.0</td><td>290 928,42 zł / msc</td></tr>
                <tr><td style="font-weight:800; color:#fff;">Q3 2026–Q1 2028</td><td>3 427 530,42 zł</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="slide-tablewrap" style="margin-bottom:12px;">
          <table class="slide-table" style="min-width:0; font-size:11px;">
            <thead><tr><th>Q</th><th>Wersja</th><th>Cel zespołu</th><th>Nowe osoby</th><th>Łącznie</th><th>Koszt / msc</th><th>Koszt Q</th></tr></thead>
            <tbody>
              <tr><td>Q3 2026</td><td style="font-weight:800; color:#fff;">MVP 1.1</td><td>rdzeń MVP: zarządzanie, web dev, UI/UX, research</td><td>7</td><td>7</td><td>65 655,81 zł</td><td>196 967,43 zł</td></tr>
              <tr><td>Q4 2026</td><td style="font-weight:800; color:#fff;">MVP 1.2</td><td>sprzedaż, marketing, komercjalizacja</td><td>2</td><td>9</td><td>81 645,81 zł</td><td>244 937,43 zł</td></tr>
              <tr><td>Q1 2027</td><td style="font-weight:800; color:#fff;">MVP 1.3</td><td>finanse, BOK, architektura</td><td>3</td><td>12</td><td>120 899,04 zł</td><td>362 697,12 zł</td></tr>
              <tr><td>Q2 2027</td><td style="font-weight:800; color:#fff;">MVP 1.4</td><td>sprzedaż, administracja, obsługa, księgowość</td><td>5</td><td>17</td><td>152 268,56 zł</td><td>456 805,68 zł</td></tr>
              <tr><td>Q3 2027</td><td style="font-weight:800; color:#fff;">V1.5</td><td>mobile + marketing</td><td>3</td><td>20</td><td>193 530,79 zł</td><td>580 592,37 zł</td></tr>
              <tr><td>Q4 2027</td><td style="font-weight:800; color:#fff;">V1.8</td><td>HR + AI</td><td>2</td><td>22</td><td>237 581,71 zł</td><td>712 745,13 zł</td></tr>
              <tr><td>Q1 2028</td><td style="font-weight:800; color:#fff;">V2.0</td><td>AI, content, SEO, automatyzacje, kadry/płace</td><td>5</td><td>27</td><td>290 928,42 zł</td><td>872 785,26 zł</td></tr>
            </tbody>
          </table>
        </div>

        <div class="responsive-grid-3b" style="margin-bottom:12px;">
          <div style="background:rgba(45,212,191,.06); border:1px solid rgba(45,212,191,.28); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#2DD4BF; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Start zespołu</strong>
            <p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">7 osób: CEO, senior full stack, junior front-end, junior back-end, UI/UX, researcher i obsługa biura.</p>
          </div>
          <div style="background:rgba(251,191,36,.07); border:1px solid rgba(251,191,36,.32); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#FBBF24; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Po MVP 1.4</strong>
            <p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">17 osób: dołącza sprzedaż, marketing, BOK, księgowość, architektura, przedstawiciel handlowy i administracja.</p>
          </div>
          <div style="background:rgba(52,211,153,.06); border:1px solid rgba(52,211,153,.28); border-radius:10px; padding:12px 14px;">
            <strong style="display:block; color:#34D399; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Po V2.0</strong>
            <p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">27 osób: mobile, HR, AI, content, SEO, automatyzacja marketingu oraz kadry, płace i rozliczenia.</p>
          </div>
        </div>

        <details style="margin-bottom:12px; background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-radius:10px; padding:10px 12px;">
          <summary style="cursor:pointer; color:#fff; font-weight:800; font-size:12px; letter-spacing:.08em; text-transform:uppercase;">Tabela szczegółowa stanowisk do rozwinięcia</summary>
          <div class="slide-tablewrap" style="margin-top:10px; max-height:210px; overflow:auto;">
            <table class="slide-table" style="font-size:10.5px; min-width:980px;">
              <thead><tr><th>Stanowisko</th><th>Forma</th><th>Netto / msc</th><th>Pełny koszt / msc</th><th>12 msc</th><th>Opis</th></tr></thead>
              <tbody>
                <tr><td>CEO</td><td>B2B VAT 23%</td><td>8 000,00 zł</td><td>9 840,00 zł</td><td>118 080,00 zł</td><td>Strategia, inwestorzy, finanse, produkt i tempo realizacji roadmapy.</td></tr>
                <tr><td>Starszy Programista Full Stack</td><td>B2B VAT 23%</td><td>19 000,00 zł</td><td>23 370,00 zł</td><td>280 440,00 zł</td><td>Rdzeń aplikacji webowej, integracje i code review.</td></tr>
                <tr><td>Junior Front-end / Junior Back-end</td><td>zlecenie student &lt;26</td><td>7 000,00 zł</td><td>7 000,00 zł</td><td>84 000,00 zł</td><td>Widoki, komponenty, API, dane i logika backendowa.</td></tr>
                <tr><td>UI/UX Designer</td><td>B2B VAT 23%</td><td>7 000,00 zł</td><td>8 610,00 zł</td><td>103 320,00 zł</td><td>Makiety, prototypy, UX, design system i przepływy użytkownika.</td></tr>
                <tr><td>Researcher</td><td>zlecenie student &lt;26</td><td>6 500,00 zł</td><td>6 500,00 zł</td><td>78 000,00 zł</td><td>Dane rynkowe, zawody, certyfikaty, konkurencja i potrzeby użytkowników.</td></tr>
                <tr><td>KAM / Marketing & Social Media</td><td>B2B VAT 23%</td><td>6 500,00 zł</td><td>7 995,00 zł</td><td>95 940,00 zł</td><td>Relacje B2B, pipeline, content, kampanie i lead generation.</td></tr>
                <tr><td>Główna Księgowa</td><td>zlecenie pełny ZUS → UoP</td><td>M1–6: 8 000 / M7–12: 10 000 zł</td><td>M1–6: 13 343,23 / M7–12: 17 090,46 zł</td><td>182 602,20 zł</td><td>Finanse, rozliczenia, budżet, podatki i raportowanie inwestorskie.</td></tr>
                <tr><td>Specjalista BOK</td><td>zlecenie student &lt;26</td><td>5 000,00 zł</td><td>5 000,00 zł</td><td>60 000,00 zł</td><td>Obsługa użytkowników, zgłoszenia, wsparcie kont i feedback.</td></tr>
                <tr><td>Software Architect</td><td>B2B VAT 23%</td><td>17 000,00 zł</td><td>20 910,00 zł</td><td>250 920,00 zł</td><td>Architektura systemu, standardy, skalowalność i bezpieczeństwo.</td></tr>
                <tr><td>Mobile / AI / SEO / Automatyzacje</td><td>B2B / zlecenia</td><td>5 000–22 500 zł</td><td>5 000–27 675 zł</td><td>60 000–332 100 zł</td><td>Mobile, AI matching, content, SEO, lejki, mailing i automatyzacje.</td></tr>
                <tr><td>HR, Administracja, Kadry i Płace</td><td>zlecenie → UoP</td><td>4 500–7 500 zł</td><td>4 500–12 672,04 zł</td><td>81 823,81–141 080,51 zł</td><td>Rekrutacja, onboarding, dokumenty, umowy, kadry, płace i rozliczenia.</td></tr>
              </tbody>
            </table>
          </div>
        </details>

        <div class="slide-conclusion">Zespół rośnie zgodnie z ryzykiem produktu: najpierw MVP, potem sprzedaż, mobile, AI, automatyzacje i zaplecze operacyjne.</div>
      </div>`;

    slide8.dataset.teamPatched = '1';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', patchTeamSlide);
  else patchTeamSlide();
})();
