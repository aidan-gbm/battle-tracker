// Client ID and API key from the Developer Console
var CLIENT_ID = '549135233931-plculv9ig00vfejvkeuhg2st22tim8ng.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAUWsQ8Ly6r-oE5JhxUum_naoz_vX8QKcE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    alert(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'inline-block';
    buildTable();
  } else {
    authorizeButton.style.display = 'inline-block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function updateTable() {
  var table = document.getElementById("battle_table");
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1aaeyLhODO9V4M-3H5tTeZVYp3AytwXuJIVgY0pkJkmQ',
    range: 'Sheet1!A:D',
  }).then(function(response) {
    var values = response.result.values;
    
    // Populate table
    let i;
    for (i = 0; i < values.length; i++) {
      for (var j = 0; j < values[0].length; j++) {
        table.row[i].cell[j].innerHTML = values[i][j];
      }
    }

    // Clear empty rows
    for (i; i < table.rows.length; i++) {
      table.deleteRow(i);
    }
  });

  setTimeout(updateTable, 30*1000);
}

function buildTable() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1aaeyLhODO9V4M-3H5tTeZVYp3AytwXuJIVgY0pkJkmQ',
    range: 'Sheet1!A:D',
  }).then(function(response) {
    var range = response.result;
    if (range.values.length > 0) {
      // Create table
      var table = document.createElement("table");
      var colCount = range.values[0].length;
      table.id = "battle_table";

      // Create header row
      var hr = table.insertRow(-1);
      for (var i = 0; i < colCount; i++) {
        var cell = document.createElement("th");
        cell.innerHTML = range.values[0][i];
        hr.appendChild(cell);
      }

      // Populate data rows
      for (var i = 1; i < range.values.length; i++) {
        row = table.insertRow(-1);
        for (var j = 0; j < colCount; j++) {
          var cell = row.insertCell(-1);
          cell.innerHTML = range.values[i][j];
        }
      }

      // Insert table
      var tableDiv = document.getElementById("table");
      tableDiv.appendChild(table);
    } else {
      alert('No data found.');
    }
  }, function(response) {
    alert('Error: ' + response.result.error.message);
  });

  updateTable();
}