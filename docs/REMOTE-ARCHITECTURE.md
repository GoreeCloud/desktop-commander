# GoreeCloud Desktop Commander — Independent Remote Architecture

**Status: design proposal only. No remote broker, remote pairing, hosted device execution, GoreeCloud Identity integration, or production deployment has been implemented or validated.**

## Purpose and provenance

The current GoreeCloud Desktop Commander source is a modified MIT-licensed import of the local DesktopCommanderMCP server. The separately branded Remote Desktop Commander hosted service is proprietary and is **not** part of this source. Any future self-hostable remote functionality must be independently implemented, use only lawfully reusable open standards, and preserve existing upstream license notices.

## Components and trust boundaries

| Component | Responsibility | Trust boundary |
| --- | --- | --- |
| Local MCP server | File and process tools on a user-controlled machine | Runs as a nonprivileged OS account; a connecting AI client is not automatically trusted |
| Device agent (future) | Outbound-only connection, signed enrollment and scoped local execution | Must enforce device-local approval and policy even when the broker accepts a request |
| Self-hosted broker (future) | Route encrypted, bounded sessions without becoming a universal shell authority | Public-facing services must not handle raw reusable device credentials or plaintext command histories |
| GoreeCloud Identity | Authenticate users, enforce roles, device ownership and session authorization | Login alone never constitutes consent to execute a command |
| GoreeCloud Mesh | Authorized interoperability, device discovery and coordination contracts | Mesh cannot bypass Identity, GoreeShield or Wardveil policies |
| GoreeShield | Consent, minimization, sharing, retention and privacy transparency | Default-deny device sharing and unnecessary data collection |
| Wardveil | Threat detection, incident response, intrusion controls, vulnerability management | Security telemetry must respect GoreeShield privacy and redaction policies |
| GoreeCloud UI | Approved design language for consent, trust prompts, device lists and status | Implement with verified tokens and approved Linux/web/Android frameworks, not guessed branding |

The agent and local MCP server must remain useful offline where practical. The broker should not be a dependency of local file management.

## Session lifecycle (planned)

1. A device owner explicitly initiates enrollment on a machine they control. An agent generates device-bound identity keys locally using suitable OS facilities. Private keys never leave the device.
2. The owner authenticates through a verified Identity flow. A short-lived, one-time pairing challenge binds the user, device key, requested scope, expiry and nonce. Pairing is confirmed on the device.
3. The agent establishes an outbound TLS-protected connection to an allowlisted, explicitly configured broker. No automatic fallback to the proprietary upstream hosted service.
4. The browser or native client requests a short-lived session with a capability scope (for example, read-only files from an approved root). The device agent presents a meaningful consent request for sensitive scopes.
5. Each request carries protocol version, scoped session identity, monotonically checked replay nonce, expiry, request ID, target device, operation type and a bounded payload. The agent independently checks permissions, current consent, limits and OS account restrictions.
6. Revoke, logout, expired session, device retirement or integrity failure terminates execution, closes active connections, and invalidates future actions. Revocation must work even when a broker is temporarily unreachable, using locally cached expiry and deny rules.

The final cryptographic design, certificate/key lifecycle, message format and command semantics require security review and interoperability tests before implementation. These steps are **design requirements**, not descriptions of working features.

## Authorization model

- Deny by default. Distinguish discovery, read, write, process execution, file transfer, administrative operations and device management. Never infer permission for one from another.
- Grant to a specific device, owner, actor, session, allowed root and operation. Consent must be time-bounded and revocable; unattended capabilities require separate explicit approval.
- No model prompt, tool argument, URL, file content, chat message, client metadata or remote response is allowed to grant permissions or expand an approved root.
- Resolve symlinks and path traversal safely; enforce confinement at the agent and the OS account, not merely through a broker UI.
- Limit terminal execution to explicitly permitted sessions and expose command review, cancellation, timeouts and bounded output. A broker success acknowledgement is not proof of command completion.
- Protect against concurrent requests, replay, unexpected reconnect and out-of-order completion.

## Privacy and operational controls

Persist only the minimal audit facts needed to prove user consent, authorization decisions, session establishment, termination and security events. Avoid command bodies, file contents, private paths and full AI transcripts in centralized logging. Provide local export/deletion/retention controls subject to documented obligations. No advertising, upsell or surprise telemetry.

Broker and device agent should have independent health checks, bounded queues, request and payload limits, backpressure, dependency scanning, key rotation and graceful update/recovery procedures. No inbound agent listener is required for the default mode; public HTTP endpoints must use modern TLS, authentication, throttling and anti-replay controls.

## Platform and deployment acceptance

Linux graphical clients must use an approved primary framework (Qt Quick 6.12.0, Flutter Linux Desktop, or Slint); browser clients require an approved web framework; Android uses an approved native framework. UI experiences use the actual GoreeCloud UI design authority. Deployable broker services must evaluate a verified installed GoreeCloud Containers first and retain documented Docker/Podman/Kubernetes alternatives. Do not deploy a remote service on a legacy VPS in violation of host migration restrictions.

## Implementation gates

1. Approve a versioned protocol contract and independent threat model; define allowed operations and machine-readable validation.
2. Build offline unit tests for enrollment expiry, session revocation, replay, message size, path escape, permission transitions, disconnection and out-of-order responses.
3. Run agent and broker in disposable nonprivileged containers/VMs; fuzz untrusted requests and measure race conditions without exposing real devices.
4. Verify Identity, GoreeShield, Wardveil and Mesh enforcement separately through authorized integration tests.
5. Demonstrate encryption and key isolation, incident evidence without secrets, revocation under network interruption and rollback with real restore tests.
6. Pass security, privacy, cross-platform, accessibility and operational acceptance before any public endpoint or production device pairing.

**No production implementation, rights grant for proprietary upstream components, signed-off crypto protocol or deployment is claimed by this document.**
