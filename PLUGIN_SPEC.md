# Plugin format (v1)

Each plugin is one file named `plugin-<id>.json` at the top of this repository, listed in `index.json`.

```json
{
  "id": "loan-payment",
  "name": "Loan and mortgage payments",
  "version": "1.0.0",
  "topic": "finance",
  "description": "One sentence.",
  "keywords": ["mortgage", "monthly payment"],
  "regex": "\\b(mortgage|loan)\\b",
  "solve": "function solve(q, ctx) { return { answer: '...', steps: ['...'] }; }",
  "tests": [{ "q": "monthly payment on a $250,000 mortgage at 6.5% for 30 years", "expect": "1,580.17" }],
  "license": "MIT",
  "author": "ayqshi"
}
```

**Picking a plugin.** The regex matching a question scores 10, each keyword 2, the topic 1. A plugin runs at 6 or more; installed plugins win ties. Keep regexes narrow: `node test-plugins.mjs` reports any plugin that would grab another's questions.

**Running.** `solve` is one JavaScript function stored as a string. Squeeze runs it in a sandboxed iframe with an opaque origin, so it can't see the app, its storage or the page. It gets the raw question and `ctx` (`now`, `locale`), may be `async` and may `fetch()` keyless HTTPS APIs, and must return `{ answer, steps }` or `{ answer: null, reason }`. Runs stop after 6 seconds.

**Tests.** At least four, phrased differently; `expect` is a case-insensitive substring of the right answer.

**Pasting from a cloud model.** Output that starts with the line `#squeeze:plugin` is installed straight from the chat box.
