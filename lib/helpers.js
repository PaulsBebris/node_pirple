var crypto = require('crypto');
var config = require('./config');
var helpers = {};

helpers.hash = function( string ) {
	if( typeof( string ) == 'string' && string.length > 0){
		var hash = crypto.createHash('sha256', config.hashingSecret).update( string ).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// parse to JSON without! throwing
helpers.parseJsonToObject = function( jsonSrting ) {
	try {
		var object = JSON.parse( jsonSrting );
		return object;
	} catch (error) {
		return {};
	}
};

// create random string / TOKEN
helpers.createRandomString = function( stringLength ) {
	stringLength = typeof( stringLength == 'number') && stringLength > 0 ? stringLength : false;
	if( stringLength ) {
		var possibleCahracters = 'qwertyuioplkjhgfdsazxcvbnm0123456789';
		var string = '';
		for( var i = 1; i < stringLength; i++ ) {
			var character = possibleCahracters.charAt( Math.floor( Math.random( stringLength ) * 10 ) );
			string += character;
		}
		console.log( `String random: ${string}` );
		return string;
	} else {
		return false;
	}
};







module.exports = helpers;