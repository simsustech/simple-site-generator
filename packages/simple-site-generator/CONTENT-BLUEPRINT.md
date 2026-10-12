# Content blueprint

`ssg verify` proves a site is _technically_ correct. This document is about the other half: what to
actually write so the site has something to rank and convert with.

The technical layer creates the opportunity. Content is what uses it.

## 1. Page inventory: service × location

A local business ranks by combining **what** it does with **where** it does it. One page cannot cover
either well. Build the matrix:

|                | Amsterdam            | Haarlem            | Utrecht            |
| -------------- | -------------------- | ------------------ | ------------------ |
| Leak repair    | `/leaks/amsterdam`   | `/leaks/haarlem`   | `/leaks/utrecht`   |
| Boiler service | `/boilers/amsterdam` | `/boilers/haarlem` | `/boilers/utrecht` |

Rules that keep this from becoming spam:

- **Only create a cell you can genuinely serve.** A page for a town you do not cover is a doorway page
  and gets ignored or penalised.
- **Each page must be materially different.** Same text with the town swapped is worse than no page.
  Add the local reality: travel time, the neighbourhoods you cover, a job you actually did there, local
  pricing, parking or access notes.
- **Cap it.** Ten genuinely different pages beat a hundred templated ones. Pick the locations with real
  demand, not every postcode.
- Nested pages get `breadcrumbs` in frontmatter, which drives both the visible trail and
  `BreadcrumbList` structured data.

## 2. Page shape

Every page follows the same skeleton so an agent can produce it reliably:

1. **One `<h1>`** — the thing the page is about, in the words a customer would search. The template
   renders it from `title`; do not repeat it in the body.
2. **Answer first.** The first paragraph answers the page's main question in one or two sentences. This
   is what a search engine quotes and what an AI summary reproduces. Do not warm up.
3. **What it costs / how long it takes.** The two facts people actually want. Vague pages do not convert.
4. **Proof.** A review, a number, a licence, a photo of real work.
5. **The single CTA.** One action, repeated once at the end. Not five different ones.
6. **FAQ** — three to six real questions with short answers, declared in `faq:` frontmatter so they are
   also emitted as `FAQPage` structured data.

Target 600–1,200 words for a service page. Length is not the goal; _answered_ is the goal.

## 3. Headings and keywords

- Headings describe the section, not the keyword. `## What a leak repair costs in Amsterdam` beats
  `## Leak repair Amsterdam`.
- One `##` per idea. If a section needs a sub-idea, that is an `###`.
- Put the location and service in the `title` and the first paragraph, once each. Repeating them in
  every heading reads as spam to both people and crawlers.
- **Never write for a keyword density target.** Write the page a customer needs, then make sure the
  terms they would use appear naturally.

## 4. Internal linking

- **Every page is reachable from the navigation** — `tags: [menu]` or a parent's `subpages`. A page
  nothing links to is a page nothing finds.
- **Link service pages to their location variants** and back. The matrix is a hub, so make the links real.
- **Anchor text says where it goes**: "boiler service in Haarlem", not "click here".
- Keep the trail shallow: home → service → location. Useful pages are within three clicks of home.
- `ssg check` fails on a `subpages` entry that does not resolve, so a dead navigation link is caught
  before the build rather than after deploy.

## 5. E-E-A-T signals

Experience, Expertise, Authoritativeness, Trust. For a local service site this is mostly about being
_verifiable_:

- **NAP everywhere, identically** — name, address, phone. Put it in `ssg.extra`, where it feeds the
  footer, the proof section _and_ `LocalBusiness` structured data from one source.
- **A real phone number** on every page, as a `tel:` link. This is the single highest-value element on a
  mobile local site.
- **Opening hours** in `ssg.jsonLd.business.openingHours`, so they appear in structured data and search
  results.
- **Reviews with names and text** in `ssg.extra.reviews` — shown as proof and contributing to
  `aggregateRating`.
- **Credentials**: registration number, insurance, certifications, years in business. Declare them; a
  claim a visitor cannot check is not a trust signal.
- **Real photos of real work.** Stock imagery is recognisable and reads as filler.

## 6. Writing for AI summaries

Answer engines reward content that is unambiguous and extractable:

- Lead with the direct answer, then elaborate.
- Use definitions and concrete numbers rather than hedging language.
- Keep one idea per paragraph, and keep paragraphs short.
- Structure with headings and lists so a passage can be lifted without losing its meaning.
- Declare `faq:` — question-and-answer pairs are the most quotable format there is.

## 7. Before you ship

```bash
ssg check     # frontmatter: ids unique, descriptions present, subpages resolve
ssg build
ssg verify    # SEO surface + byte budgets + Lighthouse
```

Then read it once as a stranger: is it obvious what this business does, where, how much, and how to
contact them — without scrolling?
