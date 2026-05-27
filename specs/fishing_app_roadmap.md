# Fishing Log & Tackle Tracker — Project Roadmap

## Project Overview
A private fishing log with GPS spot tracking, a tackle inventory, and a lure recommendation engine — designed from the start to support brand sponsorships and affiliate monetization. Built as a resume project demonstrating Java Spring Boot, Kubernetes, PostgreSQL, and React Native.

Users log catches privately (species, weight, length, lure used, location), manage their tackle inventory, and receive lure recommendations based on aggregated catch data across the platform — without exposing individual spots or identities. The recommendation surface is monetization-aware: sponsored placements are part of the response contract from day one, even when the stub always returns `sponsored: false`.

---

## Tech Stack
- **Backend:** Java Spring Boot (one service per domain)
- **Database:** PostgreSQL
- **Orchestration:** Kubernetes via kind or minikube (local, free)
- **Mobile:** React Native with Expo
- **Auth:** JWT-based, handled in the User Service
- **Maps:** OpenStreetMap or free Mapbox tier
- **Recommendation Service:** Stubbed Spring Boot service now; swap in Python/FastAPI + ML model later

---

## Architecture

Five Spring Boot microservices, each in its own Kubernetes pod:

1. **API Gateway** — single entry point, routes all traffic to downstream services via Spring Cloud Gateway.
2. **User Service** — registration, login, JWT issuance and validation.
3. **Catch Service** — core domain. CRUD for catches; each catch records species, weight, length, date, time of day, weather notes, photo path, GPS spot reference, and lure used (foreign key to lure catalog or custom lure).
4. **Tackle Service** — manages the lure catalog (seeded, community entries) and custom lures a user has created (flagged `is_custom = true`, scoped to their account).
5. **Inventory Service** — manages each user's personal tackle inventory: which catalog lures they own and in what quantity (`user_inventory` table with `user_id`, `lure_id`, `quantity`). Inventory entries reference lure IDs from the catalog; the service does not duplicate lure metadata.
6. **Recommendation Service** — stubbed for now. Accepts a request (time of day, season, region) and returns lure suggestions: some from the user's inventory, some as suggested purchases. In the stub, responses are hardcoded or rule-based. The real ML model slots in here later without touching other services.

Each service owns its own PostgreSQL schema. A single Postgres StatefulSet in k8s is fine to start.

---

## Data Notes

**Lure Catalog** — a seeded table of known lures (name, type, brand, size, color family, purchase_url, sku). Include `purchase_url` and `sku` from the start — null for now, but these are the fields affiliate links and sponsored SKUs will populate later. Users pick from this when logging a catch or adding to their inventory. If a lure isn't in the catalog, they can add a custom entry via the Tackle Service (flagged `is_custom = true`, scoped to their account; custom lures are never eligible for sponsorship).

**User Inventory** — tracked in the `user_inventory` table: `user_id` (FK → users), `lure_id` (FK → lures), `quantity`. A unique constraint on `(user_id, lure_id)` enforces one row per lure per user; quantity represents how many of that lure the user owns. Managed entirely by the Inventory Service.

**Catch table additions vs. original design:**
- `lure_id` — FK to catalog lure or custom lure
- `time_of_day` — store as a timestamp; derive morning/afternoon/evening at query time
- No social fields (no public flag, no sharing, no follows)

**Recommendation response contract** — design this once and don't change it. Each returned lure recommendation should include at minimum: `lure_id`, `name`, `brand`, `type`, `source` (enum: `INVENTORY` | `SUGGESTED_PURCHASE` | `SPONSORED`), `sponsored` (boolean), `purchase_url` (nullable), and `disclosure_label` (nullable string — e.g. "Sponsored" or "Ad", required by FTC when `sponsored: true`). The stub always returns `sponsored: false` and null purchase URLs. When real sponsorships come in, only the data changes — the contract and the mobile UI don't need to touch.

**Aggregation for ML (future):** The Recommendation Service will query anonymized, aggregated catch data — e.g., "lure type X caught species Y most often in the 6–9am window in the Northeast in May." No user IDs, no spot coordinates leave the aggregation layer. Sponsors get aggregate reporting only ("your lure was recommended 400 times this month") — never individual user data.

---

## Build Roadmap

### Phase 1 — Local Docker (no Kubernetes yet)
Goal: get all services running and talking to each other before adding orchestration.

1. Set up PostgreSQL via Docker Compose
2. Scaffold User Service — registration, login, JWT
3. Scaffold Catch Service — full CRUD, JWT-protected; include `lure_id` and `time_of_day` from the start
4. Scaffold Tackle Service — lure catalog endpoints; custom lure creation/deletion
5. Scaffold Inventory Service — user inventory CRUD with quantity tracking (`user_inventory` table)
6. Scaffold Recommendation Service stub — hardcoded responses that match the real response contract
7. Scaffold API Gateway — route `/users/**`, `/catches/**`, `/tackle/**`, `/inventory/**`, `/recommendations/**`
8. Test all endpoints with Postman or Bruno

### Phase 2 — Kubernetes Locally (kind or minikube)
Goal: deploy all five services into a local cluster.

1. Write Dockerfiles for each Spring Boot service
2. Write k8s manifests: Deployment + Service for each app
3. Add a PostgreSQL StatefulSet
4. Use ConfigMaps for environment config, Secrets for DB credentials
5. Add an Ingress resource routing to the Gateway
6. Verify end-to-end in the cluster

### Phase 3 — React Native App (Expo)
Goal: build the mobile frontend against the working API.

1. Auth screens — register, login, store JWT in secure storage
2. Spots screen — map view showing saved spots, tap to view details
3. Log Catch screen — species, weight, length, time auto-filled, spot picker, lure picker (from inventory or catalog search), optional notes
4. Catch History screen — scrollable list of past catches
5. Tackle Inventory screen — view owned lures, add from catalog, add custom lure
6. Recommendations screen — shows "what to throw" based on current time/season; splits into "from your bag" and "consider buying"
7. Stats screen — biggest fish, most-used lure, most active month
8. Spot Conditions screen — from the Map tab, tapping a waterbody navigates to a conditions page. Pulls live weather from Open-Meteo (free, no API key) for the spot's coordinates. Indicators displayed as rounded-square cards, each with a speedometer/gauge showing fishing favorability (green = good, red = bad), not raw value. Indicators:
   - **Air temperature** — comfort window for active fish
   - **Water temperature** — estimated from recent air temp trend (Open-Meteo doesn't expose inland water temp directly)
   - **Barometric pressure** — falling pressure scores highest (most fishing-active)
   - **Wind speed** — moderate wind (5–12 mph) scores highest; calm and gale both score lower
   - **Cloud cover** — overcast scores higher than full sun
   - **Precipitation chance** — light recent rain scores higher than heavy or none
   - **Moon phase** — computed client-side from date; full/new moon score highest (solunar)

### Phase 4 — Polish & Deploy
Goal: make it portfolio-ready.

1. Input validation and proper error responses across all services
2. README with architecture diagram and setup instructions
3. Deploy to Railway, Fly.io, or Render (~$5–7/month, tear down after interviews)
4. Record a short demo video for your portfolio

### Phase 5 — ML Recommendation Engine (future)
Goal: replace the stub with a real model.

1. Stand up a Python/FastAPI service in a new k8s pod (swap out the stub)
2. Build an aggregation pipeline — anonymized catch data → feature table (lure type, species, time bucket, season, broad region)
3. Train an initial model (even a simple collaborative filter or gradient boost is fine to start)
4. Expose the same API contract the stub used — no other services need to change
5. Revisit privacy guarantees: k-anonymity minimums before a cohort influences recommendations

### Phase 6.5 — AI-Interpreted Conditions (Pro plan, future)
Goal: turn raw weather indicators into actionable fishing advice as a paid tier.

1. Spot Conditions today shows neutral raw scales (e.g., temp 0–100°F, pressure 28.5–30.5 inHg, etc.) — no interpretation
2. Pro tier: ship the indicator set + spot context (region, season, recent catch history at the spot) to an LLM and return tailored guidance — e.g., "pressure is dropping fast and water temp is 62°F — try slow-moving jigs near drop-offs in the next 2 hours"
3. Cache responses per-spot per-hour to keep API costs sane
4. Consider on-device small models later for offline use

### Phase 7 — Sponsorship & Monetization Infrastructure (future)
Goal: enable brand partnerships without changing the app architecture.

1. Add a `sponsored_placements` table to the Tackle Service schema — brand, lure_id, active dates, impression budget, purchase_url with affiliate params
2. Update the Recommendation Service to inject sponsored items into responses when a placement is active, respecting the existing `source: SPONSORED` and `disclosure_label` fields already in the contract
3. Build a minimal internal dashboard (simple web UI or just API endpoints) for placement management — activate/deactivate campaigns, view impression counts
4. Add aggregate reporting endpoints: impressions and recommendation events per lure, per time period — no user-level data, safe to share with brand partners
5. Review FTC compliance: `disclosure_label` must be visible in the mobile UI wherever `sponsored: true`

---

## Key Resume Talking Points
- Microservices design with a clean domain split (catch, tackle, recommendations as separate concerns)
- Stubbed service pattern — demonstrates thinking about contracts and future extensibility
- Monetization-aware API design — sponsorship contract built into the response schema from day one
- JWT authentication across a distributed system
- Kubernetes: deployments, services, ingress, configmaps, secrets
- PostgreSQL schema design, JPA/Hibernate with Spring Boot
- REST API design
- React Native with Expo
- Docker containerization
- Privacy-aware data aggregation — aggregate-only sponsor reporting, k-anonymity on ML cohorts

---

## Dev Notes
- No social features — catches are always private, spots never leave the user's account
- All dev and testing is free/local; cloud deploy only at the end of Phase 4
- MySQL background transfers well to Postgres; main gotchas: `SERIAL` vs `AUTO_INCREMENT`, native `BOOLEAN`, stricter type coercion
- Start Phase 1 before touching Kubernetes — get the logic right first
