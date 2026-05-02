# TurboMini Release Checklist

Use this checklist when publishing packages to npm. The public `turbomini` package depends on `@turbomini/cli`, so publish scoped support packages before publishing `turbomini`.

## Preconditions

- You are logged in to npm as an account with publish access to the `@turbomini` organization.
- The `@turbomini` organization exists and scoped packages are published with public access.
- Package versions in `package.json` and `package-lock.json` agree.
- The working tree only contains intentional release changes.

## Verify

```bash
npm run lint
npm run build
npm test
npm run docs:check
```

Run npm's publish simulation for each package being released:

```bash
npm publish --dry-run --workspace @turbomini/cli --access public
npm publish --dry-run --workspace @turbomini/theme-base --access public
npm publish --dry-run --workspace turbomini
```

For web component packages, dry-run each changed package with public access:

```bash
npm publish --dry-run --workspace @turbomini/wc-button --access public
```

## Publish Order

1. Publish `@turbomini/cli`.
2. Publish `@turbomini/theme-base`.
3. Publish any `@turbomini/wc-*` packages referenced by docs, templates, or `turbomini add --mode wc`.
4. Publish `turbomini`.

Example:

```bash
npm publish --workspace @turbomini/cli --access public
npm publish --workspace @turbomini/theme-base --access public
npm publish --workspace @turbomini/wc-button --access public
npm publish --workspace turbomini
```

## Smoke Test

After the registry updates, verify the public install path from a clean temp directory:

```bash
npm install turbomini
npx turbomini --help
npx turbomini init demo-app
cd demo-app
npx turbomini doctor
```

Also verify at least one web component package if it was published:

```bash
npx turbomini add tm-button --mode wc
npm install
```
