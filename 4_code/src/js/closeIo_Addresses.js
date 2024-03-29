let _ 			= require( 'lodash' );

// describe
export default class CloseIo_Addresses {

	// Constructor
	constructor( config, event ) {
		this.config = config;
		this.e 			= event;
	}
	
	// .modal
	get modal() {
		return document.querySelector( '.modal.modal__address' );
	}

	// current address lazy getter
	get currentAddress() {
		delete this.currentAddress;
		let active = this.modal.querySelector( '.swiper-slide-active address' );

		return {
			input: 				this.modal.querySelector( 'input#address' ),
			current: 			active,
			id: 					active.dataset.id ? active.dataset.id.replace(/['"]+/g, '' ) : ''
		}
	}

	// Address Model lazy getter
	get model() {		
		delete this.model;
		let AFModel = {},
				q = this.currentAddress.current;

		if ( ! q )
			return AFModel;

		_.each( q.dataset, ( value, tag ) => {
			AFModel[tag] = value;
		});

		AFModel.address = q.textContent;

		return AFModel;
	}
}