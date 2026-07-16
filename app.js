(() => {
  "use strict";

  const STORAGE_KEYS = {
    settings: "paceKpiSettingsV1",
    history: "paceKpiHistoryV1"
  };

  const FIELD_CONFIG = {
    bookingId: { label: "Booking ID", required: false, aliases: ["booking id", "deal id", "id"] },
    dealName: { label: "Deal Name", required: true, aliases: ["deal name", "deal", "trip deal name"] },
    playerName: { label: "Player Full Name", required: false, aliases: ["primary contact full name", "player full name", "contact full name", "full name", "player name", "player", "person name", "contact name"] },
    firstName: { label: "Player First Name", required: false, aliases: ["player first name", "first name", "contact first name"] },
    lastName: { label: "Player Last Name", required: false, aliases: ["player last name", "last name", "contact last name"] },
    checkoutDate: { label: "Check-Out Date", required: true, aliases: ["departure date", "check-out date", "checkout date", "check out date", "trip departure date", "end date"] },
    bookingAgent: { label: "Booking Agent", required: false, aliases: ["booking agent", "agent", "booking owner"] },
    tripContact: { label: "Owner / Trip Contact (Deal Owner)", required: true, aliases: ["trip contact", "trip contact name", "owner", "deal owner", "deal owner name", "owner / trip contact", "owner trip contact"] },
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
    renderHistory();
    renderMappingGrid();
  }

  function cacheElements() {
    [
      "themeSelect", "fontSelect", "resetAppBtn", "fileInput", "browseBtn", "dropZone", "fileStatus",
      "uploadedFiles", "mappingDetails", "mappingBadge", "mappingGrid",
      "companyName", "preparedBy", "month1", "month2", "propertyFilter",
      "currencyFilter", "generateBtn", "loadSampleBtn",
      "messageBox", "reportSection", "reportToolbarTitle", "saveHistoryBtn",
      "exportExcelBtn", "printBtn", "printReport", "reportLogo", "reportTitle",
      "reportSubtitle", "reportPreparedBy", "generatedDate", "reportSource",
      "reportNotice", "monthLabels", "kpiCards", "topPlayersGrid",
      "playerBookingHead", "playerBookingBody", "agentMonthlyGrid",
      "historyList", "theoreticalGraph",
      "exportPptBtn", "copyTeamMessageBtn", "teamShareCopy",
      "playerNameMapSelect", "dealNameMapSelect", "propertyMapSelect", "openFullMappingBtn", "playerMappingStatus",
      "comparison1From", "comparison1To", "comparison2From", "comparison2To",
      "comparison3From", "comparison3To", "comparison4From", "comparison4To",
      "comparison5From", "comparison5To", "comparison6From", "comparison6To"
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
    els.exportExcelBtn.addEventListener("click", exportCurrentReport);
    els.exportPptBtn.addEventListener("click", exportCurrentPresentation);
    els.saveHistoryBtn.addEventListener("click", saveCurrentReport);
    els.copyTeamMessageBtn.addEventListener("click", copyTeamMessage);
    els.resetAppBtn.addEventListener("click", resetSession);

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

    [
      els.themeSelect, els.fontSelect, els.companyName, els.preparedBy, els.month1, els.month2,
      els.propertyFilter, els.currencyFilter,
      els.comparison1From, els.comparison1To, els.comparison2From, els.comparison2To,
      els.comparison3From, els.comparison3To, els.comparison4From, els.comparison4To,
      els.comparison5From, els.comparison5To, els.comparison6From, els.comparison6To
    ].forEach(input => input.addEventListener("change", persistSettings));

    els.themeSelect.addEventListener("change", () => {
      document.body.dataset.theme = els.themeSelect.value;
    });

    els.fontSelect.addEventListener("change", () => {
      applyFontFamily(els.fontSelect.value);
    });
  }

  function setDefaultMonths() {
    const now = new Date();
    const month2Date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month1Date = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    els.month1.value = toMonthInput(month1Date);
    els.month2.value = toMonthInput(month2Date);
  }

  function loadSettings() {
    const settings = safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {});
    Object.entries(settings).forEach(([key, value]) => {
      if (els[key] && value !== undefined && value !== null) els[key].value = value;
    });
    document.body.dataset.theme = els.themeSelect.value;
    applyFontFamily(els.fontSelect.value || "Inter");
    if (!els.comparison1From.value) els.comparison1From.value = "2025-05";
    if (!els.comparison1To.value) els.comparison1To.value = "2026-05";
    if (!els.comparison2From.value) els.comparison2From.value = "2025-06";
    if (!els.comparison2To.value) els.comparison2To.value = "2026-06";
    if (!els.comparison3From.value) els.comparison3From.value = "2026-05";
    if (!els.comparison3To.value) els.comparison3To.value = "2026-06";
  }

  function persistSettings() {
    const settings = {
      themeSelect: els.themeSelect.value,
      fontSelect: els.fontSelect.value,
      companyName: els.companyName.value.trim(),
      preparedBy: els.preparedBy.value.trim(),
      month1: els.month1.value,
      month2: els.month2.value,
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
      comparison6To: els.comparison6To.value
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
      normalized.tripContact = cleanText(normalized.tripContact);
      normalized.playerOwner = cleanText(normalized.playerOwner);
      if (!normalized.tripContact && normalized.bookingAgent) normalized.tripContact = normalized.bookingAgent;
      if (!normalized.bookingAgent && normalized.tripContact) normalized.bookingAgent = normalized.tripContact;
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
    if (!els.month1.value || !els.month2.value) {
      showMessage("Select both primary reporting months.", "error");
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
      month1: settings.month1,
      month2: settings.month2,
      analysisMonths,
      monthlyData,
      property: settings.property,
      currency: settings.currency,
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
      month1: els.month1.value,
      month2: els.month2.value,
      property: els.propertyFilter.value,
      currency: els.currencyFilter.value,
      comparisons: getComparisonSettings()
    };
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
    const months = new Set([settings.month1, settings.month2].filter(Boolean));
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

  function groupTopPlayers(rows) {
    return rows
      .filter(row => cleanText(row.dealName))
      .map(row => ({
        name: cleanText(row.dealName),
        winLoss: row.playerWinLoss || 0,
        theoretical: row.theoretical || 0
      }))
      .sort((a, b) => b.theoretical - a.theoretical)
      .slice(0, 5);
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

  function groupAgents(rows) {
    const groups = new Map();

    rows.forEach(row => {
      const agentName = row.tripContact || row.bookingAgent;
      const key = normalizeName(agentName);
      if (!key) return;

      if (!groups.has(key)) {
        groups.set(key, {
          name: agentName,
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
          tripContact: row.tripContact || row.bookingAgent || "",
          playerOwner: row.playerOwner || "",
          bookings: 0,
          theoretical: 0
        });
      }

      const group = groups.get(key);
      if (!group.tripContact && (row.tripContact || row.bookingAgent)) {
        group.tripContact = row.tripContact || row.bookingAgent;
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
      missingBookingAgent: rows.filter(row => row.checkoutDate && !row.tripContact && !row.bookingAgent).length,
      missingTripContact: rows.filter(row => row.checkoutDate && !row.tripContact && !row.bookingAgent).length,
      missingPlayerOwner: rows.filter(row => row.playerName && !row.playerOwner).length,
      commissionIncompleteRating: rows.filter(row => row.commission !== 0 && !ratingComplete(row.playRatingComplete)).length,
      totalRows: rows.length
    };
  }

  function renderReport(report) {
    els.reportSection.classList.remove("hidden");

    if (!report.comparisons) report.comparisons = [];
    if (!report.monthlyData) {
      report.analysisMonths = [report.month1, report.month2].filter(Boolean);
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

    const primaryLabel1 = formatMonth(report.month1);
    const primaryLabel2 = formatMonth(report.month2);
    const filterText = [
      report.property ? `Property: ${report.property}` : "All properties",
      report.currency ? `Currency: ${report.currency}` : "All currencies"
    ].join(" · ");

    els.reportToolbarTitle.textContent = `${report.monthlyData.length} Monthly KPI Views`;
    els.reportTitle.textContent = "Pace Gaming Internal KPI Report";
    els.reportSubtitle.textContent = `Primary comparison: ${primaryLabel1} vs ${primaryLabel2}`;
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
    renderTopPlayers(report);
    renderPlayerBookingSummary(report);
    renderAgentPerformance(report);
    renderTheoreticalGraph(report);
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
          ${report.monthlyData.map(item =>
            `<td>${escapeHtml(formatter(item.summary[definition.key] || 0))}</td>`
          ).join("")}
        </tr>
      `;
    }).join("");

    els.kpiCards.innerHTML = `
      <div class="table-wrap monthly-table-wrap">
        <table class="monthly-report-table">${header}<tbody>${body}</tbody></table>
      </div>
    `;
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
              <tr><th>Full Deal Name (Property · Player · Date)</th><th>Total W/L</th><th>Theoretical</th></tr>
            </thead>
            <tbody>
              ${renderPlayerRowsHtml(item.topPlayers, report.currency)}
            </tbody>
          </table>
        </div>
      </article>
    `).join("");
  }

  function renderPlayerRowsHtml(rows, currency) {
    if (!rows.length) {
      return `<tr><td class="empty-row" colspan="3">No deal data available</td></tr>`;
    }

    return rows.map(row => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td class="wl-value${negativeValueClass(row.winLoss)}">${escapeHtml(formatCurrency(row.winLoss, currency))}</td>
        <td><strong>${escapeHtml(formatCurrency(row.theoretical, currency))}</strong></td>
      </tr>
    `).join("");
  }

  function negativeValueClass(value) {
    return Number(value) < 0 ? " negative-value" : "";
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
        <td>${escapeHtml(formatCurrency(player.totalTheoretical, report.currency))}</td>
        <td class="wl-value${negativeValueClass(player.totalWinLoss)}">${escapeHtml(formatCurrency(player.totalWinLoss, report.currency))}</td>
      </tr>
    `).join("");
  }

  function renderAgentPerformance(report) {
    els.agentMonthlyGrid.innerHTML = report.monthlyData.map(item => {
      const mostBookings = highest(item.agents, "bookings");
      const highestTheo = highest(item.agents, "theoretical");
      const highestLoss = selectHighestLoss(item.agents);

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
                <tr><th>Booking Agent</th><th>Bookings</th><th>Total W/L</th><th>Aggregate Theo</th></tr>
              </thead>
              <tbody>
                ${renderAgentRowsHtml(item.agents, report.currency)}
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
    const valueClass = agent && key === "winLoss"
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
      return `<tr><td class="empty-row" colspan="4">No booking agent data available</td></tr>`;
    }
    return rows.map(row => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${formatInteger(row.bookings)}</td>
        <td class="wl-value${negativeValueClass(row.winLoss)}">${escapeHtml(formatCurrency(row.winLoss, currency))}</td>
        <td>${escapeHtml(formatCurrency(row.theoretical, currency))}</td>
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

    const comparisons = report.comparisons || [];
    const points = comparisons.flatMap(comparison => [
      { label: formatMonth(comparison.fromMonth), value: comparison.fromValue },
      { label: formatMonth(comparison.toMonth), value: comparison.toValue }
    ]);

    if (!points.length) {
      els.theoreticalGraph.innerHTML = `<p class="empty-row">No comparison dates selected.</p>`;
      return;
    }

    const maxValue = Math.max(...points.map(point => Math.abs(point.value)), 1);

    els.theoreticalGraph.innerHTML = points.map(point => {
      const height = Math.max(2, Math.round((Math.abs(point.value) / maxValue) * 100));
      const negativeClass = point.value < 0 ? " negative" : "";
      return `
        <div class="chart-column">
          <div class="chart-value">${escapeHtml(formatCurrency(point.value, report.currency))}</div>
          <div class="chart-bar-wrap">
            <div class="chart-bar${negativeClass}" style="height:${height}%"></div>
          </div>
          <div class="chart-label">${escapeHtml(point.label)}</div>
        </div>
      `;
    }).join("");
  }

  function renderQualityChecks(quality) {
    const items = [
      ["Missing Deal Name", quality.missingDealName],
      ["Duplicate Deal Names", quality.duplicateDealNames],
      ["Missing Player Name", quality.missingPlayerName],
      ["Missing Check-Out Date", quality.missingCheckoutDate],
      ["Missing Booking Agent", quality.missingBookingAgent],
      ["Missing Owner / Trip Contact", quality.missingTripContact],
      ["Missing Player Owner", quality.missingPlayerOwner],
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
      item.month1 === state.currentReport.month1 &&
      item.month2 === state.currentReport.month2 &&
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
        <h3>${escapeHtml(formatMonth(report.month1))} vs ${escapeHtml(formatMonth(report.month2))}</h3>
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

  function printReportWithoutBrowserFooter() {
    document.body.classList.add("kpi-print-mode");

    const cleanup = () => {
      document.body.classList.remove("kpi-print-mode");
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    window.print();

    // Fallback cleanup for browsers that do not reliably fire afterprint.
    window.setTimeout(cleanup, 1500);
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
      ["Month", "Booking Agent", "Bookings", "Player Win/Loss", "Theoretical", "Commission"],
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
      ["Missing Booking Agent / Deal Owner", report.quality.missingBookingAgent],
      ["Missing Owner / Trip Contact", report.quality.missingTripContact],
      ["Missing Player Owner (Optional)", report.quality.missingPlayerOwner],
      ["Commission with Incomplete Rating", report.quality.commissionIncompleteRating]
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(qualityRows), "Data Quality");

    const safeCompany = report.companyName.replace(/[^\w-]+/g, "_");
    XLSX.writeFile(
      workbook,
      `${safeCompany}_Internal_KPI_Report_${report.month1}_to_${report.month2}.xlsx`
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
    titleSlide.addText(`${report.companyName} Internal KPI Report`, {
      x: 0.75, y: 1.45, w: 11.5, h: 0.55, fontSize: 30,
      fontFace: "Aptos Display", color: primary, bold: true
    });
    titleSlide.addText(
      `${report.monthlyData.length} monthly KPI views · Prepared by ${report.preparedBy}`,
      { x: 0.78, y: 2.1, w: 10.5, h: 0.35, fontSize: 15, color: muted }
    );
    titleSlide.addText("Generated from uploaded PipelineCRM rating exports.", {
      x: 0.78, y: 2.55, w: 10.5, h: 0.25, fontSize: 11, color: muted
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
        fontFace: "Aptos Display", color: primary, bold: true
      });

      const rows = [
        ["KPI", ...chunk.map(item => formatMonth(item.month))],
        ["Number of Bookings Players (Check-Out Date)", ...chunk.map(item => formatInteger(item.summary.bookings))],
        ["Total Credit", ...chunk.map(item => formatCurrency(item.summary.credit, report.currency))],
        ["Total Front Money", ...chunk.map(item => formatCurrency(item.summary.frontMoney, report.currency))],
        ["Total Bankroll", ...chunk.map(item => formatCurrency(item.summary.bankroll, report.currency))],
        ["Total Theoretical", ...chunk.map(item => formatCurrency(item.summary.theoretical, report.currency))],
        ["Total W/L", ...chunk.map(item => formatCurrency(item.summary.playerWinLoss, report.currency))],
        ["Total Commission", ...chunk.map(item => formatCurrency(item.summary.commission, report.currency))]
      ];

      slide.addTable(rows, {
        x: 0.55, y: 1.65, w: 12.2, h: 4.9,
        border: { color: line, pt: 1 },
        fontFace: "Aptos", fontSize: 9.5, color: "1F2937",
        fill: "FFFFFF", margin: 0.06, autoFit: true
      });
    });

    report.monthlyData.forEach(item => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      addHeader(slide, formatMonth(item.month));
      slide.addText(`Top 5 Theoretical Deals and Booking Agent KPIs · ${formatMonth(item.month)}`, {
        x: 0.55, y: 1.1, w: 11.5, h: 0.35, fontSize: 21,
        fontFace: "Aptos Display", color: primary, bold: true
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
        fill: "FFFFFF", margin: 0.05
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
        fill: "FFFFFF", margin: 0.05
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
      fill: "FFFFFF", margin: 0.05
    });

    const safeCompany = report.companyName.replace(/[^\w-]+/g, "_");
    await pptx.writeFile({
      fileName: `${safeCompany}_Internal_KPI_Presentation_${report.month1}_to_${report.month2}.pptx`
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
      els.month1.value = "2026-05";
      els.month2.value = "2026-06";
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
    showMessage("Session cleared. Saved report history was not deleted.", "success");
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
      "Booking Agent": row.bookingAgent,
      "Owner / Trip Contact (Deal Owner)": row.tripContact,
      "Player Owner (Primary Contact Owner)": row.playerOwner,
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
      "Libre Baskerville": '"Libre Baskerville", Georgia, serif'
    };
    document.documentElement.style.setProperty("--app-font", fontMap[fontName] || fontMap["Inter"]);
  }

  function safeJsonParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  }
})();
