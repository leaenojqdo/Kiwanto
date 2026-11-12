# Security policy

## Current status

The repository contains an initial React/Tauri desktop-interface prototype using sample game data and narrowly scoped Rust commands for the built-in theme preference. It is not a complete game library and does not implement game launching, integrations, or Big Picture / TV mode. The project has not claimed a security audit, security certification, or verified application safeguards. The principles below describe intended requirements, not guarantees about implemented software.

## Reporting a vulnerability

Please do not publish suspected vulnerabilities in a public issue or discussion. Use GitHub's **Report a vulnerability** option in the repository's Security tab if private vulnerability reporting is enabled. It has not been confirmed that this feature is currently enabled for Kiwanto; the project owner should configure it in the repository settings when the project is ready to receive vulnerability reports. If private reporting is not available, contact the project owner privately through an appropriate GitHub channel and ask how to share the report securely. Do not include exploit details in a public post while seeking a private channel.

Please provide, as safely as possible:

- A concise description of the affected area and potential impact.
- The repository revision or version and relevant operating system/environment.
- Reproduction steps or a proof of concept that avoids harming other users or systems.
- Any suggested mitigation, if known.

Do not access, alter, or disclose other people's data while investigating. Give the project owner a reasonable opportunity to understand and address a report before public disclosure. No fixed response or remediation timeframe is promised at this stage; the project owner should acknowledge reports and coordinate disclosure where possible.

## Intended security scope

Security review should consider Kiwanto's application code and data handling, Tauri command and capability boundaries, filesystem and process access, launch profiles, discovery/import behavior, integration adapters, external metadata and artwork, local database and backups, and any future update or extension mechanisms.

Third-party launchers, stores, games, runners, operating systems, and services are outside Kiwanto's control. Their vulnerabilities may affect users, but should be reported to their respective maintainers as well where appropriate.

## Intended safeguards

The design aims to avoid mandatory accounts, cloud services, and telemetry; limit permissions; validate paths and external input; keep credentials out of logs and configuration; never execute discovered files automatically; avoid shell command construction from untrusted data; avoid automatic deletion of user data; treat external content as untrusted; and clearly explain integration access. These controls must be implemented and tested before any claim is made about their effectiveness.
