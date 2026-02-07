# Git Setup Guide

## ✅ Git Initialized Successfully!

Your project is now under version control with Git.

## What Was Done:

1. ✅ Created root `.gitignore` file
2. ✅ Initialized git repository (`git init`)
3. ✅ Added all files (`git add .`)
4. ✅ Made initial commit

### Important: `.env` file is NOT tracked! ✅
Your sensitive environment variables (MongoDB URI, JWT_SECRET, etc.) are safely ignored.

## Basic Git Commands:

### Check Status:
```bash
git status
```

### Stage Changes:
```bash
git add .                    # Stage all changes
git add filename.js          # Stage specific file
```

### Commit Changes:
```bash
git commit -m "Your commit message"
```

### View Commit History:
```bash
git log
git log --oneline           # Compact view
```

### View Changes:
```bash
git diff                    # Unstaged changes
git diff --staged           # Staged changes
```

### Create a Branch:
```bash
git branch feature-name     # Create branch
git checkout feature-name   # Switch to branch
# Or do both at once:
git checkout -b feature-name
```

### Switch Branches:
```bash
git checkout master         # Switch to master
git checkout -b new-feature # Create and switch
```

## Push to GitHub:

### Option 1: Using GitHub Desktop (Easiest)
1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select your project folder
5. Click "Publish repository"

### Option 2: Using Command Line

**Step 1: Create Repository on GitHub**
1. Go to https://github.com/new
2. Create a new repository named "double" (or any name)
3. Don't initialize with README (we already have files)

**Step 2: Connect and Push**
```bash
cd "e:\web apps\full stack\double"

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/double.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main          # Rename master to main (GitHub standard)
git push -u origin main     # Push and set upstream
```

**Subsequent pushes:**
```bash
git push
```

## Common Git Workflow:

```bash
# 1. Make changes to your code

# 2. Check what changed
git status

# 3. Stage changes
git add .

# 4. Commit with message
git commit -m "Add user authentication"

# 5. Push to GitHub
git push
```

## Typical Commit Messages:

- `"Initial commit"`
- `"Add user registration feature"`
- `"Fix login validation bug"`
- `"Update User model"`
- `"Refactor auth controller"`
- `"Add documentation"`

## Branch Strategy (for larger projects):

```
main (or master)    - Production-ready code
  └── develop       - Integration branch
      ├── feature/login
      ├── feature/dashboard
      └── bugfix/auth-issue
```

## Useful Git Commands:

### Undo Changes:
```bash
git checkout -- filename.js     # Discard changes in file
git reset HEAD filename.js      # Unstage file
git reset --hard HEAD           # Discard all changes (careful!)
```

### View Differences:
```bash
git diff filename.js            # See what changed
git show commit-hash            # View specific commit
```

### Remote Operations:
```bash
git fetch                       # Download remote changes
git pull                        # Fetch and merge
git push                        # Upload commits
```

## VSCode Git Integration:

VSCode has built-in Git support:
- **Source Control tab** (Ctrl+Shift+G) shows changes
- Click files to see diffs
- Stage/unstage with + and - buttons
- Enter message and click ✓ to commit
- Click ... for more options (push, pull, etc.)

## Important Files Being Ignored:

The following are NOT tracked by git (in `.gitignore`):
- `node_modules/` - Dependencies (too large)
- `.env` - Sensitive environment variables ⚠️
- `dist/` and `build/` - Generated files
- `.vscode/` - Editor settings
- `*.log` - Log files

## Checking Your Setup:

```bash
# View current status
git status

# View commit history
git log --oneline

# View remote connection
git remote -v

# View current branch
git branch
```

## Next Step: Push to GitHub

If you want to push to GitHub now:

1. Create a repository at https://github.com/new
2. Run:
```bash
cd "e:\web apps\full stack\double"
git remote add origin https://github.com/YOUR_USERNAME/your-repo-name.git
git branch -M main
git push -u origin main
```

Your code is now safely versioned with Git! 🎉
