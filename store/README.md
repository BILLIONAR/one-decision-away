# App Store listing metadata

Everything App Store Connect needs as text, per locale, plus subscription copy. Source of truth for claims: `docs/APP_STORE.md`, `src/pages/Upgrade.tsx`, `src/services/entitlements.ts`.

## Layout

Fastlane `deliver` layout: `store/metadata/<locale>/<field>.txt`, one field per file.

```
store/
  metadata/{en-US,tr,es-ES,es-MX}/
    name.txt  subtitle.txt  keywords.txt  promotional_text.txt  description.txt
    release_notes.txt  privacy_url.txt  marketing_url.txt  support_url.txt
  subscriptions.json      group "ODA", levels, 6 products (prices, trial, RevenueCat entitlement) + display names and descriptions (EN/TR/ES)
  screenshots/README.md   expected screenshot layout (images are kept outside the repo)
```

**Layout note:** the asc docs I could reach (README and command reference) name `asc metadata init/apply`, but do not document the file schema `asc metadata apply` reads, so I could not verify that it accepts this layout. I used the fastlane layout as the fallback. `es-MX` is a plain copy of `es-ES`; delete it if you do not want a Mexico-specific locale.

Limits (enforced by the checker): name 30, subtitle 30, keywords 100 **bytes**, promotional text 170, description 4000 characters; subscription display name 30, description 45.

## Before uploading

1. Replace the `TODO` in every `metadata/*/support_url.txt` with a real public support URL. No email address is committed here on purpose.
2. `node scripts/check-store-metadata.mjs --strict` must pass (without `--strict`, the support URL TODO is only a warning).
3. Create the app in App Store Connect (bundle ID `com.yahya.onedecisionaway`), the subscription group `ODA` and its six subscriptions (see "Subscription levels" below).

## Upload with asc

Install and sign in (verified in asc docs; key needs the App Manager role):

```bash
brew install asc
asc auth login --name "ODA" --key-id "KEY_ID" --issuer-id "ISSUER_ID" --private-key /path/to/AuthKey_KEY_ID.p8 --network
```

The key is stored in the macOS keychain. Use `--bypass-keychain` only for CI.

Metadata (commands exist in asc docs; the file schema they expect is **not verified**):

```bash
# 1. See asc's native layout: this writes a template you can compare with store/metadata
asc metadata init --dir ./asc-metadata --version "1.0" --locale "en-US"
# 2. Copy our text into that layout (or check whether `asc migrate import` accepts fastlane dirs: UNVERIFIED, see `asc migrate --help`)
# 3. Dry-run first, then apply
asc metadata apply --app "APP_ID" --version "1.0" --dir ./asc-metadata --dry-run
asc metadata apply --app "APP_ID" --version "1.0" --dir ./asc-metadata
# Optional keyword review (verified command)
asc metadata keywords audit --app "APP_ID" --version "1.0"
# Confirm what is live (verified)
asc localizations list --app "APP_ID" --type app-info
```

The URL fields (`privacy_url`, `marketing_url`, `support_url`) and app-level name/subtitle map to asc's app-info localization; keywords, description, promotional text and release notes map to the version localization.

Screenshots (command and flags verified in asc docs; `IPHONE_69` for the 6.9" slot is **unverified**, the docs example uses `IPHONE_65`):

```bash
asc screenshots upload --version-localization "VERSION_LOCALIZATION_ID" --path ./store/screenshots/en-US --device-type "IPHONE_69" --replace
```

`VERSION_LOCALIZATION_ID` is a resource ID, not the locale code; repeat per locale.

Subscriptions: **no asc command verified.** `store/subscriptions.json` holds the copy; either enter it in App Store Connect by hand or check `asc subscriptions localizations --help`.
Suggested prices: see the table below.

Also enter by hand: category (Health & Fitness, secondary Lifestyle), age rating 4+, the App Privacy answers and the review notes in `docs/APP_STORE.md`.

## Subscription levels

One subscription group, **ODA**. Apple group levels (1 = highest) so moving between levels is an upgrade or downgrade of one subscription: **coach = 1, pro = 2, essentials = 3**. RevenueCat entitlements are `essentials`, `pro` and `coach`; the app resolves the highest active one. Product IDs are the RevenueCat identifiers the paywall looks for; a missing product simply shows "Price shown by the App Store".

| Level | Courses | Sound Room | AI coach messages / month | Monthly | Annual |
| --- | --- | --- | --- | --- | --- |
| Free | Turning Day in full, first 2 lessons of every other course | first 2 sounds per category | 30 | – | – |
| Essentials | procrastination, focus, sleep, calm, confidence, motivation in full (+ Turning Day); first 2 lessons of the rest | full | 150 | `oda_essentials_monthly` 3.99 USD | `oda_essentials_annual` 29.99 USD |
| Pro | all 18 courses | full | 600 | `oda_pro_monthly` 7.99 USD | `oda_pro_annual` 49.99 USD, 1-week free trial |
| Pro Coach | all | full | 3000 (fair use), weekly personal plan, coach reads journal and decisions (with consent), voice replies | `oda_coach_monthly` 14.99 USD | `oda_coach_annual` 99.99 USD |

Display names (max 30) are `ODA <Level> – Monthly|Yearly` (TR: Aylık/Yıllık, ES: Mensual/Anual); descriptions (max 45) are in `subscriptions.json`. The checker validates the group, IDs, levels, prices, trial and lengths. Source of truth in code: `src/services/entitlements.ts`.
