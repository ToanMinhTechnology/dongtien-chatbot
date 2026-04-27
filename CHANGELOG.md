# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
