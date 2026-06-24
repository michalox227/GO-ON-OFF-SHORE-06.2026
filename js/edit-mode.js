(function () {
  var EDIT_STORAGE_KEY = 'goShareEditedSections_v1';
  var toggle = document.getElementById('editModeToggle');
  var overlay = document.getElementById('editPopupOverlay');
  var popup = document.getElementById('editPopup');
  var popupTitle = document.getElementById('editPopupTitle');
  var popupContent = document.getElementById('editPopupContent');
  var popupSave = document.getElementById('editPopupSave');
  var popupCancel = document.getElementById('editPopupCancel');
  var popupClose = document.getElementById('editPopupClose');

  if (!toggle || !overlay) return;

  var currentTarget = null;
  var currentKey = null;

  function loadEdits() {
    try {
      var raw = localStorage.getItem(EDIT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function saveEdits(edits) {
    try { localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(edits)); } catch (e) {}
  }

  // --- Biznesplan: gear icons next to each h2 ---
  function initBiznesplanGears() {
    var bpView = document.getElementById('business-plan');
    if (!bpView) return;
    var headings = bpView.querySelectorAll('h2[id]');
    var edits = loadEdits();

    headings.forEach(function (h2) {
      if (h2.querySelector('.section-edit-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'section-edit-btn';
      btn.textContent = '⚙️';
      btn.title = 'Edytuj tę sekcję';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openBiznesplanEditor(h2);
      });
      h2.appendChild(btn);
    });

    // Apply saved edits
    Object.keys(edits).forEach(function (key) {
      if (key.startsWith('bp_')) {
        var sectionId = key.replace('bp_', '');
        applySavedBpEdit(sectionId, edits[key]);
      }
    });
  }

  function getSectionContent(h2) {
    var content = [];
    var sibling = h2.nextElementSibling;
    var sectionId = h2.id;
    while (sibling) {
      if (sibling.tagName === 'H2') break;
      content.push(sibling);
      sibling = sibling.nextElementSibling;
    }
    return content;
  }

  function sectionToText(elements) {
    var lines = [];
    elements.forEach(function (el) {
      lines.push(el.innerHTML);
    });
    return lines.join('\n\n---SEPARATOR---\n\n');
  }

  function applySavedBpEdit(sectionId, savedHTML) {
    var h2 = document.getElementById(sectionId);
    if (!h2) return;
    var elements = getSectionContent(h2);
    var parts = savedHTML.split('\n\n---SEPARATOR---\n\n');
    elements.forEach(function (el, i) {
      if (i < parts.length) {
        el.innerHTML = parts[i];
      }
    });
  }

  function openBiznesplanEditor(h2) {
    var elements = getSectionContent(h2);
    var titleText = h2.textContent.replace(/⚙️/g, '').trim();
    popupTitle.textContent = 'Edycja: ' + titleText;
    popupContent.value = sectionToText(elements);
    currentTarget = { type: 'bp', h2: h2, elements: elements };
    currentKey = 'bp_' + h2.id;
    overlay.hidden = false;
    popupContent.focus();
  }

  // --- Roadmap: gear icons next to stages, quarters, and map ---
  function initRoadmapGears() {
    var rmView = document.getElementById('roadmap');
    if (!rmView) return;

    // Gear on hero title
    addRoadmapGear(rmView.querySelector('.roadmap-hero h1'), 'rm_hero');

    // Gear on each stage button
    rmView.querySelectorAll('.stage-btn[data-roadmap-stage]').forEach(function (btn) {
      addRoadmapGear(btn, 'rm_stage_' + btn.dataset.roadmapStage, true);
    });

    // Gear on each quarter pill
    rmView.querySelectorAll('.q-pill[data-roadmap-q]').forEach(function (pill) {
      addRoadmapGear(pill, 'rm_q_pill_' + pill.dataset.roadmapQ.replace(/\s/g, '_'), true);
    });

    // Gear on each quarter card in details
    rmView.querySelectorAll('.roadmap-q-card[data-roadmap-q]').forEach(function (card) {
      addRoadmapGear(card.querySelector('strong'), 'rm_q_card_' + card.dataset.roadmapQ.replace(/\s/g, '_'));
    });

    // Gear on each detail section head
    rmView.querySelectorAll('.roadmap-detail-head').forEach(function (head) {
      var section = head.closest('.roadmap-detail');
      if (section) {
        addRoadmapGear(head.querySelector('.roadmap-detail-title'), 'rm_detail_' + section.dataset.roadmapDetail);
      }
    });

    // Gear on the roadmap table itself
    addRoadmapGear(rmView.querySelector('.roadmap-hero p'), 'rm_hero_desc');

    // Apply saved roadmap edits
    var edits = loadEdits();
    Object.keys(edits).forEach(function (key) {
      if (key.startsWith('rm_')) {
        applyRoadmapEdit(key, edits[key]);
      }
    });
  }

  function addRoadmapGear(el, key, inside) {
    if (!el || el.querySelector('.rm-section-edit-btn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rm-section-edit-btn';
    btn.textContent = '⚙️';
    btn.title = 'Edytuj ten element';
    btn.dataset.editKey = key;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      openRoadmapEditor(el, key);
    });
    if (inside) {
      el.appendChild(btn);
    } else {
      el.parentNode.insertBefore(btn, el.nextSibling);
    }
  }

  function openRoadmapEditor(el, key) {
    var isCard = el.closest('.roadmap-q-card');
    var target;
    if (isCard) {
      target = isCard;
    } else {
      target = el;
    }
    popupTitle.textContent = 'Edycja: ' + (el.textContent || '').replace(/⚙️/g, '').trim().substring(0, 80);
    popupContent.value = target.innerHTML;
    currentTarget = { type: 'rm', element: target, key: key };
    currentKey = key;
    overlay.hidden = false;
    popupContent.focus();
  }

  function applyRoadmapEdit(key, html) {
    var rmView = document.getElementById('roadmap');
    if (!rmView) return;
    var btn = rmView.querySelector('.rm-section-edit-btn[data-edit-key="' + key + '"]');
    if (btn) {
      var el = btn.previousElementSibling || btn.parentNode;
      var isCard = el.closest && el.closest('.roadmap-q-card');
      if (isCard) {
        isCard.innerHTML = html;
        addRoadmapGear(isCard.querySelector('strong'), key);
      } else if (key === 'rm_hero' || key === 'rm_hero_desc') {
        el.innerHTML = html;
      }
    }
  }

  // --- Save / Cancel ---
  function closePopup() {
    overlay.hidden = true;
    currentTarget = null;
    currentKey = null;
  }

  function saveCurrentEdit() {
    if (!currentTarget || !currentKey) return;
    var edits = loadEdits();
    var newContent = popupContent.value;

    if (currentTarget.type === 'bp') {
      var parts = newContent.split('\n\n---SEPARATOR---\n\n');
      currentTarget.elements.forEach(function (el, i) {
        if (i < parts.length) {
          el.innerHTML = parts[i];
        }
      });
      edits[currentKey] = newContent;
    } else if (currentTarget.type === 'rm') {
      currentTarget.element.innerHTML = newContent;
      edits[currentKey] = newContent;
      // Re-add gear button after innerHTML replacement
      if (currentTarget.element.classList && currentTarget.element.classList.contains('roadmap-q-card')) {
        addRoadmapGear(currentTarget.element.querySelector('strong'), currentKey);
      }
    }

    saveEdits(edits);
    closePopup();
  }

  popupSave.addEventListener('click', saveCurrentEdit);
  popupCancel.addEventListener('click', closePopup);
  popupClose.addEventListener('click', closePopup);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) closePopup();
  });

  // --- Toggle edit mode ---
  var editModeSaved = localStorage.getItem('goShareEditMode');
  if (editModeSaved === 'on') {
    toggle.checked = true;
    document.body.classList.add('edit-mode-on');
  }

  toggle.addEventListener('change', function () {
    if (toggle.checked) {
      document.body.classList.add('edit-mode-on');
      localStorage.setItem('goShareEditMode', 'on');
    } else {
      document.body.classList.remove('edit-mode-on');
      localStorage.setItem('goShareEditMode', 'off');
    }
  });

  // --- Init gears ---
  initBiznesplanGears();
  initRoadmapGears();

  // Re-init roadmap gears after roadmap re-renders (MutationObserver)
  var rmDetails = document.querySelector('.roadmap-details');
  if (rmDetails) {
    var observer = new MutationObserver(function () {
      setTimeout(initRoadmapGears, 50);
    });
    observer.observe(rmDetails, { childList: true, subtree: true });
  }

  // Also re-bind after roadmap table re-renders
  var rmTable = document.querySelector('.roadmap-table-wrap');
  if (rmTable) {
    var tableObserver = new MutationObserver(function () {
      setTimeout(initRoadmapGears, 50);
    });
    tableObserver.observe(rmTable, { childList: true, subtree: true });
  }
})();
