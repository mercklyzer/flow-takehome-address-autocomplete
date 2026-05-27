# Flow — Address Autocomplete Take-Home

Welcome, and thanks for taking the time. This is the final step in our process — a self-contained build that mirrors how we'd work together at Flow (async, via GitHub, with clear specs).

**Estimated time: 1–2 hours.**

---

## Setup

This repo is pre-scaffolded with Next.js 15, React 19, TypeScript, Tailwind 4, and Vitest — the same versions we use at Flow. You shouldn't need to touch the toolchain.

Requires Node 18.20.8 (see `.tool-versions` — works with `asdf`, `mise`, or `nvm`).

```bash
npm install
cp .env.example .env.local
# add your Google Places API key to .env.local

npm run dev          # http://localhost:3000
npm test             # run vitest once
npm run test:watch   # vitest in watch mode
```

You'll need a Google Places API key — grab one at https://console.cloud.google.com/apis/credentials. The free tier is plenty.

---

## Context (why we're building this)

At Flow we sell a wellness product, and customers go through a checkout flow that captures a shipping address. Today they type the address manually, and a non-trivial share of orders come in with typos, wrong zip codes, or city/state mismatches that our team has to clean up before fulfillment. We also lose some carts to friction at this step.

We want to add **address autocomplete** to the checkout form to reduce both problems.

Constraints worth knowing up front:

- We currently ship to **US addresses only**.
- We need to **support PO Boxes** (most autocomplete services don't surface these well — the form needs to gracefully accept manual PO Box entry).
- We'll likely support **international addresses** in the future. You don't need to implement this, but the design shouldn't preclude it.

---

## What to build

A working address form (`app/page.tsx`) with the following behavior:

1. The **street address** input is autocomplete-enabled: as the user types, US address suggestions appear.
2. On selecting a suggestion, the rest of the form fields (line 1, city, state, zip) populate automatically.
3. **Manual entry** is supported — for PO Boxes or any address the autocomplete doesn't find, the user can fill the form fields directly.
4. Handle the obvious edges: no results, API error, slow network, mobile-friendly.
5. Include a small test for the address-parsing logic in `lib/places.test.ts` — happy path + one edge case (e.g., missing `postal_code`). Vitest is already wired up.

Use **Google Places API** (or another provider if you have a strong preference — note your choice in the README). Either approach is fine:

- **Client-side** (Google's Places JS library) — simpler, standard, but the API key is exposed to the browser (restrict by referrer in the GCP console).
- **Server-side** via a Next.js API route as a proxy — key stays on the server, more secure, slightly more code.

Pick the one that fits the time budget and explain your reasoning in the Notes section below.

The scaffolded form in `app/page.tsx` and the stub in `lib/places.ts` are a starting point — you don't have to use them as-is. Restructure freely.

---

## Submission

When you're done:

1. Push your work to a public GitHub repo (or share a zip).
2. Update the **Notes** section at the bottom of this README with: your design decisions, anything you intentionally skipped (and why), and how long it actually took.
3. Reply to the email thread with the repo link.

---

## What we're evaluating

- It works (clone, install, set API key, run, try it end to end)
- Code is clean, properly typed, idiomatic Next/React
- README notes are clear and honest about trade-offs
- Edge case handling matches the constraints above
- Test exists, runs, and covers what's claimed
- Commit history is reasonable (atomic, descriptive — not one giant "init" commit)

---

## Time

~1–2 hours. If you find yourself going much beyond that, ship what you have and note the trade-offs — we'd rather see your judgment on what to cut than see you grind on polish.

---

## Project structure

```
app/
  globals.css        # Tailwind import
  layout.tsx         # Root layout
  page.tsx           # The address form (placeholder — wire this up)
lib/
  places.ts          # Google Places client + address parser (stub — implement)
  places.test.ts     # Tests for the parser (todos — fill in)
```

---

## Notes

### Design decisions

I chose a **client-side** integration (Google Places JS library loaded directly in the browser) over a server-side proxy, primarily to stay within the time budget. That said, for a production build I would recommend the server-side approach for two reasons:

1. **API key security** — a server-side proxy keeps the key out of the browser entirely, so it can't be scraped from client bundles or network requests.
2. **Abuse prevention** — with the key on the server we can enforce rate limiting and authenticate callers before any quota is consumed, which matters since the Places API is not free.

The client-side approach is acceptable here because GCP allows referrer restrictions on API keys, which provides a reasonable mitigation.

**PO Box support** — the form handles PO Boxes through graceful manual entry. The autocomplete query is restricted to US street addresses, so a PO Box typically won't appear in suggestions; the user simply types it directly and all fields remain fully editable. No special-casing is needed.

**International extensibility** — the current implementation scopes suggestions to `country: "us"` and parses `address_components` against a US schema (street number, route, locality, administrative_area_level_1, postal_code). Extending to international addresses would require: (1) removing or parameterising the country restriction, and (2) making the parser aware that component availability and naming conventions vary by country (e.g. no postal_code in some regions, different locality hierarchies).

### What I skipped and why

| Item | Reason |
|------|--------|
| **Debounce on the street-address input** | Would reduce Places API calls on every keystroke; straightforward to add with a small `useDebounce` hook but cut for time. |
| **End-to-end tests for unhappy paths** | No tests cover API errors, slow networks, or zero-result states. These should be covered before shipping. |
| **Loading states** | The autocomplete input has no spinner or in-progress indicator while the Places API resolves suggestions. Adding a small loading indicator would improve perceived performance on slow connections, but was cut for time. |
| **Cross-checking Places API field names** | The `address_components` type mapping was inferred from the SDK types rather than verified against the latest Places API docs — worth a review pass. |

### Actual time spent

~2 hours (excludes README write-up and submission).

### Things I'd want to discuss in a review

- **Routing** — I switched from the App Router to the Pages Router because I'm more productive there day-to-day. Happy to discuss whether that's the right call for a greenfield Flow project or revert to App Router if preferred.
