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
  var delta = opt.e.deltaY;
  var zoom = canvas.getZoom();

  zoom = zoom - delta/200;
  if (zoom > 20) zoom = 20;
  if (zoom < 1) zoom = 1;

  canvas.zoomToPoint({
    x: opt.e.offsetX,
    y: opt.e.offsetY
  }, zoom);

  opt.e.preventDefault();
  opt.e.stopPropagation();

  var vpt = this.viewportTransform;

  if (zoom < 400 / 1000) {
    this.viewportTransform[4] = 200 - 1000 * zoom / 2;
    this.viewportTransform[5] = 200 - 1000 * zoom / 2;
  } else {
    if (vpt[4] >= 0) {
      this.viewportTransform[4] = 0;
    } else if (vpt[4] < canvas.getWidth() - 1000 * zoom) {
      this.viewportTransform[4] = canvas.getWidth() - 1000 * zoom;
    }
    if (vpt[5] >= 0) {
      this.viewportTransform[5] = 0;
    } else if (vpt[5] < canvas.getHeight() - 1000 * zoom) {
      this.viewportTransform[5] = canvas.getHeight() - 1000 * zoom;
    }
  }
});

// Add map to canvas
fabric.Image.fromURL('assets/map.jpg', (img) => {
  img.set({
    left: 0,
    top: 0
  });
  img.scaleToWidth(canvas.getWidth());
  canvas.add(img);
});

// Add unit to canvas
function addUnit() {
  var unit = document.getElementById('unit_select');
  var unit_value = unit.options[unit.selectedIndex].value;

  var color = document.getElementById('color_select');
  var color_value = color.options[color.selectedIndex].value;

  var url = "assets/" + unit_value + ".svg";
  var group = [];
  fabric.loadSVGFromURL(url,
    function(objects, options) {
      var shape = fabric.util.groupSVGElements(objects, options);
      shape.set({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      });

      canvas.add(shape);

      // Shadow color
      let shadow;
      switch (color_value) {
        case "green":
          shadow = "rgba(0,255,0,1)";
          break;
        case "orange":
            shadow = "rgba(255,127,0,1)";
          break;
        case "red":
            shadow = "rgba(255,0,0,1)";
          break;
        case "blue":
            shadow = "rgba(0,0,255,1)";
          break;
      }
      shape.setShadow("0px 0px 15px " + shadow);
      canvas.renderAll();
    },
    function(item, object) {
      object.set('id', item.getAttribute('id'));
      group.push(object);
    }
  );
}

// Remove unit from canvas
function delUnit() {
  canvas.remove(canvas.getActiveObject());
}

canvas.renderAll();

