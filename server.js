console.log("launching app")
const server_version = "0.1.2"

var express = require('express')
var socket = require('socket.io')

var app = express()
var SERVER_PORT = process.env.PORT || 8080
var server = app.listen(SERVER_PORT)
console.log("........... on port : " + SERVER_PORT);
app.use(express.static('public'))

console.log("server version " + server_version);

//=============================================================================

var io = socket(server)
io.sockets.on('connection', newConnection)

var connections = 0


function newConnection(socket) {
  connections++;
  console.log("new connection:" + socket.id);
  //events setup for communication
  socket.on('disconnect', clientDisconnection)
  socket.on('message', clientMessage)
  socket.on('data', clientData)

  //on connection
  socket.join("room")
  //send test message
  io.to("room").emit('message', 'users online:' + connections)

  function clientMessage(data) {
    console.log(data);
    //socket.broadcast.emit('message', data) // only others
    //io.sockets.emit('message', data) //everyone connected

  }

  function clientData(dataString) {
    try {
      var data = JSON.parse(dataString)
      if (data.request == "createLobby") {
        createLobby(data)
      }else if (data.request == "changeRoom") {
        changeRoom(data)
      }else if (data.request == "lobbiesList") {
        console.log("lobbies send");
        sendLobbiesList(socket.id)
      }else if (data.request == "chat") {
        sendMessageToRoom(data, socket.id)
      }else if (data.request == "score") {
        sendScoreToRoom(data, socket.id)
      }

    } catch (e) {
      console.log(dataString);
      console.log(e);
    }
  }

  function clientDisconnection(data) {
    connections--;
    io.to("room").emit('message', 'users online:' + connections)
  }

  function changeRoom(data) {
    console.log("changing room: " + data.room);
    socket.join(data.room)
  }

  function sendMessageToRoom(data, id){

    var message = data.message
    var secure_message = JSON.parse(JSON.stringify(message.replace(/</g, "&lt;").replace(/>/g, "&gt;")));

    message = message.replace(/ /g, "")
    if(message === "")return;

    var server_message_data = {
      "request": "chat",
      "custom_name": data.custom_name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      "message": secure_message
    }

    io.to(data.room).emit('data', JSON.stringify(server_message_data))
  }

  function sendScoreToRoom(data, id){
    var score = data.score

    var message = score + ""
    if(isNaN(message))return
    var secure_message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if(secure_message != message)return
    if(score > 100 || score < 0)return

    var server_message_data = {
      "request": "score",
      "custom_name": data.custom_name.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
      "score": score
    }

    io.to(data.room).emit('data', JSON.stringify(server_message_data))
  }

}






///lobbies

var lobbies_list = []



function createLobby(data) {
  var new_lobby = {
    "lobby_id": data.lobby_id,
    "song_id": data.song_id,
    "title": data.title,
    "artist": data.artist,
    "difficulty": data.difficulty,
    "owner": data.owner,
    "private": data.private,
    "start_time": data.start_time,
    "player_limit": data.player_limit,
    "player_count": 0
  }
  console.log("lobby created");
  lobbies_list[lobbies_list.length] = new_lobby

  sendLobbiesList() //sends the update
}


function sendLobbiesList(socketId) {
  removeOldLobbies()
  console.log(lobbies_list);
  var list = []
  for (var i = 0; i < lobbies_list.length; i++) {
    if(lobbies_list[i].private ==1){
      continue;
    }
    list[list.length] = lobbies_list[i]
  }
  var listdata = {'list' : list}
  io.clients[socketId].send("data",JSON.stringify(listdata))
}

function sendLobbiesList() {
  removeOldLobbies()

  var list = []
  for (var i = 0; i < lobbies_list.length; i++) {
    if(lobbies_list[i].private){
      continue;
    }
    list[list.length] = lobbies_list[i]
  }
  var listdata = {'list' : list}
  io.to("lobbies_list").emit("data",JSON.stringify(listdata))
}


function removeOldLobbies() {
  var d = new Date();
  var n = d.getTime()/1000;
  for (var i = 0; i < lobbies_list.length; i++) {
    if(lobbies_list[i].start_time <= n){
      lobbies_list.splice(i,1) //removes an emplty lobby
    }
  }
}
