var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');

var port = 3000;

// Serve up public/ftp folder
var serve = serveStatic('./', {'index': ['index.html', 'index.htm']});

// Create server
var server = http.createServer(function onRequest (req, res) {
  serve(req, res, finalhandler(req, res));
});

// Listen
server.listen(port);

console.log('static-server listening on http://localhost:' + port);

