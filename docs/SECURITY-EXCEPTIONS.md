# Dependency and release-security assessment

## Verified dependency maintenance

On November 17, 2026 (local project date), the initial development import had 1 high and 2 moderate findings in `npm audit --omit=dev` after the first lockfile repairs.

In this follow-up, the **unused direct `glob` dependency was removed**, eliminating its inherited `minimatch` branch. The direct `zod` dependency was upgraded to **4.6.7**; the two source schema definitions were adapted to its published `zod/v3` compatibility entrypoint. These changes preserved the TypeScript build and a local, temporary-home MCP handshake and file read/write smoke test. The production dependency audit returned **0 findings at that particular check**.

The repository's CI now verifies the build, focused protocol smoke and privacy checks, and rechecks the production dependency advisories at the moderate threshold. These checks are point-in-time evidence, **not a guarantee** that the dependency graph, local execution handlers, embedded parsers, remote agent, or hosted deployment are secure.

## Unresolved release blockers

- Broader inherited functional and adversarial tests, including command injection, file-parsing edge cases and permission boundaries.
- Remote broker/device authentication, revocation, transport security and explicit consent are not implemented as GoreeCloud services.
- The imported code retains unenabled upstream remote-agent source whose security, third-party rights, and network behavior need further inspection.
- GoreeCloud Identity, GoreeShield, Wardveil, Mesh and GoreeCloud UI integrations remain incomplete; native Linux/Android acceptance remains future work.
- The active npm development-toolchain dependencies have been reduced to drop inherited, unused archive-packaging, MCP bundle-building, remote MQTT fixture and coverage tooling. Following that change a **full npm audit including dev dependencies returned 0 findings** at the time of the check. This registry audit does not inspect runtime downloads, unreachable inherited source, optional binaries, dynamic network actions or future dependency updates. Historical upstream test scripts requiring removed toolchains are not acceptance evidence.

**No public remote deployment or stable release is approved.** Do not expose this MCP server to untrusted clients. Use a least-privileged local account and a staged, reversible acceptance process.
