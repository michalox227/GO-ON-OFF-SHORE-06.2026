/* settings-config.js — domyślne dane, trwałość localStorage, blokada hasłem i globalny edytor treści. */
(function () {
  const STORAGE_KEY = 'goShoreGlobalSettings_v1';
  const SNAPSHOT_KEY = 'goShorePermanentSnapshot_v1';

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

  const KNOWN_KEYS = [
    STORAGE_KEY,
    'goSharePresentation_titles_v1',
    'goShoreBP_edited_v1',
    'goSharePeople_v1',
    'goShoreRoadmapConfig_v1',
    'goShoreLabels_v1',
    'goShoreBaseValues_v1',
    'goShoreInlineEdits_v1',
    SNAPSHOT_KEY
  ];

  function merge(base, override) {
    const out = Object.assign({}, base, override || {});
    out.visibility = Object.assign({}, base.visibility, (override && override.visibility) || {});
    return out;
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function savePermanentSnapshot(extraKeys) {
    const keys = Array.from(new Set([].concat(KNOWN_KEYS, extraKeys || []))).filter(key => key && key !== SNAPSHOT_KEY);
    const snapshot = readJson(SNAPSHOT_KEY, { updatedAt: null, data: {} }) || { data: {} };
    snapshot.updatedAt = new Date().toISOString();
    snapshot.data = snapshot.data || {};
    keys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value === null || value === undefined) delete snapshot.data[key];
        else snapshot.data[key] = value;
      } catch (e) {}
    });
    writeJson(SNAPSHOT_KEY, snapshot);
    return snapshot;
  }

  function restorePermanentSnapshot() {
    const snapshot = readJson(SNAPSHOT_KEY, null);
    if (!snapshot || !snapshot.data) return false;
    Object.keys(snapshot.data).forEach(key => {
      try {
        if (!localStorage.getItem(key)) localStorage.setItem(key, snapshot.data[key]);
      } catch (e) {}
    });
    return true;
  }

  restorePermanentSnapshot();

  function loadSettings() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
    return merge(DEFAULTS, saved && typeof saved === 'object' ? saved : null);
  }

  function saveSettings(settings) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
    savePermanentSnapshot([STORAGE_KEY]);
  }

  function resetSettings() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    savePermanentSnapshot([STORAGE_KEY]);
    return merge(DEFAULTS, null);
  }

  window.GoShoreSettings = window.GoShoreSettings || {};
  Object.assign(window.GoShoreSettings, {
    STORAGE_KEY, FONT_STACKS, DEFAULTS, KNOWN_KEYS,
    merge, loadSettings, saveSettings, resetSettings
  });

  window.GoShorePersistentMemory = {
    SNAPSHOT_KEY,
    saveSnapshot: savePermanentSnapshot,
    restoreSnapshot: restorePermanentSnapshot,
    knownKeys: KNOWN_KEYS
  };

  document.addEventListener('click', event => {
    const btn = event.target && event.target.closest ? event.target.closest('button') : null;
    if (!btn) return;
    const label = (btn.textContent || '').toLowerCase();
    if (label.includes('zapisz')) {
      setTimeout(() => savePermanentSnapshot(), 120);
      setTimeout(() => savePermanentSnapshot(), 700);
    }
  }, true);
})();

/* Prosta blokada wejścia na platformę — hasło: 2891. */
(function () {
  const AUTH_KEY = 'goShoreAuthGranted_v1';
  const PASSWORD = '2891';

  function isAuthed() {
    try { return localStorage.getItem(AUTH_KEY) === '1'; } catch (e) { return false; }
  }

  document.documentElement.classList.toggle('go-auth-locked', !isAuthed());
  document.documentElement.classList.toggle('go-auth-granted', isAuthed());

  const style = document.createElement('style');
  style.id = 'goAuthGateStyles';
  style.textContent = `
    html.go-auth-locked body > :not(#goAuthGate){filter:blur(8px);pointer-events:none;user-select:none;}
    html.go-auth-locked body{overflow:hidden;}
    #goAuthGate{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:24px;background:radial-gradient(900px 480px at 50% 5%,rgba(45,212,191,.12),transparent 62%),linear-gradient(180deg,rgba(7,11,17,.96),rgba(3,6,10,.985));color:#e7edf3;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;}
    #goAuthGate .auth-card{width:min(520px,94vw);border:1px solid rgba(212,168,92,.55);border-radius:28px;background:linear-gradient(180deg,rgba(15,24,34,.96),rgba(7,11,17,.98));box-shadow:0 34px 110px rgba(0,0,0,.58),0 0 60px rgba(45,212,191,.08);padding:34px 30px 30px;text-align:center;}
    #goAuthGate .auth-kicker{margin:0 0 10px;color:#d4a85c;font-size:11px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;}
    #goAuthGate h1{margin:0 0 10px;font-size:clamp(34px,7vw,58px);line-height:.94;letter-spacing:-.04em;color:#fff;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;}
    #goAuthGate h1 span{color:#d4a85c;}
    #goAuthGate .auth-sub{margin:12px auto 24px;max-width:390px;color:#aab7c4;font-size:14px;line-height:1.55;}
    #goAuthGate form{display:grid;gap:12px;}
    #goAuthGate input{width:100%;height:52px;border-radius:999px;border:1px solid rgba(45,212,191,.34);background:#05070b;color:#fff;text-align:center;font-size:21px;font-weight:800;letter-spacing:.35em;outline:none;}
    #goAuthGate input:focus{border-color:#d4a85c;box-shadow:0 0 0 4px rgba(212,168,92,.13);}
    #goAuthGate button{height:52px;border:0;border-radius:999px;background:linear-gradient(135deg,#d4a85c,#2dd4bf);color:#071016;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;}
    #goAuthGate .auth-error{min-height:20px;margin:8px 0 0;color:#ff7878;font-size:13px;font-weight:800;}
    #goAuthGate .auth-note{margin:16px 0 0;color:#6f7c8a;font-size:11px;line-height:1.4;}
  `;
  document.head.appendChild(style);

  function unlock() {
    try { localStorage.setItem(AUTH_KEY, '1'); } catch (e) {}
    document.documentElement.classList.remove('go-auth-locked');
    document.documentElement.classList.add('go-auth-granted');
    const gate = document.getElementById('goAuthGate');
    if (gate) gate.remove();
  }

  function injectGate() {
    if (isAuthed()) return unlock();
    if (document.getElementById('goAuthGate')) return;
    const gate = document.createElement('div');
    gate.id = 'goAuthGate';
    gate.innerHTML = `
      <section class="auth-card" role="dialog" aria-modal="true" aria-labelledby="goAuthTitle">
        <p class="auth-kicker">Dostęp do platformy inwestycyjnej</p>
        <h1 id="goAuthTitle">GO ON <span>[OFF]</span> SHORE</h1>
        <p class="auth-sub">Wpisz hasło, aby wejść do panelu biznesplanu, prezentacji, road mapy, organizacji i ustawień strony.</p>
        <form id="goAuthForm">
          <input id="goAuthPassword" type="password" inputmode="numeric" autocomplete="current-password" placeholder="••••" aria-label="Hasło dostępu" />
          <button type="submit">Zaloguj</button>
        </form>
        <p class="auth-error" id="goAuthError" aria-live="polite"></p>
        <p class="auth-note">Hasło dostępu jest zapisane po stronie front-endu. To blokada prezentacyjna, nie pełne zabezpieczenie produkcyjne.</p>
      </section>`;
    document.body.appendChild(gate);
    const input = document.getElementById('goAuthPassword');
    const form = document.getElementById('goAuthForm');
    const error = document.getElementById('goAuthError');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if ((input.value || '').trim() === PASSWORD) unlock();
      else {
        error.textContent = 'Nieprawidłowe hasło.';
        input.value = '';
        input.focus();
      }
    });
    setTimeout(() => input.focus(), 50);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectGate);
  else injectGate();
})();

/* Inline Content Editor — globalny tryb edycji treści biznesplanu i road mapy. */
(function () {
  const INLINE_STORAGE_KEY = 'goShoreInlineEdits_v1';
  const EDIT_MODE_KEY = 'goShoreInlineEditMode_v1';
  const BTN_CLASS = 'go-inline-edit-btn';
  const APPLIED_ATTR = 'data-go-inline-applied';
  let scanTimer = null;
  let activeTarget = null;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function loadEdits() {
    try {
      const parsed = JSON.parse(localStorage.getItem(INLINE_STORAGE_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) { return {}; }
  }

  function saveEdits(edits) {
    try { localStorage.setItem(INLINE_STORAGE_KEY, JSON.stringify(edits)); } catch (e) {}
    if (window.GoShorePersistentMemory) window.GoShorePersistentMemory.saveSnapshot([INLINE_STORAGE_KEY]);
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(String(value));
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '\\$&');
  }

  function stripEditorUi(root) {
    const clone = root.cloneNode(true);
    clone.querySelectorAll('.' + BTN_CLASS + ', .go-edit-badge, #goRoadmapWholeEditBtn').forEach(el => el.remove());
    clone.removeAttribute('data-go-edit-key');
    clone.removeAttribute('data-go-edit-type');
    clone.removeAttribute('data-go-edit-title');
    clone.removeAttribute(APPLIED_ATTR);
    clone.classList.remove('go-editable-target', 'go-editable-roadmap-target', 'go-editable-business-target');
    clone.querySelectorAll('[data-go-edit-key],[data-go-edit-type],[data-go-edit-title],[data-go-inline-applied]').forEach(el => {
      el.removeAttribute('data-go-edit-key');
      el.removeAttribute('data-go-edit-type');
      el.removeAttribute('data-go-edit-title');
      el.removeAttribute(APPLIED_ATTR);
      el.classList.remove('go-editable-target', 'go-editable-roadmap-target', 'go-editable-business-target');
    });
    return clone;
  }

  function cleanHtml(html) {
    const box = document.createElement('div');
    box.innerHTML = html || '';
    box.querySelectorAll('.' + BTN_CLASS + ', .go-edit-badge, #goInlineEditorToolbar, #goInlineEditorOverlay, #goRoadmapWholeEditBtn').forEach(el => el.remove());
    box.querySelectorAll('[data-go-edit-key],[data-go-edit-type],[data-go-edit-title],[data-go-inline-applied]').forEach(el => {
      el.removeAttribute('data-go-edit-key');
      el.removeAttribute('data-go-edit-type');
      el.removeAttribute('data-go-edit-title');
      el.removeAttribute(APPLIED_ATTR);
      el.classList.remove('go-editable-target', 'go-editable-roadmap-target', 'go-editable-business-target');
    });
    return box.innerHTML.trim();
  }

  function labelFromText(el, fallback) {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text ? text.slice(0, 96) : fallback;
  }

  function getBusinessSectionNodes(anchor) {
    const nodes = [];
    let node = anchor;
    while (node) {
      if (node !== anchor && node.nodeType === 1 && node.matches('h2[id]')) break;
      nodes.push(node);
      node = node.nextSibling;
    }
    return nodes;
  }

  function getBusinessSectionHtml(anchor) {
    return getBusinessSectionNodes(anchor).map(node => node.nodeType === 1 ? stripEditorUi(node).outerHTML : (node.textContent || '')).join('').trim();
  }

  function replaceBusinessSection(anchor, html) {
    const nodes = getBusinessSectionNodes(anchor);
    const temp = document.createElement('div');
    temp.innerHTML = cleanHtml(html);
    const parent = anchor.parentNode;
    const marker = document.createTextNode('');
    parent.insertBefore(marker, nodes[0]);
    nodes.forEach(node => node.parentNode && node.parentNode.removeChild(node));
    Array.from(temp.childNodes).forEach(node => parent.insertBefore(node, marker));
    marker.remove();
  }

  function getElementHtml(el) {
    if (!el) return '';
    if (el.id === 'roadmap') return stripEditorUi(el).innerHTML.trim();
    return stripEditorUi(el).outerHTML.trim();
  }

  function replaceElement(el, html) {
    const temp = document.createElement('div');
    temp.innerHTML = cleanHtml(html);
    if (el.id === 'roadmap') {
      el.innerHTML = temp.innerHTML;
      return;
    }
    const replacement = temp.firstElementChild;
    if (replacement) el.replaceWith(replacement);
  }

  function applySavedEdits() {
    const edits = loadEdits();
    Object.keys(edits).forEach(key => {
      const value = edits[key];
      if (!value || typeof value.html !== 'string') return;
      if (key.indexOf('business:') === 0) {
        const anchor = document.getElementById(key.replace('business:', ''));
        if (!anchor || anchor.getAttribute(APPLIED_ATTR) === value.html) return;
        replaceBusinessSection(anchor, value.html);
        const nextAnchor = document.getElementById(key.replace('business:', ''));
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
    if (!target || !target.dataset || !target.dataset.goEditKey) return;
    if (target.querySelector && target.querySelector(':scope > .' + BTN_CLASS)) return;
    target.classList.add('go-editable-target');
    if (target.dataset.goEditKey.indexOf('business:') === 0) target.classList.add('go-editable-business-target');
    if (target.dataset.goEditKey.indexOf('roadmap:') === 0) target.classList.add('go-editable-roadmap-target');
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
    applySavedEdits();
    markBusinessTargets();
    markRoadmapTargets();
  }

  function scheduleScan() {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(scanEditTargets, 160);
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
    button.addEventListener('click', () => setEditMode(!document.body.classList.contains('go-edit-mode')));
    checkbox.addEventListener('change', () => setEditMode(checkbox.checked));
  }

  function injectModal() {
    if (document.getElementById('goInlineEditorOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'goInlineEditorOverlay';
    overlay.hidden = true;
    overlay.innerHTML = '<div class="go-inline-modal" role="dialog" aria-modal="true" aria-labelledby="goInlineEditorTitle"><div class="go-inline-modal-head"><div><p class="go-inline-kicker">GO ON [OFF] SHORE · edytor treści</p><h3 id="goInlineEditorTitle">Edytuj element</h3></div><button type="button" id="goInlineCloseBtn" aria-label="Zamknij">×</button></div><p class="go-inline-help">Edytujesz pełny HTML wybranego bloku. Po kliknięciu „Zapisz” zmiana pojawi się od razu na stronie i zostanie zapisana w trwałej pamięci tej przeglądarki.</p><textarea id="goInlineEditorTextarea" spellcheck="false"></textarea><div class="go-inline-actions"><button type="button" id="goInlineSaveBtn">Zapisz</button><button type="button" id="goInlineCopyBtn">Kopiuj HTML</button><button type="button" id="goInlineResetBtn">Przywróć opublikowaną wersję</button><button type="button" id="goInlineCancelBtn">Anuluj</button></div><p id="goInlineEditorStatus" class="go-inline-status"></p></div>';
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
    activeTarget = target;
    const textarea = document.getElementById('goInlineEditorTextarea');
    const overlay = document.getElementById('goInlineEditorOverlay');
    document.getElementById('goInlineEditorTitle').textContent = target.dataset.goEditTitle || 'Edytuj element';
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
    status.textContent = 'Zapisano na stronie i w trwałej pamięci przeglądarki.';
    setTimeout(() => {
      closeEditor();
      scanEditTargets();
      setEditMode(true);
    }, 260);
  }

  function resetActiveEditor() {
    if (!activeTarget) return;
    const edits = loadEdits();
    delete edits[activeTarget.dataset.goEditKey];
    saveEdits(edits);
    document.getElementById('goInlineEditorStatus').textContent = 'Usunięto lokalną poprawkę. Odśwież stronę, aby wrócić do wersji z repozytorium.';
  }

  function copyActiveHtml() {
    const textarea = document.getElementById('goInlineEditorTextarea');
    textarea.select();
    try {
      document.execCommand('copy');
      document.getElementById('goInlineEditorStatus').textContent = 'Skopiowano HTML do schowka.';
    } catch (e) {
      document.getElementById('goInlineEditorStatus').textContent = 'Nie udało się skopiować automatycznie — skopiuj ręcznie.';
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
    new MutationObserver(() => {
      if (document.body.classList.contains('go-inline-modal-open')) return;
      scheduleScan();
    }).observe(document.body, { childList: true, subtree: true });
    setTimeout(scanEditTargets, 400);
    setTimeout(scanEditTargets, 1200);
  });
})();
