/**
 * create and export configuration variables
 */

 // general container for all the environments

 var environments = {};
 
 // statging ( default )
 environments.staging = {
	'httpPort': 3000,
	'httpsPort': 3001,
	'envName': 'staging',
	'hashingSecret': 'somehasheingsecrest',
	'tokenLentgh': 20
 };
 
 // production
 environments.production = {
	'httpPort': 5000,
	'httpsPort': 5001,
	'envName': 'production',
	'hashingSecret': 'somexhashexingsexcrestx',
	'tokenLentgh': 20
 };

 // determine which ENV to export
var currentEnvironment = typeof( process.env.NODE_ENV ) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
// check if environmet is one of the above
var environmentToExport = typeof( environments[currentEnvironment] ) == 'object' ? environments[currentEnvironment] : environments.staging;
// export module







module.exports = environmentToExport;














