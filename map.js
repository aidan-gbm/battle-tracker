var canvas = new fabric.Canvas('map_canvas', {
  selectionColor: 'blue',
  selectionLineWidth: 1,
  moveCursor: 'move',
  width: window.innerWidth * 0.675,
  height: window.innerHeight * 0.65
});

// Set mouse wheel zoom
canvas.on('mouse:wheel', function(opt) {
  var delta = opt.e.deltaY;
  var zoom = canvas.getZoom();

  zoom = zoom - delta/200;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.1) zoom = 0.1;

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
fabric.Image.fromURL('https://github.com/aidan-mccarthy/battle-tracker/blob/master/map.jpg?raw=true', (img) => {
  img.set({
    left: 0,
    top: 0
  });
  img.scaleToWidth(canvas.getWidth());
  canvas.add(img);
});

canvas.renderAll();