# AgalApp Roadmap

**Last Updated:** 2026-03-24
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
| (none) | | |

---

## 📋 Planned

### Phase 1: Foundation

| Feature | Description |
|---------|-------------|
| Truck Detail Redesign | Layout rework, action buttons, about section |
| Social Sharing | Share button, WhatsApp, Waze deep links |
| Schema Extensions | Add phone, description, social links to CoffeeTruck |
| Truck Form Updates | New fields for schema extensions |

### Phase 2: Core Features

| Feature | Description |
|---------|-------------|
| Favorites | Heart toggle, favorites page, optimistic UI |
| Menu Upload | PDF upload to Cloudinary, viewer |
| Enhanced Search | Combined filters sidebar, attribute checkboxes, "Open Now" toggle |
| Image Gallery Lightbox | Click to expand, keyboard navigation |

### Phase 3: Advanced

| Feature | Description |
|---------|-------------|
| Owner Story Section | Rich text story on truck page |
| Structured Menu Items | MenuItem model, CRUD, menu editor |
| Newsletter Signup | Subscriber model, signup component |
| Enhanced Map Page | Filter sidebar, marker clustering, "Near Me" |

### Phase 4: Polish & Deploy

| Feature | Description |
|---------|-------------|
| SEO & Meta | Dynamic meta tags, Open Graph, JSON-LD, sitemap |
| Loading States | Skeletons, Suspense boundaries |
| Error Handling | Error boundaries, 404 page, toast notifications |
| Accessibility | A11y audit, ARIA labels, contrast, keyboard nav |
| PWA | Manifest, app icons, service worker |
| Test DB Isolation | Separate test database for E2E, CI setup |
| Testing & Docs | Full flow testing, README update, demo video |
| Deployment | Production DB, Vercel deploy |

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
