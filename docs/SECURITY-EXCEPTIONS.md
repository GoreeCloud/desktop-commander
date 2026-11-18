# Development dependency risk register

Audit performed November 17, 2026 against the development import with npm audit --omit=dev.

After safe lockfile updates and pinning a patched node-forge release, **3 production dependency advisories remain: 1 high, 2 moderate**. Affected packages include zod, glob and minimatch. This is a point-in-time audit, not a guarantee of current or future vulnerability counts.

The inherited Zod 3 dependency requires a compatibility assessment before upgrading to the Zod 4 remediation line. The glob/minimatch fixes also require coordinated major-version compatibility testing. These are open **release blockers** until remediated, mitigated with validated constraints, or explicitly risk-accepted through the approved process.

Do not deploy publicly, expose to untrusted clients, or treat this repository as production secure. CI runs a source and privacy smoke check and build; it does not yet establish full vulnerability clearance, complete upstream test parity, runtime isolation, secure remote access or MIPS certification.
