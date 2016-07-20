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

app.get('/user', function (req, res) {
  fetch('https://api.nike.com/profile/classic/users/' + req.query.id+ '/account', {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + req.query.access_key
    }
  }).then(function(resp) {
    console.log('11111111111111111')
    return resp.json();
  }).then(function(json) {
    console.log('11111111111111111')
    res.send(makeNewCustomer(json));    
  }).catch(function(error) {
    console.log(error)
    throw error;
  });
});


app.get('/view', function (req, res) {
  var userID = req.query.id;
  var wishlistIDs = mockGetWishlistIDs(userID);
  var purchaseIDs = mockGetPurchaseIDs(userID);
  var recommendIDs = mockGetRecommendIDs(userID);
  var wishlistList = [];
  var purchaseList = [];
  var recommendList = [];
  var config = {wishlistList, purchaseList, recommendList, res, userID};

  wishlistIDs.forEach(id => {

    fetch('https://commerce-api.nike.com/commerce/v1/us/en_US/product/'+id+'/details.json?client=mpos_AssistTheInterns&store=true&online=true', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(function(resp) {
      return resp.json();
    }).then(function(json) {
      wishlistList.push(json);
      finished(config);
    }).catch(function(error) {
      throw error;
    });
  });

  purchaseIDs.forEach(id => {
    id = '831069-401'
    fetch('https://commerce-api.nike.com/commerce/v1/us/en_US/product/'+id+'/details.json?client=mpos_AssistTheInterns&store=true&online=true', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'}
    }).then(function(resp) {
      return resp.json();
    }).then(function(json) {
      purchaseList.push(json);
      finished(config);
    }).catch(function(error) {
      console.log(error)
    throw error;
    });
  });
  recommendIDs.forEach(id => {
    fetch('https://commerce-api.nike.com/commerce/v1/us/en_US/product/'+id+'/details.json?client=mpos_AssistTheInterns&store=true&online=true', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'}
    }).then(function(resp) {
      return resp.json();
    }).then(function(json) {
      recommendList.push(json);
      finished(config)
    }).catch(function(error) {
      throw error;
    });
  });

});

function finished(config) {
  if (config.wishlistList.length && config.purchaseList.length && config.recommendList.length) {
    var user;
    people.people.forEach(person => {
      if (person.id == config.userID) {
        user = person;
        user.wishlist = config.wishlistList;
        user.purchases = config.purchaseList;
        user.recommended = config.recommendList;
      }
    });
    config.res.send(user);

  }
}

var allClients = [];
io.on('connection', (socket) => {
  console.log('new connection', socket.id);
  socket.emit('CUSTOMER_LIST', people);
  socket.on('NEW_CUSTOMER', handleNewCustomer.bind(null, socket));

  socket.on('disconnect', () => {
    console.log('disconnecting', socket.id);
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

    var doc = `
      <html>
        <head>
          <title>Nike App</title>
          <script src="/socket.io/socket.io.js"></script>
          <script>
            var socket = io.connect('localhost:3000');
            socket.emit('NEW_CUSTOMER', {
              name: '${json.entity.firstName} ${json.entity.lastName}',
              id: '${json.entity.id}',
              dob: '${json.entity.dateOfBirth}',
              avatar: '${json.entity.avatar.fullUrl}'
            });
          </script>
        </head>
        <body>
        </body>
      </html>
    `
    return doc;
}

function handleNewCustomer(socket, data) {
  data.socketId = socket.id;
  people.people.push(data);
  io.emit('CUSTOMER_LIST_CHANGED', people);
}

function updateList() {
  var doc = `
      <html>
        <head>
          <title>Nike App</title>
          <script src="/socket.io/socket.io.js"></script>
          <script>
            var socket = io.connect('localhost:3000');
            socket.emit('CUSTOMER_LIST_CHANGED', '${people}');
          </script>
        </head>
        <body>
        </body>
      </html>
    `
}

function mockGetWishlistIDs (userID) {
    if(userID == '14884403984') {
       var list = ['10989446', '10340024', '10997573', '10838184']; 
    } else {
       var list = ['11055703', '11070665', '11055850', '11009627'];
    }
    return list;
}

function mockGetPurchaseIDs (userID) {
    if(userID == '14884403984') {
      var recents = ['10720833', '10201707', '11049570', '11008359'];
    } else {
      var recents = ['11056424', '11096058', '10873962', '11056362'];
    }
    return recents;
}

function mockGetRecommendIDs (userID) {
    if(userID == '14884403984') {
      var recents = ['10720833', '10201707', '11049570', '11008359'];
    } else {
      var recents = ['11056424', '11096058', '10873962', '11056362'];
    }
    return recents;
}

