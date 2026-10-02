(() => {
  "use strict";

  const STORAGE_KEYS = {
    settings: "paceKpiSettingsV1",
    history: "paceKpiHistoryV1",
    newProspects: "paceKpiNewProspectsV2",
    prospectDates: "paceKpiProspectDatesV1",
    totalProspects: "paceKpiTotalProspectsV1",
    newPlayerNames: "paceKpiNewPlayerNamesV1"
  };

  const FIELD_CONFIG = {
    bookingId: { label: "Booking ID", required: false, aliases: ["booking id", "deal id", "id"] },
    dealName: { label: "Deal Name", required: true, aliases: ["deal name", "deal", "trip deal name"] },
    playerName: { label: "Player Full Name", required: false, aliases: ["primary contact full name", "player full name", "contact full name", "full name", "player name", "player", "person name", "contact name"] },
    firstName: { label: "Player First Name", required: false, aliases: ["player first name", "first name", "contact first name"] },
    lastName: { label: "Player Last Name", required: false, aliases: ["player last name", "last name", "contact last name"] },
    checkoutDate: { label: "Check-Out Date", required: true, aliases: ["departure date", "check-out date", "checkout date", "check out date", "trip departure date", "end date"] },
    bookingAgent: { label: "Booking Agent (Source Field)", required: false, aliases: ["booking agent", "agent", "booking owner"] },
    dealOwner: { label: "Deal Owner (Owner)", required: false, aliases: ["owner", "deal owner", "deal owner name", "deal owner owner", "owner / trip contact (deal owner)", "owner / trip contact", "owner trip contact"] },
    tripContact: { label: "Trip Contact", required: false, aliases: ["trip contact", "trip contact name", "trip contact full name"] },
    playerOwner: { label: "Player Owner (Primary Contact Owner)", required: false, aliases: ["primary contact owner", "primary contact owner name", "player owner", "contact owner", "person owner", "primary owner"] },
    property: { label: "Property", required: true, aliases: ["property", "casino", "hotel", "venue"] },
    credit: { label: "Credit", required: false, aliases: ["trip credit", "credit", "credit line", "line of credit"] },
    frontMoney: { label: "Front Money", required: false, aliases: ["trip front money", "front money", "frontmoney"] },
    bankroll: { label: "Bankroll", required: false, aliases: ["total trip bankroll", "trip bankroll", "bankroll", "bank roll"] },
    playerWinLoss: { label: "Player Win/Loss", required: true, aliases: ["final trip player win", "final trip player win/loss", "final trip player win loss", "trip player win", "player win/loss", "player win loss", "win/loss", "win loss", "player loss", "actual win loss"] },
    theoretical: { label: "Theoretical", required: true, aliases: ["final trip theo", "final trip theoretical", "trip theo", "trip theoretical", "theoretical", "theo", "theoretical win", "total theoretical"] },
    commission: { label: "Commission", required: false, aliases: ["commission", "commissions", "commission amount"] },
    currency: { label: "Currency", required: false, aliases: ["currency", "currency code"] },
    bookingStatus: { label: "Booking Status", required: false, aliases: ["stage", "booking status", "status", "deal status"] },
    playRatingComplete: { label: "Play Rating Complete?", required: false, aliases: ["play rating complete?", "play rating complete", "rating complete", "play rating", "rated"] },
    notes: { label: "Notes", required: false, aliases: ["notes", "comments", "memo"] }
  };

  const EXECUTIVE_DIRECTORY = {
    "dave luber": { name: "David Luber", code: "DL" },
    "david luber": { name: "David Luber", code: "DL" },
    "luber dave": { name: "David Luber", code: "DL" },
    "luber david": { name: "David Luber", code: "DL" },
    "kyle allen": { name: "Kyle Allen", code: "KA" },
    "allen kyle": { name: "Kyle Allen", code: "KA" },
    "sabrina pinto": { name: "Sabrina Pinto", code: "SP" },
    "pinto sabrina": { name: "Sabrina Pinto", code: "SP" },
    "chuck venuto": { name: "Chuck Venuto", code: "CV" },
    "venuto chuck": { name: "Chuck Venuto", code: "CV" }
  };

  const els = {};
  const state = {
    sourceRows: [],
    normalizedRows: [],
    headers: [],
    mapping: {},
    files: [],
    currentReport: null
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    setDefaultMonths();
    loadSettings();
    bindEvents();
    renderProspectDateEditor();
    renderNewPlayerNameEditor();
    renderTotalProspectInputs();
    renderNewProspectInputMatrix();
    renderHistory();
    renderMappingGrid();
    if (!getStoredProspectDates().length) syncPlayerDatesFromSelectedComparisons({ silent: true, fallbackToUpload: true });
    updateExecutiveSnapshotButtons(null);
    renderComparisonExportPreview();
  }

  function cacheElements() {
    [
      "themeSelect", "fontSelect", "resetAppBtn", "fileInput", "browseBtn", "dropZone", "fileStatus",
      "uploadedFiles", "mappingDetails", "mappingBadge", "mappingGrid",
      "companyName", "preparedBy", "reportHeaderTitle", "comparisonHeaderText", "useLatestMonthsBtn",
      "fillComparisonHeaderBtn", "month1", "month2", "month3", "month4", "propertyFilter",
      "currencyFilter", "newProspectEntryPanel", "prospectMonthStatus", "prospectDateEditor", "newPlayerNameEditor", "totalProspectEditor",
      "syncPlayerMonthsBtn", "refreshProspectMonthsBtn", "addProspectDateBtn", "clearProspectEntriesBtn",
      "prospectInputHead", "prospectInputBody", "generateBtn", "loadSampleBtn",
      "messageBox", "reportSection", "reportToolbarTitle", "saveHistoryBtn",
      "exportExcelBtn", "emailFormatBtn", "emailExportPanel", "emailSubject",
      "emailDraftMessage", "suggestEmailDraftBtn", "copyEmailBtn", "downloadEmailBtn",
      "closeEmailPanelBtn", "emailPreview",
      "printBtn", "allReportPdfBtn", "snapshotExportActions", "snapshotPrintRoot", "printReport", "reportLogo", "reportTitle",
      "integratedComparisonPages",
      "reportSubtitle", "reportPreparedBy", "generatedDate", "reportSource",
      "reportNotice", "monthLabels", "kpiCards", "newProspectsSection", "newProspectsHead", "newProspectsBody", "topPlayersGrid",
      "playerBookingHead", "playerBookingBody", "agentMonthlyGrid",
      "historyList",
      "exportPptBtn", "copyTeamMessageBtn", "teamShareCopy",
      "playerNameMapSelect", "dealNameMapSelect", "propertyMapSelect", "openFullMappingBtn", "playerMappingStatus",
      "comparison1From", "comparison1To", "comparison2From", "comparison2To",
      "comparison3From", "comparison3To", "comparison4From", "comparison4To",
      "comparison5From", "comparison5To", "comparison6From", "comparison6To", "comparisonExportPreview"
    ].forEach(id => { els[id] = document.getElementById(id); });
  }

  function bindEvents() {
    els.browseBtn.addEventListener("click", () => els.fileInput.click());
    els.dropZone.addEventListener("click", event => {
      if (!event.target.closest("button")) els.fileInput.click();
    });
    els.dropZone.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") els.fileInput.click();
    });
    els.fileInput.addEventListener("change", event => processFiles([...event.target.files]));

    ["dragenter", "dragover"].forEach(type => {
      els.dropZone.addEventListener(type, event => {
        event.preventDefault();
        els.dropZone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach(type => {
      els.dropZone.addEventListener(type, event => {
        event.preventDefault();
        els.dropZone.classList.remove("dragover");
      });
    });
    els.dropZone.addEventListener("drop", event => processFiles([...event.dataTransfer.files]));

    els.generateBtn.addEventListener("click", generateReport);
    els.loadSampleBtn.addEventListener("click", loadDemoData);
    els.printBtn.addEventListener("click", printReportWithoutBrowserFooter);
    els.allReportPdfBtn?.addEventListener("click", printReportWithoutBrowserFooter);
    els.exportExcelBtn.addEventListener("click", exportCurrentReport);
    els.exportPptBtn.addEventListener("click", exportCurrentPresentation);
    els.emailFormatBtn.addEventListener("click", openEmailExportPanel);
    els.suggestEmailDraftBtn?.addEventListener("click", () => {
      if (!state.currentReport) return;
      els.emailDraftMessage.value = suggestedEmailDraft(state.currentReport);
      renderEmailPreview(state.currentReport, true);
      showMessage("Suggested email draft added. You can edit it before copying.", "success");
    });
    els.emailDraftMessage?.addEventListener("input", () => {
      if (state.currentReport) renderEmailPreview(state.currentReport, true);
    });
    els.emailSubject?.addEventListener("input", () => {
      if (state.currentReport) renderEmailPreview(state.currentReport, true);
    });
    els.copyEmailBtn.addEventListener("click", copyEmailReport);
    els.downloadEmailBtn.addEventListener("click", downloadEmailReport);
    els.closeEmailPanelBtn.addEventListener("click", () => els.emailExportPanel.classList.add("hidden"));
    els.saveHistoryBtn.addEventListener("click", saveCurrentReport);
    els.copyTeamMessageBtn.addEventListener("click", copyTeamMessage);
    els.resetAppBtn.addEventListener("click", resetSession);
    els.useLatestMonthsBtn?.addEventListener("click", () => {
      applySmartReportingPeriodSuggestions({ force: true, persist: true });
      syncPlayerDatesFromSelectedComparisons({ silent: true, fallbackToUpload: true });
      renderComparisonExportPreview();
      updateExecutiveSnapshotButtons(state.currentReport);
      if (state.currentReport) {
        showMessage("Latest completed months suggested. Click Generate Monthly Report to refresh the report and exports.", "success");
      } else {
        showMessage("Latest completed months suggested for your new KPI report.", "success");
      }
    });

    els.fillComparisonHeaderBtn.addEventListener("click", () => {
      const selectedMonths = getSelectedReportMonthsFromInputs();
      if (selectedMonths.length < 3) {
        showMessage("Select at least three different report months first.", "error");
        return;
      }

      els.comparisonHeaderText.value = formatComparisonHeaderForMonths(selectedMonths);
      persistSettings();
      showMessage("Comparison header filled from all selected report months.", "success");
    });

    els.playerNameMapSelect.addEventListener("change", () => {
      state.mapping.playerName = els.playerNameMapSelect.value;
      syncMappingSelects();
      normalizeAllRows();
      updateMappingStatus();
      updatePriorityMappingStatus();
    });

    els.dealNameMapSelect.addEventListener("change", () => {
      state.mapping.dealName = els.dealNameMapSelect.value;
      syncMappingSelects();
      normalizeAllRows();
      updateMappingStatus();
      updatePriorityMappingStatus();
    });

    els.propertyMapSelect.addEventListener("change", () => {
      state.mapping.property = els.propertyMapSelect.value;
      syncMappingSelects();
      normalizeAllRows();
      updateFilterOptions();
      updateMappingStatus();
      updatePriorityMappingStatus();
    });

    els.openFullMappingBtn.addEventListener("click", () => {
      els.mappingDetails.open = true;
      els.mappingDetails.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    els.syncPlayerMonthsBtn?.addEventListener("click", () => {
      saveNewPlayerNameInputs();
      saveNewProspectInputs();
      saveTotalProspectInputs();
      const months = syncPlayerDatesFromSelectedComparisons();
      if (!months.length) {
        showMessage("Select report months or comparison pairs first.", "error");
        return;
      }
      showMessage(`New Player dates updated from the selected report: ${months.map(formatMonth).join(", ")}.`, "success");
    });

    els.refreshProspectMonthsBtn?.addEventListener("click", () => {
      saveNewPlayerNameInputs();
      saveNewProspectInputs();
      const months = syncProspectDatesFromUploadedKpi();
      if (!months.length) {
        showMessage("No valid Check-Out Date months were found. Review the Check-Out Date mapping or add a New Player month manually.", "error");
        return;
      }
      showMessage(`New Player dates updated from the KPI upload: ${months.map(formatMonth).join(", ")}.`, "success");
    });

    els.addProspectDateBtn?.addEventListener("click", () => {
      saveNewPlayerNameInputs();
      saveNewProspectInputs();
      const months = getProspectInputMonths();
      if (months.length >= 12) {
        showMessage("You can use up to 12 New Player months in one report.", "error");
        return;
      }
      const nextMonth = months.length ? incrementMonth(months[months.length - 1]) : toMonthInput(new Date());
      setProspectDates([...months, nextMonth]);
      renderProspectDateEditor();
      renderNewPlayerNameEditor();
      renderTotalProspectInputs();
      renderNewProspectInputMatrix();
    });

    els.prospectDateEditor?.addEventListener("change", event => {
      const input = event.target.closest("input[data-prospect-date-index]");
      if (!input) return;
      saveNewPlayerNameInputs();
      saveNewProspectInputs();
      const months = getProspectInputMonths();
      const index = Number(input.dataset.prospectDateIndex);
      const oldMonth = input.dataset.oldMonth || months[index] || "";
      const newMonth = input.value;
      if (!/^\d{4}-\d{2}$/.test(newMonth)) return;
      if (months.some((month, monthIndex) => month === newMonth && monthIndex !== index)) {
        showMessage("That New Player month is already included.", "error");
        renderProspectDateEditor();
        return;
      }
      replaceNewProspectMonth(oldMonth, newMonth);
      replaceNewPlayerNameMonth(oldMonth, newMonth);
      replaceTotalProspectMonth(oldMonth, newMonth);
      months[index] = newMonth;
      setProspectDates(months);
      renderProspectDateEditor();
      renderNewPlayerNameEditor();
      renderTotalProspectInputs();
      renderNewProspectInputMatrix();
      persistSettings();
    });

    els.prospectDateEditor?.addEventListener("click", event => {
      const button = event.target.closest("button[data-remove-prospect-date]");
      if (!button) return;
      saveNewPlayerNameInputs();
      saveNewProspectInputs();
      const months = getProspectInputMonths();
      const index = Number(button.dataset.removeProspectDate);
      months.splice(index, 1);
      setProspectDates(months);
      renderProspectDateEditor();
      renderNewPlayerNameEditor();
      renderTotalProspectInputs();
      renderNewProspectInputMatrix();
    });

    els.clearProspectEntriesBtn?.addEventListener("click", () => {
      const confirmed = window.confirm("Clear all saved New Player entries and editable monthly totals for every date?");
      if (!confirmed) return;
      localStorage.removeItem(STORAGE_KEYS.newProspects);
      localStorage.removeItem(STORAGE_KEYS.totalProspects);
      localStorage.removeItem(STORAGE_KEYS.newPlayerNames);
      renderNewPlayerNameEditor();
      renderTotalProspectInputs();
      renderNewProspectInputMatrix();
      showMessage("All saved New Player entries were cleared.", "success");
    });

    els.totalProspectEditor?.addEventListener("input", event => {
      const input = event.target.closest("input[data-total-prospect-month]");
      if (!input) return;
      saveTotalProspectInputs();
    });

    els.newPlayerNameEditor?.addEventListener("input", event => {
      const textarea = event.target.closest("textarea[data-player-name-month][data-player-name-executive]");
      if (!textarea) return;
      saveNewPlayerNameInputs();
      updateNewPlayerNameCounters();
      syncProspectCountsFromNameInputs(textarea);
    });

    els.prospectInputBody?.addEventListener("input", event => {
      if (!event.target.matches("input[data-prospect-month][data-prospect-executive]")) return;
      saveNewProspectInputs();
      updateNewProspectInputTotals();
    });

    [
      els.themeSelect, els.fontSelect, els.companyName, els.preparedBy,
      els.reportHeaderTitle, els.comparisonHeaderText, els.month1, els.month2, els.month3, els.month4,
      els.propertyFilter, els.currencyFilter,
      els.comparison1From, els.comparison1To, els.comparison2From, els.comparison2To,
      els.comparison3From, els.comparison3To, els.comparison4From, els.comparison4To,
      els.comparison5From, els.comparison5To, els.comparison6From, els.comparison6To
    ].forEach(input => input?.addEventListener("change", () => {
      persistSettings();
      const isPeriodInput = Boolean(input?.id?.startsWith("month") || input?.id?.startsWith("comparison"));
      if (isPeriodInput) {
        // Keep Manual New Players Added ready BEFORE Generate. Existing values are preserved by month.
        saveNewPlayerNameInputs();
        saveNewProspectInputs();
        saveTotalProspectInputs();
        syncPlayerDatesFromSelectedComparisons({ silent: true, fallbackToUpload: true });
      }
      renderComparisonExportPreview();
      if (input?.id?.startsWith("comparison")) updateExecutiveSnapshotButtons(state.currentReport);
    }));

    els.themeSelect.addEventListener("change", () => {
      document.body.dataset.theme = els.themeSelect.value;
    });

    els.fontSelect.addEventListener("change", () => {
      applyFontFamily(els.fontSelect.value);
    });
  }

  function defaultReportingPeriods(referenceDate = new Date()) {
    const currentYear = referenceDate.getFullYear();
    const currentMonthIndex = referenceDate.getMonth();
    const latestCompleted = new Date(currentYear, currentMonthIndex - 1, 1);
    const previousCompleted = new Date(currentYear, currentMonthIndex - 2, 1);
    const monthToken = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const priorYearToken = date => `${date.getFullYear() - 1}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const firstCurrent = monthToken(previousCompleted);
    const secondCurrent = monthToken(latestCompleted);
    return {
      month1: priorYearToken(previousCompleted),
      month2: firstCurrent,
      month3: priorYearToken(latestCompleted),
      month4: secondCurrent,
      comparison1From: priorYearToken(previousCompleted),
      comparison1To: firstCurrent,
      comparison2From: priorYearToken(latestCompleted),
      comparison2To: secondCurrent,
      comparison3From: firstCurrent,
      comparison3To: secondCurrent,
      smartPeriodKey: secondCurrent
    };
  }

  function applySmartReportingPeriodSuggestions({ force = false, persist = false } = {}) {
    const defaults = defaultReportingPeriods();
    const saved = safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {});
    const shouldRefresh = force || saved.smartPeriodKey !== defaults.smartPeriodKey;
    if (!shouldRefresh) return false;

    if (els.month1) els.month1.value = defaults.month1;
    if (els.month2) els.month2.value = defaults.month2;
    if (els.month3) els.month3.value = defaults.month3;
    if (els.month4) els.month4.value = defaults.month4;

    if (els.comparison1From) els.comparison1From.value = defaults.comparison1From;
    if (els.comparison1To) els.comparison1To.value = defaults.comparison1To;
    if (els.comparison2From) els.comparison2From.value = defaults.comparison2From;
    if (els.comparison2To) els.comparison2To.value = defaults.comparison2To;
    if (els.comparison3From) els.comparison3From.value = defaults.comparison3From;
    if (els.comparison3To) els.comparison3To.value = defaults.comparison3To;

    [4, 5, 6].forEach(number => {
      if (els[`comparison${number}From`]) els[`comparison${number}From`].value = "";
      if (els[`comparison${number}To`]) els[`comparison${number}To`].value = "";
    });

    if (els.comparisonHeaderText) els.comparisonHeaderText.value = "";
    if (persist) persistSettings();
    return true;
  }

  function setDefaultMonths() {
    const defaults = defaultReportingPeriods();
    if (els.month1) els.month1.value = defaults.month1;
    if (els.month2) els.month2.value = defaults.month2;
    if (els.month3) els.month3.value = defaults.month3;
    if (els.month4) els.month4.value = defaults.month4;
  }

  function loadSettings() {
    const settings = safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {});
    Object.entries(settings).forEach(([key, value]) => {
      if (els[key] && value !== undefined && value !== null) els[key].value = value;
    });
    document.body.dataset.theme = els.themeSelect.value;
    applyFontFamily(els.fontSelect.value || "Inter");
    const defaults = defaultReportingPeriods();
    if (!els.comparison1From.value) els.comparison1From.value = defaults.comparison1From;
    if (!els.comparison1To.value) els.comparison1To.value = defaults.comparison1To;
    if (!els.comparison2From.value) els.comparison2From.value = defaults.comparison2From;
    if (!els.comparison2To.value) els.comparison2To.value = defaults.comparison2To;
    if (!els.comparison3From.value) els.comparison3From.value = defaults.comparison3From;
    if (!els.comparison3To.value) els.comparison3To.value = defaults.comparison3To;
    if (els.month3 && !els.month3.value) els.month3.value = defaults.month3;
    if (els.month4 && !els.month4.value) els.month4.value = defaults.month4;

    // On the first launch of a new reporting month, refresh stale saved dates
    // to the latest two completed months and their prior-year counterparts.
    // Manual choices remain intact for the rest of that reporting month.
    applySmartReportingPeriodSuggestions({ persist: true });
  }

  function persistSettings() {
    const settings = {
      themeSelect: els.themeSelect.value,
      fontSelect: els.fontSelect.value,
      companyName: els.companyName.value.trim(),
      preparedBy: els.preparedBy.value.trim(),
      reportHeaderTitle: els.reportHeaderTitle.value.trim(),
      comparisonHeaderText: els.comparisonHeaderText.value.trim(),
      month1: els.month1.value,
      month2: els.month2.value,
      month3: els.month3.value,
      month4: els.month4.value,
      propertyFilter: els.propertyFilter.value,
      currencyFilter: els.currencyFilter.value,
      comparison1From: els.comparison1From.value,
      comparison1To: els.comparison1To.value,
      comparison2From: els.comparison2From.value,
      comparison2To: els.comparison2To.value,
      comparison3From: els.comparison3From.value,
      comparison3To: els.comparison3To.value,
      comparison4From: els.comparison4From.value,
      comparison4To: els.comparison4To.value,
      comparison5From: els.comparison5From.value,
      comparison5To: els.comparison5To.value,
      comparison6From: els.comparison6From.value,
      comparison6To: els.comparison6To.value,
      smartPeriodKey: defaultReportingPeriods().smartPeriodKey
    };
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }

  async function processFiles(files) {
    const supported = files.filter(file => /\.(csv|xlsx|xls)$/i.test(file.name));
    if (!supported.length) {
      showMessage("Please select a CSV, XLSX, or XLS file.", "error");
      return;
    }
    if (typeof XLSX === "undefined") {
      showMessage("The spreadsheet reader did not load. Check your internet connection and refresh.", "error");
      return;
    }

    setLoading(true, "Reading files...");
    try {
      const combinedRows = [];
      const fileSummaries = [];

      for (const file of supported) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array", cellDates: true });

        let fileRows = 0;
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
          rows.forEach(row => {
            row.__sourceFile = file.name;
            row.__sourceSheet = sheetName;
          });
          fileRows += rows.length;
          combinedRows.push(...rows);
        });

        fileSummaries.push({
          name: file.name,
          size: file.size,
          rows: fileRows
        });
      }

      if (!combinedRows.length) throw new Error("No data rows were found in the uploaded file.");

      state.sourceRows = combinedRows;
      state.files = fileSummaries;
      state.headers = collectHeaders(combinedRows);
      state.mapping = autoDetectMapping(state.headers);
      normalizeAllRows();
      syncPlayerDatesFromSelectedComparisons({ silent: true, fallbackToUpload: true });
      renderFiles();
      renderMappingGrid();
      renderPriorityMapping();
      updateFilterOptions();
      updateMappingStatus();
      updateFileStatus();
      els.generateBtn.disabled = false;
      showMessage(`${formatInteger(state.sourceRows.length)} rows loaded. Review the detected columns, then generate the report.`, "success");
    } catch (error) {
      console.error(error);
      showMessage(error.message || "The file could not be read.", "error");
    } finally {
      setLoading(false);
    }
  }

  function collectHeaders(rows) {
    const headers = new Set();
    rows.forEach(row => Object.keys(row).forEach(key => {
      if (!key.startsWith("__")) headers.add(key);
    }));
    return [...headers];
  }

  function autoDetectMapping(headers) {
    const result = {};
    Object.entries(FIELD_CONFIG).forEach(([field, config]) => {
      result[field] = findBestHeader(headers, config.aliases);
    });

    const exactHeader = expectedName => headers.find(
      header => normalizeHeader(header) === normalizeHeader(expectedName)
    ) || "";

    result.playerName =
      exactHeader("PRIMARY CONTACT FULL NAME") ||
      exactHeader("PLAYER FULL NAME") ||
      exactHeader("FULL NAME") ||
      result.playerName;

    result.dealName =
      exactHeader("DEAL NAME") ||
      result.dealName;

    result.property =
      exactHeader("PROPERTY") ||
      result.property;

    return result;
  }

  function findBestHeader(headers, aliases) {
    const normalizedHeaders = headers.map(header => ({
      original: header,
      normalized: normalizeHeader(header)
    }));

    for (const alias of aliases) {
      const exact = normalizedHeaders.find(item => item.normalized === normalizeHeader(alias));
      if (exact) return exact.original;
    }

    for (const alias of aliases) {
      const aliasNormalized = normalizeHeader(alias);
      const partial = normalizedHeaders.find(item =>
        item.normalized.includes(aliasNormalized) || aliasNormalized.includes(item.normalized)
      );
      if (partial) return partial.original;
    }

    return "";
  }

  function renderMappingGrid() {
    els.mappingGrid.innerHTML = "";
    Object.entries(FIELD_CONFIG).forEach(([field, config]) => {
      const label = document.createElement("label");
      label.className = "mapping-field";

      const span = document.createElement("span");
      span.className = "mapping-label";
      span.textContent = `${config.label}${config.required ? " *" : ""}`;

      const select = document.createElement("select");
      select.className = "mapping-select";
      select.dataset.field = field;
      select.innerHTML = `<option value="">Not mapped</option>` +
        state.headers.map(header =>
          `<option value="${escapeHtml(header)}">${escapeHtml(header)}</option>`
        ).join("");
      select.value = state.mapping[field] || "";
      select.addEventListener("change", () => {
        state.mapping[field] = select.value;
        syncMappingSelects();
        normalizeAllRows();
        if (field === "checkoutDate") syncPlayerDatesFromSelectedComparisons({ silent: true, fallbackToUpload: true });
        updateFilterOptions();
        updateMappingStatus();
        updatePriorityMappingStatus();
      });

      label.append(span, select);
      els.mappingGrid.appendChild(label);
    });
  }

  function renderPriorityMapping() {
    const options = state.headers.map(header =>
      `<option value="${escapeHtml(header)}">${escapeHtml(header)}</option>`
    ).join("");

    els.playerNameMapSelect.innerHTML =
      `<option value="">Select Player Full Name column</option>${options}`;
    els.dealNameMapSelect.innerHTML =
      `<option value="">Select Deal Name column</option>${options}`;
    els.propertyMapSelect.innerHTML =
      `<option value="">Select Property column</option>${options}`;

    els.playerNameMapSelect.value = state.mapping.playerName || "";
    els.dealNameMapSelect.value = state.mapping.dealName || "";
    els.propertyMapSelect.value = state.mapping.property || "";
    updatePriorityMappingStatus();
  }

  function syncMappingSelects() {
    const playerSelect = els.mappingGrid.querySelector('[data-field="playerName"]');
    const dealSelect = els.mappingGrid.querySelector('[data-field="dealName"]');
    const propertySelect = els.mappingGrid.querySelector('[data-field="property"]');

    if (playerSelect) playerSelect.value = state.mapping.playerName || "";
    if (dealSelect) dealSelect.value = state.mapping.dealName || "";
    if (propertySelect) propertySelect.value = state.mapping.property || "";

    els.playerNameMapSelect.value = state.mapping.playerName || "";
    els.dealNameMapSelect.value = state.mapping.dealName || "";
    els.propertyMapSelect.value = state.mapping.property || "";
  }

  function updatePriorityMappingStatus() {
    if (!state.headers.length) {
      setPill(els.playerMappingStatus, "Waiting for file", "neutral");
      return;
    }

    const playerHeader = state.mapping.playerName || "";
    const dealHeader = state.mapping.dealName || "";
    const propertyHeader = state.mapping.property || "";
    const playerIsDealName = normalizeHeader(playerHeader).includes("deal name");

    if (!playerHeader || !dealHeader || !propertyHeader) {
      setPill(els.playerMappingStatus, "Select all 3 columns", "warning");
    } else if (playerIsDealName) {
      setPill(els.playerMappingStatus, "Full Name cannot be Deal Name", "danger");
    } else {
      setPill(els.playerMappingStatus, "Deal, Name, and Property mapped", "success");
    }
  }

  function looksLikeDealName(value) {
    const text = cleanText(value);
    return (
      /\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/.test(text) &&
      /\s-\s/.test(text)
    );
  }

  function updateMappingStatus() {
    const missingRequired = Object.entries(FIELD_CONFIG)
      .filter(([, config]) => config.required)
      .filter(([field]) => !state.mapping[field]);

    if (!state.headers.length) {
      setPill(els.mappingBadge, "Waiting for file", "neutral");
    } else if (missingRequired.length) {
      setPill(els.mappingBadge, `${missingRequired.length} required missing`, "danger");
      els.mappingDetails.open = true;
    } else {
      setPill(els.mappingBadge, "Columns detected", "success");
    }
  }

  function normalizeAllRows() {
    state.normalizedRows = state.sourceRows.map((row, index) => {
      const normalized = { __row: index + 2, __sourceFile: row.__sourceFile || "", __sourceSheet: row.__sourceSheet || "" };
      Object.keys(FIELD_CONFIG).forEach(field => {
        normalized[field] = readMappedValue(row, field);
      });
      normalized.checkoutDate = parseDate(normalized.checkoutDate);
      ["credit", "frontMoney", "bankroll", "playerWinLoss", "theoretical", "commission"].forEach(field => {
        normalized[field] = parseNumber(normalized[field]);
      });
      normalized.dealName = cleanText(normalized.dealName);
      normalized.firstName = cleanText(normalized.firstName);
      normalized.lastName = cleanText(normalized.lastName);
      normalized.playerName = cleanText(normalized.playerName);
      if (!normalized.playerName) {
        normalized.playerName = cleanText(`${normalized.firstName} ${normalized.lastName}`);
      }
      normalized.bookingAgent = cleanText(normalized.bookingAgent);
      normalized.dealOwner = cleanText(normalized.dealOwner);
      normalized.tripContact = cleanText(normalized.tripContact);
      normalized.playerOwner = cleanText(normalized.playerOwner);
      normalized.property = cleanText(normalized.property);
      normalized.currency = cleanText(normalized.currency).toUpperCase();
      normalized.bookingStatus = cleanText(normalized.bookingStatus);
      normalized.playRatingComplete = cleanText(normalized.playRatingComplete);
      return normalized;
    });
  }

  function readMappedValue(row, field) {
    const selectedHeader = state.mapping[field];
    if (selectedHeader && !isBlank(row[selectedHeader])) return row[selectedHeader];

    const aliases = FIELD_CONFIG[field].aliases.map(normalizeHeader);
    const matchingKey = Object.keys(row).find(key => aliases.includes(normalizeHeader(key)));
    return matchingKey ? row[matchingKey] : "";
  }

  function updateFilterOptions() {
    populateSelect(
      els.propertyFilter,
      uniqueSorted(state.normalizedRows.map(row => row.property).filter(Boolean)),
      "All Properties"
    );
    populateSelect(
      els.currencyFilter,
      uniqueSorted(state.normalizedRows.map(row => row.currency).filter(Boolean)),
      "All Currencies"
    );
  }

  function populateSelect(select, values, allLabel) {
    const previous = select.value;
    select.innerHTML = `<option value="">${allLabel}</option>` +
      values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
    if (values.includes(previous)) select.value = previous;
  }

  function renderFiles() {
    els.uploadedFiles.innerHTML = state.files.map(file => `
      <div class="file-item">
        <strong>${escapeHtml(file.name)}</strong>
        <small>${formatInteger(file.rows)} rows · ${formatFileSize(file.size)}</small>
      </div>
    `).join("");
  }

  function updateFileStatus() {
    if (!state.files.length) {
      setPill(els.fileStatus, "No file uploaded", "neutral");
      return;
    }
    setPill(
      els.fileStatus,
      `${state.files.length} file${state.files.length === 1 ? "" : "s"} · ${formatInteger(state.sourceRows.length)} rows`,
      "success"
    );
  }

  function generateReport() {
    // Capture Manual New Players Added immediately before building the report.
    // This guarantees the values typed before Generate are included even if the user clicks Generate right away.
    saveNewPlayerNameInputs();
    syncProspectCountsFromNameInputs();
    saveNewProspectInputs();
    saveTotalProspectInputs();

    const missingRequired = Object.entries(FIELD_CONFIG)
      .filter(([, config]) => config.required)
      .filter(([field]) => !state.mapping[field]);

    const hasFullNameMapping = Boolean(
      state.mapping.playerName ||
      (state.mapping.firstName && state.mapping.lastName)
    );

    if (!hasFullNameMapping) {
      missingRequired.push(["playerName", FIELD_CONFIG.playerName]);
    }

    if (!state.mapping.dealName) {
      missingRequired.push(["dealName", FIELD_CONFIG.dealName]);
    }

    if (!state.mapping.property) {
      missingRequired.push(["property", FIELD_CONFIG.property]);
    }

    const hasBookingExecutiveMapping = Boolean(
      state.mapping.dealOwner || state.mapping.tripContact || state.mapping.bookingAgent
    );
    if (!hasBookingExecutiveMapping) {
      missingRequired.push(["bookingExecutive", { label: "Deal Owner / Trip Contact" }]);
    }

    if (state.mapping.playerName && normalizeHeader(state.mapping.playerName).includes("deal name")) {
      showMessage("Player Name cannot be mapped to Deal Name. Select PRIMARY CONTACT FULL NAME in Player Booking Mapping.", "error");
      els.playerNameMapSelect.focus();
      return;
    }

    const exactDealNameHeader = state.headers.find(
      header => normalizeHeader(header) === "deal name"
    );

    if (
      exactDealNameHeader &&
      normalizeHeader(state.mapping.dealName) !== normalizeHeader(exactDealNameHeader)
    ) {
      showMessage("For W/L and Theoretical, Deal Name Source must be mapped to the DEAL NAME column so the property, player, and date appear.", "error");
      els.dealNameMapSelect.value = exactDealNameHeader;
      state.mapping.dealName = exactDealNameHeader;
      syncMappingSelects();
      normalizeAllRows();
      els.dealNameMapSelect.focus();
      return;
    }

    if (
      state.mapping.dealName &&
      state.mapping.playerName &&
      normalizeHeader(state.mapping.dealName) === normalizeHeader(state.mapping.playerName)
    ) {
      showMessage("Deal Name and Player Full Name cannot use the same column. Map Deal Name to DEAL NAME.", "error");
      els.dealNameMapSelect.focus();
      return;
    }

    const previewNames = state.normalizedRows
      .map(row => row.playerName)
      .filter(Boolean)
      .slice(0, 50);
    const dealLikeCount = previewNames.filter(looksLikeDealName).length;

    if (previewNames.length && dealLikeCount / previewNames.length >= 0.3) {
      showMessage("The selected Player Name column looks like Deal Name because it contains property codes and dates. Map Player Name to PRIMARY CONTACT FULL NAME.", "error");
      els.playerNameMapSelect.focus();
      return;
    }

    if (missingRequired.length) {
      const missingLabels = [...new Set(missingRequired.map(([field, config]) =>
        field === "playerName"
          ? "Player Full Name or Player First Name + Player Last Name"
          : field === "dealName"
            ? "Deal Name"
            : field === "property"
              ? "Property"
              : config.label
      ))];
      showMessage(`Map these required fields first: ${missingLabels.join(", ")}.`, "error");
      els.mappingDetails.open = true;
      return;
    }
    const selectedReportMonths = getSelectedReportMonthsFromInputs();
    if (selectedReportMonths.length < 3) {
      showMessage("Select at least three different report months before generating the report.", "error");
      return;
    }
    if (!state.normalizedRows.length) {
      showMessage("Upload a PipelineCRM export first.", "error");
      return;
    }

    persistSettings();

    const settings = getReportSettings();
    const eligibleRowsBeforeDedupe = state.normalizedRows.filter(row => isEligibleRow(row, settings));
    const dedupeResult = dedupeRowsByDealName(eligibleRowsBeforeDedupe);
    const eligibleRows = dedupeResult.rows;
    const analysisMonths = getAnalysisMonths(settings);

    const monthlyData = analysisMonths.map(month => {
      const rows = eligibleRows.filter(row => isInMonth(row.checkoutDate, month));
      const allPlayers = groupAllPlayers(rows);
      return {
        month,
        summary: summarizeMonth(rows),
        topPlayers: groupTopPlayers(rows),
        playerBookings: allPlayers,
        agents: groupAgents(rows),
        properties: groupProperties(rows)
      };
    });

    const primary1 = monthlyData.find(item => item.month === settings.month1) || {
      summary: summarizeMonth([]), topPlayers: [], agents: [], properties: []
    };
    const primary2 = monthlyData.find(item => item.month === settings.month2) || {
      summary: summarizeMonth([]), topPlayers: [], agents: [], properties: []
    };

    const reportRows = eligibleRows.filter(row =>
      analysisMonths.some(month => isInMonth(row.checkoutDate, month))
    );

    const report = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      generatedAt: new Date().toISOString(),
      companyName: settings.companyName,
      preparedBy: settings.preparedBy,
      reportHeaderTitle: settings.reportHeaderTitle,
      comparisonHeaderText: settings.comparisonHeaderText,
      reportMonths: settings.reportMonths,
      month1: settings.month1,
      month2: settings.month2,
      month3: settings.month3,
      month4: settings.month4,
      analysisMonths,
      monthlyData,
      property: settings.property,
      currency: settings.currency,
      newProspectMonths: settings.newProspectMonths,
      newProspects: normalizeNewProspectEntries(settings.newProspects, settings.newProspectMonths),
      totalProspects: normalizeTotalProspectEntries(settings.totalProspects, settings.newProspectMonths),
      sourceFiles: state.files.map(file => file.name),
      summary1: primary1.summary,
      summary2: primary2.summary,
      topPlayers1: primary1.topPlayers,
      topPlayers2: primary2.topPlayers,
      agents1: primary1.agents,
      agents2: primary2.agents,
      playerBookingSummary: buildPlayerBookingSummary(monthlyData),
      comparisons: settings.comparisons.map(pair => buildMonthComparison(pair.from, pair.to, eligibleRows)),
      duplicateDealsRemoved: dedupeResult.duplicateCount,
      quality: buildQualityChecks(state.normalizedRows),
      filteredRows: reportRows.map(serializeRow),
      negativeCounts: {
        credit: reportRows.filter(row => row.credit < 0).length,
        frontMoney: reportRows.filter(row => row.frontMoney < 0).length,
        bankroll: reportRows.filter(row => row.bankroll < 0).length,
        playerWinLoss: reportRows.filter(row => row.playerWinLoss < 0).length,
        theoretical: reportRows.filter(row => row.theoretical < 0).length,
        commission: reportRows.filter(row => row.commission < 0).length
      }
    };

    state.currentReport = report;
    renderReport(report);
    showMessage(`Report generated for ${analysisMonths.length} month${analysisMonths.length === 1 ? "" : "s"}.`, "success");
    els.reportSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getReportSettings() {
    return {
      companyName: els.companyName.value.trim() || "Pace Gaming",
      preparedBy: els.preparedBy.value.trim() || "Anne Joy",
      reportHeaderTitle: els.reportHeaderTitle.value.trim() || "Pace Gaming Internal KPI Report",
      comparisonHeaderText: els.comparisonHeaderText.value.trim(),
      reportMonths: getSelectedReportMonthsFromInputs(),
      month1: els.month1.value,
      month2: els.month2.value,
      month3: els.month3.value,
      month4: els.month4.value,
      property: els.propertyFilter.value,
      currency: els.currencyFilter.value,
      newProspectMonths: getProspectInputMonths(),
      newProspects: getNewProspectEntriesForMonths(getProspectInputMonths()),
      totalProspects: getTotalProspectEntriesForMonths(getProspectInputMonths()),
      comparisons: getComparisonSettings()
    };
  }

  function getSelectedReportMonthsFromInputs() {
    return [...new Set([
      els.month1?.value,
      els.month2?.value,
      els.month3?.value,
      els.month4?.value
    ].filter(Boolean))];
  }

  function getReportMonths(report) {
    const months = report?.reportMonths?.length
      ? report.reportMonths
      : [report?.month1, report?.month2, report?.month3, report?.month4].filter(Boolean);
    return [...new Set(months)];
  }

  function formatComparisonHeaderForMonths(months) {
    const labels = [...new Set((months || []).filter(Boolean))].map(formatMonth);
    const pairs = [];

    for (let index = 0; index < labels.length; index += 2) {
      const pair = labels.slice(index, index + 2);
      pairs.push(pair.length === 2 ? `${pair[0]} vs ${pair[1]}` : pair[0]);
    }

    return `Primary comparison: ${pairs.join(" · ")}`;
  }

  function formatSelectedComparisonHeader(report) {
    const pairs = getExecutiveSnapshotPairs(report);
    if (pairs.length) {
      return `Comparisons: ${pairs.map(pair => `${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}`).join(" · ")}`;
    }
    return formatComparisonHeaderForMonths(getReportMonths(report));
  }

  function reportMonthFileToken(report) {
    const months = getReportMonths(report);
    return months.length ? months.join("_") : "report";
  }

  function localExportDateToken(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}${day}`;
  }

  function cleanExportFileName(value) {
    return String(value || "")
      .replace(/[\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, " ")
      .replace(/\s*-\s*/g, " - ")
      .trim()
      .replace(/[. ]+$/g, "");
  }

  function comparisonLabelForPdf(report) {
    const reportMonths = new Set(getReportMonths(report));
    const fixedPairs = getExecutiveSnapshotPairs(report).filter(pair =>
      reportMonths.has(pair.fromMonth) && reportMonths.has(pair.toMonth)
    );

    if (fixedPairs.length) {
      return fixedPairs
        .map(pair => `${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}`)
        .join(" - ");
    }

    const labels = getReportMonths(report).map(formatMonth);
    const pairs = [];
    for (let index = 0; index < labels.length; index += 2) {
      const pair = labels.slice(index, index + 2);
      if (pair.length === 2) pairs.push(`${pair[0]} vs ${pair[1]}`);
      else if (pair.length === 1) pairs.push(pair[0]);
    }
    return pairs.join(" - ") || "Monthly Report";
  }

  function mainPdfExportTitle(report) {
    return cleanExportFileName(
      `${localExportDateToken()} - KPI - ${comparisonLabelForPdf(report)}`
    );
  }

  function snapshotPdfExportTitle(report, pair) {
    const comparison = `${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}`;
    return cleanExportFileName(
      `${localExportDateToken()} - KPI - ${comparison}`
    );
  }

  const NEW_PROSPECT_EXECUTIVES = ["DL", "KA", "SP", "CV", "LR", "TF", "KH"];

  function normalizeProspectDates(months) {
    return [...new Set((Array.isArray(months) ? months : [])
      .map(month => String(month || "").trim())
      .filter(month => /^\d{4}-\d{2}$/.test(month)))]
      .sort()
      .slice(0, 12);
  }

  function getStoredProspectDates() {
    return normalizeProspectDates(safeJsonParse(localStorage.getItem(STORAGE_KEYS.prospectDates), []));
  }

  function setProspectDates(months) {
    const normalized = normalizeProspectDates(months);
    localStorage.setItem(STORAGE_KEYS.prospectDates, JSON.stringify(normalized));
    return normalized;
  }

  function getUploadedKpiMonths() {
    return normalizeProspectDates(state.normalizedRows
      .filter(row => row.checkoutDate instanceof Date && !Number.isNaN(row.checkoutDate.getTime()))
      .map(row => toMonthInput(row.checkoutDate)));
  }

  function getProspectInputMonths() {
    const stored = getStoredProspectDates();
    if (stored.length) return stored;
    const selected = getSelectedPlayerInputMonths();
    if (selected.length) return selected;
    const uploaded = getUploadedKpiMonths();
    if (uploaded.length) return uploaded;
    return [];
  }

  function syncProspectDatesFromUploadedKpi({ silent = false } = {}) {
    const uploadedMonths = getUploadedKpiMonths();
    const fallbackMonths = normalizeProspectDates(getSelectedReportMonthsFromInputs());
    const months = uploadedMonths.length ? uploadedMonths : fallbackMonths;
    if (!months.length) return [];
    setProspectDates(months);
    renderProspectDateEditor();
    renderNewPlayerNameEditor();
    renderTotalProspectInputs();
    renderNewProspectInputMatrix();
    if (!silent) persistSettings();
    return months;
  }

  function getSelectedPlayerInputMonths() {
    const months = new Set(getSelectedReportMonthsFromInputs());
    getComparisonSettings().forEach(pair => {
      if (pair.from) months.add(pair.from);
      if (pair.to) months.add(pair.to);
    });
    return normalizeProspectDates([...months]);
  }

  function syncPlayerDatesFromSelectedComparisons({ silent = false, fallbackToUpload = false } = {}) {
    let months = getSelectedPlayerInputMonths();
    if (!months.length && fallbackToUpload) months = getUploadedKpiMonths();
    if (!months.length) return [];
    setProspectDates(months);
    renderProspectDateEditor();
    renderNewPlayerNameEditor();
    renderTotalProspectInputs();
    renderNewProspectInputMatrix();
    if (!silent) persistSettings();
    return months;
  }

  function renderComparisonExportPreview() {
    if (!els.comparisonExportPreview) return;
    const pairs = getSeparateComparisonPairs();
    if (!pairs.length) {
      els.comparisonExportPreview.innerHTML = `<span class="comparison-export-preview-empty">Add at least one complete comparison pair. After you generate the report, each pair can be downloaded as its own 2-page PDF.</span>`;
      return;
    }
    els.comparisonExportPreview.innerHTML = `
      <div class="comparison-export-preview-heading">
        <strong>Separate PDFs that will be available after Generate:</strong>
        <span>${pairs.length} comparison${pairs.length === 1 ? "" : "s"}</span>
      </div>
      <div class="comparison-export-preview-chips">
        ${pairs.map(pair => `<span class="comparison-export-chip">${escapeHtml(formatMonth(pair.fromMonth))} vs ${escapeHtml(formatMonth(pair.toMonth))}</span>`).join("")}
      </div>`;
  }

  function incrementMonth(month) {
    if (!/^\d{4}-\d{2}$/.test(month || "")) return toMonthInput(new Date());
    const [year, monthNumber] = month.split("-").map(Number);
    const date = new Date(year, monthNumber, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function renderProspectDateEditor() {
    if (!els.prospectDateEditor) return;
    const months = getProspectInputMonths();
    if (!months.length) {
      els.prospectDateEditor.innerHTML = `<p class="prospect-date-empty">Select report months, upload the KPI file, or click Add Player Month.</p>`;
      setPill(els.prospectMonthStatus, "Waiting for report months", "neutral");
      return;
    }
    els.prospectDateEditor.innerHTML = months.map((month, index) => `
      <div class="prospect-date-field">
        <label>
          <span>New Player Month ${index + 1}</span>
          <input type="month" value="${escapeHtml(month)}" data-old-month="${escapeHtml(month)}" data-prospect-date-index="${index}" aria-label="New Player Month ${index + 1}" />
        </label>
        <button class="prospect-date-remove" type="button" data-remove-prospect-date="${index}" aria-label="Remove ${escapeHtml(formatMonth(month))}">×</button>
      </div>
    `).join("");
    setPill(els.prospectMonthStatus, `${months.length} editable date${months.length === 1 ? "" : "s"}`, "success");
  }

  function normalizeTotalProspectEntries(entries, allowedMonths = []) {
    const allowed = new Set(normalizeProspectDates(allowedMonths));
    const source = Array.isArray(entries)
      ? entries
      : entries && typeof entries === "object"
        ? Object.entries(entries).map(([month, value]) => ({ month, value }))
        : [];
    const byMonth = new Map();
    source.forEach(entry => {
      const month = String(entry?.month || "").trim();
      const rawValue = entry?.value;
      if (!/^\d{4}-\d{2}$/.test(month)) return;
      if (allowed.size && !allowed.has(month)) return;
      if (rawValue === "" || rawValue === null || rawValue === undefined) return;
      const value = Number(rawValue);
      if (!Number.isFinite(value) || value < 0) return;
      byMonth.set(month, { month, value: Math.trunc(value) });
    });
    return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
  }

  function getAllStoredTotalProspectEntries() {
    return normalizeTotalProspectEntries(safeJsonParse(localStorage.getItem(STORAGE_KEYS.totalProspects), []), []);
  }

  function getTotalProspectEntriesForMonths(months) {
    return normalizeTotalProspectEntries(getAllStoredTotalProspectEntries(), months);
  }

  function getTotalProspectValue(entries, month) {
    const match = normalizeTotalProspectEntries(entries, []).find(entry => entry.month === month);
    return match ? match.value : null;
  }

  function replaceTotalProspectMonth(oldMonth, newMonth) {
    if (!oldMonth || !newMonth || oldMonth === newMonth) return;
    const changed = getAllStoredTotalProspectEntries().map(entry => entry.month === oldMonth ? { ...entry, month: newMonth } : entry);
    localStorage.setItem(STORAGE_KEYS.totalProspects, JSON.stringify(normalizeTotalProspectEntries(changed, [])));
  }

  function saveTotalProspectInputs() {
    if (!els.totalProspectEditor) return;
    const displayedMonths = new Set(getProspectInputMonths());
    const preserved = getAllStoredTotalProspectEntries().filter(entry => !displayedMonths.has(entry.month));
    const current = [...els.totalProspectEditor.querySelectorAll("input[data-total-prospect-month]")]
      .map(input => {
        if (input.value === "") return null;
        const value = Number(input.value);
        if (!Number.isFinite(value) || value < 0) return null;
        return { month: input.dataset.totalProspectMonth, value: Math.trunc(value) };
      })
      .filter(Boolean);
    localStorage.setItem(STORAGE_KEYS.totalProspects, JSON.stringify(normalizeTotalProspectEntries([...preserved, ...current], [])));
  }

  function renderTotalProspectInputs() {
    if (!els.totalProspectEditor) return;
    const months = getProspectInputMonths();
    const values = new Map(getTotalProspectEntriesForMonths(months).map(entry => [entry.month, entry.value]));
    if (!months.length) {
      els.totalProspectEditor.innerHTML = `<p class="prospect-date-empty">Select report months, upload the KPI file, or add a New Player month to enter the editable total.</p>`;
      return;
    }
    els.totalProspectEditor.innerHTML = months.map(month => `
      <label class="total-prospect-field">
        <span>${escapeHtml(formatMonth(month))}</span>
        <input type="number" min="0" step="1" inputmode="numeric" data-total-prospect-month="${escapeHtml(month)}" value="${values.has(month) ? escapeHtml(String(values.get(month))) : ""}" placeholder="Enter official total" aria-label="${escapeHtml(`Editable total new players added for ${formatMonth(month)}`)}" />
      </label>`).join("");
  }

  function normalizeNewPlayerNameEntries(entries, allowedMonths = []) {
    const allowed = new Set(normalizeProspectDates(allowedMonths));
    const byKey = new Map();
    (Array.isArray(entries) ? entries : []).forEach(entry => {
      const month = String(entry?.month || "").trim();
      const executive = String(entry?.executive || "").trim().toUpperCase();
      const name = cleanText(entry?.name || "");
      if (!/^\d{4}-\d{2}$/.test(month)) return;
      if (allowed.size && !allowed.has(month)) return;
      if (!NEW_PROSPECT_EXECUTIVES.includes(executive)) return;
      if (!name) return;
      const normalizedName = name.toLocaleLowerCase();
      byKey.set(`${month}|${executive}|${normalizedName}`, { month, executive, name });
    });
    return [...byKey.values()].sort((a, b) => {
      const monthOrder = a.month.localeCompare(b.month);
      if (monthOrder) return monthOrder;
      const executiveOrder = NEW_PROSPECT_EXECUTIVES.indexOf(a.executive) - NEW_PROSPECT_EXECUTIVES.indexOf(b.executive);
      if (executiveOrder) return executiveOrder;
      return a.name.localeCompare(b.name);
    });
  }

  function getAllStoredNewPlayerNameEntries() {
    return normalizeNewPlayerNameEntries(safeJsonParse(localStorage.getItem(STORAGE_KEYS.newPlayerNames), []), []);
  }

  function getNewPlayerNameEntriesForMonths(months) {
    return normalizeNewPlayerNameEntries(getAllStoredNewPlayerNameEntries(), months);
  }

  function replaceNewPlayerNameMonth(oldMonth, newMonth) {
    if (!oldMonth || !newMonth || oldMonth === newMonth) return;
    const changed = getAllStoredNewPlayerNameEntries().map(entry => entry.month === oldMonth ? { ...entry, month: newMonth } : entry);
    localStorage.setItem(STORAGE_KEYS.newPlayerNames, JSON.stringify(normalizeNewPlayerNameEntries(changed, [])));
  }

  function saveNewPlayerNameInputs() {
    if (!els.newPlayerNameEditor) return;
    const displayedMonths = new Set(getProspectInputMonths());
    const preserved = getAllStoredNewPlayerNameEntries().filter(entry => !displayedMonths.has(entry.month));
    const current = [];
    els.newPlayerNameEditor.querySelectorAll("textarea[data-player-name-month][data-player-name-executive]").forEach(textarea => {
      const month = textarea.dataset.playerNameMonth;
      const executive = textarea.dataset.playerNameExecutive;
      const seen = new Set();
      String(textarea.value || "").split(/\r?\n/).forEach(rawName => {
        const name = cleanText(rawName);
        if (!name) return;
        const key = name.toLocaleLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        current.push({ month, executive, name });
      });
    });
    localStorage.setItem(STORAGE_KEYS.newPlayerNames, JSON.stringify(normalizeNewPlayerNameEntries([...preserved, ...current], [])));
  }

  function newPlayerNamesForCell(entries, month, executive) {
    return entries
      .filter(entry => entry.month === month && entry.executive === executive)
      .map(entry => entry.name);
  }

  function updateNewPlayerNameCounters() {
    if (!els.newPlayerNameEditor) return;
    let overall = 0;
    getProspectInputMonths().forEach(month => {
      let monthTotal = 0;
      NEW_PROSPECT_EXECUTIVES.forEach(executive => {
        const textarea = els.newPlayerNameEditor.querySelector(`textarea[data-player-name-month="${CSS.escape(month)}"][data-player-name-executive="${CSS.escape(executive)}"]`);
        if (!textarea) return;
        const names = [...new Set(String(textarea.value || "").split(/\r?\n/).map(cleanText).filter(Boolean).map(name => name.toLocaleLowerCase()))];
        const count = names.length;
        monthTotal += count;
        const countEl = els.newPlayerNameEditor.querySelector(`[data-player-name-count="${CSS.escape(month)}|${CSS.escape(executive)}"]`);
        if (countEl) countEl.textContent = `${count} player${count === 1 ? "" : "s"}`;
      });
      overall += monthTotal;
      const totalEl = els.newPlayerNameEditor.querySelector(`[data-player-name-month-total="${CSS.escape(month)}"]`);
      if (totalEl) totalEl.textContent = `${formatInteger(monthTotal)} named player${monthTotal === 1 ? "" : "s"}`;
    });
    const overallEl = els.newPlayerNameEditor.querySelector("[data-player-name-overall-total]");
    if (overallEl) overallEl.textContent = `${formatInteger(overall)} named player${overall === 1 ? "" : "s"}`;
  }

  function syncProspectCountsFromNameInputs(targetTextarea = null) {
    if (!els.newPlayerNameEditor || !els.prospectInputBody) return;
    const textareas = targetTextarea
      ? [targetTextarea]
      : [...els.newPlayerNameEditor.querySelectorAll("textarea[data-player-name-month][data-player-name-executive]")];
    textareas.forEach(textarea => {
      const month = textarea.dataset.playerNameMonth;
      const executive = textarea.dataset.playerNameExecutive;
      const names = [...new Set(String(textarea.value || "").split(/\r?\n/).map(cleanText).filter(Boolean).map(name => name.toLocaleLowerCase()))];
      const countInput = els.prospectInputBody.querySelector(`input[data-prospect-month="${CSS.escape(month)}"][data-prospect-executive="${CSS.escape(executive)}"]`);
      if (!countInput) return;
      if (names.length) {
        countInput.value = String(names.length);
      } else if (targetTextarea) {
        // If the user clears a specific names box, clear the auto-derived count for that same box.
        // During Generate (targetTextarea is null), blank name boxes do not erase manually entered counts.
        countInput.value = "";
      }
    });
    saveNewProspectInputs();
    updateNewProspectInputTotals();
  }

  function renderNewPlayerNameEditor() {
    if (!els.newPlayerNameEditor) return;
    const months = getProspectInputMonths();
    const entries = getNewPlayerNameEntriesForMonths(months);
    if (!months.length) {
      els.newPlayerNameEditor.innerHTML = `<p class="prospect-date-empty">Select report months, upload the KPI file, or add a New Player month to enter player names.</p>`;
      return;
    }
    els.newPlayerNameEditor.innerHTML = `
      <div class="new-player-name-editor-header">
        <div><strong>Player names are internal only.</strong><span>Enter one player per line. Names are never included in the team PDF or email report.</span></div>
        <span class="new-player-name-overall-total" data-player-name-overall-total>0 named players</span>
      </div>
      <div class="new-player-name-months">
        ${months.map(month => `
          <section class="new-player-name-month-card">
            <div class="new-player-name-month-heading">
              <h5>${escapeHtml(formatMonth(month))}</h5>
              <span data-player-name-month-total="${escapeHtml(month)}">0 named players</span>
            </div>
            <div class="new-player-name-grid">
              ${NEW_PROSPECT_EXECUTIVES.map(executive => {
                const names = newPlayerNamesForCell(entries, month, executive);
                return `<label class="new-player-name-field">
                  <span><strong>${escapeHtml(executive)}</strong><small data-player-name-count="${escapeHtml(month)}|${escapeHtml(executive)}">${names.length} player${names.length === 1 ? "" : "s"}</small></span>
                  <textarea rows="4" data-player-name-month="${escapeHtml(month)}" data-player-name-executive="${escapeHtml(executive)}" placeholder="One player name per line" aria-label="${escapeHtml(`${executive} newly added player names for ${formatMonth(month)}`)}">${escapeHtml(names.join("\n"))}</textarea>
                </label>`;
              }).join("")}
            </div>
          </section>`).join("")}
      </div>`;
    updateNewPlayerNameCounters();
  }

  function normalizeNewProspectEntries(entries, allowedMonths = []) {
    const allowed = new Set((allowedMonths || []).filter(Boolean));
    const byKey = new Map();
    (Array.isArray(entries) ? entries : []).forEach(entry => {
      let month = String(entry?.month || "").trim();
      const executive = String(entry?.executive || "").trim().toUpperCase();
      if (!month && allowed.size) month = [...allowed][0];
      if (!/^\d{4}-\d{2}$/.test(month)) return;
      if (allowed.size && !allowed.has(month)) return;
      if (!NEW_PROSPECT_EXECUTIVES.includes(executive)) return;
      if (entry?.value === "" || entry?.value === null || entry?.value === undefined) return;
      const numericValue = Number(entry.value);
      if (!Number.isFinite(numericValue)) return;
      byKey.set(`${month}|${executive}`, { month, executive, value: Math.max(0, Math.trunc(numericValue)) });
    });
    return [...byKey.values()].sort((a, b) => {
      const monthOrder = a.month.localeCompare(b.month);
      return monthOrder || NEW_PROSPECT_EXECUTIVES.indexOf(a.executive) - NEW_PROSPECT_EXECUTIVES.indexOf(b.executive);
    });
  }

  function getAllStoredNewProspectEntries() {
    return normalizeNewProspectEntries(safeJsonParse(localStorage.getItem(STORAGE_KEYS.newProspects), []), []);
  }

  function getNewProspectEntriesForMonths(months) {
    return normalizeNewProspectEntries(getAllStoredNewProspectEntries(), months);
  }

  function replaceNewProspectMonth(oldMonth, newMonth) {
    if (!oldMonth || !newMonth || oldMonth === newMonth) return;
    const changed = getAllStoredNewProspectEntries().map(entry => entry.month === oldMonth ? { ...entry, month: newMonth } : entry);
    localStorage.setItem(STORAGE_KEYS.newProspects, JSON.stringify(normalizeNewProspectEntries(changed, [])));
  }

  function saveNewProspectInputs() {
    if (!els.prospectInputBody) return;
    const displayedMonths = getProspectInputMonths();
    const displayedSet = new Set(displayedMonths);
    const preserved = getAllStoredNewProspectEntries().filter(entry => !displayedSet.has(entry.month));
    const current = [...els.prospectInputBody.querySelectorAll("input[data-prospect-month][data-prospect-executive]")]
      .map(input => {
        const rawValue = input.value.trim();
        if (rawValue === "") return null;
        const numericValue = Number(rawValue);
        if (!Number.isFinite(numericValue)) return null;
        return { month: input.dataset.prospectMonth, executive: input.dataset.prospectExecutive, value: Math.max(0, Math.trunc(numericValue)) };
      }).filter(Boolean);
    localStorage.setItem(STORAGE_KEYS.newProspects, JSON.stringify(normalizeNewProspectEntries([...preserved, ...current], [])));
  }

  function updateNewProspectInputTotals() {
    if (!els.prospectInputBody) return;
    const months = getProspectInputMonths();
    const monthTotals = Object.fromEntries(months.map(month => [month, 0]));
    let grandTotal = 0;
    NEW_PROSPECT_EXECUTIVES.forEach(executive => {
      let rowTotal = 0;
      months.forEach(month => {
        const input = els.prospectInputBody.querySelector(`input[data-prospect-month="${CSS.escape(month)}"][data-prospect-executive="${CSS.escape(executive)}"]`);
        const value = input && input.value.trim() !== "" ? Number(input.value) : 0;
        if (Number.isFinite(value)) {
          rowTotal += Math.max(0, Math.trunc(value));
          monthTotals[month] += Math.max(0, Math.trunc(value));
        }
      });
      const cell = els.prospectInputBody.querySelector(`[data-prospect-row-total="${CSS.escape(executive)}"]`);
      if (cell) cell.textContent = formatInteger(rowTotal);
      grandTotal += rowTotal;
    });
    months.forEach(month => {
      const cell = els.prospectInputBody.querySelector(`[data-prospect-month-total="${CSS.escape(month)}"]`);
      if (cell) cell.textContent = formatInteger(monthTotals[month]);
    });
    const grandCell = els.prospectInputBody.querySelector("[data-prospect-grand-total]");
    if (grandCell) grandCell.textContent = formatInteger(grandTotal);
  }

  function renderNewProspectInputMatrix() {
    if (!els.prospectInputHead || !els.prospectInputBody) return;
    const months = getProspectInputMonths();
    const entries = getNewProspectEntriesForMonths(months);
    const values = new Map(entries.map(entry => [`${entry.month}|${entry.executive}`, entry.value]));
    if (!months.length) {
      els.prospectInputHead.innerHTML = "";
      els.prospectInputBody.innerHTML = `<tr><td class="prospect-empty-state">Select report months or add a New Player month to begin.</td></tr>`;
      setPill(els.prospectMonthStatus, "Waiting for report months", "neutral");
      return;
    }
    els.prospectInputHead.innerHTML = `<tr><th>Executive</th>${months.map(month => `<th>${escapeHtml(formatMonth(month))}</th>`).join("")}<th class="prospect-total-column">Total</th></tr>`;
    const executiveRows = NEW_PROSPECT_EXECUTIVES.map(executive => `
      <tr>
        <th scope="row">${escapeHtml(executive)}</th>
        ${months.map(month => {
          const key = `${month}|${executive}`;
          return `<td><input type="number" min="0" step="1" inputmode="numeric" data-prospect-month="${escapeHtml(month)}" data-prospect-executive="${escapeHtml(executive)}" value="${values.has(key) ? escapeHtml(String(values.get(key))) : ""}" placeholder="Blank" aria-label="${escapeHtml(`${executive} new players for ${formatMonth(month)}`)}" /></td>`;
        }).join("")}
        <td class="prospect-row-total" data-prospect-row-total="${escapeHtml(executive)}">0</td>
      </tr>`).join("");
    const totalsRow = `<tr class="prospect-live-total-row"><th scope="row">TOTAL</th>${months.map(month => `<td data-prospect-month-total="${escapeHtml(month)}">0</td>`).join("")}<td data-prospect-grand-total>0</td></tr>`;
    els.prospectInputBody.innerHTML = executiveRows + totalsRow;
    setPill(els.prospectMonthStatus, `${months.length} editable date${months.length === 1 ? "" : "s"}`, "success");
    updateNewProspectInputTotals();
  }

  function buildNewProspectMatrix(entries, months) {
    const normalizedMonths = normalizeProspectDates(months);
    const normalized = normalizeNewProspectEntries(entries, normalizedMonths);
    const values = new Map(normalized.map(entry => [`${entry.month}|${entry.executive}`, entry.value]));
    const executives = NEW_PROSPECT_EXECUTIVES.filter(executive => normalizedMonths.some(month => values.has(`${month}|${executive}`)));
    const totals = Object.fromEntries(normalizedMonths.map(month => [month, executives.reduce((sum, executive) => sum + (values.get(`${month}|${executive}`) || 0), 0)]));
    const executiveTotals = Object.fromEntries(executives.map(executive => [executive, normalizedMonths.reduce((sum, month) => sum + (values.get(`${month}|${executive}`) || 0), 0)]));
    const grandTotal = Object.values(totals).reduce((sum, value) => sum + value, 0);
    return { normalized, values, executives, totals, executiveTotals, grandTotal, months: normalizedMonths };
  }


  function getComparisonSettings() {
    return [1, 2, 3, 4, 5, 6]
      .map(number => ({
        from: els[`comparison${number}From`]?.value || "",
        to: els[`comparison${number}To`]?.value || ""
      }))
      .filter(pair => pair.from && pair.to);
  }

  function getAnalysisMonths(settings) {
    const months = new Set((settings.reportMonths || []).filter(Boolean));
    settings.comparisons.forEach(pair => {
      if (pair.from) months.add(pair.from);
      if (pair.to) months.add(pair.to);
    });
    return [...months].sort();
  }

  function dedupeRowsByDealName(rows) {
    const byDeal = new Map();
    const rowsWithoutDealName = [];

    rows.forEach(row => {
      const dealKey = normalizeName(row.dealName);
      if (!dealKey) {
        rowsWithoutDealName.push(row);
        return;
      }

      // Last imported occurrence wins. This prevents duplicate exports
      // from doubling totals while keeping the most recently uploaded value.
      byDeal.set(dealKey, row);
    });

    return {
      rows: [...byDeal.values()],
      duplicateCount: Math.max(0, rows.length - rowsWithoutDealName.length - byDeal.size),
      rowsWithoutDealName
    };
  }

  function countDuplicateDealNames(rows) {
    const seen = new Set();
    let duplicates = 0;

    rows.forEach(row => {
      const key = normalizeName(row.dealName);
      if (!key) return;
      if (seen.has(key)) duplicates += 1;
      seen.add(key);
    });

    return duplicates;
  }

  function isEligibleRow(row, settings) {
    if (!row.checkoutDate || Number.isNaN(row.checkoutDate.getTime())) return false;
    const normalizedStatus = row.bookingStatus.toLowerCase().replace(/[^a-z]/g, "");
    if (normalizedStatus.includes("cancelled") || normalizedStatus.includes("canceled")) return false;
    if (settings.property && row.property !== settings.property) return false;
    if (settings.currency && row.currency !== settings.currency) return false;
    return true;
  }

  function summarizeMonth(rows) {
    const uniqueDeals = new Set(
      rows.map(row => normalizeName(row.dealName)).filter(Boolean)
    ).size;

    return {
      bookingRows: rows.length,
      bookings: uniqueDeals,
      uniqueDeals,
      credit: sum(rows, "credit"),
      frontMoney: sum(rows, "frontMoney"),
      bankroll: sum(rows, "bankroll"),
      theoretical: sum(rows, "theoretical"),
      playerWinLoss: sum(rows, "playerWinLoss"),
      commission: sum(rows, "commission")
    };
  }

  function bookingExecutiveRaw(row) {
    if (!row) return "";
    // Owner / Deal Owner and Trip Contact represent the person who booked the trip.
    // Primary Contact Owner represents ownership of the player and is intentionally excluded.
    return cleanText(row.dealOwner) || cleanText(row.tripContact) || cleanText(row.bookingAgent);
  }

  function bookingExecutiveFromRow(row) {
    return canonicalBookingExecutive(bookingExecutiveRaw(row));
  }

  function groupTopPlayers(rows) {
    return rows
      .filter(row => cleanText(row.dealName))
      .map(row => {
        const executive = bookingExecutiveFromRow(row);
        return {
          name: "",
          ownerName: executive.name,
          ownerCode: executive.code,
          winLoss: row.playerWinLoss || 0,
          theoretical: row.theoretical || 0
        };
      })
      .sort((a, b) => b.theoretical - a.theoretical)
      .slice(0, 5)
      .map((row, index) => ({
        ...row,
        name: patronOwnerLabel(row, index)
      }));
  }

  function groupAllPlayers(rows) {
    const groups = new Map();

    rows.forEach(row => {
      const key = normalizeName(row.playerName);
      if (!key) return;

      if (!groups.has(key)) {
        groups.set(key, {
          name: row.playerName,
          winLoss: 0,
          theoretical: 0,
          bookings: 0,
          properties: new Map()
        });
      }

      const group = groups.get(key);
      group.winLoss += row.playerWinLoss || 0;
      group.theoretical += row.theoretical || 0;
      group.bookings += 1;

      const propertyName = cleanText(row.property);
      if (propertyName) {
        const propertyKey = normalizeName(propertyName);
        if (!group.properties.has(propertyKey)) {
          group.properties.set(propertyKey, { name: propertyName, bookings: 0 });
        }
        group.properties.get(propertyKey).bookings += 1;
      }
    });

    return [...groups.values()]
      .map(group => ({
        name: group.name,
        winLoss: group.winLoss,
        theoretical: group.theoretical,
        bookings: group.bookings,
        properties: [...group.properties.values()]
          .sort((a, b) => b.bookings - a.bookings || a.name.localeCompare(b.name))
      }))
      .sort((a, b) =>
        b.bookings - a.bookings || b.theoretical - a.theoretical
      );
  }

  function combineCanonicalAgentGroups(rows) {
    const groups = new Map();

    (rows || []).forEach(row => {
      const executive = canonicalBookingExecutive(row?.name);
      const key = normalizeName(executive.name);
      if (!key) return;
      if (!groups.has(key)) {
        groups.set(key, {
          name: executive.name,
          code: executive.code,
          bookings: 0,
          winLoss: 0,
          theoretical: 0,
          commission: 0
        });
      }
      const group = groups.get(key);
      group.bookings += Number(row?.bookings) || 0;
      group.winLoss += Number(row?.winLoss) || 0;
      group.theoretical += Number(row?.theoretical) || 0;
      group.commission += Number(row?.commission) || 0;
    });

    return [...groups.values()].sort((a, b) => b.bookings - a.bookings);
  }

  function groupAgents(rows) {
    const groups = new Map();

    rows.forEach(row => {
      const executive = bookingExecutiveFromRow(row);
      const key = normalizeName(executive.name);
      if (!key) return;

      if (!groups.has(key)) {
        groups.set(key, {
          name: executive.name,
          code: executive.code,
          bookings: 0,
          winLoss: 0,
          theoretical: 0,
          commission: 0
        });
      }

      const group = groups.get(key);
      group.bookings += 1;
      group.winLoss += row.playerWinLoss || 0;
      group.theoretical += row.theoretical || 0;
      group.commission += row.commission || 0;
    });

    return [...groups.values()].sort((a, b) => b.bookings - a.bookings);
  }

  function groupProperties(rows) {
    const groups = new Map();

    rows.forEach(row => {
      const propertyName = cleanText(row.property);
      if (!propertyName) return;

      const key = normalizeName(propertyName);
      if (!groups.has(key)) {
        groups.set(key, {
          name: propertyName,
          bookings: 0,
          uniquePlayers: new Set(),
          theoretical: 0
        });
      }

      const group = groups.get(key);
      group.bookings += 1;
      if (row.playerName) group.uniquePlayers.add(normalizeName(row.playerName));
      group.theoretical += row.theoretical || 0;
    });

    return [...groups.values()]
      .map(group => ({
        name: group.name,
        bookings: group.bookings,
        uniquePlayers: group.uniquePlayers.size,
        theoretical: group.theoretical
      }))
      .sort((a, b) =>
        b.bookings - a.bookings ||
        b.uniquePlayers - a.uniquePlayers ||
        b.theoretical - a.theoretical
      );
  }

  function buildPlayerBookingSummary(monthlyData) {
    const players = new Map();

    monthlyData.forEach(monthData => {
      monthData.playerBookings.forEach(player => {
        const key = normalizeName(player.name);

        if (!players.has(key)) {
          players.set(key, {
            name: player.name,
            properties: new Map(),
            months: {},
            totalBookings: 0,
            totalTheoretical: 0,
            totalWinLoss: 0
          });
        }

        const summary = players.get(key);
        summary.months[monthData.month] = player.bookings;
        summary.totalBookings += player.bookings;
        summary.totalTheoretical += player.theoretical;
        summary.totalWinLoss += player.winLoss;

        (player.properties || []).forEach(property => {
          const propertyKey = normalizeName(property.name);
          if (!summary.properties.has(propertyKey)) {
            summary.properties.set(propertyKey, {
              name: property.name,
              bookings: 0
            });
          }
          summary.properties.get(propertyKey).bookings += property.bookings;
        });
      });
    });

    return [...players.values()]
      .map(player => ({
        name: player.name,
        months: player.months,
        totalBookings: player.totalBookings,
        totalTheoretical: player.totalTheoretical,
        totalWinLoss: player.totalWinLoss,
        properties: [...player.properties.values()]
          .sort((a, b) => b.bookings - a.bookings || a.name.localeCompare(b.name))
      }))
      .sort((a, b) =>
        b.totalBookings - a.totalBookings ||
        b.totalTheoretical - a.totalTheoretical
      )
      .slice(0, 10);
  }

  function groupOwnership(rows) {
    const groups = new Map();

    rows.forEach(row => {
      const key = normalizeName(row.playerName);
      if (!key) return;

      if (!groups.has(key)) {
        groups.set(key, {
          playerName: row.playerName,
          dealOwner: row.dealOwner || "",
          tripContact: row.tripContact || "",
          playerOwner: row.playerOwner || "",
          bookings: 0,
          theoretical: 0
        });
      }

      const group = groups.get(key);
      if (!group.dealOwner && row.dealOwner) {
        group.dealOwner = row.dealOwner;
      }
      if (!group.tripContact && row.tripContact) {
        group.tripContact = row.tripContact;
      }
      if (!group.playerOwner && row.playerOwner) {
        group.playerOwner = row.playerOwner;
      }
      group.bookings += 1;
      group.theoretical += row.theoretical || 0;
    });

    return [...groups.values()].sort((a, b) => b.theoretical - a.theoretical);
  }

  function buildMonthComparison(fromMonth, toMonth, rows) {
    const fromRows = rows.filter(row => isInMonth(row.checkoutDate, fromMonth));
    const toRows = rows.filter(row => isInMonth(row.checkoutDate, toMonth));
    const fromValue = sum(fromRows, "theoretical");
    const toValue = sum(toRows, "theoretical");
    const difference = toValue - fromValue;
    const percentChange = fromValue ? difference / Math.abs(fromValue) : null;

    return {
      fromMonth,
      toMonth,
      fromValue,
      toValue,
      prior: fromValue,
      current: toValue,
      difference,
      percentChange,
      title: `${formatMonth(fromMonth)} versus ${formatMonth(toMonth)} Month Theoretical`
    };
  }

  function buildYearOverYear(monthValue, rows) {
    const currentDate = monthValueToDate(monthValue);
    const priorMonth = `${currentDate.getFullYear() - 1}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    return buildMonthComparison(priorMonth, monthValue, rows);
  }

  function buildQualityChecks(rows) {
    const ratingComplete = value => ["yes", "y", "true", "complete", "completed", "rated"].includes(cleanText(value).toLowerCase());
    return {
      missingDealName: rows.filter(row => row.checkoutDate && !row.dealName).length,
      duplicateDealNames: countDuplicateDealNames(rows.filter(row => row.checkoutDate)),
      missingPlayerName: rows.filter(row => !row.playerName).length,
      missingCheckoutDate: rows.filter(row => !row.checkoutDate || Number.isNaN(row.checkoutDate.getTime())).length,
      missingBookingAgent: rows.filter(row => row.checkoutDate && !bookingExecutiveRaw(row)).length,
      missingDealOwner: rows.filter(row => row.checkoutDate && !row.dealOwner).length,
      missingTripContact: rows.filter(row => row.checkoutDate && !row.tripContact).length,
      missingPlayerOwner: rows.filter(row => row.playerName && !row.playerOwner).length,
      commissionIncompleteRating: rows.filter(row => row.commission !== 0 && !ratingComplete(row.playRatingComplete)).length,
      totalRows: rows.length
    };
  }

  function updateCompletePdfButtonLabel(report = state.currentReport) {
    if (!els.printBtn) return;
    if (!report) {
      els.printBtn.textContent = "Download All Report (PDF)";
      els.printBtn.title = "Generate the report to calculate the final PDF page order.";
      if (els.allReportPdfBtn) {
        els.allReportPdfBtn.textContent = "Download All Report (PDF)";
        els.allReportPdfBtn.disabled = true;
        els.allReportPdfBtn.title = "Generate the report first.";
      }
      return;
    }

    const pairs = getExecutiveSnapshotPairs(report);
    const pageCount = getMainPdfPages().length;
    els.printBtn.textContent = pageCount
      ? `Download All Report (PDF) · ${pageCount} Pages`
      : "Download All Report (PDF)";
    els.printBtn.title = pairs.length
      ? `PDF order adjusts automatically: Title → Monthly KPI Totals → ${pairs.length} selected comparison${pairs.length === 1 ? "" : "s"} (2 pages each) → Top 5 Theoretical → Booking Executives → New Players Added.`
      : "PDF order adjusts automatically to the report sections currently available.";
    if (els.allReportPdfBtn) {
      els.allReportPdfBtn.textContent = pageCount ? `Download All Report (PDF) · ${pageCount} Pages` : "Download All Report (PDF)";
      els.allReportPdfBtn.disabled = !report;
      els.allReportPdfBtn.title = els.printBtn.title;
    }
  }

  function renderReport(report) {
    els.reportSection.classList.remove("hidden");

    if (!report.comparisons) report.comparisons = [];
    report.newProspectMonths = normalizeProspectDates(
      report.newProspectMonths?.length ? report.newProspectMonths : (report.analysisMonths?.length ? report.analysisMonths : getReportMonths(report))
    );
    report.newProspects = normalizeNewProspectEntries(report.newProspects, report.newProspectMonths);
    report.totalProspects = normalizeTotalProspectEntries(report.totalProspects, report.newProspectMonths);
    report.reportMonths = getReportMonths(report);
    if (!report.monthlyData) {
      report.reportMonths = getReportMonths(report);
      report.analysisMonths = report.analysisMonths?.length ? report.analysisMonths : report.reportMonths;
      report.monthlyData = [
        {
          month: report.month1,
          summary: report.summary1 || summarizeMonth([]),
          topPlayers: report.topPlayers1 || [],
          playerBookings: report.topPlayers1 || [],
          agents: report.agents1 || [],
          properties: []
        },
        {
          month: report.month2,
          summary: report.summary2 || summarizeMonth([]),
          topPlayers: report.topPlayers2 || [],
          playerBookings: report.topPlayers2 || [],
          agents: report.agents2 || [],
          properties: []
        }
      ].filter(item => item.month);
      report.playerBookingSummary = buildPlayerBookingSummary(report.monthlyData);
    }

    const automaticComparisonHeader = formatComparisonHeaderForMonths(report.reportMonths);

    els.reportToolbarTitle.textContent = `${report.monthlyData.length} Monthly KPI Views`;
    els.reportTitle.textContent =
      report.reportHeaderTitle || "Pace Gaming Internal KPI Report";
    els.reportSubtitle.textContent = formatSelectedComparisonHeader(report) || automaticComparisonHeader;
    els.reportPreparedBy.textContent = report.preparedBy || "Anne Joy";
    els.generatedDate.textContent = formatReportDate(report.generatedAt);
    els.reportSource.textContent = "KPI 2025-2026 · PipelineCRM";
    els.reportLogo.classList.add("small-logo");
    els.reportLogo.innerHTML = `<img src="logo.png" alt="Pace Gaming logo" />`;
    els.monthLabels.innerHTML = report.monthlyData
      .map(item => `<span class="month-label">${escapeHtml(formatMonth(item.month))}</span>`)
      .join("");

    const noRows = report.monthlyData.every(item => item.summary.bookings === 0);
    const hasNegativeImports = Object.values(report.negativeCounts || {}).some(count => count > 0);
    els.reportNotice.classList.toggle("hidden", false);
    const duplicateNote = report.duplicateDealsRemoved
      ? ` ${formatInteger(report.duplicateDealsRemoved)} duplicate Deal Name row(s) were removed so totals are not counted twice.`
      : "";

    els.reportNotice.textContent = noRows
      ? "No eligible bookings were found for the selected and comparison months. Check Check-Out Date, filters, Booking Status, and column mapping."
      : hasNegativeImports
        ? `Accuracy check: signed values were preserved exactly, including negative values.${duplicateNote}`
        : `Accuracy check: one record per Deal Name was used for all KPI calculations.${duplicateNote}`;

    renderKpiCards(report);
    renderNewProspects(report);
    renderTopPlayers(report);
    renderPlayerBookingSummary(report);
    renderAgentPerformance(report);
    renderIntegratedExecutiveSnapshots(report);
    updateExecutiveSnapshotButtons(report);
    updateCompletePdfButtonLabel(report);
    applyNegativeAmountHighlighting(els.printReport);

    if (!els.emailExportPanel.classList.contains("hidden")) {
      renderEmailPreview(report);
    }
  }

  function renderKpiCards(report) {
    const definitions = [
      { label: "Number of Bookings Players (Check-Out Date)", key: "bookings", type: "integer" },
      { label: "Total Credit", key: "credit", type: "currency" },
      { label: "Total Front Money", key: "frontMoney", type: "currency" },
      { label: "Total Bankroll", key: "bankroll", type: "currency" },
      { label: "Total Theoretical", key: "theoretical", type: "currency" },
      { label: "Total W/L", key: "playerWinLoss", type: "currency" },
      { label: "Total Commission", key: "commission", type: "currency" }
    ];

    const header = `
      <thead>
        <tr>
          <th>KPI</th>
          ${report.monthlyData.map(item => `<th>${escapeHtml(formatMonth(item.month))}</th>`).join("")}
        </tr>
      </thead>
    `;

    const body = definitions.map(definition => {
      const formatter = definition.type === "integer"
        ? formatInteger
        : value => formatCurrency(value, report.currency);
      return `
        <tr>
          <td><strong>${escapeHtml(definition.label)}</strong></td>
          ${report.monthlyData.map(item => {
            const rawValue = item.summary[definition.key] || 0;
            const valueClass = definition.type === "currency"
              ? negativeValueClass(rawValue)
              : "";
            return `<td class="kpi-total-value${valueClass}">${escapeHtml(formatter(rawValue))}</td>`;
          }).join("")}
        </tr>
      `;
    }).join("");

    els.kpiCards.innerHTML = `
      <div class="table-wrap monthly-table-wrap">
        <table class="monthly-report-table">${header}<tbody>${body}</tbody></table>
      </div>
    `;
  }

  function renderNewProspects(report) {
    // The PDF report should show the same dates as the KPI report itself,
    // not every historical prospect date stored in the browser.
    const reportMonths = [...new Set((report.monthlyData || [])
      .map(item => String(item?.month || "").trim())
      .filter(month => /^\d{4}-\d{2}$/.test(month)))];
    const fallbackMonths = [...new Set((getReportMonths(report) || [])
      .map(month => String(month || "").trim())
      .filter(month => /^\d{4}-\d{2}$/.test(month)))];
    const months = reportMonths.length ? reportMonths : fallbackMonths;
    const matrix = buildNewProspectMatrix(report.newProspects, months);

    els.newProspectsSection.classList.remove("hidden");
    els.newProspectsHead.innerHTML = `<tr><th>Executive</th>${months.map(month => `<th>${escapeHtml(formatMonth(month))}</th>`).join("")}<th class="prospect-total-column">Total</th></tr>`;

    const manualTotals = new Map(normalizeTotalProspectEntries(report.totalProspects, months).map(entry => [entry.month, entry.value]));
    const hasManualTotals = manualTotals.size > 0;

    if (!matrix.executives.length && !hasManualTotals) {
      els.newProspectsBody.innerHTML = `<tr><td class="empty-row" colspan="${months.length + 2}">No New Player entries or editable monthly totals were added for these KPI report dates.</td></tr>`;
      return;
    }

    const executiveRows = matrix.executives.map(executive => `
      <tr>
        <th scope="row">${escapeHtml(executive)}</th>
        ${months.map(month => {
          const key = `${month}|${executive}`;
          return matrix.values.has(key)
            ? `<td class="kpi-total-value">${escapeHtml(formatInteger(matrix.values.get(key)))}</td>`
            : `<td class="prospect-empty-cell">—</td>`;
        }).join("")}
        <td class="prospect-total-column">${escapeHtml(formatInteger(matrix.executiveTotals[executive] || 0))}</td>
      </tr>`).join("");

    const effectiveTotals = Object.fromEntries(months.map(month => [month, manualTotals.has(month) ? manualTotals.get(month) : (matrix.totals[month] || 0)]));
    const effectiveGrandTotal = months.reduce((sum, month) => sum + (Number(effectiveTotals[month]) || 0), 0);
    const totalRow = `<tr class="prospect-total-row"><th scope="row">TOTAL NEW PLAYERS ADDED</th>${months.map(month => `<td>${escapeHtml(formatInteger(effectiveTotals[month] || 0))}</td>`).join("")}<td>${escapeHtml(formatInteger(effectiveGrandTotal))}</td></tr>`;
    els.newProspectsBody.innerHTML = executiveRows + totalRow;
  }


  function topExecutiveTheoreticalRows(agents, limit = 5) {
    return [...(agents || [])]
      .filter(agent => cleanText(agent?.name))
      .sort((a, b) =>
        (Number(b.theoretical) || 0) - (Number(a.theoretical) || 0) ||
        (Number(b.bookings) || 0) - (Number(a.bookings) || 0) ||
        cleanText(a.name).localeCompare(cleanText(b.name))
      )
      .slice(0, limit);
  }

  function renderTopPlayers(report) {
    els.topPlayersGrid.innerHTML = report.monthlyData.map(item => `
      <article class="monthly-report-card">
        <div class="monthly-card-heading">
          <span>${escapeHtml(formatMonth(item.month))}</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Patron - Booking Executive</th><th>Total W/L</th><th>Theoretical</th></tr>
            </thead>
            <tbody>
              ${renderPatronTheoreticalRowsHtml(item.topPlayers || [], report.currency)}
            </tbody>
          </table>
        </div>
      </article>
    `).join("");
  }

  function renderPatronTheoreticalRowsHtml(rows, currency) {
    if (!rows.length) {
      return `<tr><td class="empty-row" colspan="3">No theoretical player data available</td></tr>`;
    }

    return rows.map((row, index) => `
      <tr>
        <td><strong>${escapeHtml(patronOwnerLabel(row, index))}</strong></td>
        <td class="wl-value${negativeValueClass(row.winLoss)}">${escapeHtml(formatCurrency(row.winLoss, currency))}</td>
        <td class="currency-value${negativeValueClass(row.theoretical)}"><strong>${escapeHtml(formatCurrency(row.theoretical, currency))}</strong></td>
      </tr>
    `).join("");
  }

  function negativeValueClass(value) {
    return Number(value) < 0 ? " negative-value" : "";
  }

  function isNegativeAmountText(value) {
    const text = String(value || "")
      .replace(/−/g, "-")
      .replace(/\s+/g, " ")
      .trim();
    return /-\s*(?:[$€£¥₹₱₩]|[A-Z]{3}\b)\s*\d/.test(text) ||
      /(?:[$€£¥₹₱₩]|[A-Z]{3}\b)\s*-\s*\d/.test(text);
  }

  function applyNegativeAmountHighlighting(root) {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll(
      "td, th, .kpi-total-value, .chart-value, .snapshot-highlight-card strong, .snapshot-highlight-card small, .agent-mini-card small, .highlight-card small"
    ).forEach(element => {
      // Do not color an email/layout container merely because a nested table contains a negative amount.
      if (element.matches("td, th") && element.querySelector("td, th, table")) return;
      if (isNegativeAmountText(element.textContent)) {
        element.classList.add("negative-value", "negative-amount-cell");
      } else {
        element.classList.remove("negative-amount-cell");
      }
    });
  }

  function highlightNegativeAmountsInHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = String(html || "");
    template.content.querySelectorAll("td").forEach(cell => {
      // Only highlight the actual value cell, never a parent layout cell that contains another table.
      if (cell.querySelector("td, table")) return;
      if (!isNegativeAmountText(cell.textContent)) return;
      cell.style.setProperty("color", "#c62828", "important");
      cell.style.setProperty("font-weight", "900", "important");
      cell.style.setProperty("background", "#fff0f0", "important");
    });
    return template.innerHTML;
  }

  function formatPlayerProperties(properties) {
    if (!properties || !properties.length) return "—";
    return properties
      .map(property => `${property.name} (${formatInteger(property.bookings)})`)
      .join(", ");
  }

  function renderPlayerBookingSummary(report) {
    const months = report.monthlyData.map(item => item.month);
    const rows = report.playerBookingSummary || [];

    els.playerBookingHead.innerHTML = `
      <tr>
        <th>Player Full Name</th>
        <th>Properties Booked</th>
        ${months.map(month => `<th>${escapeHtml(formatMonth(month))}</th>`).join("")}
        <th>Total Bookings</th>
        <th>Total Theoretical</th>
        <th>Total W/L</th>
      </tr>
    `;

    if (!rows.length) {
      els.playerBookingBody.innerHTML = `<tr><td class="empty-row" colspan="${months.length + 5}">No player booking data available</td></tr>`;
      return;
    }

    els.playerBookingBody.innerHTML = rows.map(player => `
      <tr>
        <td><strong>${escapeHtml(player.name)}</strong></td>
        <td class="properties-cell">${escapeHtml(formatPlayerProperties(player.properties))}</td>
        ${months.map(month => `<td>${formatInteger(player.months[month] || 0)}</td>`).join("")}
        <td><strong>${formatInteger(player.totalBookings)}</strong></td>
        <td class="currency-value${negativeValueClass(player.totalTheoretical)}">${escapeHtml(formatCurrency(player.totalTheoretical, report.currency))}</td>
        <td class="wl-value${negativeValueClass(player.totalWinLoss)}">${escapeHtml(formatCurrency(player.totalWinLoss, report.currency))}</td>
      </tr>
    `).join("");
  }

  function renderAgentPerformance(report) {
    els.agentMonthlyGrid.innerHTML = report.monthlyData.map(item => {
      const agents = combineCanonicalAgentGroups(item.agents);
      const mostBookings = highest(agents, "bookings");
      const highestTheo = highest(agents, "theoretical");
      const highestLoss = selectHighestLoss(agents);

      return `
        <article class="monthly-report-card">
          <div class="monthly-card-heading">
            <span>${escapeHtml(formatMonth(item.month))}</span>
            <strong>${formatInteger(item.summary.bookings)} deals</strong>
          </div>
          <div class="agent-mini-grid">
            ${agentMiniCard("Highest Player Loss", highestLoss, "winLoss", report.currency)}
            ${agentMiniCard("Most Bookings", mostBookings, "bookings", report.currency)}
            ${agentMiniCard("Most Aggregate Theoretical", highestTheo, "theoretical", report.currency)}
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Booking Executive</th><th>Bookings</th><th>Total W/L</th><th>Aggregate Theo</th></tr>
              </thead>
              <tbody>
                ${renderAgentRowsHtml(agents, report.currency)}
              </tbody>
            </table>
          </div>
        </article>
      `;
    }).join("");
  }

  function agentMiniCard(label, agent, key, currency) {
    const value = !agent
      ? "No data"
      : key === "bookings"
        ? formatInteger(agent[key])
        : formatCurrency(agent[key], currency);
    const valueClass = agent && key !== "bookings"
      ? negativeValueClass(agent[key])
      : "";

    return `
      <div class="agent-mini-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(agent?.name || "—")}</strong>
        <small class="wl-value${valueClass}">${escapeHtml(value)}</small>
      </div>
    `;
  }

  function renderAgentRowsHtml(rows, currency) {
    if (!rows.length) {
      return `<tr><td class="empty-row" colspan="4">No Booking Executive data available</td></tr>`;
    }
    return rows.map(row => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${formatInteger(row.bookings)}</td>
        <td class="wl-value${negativeValueClass(row.winLoss)}">${escapeHtml(formatCurrency(row.winLoss, currency))}</td>
        <td class="currency-value${negativeValueClass(row.theoretical)}">${escapeHtml(formatCurrency(row.theoretical, currency))}</td>
      </tr>
    `).join("");
  }

  function highlightHtml(title, first, second, key, month1Label, month2Label, currency) {
    const format = key === "bookings"
      ? value => formatInteger(value)
      : value => formatCurrency(value, currency);
    return `
      <article class="highlight-card">
        <p>${escapeHtml(title)}</p>
        <h3>${escapeHtml(month1Label)}: ${escapeHtml(first?.name || "—")}</h3>
        <small>${first ? format(first[key]) : "No data"}</small>
        <h3>${escapeHtml(month2Label)}: ${escapeHtml(second?.name || "—")}</h3>
        <small>${second ? format(second[key]) : "No data"}</small>
      </article>
    `;
  }

  function renderTheoreticalGraph(report) {
    if (!els.theoreticalGraph) return;

    // Use each KPI report month once. The previous comparison-based graph could
    // repeat the same month when it appeared in more than one comparison pair.
    const points = [];
    const seenMonths = new Set();
    (report.monthlyData || []).forEach(item => {
      if (!item?.month || seenMonths.has(item.month)) return;
      seenMonths.add(item.month);
      points.push({
        month: item.month,
        label: formatMonth(item.month),
        value: Number(item.summary?.theoretical) || 0
      });
    });

    if (!points.length) {
      els.theoreticalGraph.innerHTML = `<p class="empty-row">No theoretical totals are available for the selected KPI dates.</p>`;
      return;
    }

    const maxValue = Math.max(...points.map(point => Math.abs(point.value)), 1);

    els.theoreticalGraph.innerHTML = `
      <div class="theoretical-clean-chart" role="img" aria-label="Theoretical totals for ${escapeHtml(points.map(point => point.label).join(", "))}">
        ${points.map(point => {
          const width = point.value === 0 ? 0 : Math.max(1.5, (Math.abs(point.value) / maxValue) * 48);
          const directionClass = point.value < 0 ? "negative" : "positive";
          return `
            <div class="theoretical-clean-row">
              <div class="theoretical-clean-label">${escapeHtml(point.label)}</div>
              <div class="theoretical-clean-track" aria-hidden="true">
                <span class="theoretical-zero-line"></span>
                <span class="theoretical-clean-bar ${directionClass}" style="width:${width.toFixed(2)}%"></span>
              </div>
              <div class="theoretical-clean-value${negativeValueClass(point.value)}">${escapeHtml(formatCurrency(point.value, report.currency))}</div>
            </div>`;
        }).join("")}
      </div>
      <p class="theoretical-clean-note">Bars are plotted from a true zero line. Positive totals extend right; negative totals extend left.</p>
    `;
  }

  function renderQualityChecks(quality) {
    const items = [
      ["Missing Deal Name", quality.missingDealName],
      ["Duplicate Deal Names", quality.duplicateDealNames],
      ["Missing Player Name", quality.missingPlayerName],
      ["Missing Check-Out Date", quality.missingCheckoutDate],
      ["Missing Booking Executive (Deal Owner / Trip Contact)", quality.missingBookingAgent],
      ["Missing Deal Owner (Owner)", quality.missingDealOwner],
      ["Missing Trip Contact", quality.missingTripContact],
      ["Missing Primary Contact Owner / Player Owner", quality.missingPlayerOwner],
      ["Commission with Incomplete Rating", quality.commissionIncompleteRating]
    ];
    els.qualityChecks.innerHTML = items.map(([label, count]) => `
      <div class="quality-item ${count ? "warning" : ""}">
        <div>
          <p><strong>${escapeHtml(label)}</strong></p>
          <small>${count ? "Review these source rows before finalizing." : "No issue detected."}</small>
        </div>
        <div class="quality-count">${formatInteger(count)}</div>
      </div>
    `).join("");
  }

  function saveCurrentReport() {
    if (!state.currentReport) return;
    const history = getHistory();
    const existingIndex = history.findIndex(item =>
      item.companyName === state.currentReport.companyName &&
      JSON.stringify(getReportMonths(item)) === JSON.stringify(getReportMonths(state.currentReport)) &&
      item.property === state.currentReport.property &&
      item.currency === state.currentReport.currency
    );
    const reportToSave = {
      ...state.currentReport,
      filteredRows: []
    };
    if (existingIndex >= 0) history.splice(existingIndex, 1);
    history.unshift(reportToSave);
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(0, 24)));
    renderHistory();
    showMessage("Report saved in this browser.", "success");
  }

  function renderHistory() {
    const history = getHistory();
    if (!history.length) {
      els.historyList.innerHTML = `<div class="history-card"><h3>No saved reports yet</h3><p>Generate a report and click “Save to History.”</p></div>`;
      return;
    }

    els.historyList.innerHTML = history.map(report => `
      <article class="history-card">
        <h3>${escapeHtml(formatSelectedComparisonHeader(report).replace(/^(Primary comparison|Comparisons):\s*/i, ""))}</h3>
        <p>${escapeHtml(report.companyName)} · ${escapeHtml(report.property || "All properties")}</p>
        <p>Saved ${escapeHtml(formatDateTime(report.generatedAt))}</p>
        <div class="button-row compact">
          <button class="btn secondary history-view" data-id="${escapeHtml(report.id)}" type="button">View</button>
          <button class="btn danger history-delete" data-id="${escapeHtml(report.id)}" type="button">Delete</button>
        </div>
      </article>
    `).join("");

    els.historyList.querySelectorAll(".history-view").forEach(button => {
      button.addEventListener("click", () => {
        const report = getHistory().find(item => item.id === button.dataset.id);
        if (!report) return;
        state.currentReport = report;
        renderReport(report);
        els.reportSection.scrollIntoView({ behavior: "smooth" });
      });
    });

    els.historyList.querySelectorAll(".history-delete").forEach(button => {
      button.addEventListener("click", () => {
        const updated = getHistory().filter(item => item.id !== button.dataset.id);
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(updated));
        renderHistory();
      });
    });
  }

  function getHistory() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.history), []);
  }

  function openEmailExportPanel() {
    if (!state.currentReport) {
      showMessage("Generate a report before creating the email format.", "error");
      return;
    }
    renderEmailPreview(state.currentReport);
    els.emailExportPanel.classList.remove("hidden");
    els.emailExportPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function emailPrimaryMonths(report) {
    const monthlyData = report.monthlyData || [];
    const selectedMonths = getReportMonths(report);
    const months = selectedMonths.length
      ? selectedMonths
      : [...new Set(monthlyData.map(item => item.month).filter(Boolean))];

    return months.map(month => {
      const existing = monthlyData.find(item => item.month === month);
      if (existing) return { ...existing, emailDataAvailable: true };

      return {
        month,
        emailDataAvailable: false,
        summary: {
          bookings: 0,
          credit: 0,
          frontMoney: 0,
          bankroll: 0,
          theoretical: 0,
          playerWinLoss: 0,
          commission: 0
        },
        topPlayers: [],
        agents: []
      };
    });
  }

  function requiredEmailComparison(report, fromMonth, toMonth) {
    const stored = (report.comparisons || []).find(item =>
      item.fromMonth === fromMonth && item.toMonth === toMonth
    );
    if (stored) return stored;

    const fromData = (report.monthlyData || []).find(item => item.month === fromMonth);
    const toData = (report.monthlyData || []).find(item => item.month === toMonth);
    const fromValue = fromData ? fromData.summary.theoretical || 0 : null;
    const toValue = toData ? toData.summary.theoretical || 0 : null;
    const difference = fromValue === null || toValue === null ? null : toValue - fromValue;

    return {
      fromMonth,
      toMonth,
      fromValue,
      toValue,
      difference,
      percentChange: difference === null || !fromValue ? null : difference / Math.abs(fromValue),
      title: `${formatMonth(fromMonth)} versus ${formatMonth(toMonth)} Month Theoretical`
    };
  }

  function emailReportHeaderFor(report) {
    return `Pace Gaming KPI Report for ${humanMonthList(getReportMonths(report))}`;
  }

  function emailSubjectFor(report) {
    const pairs = getExecutiveSnapshotPairs(report);
    return pairs.length > 1 ? combinedComparisonEmailSubject(report) : emailReportHeaderFor(report);
  }

  function emailAmount(value, currency) {
    return value === null || value === undefined ? "Not available" : escapeHtml(formatCurrency(value, currency));
  }

  function humanMonthList(months) {
    const labels = [...new Set((months || []).filter(Boolean))].map(formatMonth);
    if (!labels.length) return "the selected reporting period";
    if (labels.length === 1) return labels[0];
    if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
    return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
  }

  function comparisonTrend(priorValue, currentValue, upText, downText, sameText) {
    const prior = Number(priorValue) || 0;
    const current = Number(currentValue) || 0;
    if (current > prior) return upText;
    if (current < prior) return downText;
    return sameText;
  }

  function monthlyEmailSummaryData(report, month) {
    const item = findSnapshotMonthData(report, month);
    const mostBookings = highest(item.agents || [], "bookings");
    const executive = mostBookings ? canonicalBookingExecutive(mostBookings.name) : null;
    return {
      month,
      label: formatMonth(month),
      bookings: Number(item.summary?.bookings) || 0,
      theoretical: Number(item.summary?.theoretical) || 0,
      playerWinLoss: Number(item.summary?.playerWinLoss) || 0,
      commission: Number(item.summary?.commission) || 0,
      mostBookings: mostBookings ? {
        name: executive?.name || mostBookings.name,
        code: executive?.code || "",
        bookings: Number(mostBookings.bookings) || 0
      } : null
    };
  }

  function compactExecutiveEmailLabel(name) {
    const clean = String(name || "").trim().replace(/\s+/g, " ");
    if (!clean) return "—";
    const parts = clean.split(" ");
    if (parts.length === 1) return parts[0];
    return `${parts[0].charAt(0).toUpperCase()}${parts[parts.length - 1]}`;
  }

  function monthlyEmailSummaryBlock(report, month) {
    const data = monthlyEmailSummaryData(report, month);
    const executiveText = data.mostBookings
      ? `${compactExecutiveEmailLabel(data.mostBookings.name)} — ${formatInteger(data.mostBookings.bookings)}`
      : "No booking data";

    return `${data.label}
Bookings: ${formatInteger(data.bookings)}
Theo: ${formatCurrency(data.theoretical, report.currency)}
Player Win: ${formatCurrency(data.playerWinLoss, report.currency)}
Commission: ${formatCurrency(data.commission, report.currency)}
Top Bookings: ${executiveText}`;
  }

  function getEmailSummaryMonths(report) {
    const months = [];
    const seen = new Set();
    getExecutiveSnapshotPairs(report).forEach(pair => {
      [pair.fromMonth, pair.toMonth].forEach(month => {
        if (!month || seen.has(month)) return;
        seen.add(month);
        months.push(month);
      });
    });
    return months;
  }

  function emailKpiSummaryTitle(report) {
    const months = getEmailSummaryMonths(report);
    const parsed = months.map(monthValueToDate).filter(date => date && !Number.isNaN(date.getTime()));
    const monthNames = [...new Set(parsed.map(date => date.toLocaleString("en-US", { month: "long" })))];
    const years = [...new Set(parsed.map(date => date.getFullYear()))].sort((a, b) => a - b);

    if (monthNames.length && monthNames.length <= 2 && years.length === 2) {
      return `KPI Summary — ${monthNames.join(" & ")} ${years[0]} vs. ${years[1]}`;
    }
    return `KPI Summary — ${humanMonthList(months)}`;
  }

  function emailMonthlyKpiSummaryTableHtml(report) {
    const months = getEmailSummaryMonths(report);
    const monthData = months.map(month => monthlyEmailSummaryData(report, month));
    const currency = report.currency;
    const rows = [
      {
        label: "Bookings",
        render: data => escapeHtml(formatInteger(data.bookings))
      },
      {
        label: "Theo",
        render: data => escapeHtml(formatCurrency(data.theoretical, currency))
      },
      {
        label: "Player Win",
        render: data => {
          const value = Number(data.playerWinLoss) || 0;
          const style = value < 0 ? "color:#b42318;font-weight:800;" : "font-weight:700;";
          return `<span style="${style}">${escapeHtml(formatCurrency(value, currency))}</span>`;
        }
      },
      {
        label: "Commission",
        render: data => escapeHtml(formatCurrency(data.commission, currency))
      },
      {
        label: "Top Bookings",
        render: data => data.mostBookings
          ? `${escapeHtml(compactExecutiveEmailLabel(data.mostBookings.name))} — ${escapeHtml(formatInteger(data.mostBookings.bookings))}`
          : "—"
      }
    ];

    const bodyRows = rows.map(row => `
      <tr>
        <th align="left" style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;font-weight:800;white-space:nowrap;">${escapeHtml(row.label)}</th>
        ${monthData.map(data => `<td align="center" style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:13px;">${row.render(data)}</td>`).join("")}
      </tr>`).join("");

    return `
      <div style="margin:0 0 24px;">
        <h2 style="margin:0 0 14px;color:#111827;font-size:22px;font-weight:700;">${escapeHtml(emailKpiSummaryTitle(report))}</h2>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#ffffff;">
          <thead>
            <tr>
              <th align="left" style="padding:9px 12px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:12px;font-weight:800;">KPI</th>
              ${monthData.map(data => `<th align="center" style="padding:9px 12px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:12px;font-weight:800;white-space:nowrap;">${escapeHtml(data.label)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>`;
  }

  function emailComparisonMetricChange(report, pair, key, type = "currency") {
    const prior = monthlyEmailSummaryData(report, pair.fromMonth);
    const current = monthlyEmailSummaryData(report, pair.toMonth);
    const priorValue = Number(prior[key]) || 0;
    const currentValue = Number(current[key]) || 0;
    const difference = key === "playerWinLoss"
      ? priorValue - currentValue
      : currentValue - priorValue;
    const percent = key === "playerWinLoss"
      ? snapshotPercentChange(-priorValue, -currentValue)
      : snapshotPercentChange(priorValue, currentValue);
    const arrow = difference > 0 ? "▲" : difference < 0 ? "▼" : "—";
    const color = difference > 0 ? "#147a4b" : difference < 0 ? "#b42318" : "#667085";
    const amount = type === "integer"
      ? formatInteger(Math.abs(difference))
      : formatCurrency(Math.abs(difference), report.currency);
    const percentText = percent === null || percent === undefined || !Number.isFinite(percent)
      ? "N/A"
      : `${Math.abs(percent * 100).toFixed(1)}%`;
    const text = Math.abs(difference) < 0.00001
      ? `No change · ${percentText}`
      : `${arrow} ${amount} · ${percentText}`;
    return { text, color };
  }

  function emailComparisonTableHtml(report, pairs, heading) {
    if (!pairs.length) return "";
    const rows = pairs.map(pair => {
      const bookings = emailComparisonMetricChange(report, pair, "bookings", "integer");
      const theo = emailComparisonMetricChange(report, pair, "theoretical", "currency");
      const wl = emailComparisonMetricChange(report, pair, "playerWinLoss", "currency");
      const commission = emailComparisonMetricChange(report, pair, "commission", "currency");
      return `
        <tr>
          <th align="left" style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#111827;font-size:12px;font-weight:800;white-space:nowrap;">${escapeHtml(formatMonth(pair.fromMonth))} vs ${escapeHtml(formatMonth(pair.toMonth))}</th>
          <td align="center" style="padding:10px 8px;border-bottom:1px solid #e5e7eb;color:${bookings.color};font-size:12px;font-weight:800;">${escapeHtml(bookings.text)}</td>
          <td align="center" style="padding:10px 8px;border-bottom:1px solid #e5e7eb;color:${theo.color};font-size:12px;font-weight:800;">${escapeHtml(theo.text)}</td>
          <td align="center" style="padding:10px 8px;border-bottom:1px solid #e5e7eb;color:${wl.color};font-size:12px;font-weight:800;">${escapeHtml(wl.text)}</td>
          <td align="center" style="padding:10px 8px;border-bottom:1px solid #e5e7eb;color:${commission.color};font-size:12px;font-weight:800;">${escapeHtml(commission.text)}</td>
        </tr>`;
    }).join("");

    return `
      <div style="margin:22px 0 0;">
        <h3 style="margin:0 0 10px;color:#172b4d;font-size:17px;font-weight:800;">${escapeHtml(heading)}</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;background:#ffffff;">
          <thead>
            <tr>
              <th align="left" style="padding:8px 12px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:11px;font-weight:800;">Comparison</th>
              <th align="center" style="padding:8px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:11px;font-weight:800;">Bookings</th>
              <th align="center" style="padding:8px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:11px;font-weight:800;">Theo</th>
              <th align="center" style="padding:8px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:11px;font-weight:800;">Pace W/L Change</th>
              <th align="center" style="padding:8px;border-bottom:2px solid #cbd5e1;color:#475569;font-size:11px;font-weight:800;">Commission</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function emailKpiComparisonSummaryHtml(report) {
    const pairs = getExecutiveSnapshotPairs(report);
    const yoyPairs = pairs.filter(pair => comparisonTypeLabel(pair) === "YEAR-OVER-YEAR");
    const momPairs = pairs.filter(pair => comparisonTypeLabel(pair) === "MONTH-OVER-MONTH");
    const otherPairs = pairs.filter(pair => !["YEAR-OVER-YEAR", "MONTH-OVER-MONTH"].includes(comparisonTypeLabel(pair)));
    return `
      ${emailComparisonTableHtml(report, yoyPairs, "Year-over-Year")}
      ${emailComparisonTableHtml(report, momPairs, "Month-over-Month")}
      ${emailComparisonTableHtml(report, otherPairs, "Other Selected Comparisons")}`;
  }

  function emailKpiSummaryOverviewHtml(report) {
    return `${emailMonthlyKpiSummaryTableHtml(report)}${emailKpiComparisonSummaryHtml(report)}`;
  }

  function comparisonNarrativeSummary(report, pair) {
    if (!report || !pair?.fromMonth || !pair?.toMonth) return [];
    return [
      monthlyEmailSummaryBlock(report, pair.fromMonth),
      monthlyEmailSummaryBlock(report, pair.toMonth)
    ];
  }

  function comparisonEmailSummaryBlock(report, pair) {
    return comparisonNarrativeSummary(report, pair).join("\n");
  }

  function suggestedEmailDraft(report) {
    const preparedBy = report.preparedBy || "Anne Joy";
    const pairs = getExecutiveSnapshotPairs(report);
    if (pairs.length) {
      return `Hi Team,

Attached are the Pace Gaming KPI comparison reports. A quick KPI summary and the Year-over-Year / Month-over-Month comparison are included below.

Thank you,
${preparedBy}`;
    }

    const monthText = humanMonthList(getReportMonths(report));
    return `Hi Team,\n\nPlease find attached the Pace Gaming KPI report for ${monthText}.\n\nThe attached report contains the detailed KPI results for the selected period.\n\nThank you,\n${preparedBy}`;
  }

  function emailDraftHtml(message) {
    const text = String(message || "").trim();
    if (!text) return "";

    return text
      .split(/\n\s*\n/)
      .map(paragraph => `<p style="margin:0 0 14px;white-space:pre-line;text-align:left;">${escapeHtml(paragraph)}</p>`)
      .join("");
  }

  function buildEmailReportHtml(report, fullDocument = false) {
    const months = emailPrimaryMonths(report);
    const currency = report.currency;
    const emailHeader = emailReportHeaderFor(report);
    const draftMessage = els.emailDraftMessage?.value || suggestedEmailDraft(report);
    const draftSection = emailDraftHtml(draftMessage);

    const metrics = [
      { label: "Number of Bookings Players (Check-Out Date)", key: "bookings", type: "integer" },
      { label: "Total Credit", key: "credit", type: "currency" },
      { label: "Total Front Money", key: "frontMoney", type: "currency" },
      { label: "Total Bankroll", key: "bankroll", type: "currency" },
      { label: "Total Theoretical", key: "theoretical", type: "currency" },
      { label: "Total W/L", key: "playerWinLoss", type: "currency" },
      { label: "Total Commission", key: "commission", type: "currency" }
    ];

    const totalRows = metrics.map(metric => `
      <tr>
        <td style="padding:10px;border:1px solid #d8dee6;background:#f7f9fc;font-weight:800;">${escapeHtml(metric.label)}</td>
        ${months.map(item => {
          const raw = Number(item.summary?.[metric.key]) || 0;
          const value = metric.type === "integer" ? formatInteger(raw) : formatCurrency(raw, currency);
          const style = metric.type === "currency" && raw < 0
            ? "color:#c62828;font-weight:900;background:#fff0f0;"
            : "font-weight:700;";
          return `<td align="center" style="padding:10px;border:1px solid #d8dee6;text-align:center;${style}">${escapeHtml(value)}</td>`;
        }).join("")}
      </tr>`).join("");

    const snapshotEmailSection = pair => {
      const prior = findSnapshotMonthData(report, pair.fromMonth);
      const current = findSnapshotMonthData(report, pair.toMonth);
      const priorProspects = snapshotProspectTotal(report, pair.fromMonth);
      const currentProspects = snapshotProspectTotal(report, pair.toMonth);
      const definitions = [
        { label: "Number of Bookings Players", key: "bookings", type: "integer" },
        { label: "Total Credit", key: "credit", type: "currency" },
        { label: "Total Front Money", key: "frontMoney", type: "currency" },
        { label: "Total Bankroll", key: "bankroll", type: "currency" },
        { label: "Total Theoretical", key: "theoretical", type: "currency" },
        { label: "Total W/L", key: "playerWinLoss", type: "currency" },
        { label: "Total Commission", key: "commission", type: "currency" },
        { label: "Total New Players Added", key: "newProspects", type: "integer" }
      ];
      const rows = definitions.map(metric => {
        const priorValue = metric.key === "newProspects" ? priorProspects : Number(prior.summary?.[metric.key]) || 0;
        const currentValue = metric.key === "newProspects" ? currentProspects : Number(current.summary?.[metric.key]) || 0;
        const variance = metric.key === "playerWinLoss"
          ? priorValue - currentValue
          : currentValue - priorValue;
        const percent = metric.key === "playerWinLoss"
          ? snapshotPercentChange(-priorValue, -currentValue)
          : snapshotPercentChange(priorValue, currentValue);
        const formatValue = metric.type === "integer" ? formatInteger : value => formatCurrency(value, currency);
        const formatVariance = metric.type === "integer" ? snapshotSignedInteger : value => snapshotSignedCurrency(value, currency);
        const varianceColor = variance > 0 ? "#147a4b" : variance < 0 ? "#b42318" : "#667085";
        return `<tr>
          <td style="padding:9px;border:1px solid #d8dee6;background:#f7f9fc;font-weight:800;">${escapeHtml(metric.label)}</td>
          <td align="center" style="padding:9px;border:1px solid #d8dee6;text-align:center;">${escapeHtml(formatValue(priorValue))}</td>
          <td align="center" style="padding:9px;border:1px solid #d8dee6;text-align:center;font-weight:900;">${escapeHtml(formatValue(currentValue))}</td>
          <td align="center" style="padding:9px;border:1px solid #d8dee6;text-align:center;color:${varianceColor};font-weight:900;">${escapeHtml(formatVariance(variance))}</td>
          <td align="center" style="padding:9px;border:1px solid #d8dee6;text-align:center;color:${varianceColor};font-weight:900;">${escapeHtml(snapshotPercentLabel(percent))}</td>
        </tr>`;
      }).join("");

      const executives = mergeSnapshotAgents(prior.agents, current.agents);
      const executiveRows = executives.length ? executives.map(agent => `
        <tr>
          <td style="padding:8px;border:1px solid #d8dee6;background:#f7f9fc;font-weight:800;">${escapeHtml(agent.name)}</td>
          <td align="center" style="padding:8px;border:1px solid #d8dee6;text-align:center;">${escapeHtml(formatInteger(agent.currentBookings))}</td>
          <td align="center" style="padding:8px;border:1px solid #d8dee6;text-align:center;">${escapeHtml(snapshotSignedInteger(agent.bookingsVariance))}</td>
          <td align="center" style="padding:8px;border:1px solid #d8dee6;text-align:center;">${escapeHtml(formatCurrency(agent.currentTheoretical, currency))}</td>
          <td align="center" style="padding:8px;border:1px solid #d8dee6;text-align:center;">${escapeHtml(snapshotSignedCurrency(agent.theoreticalVariance, currency))}</td>
          <td align="center" style="padding:8px;border:1px solid #d8dee6;text-align:center;${agent.currentWinLoss < 0 ? "color:#b42318;font-weight:900;" : ""}">${escapeHtml(formatCurrency(agent.currentWinLoss, currency))}</td>
          <td align="center" style="padding:8px;border:1px solid #d8dee6;text-align:center;">${escapeHtml(snapshotSignedCurrency(agent.winLossVariance, currency))}</td>
        </tr>`).join("") : `<tr><td colspan="7" style="padding:12px;border:1px solid #d8dee6;text-align:center;color:#667085;">No Booking Executive data available.</td></tr>`;

      return `
        <div style="margin:30px 0 14px;padding:18px;background:#172b4d;color:#ffffff;text-align:center;border-radius:10px;">
          <div style="font-size:11px;letter-spacing:.12em;font-weight:900;">${escapeHtml(comparisonTypeLabel(pair))} EXECUTIVE SNAPSHOT</div>
          <h2 style="margin:6px 0 0;font-size:24px;color:#ffffff;">${escapeHtml(formatMonth(pair.fromMonth))} vs ${escapeHtml(formatMonth(pair.toMonth))}</h2>
        </div>
        <h3 style="margin:0 0 10px;text-align:center;color:#172b4d;font-size:18px;">${escapeHtml(formatMonth(pair.toMonth))} totals and variances</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr>
            <th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">KPI</th>
            <th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">${escapeHtml(formatMonth(pair.fromMonth))}</th>
            <th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">${escapeHtml(formatMonth(pair.toMonth))}</th>
            <th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Variance</th>
            <th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">%</th>
          </tr></thead><tbody>${rows}</tbody>
        </table>
        <p style="margin:8px 0 0;color:#667085;font-size:11px;text-align:left;">Variance values show direction with arrows and positive magnitudes. W/L variance is from Pace/casino perspective: ▲ means Pace won more; ▼ means Pace won less.</p>
        <h3 style="margin:20px 0 10px;text-align:center;color:#172b4d;font-size:18px;">Booking Executive performance</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead><tr>
            <th style="padding:8px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Booking Executive</th>
            <th style="padding:8px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Bookings</th>
            <th style="padding:8px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Δ</th>
            <th style="padding:8px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Theoretical</th>
            <th style="padding:8px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Δ Theo</th>
            <th style="padding:8px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">W/L</th>
            <th style="padding:8px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Δ W/L (Pace)</th>
          </tr></thead><tbody>${executiveRows}</tbody>
        </table>`;
    };

    const topPatronSections = months.map(item => {
      const rows = (item.topPlayers || []).map((player, index) => `
        <tr>
          <td style="padding:9px;border:1px solid #d8dee6;background:#f7f9fc;font-weight:800;">${escapeHtml(patronOwnerLabel(player, index))}</td>
          <td align="center" style="padding:9px;border:1px solid #d8dee6;${player.winLoss < 0 ? "color:#b42318;font-weight:900;" : ""}">${escapeHtml(formatCurrency(player.winLoss, currency))}</td>
          <td align="center" style="padding:9px;border:1px solid #d8dee6;font-weight:900;${player.theoretical < 0 ? "color:#c62828;background:#fff0f0;" : ""}">${escapeHtml(formatCurrency(player.theoretical, currency))}</td>
        </tr>`).join("") || `<tr><td colspan="3" style="padding:12px;border:1px solid #d8dee6;text-align:center;color:#667085;">No theoretical player data available.</td></tr>`;
      return `<h3 style="margin:18px 0 8px;text-align:center;color:#172b4d;font-size:16px;">${escapeHtml(formatMonth(item.month))}</h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead><tr><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Patron - Booking Executive</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">W/L</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Theoretical</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join("");

    const agentRows = months.map(item => {
      const agents = combineCanonicalAgentGroups(item.agents || []);
      const loss = selectHighestLoss(agents);
      const bookings = highest(agents, "bookings");
      const theoretical = highest(agents, "theoretical");
      return `<tr>
        <td style="padding:9px;border:1px solid #d8dee6;background:#f7f9fc;font-weight:800;">${escapeHtml(formatMonth(item.month))}</td>
        <td align="center" style="padding:9px;border:1px solid #d8dee6;">${loss ? `${escapeHtml(loss.name)}<br>${escapeHtml(formatCurrency(loss.winLoss, currency))}` : "No data"}</td>
        <td align="center" style="padding:9px;border:1px solid #d8dee6;">${bookings ? `${escapeHtml(bookings.name)}<br><strong>${escapeHtml(formatInteger(bookings.bookings))}</strong>` : "No data"}</td>
        <td align="center" style="padding:9px;border:1px solid #d8dee6;">${theoretical ? `${escapeHtml(theoretical.name)}<br><strong>${escapeHtml(formatCurrency(theoretical.theoretical, currency))}</strong>` : "No data"}</td>
      </tr>`;
    }).join("");

    const executiveSnapshotPairs = getExecutiveSnapshotPairs(report);
    const comparisons = executiveSnapshotPairs.map(pair => requiredEmailComparison(report, pair.fromMonth, pair.toMonth));
    const comparisonRows = comparisons.map(item => `<tr>
      <td style="padding:10px;border:1px solid #d8dee6;background:#f7f9fc;font-weight:800;">${escapeHtml(formatMonth(item.fromMonth))} vs ${escapeHtml(formatMonth(item.toMonth))}</td>
      <td align="center" style="padding:10px;border:1px solid #d8dee6;">${emailAmount(item.fromValue, currency)}</td>
      <td align="center" style="padding:10px;border:1px solid #d8dee6;font-weight:900;">${emailAmount(item.toValue, currency)}</td>
      <td align="center" style="padding:10px;border:1px solid #d8dee6;font-weight:900;">${item.difference === null ? "N/A" : escapeHtml(snapshotSignedCurrency(item.difference, currency))}</td>
      <td align="center" style="padding:10px;border:1px solid #d8dee6;font-weight:900;">${escapeHtml(snapshotPercentLabel(item.percentChange))}</td>
    </tr>`).join("");

    const prospectMonths = [...new Set(months.map(item => item.month).filter(month => /^\d{4}-\d{2}$/.test(month || "")))];
    const prospectMatrix = buildNewProspectMatrix(report.newProspects, prospectMonths);
    const prospectRows = prospectMatrix.executives.length ? prospectMatrix.executives.map(executive => `<tr>
      <td style="padding:9px;border:1px solid #d8dee6;background:#f7f9fc;font-weight:800;">${escapeHtml(executive)}</td>
      ${prospectMonths.map(month => { const key = `${month}|${executive}`; return `<td align="center" style="padding:9px;border:1px solid #d8dee6;">${prospectMatrix.values.has(key) ? escapeHtml(formatInteger(prospectMatrix.values.get(key))) : "—"}</td>`; }).join("")}
      <td align="center" style="padding:9px;border:1px solid #d8dee6;font-weight:900;">${escapeHtml(formatInteger(prospectMatrix.executiveTotals[executive] || 0))}</td>
    </tr>`).join("") : `<tr><td colspan="${prospectMonths.length + 2}" style="padding:12px;border:1px solid #d8dee6;text-align:center;color:#667085;">No new player entries were added.</td></tr>`;
    const totalProspectMap = new Map(normalizeTotalProspectEntries(report.totalProspects, prospectMonths).map(entry => [entry.month, entry.value]));
    const effectiveProspectTotals = Object.fromEntries(prospectMonths.map(month => [month, totalProspectMap.has(month) ? totalProspectMap.get(month) : (prospectMatrix.totals[month] || 0)]));
    const effectiveProspectGrandTotal = prospectMonths.reduce((sum, month) => sum + (Number(effectiveProspectTotals[month]) || 0), 0);
    const prospectTotalRow = `<tr><td style="padding:9px;border:1px solid #d8dee6;background:#eaf2f8;font-weight:900;">TOTAL NEW PLAYERS ADDED</td>${prospectMonths.map(month => `<td align="center" style="padding:9px;border:1px solid #d8dee6;background:#eaf2f8;font-weight:900;">${escapeHtml(formatInteger(effectiveProspectTotals[month] || 0))}</td>`).join("")}<td align="center" style="padding:9px;border:1px solid #d8dee6;background:#eaf2f8;font-weight:900;">${escapeHtml(formatInteger(effectiveProspectGrandTotal))}</td></tr>`;
    const prospectOverallRow = "";

    const body = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#eef2f6;"><tr><td align="center" style="padding:24px;">
      <table role="presentation" width="900" cellpadding="0" cellspacing="0" style="width:100%;max-width:900px;background:#fff;color:#1f2937;font-family:Arial,Helvetica,sans-serif;line-height:1.45;border-collapse:collapse;">
        <tr><td align="center" style="padding:28px 24px;background:#172b4d;color:#fff;border-radius:14px 14px 0 0;"><h1 style="margin:0;font-size:26px;color:#fff;">${escapeHtml(emailHeader)}</h1><p style="margin:8px 0 0;font-size:13px;color:#dbe4f0;">Internal performance report</p></td></tr>
        ${draftSection ? `<tr><td align="center" style="padding:22px 28px 8px;border-left:1px solid #d8dee6;border-right:1px solid #d8dee6;">${draftSection}</td></tr>` : ""}
        ${getExecutiveSnapshotPairs(report).length ? `<tr><td style="padding:18px 28px 8px;border-left:1px solid #d8dee6;border-right:1px solid #d8dee6;">${emailKpiSummaryOverviewHtml(report)}</td></tr>` : ""}
        <tr><td style="padding:24px;border:1px solid #d8dee6;${draftSection ? "border-top:0;" : ""}">
          <h2 style="margin:0 0 14px;text-align:center;color:#172b4d;font-size:20px;">Required Monthly KPI Totals</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr><th style="padding:10px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">KPI</th>${months.map(item => `<th style="padding:10px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">${escapeHtml(formatMonth(item.month))}</th>`).join("")}</tr></thead><tbody>${totalRows}</tbody></table>
          ${executiveSnapshotPairs.map(snapshotEmailSection).join("")}
          <h2 style="margin:30px 0 10px;text-align:center;color:#172b4d;font-size:20px;">Top 5 Theoretical Players</h2>${topPatronSections}
          <h2 style="margin:30px 0 12px;text-align:center;color:#172b4d;font-size:20px;">Booking Executive KPI Performance</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Month</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Highest Player Loss</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Most Bookings</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Most Aggregate Theoretical</th></tr></thead><tbody>${agentRows}</tbody></table>
          <h2 style="margin:30px 0 12px;text-align:center;color:#172b4d;font-size:20px;">Theoretical Comparison</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Comparison</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Prior</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Current</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Variance</th><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">%</th></tr></thead><tbody>${comparisonRows}</tbody></table>
          <h2 style="margin:30px 0 12px;text-align:center;color:#172b4d;font-size:20px;">Number of New Players Added</h2>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr><th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Executive</th>${prospectMonths.map(month => `<th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">${escapeHtml(formatMonth(month))}</th>`).join("")}<th style="padding:9px;border:1px solid #d8dee6;background:#172b4d;color:#fff;">Total</th></tr></thead><tbody>${prospectRows}${prospectTotalRow}${prospectOverallRow}</tbody></table>
        </td></tr>
        <tr><td align="center" style="padding:14px 24px;background:#f4f6f8;border:1px solid #d8dee6;border-top:0;border-radius:0 0 14px 14px;color:#667085;font-size:11px;text-transform:uppercase;letter-spacing:.06em;">Internal Copy · Confidential · Prepared by ${escapeHtml(report.preparedBy || "Anne Joy")}</td></tr>
      </table></td></tr></table>`;

    const highlightedBody = highlightNegativeAmountsInHtml(body);
    if (!fullDocument) return highlightedBody;
    const subject = els.emailSubject?.value.trim() || emailSubjectFor(report);
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head><body style="margin:0;padding:0;background:#eef2f6;">${highlightedBody}</body></html>`;
  }

  function emailPlainText(html) {
    const holder = document.createElement("div");
    holder.innerHTML = html;
    return holder.innerText.replace(/\n{3,}/g, "\n\n").trim();
  }

  function renderEmailPreview(report, preserveFields = false) {
    if (!preserveFields || !els.emailSubject.value.trim()) {
      els.emailSubject.value = emailSubjectFor(report);
    }
    if (!preserveFields || !els.emailDraftMessage.value.trim()) {
      els.emailDraftMessage.value = suggestedEmailDraft(report);
    }
    els.emailPreview.innerHTML = buildEmailReportHtml(report, false);
    applyNegativeAmountHighlighting(els.emailPreview);
  }

  async function copyEmailReport() {
    if (!state.currentReport) return;
    const html = buildEmailReportHtml(state.currentReport, false);
    const plain = emailPlainText(html);
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" })
        })]);
      } else {
        const holder = document.createElement("div");
        holder.contentEditable = "true";
        holder.style.position = "fixed";
        holder.style.left = "-9999px";
        holder.innerHTML = html;
        document.body.appendChild(holder);
        const range = document.createRange();
        range.selectNodeContents(holder);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy");
        selection.removeAllRanges();
        holder.remove();
      }
      showMessage("Styled email copied. Paste it into Gmail or Outlook.", "success");
    } catch (error) {
      console.error(error);
      showMessage("Copy was blocked. Use Download Email HTML instead.", "error");
    }
  }

  function downloadEmailReport() {
    if (!state.currentReport) return;
    const html = buildEmailReportHtml(state.currentReport, true);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${mainPdfExportTitle(state.currentReport)} - Email.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showMessage("Email HTML downloaded.", "success");
  }

  function getMainPdfPages() {
    const reportRoot = els.printReport || document.getElementById("printReport");
    if (!reportRoot) return [];

    const titlePage = reportRoot.querySelector(".pdf-title-page");
    const reportPages = [...reportRoot.querySelectorAll(".pdf-report-page")];

    return [titlePage, ...reportPages].filter(page =>
      page &&
      !page.classList.contains("pdf-hide-on-print") &&
      !page.classList.contains("hidden")
    );
  }

  function prepareMainPdfPageNumbers() {
    const pages = getMainPdfPages();
    const totalPages = pages.length;

    pages.forEach((page, index) => {
      page.querySelectorAll(":scope > .pdf-page-number").forEach(node => node.remove());
      const pageNumber = document.createElement("footer");
      pageNumber.className = "pdf-page-number";
      pageNumber.setAttribute("aria-hidden", "true");
      pageNumber.textContent = `Page ${index + 1} of ${totalPages}`;
      page.appendChild(pageNumber);
    });
  }

  function clearMainPdfPageNumbers() {
    document.querySelectorAll("#printReport .pdf-page-number").forEach(node => node.remove());
  }

  function printReportWithoutBrowserFooter() {
    if (!state.currentReport) return;

    const previousTitle = document.title;
    document.title = mainPdfExportTitle(state.currentReport);
    prepareMainPdfPageNumbers();
    document.body.classList.add("kpi-print-mode");

    let cleaned = false;
    let fallbackTimer = null;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      document.body.classList.remove("kpi-print-mode");
      clearMainPdfPageNumbers();
      document.title = previousTitle;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();

    // Keep the export title active while the print/save dialog is open.
    // This allows the browser's suggested PDF filename to use the full naming convention.
    fallbackTimer = window.setTimeout(cleanup, 60000);
  }


  function getExecutiveSnapshotPairs(report = state.currentReport) {
    // Complete PDF, email, filename, and separate PDFs all follow the comparison
    // pairs selected for the current report. No month is hard-coded.
    const storedPairs = (report?.comparisons || [])
      .map(item => ({ fromMonth: item.fromMonth, toMonth: item.toMonth }))
      .filter(pair => pair.fromMonth && pair.toMonth && pair.fromMonth !== pair.toMonth);

    const sourcePairs = storedPairs.length ? storedPairs : getSeparateComparisonPairs();
    const seen = new Set();
    return sourcePairs.filter(pair => {
      const key = `${pair.fromMonth}|${pair.toMonth}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function getSeparateComparisonPairs() {
    const seen = new Set();
    return getComparisonSettings()
      .map(pair => ({ fromMonth: pair.from, toMonth: pair.to }))
      .filter(pair => {
        if (!pair.fromMonth || !pair.toMonth || pair.fromMonth === pair.toMonth) return false;
        const key = `${pair.fromMonth}|${pair.toMonth}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function comparisonEmailSubject(pair) {
    return `KPI - ${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}`;
  }

  function combinedComparisonEmailSubject(report = state.currentReport) {
    const pairs = getExecutiveSnapshotPairs(report);
    if (!pairs.length) return "Pace Gaming KPI Comparison Reports";
    const labels = pairs.map(pair => `${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}`);
    return `KPI Reports - ${labels.join(" | ")}`;
  }

  function combinedComparisonEmailBody(report = state.currentReport) {
    if (!report) return "";
    const preparedBy = report?.preparedBy || "Anne Joy";
    const pairs = getExecutiveSnapshotPairs(report);

    if (!pairs.length) {
      return `Hi Team,

Please find attached the Pace Gaming KPI report.

Thank you,
${preparedBy}`;
    }

    const attachmentList = pairs
      .map(pair => `• ${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}`)
      .join("\n");
    const summaryMonths = getEmailSummaryMonths(report);
    const monthlyBlocks = summaryMonths.map(month => monthlyEmailSummaryBlock(report, month)).join("\n\n");

    const comparisonLines = pairs.map(pair => {
      const bookings = emailComparisonMetricChange(report, pair, "bookings", "integer").text;
      const theo = emailComparisonMetricChange(report, pair, "theoretical", "currency").text;
      const wl = emailComparisonMetricChange(report, pair, "playerWinLoss", "currency").text;
      const commission = emailComparisonMetricChange(report, pair, "commission", "currency").text;
      return `${comparisonTypeLabel(pair).replace(/-/g, " ")} — ${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}
Bookings: ${bookings} | Theo: ${theo} | Pace W/L Change: ${wl} | Commission: ${commission}`;
    }).join("\n\n");

    return `Hi Team,

Attached are the Pace Gaming KPI comparison reports:
${attachmentList}

${emailKpiSummaryTitle(report)}

${monthlyBlocks}

Comparison Summary
${comparisonLines}

The attached PDFs include the detailed KPI totals, variances, and Booking Executive performance for each comparison.

Thank you,
${preparedBy}`;
  }

  function combinedComparisonEmailDraft(report = state.currentReport) {
    if (!report) return "";
    return `Subject: ${combinedComparisonEmailSubject(report)}\n\n${combinedComparisonEmailBody(report)}`;
  }

  async function copyTextToClipboard(text, successMessage) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.style.position = "fixed";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      showMessage(successMessage, "success");
    } catch (error) {
      console.error(error);
      showMessage("The email text could not be copied. Please try again.", "error");
    }
  }

  function combinedComparisonEmailBodyHtml(report = state.currentReport, bodyOverride = "") {
    if (!report) return "";
    const preparedBy = report?.preparedBy || "Anne Joy";
    const pairs = getExecutiveSnapshotPairs(report);
    const attachmentList = pairs.map(pair => `<div style="margin:0 0 3px 16px;">• ${escapeHtml(formatMonth(pair.fromMonth))} vs ${escapeHtml(formatMonth(pair.toMonth))}</div>`).join("");
    return `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.45;max-width:860px;">
        <p style="margin:0 0 14px;">Hi Team,</p>
        <p style="margin:0 0 8px;"><strong>Attached are the Pace Gaming KPI comparison reports:</strong></p>
        <div style="margin:0 0 20px;">${attachmentList}</div>
        ${emailKpiSummaryOverviewHtml(report)}
        <p style="margin:22px 0 14px;">The attached PDFs include the detailed KPI totals, variances, and Booking Executive performance for each comparison.</p>
        <p style="margin:0;">Thank you,<br>${escapeHtml(preparedBy)}</p>
      </div>`;
  }

  async function copyFormattedEmailBody(report = state.currentReport, bodyOverride = "") {
    const html = combinedComparisonEmailBodyHtml(report);
    const holder = document.createElement("div");
    holder.innerHTML = html;
    const plain = (holder.innerText || combinedComparisonEmailBody(report)).trim();
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
        const item = new ClipboardItem({
          "text/plain": new Blob([plain], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" })
        });
        await navigator.clipboard.write([item]);
        showMessage("Styled KPI summary copied. Paste it directly into Gmail or Outlook.", "success");
        return;
      }
    } catch (error) {
      console.warn("Rich email copy unavailable; using plain text fallback.", error);
    }
    return copyTextToClipboard(plain, "KPI summary copied. Paste it directly into Gmail or Outlook.");
  }

  async function copyCombinedComparisonEmailDraft(report = state.currentReport, bodyOverride = "") {
    if (!report) {
      showMessage("Generate the KPI report before copying the email summary.", "error");
      return;
    }
    const body = String(bodyOverride || combinedComparisonEmailBody(report)).trim();
    const count = getExecutiveSnapshotPairs(report).length;
    return copyTextToClipboard(
      body,
      `Email summary copied for ${count} selected comparison report${count === 1 ? "" : "s"}. Paste it directly into Gmail or Outlook.`
    );
  }

  function updateExecutiveSnapshotButtons(report) {
    if (!els.snapshotExportActions) return;

    const pairs = getSeparateComparisonPairs();
    const reportMonths = new Set((report?.monthlyData || []).map(item => item.month));

    if (!pairs.length) {
      els.snapshotExportActions.innerHTML = `<span class="snapshot-export-empty">Select at least one complete comparison pair, then generate the report.</span>`;
      return;
    }

    els.snapshotExportActions.innerHTML = "";
    const separateList = document.createElement("div");
    separateList.className = "separate-pdf-button-grid";
    els.snapshotExportActions.appendChild(separateList);
    pairs.forEach(pair => {
      const hasBothMonths = Boolean(
        report && reportMonths.has(pair.fromMonth) && reportMonths.has(pair.toMonth)
      );

      const group = document.createElement("div");
      group.className = "snapshot-export-action-group";

      const pdfButton = document.createElement("button");
      pdfButton.className = "btn secondary";
      pdfButton.type = "button";
      pdfButton.textContent = `Download ${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)} PDF`;
      pdfButton.title = hasBothMonths
        ? `Export this selected comparison as a two-page PDF: KPI variance on Page 1 and Booking Executives on Page 2.`
        : `Generate the report with ${formatMonth(pair.fromMonth)} and ${formatMonth(pair.toMonth)} included before exporting.`;
      pdfButton.disabled = !hasBothMonths;
      pdfButton.addEventListener("click", () => exportExecutiveSnapshotPair(pair));

      group.append(pdfButton);
      separateList.appendChild(group);
    });

    const availablePairs = pairs.filter(pair =>
      report && reportMonths.has(pair.fromMonth) && reportMonths.has(pair.toMonth)
    );

    const summaryRow = document.createElement("div");
    summaryRow.className = "snapshot-email-summary-row";

    const summaryCopy = document.createElement("div");
    summaryCopy.className = "snapshot-email-summary-copy";
    summaryCopy.innerHTML = `
      <strong>Combined team email</strong>
      <span>Clean KPI table by month, followed by Year-over-Year and Month-over-Month comparison tables. Full report detail stays in the attached PDFs.</span>
    `;

    const subjectWrap = document.createElement("label");
    subjectWrap.className = "snapshot-email-field";
    subjectWrap.innerHTML = `<span>Subject</span>`;
    const subjectInput = document.createElement("input");
    subjectInput.type = "text";
    subjectInput.value = report ? combinedComparisonEmailSubject(report) : "";
    subjectInput.disabled = !report || availablePairs.length !== pairs.length;
    subjectWrap.appendChild(subjectInput);

    const bodyWrap = document.createElement("div");
    bodyWrap.className = "snapshot-email-field snapshot-email-body-field";
    bodyWrap.innerHTML = `<span>Email summary preview</span>`;
    const bodyPreview = document.createElement("div");
    bodyPreview.className = "snapshot-email-rich-preview";
    bodyPreview.innerHTML = report
      ? combinedComparisonEmailBodyHtml(report)
      : `<p>Generate the report to create the email summary.</p>`;
    bodyWrap.appendChild(bodyPreview);

    const actions = document.createElement("div");
    actions.className = "snapshot-email-actions";

    const copySubjectButton = document.createElement("button");
    copySubjectButton.className = "btn secondary";
    copySubjectButton.type = "button";
    copySubjectButton.textContent = "Copy Subject";
    copySubjectButton.disabled = subjectInput.disabled;
    copySubjectButton.addEventListener("click", () => copyTextToClipboard(subjectInput.value.trim(), "Email subject copied."));

    const combinedDraftButton = document.createElement("button");
    combinedDraftButton.className = "btn primary comparison-summary-btn";
    combinedDraftButton.type = "button";
    combinedDraftButton.textContent = "Copy Styled Email Summary";
    combinedDraftButton.title = "Copy the KPI summary table plus Year-over-Year and Month-over-Month comparison tables for Gmail or Outlook.";
    combinedDraftButton.disabled = !report || availablePairs.length !== pairs.length;
    combinedDraftButton.addEventListener("click", () => copyFormattedEmailBody(report));

    actions.append(copySubjectButton, combinedDraftButton);
    summaryRow.append(summaryCopy, subjectWrap, bodyWrap, actions);
    els.snapshotExportActions.appendChild(summaryRow);
  }

  function findSnapshotMonthData(report, month) {
    return (report?.monthlyData || []).find(item => item.month === month) || {
      month,
      summary: summarizeMonth([]),
      agents: []
    };
  }

  function snapshotProspectTotal(report, month) {
    const manualTotal = getTotalProspectValue(report?.totalProspects || [], month);
    if (manualTotal !== null) return manualTotal;
    const matrix = buildNewProspectMatrix(report?.newProspects || [], [month]);
    return matrix.totals[month] || 0;
  }

  function snapshotPercentChange(prior, current) {
    const previous = Number(prior) || 0;
    const latest = Number(current) || 0;
    if (previous === 0) return latest === 0 ? 0 : null;
    return (latest - previous) / Math.abs(previous);
  }

  function snapshotPercentLabel(value) {
    if (value === null || value === undefined || !Number.isFinite(value)) return "N/A";
    const percent = Number(value) * 100;
    if (Math.abs(percent) < 0.00001) return "0.0%";
    const direction = percent > 0 ? "▲" : "▼";
    return `${direction} ${Math.abs(percent).toFixed(1)}%`;
  }

  function snapshotSignedInteger(value) {
    const number = Number(value) || 0;
    if (Math.abs(number) < 0.00001) return formatInteger(0);
    const direction = number > 0 ? "▲" : "▼";
    return `${direction} ${formatInteger(Math.abs(number))}`;
  }

  function snapshotSignedCurrency(value, currency) {
    const number = Number(value) || 0;
    if (Math.abs(number) < 0.00001) return formatCurrency(0, currency);
    const direction = number > 0 ? "▲" : "▼";
    return `${direction} ${formatCurrency(Math.abs(number), currency)}`;
  }

  function snapshotVarianceClass(value) {
    const number = Number(value) || 0;
    return number > 0 ? "snapshot-positive" : number < 0 ? "snapshot-negative" : "snapshot-neutral";
  }

  function mergeSnapshotAgents(priorAgents, currentAgents) {
    const rows = new Map();

    const add = (agent, period) => {
      const executive = canonicalBookingExecutive(agent?.name);
      const name = executive.name;
      const key = normalizeName(name);
      if (!key) return;
      if (!rows.has(key)) {
        rows.set(key, {
          name,
          code: executive.code,
          priorBookings: 0,
          currentBookings: 0,
          priorTheoretical: 0,
          currentTheoretical: 0,
          priorWinLoss: 0,
          currentWinLoss: 0
        });
      }
      const row = rows.get(key);
      row[`${period}Bookings`] = Number(agent.bookings) || 0;
      row[`${period}Theoretical`] = Number(agent.theoretical) || 0;
      row[`${period}WinLoss`] = Number(agent.winLoss) || 0;
    };

    (priorAgents || []).forEach(agent => add(agent, "prior"));
    (currentAgents || []).forEach(agent => add(agent, "current"));

    return [...rows.values()]
      .map(row => ({
        ...row,
        bookingsVariance: row.currentBookings - row.priorBookings,
        theoreticalVariance: row.currentTheoretical - row.priorTheoretical,
        // Player W/L is stored from the player perspective. For comparison variance,
        // invert it so a larger casino win is shown as an improvement for Pace.
        winLossVariance: row.priorWinLoss - row.currentWinLoss
      }))
      .sort((a, b) =>
        b.currentTheoretical - a.currentTheoretical ||
        b.currentBookings - a.currentBookings ||
        a.name.localeCompare(b.name)
      )
      .slice(0, 10);
  }

  function comparisonTypeLabel(pair) {
    const from = monthValueToDate(pair?.fromMonth);
    const to = monthValueToDate(pair?.toMonth);
    if (!from || !to || Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return "KPI COMPARISON";
    const sameMonth = from.getMonth() === to.getMonth();
    const yearGap = to.getFullYear() - from.getFullYear();
    if (sameMonth && yearGap === 1) return "YEAR-OVER-YEAR";
    const monthGap = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
    if (monthGap === 1) return "MONTH-OVER-MONTH";
    return "PERIOD COMPARISON";
  }

  function comparisonPriorLabel(pair) {
    const type = comparisonTypeLabel(pair);
    if (type === "YEAR-OVER-YEAR") return "prior year";
    if (type === "MONTH-OVER-MONTH") return "prior month";
    return "prior period";
  }

  function buildExecutiveSnapshotHtml(report, pair) {
    const prior = findSnapshotMonthData(report, pair.fromMonth);
    const current = findSnapshotMonthData(report, pair.toMonth);
    const priorProspects = snapshotProspectTotal(report, pair.fromMonth);
    const currentProspects = snapshotProspectTotal(report, pair.toMonth);
    const currency = report.currency;

    const metricDefinitions = [
      { label: "Number of Bookings Players", key: "bookings", type: "integer" },
      { label: "Total Credit", key: "credit", type: "currency" },
      { label: "Total Front Money", key: "frontMoney", type: "currency" },
      { label: "Total Bankroll", key: "bankroll", type: "currency" },
      { label: "Total Theoretical", key: "theoretical", type: "currency" },
      { label: "Total W/L", key: "playerWinLoss", type: "currency" },
      { label: "Total Commission", key: "commission", type: "currency" },
      { label: "Total New Players Added", key: "newProspects", type: "integer" }
    ];

    const valueFor = (monthData, key, prospectTotal) => {
      if (key === "newProspects") return prospectTotal;
      return Number(monthData.summary?.[key]) || 0;
    };

    const metricRows = metricDefinitions.map(metric => {
      const priorValue = valueFor(prior, metric.key, priorProspects);
      const currentValue = valueFor(current, metric.key, currentProspects);
      const variance = metric.key === "playerWinLoss"
        ? priorValue - currentValue
        : currentValue - priorValue;
      const percent = metric.key === "playerWinLoss"
        ? snapshotPercentChange(-priorValue, -currentValue)
        : snapshotPercentChange(priorValue, currentValue);
      const formatValue = metric.type === "integer"
        ? value => formatInteger(value)
        : value => formatCurrency(value, currency);
      const formatVariance = metric.type === "integer"
        ? value => snapshotSignedInteger(value)
        : value => snapshotSignedCurrency(value, currency);

      return `
        <tr>
          <th scope="row">${escapeHtml(metric.label)}</th>
          <td class="${metric.type === "currency" ? negativeValueClass(priorValue).trim() : ""}">${escapeHtml(formatValue(priorValue))}</td>
          <td class="${metric.type === "currency" ? negativeValueClass(currentValue).trim() : ""}"><strong>${escapeHtml(formatValue(currentValue))}</strong></td>
          <td class="${snapshotVarianceClass(variance)}">${escapeHtml(formatVariance(variance))}</td>
          <td class="${snapshotVarianceClass(percent)}">${escapeHtml(snapshotPercentLabel(percent))}</td>
        </tr>`;
    }).join("");

    const executiveRows = mergeSnapshotAgents(prior.agents, current.agents);
    const agentRows = executiveRows.length
      ? executiveRows.map(agent => `
        <tr>
          <th scope="row">${escapeHtml(agent.name)}</th>
          <td>${escapeHtml(formatInteger(agent.currentBookings))}</td>
          <td class="${snapshotVarianceClass(agent.bookingsVariance)}">${escapeHtml(snapshotSignedInteger(agent.bookingsVariance))}</td>
          <td class="${negativeValueClass(agent.currentTheoretical).trim()}">${escapeHtml(formatCurrency(agent.currentTheoretical, currency))}</td>
          <td class="${snapshotVarianceClass(agent.theoreticalVariance)}">${escapeHtml(snapshotSignedCurrency(agent.theoreticalVariance, currency))}</td>
          <td class="wl-value${negativeValueClass(agent.currentWinLoss)}">${escapeHtml(formatCurrency(agent.currentWinLoss, currency))}</td>
          <td class="${snapshotVarianceClass(agent.winLossVariance)}">${escapeHtml(snapshotSignedCurrency(agent.winLossVariance, currency))}</td>
        </tr>`).join("")
      : `<tr><td colspan="7" class="snapshot-empty">No Booking Executive data available for this comparison.</td></tr>`;

    const currentTheoVariance = (Number(current.summary?.theoretical) || 0) - (Number(prior.summary?.theoretical) || 0);
    // Player W/L is signed from the player perspective; show comparison movement from Pace/casino perspective.
    const currentWlVariance = (Number(prior.summary?.playerWinLoss) || 0) - (Number(current.summary?.playerWinLoss) || 0);
    const bookingsVariance = (Number(current.summary?.bookings) || 0) - (Number(prior.summary?.bookings) || 0);
    const prospectVariance = currentProspects - priorProspects;

    return `
      <article class="executive-snapshot-page">
        <header class="executive-snapshot-header">
          <div class="executive-snapshot-brand">
            <img src="logo.png" alt="Pace Gaming logo" />
            <div>
              <p class="executive-snapshot-kicker">CONFIDENTIAL · EXECUTIVE SNAPSHOT</p>
              <h1>Pace Gaming Internal KPI</h1>
              <h2>${escapeHtml(formatMonth(pair.toMonth))} Performance</h2>
            </div>
          </div>
          <div class="executive-snapshot-period">
            <span>Comparison</span>
            <strong>${escapeHtml(formatMonth(pair.fromMonth))} vs ${escapeHtml(formatMonth(pair.toMonth))}</strong>
            <small>Generated ${escapeHtml(formatReportDate(report.generatedAt))}</small>
          </div>
        </header>

        <section class="snapshot-highlight-grid" aria-label="Current month highlights">
          <div class="snapshot-highlight-card">
            <span>Bookings</span>
            <strong>${escapeHtml(formatInteger(current.summary?.bookings || 0))}</strong>
            <small class="${snapshotVarianceClass(bookingsVariance)}">${escapeHtml(snapshotSignedInteger(bookingsVariance))} vs ${escapeHtml(comparisonPriorLabel(pair))}</small>
          </div>
          <div class="snapshot-highlight-card">
            <span>Total Theoretical</span>
            <strong class="${negativeValueClass(current.summary?.theoretical || 0).trim()}">${escapeHtml(formatCurrency(current.summary?.theoretical || 0, currency))}</strong>
            <small class="${snapshotVarianceClass(currentTheoVariance)}">${escapeHtml(snapshotSignedCurrency(currentTheoVariance, currency))} vs ${escapeHtml(comparisonPriorLabel(pair))}</small>
          </div>
          <div class="snapshot-highlight-card">
            <span>Total W/L</span>
            <strong class="wl-value${negativeValueClass(current.summary?.playerWinLoss || 0)}">${escapeHtml(formatCurrency(current.summary?.playerWinLoss || 0, currency))}</strong>
            <small class="${snapshotVarianceClass(currentWlVariance)}">${escapeHtml(snapshotSignedCurrency(currentWlVariance, currency))} vs ${escapeHtml(comparisonPriorLabel(pair))}</small>
          </div>
          <div class="snapshot-highlight-card">
            <span>New Players</span>
            <strong>${escapeHtml(formatInteger(currentProspects))}</strong>
            <small class="${snapshotVarianceClass(prospectVariance)}">${escapeHtml(snapshotSignedInteger(prospectVariance))} vs ${escapeHtml(comparisonPriorLabel(pair))}</small>
          </div>
        </section>

        <main class="executive-snapshot-content">
          <section class="snapshot-table-card snapshot-kpi-card">
            <div class="snapshot-card-heading">
              <div>
                <p>MONTHLY TOTALS</p>
                <h3>${escapeHtml(comparisonTypeLabel(pair).replace(/-/g, " ").toLowerCase().replace(/\b\w/g, char => char.toUpperCase()))} KPI variance</h3>
              </div>
            </div>
            <table class="snapshot-kpi-table">
              <thead>
                <tr>
                  <th>KPI</th>
                  <th>${escapeHtml(formatMonth(pair.fromMonth))}</th>
                  <th>${escapeHtml(formatMonth(pair.toMonth))}</th>
                  <th>Variance</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>${metricRows}</tbody>
            </table>
          </section>

          <section class="snapshot-table-card snapshot-agent-card">
            <div class="snapshot-card-heading">
              <div>
                <p>BOOKING EXECUTIVES</p>
                <h3>${escapeHtml(formatMonth(pair.toMonth))} performance and variance</h3>
              </div>
            </div>
            <table class="snapshot-agent-table">
              <thead>
                <tr>
                  <th>Booking Executive</th>
                  <th>Bookings</th>
                  <th>Δ</th>
                  <th>Theoretical</th>
                  <th>Δ Theo</th>
                  <th>W/L</th>
                  <th>Δ W/L (Pace)</th>
                </tr>
              </thead>
              <tbody>${agentRows}</tbody>
            </table>
          </section>
        </main>

        <footer class="executive-snapshot-footer">
          <p>Variance shows the size and direction of change. ▲ = increase, ▼ = decrease. W/L variance is shown from Pace/casino perspective (▲ means Pace won more). Report month is based on Check-Out Date.</p>
        </footer>
      </article>`;
  }


  function buildExecutiveSnapshotSplitPages(report, pair) {
    const holder = document.createElement("div");
    holder.innerHTML = buildExecutiveSnapshotHtml(report, pair).trim();
    const source = holder.querySelector(".executive-snapshot-page");
    if (!source) return { kpiPage: "", agentPage: "" };

    const buildHeader = (sectionTitle, kickerText) => {
      const header = source.querySelector(".executive-snapshot-header")?.cloneNode(true);
      if (!header) return "";
      const kicker = header.querySelector(".executive-snapshot-kicker");
      const heading = header.querySelector(".executive-snapshot-brand h2");
      if (kicker) kicker.textContent = kickerText;
      if (heading) heading.textContent = sectionTitle;
      return header.outerHTML;
    };

    const highlights = source.querySelector(".snapshot-highlight-grid")?.outerHTML || "";
    const kpiCard = source.querySelector(".snapshot-kpi-card")?.outerHTML || "";
    const agentCard = source.querySelector(".snapshot-agent-card")?.outerHTML || "";
    const footer = source.querySelector(".executive-snapshot-footer")?.outerHTML || "";
    const comparisonLabel = `${formatMonth(pair.fromMonth)} vs ${formatMonth(pair.toMonth)}`;

    return {
      kpiPage: `
        <article class="executive-snapshot-page executive-snapshot-split-page snapshot-kpi-only-page">
          ${buildHeader(`${comparisonLabel} · KPI Variance`, `CONFIDENTIAL · ${comparisonTypeLabel(pair)} KPI`)}
          ${highlights}
          <main class="executive-snapshot-content snapshot-single-content">${kpiCard}</main>
          ${footer}
        </article>`,
      agentPage: `
        <article class="executive-snapshot-page executive-snapshot-split-page snapshot-agent-only-page">
          ${buildHeader(`${comparisonLabel} · Booking Executives`, "CONFIDENTIAL · BOOKING EXECUTIVE PERFORMANCE")}
          <main class="executive-snapshot-content snapshot-single-content">${agentCard}</main>
          ${footer}
        </article>`
    };
  }

  function buildExecutiveSnapshotTwoPagePdfHtml(report, pair) {
    const pages = buildExecutiveSnapshotSplitPages(report, pair);
    return `
      <section class="separate-snapshot-print-page separate-snapshot-kpi-page">
        ${pages.kpiPage}
        <footer class="separate-snapshot-page-number">Page 1 of 2</footer>
      </section>
      <section class="separate-snapshot-print-page separate-snapshot-agent-page">
        ${pages.agentPage}
        <footer class="separate-snapshot-page-number">Page 2 of 2</footer>
      </section>`;
  }

  function renderIntegratedExecutiveSnapshots(report) {
    const container = els.integratedComparisonPages || document.getElementById("integratedComparisonPages");
    if (!container) return;

    const pairs = getExecutiveSnapshotPairs(report);
    container.innerHTML = pairs.map((pair, index) => {
      const pages = buildExecutiveSnapshotSplitPages(report, pair);
      return `
        <section class="report-block pdf-report-page comparison-split-page comparison-kpi-page pdf-only-section" data-comparison-index="${index + 1}">
          <div>${pages.kpiPage}</div>
        </section>
        <section class="report-block pdf-report-page comparison-split-page comparison-agent-page pdf-only-section" data-comparison-index="${index + 1}">
          <div>${pages.agentPage}</div>
        </section>`;
    }).join("");
  }

  function exportExecutiveSnapshotPair(pair) {
    if (!state.currentReport) {
      showMessage("Generate the KPI report before exporting a comparison PDF.", "error");
      return;
    }

    if (!pair?.fromMonth || !pair?.toMonth) {
      showMessage(`The requested comparison period is not available.`, "error");
      return;
    }

    const reportMonths = new Set((state.currentReport.monthlyData || []).map(item => item.month));
    if (!reportMonths.has(pair.fromMonth) || !reportMonths.has(pair.toMonth)) {
      showMessage(`The report does not contain both ${formatMonth(pair.fromMonth)} and ${formatMonth(pair.toMonth)}. Upload KPI data covering both months and regenerate the report.`, "error");
      return;
    }

    const previousTitle = document.title;
    document.title = snapshotPdfExportTitle(state.currentReport, pair);
    els.snapshotPrintRoot.innerHTML = buildExecutiveSnapshotTwoPagePdfHtml(state.currentReport, pair);
    els.snapshotPrintRoot.setAttribute("aria-hidden", "false");
    document.body.classList.add("snapshot-print-mode");

    let cleaned = false;
    let fallbackTimer = null;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      document.body.classList.remove("snapshot-print-mode");
      els.snapshotPrintRoot.setAttribute("aria-hidden", "true");
      els.snapshotPrintRoot.innerHTML = "";
      document.title = previousTitle;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();
    fallbackTimer = window.setTimeout(cleanup, 60000);
  }

  function exportCurrentReport() {
    if (!state.currentReport || typeof XLSX === "undefined") return;
    const report = state.currentReport;
    const workbook = XLSX.utils.book_new();

    const summaryRows = [
      ["KPI", ...report.monthlyData.map(item => formatMonth(item.month))],
      ["Number of Bookings Players (Check-Out Date)", ...report.monthlyData.map(item => item.summary.bookings)],
      ["Total Credit", ...report.monthlyData.map(item => item.summary.credit)],
      ["Total Front Money", ...report.monthlyData.map(item => item.summary.frontMoney)],
      ["Total Bankroll", ...report.monthlyData.map(item => item.summary.bankroll)],
      ["Total Theoretical", ...report.monthlyData.map(item => item.summary.theoretical)],
      ["Total W/L", ...report.monthlyData.map(item => item.summary.playerWinLoss)],
      ["Total Commission", ...report.monthlyData.map(item => item.summary.commission)]
    ];
    const prospectMonths = normalizeProspectDates(report.newProspectMonths || report.monthlyData.map(item => item.month));
    const prospectMatrix = buildNewProspectMatrix(report.newProspects, prospectMonths);
    const totalProspectMapForExcel = new Map(normalizeTotalProspectEntries(report.totalProspects, prospectMonths).map(entry => [entry.month, entry.value]));
    const excelEffectiveProspectTotals = Object.fromEntries(prospectMonths.map(month => [month, totalProspectMapForExcel.has(month) ? totalProspectMapForExcel.get(month) : (prospectMatrix.totals[month] || 0)]));
    if (prospectMatrix.executives.length || totalProspectMapForExcel.size) {
      const prospectBlock = [
        [],
        ["Player Growth"],
        ["Executive", ...prospectMonths.map(formatMonth), "Total"]
      ];
      if (prospectMatrix.executives.length) {
        prospectBlock.push(
          ...prospectMatrix.executives.map(executive => [
            executive,
            ...prospectMonths.map(month => {
              const key = `${month}|${executive}`;
              return prospectMatrix.values.has(key) ? prospectMatrix.values.get(key) : "";
            }),
            prospectMatrix.executiveTotals[executive] || 0
          ]),
          ["TOTAL NEW PLAYERS ADDED", ...prospectMonths.map(month => excelEffectiveProspectTotals[month] || 0), prospectMonths.reduce((sum, month) => sum + (Number(excelEffectiveProspectTotals[month]) || 0), 0)]
        );
      } else {
        prospectBlock.push(["TOTAL NEW PLAYERS ADDED", ...prospectMonths.map(month => excelEffectiveProspectTotals[month] || 0), prospectMonths.reduce((sum, month) => sum + (Number(excelEffectiveProspectTotals[month]) || 0), 0)]);
      }
      summaryRows.push(...prospectBlock);
    }

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), "KPI Summary");

    const playerRows = [
      ["Month", "Full Deal Name (Property - Player - Date)", "Win/Loss", "Theoretical"],
      ...report.monthlyData.flatMap(item =>
        item.topPlayers.map(row => [
          formatMonth(item.month),
          row.name,
          row.winLoss,
          row.theoretical
        ])
      )
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(playerRows), "Top Players");

    const bookingSummaryRows = [
      [
        "Player Full Name",
        "Properties Booked (Count)",
        ...report.monthlyData.map(item => formatMonth(item.month)),
        "Total Bookings",
        "Total Theoretical",
        "Total Win/Loss"
      ],
      ...(report.playerBookingSummary || []).map(player => [
        player.name,
        formatPlayerProperties(player.properties),
        ...report.monthlyData.map(item => player.months[item.month] || 0),
        player.totalBookings,
        player.totalTheoretical,
        player.totalWinLoss
      ])
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(bookingSummaryRows), "Top 10 Player Bookings");

    const agentRows = [
      ["Month", "Booking Executive (Deal Owner / Trip Contact)", "Bookings", "Player Win/Loss", "Theoretical", "Commission"],
      ...report.monthlyData.flatMap(item =>
        item.agents.map(row => [formatMonth(item.month), row.name, row.bookings, row.winLoss, row.theoretical, row.commission])
      )
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(agentRows), "Agent Performance");

    const qualityRows = [
      ["Quality Check", "Count"],
      ["Missing Deal Name", report.quality.missingDealName],
      ["Duplicate Deal Names", report.quality.duplicateDealNames],
      ["Missing Player Name", report.quality.missingPlayerName],
      ["Missing Check-Out Date", report.quality.missingCheckoutDate],
      ["Missing Booking Executive (Deal Owner / Trip Contact)", report.quality.missingBookingAgent],
      ["Missing Deal Owner (Owner)", report.quality.missingDealOwner],
      ["Missing Trip Contact", report.quality.missingTripContact],
      ["Missing Primary Contact Owner / Player Owner (Optional)", report.quality.missingPlayerOwner],
      ["Commission with Incomplete Rating", report.quality.commissionIncompleteRating]
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(qualityRows), "Data Quality");

    const safeCompany = report.companyName.replace(/[^\w-]+/g, "_");
    XLSX.writeFile(
      workbook,
      `${safeCompany}_Internal_KPI_Report_${reportMonthFileToken(report)}.xlsx`
    );
  }

  async function exportCurrentPresentation() {
    if (!state.currentReport) return;
    if (typeof pptxgen === "undefined") {
      showMessage("Presentation exporter did not load. Check your internet connection and refresh.", "error");
      return;
    }

    const report = state.currentReport;
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_WIDE";
    pptx.author = report.preparedBy || "Pace Gaming";
    pptx.subject = "Internal KPI Report";
    pptx.title = `${report.companyName} Internal KPI Report`;

    const primary = "172B4D";
    const muted = "667085";
    const line = "D8DEE6";
    const light = "F4F6F8";

    function addHeader(slide, subtitle) {
      slide.addImage({ path: "logo.png", x: 0.45, y: 0.25, w: 0.38, h: 0.38 });
      slide.addText(report.companyName, { x: 0.9, y: 0.25, w: 4.2, h: 0.25, fontSize: 10, bold: true, color: primary });
      slide.addText(subtitle, { x: 0.9, y: 0.5, w: 6.5, h: 0.22, fontSize: 8, color: muted });
      slide.addShape(pptx.ShapeType.line, { x: 0.45, y: 0.85, w: 12.45, h: 0, line: { color: line, width: 1 } });
    }

    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: "FFFFFF" };
    addHeader(titleSlide, "Internal KPI Presentation");
    titleSlide.addText(
      report.reportHeaderTitle || `${report.companyName} Internal KPI Report`,
      {
        x: 0.75, y: 1.45, w: 11.5, h: 0.55, fontSize: 30,
        fontFace: "Aptos Display", color: primary, bold: true, align: "center"
      }
    );
    titleSlide.addText(
      report.comparisonHeaderText ||
        formatComparisonHeaderForMonths(getReportMonths(report)),
      { x: 0.78, y: 2.05, w: 11.2, h: 0.35, fontSize: 15, color: primary, bold: true }
    );
    titleSlide.addText(
      `${report.monthlyData.length} monthly KPI views · Prepared by ${report.preparedBy}`,
      { x: 0.78, y: 2.45, w: 10.5, h: 0.35, fontSize: 13, color: muted }
    );
    titleSlide.addText("Generated from uploaded PipelineCRM rating exports.", {
      x: 0.78, y: 2.85, w: 10.5, h: 0.25, fontSize: 11, color: muted
    });
    titleSlide.addShape(pptx.ShapeType.rect, {
      x: 0.78, y: 3.25, w: 11.2, h: 1.3,
      fill: { color: light }, line: { color: line }
    });
    titleSlide.addText("PDF · Excel · Presentation", {
      x: 1.1, y: 3.68, w: 10.6, h: 0.35,
      fontSize: 18, color: primary, bold: true
    });

    const monthChunks = [];
    for (let index = 0; index < report.monthlyData.length; index += 4) {
      monthChunks.push(report.monthlyData.slice(index, index + 4));
    }

    monthChunks.forEach((chunk, chunkIndex) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      addHeader(slide, `Monthly KPI Summary ${chunkIndex + 1}`);
      slide.addText("Required Monthly KPI Totals", {
        x: 0.55, y: 1.1, w: 8.5, h: 0.35, fontSize: 22,
        fontFace: "Aptos Display", color: primary, bold: true, align: "center"
      });

      const rows = [
        ["KPI", ...chunk.map(item => formatMonth(item.month))],
        ["Number of Bookings Players (Check-Out Date)", ...chunk.map(item => formatInteger(item.summary.bookings))],
        ["Total Credit", ...chunk.map(item => formatCurrency(item.summary.credit, report.currency))],
        ["Total Front Money", ...chunk.map(item => formatCurrency(item.summary.frontMoney, report.currency))],
        ["Total Bankroll", ...chunk.map(item => formatCurrency(item.summary.bankroll, report.currency))],
        ["Total Theoretical", ...chunk.map(item => formatCurrency(item.summary.theoretical, report.currency))],
        ["Total W/L", ...chunk.map(item => ({
          text: formatCurrency(item.summary.playerWinLoss, report.currency),
          options: {
            color: item.summary.playerWinLoss < 0 ? "C62828" : "1F2937",
            bold: item.summary.playerWinLoss < 0,
            align: "center",
            valign: "mid"
          }
        }))],
        ["Total Commission", ...chunk.map(item => formatCurrency(item.summary.commission, report.currency))]
      ];

      slide.addTable(rows, {
        x: 0.55, y: 1.65, w: 12.2, h: 4.9,
        border: { color: line, pt: 1 },
        fontFace: "Aptos", fontSize: 9.5, color: "1F2937",
        fill: "FFFFFF", align: "center", valign: "mid", margin: 0.06, autoFit: true
      });
    });

    const presentationProspectMonths = normalizeProspectDates(report.newProspectMonths || report.monthlyData.map(item => item.month));
    const presentationProspectMatrix = buildNewProspectMatrix(report.newProspects, presentationProspectMonths);
    if (presentationProspectMatrix.executives.length) {
      const prospectMonthChunks = [];
      for (let index = 0; index < presentationProspectMonths.length; index += 4) {
        prospectMonthChunks.push(presentationProspectMonths.slice(index, index + 4));
      }

      prospectMonthChunks.forEach((monthChunk, chunkIndex) => {
        const prospectSlide = pptx.addSlide();
        prospectSlide.background = { color: "FFFFFF" };
        addHeader(prospectSlide, `New Players ${chunkIndex + 1}`);
        prospectSlide.addText("Number of New Players Added", {
          x: 0.55, y: 1.1, w: 12.2, h: 0.4, fontSize: 24,
          fontFace: "Aptos Display", color: primary, bold: true, align: "center"
        });

        const prospectRows = [
          ["Executive", ...monthChunk.map(formatMonth), "Total"],
          ...presentationProspectMatrix.executives.map(executive => [
            executive,
            ...monthChunk.map(month => {
              const key = `${month}|${executive}`;
              return presentationProspectMatrix.values.has(key)
                ? formatInteger(presentationProspectMatrix.values.get(key))
                : "—";
            }),
            formatInteger(monthChunk.reduce((sum, month) => sum + (presentationProspectMatrix.values.get(`${month}|${executive}`) || 0), 0))
          ]),
          ["TOTAL NEW PLAYERS ADDED", ...monthChunk.map(month => formatInteger(presentationEffectiveProspectTotals[month] || 0)), formatInteger(monthChunk.reduce((sum, month) => sum + (Number(presentationEffectiveProspectTotals[month]) || 0), 0))]
        ];
        const presentationTotalProspectMap = new Map(normalizeTotalProspectEntries(report.totalProspects, presentationProspectMonths).map(entry => [entry.month, entry.value]));
        const presentationEffectiveProspectTotals = Object.fromEntries(presentationProspectMonths.map(month => [month, presentationTotalProspectMap.has(month) ? presentationTotalProspectMap.get(month) : (presentationProspectMatrix.totals[month] || 0)]));


        prospectSlide.addTable(prospectRows, {
          x: 0.75, y: 1.7, w: 11.8, h: 4.9,
          border: { color: line, pt: 1 },
          fontFace: "Aptos", fontSize: 12, color: "1F2937",
          fill: "FFFFFF", align: "center", valign: "mid", margin: 0.07,
          autoFit: true
        });
      });
    }

    report.monthlyData.forEach(item => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      addHeader(slide, formatMonth(item.month));
      slide.addText(`Top 5 Theoretical Deals and Booking Executive KPIs · ${formatMonth(item.month)}`, {
        x: 0.55, y: 1.1, w: 11.5, h: 0.35, fontSize: 21,
        fontFace: "Aptos Display", color: primary, bold: true, align: "center"
      });

      const topRows = [
        ["Top 5 Full Deal Name", "W/L", "Theoretical"],
        ...item.topPlayers.map(row => [
          row.name,
          {
            text: formatCurrency(row.winLoss, report.currency),
            options: {
              color: row.winLoss < 0 ? "C62828" : "1F2937",
              bold: row.winLoss < 0
            }
          },
          formatCurrency(row.theoretical, report.currency)
        ])
      ];
      slide.addTable(topRows, {
        x: 0.55, y: 1.65, w: 6.05, h: 3.1,
        border: { color: line, pt: 1 },
        fontFace: "Aptos", fontSize: 9, color: "1F2937",
        fill: "FFFFFF", align: "center", valign: "mid", margin: 0.05
      });

      const highestLoss = selectHighestLoss(item.agents);
      const mostBookings = highest(item.agents, "bookings");
      const highestTheo = highest(item.agents, "theoretical");

      const highlights = [
        ["KPI", "Result"],
        ["Agent with Highest Player Loss", highestLoss ? `${highestLoss.name} · ${formatCurrency(highestLoss.winLoss, report.currency)}` : "—"],
        ["Agent with Most Bookings", mostBookings ? `${mostBookings.name} · ${formatInteger(mostBookings.bookings)}` : "—"],
        ["Agent with Most Aggregate Theoretical", highestTheo ? `${highestTheo.name} · ${formatCurrency(highestTheo.theoretical, report.currency)}` : "—"]
      ];
      slide.addTable(highlights, {
        x: 6.85, y: 1.65, w: 5.9, h: 3.1,
        border: { color: line, pt: 1 },
        fontFace: "Aptos", fontSize: 9, color: "1F2937",
        fill: "FFFFFF", align: "center", valign: "mid", margin: 0.05
      });
    });

    const playerSlide = pptx.addSlide();
    playerSlide.background = { color: "FFFFFF" };
    addHeader(playerSlide, "Top 10 Player Bookings");
    playerSlide.addText("Top 10 Players by Total Bookings", {
      x: 0.55, y: 1.1, w: 9, h: 0.35, fontSize: 22,
      fontFace: "Aptos Display", color: primary, bold: true
    });
    const playerRows = [
      ["Player Full Name", "Properties Booked (Count)", "Total Bookings", "Total Theoretical", "Total W/L"],
      ...(report.playerBookingSummary || []).map(player => [
        player.name,
        formatPlayerProperties(player.properties),
        String(player.totalBookings),
        formatCurrency(player.totalTheoretical, report.currency),
        {
          text: formatCurrency(player.totalWinLoss, report.currency),
          options: {
            color: player.totalWinLoss < 0 ? "C62828" : "1F2937",
            bold: player.totalWinLoss < 0
          }
        }
      ])
    ];
    playerSlide.addTable(playerRows, {
      x: 0.55, y: 1.65, w: 12.2, h: 4.9,
      border: { color: line, pt: 1 },
      fontFace: "Aptos", fontSize: 9, color: "1F2937",
      fill: "FFFFFF", align: "center", valign: "mid", margin: 0.05
    });

    const safeCompany = report.companyName.replace(/[^\w-]+/g, "_");
    await pptx.writeFile({
      fileName: `${safeCompany}_Internal_KPI_Presentation_${reportMonthFileToken(report)}.pptx`
    });
    showMessage("Presentation exported successfully.", "success");
  }

  function copyTeamMessage() {
    const text = els.teamShareCopy?.innerText?.trim();
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => showMessage("Internal team copy copied.", "success"))
      .catch(() => showMessage("Copy failed. You can manually highlight the message.", "error"));
  }

  async function loadDemoData() {
    try {
      const response = await fetch("sample_rating_export.csv");
      if (!response.ok) throw new Error("Demo data could not be loaded.");
      const blob = await response.blob();
      const file = new File([blob], "sample_rating_export.csv", { type: "text/csv" });
      await processFiles([file]);
      els.month1.value = "2025-05";
      els.month2.value = "2026-05";
      els.month3.value = "2025-06";
      els.month4.value = "2026-06";
      els.comparison1From.value = "2025-05";
      els.comparison1To.value = "2026-05";
      els.comparison2From.value = "2025-06";
      els.comparison2To.value = "2026-06";
      els.comparison3From.value = "2026-05";
      els.comparison3To.value = "2026-06";
      els.comparison4From.value = "";
      els.comparison4To.value = "";
      els.comparison5From.value = "";
      els.comparison5To.value = "";
      els.comparison6From.value = "";
      els.comparison6To.value = "";
      persistSettings();
      renderComparisonExportPreview();
      syncPlayerDatesFromSelectedComparisons({ silent: true, fallbackToUpload: true });
    } catch (error) {
      showMessage("Open this system through GitHub Pages or a local web server to load demo data.", "error");
    }
  }

  function resetSession() {
    state.sourceRows = [];
    state.normalizedRows = [];
    state.headers = [];
    state.mapping = {};
    state.files = [];
    state.currentReport = null;
    els.fileInput.value = "";
    els.uploadedFiles.innerHTML = "";
    els.reportSection.classList.add("hidden");
    els.generateBtn.disabled = true;
    renderMappingGrid();
    renderPriorityMapping();
    updateMappingStatus();
    updateFileStatus();
    updateFilterOptions();
    renderProspectDateEditor();
    renderNewPlayerNameEditor();
    renderTotalProspectInputs();
    renderNewProspectInputMatrix();
    applySmartReportingPeriodSuggestions({ force: true, persist: true });
    updateExecutiveSnapshotButtons(null);
    updateCompletePdfButtonLabel(null);
    showMessage("New KPI report ready with the latest completed months suggested. Saved report history was not deleted.", "success");
  }

  function setLoading(isLoading, label = "") {
    els.generateBtn.disabled = isLoading || !state.sourceRows.length;
    els.browseBtn.disabled = isLoading;
    if (isLoading) setPill(els.fileStatus, label, "warning");
    else updateFileStatus();
  }

  function showMessage(text, type = "") {
    els.messageBox.textContent = text;
    els.messageBox.className = `message ${type}`;
  }

  function setPill(element, text, status) {
    element.textContent = text;
    element.className = `status-pill ${status}`;
  }

  function parseNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (value === null || value === undefined || value === "") return 0;

    let text = String(value)
      .replace(/\u00A0/g, " ")
      .replace(/[−–—]/g, "-")
      .trim();

    if (!text || ["-", "—", "N/A", "n/a"].includes(text)) return 0;

    const negativeParentheses = /^\s*\(.*\)\s*$/.test(text);
    const trailingMinus = /-\s*$/.test(text);

    text = text
      .replace(/[,$£€¥₱]/g, "")
      .replace(/%/g, "")
      .replace(/[()]/g, "")
      .replace(/\s/g, "")
      .replace(/-$/, "");

    const number = Number(text);
    if (!Number.isFinite(number)) return 0;

    const shouldBeNegative = negativeParentheses || trailingMinus || number < 0;
    return shouldBeNegative ? -Math.abs(number) : number;
  }

  function parseDate(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    if (value === null || value === undefined || value === "") return null;

    if (typeof value === "number") {
      const parsed = XLSX?.SSF?.parse_date_code ? XLSX.SSF.parse_date_code(value) : null;
      if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d);
    }

    const text = String(value).trim();
    if (!text) return null;

    const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
    }

    const slashMatch = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (slashMatch) {
      let year = Number(slashMatch[3]);
      if (year < 100) year += 2000;
      return new Date(year, Number(slashMatch[1]) - 1, Number(slashMatch[2]));
    }

    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function isInMonth(dateValue, monthValue) {
    if (!dateValue || !monthValue) return false;
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const target = monthValueToDate(monthValue);
    return date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
  }

  function monthValueToDate(value) {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function toMonthInput(dateValue) {
    return `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, "0")}`;
  }

  function sum(rows, key) {
    return rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);
  }

  function highest(rows, key) {
    if (!rows.length) return null;
    return [...rows].sort((a, b) => b[key] - a[key])[0];
  }

  function selectHighestLoss(rows) {
    if (!rows.length) return null;
    return [...rows].sort((a, b) => a.winLoss - b.winLoss)[0];
  }

  function calculateChange(first, second) {
    if (!first && !second) return { text: "No change", className: "flat" };
    if (!first) return { text: "New activity in Month 2", className: "up" };
    const percentage = (second - first) / Math.abs(first);
    if (Math.abs(percentage) < 0.00001) return { text: "No change", className: "flat" };
    return {
      text: `${percentage > 0 ? "▲" : "▼"} ${formatPercent(Math.abs(percentage))} from Month 1`,
      className: percentage > 0 ? "up" : "down"
    };
  }

  function formatCurrency(value, currency) {
    const code = /^[A-Z]{3}$/.test(currency || "") ? currency : "USD";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: code,
        maximumFractionDigits: 2
      }).format(Number(value) || 0);
    } catch {
      return `$${(Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }

  function formatInteger(value) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(value) || 0);
  }

  function formatPercent(value) {
    return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(Number(value) || 0);
  }

  function formatMonth(monthValue) {
    if (!monthValue) return "—";
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(monthValueToDate(monthValue));
  }

  function formatReportDate(value) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value));
  }

  function formatDateTime(value) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit"
    }).format(new Date(value));
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function serializeRow(row) {
    return {
      "Booking ID": row.bookingId,
      "Deal Name": row.dealName,
      "Player Full Name": row.playerName,
      "Check-Out Date": row.checkoutDate ? row.checkoutDate.toISOString().slice(0, 10) : "",
      "Booking Agent (source field)": row.bookingAgent,
      "Owner (Deal Owner / booked the trip)": row.dealOwner,
      "Primary Contact Owner (player owner)": row.playerOwner,
      "Trip Contact (booked the trip)": row.tripContact,
      "Property": row.property,
      "Credit": row.credit,
      "Front Money": row.frontMoney,
      "Bankroll": row.bankroll,
      "Player Win/Loss": row.playerWinLoss,
      "Theoretical": row.theoretical,
      "Commission": row.commission,
      "Currency": row.currency,
      "Booking Status": row.bookingStatus,
      "Play Rating Complete?": row.playRatingComplete,
      "Source File": row.__sourceFile
    };
  }

  function uniqueSorted(values) {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }

  function normalizeHeader(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function normalizeName(value) {
    return cleanText(value).toLowerCase();
  }

  function canonicalBookingExecutive(value) {
    const raw = cleanText(value);
    if (!raw) return { name: "", code: "" };

    const normalized = normalizeHeader(raw);
    const direct = EXECUTIVE_DIRECTORY[normalized];
    if (direct) return { ...direct };

    const knownAlias = Object.keys(EXECUTIVE_DIRECTORY).find(alias =>
      normalized === alias || normalized.includes(alias)
    );
    if (knownAlias) return { ...EXECUTIVE_DIRECTORY[knownAlias] };

    const displayName = formatPersonName(raw);
    const words = displayName.replace(/[^A-Za-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
    const code = words.length >= 2
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : displayName.slice(0, 2).toUpperCase();
    return { name: displayName, code };
  }

  function formatPersonName(value) {
    const raw = cleanText(value);
    if (!raw) return "";

    const suffixes = new Map([
      ["jr", "Jr."], ["jr.", "Jr."],
      ["sr", "Sr."], ["sr.", "Sr."],
      ["ii", "II"], ["iii", "III"], ["iv", "IV"], ["v", "V"]
    ]);

    const formatPart = part => {
      if (!part) return part;
      const lower = part.toLowerCase();
      if (suffixes.has(lower)) return suffixes.get(lower);
      if (/^[A-Z]{2,3}$/.test(part)) return part;

      let formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
      if (/^Mc[a-z]/.test(formatted)) {
        formatted = `Mc${formatted.charAt(2).toUpperCase()}${formatted.slice(3)}`;
      }
      return formatted;
    };

    return raw
      .split(/\s+/)
      .map(word => word
        .split(/([-'’])/)
        .map(segment => /[-'’]/.test(segment) ? segment : formatPart(segment))
        .join(""))
      .join(" ");
  }

  function patronOwnerLabel(row, index) {
    const code = cleanText(row?.ownerCode) || canonicalBookingExecutive(row?.ownerName || "").code || "N/A";
    return `Patron ${index + 1} - ${code}`;
  }

  function cleanText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function initials(value) {
    return cleanText(value).split(" ").filter(Boolean).slice(0, 2).map(word => word[0]).join("").toUpperCase() || "PG";
  }

  function isBlank(value) {
    return value === null || value === undefined || String(value).trim() === "";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function applyFontFamily(fontName) {
    const fontMap = {
      "Inter": '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      "Manrope": '"Manrope", ui-sans-serif, system-ui, sans-serif',
      "Montserrat": '"Montserrat", ui-sans-serif, system-ui, sans-serif',
      "DM Sans": '"DM Sans", ui-sans-serif, system-ui, sans-serif',
      "Space Grotesk": '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
      "Playfair Display": '"Playfair Display", Georgia, serif',
      "Poppins": '"Poppins", ui-sans-serif, system-ui, sans-serif',
      "Lato": '"Lato", ui-sans-serif, system-ui, sans-serif',
      "Nunito Sans": '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
      "Raleway": '"Raleway", ui-sans-serif, system-ui, sans-serif',
      "Source Sans 3": '"Source Sans 3", ui-sans-serif, system-ui, sans-serif',
      "Merriweather": '"Merriweather", Georgia, serif',
      "Roboto Slab": '"Roboto Slab", Georgia, serif',
      "Libre Baskerville": '"Libre Baskerville", Georgia, serif',
      "Outfit": '"Outfit", ui-sans-serif, system-ui, sans-serif',
      "Plus Jakarta Sans": '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
      "Work Sans": '"Work Sans", ui-sans-serif, system-ui, sans-serif',
      "Figtree": '"Figtree", ui-sans-serif, system-ui, sans-serif',
      "Urbanist": '"Urbanist", ui-sans-serif, system-ui, sans-serif',
      "Mulish": '"Mulish", ui-sans-serif, system-ui, sans-serif',
      "IBM Plex Sans": '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
      "Noto Sans": '"Noto Sans", ui-sans-serif, system-ui, sans-serif',
      "Archivo": '"Archivo", ui-sans-serif, system-ui, sans-serif',
      "Quicksand": '"Quicksand", ui-sans-serif, system-ui, sans-serif'
    };
    document.documentElement.style.setProperty("--app-font", fontMap[fontName] || fontMap["Inter"]);
  }

  function safeJsonParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }
})();
