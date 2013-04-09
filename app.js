var http = require('http');
var path = require('path');
var express = require('express');
var app = module.exports = express();
var util = require('util');

app.configure(function() {
	app.set('port', process.env.port || 3000);

	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.static(path.join(__dirname, '/public')));
	// IMPORTANT: use cookieParser before router
	app.use(express.cookieParser());
	app.use(app.router);
	app.use(express.errorHandler({
		dumpExceptions: true, showStack: true
	}));
});

app.get('/', function(req, res) {
	res.redirect('/index.html');
});

http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening on port: ' + app.get('port'));
});