---
id: contact
title: Contact
description: How to reach us, including the project repository and support channels.
label: Contact
# Prerendered like every other page, so it gets a real <h1> and its own
# <head> tags. A content page should not be client-only: `noSsr` would make it
# invisible to a crawler and would fail `ssg verify`.
tags:
  - contact
  - footer
lists:
  - header: Links
    items:
      - overline: Source
        label: https://github.com/simsustech/simple-site-generator
        icon:
          name: i-mdi-github
---

## Get in touch

Add your own contact details here — a phone number, an email address and your
opening hours. Anything you put in the `ssg.extra` block of `vitrify.config.ts`
is also mirrored into `LocalBusiness` structured data automatically.
