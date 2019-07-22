var canvas = new fabric.Canvas('map_canvas', {
  selectionColor: 'blue',
  selectionLineWidth: 1,
  moveCursor: 'move',
  width: window.innerWidth * 0.675,
  height: window.innerHeight * 0.65,
  preserveObjectStacking: true
});

// Set mouse wheel zoom
canvas.on('mouse:wheel', function(opt) {
  var delta = -(opt.e.deltaY/200);
  var zoom = canvas.getZoom();

  zoom = zoom + delta;
  if (zoom > 20) zoom = 20;
  else if (zoom < 1) zoom = 1;

  canvas.zoomToPoint({
    x: opt.e.offsetX,
    y: opt.e.offsetY
  }, zoom);

  opt.e.preventDefault();
  opt.e.stopPropagation();
});

// Add map to canvas
fabric.Image.fromURL('assets/map.jpg', function(img) {
  img.scaleToWidth(canvas.getWidth());
  img.selectable = false;
  canvas.add(img);
});

// Add unit to canvas
locations = {"usmaps":{"x": 0.7492,"y": 0.1848},"j2j3": {"x": 0.7654,"y": 0.2371},"bullpond": {"x": 0.2295,"y": 0.6453},"range35": {"x": 0.5657,"y": 0.4065},"range78": {"x": 0.5115,"y": 0.4541},"range11": {"x": 0.4670,"y": 0.5220},"kach": {"x": 0.7649,"y": 0.1570},"usma": {"x": 0.8935,"y": 0.2224},"buckner": {"x": 0.3481,"y": 0.5549},"lrcmarne": {"x": 0.3319,"y": 0.6191}};
numAdded = {"usmaps":0,"j2j3":0,"bullpond":0,"range35":0,"range78":0,"range11":0,"kach":0,"usma":0,"buckner":0,"lrcmarne":0};
function addUnit(unit, location, number) {
  let color;
  if (unit == "BN") color = "rgba(0,255,0,1)";
  else if (unit == "Anzio") color = "rgba(255,127,0,1)";
  else if (unit == "Bastogne") color = "rgba(255,0,0,1)";
  else if (unit == "Carentan") color = "rgba(0,0,255,1)";

  let size;
  if (number < 5) size = "team";
  else if (number < 13) size = "squad";
  else if (number < 25) size = "section";
  else if (number < 45) size = "platoon";
  else size = "company";
  
  var coords = [];
  var loc = location.toLowerCase().replace(/[\s+\/]/g,'');
  if (locations.hasOwnProperty(loc)) {
    var map = canvas.item(0);
    const x = locations[loc]['x'] * map.aCoords.tr.x;
    const y = locations[loc]['y'] * map.aCoords.br.y;
    if (numAdded[loc] % 4 == 0) {
      coords.push(x);
      coords.push(y - 15);
    }
    else if (numAdded[loc] % 4 == 1) {
      coords.push(x + 15);
      coords.push(y);
    }
    else if (numAdded[loc] % 4 == 2) {
      coords.push(x);
      coords.push(y + 15);
    }
    else {
      coords.push(x - 15);
      coords.push(y);
    }

    numAdded[loc] = numAdded[loc] + 1;
  } else {
    console.log('Error: ' + loc + ' doesn\'t exist!');
  }

  var group = [];
  var url = "assets/" + size + ".svg";
  fabric.loadSVGFromURL(url,
    function(objects, options) {
      var shape = fabric.util.groupSVGElements(objects, options);
      shape.setShadow("0px 0px 15px " + color);
      shape.scaleToWidth(30);
      shape.left = coords[0];
      shape.top = coords[1];
      canvas.add(shape);

      // Shadow color
      canvas.renderAll();
    },
    function(item, object) {
      object.set('id', item.getAttribute('id'));
      group.push(object);
    }
  );
}

// Remove units from canvas
function clearUnits() {
  var objects = canvas.getObjects();
  for (var i = 1; i < objects.length; i++) {
    canvas.remove(objects[i]);
  }
}

// DEBUG
canvas.on('object:modified', function(opt) {
  var o = opt.target;
  var p = document.getElementById('unit_location');
  var map = canvas.item(0);
  var pL = o.get('left') / map.aCoords.tr.x;
  var pT = o.get('top') / map.aCoords.br.y;
  p.innerText = "DEBUG\n" +
    "Map\tW: " + map.aCoords.tr.x + ", H: " + map.aCoords.br.y + '\n' +
    "Object\tL: " + o.get('left') + ", T: " + o.get('top') + '\n' +
    "Percent\tX: " + pL + ", Y: " + pT;
});

canvas.renderAll();

