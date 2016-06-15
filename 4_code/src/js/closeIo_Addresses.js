// Libs for awesomeness
let _ 			= require( 'lodash' ),
		swiper 	= require( 'swiper' );

// Initialize
class CloseIo_Addresses {
	constructor( config, event ) {
		this.config = config;
		this.e = event;
	}
	init() {
		let modal = this.modal;

		// Initializing the right way.
		if ( typeof modal !== 'object' || typeof this.model !== 'object' ) {
			console.error( 'Something is really wrong here.' );
			return false;
		}

		let init = {
			// getter
			slider: ( m ) => {
				this.model.config.slider.onInit = ( swiper ) => {
					// actions.swiperInited( swiper, m );
				};		
				this.model.config.slider.onSlideChangeStart = ( swiper ) => {
					// actions.swiperChange( swiper, m );
					// updateRemoveFormAction( removeForm );
					// update map -- move to marker
				};
			}
		};


		console.log( this.modalElements );

		// Slider
		init.slider( this.modalElements );

		// Deploy actions
		this.actions( modal );
	}

	// GETTERS
	get model() {
		return {
			config: this.config,
			addressData: {
				model: 		{},
				el: 			'',
				input: 		'',
				current: 	'',
				counter: 	'',
				totalCounter: '',
			}
		}
	}

	get modalElements() {
		let form = this.modal.querySelector('form.modal__form');

		return {
			form: 				form,
			removeForm: 	this.modal.querySelector('form.address__actions.remove'),
			select: 			form.querySelector('select.address__tags'),
			counter: 			this.modal.querySelector('.address__counter .counter'),
			totalCounter: this.modal.querySelector('.address__counter .total-counter'),
			state: 				'',
		};
	}

	get slider() {
		return new Swiper( '.swiper-container', this.model.config.slider );
	}

	// .modal
	get modal() {
		return this.e.target.querySelector( '.modal.modal__address' );
	}

	// Modal State - based on classes
	get modalState() {
		let classes = this.modal.classList.remove('modal', 'modal__address');
		return classes;
	}
	set modalState( classesArray ) {
		console.log( 'modal state changed to:' + classesArray.toString() );
	}

	// active Address
	get currentAddressData() {		
		return {
			current: 	modal.querySelector('.swiper-slide-active address'),
			input: 		form.querySelector('#address'),
		}
	}
	set currentAddressData( obj ) {
		console.log( 'Current Address Data changed! New value: ' );
		console.info( obj );
	}

	// Actions Methods
	actions( m, elsObj ) {
		let actions = require('./closeIo_Actions'); // { action: '', execute: ''}
		console.log( actions );

		m.addEventListener( 'click', ( ev ) => {
			let target = ev.target,
			    action = target.dataset.action;

			if ( target.tagName !== 'BUTTON' && action === undefined )
				return;


			_.each( actions.controller, ( func, data ) => {
				if ( data === action )
					actions.binder.apply( actions.controller, [ action, { model: this.model, me: this.modalElements, slider: this.slider }, target ] );
					// func( this.model, this.modalElements, this.slider, target );
			});
			
		});
	}
}

module.exports = CloseIo_Addresses;