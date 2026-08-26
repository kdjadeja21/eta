# ETA v2 — API Clients, Data Access & Endpoints Inventory

**Branch:** `develop-v2`  
**Generated from:** real frontend and shared client libraries used by UI  
**Important:** The UI does **not** use React Query, SWR, or a dedicated API SDK for expenses. Primary data access is **Firebase Firestore** via service modules called directly from components.

---

## 1. HTTP endpoints called from UI

| Endpoint | Method | Called from | Request body | Response (success) |
|----------|--------|-------------|--------------|-------------------|
| `/api/reports/generate` | POST | `app/(dashboard)/reports/generate-report-progress.tsx` | `{ month: string, timezoneOffset: number }` | `{ reportId: string }` |

**Not called from UI (exist in repo, documented for completeness):**

| Endpoint | File | Notes |
|----------|------|-------|
| `/api/version` | `app/api/version/route.ts` | GET returns `{ version, lastUpdated, timezone }`. Referenced in `app/version/version-details.tsx` text only; version **page** reads `lib/version.json` directly. |
| `/api/expenses/bulk-expenses` | `app/api/expenses/bulk-expenses.ts` | Legacy Pages-router-style handler; **not referenced** by any frontend file. Bulk upload uses `expenseService.addExpense` client-side instead. |

---

## 2. External HTTP APIs called from UI

| URL | Called from | Purpose |
|-----|-------------|---------|
| `https://ipapi.co/json/` | `lib/geolocation-service.ts` → `components/currency-context.tsx` | Infer user country for default currency when Clerk metadata has no currency |

---

## 3. Clerk (auth SDK — not REST endpoints owned by this app)

| API / hook | Used in | Purpose |
|------------|---------|---------|
| `auth()` (server) | `app/page.tsx`, dashboard layout/pages | Server-side session check |
| `ClerkProvider` | `app/layout.tsx` | Auth context, redirect URLs |
| `SignIn` / `SignUp` | auth route pages | Auth UI |
| `UserButton` | `app/(dashboard)/layout.tsx` | Profile / sign out |
| `useUser()` | Multiple dashboard components | Current user id, name, metadata |
| `useAuth()` | `components/auth-toast.tsx` | Sign-in state for toasts |
| `useSignIn()` | `components/auth-toast.tsx` | Imported (sign-in flow support) |
| `user.update({ unsafeMetadata })` | `components/currency-context.tsx` | Persist selected currency on Clerk user |

**Clerk redirect config (`app/layout.tsx`):**
- signInUrl: `/sign-in`, signUpUrl: `/sign-up`
- signInFallbackRedirectUrl / signUpFallbackRedirectUrl: `/daily-view`
- afterSignOutUrl: `/sign-in`

---

## 4. Firebase Firestore client

**Init:** `lib/firebase.ts` — `getFirestore(app)` exported as `db`

### 4.1 `expenseService` — `lib/expense-service.ts`

Primary expense/cash data client. Used directly from UI components (no wrapper hook).

| Method | Firestore operation | Collections / paths | UI callers |
|--------|--------------------|---------------------|------------|
| `getExpenses(userId, startDate?, endDate?)` | Query | `expenses` (where userId, optional date range, orderBy date desc) | `dashboard-content.tsx`, `add-expense-dialog.tsx`, `daily-view-content.tsx`, `widgets/expense-pie-chart.tsx`, `widgets/payment-method-card.tsx` |
| `addExpense(userId, expense)` | addDoc | `expenses` | `dashboard-content.tsx`, `daily-view-content.tsx`, bulk upload handler |
| `updateExpense(id, expense)` | updateDoc | `expenses/{id}` | `dashboard-content.tsx`, `daily-view-content.tsx` |
| `deleteExpense(id)` | deleteDoc | `expenses/{id}` | `dashboard-content.tsx`, `daily-view-content.tsx` |
| `deleteExpenses(ids[])` | writeBatch delete | `expenses/{id}` | `dashboard-content.tsx` (bulk delete) |
| `getCategories(userId)` | getDocs | `users/{userId}/categories` | **Not called from UI** (used server-side in `app/api/reports/generate/route.ts`) |
| `addCategory(userId, name, subcategories?)` | addDoc | `users/{userId}/categories` | **Not called from UI** |
| `getCashTransactions(userId)` | Query | `cashTransactions` | **Not called from UI** |
| `addCashTransaction(userId, amount, description?)` | addDoc | `cashTransactions` | `add-cash-dialog.tsx` (dialog not reachable — see screens inventory) |
| `getTotalExpenses(userId, startDate?, endDate?)` | via getExpenses | `expenses` | `daily-view-content.tsx` |
| `getExpensesByCategory(userId, startDate?, endDate?)` | via getExpenses | `expenses` | `widgets/top-spending-category-card.tsx` |

**Expense document shape (TypeScript):** `Expense` interface in same file — id, amount, type, date, category, subcategory, description, paidBy, tags, timestamps.

### 4.2 `reportService` — `lib/report-service.ts`

| Method | Firestore operation | Collections / paths | UI callers |
|--------|--------------------|---------------------|------------|
| `listReports(userId)` | Query | `reports` (userId, orderBy generatedAt desc) | `reports-content.tsx` |
| `getReport(id)` | getDoc | `reports/{id}` | `report-content.tsx` |
| `getReportByMonth(userId, month)` | Query | `reports` (userId + month) | `report-content.tsx` (load previous month for MoM) |
| `createReport(report)` | setDoc | `reports/{userId}_{month}` | **Not called from UI** (server route `/api/reports/generate`) |
| `deleteReport(id)` | deleteDoc | `reports/{id}` | `reports-content.tsx`, `report-content.tsx` |

---

## 5. Client-side utilities used as “data helpers” (no network)

| Module | File | Role | UI usage |
|--------|------|------|----------|
| `getPaidByOptions`, `getCategoryOptions`, `getSubcategoryOptions`, `getTagOptions` | `lib/utils.ts` | Derive select options from existing expense records (+ defaults) | `add-expense-dialog.tsx` |
| `exportToExcel`, `exportToPDF` | `lib/utils.ts` | Client-side file generation | `components/ui/data-table/data-table.tsx` |
| `generateReportPdf` | `lib/report-pdf.ts` | Client-side report PDF | `download-pdf-button.tsx` (dynamic import) |
| `buildReportMonthOptions` | `lib/report-month-utils.ts` | Month dropdown for report generation | `reports-content.tsx` |
| `deriveHighlights`, `needsWantsVerdict`, `compareReports`, `buildDayGrid`, `weekdayBreakdown` | `lib/report-insights.ts` | Pure analytics from loaded report | `report-content.tsx`, `download-pdf-button.tsx`, report sub-components |
| `loadStoredDateRange`, `storeDateRange`, `getDefaultDateRange` | `lib/dashboard-date-range-storage.ts` | localStorage persistence | `dashboard-content.tsx` |
| `formatCurrencyAmount`, `useFormattedCurrency` | `lib/currency-utils.ts` | Currency formatting hook | Many dashboard/report components |
| `fetchGeolocation` | `lib/geolocation-service.ts` | External fetch wrapper | `currency-context.tsx` |

---

## 6. Custom React hooks

| Hook | File | Type | Purpose |
|------|------|------|---------|
| `useIsMobile` | `hooks/use-is-mobile.ts` | UI | Responsive breakpoint (768px) |
| `useInView` | `hooks/use-in-view.ts` | UI | Intersection observer for scroll animations |
| `useCurrency` | `components/currency-context.tsx` | State | Currency symbol/name + updateCurrency |
| `useFormattedCurrency` | `lib/currency-utils.ts` | Presentation | Format numbers with active currency |

**No dedicated data-fetching hooks** (e.g. no `useExpenses`). Components call `expenseService` / `reportService` inside `useEffect` or event handlers.

---

## 7. Local / browser storage

| Key pattern | File | Purpose |
|-------------|------|---------|
| `dashboard-date-range:{userId}` | `lib/dashboard-date-range-storage.ts` | Persist dashboard date range |
| `lastAuthState` | `components/auth-toast.tsx` | Detect auth transitions for toasts |

---

## 8. Data flow diagrams

### Expense CRUD (typical)

```
UI component
  → expenseService.* (lib/expense-service.ts)
    → Firebase Firestore SDK (lib/firebase.ts)
      → collections: expenses, cashTransactions, users/{id}/categories
```

### Report generation

```
reports-content.tsx (user picks month)
  → generate-report-progress.tsx
    → fetch POST /api/reports/generate  ← only HTTP call for reports
      → (server) expenseService + reportService + ai-categorizer
  → redirect /reports/[reportId]
    → report-content.tsx
      → reportService.getReport / getReportByMonth (Firestore reads)
```

### Bulk upload (no API route)

```
bulk-upload-dialog.tsx (ExcelJS parse client-side)
  → dashboard-content.handleBulkUpload
    → Promise.all(expenseService.addExpense(...))  ← direct Firestore writes
```

---

## 9. Files index (API / data layer touched by UI)

| File | Role |
|------|------|
| `lib/expense-service.ts` | Expense + cash Firestore client |
| `lib/report-service.ts` | Report Firestore client |
| `lib/firebase.ts` | Firestore initialization |
| `lib/geolocation-service.ts` | External geolocation fetch |
| `lib/currency-utils.ts` | Currency formatting |
| `lib/dashboard-date-range-storage.ts` | localStorage date range |
| `lib/report-month-utils.ts` | Report month options |
| `lib/report-insights.ts` | Client-side report analytics |
| `lib/report-pdf.ts` | Client-side PDF generation |
| `lib/utils.ts` | Form option helpers + table export |
| `components/currency-context.tsx` | Currency state + Clerk metadata + geolocation |
| `hooks/use-is-mobile.ts` | UI hook |
| `hooks/use-in-view.ts` | UI hook |
| `app/(dashboard)/reports/generate-report-progress.tsx` | Calls `/api/reports/generate` |
