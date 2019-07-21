function updateTable() {
  var table = document.getElementById("battle_table");
  if (!table) {
    setTimeout(updateTable, 15*1000);
    return false;
  }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1aaeyLhODO9V4M-3H5tTeZVYp3AytwXuJIVgY0pkJkmQ',
    range: 'Sheet1!A:D',
  }).then(function(response) {
    var values = response.result.values;
    
    // Populate table
    let i;
    for (i = 0; i < values.length; i++) {
      if (i >= table.rows.length) table.insertRow(-1);
      for (var j = 0; j < 4; j++) {
        if (!table.rows[i].cells[j]) table.rows[i].insertCell(-1);
        table.rows[i].cells[j].innerHTML = values[i][j];
      }
    }

    // Clear empty rows
    for (i; i < table.rows.length; i++) {
      table.deleteRow(i);
    }
  });

  updateMap(table);
}

function updateMap(table) {
  clearUnits();
  const numRows = table.rows.length;
  for (var i = 1; i < numRows; i++) {
    addUnit(
      table.rows[i].cells[0].innerHTML,
      table.rows[i].cells[2].innerHTML,
      table.rows[i].cells[1].innerHTML
    );
  }

  //setTimeout(updateTable, 30*1000);
}