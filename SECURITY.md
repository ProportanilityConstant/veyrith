# Security Policy

## Supported versions

Security fixes are prioritized for the latest release and the default branch.

## Reporting a vulnerability

Please do not open a public issue for a security vulnerability. Use GitHub's private security advisory flow when enabled, or contact the repository owner privately with the affected component, impact, reproduction steps, and any suggested mitigation.

Do not include secrets, personal data, or production credentials in a report.

## Security expectations

- Keep all secrets in environment configuration, never in source control.
- Keep AI credentials and provider calls on the server.
- Validate untrusted input at the procedure boundary.
- Review generated architecture outputs before acting on them.
- Rotate any credential that may have been exposed and note the exposure window.
