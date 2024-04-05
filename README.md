<p align="center">
    <picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/diselostudio/sst-remix-spa/main/public/brand-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/diselostudio/sst-remix-spa/main/public/brand-light.svg">
  <img alt="Shows Ion and Remix logos." src="https://raw.githubusercontent.com/diselostudio/sst-remix-spa/main/public/brand-dark.svg" width="256">
</picture>
</p>

---

This template extends Remix `remix-run/remix/templates/spa` template with very few tweaks to enable deployments as a Static Site using [SST Ion](https://ion.sst.dev/docs/) (Future SST V3).

> [!NOTE]
>
> Originally written in `remix-run/remix/templates/spa` README.md:
>
> This template leverages [Remix SPA Mode](https://remix.run/docs/en/main/future/spa-mode) and the [Remix Vite Plugin]>(https://remix.run/docs/en/main/future/vite) to build your app as a Single-Page Application using [Client Data](https://>remix.run/docs/en/main/guides/client-data) for all of your data loads and mutations.

> [!NOTE]
>
> Taken from SST Ion docs:
>
> Ion is a new engine for deploying [SST](https://sst.dev/) apps. It uses [Pulumi](https://www.pulumi.com/) and [Terraform](https://www.terraform.io/), as opposed to CDK and CloudFormation.

## Reasons

As of `05-04-2024` SST's Remix constructor doesn't take into account relatively new Remix SPA mode using Vite as a bundler. When using SPA mode in Remix it outputs a client Static Site on your build not requiring the setup of a Node server or Lamda functions adapter. Therefore, the changes listed below were made to perform a deployment using SST Ion cli.

## Changes applied

At initialization, SST Ion detects your Remix app and wraps your npm/pnpm/yarn command on their own `sst dev` command. Within this process, the required `vite:` prefix was not kept.

```jsonc
// package.json

"scripts": {
    "dev": "sst dev remix vite:dev",
    //...
```

Also Remix constructor is replaced with the Static Site constructor deploying the path of the client output.

```javascript
// sst.config.ts

new sst.aws.StaticSite("RemixSPA", {
  build: {
    command: "npm run build",
    output: "build/client",
  },
});
```

Last, remix-template-spa `.eslintrc.cjs` file extends `@typescript-eslint/recommended` plugin, which throws and error when parsing TypeScript's `///` triple-slash references.

According to `@typescript-eslint/recommended` [documentation](https://typescript-eslint.io/rules/triple-slash-reference/):

> It's rare to need a /// triple-slash reference outside of auto-generated code. If your project is a rare one with one of those use cases, this rule might not be for you.

Since SST auto-generates your infrastructure code types, an override was set for SST files as follows:

```jsonc
// .eslintrc.cjs

"overrides": [
    {
        "files": ["sst-env.d.ts", "sst.config.ts"],
        "rules": {
            "@typescript-eslint/triple-slash-reference": "warn"
        }
    }
]
```

## Develop and Deploy

You can follow regular [Remix](https://remix.run/docs/en/main/future/spa-mode#development) or [SST](https://ion.sst.dev/docs/reference/cli/#dev) documented workflows.

### S3 redirection rule

> [!WARNING]
> This should be the default behavior when deploying a StaticSite but consider reviewing your S3 Bucket hosting configuration in order serve `index.html` file as a fallback when route is not found / any other error.
