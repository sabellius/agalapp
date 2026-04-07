# AgalApp Roadmap

**Last Updated:** 2026-04-06
**Project:** Hebrew (RTL) coffee cart review platform
**Goal:** Portfolio project with balanced UX/UI and backend features

---

## ✅ Done

| Feature | Completed | Notes |
|---------|-----------|-------|
| Authentication (better-auth, roles) | 2026-02 | USER, TRUCK_OWNER, ADMIN |
| Truck CRUD (create, edit, delete) | 2026-02 | Server Actions, Prisma |
| Image Upload (Cloudinary) | 2026-02 | Multi-image with primary |
| Reviews (star ratings, text) | 2026-02 | One per user per truck |
| Review Votes (Helpful) | 2026-03 | Toggle functionality |
| Search & Filtering | 2026-02 | Text, city, rating |
| Map Integration (Leaflet) | 2026-02 | Geocoding via Nominatim |
| User Tiers/Subscription | 2026-03-07 | Account-level, 30-day premium |
| Subscription Management Page | 2026-03-07 | /subscription |
| Premium Features (hours, menu) | 2026-03-07 | Gated by tier |
| Magic Numbers → Named Constants | 2026-03-14 | All domain values extracted |
| Navigation Header | 2026-02 | Mobile drawer, responsive |
| Homepage Hero | 2026-03-24 | Hero section + search component |
| Homepage Content | 2026-03-24 | Popular, regions, recent sections + E2E tests |
| Truck Card Enhancement | 2026-03-24 | Open now badge, 5-star rating, hover effects |

---

## 🔄 In Progress

| Feature | Status | Notes |
|---------|--------|-------|
| **Portfolio Polish Sprint** | 🚧 Active | Full codebase audit → `tasks/portfolio-polish.md` |

### Portfolio Polish Sprint Breakdown

#### Phase 0: Critical Fixes (Security & Architecture)

- [ ] Create `app/(protected)/layout.tsx` with server-side auth guard (fixes unprotected `/trucks/new`)
- [ ] Add Zod schemas for `setTruckAttributes`, `addTruckAttribute`, `removeTruckAttribute`
- [ ] Fix admin access in `attributes.ts` and `truck-hours.ts` (use `canModifyTruck()` instead of inline checks)
- [ ] Fix nested `<Link>/<Button>` in `truck-preview.tsx` (invalid HTML, a11y)

#### Phase 1: Architecture Refactoring (Design Patterns)

- [ ] Extract `withAuth()` HOF + `safeAction()` wrapper, update all server actions
- [ ] Deduplicate city list — single source of truth in `validations/common.ts`, remove `lib/constants.ts` CITIES
- [ ] Extract `calculateAverageRating()` utility (replace duplication in 3 files)
- [ ] Extract `NavLink` from `SiteHeader` render body
- [ ] Convert `/dashboard` from client component to server component
- [ ] Add missing `ZodError` catch in `setTruckHours`

#### Phase 2: Next.js Best Practices & UI/UX Polish

- [ ] Add `app/loading.tsx` (global skeleton)
- [ ] Add `app/trucks/loading.tsx` and `app/trucks/[id]/loading.tsx`
- [ ] Add `app/error.tsx` (global error boundary)
- [ ] Add `app/not-found.tsx` (branded 404)
- [ ] Add `generateMetadata` to `/trucks/[id]`, static metadata to `/trucks` and `/trucks/map`
- [ ] Replace hardcoded colors with semantic tokens (`text-red-500` → `text-destructive`, etc.)
- [ ] Use `cn()` instead of template literal concatenation in all components
- [ ] Replace native `<select>`/`<textarea>` with shadcn components in truck form
- [ ] Add `aria-label` to all icon-only buttons (avatar dropdown, vote, image actions)
- [ ] Add keyboard support to interactive star rating
- [ ] Link error messages to form fields via `aria-describedby` + `aria-invalid`
- [ ] Add confirmation dialogs for delete truck and delete review
- [ ] Add empty states for "no trucks found", "no reviews yet"
- [ ] Fix `window.location.reload()` → `router.refresh()` in review-actions
- [ ] Add `<link rel="preconnect">` for Cloudinary CDN in layout.tsx

---

## 📋 Planned

### Phase 1: Foundation & Polish

| Feature | Description |
|---------|-------------|
| Truck Detail Redesign | Layout rework, action buttons, about section |
| Social Sharing | Share button, WhatsApp, Waze deep links |
| Schema Extensions | Add phone, description, social links to CoffeeTruck |
| Truck Form Updates | New fields for schema extensions |
| Extended Attributes | 11 new attributes: wifi, toilets, parking, playground, shelter, AC, kosher, open-saturday, open-friday, protected-room |

### Phase 2: Core Features

| Feature | Description |
|---------|-------------|
| Favorites | Heart toggle, favorites page, optimistic UI |
| Structured Menu Items | MenuItem model, CRUD, menu editor, dietary tags (gluten-free, vegan) |
| Enhanced Search | Combined filters sidebar, attribute checkboxes, "Open Now" toggle |
| Image Gallery Lightbox | Click to expand, keyboard navigation |
| Near Me | Geolocation-based truck search |
| "For Kids" Section | Rich content section on truck page |

### Phase 3: User Experience

| Feature | Description |
|---------|-------------|
| Review Photos | Users upload photos with reviews |
| Owner Review Responses | Owners can reply to reviews |
| User Profile Page | Show user's reviews + favorites |
| Review Sorting | Sort by helpful, date, rating |
| Enhanced Map Page | Filter sidebar, marker clustering |

### Phase 4: Deploy

| Feature | Description |
|---------|-------------|
| Test DB Isolation | Separate test database for E2E, CI setup |
| Testing & Docs | Full flow testing, README update, demo video |
| Deployment | Production DB, Vercel deploy |

> **Note:** SEO, Loading States, Error Handling, and Accessibility were originally in Phase 4 but are now part of the Portfolio Polish Sprint above.

---

## ✂️ Trimmed (Audit Findings — Low Portfolio Impact)

Identified during codebase audit but deprioritized. Kept for reference if we revisit.

| Item | Why Trimmed |
|------|-------------|
| `prisma.$transaction` wrapping for multi-step mutations | Invisible in demo, requires failure mid-operation to notice |
| `deleteTruck` Cloudinary image cleanup | Orphaned images don't show in UI |
| Race condition fix in vote counting | Requires concurrent requests to trigger |
| Add `ownerId` index to CoffeeTruck schema | DB perf micro-detail, undetectable |
| `createMany` vs sequential creates in `setTruckHours` | Perf micro-optimization |
| Geocoding cache/rate-limiting | Won't hit limits in a demo |
| Cloudinary signing endpoint auth | Security deep cut, invisible |
| `as unknown as` double cast in `getTruckHours` | Type safety purity, buried in code |
| Barrel export for `truck-hours-schema` in index.ts | Trivial import path detail |
| `prefers-reduced-motion` support | A11y deep cut for a coffee cart app |
| Unsaved changes warning on truck form | Nice-to-have, not a differentiator |
| Move inline `downgradeAccount` to actions file | Convention purity, invisible |
| `console.error` message style standardization | Cosmetic logging detail |
| `getTruckAssignedAttributes` `include` vs `select` | Perf micro-detail |
| `truckFiltersSchema` hardcoded limits → use constants | Minor DRY issue |
| Merge duplicated `imageSchema`/`truckImageSchema` | Subtle schema detail |
| Redundant null check filter in map page | Doesn't affect behavior |
| Remove unnecessary `"use client"` from `feature-lock.tsx` | Bundle micro-detail |
| Remove redundant `truck-map-client.tsx` wrapper | Dead code, buried |

---

## Nice-to-Have (Post-MVP)

| Feature | Description | Effort |
|---------|-------------|--------|
| Dark Mode | Theme toggle, CSS variables | Low |
| Social Login | Google OAuth via better-auth | Medium |
| Email Notifications | Review reminders, updates | Medium |
| Owner Analytics Dashboard | Views, clicks, review stats | Medium |
| Trending Trucks | Algorithm based on recent activity | Low |
| Map Clustering | Marker grouping at zoom levels | Medium |

---

## Known Issues

| ID | Issue | File | Status |
|----|-------|------|--------|
| BUG-001 | `setPrimaryImage` tests fail — missing `$transaction` mock | `app/actions/images.test.ts` | Open |
| LINT-001 | Unused `auth` import | `app/actions/truck-hours.test.ts` | Open |

---

## Skipped (Not Portfolio-Worthy)

| Feature | Why Skip |
|---------|----------|
| Real payment integration | Mock is sufficient |
| Rate limiting | Not visible |
| Report/flag system | Admin moderation, boring |
| View tracking/analytics | Hidden feature |
| Cities reference table | Over-engineering |
| Menu PDF Upload | Structured menu items are better |
| Newsletter Signup | Boring, not portfolio-worthy |
| PWA | Overkill for portfolio |
| Owner Story Section | Not essential |
