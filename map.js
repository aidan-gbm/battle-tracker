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
  canvas.add(img);
});

// Add unit to canvas
locations = {"usmaps":{"x": 702,"y": 129},"j2j3": {"x": 714,"y": 168},"bullpond": {"x": 203,"y": 455},"range35": {"x": 527,"y": 291},"range78": {"x": 476,"y": 326},"range11": {"x": 435,"y": 378},"kach": {"x": 717,"y": 108},"usma": {"x": 836,"y": 159},"buckner": {"x": 323,"y": 399},"lrcmarne": {"x": 367,"y": 392}};
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
    if (numAdded[loc] % 4 == 0) {
      coords.push(locations[loc]["x"]);
      coords.push(locations[loc]["y"] - 25);
    }
    else if (numAdded[loc] % 4 == 1) {
      coords.push(locations[loc]["x"] + 25);
      coords.push(locations[loc]["y"]);
    }
    else if (numAdded[loc] % 4 == 2) {
      coords.push(locations[loc]["x"]);
      coords.push(locations[loc]["y"] + 25);
    }
    else {
      coords.push(locations[loc]["x"] - 25);
      coords.push(locations[loc]["y"]);
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

canvas.on('object:modified', function(opt) {
  var o = opt.target;
  var p = document.getElementById('unit_location');
  p.innerText = "Position - X: " + o.get('left') + ", Y: " + o.get('top');
});

canvas.renderAll();

