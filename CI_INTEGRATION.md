# CI/CD Test Integration Guide

This document details how tests are integrated with the GitHub Actions CI pipeline.

## Overview

The CI/CD pipeline automatically runs tests on:
- ✅ Every push to `main` or `develop` branches
- ✅ Every pull request to `main` or `develop`
- ✅ Test results are reported to PRs and GitHub Actions dashboard

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions CI                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     Lint     │  │   Backend    │  │  Frontend    │     │
│  │   (ESLint)   │  │   (Jest)     │  │   (Jest)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                  │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌─────────────┐  ┌────────────┐  ┌──────────────┐       │
│    │  Security   │  │  Database  │  │ Build Status │       │
│    │  (npm audit)│  │ (Schema)   │  │   Check      │       │
│    └─────────────┘  └────────────┘  └──────────────┘       │
│                           │                                  │
│                    ┌──────┴──────┐                          │
│                    │             │                          │
│              ✅ PASS       ❌ FAIL                           │
│                    │             │                          │
│           ┌────────┴────┐   [BLOCKED]                       │
│           │             │                                   │
│    ┌──────────────┐  Coverage                               │
│    │ Docker Build │  Reports                                │
│    └──────────────┘                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Job Details

### 1. **Lint Job** (Code Quality)
- Runs ESLint on backend code
- Checks for style and best practices
- Non-blocking (continues on error)

**Triggers:** Every push and PR

### 2. **Backend Job** (Tests + Coverage)
- Runs Jest test suite with PostgreSQL
- Generates coverage reports
- Uploads to Codecov
- Posts PR comment with coverage metrics

**Key Steps:**
- Setup PostgreSQL 15 service
- Install dependencies (`npm ci`)
- Create test environment (`.env`)
- Wait for database readiness
- Run tests: `npm run test:ci`
- Upload artifacts and coverage

**Triggers:** Every push and PR  
**Blocks:** Main branch merge if failed

### 3. **Frontend Job** (Tests, Build + Coverage)
- Runs React component tests
- Builds production bundle
- Generates coverage reports
- Uploads build artifact (7-day retention)

**Key Steps:**
- Install dependencies
- Run tests with coverage
- Build frontend app
- Upload build and test results

**Triggers:** Every push and PR  
**Blocks:** Main branch merge if failed

### 4. **Security Job** (Vulnerability Scan)
- Runs `npm audit` on backend and frontend
- Optional Snyk security scan (requires SNYK_TOKEN)
- Non-blocking (informational)

**Triggers:** Every push and PR

### 5. **Database Job** (Schema Validation)
- Validates database schema syntax
- Verifies all tables are created
- Tests database connectivity

**Triggers:** Every push and PR  
**Blocks:** Main branch merge if failed

### 6. **Build Status Job** (Gate)
- Aggregates all job results
- Fails if lint, backend, or frontend fail
- Prevents Docker build on failure

**Triggers:** After all other jobs

### 7. **Docker Build Job** (Containerization)
- Builds Docker images for backend and frontend
- Pushes to GitHub Container Registry
- Only runs on main branch after successful tests

**Triggers:** Main branch push only  
**Requires:** All tests passing

## Test Artifacts

### Uploaded Artifacts

| Artifact | Location | Retention | Purpose |
|----------|----------|-----------|---------|
| Backend Test Results | `test-results/junit.xml` | Until workflow expires | Test reporting |
| Backend Coverage | `coverage/lcov.info` | Until workflow expires | Coverage metrics |
| Frontend Build | `frontend/build/` | 7 days | Deployment |
| Frontend Test Results | `frontend/junit.xml` | Until workflow expires | Test reporting |
| Frontend Coverage | `frontend/coverage/lcov.info` | Until workflow expires | Coverage metrics |

### Access Artifacts

1. Go to GitHub Actions → Workflow run
2. Scroll to "Artifacts" section
3. Click artifact name to download

## Coverage Reporting

### Codecov Integration

Coverage reports are automatically sent to Codecov:

1. View coverage on: `codecov.io/gh/CakeRemix/Order-management-system`
2. Coverage badge available at: 
   ```markdown
   [![codecov](https://codecov.io/gh/CakeRemix/Order-management-system/branch/main/graph/badge.svg)](https://codecov.io/gh/CakeRemix/Order-management-system)
   ```

### Coverage Thresholds

Current thresholds in `jest.config.js`:
- **Lines**: 50%
- **Branches**: 50%
- **Functions**: 50%
- **Statements**: 50%

To increase thresholds:
```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

## PR Integration

### Automated Comments

The CI pipeline posts PR comments with:
- ✅ Backend test coverage percentages
- ✅ Build status
- ✅ Coverage comparison

Example:
```
## Backend Test Results
- **Lines Coverage**: 65%
- **Branch Coverage**: 58%
```

### Status Checks

GitHub shows CI status in PR:
- 🟡 **Pending** - Jobs running
- ✅ **Pass** - All jobs passed
- ❌ **Fail** - At least one job failed
- ⊘ **Skipped** - Job was skipped

## Environment Variables

### Automatically Set in CI

**Backend Tests:**
```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=giu_food_truck_db_test
JWT_SECRET=test_secret_key_minimum_32_chars_long
```

**Frontend Tests:**
```env
CI=true
```

## Test Configuration

### Jest Configuration (Backend)

File: `jest.config.js`

```javascript
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: ['backend/**/*.js'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './test-results',
      outputName: 'junit.xml'
    }]
  ],
  testTimeout: 10000,
  // ... other config
}
```

### Running Tests Locally to Match CI

```bash
# Backend - exactly as CI runs
npm run test:ci

# Frontend - with coverage like CI
cd frontend
npm test -- --watchAll=false --coverage
```

## Failure Handling

### If Tests Fail

1. **Check the workflow run:**
   - Go to Actions → Failed workflow
   - Click job name to see logs
   - Search for error message

2. **Common issues:**

| Issue | Solution |
|-------|----------|
| PostgreSQL timeout | Increase wait time in workflow |
| Port conflicts | Check for local services on ports |
| Module not found | Run `npm ci` instead of `npm install` |
| Coverage too low | Add more tests or lower threshold |
| Timeout error | Increase `testTimeout` in jest.config.js |

### Blocking Merges

Tests that block PR merges:
- ✅ Backend tests failing
- ✅ Frontend tests failing  
- ✅ Database schema validation failing
- ✅ Build status check failing

Tests that DON'T block:
- ⊘ Lint warnings
- ⊘ Security warnings
- ⊘ Snyk scan failures

## Advanced Configuration

### Skip CI for Specific Commits

Add to commit message:
```
[skip ci]
```

### Conditional Job Execution

```yaml
# Only run on main branch
if: github.ref == 'refs/heads/main'

# Only run on PRs
if: github.event_name == 'pull_request'

# Only run if previous jobs succeeded
needs: [backend, frontend]
```

### Custom Reporters

Jest outputs multiple report formats:
- `text` - Console output
- `lcov` - Code coverage
- `cobertura` - CI reporting
- `junit` - JUnit XML format

## Monitoring and Alerts

### GitHub Actions Workflow Status

View at: https://github.com/CakeRemix/Order-management-system/actions

### Setting Up Notifications

1. Go to GitHub repo Settings
2. Click "Notifications"
3. Configure alerts for failed workflows

### Branch Protection Rules

Recommended settings for `main`:
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date
- ✅ Dismiss stale pull request approvals
- ✅ Require review from code owners

Configure at: Settings → Branches → main → Edit

## Performance Optimization

### Cache Strategy

The workflow caches:
- npm dependencies (`node_modules/`)
- npm cache

**Cache keys:**
- `npm-${{ hashFiles('**/package-lock.json') }}`

Caches are automatically invalidated when `package-lock.json` changes.

### Parallel Execution

Jobs run in parallel when possible:
- Lint + Backend + Frontend run simultaneously
- Security + Database run after lint/backend/frontend
- Docker build runs last

Total time: ~5-10 minutes (varies with image builds)

## Troubleshooting

### Workflow won't trigger

Check:
- Branch name matches `main` or `develop`
- Push to correct branch
- No `[skip ci]` in commit message

### Tests pass locally but fail in CI

Common causes:
- Environment variable differences
- Missing npm cache
- PostgreSQL not ready
- Port already in use

Fix:
```bash
# Simulate CI environment exactly
npm ci  # Not npm install
NODE_ENV=test npm run test:ci
```

### Coverage reports not appearing

- Wait 5-10 minutes for Codecov to process
- Check Codecov settings: codecov.io → settings
- Ensure Codecov token is valid

