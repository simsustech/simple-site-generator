---
'simple-site-generator': patch
---

Match the hash the bundler emits in the scaffolded cache rule.

The scaffolded `Cache-Control` rule matched `-[A-Za-z0-9_]{8,}` after the dash, but
Rolldown hashes are base64url, so a hash containing `-` — `index-1HO4-Wjr.mjs` —
was silently left out of `immutable`. That rule exists for nothing else, so the
failure was invisible: the file still loaded, it just revalidated.

Eight characters exactly, not "eight or more": an open-ended class matches a
hyphenated word as readily as a hash (`server-renderer.mjs`).
