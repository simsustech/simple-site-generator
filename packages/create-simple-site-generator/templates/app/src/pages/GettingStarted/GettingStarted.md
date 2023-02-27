---
id: gettingstarted
title: Getting started
label: Getting started
icon: start
tags:
  - menu
---

# Getting started

## Initialize a simple site generator project:

```bash
pnpm create simple-site-generator ssg
cd ssg
pnpm i
pnpm run dev
git init
# Add your github repository as a remote source
```

On Github, define the following action secrets:

- DEPLOY_HOST: IP address or hostname of your server
- DEPLOY_USER: SSH user on your server
- DEPLOY_KEY: SSH key corresponding to the user
- SIMSUSTECH_NPM_TOKEN: NPM access token for npm.simsus.tech
