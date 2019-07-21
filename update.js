function updateNotes() {
  var list = document.getElementById('notes_list');
  if (!list || !gapi.client || !gapi.client.sheets) {
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
  });

  updateTable();
}

function updateTable() {
  var table = document.getElementById("battle_table");
  if (!table) {
    setTimeout(updateTable, 1000);
    return false;
  }
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1aaeyLhODO9V4M-3H5tTeZVYp3AytwXuJIVgY0pkJkmQ',
    range: 'Data!A:D'
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

  setTimeout(updateNotes, 30*1000);
}