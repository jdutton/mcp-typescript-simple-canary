# Canary - Claude Code Guidance

## Project Overview

Production-ready MCP server built with `@mcp-typescript-simple` framework.

**Server Name:** Canary
**Description:** Production-ready MCP server with OAuth, LLM, and Docker
**Framework Version:** 0.9.0-rc.9
**Generated:** 2025-11-28

## Features

- ✅ Basic MCP tools (hello, echo, current-time)
- ✅ Docker deployment (nginx + Redis + multi-replica)
- ✅ Horizontal scalability with Redis session storage
- ✅ Validation pipeline (vibe-validate)
- 🔐 Unique encryption key generated for security

---

## CRITICAL: Environment Configuration

**BEFORE FIRST RUN:**

```bash
cp .env.example .env
# Edit .env and add your API keys
```

**🔐 Security:** The generated `TOKEN_ENCRYPTION_KEY` in `.env.example` is **UNIQUE to this server**. Keep it secret! Never commit `.env` files to git.

---

## Development Commands

### Development Modes
```bash
npm run dev:stdio        # STDIO mode (recommended for MCP Inspector)
npm run dev:http         # HTTP mode (skip auth - dev only)
```

### Testing
```bash
npm test                 # Unit tests
npm run test:ci          # Full CI test suite with coverage
```

### Deployment
```bash
docker-compose up        # Docker deployment (production-like)
```

### Validation
```bash
npm run validate         # Full validation (REQUIRED before commit)
npm run pre-commit       # Pre-commit workflow (sync + validate)
```

---

## Available Tools

### Basic Tools (Always Available)
- **hello** - Greet users by name
- **echo** - Echo back messages
- **current-time** - Get current timestamp

---

## Adding New Tools

### Step 1: Create Tool File
Create `src/tools/my-tool.ts`:

```typescript
import { Tool, type ToolDefinition } from '@mcp-typescript-simple/tools';
import { z } from 'zod';

export const myTool: ToolDefinition = {
  name: 'my-tool',
  description: 'Description of what this tool does',
  inputSchema: z.object({
    input: z.string().describe('Input parameter description'),
  }),
  execute: async (args) => {
    const { input } = args;

    // Your tool logic here
    const result = `Processed: ${input}`;

    return {
      content: [{ type: 'text', text: result }],
    };
  },
};
```

### Step 2: Register Tool
Edit `src/tools/index.ts`:

```typescript
import { myTool } from './my-tool.js';

// Add to registry
toolRegistry.register(myTool);
```

### Step 3: Add Test
Create `test/tools/my-tool.test.ts`:

```typescript
import { describe, test, expect } from 'vitest';
import { myTool } from '../../src/tools/my-tool.js';

describe('myTool', () => {
  test('processes input correctly', async () => {
    const result = await myTool.execute({ input: 'test' });
    expect(result.content[0].text).toContain('Processed: test');
  });
});
```

### Step 4: Validate
```bash
npm run validate
```

---

## Critical for HTTP Mode

**⚠️  ALWAYS pass `toolRegistry` to transport initialization:**

```typescript
// src/index.ts (line ~XX)
await transportManager.initialize(server, toolRegistry);
                                          ^^^^^^^^^^^^^
                                          CRITICAL!
```

**Why this matters:**
- HTTP mode creates fresh server instances for each request
- Session reconstruction requires tools to be re-registered
- Without `toolRegistry`, tools vanish on session reconnection

**Symptoms of missing `toolRegistry`:**
- Tools work initially but disappear after reconnection
- `tools/list` returns empty array after session resume
- "Server not initialized" errors

**See:** [Framework docs on Tool Registry for HTTP Mode](https://github.com/jdutton/mcp-typescript-simple/docs/getting-started/03-tool-registry-http-mode.md)

---

## HTTP Session Management

**Critical:** Session IDs come from HTTP headers, NOT JSON response body.

### Correct Session Flow

```bash
# 1. Initialize session - extract mcp-session-id from HEADER
curl -i -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{...},"id":"init"}'

# Response includes header:
# mcp-session-id: 550e8400-e29b-41d4-a716-446655440000

# 2. Subsequent requests - pass session ID in header
curl -X POST http://localhost:3000/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'mcp-session-id: 550e8400-e29b-41d4-a716-446655440000' \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":"list"}'
```

### Key Requirements
1. **Dual Accept header required:** `application/json, text/event-stream` (or 406 error)
2. **Session ID in header, not body:** Extract from `mcp-session-id` header
3. **Pass session in subsequent requests:** Use `mcp-session-id` header

**Common mistake:** Looking for session ID in JSON response body (it's not there!)

**See:** [Framework docs on HTTP Session Management](https://github.com/jdutton/mcp-typescript-simple/docs/getting-started/02-http-session-management.md)

---

## Common Tasks

---

## Framework Documentation

For complete framework documentation, see:
- [Getting Started Guide](https://github.com/jdutton/mcp-typescript-simple/docs/getting-started/)
- [HTTP Session Management](https://github.com/jdutton/mcp-typescript-simple/docs/getting-started/02-http-session-management.md)
- [Tool Registry for HTTP Mode](https://github.com/jdutton/mcp-typescript-simple/docs/getting-started/03-tool-registry-http-mode.md)
- [API Reference](https://github.com/jdutton/mcp-typescript-simple/docs/api/)

---

## Troubleshooting

### "TOKEN_ENCRYPTION_KEY not set"

**Solution:** Create `.env` from `.env.example`:
```bash
cp .env.example .env
```

### "Tools vanish on session reconnection"

**Solution:** Ensure `toolRegistry` is passed to `transportManager.initialize()`:
```typescript
await transportManager.initialize(server, toolRegistry);
```

### "Server not initialized" errors

**Solution:** Check that you're passing the `mcp-session-id` header in subsequent requests.

### "406 Not Acceptable" errors

**Solution:** Include dual Accept header: `Accept: application/json, text/event-stream`

---

**Last Updated:** 2025-11-28
**Framework Version:** 0.9.0-rc.9
