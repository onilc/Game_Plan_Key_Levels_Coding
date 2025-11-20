const { buildPineScript } = require('../src/Gameplan_Code_For_TradingView');

// Mock the global SpreadsheetApp and other GAS services
require('./gas-mocks');

describe('Gap% Calculation Logic', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    test('should include correct pre-market time check logic', () => {
        // Mock data setup
        const mockSheet = {
            getRange: jest.fn().mockReturnThis(),
            getValues: jest.fn().mockReturnValue([
                ['AAPL', '100, 101', '105, 106', '103', '', '0.01', '0.5', '100M'], // Sample row
                // Add more empty rows to simulate full range
                ['', '', '', '', '', '', '', ''],
                ['', '', '', '', '', '', '', ''],
            ]),
        };

        const mockSpreadsheet = {
            getSheetByName: jest.fn().mockReturnValue(mockSheet),
        };

        global.SpreadsheetApp.getActiveSpreadsheet.mockReturnValue(mockSpreadsheet);

        // Execute
        const code = buildPineScript();

        // Verify
        // Check for the specific Pine Script lines we added
        expect(code).toContain('t_rth = ticker.new(syminfo.prefix, syminfo.ticker, session.regular)');
        expect(code).toContain('prevClose = request.security(t_rth, "D", close[1], barmerge.gaps_off, barmerge.lookahead_on)');
        expect(code).toContain('todayOpen = request.security(t_rth, "D", open, barmerge.gaps_off, barmerge.lookahead_on)');
        expect(code).toContain('refPrice = not na(todayOpen) ? todayOpen : close');
    });
});
