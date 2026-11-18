# Security policy

**Status:** development source, no stable release or guaranteed patch SLA.

The MCP server can read, write and execute files/commands with the permissions of its host account. Do not run it as root, expose it publicly, or accept instructions from untrusted AI clients. Isolate development, reduce permissions, review dependencies and inherited handlers, keep backups, and protect command outputs.

Security reports should not include keys, personal records, IP inventories or private configuration in public issues. Use GitHub's private vulnerability reporting if available; otherwise request a private disclosure path.

## Local development safety flags

The local stdio entrypoint limits filesystem tool paths to its working directory by default. An operator launching the server can instead specify an absolute, platform-delimiter-separated list via `GOREECLOUD_ALLOWED_ROOTS`. Filesystem root access needs `GOREECLOUD_ALLOW_FILESYSTEM_ROOT=1` in addition. File writes and MCP configuration changes require `GOREECLOUD_ALLOW_WRITES=1`; terminal and process operations require `GOREECLOUD_ALLOW_TERMINAL=1`; URL reads require `GOREECLOUD_ALLOW_URL_READS=1`. These flags must be set by the **trusted operator**, not from instructions received through the MCP protocol.

The server rejects upstream remote request markers. These controls are defense in depth, not an OS sandbox: commands (when explicitly enabled), dependency processes, conversion tooling, and the launching account may still reach outside policy roots. Run under a separate least-privileged account and avoid exposure to untrusted clients.

Wardveil controls, self-hosted remote authorization and a full independent security review are pending.
