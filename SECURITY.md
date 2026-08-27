# Security Policy

## Supported versions

Security fixes are applied to the default branch and the most recent public release of the Personal AI Assistant.

## Reporting a vulnerability

Please do not disclose vulnerabilities in public issues. Report them privately to the repository maintainers with a concise description, affected component, reproduction steps, potential impact, and any suggested mitigation. We will acknowledge receipt, investigate the report, and coordinate disclosure after a fix or mitigation is available.

## Security design principles

The project keeps LLM credentials server-side, requires authentication for personal data, records transparent task states, and treats user content as untrusted input. Future projects must document their permissions, data handling, safety boundaries, and deletion pathways before they can be marked validated.
