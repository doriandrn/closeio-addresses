export default class CloseIo_Controller {
	// console.log( { action: actionName, model: model, modalElements: modalElements, slider: slider } );

	constructor( model, ev ) {
		this.model = model;
		this.e = ev;
	}

	// .modal
	get modal() {
		return this.e.target.querySelector( '.modal.modal__address' );
	}
	
	// .form
	get form() {
		return this.modal.querySelector( 'form.modal__form' );
	}

	get activeIndex() {
		delete this.activeIndex;
		return this.slider.activeIndex;
	}

	get modalElements() {
		return {
			form: 				this.form,
			removeForm: 	this.modal.querySelector( 'form.address__actions.remove' ),
			select: 			this.form.querySelector( 'select.address__tags' ),
			counter: 			this.modal.querySelector( '.address__counter .counter' ),
			totalCounter: this.modal.querySelector( '.address__counter .total-counter' )
		};
	}


	// Initialize
	init() {

		let modal = this.modal,
				me 		= this.modalElements;


		// Initializing the right way.
		if ( typeof modal !== 'object' || typeof this.model !== 'object' ) {
			console.error( 'Something is really wrong here.' );
			return false;
		}

		let init = {
			
			// Init the slider events
			slider: () => {
				this.model.config.slider.onInit = ( swiper ) => {
					if ( ! this.model.currentAddress.current ) {
						console.error( 'Error when initing slider' );
						return;
					}
					console.log( 'sliderinited');
					// this.updateFormData( true );
				};		
				this.model.config.slider.onSlideChangeStart = ( swiper ) => {
					me.counter.textContent = swiper.activeIndex + 1;
					
					// A dat add si dupa a schimbat slide'u
					// if ( this.state === "adding" ) {
					// 	this.state = 'editing';
					// 	// toggle map-fetched state
					// }
					// else
						this.updateFormData( this.state );
				};
			},

			// Init clickable coloured tags
			tags: ( el ) => {
				if ( ! el )
					return;

				let tagSelect = el.querySelector( 'select.address__tags' ),
						tags = {};

				if ( ! tagSelect ) {
					console.error( 'No tags select found.' );
					return;
				}

				let getTags = tagSelect.children,
						tagsParent = tagSelect.parentNode,
						makeUl = document.createElement( "ul" );
				
				makeUl.classList.add('address__tags');
				tagsParent.insertBefore( makeUl, tagSelect );

				_.each( getTags, ( tag ) => {
					let tagLi = document.createElement('li');
					
					tagLi.classList.add('address__tag', 'tag--' + tag.value );
					tagLi.textContent = tag.textContent;
					tagLi.dataset.value = tag.value;
					tagLi.dataset.action = 'switch--tag';

					if ( tag.selected )
						tagLi.classList.add('active');

					makeUl.appendChild( tagLi );
				});
				
				tagSelect.style.display = 'none';
			}
		}

	

		// Slider
		init.slider( me );
		this.slider = new Swiper( '.swiper-container', this.model.config.slider );

		// Tags
		init.tags( this.form );

		this.clickers();
	}

	clickers() {
		this.modal.addEventListener( 'click', ( ev ) => {
			let target = ev.target,
			    action = target.dataset.action;

			if ( target.tagName !== 'BUTTON' && action === undefined )
				return;

			if ( action )
				this.actions.apply( this, [ action, target ] );
		});
	}

	// update actionID for remove form
	updateRemoveFormAction( form, id ) {
		form.setAttribute( 'action', this.model.config.baseApi + '/' + id );
	}

	// update form with data
	updateFormData( state ) {

		if ( ! state )
			return;

		let form 	 = this.form,
				put 	 = state === "editing" ? true : false,
				select = form.querySelector( 'select.form__select' ),
				submit = form.querySelector( 'input[type=submit]' ),
				cancel = document.querySelector( '.modal__cancel button' );

		console.log( 'State: ' + state + ' -- put: ' + put );

		if ( ! submit || ! cancel || ! select ) {
			console.error( 'Form is broken.' );
			return;
		}

		_.each( this.model.model, ( value, key ) => {
			let field = form.querySelector('input[name=' + key + ']' );
			if ( field )
				field.value = put ? value : ''
			else {
				// Tweak these 'manually'
				switch( key ) {
					case 'id':
						form.setAttribute( 'action', put ? this.model.config.baseApi + '/' + value : this.model.config.baseApi )
						break;

					case 'tag':
						_.each( select.children, function( option ) {
							option.removeAttribute( 'selected' );
							if ( option.value === value && put )
								option.setAttribute( 'selected', true );
						});

						let tags = form.querySelectorAll( '.address__tag' );

						_.each( tags, function( tag ) {
							tag.classList.remove( 'active' );
							if ( tag.dataset.value == value && put )
								tag.classList.add( 'active' );
						});
						
						break;
				} //switch
			} // field
		});

		submit.value = state === 'editing' ? 'Update' : 'Save';
		cancel.dataset.action = state === 'editing' ? 'cancel-edit' : 'cancel-add-new';
	};

	// Actions Methods
	actions( actionName, target ) {
		
		console.log( this.modalElements );
		console.log( this.model );

		let
			modal = this.modal,
			input = this.model.currentAddress.input,
			
			actions = {

				// DISMISS MODAL
				'dismiss-modal': () => {
					console.log( 'Modal should have closed...' );
				},

				// ADD NEW
				'add-new': ( toggle = true ) => {
					if ( typeof this.model !== 'object' )
						return;

					this.state = 'adding';

					let totalCounter = this.modalElements.totalCounter;

					// quick debug
					toggle ? console.log( 'Adding new...' ) : console.log( 'Cancelled Add New...' );
					let tc = parseInt( totalCounter.textContent );

					totalCounter.textContent = toggle ? tc + 1 : tc - 1;

					if ( toggle ) {

						// Add new slide
						this.slider.prependSlide([
							'<div class="swiper-slide"><address>Adding New</address></div>'
						]);
						this.slider.slideTo(0);

						// Back to main screen
						if ( ! modal.classList.contains( 'not-empty' ) )
							modal.classList.add( 'not-empty' );
						
						modal.classList.remove( 'map--fetched', 'map--fetched--full' );
						
						// Clear the value
						input.value = '';

						// Focus on address input - wait for animation 0.15s
						setTimeout( () => { 
							input.focus(); 
						}, 150 );

					} else {
						modal.classList.remove( 'not-empty', 'map--fetched' );
						this.slider.removeSlide(0);
						this.slider.slideTo(0); // SHOULD BE ACIVE INDEX WHEN TOGGLE TRIGGERED

					}

					// this.updateFormData( this.state );
				},

				// EDIT ADDRESS
				'edit': ( toggle = true ) => {
					this.state = 'editing';

					modal.classList.toggle( 'map--fetched--full', ! toggle );
					modal.classList.toggle( 'map--fetched', toggle );


					this.updateFormData( this.state );
				},


				'switch--tag': ( target ) => {

					if ( ! target )
						return;

					let tagVal = target.value;
						
					_.each( target.parentNode.children, ( el ) => {
						el.classList.remove('active');
					});

					// 'option' refers to HTML <option> tag
					_.each( this.modalElements.select.children, ( option ) => {
						option.removeAttribute('selected');
						if ( option.value === target.dataset.value )
							option.setAttribute('selected', 'selected');
					});
					
					target.classList.add('active');

					if ( this.state == "editing" ) {
						console.log( 'currently editing' );
						// ToDO: update currentaddress with class of selected tag
					}
				},
			},
			toggle = actionName.indexOf( 'cancel-' ) > -1 ? false : true; 
	
		actionName = actionName.replace( 'cancel-', '' );
		console.log( actionName );
		
		if ( actionName == 'switch--tag' )
			toggle = target;

		actions[ actionName ]( toggle );
	}
}