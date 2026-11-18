# GoreeCloud Desktop Commander — Remote Control Threat Model

**Status: initial risk assessment for an independent, future remote broker. No claim of a secure implemented service.**

## Scope and assets

Protect device-local files and commands, owner consent, device credentials, user sessions, broker routing metadata, persistent configuration, operator audit records and recovery keys. Keep the local MCP server separate from a future exposed remote service. The tool can execute code: compromise can affect the same files and processes as its operating-system account.

## Adversaries and assumptions

Consider unauthenticated network users, compromised client sessions, malicious or injected AI prompts, hostile documents, compromised dependencies, stolen tokens, cross-device users and a broker whose transport is observable or compromised. Trusted personal devices must still enforce least privilege and explicit action authorization. The presence of a VPN or localhost binding does not by itself prove security.

## Priority threat and verification matrix

| Threat | Required defense | Minimum negative test |
| --- | --- | --- |
| Unauthorized remote execution | Deny without independently verified Identity and device consent | Send a forged request lacking authorization; assert no device execution |
| Client-supplied remote metadata | Metadata cannot elevate privilege or bypass local policy | Set remote/clientInfo fields on a local request; ensure denial |
| Prompt injection in files/web content | Keep untrusted content out of authority and policy control | Embedded override instructions cannot change permissions |
| Stolen pairing token or replay | One-use, short-lived, cryptographically bound challenge; replay store | Replay, expiry and cross-device challenge misuse all fail |
| Stolen session credential | Short lifetimes, device binding, rotation and revocation | Reuse token after logout, revocation or different device; fail |
| Path traversal or symlink escape | Canonicalized scoped roots, OS sandbox and lstat/realpath checks | Parent traversal, malicious junction, dangling link and race |
| Command or output exfiltration | Redacted local auditing, consent-gated transfer, no raw histories | Sensitive arguments and contents never appear in broker logs |
| Compromised broker | Agent enforces policy independently, no plaintext reusable keys | Broker attempts over-scoped command; device rejects |
| Cross-device/tenant confusion | Bind user, device, session, action and scope cryptographically | Valid request replayed against another user's device fails |
| Malicious file parser/package | Isolated conversion, signed inputs and supply-chain reviews | Crafted archive/document cannot escape sandbox or trigger install hooks |
| SSRF and internal network scanning | Egress rules, URL validation, no surprise network fetches | Private-address redirects and metadata endpoints blocked |
| Resource exhaustion and queue replay | Payload limits, quotas, timeouts, session caps, cancellation | Oversized, concurrent, repeated and delayed messages bounded |
| Unauthorized persistence or auto-update | Explicit update trust chain and rollback; no hidden agent install | Modified update artifact fails verification and never executes |
| UI consent spoofing | Device-local origin, clearly displayed scope and expiry | Fake remote consent prompt cannot authorize execution |
| Privacy/security policy conflict | GoreeShield owns privacy and retention; Wardveil owns cybersecurity | Reject security logging that violates approved data minimization |

## Release blockers

The current imported code is a local-only development baseline. An independent broker, device-bound authentication, transparent consent, OS-level sandbox enforcement, dependable rollback, real-device acceptance, monitoring and vulnerability response have **not** been established. Completion requires repeatable tests, source review, independent security assessment proportionate to risk, and evidence-backed signoff by the founder's applicable control process. Do not expose a remote command API publicly before those gates pass.
