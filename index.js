/* jshint node: true */
// "use strict";

/**
 * entry point
 *
 */

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

// HTTP
var httpServer = http.createServer(function (request, response) {
    unifiedServer(request, response);
});
httpServer.listen( config.httpPort, function() {
	console.log( 'server is listening on port: ' + config.httpPort );
});
// HTTPS
var httpsServerOptions = {
	key: fs.readFileSync('./https/key.pem'),
	cert: fs.readFileSync('./https/serct.pem')
};
var httpsServer = https.createServer(  httpsServerOptions, function( request,response ) {
	unifiedServer( request,response );
});
httpsServer.listen( config.httpsPort, function() {
	console.log( 'server is listening on port: ' + config.httpsPort );
});

// unified server
var unifiedServer = function( request,response ) {
	var parsedUrl = url.parse( request.url,true );
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');
	var method = request.method.toLowerCase();
	var queryStringObject = parsedUrl.query;
	var headers = request.headers;
	var decoder = new StringDecoder('utf-8');
	var buffer = '';

    request.on('data', function (chunk) {
        buffer += decoder.write(chunk);
    });

	request.on( 'end', function () {
		// send response
		buffer += decoder.end();
		// choose the handler for given reques or 404 handler
		var chosenHandler = typeof( router[trimmedPath] ) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
		// varruct data object to cend to handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'headers': headers,
			'payload': helpers.parseJsonToObject( buffer )
		};
		// route the request to specified route
		chosenHandler ( data, function( statusCode, payload ) {
			// use the statuscode called by handler od default one
			statusCode = typeof( statusCode ) == 'number' ? statusCode : 200;
			// use the payload returned by handler or default one
			payload = typeof( payload ) == 'object' ? payload : {};
			var payloadString = JSON.stringify( payload );
			response.setHeader('Content-Type', 'application/json');
			response.writeHead( statusCode );
			response.end( payloadString );
		});
	});
};

// define request router
var router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens
};























