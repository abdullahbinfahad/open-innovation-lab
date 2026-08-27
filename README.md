# Open Innovation Lab

> An elegant open-source monorepo for 30 AI, computer-vision, IoT, and software projects—built transparently from hard to easy, with evidence-based validation.

Open Innovation Lab is both a public project hub and a practical build system. The first implementation is a **Personal AI Assistant**: a full-stack workspace for persistent conversations, task intake, AI-assisted task breakdown, and contextual follow-ups. The remaining projects are a published roadmap—not completed products. Their status remains **Planned** until implementation and their documented quality gates have passed.

The public source repository is available at [github.com/abdullahbinfahad/open-innovation-lab](https://github.com/abdullahbinfahad/open-innovation-lab).

## Principles

| Principle                | What it means in this repository                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Transparent progress     | Every project has a visible status: Planned, In progress, Validated, or Released.                                                          |
| Evidence before claims   | A project may be marked Validated only after its stated checks and acceptance criteria have passed.                                        |
| Cross-platform by design | Web experiences target modern browsers; desktop and hardware projects publish explicit Windows, macOS, Linux, and device support matrices. |
| Open-source stewardship  | MIT licensing, contributor guidance, security reporting, code-of-conduct standards, and reusable project conventions ship with the source. |

## Current release focus

| Item                  | Status      | What is included                                                                                                        |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| Public project hub    | In progress | A responsive catalog and transparent roadmap view for all 30 projects.                                                  |
| Personal AI Assistant | In progress | Persistent sessions, saved tasks, real server-side LLM conversations, task breakdown, and contextual follow-up prompts. |
| Projects 2–30         | Planned     | Detailed scope, prerequisites, validation conditions, and hard-to-easy release order.                                   |

## Project catalog

The full catalog, including individual prerequisites and validation conditions, is maintained in [`docs/ROADMAP.md`](docs/ROADMAP.md). Release order starts with the most technically demanding work and proceeds toward foundational projects.

| Release | Project                                                | Category                     | Difficulty | Status      |
| ------: | ------------------------------------------------------ | ---------------------------- | :--------: | ----------- |
|       1 | Personal AI Assistant                                  | AI & Agents                  |    5/5     | In progress |
|     2–7 | AI Coding Agent through AI-Powered Automation Platform | AI & Agents / Software       |    5/5     | Planned     |
|    8–14 | Vision Robotics through Cross-Border Logistics         | Robotics / IoT / Software    |    5/5     | Planned     |
|   15–23 | Multi-Agent Task Manager through Collaborative Web App | AI / Vision / IoT / Software |    4/5     | Planned     |
|   24–30 | AI PDF Agent through Personal Developer Dashboard      | AI / Vision / IoT / Software |    3/5     | Planned     |

## Monorepo layout

```text
.
├── client/                    # React public hub and Personal AI Assistant interface
├── server/                    # Typed API procedures, LLM orchestration, persistence
├── drizzle/                   # Database schema and migrations
├── shared/                    # Roadmap metadata and shared type contracts
├── docs/                      # Roadmap and release-readiness documentation
├── templates/project-starter/ # Required conventions for future project additions
└── .github/                   # Continuous integration and community templates
```

## Local setup

### Prerequisites

Install a current Node.js LTS release and enable the package manager shipped with Node.js. The first app uses a MySQL-compatible database and a server-side LLM service provided by the host environment. Do not commit environment files or API keys. Sign-in is optional: when hosted OAuth is unavailable, the assistant uses a device-local guest identity to persist that browser’s sessions and tasks without blocking the workspace.

### Windows

Use PowerShell or Windows Terminal. Install Node.js, clone the repository, and run the commands below. For optional hardware projects, follow the project-specific device instructions when they are released.

### macOS and Linux

Use Terminal and install Node.js through your preferred trusted package manager or the official installer. Then clone the repository and follow the same commands.

```bash
git clone https://github.com/abdullahbinfahad/open-innovation-lab.git
cd open-innovation-lab
corepack enable
pnpm install
pnpm dev
```

When running outside the hosted environment, create a local `.env` file that is ignored by Git and configure the required values through your secure environment manager. Never expose LLM credentials to browser code; the assistant routes model requests through the server.

| Configuration                                              | Purpose                                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                                             | MySQL-compatible connection string for persistent roadmap and assistant data. |
| `JWT_SECRET`                                               | A long random local secret for session signing.                               |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | OAuth settings when using the included hosted authentication integration.     |
| Server-side LLM service configuration                      | Private credentials and endpoint required for real assistant conversations.   |

## Quality gates

Run the following commands before opening a pull request. A status cannot move to **Validated** unless all applicable checks succeed and its project-specific criteria are recorded.

| Command             | Gate                                                 |
| ------------------- | ---------------------------------------------------- |
| `pnpm format:check` | Checks repository formatting without changing files. |
| `pnpm check`        | Runs TypeScript type checking.                       |
| `pnpm test`         | Runs unit and workflow tests.                        |
| `pnpm build`        | Builds the production application.                   |
| `pnpm verify`       | Runs the complete release-readiness sequence.        |

For the latest live assistant-control verification record, see [`docs/ASSISTANT_VALIDATION.md`](docs/ASSISTANT_VALIDATION.md).

## Contributing and security

Contributions should follow [`CONTRIBUTING.md`](CONTRIBUTING.md), the [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and each project’s manifest. Security vulnerabilities should be reported privately as described in [`SECURITY.md`](SECURITY.md), not in public issues.

## License

This repository is available under the [MIT License](LICENSE).
