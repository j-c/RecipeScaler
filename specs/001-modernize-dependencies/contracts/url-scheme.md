# URL Scheme Contract

**Feature**: `001-modernize-dependencies`
**Type**: Client-side URL contract (no backend)

This document defines the URL scheme that is the application's sole
"external interface." It is produced and consumed entirely in the
user's browser — there is no server-side routing. Existing URLs that
conform to this contract MUST continue to work identically after
the modernisation upgrade (FR-009).

---

## Route Structure

The application registers three Angular Router routes:

| Route Pattern | Behaviour |
|---|---|
| `/r/:base64recipe` | Loads and renders the recipe encoded in `:base64recipe` |
| `/r` | Renders the default recipe (hardcoded Manhattan cocktail) |
| `` (empty) | Redirects to `/r` |

**Base path**: The app is served from the root (`/`). Angular uses
`PathLocationStrategy` (HTML5 pushState routing). No hash (`#`) in URLs.

---

## Parameter: `base64recipe`

### Encoding

```
:base64recipe = btoa(JSON.stringify(recipe))
```

- `JSON.stringify(recipe)` — compact JSON, no formatting/whitespace
- `btoa(...)` — native browser Base64 encoder (RFC 4648 §4)
- The result is placed directly in the URL path, not a query parameter

### Decoding

```
recipe = JSON.parse(atob(base64recipe))
```

- `atob(...)` — native browser Base64 decoder
- `JSON.parse(...)` — parses back to a `Recipe` object

### Charset note

`btoa` does not encode characters outside Latin-1. Since recipe data
(ingredient names, descriptions) may contain characters outside Latin-1
(e.g., accented characters), callers must ensure the string is Latin-1
compatible before encoding. The current implementation does not apply
`unescape(encodeURIComponent(...))` pre-encoding. This is an existing
limitation and MUST NOT be altered by the upgrade.

---

## Payload Schema

The `recipe` object serialised in the URL must conform to the following
JSON schema:

```jsonc
{
  "name": "string (required)",
  "description": "string (optional, may contain HTML)",
  "numberOfServes": "number (optional)",
  "baseIngredient": {
    "name": "string (required)",
    "description": "string (optional)",
    "measure": "number (required)",
    "unitOfMeasure": "string (required)"
  },
  "additionalIngredients": [
    // Each element is one of:
    // MeasuredRecipeIngredient:
    {
      "name": "string (required)",
      "description": "string (optional)",
      "measure": "number (required)",
      "unitOfMeasure": "string (required)"
    }
    // OR ScaledRecipeIngredient:
    // {
    //   "name": "string (required)",
    //   "description": "string (optional)",
    //   "scaleFactor": "number (required)"
    // }
  ]
}
```

Fields are matched by name at `JSON.parse` time via TypeScript duck typing.
The schema is permissive — extra fields are ignored; missing optional fields
are treated as `undefined`.

---

## Example URL

```
/r/eyJuYW1lIjoiTWFuaGF0dGFucyBmb3IgdHdvIiwiZGVzY3JpcHRpb24iOiI8cD5TaGFrZSB3aXRoIGljZSBhbmQgc2VydmUgaW4gYSBjaGlsbGVkIGNvdXBlIGdsYXNzLjwvcD48cD5Gcm9tIExpcXVpZCBJbnRlbGxpZ2VuY2UgYnkgRGF2ZSBBcm5vbGQ8L3A+IiwiYmFzZUluZ3JlZGllbnQiOnsibmFtZSI6IlJpdHRlbmhvdXNlIFJ5ZSB3aGlza2V5IiwiZGVzY3JpcHRpb24iOiI1MCUgQUJWIiwibWVhc3VyZSI6MTIwLCJ1bml0T2ZNZWFzdXJlIjoibWwifSwiYWRkaXRpb25hbEluZ3JlZGllbnRzIjpbeyJuYW1lIjoiQ2FycGFubyBBbnRpY2EgRm9ybXVsYSB2ZXJtb3V0aCIsImRlc2NyaXB0aW9uIjoiMTYuNSUgQUJWIiwibWVhc3VyZSI6NTMsInVuaXRPZk1lYXN1cmUiOiJtbCJ9LHsibmFtZSI6IkFuZ29zdHVyYSBiaXR0ZXJzIiwibWVhc3VyZSI6NCwidW5pdE9mTWVhc3VyZSI6ImRhc2hlcyJ9LHsibmFtZSI6IkJyYW5kaWVkIGNoZXJyaWVzIG9yIG9yYW5nZSB0d2lzdHMiLCJtZWFzdXJlIjoyLCJ1bml0T2ZNZWFzdXJlIjoiIn1dLCJudW1iZXJPZlNlcnZlcyI6Mn0=
```

Decoded, this URL encodes the default recipe (Manhattans for two).
This specific URL MUST continue to load and render identically after the upgrade.

---

## Invariants (MUST NOT change)

1. The route path prefix MUST remain `/r/`.
2. The encoding MUST remain `btoa(JSON.stringify(recipe))` (not base64url,
   not compressed, not encrypted).
3. The JSON property names MUST remain identical (TypeScript field names are
   the JSON keys).
4. The router strategy MUST remain `PathLocationStrategy` (HTML5 pushState,
   no `#`).
5. Unknown fields in the JSON payload MUST continue to be silently ignored.
