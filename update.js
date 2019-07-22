function updateNotes() {
  var list = document.getElementById('notes_list');
  if (!list || !gapi.client || !gapi.client.sheets) {
    console.log('Waiting for Google API...');
    setTimeout(updateNotes, 1000);
    return false;
  }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1aaeyLhODO9V4M-3H5tTeZVYp3AytwXuJIVgY0pkJkmQ',
    range: 'Notes!A2:A'
  }).then(function(response) {
    var values = response.result.values;

    // Clear list
    let i;
    var oldItems = document.querySelectorAll('li');
    for (i = 0; i < oldItems.length; i++) {
      list.removeChild(oldItems[i]);
    }

    // Populate list
    var newLen = values.length;
    for (i = 0; i < newLen; i++) {
      var li = document.createElement('li');
      li.innerHTML = values[i][0];
      list.appendChild(li);
    }
  }, function(response) {
    alert('Error: ' + response.result.error.message);
  });

  updateTable();
}

function updateTable() {
  var table = document.getElementById("battle_table");
  if (!table) {
    console.log('Waiting for table...');
    setTimeout(updateTable, 1000);
    return false;
  }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1aaeyLhODO9V4M-3H5tTeZVYp3AytwXuJIVgY0pkJkmQ',
    range: 'Data!A:D'
  }).then(function(response) {
    var results = response.result.values;
    var values = results.filter(x => x[0] != "Medic");
    var oldSize = table.rows.length;
    var newSize = values.length;
    
    // Populate table
    let i;
    for (i = 0; i < newSize; i++) {
      if (i >= oldSize) table.insertRow(-1);
      for (var j = 0; j < 4; j++) {
        if (!table.rows[i].cells[j]) table.rows[i].insertCell(-1);
        table.rows[i].cells[j].innerHTML = values[i][j];
      }
    }

    // Clear empty rows
    for (i; i < oldSize; i++) {
      table.deleteRow(i);
    }

    // Add color
    for (i = 0; i < values.length; i++) {
      switch(table.rows[i].cells[0].innerHTML) {
        case "BN":
          table.rows[i].style.backgroundColor = 'rgba(0,255,0,.5)';
          break;
        case "Anzio":
          table.rows[i].style.backgroundColor = 'rgba(255,127,0,.5)';
          break;
        case "Bastogne":
          table.rows[i].style.backgroundColor = 'rgba(255,0,0,.5)';
          break;
        case "Carentan":
          table.rows[i].style.backgroundColor = 'rgba(0,0,255,.5)';
          break;
      }
    }
    updateMap(results);
  });
}

function updateMap(values) {
  clearUnits();
  const numUnits = values.length;
  for (var i = 1; i < numUnits; i++) { // Remove header row
    addUnit(values[i][0], values[i][2], values[i][1]);
  }

  setTimeout(updateNotes, 30*1000);
}