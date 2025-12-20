# GitHub Actions Workflows

This directory contains the CI/CD pipeline configurations for the Order Management System.

## Workflows

### 1. **CI/CD Pipeline** (`ci.yml`)
Runs on every push to `main` and `develop` branches, and on pull requests.

**Jobs:**
- **Backend**: 
  - Installs dependencies
  - Sets up PostgreSQL test database
  - Runs backend tests
  - Environment: Node.js 18, PostgreSQL 15

- **Frontend**:
  - Installs dependencies
  - Runs frontend tests
  - Builds the React application
  - Uploads build artifact

- **Code Quality**:
  - Runs ESLint on backend and frontend code
  - Checks code style and best practices

- **Security**:
  - Runs Snyk security scan (requires `SNYK_TOKEN`)
  - Runs `npm audit` on both backend and frontend
  - Alerts on security vulnerabilities

- **Database**:
  - Validates database schema
  - Applies migrations
  - Verifies all tables are created correctly

- **Docker Build**:
  - Builds Docker images for backend and frontend
  - Only runs on successful completion of other jobs
  - Requires Docker Hub credentials (optional)

### 2. **Deployment** (`deploy.yml`)
Runs after successful CI/CD pipeline completion on the `main` branch.

**Jobs:**
- **Deploy**:
  - Downloads frontend build artifact
  - Executes deployment commands
  - Notifies deployment status

## Setup Instructions

### Required Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

1. **SNYK_TOKEN** (optional)
   - For security scanning
   - Get from: https://app.snyk.io

2. **DOCKER_USERNAME** (optional)
   - For Docker image pushes

3. **DOCKER_PASSWORD** (optional)
   - For Docker image pushes

### Environment Variables
The workflows automatically:
- Copy `.env.example` to `.env`
- Configure database for testing
- Set `NODE_ENV=test`

### Local Testing
Run workflows locally using `act`:

```bash
# Install act
brew install act  # macOS
choco install act # Windows

# Run all workflows
act

# Run specific workflow
act -j backend

# Run with specific event
act push
```

## Customization

### Database Setup
If your database schema or seeds change, update:
- `database/schema.sql`
- `database/seeds/*.sql`

### Test Configuration
To add tests:
1. Update `package.json` test script (backend)
2. Update `frontend/package.json` test script (frontend)
3. Add test files alongside source code

### Deployment
Customize the deploy job in `deploy.yml`:
- Add SSH deployment commands
- Configure cloud provider deployment (AWS, Azure, GCP, Heroku)
- Add notifications (Slack, Discord, Email)

### Branch Protection
Recommended GitHub branch protection rules for `main`:
- ✓ Require status checks to pass before merging
- ✓ Require branches to be up to date
- ✓ Dismiss stale pull request approvals
- ✓ Require review from code owners

## Troubleshooting

### Workflow Fails on `npm test`
If no tests are defined:
- Update `package.json` scripts: `"test": "jest"` or similar
- Or skip tests with: `"test": "echo 'No tests'"`

### PostgreSQL Connection Issues
- Check that DB_HOST matches the service name
- Verify port 5432 is available
- Wait for health check before running queries

### Docker Build Fails
- Ensure `Dockerfile.backend` and `Dockerfile` exist
- Check that Docker credentials are correctly set

### Snyk Scan Errors
- If Snyk token is invalid, the scan will be skipped
- To enable, add valid `SNYK_TOKEN` to secrets

## Logs and Monitoring
- View workflow runs: GitHub repo → Actions tab
- Check individual job logs for detailed information
- Inspect artifact downloads for build outputs

