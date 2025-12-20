# Quick Reference: CI/Test Integration

## For Developers

### Before Committing

```bash
# Run all tests locally (matches CI)
npm run test:ci

# Check code quality
npx eslint . --ext .js

# Frontend tests
cd frontend
npm test -- --watchAll=false --coverage
cd ..
```

### Common Commands

```bash
# Run backend tests (watch mode)
npm run test:watch

# Run frontend tests (interactive)
cd frontend
npm test
cd ..

# Run full build
npm run build

# View test coverage
npm test -- --coverage
cat coverage/coverage-summary.json
```

## PR Checklist

Before pushing:
- [ ] All tests pass locally: `npm run test:ci`
- [ ] Code follows style: `npx eslint .`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] No console errors
- [ ] Updated TESTING.md if tests changed
- [ ] Commit message is clear

## CI Pipeline at a Glance

| Stage | Duration | Status |
|-------|----------|--------|
| Lint | ~1 min | Must pass |
| Backend tests | ~3 min | Must pass |
| Frontend tests | ~2 min | Must pass |
| Security scan | ~1 min | Warning only |
| Database | ~1 min | Must pass |
| Build status | ~10s | Must pass |
| Docker build | ~5 min | Main only |

**Total: ~5-15 minutes** (depending on system load)

## Troubleshooting

### "Tests pass locally but fail in CI"

```bash
# Simulate exact CI environment
npm ci  # Clean install, not npm install

# Run tests as CI does
NODE_ENV=test npm run test:ci
```

### "Port 5432 already in use"

```bash
# Check what's using it
lsof -i :5432

# Stop the service
sudo systemctl stop postgresql  # Linux
brew services stop postgresql  # macOS
```

### "Can't connect to database"

```bash
# Verify PostgreSQL is running
psql -U postgres

# Check connection string in .env
cat .env | grep DB_
```

### "Coverage too low"

```bash
# View what's not covered
npm test -- --coverage
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
```

## File Structure for Tests

```
├── tests/
│   ├── setup.js              # Shared test configuration
│   ├── server.test.js        # Server tests
│   ├── auth.test.js          # Auth tests
│   └── ...other.test.js      # Add more tests
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Login.test.tsx  # Component tests
├── jest.config.js            # Jest configuration
└── package.json              # Test scripts
```

## Writing a New Test

### Backend (server.test.js)

```javascript
describe('My Feature', () => {
  it('should do something', async () => {
    const res = await request(app)
      .post('/api/my-endpoint')
      .send({ data: 'test' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });
});
```

### Frontend (component.test.tsx)

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render content', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Status Badges for README

```markdown
# CI Status

[![CI/CD Pipeline](https://github.com/CakeRemix/Order-management-system/workflows/CI%2FCD%20Pipeline/badge.svg)](https://github.com/CakeRemix/Order-management-system/actions)
[![codecov](https://codecov.io/gh/CakeRemix/Order-management-system/branch/main/graph/badge.svg)](https://codecov.io/gh/CakeRemix/Order-management-system)
```

## Environment Variables

### Local Development (.env)

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=giu_food_truck_db
JWT_SECRET=your_secret_key
```

### Test Environment (automated in CI)

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=giu_food_truck_db_test
JWT_SECRET=test_secret_key_minimum_32_chars_long
```

## Useful Links

- **Actions Dashboard:** https://github.com/CakeRemix/Order-management-system/actions
- **Code Coverage:** https://codecov.io/gh/CakeRemix/Order-management-system
- **Workflow File:** `.github/workflows/ci.yml`
- **Test Config:** `jest.config.js`
- **Full Guide:** See `CI_INTEGRATION.md` and `TESTING.md`

## Getting Help

1. Check workflow logs: Actions → Workflow run → Job name
2. Read error message carefully
3. Run test locally to reproduce
4. Check documentation in `CI_INTEGRATION.md`
5. Ask team members for help

