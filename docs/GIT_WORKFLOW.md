# Git Workflow Guide

This guide explains how to manage branches, merge code, and keep your project organized in Git.

## Current Branch Strategy

### Branch Structure:
- **`main`**: Production-ready, stable code (only merge completed features)
- **`database_test_setup`**: Database schema and Yelp API integration (currently in progress)
- **`landing_page`**: UI/landing page work (currently in progress)
- **Feature branches**: One branch per feature, merge when MVP ready

### Rule: Don't merge to `main` until a feature is MVP-ready

---

## Basic Git Commands

### Check Current Status
```bash
# See what branch you're on and what files have changed
git status

# See all branches (local and remote)
git branch -a

# See commit history
git log --oneline --graph --all
```

---

## Working on a Feature Branch

### Step 1: Create a New Feature Branch
```bash
# Switch to main branch first
git checkout main

# Get the latest changes from remote
git pull origin main

# Create and switch to a new feature branch
git checkout -b feature-name

# Example: git checkout -b business-cards
```

### Step 2: Make Changes and Commit
```bash
# Make your code changes (edit files, create new files, etc.)

# Check what files have changed
git status

# Stage all changes (or specific files)
git add .
# OR
git add src/app/page.tsx

# Commit with a descriptive message
git commit -m "Add business card component with rating display"

# Push to remote repository
git push origin feature-name
```

### Step 3: Continue Working
```bash
# Make more changes...

# Stage and commit again
git add .
git commit -m "Add AI summary to business cards"

# Push again
git push origin feature-name
```

---

## Merging a Feature Branch to Main

### When to Merge:
- Feature is complete and working
- Feature is MVP-ready (minimum viable product)
- Code has been tested
- No breaking changes

### How to Merge:

#### Option 1: Merge Locally and Push
```bash
# Step 1: Switch to main branch
git checkout main

# Step 2: Get latest changes from remote
git pull origin main

# Step 3: Merge your feature branch
git merge feature-name

# Step 4: Push to remote
git push origin main

# Step 5: (Optional) Delete the feature branch after merging
git branch -d feature-name
git push origin --delete feature-name
```

#### Option 2: Use Pull Request (Recommended if using GitHub)
1. Push your feature branch to remote:
   ```bash
   git push origin feature-name
   ```

2. Go to GitHub and create a Pull Request:
   - Click "New Pull Request"
   - Select `feature-name` → `main`
   - Add description of changes
   - Review changes
   - Click "Merge Pull Request"

3. Delete the branch after merging (via GitHub interface)

---

## Managing Multiple Branches

### Current Branch Status:
- **`database_test_setup`**: ✅ Ready to merge (database schema + Yelp integration complete)
- **`landing_page`**: ⏳ In progress (UI work)
- **`main`**: Base branch

### Recommended Workflow:

1. **Keep working on feature branches** until MVP ready
2. **Merge one feature at a time** to main
3. **Always pull latest main** before creating new branch
4. **Test before merging** to main
5. **Use descriptive commit messages**

---

## Common Scenarios

### Scenario 1: Starting a New Feature
```bash
# Make sure you're on main
git checkout main

# Get latest changes
git pull origin main

# Create new branch
git checkout -b new-feature-name

# Start working...
```

### Scenario 2: Switching Between Branches
```bash
# Save your work first (commit or stash)
git add .
git commit -m "WIP: working on feature"

# Switch to another branch
git checkout other-branch

# Switch back
git checkout new-feature-name
```

### Scenario 3: Merging Latest Main into Your Feature Branch
```bash
# You're on your feature branch
git checkout feature-name

# Merge latest main into your branch
git merge main

# Resolve any conflicts if they occur
# Then continue working
```

### Scenario 4: Undoing a Merge (if something goes wrong)
```bash
# If you just merged and want to undo
git reset --hard HEAD~1

# BE CAREFUL: This discards the merge commit
```

---

## Best Practices

### ✅ DO:
- **Commit often** with clear messages
- **Pull before pushing** to avoid conflicts
- **Test before merging** to main
- **Use descriptive branch names** (e.g., `business-cards`, `search-feature`)
- **Keep commits focused** (one feature or fix per commit)
- **Write clear commit messages** (e.g., "Add business card component" not "stuff")

### ❌ DON'T:
- **Don't commit directly to main** (use feature branches)
- **Don't merge broken code** to main
- **Don't force push** to main (use `git push --force` only on feature branches)
- **Don't delete main branch**
- **Don't commit sensitive data** (API keys, passwords - use `.env.local`)

---

## Resolving Conflicts

### When Conflicts Occur:
```bash
# If you get a conflict during merge
git merge feature-name

# Git will show which files have conflicts
# Open the files and look for conflict markers:
# <<<<<<< HEAD
# (code from main)
# =======
# (code from feature branch)
# >>>>>>> feature-name

# Edit the file to resolve conflicts
# Remove the conflict markers
# Keep the code you want

# Stage the resolved file
git add filename

# Complete the merge
git commit
```

---

## Quick Reference Cheat Sheet

```bash
# Check status
git status

# See branches
git branch -a

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout branch-name

# Stage changes
git add .

# Commit
git commit -m "Description"

# Push
git push origin branch-name

# Pull latest
git pull origin branch-name

# Merge to main
git checkout main
git pull origin main
git merge feature-name
git push origin main

# See commit history
git log --oneline --graph --all
```

---

## Current Project Status

### Branches:
- **`main`**: Base branch (initial Next.js setup)
- **`database_test_setup`**: ✅ Complete - Database schema + Yelp API integration
- **`landing_page`**: ⏳ In progress - UI work

### Next Steps:
1. Complete work on `landing_page` branch
2. Test the feature
3. Merge `landing_page` to `main` when ready
4. Continue with new feature branches as needed

---

## Troubleshooting

### "Your branch is ahead of origin/main by X commits"
- This means you have local commits not pushed yet
- Push them: `git push origin main`

### "Your branch is behind origin/main by X commits"
- This means remote has commits you don't have
- Pull them: `git pull origin main`

### "Cannot merge: you have uncommitted changes"
- Commit or stash your changes first
- `git add .` then `git commit -m "message"`
- OR `git stash` to save changes temporarily

### "Merge conflict"
- Follow the conflict resolution steps above
- Ask for help if stuck!

---

This workflow keeps your codebase organized and allows you to work on multiple features without breaking the main branch.

