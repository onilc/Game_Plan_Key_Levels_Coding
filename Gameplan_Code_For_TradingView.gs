/**
 * Google Apps Script for Generating TradingView Pine Script
 *
 * Installation Instructions:
 * 1. Open your Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code
 * 4. Paste this entire script
 * 5. Click the disk icon to save
 * 6. Refresh your Google Sheet
 * 7. You'll see a new menu "Pine Script" appear
 *
 * Usage:
 * 1. Fill in your stock data in the sheet
 * 2. Click "Pine Script" menu > "Generate Code"
 * 3. The code will be generated and copied to your clipboard
 * 4. Paste directly into TradingView Pine Editor
 */

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Pine Script')
      .addItem('Preview TV Code', 'showCodePreview')
      .addToUi();
}


/**
 * Shows code preview in a dialog
 */
function showCodePreview() {
  try {
    const code = buildPineScript();
    const html = HtmlService.createHtmlOutput(`
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 10px;
        }
        pre {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          white-space: pre-wrap;
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          border: 1px solid #ddd;
          max-height: 500px;
          overflow-y: auto;
        }
        #copyBtn {
          position: sticky;
          top: 10px;
          left: 0;
          background-color: #4CAF50;
          color: white;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: bold;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          margin-bottom: 15px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 200px;
        }
        #copyBtn:hover {
          background-color: #45a049;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }
        #copyBtn.copied {
          background-color: #2196F3;
          animation: pulse 0.5s ease;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .success-icon {
          display: inline-block;
          margin-left: 5px;
        }
      </style>

      <button id="copyBtn" onclick="copyCode()">Copy to Clipboard</button>
      <pre>${escapeHtml(code)}</pre>

      <script>
        function copyCode() {
          const code = document.querySelector('pre').textContent;
          const btn = document.getElementById('copyBtn');

          navigator.clipboard.writeText(code).then(() => {
            // Change button appearance
            btn.textContent = 'Copied! ✓';
            btn.classList.add('copied');

            // Revert after 2 seconds
            setTimeout(() => {
              btn.textContent = 'Copy to Clipboard';
              btn.classList.remove('copied');
            }, 2000);
          }).catch(err => {
            btn.textContent = 'Copy Failed!';
            btn.style.backgroundColor = '#f44336';
            setTimeout(() => {
              btn.textContent = 'Copy to Clipboard';
              btn.style.backgroundColor = '#4CAF50';
            }, 2000);
          });
        }
      </script>
    `)
    .setWidth(800)
    .setHeight(600);

    SpreadsheetApp.getUi().showModalDialog(html, 'TradingView Pine Script Preview');
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

/**
 * Builds the complete Pine Script code
 */
function buildPineScript() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('CodingSheet');

  if (!sheet) {
    throw new Error('Sheet "CodingSheet" not found. Please check the sheet name.');
  }

  // Get stock data from columns D-K, rows 2-11
  // D=Stock, E=Support, F=Resistance, G=Inflection, I=SF%, J=InstOwn, K=Float
  const dataRange = sheet.getRange('D2:K11');
  const data = dataRange.getValues();

  // Parse stock data
  const stocks = parseStockData(data);

  // Build the Pine Script
  let code = `//@version=6
indicator("Levels & IntFund", overlay=true)

// Define your symbols
symbol = syminfo.ticker  // Get the current symbol

// Initialize each level variable
R1 = 0.01
R2 = 0.01
R3 = 0.01
R4 = 0.01
I1 = 0.01
S1 = 0.01
S2 = 0.01
S3 = 0.01
S4 = 0.01
FloatTxt = '0K'
SF = '0%'
InstOwn = '0%'

// === Gap calculation (premarket uses last price; regular session uses today's open) ===
prevClose = request.security(syminfo.tickerid, "D", close[1], barmerge.gaps_off, barmerge.lookahead_on)

// Get today's open from daily chart (this is the 9:30am open)
todayOpen = request.security(syminfo.tickerid, "D", open, barmerge.gaps_off, barmerge.lookahead_on)

// Determine if we're in regular session (9:30am - 4pm ET)
// time() returns non-na during specified session
isRegularSession = not na(time(timeframe.period, "0930-1600"))

// Reference price logic:
// - Before market open (premarket 4am-9:30am): use current price (close)
// - After market open (9:30am onwards): use today's daily open price
// We check if todayOpen is available and valid (not 0.01 default)
hasOpenedToday = not na(todayOpen) and todayOpen > 0
refPrice = (isRegularSession or hasOpenedToday) ? todayOpen : close

gappct = 100.0 * ((refPrice - prevClose) / prevClose)
// < 3% -> one decimal; >= 3% -> no decimals
gapDisp = math.abs(gappct) < 3 ? math.round(gappct * 10.0) / 10.0 : math.round(gappct)
gapStr = str.tostring(gapDisp) + "%"

`;

  // Add if blocks for each stock
  for (let i = 0; i < stocks.length; i++) {
    const stock = stocks[i];
    if (!stock.symbol) continue; // Skip empty rows

    code += `if symbol == '${stock.symbol}'\n`;
    code += `    R1 := ${stock.r1}\n`;
    code += `    R2 := ${stock.r2}\n`;
    code += `    R3 := ${stock.r3}\n`;
    code += `    R4 := ${stock.r4}\n`;
    code += `    I1 := ${stock.i1}\n`;
    code += `    S1 := ${stock.s1}\n`;
    code += `    S2 := ${stock.s2}\n`;
    code += `    S3 := ${stock.s3}\n`;
    code += `    S4 := ${stock.s4}\n`;
    code += `    FloatTxt := '${stock.float}'\n`;
    code += `    SF := '${stock.sf}'\n`;
    code += `    InstOwn := '${stock.instOwn}'\n`;
  }

  // Add closing code
  code += `// Defining the custom colors with transparency
color1 = color.new(color.red, 50)
color2 = color.new(color.green, 50)
color3 = color.new(color.orange, 75)


// Plotting horizontal lines for support, inflection and resistance
plot(S1, "S1", color=color2, linewidth=2)
plot(S2, "S2", color=color2, linewidth=2)
plot(S3, "S3", color=color2, linewidth=2)
plot(S4, "S4", color=color2, linewidth=2)
plot(I1, "I1", color=color3, linewidth=2)
plot(R1, "R1", color=color1, linewidth=2)
plot(R2, "R2", color=color1, linewidth=2)
plot(R3, "R3", color=color1, linewidth=2)
plot(R4, "R4", color=color1, linewidth=2)


// Intraday Fundamentals
color background = color.rgb(0,0,0)
color white = color.white

var table intfund = table.new(position.top_right, 5, 20, bgcolor=background, frame_color=background, frame_width=3)
if barstate.islast
    table.cell(intfund, 1, 3, text='Float: ' + FloatTxt + '    ' + 'SF: ' + SF, text_color=white)
    table.cell(intfund, 1, 4, text='Gap: ' + gapStr + '    ' + 'IOwn: ' + InstOwn, text_color=white)
`;

  return code;
}

/**
 * Parses stock data from sheet range
 * Expected columns from range D2:K11:
 * [0]=D=Stock, [1]=E=Support, [2]=F=Resistance, [3]=G=Inflection,
 * [4]=H (skipped), [5]=I=SF%, [6]=J=InstOwn, [7]=K=Float
 */
function parseStockData(data) {
  const stocks = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const symbol = row[0] ? row[0].toString().trim() : '';

    if (!symbol || symbol === '') continue;

    const supportStr = row[1] ? row[1].toString() : '';
    const resistanceStr = row[2] ? row[2].toString() : '';
    const inflectionStr = row[3] ? row[3].toString() : '';

    // Parse support levels (format: "28, 30, 31")
    const supportLevels = parseLevels(supportStr, 4);

    // Parse resistance levels
    const resistanceLevels = parseLevels(resistanceStr, 4);

    // Parse inflection level (usually just one value)
    const inflectionLevels = parseLevels(inflectionStr, 1);

    // Get fundamentals directly from the same row
    // [5]=I=SF%, [6]=J=InstOwn, [7]=K=Float
    const sf = row[5] ? row[5].toString().trim() : '0%';
    const instOwn = row[6] ? row[6].toString().trim() : '0%';
    const float = row[7] ? row[7].toString().trim() : '0K';

    stocks.push({
      symbol: symbol,
      s1: supportLevels[0],
      s2: supportLevels[1],
      s3: supportLevels[2],
      s4: supportLevels[3],
      r1: resistanceLevels[0],
      r2: resistanceLevels[1],
      r3: resistanceLevels[2],
      r4: resistanceLevels[3],
      i1: inflectionLevels[0],
      float: float,
      sf: sf,
      instOwn: instOwn
    });
  }

  return stocks;
}

/**
 * Parses level string into array of numbers
 * Example: "28, 30, 31" -> [28, 30, 31, 0.01]
 */
function parseLevels(str, count) {
  const levels = [];
  const parts = str.split(',').map(s => s.trim()).filter(s => s !== '');

  for (let i = 0; i < count; i++) {
    if (i < parts.length && parts[i] !== '') {
      const num = parseFloat(parts[i]);
      levels.push(isNaN(num) ? 0.01 : num);
    } else {
      levels.push(0.01);
    }
  }

  return levels;
}



/**
 * Escapes HTML special characters
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
