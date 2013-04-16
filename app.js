var http = require('http');
var path = require('path');
var express = require('express');
var app = module.exports = express();
var util = require('util');

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
	app.use(express.bodyParser());
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

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port: ' + app.get('port'));
});