// js/app.js
// Wires the DOM to calculator.js and translations.js.
// Uses only textContent (never innerHTML) to prevent XSS.
// The only exception is the print report which uses safe DOM methods.

(function () {
  'use strict';

  /* ── State ── */
  var state = {
    lang:         localStorage.getItem('istilik-lang') || 'az',
    housing:      0,
    system:       0,
    wall:         0,
    insulation:   1,
    floor:        0,
    dhw:          1,
    advancedOpen: false
  };

  /* ── DOM helpers ── */
  function byId(id) { return document.getElementById(id); }

  /* ── i18n ── */
  function applyLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    state.lang = lang;
    localStorage.setItem('istilik-lang', lang);
    var t = TRANSLATIONS[lang];

    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update kW unit labels
    var kwUnit = t.kwUnit || 'kW';
    document.querySelectorAll('.result-unit').forEach(function (s) {
      s.textContent = kwUnit;
    });

    renderResults();
  }

  /* ── Toggle group init ── */
  function initToggle(groupId, onSelect) {
    var group = byId(groupId);
    if (!group) return;
    group.querySelectorAll('.toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('.toggle-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        onSelect(parseInt(btn.dataset.value, 10));
        recalculate();
      });
    });
  }

  /* ── Validation ── */
  function readNumber(id, min, max) {
    var input = byId(id);
    var errorEl = byId(id + '-error');
    var val = parseFloat(input.value);
    if (isNaN(val) || val < min || val > max) {
      if (errorEl) errorEl.textContent = min + ' \u2013 ' + max;
      return NaN;
    }
    if (errorEl) errorEl.textContent = '';
    return val;
  }

  /* ── Result cache ── */
  var lastResult = null;
  var lastParams = null;

  /* ── Render results into DOM using textContent only ── */
  function renderResults() {
    if (!lastResult) return;
    var t = TRANSLATIONS[state.lang];
    var kwUnit = t.kwUnit || 'kW';

    byId('result-boiler-kw').textContent = lastResult.boilerKw.toFixed(1);
    byId('result-recommended').textContent =
      t.recommended.replace('{size}', lastResult.recommendedBoilerKw);

    if (lastResult.radiatorSections === 0) {
      byId('result-sections').textContent = '\u2014';
    } else {
      byId('result-sections').textContent =
        lastResult.radiatorSections + ' ' + t.sections;
    }

    byId('result-heat-kw').textContent = lastResult.boilerKw.toFixed(1);
  }

  /* ── Recalculate ── */
  function recalculate() {
    var area   = readNumber('area',   5,   1000);
    var height = readNumber('height', 2,   6);
    var radPow = parseFloat(byId('radiator-power').value) || 180;
    var floorA = state.system !== 0 ? (parseFloat(byId('floor-area').value) || 0) : 0;

    if (isNaN(area) || isNaN(height)) {
      clearResults();
      return;
    }

    lastParams = {
      area: area, height: height,
      housingType: state.housing, insulation: state.insulation,
      wallType: state.wall, floorType: state.floor,
      radiatorPower: radPow, systemType: state.system,
      floorArea: floorA, dhwPoints: state.dhw
    };

    lastResult = IstiLikCalc.calculate(lastParams);
    renderResults();
    byId('btn-pdf').disabled = false;
    buildPrintReport();
  }

  function clearResults() {
    lastResult = null; lastParams = null;
    byId('result-boiler-kw').textContent = '\u2014';
    byId('result-sections').textContent  = '\u2014';
    byId('result-heat-kw').textContent   = '\u2014';
    byId('result-recommended').textContent = '';
    byId('btn-pdf').disabled = true;
  }

  /* ── System-type visibility ── */
  function updateSystemVisibility() {
    var isUnderfloor = state.system === 1;
    var isMixed      = state.system === 2;
    byId('radiator-power-card').style.display = isUnderfloor ? 'none' : '';
    byId('floor-area-card').style.display     = (isUnderfloor || isMixed) ? '' : 'none';
  }

  /* ── Build print report using safe DOM methods only ── */
  function buildPrintReport() {
    if (!lastResult || !lastParams) return;
    var t  = TRANSLATIONS[state.lang];
    var kw = t.kwUnit || 'kW';

    var housingLabels    = [t.apartment, t.house];
    var systemLabels     = [t.radiators, t.underfloor, t.mixed];
    var insulationLabels = [t.insulationGood, t.insulationMedium, t.insulationPoor];
    var floorLabels      = [t.floorStandard, t.floorAttic];

    var paramRows = [
      [t.area,        lastParams.area + ' m\u00B2'],
      [t.height,      lastParams.height + ' m'],
      [t.housingType, housingLabels[lastParams.housingType]],
      [t.systemType,  systemLabels[lastParams.systemType]],
      [t.insulation,  insulationLabels[lastParams.insulation]],
      [t.floorType,   floorLabels[lastParams.floorType]],
      [t.radiatorPower, lastParams.radiatorPower + ' W'],
      [t.dhwPoints,   String(lastParams.dhwPoints)]
    ];
    if (lastParams.floorArea > 0) {
      paramRows.push([t.floorArea, lastParams.floorArea + ' m\u00B2']);
    }

    var paramsEl = byId('print-params');
    paramsEl.textContent = '';
    var h3p = document.createElement('h3');
    h3p.textContent = t.title;
    paramsEl.appendChild(h3p);
    paramRows.forEach(function (row) {
      var div = document.createElement('div');
      div.className = 'print-param-row';
      var lbl = document.createElement('span');
      lbl.textContent = row[0];
      var val = document.createElement('strong');
      val.textContent = row[1];
      div.appendChild(lbl);
      div.appendChild(val);
      paramsEl.appendChild(div);
    });

    var resultsEl = byId('print-results');
    resultsEl.textContent = '';
    var h3r = document.createElement('h3');
    h3r.textContent = t.resultsTitle;
    resultsEl.appendChild(h3r);

    var resultRows = [
      [t.boilerPower, lastResult.boilerKw.toFixed(1) + ' ' + kw],
      [t.recommended.replace('{size}', ''), lastResult.recommendedBoilerKw + ' ' + kw]
    ];
    if (lastResult.radiatorSections > 0) {
      resultRows.splice(1, 0, [t.radiatorSections, lastResult.radiatorSections + ' ' + t.sections]);
    }

    resultRows.forEach(function (row) {
      var block = document.createElement('div');
      block.className = 'print-result-block';
      var lbl = document.createElement('div');
      lbl.className = 'label';
      lbl.textContent = row[0];
      var val = document.createElement('div');
      val.className = 'value';
      val.textContent = row[1];
      block.appendChild(lbl);
      block.appendChild(val);
      resultsEl.appendChild(block);
    });
  }

  /* ── Reset ── */
  function resetAll() {
    byId('area').value           = '';
    byId('height').value         = '';
    byId('radiator-power').value = 180;
    byId('floor-area').value     = 0;

    var defaults = {
      'housing-toggle':    0,
      'system-toggle':     0,
      'wall-toggle':       0,
      'insulation-toggle': 1,
      'floor-toggle':      0,
      'dhw-toggle':        0
    };
    Object.keys(defaults).forEach(function (groupId) {
      var group = byId(groupId);
      if (!group) return;
      group.querySelectorAll('.toggle-btn').forEach(function (btn, idx) {
        btn.classList.toggle('active', idx === defaults[groupId]);
      });
    });

    state.housing = 0; state.system = 0; state.wall = 0;
    state.insulation = 1; state.floor = 0; state.dhw = 1;

    clearResults();
    updateSystemVisibility();
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', function () {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { applyLang(btn.dataset.lang); });
    });

    // Number inputs
    ['area', 'height', 'radiator-power', 'floor-area'].forEach(function (id) {
      var el = byId(id);
      if (el) el.addEventListener('input', recalculate);
    });

    // Toggle groups
    initToggle('housing-toggle',    function (v) { state.housing    = v; });
    initToggle('wall-toggle',       function (v) { state.wall       = v; });
    initToggle('insulation-toggle', function (v) { state.insulation = v; });
    initToggle('floor-toggle',      function (v) { state.floor      = v; });
    initToggle('dhw-toggle',        function (v) { state.dhw        = v; });
    initToggle('system-toggle', function (v) {
      state.system = v;
      updateSystemVisibility();
    });

    // Advanced section toggle
    byId('advanced-toggle').addEventListener('click', function () {
      state.advancedOpen = !state.advancedOpen;
      this.classList.toggle('open', state.advancedOpen);
      byId('advanced-section').classList.toggle('open', state.advancedOpen);
    });

    // PDF
    byId('btn-pdf').addEventListener('click', function () { window.print(); });

    // Reset
    byId('btn-reset').addEventListener('click', resetAll);

    // Apply saved/default language
    applyLang(state.lang);
    updateSystemVisibility();
  });

}());
