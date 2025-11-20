// Alpha Advantage API Key = BEUGW154FKNV8GNF
// Test here to see available data  --> https://www.alphavantage.co/query?function=OVERVIEW&symbol=AAPL&apikey=BEUGW154FKNV8GNF

function fetchAlphaVantageData(symbol) {
  const API_KEY = 'BEUGW154FKNV8GNF';



  const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`;

  try {
    const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    const json = JSON.parse(response.getContentText());

    Logger.log(json);  // Debug: log the entire response object.

    let shortFloat = json.ShortPercentFloat;
    let instOwn = json.PercentInstitutions;

    if (!shortFloat || !instOwn) {
      return [["N/A", "N/A"]];
    }

    return [[shortFloat, instOwn]];  // Double brackets for horizontal output.
  } catch (e) {
    Logger.log("Error fetching data: " + e.message);
    return [["Error", e.message]];
  }
}
