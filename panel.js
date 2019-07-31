function openLeftPanel() {
  document.getElementById('panel-left').style.width = '25vw';
  document.getElementById('main').style.marginLeft = '25vw';
  document.getElementById('header').style.marginLeft = '25vw';
}

function closeLeftPanel() {
  document.getElementById('panel-left').style.width = '0';
  document.getElementById('main').style.marginLeft = '0';
  document.getElementById('header').style.marginLeft = '0';
}

function openRightPanel() {
  document.getElementById('panel-right').style.width = '75vw';
}

function closeRightPanel() {
  document.getElementById('panel-right').style.width = '0';
}