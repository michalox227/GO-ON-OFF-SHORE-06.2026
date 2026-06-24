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

  function card(title, body, tone) {
    return '<div class="slide-card ' + (tone || '') + '"><h4>' + title + '</h4>' + body + '</div>';
  }

  function infoBox(title, body, color) {
    return '<div style="background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-left:3px solid ' + (color || '#2DD4BF') + '; border-radius:10px; padding:12px 14px;"><strong style="display:block; color:' + (color || '#2DD4BF') + '; font-size:11px; letter-spacing:.08em; text-transform:uppercase; margin-bottom:6px;">' + title + '</strong><p style="margin:0; font-size:12px; line-height:1.55; color:#dfe6ee;">' + body + '</p></div>';
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
        <div class="slide-tablewrap" style="margin-bottom:14px;"><table class="slide-table" style="min-width:0; font-size:11.5px;"><thead><tr><th>Kryterium</th><th>LinkedIn / Indeed / OLX / Pracuj</th><th>Agencje</th><th>Job boardy offshore</th><th>GO ON [OFF] SHORE</th></tr></thead><tbody>${rows([
          ['<strong>Oferty pracy</strong>','✅','✅','✅','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Profil zawodowy high-risk</strong>','◐','◐','◐','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Certyfikaty i daty ważności</strong>','❌','◐','◐','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Alerty wygasania</strong>','❌','◐','❌','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Gotowość mobilizacyjna</strong>','❌','◐','❌','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Compliance per projekt</strong>','❌','◐','◐','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Marketplace szkoleń/usług/produktów</strong>','❌','❌','❌','<strong style="color:#34D399">✅</strong>'],
          ['<strong>Trust Score / Digital Offshore ID</strong>','◐ / ❌','◐ / ❌','❌ / ❌','<strong style="color:#34D399">✅ / ✅</strong>']
        ])}</tbody></table></div>
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
        <div class="slide-tablewrap" style="margin-bottom:12px;"><table class="slide-table" style="min-width:0; font-size:11.2px;"><thead><tr><th>Zawód startowy</th><th>Dlaczego startowy</th><th>Zawód startowy</th><th>Dlaczego startowy</th></tr></thead><tbody>${rows([
          ['<strong>Wind Turbine Technician</strong>','rdzeń offshore wind','<strong>Rope Access / IRATA</strong>','wysokość i trudno dostępne miejsca'],
          ['<strong>Offshore Electrician</strong>','kluczowy profil techniczny','<strong>Welder Offshore / Stoczniowy</strong>','offshore, stocznie, konstrukcje'],
          ['<strong>Rigger / Slinger Signaller</strong>','lifting i heavy operations','<strong>NDT Inspector</strong>','kontrola jakości i certyfikacja'],
          ['<strong>Marine Engineer</strong>','maritime, CTV/SOV, serwis','<strong>HSE Officer</strong>','compliance, safety, audyty, BHP']
        ])}</tbody></table></div>
        <div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('Pierwsze firmy — Polska','ORLEN/Baltic Power, PGE Baltica/Baltica 2, Ørsted Polska, Polenergia/Equinor Bałtyk 2 i 3, RWE Offshore Wind Poland, Vestas Poland, Siemens Gamesa/Siemens Energy, CRIST, Remontowa, Port Gdańsk/Port Gdynia.','#2DD4BF')}${infoBox('Pierwsze firmy — Europa','Ørsted, Equinor, RWE Offshore Wind, Vestas, Siemens Gamesa, Van Oord, DEME Offshore, Boskalis, Jan De Nul, Seaway7 / Saipem / Heerema.','#FBBF24')}${infoBox('Partnerzy startowi','10 produktowych, 10 usługowych, 10 doradców/ekspertów i 10 placówek szkoleniowych: PPE, IRATA, GWO, BOSIET, OPITO, STCW, NDT, SEP, UDT, ISO 9606, HSE, offshore medical.','#34D399')}</div>
        <div class="slide-tablewrap" style="margin-bottom:12px;"><table class="slide-table" style="min-width:0; font-size:11.2px;"><thead><tr><th>Obszar</th><th>Działanie</th><th>KPI Q2–Q3 2027</th></tr></thead><tbody>${rows([
          ['<strong>Marketing</strong>','LinkedIn founder-led, ambasadorzy, webinary, newsletter, podcast/video, SEO content hub, case study „od 0 do pierwszego kontraktu offshore”.','24 ambasadorów, 400–800 ankiet, 40–80 wywiadów, 80–120 publikacji, 8–16 webinarów, 1 500–3 000 kontaktów, 300–800 użytkowników testowych.'],
          ['<strong>Sprzedaż</strong>','Spotkania z firmami offshore/onshore, agencjami, centrami szkoleń, partnerami produktowymi, doradcami i firmami usługowymi.','60–100 firm w rozmowach, min. 20 testujących, 10 partnerów produktowych, 10 usługowych, 10 ekspertów, 10 placówek, 10–30 płatnych pakietów.'],
          ['<strong>Operacje / Product / Community</strong>','Checklisty zawodowe, mapa certyfikatów, test profilu, test centrum certyfikatów, test panelu firmy, Q&A ambasadorów i grupy zawodowe.','Pełna walidacja profilu, certyfikatów, ofert, statusów aplikacji, partnerów i feedbacku od ambasadorów.']
        ])}</tbody></table></div>
        <div style="background:rgba(110,139,168,.08); border-left:3px solid #2DD4BF; border-radius:8px; padding:12px 16px; margin-bottom:12px;"><p style="margin:0; font-size:12.5px; line-height:1.55; color:#dfe6ee;">Strategia wejścia na rynek zakłada start w województwach pomorskim i zachodniopomorskim oraz koncentrację na 8 zawodach wysokiego ryzyka. Dla każdego zawodu budujemy mini-ekosystem: ambasadorzy, ankiety, wywiady, mapa firm, mapa projektów, certyfikaty, centra szkoleniowe, produkty, usługi, doradcy i treści edukacyjne. Q2 2027 to faza testów z pierwszymi klientami i partnerami, a Q3 2027 to oficjalny start platformy z pierwszą bazą użytkowników, firm i ambasadorów.</p></div>
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
        <div class="slide-tablewrap" style="margin-bottom:12px;"><table class="slide-table" style="min-width:0; font-size:11px;"><thead><tr><th>Q</th><th>Wersja</th><th>Cel zespołu</th><th>Nowe osoby</th><th>Łącznie</th><th>Koszt / msc</th><th>Koszt Q</th></tr></thead><tbody>${rows([
          ['Q3 2026','<strong>MVP 1.1</strong>','rdzeń MVP: zarządzanie, web dev, UI/UX, research','7','7','65 655,81 zł','196 967,43 zł'],
          ['Q4 2026','<strong>MVP 1.2</strong>','sprzedaż, marketing, komercjalizacja','2','9','81 645,81 zł','244 937,43 zł'],
          ['Q1 2027','<strong>MVP 1.3</strong>','finanse, BOK, architektura','3','12','120 899,04 zł','362 697,12 zł'],
          ['Q2 2027','<strong>MVP 1.4</strong>','sprzedaż, administracja, obsługa, księgowość','5','17','152 268,56 zł','456 805,68 zł'],
          ['Q3 2027','<strong>V1.5</strong>','mobile + marketing','3','20','193 530,79 zł','580 592,37 zł'],
          ['Q4 2027','<strong>V1.8</strong>','HR + AI','2','22','237 581,71 zł','712 745,13 zł'],
          ['Q1 2028','<strong>V2.0</strong>','AI, content, SEO, automatyzacje, kadry/płace','5','27','290 928,42 zł','872 785,26 zł']
        ])}</tbody></table></div>
        <div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('Start zespołu','7 osób: CEO, senior full stack, junior front-end, junior back-end, UI/UX, researcher i obsługa biura.','#2DD4BF')}${infoBox('Po MVP 1.4','17 osób: dołącza sprzedaż, marketing, BOK, księgowość, architektura, przedstawiciel handlowy i administracja.','#FBBF24')}${infoBox('Po V2.0','27 osób: mobile, HR, AI, content, SEO, automatyzacja marketingu oraz kadry, płace i rozliczenia.','#34D399')}</div>
        <details style="margin-bottom:12px; background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-radius:10px; padding:10px 12px;"><summary style="cursor:pointer; color:#fff; font-weight:800; font-size:12px; letter-spacing:.08em; text-transform:uppercase;">Tabela szczegółowa stanowisk do rozwinięcia</summary><div class="slide-tablewrap" style="margin-top:10px; max-height:210px; overflow:auto;"><table class="slide-table" style="font-size:10.5px; min-width:980px;"><thead><tr><th>Stanowisko</th><th>Forma</th><th>Netto / msc</th><th>Pełny koszt / msc</th><th>12 msc</th><th>Opis</th></tr></thead><tbody>${rows([
          ['CEO','B2B VAT 23%','8 000,00 zł','9 840,00 zł','118 080,00 zł','Strategia, inwestorzy, finanse, produkt i tempo realizacji roadmapy.'],
          ['Starszy Programista Full Stack','B2B VAT 23%','19 000,00 zł','23 370,00 zł','280 440,00 zł','Rdzeń aplikacji webowej, integracje i code review.'],
          ['Junior Front-end / Junior Back-end','zlecenie student &lt;26','7 000,00 zł','7 000,00 zł','84 000,00 zł','Widoki, komponenty, API, dane i logika backendowa.'],
          ['UI/UX Designer','B2B VAT 23%','7 000,00 zł','8 610,00 zł','103 320,00 zł','Makiety, prototypy, UX, design system i przepływy użytkownika.'],
          ['Researcher','zlecenie student &lt;26','6 500,00 zł','6 500,00 zł','78 000,00 zł','Dane rynkowe, zawody, certyfikaty, konkurencja i potrzeby użytkowników.'],
          ['KAM / Marketing & Social Media','B2B VAT 23%','6 500,00 zł','7 995,00 zł','95 940,00 zł','Relacje B2B, pipeline, content, kampanie i lead generation.'],
          ['Software Architect','B2B VAT 23%','17 000,00 zł','20 910,00 zł','250 920,00 zł','Architektura systemu, standardy, skalowalność i bezpieczeństwo.'],
          ['Mobile / AI / SEO / Automatyzacje','B2B / zlecenia','5 000–22 500 zł','5 000–27 675 zł','60 000–332 100 zł','Mobile, AI matching, content, SEO, lejki, mailing i automatyzacje.']
        ])}</tbody></table></div></details>
        <div class="slide-conclusion">Zespół rośnie zgodnie z ryzykiem produktu: najpierw MVP, potem sprzedaż, mobile, AI, automatyzacje i zaplecze operacyjne.</div>
      </div>`;
    s8.dataset.teamPatched = '1';
  }

  function patchRoadmapSlide() {
    const s9 = slide(9);
    if (!s9 || s9.dataset.roadmapPatched === '1') return;
    const stages = [
      ['MVP 1.3','Q1 2027','demo testowe + księgowość v0'],['MVP 1.4','Q2 2027','publikacja przygotowana'],['v1.5','Q3 2027','oficjalny start'],['v1.9','Q4 2027','ATS, komunikacja, partnerzy'],['v2.0','Q1 2028','AI Matching + SEO + Career Advisor'],['v2.9','Q2 2028','Document Vault + Compliance'],['v3.0','Q3 2028','marketplace produktów i usług'],['v3.9','Q4 2028','Project Dashboard + Payroll + Safety'],['v4.0','Q1 2029','API + Market Intelligence'],['v4.9','Q2 2029','Digital Offshore ID + Trust Score']
    ];
    const deepStages = [
      ['v1.9 — Q4 2027','październik – grudzień 2027','Wzmocnienie platformy po publicznym starcie: rekrutacja, komunikacja, partnerzy, pierwsze funkcje społecznościowe.','ATS/CRM rekrutacyjny v1, komunikator basic, panel partnera v1, konto eksperta/doradcy, pierwsze oceny, kalendarz basic, kampanie e-mail, marketplace leadowy.','Firmy lepiej zarządzają kandydatami, użytkownicy mają komunikację i statusy, partnerzy generują leady, platforma buduje warstwę zaufania.'],
      ['v2.0 — Q1 2028','styczeń – marzec 2028','Uruchomienie dużej warstwy AI, treści, SEO i automatyzacji marketingu.','AI Matching v1, analiza braków certyfikatów, rekomendacje szkoleń, AI Career Advisor basic, centrum treści zawodowych, SEO hub, automatyzacje i segmentacja.','Platforma nie tylko pokazuje oferty, ale zaczyna doradzać użytkownikowi; powstają ścieżki kariery i rośnie organiczne pozyskiwanie.'],
      ['v2.9 — Q2 2028','kwiecień – czerwiec 2028','Rozwinięcie dokumentów, certyfikatów i compliance jako rdzenia przewagi obronnej.','Document Vault v1, OCR, alerty 90/60/30/14/7 dni, status certyfikatów, checklisty per projekt, centrum certyfikacji i raport zgodności.','Użytkownik wie, czego mu brakuje, firma widzi status dokumentów, platforma odpowiada: „czy ta osoba jest gotowa do projektu?”.'],
      ['v3.0 — Q3 2028','lipiec – wrzesień 2028','Przejście z platformy rekrutacyjnej w marketplace produktów, usług i ekspertów.','Sklep/marketplace v1, produkty BHP/PPE/narzędzia/szkolenia, usługi doradcze, centrum doradców, płatności, prowizje, oceny i profile partnerów.','Platforma zarabia nie tylko na rekrutacji; użytkownik dostaje produkty i usługi dobrane do zawodu, a partnerzy własny kanał sprzedaży.'],
      ['v3.9 — Q4 2028','październik – grudzień 2028','Zbudowanie warstwy operacyjnej projektu: dashboard, bezpieczeństwo, payroll i logistyka.','Project Dashboard, status projektu, rotacje, taski, payroll i faktury v1, logistyka mobilizacji, incydenty BHP, safety dashboard i ubezpieczenia.','Platforma obsługuje cały cykl projektu, firma zarządza ekipą, użytkownik ma jeden panel operacyjny kontraktu.'],
      ['v4.0 — Q1 2029','styczeń – marzec 2029','Wejście w moduły enterprise, integracje API, dane rynkowe i zaawansowane raportowanie.','API Integration Hub, integracje ATS/CRM/ERP/płace/certyfikatorzy, Market Intelligence, dashboard analityczny, benchmarki i raporty.','Platforma staje się narzędziem dla większych firm, a dane tworzą osobny produkt: raporty, API i analityka.'],
      ['v4.9 — Q2 2029','kwiecień – czerwiec 2029','Finalizacja docelowej warstwy zaufania: Digital Offshore ID, reputacja, mobilna karta pracownika i pełna gotowość projektowa.','Digital Offshore ID, mobilna karta pracownika, QR/NFC, status certyfikatów, status ubezpieczenia, Trust Score, oceny 360°, reputacja i tryb offline/mobile-ready.','Użytkownik ma cyfrową tożsamość branżową, firma potwierdza gotowość pracownika, platforma zamyka pętlę: profil → certyfikaty → projekt → compliance → ubezpieczenie → reputacja.']
    ];
    s9.innerHTML = `<div class="slide-content roadmap-slide-content"><p class="slide-thesis">MVP 1.1–1.4 = fundament, demo testowe i publikacja. v1.5+ = oficjalny start oraz kolejne duże aktualizacje funkcji.</p><div class="slide-tablewrap" style="margin-bottom:14px;"><table class="slide-table" style="min-width:0; font-size:11.2px;"><thead><tr><th>Etap</th><th>Q</th><th>Główna aktualizacja</th></tr></thead><tbody>${rows(stages.map(r => ['<strong>' + r[0] + '</strong>', r[1], r[2]]))}</tbody></table></div><div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:12px;">${card('Fundament MVP 1.1–1.4','<p>Budujemy rdzeń: profil, demo testowe, księgowość v0, przygotowanie publikacji, podstawowe procesy i pierwszą walidację.</p>','accent-teal')}${card('Oficjalny start v1.5+','<p>Po publikacji dokładamy rekrutację, komunikację, partnerów, społeczność, AI, SEO, compliance i marketplace.</p>','accent-amber')}${card('Warstwa operacyjna v3.9–v4.9','<p>Project Dashboard, payroll, safety, API, Market Intelligence, Digital Offshore ID, Trust Score i mobilna karta pracownika.</p>','accent-green')}</div><details open style="margin-bottom:12px; background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-radius:10px; padding:10px 12px;"><summary style="cursor:pointer; color:#fff; font-weight:800; font-size:12px; letter-spacing:.08em; text-transform:uppercase;">Kamienie milowe v1.9–v4.9</summary><div class="slide-tablewrap" style="margin-top:10px; max-height:360px; overflow:auto;"><table class="slide-table" style="font-size:10.5px; min-width:1040px;"><thead><tr><th>Etap</th><th>Termin</th><th>Cel etapu</th><th>Praca</th><th>Efekt końcowy</th></tr></thead><tbody>${rows(deepStages.map(r => ['<strong>' + r[0] + '</strong>', r[1], r[2], r[3], r[4]]))}</tbody></table></div></details><div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('AI + treści + SEO','v2.0 tworzy ścieżki kariery, rekomendacje szkoleń i organiczny silnik pozyskiwania użytkowników.','#2DD4BF')}${infoBox('Compliance jako przewaga','v2.9 rozwija Document Vault, OCR, alerty i raport zgodności dla firm.','#FBBF24')}${infoBox('Trust layer','v4.9 zamyka pętlę Digital Offshore ID, Trust Score, QR/NFC, ubezpieczenie i reputację 360°.','#34D399')}</div><div class="slide-conclusion">Roadmapa nie skaluje funkcji losowo — każdy etap dodaje kolejną warstwę systemu operacyjnego dla pracy wysokiego ryzyka.</div></div>`;
    s9.dataset.roadmapPatched = '1';
  }

  function patchFinancialSlide() {
    const s10 = slide(10);
    if (!s10 || s10.dataset.financialPatched === '1') return;
    const mvpCosts = [
      ['Zatrudnienie etapowe MVP1','—','—','<strong>1 261 407,66 zł</strong>'],
      ['Biuro 12 mies. z rezerwą mediów','105 984,00 zł','24 376,32 zł','130 360,32 zł'],
      ['Programy i subskrypcje etapowe','179 037,22 zł','41 178,56 zł','220 215,78 zł'],
      ['Sprzęt / leasing / wyposażenie MVP1','134 128,34 zł','30 849,52 zł','164 977,86 zł'],
      ['<strong>Razem MVP1</strong>','','','<strong style="color:#34D399">1 776 961,62 zł</strong>']
    ];
    const office = [
      ['Czynsz','5 250,00 zł','1 207,50 zł','6 457,50 zł'],['Eksploatacja z 15% części wspólnej','2 582,00 zł','593,86 zł','3 175,86 zł'],['Rezerwa media','1 000,00 zł','230,00 zł','1 230,00 zł'],['<strong>Razem biuro</strong>','8 832,00 zł','2 031,36 zł','<strong>10 863,36 zł</strong>']
    ];
    const startCash = [
      ['Zespół — 1 miesiąc','65 655,81 zł'],['Biuro — 1 miesiąc','10 863,36 zł'],['Subskrypcje — 1 miesiąc','13 947,65 zł'],['Sprzęt — opłaty startowe Q3','40 542,55 zł'],['Sprzęt — raty 1 miesiąc','4 862,56 zł'],['Kaucja biura','6 457,50 zł'],['<strong>Razem start + 1 miesiąc</strong>','<strong style="color:#34D399">142 329,43 zł</strong>']
    ];
    const employment = [
      ['CEO','B2B VAT','8 000,00 zł','9 840,00 zł','9 840,00 zł','118 080,00 zł'],['Starszy Full Stack','B2B VAT','19 000,00 zł','23 370,00 zł','23 370,00 zł','280 440,00 zł'],['Junior Front-end','student &lt;26','7 000,00 zł','7 000,00 zł','7 000,00 zł','84 000,00 zł'],['Junior Back-end','student &lt;26','7 000,00 zł','7 000,00 zł','7 000,00 zł','84 000,00 zł'],['UI/UX Designer','B2B VAT','7 000,00 zł','8 610,00 zł','8 610,00 zł','103 320,00 zł'],['Researcher','student &lt;26','6 500,00 zł','6 500,00 zł','6 500,00 zł','78 000,00 zł'],['KAM','B2B VAT','6 500,00 zł','7 995,00 zł','7 995,00 zł','95 940,00 zł'],['Marketing & Social Media','B2B VAT','6 500,00 zł','7 995,00 zł','7 995,00 zł','95 940,00 zł'],['Główna Księgowa','zlecenie → UoP','8 000 / 10 000 zł','11 075 / 14 185 zł','13 343 / 17 090 zł','182 602,20 zł'],['BOK','student &lt;26','5 000,00 zł','5 000,00 zł','5 000,00 zł','60 000,00 zł'],['Software Architect','B2B VAT','17 000,00 zł','20 910,00 zł','20 910,00 zł','250 920,00 zł'],['Młodsza Księgowa','zlecenie → UoP','5 000 / 6 500 zł','6 922 / 9 051 zł','8 340 / 10 905 zł','115 465,15 zł'],['Przedstawiciel Handlowy','B2B VAT','5 500,00 zł','6 765,00 zł','6 765,00 zł','81 180,00 zł'],['Administracja i Dokumentacja','student → UoP','4 500 / 5 500 zł','4 500 / 7 584 zł','4 500 / 9 137 zł','81 823,81 zł'],['Średni Mobile Developer','B2B VAT','17 000,00 zł','20 910,00 zł','20 910,00 zł','250 920,00 zł'],['Junior Mobile Developer','B2B VAT','7 000,00 zł','8 610,00 zł','8 610,00 zł','103 320,00 zł'],['HR & Rekrutacja','zlecenie → UoP','5 500 / 6 500 zł','7 614 / 9 051 zł','9 173 / 10 905 zł','120 468,87 zł'],['Senior AI Developer','B2B VAT','22 500,00 zł','27 675,00 zł','27 675,00 zł','332 100,00 zł'],['Junior AI Developer','B2B VAT','12 500,00 zł','15 375,00 zł','15 375,00 zł','184 500,00 zł'],['Autor treści','student &lt;26','5 000,00 zł','5 000,00 zł','5 000,00 zł','60 000,00 zł'],['Specjalista SEO','zlecenie ZUS','7 000,00 zł','9 690,68 zł','11 675,33 zł','140 103,96 zł'],['Automatyzacja Marketingu','B2B VAT','8 500,00 zł','10 455,00 zł','10 455,00 zł','125 460,00 zł'],['Kadry, Płace i Rozliczenia','zlecenie → UoP','6 500 / 7 500 zł','8 998 / 10 518 zł','10 841 / 12 672 zł','141 080,51 zł'],['Sprzątanie / czyste biuro','zlecenie ZUS','2 000,00 zł','2 768,77 zł','3 335,81 zł','40 029,70 zł']
    ];
    const subscriptions = [
      ['Apple Business 2 TB','24','900,39 zł','207,09 zł','1 107,49 zł'],['Jira Premium','24','1 310,48 zł','301,41 zł','1 611,90 zł'],['Slack Pro','24','653,44 zł','150,29 zł','803,73 zł'],['Bitwarden Teams','24','360,52 zł','82,92 zł','443,44 zł'],['Microsoft 365 Business Standard','24','1 113,55 zł','256,12 zł','1 369,67 zł'],['ChatGPT Business + Codex','24','1 704,00 zł','391,92 zł','2 095,92 zł'],['Claude Team Premium','24','9 253,87 zł','2 128,39 zł','11 382,26 zł'],['Google Workspace Business Plus','24','2 376,00 zł','546,48 zł','2 922,48 zł'],['Perplexity Pro','22','2 809,04 zł','646,08 zł','3 455,12 zł'],['Perplexity Enterprise Max','2','2 035,43 zł','468,15 zł','2 503,57 zł'],['GitHub Enterprise','9','709,77 zł','163,25 zł','873,02 zł'],['Copilot Enterprise','9','1 318,15 zł','303,17 zł','1 621,32 zł'],['Figma Professional','1','60,09 zł','13,82 zł','73,91 zł'],['Canva Business','1','75,11 zł','17,27 zł','92,38 zł'],['Vercel Pro','8','600,86 zł','138,20 zł','739,06 zł'],['Supabase Team','1','2 249,48 zł','517,38 zł','2 766,87 zł'],['GetResponse Creator','1','253,19 zł','58,23 zł','311,43 zł'],['<strong>Razem</strong>','','<strong>27 783,38 zł</strong>','<strong>6 390,18 zł</strong>','<strong>34 173,55 zł</strong>']
    ];
    const equipment = [
      ['CEO / programiści / UI/UX / researcher — MacBook Pro + iPhone 17 + stanowisko','5 049,56 zł','729,94 zł'],['Pozostali pracownicy — MacBook Air + iPhone 16e + stanowisko','3 880,55 zł','482,90 zł'],['QNAP TS-873A-8G','6 364,66 zł','—'],['2× Mac mini M4 Pro — etap AI','1 499,81 zł','490,01 zł']
    ];
    const departments = [
      ['Zarząd','CEO'],['IT','Full Stack, Front-end, Back-end, Software Architect, Mobile, AI'],['R&D / Product','UI/UX Designer, Researcher'],['Sprzedaż','KAM, Przedstawiciel Handlowy'],['Marketing','Social Media, Content, SEO, Automatyzacja Marketingu'],['BOK','Specjalista ds. Obsługi Klienta'],['HR & Administracja','HR, Administracja i Dokumentacja, Sprzątanie'],['Finanse','Główna Księgowa, Młodsza Księgowa, Kadry/Płace/Rozliczenia']
    ];
    s10.innerHTML = `
      <div class="slide-content finance-slide-content">
        <p class="slide-thesis">MVP1 kosztuje ok. 1,78 mln zł brutto/cashflow w wariancie zoptymalizowanym i etapowym. Budżet obejmuje aplikację, zespół, biuro, sprzęt, leasing urządzeń, subskrypcje AI/SaaS oraz podstawową infrastrukturę pracy.</p>
        <div class="responsive-grid-3b" style="align-items:stretch; margin-bottom:14px;">
          ${card('Razem MVP1','<p style="font-size:28px; font-weight:950; color:#34D399; margin:0 0 6px;">1 776 961,62 zł</p><p>12 miesięcy brutto / cashflow.</p>','accent-green')}
          ${card('Start + 1 miesiąc','<p style="font-size:28px; font-weight:950; color:#FBBF24; margin:0 0 6px;">142 329,43 zł</p><p>Minimalny cash potrzebny na uruchomienie MVP 1.1.</p>','accent-amber')}
          ${card('Pełna baza 24 osób','<p style="font-size:26px; font-weight:950; color:#2DD4BF; margin:0 0 6px;">260 218,74 zł / msc</p><p>3 msc: 780 656,23 zł · 12 msc: 3 209 694,20 zł.</p>','accent-teal')}
        </div>
        <div class="slide-tablewrap" style="margin-bottom:12px;"><table class="slide-table" style="min-width:0; font-size:11.4px;"><thead><tr><th>Kategoria</th><th>Netto / cashflow</th><th>VAT</th><th>Brutto / cashflow</th></tr></thead><tbody>${rows(mvpCosts)}</tbody></table></div>
        <div class="responsive-grid-3b" style="margin-bottom:12px;">${infoBox('Kursy do przeliczeń','USD 3,7554 zł, EUR 4,2842 zł, GBP 4,9646 zł, VAT 23%. Źródło w notatce: NBP — Serwis Informacyjny.','#2DD4BF')}${infoBox('Biuro — Gdańsk Wrzeszcz','Al. Grunwaldzka; miesięcznie 10 863,36 zł brutto, 12 miesięcy 130 360,32 zł.','#FBBF24')}${infoBox('Działy organizacji','Zarząd, IT, R&D/Product, Sprzedaż, Marketing, BOK, HR & Administracja, Finanse.','#34D399')}</div>
        <div class="slide-tablewrap" style="margin-bottom:12px;"><table class="slide-table" style="min-width:0; font-size:11.2px;"><thead><tr><th>Pozycja</th><th>Netto / msc</th><th>VAT</th><th>Brutto / msc</th></tr></thead><tbody>${rows(office)}</tbody></table></div>
        <div class="slide-tablewrap" style="margin-bottom:12px;"><table class="slide-table" style="min-width:0; font-size:11.2px;"><thead><tr><th>Start MVP 1.1 — cash potrzebny na uruchomienie</th><th>Brutto</th></tr></thead><tbody>${rows(startCash)}</tbody></table></div>
        <details style="margin-bottom:12px; background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-radius:10px; padding:10px 12px;"><summary style="cursor:pointer; color:#fff; font-weight:800; font-size:12px; letter-spacing:.08em; text-transform:uppercase;">Zatrudnienie — pełna baza 24 stanowisk</summary><div class="slide-tablewrap" style="margin-top:10px; max-height:260px; overflow:auto;"><table class="slide-table" style="font-size:10.4px; min-width:1000px;"><thead><tr><th>Stanowisko</th><th>Forma</th><th>Netto / msc</th><th>Brutto / msc</th><th>Koszt pracodawcy / msc</th><th>12 msc</th></tr></thead><tbody>${rows(employment)}</tbody></table></div></details>
        <details style="margin-bottom:12px; background:rgba(110,139,168,.08); border:1px solid rgba(110,139,168,.25); border-radius:10px; padding:10px 12px;"><summary style="cursor:pointer; color:#fff; font-weight:800; font-size:12px; letter-spacing:.08em; text-transform:uppercase;">Programy, subskrypcje, sprzęt i działy</summary><div class="responsive-grid-3b" style="margin-top:10px; align-items:start;"><div class="slide-tablewrap"><table class="slide-table" style="font-size:10.2px; min-width:650px;"><thead><tr><th>Subskrypcja</th><th>Liczba</th><th>Netto</th><th>VAT</th><th>Brutto / msc</th></tr></thead><tbody>${rows(subscriptions)}</tbody></table></div><div class="slide-tablewrap"><table class="slide-table" style="font-size:10.2px; min-width:420px;"><thead><tr><th>Pakiet sprzętu</th><th>Start / osoba</th><th>Rata / msc</th></tr></thead><tbody>${rows(equipment)}</tbody></table></div><div class="slide-tablewrap"><table class="slide-table" style="font-size:10.2px; min-width:420px;"><thead><tr><th>Dział</th><th>Stanowiska</th></tr></thead><tbody>${rows(departments)}</tbody></table></div></div></details>
        <div class="slide-conclusion">MVP1 to nie tylko koszt aplikacji — to budżet pierwszej operacyjnej wersji spółki: zespół, narzędzia, biuro, sprzęt, AI/SaaS i infrastruktura pracy.</div>
      </div>`;
    s10.dataset.financialPatched = '1';
  }

  ready(() => {
    patchCompetitionSlide();
    patchMarketEntrySlide();
    patchTeamSlide();
    patchRoadmapSlide();
    patchFinancialSlide();
  });
})();
