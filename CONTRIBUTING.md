# Contributing to Kiwanto

Thank you for your interest in Kiwanto. The project is in its planning and documentation stage, so clear questions, research, careful proposals, and experienced technical feedback are valuable contributions. The project welcomes contributors while keeping the product vision and final decisions with its creator and maintainers.

## Before contributing

- Read the [README](README.md), [project specification](docs/PROJECT_SPEC.md), [architecture](docs/ARCHITECTURE.md), and [roadmap](ROADMAP.md) relevant to your proposal.
- Check existing issues and discussions before opening a new one, to avoid duplicates.
- Keep in mind that planned features are not implemented features, and proposed technical choices may change after validation.
- Do not add a license or imply that public visibility grants reuse rights. The repository currently has no selected license.

## Reporting a problem

Open a GitHub issue with a concise title and enough detail to understand the report. For a bug in implemented software, include the environment, steps to reproduce, expected and actual behavior, and relevant logs with personal information, tokens, and other secrets removed. For documentation issues, identify the page and the confusing or incorrect passage. Do not report security vulnerabilities in public issues; follow [SECURITY.md](SECURITY.md).

## Proposing a feature or architectural change

Open an issue or discussion (where available) explaining:

- The user problem and who experiences it.
- The proposed behavior and an example workflow.
- Relevant trade-offs, safety, privacy, and Linux compatibility concerns.
- Whether the proposal is an initial-version need or a longer-term goal.

For integrations, explain what data and filesystem locations would be accessed, whether network access or credentials are involved, and how the user remains in control. A proposal is not an approval to implement it; maintainers may request research or a prototype first.

## Contribution expectations

- Be respectful, constructive, and explicit about assumptions.
- Keep changes focused and avoid adding unrequested features, dependencies, or abstractions.
- Preserve the local-first, privacy-conscious, Linux-first direction unless a deliberate project decision changes it.
- Never add arbitrary shell execution, automatic execution of discovered files, destructive cleanup, mandatory accounts, telemetry, or cloud requirements as a convenience.
- Do not include credentials, personal data, or sensitive local paths in commits, logs, screenshots, or examples.
- Do not claim a feature, security property, test, or compatibility level that has not been verified.

## Documentation and code quality

- Use clear technical English in repository documentation.
- Keep terminology consistent and distinguish current behavior, decisions, proposals, assumptions, and open questions.
- Link related documentation and update it when a change makes it inaccurate.
- For code, prefer small, readable changes with clear module boundaries and safe error handling.
- Validate external input and paths; keep executable paths and argument arrays separate. Never construct shell commands by concatenating untrusted strings.
- Avoid introducing unnecessary dependencies or complex systems before a demonstrated need.

## Testing and review

Describe the checks you ran and their results. Add or update tests when code behavior changes, and do not claim tests were run if they were not. For UI or platform-specific changes, explain the environment and manual checks performed. Documentation-only changes should be checked for spelling, consistency, and valid internal links where practical.

All contributions are subject to maintainer review. AI-assisted code, documentation, and research must be reviewed and validated; the fact that an AI tool produced an answer is not evidence that it is correct. Contributors using AI should verify technical claims, inspect generated changes, run appropriate checks, and disclose material limitations or unverified assumptions. Never paste secrets or private user data into AI tools.

## Submitting changes

Use a focused pull request with a clear summary, motivation, and testing notes. Call out any security, privacy, data migration, backup, or compatibility implications. Be open to questions and revisions; discussion and review are part of building a maintainable project.
