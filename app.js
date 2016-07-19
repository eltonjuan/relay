var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

var connections = [];

io.on('connection', (socket) => {
  setInterval(() => {socket.emit('news')}, 300);
  socket.on('my other event', function (data) {
    
  });
});

io.on('disconnect', (socket) => {

});



// io.sockets.map((e) => {
//   console.log(e);
// })
// setInterval(() => {console.log('hi')}, 300);


