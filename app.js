var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fetch = require('node-fetch');

// var people = require('./people.js');

var people = {people:[]};

server.listen(3000);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/user', function(req, res) {
    fetch('https://api.nike.com/profile/classic/users/' + req.query.id+ '/account', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.query.access_key
    }
  }).then(function(resp){
    return resp.json()
  }).then(function(json){
    res.send(json);
  })
})

// app.get('/user', function (req, res) {
//   fetch('https://api.nike.com/profile/classic/users/' + req.query.id+ '/account', {
//     method: 'GET',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + req.query.access_key
//     }
//   }).then(function(resp) {
//     return resp.json();
//   }).then(function(json) {
//     res.send(makeNewCustomer(json));
    
//   });
// });


app.get('/view', function (req, res) {
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

function makeNewCustomer(json) {
    //var doc = document.createElement('template');
    var doc =  "<script src='/socket.io/socket.io.js'></script><script> \
      var socket = io.connect('localhost:3000');\
      socket.emit('NEW_CUSTOMER', \
        {name: "+ json.entity.firstName + ' ' + json.entity.lastName +
        ",dob: " + json.entity.dateOfBirth +
        ",avatar:" + json.entity.avatar +"});</script><body></body>";
    return doc;
}

function handleNewCustomer(socket, data) {
  console.log(people);
  data.socketId = socket.id;
  people.people.push(data);
  io.emit('CUSTOMER_LIST_CHANGED', people);
}



