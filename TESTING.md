# Automated Testing Configuration

This document describes the automated test build configuration for the Order Management System.

## Overview

The project includes automated tests that run on every push and pull request via GitHub Actions.

## Local Testing

### Backend Tests

Run backend tests locally:

```bash
# Install dependencies
npm install

# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with CI mode (single run, optimized for CI)
npm run test:ci
```

### Frontend Tests

Run frontend tests locally:

```bash
cd frontend

# Install dependencies
npm install

# Run all tests
npm test -- --watchAll=false

# Run tests in watch mode
npm test

# Run with coverage
npm test -- --coverage --watchAll=false
```

## Test Structure

### Backend Tests (`/tests`)

- **`server.test.js`** - Server health checks and basic functionality
  - Tests health endpoint
  - Tests 404 error handling
  - Tests API route availability

- **`auth.test.js`** - Authentication endpoints
  - Tests registration validation
  - Tests login functionality
  - Tests error handling

### Frontend Tests

Frontend tests use React Testing Library and Jest (configured automatically by Create React App).

Add test files alongside components:
```
src/
  components/
    Login/
      Login.tsx
      Login.test.tsx
```

## Test Coverage

### Coverage Thresholds

Current coverage thresholds (can be adjusted in `jest.config.js`):

```
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%
```

To view coverage report:

```bash
# Backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage --watchAll=false
```

## GitHub Actions Workflow

### Automated Runs

Tests automatically run when:

1. **Push to main/develop branches**
2. **Pull requests** to main/develop
3. **On schedule** (can be configured)

### Workflow Jobs

The CI pipeline includes:

| Job | Trigger | Purpose |
|-----|---------|---------|
| **backend** | Every push/PR | Run backend tests with PostgreSQL |
| **frontend** | Every push/PR | Run frontend tests and build |
| **code-quality** | Every push/PR | ESLint checks |
| **security** | Every push/PR | npm audit, Snyk scan |
| **database** | Every push/PR | Schema validation |
| **docker-build** | Main branch only | Build Docker images |

### Coverage Reports

Coverage reports are automatically uploaded to Codecov:

- Backend coverage: `coverage/lcov.info`
- Frontend coverage: `frontend/coverage/lcov.info`

View coverage badge: Add to README.md

```markdown
[![codecov](https://codecov.io/gh/CakeRemix/Order-management-system/branch/main/graph/badge.svg)](https://codecov.io/gh/CakeRemix/Order-management-system)
```

## Writing Tests

### Backend Test Example

```javascript
describe('Auth Routes', () => {
  it('should validate required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
      });
    
    expect([400, 500]).toContain(res.status);
  });
});
```

### Frontend Test Example

```typescript
import { render, screen } from '@testing-library/react';
import Login from './Login';

describe('Login Component', () => {
  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
```

## CI Environment Variables

Tests run with these environment variables automatically set:

**Backend:**
- `NODE_ENV=test`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=giu_food_truck_db_test`
- `JWT_SECRET=test_secret_key_minimum_32_chars_long`

**Frontend:**
- `CI=true` (prevents interactive watch mode)

## Troubleshooting

### Tests Fail in CI but Pass Locally

Common causes:

1. **Environment variables**: Check `.env` configuration
2. **Database**: PostgreSQL might not be ready
3. **Port conflicts**: Other services using test ports
4. **Dependencies**: Run `npm ci` instead of `npm install`

### Coverage Too Low

To improve coverage:

1. Add more test cases
2. Lower thresholds in `jest.config.js`
3. Use `npm test -- --coverage` to identify untested code

### Timeout Issues

Tests timeout after 10 seconds by default. To increase:

```javascript
// In jest.config.js
testTimeout: 30000 // 30 seconds
```

## Advanced Configuration

### Running Specific Tests

```bash
# Backend - single test file
npm test -- tests/auth.test.js

# Frontend - tests matching pattern
npm test -- --testNamePattern="Login"
```

### Debug Mode

```bash
# Backend
node --inspect-brk node_modules/.bin/jest

# Frontend
npm test -- --detectOpenHandles
```

### Parallel vs Sequential

Tests run in parallel by default. For sequential runs:

```bash
npm test -- --runInBand
```

## Next Steps

1. **Increase test coverage**: Aim for 80%+ coverage
2. **Add integration tests**: Test multiple components together
3. **Add E2E tests**: Use Cypress or Playwright for full workflows
4. **Set branch protection**: Require tests to pass before merge
5. **Monitor trends**: Use Codecov dashboards to track coverage over time

