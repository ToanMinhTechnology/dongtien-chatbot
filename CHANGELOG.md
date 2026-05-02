# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.0] - 2026-05-01

### Added
- **Semantic product search via RAG** (`server/services/embeddingService.js`): OpenAI `text-embedding-3-small` embeddings for all 20 DOTICOM products with cosine-similarity retrieval; pre-computed index committed to `data/embeddings.json` for fast cold starts (~50 ms vs ~800 ms API call).
- **Email order notifications** (`server/services/emailService.js`): fire-and-forget Resend email sent to staff after every confirmed order; silently no-ops when `RESEND_API_KEY` is unset.
- **Embedding index build script** (`scripts/build-embedding-index.js`): regenerates `data/embeddings.json` against live API; run with `npm run build:embeddings`.
- **Test coverage for RAG and email**: `embeddingService.test.js` (pure functions + `searchSimilar` with mocked OpenAI/fs) and `emailService.test.js` (8 branch-covering tests for `sendOrderNotification`).

### Changed
- `api/chat.js` and `server/routes/chat.js`: context builder now calls `searchSimilar()` (vector search) instead of the old keyword-based `buildContext()`.
- `api/order.js`: calls `sendOrderNotification()` fire-and-forget after order confirmation.
- `src/data/cakeDatabase.js`: trimmed from 22 to 20 products (removed two duplicates).

### Infrastructure
- `data/embeddings.json` unignored in `.gitignore` and committed — Vercel reads this at startup to avoid per-request embedding API calls.

## [0.1.0] - 2026-04-28

### Added
- **Order evaluation engine** (`server/services/orderEngine.js`): full Sprint 2 business logic in one testable module — cake classification, kitchen shift calculation, Google Maps distance lookup, and shipping fee calculation.
- **Cake database** (`src/data/cakeDatabase.js`): 22 real DOTICOM products with availability classification (`in-store` / `factory`), prices, and scored keyword search via `searchCakes()`.
- **Shipping matrix** (`src/data/shippingMatrix.js`): 6-case fee table per DOTICOM business rules — freeship under 5km, graduated 15k/25k fees up to 10km, 2M+ threshold for 10–20km, reject beyond 20km.
- **Delivery window calculation**: Ca 1 (08:00–11:30) and Ca 2 (12:30–17:00) shift routing based on order time in VN timezone (UTC+7). Boundary: orders at 08:30 exact route to Ca 2.
- **Google Maps Distance Matrix integration**: `getDistanceKm()` queries all store origins and returns the nearest distance. No-key and API failure paths fall back to manual shipping confirmation by staff.
- **Order rejection**: orders beyond 20km, or 10–20km with order value under 2M VND, now return HTTP 400 with a clear Vietnamese error message before the order is recorded.
- **`/api/order` response enriched**: 201 responses now include `estimate.cakeType`, `estimate.deliveryWindow`, and `estimate.shipping` so the frontend can display delivery and fee information.

### Changed
- `server/routes/order.js`: now calls `evaluateOrder()` after validation; logs include cake type and delivery window.
- `api/order.js` (Vercel): same enrichment as the Express route — unified behavior between local and serverless deployments.

## [0.0.0] - 2026-04-27

Initial release — Phase 1 chatbot with FAQ routing, order form, and basic validation.
