# yashi

Plugins, tools and API knowledge for Yashi, the on-device assistant in Squeeze. Every file sits at the top level so the repository can be uploaded by hand.

## How Squeeze uses it

When a question isn't solved on the device, Squeeze reads `index.json` here through jsDelivr (so GitHub's API quota is never touched), picks the plugin whose pattern fits, downloads that one `plugin-*.json`, and runs it in a sandbox. `apis.json` adds to the API catalogue Squeeze searches when you ask for a free API.

## Files

| File | What it is |
|---|---|
| `index.json` | List of plugins Squeeze searches. |
| `plugin-*.json` | Problem solvers (format in `PLUGIN_SPEC.md`). |
| `tool-*.js` | Reusable JavaScript, usable as a `<script>` or a Node `require`. |
| `apis.json` | Keyless, browser-callable APIs with a sample URL for each. |
| `test-plugins.mjs` | `node test-plugins.mjs` checks every plugin. |

## Plugins

| Plugin | Solves |
|---|---|
| compound-interest | savings growth with any compounding |
| loan-payment | mortgage and loan payments, total interest |
| simple-interest | non-compounding interest |
| tip-split | tips and splitting a bill |
| percent-change | increase or decrease between two values |
| statistics | mean, median, mode, range, variance, standard deviation |
| fractions | fraction arithmetic and simplifying, mixed numbers |
| gcd-lcm-primes | GCD, LCM, prime factors, primality |
| roman-numerals | to and from Roman numerals |
| base-convert | binary, octal, decimal, hex |
| unit-convert | length, mass, volume, temperature, speed, area, data |
| shapes | area, perimeter, volume of common shapes |
| pythagoras | missing sides of right triangles |
| days-between | days between dates, days until a date |
| age | age from a birth date, next birthday |
| timezone | time in a city, converting times between zones |

## Tools

| Tool | Does |
|---|---|
| `tool-fetch-cache.js` | fetch with TTL cache, ETag revalidation, per-host pacing, retries, r.jina.ai fallback |
| `tool-idb-kv.js` | promise key-value store on IndexedDB with a memory fallback |
| `tool-fuzzy-search.js` | typo-tolerant ranking with highlight ranges |
| `tool-undo-redo.js` | undo/redo with merged rapid edits and keyboard binding |
| `tool-csv.js` | RFC 4180 CSV parse and stringify |
| `tool-markdown.js` | safe Markdown to HTML (escapes first, only http/https/mailto links) |
| `tool-color.js` | conversions, WCAG contrast, seeded palettes without purple |
| `tool-game-loop.js` | fixed-step canvas loop with input, swipes and DPR resizing |
| `tool-dates.js` | relative time, DST-safe day maths, ISO weeks |
| `tool-store.js` | reactive store with selectors and localStorage persistence |

## Adding a plugin

In Squeeze: **Vault → Plugins → Make**, describe or photograph the problem, copy the prompt into any cloud model, then paste its reply (it starts with `#squeeze:plugin`) into the chat or **Add**. **Export for GitHub** gives you `plugin-<id>.json` and a new `index.json` to upload here.

Code adapted from elsewhere keeps its original licence; note the source in the plugin's `description` or alongside the tool.
