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
