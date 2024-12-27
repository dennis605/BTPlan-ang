nw.Window.open('index.html', {
  width: 1280,
  height: 800,
  min_width: 800,
  min_height: 600,
  position: 'center',
  frame: true,
  show: true,
  focus: true,
  toolbar: true
}, function(win) {
  win.on('closed', function() {
    win = null;
  });
});
