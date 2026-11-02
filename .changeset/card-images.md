---
"@simple-site-generator/templates": minor
"simple-site-generator": minor
---

Let a card carry a photo, so a product catalogue is frontmatter.

`cards` could say `header`, `content`, `icon` and `cta` — everything except the one thing a
catalogue card actually is: a picture of the thing being sold. A plant, a room, a dish cannot be
replaced by an icon, so a site with a catalogue had no way to express it and the alternative was a
site-local page component the kit does not own.

`image: { src, alt?, width?, height?, fit? }` renders the photo above the tile's heading, bled to the
card's edges, and fills the plate `width`/`height` reserve — cropped (`fit: cover`, the default) or
shown whole inside it (`fit: contain`).

`fit: contain` is what a catalogue needs when its photos were not shot at one ratio. Without it a site
has only one honest option — author each photo's own ratio — and each card's height then follows its
photo, so a row of a portrait and a landscape shot leaves a card half empty. Measured on the
a client site catalogue: four landscape product photos next to portrait ones produced rows with a
170px blank area inside the shorter cards. Cropping instead destroys a branch shot (the reason
`contain` exists), so the choice belongs in the frontmatter where the author can make it. The wrapper carries the ratio, so the
space is reserved from the numbers rather than measured after the bytes arrive: a grid of forty
portrait photos does not reflow as it loads, and a portrait photo is not cropped to a landscape box —
`width`/`height` are the photo's own size, with 4:3 reserved when they are absent. Everything is
`loading="lazy"` and `decoding="async"`; `alt` falls back to the card's `header`, because that is
what the card says the picture is, and an empty `alt` would mark a catalogue photo as decoration.

`ssg check` now validates the card band, which it previously skipped entirely (`cards` was
`z.array(z.unknown())`): every card needs a `header` and `content`, a photo needs a `src`, and a
declared `width`/`height` has to be a positive integer. A card with no heading is the case that
matters most — it names nothing, and there is nothing for a photo's `alt` to fall back to.

An entry in `images` takes `width`/`height` for the same reason, and the landing templates now pass
them to `HeroImage`. The hero is the LCP element and reserves its box from those numbers; with no way
to declare a size, every portrait hero was reserved at the component's landscape 1200×750 fallback
and jumped to shape when the file landed. `ssg check` validates `images` as well: a slide without a
`name` is a carousel slide with no key and no caption fallback.
