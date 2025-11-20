# Debug Checklist for Homepage 404 Issue

## Issues Found:
1. ✅ Branch is up to date with GitHub
2. ✅ Files exist (`src/app/page.tsx`, `src/app/layout.tsx`)
3. ✅ Components exist and are importable
4. ⚠️ Build output shows "Route (pages)" instead of "Route (app)" 
5. ⚠️ Build only shows `/404` route, not `/` homepage route

## Debug Steps:

### 1. Check Dev Server Output
```powershell
# Stop any running dev servers
Get-Process -Name node | Stop-Process -Force

# Start fresh dev server and watch for errors
npm run dev
```
Visit `http://localhost:3000` or `http://localhost:3001` and check browser console for errors.

### 2. Verify File Encoding
Windows might have encoding issues. Check if files are UTF-8:
```powershell
Get-Content "src/app/page.tsx" -Encoding UTF8 | Select-Object -First 5
```

### 3. Reinstall Dependencies
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### 4. Check for Hidden Characters
The build output showing "Route (pages)" suggests Next.js might be confused. Verify:
- No `pages` directory exists
- `src/app` directory structure is correct
- File names are exactly `page.tsx` and `layout.tsx` (case-sensitive)

### 5. Test with Minimal Page
Try temporarily replacing `src/app/page.tsx` with a minimal version:
```tsx
export default function Home() {
  return <div>Hello World</div>
}
```

### 6. Check Windows Path Length
Windows has a 260 character path limit. Verify your project path isn't too long.

### 7. Compare with Teammate's Environment
Ask your teammate to share:
- Node version: `node --version`
- npm version: `npm --version`
- Operating system
- Whether they're using WSL or native Mac/Linux








