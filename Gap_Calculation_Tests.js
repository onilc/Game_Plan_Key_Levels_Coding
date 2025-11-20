/**
 * GAP CALCULATION TEST METHODS
 *
 * This file contains 5 different approaches to calculate gap percentage
 * correctly during both premarket and regular trading hours.
 *
 * Test each method by copying the Pine Script code into TradingView
 * and observing the Gap% value during premarket vs regular hours.
 *
 * EXPECTED BEHAVIOR:
 * - Premarket (4am-9:30am): Gap should be based on CURRENT PRICE vs yesterday's close
 * - Regular hours (9:30am+): Gap should be based on TODAY'S OPEN (9:30am) vs yesterday's close
 */

// ============================================================================
// METHOD 1: Current Implementation (isRegularSession check)
// ============================================================================
function generateMethod1() {
  return `//@version=6
indicator("Gap Test - Method 1 (isRegularSession)", overlay=true)

// Get previous close and today's open
prevClose = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_on)
todayOpen = request.security(syminfo.tickerid, "D", open, barmerge.gaps_off, barmerge.lookahead_on)

// Check if we're in regular session (9:30am - 4pm ET)
isRegularSession = not na(time(timeframe.period, "0930-1600"))

// Reference price logic
refPrice = isRegularSession ? todayOpen : close

gappct = 100.0 * ((refPrice - prevClose) / prevClose)
gapDisp = math.abs(gappct) < 3 ? math.round(gappct * 10.0) / 10.0 : math.round(gappct)
gapStr = str.tostring(gapDisp) + "%"

// Display
var label lbl = na
if barstate.islast
    label.delete(lbl)
    lbl := label.new(bar_index, high, "Method 1\\nGap: " + gapStr + "\\nRegSession: " + str.tostring(isRegularSession),
                     style=label.style_label_down, color=color.blue, textcolor=color.white)
`;
}

// ============================================================================
// METHOD 2: Extended Hours Session Detection
// ============================================================================
function generateMethod2() {
  return `//@version=6
indicator("Gap Test - Method 2 (Extended Hours)", overlay=true)

// Get previous close and today's open
prevClose = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_on)
todayOpen = request.security(syminfo.tickerid, "D", open, barmerge.gaps_off, barmerge.lookahead_on)

// Check if we're in premarket (4am-9:30am) or regular session
isPremarket = not na(time(timeframe.period, "0400-0929"))
isRegular = not na(time(timeframe.period, "0930-1600"))

// Use current price during premarket, today's open during regular hours
refPrice = isRegular ? todayOpen : close

gappct = 100.0 * ((refPrice - prevClose) / prevClose)
gapDisp = math.abs(gappct) < 3 ? math.round(gappct * 10.0) / 10.0 : math.round(gappct)
gapStr = str.tostring(gapDisp) + "%"

// Display
var label lbl = na
if barstate.islast
    label.delete(lbl)
    sessionType = isPremarket ? "PREMARKET" : (isRegular ? "REGULAR" : "AFTERHOURS")
    lbl := label.new(bar_index, high, "Method 2\\nGap: " + gapStr + "\\nSession: " + sessionType,
                     style=label.style_label_down, color=color.green, textcolor=color.white)
`;
}

// ============================================================================
// METHOD 3: Time-based with Market Open Detection
// ============================================================================
function generateMethod3() {
  return `//@version=6
indicator("Gap Test - Method 3 (Market Open Time)", overlay=true)

// Get previous close and today's open
prevClose = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_on)
todayOpen = request.security(syminfo.tickerid, "D", open, barmerge.gaps_off, barmerge.lookahead_on)

// Get current time in EST (GMT-5)
currentHour = hour(time, "America/New_York")
currentMinute = minute(time, "America/New_York")

// Convert to minutes since midnight for easier comparison
currentTimeMinutes = currentHour * 60 + currentMinute
marketOpenMinutes = 9 * 60 + 30  // 9:30 AM = 570 minutes

// We've passed market open if current time >= 9:30am
hasMarketOpened = currentTimeMinutes >= marketOpenMinutes

// Use today's open if market has opened, otherwise use current price
refPrice = hasMarketOpened ? todayOpen : close

gappct = 100.0 * ((refPrice - prevClose) / prevClose)
gapDisp = math.abs(gappct) < 3 ? math.round(gappct * 10.0) / 10.0 : math.round(gappct)
gapStr = str.tostring(gapDisp) + "%"

// Display
var label lbl = na
if barstate.islast
    label.delete(lbl)
    timeStr = str.format("{0,number,00}:{1,number,00}", currentHour, currentMinute)
    lbl := label.new(bar_index, high, "Method 3\\nGap: " + gapStr + "\\nTime: " + timeStr + "\\nOpened: " + str.tostring(hasMarketOpened),
                     style=label.style_label_down, color=color.orange, textcolor=color.white)
`;
}

// ============================================================================
// METHOD 4: Using Session State Variable
// ============================================================================
function generateMethod4() {
  return `//@version=6
indicator("Gap Test - Method 4 (Session State)", overlay=true)

// Get previous close and today's open
prevClose = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_on)
todayOpen = request.security(syminfo.tickerid, "D", open, barmerge.gaps_off, barmerge.lookahead_on)

// Detect when we transition from premarket to regular session
var bool marketHasOpened = false
isRegular = not na(time(timeframe.period, "0930-1600"))

// Once we enter regular session, set flag (stays true for the day)
if isRegular
    marketHasOpened := true

// Reset flag at start of new day
if ta.change(dayofmonth)
    marketHasOpened := false

// Use today's open if market opened, otherwise current price
refPrice = marketHasOpened ? todayOpen : close

gappct = 100.0 * ((refPrice - prevClose) / prevClose)
gapDisp = math.abs(gappct) < 3 ? math.round(gappct * 10.0) / 10.0 : math.round(gappct)
gapStr = str.tostring(gapDisp) + "%"

// Display
var label lbl = na
if barstate.islast
    label.delete(lbl)
    lbl := label.new(bar_index, high, "Method 4\\nGap: " + gapStr + "\\nMktOpened: " + str.tostring(marketHasOpened),
                     style=label.style_label_down, color=color.red, textcolor=color.white)
`;
}

// ============================================================================
// METHOD 5: Using Daily Bar Open Change Detection
// ============================================================================
function generateMethod5() {
  return `//@version=6
indicator("Gap Test - Method 5 (Daily Open Change)", overlay=true)

// Get previous close
prevClose = request.security(syminfo.tickerid, "D", close, barmerge.gaps_off, barmerge.lookahead_on)

// Get today's open (this is the 9:30am open)
todayOpen = request.security(syminfo.tickerid, "D", open, barmerge.gaps_off, barmerge.lookahead_on)

// Get yesterday's open for comparison
yesterdayOpen = request.security(syminfo.tickerid, "D", open[1], barmerge.gaps_off, barmerge.lookahead_on)

// If todayOpen != yesterdayOpen, we have a new daily bar (market has opened)
// This is more reliable than time checks
hasNewDailyBar = todayOpen != yesterdayOpen

// Also check if we're past market open time as backup
currentMinutes = hour(time, "America/New_York") * 60 + minute(time, "America/New_York")
isPastMarketOpen = currentMinutes >= 570  // 9:30 AM

// Combine both checks
shouldUseTodayOpen = hasNewDailyBar and isPastMarketOpen

// Reference price
refPrice = shouldUseTodayOpen ? todayOpen : close

gappct = 100.0 * ((refPrice - prevClose) / prevClose)
gapDisp = math.abs(gappct) < 3 ? math.round(gappct * 10.0) / 10.0 : math.round(gappct)
gapStr = str.tostring(gapDisp) + "%"

// Display
var label lbl = na
if barstate.islast
    label.delete(lbl)
    lbl := label.new(bar_index, high, "Method 5\\nGap: " + gapStr + "\\nNewBar: " + str.tostring(hasNewDailyBar) + "\\nPastOpen: " + str.tostring(isPastMarketOpen),
                     style=label.style_label_down, color=color.purple, textcolor=color.white)
`;
}

// ============================================================================
// TESTING HELPER FUNCTION
// ============================================================================
/**
 * Displays all 5 methods with instructions
 */
function showAllMethods() {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 5px; }
      .method { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
      .copy-btn {
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 10px;
      }
      .copy-btn:hover { background: #45a049; }
      pre {
        background: white;
        padding: 10px;
        border-left: 3px solid #4CAF50;
        overflow-x: auto;
        font-size: 12px;
      }
      .pros { color: green; }
      .cons { color: red; }
    </style>

    <h1>Gap Calculation Test Methods</h1>
    <p><strong>Instructions:</strong> Copy each method into TradingView one at a time and observe the Gap% value during premarket (4am-9:30am) vs regular hours (9:30am+).</p>

    <div class="method">
      <h2>Method 1: isRegularSession Check (Current)</h2>
      <p class="pros">✓ Simple and clean</p>
      <p class="cons">✗ May not work correctly if time() function has issues</p>
      <button class="copy-btn" onclick="copyToClipboard('method1')">Copy Method 1</button>
      <pre id="method1">${escapeHtml(generateMethod1())}</pre>
    </div>

    <div class="method">
      <h2>Method 2: Extended Hours Detection</h2>
      <p class="pros">✓ Explicitly checks for premarket session</p>
      <p class="pros">✓ Shows session type in label</p>
      <p class="cons">✗ Requires extended hours data enabled in TradingView</p>
      <button class="copy-btn" onclick="copyToClipboard('method2')">Copy Method 2</button>
      <pre id="method2">${escapeHtml(generateMethod2())}</pre>
    </div>

    <div class="method">
      <h2>Method 3: Market Open Time Comparison</h2>
      <p class="pros">✓ Uses actual time calculation</p>
      <p class="pros">✓ Doesn't rely on session detection</p>
      <p class="cons">✗ Timezone dependent (uses America/New_York)</p>
      <button class="copy-btn" onclick="copyToClipboard('method3')">Copy Method 3</button>
      <pre id="method3">${escapeHtml(generateMethod3())}</pre>
    </div>

    <div class="method">
      <h2>Method 4: Session State Variable</h2>
      <p class="pros">✓ Maintains state once market opens</p>
      <p class="pros">✓ Persists throughout the day</p>
      <p class="cons">✗ More complex logic</p>
      <button class="copy-btn" onclick="copyToClipboard('method4')">Copy Method 4</button>
      <pre id="method4">${escapeHtml(generateMethod4())}</pre>
    </div>

    <div class="method">
      <h2>Method 5: Daily Bar Open Change Detection</h2>
      <p class="pros">✓ Detects actual change in daily bar</p>
      <p class="pros">✓ Most reliable for detecting market open</p>
      <p class="cons">✗ Most complex logic</p>
      <button class="copy-btn" onclick="copyToClipboard('method5')">Copy Method 5</button>
      <pre id="method5">${escapeHtml(generateMethod5())}</pre>
    </div>

    <script>
      function copyToClipboard(methodId) {
        const text = document.getElementById(methodId).textContent;
        navigator.clipboard.writeText(text).then(() => {
          alert('Copied to clipboard! Paste into TradingView Pine Editor.');
        }).catch(err => {
          alert('Copy failed: ' + err);
        });
      }
    </script>
  `)
  .setWidth(900)
  .setHeight(700);

  SpreadsheetApp.getUi().showModalDialog(html, 'Gap Calculation Test Methods');
}

/**
 * Helper function to escape HTML (same as main script)
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Add menu item to test gap calculations
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Gap Tests')
      .addItem('Show All Test Methods', 'showAllMethods')
      .addToUi();
}
