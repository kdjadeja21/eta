# ETA Frontend Stack (verified from repo)

**Source:** `package.json`, `app/` layout, `tsconfig.json`, `tailwind.config.js`

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.x |
| UI library | React 19 |
| Styling | Tailwind CSS 4, `tw-animate-css` |
| Component primitives | Radix UI (via shadcn/ui pattern), `components/ui/*` |
| Auth | Clerk (`@clerk/nextjs`) |
| Database (client) | Firebase Firestore (`firebase` SDK, `lib/firebase.ts`) |
| Forms | react-hook-form + zod |
| Tables | @tanstack/react-table |
| Charts | recharts |
| Toasts | sonner |
| Theme | next-themes (dark default) |
| Excel import | exceljs (client-side parse in bulk upload) |
| PDF export | jspdf + jspdf-autotable (report PDF, table PDF export) |
| Fonts | Geist Sans / Geist Mono (`next/font`) |

**Routing:** Next.js file-based routes under `app/`. Auth middleware in `proxy.ts` (Clerk).

**Not used in UI data layer:** React Query, SWR, axios. Data is fetched via direct service calls in `useEffect` handlers and event callbacks.
