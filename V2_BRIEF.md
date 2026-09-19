# One Decision Away — v2 "Paper" redesign brief

Repo: /home/claude/oda-gh (React 19 + Vite + TS + Tailwind 4). Do NOT run npm install. Verify with `npx tsc --noEmit` (must pass). Other agents edit other files concurrently — only touch the files assigned to you; ignore tsc errors in files that aren't yours.

## Why
Users found the app childish, cluttered and visually noisy. v2 goal: a calm, adult, premium product — like Notion / Things / Linear. Fewer things on screen, one accent colour, no decoration.

## Visual system ("Paper") — already in src/styles/tokens.css, use ONLY CSS variables
- Backgrounds: `var(--bg)` (white), `var(--bg-muted)` (#F3F3F1 for cards/inputs), `var(--bg-elevated)` (white).
- Text: `var(--fg)` (near-black), `var(--fg-muted)` (#6F6F6C), `var(--fg-subtle)` (#8A8A87).
- ONE accent: `var(--accent)` (deep green #1F5F3F) — used for progress, done-states, the D$ balance, primary emphasis. `var(--accent-soft)` for its tint.
- Borders: `var(--border)` hairline. Radii: `var(--radius-md)` 16px cards, `var(--radius-lg)` 20px large cards, `var(--radius-sm)` 12px buttons/inputs.
- Danger only for destructive: `var(--danger)`.
- Font: Geist (already loaded), `font-sans` everywhere; headings are `font-semibold tracking-tight`, never italic, never serif, never uppercase-with-letter-spacing micro labels. NO `text-amber-*`, `text-emerald-*`, `bg-gradient-*`, `text-rose-*` etc. — Tailwind colour utilities are banned; use the variables. Dark mode works automatically through variables.
- Primary button: `h-12 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px]`. Secondary: `border border-[var(--border-strong)] bg-transparent text-[var(--fg)]`. Touch targets ≥44px.
- Cards: `bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5` (no border) OR `bg-[var(--bg)] border border-[var(--border)]` — pick one per screen, don't mix.
- Icons: lucide-react, 18–22px, strokeWidth 1.8. No emoji in UI chrome. No "Fig. 01", "Issue No.", "Folio", "Volume", "Editorial", "Midnight", "System OS" copy — delete that theme.
- Copy: short, plain, second person. Page title = one word or two (`Today`, `Dreams`, `Me`). Subtitle only if it adds information.
- Layout: content width is max-w-2xl inside AppShell (already). Vertical rhythm: sections separated by `space-y-6`. Section heading: `text-[15px] font-semibold`. Mobile first.
- Existing reusable UI in `src/components/ui.tsx` (Button, Card, PageHeader, Field, Input, Badge, Modal, Progress, Empty…). Use them where they fit; if their built-in style fights the brief (PageHeader prints "Issue" numbers etc.) pass minimal props or write plain markup. Don't restyle ui.tsx unless assigned.

## Information architecture (already wired in src/App.tsx + src/layout/AppShell.tsx)
Four tabs: Today (`/app`), Dreams (`/app/dreams`), Notebook (`/app/notebook`), Me (`/app/me`). All old routes still render (`/app/market`, `/app/life`, `/app/missions`, `/app/progress`, `/app/two-futures`, `/app/future-self`, `/app/score`, `/app/bank`, `/app/bridge`, `/app/budget`, `/app/seasons`, `/app/upgrade`, `/app/settings`) and are reached from Me. Navigate with `setActiveRoute(path)` from `useApp()`.

## i18n (mandatory)
Every user-visible string goes through `const t = useT()` from `../i18n` (`t('English text')`, params as `{n}`). Keep keys plain English. New keys will be translated by a later pass — just write good English. Data displayed from stores/seeds is rendered via `t(value)` where the value is a seeded English string.

## Store
`useApp()` in src/store/useApp.tsx exposes data + actions (completeMission, purchaseItem, updateProfile, showToast, setActiveRoute, micro-habit toggles, one-decision helpers, etc.). Read the interface at the top of that file before building; reuse existing actions, don't duplicate logic. Persisted shape: src/types/models.ts.

## Definition of done for your files
- tsc clean for your files, no console errors expected, no banned utilities (grep your files for `amber|emerald|rose|violet|indigo|sky|gradient|italic|uppercase|tracking-\[`), all strings via t(), works at 390px width and on desktop, dark mode via variables only.
- Report: what you built, what you removed, anything you couldn't do.
