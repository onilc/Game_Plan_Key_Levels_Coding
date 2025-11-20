// Mock Google Apps Script services
global.Logger = {
    log: jest.fn(),
};

global.SpreadsheetApp = {
    getActiveSpreadsheet: jest.fn(),
    // Add other mocks as needed
};
