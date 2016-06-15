import config from './config';
import CloseIo_Addresses from './CloseIo_Addresses';
import CloseIo_Controller from './CloseIo_Controller';
import CloseIo_Maps from './CloseIo_Maps';

document.addEventListener( 'DOMContentLoaded', ( event ) => {
	let 
		ci_addresses 	= new CloseIo_Addresses( config ),
		ci_controller = new CloseIo_Controller( ci_addresses, event ),
		ci_maps 			= new CloseIo_Maps( config );
		console.dir( ci_controller );
		
	ci_controller.init();
	// ci_maps.init( ci_addresses.activeIndex );
});

// Because webpack... urgh...
require('../style.scss');