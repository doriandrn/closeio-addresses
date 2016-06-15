// Libs for awesomeness
let _ 			= require( 'lodash' ),
		swiper 	= require( 'swiper' );

// Initialize
class CloseIo_Addresses {
	constructor( config, event ) {
		this.e = event;

		this.model = {
			config: config,
			addressData: {
				model: 		{},
				el: 			'',
				input: 		'',
				current: 	'',
				counter: 	'',
				totalCounter: '',
			},
			
		}
	}
	init() {
		let modal = this.modal;

		$ = modal.querySelector;

		console.log( this.modal );

		// Initializing the right way.
		if ( typeof this.modal !== 'object' ) {
			console.error( 'Something is really wrong here. Address Modal could not be located.' );
			return false;
		}

		let init = {
			queryElements: () => {
				return {
					form: 				$('form.modal__form'),
					removeForm: 	$('form.address__actions.remove'),
					select: 			$('select.address__tags'),
					counter: 			$('.address__counter .counter'),
					totalCounter: $('.address__counter .total-counter'),
					state: 				'',
				};
			},
			slider: ( m ) => {
				model.config.slider.onInit = ( swiper ) => {
					actions.swiperInited( swiper, m );
				};		
				model.config.slider.onSlideChangeStart = ( swiper ) => {
					actions.swiperChange( swiper, m );
					// updateRemoveFormAction( removeForm );
					// update map -- move to marker
				};
			}
		},
		modalElements = {};

		
		// Modal Elements
		init.queryElements.call( modalElements );
		modalElements = modalElements.queryElements();

		// Slider
		this.init.slider( modalElements );
		slider = new Swiper( '.swiper-container', model.config.slider );
		
		// the form...
		form = modalElements.form;

		this.actions();
	}

	// STATICS

	// .modal
	static get modal() {
		return this.ev.target.querySelector( '.modal.modal__address' );
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

	// Methods
	actions() {
		modal.addEventListener( 'click', ( ev ) => {
			let target = ev.target,
			    action = target.dataset.action;

			if ( target.tagName !== 'BUTTON' && action === undefined )
				return;

			let clickEvents = {
				'dismiss_modal': 	() => { actions.dismissModal(); },
				'add-new': 				() => { actions.addNew(); },
				'cancel-add-new': () => { actions.addNew( false ); },
				'edit': 					() => { actions.edit(); },
				'cancel-edit': 		() => { actions.edit( false ); },
				'switch--tag': 		( target ) => { actions.switchTag( target ); }
			},
			actions = require('./CloseIo_Actions');

			_.each( clickEvents, ( func, data ) => {
				if ( data === action )
					func( target );
			});
			
		});
	}
}







module.exports = CloseIo_Addresses;
