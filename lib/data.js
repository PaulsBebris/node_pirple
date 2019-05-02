/**
 * lib for storing and editing data
 */
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

var lib = {};
// base directory of data folder
lib.baseDir = path.join(__dirname,'/../.data/');
// write to file
/**
 * @param directory string, 
 * @param file string,
 * @param data  object,
 * @param callback function
 */

lib.create = function( directory, file, data, callback ){
	// open file for writting
	fs.open( lib.baseDir + directory + '/' + file + '.json', 'wx', function( error, fileDescriptor ){
		if( !error && fileDescriptor) {
			var stringData = JSON.stringify( data );
			// write to file and close
			fs.writeFile( fileDescriptor, stringData, function( error ){
				if( !error ) {
					fs.close( fileDescriptor, function( error ){
						if( !error ) {
							callback( false );
						} else {
							callback( 'error closing new file' );
						}
					});
				} else {
					callback( 'error writing to file' );
				}
			});
		} else {
			callback( 'Could not create new! file' );
		}
	});
};

/**
 * @param {string} directory
 * @param {string} file
 * @param {function} callback [Error, object]
 */
lib.read = function( directory, file, callback ) {
	fs.readFile( lib.baseDir + directory + '/' + file + '.json', 'utf8', function( error, data ){
		if( !error ) {
			var parsedData = helpers.parseJsonToObject( data );
			callback( false, parsedData );
		} else {
			callback( error, data );
		}
	});
};

// in this case it is erwitting all data in file
/**
 * @param directory string, 
 * @param file string,
 * @param data  object,
 * @param callback function
 */
lib.update = function( directory, file, data, callback ) {
	fs.open( lib.baseDir + directory + '/' + file + '.json', 'r+', function( error, fileDescriptor ){
		var stringData = JSON.stringify( data );
		if( !error ) {
			// truncate
			fs.truncate( fileDescriptor, function( error ) {
				if( !error ) {
					// write to disk and close file
					fs.writeFile( fileDescriptor, stringData, 'utf8', function( error ){
						if( !error ){
							fs.close( fileDescriptor, function( error ) {
								if( !error ) {
									callback( 'OK XXX');
								} else {
									callback( 'Error closing file');
								}
							});
						} else {
							callback( 'Error writting file' );
						}
					});
				} else {
					callback( 'Error in truncating file' );
				}
			});
		} else {
			callback( 'Error opening file');
		}
	});
};

/**
 * @param directory string, 
 * @param file string,
 * @param callback function
 */
lib.delete = function( directory, file, callback) {
	fs.unlink( lib.baseDir + directory + '/' + file + '.json', function( error ){
		if( !error ) {
			callback( false );
		} else {
			callback( 'Error deleting file: ' + error );
		}
	});
};































module.exports = lib;