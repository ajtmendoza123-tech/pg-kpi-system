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
