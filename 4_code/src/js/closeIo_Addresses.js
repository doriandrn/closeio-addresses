// Libs for awesomeness
let _ 			= require( 'lodash' ),
		swiper 	= require( 'swiper' );

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
		return {
			input: 				this.modal.querySelector( 'input#address' ),
			current: 			this.modal.querySelector( '.swiper-slide-active address' ),
		}
	}

	// Address Model
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

		if ( AFModel.id && AFModel.id.length > -1 )
			AFModel.id = AFModel.id.replace(/['"]+/g, '' );

		return AFModel;
	}

	// Modal State - based on classes
	get modalState() {
		let classes = this.modal.classList.remove('modal', 'modal__address');
		return classes;
	}

	set modalState( classesArray ) {
		console.log( 'modal state changed to:' + classesArray.toString() );
	}

}