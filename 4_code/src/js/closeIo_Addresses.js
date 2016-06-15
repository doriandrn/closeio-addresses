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
		let modal = this.modal,
				model = this.model;

		// Initializing the right way.
		if ( typeof modal !== 'object' || typeof model !== 'object' ) {
			console.error( 'Something is really wrong here. Address Modal could not be located.' );
			return false;
		}

		let init = {
			queryElements: ( ) => {
				let form = modal.querySelector('form.modal__form');

				return {
					form: 				form,
					removeForm: 	form.querySelector('form.address__actions.remove'),
					select: 			form.querySelector('select.address__tags'),
					counter: 			form.querySelector('.address__counter .counter'),
					totalCounter: form.querySelector('.address__counter .total-counter'),
					state: 				'',
				};
			},
			slider: ( m ) => {
				model.config.slider.onInit = ( swiper ) => {
					// actions.swiperInited( swiper, m );
				};		
				model.config.slider.onSlideChangeStart = ( swiper ) => {
					// actions.swiperChange( swiper, m );
					// updateRemoveFormAction( removeForm );
					// update map -- move to marker
				};
			}
		},
		modalElements = init.queryElements();

		
		// Modal Elements;
		// modalElements = modalElements.queryElements();
		console.log( modalElements );

		// Slider
		init.slider( modalElements );
		
		// the form...
		let form = modalElements.form;
		console.log( 'FORM: ' + form );

		// this.actions( modal );
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

	// Methods
	// actions( m ) {
	// 	m.addEventListener( 'click', ( ev ) => {
	// 		let target = ev.target,
	// 		    action = target.dataset.action,
	// 		    actions = require('./closeIo_Actions');

	// 		if ( target.tagName !== 'BUTTON' && action === undefined )
	// 			return;

	// 		let clickEvents = {
	// 			'dismiss_modal': 	() => { actions.dismissModal(); },
	// 			'add-new': 				() => { actions.addNew(); },
	// 			'cancel-add-new': () => { actions.addNew( false ); },
	// 			'edit': 					() => { actions.edit(); },
	// 			'cancel-edit': 		() => { actions.edit( false ); },
	// 			'switch--tag': 		( target ) => { actions.switchTag( target ); }
	// 		};

	// 		_.each( clickEvents, ( func, data ) => {
	// 			if ( data === action )
	// 				func( target );
	// 		});
			
	// 	});
	// }
}







module.exports = CloseIo_Addresses;
