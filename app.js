var http = require('http');
var path = require('path');
var express = require('express');
var app = module.exports = express();
var util = require('util');
var fs = require('fs');
// source: https://github.com/Worlize/WebSocket-Node
// how to deal websockets with asp.net: http://habrahabr.ru/post/145077/
var WebSocketServer = require('websocket').server;

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
	
	if ('OPTIONS' == req.method)
		return res.send(200);
	else	
		next();
};

app.configure(function() {
	app.set('port', process.env.port || 3000);
	
	app.use(allowCrossDomain);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser({
		uploadDir: __dirname + '/public/uploads',
		keepExtensions: true
	}));
	app.use(express.limit('5mb'));
	app.use(express.methodOverride());	
	// IMPORTANT: use cookieParser before router
	app.use(express.cookieParser());
	app.use(express.session({secret: 'cool beans'}));	
	app.use(app.router);
	app.use(express.static(path.join(__dirname, '/public')));
	app.use(express.errorHandler({
		dumpExceptions: true, showStack: true
	}));	
});

app.get('/', function(req, res) {
	res.redirect('/index.html');
});

app.post('/upload', function(req, res) {
	console.log(req.body);
	res.send(201);	
});

app.post('/uploadFile', function(req, res) {
	if (req.files)
		console.log(req.files);
		
	res.json({
		result: true, 
		message: 'fileUploadedSuccessfully',
		name: req.files.image.name,
		type: req.files.image.type,
		size: req.files.image.size
	});
});

var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port: ' + app.get('port'));
});

var wsServer = new WebSocketServer({
	httpServer: server,
	autoAcceptConnections: false
});

function originIsAllowed(origin) {
	return true;
}

wsServer.on('request', function(req) {	
	if (!originIsAllowed(req.origin)) {
		req.reject();
		console.log((new Date()) + ' Connection from origin ' + req.origin + ' rejected.');
		return;
	}
	
	var conn = req.accept('echo-protocol', req.origin);
	console.log((new Date()) + ' Connection accepted.');
	conn.on('message', function(message) {
		if (message.type === 'utf8') {
			console.log('Received Message: ' + message.utf8Data);
			conn.sendUTF(message.utf8Data);
		} else if (message.type === 'binary') {
			console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
			conn.sendBytes(message.binaryData);
		}
	});
	conn.on('close', function(reasonCode, description) {
		console.log((new Date()) + ' Peer ' + conn.remoteAddress + ' disconnected');
	});
});