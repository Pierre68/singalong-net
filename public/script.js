window.onload = function WindowLoad(event) {
  console.log("load");
  socket = io.connect(document.URL)
  socket.on('message', dataMessage)

}

var socket

function dataMessage(data) {
  document.getElementById('test').innerHTML = data
}

function dataSend() {
   socket.emit('message', data)
}
