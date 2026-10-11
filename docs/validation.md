# Validation — 2026-10-11

- `npm test`: 6 tests passed (mock CLI): read/write risk enforcement, fixed identity, replay prevention, uncertain writes and exit 10.
- Real local CLI: command help and embedded skills list succeeded; API schema `calendar.calendars.list` returned its schema.
- Asky plugin-runner RPC: `skills list`, `schema calendar.calendars.list`, and `auth status --verify` returned results through the host execution protocol. No credentials or personal response contents are included here.
- Asky core Swift tests and Debug build passed. Native settings regression rendered the official Lark entry in Chinese light/dark mode; the light snapshot was inspected.
- No real Feishu write was performed. Writes, timeout recovery and high-risk approval were exercised with mocks. Generic writes intentionally return null from readback and require a separate read query; historical pendingVerification remains.
