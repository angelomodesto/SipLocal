# Branch Management Guide

This guide explains how to properly create, switch between, and manage feature branches for the SipLocal project.

## Current Branches

- **`main`**: Base branch (production-ready code only)
- **`database_test_setup`**: Database schema and Yelp API integration ✅ Complete
- **`landing_page`**: UI/landing page work ⏳ In progress

## Proper Branch Workflow

### Step 1: Always Start from Updated Main

Before creating a new feature branch, always ensure you're on the latest main:

```bash
# Switch to main branch
git checkout main

# Pull latest changes from remote
git pull origin main

# Verify you're up to date
git status
```

### Step 2: Create a New Feature Branch

Create a descriptive branch name that indicates the feature:

```bash
# Create and switch to new branch
git checkout -b feature-name

# Examples:
# git checkout -b business-cards
# git checkout -b search-feature
# git checkout -b business-detail-page
# git checkout -b leaderboard
```

**Branch Naming Convention:**
- Use descriptive names: `feature-business-cards`, `feature-search`, `fix-card-layout`
- Use kebab-case (hyphens): `business-cards` not `business_cards` or `businessCards`
- Prefix with type: `feature-`, `fix-`, `refactor-` (optional but helpful)

### Step 3: Verify You're on the Correct Branch

Always confirm which branch you're working on:

```bash
# See current branch (marked with *)
git branch

# Or see all branches including remote
git branch -a

# See current branch in status
git status
```

### Step 4: Work on Your Feature

Make changes, commit frequently:

```bash
# Make your changes...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add business card component with rating display"

# Push to remote
git push origin feature-name
```

### Step 5: Switch Between Branches

When working on multiple features, switch branches safely:

```bash
# Save your work first (commit or stash)
git add .
git commit -m "WIP: current progress"

# Switch to another branch
git checkout other-branch-name

# Switch back
git checkout feature-name
```

**Important:** If you have uncommitted changes, Git may prevent you from switching. Either:
- Commit your changes first
- Or use `git stash` to temporarily save them

### Step 6: Keep Your Branch Updated

If main has new changes while you're working:

```bash
# Make sure you're on your feature branch
git checkout feature-name

# Merge latest main into your branch
git merge main

# If conflicts occur, resolve them, then:
git add .
git commit -m "Merge main into feature-name"
```

### Step 7: Push Regularly

Push your branch to remote regularly:

```bash
# Push current branch
git push origin feature-name

# If branch doesn't exist on remote yet, set upstream:
git push -u origin feature-name
```

## Common Branch Operations

### List All Branches
```bash
# Local branches only
git branch

# All branches (local and remote)
git branch -a
```

### Delete a Branch
```bash
# Delete local branch (after merging)
git branch -d feature-name

# Force delete (if not merged)
git branch -D feature-name

# Delete remote branch
git push origin --delete feature-name
```

### Rename a Branch
```bash
# Rename current branch
git branch -m new-name

# Rename specific branch
git branch -m old-name new-name
```

## Recommended Branch Structure

### Feature Branches (One per feature):
- `feature-business-cards` - Card component implementation
- `feature-business-detail` - Business detail page
- `feature-search` - Search functionality
- `feature-filtering` - Filter and sort features
- `feature-leaderboard` - Leaderboard view
- `feature-ai-summary` - AI summary integration
- `feature-user-profiles` - User profile pages
- `feature-owner-dashboard` - Business owner dashboard

### Bug Fix Branches:
- `fix-card-layout` - Fix card layout issues
- `fix-search-bug` - Fix search functionality bug

### Refactor Branches:
- `refactor-api-routes` - Refactor API routes
- `refactor-components` - Refactor component structure

## Best Practices

### ✅ DO:
- **Always start from updated main** before creating new branches
- **Use descriptive branch names** that explain the feature
- **Commit frequently** with clear messages
- **Push regularly** to backup your work
- **Test before merging** to main
- **Delete merged branches** to keep repo clean
- **One feature per branch** - don't mix features

### ❌ DON'T:
- **Don't commit directly to main** - always use feature branches
- **Don't work on multiple features in one branch** - create separate branches
- **Don't forget to pull latest main** before creating new branches
- **Don't merge broken code** - test first
- **Don't use vague branch names** like "fix" or "stuff"
- **Don't leave branches unmerged indefinitely**

## Quick Reference

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature-name

# Work on feature
git add .
git commit -m "Description"
git push origin feature-name

# Switch branches
git checkout other-branch

# Update branch with latest main
git checkout feature-name
git merge main

# Merge to main (when ready)
git checkout main
git pull origin main
git merge feature-name
git push origin main
```

## Troubleshooting

### "Cannot switch branches: uncommitted changes"
```bash
# Option 1: Commit your changes
git add .
git commit -m "WIP: current progress"

# Option 2: Stash changes temporarily
git stash
git checkout other-branch
# Later, restore: git stash pop
```

### "Branch is behind main"
```bash
# Merge latest main into your branch
git checkout feature-name
git merge main
```

### "Conflicts during merge"
```bash
# Git will show conflicted files
# Open files and resolve conflicts manually
# Remove conflict markers (<<<<<<, ======, >>>>>>)
# Then:
git add .
git commit -m "Resolve merge conflicts"
```

## Current Workflow Checklist

When starting a new feature:

- [ ] Switch to main: `git checkout main`
- [ ] Pull latest: `git pull origin main`
- [ ] Create feature branch: `git checkout -b feature-name`
- [ ] Verify branch: `git branch`
- [ ] Start working on feature
- [ ] Commit frequently with clear messages
- [ ] Push regularly: `git push origin feature-name`
- [ ] Test thoroughly before merging to main

This ensures clean, organized development with proper branch management.

