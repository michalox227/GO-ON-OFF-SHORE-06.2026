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
    'goShoreBaseValues_v1',
    'goShoreInlineEdits_v1'
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

/* Inline Content Editor — globalny tryb edycji treści biznesplanu i road mapy.
   Działa bez backendu: zmiany są zapisywane w localStorage i od razu nakładane na stronę. */
(function () {
  const INLINE_STORAGE_KEY = 'goShoreInlineEdits_v1';
  const EDIT_MODE_KEY = 'goShoreInlineEditMode_v1';
  const BTN_CLASS = 'go-inline-edit-btn';
  const APPLIED_ATTR = 'data-go-inline-applied';
  let registry = new Map();
  let scanTimer = null;
  let observer = null;
  let activeTarget = null;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function loadEdits() {
    try {
      const parsed = JSON.parse(localStorage.getItem(INLINE_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveEdits(edits) {
    try { localStorage.setItem(INLINE_STORAGE_KEY, JSON.stringify(edits)); } catch (e) {}
  }

  function stripEditorUi(root) {
    const clone = root.cloneNode(true);
    clone.querySelectorAll('.' + BTN_CLASS + ', .go-edit-badge').forEach(el => el.remove());
    clone.removeAttribute('data-go-edit-key');
    clone.removeAttribute('data-go-edit-type');
    clone.removeAttribute('data-go-edit-title');
    clone.removeAttribute('data-go-inline-applied');
    clone.classList.remove('go-editable-target', 'go-editable-roadmap-target', 'go-editable-business-target');
    return clone;
  }

  function cleanHtml(html) {
    const box = document.createElement('div');
    box.innerHTML = html || '';
    box.querySelectorAll('.' + BTN_CLASS + ', .go-edit-badge, #goInlineEditorToolbar, #goInlineEditorOverlay').forEach(el => el.remove());
    box.querySelectorAll('[data-go-edit-key],[data-go-edit-type],[data-go-edit-title],[data-go-inline-applied]').forEach(el => {
      el.removeAttribute('data-go-edit-key');
      el.removeAttribute('data-go-edit-type');
      el.removeAttribute('data-go-edit-title');
      el.removeAttribute('data-go-inline-applied');
      el.classList.remove('go-editable-target', 'go-editable-roadmap-target', 'go-editable-business-target');
    });
    return box.innerHTML.trim();
  }

  function getBusinessSectionNodes(anchor) {
    const nodes = [];
    let node = anchor;
    while (node) {
      if (node !== anchor && node.nodeType === 1 && node.matches('h2[id]')) break;
      if (node.nodeType === 1 && node.closest && node.closest('#goInlineEditorOverlay, #goInlineEditorToolbar')) break;
      nodes.push(node);
      node = node.nextSibling;
    }
    return nodes;
  }

  function getBusinessSectionHtml(anchor) {
    return getBusinessSectionNodes(anchor).map(node => {
      if (node.nodeType === 1) return stripEditorUi(node).outerHTML;
      return node.textContent || '';
    }).join('').trim();
  }

  function replaceBusinessSection(anchor, html) {
    const nodes = getBusinessSectionNodes(anchor);
    const temp = document.createElement('div');
    temp.innerHTML = cleanHtml(html);
    const newNodes = Array.from(temp.childNodes);
    const parent = anchor.parentNode;
    const marker = document.createTextNode('');
    parent.insertBefore(marker, nodes[0]);
    nodes.forEach(node => node.parentNode && node.parentNode.removeChild(node));
    newNodes.forEach(node => parent.insertBefore(node, marker));
    marker.remove();
  }

  function getElementHtml(el) {
    if (!el) return '';
    if (el.id === 'roadmap') return stripEditorUi(el).innerHTML.trim();
    return stripEditorUi(el).outerHTML.trim();
  }

  function replaceElement(el, html) {
    if (!el) return;
    const temp = document.createElement('div');
    temp.innerHTML = cleanHtml(html);
    if (el.id === 'roadmap') {
      el.innerHTML = temp.innerHTML;
      return;
    }
    const replacement = temp.firstElementChild;
    if (!replacement) return;
    el.replaceWith(replacement);
  }

  function applySavedEdits() {
    const edits = loadEdits();
    Object.keys(edits).forEach(key => {
      const value = edits[key];
      if (!value || typeof value.html !== 'string') return;
      if (key.indexOf('business:') === 0) {
        const id = key.replace('business:', '');
        const anchor = document.getElementById(id);
        if (!anchor || anchor.getAttribute(APPLIED_ATTR) === value.html) return;
        replaceBusinessSection(anchor, value.html);
        const nextAnchor = document.getElementById(id);
        if (nextAnchor) nextAnchor.setAttribute(APPLIED_ATTR, value.html);
        return;
      }
      const el = document.querySelector('[data-go-edit-key="' + cssEscape(key) + '"]');
      if (el && el.getAttribute(APPLIED_ATTR) !== value.html) {
        replaceElement(el, value.html);
        const next = document.querySelector('[data-go-edit-key="' + cssEscape(key) + '"]');
        if (next) next.setAttribute(APPLIED_ATTR, value.html);
      }
    });
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function labelFromText(el, fallback) {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text ? text.slice(0, 96) : fallback;
  }

  function createEditButton(target) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = BTN_CLASS;
    btn.setAttribute('aria-label', 'Edytuj ten element');
    btn.title = 'Edytuj ten element';
    btn.textContent = '⚙️';
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openEditor(target);
    });
    return btn;
  }

  function registerTarget(target) {
    if (!target || target.querySelector && target.querySelector(':scope > .' + BTN_CLASS)) return;
    const key = target.dataset.goEditKey;
    if (!key) return;
    registry.set(key, target);
    target.classList.add('go-editable-target');
    if (key.indexOf('business:') === 0) target.classList.add('go-editable-business-target');
    if (key.indexOf('roadmap:') === 0) target.classList.add('go-editable-roadmap-target');
    target.appendChild(createEditButton(target));
  }

  function markBusinessTargets() {
    document.querySelectorAll('#business-plan .wrap > h2[id]').forEach((h2, index) => {
      h2.dataset.goEditKey = 'business:' + h2.id;
      h2.dataset.goEditType = 'business-section';
      h2.dataset.goEditTitle = labelFromText(h2, 'Temat biznesplanu ' + (index + 1));
      registerTarget(h2);
    });
  }

  function markRoadmapTargets() {
    const roadmap = document.getElementById('roadmap');
    if (!roadmap) return;
    roadmap.dataset.goEditKey = 'roadmap:whole';
    roadmap.dataset.goEditType = 'roadmap-whole';
    roadmap.dataset.goEditTitle = 'Cała Road Mapa / mapka road mapy';

    if (!document.getElementById('goRoadmapWholeEditBtn')) {
      const topBtn = document.createElement('button');
      topBtn.type = 'button';
      topBtn.id = 'goRoadmapWholeEditBtn';
      topBtn.className = BTN_CLASS + ' go-roadmap-whole-edit';
      topBtn.textContent = '⚙️ Edytuj całą Road Mapę';
      topBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openEditor(roadmap);
      });
      roadmap.insertBefore(topBtn, roadmap.firstChild);
    }

    const selector = [
      '#roadmap h2', '#roadmap h3', '#roadmap h4',
      '#roadmap details', '#roadmap table',
      '#roadmap .module-card', '#roadmap .chip', '#roadmap .sum',
      '#roadmap .roadmap-card', '#roadmap .roadmap-stage', '#roadmap .roadmap-q',
      '#roadmap .stage-card', '#roadmap .quarter-card', '#roadmap .timeline-item',
      '#roadmap [data-stage]', '#roadmap [data-quarter]', '#roadmap [data-q]'
    ].join(', ');

    const seen = new Set();
    Array.from(document.querySelectorAll(selector)).forEach((el, index) => {
      if (!el || el.id === 'goRoadmapWholeEditBtn' || el.closest('#goInlineEditorOverlay, #goInlineEditorToolbar')) return;
      if (el.classList.contains(BTN_CLASS)) return;
      const identity = el.id || el.dataset.stage || el.dataset.quarter || el.dataset.q || labelFromText(el, 'element-' + index).toLowerCase().replace(/[^a-z0-9ąćęłńóśźż]+/gi, '-').slice(0, 60);
      let key = 'roadmap:' + identity;
      let n = 2;
      while (seen.has(key)) key = 'roadmap:' + identity + '-' + (n++);
      seen.add(key);
      if (!el.dataset.goEditKey) el.dataset.goEditKey = key;
      el.dataset.goEditType = 'roadmap-element';
      el.dataset.goEditTitle = labelFromText(el, 'Element Road Mapy');
      registerTarget(el);
    });
  }

  function scanEditTargets() {
    registry = new Map();
    applySavedEdits();
    markBusinessTargets();
    markRoadmapTargets();
  }

  function scheduleScan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scanEditTargets, 120);
  }

  function setEditMode(enabled) {
    document.body.classList.toggle('go-edit-mode', !!enabled);
    const checkbox = document.getElementById('goInlineEditCheckbox');
    const button = document.getElementById('goInlineEditButton');
    if (checkbox) checkbox.checked = !!enabled;
    if (button) button.classList.toggle('active', !!enabled);
    try { localStorage.setItem(EDIT_MODE_KEY, enabled ? '1' : '0'); } catch (e) {}
    if (enabled) scanEditTargets();
  }

  function injectToolbar() {
    if (document.getElementById('goInlineEditorToolbar')) return;
    const toolbar = document.createElement('div');
    toolbar.id = 'goInlineEditorToolbar';
    toolbar.innerHTML = '<button type="button" id="goInlineEditButton" aria-label="Włącz lub wyłącz tryb edycji">⚙️</button><label><input type="checkbox" id="goInlineEditCheckbox"> Tryb edycji</label>';
    document.body.appendChild(toolbar);

    const checkbox = document.getElementById('goInlineEditCheckbox');
    const button = document.getElementById('goInlineEditButton');
    const toggle = () => setEditMode(!document.body.classList.contains('go-edit-mode'));
    button.addEventListener('click', toggle);
    checkbox.addEventListener('change', () => setEditMode(checkbox.checked));
  }

  function injectModal() {
    if (document.getElementById('goInlineEditorOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'goInlineEditorOverlay';
    overlay.hidden = true;
    overlay.innerHTML = '<div class="go-inline-modal" role="dialog" aria-modal="true" aria-labelledby="goInlineEditorTitle"><div class="go-inline-modal-head"><div><p class="go-inline-kicker">GO ON [OFF] SHORE · edytor treści</p><h3 id="goInlineEditorTitle">Edytuj element</h3></div><button type="button" id="goInlineCloseBtn" aria-label="Zamknij">×</button></div><p class="go-inline-help">Edytujesz pełny HTML wybranego bloku. Po kliknięciu „Zapisz” zmiana pojawi się od razu na stronie i zostanie zapisana w tej przeglądarce.</p><textarea id="goInlineEditorTextarea" spellcheck="false"></textarea><div class="go-inline-actions"><button type="button" id="goInlineSaveBtn">Zapisz</button><button type="button" id="goInlineCopyBtn">Kopiuj HTML</button><button type="button" id="goInlineResetBtn">Przywróć opublikowaną wersję</button><button type="button" id="goInlineCancelBtn">Anuluj</button></div><p id="goInlineEditorStatus" class="go-inline-status"></p></div>';
    document.body.appendChild(overlay);

    document.getElementById('goInlineCloseBtn').addEventListener('click', closeEditor);
    document.getElementById('goInlineCancelBtn').addEventListener('click', closeEditor);
    document.getElementById('goInlineSaveBtn').addEventListener('click', saveActiveEditor);
    document.getElementById('goInlineResetBtn').addEventListener('click', resetActiveEditor);
    document.getElementById('goInlineCopyBtn').addEventListener('click', copyActiveHtml);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeEditor(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !overlay.hidden) closeEditor();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's' && !overlay.hidden) {
        event.preventDefault();
        saveActiveEditor();
      }
    });
  }

  function openEditor(target) {
    if (!target) return;
    activeTarget = target;
    const title = target.dataset.goEditTitle || 'Edytuj element';
    const textarea = document.getElementById('goInlineEditorTextarea');
    const overlay = document.getElementById('goInlineEditorOverlay');
    document.getElementById('goInlineEditorTitle').textContent = title;
    document.getElementById('goInlineEditorStatus').textContent = '';
    textarea.value = target.dataset.goEditType === 'business-section' ? getBusinessSectionHtml(target) : getElementHtml(target);
    overlay.hidden = false;
    document.body.classList.add('go-inline-modal-open');
    setTimeout(() => textarea.focus(), 30);
  }

  function closeEditor() {
    const overlay = document.getElementById('goInlineEditorOverlay');
    if (overlay) overlay.hidden = true;
    document.body.classList.remove('go-inline-modal-open');
    activeTarget = null;
  }

  function saveActiveEditor() {
    if (!activeTarget) return;
    const textarea = document.getElementById('goInlineEditorTextarea');
    const status = document.getElementById('goInlineEditorStatus');
    const key = activeTarget.dataset.goEditKey;
    const html = cleanHtml(textarea.value);
    if (!key || !html) {
      status.textContent = 'Nie zapisano — treść jest pusta albo element nie ma klucza edycji.';
      return;
    }
    const edits = loadEdits();
    edits[key] = { html, updatedAt: new Date().toISOString(), title: activeTarget.dataset.goEditTitle || key };
    saveEdits(edits);

    if (activeTarget.dataset.goEditType === 'business-section') replaceBusinessSection(activeTarget, html);
    else replaceElement(activeTarget, html);

    status.textContent = 'Zapisano. Zmiana została naniesiona na stronę.';
    setTimeout(() => {
      closeEditor();
      scanEditTargets();
      setEditMode(true);
    }, 250);
  }

  function resetActiveEditor() {
    if (!activeTarget) return;
    const key = activeTarget.dataset.goEditKey;
    const edits = loadEdits();
    delete edits[key];
    saveEdits(edits);
    document.getElementById('goInlineEditorStatus').textContent = 'Usunięto lokalną poprawkę. Odśwież stronę, aby wrócić do opublikowanej wersji repozytorium.';
  }

  function copyActiveHtml() {
    const textarea = document.getElementById('goInlineEditorTextarea');
    const status = document.getElementById('goInlineEditorStatus');
    textarea.select();
    try {
      document.execCommand('copy');
      status.textContent = 'Skopiowano HTML do schowka.';
    } catch (e) {
      status.textContent = 'Nie udało się skopiować automatycznie — zaznacz i skopiuj ręcznie.';
    }
  }

  function injectStyles() {
    if (document.getElementById('goInlineEditorStyles')) return;
    const style = document.createElement('style');
    style.id = 'goInlineEditorStyles';
    style.textContent = `
      #goInlineEditorToolbar{position:fixed;top:14px;right:16px;z-index:99980;display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid rgba(212,168,92,.55);border-radius:999px;background:rgba(5,8,13,.86);backdrop-filter:blur(14px);box-shadow:0 14px 40px rgba(0,0,0,.35);color:#f8fafc;font:700 12px/1.2 Arial,sans-serif;letter-spacing:.02em}#goInlineEditorToolbar button{width:34px;height:34px;border-radius:999px;border:1px solid rgba(45,212,191,.55);background:rgba(15,23,42,.96);color:#fff;cursor:pointer;font-size:17px}#goInlineEditorToolbar button.active{border-color:#d4a85c;background:linear-gradient(135deg,rgba(212,168,92,.95),rgba(45,212,191,.75));box-shadow:0 0 22px rgba(212,168,92,.35)}#goInlineEditorToolbar label{display:flex;align-items:center;gap:7px;white-space:nowrap}#goInlineEditorToolbar input{accent-color:#d4a85c}.go-editable-target{position:relative}.go-inline-edit-btn{display:none;align-items:center;justify-content:center;gap:6px;position:absolute;top:6px;right:6px;z-index:50;min-width:34px;height:30px;padding:0 8px;border:1px solid rgba(212,168,92,.75);border-radius:999px;background:rgba(7,11,17,.94);color:#fff;box-shadow:0 10px 24px rgba(0,0,0,.35);cursor:pointer;font-size:14px;line-height:1}.go-edit-mode .go-inline-edit-btn{display:inline-flex}.go-edit-mode .go-editable-target{outline:1px dashed rgba(45,212,191,.38);outline-offset:5px}.go-roadmap-whole-edit{position:sticky!important;top:70px!important;right:auto!important;left:0!important;width:max-content!important;margin:0 0 14px 0!important;padding:0 14px!important;height:36px!important}.go-edit-mode #goRoadmapWholeEditBtn{display:inline-flex!important}#goInlineEditorOverlay{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.72);backdrop-filter:blur(8px);padding:24px;overflow:auto}#goInlineEditorOverlay[hidden]{display:none}.go-inline-modal{width:min(1120px,96vw);min-height:70vh;margin:28px auto;padding:20px;border:1px solid rgba(212,168,92,.55);border-radius:22px;background:linear-gradient(180deg,rgba(13,19,30,.98),rgba(5,8,13,.98));box-shadow:0 30px 90px rgba(0,0,0,.55);color:#e7edf3}.go-inline-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:10px}.go-inline-kicker{margin:0 0 6px;color:#d4a85c;text-transform:uppercase;font-size:11px;letter-spacing:.16em;font-weight:800}.go-inline-modal h3{margin:0;font-size:22px;color:#fff}.go-inline-modal-head button{width:38px;height:38px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;font-size:25px;cursor:pointer}.go-inline-help{margin:8px 0 14px;color:#aab7c4;font-size:13px}#goInlineEditorTextarea{width:100%;min-height:52vh;resize:vertical;border-radius:16px;border:1px solid rgba(45,212,191,.28);background:#05070b;color:#e7edf3;padding:16px;font:13px/1.55 Menlo,Consolas,'Courier New',monospace;outline:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.03)}#goInlineEditorTextarea:focus{border-color:rgba(212,168,92,.75);box-shadow:0 0 0 3px rgba(212,168,92,.12)}.go-inline-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.go-inline-actions button{border:1px solid rgba(212,168,92,.45);border-radius:999px;padding:10px 15px;background:rgba(255,255,255,.06);color:#fff;font-weight:800;cursor:pointer}.go-inline-actions #goInlineSaveBtn{background:linear-gradient(135deg,#d4a85c,#2dd4bf);color:#071016;border-color:transparent}.go-inline-status{min-height:18px;margin:12px 0 0;color:#2dd4bf;font-size:13px;font-weight:700}body.go-inline-modal-open{overflow:hidden}@media(max-width:760px){#goInlineEditorToolbar{top:10px;right:10px;left:10px;justify-content:space-between}.go-inline-modal{margin:8px auto;padding:14px}#goInlineEditorTextarea{min-height:58vh}.go-inline-edit-btn{top:4px;right:4px}}
    `;
    document.head.appendChild(style);
  }

  ready(() => {
    injectStyles();
    injectToolbar();
    injectModal();
    scanEditTargets();
    setEditMode(localStorage.getItem(EDIT_MODE_KEY) === '1');
    observer = new MutationObserver(() => {
      if (document.body.classList.contains('go-inline-modal-open')) return;
      scheduleScan();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(scanEditTargets, 400);
    setTimeout(scanEditTargets, 1200);
  });
})();
