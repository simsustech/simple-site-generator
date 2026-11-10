---
'simple-site-generator': patch
---

fix(cli): let `ssg verify` bind a port the environment grants

`verify` measures the built site behind a real static server, and it always asked
the OS for an ephemeral port. A sandboxed agent or a locked-down CI runner is
often granted a range of ports instead of any free one, where `listen(0, …)`
fails with `EACCES` before a single page is measured — the gate then reports an
environment error rather than a verdict on the site.

`ssg verify --port <n>` binds that port for the measurement server, and
`startStaticServer(root, { port })` takes the same option for callers of the API.
The default stays `0`, so parallel runs still cannot collide.

The verify tests skip, with a reason, where the runner may not bind loopback at
all: they are about what `verify` measures, not about the runner's port policy.
