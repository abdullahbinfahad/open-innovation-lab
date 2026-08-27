# Release Readiness

Use this checklist for the Personal AI Assistant and for every future project. A release candidate must not be described as validated, production-ready, or released if a required item remains incomplete.

| Gate          | Evidence required                                                                          |
| ------------- | ------------------------------------------------------------------------------------------ |
| Scope         | Completed project manifest, explicit supported platforms, and non-goals.                   |
| Documentation | Setup instructions, configuration guidance, data-handling notes, and troubleshooting path. |
| Formatting    | `pnpm format:check` exits successfully.                                                    |
| Types         | `pnpm check` exits successfully.                                                           |
| Tests         | `pnpm test` exits successfully, including relevant failure paths.                          |
| Build         | `pnpm build` exits successfully.                                                           |
| Security      | No secrets committed; permissions and sensitive-data handling reviewed.                    |
| Acceptance    | Project-specific validation criteria in `docs/ROADMAP.md` have recorded evidence.          |
| Release       | Version, changelog/release notes, and platform or hardware support statement are prepared. |

The CI workflow runs portable automated gates. Hardware-, desktop-, and browser-specific acceptance checks should be documented in each project manifest as those projects are built.
