# Security policy

**Status:** development source, no stable release or guaranteed patch SLA.

The MCP server can read, write and execute files/commands with the permissions of its host account. Do not run it as root, expose it publicly, or accept instructions from untrusted AI clients. Isolate development, reduce permissions, review dependencies and inherited handlers, keep backups, and protect command outputs.

Security reports should not include keys, personal records, IP inventories or private configuration in public issues. Use GitHub's private vulnerability reporting if available; otherwise request a private disclosure path.

Wardveil controls, self-hosted remote authorization and a full independent security review are pending.
