# CCASS demo data contract

The site is static. `data.json` is the only holdings/fee source. No backend or scheduled refresh is included.

## Snapshot identity

Each snapshot is unique by `stock` (four-character HK code string) + `date` (ISO settlement observation date). The dataset contains five stocks at 2026-06-30, 2026-07-31, 2026-08-31 and 2026-09-30.

Every snapshot preserves `source`, original security `name`, `issued`, `ccass`, `nonCcass`, `unnamed`, original summary categories, and `participants`.

Each participant has a stable source `id`, `code` (blank for some named investors), original English `name`, integer `holding`, ISO `lastChange`, and rounded `sourceStake`. Displayed stake is recalculated as holding / issued * 100. `sourceStake` is retained for provenance, not used as an arithmetic input.

`connect` is an object containing A00003 and A00004 share holdings. Archive and export keep them separate. Movement outputs combine their signed changes before ranking and suppress the account codes.

## Reconciliation

Named participant shares + unnamed investor shares = total CCASS.

Total CCASS + non-CCASS shares = issued securities.

Source summary categories overlap; never sum all summary rows. Named participants equal Intermediaries + Named investors.

## Fees

Each workbook fee record has exact `code`, original `name`, nullable `amount`, explicit `currency`, original `raw` value and workbook `row`. Match by exact code. Identical duplicate currency/amount rows count once. No matching fee or a blank workbook fee is treated as HKD 0, as instructed by the user. Conflicting fee rows or invalid currency conversions remain errors. Numeric unlabelled fees are HKD. Fixed conversions: 1 USD = HKD 7.78 and 1 EUR = HKD 8.90, as confirmed by the user. Rates and fees have no editable input boxes.

Fixed fee once per selected participant. ADD unions with normal membership, DROP removes without backfill. Commands run in explicit order. Thresholds select individual named holdings >= share cutoff; aggregate unnamed investor holdings cannot be screened by individual threshold. Top-N includes named CCASS participants ordered by holding.

Non-CCASS contributes its aggregate shares to coverage in every group. ALL additionally includes the unnamed CCASS aggregate. These aggregates have no matching fee and are assigned zero cost; they do not qualify for the HKD 2,500 count. Totals sum matched fees plus these zero assignments. The count includes participants whose resulting fee is at least HKD 2,500.

## Movement and insight boundaries

Holdings Explorer has two routes: `#holdings` for holdings and `#holdings/changes` for changes between dates. The changes table includes every named participant, keeps the two Stock Connect accounts separate, and supports increases/decreases/unchanged filters. Change = end holding − start holding. Stake change in percentage points uses each endpoint's issued-security denominator. Aggregate unnamed and non-CCASS balances reconcile separately. The CSV exports the current filtered changes, across all pages.

The separate Movement Monitor ranks intermediaries, includes A/B/C codes, excludes named and unnamed investor accounts, and combines the Stock Connect accounts before ranking. Missing participants at a complete captured endpoint have zero holdings at that endpoint. Compare only available dates; never interpolate. No trade-flow, cash-flow or beneficial-owner inference is made. Potential investor cells remain blank.

Stock Connect insights are deterministic arithmetic on the captured observations. Combined stake uses the source issued-security denominator, including its security-class scope. No sector classifications or price/valuation data are present.

## Handoff

Replace data.json with validated snapshots following the same contract. Update source/capture metadata and observation labels when expanding beyond the current fixed demo universe. Chinese names can be added as a separate participant-code mapping later. Optional ADD/DROP scenarios use a modal dialog, apply only after Apply adjustments, and are session-only; changing security resets them.
