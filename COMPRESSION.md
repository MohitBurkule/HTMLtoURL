# Compression & templates

## Were templates actually saving anything before?

No. Before this change there were **no templates and no compression at all**.
The original pipeline was:

```
HTML  →  encodeURIComponent  →  btoa() (base64)  →  put in URL
```

Base64 *inflates* data by ~33%, so the URL was always **larger** than the raw
HTML. The "template-based techniques" mentioned in the README were only a
future-work note, and the LZString code in `index.html` / `site.html` was
commented out and never wired up.

## What it does now

`js/codec.js` implements a lossless three-stage pipeline:

1. **Template diff** — pick the built-in template (`js/templates.js`) that
   shares the most leading + trailing bytes with the input, and keep only the
   differing middle. The shared prefix/suffix cost nothing but two small
   integers. This is the "only what's truly different remains" part, and because
   it's an exact byte match (no fuzzy diff) it can never corrupt the output.
2. **LZString compression** of the remaining payload (catches internal
   repetition too).
3. **URL-safe encoding** (`compressToEncodedURIComponent`).

A leading `~` marks the new format, so **old plain-base64 URLs still decode**.

## Measured savings

From `node tools/analyze.js`:

| sample                        | raw | old base64 | new | vs raw | vs base64 |
|-------------------------------|-----|-----------|-----|--------|-----------|
| Hello world                   |  22 |    32     |   9 |  -59%  |  -72%     |
| Tweaked heading + paragraph   |  80 |   108     |  26 |  -68%  |  -76%     |
| Login form (renamed)          | 204 |   272     | 134 |  -34%  |  -51%     |
| Bare HTML5 doc, custom title  | 207 |   276     |  88 |  -57%  |  -68%     |
| Landing page edit             | 352 |   472     | 169 |  -52%  |  -64%     |
| Arbitrary (no template)       |  70 |    96     |  98 |  +40%  |   +2%     |

**Totals: ~58% smaller than the old base64 scheme, ~44% smaller than the raw
HTML.** The only case that grows is tiny, fully-unique content with no template
overlap — there LZString's framing overhead slightly exceeds the savings, which
is expected for very short unique strings.

## Templates

`js/templates.js` ships **60 templates** (the original had zero) covering bare
documents, headings, lists, tables, forms (contact / login / newsletter /
search), nav/header/footer, hero/landing/CTA sections, cards, pricing, FAQ,
testimonials, 404 / maintenance / coming-soon pages, galleries, media embeds,
profiles, resumes, invoices, modals, accordions, tabs, stats, teams, timelines,
and more — "one for everyone."

Templates are **append-only**: never reorder or delete an existing template, or
URLs generated against its index would decode to the wrong page. Add new ones to
the end of the array.

## Verifying

```
node tools/analyze.js
```

Prints the savings table and confirms every template round-trips losslessly and
that legacy base64 URLs still decode.
