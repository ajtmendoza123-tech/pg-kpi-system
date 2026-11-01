/* Pace Gaming KPI V76 - Page 2: New Players Added by Booking Executive.
   Internal data is read from the existing manual player-entry fields in localStorage.
   Only aggregate counts are rendered; no player names are exported. */
(() => {
  'use strict';
  const EXECUTIVES = ['DL','KA','SP','CV','LR','TF','KH'];
  const NAME_KEY = 'paceKpiNewPlayerNamesV1';
  const COUNT_KEY = 'paceKpiNewProspectsV2';
  const TOTAL_KEY = 'paceKpiTotalProspectsV1';
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let applying = false;

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch (_) { return []; }
  }

  function asArray(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    return Object.entries(data).map(([key, value]) => ({month: key, value}));
  }

  function validCount(value) {
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.trunc(number) : null;
  }

  function getNewPlayers(month) {
    const values = {};
    const breakdown = asArray(readJson(COUNT_KEY));
    const names = asArray(readJson(NAME_KEY));
    const official = asArray(readJson(TOTAL_KEY));
    const named = {};
    EXECUTIVES.forEach(code => { named[code] = new Set(); });

    names.forEach(row => {
      if (String(row?.month || '') !== month) return;
      const code = String(row?.executive || '').toUpperCase().trim();
      const playerName = String(row?.name || '').trim().toLowerCase();
      if (named[code] && playerName) named[code].add(playerName);
    });

    EXECUTIVES.forEach(code => {
      const record = breakdown.find(row => String(row?.month || '') === month && String(row?.executive || '').toUpperCase().trim() === code);
      const override = record ? validCount(record.value ?? record.count ?? record.total) : null;
      values[code] = override !== null ? override : named[code].size ? named[code].size : null;
    });

    const manual = official.find(row => String(row?.month || '') === month);
    const officialTotal = manual ? validCount(manual.value ?? manual.total ?? manual.count) : null;
    const haveBreakdown = EXECUTIVES.some(code => values[code] !== null);
    const breakdownTotal = EXECUTIVES.reduce((sum, code) => sum + (values[code] ?? 0), 0);
    return {values, officialTotal, breakdownTotal, haveBreakdown};
  }

  function monthFromLabel(text) {
    const source = String(text || '').replace(/\s+/g, ' ');
    const performanceMatch = source.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\s+performance\s+and\s+variance\b/i);
    if (performanceMatch) {
      const n = MONTH_NAMES.findIndex(m => m.toLowerCase() === performanceMatch[1].toLowerCase()) + 1;
      return {value: `${performanceMatch[2]}-${String(n).padStart(2,'0')}`, label: `${MONTH_NAMES[n-1]} ${performanceMatch[2]}`};
    }
    const lastPart = [...source.matchAll(/\bvs\.?\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/gi)].pop();
    if (lastPart) {
      const n = MONTH_NAMES.findIndex(m => m.toLowerCase() === lastPart[1].toLowerCase()) + 1;
      return {value: `${lastPart[2]}-${String(n).padStart(2,'0')}`, label: `${MONTH_NAMES[n-1]} ${lastPart[2]}`};
    }
    return null;
  }

  function getTableMonth(table) {
    // Start close to the table so one comparison's month cannot leak into another.
    let current = table.parentElement;
    for (let depth = 0; current && depth < 7; depth++, current = current.parentElement) {
      if (current.matches('#printReport, #snapshotPrintRoot, body')) break;
      const headings = [...current.querySelectorAll('h1,h2,h3,h4,.snapshot-title,.snapshot-heading')]
        .map(item => item.textContent || '').join(' ');
      const parsed = monthFromLabel(headings);
      if (parsed) return parsed;
    }
    // Fallback to a limited content extract if headings are unusually structured.
    const content = (table.closest('.comparison-agent-page, .executive-snapshot-page, .pdf-report-page, section') || table.parentElement)?.textContent || '';
    return monthFromLabel(content.slice(0, 1200));
  }

  function isBookingExecutiveComparisonTable(table) {
    const head = table.tHead?.textContent || table.querySelector('thead')?.textContent || '';
    const text = head.toUpperCase().replace(/\s+/g,' ');
    return text.includes('BOOKING EXECUTIVE') && text.includes('BOOKINGS') && text.includes('THEORETICAL')
      && (text.includes('W/L') || text.includes('WIN/LOSS')) && (text.includes('Δ') || text.includes('VARIANCE') || text.includes('THEO'));
  }

  function createCell(tag, text, className) {
    const el = document.createElement(tag);
    el.textContent = String(text);
    if (className) el.className = className;
    return el;
  }

  function createSummary(month, data) {
    const section = document.createElement('section');
    section.className = 'pace-v76-new-player-summary';
    section.dataset.paceNewPlayerMonth = month.value;
    section.setAttribute('aria-label', `New players added by executive in ${month.label}`);

    const head = document.createElement('div');
    head.className = 'pace-v76-new-player-summary-title';
    const title = createCell('strong', 'NEW PLAYERS ADDED BY EXECUTIVE');
    const monthLabel = createCell('span', month.label);
    head.append(title, monthLabel);
    section.appendChild(head);

    const table = document.createElement('table');
    table.className = 'pace-v76-new-player-table';
    const header = document.createElement('thead');
    const hrow = document.createElement('tr');
    EXECUTIVES.concat(['TOTAL']).forEach(code => hrow.appendChild(createCell('th', code)));
    header.appendChild(hrow);
    table.appendChild(header);
    const body = document.createElement('tbody');
    const row = document.createElement('tr');
    EXECUTIVES.forEach(code => row.appendChild(createCell('td', data.values[code] === null ? '—' : data.values[code].toLocaleString('en-US'))));
    const reportTotal = data.officialTotal !== null ? data.officialTotal : data.haveBreakdown ? data.breakdownTotal : null;
    row.appendChild(createCell('td', reportTotal === null ? '—' : reportTotal.toLocaleString('en-US'), 'pace-v76-total-cell'));
    body.appendChild(row);
    table.appendChild(body);
    section.appendChild(table);

    const note = document.createElement('div');
    note.className = 'pace-v76-note';
    note.textContent = data.officialTotal !== null && data.haveBreakdown && data.officialTotal !== data.breakdownTotal
      ? `Official month total: ${data.officialTotal.toLocaleString('en-US')} · Executive entries: ${data.breakdownTotal.toLocaleString('en-US')}. The official total is used in KPI summaries.`
      : 'Counts reflect internal manual entries. Individual player names are not included.';
    section.appendChild(note);
    return section;
  }

  function apply() {
    if (applying) return;
    applying = true;
    try {
      const tables = [...document.querySelectorAll('table')].filter(isBookingExecutiveComparisonTable);
      tables.forEach(table => {
        if (table.closest('.pace-v76-new-player-summary')) return;
        const month = getTableMonth(table);
        if (!month) return;
        const data = getNewPlayers(month.value);
        const signature = JSON.stringify({month:month.value,...data});
        const next = table.nextElementSibling;
        if (next?.classList.contains('pace-v76-new-player-summary') && next.dataset.paceNewPlayerSignature === signature) return;
        const summary = createSummary(month, data);
        summary.dataset.paceNewPlayerSignature = signature;
        if (next?.classList.contains('pace-v76-new-player-summary')) next.replaceWith(summary);
        else table.insertAdjacentElement('afterend', summary);
      });
    } finally { applying = false; }
  }

  let pending = false;
  const observe = new MutationObserver(() => {
    if (pending || applying) return;
    pending = true;
    queueMicrotask(() => { pending = false; apply(); });
  });
  function initialize() {
    apply();
    observe.observe(document.body, {subtree:true,childList:true,characterData:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
  else initialize();
  window.addEventListener('beforeprint', apply);
  // Print can be invoked immediately after new HTML is injected. Enrich it first.
  const originalPrint = window.print.bind(window);
  window.print = function (...args) { apply(); return originalPrint(...args); };
  window.PaceKpiV76RefreshNewPlayers = apply;
})();
