# GitHub Branch Protection Configuration

This file documents the recommended branch protection rules for the main branch.

## Recommended Settings

### For `main` Branch

**Go to:** Settings → Branches → Add rule → Pattern: `main`

#### Status Checks

- ✅ **Require status checks to pass before merging**
  - Select these checks:
    - `lint` (Code Quality)
    - `backend` (Backend Tests)
    - `frontend` (Frontend Tests & Build)
    - `security` (Security Checks)
    - `database` (Database Validation)
    - `build-status` (Build Status)

- ✅ **Require branches to be up to date before merging**

#### Pull Request Requirements

- ✅ **Require a pull request before merging**
  - Number of approving reviews: **1**
  - Dismiss stale pull request approvals when new commits are pushed: **Yes**
  - Require review from code owners: **Yes** (if `.github/CODEOWNERS` exists)

#### Restrictions

- ✅ **Include administrators** (enforces rules on admins too)
- ✅ **Restrict who can push to matching branches** (optional)

#### Auto-merge

- ✅ **Allow auto-merge** (users can auto-merge when tests pass)
  - Enable: `Squash and merge`, `Create a merge commit`, `Rebase and merge`

### For `develop` Branch

**Go to:** Settings → Branches → Add rule → Pattern: `develop`

Use same settings as `main` but allow auto-merge for easier development flow.

## Implementation Script

You can enforce these via GitHub CLI:

```bash
# Requires GitHub CLI installed: https://cli.github.com/

gh repo rule create \
  --name "Require PR before merge" \
  --branch-name-pattern "main" \
  --required-approving-review-count 1 \
  --require-code-owner-review true \
  --dismiss-stale-reviews true

gh repo rule create \
  --name "Require status checks" \
  --branch-name-pattern "main" \
  --required-status-checks \
    "lint" \
    "backend" \
    "frontend" \
    "security" \
    "database" \
    "build-status"
```

## Visual Summary

```
┌─ Pushing to main ─────────────┐
│                               │
│  1. Create pull request       │
│  2. Pass CI tests             │
│     ├─ lint ✅                │
│     ├─ backend ✅             │
│     ├─ frontend ✅            │
│     ├─ security ✅            │
│     ├─ database ✅            │
│     └─ build-status ✅        │
│  3. Get 1 approval            │
│  4. Merge                     │
│                               │
└───────────────────────────────┘
```

## Merging Strategies

### Recommended: Squash and Merge

```
Before:
  main ─────────○ (parent)
  feat       ┌─ ○ ─ ○ (3 commits)
             │
After:
  main ───────────────○ (merged as 1 commit)
```

Benefits:
- Clean history on main
- Easy to revert changes
- Each feature is one commit

### Alternative: Create a Merge Commit

Preserves full commit history from feature branch.

Use when: You want to see all individual commits.

### Avoid: Rebase and Merge

Can cause issues with GitHub tracking and CI reruns.

## CODEOWNERS File

Create `.github/CODEOWNERS` to require specific reviews:

```
# Default owners for everything
* @CakeRemix

# Backend changes
/backend/ @CakeRemix
/database/ @CakeRemix

# Frontend changes
/frontend/ @CakeRemix

# CI/CD changes
/.github/workflows/ @CakeRemix
```

## Bypassing Protection

Only repository admins with "Bypass branch protection" permission can bypass.

To allow specific users to bypass:
- Settings → Branches → Dismiss stale reviews → Allow specified actors
- Add users/teams that should be able to bypass

## Auto-Merge Configuration

When auto-merge is enabled on a branch:

1. **Enable for PR:**
   ```bash
   gh pr merge <number> --auto --squash
   ```

2. **Automatically merges when:**
   - All CI checks pass ✅
   - All required reviews obtained ✅
   - Branch is up to date ✅

3. **Benefits:**
   - Hands-off merging
   - Prevents race conditions
   - Keeps PR fresh

## Enforcement Best Practices

1. **Always require PR review** - Even admins benefit from peer review
2. **Status checks required** - Prevents broken code
3. **Up-to-date branches** - Tests run on latest code
4. **Limited force pushes** - Prevents accidentally breaking main
5. **Audit trail** - GitHub logs all branch changes

## Monitoring Protection

### View Protection Status

```bash
gh repo view --json branchProtectionRules
```

### Recent Merges

```bash
gh pr list --state merged --limit 10 --base main
```

### Protection Bypasses

Admins receive notifications when protection is bypassed.

View audit log:
- Settings → Audit log
- Search: "branch_protection_rule"

