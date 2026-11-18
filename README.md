# GoreeCloud Desktop Commander

**Development-stage, local-first MCP tool server — not a production remote-control service.**

GoreeCloud Desktop Commander is a privacy-hardened **Rebranded Import** of the local open-source [DesktopCommanderMCP](https://github.com/wonderwhy-er/DesktopCommanderMCP) project, upstream main commit 325a203412612e3be98ea4400d9df59d153068b6. It is **not** an import or clone of the proprietary [Remote Desktop Commander hosted service](https://github.com/desktop-commander/remote-desktop-commander).

This repository is MIT-licensed with preserved upstream author rights; see [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md).

## Current development scope

The MIT source includes local MCP primitives for file operations, directory search, source editing, command/process handling, and file previews. GoreeCloud modifications disable upstream installation telemetry, regular usage telemetry, persisted raw tool-call argument/output history, upstream background feature-flag polling, marketing onboarding and automatic browser download at startup. The inherited hosted remote mode is disabled: the local executable refuses a remote connection.

Local MCP requests now have an additional **development safety gate**: filesystem reads are scoped to the working directory by default; configuration/file writes, terminal/process tools and URL reads require explicit operator environment opt-in. A fake or forwarded remote tool marker is always refused. This is a policy guard, **not an operating-system sandbox**. Read [SECURITY.md](SECURITY.md) for configuration and limitations.

This is not an independently self-hosted remote agent/broker. No production-grade authentication, authorization, secured remote relay, native Linux application, Android app, deployment, stable release, or MIPS integration is established. Inherited remote-agent source is not a supported GoreeCloud service.

## Local development

Requirements: Node.js 22.12+ and npm on a device you own or are authorized to control.

1. Clone https://github.com/GoreeCloud/desktop-commander and enter the project directory.
2. Run npm ci --ignore-scripts --no-audit --no-fund.
3. Run npm run build and then npm run test:goreecloud (or run npm test for both).
4. Configure a **trusted local stdio MCP client** to launch node /absolute/path/to/desktop-commander/dist/index.js --no-onboarding.

Commands, filesystem permissions, file conversion and running processes inherit the user account's privileges. Never install as root, connect to untrusted AI agents, or expose an MCP endpoint publicly without independently reviewed security controls. A client may request network access via its commands, so the telemetry shutoff is **not** a universal network block.

This baseline is for local use and testing; no container deployment is claimed. Evaluate installed GoreeCloud Containers first if a suitable deployable service is later developed.

## Status, privacy and security

- [PRIVACY.md](PRIVACY.md) — privacy boundaries and limitations.
- [SECURITY.md](SECURITY.md) — high-risk command access and reporting.
- [docs/SECURITY-EXCEPTIONS.md](docs/SECURITY-EXCEPTIONS.md) — **unresolved dependency vulnerabilities and release blockers**.
- [docs/FEATURES.md](docs/FEATURES.md) — implemented vs planned capability.
- [docs/ROADMAP.md](docs/ROADMAP.md) — next technical steps.
- [docs/OBJECTIVES.md](docs/OBJECTIVES.md) — requirements and acceptance.
- [NOTICE.md](NOTICE.md) — full upstream provenance and licensing limitations.

No verified stable, public service, self-hosted relay or device deployment. Third-party dependencies and source require further review and testing. This is **not endorsed by or affiliated with** the original upstream parties.
