# Contributing to Open Innovation Lab

Thank you for considering a contribution. This repository values small, reviewable changes, reproducible validation, and transparent project status. Do not mark a roadmap item as validated or released without evidence from its documented quality gates.

## Before you begin

Please search existing issues and read the relevant project brief in `docs/ROADMAP.md`. Each project follows the shared manifest and validation conventions in `templates/project-starter/`.

## Development workflow

Fork the repository, create a focused branch, install dependencies with `pnpm install`, and run `pnpm check`, `pnpm test`, and `pnpm build` before opening a pull request. Use `pnpm format` to apply the repository formatter. Document any environment requirement or behavior change in the same pull request.

## Pull-request standard

A pull request should explain the user-facing change, identify affected roadmap item(s), include or update tests, and state the exact validation commands run. Security-sensitive, automation, hardware, or biometric work requires maintainers to review the relevant safety and privacy implications before merge.
