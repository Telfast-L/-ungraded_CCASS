# Integrated CCASS workbench contract

This workbench supports a read-only local DuckDB API and a static GitHub Pages export. The original `ccass-analyst` demo remains separate.

## Coverage and identity

- Full local source: `ccass-database/ccass_history.duckdb`, 120,579,075 holdings rows, 3,458 securities and 288 available source dates from 2025-11-01 through 2026-10-22.
- Static sample: 00005, 00388, 00700, 01810 and 09988 across all 288 available dates. The manifest gives exact exported counts.
- Codes stay five-digit strings. `ID:<source participant ID>` matches identities across securities and dates. Blank IDs retain their source type and names under provisional `ANON:` keys. Names alone are not verified beneficial-owner identities.
- Source dates include Saturdays. No interpolation, certified trading calendar or corporate-action adjustment is applied.

## Quantities and categories

Each detail record preserves holding quantity, reported percentage (nullable), source member ID and CSV row number. The raw denominator is total shares/units/warrants as supplied. No instrument-type assumption is imposed. Zero denominators produce unavailable stakes.

Detail quantities and counts reconcile to source category 01. Source categories 02 and 03 remain aggregates. Comparisons with all twenty original demo snapshots show category 01 matches intermediary holdings, category 02 matches named-investor aggregates and category 03 matches unnamed-investor aggregates. Individual category 02 investor records are absent from these raw files and must not be invented.

Total CCASS = categories 01 + 02 + 03. Outside CCASS is derived as the source issued denominator minus those categories. The raw and original Webb-site denominators differ on nine of the twenty overlapping snapshots. The integration retains the raw denominator, so stakes and cost coverage can differ from the previous demo despite identical holding quantities.

Negative source quantities remain unchanged and visibly flagged. Source quality and source/member references are available through the source page. Seven negative records concern 01940 / B02004 on 8–15 September 2026. Do not treat them as validated economic positions.

## Missingness

An unavailable security/date snapshot is unavailable, not zero. A participant missing from a complete category 01 detail snapshot contributes zero at that endpoint. A summary-only security without category 01 does not establish participant-level coverage and remains unavailable in histories and Connect trends. The source does not supply last-change dates.

## Calculations and fees

Stake = holding / source issued denominator × 100. Cumulative stake sums all detail records from rank 1 through the current rank. Search filtering retains the full ranking. Change uses unadjusted endpoint holdings. Stake movement is a percentage-point difference using each endpoint's denominator. It is not measured trading or cash flow.

Costs use category 01 detail records for Top N and individual holding thresholds. ALL also includes category 02 and 03 aggregates. Every cost group retains the existing outside-CCASS coverage rule. Aggregates without fee matches contribute zero fees and do not increase the qualifying custodian count. Category 02 individual thresholds and ranks cannot be calculated. Fixed historical workbook fees are illustrative, not effective-dated historical invoices. Exact fee-code matching, zero unmatched fees, 1 USD = HKD 7.78 and 1 EUR = HKD 8.90 remain unchanged. ADD/DROP selections apply to recorded detail participants.

## Other modules

Raw Stock Connect trends retain A00003 and A00004 individually and combined. Market turnover, HSI and sector holding-value charts keep their separate workbook/web datasets and original dates. The raw database has no prices, sectors or turnover series, so no new valuation is inferred.

Phase 2 reply estimates, subcustodian names and previous-vendor markers remain illustrative. Intel issuing uses real endpoint holdings and selects absolute stake movements strictly greater than 0.1 percentage points. No external issuing is performed. Filing database, IRI insight and T3G integrations remain pending.

## API and static files

`GET /api/meta`, `/api/dates?stock=`, `/api/snapshot?stock=&date=`, `/api/history?stock=&participant=`, `/api/portfolio?participant=&date=` and `/api/connect?stock=` are read-only and parameterized. No arbitrary SQL, database download or filesystem-write endpoint is provided. The server binds to 127.0.0.1 only.

Static month files use a participant dictionary and row arrays `[participantIndex, holding, reportedPercentage, sourceId, sourceRow]`. Metadata and raw summaries stay attached to each snapshot. `data-service.js` expands them into the same UI contract as the API. The manifest describes exported scope and available dates per security. Only requested months load into the browser.
