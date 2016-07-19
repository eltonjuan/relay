var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// var people = require('./people.js');

var people = {people:[]};

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/client', function (req, res) {
  res.sendFile(__dirname + '/client.html');
});


var allClients = [];
io.on('connection', (socket) => {
  console.log('connecting', socket.id);
  socket.emit('CUSTOMER_LIST', people);
  socket.on('NEW_CUSTOMER', handleNewCustomer.bind(null, socket));

  socket.on('disconnect', () => {
    var toRemove = [];
    people.people.forEach((person, i) => {
      if (person.socketId === socket.id) {
        toRemove.push(i);
      }
    });
    // this is kinda hacky
    toRemove.forEach(index => {
      people.people.splice(index, 1);
    });
    io.emit('CUSTOMER_LIST_CHANGED', people);
  });
});

function handleNewCustomer(socket, data) {
  data.socketId = socket.id;
  people.people.push(data);
  io.emit('CUSTOMER_LIST_CHANGED', people);
}



