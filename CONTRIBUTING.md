# Contributing to Veyrith

Thank you for helping make Veyrith a more useful and trustworthy architecture tool.

## Before you start

For substantial changes, open an issue first so the problem and intended direction are clear. Small documentation, test, accessibility, and bug-fix pull requests may be opened directly.

## Development flow

1. Fork the repository and create a focused branch from `main`.
2. Install dependencies with `pnpm install`.
3. Make the smallest change that solves the problem.
4. Add or update tests for behavior changes.
5. Run `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm format:check`.
6. Open a pull request with a clear summary, testing notes, and screenshots for UI changes.

## Standards

- Keep AI behavior explicit, structured, and reviewable.
- Do not expose credentials or move server-only calls into the client.
- Prefer typed tRPC procedures and Zod validation over ad hoc endpoints.
- Treat generated architecture as advisory; avoid language that implies certainty where uncertainty exists.
- Preserve keyboard access, visible focus states, reduced-motion support, and responsive behavior.
- Keep commits and pull requests focused. Avoid drive-by formatting changes.

## Commit messages

Use concise, imperative commit subjects. Conventional Commit prefixes are encouraged:

- `feat:` for a new capability
- `fix:` for a bug correction
- `docs:` for documentation
- `test:` for tests
- `chore:` for maintenance

## Pull requests

A pull request should explain the user or developer problem, the approach taken, how it was tested, and any follow-up work. Maintainers may request changes before merging.
