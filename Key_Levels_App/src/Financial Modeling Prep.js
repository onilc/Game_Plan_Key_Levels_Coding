// API Key = 1AKXJtbW627hTCPiKQ1Iyjx1wA2FJnhK
// Test here to see available data  --> https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=1AKXJtbW627hTCPiKQ1Iyjx1wA2FJnhK and this https://financialmodelingprep.com/api/v3/key-metrics/AAPL?limit=1&apikey=1AKXJtbW627hTCPiKQ1Iyjx1wA2FJnhK


function fetchFMPData(symbol) {
  const API_KEY = '1AKXJtbW627hTCPiKQ1Iyjx1wA2FJnhK';
  const url = `https://financialmodelingprep.com/api/v4/company-outlook?symbol=${symbol}&apikey=${API_KEY}`;

  try {
    const response = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    const json = JSON.parse(response.getContentText());

    if (!json.metrics) {
      return [["N/A", "N/A"]];
    }

    const shortFloat = json.metrics.shortPercentageOfFloat;
    const instOwn = json.metrics.institutionalOwnershipPercentage;

    return [[shortFloat, instOwn]];
  } 
  catch (e) {
    return [["Error", e.message]];
  }
}

