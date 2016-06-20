// Libs for awesomeness
let	swiper 	= require( 'swiper' ),
		List 		= require( 'list.js' );

export default class CloseIo_Controller {

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

		if ( formdata.entries )
			for ( let [ key, value ] of formdata )
				fd[ key ] = value;
		
		else { // this is for safari
			let inputs = this.form.querySelectorAll( 'input' ),
					select = this.form.querySelector( 'select' ),
					options = select.querySelectorAll( 'option' );
			
			_.each( inputs, ( input ) => {
					if ( input.type !== "submit" )
						fd[ input.name ] = input.value;
			});
			

			_.each( options, ( option ) => {
				if ( option.attributes.selected )
					fd[ select.name ] = option.value;
			});
		}

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
					modal.classList.add( 'modal__counter' );
			},

			// Init the slider events
			slider: () => {
				this.model.config.slider.direction = 'horizontal';
    		this.model.config.slider.nextButton = '.address__next';
    		this.model.config.slider.prevButton = '.address__prev';
    		this.model.config.slider.setWrapperSize = true;
				this.model.config.slider.onInit = ( swiper ) => {
					if ( ! this.model.currentAddress.current ) {
						console.error( 'Error when initing slider' );
						return;
					}
					// this.updateFormData( true );
				};		
				this.model.config.slider.onSlideChangeStart = ( swiper ) => {
					me.counter.textContent = swiper.activeIndex + 1;

					this.updateFormData( this.state );
					this.updateRemoveFormActionId( );
					modal.dispatchEvent( new CustomEvent( 'addressSwiped', { detail: { index: swiper.activeIndex } } ) );
				};
			},

			// Init clickable coloured tags
			tags: ( el ) => {
				if ( ! el )
					return;

				let tagSelect = el.querySelector( 'select.address__tags' );

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
			},

			list: () => {
				if ( ! this.model.config.list ) {
					this.list = false;
					return;
				}

				this.list = new List( 'addresses__list', {
					valueNames: [ 'list__address', {
						attr: 'data-tag',
						name: 'tag'
					}, {
						data: ['index'],
					}],
					searchColumns: [ 'list__address', 'tag' ]
				});

				let testList = this.list.get( 'list__address', 'No address' ),
						addresses = this.modal.querySelectorAll( '.addresses address' );

				if ( typeof testList[0] === 'object' )
					this.list.remove( 'index', 0 );

				_.each( addresses, ( address, i ) => {
					this.list.add( {
						'list__address': address.textContent,
						'tag': address.dataset.tag,
						'index': i
					});
				});
			},

		}

		// Slider
		init.slider( me );
		this.slider = new Swiper( '.address__container', this.model.config.slider );

		// The counter
		init.counter();

		// Tags
		init.tags( this.form );
		
		// List
		init.list();

		// Click actions & events
		this.events( modal );
	}

	events( binder ) {
		let modal = this.modal,
				input = this.model.currentAddress.input,
				next  = modal.querySelector( '.address__next' );

		
		binder.addEventListener( 'addressInserted', ( e ) => {	
			let index = this.activeIndex;
			
			if ( this.state == 'editing' ) {	
				modal.dispatchEvent( new CustomEvent( 'updateMarker', {
					detail: {
						index: index,
						position: e.detail,
						cancel: false
					}
				}));
			} 

			if ( this.state == 'adding' ) {
				modal.dispatchEvent( new CustomEvent( 'addMarker', {
					detail: {
						position: e.detail,
						cancel: false
					}
				}));

				this.state = 'editing';

				this.modal.dispatchEvent( new CustomEvent( 'dragMarker', { detail: { index: 0 } } ) );
			}

			modal.classList.add( 'map' );
			input.classList.remove( 'invalid' );
		});

		binder.addEventListener( 'markerPosUpdated', ( e ) => {
			let results = e.detail.results,
					position = {
						lat: e.detail.lat,
						lng: e.detail.lng
					};

			if ( ! results ) {
				console.info( 'Geocode failed' );
				return;
			}

			_.each( results.address_components, ( component ) => {
				if ( component.types[0] ) {
					let el = document.getElementById( component.types[0] );
					if ( el )
						el.value = component.long_name || component.short_name;
				}
			});

			if ( position.lat && position.lng ) {
				document.getElementById( 'lat' ).value = position.lat;
				document.getElementById( 'lng' ).value = position.lng;
			}
			
			input.value = results.formatted_address || "";
		});

		binder.addEventListener( 'addNew', ( e ) => {
			let totalCounter 	= this.modalElements.totalCounter,
					results 			= e.detail.results,
					position			= {
						lat: e.detail.lat,
						lng: e.detail.lng
					};


			if ( ! results ) {
				console.info( 'Geocode failed' );
				return;
			}

			this.modal.classList.remove( 'map--full', 'list--view' );
			this.modal.classList.add( 'map', 'adding', 'editing' );

			this.state = 'adding';
			input.classList.remove( 'invalid' );

			let tc = parseInt( totalCounter.textContent );
			totalCounter.textContent = tc + 1;

			// Add new slide
			if ( tc > 0 ) {
				this.slider.prependSlide([
					'<div class="address__slide swiper-slide"><address class="address adding tag">Adding New</address></div>'
				]);
				this.slider.slideTo(0);
			}

			next.dataset.action = 'cancel-add-new';

			if ( tc === 1 )
				modal.classList.add( 'modal__counter' );

						// if ( currentAddress.classList.contains( 'none') ) {
						// 	currentAddress.classList.remove( 'none' );
						// 	currentAddress.classList.add( 'adding' );
						// 	currentAddress.textContent = 'Adding new';
						// }

			_.each( results.address_components, ( component ) => {
				if ( component.types[0] ) {
					let el = document.getElementById( component.types[0] );
					if ( el )
						el.value = component.long_name || component.short_name;
				}
			});

			if ( position.lat ) {
				document.getElementById( 'lat' ).value = position.lat;
				this.model.currentAddress.current.dataset.lat = position.lat;
			}
			if ( position.lng ) {
				document.getElementById( 'lng' ).value = position.lng;
				this.model.currentAddress.current.dataset.lng = position.lng;
			}
			
			input.value = results.formatted_address || "";

			setTimeout( () => {
				this.updateMap();
			}, 150 );

			this.state = 'editing';
		});

		binder.addEventListener( 'click', ( e ) => {
			let target = e.target,
					action;

			if ( ! target )
				return;
			   
			if ( target.dataset && target.dataset.action )
				action = target.dataset.action;

			if ( target.tagName !== 'BUTTON' && action === undefined )
				return;

			if ( action )
				this.actions.apply( this, [ action, e ] );
		});

		binder.addEventListener( 'markerClick', ( e ) => {
			this.slider.slideTo( e.detail.index );
		});
	}

	// updates map size & centers position - wait for anim .15s
	updateMap() {
		window.dispatchEvent( new Event( 'resize' ) );
		this.modal.dispatchEvent( new CustomEvent( 'addressSwiped', { detail: { index: this.activeIndex } } ) );
	}

	// update actionID for remove form
	updateRemoveFormActionId( id ) {
		if ( typeof id === undefined || ! id )
			id = this.model.currentAddress.current.dataset.id;
		
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
			model 					= this.model,
			counter 				= this.modalElements.counter,
			totalCounter 		= this.modalElements.totalCounter,
			listItems 			= modal.querySelectorAll('.addresses__list .list > li'),
			
			uri 						= model.config.baseApi,
			
			currentAddress 	= model.currentAddress.current,
			id 							= model.currentAddress.id.replace(/['"]+/g, '' ),
			input 					= model.currentAddress.input,
			
			next 						= this.modal.querySelector( '.address__next' ),
			none 						= 'None found for this lead.';
			
			let actions = {
				// DISMISS MODAL
				'dismiss-modal': () => {
					console.log( 'Modal should have closed...' );
				},

				'fit-bounds': () => {
					modal.dispatchEvent( new CustomEvent( 'fitBounds' ) );
				},

				// CENTER TO ADDRESS
				'center-to': ( target ) => {
					let lat = target.dataset.lat,
							lng = target.dataset.lng;

					if ( ! lat || ! lng )
						return;

					modal.dispatchEvent( new CustomEvent( 'panTo', { detail: {
						lat: parseFloat( lat ),
						lng: parseFloat( lng )
					} } ) );
				},

				'swipe-to': ( target ) => {
					let index = target.parentNode.dataset.index;

					if ( ! index )
						return;

					this.slider.slideTo( index );
				},

				// TOGGLE ASIDE
				'toggle-aside': () => {
					modal.classList.toggle( 'list--view' );
					modal.classList.remove( 'map' );
					modal.classList.add( 'map--full' );

					setTimeout( () => {
						this.slider.update( true );
						this.updateMap();
					}, 400 );
				},

				// ADD NEW
				'add-new': ( toggle = true ) => {
					if ( typeof this.model !== 'object' || ( toggle && this.state === 'adding' ) )
						return;

					this.state = 'adding';
					input.classList.remove( 'invalid' );

					// Total counter nr
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
						
						modal.classList.add( 'adding', 'editing' );
						modal.classList.remove( 'map', 'map--full', 'list--view' );

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


					// CANCEL ADD NEW
					} else {

						event.preventDefault();

						modal.classList.remove( 'not-empty', 'map', 'adding', 'editing' );
						delete next.dataset.action;

						if ( tc > 1 ) {
							this.slider.removeSlide(0);
							this.slider.slideTo(0); 
							modal.classList.add( 'not-empty', 'map--full' );
							modal.dispatchEvent( new CustomEvent( 'cancelAddNew' ) );

							if ( tc == 2 ) {
								modal.classList.remove( 'modal__counter' );
							}

						} else {
							currentAddress.classList.add( 'none' );
							currentAddress.classList.remove( 'adding' );
							currentAddress.textContent = none;
						}

						this.state = 'editing';

						setTimeout( () => { 
							this.updateMap(); 
						}, 150 );
					}
				},

				'remove': () => {
					if ( ! this.model.config.ajax )
						return;

					event.preventDefault();

					// wait for current remove to complete and receive a server response
					if ( this.state == 'removing' )
						return;

					this.state = 'removing';

					let address = {
						del: true,
						id: id
					},
					lastslide = false,
					xhttp = new XMLHttpRequest();

					xhttp.onreadystatechange = () => {
						if ( xhttp.readyState == 4 && xhttp.status == 200 ) {
							this.slider.removeSlide( this.activeIndex );

							if ( this.list ) {
								this.list.remove( 'index', this.activeIndex );

								_.each( listItems, ( li ) => {
									let i = parseInt( li.dataset.index );
									if ( i >= this.activeIndex )
										li.dataset.index = i-1;
								});
								this.list.reIndex();
								
							}

							setTimeout( () => {
								this.state = 'editing';
							}, 150 );
							
							let c = parseInt( totalCounter.textContent );
							totalCounter.textContent = c - 1; 
							
							if ( c === parseInt( counter.textContent ) ) {
								lastslide = true; // fix for swiper slider, urgh...
								counter.textContent -= 1;
							}

							if ( c === 2 )
								this.modal.classList.remove( 'modal__counter' );
								
							if ( c === 1 ) {
								this.modal.classList.remove( 'not-empty', 'list--view' );
								counter.textContent = 1;
								this.slider.prependSlide([
									'<div class="address__slide swiper-slide"><address class="address tag none">' + none + '</address></div>'
								]);
							}

							this.modal.dispatchEvent( new CustomEvent( 'addressRemoved', { detail: { index: this.activeIndex, lastslide: lastslide } } ) );
							this.updateRemoveFormActionId();

							setTimeout( () => {
								this.updateMap();
							}, 150 );

						}
					}

					xhttp.open( 'PUT', uri + '/' + id );
					xhttp.setRequestHeader( 'Content-Type', 'application/json; charset=utf-8' );
					xhttp.send( JSON.stringify( address ) );
				},

				// EDIT ADDRESS
				'edit': ( toggle = true ) => {
					this.state = 'editing';

					modal.classList.toggle( 'map--full', ! toggle );
					modal.classList.toggle( 'map', toggle );
					modal.classList.toggle( 'editing', toggle );
					modal.classList.remove( 'list--view' );

					this.updateFormData( this.state );
					setTimeout( () => {
						this.updateMap();
					}, 150 );

					if ( ! toggle ) {
						modal.dispatchEvent( new CustomEvent( 'markerDragged', {
							detail: {
								index: this.activeIndex
							}
						}));
						modal.dispatchEvent( new CustomEvent( 'updateMarker', {
							detail: {
								index: this.activeIndex,
								cancel: true,
							}
						}));
					}
					else {
						modal.dispatchEvent( new CustomEvent( 'dragMarker', {
							detail: {
								index: this.activeIndex
							}
						}));
					}
					modal.classList.remove('adding');
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
							
							if ( response.ok ) {
								this.modal.classList.remove( 'map', 'editing', 'adding' );
								this.modal.classList.add( 'map--full' );

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

								modal.dispatchEvent( new CustomEvent( 'markerDragged', {
									detail: {
										index: this.activeIndex
									}
								}));

								if ( this.list ) {
									let liToUpdate = modal.querySelector( '#addresses__list ul.list li[data-index="' + this.activeIndex + '"]' );

									if ( liToUpdate ) {
										liToUpdate.children[0].textContent = fd.address;
										liToUpdate.children[1].dataset.tag = fd.tag;
									}

									this.list.reIndex();
								}

								setTimeout( () => {
									this.updateMap();
								}, 150 );
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
				},

				// Save for ADD NEW
				'save': () => {
					this.state = 'editing';

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
							
							if ( response.ok ) {
								let _id = ! response.upserted ? response.electionId.replace(/['"]+/g, '' ) : response.upserted[0]._id.replace(/['"]+/g, '' );

								currentAddress.dataset.id = _id; 
								currentAddress.classList.remove( 'adding', 'none' );

								this.state = 'editing';

								this.modal.classList.remove('map', 'editing', 'adding' );
								this.modal.classList.add('map--full');

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

								// Prevents markers from being dragged fruther on
								modal.dispatchEvent( new CustomEvent( 'markerDragged', { detail: { index: 0 } } ) );

								if ( this.list ) {
									_.each( listItems, ( li ) => {
										let i = parseInt( li.dataset.index );
										li.dataset.index = i+1;
									});

									this.list.add({
										list__address: fd.address,
										tag: fd.tag,
										index: 0
									});

									this.list.reIndex();
								} 

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
		
		if ( actionName == 'switch--tag' || actionName == 'center-to' || actionName == 'swipe-to' )
			toggle = event.target;

		if ( typeof actions[ actionName ] === 'function' )
			actions[ actionName ]( toggle );
	}
}