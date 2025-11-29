# Canary Project - Remaining Work

This file tracks remaining work for the mcp-typescript-simple-canary project. This project serves as a breaking change detector for the `@mcp-typescript-simple` framework by consuming published npm packages.

---

## Project Status

### ✅ Completed

- [x] GitHub repository created: https://github.com/jdutton/mcp-typescript-simple-canary
- [x] Project scaffolded with `@mcp-typescript-simple@0.9.0` packages
- [x] Custom `current-timestamp` tool implemented with timezone support
- [x] Interface stability tests: **19/19 passing**
- [x] Type compatibility tests: **14/14 passing**
- [x] OAuth (GitHub) + Redis session management configured
- [x] Fixed vitest.config.ts workspace alias issue
- [x] Committed and pushed to GitHub
- [x] System tests (HTTP): **16/16 passing** - CORS issue identified and fixed
- [x] Scaffolding bug documented in `TODO-FEEDBACK.md` (git-ignored)

### ⚠️ Known Issues

- ~~System tests (HTTP): 2/16 passing~~ **RESOLVED** - Was a CORS configuration mismatch in scaffolding (see TODO-FEEDBACK.md)

---

## 🎯 Part A: Complete Canary Project Setup

### 1. Set Up Vercel Deployment

**Goal:** Deploy canary project to Vercel for production testing

**Steps:**
1. Configure Vercel project:
   ```bash
   cd /Users/jeff/Workspaces/mcp-typescript-simple-canary
   vercel link  # Link to Vercel account
   ```

2. Set environment variables in Vercel dashboard:
   - `TOKEN_ENCRYPTION_KEY` (copy from .env.local)
   - Optional: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`
   - Optional: OAuth credentials if testing auth flows

3. Test deployment:
   ```bash
   vercel --prod
   curl https://mcp-typescript-simple-canary.vercel.app/health
   ```

4. Document deployment URL in README.md

**Expected outcome:** Live canary server accessible at Vercel URL

---

### 2. Create GitHub Actions CI/CD Workflow

**Goal:** Automated validation pipeline that runs on every push

**Create:** `.github/workflows/canary-validation.yml`

**Workflow should:**
1. Run on push to main and pull requests
2. Install dependencies: `npm ci`
3. Run interface stability tests: `npm test -- test/interface-stability.test.ts`
4. Run type compatibility tests: `npm test -- test/type-compatibility.test.ts`
5. Run build: `npm run build`
6. Run lint: `npm run lint`
7. Run typecheck: `npm run typecheck`
8. Optional: Deploy to Vercel preview on PR

**Key features:**
- Fail fast on breaking changes
- Cache node_modules for speed
- Matrix testing (Node 18, 20, 22)
- Slack/email notification on failure

**Example workflow structure:**
```yaml
name: Canary Validation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  interface-stability:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm test -- test/interface-stability.test.ts
      - run: npm test -- test/type-compatibility.test.ts
```

**Expected outcome:** Green checkmark on GitHub commits, automated breaking change detection

---

### 3. ~~Investigate System Test Failures~~ ✅ COMPLETED

**Goal:** ~~Determine why HTTP system tests fail (14 failures)~~ **RESOLVED**

**Root Cause Identified:** CORS configuration mismatch in scaffolding
- Test client sent: `Origin: http://localhost:3000`
- Server allowed: `http://localhost:3020,http://localhost:3021`
- All requests rejected with "Not allowed by CORS"

**Fix Applied:**
```typescript
// test/system/utils.ts - Changed Origin header to match allowed origins
headers['Origin'] = 'http://localhost:3020';  // Was: 3000
```

**Result:** All 16 system tests now pass (100% success rate)

**Feedback:** Scaffolding bug documented in `TODO-FEEDBACK.md` for framework team

**Expected outcome:** ✅ Passing system tests achieved

---

### 4. Create Comprehensive README.md

**Goal:** Document canary project purpose and usage for contributors

**Sections to include:**

1. **Project Purpose:**
   - Breaking change detection for @mcp-typescript-simple
   - Uses published npm packages (not workspace)
   - Validates interface stability

2. **Architecture:**
   - Custom current-timestamp tool implementation
   - Interface stability tests (19 tests)
   - Type compatibility tests (14 tests)
   - System tests (investigate failures)

3. **Usage:**
   ```bash
   npm install
   npm test  # Run all tests
   npm run test:interface  # Interface stability
   npm run test:types      # Type compatibility
   ```

4. **Development:**
   - How to add new test cases
   - How to test against RC packages
   - How to update package versions

5. **CI/CD:**
   - GitHub Actions workflow
   - Daily automated runs
   - Breaking change notifications

6. **Deployment:**
   - Vercel URL
   - How to redeploy
   - Environment variables

**Expected outcome:** Clear documentation for future contributors

---

## 🎯 Part B: API Extractor Integration (Main Framework Repo)

**Note:** This work happens in `/Users/jeff/Workspaces/mcp-typescript-simple`, NOT in the canary project.

See: `/Users/jeff/Workspaces/mcp-typescript-simple/TODO.md` for these tasks:
- Install API Extractor
- Configure for 13 packages
- Add JSDoc annotations (@public/@beta/@alpha/@internal)
- Generate baseline API reports
- Update CI/CD to validate API stability

---

## 🎯 Part C: Documentation Updates (Main Framework Repo)

**Note:** This work happens in `/Users/jeff/Workspaces/mcp-typescript-simple`, NOT in the canary project.

1. Update main repo CHANGELOG.md:
   - Add entry for canary project creation
   - Document API Extractor integration
   - Note breaking change detection strategy

2. Update main repo README.md:
   - Add "API Stability" section
   - Link to canary project
   - Explain versioning strategy (@public/@beta/@alpha)

3. Update main repo docs/:
   - Add docs/api-stability.md guide
   - Document deprecation process
   - Explain semver commitment

---

## 📋 Testing Checklist

Before considering canary project complete:

- [x] Interface stability tests pass (19/19) ✅
- [x] Type compatibility tests pass (14/14) ✅
- [x] System tests investigated and resolved/documented (16/16 passing) ✅
- [ ] Vercel deployment working
- [ ] GitHub Actions CI/CD running daily
- [ ] README.md comprehensive
- [ ] Can upgrade to new @mcp-typescript-simple version and detect changes

---

## 🚀 Quick Start for New Claude Session

```bash
# Navigate to canary project
cd /Users/jeff/Workspaces/mcp-typescript-simple-canary

# Check current status
npm test                              # Run all tests
npx vibe-validate validate            # Run full validation

# Work on next task
# See sections above for detailed instructions
```

---

## 📞 Questions for User

When starting work on remaining tasks, clarify:

1. **Vercel deployment:** Use same Vercel account as main project?
2. **GitHub Actions:** Need Slack/email notifications? Which channel/address?
3. **System test failures:** High priority to fix or acceptable to document?
4. **Testing cadence:** Daily runs sufficient or need more frequent checks?

---

**Last Updated:** 2025-11-28
**Project:** mcp-typescript-simple-canary
**Framework Version:** @mcp-typescript-simple@0.9.0
