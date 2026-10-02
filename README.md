# V63 ownership-role correction

PipelineCRM ownership fields are now kept separate:

- **Owner / Deal Owner** — the person who booked the trip.
- **Primary Contact Owner** — the owner of the player/contact; this is **not** the booking executive.
- **Trip Contact** — the person who booked the trip.
- Booking Executive KPI attribution uses **Owner / Deal Owner first**, then **Trip Contact**, with the legacy Booking Agent field only as a fallback when both are blank.
- Top 5 Patron executive codes, Booking Executive performance, comparison PDFs, complete PDF, Excel/PowerPoint data, and combined email summaries all follow the corrected booking attribution.

---


## V61 Primary Contact Owner + Email Summary

- Booking Executive is always **Primary Contact Owner**.
- Primary Contact Owner is required for Booking Executive reporting.
- Deal Owner / Trip Contact is not used as the Booking Executive source.
- Anonymized Top 5 patron labels use the Primary Contact Owner executive code.
- **Copy Email Draft** now creates a real summary with KPI current/prior values, variance, percentage change, and Booking Executive highlights.

# Pace Gaming KPI Report System

A browser-based monthly KPI report generator for PipelineCRM rating exports.

## What it does

Upload one or more `.csv`, `.xlsx`, or `.xls` exports and the system calculates:

- Number of bookings based on Check-Out Date
- Unique players
- Total credit
- Total front money
- Total bankroll
- Player win/loss
- Total theoretical
- Total commission
- Average theoretical per booking
- Top five theoretical players
- Booking agent performance
- Highest player loss by agent
- Most bookings by agent
- Highest aggregate theoretical by agent
- Year-over-year theoretical comparison
- Data-quality checks

The system also supports:

- Automatic column detection
- Manual column mapping
- Property and currency filters
- Multiple uploaded exports
- Excel export
- Print / Save as PDF
- Saved monthly report history in the browser
- Eight light professional themes
- Six font options
- Tiny uploaded logo built into the interface

## Files

- `index.html` — main page
- `styles.css` — design and print styling
- `app.js` — upload, calculations, reports, history, and exports
- `sample_rating_export.csv` — demo file
- `.nojekyll` — tells GitHub Pages to serve the static files directly

## Upload to GitHub

1. Create a new GitHub repository.
2. Extract the ZIP file.
3. Upload all files from this folder to the root of the repository.
4. Commit the files.
5. Open the repository **Settings**.
6. Open **Pages** under **Code and automation**.
7. Under **Build and deployment**, select **Deploy from a branch**.
8. Select the `main` branch and the `/ (root)` folder.
9. Save and wait for the GitHub Pages link.

## How to use

1. Export the rating or Deals list from PipelineCRM.
2. Open the published KPI system.
3. Upload the exported file.
4. Review Column Mapping.
5. Choose Month 1 and Month 2.
6. Select a property or currency when needed.
7. Click **Generate Monthly Report**.
8. Export to Excel or click **Print / Save PDF**.
9. Click **Save to History** to retain a snapshot in the same browser.

## Required export columns

The system automatically detects common variations of these names:

- Player Name
- Check-Out Date
- Booking Agent or Deal Owner
- Theoretical

Recommended columns:

- Booking ID
- Property
- Credit
- Front Money
- Bankroll
- Player Win/Loss
- Commission
- Currency
- Booking Status
- Play Rating Complete?
- Notes

## Important data rules

- One row should represent one booking.
- The report month is based on Check-Out Date.
- Rows matching the Cancelled Status Label are excluded.
- Only enter commission when the play rating is complete.
- Upload prior-year data when you need year-over-year calculations.
- Saved history uses browser storage. Clearing browser data can remove saved reports, so export final reports to Excel or PDF.

## Privacy

The uploaded spreadsheet is processed in the browser. This project does not include a server or database. The spreadsheet library is loaded from the SheetJS CDN.

## Local preview

Because the demo CSV is loaded with `fetch`, use a local web server instead of double-clicking `index.html`.

Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```


## Latest customizations

- Negative imported values are preserved exactly as uploaded.
- The tiny uploaded logo is used in the report header.
- The wording is adjusted for internal use.
- The app includes only light themes, with no dark theme.
- Multiple font choices are available in the top bar.


## V3 calculation rules

- The Cancelled Status Label setting was removed.
- Records whose Booking Status contains `Cancelled` or `Canceled` are excluded automatically.
- The Player Loss sign setting was removed.
- Imported negative numbers remain negative without conversion.
- Total Player Win/Loss is calculated automatically.
- Booking Agent with Highest Player Loss is the agent with the lowest aggregate Player Win/Loss total.
- Booking Agent with Most Bookings is calculated automatically.
- Booking Agent with Most Aggregate Theoretical is calculated automatically.
- May 2025 versus May 2026 and June 2025 versus June 2026 theoretical comparisons are generated when both years are included in the uploaded files.
- A simple four-bar theoretical comparison graph is included.


## V4 ownership fields

The report now includes:

- **Owner / Trip Contact (Deal Owner)**
- **Player Owner (Primary Contact Owner)**

The system auto-detects these PipelineCRM fields when present. If Owner / Trip Contact is blank but Booking Agent is available, the system uses Booking Agent as the fallback trip contact. A separate **Ownership Details** report section and Excel worksheet are included.


## V5 exact KPI scope

The primary report is now restricted to the KPI list supplied by Pace Gaming:

1. Number of Bookings Players (Check-Out Date)
2. Total Credit
3. Total Front Money
4. Total Bankroll
5. Total Theoretical
6. Top 5 Theoretical Players (W/L & Theo)
7. Total Commission
8. Booking Agent with Highest Player Loss
9. Booking Agent with Most Bookings
10. Booking Agent with Most Aggregate Theoretical
11. May 2025 versus May 2026 Month Theoretical
12. June 2025 versus June 2026 Month Theoretical

Calculation rules:

- Number of Bookings Players counts eligible booking rows whose Check-Out Date falls within the reporting month. A player with multiple bookings is counted once per booking.
- Top 5 Theoretical Players groups bookings by Player Name, totals signed Player Win/Loss and Theoretical, then ranks players by aggregate Theoretical.
- Booking Agent KPIs use Owner / Trip Contact (Deal Owner) first, with Booking Agent as a fallback.
- Highest Player Loss is the agent with the lowest aggregate signed Player Win/Loss.
- May and June year-over-year comparisons are fixed to May 2025 vs May 2026 and June 2025 vs June 2026, regardless of the selected monthly report range.
- All negative values remain negative.


## V6 flexible comparisons and exports

The system now supports three editable comparison pairs. Examples:

- May 2025 versus May 2026
- June 2025 versus June 2026
- May 2026 versus June 2026

Each comparison uses Total Theoretical and is displayed in the report, graph, Excel export, and presentation export.

Available exports:

- PDF through Print / Save PDF
- Excel workbook
- PowerPoint presentation

The interface was simplified with a cleaner internal navigation bar, lighter styling, and internal team share copy.


## V7 multi-month KPI reporting

The report now automatically includes every unique month used in:

- Primary Month 1
- Primary Month 2
- Comparison pairs 1 through 6

This fixes the earlier limitation where Top 5 players, monthly totals, and booking-agent performance appeared for only two months.

New report sections:

- Most Property Booked by month
- Player Booking Summary showing how many times each player booked by month and in total
- Top 5 Theoretical Players for every selected or compared month
- Booking Agent KPI Performance for every selected or compared month
- Required Monthly KPI Totals for every selected or compared month

Ownership clarification:

- Owner / Trip Contact (Deal Owner) is required because it is used for booking-agent KPIs.
- Player Owner (Primary Contact Owner) is optional.
- The Supplementary Ownership Details table was removed from the visible report because it is not part of the required KPI list.


## V8 player booking summary

The Player Booking Summary now uses the player's full name and includes:

- Properties Booked, shown as a comma-separated list such as `BM, MSCT, RR`
- Booking count for every selected or comparison month
- Total Bookings
- Total Theoretical
- Total Win/Loss

The system supports either:

- One Player Full Name column, or
- Separate Player First Name and Player Last Name columns

When first and last names are separate, the system combines them automatically.


## V9 themes and fonts

The internal site now includes 16 light professional themes:

- Soft Linen
- Executive Navy
- Modern Pink
- Emerald
- Plum
- Rose Quartz
- Warm Sand
- Soft Sky
- Sage Mist
- Soft Lavender
- Peach Blush
- Fresh Mint
- Powder Blue
- Champagne
- Coral Cream
- Silver Blue

It also includes 14 font choices:

- Inter
- Manrope
- Montserrat
- DM Sans
- Space Grotesk
- Playfair Display
- Poppins
- Lato
- Nunito Sans
- Raleway
- Source Sans 3
- Merriweather
- Roboto Slab
- Libre Baskerville


## V10 calculation clarification

- Number of Booking Players is now the count of unique Player Full Names for each month.
- Multiple booking rows for the same full name count as one booking player in the KPI total.
- The Player Booking Summary still shows how many times each player booked.
- Most Frequent Property is calculated only from the Property column.
- Property rankings use booking-row frequency first, then unique players, then theoretical as tie-breakers.
- Eight additional light themes were added: Ivory Gold, Soft Teal, Blush Beige, Olive Cream, Periwinkle, Terracotta Sand, Aqua Mist, and Mauve Pearl.


## V11 PipelineCRM player booking correction

The Player Booking Summary now maps **PRIMARY CONTACT FULL NAME** before any other name field.  
**DEAL NAME is never used as the player name.**

Expected results from the sample PipelineCRM rows:

- `ADAM PULASKI` → `MONTE CARLO (2)` → Total Bookings `2`
- `BASHAR ZYOUD` → `MOHEGAN SUN CONNECTICUT (3)` → Total Bookings `3`

The system explicitly supports these PipelineCRM headers:

- PRIMARY CONTACT FULL NAME
- PROPERTY
- DEPARTURE DATE
- TOTAL TRIP BANKROLL
- TRIP CREDIT
- TRIP FRONT MONEY
- FINAL TRIP THEO
- FINAL TRIP PLAYER WIN
- COMMISSION
- OWNER
- PRIMARY CONTACT OWNER
- TRIP CONTACT
- STAGE


## V12 strict player-name and property mapping

A prominent **Player Booking Mapping** section was added.

The user must choose:

- Player Name Source
- Property Source

Recommended mappings:

- Player Name Source → `PRIMARY CONTACT FULL NAME`
- Property Source → `PROPERTY`

The system blocks report generation when:

- Player Name is mapped to `DEAL NAME`
- The selected player-name values contain deal-style property codes and dates
- Player Name or Property is not mapped

The Player Booking History is grouped only by the mapped Player Name and Property columns.


## V13 separate Full Name and Deal Name usage

The system now treats these fields separately:

### Player Booking History

Uses:

- Player Full Name for the player identity
- Property for the property count
- Check-Out / Departure Date for the monthly booking columns
- Theoretical and Player Win/Loss for player totals

Deal Name is not used to identify or group the player.

### Booking Details

Shows one row per imported booking/rating and includes:

- Deal Name
- Player Full Name
- Property
- Departure Date
- Trip Contact
- Bankroll
- Credit
- Front Money
- Theoretical
- Player Win/Loss
- Commission

A dedicated Deal Name mapping was added. Recommended source: `DEAL NAME`.


## V14 booking-count correction

- **Number of Bookings** is now calculated from distinct Deal Name values for each month.
- It is no longer based on unique Player Full Name.
- Player Booking History continues to use Player Full Name and Property.
- The visible Booking Details section was removed.
- Deal Name remains required because it is used for the Number of Bookings KPI.


## V15 accuracy rules

The calculation engine now uses one record per Deal Name for all KPIs.

- Duplicate Deal Names from overlapping or repeated uploads are de-duplicated.
- The last imported occurrence of a duplicated Deal Name is used.
- Number of Bookings is the number of distinct Deal Names.
- Credit, Front Money, Bankroll, Theoretical, Player W/L, and Commission are summed from the same de-duplicated records.
- Total Player W/L was added to Required Monthly KPI Totals.
- Signed values are preserved, including standard minus signs, Unicode minus signs, trailing minus signs, and accounting parentheses.
- Missing and duplicate Deal Names appear in Data Quality.


## V16 Top 10 player booking history

Player Booking History now shows only the **Top 10 players with the highest Total Bookings**.

Ranking order:

1. Highest Total Bookings
2. Highest Total Theoretical as the tie-breaker

The same Top 10 list is used in the website report, Excel export, and presentation export.


## V17 required report alignment

The visible KPI report now follows the required Pace Gaming list.

- Number of Bookings Players uses Deal Name and Check-Out Date.
- Top 5 Theoretical Players uses Deal Name.
- The Top 5 table shows only Deal Name, W/L, and Theoretical.
- The Bookings column was removed from the Top 5 table.
- The separate Most Frequent Property report was removed.
- The Top 10 Frequent Players section remains based on Player Full Name and Property.
- The report footer was removed.
- Excel and presentation exports follow the same Top 5 structure.


## V18 negative W/L formatting

Negative W/L values now display in red in:

- Top 5 Theoretical Players
- Top 10 Player Booking History
- Booking Agent Performance
- Highest Player Loss cards
- PDF/print output
- Presentation export

Positive and zero W/L values keep the normal report font color.


## V19 report header and confidential footer

The visible report now uses a simplified header containing only:

- Pace Gaming logo
- INTERNAL MONTHLY PERFORMANCE REPORT
- Pace Gaming Internal KPI Report
- Primary comparison dates
- Generated date
- Source: KPI 2025-2026 · PipelineCRM

The Supplementary Data Review / Quality Checks section was removed from the visible report.

The report footer now displays:

- INTERNAL COPY · CONFIDENTIAL
- Prepared by Anne Joy


## V20 full Deal Name and print-footer correction

- Top 5 W/L and Theoretical now displays the exact full Deal Name from the `DEAL NAME` column.
- Each de-duplicated Deal Name is treated as one deal; the full text is preserved so property, player, and date remain visible.
- When a `DEAL NAME` header exists, the report enforces that exact source mapping.
- Deal Name and Player Full Name cannot be mapped to the same source column.
- Print CSS now uses a zero-margin page and internal report padding to suppress browser-generated URL and page-number footers such as `file:///... 5/5`.


## V21 KPI scope update

- Added **Total W/L** to the “KPIs included in this report” list.


## V22 KPI total and report cleanup

- Added **Total W/L** to the Required Monthly KPI Totals table.
- Added **Total W/L** to Excel and presentation KPI summaries.
- Removed the visible **YEAR-OVER-YEAR / Selected theoretical comparisons** section.
- Removed the comparisons worksheet and comparisons slide from exports.


## V23 editable report header

The report settings now include:

- **Report Header Title** — type the exact title to show on the KPI report.
- **Primary Comparison Header** — type the exact comparison date/header line.
- **Use Selected Dates** — automatically fills the comparison header from Month 1 and Month 2.

Leaving the comparison field blank keeps the automatic format:
`Primary comparison: Month 1 vs Month 2`.

The custom header is saved in the browser and used in the website, PDF report, saved report history, and presentation export.


## V24 centered exports and negative Total W/L

- The PDF/print report is centered on every page.
- Report headers, section headings, month labels, footers, and table content are centered in the PDF.
- Presentation headings and all presentation table cells are centered.
- Negative **Total W/L** values in Required Monthly KPI Totals appear in red.
- Negative Total W/L remains red in PDF/print and presentation exports.


## V25 Email Format export

The **Email Format** button creates a styled email containing only the 12 approved KPI items. The email can be copied into Gmail or Outlook or downloaded as an HTML file. Negative W/L amounts remain red.


## V29 simplified centered email header

The styled email now uses one centered header only:

**Pace Gaming KPI Report for [selected report months]**

Removed from the email header:

- PG badge
- Internal Monthly Performance Report
- Primary comparison line
- Required comparisons line
- Generated date
- Source line

The editable draft message, report sections, tables, labels, values, and downloaded HTML email are centered using an email-client-safe table layout. The email subject uses the same automatic month-based header.


## V30 upload-control repair

- Restored the missing Report Month 3 and Report Month 4 controls required by the JavaScript.
- Restored the editable Email Draft Message and Use Suggested Draft controls.
- Added defensive event binding so a missing optional control cannot prevent file upload buttons from working.
- Verified that all JavaScript-cached element IDs now exist in the page.


## V30 upload-button repair

The Choose Files button stopped responding because the JavaScript expected controls that were missing from the page. V30 restores Month 3, Month 4, Email Draft Message, and Use Suggested Draft so application initialization completes and file upload works again.


## V31 email Total W/L correction

- Added **Total W/L** to the styled email's Monthly KPI Totals.
- Negative Total W/L values display in red and bold.
- Email Total W/L uses the same monthly `playerWinLoss` calculation as the main KPI report.

## V34 integrated Number of New Prospects system

The Number of New Prospects feature is now built into the main KPI system rather than added as a separate page.

- Manual monthly inputs are available for DL, KA, KH, SP, AJ, MO, LR, CV, and TF.
- Month columns automatically follow all selected report and comparison months.
- Entries save automatically in the same browser.
- Blank executives are hidden from the final report.
- A manually entered `0` remains visible as a valid value.
- A monthly total row is calculated automatically.
- The section appears directly after Required Monthly KPI Totals.
- The values are included in the website report, Print / Save PDF, Email Format, Excel export, PowerPoint export, and saved report history.
- Use **Clear Prospect Entries** to erase all saved prospect values.


## V35 editable prospect dates and automated totals

- Prospect dates automatically copy the unique Check-Out Date months detected in the uploaded KPI file.
- Every prospect date remains editable. Dates may be added or removed before report generation.
- The prospect entry table calculates a live total for every executive, every date, and the full period.
- The same automated totals are included in the report, email format, Excel export, PowerPoint export, PDF, and saved report history.

## V36 compact PDF layout

- Print / Save PDF now uses a compact A4 landscape layout.
- Report sections can continue naturally across pages, which removes mostly empty PDF pages.
- Table headers repeat when a table continues onto another page.
- Table rows remain together to prevent broken or clipped values.
- The New Prospects section no longer leaves an unnecessarily large blank area below it.

## V37 PDF pagination fix

- The Number of New Prospects Added section now stays together as one complete table in PDF output.
- The table is moved to the next page when there is not enough remaining space, instead of splitting executives across two pages.
- Other report sections continue flowing normally so the following page is still used efficiently.

## V38 final PDF layout refinement

- The New Prospects section remains fully intact and is never divided between pages.
- Print-only spacing and row height were reduced slightly so the section fits naturally without oversized blank areas.
- No changes were made to the on-screen report design or calculations.


## V39 fixed seven-page PDF export

The Print / Save PDF report now uses an exact page order:

1. Pace Gaming Internal KPI title page
2. Required Monthly KPI Totals
3. Number of New Prospects Added
4. W/L and Theoretical by Full Deal Name for four dates
5. Top 10 Players by Total Bookings
6. Booking Agent KPI Performance for four dates
7. Theoretical Comparison Graph

Each section starts on a new landscape A4 page and is prevented from splitting across pages.

## V40 larger PDF fonts

The seven-page PDF export now uses larger print-only typography for clearer reading. Spacing was adjusted slightly so tables remain complete and the established one-section-per-page layout is preserved.

## V41 extra-large PDF text

PDF-only typography is now significantly larger across Pages 2-7. The seven-page order remains unchanged, and each report section is kept intact on its assigned page.

## V42 maximum-readability PDF

The PDF uses larger report typography, especially for the four-date Top 5 and Booking Agent pages and the Top 10 player table. It remains an exact seven-page landscape report.


## V43 separate executive snapshot PDFs

The report toolbar now includes two one-page snapshot PDF buttons. They use Comparison 1 and Comparison 2, which default to May 2025 vs May 2026 and June 2025 vs June 2026. Each snapshot includes aggregate KPI totals, current-month highlights, year-over-year variances, New Prospect totals, and Booking Executive performance. Patron and player names are intentionally excluded from these snapshot reports. The original seven-page internal PDF is still available through Print / Save PDF.


## V45 — all reports retained + two separate boss snapshot PDFs

The complete KPI system remains intact, including the seven-page PDF, Excel, PowerPoint, email format, saved history, and all on-screen report sections.

Two additional one-page PDF exports are available after generating the report:

- **May 2025 vs May 2026 Snapshot PDF** — May 2026 totals with May 2025-to-May 2026 variances.
- **June 2025 vs June 2026 Snapshot PDF** — June 2026 totals with June 2025-to-June 2026 variances.

The two snapshot PDFs never include player or patron names. They use aggregated KPI totals and Booking Executive names only, so Patron # placeholders are not needed.


## V46 private 10-page report

The main PDF export now creates one 10-page report with May and June year-over-year divider and snapshot pages. Player and patron names are excluded from the PDF and email. Top theoretical performance is aggregated by Booking Executive. The detailed Top 10 player booking table remains available inside the browser system but is not included in these private outputs.


## V47 anonymized Top 5 and executive aliases

- Dave Luber and David Luber are treated as one Booking Executive: David Luber (DL).
- Kyle Allen uses KA and Sabrina Pinto uses SP.
- Top 5 Theoretical Players are shown as Patron 1 - [Deal Owner code] through Patron 5 - [Deal Owner code], with W/L and Theoretical values.
- The anonymized Top 5 appears in the browser report, PDF, email, Excel, and presentation.

## V49 uniform Booking Executive names

Booking Executive names are now standardized in Proper Case throughout all report outputs. Imported names such as `CHUCK VENUTO`, `chuck venuto`, and mixed-case variations display uniformly as `Chuck Venuto`. Chuck Venuto is mapped to Booking Executive code `CV`. Existing known executive aliases and codes remain unchanged.

## V50 PDF export naming

When using **Print / Save PDF**, the browser now suggests a clear, sortable filename using:

`YYYY-MM-DD - Pace Gaming KPI - Date Comparison.pdf`

Example:

`2026-07-21 - Pace Gaming KPI - May 2025 vs May 2026 - June 2025 vs June 2026.pdf`

The first date is the date the report is exported. The comparison dates are added automatically from the report. Separate snapshot PDFs use the same convention and add `Snapshot` at the end.

Executive name correction: only **Chuck Venuto** is mapped to **CV**. No Charles Venuto alias is included.

## V51 cleaner PDF and corrected Pages 9–10

- The PDF uses a cleaner, less busy layout with fewer decorative boxes and stronger spacing.
- Page 9 shows unique KPI report months only and reads theoretical totals directly from Monthly KPI Totals.
- The Page 9 chart uses a true zero baseline for signed values.
- Page 10 shows only the dates included in the KPI report, in the same order as the Monthly KPI Totals page.
- Prospect totals are recalculated from the displayed dates only.


## V52 page numbers and report cleanup

- Added visible `Page X of Y` numbering to every page in the main PDF export.
- Removed the Theoretical Comparison Graph from the website report and main PDF.
- The remaining report sections, calculations, email report, Excel export, PowerPoint export, themes, fonts, anonymized patrons, and New Prospects report remain unchanged.
- With New Prospects data present, the standard main PDF now contains nine pages.

## V53 small footer page numbers

- Page numbers are anchored at the physical bottom footer of each PDF page.
- Footer numbering uses a small, subtle font so it does not compete with report content.
- The PDF continues to use `Page X of Y` numbering.

## V54 snapshot page fit correction

- Comparison snapshot pages 4 and 6 are locked to one physical PDF page each.
- The small page number remains in the bottom footer.
- Snapshot content no longer spills onto an extra page.

## V55 separate PDF exports and two-page month comparisons

The complete KPI PDF remains available through **Complete PDF Report** and still includes every approved report section.

Two additional separate-PDF buttons are now shown after the report is generated:

- **May 2025 vs May 2026 · 2-Page PDF**
- **June 2025 vs June 2026 · 2-Page PDF**

Each separate comparison PDF contains:

1. **Year-over-year KPI variance** — prior-year total, current-year total, amount variance, and percentage variance.
2. **Booking Executive performance** — current bookings, booking variance, theoretical, theoretical variance, W/L, and W/L variance.

The May and June comparison sections inside the complete PDF use this same two-page structure for better readability. Page numbers remain small and centered in the physical footer.


## V56 dynamic separate comparison PDFs

The **Separate PDF Options** area is no longer fixed to May and June. It now follows the comparison pairs selected in **Comparison 1 through Comparison 6**. Only complete, unique comparison pairs are shown. Each selected pair exports as the existing two-page comparison PDF: KPI totals/variance on Page 1 and Booking Executive performance/variance on Page 2.

## V57 dynamic complete report and email

- Complete PDF no longer uses fixed May/June comparison periods.
- Email Format no longer uses fixed May/June monthly totals or snapshots.
- Complete PDF creates the KPI variance and Booking Executive pages for every comparison pair selected in Comparison 1–6.
- Email includes the current Monthly KPI View dates plus every selected comparison pair.
- Separate PDF buttons, Complete PDF filename, report comparison subtitle, and email all follow the same selected periods.
- Year-over-year and month-over-month comparisons are labeled automatically.
- New empty sessions default to the two most recently completed months, their prior-year matches, and a current-year month-over-month comparison.

## V59 team email draft and export naming

- Separate comparison PDF names use `YYYY.MMDD - KPI - Month Year vs Month Year.pdf`.
- Example: `2026.0901 - KPI - July 2025 vs July 2026.pdf`.
- Each comparison export now includes a **Copy Email Draft** action with a concise team-ready summary for that exact comparison.
- Complete PDF and downloaded Email HTML follow the same date-first naming convention.

## V60 layout fix

The Separate PDF Options area now uses a responsive full-width grid. Comparison PDF and Copy Email Draft actions stay readable and inside the report panel on desktop, tablet, and mobile widths.

## V62 combined team email summary

The Separate PDF Options area now uses one email draft for all selected comparison reports rather than one draft per PDF. Export the selected two-page comparison PDFs, then click **Copy Combined Email Summary**. The copied draft lists every selected comparison and includes a separate KPI and Booking Executive summary block for each one. Booking Executive highlights continue to use **Primary Contact Owner** only.

## V64 shorter email summary

The combined team email summary is intentionally concise. For each selected comparison it shows Bookings, Theo, W/L, New Prospects, plus one Booking Executive highlight line for Most Bookings and Top Theo. Full KPI and executive detail remains in the attached PDF reports.


## V65 narrative email summary

The combined team email is now a short explanation of trends rather than a duplicate of the attached KPI numbers. The Separate PDF area includes editable Subject and Email Body fields plus copy buttons.


## V66 simple team email summary

- The combined email summary now focuses only on **Number of Bookings** and **New Prospects Added** for each selected comparison.
- It no longer repeats theoretical, W/L, commission, or Booking Executive highlights in the email summary because those details are already in the attached PDFs.
- Each comparison uses one short sentence with the current total and prior-period total.
- **Copy Email Body** now attempts a rich formatted copy for Gmail/Outlook, with a plain-text fallback.


## V67 optional Total Prospects (superseded by V69)

V67 introduced a separate Total Prospects field. In V69, this field is redefined as the editable official **Total New Prospects Added** for each month. It is no longer treated as a different KPI.


## V69 editable total new prospects

The New Prospects section includes an optional editable monthly **Total New Prospects Added** field. Enter the official total when needed. If left blank, the system uses the sum of the executive entries. The final total is used throughout PDF, email, Excel, and PowerPoint exports.

## V70 comparison variance display

- Variance and percentage columns now show the magnitude of change without a leading negative sign.
- Direction is shown with ▲ for increase and ▼ for decrease.
- Player W/L source totals remain signed exactly as uploaded.
- W/L variance is presented from Pace/casino perspective: ▲ means Pace won more and ▼ means Pace won less.

## V71 email summary

The combined team email summary now provides a concise month-by-month KPI recap. Each unique month/year selected in the comparison pairs is shown once with Number of Bookings, Total Theoretical, Player Win/Loss, Total Commission, and the Booking Executive with the most bookings. Detailed variances remain in the attached comparison PDFs.


## V72 table-style email KPI summary

The combined email summary now uses a compact KPI table with one column per unique month/year and rows for Bookings, Theo, Player Win, Commission, and Top Bookings. Below the monthly table, the email shows separate Year-over-Year and Month-over-Month comparison tables. The rich copy action preserves table formatting when pasted into Gmail or Outlook.


## V73 — Separate comparison PDFs and New Players Added

- The report now clearly shows a separate 2-page PDF export button for every selected comparison pair after you click **Generate Monthly Report**.
- Comparison pairs are fully dynamic. Example: **July 2025 vs July 2026**, **August 2025 vs August 2026**, and **July 2026 vs August 2026** each become their own PDF.
- A preview under Comparison Dates shows exactly which separate PDFs will be available before generating.
- The manual growth input is labeled **Number of New Players Added**.
- Click **Use Selected Report Months** to match New Player input months to the report/comparison dates, or **Use Uploaded KPI Dates** to use Check-Out Date months from the uploaded file.
- Enter an **Official Total New Players Added** for each month, with an optional Booking Executive breakdown.
