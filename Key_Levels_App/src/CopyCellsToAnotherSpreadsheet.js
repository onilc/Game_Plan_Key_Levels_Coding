function copyCellsToAnotherSheet() {
  // IDs of the spreadsheets
  const sourceSpreadsheetId = '1tNAcHgXwSjSXknIUGkcMLbbxjwqsh2ObuWzCld_IL6U';
  const destinationSpreadsheetId = '1w9sXug_TNAnhtZn0DWNztAnuCwIwUrkfac04cSYl_x0';
  
  // Sheet names
  const sourceSheetName = 'CodingSheet';  // Corrected source sheet name
  const destinationSheetName = 'Game Plan 2';  // Corrected destination sheet name

  // Define the source and destination ranges
  const sourceRange = 'B2:W11';
  
  // Open source spreadsheet and sheet
  const sourceSpreadsheet = SpreadsheetApp.openById(sourceSpreadsheetId);
  const sourceSheet = sourceSpreadsheet.getSheetByName(sourceSheetName);

  if (!sourceSheet) {
    Logger.log("Source sheet not found.");
    return;
  }

  // Get the data from the source sheet
  let data = sourceSheet.getRange(sourceRange).getValues();
  
  // Filter out rows where column B is blank
  data = data.filter(row => row[0] !== '');

  // Open the destination spreadsheet and sheet
  const destinationSpreadsheet = SpreadsheetApp.openById(destinationSpreadsheetId);
  const destinationSheet = destinationSpreadsheet.getSheetByName(destinationSheetName);

  if (!destinationSheet) {
    Logger.log("Destination sheet not found.");
    return;
  }

  // Find the first blank row in column B of the destination sheet
  const lastRow = destinationSheet.getRange('B:B').getValues().filter(String).length + 1;
  
  // Paste the values to the destination sheet
  destinationSheet.getRange(lastRow, 2, data.length, data[0].length).setValues(data);
}
