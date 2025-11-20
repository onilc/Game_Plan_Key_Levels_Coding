function copyAndFormatContentZ2() {
  // Get the active spreadsheet and the specified sheet
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("CodingSheet");
  
  // Get the value from cell Z2
  var cellContent = sheet.getRange("AJ2").getValue();
  
  // Replace occurrences of 4 double quotes with a placeholder (e.g., ##PLACEHOLDER##)
  var formattedContent = cellContent.replace(/""""/g, '##PLACEHOLDER##');
  
  // Replace occurrences of 2 double quotes with 1 double quote
  formattedContent = formattedContent.replace(/""/g, '"');
  
  // Replace the placeholder back with 2 double quotes
  formattedContent = formattedContent.replace(/##PLACEHOLDER##/g, '""');
  
  // Remove the " at the beginning and end of the content
  if (formattedContent.startsWith('"')) {
    formattedContent = formattedContent.slice(1);
  }
  if (formattedContent.endsWith('"')) {
    formattedContent = formattedContent.slice(0, -1);
  }
  
  // Escape the formatted content for safe inclusion in HTML, except for quotes
  formattedContent = formattedContent.replace(/&/g, "&amp;")
                                     .replace(/</g, "&lt;")
                                     .replace(/>/g, "&gt;");
  
  // Create HTML output with a hidden input field, "Copy" button at the top, and JavaScript function
  var html = `
    <button id="copyButton" onclick="copyToClipboard()">Copy</button>
    <p><strong>Formatted Content:</strong></p>
    <pre id="formattedContent">${formattedContent}</pre>
    <script>
      function copyToClipboard() {
        const text = document.getElementById('formattedContent').textContent;
        navigator.clipboard.writeText(text).then(() => {
          // Change button color to indicate success
          const button = document.getElementById('copyButton');
          button.style.backgroundColor = 'green';
          button.disabled = true;
          
          // Revert button color after a delay
          setTimeout(() => {
            button.style.backgroundColor = '';
            button.disabled = false;
          }, 1000);
        });
      }
    </script>
  `;

  // Display the HTML output in a modal dialog
  var htmlOutput = HtmlService.createHtmlOutput(html)
      .setWidth(600)
      .setHeight(500);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Formatted Content');
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Menu')
      .addItem('Copy and Format Z2 Content', 'copyAndFormatContentZ2')
      .addToUi();
}
