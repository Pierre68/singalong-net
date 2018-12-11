console.log("launching app")
const server_version = "0.1.0"

var express = require('express')
var socket = require('socket.io')

var app = express()
var SERVER_PORT = process.env.PORT || 8080
var server = app.listen(SERVER_PORT)
console.log("........... on port : " + SERVER_PORT);
app.use(express.static('public'))

//=============================================================================

var io = socket(server)
io.sockets.on('connection', newConnection)

var connections = 0


function newConnection(socket) {
  connections++;
  console.log("new connection " + socket.id);
  //events setup for communication
  socket.on('disconnect', clientDisconnection)
  socket.on('message', clientDataMessage)

  //on connection
  socket.join("room")
  //send test message
  io.to("room").emit('message', 'hello ! users online:' + connections)

  function clientDataMessage(data) {
    console.log(data);

    //socket.broadcast.emit('message', data) // only others
    //io.sockets.emit('message', data) //everyone connected

  }
  function clientDisconnection(data) {
    connections--;

  }
}
