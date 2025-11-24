# Manual Deployment to Google Apps Script

Since PowerShell execution policy is blocking `clasp push`, you'll need to manually copy the code to Google Apps Script.

## Steps to Deploy

1. **Open your Google Sheet**
   - Go to your trading journal Google Sheet

2. **Open Apps Script Editor**
   - Click **Extensions** > **Apps Script**

3. **Find the Code.gs file**
   - In the Apps Script editor, look for the file that contains your Pine Script generation code
   - It's likely named `Code.gs` or similar

4. **Copy the Updated Code**
   - Open the file: [`Gameplan_Code_For_TradingView.js`](file:///c:/Scripts/Game_Plan_Key_Levels_Coding/Key_Levels_App/src/Gameplan_Code_For_TradingView.js)
   - Select all the code (Ctrl+A)
   - Copy it (Ctrl+C)

5. **Paste into Google Apps Script**
   - In the Apps Script editor, select all the existing code in Code.gs (Ctrl+A)
   - Paste the new code (Ctrl+V)
   - Click the **Save** icon (💾) or press Ctrl+S

6. **Test the Fix**
   - Go back to your Google Sheet
   - Click **Pine Script** > **Preview TV Code**
   - Copy the generated code
   - Paste it into TradingView
   - Verify the gap calculation is correct during both pre-market and market hours

## What Changed

The gap calculation now uses conditional logic:

```javascript
// Pre-market: Use today's daily close (shows yesterday's 4pm)
// Market hours: Use close[1] (shows yesterday's close correctly)
prevClose = isPastMarketOpen ? prevDayClose : todayDayClose
```

This ensures the gap is always calculated against yesterday's actual 4pm close, not 2 days ago.

## Alternative: Fix PowerShell Execution Policy

If you want to use `clasp push` in the future, you can enable PowerShell scripts:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Type `Y` to confirm
4. Then you can use `npm run push` from the Key_Levels_App directory
