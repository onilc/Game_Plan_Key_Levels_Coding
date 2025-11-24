# Gap Calculation Debug Guide

## What to Look For in TradingView

The updated indicator now shows detailed information to help diagnose the issue:

### Main Table (Top Left)
For each of the 6 methods, you'll see:
- **GAP %**: The displayed gap (rounded based on <3% rule)
- **GAP (2 dec)**: The gap with exactly 2 decimal places
- **REF PRICE**: The reference price being used (either current price or today's open)

### Debug Table (Bottom Right)
Shows the raw values being used:
- **Current Price**: The current market price (close)
- **Prev Close (RTH)**: Yesterday's 4pm close from Regular Trading Hours
- **Today Open (RTH)**: Today's 9:30am open (should be NA during pre-market)
- **Time (minutes)**: Current time in minutes since midnight
- **M1/M2 RefPrice**: The reference price each method is using
- **M1/M2 Gap (2 dec)**: The calculated gap for each method
- **Manual Calc**: A manual calculation of (Current Price - Prev Close RTH) / Prev Close RTH
- **RTH Open is NA?**: Whether today's RTH open is NA (should be true during pre-market)

## Expected Behavior

### During Pre-Market (before 9:30am ET):
- **RTH Open is NA?** should show `true`
- **REF PRICE** for all methods should equal **Current Price**
- **Gap (2 dec)** should equal **Manual Calc**
- **Prev Close (RTH)** should be yesterday's 4pm close (e.g., Friday's close on Monday pre-market)

### During Market Hours (after 9:30am ET):
- **RTH Open is NA?** should show `false`
- **REF PRICE** for all methods should equal **Today Open (RTH)**
- **Gap (2 dec)** should be based on (Today Open - Prev Close) / Prev Close
- The gap should stay constant throughout the day (not change with current price)

## What to Report

Please check during pre-market and tell me:
1. What is **Prev Close (RTH)**? (Is this yesterday's actual 4pm close?)
2. What is **Current Price**?
3. What is **Manual Calc**? (This should be the correct gap)
4. What are the **Gap (2 dec)** values for Methods 1-6? (Are they matching Manual Calc?)
5. Is **RTH Open is NA?** showing `true`?

This will help me identify exactly where the calculation is going wrong.
