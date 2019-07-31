/**
 * Location object
 * @param {String} name
 * @param {[Number, Number]} coords
 * @param {Boolean} medic
 * @param {Array} units
 */
class Location {
  constructor(name, coords, medic, units) {
    this.name = name;
    this.coords = coords;
    this.medic = medic;
    this.units = units;
  }
}

// Global Variables
let setLocs = true;
let canvas, locations, id = 0;

function runTracker(spreadsheetId) {
  /**
   * EXAMPLE: Anzio, 3, USMAPS
   * 'USMAPS': {
   *   coords: [],
   *   m: false,
   *   units: {
   *     'A/1/1': { refresh: true, objId: 1 }
   *   }
   * }
   */
  locations = {
    'USMAPS':       {coords:[0.6675,0.0836],m:false,units:{}},
    'J2/J3':        {coords:[0.6970,0.1898],m:false,units:{}},
    'Range 11':     {coords:[0.2160,0.7805],m:false,units:{}},
    'LZ Owl':       {coords:[0.0634,0.8744],m:false,units:{}},
    'River Courts': {coords:[0.9278,0.2072],m:false,units:{}},
    'Arvin':        {coords:[0.8569,0.1700],m:false,units:{}},
    'Cemetery':     {coords:[0.7988,0.0963],m:false,units:{}}
  }

  canvas = loadCanvas();
  loadData(spreadsheetId, 'Crucible!A:C', 'Notes!A:A', 'ExCheck!A:F');
}

/**
 * @param {Number} id 
 * @returns {Object} the map object
 */
function getObjectById(id) {
  let ret;
  canvas.getObjects().forEach(o => {
    if (o.id === id) {
      ret = o;
    }
  });
  return ret;
}

/**
 * LOAD CANVAS
 */
function loadCanvas() {
  // Create canvas object
  let h = window.innerHeight * 0.85;
  let canvas = new fabric.Canvas('map_canvas', {
    height: h,
    width: h * 1.5,
    preserveObjectStacking: true,
    hoverCursor: 'default'
  });

  // Add map to canvas
  fabric.Image.fromURL('assets/ao_morgan.png', function(img) {
    img.scaleToHeight(canvas.getHeight());
    img.selectable = false;
    canvas.add(img);
  });

  // DEBUG
  // Display coordinates of selected objects
  canvas.on('object:modified', function(act) {
    let obj = act.target;
    let map = canvas.item(0);
    let p = document.getElementById('unit_location');
    let percentLeft = obj.get('left') / map.aCoords.tr.x;
    let percentTop = obj.get('top') / map.aCoords.br.y;
    p.innerText = 'DEBUG\n' +
    'Map\tW: ' + map.aCoords.tr.x + ', H: ' + map.aCoords.br.y + '\n' +
    'Object\tL: ' + obj.get('left') + ', T: ' + obj.get('top') + '\n' +
    'Percent\tX: ' + percentLeft + ', Y: ' + percentTop;
  });

  // Render canvas
  canvas.renderAll();
  return canvas;
}

/**
 * Step 1 in the data update process.
 * @param {String} id id of the spreadsheet
 * @param {String} unitRange range for the unit tab
 * @param {String} notesRange range for the notes tab 
 * @param {String} excheckRange range for the excheck tab
 */
function loadData(id, unitRange, notesRange, excheckRange) {
  // Wait for Google Sheets API to load
  if (!gapi.client || !gapi.client.sheets) {
    setTimeout(loadData, 1000, id, unitRange, notesRange, excheckRange);
    return false;
  }

  // GET request for unit data
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: unitRange
  }).then(function(response) {
    // Array of Arrays => [Unit, Location, SP Time]
    let values = response.result.values;

    loadUnits(values);
    renderTable(values.filter(x => x[0] != 'Medic'));
  }, function(response) {
    alert('Error: ' + response.result.error.message);
    return false;
  });

  // GET request for notes data
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: notesRange
  }).then(function(response) {
    // List of notes items
    let values = response.result.values;
    let [title, ...items] = values;

    renderNotes(title, items);
  }, function(response) {
    alert('Error: ' + response.result.error.message);
    return false;
  });

  // GET request for excheck data
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: excheckRange
  }).then(function(response) {
    // List of notes items
    let values = response.result.values;

    renderExcheck(values);
  }, function(response) {
    alert('Error: ' + response.result.error.message);
    return false;
  });

  // Update every 30 seconds
  setTimeout(loadData, 30*1000, id, unitRange, notesRange, excheckRange);
}

/**
 * Step 2 in the data update process.
 * Formatted as: [Unit, Location, SP Time]
 * @param {Array} data array of arrays
 */
function loadUnits(data) {
  // Check coordinates
  let map = canvas.item(0);
  if (setLocs) {
    for (loc in locations) {
      setupLocation(loc, map);
    }
    setLocs = false;
  }

  // Prime saved data for refresh
  for (loc in locations) {
    let units = locations[loc]['units'];
    for (unit in units) {
      units[unit]['refresh'] = false;
    }
  }

  // Add updates to saved data
  let numUnits = data.length;
  for (let i = 0; i < numUnits; i++) {
    let unit = data[i][0];
    let loc = data[i][1];

    if (locations.hasOwnProperty(loc)) {
      let setLoc = locations[loc];

      // Handle Medics
      if (unit == 'Medic') {
        if (!setLoc['m']) {
          setLoc['m'] = true;
          renderMedic(loc, map);
        }
      }

      else {
        // Unit present at location
        if (setLoc['units'].hasOwnProperty(unit)) {
          setLoc['units'][unit]['refresh'] = true;
        }

        // Unit not present at location
        else {
          setLoc['units'][unit] = { refresh: true };
        }
      }
    }
  }
  renderUnits(map);
}

/**
 * Step 2a in the data update process.
 * @param {String} name 
 * @param {Object} map 
 */
function setupLocation(name, map) {
  // Setup coordinates
  locations[name]['coords'][0] *= map.aCoords.tr.x;
  locations[name]['coords'][1] *= map.aCoords.br.y;

  // Add label
  let w = canvas.getWidth() * 0.025;
  let rect = new fabric.Rect({
    originX: 'center',
    originY: 'center',
    fill: 'white',
    stroke: 'black',
    width: w*2,
    height: w/2
  });

  let text = new fabric.Text(name, {
    fontSize: 8,
    originX: 'center',
    originY: 'center'
  });

  let group = new fabric.Group([rect, text], {
    left: locations[name]['coords'][0] - w/2,
    top: locations[name]['coords'][1] + w/2
  });

  canvas.add(group);
}

/**
 * Step 2b in the data update process.
 * @param {Object} map
 */
function renderUnits(map) {
  function renderUnit(unit, coords, id) {
    let company;
    if (unit.charAt(0) == 'A') company = 'anzio';
    else if (unit.charAt(0) == 'B') company = 'bastogne';
    else company = 'carentan';
    let url = 'assets/squad_' + company + '.svg';
    fabric.loadSVGFromURL(url,
      function(objects, options) {
        let shape = fabric.util.groupSVGElements(objects, options);
        shape.scaleToWidth(map.aCoords.tr.x * 0.025);
        shape.setShadow('0px 0px 15px black');
        shape.left = coords[0];
        shape.top = coords[1];
        shape.id = id;
        canvas.add(shape);
        canvas.renderAll();
      }
    );
  }

  for (loc in locations) {
    let units = locations[loc]['units'];
    let count = 0, shift = 15;
    for (unit in units) {
      // Render unit
      if (units[unit]['refresh']) {
        let coords = locations[loc]['coords'];
        let xy = [coords[0] - shift * count - 45, coords[1] + 8];
        if (!units[unit].hasOwnProperty('objId')) {
          units[unit]['objId'] = id;
          renderUnit(unit, xy, id++);
        } else {
          let obj = getObjectById(units[unit]['objId']);
          canvas.bringToFront(obj);
          obj.left = xy[0];
          obj.top = xy[1];
        }
        count++;
      }
      // Delete unit
      else {
        let obj = getObjectById(units[unit]['objId']);
        canvas.remove(obj);
        delete units[unit];
      }
    }
  }
}

/**
 * Step 2c in the data update process.
 * @param {String} location 
 */
function renderMedic(location, map) {
  let url = 'assets/medic.svg';
  fabric.loadSVGFromURL(url,
    function(objects, options) {
      let shape = fabric.util.groupSVGElements(objects, options);
      shape.scaleToWidth(map.aCoords.tr.x * 0.02);
      shape.setShadow('0px 0px 15px black');
      shape.left = locations[location]['coords'][0] + 45;
      shape.top = locations[location]['coords'][1] + 12;
      canvas.add(shape);
      canvas.renderAll();
    }
  );
}

/**
 * Step 3 in the data update process.
 * Formatted as: [Unit, Location, SP Time]
 * @param {Array} data Rows of the table
 */
function renderTable(data) {
  let table = document.getElementById('battle_table');
  if (!table) {
    setTimeout(renderTable, 1000, data);
    return false;
  }
  let oldSize = table.rows.length;
  let newSize = data.length;

  // Populate table
  let i;
  for (i = 0; i < newSize; i++) {
    if (i >= oldSize) table.insertRow(-1);
    for (var j = 0; j < 3; j++) {
      if (!table.rows[i].cells[j]) table.rows[i].insertCell(-1);
      table.rows[i].cells[j].innerHTML = data[i][j];
    }
  }

  // Clear empty rows
  for (i; i < oldSize; i++) {
    table.deleteRow(i);
  }

  // Add color
  for (i = 0; i < newSize; i++) {
    switch(table.rows[i].cells[0].innerHTML.charAt(0)) {
      case 'A':
        table.rows[i].style.backgroundColor = 'rgba(255,127,0,.5)';
        break;
      case 'B':
        table.rows[i].style.backgroundColor = 'rgba(255,0,0,.5)';
        break;
      case 'C':
        table.rows[i].style.backgroundColor = 'rgba(0,0,255,.5)';
        break;
      default:
        break;
    }
  }
}

/**
 * Step 4 in the data update process.
 * @param {[String]} head Array with single title index
 * @param {Array} data List of notes items
 */
function renderNotes(title, items) {
  let list = document.getElementById('notes_list');
  if (!list) {
    setTimeout(renderNotes, 1000, title, items);
    return false;
  }

  // Clear list
  let i;
  var oldItems = document.querySelectorAll('li');
  for (i = 0; i < oldItems.length; i++) {
    list.removeChild(oldItems[i]);
  }

  // Populate list
  var newLen = items.length;
  for (i = 0; i < newLen; i++) {
    var li = document.createElement('li');
    li.innerHTML = items[i][0];
    if (li.innerHTML.includes('BN')) li.style.color = 'rgba(0,200,0,.8)';
    else if (li.innerHTML.includes('Anzio')) li.style.color = 'rgba(255,127,0,.8)';
    else if (li.innerHTML.includes('Bastogne')) li.style.color = 'rgba(255,0,0,.8)';
    else if (li.innerHTML.includes('Carentan')) li.style.color = 'rgba(0,0,255,.8)';
    list.appendChild(li);
  }
}

/**
 * Step 5 in the data update process.
 * Formatted as: [Category, Line #, Proword, Planned Time, Actual Time, Event]
 * @param {Array} data Rows of the table
 */
function renderExcheck(data) {
  let table = document.getElementById('excheck_table');
  if (!table) {
    setTimeout(renderTable, 1000, data);
    return false;
  }
  let oldSize = table.rows.length;
  let newSize = data.length;

  // Populate table
  let i;
  for (i = 0; i < newSize; i++) {
    if (i >= oldSize) table.insertRow(-1);
    for (var j = 0; j < 6; j++) {
      if (!table.rows[i].cells[j]) table.rows[i].insertCell(-1);
      if (data[i][j]) table.rows[i].cells[j].innerHTML = data[i][j];
    }
  }

  // Clear empty rows
  for (i; i < oldSize; i++) {
    table.deleteRow(i);
  }

  // Add color
  let time = new Date();
  let nowtime = time.getHours().toString() + time.getMinutes().toString();
  for (i = 0; i < newSize; i++) {
    let duetime = table.rows[i].cells[3].innerHTML;
    if (parseInt(duetime) < parseInt(nowtime)) {
      console.log("Duetime: " + duetime + "\nNowtime: " + nowtime);
      table.rows[i].style.fontWeight = 'bold';
      table.rows[i].style.backgroundColor = '#FF0000';
    }
    if (i > 0 && table.rows[i].cells[4].innerHTML) {
      table.rows[i].style.fontWeight = 'bold';
      table.rows[i].style.backgroundColor = '#FFFF00';
    }
  }
}