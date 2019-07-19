var canvas = new fabric.Canvas('map_canvas', {
  selectionColor: 'blue',
  selectionLineWidth: 1,
  moveCursor: 'move'
});

// Resize canvas to fill div
window.addEventListener('resize', resizeCanvas, false);
function resizeCanvas() {
  canvas.setWidth = window.innerWidth * 0.675;
  canvas.setHeight = window.innerHeight * 0.65;
}

// Add map to canvas
fabric.Image.fromURL('/map.jpg', (img) => {
  img.set({
    left: 0,
    top: 0
  });
  img.scaleToHeight(100);
  img.scaleToWidth(100);
  canvas.add(img);
});
