let CloseIo_Addresses = require( './closeIo_Addresses' );
// let CloseIo_Maps = require('./closeIo_Maps')

document.addEventListener( 'DOMContentLoaded', ( ev ) => {
	let 
		cia = new CloseIo_Addresses( require( './closeio_AM_config' ), ev );
		// maps = new CloseIo_Maps();
	
	cia.init();
	// maps();
});

// Because webpack... urgh...
require('../style.scss');