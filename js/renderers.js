/* renderers.js — global settings + presentation slide patches. */
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
      if (settings.siteName && settings.siteName.trim()) h1.textContent = settings.siteName.trim();
      else h1.innerHTML = brandTitleOriginal;
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

(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function slide(n) {
    return document.querySelector('.deck-slide[data-slide="' + n + '"]');
  }

  function rows(items) {
    return items.map(row => '<tr>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>').join('');
  }

  function table(headers, items, style) {
    return '<div class="slide-tablewrap" style="margin-bottom:12px;"><table class="slide-table" style="min-width:0; font-size:' + (style || '11.2px') + ';"><thead><tr>' + headers.map(h => '<th>' + h + '</th>').join('') + '</tr></thead><tbody>' + rows(items) + '</tbody></table></div>';
  }

  function card(title, body, tone) {
    return '<div class="slide-card ' + (tone || '') + '"><h4>' + title + '</h4>' + body + '</div>';
  }

  function infoBox(title, body, color) {
    return '<div style="background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-left:3px solid ' + (color || '#2DD4BF') + '; border-radius:10px; padding:12px 14px;"><strong style="display:block; color:' + (color || '#2DD4BF') + '; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">' + title + '</strong><p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">' + body + '</p></div>';
  }

  function detail(title, inner, open) {
    return '<details ' + (open ? 'open ' : '') + 'style="margin-bottom:12px; background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-radius:10px; padding:10px 12px;"><summary style="cursor:pointer; color:#fff; font-weight:800; font-size:12px; letter-spacing:.08em; text-transform:uppercase;">' + title + '</summary><div style="margin-top:10px;">' + inner + '</div></details>';
  }

  function patchCompetitionSlide() {
    const s5 = slide(5);
    const s6 = slide(6);
    if (!s6 || s6.dataset.competitionPatched === '1') return;
    if (s5 && !s5.textContent.trim() && s6.textContent.includes('Platforma monetyzuje cały cykl kontraktu')) s5.innerHTML = s6.innerHTML;

    s6.innerHTML = `
      <div class="slide-content competition-slide-content">
        <p class="slide-thesis">Rynek ma wiele kanałów rekrutacji, ale nie ma jednej warstwy zaufania operacyjnego.</p>
        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:16px;">
          ${card('1. Obecne kanały','<p>LinkedIn / Indeed / Pracuj.pl / OLX / Facebook / agencje / job boardy offshore / polecenia.</p><p style="margin-top:8px; color:#fff; font-weight:700;">Problem: kandydat i firma nadal ręcznie sprawdzają dokumenty, dostępność, certyfikaty i ryzyko.</p>','accent-amber')}
          ${card('2. Luka rynkowa','<p>Brakuje jednego miejsca do potwierdzenia: kim jest specjalista, jakie ma certyfikaty, czy jest dostępny i czy spełnia wymagania projektu.</p><p style="margin-top:8px; color:#fff; font-weight:700;">Rynek nie ma statusu: „ten człowiek jest gotowy do wyjazdu na ten projekt”.</p>','accent-teal')}
          ${card('3. Przewaga GO ON [OFF] SHORE','<p>Nie sam AI matching, tylko infrastruktura zaufania operacyjnego.</p><p style="margin-top:8px; color:#fff; font-weight:700;">Professional Identity + Certificate Vault + Compliance Layer + Availability Status + Marketplace + Trust Score + Digital Offshore ID.</p>','accent-green')}
        </div>
        ${table(['Kryterium','LinkedIn / Indeed / OLX / Pracuj','Agencje','Job boardy offshore','GO ON [OFF] SHORE'], [
          ['<strong>Oferty pracy</strong>','✅','✅','✅','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Profil zawodowy high-risk</strong>','◐','◐','◐','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Certyfikaty i daty ważności</strong>','❌','◐','◐','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Alerty wygasania</strong>','❌','◐','❌','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Gotowość mobilizacyjna</strong>','❌','◐','❌','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Compliance per projekt</strong>','❌','◐','◐','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Marketplace szkoleń/usług/produktów</strong>','❌','❌','❌','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Trust Score / Digital Offshore ID</strong>','◐ / ❌','◐ / ❌','❌ / ❌','<strong style="color:#34D399">✅ / ✅</strong>']
        ], '11.4px')}
        <div class="responsive-grid-3b" style="margin-bottom:14px;">${infoBox('UE — substytuty','Energy Jobline, Rigzone, Atlas Professionals, Brunel/Taylor Hopkinson, NES Fircroft, Airswift, Orion Group, Sea Career, Maritime Connector, LinkedIn/Indeed.','#2DD4BF')}${infoBox('Polska — kanały','Pracuj.pl, OLX Praca, LinkedIn Polska, grupy Facebook, agencje, centra GWO/OPITO/STCW, sklepy BHP i brokerzy/ubezpieczyciele.','#FBBF24')}${infoBox('Luka produktów i kompetencji','Sklepy, szkolenia i doradcy istnieją osobno, ale nie są dopasowane do zawodu, kraju, projektu, certyfikatów i ścieżki wyższej stawki.','#34D399')}</div>
        <div class="slide-conclusion">Konkurenci pomagają znaleźć ofertę albo kandydata. GO ON [OFF] SHORE ma potwierdzić, kto realnie jest gotowy do projektu.</div>
      </div>`;
    s6.dataset.competitionPatched = '1';
  }

  function patchMarketEntrySlide() {
    const s7 = slide(7);
    if (!s7 || s7.dataset.marketEntryPatched === '1') return;
    s7.innerHTML = `
      <div class="slide-content market-entry-slide-content">
        <p class="slide-thesis">Startujemy wąsko: 8 zawodów, Pomorze i Zachodniopomorskie, ambasadorzy zawodów, ankiety, wywiady i pierwsze firmy. Skalujemy dopiero po walidacji danych, potrzeb i płatności.</p>
        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:14px;">
          ${card('Beachhead: 8 zawodów','<p>Wind Turbine Technician, Rope Access / IRATA, Offshore Electrician, Welder Offshore/Stoczniowy, Rigger/Slinger, NDT Inspector, Marine Engineer, HSE Officer.</p><p style="margin-top:8px; color:#fff; font-weight:800;">3 ambasadorów na zawód = 24 ambasadorów startowych.</p>','accent-teal')}
          ${card('Proces wejścia','<p><strong>Q2 2027:</strong> ankiety, wywiady, ambasadorzy, pierwsze firmy, test profilu i certyfikatów.</p><p><strong>Q3 2027:</strong> oficjalny start, pakiety firmowe, partnerzy, treści zawodowe, kampanie LinkedIn.</p><p><strong>Q4 2027+:</strong> skalowanie zawodów, partnerów, marketplace, webinarów i społeczności.</p>','accent-amber')}
          ${card('Mini-ekosystem per zawód','<p>Firmy, projekty, certyfikaty, centra szkoleniowe, produkty, źródła branżowe, ścieżka kariery, doradcy, materiały marketingowe i wywiady z rynkiem.</p>','accent-green')}
        </div>
        ${table(['Zawód startowy','Dlaczego startowy','Zawód startowy','Dlaczego startowy'], [
          ['<strong>Wind Turbine Technician</strong>','rdzeń offshore wind','<strong>Rope Access / IRATA</strong>','wysokość i trudno dostępne miejsca'],
          ['<strong>Offshore Electrician</strong>','kluczowy profil techniczny','<strong>Welder Offshore / Stoczniowy</strong>','offshore, stocznie, konstrukcje'],
          ['<strong>Rigger / Slinger Signaller</strong>','lifting i heavy operations','<strong>NDT Inspector</strong>','kontrola jakości i certyfikacja'],
          ['<strong>Marine Engineer</strong>','maritime, CTV/SOV, serwis','<strong>HSE Officer</strong>','compliance, safety, audyty, BHP']
        ])}
        <div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('Pierwsze firmy — Polska','ORLEN/Baltic Power, PGE Baltica/Baltica 2, Ørsted Polska, Polenergia/Equinor Bałtyk 2 i 3, RWE Offshore Wind Poland, Vestas Poland, Siemens Gamesa/Siemens Energy, CRIST, Remontowa, Port Gdańsk/Port Gdynia.','#2DD4BF')}${infoBox('Pierwsze firmy — Europa','Ørsted, Equinor, RWE Offshore Wind, Vestas, Siemens Gamesa, Van Oord, DEME Offshore, Boskalis, Jan De Nul, Seaway7 / Saipem / Heerema.','#FBBF24')}${infoBox('Partnerzy startowi','10 produktowych, 10 usługowych, 10 doradców/ekspertów i 10 placówek szkoleniowych: PPE, IRATA, GWO, BOSIET, OPITO, STCW, NDT, SEP, UDT, ISO 9606, HSE, offshore medical.','#34D399')}</div>
        ${table(['Obszar','Działanie','KPI Q2–Q3 2027'], [
          ['<strong>Marketing</strong>','LinkedIn founder-led, ambasadorzy, webinary, newsletter, podcast/video, SEO content hub, case study „od 0 do pierwszego kontraktu offshore”.','24 ambasadorów, 400–800 ankiet, 40–80 wywiadów, 80–120 publikacji, 8–16 webinarów, 1 500–3 000 kontaktów, 300–800 użytkowników testowych.'],
          ['<strong>Sprzedaż</strong>','Spotkania z firmami offshore/onshore, agencjami, centrami szkoleń, partnerami produktowymi, doradcami i firmami usługowymi.','60–100 firm w rozmowach, min. 20 testujących, 10 partnerów produktowych, 10 usługowych, 10 ekspertów, 10 placówek, 10–30 płatnych pakietów.'],
          ['<strong>Operacje / Product / Community</strong>','Checklisty zawodowe, mapa certyfikatów, test profilu, test centrum certyfikatów, test panelu firmy, Q&A ambasadorów i grupy zawodowe.','Pełna walidacja profilu, certyfikatów, ofert, statusów aplikacji, partnerów i feedbacku od ambasadorów.']
        ])}
        <div style="background:rgba(110,139,168,.08); border-left:3px solid #2DD4BF; border-radius:8px; padding:12px 16px; margin-bottom:12px;"><p style="margin:0; font-size:12.5px; line-height:1.55; color:#dfe6ee;">Strategia wejścia na rynek zakłada start w województwach pomorskim i zachodniopomorskim oraz koncentrację na 8 zawodach wysokiego ryzyka. Dla każdego zawodu budujemy mini-ekosystem: ambasadorzy, ankiety, wywiady, mapa firm, mapa projektów, certyfikaty, centra szkoleniowe, produkty, usługi, doradcy i treści edukacyjne.</p></div>
        <div class="slide-conclusion">Nie startujemy jako ogólny portal pracy. Startujemy jako wyspecjalizowany system dla 8 zawodów, budowany razem z ludźmi z rynku.</div>
      </div>`;
    s7.dataset.marketEntryPatched = '1';
  }

  function patchTeamSlide() {
    const s8 = slide(8);
    if (!s8 || s8.dataset.teamPatched === '1') return;
    s8.innerHTML = `
      <div class="slide-content team-slide-content">
        <p class="slide-thesis">Founder zna rynek wysokiego ryzyka od strony realnych potrzeb pracowników: ubezpieczeń, odpowiedzialności, kontraktów, ryzyk i decyzji finansowych. Zespół budowany jest etapowo: od 7 osób w MVP 1.1 do 27 osób w V2.0.</p>
        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:14px;">
          ${card('Founder-Market Fit','<p style="font-size:18px; font-weight:900; color:#fff; margin:0 0 8px;">Michał Ćwikła</p><p>Ekspert ds. ubezpieczeń sektora high-risk. 3. rok pracy w obszarze zawodów wysokiego ryzyka.</p><div class="slide-chips" style="margin-top:10px;"><span class="slide-chip">220+ klientów</span><span class="slide-chip">~7 000 obserwujących</span><span class="slide-chip">kontrakty / ryzyko / odpowiedzialność</span></div>','accent-teal')}
          ${card('Team Ramp','<p style="font-size:26px; font-weight:900; color:#fff; margin:0 0 8px;">7 → 27 osób</p><p><strong>Q3 2026:</strong> core product team.</p><p><strong>Q2 2027:</strong> sprzedaż + obsługa + administracja.</p><p><strong>Q3–Q4 2027:</strong> mobile + HR + AI.</p><p><strong>Q1 2028:</strong> AI + SEO + automatyzacje + kadry/płace.</p>','accent-amber')}
          ${card('Koszt zespołu','<table class="slide-table" style="min-width:0; font-size:11.5px; margin-top:4px;"><tbody>' + rows([['<strong>Start MVP 1.1</strong>','65 655,81 zł / msc'],['<strong>Po MVP 1.4</strong>','152 268,56 zł / msc'],['<strong>Po V2.0</strong>','290 928,42 zł / msc'],['<strong>Q3 2026–Q1 2028</strong>','3 427 530,42 zł']]) + '</tbody></table>','accent-green')}
        </div>
        ${table(['Q','Wersja','Cel zespołu','Nowe osoby','Łącznie','Koszt / msc','Koszt Q'], [
          ['Q3 2026','<strong>MVP 1.1</strong>','rdzeń MVP: zarządzanie, web dev, UI/UX, research','7','7','65 655,81 zł','196 967,43 zł'],
          ['Q4 2026','<strong>MVP 1.2</strong>','sprzedaż, marketing, komercjalizacja','2','9','81 645,81 zł','244 937,43 zł'],
          ['Q1 2027','<strong>MVP 1.3</strong>','finanse, BOK, architektura','3','12','120 899,04 zł','362 697,12 zł'],
          ['Q2 2027','<strong>MVP 1.4</strong>','sprzedaż, administracja, obsługa, księgowość','5','17','152 268,56 zł','456 805,68 zł'],
          ['Q3 2027','<strong>V1.5</strong>','mobile + marketing','3','20','193 530,79 zł','580 592,37 zł'],
          ['Q4 2027','<strong>V1.8</strong>','HR + AI','2','22','237 581,71 zł','712 745,13 zł'],
          ['Q1 2028','<strong>V2.0</strong>','AI, content, SEO, automatyzacje, kadry/płace','5','27','290 928,42 zł','872 785,26 zł']
        ], '11px')}
        <div class="slide-conclusion">Zespół rośnie zgodnie z ryzykiem produktu: najpierw MVP, potem sprzedaż, mobile, AI, automatyzacje i zaplecze operacyjne.</div>
      </div>`;
    s8.dataset.teamPatched = '1';
  }

  function patchRoadmapSlide() {
    const s9 = slide(9);
    if (!s9 || s9.dataset.roadmapPatched === '1') return;
    const stages = [['MVP 1.3','Q1 2027','demo testowe + księgowość v0'],['MVP 1.4','Q2 2027','publikacja przygotowana'],['v1.5','Q3 2027','oficjalny start'],['v1.9','Q4 2027','ATS, komunikacja, partnerzy'],['v2.0','Q1 2028','AI Matching + SEO + Career Advisor'],['v2.9','Q2 2028','Document Vault + Compliance'],['v3.0','Q3 2028','marketplace produktów i usług'],['v3.9','Q4 2028','Project Dashboard + Payroll + Safety'],['v4.0','Q1 2029','API + Market Intelligence'],['v4.9','Q2 2029','Digital Offshore ID + Trust Score']];
    const deep = [['v1.9 — Q4 2027','ATS/CRM, komunikator, partnerzy, oceny, kalendarz, kampanie e-mail, marketplace leadowy.'],['v2.0 — Q1 2028','AI Matching, analiza braków certyfikatów, rekomendacje szkoleń, AI Career Advisor, SEO hub.'],['v2.9 — Q2 2028','Document Vault, OCR, alerty 90/60/30/14/7 dni, checklisty i raport zgodności.'],['v3.0 — Q3 2028','Marketplace produktów, usług, doradców, płatności, prowizje i oceny.'],['v3.9 — Q4 2028','Project Dashboard, rotacje, taski, payroll, logistyka, safety i ubezpieczenia.'],['v4.0 — Q1 2029','API, ATS/CRM/ERP, płace, certyfikatorzy, Market Intelligence i raporty.'],['v4.9 — Q2 2029','Digital Offshore ID, QR/NFC, Trust Score, status ubezpieczenia, reputacja 360°, offline/mobile-ready.']];
    s9.innerHTML = `<div class="slide-content roadmap-slide-content"><p class="slide-thesis">MVP 1.1–1.4 = fundament, demo testowe i publikacja. v1.5+ = oficjalny start oraz kolejne duże aktualizacje funkcji.</p>${table(['Etap','Q','Główna aktualizacja'], stages.map(r => ['<strong>' + r[0] + '</strong>', r[1], r[2]]))}<div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:12px;">${card('Fundament MVP 1.1–1.4','<p>Budujemy rdzeń: profil, demo testowe, księgowość v0, przygotowanie publikacji, podstawowe procesy i pierwszą walidację.</p>','accent-teal')}${card('Oficjalny start v1.5+','<p>Po publikacji dokładamy rekrutację, komunikację, partnerów, społeczność, AI, SEO, compliance i marketplace.</p>','accent-amber')}${card('Warstwa operacyjna v3.9–v4.9','<p>Project Dashboard, payroll, safety, API, Market Intelligence, Digital Offshore ID, Trust Score i mobilna karta pracownika.</p>','accent-green')}</div>${detail('Kamienie milowe v1.9–v4.9', table(['Etap','Zakres'], deep.map(r => ['<strong>' + r[0] + '</strong>', r[1]]), '10.8px'), true)}<div class="slide-conclusion">Roadmapa nie skaluje funkcji losowo — każdy etap dodaje kolejną warstwę systemu operacyjnego dla pracy wysokiego ryzyka.</div></div>`;
    s9.dataset.roadmapPatched = '1';
  }

  function patchFinancialSlide() {
    const s10 = slide(10);
    if (!s10 || s10.dataset.financialPatched === '1') return;
    const mvpCosts = [['Zatrudnienie etapowe MVP1','—','—','<strong>1 261 407,66 zł</strong>'],['Biuro 12 mies. z rezerwą mediów','105 984,00 zł','24 376,32 zł','130 360,32 zł'],['Programy i subskrypcje etapowe','179 037,22 zł','41 178,56 zł','220 215,78 zł'],['Sprzęt / leasing / wyposażenie MVP1','134 128,34 zł','30 849,52 zł','164 977,86 zł'],['<strong>Razem MVP1</strong>','','','<strong style="color:#34D399">1 776 961,62 zł</strong>']];
    const startCash = [['Zespół — 1 miesiąc','65 655,81 zł'],['Biuro — 1 miesiąc','10 863,36 zł'],['Subskrypcje — 1 miesiąc','13 947,65 zł'],['Sprzęt — opłaty startowe Q3','40 542,55 zł'],['Sprzęt — raty 1 miesiąc','4 862,56 zł'],['Kaucja biura','6 457,50 zł'],['<strong>Razem start + 1 miesiąc</strong>','<strong style="color:#34D399">142 329,43 zł</strong>']];
    s10.innerHTML = `<div class="slide-content finance-slide-content"><p class="slide-thesis">MVP1 kosztuje ok. 1,78 mln zł brutto/cashflow w wariancie zoptymalizowanym i etapowym. Budżet obejmuje aplikację, zespół, biuro, sprzęt, leasing urządzeń, subskrypcje AI/SaaS oraz podstawową infrastrukturę pracy.</p><div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:14px;">${card('Razem MVP1','<p style="font-size:28px; font-weight:950; color:#34D399; margin:0 0 6px;">1 776 961,62 zł</p><p>12 miesięcy brutto / cashflow.</p>','accent-green')}${card('Start + 1 miesiąc','<p style="font-size:28px; font-weight:950; color:#FBBF24; margin:0 0 6px;">142 329,43 zł</p><p>Minimalny cash potrzebny na uruchomienie MVP 1.1.</p>','accent-amber')}${card('Pełna baza 24 osób','<p style="font-size:26px; font-weight:950; color:#2DD4BF; margin:0 0 6px;">260 218,74 zł / msc</p><p>3 msc: 780 656,23 zł · 12 msc: 3 209 694,20 zł.</p>','accent-teal')}</div>${table(['Kategoria','Netto / cashflow','VAT','Brutto / cashflow'], mvpCosts)}<div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('Kursy do przeliczeń','USD 3,7554 zł, EUR 4,2842 zł, GBP 4,9646 zł, VAT 23%. Źródło w notatce: NBP — Serwis Informacyjny.','#2DD4BF')}${infoBox('Biuro — Gdańsk Wrzeszcz','Al. Grunwaldzka; miesięcznie 10 863,36 zł brutto, 12 miesięcy 130 360,32 zł.','#FBBF24')}${infoBox('Działy organizacji','Zarząd, IT, R&D/Product, Sprzedaż, Marketing, BOK, HR & Administracja, Finanse.','#34D399')}</div>${table(['Start MVP 1.1 — cash potrzebny na uruchomienie','Brutto'], startCash)}<div class="slide-conclusion">MVP1 to nie tylko koszt aplikacji — to budżet pierwszej operacyjnej wersji spółki: zespół, narzędzia, biuro, sprzęt, AI/SaaS i infrastruktura pracy.</div></div>`;
    s10.dataset.financialPatched = '1';
  }

  function patchFundingSlide() {
    const s11 = slide(11);
    if (!s11 || s11.dataset.fundingPatched === '1') return;
    const structure = [['Q3 2026–Q2 2027','pożyczka inwestorska / konwertowalna','pokrycie 12 mies. kosztów MVP1'],['Start operacyjny','PUP / Pomorze / szkolenia','doposażenie stanowisk, miejsca pracy, kompetencje'],['Q2 2027+','granty PL i UE','AI, deeptech, cyfryzacja, B+R, internacjonalizacja'],['Q4 2027–Q1 2028','obligacje korporacyjne','skalowanie sprzedaży, marketingu, produktu i ekspansji'],['Q1–Q4 2029','przygotowanie do giełdy','audyt, raportowanie, corporate governance, rynek kapitałowy']];
    const loan = [['Forma','pożyczka inwestorska / pożyczka konwertowalna'],['Cel','12 miesięcy kosztów MVP1'],['Kwota bazowa','ok. 1,8 mln zł brutto/cashflow'],['Alternatywa','SAFE-like / pożyczka z opcją konwersji'],['Parametry robocze','cap 8 mln zł, discount 20%'],['Zastosowanie','zespół, biuro, sprzęt, SaaS, MVP, walidacja rynku']];
    const publicAid = [['PUP — doposażenie stanowiska','sprzęt / wyposażenie nowego miejsca pracy','do 6-krotności przeciętnego wynagrodzenia; wymaga zatrudnienia skierowanej osoby bezrobotnej i utrzymania stanowiska'],['Programy regionalne Pomorze','innowacje, cyfryzacja, rynek pracy, szkolenia','monitorować harmonogram Funduszy Europejskich dla Pomorza 2021–2027'],['Dofinansowania szkoleniowe','certyfikaty, kompetencje cyfrowe, zawodowe','do wykorzystania dla zespołu i partnerów szkoleniowych']];
    const grantsPL = [['FENG — Ścieżka SMART','projekty wielomilionowe','B+R, AI matching, compliance, document vault','monitorować harmonogram PARP/NCBR'],['FENG — STEP Technologie cyfrowe / DeepTech','wysokie budżety konkursowe','AI, cyfrowa infrastruktura rynku pracy, dane, automatyzacje','monitorować kolejne edycje'],['FENG — Granty na Eurogranty','budżet naboru 20 mln zł','przygotowanie dużego wniosku UE','12.08.2025–03.09.2026'],['BGK — Kredyt technologiczny','do 50 mln zł kosztów projektu','wdrożenie innowacyjnej technologii/usługi','instrument FENG dla MŚP'],['Regionalne FEP Pomorze / Zachodniopomorskie','zależnie od naboru','regionalny rozwój, innowacje, cyfryzacja, miejsca pracy','harmonogramy aktualizowane okresowo']];
    const grantsEU = [['EIC Accelerator','grant do 2,5 mln EUR + inwestycja 1–10 mln EUR','skalowalny startup technologiczny, AI, deeptech, market disruption'],['EIC Transition','do 2,5 mln EUR','walidacja technologii po kwalifikowanym projekcie badawczym'],['Digital Europe Programme','projekty konsorcjalne 1 mln EUR+','AI, dane, cyfryzacja, kompetencje, wdrożenia technologii'],['Horizon Europe Cluster 4','kilka mln EUR / projekt','AI, data, industry, digital, compliance/data platforms'],['Horizon Europe Cluster 5','projekty konsorcjalne 1 mln EUR+','energy, offshore wind, mobility, safety, workforce transformation']];
    const bonds = [['7 500 000 zł','1 500 obligacji'],['10 000 000 zł','2 000 obligacji'],['15 000 000 zł','3 000 obligacji'],['25 000 000 zł','5 000 obligacji']];
    const bondRate = [['7,5 mln zł','10,0%','10,75%','11,50%','12,25%'],['10 mln zł','10,5%','11,25%','12,00%','12,75%'],['15 mln zł','11,25%','12,00%','12,75%','13,50%'],['25 mln zł','12,00%','12,75%','13,50%','14,25%']];
    const sales = [['1 przedstawiciel od Q3/Q4 2027','sprzedaż obligacji'],['Cel kwartalny / osoba','350 000 zł'],['Prowizja handlowca','6% od pozyskanego kapitału'],['Prowizja przy 350 000 zł','21 000 zł / kwartał'],['Drugi przedstawiciel','po 1 kwartale'],['Docelowo 2 osoby','700 000 zł / kwartał przy realizacji minimum']];
    const ipo = [['Finanse','audyt, raportowanie, kontroling, historia przychodów'],['Prawo','ład korporacyjny, uchwały, dokumentacja inwestorska'],['Rynek kapitałowy','wybór doradców, dom maklerski, strategia debiutu'],['Compliance','RODO, cyberbezpieczeństwo, procedury, polityki'],['Produkt','stabilizacja platformy, dane, KPI, retencja'],['Investor Relations','deck, raporty kwartalne, data room, komunikacja']];

    s11.innerHTML = `
      <div class="slide-content funding-slide-content">
        <p class="slide-thesis">Finansowanie projektu opiera się na 4 warstwach: pożyczka inwestorska na 12 miesięcy, lokalne wsparcie na miejsca pracy i szkolenia, granty PL/UE od Q2 2027 oraz emisja obligacji korporacyjnych od Q4 2027/Q1 2028.</p>
        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:14px;">
          ${card('1. Kapitał prywatny','<p style="font-size:24px; font-weight:950; color:#FBBF24; margin:0 0 6px;">~1,8 mln zł</p><p>Pożyczka inwestorska / konwertowalna na 12 miesięcy kosztów MVP1.</p>','accent-amber')}
          ${card('2. Granty PL/UE','<p style="font-size:24px; font-weight:950; color:#2DD4BF; margin:0 0 6px;">Q2 2027+</p><p>AI, deeptech, cyfryzacja, B+R, compliance, document vault i internacjonalizacja.</p>','accent-teal')}
          ${card('3. Obligacje + giełda','<p style="font-size:24px; font-weight:950; color:#34D399; margin:0 0 6px;">7,5–25 mln zł</p><p>Emisja obligacji Q4 2027/Q1 2028 i przygotowanie do rynku kapitałowego w 2029.</p>','accent-green')}
        </div>
        ${table(['Etap','Źródło','Cel'], structure)}
        <div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('Pożyczka inwestorska','Bazowo ok. 1,8 mln zł brutto/cashflow; alternatywnie SAFE-like albo pożyczka z opcją konwersji. Parametry robocze: cap 8 mln zł, discount 20%.','#FBBF24')}${infoBox('Wsparcie lokalne','PUP, programy regionalne Pomorze oraz dofinansowania szkoleniowe: stanowiska, sprzęt, miejsca pracy i kompetencje.','#2DD4BF')}${infoBox('Rynek kapitałowy','Q1–Q4 2029: audyt, raportowanie, corporate governance, compliance, investor relations i przygotowanie do giełdy.','#34D399')}</div>
        ${detail('Pożyczka inwestorska na MVP1', table(['Parametr','Propozycja'], loan), false)}
        ${detail('Dofinansowania startowe', table(['Źródło','Zakres','Uwagi'], publicAid, '10.8px'), false)}
        ${detail('Granty PL od 1 mln zł — od Q2 2027', table(['Program','Potencjał','Dla GO ON [OFF] SHORE','Termin / status'], grantsPL, '10.5px'), false)}
        ${detail('Programy UE od 1 mln EUR', table(['Program UE','Kwota','Dla projektu'], grantsEU, '10.7px'), false)}
        <div class="responsive-grid-3b" style="margin-bottom:12px;">
          <div>${table(['Kwota emisji','Liczba obligacji'], bonds, '11px')}</div>
          <div style="grid-column:span 2;">${table(['Kwota emisji','24 mies.','36 mies.','48 mies.','60 mies.'], bondRate, '10.8px')}</div>
        </div>
        <div style="background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.32); border-left:3px solid #F87171; border-radius:10px; padding:12px 14px; margin-bottom:12px;"><strong style="display:block; color:#F87171; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">Uwaga prawna</strong><p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">Emisja obligacji nie może być komunikowana jako gotowa oferta inwestycyjna bez dokumentacji, analizy ryzyk i obsługi prawnej. Wymagana jest weryfikacja zasad KNF, prospektu/memorandum oraz materiałów GPW Catalyst.</p></div>
        <div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('Sprzedaż obligacji','1 przedstawiciel: cel kwartalny 350 000 zł, prowizja 6%, czyli 21 000 zł / kwartał. Docelowo 2 osoby: 700 000 zł / kwartał przy realizacji minimum.','#FBBF24')}${infoBox('Przygotowanie do giełdy','Finanse, prawo, rynek kapitałowy, compliance, produkt i investor relations przygotowywane przez cały 2029 rok.','#2DD4BF')}${infoBox('NBP / koszt długu','Robocza siatka oprocentowania bazuje na założeniu istotnej premii za ryzyko względem stopy referencyjnej 3,75%.','#34D399')}</div>
        ${detail('Sprzedaż obligacji i przygotowanie do giełdy', table(['Parametr','Wartość'], sales) + table(['Obszar','Zakres prac'], ipo), false)}
        <div style="background:rgba(110,139,168,.08); border-left:3px solid #2DD4BF; border-radius:8px; padding:12px 16px; margin-bottom:12px;"><p style="margin:0; font-size:12.5px; line-height:1.55; color:#dfe6ee;">Finansowanie GO ON [OFF] SHORE zakłada etapowe łączenie kapitału prywatnego, środków publicznych, grantów UE i długu korporacyjnego. Pierwsze 12 miesięcy finansuje pożyczka inwestorska / konwertowalna, której celem jest walidacja MVP1 i uruchomienie spółki operacyjnej. Od Q2 2027 rozpoczynamy przygotowanie do programów PL i UE, a od Q4 2027/Q1 2028 planowana jest emisja obligacji korporacyjnych o wartości 7,5–25 mln zł. W 2029 roku spółka przygotowuje się do wejścia na rynek kapitałowy.</p></div>
      </div>`;
    s11.dataset.fundingPatched = '1';
  }

  ready(() => {
    patchCompetitionSlide();
    patchMarketEntrySlide();
    patchTeamSlide();
    patchRoadmapSlide();
    patchFinancialSlide();
    patchFundingSlide();
  });
})();
