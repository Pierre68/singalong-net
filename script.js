














///socket io
function pageLoad(event) {
  console.log("load");
  //34.255.233.169
  socket = io.connect("https://singalong-net.herokuapp.com/")
  socket.on('message', onMessage)
  socket.on('data', onData)


  sendData(JSON.stringify({"request":"changeRoom", "room":"lobbies_list"})) // connect to the datastream
  sendData(JSON.stringify({"request":"lobbiesList"})) // get lobbies list
  //IMPORTANT   use ""  in JSON not ''    but dont forget it's inverted by PHP
}

var socket

function onMessage(data) {
  console.log(data);
}

function onData(dataString) {
  console.log("data");
  try {
    var data = JSON.parse(dataString)
    console.log(data);
  } catch (e) {
    console.log(e);
  }
}

function sendData(data) {
  socket.emit('data', data)
}
