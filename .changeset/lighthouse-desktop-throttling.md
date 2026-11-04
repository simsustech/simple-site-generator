---
'simple-site-generator': patch
---

Measure a desktop run with the desktop throttling.

`formFactor: 'desktop'` alone does not make a desktop run: it swaps the screen
emulation and leaves the default mobile network model and 4x CPU slowdown in place,
so `runLighthouse(url, { formFactor: 'desktop' })` reported FCP and LCP roughly
four times too slow. Measured on a prerendered page, three runs each: 0.9 s and a
performance score of 98 before, 0.2 s and 100 with the throttling Lighthouse's own
desktop preset uses (rtt 40 ms, 10 Mbps, no CPU slowdown).

The config is now built by an exported `lighthouseConfigFor()`, so the difference is
covered by a unit test instead of only by whoever runs a browser next.
