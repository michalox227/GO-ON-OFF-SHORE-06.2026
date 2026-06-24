/* settings-panel.js — wiąże formularz w zakładce "Ustawienia witryny" (sekcja Globalne ustawienia strony)
   z danymi z settings-config.js i renderem z renderers.js. Obsługuje też Eksport/Import JSON
   dla wszystkich znanych kluczy localStorage (GoShoreSettings.KNOWN_KEYS). */
(function () {
  const GS = window.GoShoreSettings || {};

  const el = {
    siteName: document.getElementById('gsSiteName'),
    slogan: document.getElementById('gsSlogan'),
    accentColor: document.getElementById('gsAccentColor'),
    accentColor2: document.getElementById('gsAccentColor2'),
    bgColor: document.getElementById('gsBgColor'),
    textColor: document.getElementById('gsTextColor'),
    cardColor: document.getElementById('gsCardColor'),
    fontFamily: document.getElementById('gsFontFamily'),
    cardRadius: document.getElementById('gsCardRadius'),
    cardRadiusVal: document.getElementById('gsCardRadiusVal'),
    shadowStrength: document.getElementById('gsShadowStrength'),
    shadowStrengthVal: document.getElementById('gsShadowStrengthVal'),
    darkMode: document.getElementById('gsDarkMode'),
    visBusinessPlan: document.getElementById('gsVisBusinessPlan'),
    visPresentation: document.getElementById('gsVisPresentation'),
    visRoadmap: document.getElementById('gsVisRoadmap'),
    visOrganization: document.getElementById('gsVisOrganization'),
    status: document.getElementById('gsStatus'),
    jsonArea: document.getElementById('gsJsonArea'),
    saveBtn: document.getElementById('gsSaveBtn'),
    previewBtn: document.getElementById('gsPreviewBtn'),
    resetBtn: document.getElementById('gsResetBtn'),
    exportBtn: document.getElementById('gsExportBtn'),
    importBtn: document.getElementById('gsImportBtn')
  };

  function readFormSettings() {
    const s = GS.merge(GS.DEFAULTS, null);
    s.siteName = el.siteName ? el.siteName.value : s.siteName;
    s.slogan = el.slogan ? el.slogan.value : s.slogan;
    s.accentColor = el.accentColor ? el.accentColor.value : s.accentColor;
    s.accentColor2 = el.accentColor2 ? el.accentColor2.value : s.accentColor2;
    s.bgColor = el.bgColor ? el.bgColor.value : s.bgColor;
    s.textColor = el.textColor ? el.textColor.value : s.textColor;
    s.cardColor = el.cardColor ? el.cardColor.value : s.cardColor;
    s.fontFamily = el.fontFamily ? el.fontFamily.value : s.fontFamily;
    s.cardRadius = el.cardRadius ? Number(el.cardRadius.value) : s.cardRadius;
    s.shadowStrength = el.shadowStrength ? Number(el.shadowStrength.value) : s.shadowStrength;
    s.darkMode = el.darkMode ? !!el.darkMode.checked : s.darkMode;
    s.visibility = {
      businessPlan: el.visBusinessPlan ? !!el.visBusinessPlan.checked : true,
      presentation: el.visPresentation ? !!el.visPresentation.checked : true,
      roadmap: el.visRoadmap ? !!el.visRoadmap.checked : true,
      organization: el.visOrganization ? !!el.visOrganization.checked : true
    };
    return s;
  }

  function renderPageSettings(settings) {
    const DEFAULTS = GS.DEFAULTS;
    if (el.siteName) el.siteName.value = settings.siteName || '';
    if (el.slogan) el.slogan.value = settings.slogan || '';
    if (el.accentColor) el.accentColor.value = settings.accentColor || DEFAULTS.accentColor;
    if (el.accentColor2) el.accentColor2.value = settings.accentColor2 || DEFAULTS.accentColor2;
    if (el.bgColor) el.bgColor.value = settings.bgColor || DEFAULTS.bgColor;
    if (el.textColor) el.textColor.value = settings.textColor || DEFAULTS.textColor;
    if (el.cardColor) el.cardColor.value = settings.cardColor || DEFAULTS.cardColor;
    if (el.fontFamily) el.fontFamily.value = settings.fontFamily || 'default';
    if (el.cardRadius) { el.cardRadius.value = settings.cardRadius; if (el.cardRadiusVal) el.cardRadiusVal.textContent = settings.cardRadius + 'px'; }
    if (el.shadowStrength) { el.shadowStrength.value = settings.shadowStrength; if (el.shadowStrengthVal) el.shadowStrengthVal.textContent = settings.shadowStrength + '%'; }
    if (el.darkMode) el.darkMode.checked = !!settings.darkMode;
    if (el.visBusinessPlan) el.visBusinessPlan.checked = settings.visibility.businessPlan !== false;
    if (el.visPresentation) el.visPresentation.checked = settings.visibility.presentation !== false;
    if (el.visRoadmap) el.visRoadmap.checked = settings.visibility.roadmap !== false;
    if (el.visOrganization) el.visOrganization.checked = settings.visibility.organization !== false;
  }

  function exportSettingsJSON() {
    const bundle = { exportedAt: 'goShoreSettingsExport', keys: {} };
    GS.KNOWN_KEYS.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw !== null) bundle.keys[key] = raw;
    });
    const text = JSON.stringify(bundle, null, 2);
    if (el.jsonArea) el.jsonArea.value = text;
    try {
      const blob = new Blob([text], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'go-on-off-shore-settings.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {}
    if (el.status) el.status.textContent = 'Wyeksportowano ustawienia do JSON (plik pobrany i wklejony poniżej).';
  }

  function importSettingsJSON() {
    if (!el.jsonArea) return;
    let parsed;
    try { parsed = JSON.parse(el.jsonArea.value); } catch (e) {
      if (el.status) el.status.textContent = 'Błąd: niepoprawny JSON.';
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !parsed.keys || typeof parsed.keys !== 'object') {
      if (el.status) el.status.textContent = 'Błąd: JSON nie ma oczekiwanej struktury ({ keys: {...} }).';
      return;
    }
    let imported = 0;
    GS.KNOWN_KEYS.forEach(key => {
      if (typeof parsed.keys[key] === 'string') {
        try { localStorage.setItem(key, parsed.keys[key]); imported++; } catch (e) {}
      }
    });
    if (el.status) el.status.textContent = 'Zaimportowano ' + imported + ' sekcji ustawień. Strona przeładuje się za chwilę…';
    setTimeout(() => location.reload(), 800);
  }

  function bind() {
    const liveFields = [el.siteName, el.slogan, el.accentColor, el.accentColor2, el.bgColor, el.textColor, el.cardColor, el.fontFamily, el.cardRadius, el.shadowStrength, el.darkMode, el.visBusinessPlan, el.visPresentation, el.visRoadmap, el.visOrganization];
    liveFields.forEach(field => {
      if (!field) return;
      field.addEventListener('input', () => GS.applyGlobalStyles(readFormSettings()));
    });
    if (el.cardRadius) el.cardRadius.addEventListener('input', () => { if (el.cardRadiusVal) el.cardRadiusVal.textContent = el.cardRadius.value + 'px'; });
    if (el.shadowStrength) el.shadowStrength.addEventListener('input', () => { if (el.shadowStrengthVal) el.shadowStrengthVal.textContent = el.shadowStrength.value + '%'; });

    if (el.saveBtn) el.saveBtn.addEventListener('click', () => {
      const s = readFormSettings();
      GS.saveSettings(s);
      GS.applyGlobalStyles(s);
      if (el.status) el.status.textContent = 'Ustawienia globalne zapisane.';
    });
    if (el.previewBtn) el.previewBtn.addEventListener('click', () => {
      GS.applyGlobalStyles(readFormSettings());
      if (el.status) el.status.textContent = 'Podgląd zastosowany (niezapisany).';
    });
    if (el.resetBtn) el.resetBtn.addEventListener('click', () => {
      const settings = GS.resetSettings();
      renderPageSettings(settings);
      GS.applyGlobalStyles(settings);
      if (el.status) el.status.textContent = 'Przywrócono ustawienia domyślne.';
    });
    if (el.exportBtn) el.exportBtn.addEventListener('click', exportSettingsJSON);
    if (el.importBtn) el.importBtn.addEventListener('click', importSettingsJSON);
  }

  bind();
  const initialSettings = GS.loadSettings();
  renderPageSettings(initialSettings);
  GS.applyGlobalStyles(initialSettings);

  window.GoShoreSettings = window.GoShoreSettings || {};
  Object.assign(window.GoShoreSettings, { renderPageSettings, readFormSettings, exportSettingsJSON, importSettingsJSON });
})();
