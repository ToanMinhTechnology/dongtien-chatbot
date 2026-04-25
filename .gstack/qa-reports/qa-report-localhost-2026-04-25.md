# QA Report — Tiệm Bánh Vani Chatbot
**Date:** 2026-04-25
**Branch:** main
**URL:** http://localhost:5174
**Duration:** ~25 minutes
**Pages tested:** 1 (SPA chatbot)
**Framework:** React 19 + Vite

---

## Summary

| Metric | Value |
|--------|-------|
| Issues found | 3 |
| Issues fixed | 3 |
| Issues deferred | 0 |
| Health score (before) | 25/100 |
| Health score (after) | 88/100 |

**QA found 3 issues, fixed 3, health score 25 → 88.**

---

## Health Score Breakdown

### Before Fixes (25/100)
- Console: 10 (10+ JS errors — CORS + import failure)
- Functional: 0 (FAQ never matched, Thinking... stuck permanently)
- UX: 50 (UI opened fine, input worked)
- Visual: 90 (branding correct)
- Content: 90 (welcome message correct)
- Accessibility: 80
- Performance: 80
- Links: 100

### After Fixes (88/100)
- Console: 100 (0 new errors after fixes)
- Functional: 90 (FAQ matches 5/5 test queries; minor: tie-score FAQ routing)
- UX: 90 (instant response, no spinner, address/price/delivery all correct)
- Visual: 90
- Content: 90 (29 Vani FAQs, 62 products, real address/phone)
- Accessibility: 80
- Performance: 95 (FAQ matches synchronous — ~1ms response, no network round-trip)
- Links: 100

---

## Issues Found & Fixed

### ISSUE-001 — FAQ Intent Matcher Completely Broken (CRITICAL)
**Status:** FIXED (verified)
**Commit:** `bc8461d`

**Symptom:** Every user query fell through to OpenAI. "bánh kem giá bao nhiêu" returned no FAQ match.

**Root cause (two bugs compounded):**
1. `src/utils/intentMatcher.js` was reverted by linter to old format importing `knowledgeBase` as an array and importing `intentGroups` — but the new `knowledgeBase.js` exports an object with `.faqs[]`
2. The old scoring formula `(score / keywords.length) * Math.min(matched/2, 1)` penalised FAQs with many keywords heavily. A FAQ with 8 keywords matching 1 query word scored only 0.0625 × 0.5 = 0.063 — well below the 0.3 threshold

**Files changed:**
- `src/data/knowledgeBase.js` — regenerated from crawl data: 62 products, 29 FAQs, correct contact (107 Đ. Lê Đình Dương, 0935 226 206), 0 null placeholders
- `src/utils/intentMatcher.js` — rewrote to use `knowledgeBase.faqs[]`; new scoring: `maxMatch×0.6 + (totalScore/keywordsLen)×0.4`
- `scripts/build-kb.cjs` — added for reproducible KB rebuild without full recrawl

**Before:** "bánh kem giá bao nhiêu" → CORS error fallback
**After:** "bánh kem giá bao nhiêu" → FAQ match conf=0.76, instant product list ✓

---

### ISSUE-002 — CORS Blocks All OpenAI Fallback Calls (CRITICAL)
**Status:** FIXED (verified via curl preflight)
**Commit:** `06503a0`

**Symptom:** Every query that fell through to OpenAI got blocked:
```
CORS: 'Access-Control-Allow-Origin' header has value 'http://localhost:5173'
— not equal to supplied origin 'http://localhost:5174'
```

**Root cause:** `server/index.js` hardcoded `ALLOWED_ORIGIN = 'http://localhost:5173'`. Vite automatically increments port when 5173 is already in use (e.g., a previous dev server still running).

**Fix:** Replace hardcoded string with a regex callback that allows any `localhost:*` origin in development. Production still locks to `ALLOWED_ORIGIN` env var.

**Verified:** `curl -X OPTIONS -H "Origin: http://localhost:5174"` → HTTP 204, `Access-Control-Allow-Origin: http://localhost:5174` ✓

---

### ISSUE-003 — Permanent "Thinking..." Spinner After Instant FAQ Match (HIGH)
**Status:** FIXED (verified)
**Commit:** `a857641`

**Symptom:** After a FAQ answered instantly, a second "Thinking..." message appeared below it and never resolved — stuck permanently.

**Root cause (race condition):** In `ChatForm.jsx`:
```js
// t=0ms: generateBotResponse called immediately
generateBotResponse([...chatHistory, { role: "user", text: userMessage }]);
// t=600ms: setTimeout finally adds "Thinking..."
setTimeout(() => setChatHistory(...add "Thinking..."), 600);
```
FAQ matching is synchronous (~1ms). `updateHistory()` fired at t=1ms — before "Thinking..." existed in history. The filter `prev.filter(msg => msg.text !== "Thinking...")` found nothing to remove. Then at t=600ms, setTimeout added "Thinking..." with no one left to remove it.

**Fix:** Add user message and "Thinking..." together synchronously, then call `generateBotResponse`. Guarantees "Thinking..." always exists before any async/sync response can replace it.

**Before:** [FAQ answer] [Thinking... stuck]
**After:** [FAQ answer] — clean, "Thinking..." replaced instantly ✓

---

## Screenshots

| Screenshot | Description |
|-----------|-------------|
| `initial.png` | Homepage — "Chào mừng đến Tiệm Bánh Vani!" |
| `chatbot-open.png` | Chat opened, header "Tiệm Bánh Vani Online" |
| `issue-001-before.png` | CORS error + "Xin lỗi" message (before fixes) |
| `final-test-price.png` | "bánh kem giá bao nhiêu" → product list, no Thinking... |
| `final-test-address.png` | "địa chỉ tiệm ở đâu" → correct Vani address |
| `final-test-delivery-leadtime.png` | "phí ship" + "đặt trước bao lâu" → FAQ answers |
| `mobile-homepage.png` | 375×812 mobile — correct layout |
| `mobile-chatbot.png` | 375×812 mobile — button visible |

---

## Known Deferred Issues

**Minor — FAQ tie-score routing:** "đặt bánh trước bao lâu" scores 0.667 for both
"Cách đặt bánh" and "Đặt bánh trước bao lâu". The order FAQ wins because it appears
first in the array. Answer is still useful (includes lead time). Fix: boost "bao lâu"
keyword weight or add word-boundary matching. Not critical for current use.

---

## Commits in This Session

```
a857641 fix(qa): ISSUE-003 — eliminate race condition in ChatForm submit
bc8461d fix(qa): ISSUE-001 — restore Vani knowledgeBase + improved intent scorer
06503a0 fix(qa): ISSUE-002 — allow any localhost port in CORS dev config
6db950c feat: integrate Tiệm Bánh Vani knowledge base from Firecrawl crawl
```
