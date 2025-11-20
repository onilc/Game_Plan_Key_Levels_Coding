# How to Setup a New Local Apps Script Project

Use this guide to replicate the "Professional Setup" for any other existing Google Apps Script project.

## 1. Initialize Project
Open your terminal in a **new empty folder** for your project.

```bash
# 1. Initialize Node.js project
npm init -y

# 2. Install tools (Clasp & Jest)
npm install --save-dev @google/clasp jest @types/google-apps-script @types/jest
```

## 2. Connect to Google
```bash
# 1. Login (if not already logged in)
npx clasp login

# 2. Clone your existing script
# Replace <SCRIPT_ID> with the ID from Project Settings
npx clasp clone <SCRIPT_ID>
```

## 3. Restructure (The "Professional" Part)
By default, `clasp` puts everything in the root. We want to organize it.

1.  **Create Folders**:
    ```bash
    mkdir src tests
    ```
2.  **Move Code**:
    *   Move all `.js` files (which `clasp` downloaded) into `src/`.
    *   Move `appsscript.json` into `src/`.

3.  **Update Config**:
    *   Open `.clasp.json`.
    *   Change `"rootDir"` to `"./src"`.

## 4. Copy Configuration Files
Copy these 5 essential files from your "Template" project (the one we just built) into your new project root:

1.  `jest.config.js` (Testing config)
2.  `jsconfig.json` (IntelliSense config)
3.  `.claspignore` (Tells clasp what NOT to upload)
4.  `.gitignore` (Tells git what NOT to save)
5.  `tests/gas-mocks.js` (The fake Google tools for testing)

## 5. Update package.json
Open `package.json` and replace the `"scripts"` section with this:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "push": "clasp push",
  "pull": "clasp pull",
  "open": "clasp open",
  "logs": "clasp logs"
}
```

## 6. Enable Testing (Optional but Recommended)
To test your code locally, you need to add the "Conditional Export" to the bottom of your `.js` files in `src/`:

```javascript
// Add this to the bottom of files you want to test
if (typeof module !== 'undefined') {
  module.exports = {
    myFunctionName,
    anotherFunction
  };
}
```

## 7. You're Done!
*   Run `npm run pull` to sync.
*   Run `npm test` to check code.
*   Run `npm run push` to save to Google.
