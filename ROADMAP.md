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

---

## 🔄 In Progress

### Sprint 1: Homepage Redesign - Part 1
**Focus:** Hero section & search component

- [x] Create hero section with background gradient/pattern
- [x] Add hero text: headline + subheadline in Hebrew
- [x] Create centered search component (name input + city dropdown)
- [x] Style with Tailwind - clean, modern look

**Files:** `components/home/hero-section.tsx`, `components/home/search-hero.tsx`, `app/page.tsx`

---

## 📋 Planned

### Phase 1: Foundation & Visual Polish

#### Sprint 2: Homepage Redesign - Part 2
- [ ] "Popular Trucks" section (top 4-6 by review count)
- [ ] "Browse by Region" cards
- [ ] "Recently Added" section
- [ ] Section headings with consistent styling

#### Sprint 3: Truck Card Enhancement
- [ ] Add "Open Now" badge (real-time)
- [ ] Add average rating display with star icon
- [ ] Add review count
- [ ] Improve image handling (placeholder)
- [ ] Hover effects and transitions

#### Sprint 4: Truck Detail Page - Layout Rework
- [ ] Redesign header section
- [ ] Create action buttons row (call, navigate, share)
- [ ] Move reviews to dedicated section
- [ ] Add "About" section

#### Sprint 5: Truck Detail Page - New Sections
- [ ] Social links section (Instagram, Facebook, TikTok)
- [ ] Gallery section (expandable lightbox)
- [ ] Map section improvements
- [ ] Owner info section

#### Sprint 6: Social Sharing & Contact
- [ ] Share button (copy link + Web Share API)
- [ ] WhatsApp contact link
- [ ] Waze navigation deep link
- [ ] "Copy link" toast notification

#### Sprint 7: Database Schema Additions
- [ ] Add `description` (Text) to CoffeeTruck
- [ ] Add `phone` (String?) to CoffeeTruck
- [ ] Add `instagram`, `facebook`, `tiktok` fields
- [ ] Create and run migration
- [ ] Update seed data

#### Sprint 8: Truck Form Updates
- [ ] Add description textarea
- [ ] Add phone input field
- [ ] Add social links inputs
- [ ] Update validation schema
- [ ] Update Server Actions

### Phase 2: Core Feature Expansion

#### Sprint 9: Favorites - Database & Backend
- [ ] Create `UserFavorite` model in Prisma
- [ ] Run migration
- [ ] Create `toggleFavorite` Server Action
- [ ] Create `getUserFavorites` Server Action

#### Sprint 10: Favorites - UI Components
- [ ] Heart button component (animated)
- [ ] Add to truck cards
- [ ] Add to truck detail page
- [ ] Optimistic UI updates

#### Sprint 11: Favorites - Favorites Page
- [ ] Create `/favorites` page
- [ ] List user's favorite trucks
- [ ] Empty state
- [ ] Remove from favorites

#### Sprint 12: Truck Menu Upload - Backend
- [ ] Add `menuUrl` field to CoffeeTruck
- [ ] Create menu upload handler (Cloudinary PDF)
- [ ] Update validation schema
- [ ] Run migration

#### Sprint 13: Truck Menu - UI
- [ ] Menu upload in truck form
- [ ] "View Menu" button on truck detail
- [ ] PDF viewer modal or new tab
- [ ] Menu badge on truck cards

#### Sprint 14: Enhanced Attributes System
- [ ] Review and expand seed attributes
- [ ] Add icons to existing attributes
- [ ] Create attribute filter component
- [ ] Filter trucks by multiple attributes

#### Sprint 15: Improved Search Experience
- [ ] Combine all filters into sidebar/panel
- [ ] Add "Open Now" filter toggle
- [ ] Add attribute checkboxes
- [ ] URL-based filter state
- [ ] Clear all filters button

### Phase 3: Advanced Features

#### Sprint 16: Truck Owner Story Section
- [ ] Add `ownerStory` (Text) to CoffeeTruck
- [ ] Rich text display on truck page
- [ ] Story section with typography
- [ ] Edit in truck form

#### Sprint 17: Image Gallery with Lightbox
- [ ] Install or create lightbox component
- [ ] Click to expand images
- [ ] Navigate between images
- [ ] Keyboard navigation

#### Sprint 18: Structured Menu Items (Optional)
- [ ] Create `MenuItem` model
- [ ] Menu items CRUD Server Actions
- [ ] Menu section on truck detail
- [ ] Menu item editor in truck form

#### Sprint 19: Newsletter Signup
- [ ] Newsletter signup component
- [ ] Create `NewsletterSubscriber` model
- [ ] Subscribe Server Action
- [ ] Success/error feedback

#### Sprint 20: Enhanced Map Page
- [ ] Filter sidebar on map page
- [ ] Marker clustering
- [ ] Click marker for quick preview
- [ ] "Near Me" button (geolocation)

### Phase 4: Polish & Deployment

#### Sprint 21: SEO & Meta Tags
- [ ] Dynamic meta tags per page
- [ ] Open Graph images
- [ ] Structured data (JSON-LD)
- [ ] Sitemap generation

#### Sprint 22: Loading States & Skeletons
- [ ] Skeleton component for truck cards
- [ ] Skeleton for truck detail page
- [ ] Loading.tsx files
- [ ] Suspense boundaries

#### Sprint 23: Error Handling
- [ ] Error boundary component
- [ ] error.tsx files for routes
- [ ] 404 page redesign
- [ ] Toast notifications for errors

#### Sprint 24: Accessibility Audit
- [ ] Run Lighthouse accessibility audit
- [ ] Fix color contrast issues
- [ ] Add ARIA labels
- [ ] Keyboard navigation check
- [ ] Focus indicators

#### Sprint 25: PWA Setup
- [ ] Create manifest.json
- [ ] Add app icons
- [ ] Service worker for offline
- [ ] "Add to Home Screen" prompt

#### Sprint 26: Final Polish & Testing
- [ ] Full user flow testing
- [ ] Mobile responsiveness check
- [ ] Fix TypeScript errors
- [ ] Update tests for new features
- [ ] Code cleanup

#### Sprint 27: Documentation
- [ ] Update README with features
- [ ] Add screenshots
- [ ] Document environment variables
- [ ] Create demo video walkthrough

#### Sprint 28: Deployment
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test deployed version

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

---

_Schedule: Weekday sprints ~2-3hrs, Weekend sprints ~4-6hrs_
