# Changelog

All notable changes to Veyrith are documented here.

## [0.1.5] - 2026-09-09

### Changed

- Removed platform-specific branding, debug assets, scaffold metadata, and development-only Vite integration from the public repository.
- Renamed public storage paths and neutralized provider-facing product text.
- Corrected dependency metadata so fresh installs resolve successfully.

## [0.1.4] - 2026-09-09

### Added

- Interactive in-app API documentation workspace.
- Copyable curl quick start and Go, Python, C#, and PHP SDK snippets.
- Language tabs, response examples, authentication guidance, and HTTP error contract.

## [0.1.3] - 2026-09-09

### Added

- Zero-downtime API key rotation through `VEYRITH_API_KEYS`.
- Per-key minute rate limiting with `Retry-After` responses.
- Persisted API usage analytics and authenticated 24-hour usage summaries.
- Official Go, Python, C#, and PHP client packages.
- CI validation for all available SDK toolchains.

## [0.1.2] - 2026-09-09

### Added

- Authenticated versioned `POST /api/v1/blueprints` REST endpoint.
- Constant-time Bearer token validation and structured request errors.
- Shared AI blueprint generation between the UI and external integrations.
- Go, Python, C#, and PHP examples using the public API contract.
- REST authentication and response-envelope tests.

## [0.1.1] - 2026-09-09

### Added

- Repository-owned SVG logo and verified desktop/mobile screenshots.
- Cross-language integration patterns for Go, Python, C#, and PHP.
- Asset catalog and README links for maintainers and contributors.

## [0.1.0] - 2026-09-09

### Added

- Initial Veyrith architecture decision studio workspace.
- Original signal-knot brand mark and responsive visual system.
- Structured AI blueprint generation with model discovery and server-side credentials.
- Safe seeded blueprint fallback for provider failures.
- Architecture health pulse, system shape preview, component list, and risk watch list.
- Focused unit tests for AI success and fallback behavior.
- Contributor documentation, security policy, code of conduct, and CI workflow.
