/* settings-config.js — domyślne dane i trwałość (localStorage) dla panelu "Globalne ustawienia strony".
   Nie dotyka DOM-u stron; renderers.js i settings-panel.js korzystają z window.GoShoreSettings. */
(function () {
  const STORAGE_KEY = 'goShoreGlobalSettings_v1';

  const FONT_STACKS = {
    default: { display: "'Helvetica Neue',Helvetica,Arial,sans-serif", body: "Arial,'Helvetica Neue',Helvetica,sans-serif" },
    serif: { display: "Georgia,'Times New Roman',serif", body: "Georgia,'Times New Roman',serif" },
    mono: { display: "Menlo,Consolas,'Courier New',monospace", body: "Menlo,Consolas,'Courier New',monospace" },
    rounded: { display: "system-ui,-apple-system,'Segoe UI',sans-serif", body: "system-ui,-apple-system,'Segoe UI',sans-serif" }
  };

  const DEFAULTS = {
    siteName: '',
    slogan: '',
    accentColor: '#2DD4BF',
    accentColor2: '#D4A85C',
    bgColor: '#070B11',
    textColor: '#E7EDF3',
    cardColor: '#0F1822',
    fontFamily: 'default',
    cardRadius: 12,
    shadowStrength: 30,
    darkMode: false,
    visibility: { businessPlan: true, presentation: true, roadmap: true, organization: true }
  };

  // Klucze localStorage objęte Eksportem/Importem JSON (whitelist — import nigdy nie zapisuje nic poza tą listą)
  const KNOWN_KEYS = [
    STORAGE_KEY,
    'goSharePresentation_titles_v1',
    'goShoreBP_edited_v1',
    'goSharePeople_v1',
    'goShoreRoadmapConfig_v1',
    'goShoreLabels_v1',
    'goShoreBaseValues_v1'
  ];

  function merge(base, override) {
    const out = Object.assign({}, base, override || {});
    out.visibility = Object.assign({}, base.visibility, (override && override.visibility) || {});
    return out;
  }

  function loadSettings() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
    return merge(DEFAULTS, saved && typeof saved === 'object' ? saved : null);
  }

  function saveSettings(settings) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  function resetSettings() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    return merge(DEFAULTS, null);
  }

  window.GoShoreSettings = window.GoShoreSettings || {};
  Object.assign(window.GoShoreSettings, {
    STORAGE_KEY, FONT_STACKS, DEFAULTS, KNOWN_KEYS,
    merge, loadSettings, saveSettings, resetSettings
  });
})();
