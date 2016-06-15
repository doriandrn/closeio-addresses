let config = require( './closeio_AM_config' ),
		CloseIo_Addresses = require( './closeIo_Addresses' ),
		CloseIo_Maps = require('./closeIo_Maps');

document.addEventListener( 'DOMContentLoaded', ( ev ) => {
	let 
		cia = new CloseIo_Addresses( config, ev ),
		maps = new CloseIo_Maps( config );
	
	cia.init();

	const slider = cia.slider;

	console.log( slider );

	maps.init( slider.activeIndex );
	
});

// Because webpack... urgh...
require('../style.scss');