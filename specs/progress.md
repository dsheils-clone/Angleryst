# Angleryst — Build Progress

## Current Status: Phase 3 (React Native) — Feature-complete, pre-polish

---

## Phase 1 — Backend Services ✅
All 6 Spring Boot services implemented and verified via Postman/Bruno:
- **api-gateway** — Spring Cloud Gateway routing all domains; CORS configured
- **user-service** — register/login/JWT issuance and validation
- **catch-service** — full CRUD; extended with Location entity (LocationController, `GET /locations?limit=`)
- **tackle-service** — lure catalog (seeded), custom lures, catalog search
- **inventory-service** — per-user lure inventory with quantity tracking
- **recommendation-service** — stub returning hardcoded responses matching the real contract (source, sponsored, purchase_url, disclosure_label)

DB seeded with: 8 species, lure catalog entries, 5 MA water bodies with lat/lon and town.

---

## Phase 2 — Kubernetes ✅
All services containerized and running in a local minikube cluster:
- Dockerfiles for all 6 services
- k8s manifests: Deployment + Service per app
- PostgreSQL StatefulSet
- ConfigMaps (env config), Secrets (DB credentials, JWT secret)
- Ingress routing to API Gateway

---

## Phase 3 — React Native (Expo) 🔄 In Progress

### Completed screens
| Screen | Notes |
|---|---|
| LoginScreen | JWT stored in expo-secure-store (localStorage fallback for web) |
| RegisterScreen | Navigates to login on success |
| CatchHistoryScreen | List with edit (✏) and delete (✕); optimistic delete with rollback |
| LogCatchScreen | Species chip grid, weight/length/date inputs, spot & lure pickers; edit mode pre-populates from route params |
| SpotPickerScreen | Fetches spots from API |
| LurePickerScreen | Searches catalog + custom lures |
| SpotsScreen | Fetches top 5 spots from DB; web fallback list view (react-native-maps lazy-loaded) |
| SpotDetailScreen | Shows user's own catches at this spot (JWT-scoped, no spot burning) |
| SpotRecsScreen | Recommendation service call with spot region |
| SpotConditionsScreen | 7 weather cards (animated gauge bars) + Bite Guide quadrant plot |
| InventoryScreen | Merged catalog+custom names; +/- qty; confirm-delete |
| CatalogSearchScreen | Browse/search catalog lures |
| AddCustomLureScreen | Create custom lure form |
| RecommendationsScreen | Time/season-based recs |
| StatsScreen | Biggest fish, most-used lure (resolved name), most active month |

### Completed infrastructure
- AuthContext pattern for auth gate (avoids navigation.reset issues on web)
- `notify()` / `confirm()` helpers (Alert.alert is no-op on web)
- Open-Meteo integration: current weather + 72h hourly pressure history + geocoding API
- In-memory town geocode cache
- 3h and 6h pressure deltas computed from hourly data (no extra API call)
- `computeBiteGuide()` weighted algorithm in `favorability.ts`

### Known limitations / not yet done
- No real GPS integration for catch logging (date is manual; location picked from saved list)
- react-native-maps only loads on native; web shows list fallback
- No photo capture / photo field on catches
- No offline mode
- No logout button (JWT clears if app storage is reset)

---

## Phase 4 — Polish & Deploy (next)
- Input validation and proper error responses across all services
- README with architecture diagram
- Deploy to Railway / Fly.io / Render (~$5–7/month, tear down after interviews)
- Demo video for portfolio

---

## Future Phases (planned)
| Phase | Description |
|---|---|
| 5 | ML recommendation engine (Python/FastAPI replacing stub) |
| 6.5 | AI-interpreted conditions (LLM-powered pro tier — ship indicator set + context to Claude, return tailored fishing advice; cache per spot per hour) |
| 7 | Sponsorship & monetization infrastructure (sponsored_placements table, affiliate links, FTC disclosure) |
