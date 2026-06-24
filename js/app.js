(function() {
  const buttons = Array.from(document.querySelectorAll('.view-btn'));
  const views = Array.from(document.querySelectorAll('.page-view'));

  let slides = Array.from(document.querySelectorAll('.deck-slide'));
  let slideRichBodies = slides.map(el => el.innerHTML);
  let dots = Array.from(document.querySelectorAll('.slide-dot'));
  const counter = document.getElementById('slideCounter');
  const titleHash = document.getElementById('slideTitleHash');
  const titleName = document.getElementById('slideTitleName');
  let slideTitles = [
    'STRESZCZENIE INWESTYCYJNE',
    'PROBLEM RYNKOWY',
    'ROZWIĄZANIE PRODUKTOWE',
    'RYNEK I SKALA MOŻLIWOŚCI',
    'MODEL BIZNESOWY I MONETYZACJA',
    'ANALIZA KONKURENCJI I PRZEWAGA OBRONNA',
    'STRATEGIA WEJŚCIA NA RYNEK',
    'ZESPÓŁ I FOUNDER-MARKET FIT',
    'ROADMAPA ROZWOJU I KAMIENIE MILOWE',
    'MODEL FINANSOWY I PROGNOZY',
    'FINANSOWANIE PUBLICZNE I GRANTY',
    'RYZYKA I PLAN MITYGACJI',
    'RUNDA INWESTYCYJNA I WYKORZYSTANIE ŚRODKÓW',
    'MATERIAŁY UZUPEŁNIAJĄCE',
    'OTWARTE DECYZJE I NASTĘPNE KROKI',
    'Q&A / KONTAKT INWESTORSKI'
  ];
  let slideBodies = new Array(slideTitles.length).fill('');
  let currentSlide = 1;

  function showView(viewId) {
    views.forEach(view => view.classList.toggle('active', view.id === viewId));
    buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showSlide(number) {
    const total = slides.length;
    currentSlide = ((number - 1 + total) % total) + 1;
    slides.forEach(slide => slide.classList.toggle('active', Number(slide.dataset.slide) === currentSlide));
    dots.forEach(dot => dot.classList.toggle('active', Number(dot.dataset.slideTarget) === currentSlide));
    if (counter) counter.textContent = currentSlide + ' / ' + total;
    if (titleHash) titleHash.textContent = '#' + currentSlide;
    if (titleName) titleName.textContent = slideTitles[currentSlide - 1] || ('SLAJD ' + currentSlide);
  }

  buttons.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  document.querySelectorAll('[data-slide-move]').forEach(btn => btn.addEventListener('click', () => showSlide(currentSlide + Number(btn.dataset.slideMove))));
  function bindDots() {
    dots.forEach(dot => dot.addEventListener('click', () => showSlide(Number(dot.dataset.slideTarget))));
  }
  bindDots();
  const boundPresentButtons = new WeakSet();
  function bindTopicPresentButtons() {
    document.querySelectorAll('.topic-present-btn').forEach(btn => {
      if (boundPresentButtons.has(btn)) return;
      boundPresentButtons.add(btn);
      btn.addEventListener('click', () => {
        showView('presentation');
        showSlide(Number(btn.dataset.gotoSlide));
      });
    });
  }
  bindTopicPresentButtons();

  const PRES_STORAGE_KEY = 'goSharePresentation_titles_v1';
  const deckStage = document.querySelector('.slide-stage');
  const dotsContainer = document.querySelector('.slide-dots');

  function rebuildDeck(titles, bodies, richBodies) {
    slideTitles = titles.slice();
    slideBodies = (bodies || []).slice();
    slideRichBodies = (richBodies || []).slice();
    deckStage.querySelectorAll('.deck-slide').forEach(el => el.remove());
    dotsContainer.innerHTML = '';
    const arrowPrev = deckStage.querySelector('.slide-arrow.prev');
    titles.forEach((title, i) => {
      const n = i + 1;
      const section = document.createElement('section');
      section.className = 'deck-slide' + (n === 1 ? ' active' : '');
      section.dataset.slide = String(n);
      const body = slideBodies[i] || '';
      const rich = slideRichBodies[i] || '';
      if (body) {
        const bodyEl = document.createElement('div');
        bodyEl.className = 'deck-slide-body';
        bodyEl.textContent = body;
        section.appendChild(bodyEl);
      } else if (rich) {
        section.innerHTML = rich;
      }
      deckStage.insertBefore(section, arrowPrev);
      const dot = document.createElement('button');
      dot.className = 'slide-dot' + (n === 1 ? ' active' : '');
      dot.type = 'button';
      dot.dataset.slideTarget = String(n);
      dot.setAttribute('aria-label', 'Przejdź do slajdu ' + n);
      dotsContainer.appendChild(dot);
    });
    slides = Array.from(document.querySelectorAll('.deck-slide'));
    dots = Array.from(document.querySelectorAll('.slide-dot'));
    bindDots();
    currentSlide = 1;
    showSlide(1);
  }

  const presSaved = localStorage.getItem(PRES_STORAGE_KEY);
  if (presSaved) {
    try {
      const parsed = JSON.parse(presSaved);
      if (Array.isArray(parsed)) {
        rebuildDeck(parsed, [], slideRichBodies);
      } else if (parsed && Array.isArray(parsed.titles)) {
        rebuildDeck(parsed.titles, parsed.bodies || [], parsed.richBodies || slideRichBodies);
      }
    } catch (e) {}
  }


  // ====================================================================
  // Wspólne stałe i pomocnicze funkcje (Road Mapa + Organizacja + popup osoby)
  // ====================================================================
  const ALL_QUARTERS = ['Q3 2026','Q4 2026','Q1 2027','Q2 2027','Q3 2027','Q4 2027','Q1 2028','Q2 2028','Q3 2028','Q4 2028','Q1 2029','Q2 2029'];
  const DEPARTMENTS_FIXED = ['Zarząd', 'IT', 'R&D', 'Sprzedaż', 'Marketing', 'BOK', 'HR & Administracja', 'Finanse'];
  const PL_MONTHS = ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'];

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function fmtPln(n) {
    return Number(n || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
  }

  function formatMonthRangePL(dateFrom, dateTo) {
    if (!dateFrom || !dateTo) return '';
    const fParts = dateFrom.split('-').map(Number);
    const tParts = dateTo.split('-').map(Number);
    const fy = fParts[0], fm = fParts[1], ty = tParts[0], tm = tParts[1];
    const fromLabel = PL_MONTHS[fm - 1] + (fy !== ty ? ' ' + fy : '');
    const toLabel = PL_MONTHS[tm - 1] + ' ' + ty;
    return fromLabel + ' – ' + toLabel;
  }

  // ====================================================================
  // Model "Person" — wspólny rekord osoby dla Road Mapy i Organizacji
  // ====================================================================
  const PEOPLE_STORAGE_KEY = 'goSharePeople_v1';

  // Dane startowe (jednorazowy seed) — to są te same ~31 ról, które wcześniej
  // żyły wyłącznie w Organizacji. Format: rola@Q@rodzicRola@umowa@netto@brutto@kosztPracodawcy1msc@kosztPracodawcy12msc@typKosztu@opis
  const ORG_DEPARTMENTS_DEFAULT_RAW = [
    { title: 'Zarząd', roles: 'CEO@Q3 2026@@B2B@8000@9840@8000@96000@stały@Wizja produktu, strategia, fundraising, kluczowe decyzje biznesowe i reprezentacja spółki.' },
    { title: 'IT', roles: 'Starszy Programista Full Stack@Q3 2026@@B2B@19000@23370@19000@228000@stały@Architektura i rozwój głównych modułów platformy, code review, mentoring juniorów.;Junior Front-end programmer@Q3 2026@Starszy Programista Full Stack@Zlecenie (student <26 r.ż.)@7000@7000@7000@84000@stały@Rozwój interfejsu użytkownika i komponentów front-end pod nadzorem starszego programisty.;Junior Back-end programmer@Q3 2026@Starszy Programista Full Stack@Zlecenie (student <26 r.ż.)@7000@7000@7000@84000@stały@Rozwój API i logiki backendowej pod nadzorem starszego programisty.;Software Architect@Q1 2027@@B2B@17000@20910@17000@204000@stały@Projektowanie architektury systemu, standardy techniczne, decyzje technologiczne.;Średni Programista mobile (Android/iOS)@Q3 2027@@B2B@17000@20910@17000@204000@stały@Rozwój aplikacji mobilnych na Android i iOS.;Junior Programista mobile (Android/iOS)@Q3 2027@Średni Programista mobile (Android/iOS)@B2B@7000@8610@7000@84000@stały@Wsparcie rozwoju aplikacji mobilnych pod nadzorem starszego programisty mobile.' },
    { title: 'R&D', roles: 'UI/UX Designer@Q3 2026@@B2B@7000@8610@7000@84000@stały@Projektowanie interfejsów, makiety, system designu i badania użyteczności.;Researcher@Q3 2026@@Zlecenie (student <26 r.ż.)@6500@6500@6500@78000@stały@Analiza rynku, konkurencji, wymagań branżowych i wsparcie decyzji produktowych danymi.;Senior programista AI@Q4 2027@@B2B@22500@27675@22500@270000@stały@Projektowanie i rozwój modeli AI, architektura systemów uczenia maszynowego.;Junior programista AI@Q1 2028@Senior programista AI@B2B@12500@15375@12500@150000@stały@Wsparcie rozwoju modeli AI pod nadzorem senior programisty AI.' },
    { title: 'Sprzedaż', roles: 'KAM@Q4 2026@@B2B@6500@7995@6500@78000@stały@Zarządzanie relacjami z kluczowymi klientami i partnerami, utrzymanie i rozwój kont.;Przedstawiciel Handlowy@Q2 2027@@B2B@5500@6765@5500@66000@stały@Pozyskiwanie nowych klientów, prowadzenie sprzedaży i negocjacji.;Przedstawiciel Handlowy@Q2 2027@@B2B@5500@6765@5500@66000@stały@Pozyskiwanie nowych klientów, prowadzenie sprzedaży i negocjacji (drugi etat).' },
    { title: 'Marketing', roles: 'Specjalista ds. Marketingu i Social Mediów@Q4 2026@@B2B@6500@7995@6500@78000@stały@Prowadzenie kanałów social media, kampanii i komunikacji marki.;Specjalista ds. Marketingu i Social Mediów@Q3 2027@@B2B@6500@7995@6500@78000@stały@Prowadzenie kanałów social media, kampanii i komunikacji marki (drugi etat).;Specjalista ds. treści i autor treści@Q1 2028@@Zlecenie (student <26 r.ż.)@5000@5000@5000@60000@stały@Tworzenie treści marketingowych, blogowych i materiałów sprzedażowych.;Specjalista SEO@Q1 2028@@Zlecenie standard 12 msc → UoP@7000@9275@11675.33@140103.96@stały@Optymalizacja SEO, analiza słów kluczowych, widoczność w wyszukiwarkach.;Specjalista ds. automatyzacji marketingu@Q1 2028@@B2B@8500@10455@8500@102000@stały@Wdrażanie i obsługa narzędzi automatyzacji marketingu, lead nurturing.' },
    { title: 'BOK', roles: 'Specjalista ds. Obsługi Klienta@Q1 2027@@Zlecenie (student <26 r.ż.)@5000@5000@5000@60000@stały@Wsparcie użytkowników, obsługa zgłoszeń, onboarding klientów.;Specjalista ds. Obsługi Klienta@Q2 2027@@Zlecenie (student <26 r.ż.)@5000@5000@5000@60000@stały@Wsparcie użytkowników, obsługa zgłoszeń, onboarding klientów (drugi etat).' },
    { title: 'HR & Administracja', roles: 'Specjalista ds. Administracji i Dokumentacji@Q2 2027@@Zlecenie student 6 msc → UoP@4500@4500@4500@81823.80@stały@Obsługa administracyjna spółki, dokumentacja, archiwizacja, zamówienia.;Specjalista ds. HR i rekrutacji@Q4 2027@@Zlecenie 6 msc → UoP@5500@7198@9173.47@120464.82@stały@Rekrutacja, onboarding, polityki HR i wsparcie zespołu.;Specjalista ds. Kadr, Płac i Rozliczeń@Q1 2028@@Zlecenie 6 msc → UoP@6500@8583@10841.38@141077.28@stały@Naliczanie wynagrodzeń, rozliczenia kadrowe i podatkowe pracowników.;Sprzątanie i czyste biuro (1/3 etatu, 50h/msc)@Q3 2026@@Zlecenie standard@2000@2477@3335.81@40029.72@stały@Utrzymanie czystości i porządku w biurze.' },
    { title: 'Finanse', roles: 'Główna Księgowa@Q1 2027@@Zlecenie 6 msc → UoP@8000@10660@13343.23@182602.14@stały@Prowadzenie pełnej księgowości spółki, rozliczenia, raportowanie finansowe.;Młodsza Księgowa@Q2 2027@@Zlecenie 6 msc → UoP@5000@6506@8339.52@115465.14@stały@Wsparcie księgowości, dokumenty, rozliczenia pomocnicze.' }
  ];

  function slugify(s) {
    return String(s).toLowerCase()
      .replace(/[ąćęłńóśźż]/g, c => ({ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z'}[c]))
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'osoba';
  }

  function seedPeopleFromOrgDefaults() {
    const flat = [];
    const usedIds = new Set();
    ORG_DEPARTMENTS_DEFAULT_RAW.forEach(dept => {
      dept.roles.split(';').filter(Boolean).forEach(part => {
        const fields = part.split('@');
        const role = fields[0], q = fields[1], parent = fields[2], collab = fields[3], netto = fields[4], brutto = fields[5], employerCost1 = fields[6], employerCost12 = fields[7], costType = fields[8], desc = fields[9];
        let base = 'p_' + slugify(role);
        let id = base, n = 1;
        while (usedIds.has(id)) { n++; id = base + '_' + n; }
        usedIds.add(id);
        const n1 = netto ? Number(netto) : 0;
        const b1 = brutto ? Number(brutto) : 0;
        const e1 = employerCost1 ? Number(employerCost1) : 0;
        const e12 = employerCost12 ? Number(employerCost12) : 0;
        flat.push({
          id, role, dept: dept.title, desc: desc || '', quarter: q, parentName: parent || null,
          collab: collab || '', costType: costType || 'stały', salaryRules: '', equipment: [],
          pay: {
            m1: { netto: n1, brutto: b1, employerCost: e1 },
            m3: { netto: n1 * 3, brutto: b1 * 3, employerCost: e1 * 3 },
            m12: { netto: n1 * 12, brutto: b1 * 12, employerCost: e12 }
          }
        });
      });
    });
    const nameToId = {};
    flat.forEach(p => { nameToId[p.role] = p.id; });
    flat.forEach(p => { p.parentId = p.parentName ? (nameToId[p.parentName] || null) : null; delete p.parentName; });
    return { nextId: flat.length + 1, people: flat };
  }

  function loadPeopleStore() {
    try {
      const raw = localStorage.getItem(PEOPLE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.people)) return parsed;
      }
    } catch (e) {}
    const seeded = seedPeopleFromOrgDefaults();
    try { localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(seeded)); } catch (e) {}
    return seeded;
  }

  let peopleStore = loadPeopleStore();
  let people = peopleStore.people;

  function persistPeople() {
    peopleStore.people = people;
    try { localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(peopleStore)); } catch (e) {}
  }

  function personById(id) {
    return people.find(p => p.id === id) || null;
  }

  function nextPersonId(role) {
    const base = 'p_' + slugify(role);
    let candidate = base, n = 1;
    const existingIds = new Set(people.map(p => p.id));
    while (existingIds.has(candidate)) { n++; candidate = base + '_' + n; }
    return candidate;
  }

  function savePerson(data, existingId) {
    if (existingId && personById(existingId)) {
      const idx = people.findIndex(p => p.id === existingId);
      people[idx] = Object.assign({}, people[idx], data, { id: existingId });
    } else {
      people.push(Object.assign({ id: nextPersonId(data.role) }, data));
    }
    persistPeople();
    refreshAfterPeopleChange();
  }

  function deletePerson(id) {
    people = people.filter(p => p.id !== id);
    peopleStore.people = people;
    persistPeople();
    refreshAfterPeopleChange();
  }

  // Hooki podpięte przez initOrgChart / initRoadmapEditor, żeby zmiana osoby
  // odświeżyła też ich widoki bez wzajemnych zależności między IIFE.
  let refreshOrgView = null;
  let refreshOrgEditorList = null;
  let loadPersonFormHook = null;

  function refreshAfterPeopleChange() {
    renderRoadmap(roadmapConfig);
    rebindRoadmapNav();
    rebuildStageSummaries();
    showRoadmapStage(currentRoadmapStageId);
    if (typeof refreshOrgView === 'function') refreshOrgView();
    if (typeof refreshOrgEditorList === 'function') refreshOrgEditorList();
  }

  function loadPersonIntoForm(id) {
    const p = personById(id);
    if (!p || typeof loadPersonFormHook !== 'function') return;
    showView('settings');
    loadPersonFormHook(p);
  }

  // ====================================================================
  // Popup ze szczegółami osoby (Organizacja + zespół na Road Mapie)
  // ====================================================================
  function personEquipmentSums(p) {
    let oneTime = 0, fixed = 0;
    (p.equipment || []).forEach(item => {
      if (item.kind === 'jednorazowy') oneTime += Number(item.amount) || 0;
      else fixed += Number(item.amount) || 0;
    });
    return { oneTime, fixed };
  }

  function quarterStageLabel(qid) {
    const stage = roadmapConfig.stages.find(s => s.quarters.some(q => q.id === qid));
    return stage ? stage.title : qid;
  }

  function personPopupHTML(p) {
    const parentP = p.parentId ? personById(p.parentId) : null;
    const sums = personEquipmentSums(p);
    const equipmentRows = (p.equipment || []).length
      ? '<table class="org-role-pay"><thead><tr><th>Pozycja</th><th>Typ</th><th>Kwota</th></tr></thead><tbody>' +
          p.equipment.map(it => '<tr><td>' + escapeHtml(it.name) + '</td><td>' + escapeHtml(it.kind) + '</td><td>' + fmtPln(it.amount) + '</td></tr>').join('') +
        '</tbody></table>'
      : '<p class="org-team-scope-empty">Brak pozycji wyposażenia.</p>';
    return (
      '<h2 style="margin:0 0 4px;">' + escapeHtml(p.role) + '</h2>' +
      '<p style="margin:0 0 14px; color:var(--muted);">' + escapeHtml(p.dept) + (parentP ? ' · podlega: ' + escapeHtml(parentP.role) : '') + '</p>' +
      '<table class="sumtbl">' +
        '<tr><td class="k">Za co odpowiada</td><td>' + escapeHtml(p.desc || '—') + '</td></tr>' +
        '<tr><td class="k">Etap projektu</td><td>' + escapeHtml(quarterStageLabel(p.quarter)) + ' (' + escapeHtml(p.quarter) + ')</td></tr>' +
        '<tr><td class="k">Rodzaj umowy / współpracy</td><td>' + escapeHtml(p.collab || '—') + '</td></tr>' +
        '<tr><td class="k">Zasady wynagrodzenia</td><td>' + escapeHtml(p.salaryRules || '—') + '</td></tr>' +
      '</table>' +
      '<h3 style="margin:18px 0 6px;">Wynagrodzenie</h3>' +
      '<table class="org-role-pay"><thead><tr><th></th><th>1 msc</th><th>3 msc</th><th>12 msc</th></tr></thead><tbody>' +
        '<tr><td>Netto</td><td>' + fmtPln(p.pay.m1.netto) + '</td><td>' + fmtPln(p.pay.m3.netto) + '</td><td>' + fmtPln(p.pay.m12.netto) + '</td></tr>' +
        '<tr><td>Brutto</td><td>' + fmtPln(p.pay.m1.brutto) + '</td><td>' + fmtPln(p.pay.m3.brutto) + '</td><td>' + fmtPln(p.pay.m12.brutto) + '</td></tr>' +
        '<tr><td>Koszt pracodawcy</td><td>' + fmtPln(p.pay.m1.employerCost) + '</td><td>' + fmtPln(p.pay.m3.employerCost) + '</td><td>' + fmtPln(p.pay.m12.employerCost) + '</td></tr>' +
      '</tbody></table>' +
      '<h3 style="margin:18px 0 6px;">Wyposażenie, programy, sprzęt</h3>' +
      equipmentRows +
      '<table class="sumtbl" style="margin-top:10px;">' +
        '<tr><td class="k">Suma kosztów jednorazowych</td><td>' + fmtPln(sums.oneTime) + '</td></tr>' +
        '<tr><td class="k">Suma kosztów stałych pozapłacowych</td><td>' + fmtPln(sums.fixed) + '</td></tr>' +
      '</table>' +
      '<div class="settings-actions" style="margin-top:18px;">' +
        '<button type="button" class="org-filter-btn" id="personModalEditBtn">Edytuj w Road Mapie</button>' +
        '<button type="button" class="org-filter-btn" id="personModalDeleteBtn">Usuń osobę</button>' +
      '</div>'
    );
  }

  function openPersonModal(p) {
    const overlay = document.getElementById('personModalOverlay');
    const body = document.getElementById('personModalBody');
    if (!overlay || !body) return;
    body.innerHTML = personPopupHTML(p);
    overlay.hidden = false;
    const editBtn = document.getElementById('personModalEditBtn');
    if (editBtn) editBtn.addEventListener('click', () => { closePersonModal(); loadPersonIntoForm(p.id); });
    const delBtn = document.getElementById('personModalDeleteBtn');
    if (delBtn) delBtn.addEventListener('click', () => {
      if (confirm('Usunąć osobę „' + p.role + '”?')) { deletePerson(p.id); closePersonModal(); }
    });
  }

  function closePersonModal() {
    const overlay = document.getElementById('personModalOverlay');
    if (overlay) overlay.hidden = true;
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'personModalOverlay' || e.target.id === 'personModalClose') closePersonModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePersonModal(); });
  document.addEventListener('click', e => {
    if (e.target.closest('#personModal')) return;
    const el = e.target.closest('[data-person-id]');
    if (!el) return;
    const p = personById(el.dataset.personId);
    if (p) openPersonModal(p);
  });

  // ====================================================================
  // Road Mapa — strukturalna konfiguracja etapów i kwartałów
  // ====================================================================
  const ROADMAP_STORAGE_KEY = 'goShoreRoadmapConfig_v1';

  function mkQ(id, label, dateFrom, dateTo, celEtapu, praca, efektKoncowy) {
    return { id, label, dateFrom, dateTo, celEtapu: celEtapu || '', praca: praca || [], efektKoncowy: efektKoncowy || [] };
  }

  const ROADMAP_DEFAULT_CONFIG = {
    stages: [
      { id: 'mvp1', title: 'I. MVP — v1.4', dateFrom: '2026-07', dateTo: '2027-06', quarters: [
        mkQ('Q3 2026', 'MVP 1.1', '2026-07', '2026-09',
          'Budujemy fundamenty techniczne, organizacyjne i produktowe. Nie skalujemy jeszcze sprzedaży — tworzymy szkielet aplikacji, CRM, bazę zawodów, firm i partnerów oraz pierwsze procesy wewnętrzne.',
          [
            { category: 'Produkt / aplikacja', tasks: ['Architektura aplikacji','CRM wewnętrzny','Landing page','Panel administracyjny','Baza zawodów','Baza firm','Formularze','Analityka'] },
            { category: 'Dane i research', tasks: ['Zawody','Wynagrodzenia','Certyfikaty (GWO, OPITO, IRATA, UDT, SEP, IMCA)','Ryzyko zawodowe','Firmy','Partnerzy'] },
            { category: 'Operacje', tasks: ['Procesy wewnętrzne','Dokumentacja','Standard danych','Testy ręczne'] }
          ],
          ['Działający szkielet aplikacji','Landing page','Panel administracyjny v0','Podstawowy CRM','Pierwsza baza zawodów i firm','Formularze zapisu','Pierwsza lista użytkowników zainteresowanych','Pierwsza dokumentacja procesów']),
        mkQ('Q4 2026', 'MVP 1.2', '2026-10', '2026-12',
          'Zamknięta beta dla wybranych użytkowników, firm i partnerów. To wciąż nie jest pełna publikacja — testujemy aplikację na 8 startowych zawodach, zbieramy opinie i walidujemy matching.',
          [
            { category: 'Produkt / aplikacja', tasks: ['Konto użytkownika','Konto firmy','Konto partnera','Ogłoszenia pracy','Aplikowanie','Matching v0','CRM sprzedażowy','Panel BOK','Powiadomienia e-mail'] },
            { category: '8 zawodów startowych', tasks: ['Wind Turbine Technician','Rope Access Technician / IRATA','Offshore Electrician','Welder Offshore / Stoczniowy','Rigger / Slinger Signaller','NDT Inspector','Marine Engineer / Mechanik okrętowy','HSE Officer / Safety Officer'] },
            { category: 'Pozyskiwanie użytkowników', tasks: ['Lista oczekujących','Grupy branżowe','Ambasadorzy zawodów','Ankiety','Wywiady','Pierwsze firmy (20–50)','Pierwsi partnerzy'] }
          ],
          ['Działająca zamknięta beta','Pierwsi użytkownicy, firmy i partnerzy w systemie','8 zawodów przetestowanych na żywym materiale','Pierwsze opinie i dane do walidacji matchingu','Pierwszy CRM sprzedażowy w użyciu']),
        mkQ('Q1 2027', 'MVP 1.3', '2027-01', '2027-03',
          'Przejście w stronę ekosystemu usługowego — startujemy moduł księgowy. Zatrudniamy główną księgową i głównego programistę, którzy odpowiadają za fundament tego obszaru.',
          [
            { category: 'Produkt / aplikacja', tasks: ['Moduł księgowy v0','Formularz klienta księgowego','Pakiety księgowe (JDG Basic / Standard / Pro)','Panel dokumentów','Status obsługi','Integracja z CRM','Baza wiedzy księgowej','Obsługa płatności v0'] },
            { category: 'Księgowość i oferta', tasks: ['Zatrudnienie głównej księgowej','Zakres usług','Cennik','Procedury','Regulaminy','Lista ryzyk','Testy usługi (5–10 klientów)'] },
            { category: 'IT / technologia', tasks: ['Zatrudnienie głównego programisty','Porządkowanie kodu','Bezpieczeństwo dokumentów','Backup danych','Role dostępu','Przygotowanie pod skalowanie'] }
          ],
          ['Działający moduł księgowy v0','Pierwsi klienci testowi obsługi księgowej','Główna księgowa i główny programista w zespole','Uporządkowany kod i bezpieczeństwo dokumentów','Platforma gotowa pod kolejny etap skalowania']),
        mkQ('Q2 2027', 'MVP 1.4', '2027-04', '2027-06',
          'Najważniejszy etap przygotowawczy przed oficjalnym startem. Do końca kwartału aplikacja musi być gotowa do publikacji na szerszy rynek — sam start publiczny odbywa się w Q3 2027.',
          [
            { category: 'Aplikacja przed publikacją', tasks: ['Stabilizacja','Testy bezpieczeństwa','Testy wydajności','UX/UI','System płatności','Panel księgowości v1','Panel BOK','Panel sprzedaży','Raporty','Dokumenty użytkownika'] },
            { category: 'Skończenie modułu księgowego', tasks: ['Pakiety księgowe finalne','Obsługa JDG','Klienci zagraniczni','Dokumenty','Komunikacja','Terminy','Baza wiedzy','Sprzedaż księgowości'] },
            { category: 'Oferta obligacji korporacyjnych', tasks: ['Koncepcja oferty (okresy 1 / 2 / 5 / 7 lat)','Cel emisji','Kwota minimalna (5 000 zł)','Bonusy inwestorskie (progi 100 tys. / 500 tys. / 1 mln zł)','Model oprocentowania','Dokumenty','Obsługa inwestora','Doradca prawny','Doradca finansowy','Materiały sprzedażowe','Ważne: to nie jest „wrzucamy obligacje do aplikacji i każdy kupuje”. Najpierw potrzebna jest struktura prawna, dokumentacja, analiza ryzyk i sposób komunikacji — osobny projekt pod nadzorem prawnym i finansowym.'] },
            { category: 'Dotacje / granty', tasks: ['Lista programów (PARP / NCBR / FENG / regionalne / UE / offshore / AI / cyfryzacja)','Dokumenty spółki','Opisy projektu','Budżet projektu','Harmonogram','Partnerzy','Załączniki','CRM grantów'] }
          ],
          ['Aplikacja gotowa do publicznej publikacji','Skończony moduł księgowy','Przygotowana (nie jeszcze sprzedana) oferta obligacji korporacyjnych','Przygotowana ścieżka grantowa','Rozbudowany zespół sprzedaży, BOK i administracji'])
      ] },
      { id: 'two', title: 'II. v1.5 — v1.9', dateFrom: '2027-07', dateTo: '2027-12', quarters: [
        mkQ('Q3 2027', 'v1.5', '2027-07', '2027-09',
          'Oficjalny, publiczny start platformy. Płatne konta użytkowników, sprzedaż usługi księgowej, sprzedaż obligacji korporacyjnych i pierwsze projekty rekrutacyjne.',
          [
            { category: 'Cele liczbowe', tasks: ['Konta subskrypcyjne: 200','Sprzedaż obligacji: 350 000 zł','Klienci księgowości: 70','Firmy w CRM: min. 300–500','Aktywne firmy testujące rekrutację: 20–40','Partnerzy: 20–30','Wybrane zawody projektowe: 8–12','Pierwsze projekty / rekrutacje: 5–15'] },
            { category: 'Publiczny start aplikacji', tasks: ['Publikacja platformy','Kampania startowa','Subskrypcje','Oferta firmowa','Obsługa księgowa','Partnerzy','Pierwsze projekty','Raportowanie'] },
            { category: 'Sprzedaż obligacji', tasks: ['Landing inwestorski','CRM inwestorski','Dokumenty','Rozmowy z inwestorami','Cel finansowy: 350 000 zł','Komunikacja bez obietnic gwarantowanego zysku'] },
            { category: 'Start prac nad aplikacją v2 / mobile', tasks: ['Start pracy nad pełniejszą aplikacją produktową v2 / aplikacją mobilną / rozbudowanym systemem użytkownika.','Zatrudnienie głównego programisty od aplikacji','Roadmapa aplikacji v2','Research technologiczny','Backlog funkcji','Analiza danych'] }
          ],
          ['Oficjalny, publiczny start platformy','Pierwsi płatni użytkownicy i klienci księgowości','Pierwsza transza obligacji sprzedana','Pierwsze realne projekty rekrutacyjne','Zespół gotowy do pracy nad aplikacją v2 / mobile']),
        mkQ('Q4 2027', 'v1.9', '2027-10', '2027-12', '', [], [])
      ] },
      { id: 'three', title: 'III. v2.0 — v2.9', dateFrom: '2028-01', dateTo: '2028-06', quarters: [
        mkQ('Q1 2028', 'v2.0', '2028-01', '2028-03', '', [], []),
        mkQ('Q2 2028', 'v2.9', '2028-04', '2028-06', '', [], [])
      ] },
      { id: 'four', title: 'IV. v3.0 — v3.9', dateFrom: '2028-07', dateTo: '2028-12', quarters: [
        mkQ('Q3 2028', 'v3.0', '2028-07', '2028-09', '', [], []),
        mkQ('Q4 2028', 'v3.9', '2028-10', '2028-12', '', [], [])
      ] },
      { id: 'five', title: 'V. v4.0 — v4.9', dateFrom: '2029-01', dateTo: '2029-06', quarters: [
        mkQ('Q1 2029', 'v4.0', '2029-01', '2029-03', '', [], []),
        mkQ('Q2 2029', 'v4.9', '2029-04', '2029-06', '', [], [])
      ] }
    ]
  };

  function loadRoadmapConfig() {
    try {
      const raw = localStorage.getItem(ROADMAP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.stages)) return parsed;
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(ROADMAP_DEFAULT_CONFIG));
  }

  function persistRoadmapConfig() {
    try { localStorage.setItem(ROADMAP_STORAGE_KEY, JSON.stringify(roadmapConfig)); } catch (e) {}
  }

  let roadmapConfig = loadRoadmapConfig();
  let currentRoadmapStageId = 'mvp1';

  function renderQuarterCardHTML(q) {
    const dateLabel = formatMonthRangePL(q.dateFrom, q.dateTo);
    const hasContent = q.celEtapu || (q.praca && q.praca.length) || (q.efektKoncowy && q.efektKoncowy.length);
    let body = '';
    if (q.celEtapu) {
      body += '<div class="detail-block" style="margin-bottom: 12px; padding: 8px 10px; background: rgba(110,139,168,.08); border-left: 2px solid rgba(110,139,168,.4); border-radius: 4px;">' +
        '<strong style="color:#9fb3c8; font-size:11px; font-weight:800; letter-spacing:0.04em; display:block; margin-bottom:4px;">CEL ETAPU</strong>' +
        '<p style="margin:0; font-size:11px; color:#d4dde6;">' + escapeHtml(q.celEtapu) + '</p>' +
      '</div>';
    }
    (q.praca || []).forEach(cat => {
      body += '<div class="detail-block" style="margin-bottom: 12px;">' +
        '<strong style="color: #2DD4BF; display: block; margin-bottom: 6px; font-size: 12px; font-weight: 800; letter-spacing: 0.04em;">' + escapeHtml(cat.category.toUpperCase()) + '</strong>' +
        '<div style="margin-left: 12px;"><ul style="margin: 4px 0 0; padding-left: 16px; list-style: disc;">' +
          (cat.tasks || []).map(t => '<li>' + escapeHtml(t) + '</li>').join('') +
        '</ul></div>' +
      '</div>';
    });
    if (q.efektKoncowy && q.efektKoncowy.length) {
      body += '<div class="detail-block" style="margin-bottom: 12px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,.10);">' +
        '<strong style="color: #C084FC; display: block; margin-bottom: 6px; font-size: 12px; font-weight: 800; letter-spacing: 0.04em;">EFEKT KOŃCOWY</strong>' +
        '<ul style="margin: 4px 0 0; padding-left: 16px; list-style: disc;">' + q.efektKoncowy.map(t => '<li>' + escapeHtml(t) + '</li>').join('') + '</ul>' +
      '</div>';
    }
    if (!hasContent) {
      body += '<div style="color: #97a4b2; font-style: italic; margin-bottom: 12px;">(do uzupełnienia)</div>';
    }
    const inQ = people.filter(p => p.quarter === q.id);
    body += '<div class="team-section" style="padding-top: 8px; border-top: 1px solid rgba(255,255,255,.10);">' +
      '<strong class="zespol-heading">ZESPÓŁ &amp; REKRUTACJA</strong>' +
      '<div class="team-map">' + (inQ.length
        ? inQ.map(p => '<div class="person-chip" data-person-id="' + escapeHtml(p.id) + '"><span>+</span> ' + escapeHtml(p.role) + '</div>').join('')
        : '<span class="org-team-scope-empty">Brak przypisanych osób.</span>') + '</div>' +
    '</div>';

    return '<article class="roadmap-q-card" data-roadmap-q="' + q.id + '">' +
      '<strong>' + escapeHtml(q.label) + ' — ' + q.id + '</strong>' +
      '<span>' + dateLabel + '</span>' +
      '<div style="margin-top: 10px; font-size: 12px; color: #d4dde6; line-height: 1.5;">' + body + '</div>' +
    '</article>';
  }

  function renderRoadmap(config) {
    const timelineTable = document.querySelector('.roadmap-q-table');
    const detailsContainer = document.querySelector('.roadmap-details');
    if (!timelineTable || !detailsContainer) return;

    const theadRow = '<th class="version-col">Etap / wersja</th>' + ALL_QUARTERS.map(q => '<th>' + q + '</th>').join('');
    const stageRows = config.stages.map(stage => {
      const cells = ALL_QUARTERS.map(qid => {
        const q = stage.quarters.find(x => x.id === qid);
        if (!q) return '<td class="q-cell empty">—</td>';
        return '<td class="q-cell"><button class="q-pill stage-' + stage.id + '" type="button" data-roadmap-stage="' + stage.id + '" data-roadmap-q="' + q.id + '" aria-label="Pokaż szczegóły ' + q.id + ' ' + escapeHtml(q.label) + '"><span class="q-label">' + escapeHtml(q.label) + '</span><span class="q-note">' + q.id + '</span></button></td>';
      }).join('');
      const rangeLabel = stage.quarters[0].label + ' → ' + stage.quarters[stage.quarters.length - 1].label;
      return '<tr><td class="version-col"><button class="stage-btn stage-' + stage.id + '" type="button" data-roadmap-stage="' + stage.id + '" aria-label="Pokaż szczegóły etapu ' + escapeHtml(rangeLabel) + '"><span>' + escapeHtml(rangeLabel) + '</span><i class="stage-dot" aria-hidden="true"></i></button></td>' + cells + '</tr>';
    }).join('');
    timelineTable.innerHTML = '<thead><tr>' + theadRow + '</tr></thead><tbody>' + stageRows + '</tbody>';

    detailsContainer.innerHTML = config.stages.map(stage => {
      const cardsHTML = stage.quarters.map(renderQuarterCardHTML).join('');
      const metaLabel = stage.quarters[0].id + ' – ' + stage.quarters[stage.quarters.length - 1].id;
      return '<section class="roadmap-detail stage-' + stage.id + '" data-roadmap-detail="' + stage.id + '">' +
        '<div class="roadmap-detail-head"><h2 class="roadmap-detail-title">' + escapeHtml(stage.title) + '</h2><span class="roadmap-detail-meta">' + metaLabel + '</span></div>' +
        '<div class="roadmap-q-details">' + cardsHTML + '</div>' +
      '</section>';
    }).join('');
  }

  renderRoadmap(roadmapConfig);

  // ====================================================================
  // Nawigacja Road Mapy (działa na DOM-ie wygenerowanym przez renderRoadmap)
  // ====================================================================
  let roadmapTimelineButtons = Array.from(document.querySelectorAll('.stage-btn[data-roadmap-stage]'));
  let roadmapQButtons = Array.from(document.querySelectorAll('.q-pill[data-roadmap-stage]'));
  let roadmapDetails = Array.from(document.querySelectorAll('[data-roadmap-detail]'));

  function rebindRoadmapNav() {
    roadmapTimelineButtons = Array.from(document.querySelectorAll('.stage-btn[data-roadmap-stage]'));
    roadmapQButtons = Array.from(document.querySelectorAll('.q-pill[data-roadmap-stage]'));
    roadmapDetails = Array.from(document.querySelectorAll('[data-roadmap-detail]'));
    roadmapTimelineButtons.forEach(btn => btn.addEventListener('click', () => showRoadmapStage(btn.dataset.roadmapStage)));
    roadmapQButtons.forEach(btn => btn.addEventListener('click', () => showQuarter(btn.dataset.roadmapQ)));
  }

  function showRoadmapStage(stageId) {
    currentRoadmapStageId = stageId;
    roadmapDetails.forEach(panel => {
      const isActive = panel.dataset.roadmapDetail === stageId;
      panel.classList.toggle('active', isActive);
      panel.classList.remove('detail-mode');
      panel.querySelectorAll('.roadmap-q-card').forEach(card => {
        card.style.display = 'none';
      });
    });
    roadmapTimelineButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.roadmapStage === stageId));
    roadmapQButtons.forEach(btn => btn.classList.remove('active'));
  }

  function showQuarter(quarter) {
    let activeStage = null;
    roadmapDetails.forEach(panel => {
      const cards = Array.from(panel.querySelectorAll('.roadmap-q-card'));
      const hasQuarter = cards.some(card => card.dataset.roadmapQ === quarter);
      panel.classList.toggle('active', hasQuarter);
      panel.classList.toggle('detail-mode', hasQuarter);
      if (hasQuarter) activeStage = panel.dataset.roadmapDetail;
      cards.forEach(card => {
        if (card.dataset.roadmapQ === quarter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
    if (activeStage) currentRoadmapStageId = activeStage;
    roadmapQButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.roadmapQ === quarter));
    roadmapTimelineButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.roadmapStage === activeStage));
  }

  rebindRoadmapNav();
  // Delegacja: kliknięcie wersji w podsumowaniu otwiera szczegóły danego kwartału
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-go-q]');
    if (link) { e.preventDefault(); showQuarter(link.dataset.goQ); }
  });

  // ====================================================================
  // Podsumowania etapów — czytane prosto z roadmapConfig, bez skanowania DOM
  // ====================================================================
  function buildStageSummary(stage) {
    const hasAny = stage.quarters.some(q => q.celEtapu || (q.praca && q.praca.length) || (q.efektKoncowy && q.efektKoncowy.length));
    if (!hasAny) return null;
    const stageCls = 'stage-' + stage.id;

    function sec(cls, title, body) {
      return '<div class="summary-col-sec"><div class="sc-title ' + cls + '">' + title + '</div>' + body + '</div>';
    }

    const cols = stage.quarters.map(q => {
      const inQ = people.filter(p => p.quarter === q.id);
      return '<div class="summary-col ' + stageCls + '">' +
        '<button type="button" class="summary-col-head" data-go-q="' + q.id + '"><b>' + escapeHtml(q.label) + '</b><span>' + q.id + '</span></button>' +
        sec('praca', 'PRACA', '<div class="summary-chips">' + (q.praca || []).map(w => '<span>' + escapeHtml(w.category) + '</span>').join('') + '</div>') +
        sec('efekt', 'EFEKT KOŃCOWY', '<ul class="summary-list">' + (q.efektKoncowy || []).map(e => '<li>' + escapeHtml(e) + '</li>').join('') + '</ul>') +
        sec('zespol', 'ZESPÓŁ &amp; REKRUTACJA', '<div class="summary-chips team">' + inQ.map(p => '<span>+ ' + escapeHtml(p.role) + '</span>').join('') + '</div>') +
        '<button type="button" class="summary-col-cta" data-go-q="' + q.id + '">Zobacz pełne szczegóły →</button>' +
      '</div>';
    }).join('');

    const wrap = document.createElement('div');
    wrap.className = 'roadmap-summary';
    wrap.innerHTML = '<p class="summary-intro">Etap podzielony na ' + stage.quarters.length + ' ' + (stage.quarters.length === 1 ? 'kwartał' : 'kwartały') +
      ' — każdy w osobnej kolumnie. Kliknij nagłówek kwartału, aby otworzyć jego pełne szczegóły.</p>' +
      '<div class="summary-cols-wrap"><div class="summary-cols" style="grid-template-columns:repeat(' + stage.quarters.length + ', minmax(230px, 1fr))">' + cols + '</div></div>';
    return wrap;
  }

  function rebuildStageSummaries() {
    roadmapDetails.forEach(panel => {
      panel.querySelectorAll(':scope > .roadmap-summary, :scope > .q-back').forEach(el => el.remove());
      const head = panel.querySelector('.roadmap-detail-head');
      const stage = roadmapConfig.stages.find(s => s.id === panel.dataset.roadmapDetail);
      const summary = stage ? buildStageSummary(stage) : null;
      if (summary) {
        head.insertAdjacentElement('afterend', summary);
      } else {
        const ph = document.createElement('p');
        ph.className = 'roadmap-summary summary-empty';
        ph.textContent = 'Szczegóły tego etapu są w przygotowaniu.';
        head.insertAdjacentElement('afterend', ph);
      }
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'q-back';
      back.textContent = '← Wróć do podsumowania etapu';
      back.addEventListener('click', () => showRoadmapStage(panel.dataset.roadmapDetail));
      const qDetails = panel.querySelector('.roadmap-q-details');
      qDetails.parentNode.insertBefore(back, qDetails);
    });
  }

  rebuildStageSummaries();

  showRoadmapStage('mvp1');

  // Organizacja — interaktywny schemat organizacyjny + filtry etap/kwartał/rok
  (function initOrgChart(){
    const teamScopeEl = document.getElementById('orgTeamScope');
    const recruitedScopeEl = document.getElementById('orgRecruitedScope');
    if (!teamScopeEl || !recruitedScopeEl) return;
    const statusEl = document.getElementById('orgFilterStatus');
    const allBtn = document.querySelector('.org-all-btn');
    const stageBtns = Array.from(document.querySelectorAll('.org-stage-btn'));
    const qBtns = Array.from(document.querySelectorAll('.org-q-btn'));
    const yearBtns = Array.from(document.querySelectorAll('.org-year-btn'));
    const deptAllBtn = document.getElementById('orgDeptAllBtn');
    const deptBtns = Array.from(document.querySelectorAll('.org-dept-btn[data-org-dept]'));

    const ORG_QUARTERS = ALL_QUARTERS;
    const ORG_STAGE_LAST_Q = { mvp1:'Q2 2027', two:'Q4 2027', three:'Q2 2028', four:'Q4 2028', five:'Q2 2029' };
    const ORG_YEAR_LAST_Q = { '2026':'Q4 2026', '2027':'Q4 2027', '2028':'Q4 2028', '2029':'Q2 2029' };
    const ORG_STAGE_ORDER = ['mvp1','two','three','four','five'];
    const ORG_YEAR_FIRST_Q = { '2026':'Q3 2026', '2027':'Q1 2027', '2028':'Q1 2028', '2029':'Q1 2029' };

    function stageStartIndex(stage) {
      const pos = ORG_STAGE_ORDER.indexOf(stage);
      if (pos <= 0) return 0;
      return ORG_QUARTERS.indexOf(ORG_STAGE_LAST_Q[ORG_STAGE_ORDER[pos - 1]]) + 1;
    }

    function renderRoleCard(p) {
      const parentP = p.parentId ? personById(p.parentId) : null;
      return '<div class="org-role-card" data-person-id="' + escapeHtml(p.id) + '">' +
        '<div class="org-role-card-head"><b>' + escapeHtml(p.role) + '</b>' +
          (parentP ? '<span class="org-role-card-parent">↳ podlega: ' + escapeHtml(parentP.role) + '</span>' : '') +
        '</div>' +
        '<div class="org-role-card-meta">' +
          '<span class="org-badge org-badge-collab">' + escapeHtml(p.collab) + '</span>' +
          '<span class="org-badge org-badge-cost">koszt: ' + escapeHtml(p.costType) + '</span>' +
        '</div>' +
        '<table class="org-role-pay"><thead><tr><th></th><th>1 msc</th><th>3 msc</th><th>12 msc</th></tr></thead><tbody>' +
          '<tr><td>Netto</td><td>' + fmtPln(p.pay.m1.netto) + '</td><td>' + fmtPln(p.pay.m3.netto) + '</td><td>' + fmtPln(p.pay.m12.netto) + '</td></tr>' +
          '<tr><td>Brutto</td><td>' + fmtPln(p.pay.m1.brutto) + '</td><td>' + fmtPln(p.pay.m3.brutto) + '</td><td>' + fmtPln(p.pay.m12.brutto) + '</td></tr>' +
          '<tr><td>Koszt pracodawcy</td><td>' + fmtPln(p.pay.m1.employerCost) + '</td><td>' + fmtPln(p.pay.m3.employerCost) + '</td><td>' + fmtPln(p.pay.m12.employerCost) + '</td></tr>' +
        '</tbody></table>' +
        (p.desc ? '<p class="org-role-card-desc">' + escapeHtml(p.desc) + '</p>' : '') +
        '<button type="button" class="org-role-card-more" data-person-id="' + escapeHtml(p.id) + '">Zobacz pełne szczegóły →</button>' +
      '</div>';
    }

    let cutoffIndex = ORG_QUARTERS.length - 1;
    let startIndex = 0;
    let filterMode = 'all';
    let filterValue = null;
    let deptFilter = null;

    function setRange(mode, value, end, start) {
      filterMode = mode;
      filterValue = value;
      cutoffIndex = end;
      startIndex = start;
      applyFilter();
    }

    function renderScope(containerEl, fromIdx, toIdx) {
      const parts = [];
      DEPARTMENTS_FIXED.forEach(deptName => {
        if (deptFilter && deptName !== deptFilter) return;
        const windowPeople = people.filter(p => {
          if (p.dept !== deptName) return false;
          const idx = ORG_QUARTERS.indexOf(p.quarter);
          return idx >= fromIdx && idx <= toIdx;
        });
        if (windowPeople.length) {
          parts.push('<div class="org-dept-block"><h4 class="org-dept-block-title">' + escapeHtml(deptName) + '</h4><div class="org-role-cards">' + windowPeople.map(renderRoleCard).join('') + '</div></div>');
        }
      });
      containerEl.innerHTML = parts.length ? parts.join('') : '<span class="org-team-scope-empty">Brak obsadzonych ról w wybranym widoku.</span>';
    }

    function applyFilter() {
      [allBtn, ...stageBtns, ...qBtns, ...yearBtns].forEach(btn => btn && btn.classList.remove('active'));
      if (filterMode === 'all') {
        allBtn.classList.add('active');
        statusEl.innerHTML = 'Widok: <b>cała struktura</b>';
      } else if (filterMode === 'stage') {
        const btn = stageBtns.find(b => b.dataset.orgStage === filterValue);
        if (btn) btn.classList.add('active');
        statusEl.innerHTML = 'Widok: <b>etap ' + (btn ? btn.textContent.trim() : filterValue) + '</b> — stan struktury do ' + ORG_STAGE_LAST_Q[filterValue];
      } else if (filterMode === 'quarter') {
        const btn = qBtns.find(b => b.dataset.orgQ === filterValue);
        if (btn) btn.classList.add('active');
        statusEl.innerHTML = 'Widok: <b>' + filterValue + '</b> — stan struktury narastająco do tego kwartału';
      } else if (filterMode === 'year') {
        const btn = yearBtns.find(b => b.dataset.orgYear === filterValue);
        if (btn) btn.classList.add('active');
        statusEl.innerHTML = 'Widok: <b>' + filterValue + '</b> — stan struktury narastająco do ' + ORG_YEAR_LAST_Q[filterValue];
      }

      renderScope(teamScopeEl, 0, cutoffIndex);
      renderScope(recruitedScopeEl, startIndex, cutoffIndex);
    }

    allBtn.addEventListener('click', () => setRange('all', null, ORG_QUARTERS.length - 1, 0));
    stageBtns.forEach(btn => btn.addEventListener('click', () => {
      const stage = btn.dataset.orgStage;
      setRange('stage', stage, ORG_QUARTERS.indexOf(ORG_STAGE_LAST_Q[stage]), stageStartIndex(stage));
    }));
    qBtns.forEach(btn => btn.addEventListener('click', () => {
      const q = btn.dataset.orgQ;
      const idx = ORG_QUARTERS.indexOf(q);
      setRange('quarter', q, idx, idx);
    }));
    yearBtns.forEach(btn => btn.addEventListener('click', () => {
      const year = btn.dataset.orgYear;
      setRange('year', year, ORG_QUARTERS.indexOf(ORG_YEAR_LAST_Q[year]), ORG_QUARTERS.indexOf(ORG_YEAR_FIRST_Q[year]));
    }));

    if (deptAllBtn) {
      deptAllBtn.addEventListener('click', () => {
        deptFilter = null;
        [deptAllBtn, ...deptBtns].forEach(b => b.classList.remove('active'));
        deptAllBtn.classList.add('active');
        applyFilter();
      });
    }
    deptBtns.forEach(btn => btn.addEventListener('click', () => {
      deptFilter = btn.dataset.orgDept;
      [deptAllBtn, ...deptBtns].forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    }));

    applyFilter();
    refreshOrgView = applyFilter;

    // --- Sekcja w Ustawieniach: tylko odczyt (osoby dodaje się/edytuje w Road Mapie) ---
    const orgDeptSelect = document.getElementById('orgDeptSelect');
    const orgRoleList = document.getElementById('orgRoleList');
    const orgGoToRoadmapBtn = document.getElementById('orgGoToRoadmapBtn');

    if (orgDeptSelect && orgRoleList) {
      function refreshDeptSelect() {
        orgDeptSelect.innerHTML = DEPARTMENTS_FIXED.map(d => '<option>' + d + '</option>').join('');
      }

      function refreshRoleList() {
        const deptName = orgDeptSelect.value;
        const rows = people.filter(p => p.dept === deptName);
        if (!rows.length) {
          orgRoleList.innerHTML = '<p class="org-team-scope-empty">Ten dział nie ma jeszcze żadnych osób.</p>';
          return;
        }
        orgRoleList.innerHTML = rows.map(p => {
          const parentP = p.parentId ? personById(p.parentId) : null;
          return '<div class="org-role-row" data-person-id="' + escapeHtml(p.id) + '">' +
            '<span><b>' + escapeHtml(p.role) + '</b></span>' +
            '<span class="org-role-meta">' + escapeHtml(p.quarter) + (parentP ? ' · podlega: ' + escapeHtml(parentP.role) : '') + '</span>' +
          '</div>';
        }).join('');
      }

      refreshDeptSelect();
      refreshRoleList();
      orgDeptSelect.addEventListener('change', refreshRoleList);
      refreshOrgEditorList = refreshRoleList;
    }

    if (orgGoToRoadmapBtn) {
      orgGoToRoadmapBtn.addEventListener('click', () => {
        showView('settings');
        const target = document.getElementById('rmPersonForm');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const roleInput = document.getElementById('rmPersonRole');
          if (roleInput) roleInput.focus();
        }
      });
    }
  })();

  (function initLabelsEditor(){
    const fieldsEl = document.getElementById('labelsEditorFields');
    if (!fieldsEl) return;
    const STORAGE_KEY = 'goShoreLabels_v1';
    const saveBtn = document.getElementById('labelsSaveBtn');
    const reportBtn = document.getElementById('labelsReportBtn');
    const resetBtn = document.getElementById('labelsResetBtn');
    const statusEl = document.getElementById('labelsEditStatus');
    const reportEl = document.getElementById('labelsReport');

    const ORG_Q_LIST = ['Q3 2026','Q4 2026','Q1 2027','Q2 2027','Q3 2027','Q4 2027','Q1 2028','Q2 2028','Q3 2028','Q4 2028','Q1 2029','Q2 2029'];
    const STAGE_LIST = [
      ['mvp1', 'etap 1 (MVP)'],
      ['two', 'etap 2'],
      ['three', 'etap 3'],
      ['four', 'etap 4'],
      ['five', 'etap 5']
    ];
    const TAB_LIST = [
      ['business-plan', 'Biznes Plan'],
      ['presentation', 'Prezentacja'],
      ['roadmap', 'Road Mapa'],
      ['organization', 'Organizacja'],
      ['settings', 'Ustawienia witryny']
    ];

    function entry(key, group, label, getEl, kind, attr) {
      return { key, group, label, getEl, kind: kind || 'text', attr: attr || null };
    }

    const REGISTRY = [];

    REGISTRY.push(entry('page-title', 'Globalne', 'Tytuł karty przeglądarki', () => null, 'title'));
    REGISTRY.push(entry('appbar-aria', 'Globalne', 'Etykieta dostępności belki nawigacji', () => document.querySelector('.top-appbar'), 'attr', 'aria-label'));
    TAB_LIST.forEach(([id, name]) => {
      REGISTRY.push(entry('tab-' + id, 'Globalne', 'Nazwa zakładki: ' + name, () => document.querySelector('.view-btn[data-view="' + id + '"]')));
    });

    REGISTRY.push(entry('rm-hero-title', 'Road Mapa', 'Nagłówek Road Mapy', () => document.getElementById('rmHeroTitle')));
    REGISTRY.push(entry('rm-hero-desc', 'Road Mapa', 'Opis pod nagłówkiem Road Mapy', () => document.getElementById('rmHeroDesc')));
    STAGE_LIST.forEach(([id, name]) => {
      REGISTRY.push(entry('rm-stage-' + id, 'Road Mapa', 'Etykieta w tabeli: ' + name, () => document.querySelector('.stage-btn[data-roadmap-stage="' + id + '"] > span:first-child')));
    });
    ORG_Q_LIST.forEach((q, i) => {
      REGISTRY.push(entry('rm-th-' + i, 'Road Mapa', 'Nagłówek kolumny kwartału: ' + q, () => document.querySelector('.roadmap-q-table thead th:nth-child(' + (i + 2) + ')')));
    });

    REGISTRY.push(entry('org-heading', 'Organizacja', 'Nagłówek strony Organizacja', () => document.getElementById('orgPageHeading')));
    REGISTRY.push(entry('org-intro', 'Organizacja', 'Opis pod nagłówkiem Organizacji', () => document.getElementById('orgIntroText')));
    REGISTRY.push(entry('org-col-team', 'Organizacja', 'Nagłówek kolumny: Zespół', () => document.getElementById('orgTeamColHeading')));
    REGISTRY.push(entry('org-col-recruited', 'Organizacja', 'Nagłówek kolumny: Zrekrutowani', () => document.getElementById('orgRecruitedColHeading')));
    REGISTRY.push(entry('org-filter-all', 'Organizacja', 'Etykieta filtra: ALL', () => document.querySelector('.org-all-btn')));
    STAGE_LIST.forEach(([id, name]) => {
      REGISTRY.push(entry('org-stage-' + id, 'Organizacja', 'Etykieta filtra etapu: ' + name, () => document.querySelector('.org-stage-btn[data-org-stage="' + id + '"] .org-filter-label')));
    });
    ORG_Q_LIST.forEach(q => {
      REGISTRY.push(entry('org-q-' + q, 'Organizacja', 'Etykieta filtra kwartału: ' + q, () => document.querySelector('.org-q-btn[data-org-q="' + q + '"] .org-filter-label')));
    });
    ['2026', '2027', '2028', '2029'].forEach(year => {
      REGISTRY.push(entry('org-year-' + year, 'Organizacja', 'Etykieta filtra roku: ' + year, () => document.querySelector('.org-year-btn[data-org-year="' + year + '"]')));
    });

    function readValue(item) {
      if (item.kind === 'title') return document.title;
      const el = item.getEl();
      if (!el) return null;
      if (item.kind === 'attr') return el.getAttribute(item.attr) || '';
      return el.textContent;
    }

    function writeValue(item, value) {
      if (item.kind === 'title') { document.title = value; return; }
      const el = item.getEl();
      if (!el) return;
      if (item.kind === 'attr') { el.setAttribute(item.attr, value); return; }
      el.textContent = value;
    }

    const ORIGINAL_LABELS = {};
    REGISTRY.forEach(item => { ORIGINAL_LABELS[item.key] = readValue(item); });

    let savedLabels = null;
    try { savedLabels = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { savedLabels = null; }
    if (savedLabels) {
      REGISTRY.forEach(item => {
        if (Object.prototype.hasOwnProperty.call(savedLabels, item.key) && ORIGINAL_LABELS[item.key] != null) {
          writeValue(item, savedLabels[item.key]);
        }
      });
    }

    function renderFields() {
      const groups = {};
      REGISTRY.forEach(item => {
        if (ORIGINAL_LABELS[item.key] == null) return;
        (groups[item.group] = groups[item.group] || []).push(item);
      });
      fieldsEl.innerHTML = Object.keys(groups).map(group => (
        '<div class="labels-group"><h3>' + group + '</h3>' +
        groups[group].map(item => (
          '<label><span>' + item.label + '</span><input type="text" data-label-key="' + item.key + '" /></label>'
        )).join('') +
        '</div>'
      )).join('');
      fieldsEl.querySelectorAll('input[data-label-key]').forEach(input => {
        const item = REGISTRY.find(r => r.key === input.dataset.labelKey);
        input.value = readValue(item) || '';
      });
    }

    renderFields();

    saveBtn.addEventListener('click', () => {
      const map = {};
      fieldsEl.querySelectorAll('input[data-label-key]').forEach(input => {
        const item = REGISTRY.find(r => r.key === input.dataset.labelKey);
        if (!item) return;
        map[item.key] = input.value;
        writeValue(item, input.value);
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
      statusEl.textContent = 'Zapisano wszystkie etykiety do podglądu lokalnego.';
    });

    reportBtn.addEventListener('click', () => {
      const lines = ['ETYKIETY I NAGŁÓWKI — lista zmian względem opublikowanej wersji:', ''];
      fieldsEl.querySelectorAll('input[data-label-key]').forEach(input => {
        const item = REGISTRY.find(r => r.key === input.dataset.labelKey);
        if (!item) return;
        const orig = ORIGINAL_LABELS[item.key];
        if (input.value !== orig) {
          lines.push(item.label + ': "' + orig + '" → "' + input.value + '"');
        }
      });
      reportEl.value = lines.length > 2 ? lines.join('\n') : 'Brak zmian względem opublikowanej wersji.';
      statusEl.textContent = 'Wygenerowano raport zmian etykiet — skopiuj treść poniżej.';
    });

    resetBtn.addEventListener('click', () => {
      if (!confirm('Przywrócić opublikowaną wersję wszystkich etykiet? Lokalne zmiany zostaną utracone.')) return;
      localStorage.removeItem(STORAGE_KEY);
      REGISTRY.forEach(item => {
        if (ORIGINAL_LABELS[item.key] != null) writeValue(item, ORIGINAL_LABELS[item.key]);
      });
      renderFields();
      reportEl.value = '';
      statusEl.textContent = 'Przywrócono opublikowaną wersję wszystkich etykiet.';
    });
  })();

  (function initBaseValues(){
    const BV_STORAGE_KEY = 'goShoreBaseValues_v1';
    const BV_DEFAULT_ITEMS = [
      { cat: 'biuro', name: 'Biuro nr 2 — Gdańsk, Wrzeszcz, Aleja Grunwaldzka', detail: 'czynsz + opłaty eksploatacyjne, 80,35 m²; gratka.pl/nieruchomosci/biuro-gdansk-wrzeszcz-aleja-grunwaldzka/ob/47766797/photo', netto: 7832, brutto: 9633.36 },
      { cat: 'wynagrodzenie', name: 'CEO', detail: 'B2B', netto: 8000, brutto: 9840 },
      { cat: 'wynagrodzenie', name: 'Starszy Programista Full Stack', detail: 'B2B', netto: 19000, brutto: 23370 },
      { cat: 'wynagrodzenie', name: 'Junior Front-end programmer', detail: 'Zlecenie (student <26 r.ż.)', netto: 7000, brutto: 7000 },
      { cat: 'wynagrodzenie', name: 'Junior Back-end programmer', detail: 'Zlecenie (student <26 r.ż.)', netto: 7000, brutto: 7000 },
      { cat: 'wynagrodzenie', name: 'UI/UX Designer', detail: 'B2B', netto: 7000, brutto: 8610 },
      { cat: 'wynagrodzenie', name: 'Researcher', detail: 'Zlecenie (student <26 r.ż.)', netto: 6500, brutto: 6500 },
      { cat: 'wynagrodzenie', name: 'KAM', detail: 'B2B', netto: 6500, brutto: 7995 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. Marketingu i Social Mediów', detail: 'B2B', netto: 6500, brutto: 7995 },
      { cat: 'wynagrodzenie', name: 'Główna Księgowa', detail: 'Zlecenie 6 msc → UoP', netto: 8000, brutto: 10660 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. Obsługi Klienta', detail: 'Zlecenie (student <26 r.ż.)', netto: 5000, brutto: 5000 },
      { cat: 'wynagrodzenie', name: 'Software Architect', detail: 'B2B', netto: 17000, brutto: 20910 },
      { cat: 'wynagrodzenie', name: 'Młodsza Księgowa', detail: 'Zlecenie 6 msc → UoP', netto: 5000, brutto: 6506 },
      { cat: 'wynagrodzenie', name: 'Przedstawiciel Handlowy', detail: 'B2B', netto: 5500, brutto: 6765 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. Administracji i Dokumentacji', detail: 'Zlecenie student 6 msc → UoP', netto: 4500, brutto: 4500 },
      { cat: 'wynagrodzenie', name: 'Średni Programista mobile (Android/iOS)', detail: 'B2B', netto: 17000, brutto: 20910 },
      { cat: 'wynagrodzenie', name: 'Junior Programista mobile (Android/iOS)', detail: 'B2B', netto: 7000, brutto: 8610 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. HR i rekrutacji', detail: 'Zlecenie 6 msc → UoP', netto: 5500, brutto: 7198 },
      { cat: 'wynagrodzenie', name: 'Senior programista AI', detail: 'B2B', netto: 22500, brutto: 27675 },
      { cat: 'wynagrodzenie', name: 'Junior programista AI', detail: 'B2B', netto: 12500, brutto: 15375 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. treści i autor treści', detail: 'Zlecenie (student <26 r.ż.)', netto: 5000, brutto: 5000 },
      { cat: 'wynagrodzenie', name: 'Specjalista SEO', detail: 'Zlecenie standard 12 msc → UoP', netto: 7000, brutto: 9275 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. automatyzacji marketingu', detail: 'B2B', netto: 8500, brutto: 10455 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. Kadr, Płac i Rozliczeń', detail: 'Zlecenie 6 msc → UoP', netto: 6500, brutto: 8583 },
      { cat: 'wynagrodzenie', name: 'Sprzątanie i czyste biuro (1/3 etatu, 50h/msc)', detail: 'Zlecenie standard', netto: 2000, brutto: 2477 },
      { cat: 'wynagrodzenie', name: 'Przedstawiciel Handlowy (drugi etat)', detail: 'B2B, rekrutacja Q2 2027', netto: 5500, brutto: 6765 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. Obsługi Klienta (drugi etat)', detail: 'Zlecenie (student <26 r.ż.), rekrutacja Q2 2027', netto: 5000, brutto: 5000 },
      { cat: 'wynagrodzenie', name: 'Specjalista ds. Marketingu i Social Mediów (drugi etat)', detail: 'B2B, rekrutacja Q3 2027', netto: 6500, brutto: 7995 },
      { cat: 'sprzet', name: 'Grupa A — CEO, programiści, UI/UX, Researcher', detail: 'MacBook Pro 14” M5 Pro + iPhone 17 (leasing), 11 osób', netto: 403.75, brutto: null },
      { cat: 'sprzet', name: 'Grupa B — pozostali pracownicy', detail: 'MacBook Air 13” M5 + iPhone 16e (leasing), 13 osób', netto: 202.90, brutto: null },
      { cat: 'sprzet', name: 'Wspólne — wszyscy pracownicy', detail: 'EIZO FlexScan 34,1” + AirPods Pro 3 (leasing) + LENNART, TERTIAL, 24 osoby', netto: 189.70, brutto: null },
      { cat: 'sprzet', name: 'Jednorazowo na starcie — udziały własne leasingu (netto, cała firma)', detail: 'wszystkie grupy razem', netto: 34601.84, brutto: null },
      { cat: 'sprzet', name: 'Jednorazowo na starcie — zakupy jednorazowe (brutto, cała firma)', detail: 'akcesoria, fotel, etui, case, szkła, meble, serwer', netto: null, brutto: 69796.70 },
      { cat: 'sprzet', name: 'LENNART — komoda (ikea, na pracownika)', detail: '24 osoby, jednorazowo', netto: null, brutto: 59.99 },
      { cat: 'sprzet', name: 'TERTIAL — lampa biurkowa (ikea, na pracownika)', detail: '24 osoby, jednorazowo', netto: null, brutto: 49.99 },
      { cat: 'sprzet', name: 'Serwer plików QNAP TS-873A-8G (arkanet)', detail: 'wspólne, jednorazowo, 1×', netto: null, brutto: 6364.66 },
      { cat: 'sprzet', name: '2× Apple Mac mini M4 Pro (ideam) — pod model AI', detail: 'zakup warunkowy po starcie prac nad modelem AI; leasing 36 msc, opłata początkowa 609,68 zł, wartość końcowa ok. 60,97 zł', netto: 398.38, brutto: null },
      { cat: 'oprogramowanie', name: 'Microsoft 365 Business Standard', detail: '10,83 EUR netto/msc, wszyscy (24 osoby), kurs EUR/PLN≈4,27', netto: 46.24, brutto: null },
      { cat: 'oprogramowanie', name: 'Business ChatGPT i Codex', detail: 'wszyscy (24 osoby)', netto: 71, brutto: null },
      { cat: 'oprogramowanie', name: 'Claude Zespół Premium', detail: '90 EUR netto/msc, wszyscy (24 osoby), kurs EUR/PLN≈4,27', netto: 384.30, brutto: null },
      { cat: 'oprogramowanie', name: 'Google Workspace Business Plus', detail: 'wszyscy (24 osoby)', netto: 99, brutto: null },
      { cat: 'oprogramowanie', name: 'Perplexity Pro', detail: '34 USD netto/msc, standard (22 osoby), kurs USD/PLN≈3,73', netto: 126.82, brutto: null },
      { cat: 'oprogramowanie', name: 'Perplexity Enterprise Max', detail: '271 USD netto/msc, CEO + Researcher (2 osoby), kurs USD/PLN≈3,73', netto: 1010.83, brutto: null },
      { cat: 'oprogramowanie', name: 'GitHub Enterprise', detail: '21 USD netto/msc/os., CEO + 8 ról programistycznych (9 osób), kurs USD/PLN≈3,73; suma PLN/msc', netto: 704.97, brutto: 867.15 },
      { cat: 'oprogramowanie', name: 'Copilot Enterprise', detail: '39 USD netto/msc/os., CEO + 8 ról programistycznych (9 osób), kurs USD/PLN≈3,73; suma PLN/msc', netto: 1309.23, brutto: 1610.37 },
      { cat: 'oprogramowanie', name: 'Apple Business — 2 TB', detail: '9,99 USD netto/msc/os., wszyscy (24 osoby), kurs USD/PLN≈3,73; suma PLN/msc', netto: 894.24, brutto: 1099.92 },
      { cat: 'oprogramowanie', name: 'Jira Premium', detail: '14,54 USD netto/msc/os., wszyscy (24 osoby), kurs USD/PLN≈3,73; suma PLN/msc', netto: 1301.52, brutto: 1600.80 },
      { cat: 'oprogramowanie', name: 'Slack Pro', detail: '7,25 USD netto/msc/os., wszyscy aktywni (24 osoby), kurs USD/PLN≈3,73; suma PLN/msc', netto: 648.96, brutto: 798.24 },
      { cat: 'oprogramowanie', name: 'Bitwarden Business Teams', detail: '4,00 USD netto/msc/os., wszyscy (24 osoby), kurs USD/PLN≈3,73; suma PLN/msc', netto: 358.08, brutto: 440.40 },
      { cat: 'oprogramowanie', name: 'Figma Professional Full Seat', detail: '16,00 USD netto/msc, UI/UX Designer (1 osoba), kurs USD/PLN≈3,73', netto: 59.68, brutto: 73.41 },
      { cat: 'oprogramowanie', name: 'Canva Business (alternatywa do Canva Enterprise — wycena indywidualna)', detail: '20,00 USD netto/msc, UI/UX Designer (1 osoba), kurs USD/PLN≈3,73', netto: 74.60, brutto: 91.76 },
      { cat: 'oprogramowanie', name: 'Vercel Pro', detail: '20,00 USD netto/msc, IT (1 konto/deploying seat, płaskie), kurs USD/PLN≈3,73', netto: 74.60, brutto: 91.76 },
      { cat: 'oprogramowanie', name: 'Supabase Team', detail: '599,00 USD netto/msc, IT (1 projekt/organizacja, płaskie), kurs USD/PLN≈3,73', netto: 2234.27, brutto: 2748.15 },
      { cat: 'oprogramowanie', name: 'GetResponse Creator', detail: '51,00 GBP netto/msc, Marketing (1 konto, płaskie), kurs GBP/PLN≈4,92', netto: 250.92, brutto: 308.63 },
    ];

    const catLabels = { biuro: 'Biuro', wynagrodzenie: 'Wynagrodzenie', sprzet: 'Sprzęt', oprogramowanie: 'Programy i dostępy' };
    const form = document.getElementById('bvAddForm');
    const listEl = document.getElementById('bvList');
    const statusEl = document.getElementById('bvStatus');
    const resetBtn = document.getElementById('bvResetBtn');
    if (!form || !listEl) return;

    let items;
    try {
      const raw = localStorage.getItem(BV_STORAGE_KEY);
      items = raw ? JSON.parse(raw) : BV_DEFAULT_ITEMS.slice();
    } catch (e) {
      items = BV_DEFAULT_ITEMS.slice();
    }

    function save() {
      localStorage.setItem(BV_STORAGE_KEY, JSON.stringify(items));
    }

    function fmtZl(n) {
      if (n == null || n === '') return '—';
      return Number(n).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
    }

    function renderList() {
      listEl.innerHTML = '';
      ['biuro', 'wynagrodzenie', 'sprzet', 'oprogramowanie'].forEach(cat => {
        const rows = items.map((it, idx) => ({ it, idx })).filter(x => x.it.cat === cat);
        if (!rows.length) return;
        const wrap = document.createElement('div');
        wrap.className = 'cmpwrap';
        wrap.style.margin = '10px 0 18px';
        const table = document.createElement('table');
        table.className = 'dt';
        table.innerHTML = '<thead><tr><th>' + catLabels[cat] + '</th><th>Szczegóły</th><th>Netto</th><th>Brutto</th><th></th></tr></thead>';
        const tbody = document.createElement('tbody');
        rows.forEach(({ it, idx }) => {
          const tr = document.createElement('tr');
          const tdName = document.createElement('td');
          tdName.className = 'k';
          tdName.textContent = it.name;
          const tdDetail = document.createElement('td');
          tdDetail.textContent = it.detail || '';
          const tdNetto = document.createElement('td');
          tdNetto.textContent = fmtZl(it.netto);
          const tdBrutto = document.createElement('td');
          tdBrutto.textContent = fmtZl(it.brutto);
          const tdDel = document.createElement('td');
          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'org-filter-btn';
          delBtn.textContent = 'Usuń';
          delBtn.addEventListener('click', () => {
            items.splice(idx, 1);
            save();
            renderList();
            statusEl.textContent = 'Usunięto pozycję z bazy wartości.';
          });
          tdDel.appendChild(delBtn);
          tr.append(tdName, tdDetail, tdNetto, tdBrutto, tdDel);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        listEl.appendChild(wrap);
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const cat = document.getElementById('bvCat').value;
      const name = document.getElementById('bvName').value.trim();
      const detail = document.getElementById('bvDetail').value.trim();
      const nettoVal = document.getElementById('bvNetto').value;
      const bruttoVal = document.getElementById('bvBrutto').value;
      if (!name) return;
      items.push({
        cat,
        name,
        detail,
        netto: nettoVal === '' ? null : Number(nettoVal),
        brutto: bruttoVal === '' ? null : Number(bruttoVal),
      });
      save();
      renderList();
      form.reset();
      statusEl.textContent = 'Dodano pozycję do bazy wartości.';
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!confirm('Przywrócić opublikowaną wersję bazy wartości? Lokalne zmiany zostaną utracone.')) return;
        localStorage.removeItem(BV_STORAGE_KEY);
        items = BV_DEFAULT_ITEMS.slice();
        renderList();
        statusEl.textContent = 'Przywrócono opublikowaną bazę wartości.';
      });
    }

    renderList();
  })();

  (function initSiteSettings(){
    const bpContainer = document.querySelector('#business-plan .wrap');
    const editToggleBtn = document.getElementById('settingsEditToggle');
    const saveBtn = document.getElementById('settingsSaveBtn');
    const reportBtn = document.getElementById('settingsReportBtn');
    const resetBtn = document.getElementById('settingsResetBtn');
    const statusEl = document.getElementById('settingsStatus');
    const reportEl = document.getElementById('settingsReport');
    if (!bpContainer || !editToggleBtn) return;

    const STORAGE_KEY = 'goShoreBP_edited_v1';
    const originalHTML = bpContainer.innerHTML;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) { bpContainer.innerHTML = saved; bindTopicPresentButtons(); }

    let editMode = false;

    function setEditMode(on) {
      editMode = on;
      bpContainer.contentEditable = on ? 'true' : 'false';
      document.getElementById('business-plan').classList.toggle('editing-active', on);
      editToggleBtn.textContent = on ? 'Wyłącz edycję Biznes Planu' : 'Włącz edycję Biznes Planu';
      statusEl.textContent = on ? 'Edycja włączona — przejdź na zakładkę „Biznes Plan”, kliknij w tekst, popraw, wróć tu i kliknij „Zapisz”.' : '';
    }

    editToggleBtn.addEventListener('click', () => setEditMode(!editMode));

    saveBtn.addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, bpContainer.innerHTML);
      statusEl.textContent = 'Zapisano do podglądu w tej przeglądarce — ' + new Date().toLocaleString('pl-PL') + '.';
    });

    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      bpContainer.innerHTML = originalHTML;
      bindTopicPresentButtons();
      reportEl.value = '';
      statusEl.textContent = 'Przywrócono opublikowaną wersję Biznes Planu.';
    });

    reportBtn.addEventListener('click', () => {
      const savedNow = localStorage.getItem(STORAGE_KEY);
      if (!savedNow) {
        reportEl.value = 'Nie zapisano jeszcze żadnych zmian.';
        return;
      }
      const origRoot = new DOMParser().parseFromString('<div>' + originalHTML + '</div>', 'text/html').body.firstChild;
      const newRoot = new DOMParser().parseFromString('<div>' + savedNow + '</div>', 'text/html').body.firstChild;
      const origKids = Array.from(origRoot.children);
      const newKids = Array.from(newRoot.children);
      const lines = [];
      const max = Math.max(origKids.length, newKids.length);
      for (let i = 0; i < max; i++) {
        const o = origKids[i] ? origKids[i].textContent.trim() : '';
        const n = newKids[i] ? newKids[i].textContent.trim() : '';
        if (o !== n) {
          lines.push('--- Zmiana #' + (lines.filter(l => l.startsWith('--- Zmiana')).length + 1) + ' ---');
          lines.push('PRZED: ' + (o ? o.slice(0, 300) : '(brak / nowy element)'));
          lines.push('PO: ' + (n || '(usunięto)'));
          lines.push('');
        }
      }
      reportEl.value = lines.length ? lines.join('\n') : 'Brak zmian względem wersji opublikowanej.';
    });

    const ORIGINAL_PRES_TITLES = slideTitles.slice();
    const ORIGINAL_PRES_BODIES = slideBodies.slice();
    const ORIGINAL_PRES_RICH = slideRichBodies.slice();
    let draftTitles = slideTitles.slice();
    let draftBodies = slideBodies.slice();
    let draftRich = slideRichBodies.slice();
    const presListEl = document.getElementById('presEditorList');
    const presAddBtn = document.getElementById('presAddSlideBtn');
    const presSaveBtn = document.getElementById('presSaveBtn');
    const presResetBtn = document.getElementById('presResetBtn');
    const presStatusEl = document.getElementById('presStatus');

    function renderPresEditor() {
      presListEl.innerHTML = '';
      draftTitles.forEach((title, i) => {
        const row = document.createElement('div');
        row.className = 'pres-editor-row';
        row.innerHTML =
          '<span class="pres-num">#' + (i + 1) + '</span>' +
          '<div class="pres-editor-fields">' +
            '<input type="text" value="" placeholder="Tytuł slajdu" />' +
            '<textarea placeholder="Treść slajdu (opcjonalnie) — pojawi się na slajdzie podczas prezentacji."></textarea>' +
          '</div>' +
          '<div class="pres-row-actions">' +
            '<button type="button" data-act="up">↑</button>' +
            '<button type="button" data-act="down">↓</button>' +
            '<button type="button" data-act="del">Usuń</button>' +
          '</div>';
        row.querySelector('input').value = title;
        row.querySelector('textarea').value = draftBodies[i] || '';
        row.querySelector('input').addEventListener('input', e => { draftTitles[i] = e.target.value; });
        row.querySelector('textarea').addEventListener('input', e => { draftBodies[i] = e.target.value; });
        row.querySelector('[data-act="up"]').disabled = i === 0;
        row.querySelector('[data-act="down"]').disabled = i === draftTitles.length - 1;
        row.querySelector('[data-act="up"]').addEventListener('click', () => {
          [draftTitles[i - 1], draftTitles[i]] = [draftTitles[i], draftTitles[i - 1]];
          [draftBodies[i - 1], draftBodies[i]] = [draftBodies[i], draftBodies[i - 1]];
          [draftRich[i - 1], draftRich[i]] = [draftRich[i], draftRich[i - 1]];
          renderPresEditor();
        });
        row.querySelector('[data-act="down"]').addEventListener('click', () => {
          [draftTitles[i + 1], draftTitles[i]] = [draftTitles[i], draftTitles[i + 1]];
          [draftBodies[i + 1], draftBodies[i]] = [draftBodies[i], draftBodies[i + 1]];
          [draftRich[i + 1], draftRich[i]] = [draftRich[i], draftRich[i + 1]];
          renderPresEditor();
        });
        row.querySelector('[data-act="del"]').addEventListener('click', () => {
          draftTitles.splice(i, 1);
          draftBodies.splice(i, 1);
          draftRich.splice(i, 1);
          renderPresEditor();
        });
        presListEl.appendChild(row);
      });
    }

    renderPresEditor();

    presAddBtn.addEventListener('click', () => {
      draftTitles.push('NOWY SLAJD ' + draftTitles.length);
      draftBodies.push('');
      draftRich.push('');
      renderPresEditor();
    });

    presSaveBtn.addEventListener('click', () => {
      localStorage.setItem(PRES_STORAGE_KEY, JSON.stringify({ titles: draftTitles, bodies: draftBodies, richBodies: draftRich }));
      rebuildDeck(draftTitles, draftBodies, draftRich);
      presStatusEl.textContent = 'Zapisano prezentację (' + draftTitles.length + ' slajdów) — ' + new Date().toLocaleString('pl-PL') + '.';
    });

    presResetBtn.addEventListener('click', () => {
      localStorage.removeItem(PRES_STORAGE_KEY);
      draftTitles = ORIGINAL_PRES_TITLES.slice();
      draftBodies = ORIGINAL_PRES_BODIES.slice();
      draftRich = ORIGINAL_PRES_RICH.slice();
      rebuildDeck(draftTitles, draftBodies, draftRich);
      renderPresEditor();
      presStatusEl.textContent = 'Przywrócono opublikowaną wersję prezentacji.';
    });
  })();

  (function initRoadmapEditor(){
    const stageSelect = document.getElementById('rmStageSelect');
    const qSelect = document.getElementById('rmQSelect');
    if (!stageSelect || !qSelect) return;

    const saveBtn = document.getElementById('rmSaveBtn');
    const reportBtn = document.getElementById('rmReportBtn');
    const resetBtn = document.getElementById('rmResetBtn');
    const statusEl = document.getElementById('rmStatus');
    const reportEl = document.getElementById('rmReport');

    const stageDateFrom = document.getElementById('rmStageDateFrom');
    const stageDateTo = document.getElementById('rmStageDateTo');
    const qDateFrom = document.getElementById('rmQDateFrom');
    const qDateTo = document.getElementById('rmQDateTo');

    const qLabelInput = document.getElementById('rmQLabel');
    const celEtapuInput = document.getElementById('rmCelEtapu');
    const pracaListEl = document.getElementById('rmPracaList');
    const addPracaCatBtn = document.getElementById('rmAddPracaCatBtn');
    const efektInput = document.getElementById('rmEfektKoncowy');
    const contentSaveBtn = document.getElementById('rmContentSaveBtn');

    function findStage(stageId) { return roadmapConfig.stages.find(s => s.id === stageId); }
    function findQuarter(stageId, qId) {
      const stage = findStage(stageId);
      return stage ? stage.quarters.find(q => q.id === qId) : null;
    }

    function refreshStageOptions() {
      stageSelect.innerHTML = roadmapConfig.stages.map(s => '<option value="' + s.id + '">' + escapeHtml(s.title) + '</option>').join('');
      refreshQOptions();
    }

    function refreshQOptions() {
      const stage = findStage(stageSelect.value);
      qSelect.innerHTML = stage ? stage.quarters.map(q => '<option value="' + q.id + '">' + q.id + ' — ' + escapeHtml(q.label) + '</option>').join('') : '';
      loadSelectedIntoForms();
    }

    let draftPraca = [];

    function renderPracaEditor() {
      pracaListEl.innerHTML = '';
      draftPraca.forEach((cat, i) => {
        const row = document.createElement('div');
        row.className = 'rm-praca-row';
        row.innerHTML =
          '<input type="text" placeholder="Nazwa kategorii" />' +
          '<textarea placeholder="Zadania — jedno na linię"></textarea>' +
          '<button type="button" class="rm-del-btn" style="display:inline-flex;">Usuń kategorię</button>';
        row.querySelector('input').value = cat.category;
        row.querySelector('textarea').value = (cat.tasks || []).join('\n');
        row.querySelector('input').addEventListener('input', e => { draftPraca[i].category = e.target.value; });
        row.querySelector('textarea').addEventListener('input', e => { draftPraca[i].tasks = e.target.value.split('\n').map(t => t.trim()).filter(Boolean); });
        row.querySelector('.rm-del-btn').addEventListener('click', () => { draftPraca.splice(i, 1); renderPracaEditor(); });
        pracaListEl.appendChild(row);
      });
    }

    function loadSelectedIntoForms() {
      const stage = findStage(stageSelect.value);
      const q = findQuarter(stageSelect.value, qSelect.value);
      if (stage) {
        if (stageDateFrom) stageDateFrom.value = stage.dateFrom || '';
        if (stageDateTo) stageDateTo.value = stage.dateTo || '';
      }
      if (q) {
        if (qDateFrom) qDateFrom.value = q.dateFrom || '';
        if (qDateTo) qDateTo.value = q.dateTo || '';
        if (qLabelInput) qLabelInput.value = q.label || '';
        if (celEtapuInput) celEtapuInput.value = q.celEtapu || '';
        draftPraca = (q.praca || []).map(c => ({ category: c.category, tasks: (c.tasks || []).slice() }));
        renderPracaEditor();
        if (efektInput) efektInput.value = (q.efektKoncowy || []).join('\n');
      }
    }

    stageSelect.addEventListener('change', refreshQOptions);
    qSelect.addEventListener('change', loadSelectedIntoForms);
    refreshStageOptions();

    function persistAndRefresh() {
      persistRoadmapConfig();
      renderRoadmap(roadmapConfig);
      rebindRoadmapNav();
      rebuildStageSummaries();
      showRoadmapStage(currentRoadmapStageId);
    }

    if (stageDateFrom) stageDateFrom.addEventListener('change', () => {
      const stage = findStage(stageSelect.value);
      if (stage) { stage.dateFrom = stageDateFrom.value; persistAndRefresh(); statusEl.textContent = 'Zaktualizowano datę startu etapu.'; }
    });
    if (stageDateTo) stageDateTo.addEventListener('change', () => {
      const stage = findStage(stageSelect.value);
      if (stage) { stage.dateTo = stageDateTo.value; persistAndRefresh(); statusEl.textContent = 'Zaktualizowano datę końca etapu.'; }
    });
    if (qDateFrom) qDateFrom.addEventListener('change', () => {
      const q = findQuarter(stageSelect.value, qSelect.value);
      if (q) { q.dateFrom = qDateFrom.value; persistAndRefresh(); statusEl.textContent = 'Zaktualizowano datę startu kwartału.'; }
    });
    if (qDateTo) qDateTo.addEventListener('change', () => {
      const q = findQuarter(stageSelect.value, qSelect.value);
      if (q) { q.dateTo = qDateTo.value; persistAndRefresh(); statusEl.textContent = 'Zaktualizowano datę końca kwartału.'; }
    });

    if (addPracaCatBtn) addPracaCatBtn.addEventListener('click', () => {
      draftPraca.push({ category: 'Nowa kategoria', tasks: [] });
      renderPracaEditor();
    });

    if (contentSaveBtn) contentSaveBtn.addEventListener('click', () => {
      const q = findQuarter(stageSelect.value, qSelect.value);
      if (!q) return;
      q.label = qLabelInput.value.trim() || q.label;
      q.celEtapu = celEtapuInput.value.trim();
      q.praca = draftPraca.filter(c => c.category && c.category.trim()).map(c => ({ category: c.category.trim(), tasks: c.tasks }));
      q.efektKoncowy = efektInput.value.split('\n').map(t => t.trim()).filter(Boolean);
      persistAndRefresh();
      refreshStageOptions();
      statusEl.textContent = 'Zapisano treść kwartału ' + q.id + '.';
    });

    document.getElementById('rmAddQBtn').addEventListener('click', () => {
      const stage = findStage(stageSelect.value);
      if (!stage) return;
      const label = prompt('Etykieta nowego Q (np. v1.9):');
      if (!label) return;
      const qKey = prompt('Identyfikator Q (np. Q3 2030) — używany do nawigacji:', '');
      if (!qKey) return;
      const df = prompt('Data od (RRRR-MM):', '') || '';
      const dt = prompt('Data do (RRRR-MM):', '') || '';
      stage.quarters.push(mkQ(qKey, label, df, dt, '', [], []));
      persistAndRefresh();
      refreshStageOptions();
      qSelect.value = qKey;
      loadSelectedIntoForms();
      statusEl.textContent = 'Dodano nowy Q (' + qKey + ') do etapu — uzupełnij treść poniżej.';
    });

    document.getElementById('rmAddStageBtn').addEventListener('click', () => {
      const stageKey = prompt('Identyfikator nowego etapu (bez spacji, np. six):');
      if (!stageKey) return;
      const title = prompt('Tytuł etapu (np. VI. v5.0 — v5.9):', '') || ('Nowy etap ' + stageKey);
      const df = prompt('Data od (RRRR-MM):', '') || '';
      const dt = prompt('Data do (RRRR-MM):', '') || '';
      roadmapConfig.stages.push({ id: stageKey, title, dateFrom: df, dateTo: dt, quarters: [] });
      persistAndRefresh();
      refreshStageOptions();
      stageSelect.value = stageKey;
      refreshQOptions();
      statusEl.textContent = 'Dodano nowy etap (' + stageKey + ') — dodaj do niego kwartały przyciskiem powyżej.';
    });

    if (saveBtn) saveBtn.addEventListener('click', () => {
      persistRoadmapConfig();
      statusEl.textContent = 'Zapisano Road Mapę — ' + new Date().toLocaleString('pl-PL') + '.';
    });

    if (resetBtn) resetBtn.addEventListener('click', () => {
      if (!confirm('Przywrócić opublikowaną wersję Road Mapy? Lokalne zmiany zostaną utracone.')) return;
      roadmapConfig = JSON.parse(JSON.stringify(ROADMAP_DEFAULT_CONFIG));
      persistAndRefresh();
      refreshStageOptions();
      if (reportEl) reportEl.value = '';
      statusEl.textContent = 'Przywrócono opublikowaną wersję Road Mapy.';
    });

    if (reportBtn) reportBtn.addEventListener('click', () => {
      const lines = ['ROAD MAPA — lista zmian względem opublikowanej wersji:', ''];
      roadmapConfig.stages.forEach(stage => {
        const origStage = ROADMAP_DEFAULT_CONFIG.stages.find(s => s.id === stage.id);
        if (!origStage) { lines.push('+ NOWY ETAP: ' + stage.title); return; }
        if (stage.dateFrom !== origStage.dateFrom || stage.dateTo !== origStage.dateTo) {
          lines.push('Etap ' + stage.title + ': zmieniono daty (' + origStage.dateFrom + '–' + origStage.dateTo + ' → ' + stage.dateFrom + '–' + stage.dateTo + ')');
        }
        stage.quarters.forEach(q => {
          const origQ = origStage.quarters.find(x => x.id === q.id);
          if (!origQ) { lines.push('  + NOWY KWARTAŁ: ' + q.id + ' (' + q.label + ')'); return; }
          if (JSON.stringify(q) !== JSON.stringify(origQ)) {
            lines.push('  Kwartał ' + q.id + ' (' + q.label + '): treść zmieniona względem opublikowanej wersji.');
          }
        });
      });
      const changeLines = lines.filter(l => l.trim().length);
      reportEl.value = changeLines.length <= 1 ? 'Brak zmian względem opublikowanej wersji.' : lines.join('\n');
      statusEl.textContent = 'Wygenerowano raport zmian — skopiuj treść poniżej.';
    });

    // --- Formularz osoby (wspólny model Person, dodawanie/edycja/usuwanie) ---
    const personForm = document.getElementById('rmPersonForm');
    const personIdInput = document.getElementById('rmPersonId');
    const personRole = document.getElementById('rmPersonRole');
    const personDept = document.getElementById('rmPersonDept');
    const personDesc = document.getElementById('rmPersonDesc');
    const personCollab = document.getElementById('rmPersonCollab');
    const personSalaryRules = document.getElementById('rmPersonSalaryRules');
    const personCostType = document.getElementById('rmPersonCostType');
    const payM1Netto = document.getElementById('rmPayM1Netto');
    const payM1Brutto = document.getElementById('rmPayM1Brutto');
    const payM1Employer = document.getElementById('rmPayM1Employer');
    const payM3Netto = document.getElementById('rmPayM3Netto');
    const payM3Brutto = document.getElementById('rmPayM3Brutto');
    const payM3Employer = document.getElementById('rmPayM3Employer');
    const payM12Netto = document.getElementById('rmPayM12Netto');
    const payM12Brutto = document.getElementById('rmPayM12Brutto');
    const payM12Employer = document.getElementById('rmPayM12Employer');
    const equipmentListEl = document.getElementById('rmEquipmentList');
    const addEquipmentBtn = document.getElementById('rmAddEquipmentBtn');
    const personParentSelect = document.getElementById('rmPersonParent');
    const personCeoBtn = document.getElementById('rmPersonCeoBtn');
    const personSubmitBtn = document.getElementById('rmPersonSubmitBtn');
    const personDeleteBtn = document.getElementById('rmPersonDeleteBtn');

    let draftEquipment = [];
    let m3Touched = false, m12Touched = false;

    function renderEquipmentEditor() {
      if (!equipmentListEl) return;
      equipmentListEl.innerHTML = '';
      draftEquipment.forEach((item, i) => {
        const row = document.createElement('div');
        row.className = 'rm-equipment-row';
        row.innerHTML =
          '<input type="text" placeholder="Nazwa pozycji" />' +
          '<select><option value="jednorazowy">Jednorazowy</option><option value="stały">Stały</option></select>' +
          '<input type="number" placeholder="Kwota (zł)" />' +
          '<button type="button" class="rm-del-btn" style="display:inline-flex;">Usuń</button>';
        const inputs = row.querySelectorAll('input');
        inputs[0].value = item.name;
        inputs[1].value = item.amount;
        row.querySelector('select').value = item.kind;
        inputs[0].addEventListener('input', e => { draftEquipment[i].name = e.target.value; });
        row.querySelector('select').addEventListener('change', e => { draftEquipment[i].kind = e.target.value; });
        inputs[1].addEventListener('input', e => { draftEquipment[i].amount = Number(e.target.value) || 0; });
        row.querySelector('.rm-del-btn').addEventListener('click', () => { draftEquipment.splice(i, 1); renderEquipmentEditor(); });
        equipmentListEl.appendChild(row);
      });
    }

    if (addEquipmentBtn) addEquipmentBtn.addEventListener('click', () => {
      draftEquipment.push({ name: '', kind: 'jednorazowy', amount: 0 });
      renderEquipmentEditor();
    });

    function refreshParentOptions(excludeId) {
      if (!personParentSelect) return;
      const opts = ['<option value="">— brak —</option>'];
      people.filter(p => p.id !== excludeId).forEach(p => opts.push('<option value="' + p.id + '">' + escapeHtml(p.role) + '</option>'));
      personParentSelect.innerHTML = opts.join('');
    }

    function resetPersonForm() {
      personIdInput.value = '';
      personForm.reset();
      draftEquipment = [];
      renderEquipmentEditor();
      m3Touched = false; m12Touched = false;
      refreshParentOptions(null);
      personSubmitBtn.textContent = '+ Dodaj osobę';
      if (personDeleteBtn) personDeleteBtn.style.display = 'none';
    }

    function fillPersonForm(p) {
      personIdInput.value = p.id;
      personRole.value = p.role;
      personDept.value = p.dept;
      personDesc.value = p.desc || '';
      personCollab.value = p.collab || '';
      personSalaryRules.value = p.salaryRules || '';
      personCostType.value = p.costType || 'stały';
      payM1Netto.value = p.pay.m1.netto || '';
      payM1Brutto.value = p.pay.m1.brutto || '';
      payM1Employer.value = p.pay.m1.employerCost || '';
      payM3Netto.value = p.pay.m3.netto || '';
      payM3Brutto.value = p.pay.m3.brutto || '';
      payM3Employer.value = p.pay.m3.employerCost || '';
      payM12Netto.value = p.pay.m12.netto || '';
      payM12Brutto.value = p.pay.m12.brutto || '';
      payM12Employer.value = p.pay.m12.employerCost || '';
      draftEquipment = (p.equipment || []).map(it => Object.assign({}, it));
      renderEquipmentEditor();
      m3Touched = true; m12Touched = true;
      refreshParentOptions(p.id);
      personParentSelect.value = p.parentId || '';
      // Wybierz Q tej osoby w selektorach etapu/kwartału, żeby kontekst się zgadzał
      const stage = roadmapConfig.stages.find(s => s.quarters.some(q => q.id === p.quarter));
      if (stage) {
        stageSelect.value = stage.id;
        refreshQOptions();
        qSelect.value = p.quarter;
        loadSelectedIntoForms();
      }
      personSubmitBtn.textContent = 'Zapisz zmiany';
      if (personDeleteBtn) personDeleteBtn.style.display = '';
    }

    loadPersonFormHook = fillPersonForm;

    if (payM1Netto) payM1Netto.addEventListener('input', () => { if (!m3Touched) payM3Netto.value = (Number(payM1Netto.value) || 0) * 3; if (!m12Touched) payM12Netto.value = (Number(payM1Netto.value) || 0) * 12; });
    if (payM1Brutto) payM1Brutto.addEventListener('input', () => { if (!m3Touched) payM3Brutto.value = (Number(payM1Brutto.value) || 0) * 3; if (!m12Touched) payM12Brutto.value = (Number(payM1Brutto.value) || 0) * 12; });
    if (payM1Employer) payM1Employer.addEventListener('input', () => { if (!m3Touched) payM3Employer.value = (Number(payM1Employer.value) || 0) * 3; if (!m12Touched) payM12Employer.value = (Number(payM1Employer.value) || 0) * 12; });
    [payM3Netto, payM3Brutto, payM3Employer].forEach(el => { if (el) el.addEventListener('input', () => { m3Touched = true; }); });
    [payM12Netto, payM12Brutto, payM12Employer].forEach(el => { if (el) el.addEventListener('input', () => { m12Touched = true; }); });

    if (personCeoBtn) personCeoBtn.addEventListener('click', () => {
      const ceo = people.find(p => p.role === 'CEO');
      if (ceo && personParentSelect) personParentSelect.value = ceo.id;
    });

    resetPersonForm();

    if (personForm) personForm.addEventListener('submit', e => {
      e.preventDefault();
      const role = personRole.value.trim();
      if (!role) return;
      const data = {
        role,
        dept: personDept.value,
        desc: personDesc.value.trim(),
        quarter: qSelect.value,
        parentId: personParentSelect.value || null,
        collab: personCollab.value.trim(),
        salaryRules: personSalaryRules.value.trim(),
        costType: personCostType.value,
        pay: {
          m1: { netto: Number(payM1Netto.value) || 0, brutto: Number(payM1Brutto.value) || 0, employerCost: Number(payM1Employer.value) || 0 },
          m3: { netto: Number(payM3Netto.value) || 0, brutto: Number(payM3Brutto.value) || 0, employerCost: Number(payM3Employer.value) || 0 },
          m12: { netto: Number(payM12Netto.value) || 0, brutto: Number(payM12Brutto.value) || 0, employerCost: Number(payM12Employer.value) || 0 }
        },
        equipment: draftEquipment.filter(it => it.name && it.name.trim()).map(it => ({ name: it.name.trim(), kind: it.kind, amount: Number(it.amount) || 0 }))
      };
      const existingId = personIdInput.value || null;
      savePerson(data, existingId);
      resetPersonForm();
      statusEl.textContent = existingId ? 'Zaktualizowano osobę „' + role + '”.' : 'Dodano osobę „' + role + '” do ' + qSelect.value + '.';
    });

    if (personDeleteBtn) personDeleteBtn.addEventListener('click', () => {
      const id = personIdInput.value;
      if (!id) return;
      const p = personById(id);
      if (p && confirm('Usunąć osobę „' + p.role + '”?')) {
        deletePerson(id);
        resetPersonForm();
        statusEl.textContent = 'Usunięto osobę.';
      }
    });
  })();

  document.addEventListener('keydown', event => {
    if (!document.getElementById('presentation').classList.contains('active')) return;
    if (event.key === 'ArrowLeft') showSlide(currentSlide - 1);
    if (event.key === 'ArrowRight') showSlide(currentSlide + 1);
  });
})();
