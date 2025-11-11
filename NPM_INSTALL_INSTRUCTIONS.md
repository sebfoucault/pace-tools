# NPM Installation Instructions

## Important: Use --legacy-peer-deps

Due to a TypeScript version conflict between `react-scripts@5.0.1` (which requires TypeScript 3.x or 4.x) and the project's TypeScript 5.x, you **must** use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

## Why This Is Needed

- **react-scripts@5.0.1** requires: `typescript@"^3.2.1 || ^4"`
- **Project uses**: `typescript@"^5.2.2"`
- The `--legacy-peer-deps` flag tells npm to bypass this peer dependency check

## Running Regular Commands

After installation, regular commands work normally:

```bash
npm start              # Start development server
npm test               # Run tests
npm run build          # Build for production
```

## Adding New Packages

When installing new packages, also use `--legacy-peer-deps`:

```bash
npm install <package-name> --legacy-peer-deps
```

## Alternative Solutions

If you want to avoid using `--legacy-peer-deps`, you could:

1. **Downgrade TypeScript to 4.9.5** (tested and working):
   ```bash
   npm install typescript@4.9.5 --save-dev
   npm install
   ```

2. **Upgrade react-scripts** (when a version supporting TypeScript 5 is released)

For now, the `--legacy-peer-deps` approach is the simplest and most reliable solution.

## Current Status

✅ All 1394 packages installed successfully
✅ All 67 tests passing
✅ Application runs without issues
⚠️ 9 vulnerabilities (3 moderate, 6 high) - mostly in dev dependencies

To check vulnerabilities: `npm audit`
