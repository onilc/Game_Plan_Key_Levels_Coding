# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Google Apps Script application that generates TradingView Pine Script code from stock trading data stored in Google Sheets. Users input support/resistance levels and fundamental metrics into a spreadsheet, then generate Pine Script code to visualize this data on TradingView charts.

**Workflow:**
1. User enters stock data in "CodingSheet" (columns D-K, rows 2-11)
2. User selects "Pine Script" > "Preview TV Code" from custom menu
3. Script generates Pine Script v6 code with levels and fundamentals
4. User copies code and pastes into TradingView Pine Editor

## Architecture

This is a single-file application (`Gameplan_Code_For_TradingView.gs`) with the following functional sections:

- **Menu System:** `onOpen()` creates the "Pine Script" custom menu in Google Sheets
- **User Interface:** `showCodePreview()` displays modal dialog with generated code and copy button
- **Code Generation:** `buildPineScript()` reads sheet data and generates Pine Script v6 code
- **Data Parsing:** `parseStockData()` and `parseLevels()` convert sheet data into structured objects
- **Utilities:** `escapeHtml()` sanitizes text for HTML display, `formatAsPercentage()` handles percentage conversion and formatting

## Data Schema

The script reads from "CodingSheet" with this column structure:

- **Column D:** Stock symbol
- **Column E:** Support levels (comma-separated, e.g., "450.5, 448, 445.2, 442")
- **Column F:** Resistance levels (comma-separated, e.g., "455, 458.3, 461, 465")
- **Column G:** Inflection level (single value)
- **Column H:** Skipped
- **Column I:** Short Float % (decimal format like "0.023" or percentage like "15.3" - both supported)
- **Column J:** Institutional Ownership % (decimal format like "0.6671" or percentage like "78.5" - both supported)
- **Column K:** Float (e.g., "25M" or "100K")

Data is read from rows 2-11 (up to 10 stocks).

**Note:** Short Float % and Institutional Ownership % are automatically formatted by `formatAsPercentage()` which converts decimals to percentages and applies conditional decimal precision (1 decimal if <3%, none if ≥3%).

## Development Workflow

**Installation/Testing Changes:**
1. Open the target Google Sheet
2. Navigate to Extensions > Apps Script
3. Paste/edit the code in the editor
4. Click Save (disk icon)
5. Refresh the Google Sheet to reload the script
6. Test by clicking "Pine Script" > "Preview TV Code"

**Debugging:**
- Use `Logger.log()` for debug output, viewable in Apps Script > Executions
- Test with sample data in CodingSheet to verify parsing logic
- Common issues: empty cells (handled with default "N/A"), malformed level strings

## Key Functions

- **`onOpen()`** - Entry point triggered when sheet opens; creates custom menu
- **`showCodePreview()`** - Main user-facing function; generates code and shows preview dialog
- **`buildPineScript()`** - Core generator that reads sheet data and builds Pine Script code
- **`parseStockData(data)`** - Converts 2D array from sheet into structured stock objects
- **`parseLevels(str, count)`** - Parses comma-separated level strings, handles empty/malformed input
- **`formatAsPercentage(value)`** - Converts decimal values to percentages (0.6671 → 67%), applies conditional formatting (1 decimal if <3%, none if ≥3%)

## Generated Pine Script Features

The output includes:
- 4 support levels (S1-S4) rendered as green horizontal lines
- 4 resistance levels (R1-R4) rendered as red horizontal lines
- 1 inflection level (I1) rendered as orange horizontal line
- **Real-time gap calculation (FIXED 2024-11-24):**
  - **Pre-Market (before 9:30am ET):** Gap = (Current Price - Yesterday's 4pm Close) / Yesterday's 4pm Close
  - **Market Hours (after 9:30am ET):** Gap = (Today's 9:30am Open - Yesterday's 4pm Close) / Yesterday's 4pm Close
  - **Technical Details:** Uses conditional logic based on time to correctly identify yesterday's 4pm close:
    - Pre-market: Uses `todayDayClose` (today's daily bar close, which shows yesterday's 4pm because bar hasn't closed)
    - Market hours: Uses `prevDayClose` (close[1], which works correctly after market opens)
  - **Root Cause Fixed:** Previously, `close[1]` on daily RTH bars during pre-market was incorrectly getting the close from 2 days ago instead of yesterday's 4pm close
- Table overlay displaying Float, Short Float %, Gap %, and Institutional Ownership

All levels are toggled via Pine Script inputs for user customization in TradingView.

## Recent Changes

### 2024-11-24: Gap Calculation Fix
**Problem:** During pre-market hours, the gap calculation was showing the gap relative to the close from 2 days ago instead of yesterday's 4pm close.

**Root Cause:** When using `close[1]` on daily RTH bars during pre-market (e.g., Monday pre-market), the current daily bar is still Monday, so `close[1]` references Friday's bar. However, Friday's bar `close[1]` actually points to Thursday's close, not Friday's 4pm close.

**Solution:** Implemented time-based conditional logic in `buildPineScript()`:
- **Pre-market:** Use `request.security(t_rth, "D", close)` which shows yesterday's 4pm close because today's daily bar hasn't closed yet
- **Market hours:** Use `request.security(t_rth, "D", close[1])` which correctly shows yesterday's close

**Files Modified:**
- `Key_Levels_App/src/Gameplan_Code_For_TradingView.js` - Main code with gap calculation fix
- `Gap_Calculation_All_Methods.txt` - Test file with 6 different methods for validation

**Testing:** Created comprehensive test indicator with 6 methods, tested during both pre-market and market hours, confirmed Methods 2-6 work correctly, implemented Method 2 (Time-Based) as the final solution.
