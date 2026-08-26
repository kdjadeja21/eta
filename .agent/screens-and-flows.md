# ETA v2 — Screens, Routes & User Flows Inventory

**Branch:** `develop-v2`  
**Generated from:** real frontend source under `app/`, `components/`, `hooks/`  
**Default post-auth landing:** `/daily-view` (see `app/page.tsx`, `app/layout.tsx` Clerk redirects)

---

## Route map

| Route | Page file | Auth | Layout / shell |
|-------|-----------|------|----------------|
| `/` | `app/page.tsx` | Public (redirect only) | Root layout |
| `/sign-in` | `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Public | Root layout |
| `/sign-up` | `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Public | Root layout |
| `/daily-view` | `app/(dashboard)/daily-view/page.tsx` | Required (Clerk) | Dashboard layout |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Required (Clerk) | Dashboard layout |
| `/reports` | `app/(dashboard)/reports/page.tsx` | Required (Clerk) | Dashboard layout |
| `/reports/[id]` | `app/(dashboard)/reports/[id]/page.tsx` | Required (Clerk) | Dashboard layout |
| `/version` | `app/version/page.tsx` | Public | Standalone (no dashboard nav) |

**Navigation (authenticated):** `app/(dashboard)/dashboard-nav.tsx`  
- Desktop header links: Daily View, Dashboard, Reports  
- Mobile bottom nav: same three routes  
- Header also includes: app title link → `/daily-view`, currency dropdown, theme toggle, Clerk `UserButton`

**Middleware / route protection:** `proxy.ts` — Clerk middleware; public routes include `/`, `/sign-in`, `/sign-up`, `/version`, `/api/version`.

---

## Screens & sub-views

### 1. Root redirect (`/`)

**File:** `app/page.tsx`

- Signed-in user → redirect `/daily-view`
- Signed-out user → redirect `/sign-in`

No visible UI; pure redirect.

---

### 2. Sign in (`/sign-in`)

**File:** `app/(auth)/sign-in/[[...sign-in]]/page.tsx`

- Renders Clerk `<SignIn />` centered on page
- Fallback redirect after sign-in: `/daily-view` (ClerkProvider in `app/layout.tsx`)

**Related global behavior:** `components/auth-toast.tsx` shows welcome-back toast on sign-in state change.

---

### 3. Sign up (`/sign-up`)

**File:** `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

- Renders Clerk `<SignUp />` centered on page
- Fallback redirect after sign-up: `/daily-view`

**Related global behavior:** `components/auth-toast.tsx` shows new-user welcome toast when account created within last minute.

---

### 4. Daily View (`/daily-view`) — default home

**Page:** `app/(dashboard)/daily-view/page.tsx`  
**Content:** `app/(dashboard)/daily-view/daily-view-content.tsx`

**Sub-components:**
| Component | File | Purpose |
|-----------|------|---------|
| DailyHeroCard | `daily-hero-card.tsx` | Date navigator, daily total, vs-yesterday trend |
| ExpenseList | `expense-list.tsx` | List of expenses for selected day |
| ExpenseListItem | `expense-list-item.tsx` | Single expense row with edit/delete |
| DailyViewFab | `daily-view-fab.tsx` | Floating “Add Expense” button |
| AddExpenseDialog | `../dashboard/add-expense-dialog.tsx` | Shared add/edit expense sheet |

**User flows:**
1. **Browse by day** — prev/next day arrows; “Today” shortcut; cannot navigate past today
2. **View daily summary** — total spent + trend % vs previous day
3. **Add expense** — FAB → AddExpenseDialog → save → refresh day data
4. **Edit expense** — tap edit on list item → AddExpenseDialog (pre-filled) → update
5. **Delete expense** — tap delete → AlertDialog confirm → delete

---

### 5. Dashboard (`/dashboard`)

**Page:** `app/(dashboard)/dashboard/page.tsx`  
**Content:** `app/(dashboard)/dashboard/dashboard-content.tsx`

**Sub-components / widgets:**
| Component | File | Purpose |
|-----------|------|---------|
| DateRangePicker | `components/date-range-picker.tsx` | Filter all dashboard data by date range |
| StatsCards | `stats-cards.tsx` | Summary stat grid |
| AverageDailyExpensesCard | `widgets/average-daily-expenses-card.tsx` | Avg daily spend for range |
| ExpenseFastCard | `widgets/expense-fast-card.tsx` | Zero-spend days in range |
| TopSpendingCategoryCard | `widgets/top-spending-category-card.tsx` | Top category (fetches via expenseService) |
| PaymentMethodCard | `widgets/payment-method-card.tsx` | Spend by payment method |
| AreaChart | `components/ui/area-chart.tsx` | Daily spend line/area chart |
| ExpensePieChart | `widgets/expense-pie-chart.tsx` | Category/type distribution pie |
| DataTable | `components/ui/data-table/data-table.tsx` | Paginated, filterable, sortable expense table |
| AddExpenseDialog | `add-expense-dialog.tsx` | Add / edit expense |
| BulkUploadDialog | `bulk-upload-dialog.tsx` | Excel bulk import wizard |
| AddCashDialog | `add-cash-dialog.tsx` | Add cash transaction sheet (**mounted but no UI trigger found** — see note below) |

**User flows:**
1. **Change date range** — picker updates expenses, charts, stats; persisted per user in localStorage (`lib/dashboard-date-range-storage.ts`)
2. **Add expense** — “Add Expense” button → AddExpenseDialog
3. **Bulk upload** — “Upload Bulk Records” → Excel file pick/drag → preview valid/error rows → submit valid rows
4. **Filter & search table** — column filters (payment method, category, subcategory, tags, type, amount range), global search on description
5. **Edit expense** — row edit action → AddExpenseDialog
6. **Delete expense** — row delete → confirm AlertDialog
7. **Bulk delete** — select rows in table → bulk delete → confirm AlertDialog
8. **Export** — DataTable dropdown: export filtered rows to Excel or PDF (client-side, `lib/utils.ts`)
9. **View charts** — mobile: accordion sections; desktop: side-by-side daily chart + pie chart

**Note — Add Cash:** `AddCashDialog` is rendered in `dashboard-content.tsx` with `isAddCashOpen` state, but no button or control sets `setIsAddCashOpen(true)` anywhere in the codebase. The dialog UI exists but is not reachable from current navigation.

---

### 6. Reports list (`/reports`)

**Page:** `app/(dashboard)/reports/page.tsx`  
**Content:** `app/(dashboard)/reports/reports-content.tsx`

**Sub-components:**
| Component | File | Purpose |
|-----------|------|---------|
| GenerateReportProgress | `generate-report-progress.tsx` | Full-screen overlay during report generation |

**User flows:**
1. **List past reports** — grid of cards with month, totals, top category
2. **Select month to generate** — dropdown of completed months (`lib/report-month-utils.ts`)
3. **Generate new report** — if month not yet generated → progress overlay → POST `/api/reports/generate` → redirect to `/reports/[id]`
4. **View existing report** — if month already generated → link to existing report detail
5. **Delete report** — trash icon on card → AlertDialog → delete → refresh list

---

### 7. Report detail (`/reports/[id]`)

**Page:** `app/(dashboard)/reports/[id]/page.tsx`  
**Content:** `app/(dashboard)/reports/[id]/report-content.tsx`

**Sub-components:**
| Component | File | Purpose |
|-----------|------|---------|
| ReportHero | `report-hero.tsx` | Month headline + MoM summary |
| InsightHighlights | `insight-highlights.tsx` | Highlight chips |
| SpendingCalendar | `spending-calendar.tsx` | Calendar heatmap of daily spend |
| NeedsWantsGauge | `needs-wants-gauge.tsx` | Need vs want breakdown gauge |
| CategoryBreakdownChart | `category-breakdown.tsx` | Interactive category chart |
| ComparisonSection | `comparison-section.tsx` | Month-over-month comparison (if prev report exists) |
| DownloadPdfButton | `download-pdf-button.tsx` | Client-side PDF download |

**Inline sections in report-content.tsx:** stat cards row, daily area chart, weekday pattern card, payment methods card, AI insights card.

**User flows:**
1. **Load report** — fetch report by ID; verify ownership (`userId` match)
2. **View analytics** — scroll through hero, highlights, stats, calendar, gauges, charts, AI insights
3. **Download PDF** — DownloadPdfButton → dynamic import `lib/report-pdf.ts`
4. **Delete report** — Delete button → AlertDialog → delete → navigate to `/reports`
5. **Back navigation** — “All Reports” → `/reports`

---

### 8. Version page (`/version`)

**Page:** `app/version/page.tsx`  
**Content:** `app/version/version-details.tsx`

- Public page showing app version, last deploy timestamps, stored timezone
- Data sourced from static `lib/version.json` at build time (not fetched from `/api/version` in UI)
- Header link back to `/daily-view`, theme toggle
- Documents that JSON API exists at `/api/version` (informational only in UI)

---

## Global UI shell (authenticated routes)

**File:** `app/(dashboard)/layout.tsx`

- Sticky header: logo/title, desktop nav, currency dropdown, dark/light toggle, Clerk user menu
- Main content area with mobile bottom padding for safe area + visual viewport offset
- Mobile bottom tab bar (`MobileBottomNav`)
- Wraps children in `CurrencyProvider` (`components/currency-context.tsx`)

**Root layout extras (`app/layout.tsx`):**
- ClerkProvider, ThemeProvider, Sonner Toaster, AuthToast, VisualViewportOffset

---

## Cross-cutting UI components (not routes)

| Component | File | Used for |
|-----------|------|----------|
| ModeToggle | `components/mode-toggle.tsx` | Dark/light theme |
| CurrencyDropdown | `components/currency-dropdown.tsx` | INR/USD/GBP/EUR selection |
| CustomCreatableSelect | `components/CustomCreatableSelect.tsx` | Creatable selects in expense form |
| CustomSelect | `components/CustomSelect.tsx` | Filters in DataTable |

---

## End-to-end user journeys (summary)

```
Sign up/in (Clerk)
    → /daily-view (default)
        ↔ navigate: Dashboard, Reports
        → add/edit/delete expenses (daily or dashboard)
        → bulk Excel upload (dashboard)
        → export table Excel/PDF (dashboard)
        → generate monthly report (reports)
            → view report detail /reports/[id]
            → download PDF, delete report
Sign out (Clerk UserButton)
    → /sign-in
```
