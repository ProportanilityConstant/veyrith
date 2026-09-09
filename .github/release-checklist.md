# Release checklist

## Before tagging

- [ ] Update `package.json` version and `CHANGELOG.md`.
- [ ] Run `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm format:check`.
- [ ] Review migration and environment notes.
- [ ] Confirm no secrets or local artifacts are included.

## Tagging

Create an annotated tag that matches the package version, for example:

```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

Create the GitHub release from the tag and paste the corresponding changelog section into the release notes.
