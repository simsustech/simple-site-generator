# Simple Site Generator

> Easily generate a simple but full-featured website.

### Try it online

https://codesandbox.io/p/sandbox/simple-site-generator-jdhg1d

### Web developers, designers and resellers

The goal of Simple Site Generator is to provide a platform on which web developers can easily create and maintain simple but full-featured websites.
If you are interested in providing paid templates to your customers, please contact me at info [at] simsus.tech.

### Community

Currently there are two free templates in the `@simple-site-generator/templates` package: `documentation` and `small-business`.

# Features

- Easily switch between templates with a single configuration option.
- Define your content with Markdown.
- Builds a full-featured, static, Quasar Framework powered website.
- Comes with a Github workflow which automatically uploads the generated files to your server.

# Getting started

Initialize a simple site generator project:

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

If you have `rsync` installed on your server/host, you can then push to the `production` branch and it will upload your website to `/srv/${URL}`.

> **Note**
> Change the `template` variable in `vitrify.config.ts` to `small-business` to experience the ease of changing the template of your website.
