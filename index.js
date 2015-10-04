var auth = require('./auth.js');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');

var router = express.Router();
var jsonParser = bodyParser.json();

router.post('/', jsonParser, function(req, res) {
  auth.groupMemberships(req.body.user, req.body.password,
    function(groups) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(groups));
    },
    function() {
      res.writeHead(403, {'Content-Type': 'application/json'});
      res.end('');
    });
})

var app = express();
app.use('/groups', router);

var port = '3010';
app.set('port', port);

var server = http.createServer(app);
server.listen(port);
