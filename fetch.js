var fetch = require('node-fetch');


fetch('https://api.nike.com/profile/classic/users/13144375146/account', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer XB0R74GgBB5nWNZseTQgxIiF9Hbw'
  }
}).then(function(res){
  return res.json();
}).then(function(json) {
  console.log(json);
}); ; 