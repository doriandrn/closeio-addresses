export default class CloseIo_Controller {
	// console.log( { action: actionName, model: model, modalElements: modalElements, slider: slider } );

	constructor( model, ev ) {
		this.model = model;
		this.e = ev;
	}

	// .modal
	get modal() {
		return this.model.modal;
	}
	
	// .form
	get form() {
		delete this.form;
		return this.modal.querySelector( 'form.modal__form' );
	}

	get removeForm() {
		return this.modal.querySelector( 'form.address__actions.remove' );
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

	get formData() {
		let fd = {},
				formdata = new FormData( this.form );
			
		console.log( formdata );

		if ( formdata.entries )
			for ( let [ key, value ] of formdata )
				fd[ key ] = value;
		
		else { // this is for safari
			let inputs = this.form.querySelectorAll( 'input' ),
					select = this.form.querySelector( 'select' )
			
			_.each( inputs, ( input ) => {
					if ( input.type !== "submit" )
						fd[ input.name ] = input.value;
			});
			
			let options = select.querySelectorAll( 'option' );
			console.log( options );

			_.each( options, ( option ) => {
				if ( option.attributes.selected )
					fd[ select.name ] = option.value;
			});
		}

		console.log( fd );

		return fd;
	}

	// empty input or too short
	validateInput( input ) {
		if ( input.value.length < 4 ) {
			input.classList.add( 'invalid' );
			return false;
		}

		return true;
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
			counter: () => {
				if ( parseInt( this.modalElements.totalCounter ) > 1 )
					this.modal.classList.add( 'modal__counter' );
			},

			// Init the slider events
			slider: () => {
				this.model.config.slider.direction = 'horizontal';
    		this.model.config.slider.nextButton = '.address__next';
    		this.model.config.slider.prevButton = '.address__prev';
				this.model.config.slider.onInit = ( swiper ) => {
					if ( ! this.model.currentAddress.current ) {
						console.error( 'Error when initing slider' );
						return;
					}
					// this.updateFormData( true );
				};		
				this.model.config.slider.onSlideChangeStart = ( swiper ) => {
					me.counter.textContent = swiper.activeIndex + 1;
					
					window.dispatchEvent( new Event( 'addressSwiped' ) );
					// A dat add si dupa a schimbat slide'u
					// if ( this.state === "adding" ) {
					// 	this.state = 'editing';
					// 	// toggle map-fetched state
					// }
					// else
					this.updateFormData( this.state );
					this.updateRemoveFormActionId();
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
					
					tagLi.textContent = tag.textContent;
					tagLi.classList.add( 'address__tag', 'tag' );
					
					tagLi.dataset.tag = tagLi.dataset.value = tag.value;
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
		this.slider = new Swiper( '.address__container', this.model.config.slider );

		// The counter
		init.counter();

		// Tags
		init.tags( this.form );
		
		// Click actions & events
		this.clickers();
		this.events();
	}

	events() {
		window.addEventListener( 'addressInserted', ( e ) => {
			console.log( 'Got address!' );
			this.modal.classList.add( 'map--fetched' );
			this.model.currentAddress.input.classList.remove( 'invalid' );
		});
	}

	clickers() {
		this.modal.addEventListener( 'click', ( e ) => {
			let target = e.target,
			    action = target.dataset.action;

			if ( target.tagName !== 'BUTTON' && action === undefined )
				return;

			if ( action )
				this.actions.apply( this, [ action, e ] );
		});
	}

	updateMap() {
		// updates map size & centers position - wait for anim .15s
		setTimeout( () => {
			window.dispatchEvent( new Event( 'resize' ) );
			window.dispatchEvent( new Event( 'addressSwiped' ) );
		}, 150 );
	}

	// update actionID for remove form
	updateRemoveFormActionId( id ) {
		if ( typeof id === undefined )
			id = this.model.currentAddress.id;
		
		if ( ! id )
			return;

		this.removeForm.setAttribute( 'action', this.model.config.baseApi + '/' + id );
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
		submit.dataset.action = state === 'editing' ? 'update' : 'save';
		cancel.dataset.action = state === 'editing' ? 'cancel-edit' : 'cancel-add-new';
	};

	// Actions Methods
	actions( actionName, event ) {

		let
			modal 					= this.modal,
			input 					= this.model.currentAddress.input,
			uri 						= this.model.config.baseApi,
			totalCounter 		= this.modalElements.totalCounter,
			counter 				= this.modalElements.counter,
			currentAddress 	= this.model.currentAddress.current,
			id 							= this.model.currentAddress.id.replace(/['"]+/g, '' ),
			next 						= this.modal.querySelector( '.address__next' ),
			none 						= 'None found for this lead.',
			
			actions = {
				// DISMISS MODAL
				'dismiss-modal': () => {
					console.log( 'Modal should have closed...' );
				},

				// ADD NEW
				'add-new': ( toggle = true ) => {
					if ( typeof this.model !== 'object' || ( toggle && this.state === 'adding' ) )
						return;

					this.state = 'adding';
					this.model.currentAddress.input.classList.remove( 'invalid' );

					// quick debug
					toggle ? console.log( 'Adding new...' ) : console.log( 'Cancelled Add New...' );
					let tc = parseInt( totalCounter.textContent );

					totalCounter.textContent = toggle ? tc + 1 : tc - 1;

					if ( toggle ) {

						// Add new slide
						if ( tc > 0 ) {
							this.slider.prependSlide([
								'<div class="address__slide swiper-slide"><address class="address adding tag">Adding New</address></div>'
							]);
							this.slider.slideTo(0);
						}

						next.dataset.action = 'cancel-add-new';

						// Back to main screen
						if ( ! modal.classList.contains( 'not-empty' ) )
							modal.classList.add( 'not-empty' );
						
						modal.classList.remove( 'map--fetched', 'map--fetched--full' );

						if ( tc === 1 )
							modal.classList.add( 'modal__counter' );

						if ( currentAddress.classList.contains( 'none') ) {
							currentAddress.classList.remove( 'none' );
							currentAddress.classList.add( 'adding' );
							currentAddress.textContent = 'Adding new';
						}

						
						// Clear the value
						input.value = '';

						// Focus on address input - wait for animation 0.15s
						setTimeout( () => { 
							input.focus(); 
						}, 150 );

					} else {
						modal.classList.remove( 'not-empty', 'map--fetched' );
						delete next.dataset.action;
						
						if ( tc > 1 ) {
							this.slider.removeSlide(0);
							this.slider.slideTo(0); 
							modal.classList.add( 'not-empty', 'map--fetched--full' );

						} else {
							currentAddress.classList.add( 'none' );
							currentAddress.classList.remove( 'adding' );
							currentAddress.textContent = none;
						}

						this.state = 'editing';
					}

					// this.updateFormData( this.state );
				},

				'remove': () => {
					if ( ! this.model.config.ajax )
						return;

					event.preventDefault();

					let address = {
						del: true,
						id: id
					}

					let xhttp = new XMLHttpRequest();

					xhttp.onreadystatechange = () => {
						if ( xhttp.readyState == 4 && xhttp.status == 200 ) {
							this.slider.removeSlide( this.activeIndex );
							
							let c = parseInt( totalCounter.textContent );
							console.log( 'c: ' + c );

							totalCounter.textContent = c - 1; 
							
							if ( c === parseInt( counter.textContent ) )
								counter.textContent -= 1;

							if ( c === 2 )
								this.modal.classList.remove( 'modal__counter' );
								
							if ( c === 1 ) {
								this.modal.classList.remove( 'not-empty' );
								counter.textContent = 1;
								this.slider.prependSlide([
									'<div class="address__slide swiper-slide"><address class="address tag none">' + none + '</address></div>'
								]);
							}

						}
					}

					xhttp.open( 'PUT', uri + '/' + id );
					xhttp.setRequestHeader( 'Content-Type', 'application/json; charset=utf-8' );
					xhttp.send( JSON.stringify( address ) );
				},

				// EDIT ADDRESS
				'edit': ( toggle = true ) => {
					this.state = 'editing';

					modal.classList.toggle( 'map--fetched--full', ! toggle );
					modal.classList.toggle( 'map--fetched', toggle );
					this.updateFormData( this.state );
					this.updateMap();
				},

				'update': () => {
					if ( ! this.validateInput( input ) ) {
						event.preventDefault();
						return;
					}
					
					// Ajax
					if ( ! this.model.config.ajax )
						return;

					event.preventDefault();

					let xhttp = new XMLHttpRequest(),
							fd = this.formData;

					if ( typeof fd !== 'object' )
						return;

					xhttp.onreadystatechange = () => {
						if ( xhttp.readyState == 4 && xhttp.status == 200 ) {
							let response = JSON.parse( xhttp.responseText );
							console.log( response );
							
							if ( response.ok ) {
								this.modal.classList.remove('map--fetched');
								this.modal.classList.add('map--fetched--full');

								_.each( fd, ( value, key ) => {
									switch( key ) {
										default: 
											currentAddress.dataset[ key ] = value;
											break;

										case 'address':
											currentAddress.textContent = value;
											break;
									}
								});

								this.updateMap();
							}
						}
					}

					xhttp.open( 'PUT', uri + '/' + id );
					xhttp.setRequestHeader( 'Content-Type', 'application/json; charset=utf-8' );
					xhttp.send( JSON.stringify( fd ) );
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
						option.removeAttribute( 'selected' );
						if ( option.value === target.dataset.value )
							option.setAttribute( 'selected', true );
					});
					
					target.classList.add('active');

					if ( this.state == "editing" ) {
						console.log( 'currently editing' );
						// ToDO: update currentAddress with class of selected tag
					}
				},

				// Save for ADD NEW
				'save': () => {
					if ( ! this.validateInput( input ) ) {
						event.preventDefault();
						return;
					}
					
					if ( ! this.model.config.ajax )
						return;

					event.preventDefault();

					delete next.dataset.action;
					
					// Ajax
					let xhttp = new XMLHttpRequest(),
							fd 		= this.formData;

					if ( typeof fd !== 'object' )
						return;

					xhttp.onreadystatechange = () => {
						if ( xhttp.readyState == 4 && xhttp.status == 200 ) {
							let response = JSON.parse( xhttp.responseText );
							console.log( response );
							
							if ( response.ok ) {
								let _id = response.upserted ? response.electionId.replace(/['"]+/g, '' ) : response.upserted[0]._id.replace(/['"]+/g, '' );

								currentAddress.dataset.id = _id; 
								currentAddress.classList.remove( 'adding', 'none' );

								this.state = 'editing';

								this.modal.classList.remove('map--fetched');
								this.modal.classList.add('map--fetched--full');

								this.updateRemoveFormActionId( _id );

								_.each( fd, ( value, key ) => {
									switch( key ) {
										default: 
											currentAddress.dataset[ key ] = value;
											break;

										case 'address':
											currentAddress.textContent = value;
											break;
									}
								});

								if ( totalCounter === 1 )
									slider.removeSlide( 1 );

								this.updateMap();
							}
						}
					}

					xhttp.open( 'PUT', uri );
					xhttp.setRequestHeader( 'Content-Type', 'application/json; charset=utf-8' );
					xhttp.send( JSON.stringify( fd ) );
				}
			},
			toggle = actionName.indexOf( 'cancel-' ) > -1 ? false : true; 
	
		actionName = actionName.replace( 'cancel-', '' );
		console.log( actionName );
		
		if ( actionName == 'switch--tag' )
			toggle = event.target;

		if ( typeof actions[ actionName ] === 'function' )
			actions[ actionName ]( toggle );
	}
}