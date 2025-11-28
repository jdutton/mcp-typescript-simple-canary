# Scaffolding Tool Improvement Opportunities

Issues discovered while building the canary project that indicate improvements needed in `create-mcp-typescript-simple`:

## 1. Vitest Configuration - Workspace Path Aliases (HIGH PRIORITY)

**Issue:** The scaffolded `vitest.config.ts` includes workspace-style path aliases:

```typescript
resolve: {
  alias: {
    '@mcp-typescript-simple/tools': resolve(__dirname, '../tools/src'),
    '@mcp-typescript-simple/tools-llm': resolve(__dirname, '../tools-llm/src'),
    // ... etc
  }
}
```

**Problem:**
- These paths point to `../tools/src`, expecting a workspace structure
- For standalone projects using published npm packages, these aliases break module resolution
- Tests fail with "Cannot find module '@mcp-typescript-simple/tools'"

**Solution:**
- Remove `resolve.alias` configuration entirely from scaffolded projects
- Let Node.js/Vitest resolve @mcp-typescript-simple packages from node_modules
- The aliases are only needed for workspace development, not standalone projects

**Impact:** CRITICAL - prevents tests from running after scaffolding

**Fixed in canary by:** Removing entire `resolve.alias` block from vitest.config.ts

---

## 2. Scaffolding Into Existing Directory (MEDIUM PRIORITY)

**Issue:** Cannot scaffold into current directory:

```bash
cd my-existing-dir
npx create-mcp-typescript-simple@next . --yes
# ❌ Invalid project name - rejects "."
```

**Problem:**
- Common workflow: create GitHub repo, clone it, then scaffold into it
- Scaffolding tool rejects "." as invalid project name
- Forces creating nested directory instead of using current directory

**Expected behavior:**
```bash
cd mcp-typescript-simple-canary
npx create-mcp-typescript-simple@next . --yes
# ✅ Should scaffold into current directory
```

**Solution:**
- Accept "." as special case meaning "current directory"
- Use current directory name as project name
- Skip directory creation step if "." is specified

**Impact:** MEDIUM - workaround is to scaffold with temporary name then move files

**Workaround used:**
1. Scaffold with temporary name: `npx create-mcp-typescript-simple@next canary`
2. Move/rename to target directory

---

## 3. System Test Configuration - Port Conflicts (LOW PRIORITY)

**Potential issue** (not yet encountered, but noticed in scaffolded code):

The `vitest.system.config.ts` file includes:
```typescript
systemTest: {
  basePort: 3000
}
```

**Consideration:**
- If developer already has something on port 3000, system tests will fail
- Framework has self-healing port management (port-utils.ts)
- But new users might not know this

**Suggestion:**
- Add comment in scaffolded vitest.system.config.ts explaining port selection
- Or add "how to change ports" section to generated CLAUDE.md

**Impact:** LOW - self-healing ports already handle this, just documentation clarity

---

## Implementation Priority

1. **HIGH:** Fix vitest.config.ts workspace aliases (breaks tests immediately)
2. **MEDIUM:** Support scaffolding into current directory with "." argument
3. **LOW:** Improve documentation around port configuration

---

**Note:** These are NOT bugs in the framework itself, but improvements needed in the `create-mcp-typescript-simple` scaffolding tool to generate better standalone projects.
