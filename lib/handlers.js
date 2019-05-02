/**
 * 
 * 
 */
var config = require('./config')
var _data = require('./data');
var helpers = require('./helpers');

var handlers = {};

handlers.ping = function ( data, callback ) {
	// callback http status code and payload
	// console.log(data);
	callback( 200, {'ping': 'app is alive ... '} );
};

handlers.users = function ( data, callback ) {
	var acceptableMethods = ['post','get','put','delete'];
	if( acceptableMethods.indexOf( data.method ) > -1 ) {
		handlers._users[ data.method ]( data, callback );
	} else {
		callback( 405 ); // method not allowed
	}
};

// container for users submethods
handlers._users = {};
/**
 * @param firsName required
 * @param lastName
 * @param phone
 * @param password
 * @param tosAgreement
 */
handlers._users.post = function ( data, callback){
	var firstName = typeof( data.payload.firstName ) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof( data.payload.lastName ) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone = typeof( data.payload.phone ) == 'string' && data.payload.phone.trim().length > 6 ? data.payload.phone.trim() : false;
	var password = typeof( data.payload.password ) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof( data.payload.tosAgreement ) == 'boolean' && data.payload.tosAgreement == true ? true : false;
	// proceede ONLY if all above is valid !!!
	if( firstName && lastName && phone && password && tosAgreement ){
		// check for phone existance
		_data.read( 'users', phone, function( error, data ){
			if( error ) {
				// hash passwords
				var hashedPassword = helpers.hash( password );
				// create the user object
				if( hashedPassword ){
					var userObject = {
						'firstName': firstName,
						'lastName': lastName,
						'phone': phone,
						'password': hashedPassword,
						'tosAgreement': true
					};
					_data.create('users', phone, userObject, function( error ) {
						if( !error ) {
							callback( 200 );
						} else {
							callback( 500, {'Error': 'Could not create user'});
						}
					});
				} else {
					callback( 500, {'Error': 'Could not hash (origin: handlers)'});
				}
			} else {
				callback( 400, {'Error': 'User/Phone exists'});
			}
		});
	} else {
		callback( 400, {'Error': 'Missing required fields'} );
	}
};

/**
 * @param phone required
 */
// @TODO restrict users to their OWN OBJECTS
handlers._users.get = function ( data, callback){
	// check if phone number is valid
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length > 7 ? data.queryStringObject.phone : false;
	if( phone ){
		_data.read('users', phone, function( error, userDataObject ){
			if( !error && userDataObject ){
				// trim sensitive data from useDataObject
				delete userDataObject.password;
				callback( 200, userDataObject );
			} else {
				callback( 404 );
			}
		});
	} else {
		callback( 400, {'Error': 'Not a valid phone number'});
	}
};

/**
 * @param phone required
 */
// @TODO restrict users to their OWN OBJECTS
handlers._users.put = function ( data, callback){
	// check if phone number is valid
	var firstName = typeof( data.payload.firstName ) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof( data.payload.lastName ) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.length > 7 ? data.queryStringObject.phone : false;
	var password = typeof( data.payload.password ) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if( phone ) {
		if( firstName || lastName || password ) {
			_data.read( 'users', phone, function( error, userData ) {
				if( !error && userData) {
					// update fields with teh new values
					if( firstName ) {
						userData.firstName = firstName;
					}
					if( lastName ) {
						userData.lastName = lastName;
					}
					if( password ) {
						userData.password = helpers.hash( password );
					}
					_data.update( 'users', phone, userData, function( error ) {
						if( !error ) {
							callback( 200, 'User has been updated');
						} else {
							console.log( error );
							callback( 500, {'Error': 'Error updating field'});
						}
					});
				} else {
					callback( 400, {'Error': 'user does not exist'});
				}

			});
		} else {
			callback( 400, {'Error': 'Nothing to update'} );
		}
	} else {
		callback( 400, {'Error': 'Not a valid phone number'});
	}
};
/**
 * @param {string} phone
 * @TODO cleanup other files assiciated with this user
 */
handlers._users.delete = function ( data, callback ) {

	var phone = typeof( data.queryStringObject.phone ) == 'string' && data.queryStringObject.phone.length > 7 ? data.queryStringObject.phone : false;
	if( phone ){
		_data.read( 'users', phone, function( error, data ){
			if( !error && data ){
				_data.delete( 'users', phone, function( error ){
					if( !error ) {
						callback( 200 );
					} else {
						console.log( error );
						callback( 500, {'Error': 'can not delete user'});
					}
				});				
			} else {
				callback( 400, {'Error': 'could not find user'});
			}
		});
	} else {
		callback( 400, {'Error': 'Missing required field'});
	}
};

// 404 handler
handlers.notFound = function ( data, callback ) {
	callback( 404 );
};

 // tokens
handlers.tokens = function ( data, callback ) {
	var acceptableMethods = ['post','get','put','delete'];
	if( acceptableMethods.indexOf( data.method ) > -1 ) {
		handlers._tokens[ data.method ]( data, callback );
	} else {
		callback( 405 ); // method not allowed
	}
};

handlers._tokens = {};

handlers._tokens.post = function( data,callback ) {
	var phone = typeof( data.payload.phone ) == 'string' && data.payload.phone.trim().length > 6 ? data.payload.phone.trim() : false;
	var password = typeof( data.payload.password ) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	if( phone && password) {
		//lookup user
		_data.read( 'users', phone, function( error, userData ){
			if( !error && userData ) {
				var password2 = helpers.hash( password ); // sent password
				var savedPassword = userData.password;
				console.log( password2 );
				console.log( savedPassword );
				
				if( password2 == savedPassword ) {
					var tokenId = '';
					var expires = '';
					var tokenObject = {};
					tokenId = helpers.createRandomString( config.tokenLentgh );
					expires = Date.now() + 1000 * 60 * 60;
					tokenObject = {
						'phone': phone,
						'id': tokenId,
						'expires': expires
					};
					_data.create( 'tokens', tokenId, tokenObject, function( error ){
						if( !error ) {
							callback( 200, tokenObject);
						} else {
							callback( 500, {'Error': 'could not create token'});
						}
					});



				} else {
					callback( 400, {'Error': 'wrong password'});
				}
			} else {
				callback( 400, {'Error': ''})
			}
		});
	} else {
		callback( 400, {'Error':'miising required fields'});
	}

};

handlers._tokens.get = function( data, callback ) {
	// check if token is valid
	var id = typeof( data.queryStringObject.id ) == 'string' && data.queryStringObject.id.length == (config.tokenLentgh-1) ? data.queryStringObject.id : false;

	if( id ){
		_data.read('tokens', id, function( error, userTokenObject ){
			if( !error && userTokenObject ){
				callback( 200, userTokenObject );
			} else {
				callback( 404 );
			}
		});
	} else {
		callback( 404, {'Error': 'Not a valid token number'});
	}
};

handlers._tokens.put = function( data,callback ) {
	var id = typeof( data.queryStringObject.id ) == 'string' && data.queryStringObject.id.length == (config.tokenLentgh-1) ? data.queryStringObject.id : false;
	var extend = typeof( data.queryStringObject.extend ) == 'boolean' ? data.queryStringObject.extend : false;
	
	if( id && extend ) {
		_data.update( 'tokens', id, extend, function( error ) {
			// lookup token
			if( error ) {
				_data.read( 'tokens', id, function( error, tokenData ) {
					// check if token is NOT expired, else deny
					if( tokenData.expires > Date.now() ) {
						
					} else {
						callback( 400, {'Error': 'session expired'} );
					}

				});
			} else {
				callback( 500, {'Error':'missing or invalid fields'});
			}
		});
	} else {
		callback( 404, {'Error': 'Wrong put data'});
	}
	
};

handlers._tokens.delete = function( data,callback ) {

};

















module.exports = handlers;