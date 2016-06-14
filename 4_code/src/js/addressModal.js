let addressModal = function( settings = '', mainEvent ) {	
	this.settings = settings;
	this.mainEvent = mainEvent;

	// Model
	this.AMObj = {
		config: require('./closeio_AM_config'),
		modal: '',
		addressData: {
			model: 		'',
			el: 			'',
			input: 		'',
			current: 	'',
			counter: 	'',
			totalCounter: '',
		},
		componentForm: {
			street_number: 	'short_name',
		  route: 					'long_name',
		  locality: 			'long_name',
		  administrative_area_level_1: 'short_name',
		  country: 				'long_name',
		  postal_code: 		'short_name'
		},
		map: {
			map: 					'',
			bounds: 			'',
			markers: 			'',
			infoWindow: 	'',
			autocomplete: '',
			placeSearch: 	'',
			locations: 		'',
		}
	};

	this.libs = {
		autocomplete: () => {
			let map,
					mapObj,
					geocoder = new google.maps.Geocoder(),
		  		initialState = false,
		  		addressInputVal = this.AMObj.addressData.input.value;

		  let addresses = this.AMObj.modal.querySelectorAll( 'address' ),
		  		locations = [];

		  _.each( addresses, (address) => {
		  	locations.push( address.textContent );
		  });

		  console.log( locations );
		  map = this.AMObj.map.map = document.getElementById('map');
		  
		  let bounds = this.AMObj.map.bounds = new google.maps.LatLngBounds();
		  this.AMObj.map.infoWindow = new google.maps.InfoWindow();

		  let
		  		maxZoom = 8,
		  		opts = {
		    		zoom: maxZoom,
		    		center: initialState[0],
		    		mapTypeId: google.maps.MapTypeId.ROADMAP
		  		};

		  for ( let i = 0; i < locations.length; i++ ) {  
			  let marker = new google.maps.Marker({
			    position: new google.maps.LatLng(locations[i][1], locations[i][2]),
			    map: mapObj
			  });

			  //extend the bounds to include each marker's position
			  bounds.extend(marker.position);

			  google.maps.event.addListener(marker, 'click', (function(marker, i) {
			    return function() {
			      infowindow.setContent(locations[i][0]);
			      infowindow.open(mapObj, marker);
			    }
			  })(marker, i));
			}

		  this.AMObj.map.autocomplete = new google.maps.places.Autocomplete( ( document.getElementById( 'address' ) ), {types: ['geocode'] } );

		  // console.log( addressInputVal );

		  mapObj = new google.maps.Map( map, opts );

		  this.AMObj.map.autocomplete.bindTo('bounds', mapObj);
		  this.AMObj.map.autocomplete.addListener( 'place_changed', this.fillInAddress );

		},


		tags: ( el = this.AMObj.modal ) => {
			if ( ! el ) {
				console.error( 'no EL specified for tags' );
				return;
			}

			let tagSelect = el.querySelector('select.address__tags'),
					tags = {};

			if ( ! tagSelect ) {
				console.error( 'No tags select found.' );
				return;
			}

			let getTags = tagSelect.children,
					tagsParent = tagSelect.parentNode,
					makeUl = document.createElement("ul");

			makeUl.classList.add('address__tags');
			tagsParent.insertBefore( makeUl, tagSelect );

			for ( let i = 0; i < getTags.length; i+=1 ) {

				let tagLi = document.createElement('li');
				
				tagLi.classList.add('address__tag', 'tag--' + getTags[i].value );
				tagLi.textContent = getTags[i].textContent;
				tagLi.dataset.value = getTags[i].value;
				tagLi.dataset.action = 'switch--tag';

				if ( getTags[i].selected ) {
					tagLi.classList.add('active');
				}

				let tag = makeUl.appendChild( tagLi );
			}
			
			tagSelect.style.display = 'none';
		},
	};
	
	// METHODS

	// Initialize
	this.init = ( settings ) => {
		this.AMObj.modal = this.mainEvent.target.querySelector('.modal__address');

		// Initializing the right way.
		if ( typeof this.AMObj.modal !== 'object' ) {
			console.error( 'Something is really wrong here. Address Modal could not be located.' );
			return false;
		}
		
		// Populate objects
		this.AMObj.modalElements = this.modalForm.queryElements();
		this.AMObj.addressData = this.modalForm.getCurrentAddressData();

		// Libraries
		this.initLibs( this.libs );
		this.initSlider();

		let action = this.actions;

		// Click Events Controller
		this.clickEvents( {
			'dismiss_modal': 	() => { action.dismissModal(); },
			'add-new': 				() => { action.addNew(); },
			'cancel-add-new': () => { action.addNew( false ); },
			'edit': 					() => { action.edit(); },
			'cancel-edit': 		() => { action.edit( false ); },
			'switch--tag': 		( target ) => { action.switchTag( target ); }
		});
	};

	this.initSlider = () => {
		let me 		= this.AMObj.modalElements;

		this.AMObj.config.slider.onInit = ( swiper ) => {
    	this.swiperInited( swiper, me );
    };
    this.AMObj.config.slider.onSlideChangeStart = ( swiper ) => {
    	this.swiperChange( swiper, me );
    	// updateRemoveFormAction( removeForm );
    	// update map -- move to marker
    };

		this.libs.slider = new Swiper('.swiper-container', this.AMObj.config.slider );
	};


	this.actions = {
		// DISMISS MODAL
		dismissModal: () => {
			
			console.log('Modal should have closed...');
		},

		// ADD NEW
		addNew: ( toggle = true ) => {
			if ( ! typeof this.AMObj.addressData.input === 'object' )
				return;

			let me 			= this.AMObj.modalElements,
					slider 	= this.libs.slider,
					modal 	= this.AMObj.modal;

			this.AMObj.modalElements.state = 'adding';

			// quick debug
			toggle ? console.log( 'Adding new...' ) : console.log( 'Cancelled Add New...' );
			let tc = parseInt( me.totalCounter.textContent );

			me.totalCounter.textContent = toggle ? tc + 1 : tc - 1;

			if ( toggle ) {

				// Add new slide
				slider.prependSlide([
					'<div class="swiper-slide"><address>Adding New</address></div>'
				]);
				slider.slideTo(0);

				// Back to main screen
				if ( ! modal.classList.contains( 'not-empty' ) )
					modal.classList.add( 'not-empty' );
				modal.classList.remove( 'map--fetched', 'map--fetched--full' );

				// Focus on address input
				setTimeout( () => { 
					this.AMObj.addressData.input.focus(); 
				}, 100 );

			} else {
				modal.classList.remove( 'not-empty', 'map--fetched' );
				slider.removeSlide(0);
				slider.slideTo(0); // SHOULD BE ACIVE INDEX WHEN TOGGLE TRIGGERED

				this.AMObj.addressData.input.value = '';
			}

			this.putFormData( me.form, me.select, false );
		},

		// EDIT THIS
		edit: ( toggle = true ) => {
			let me 			= this.AMObj.modalElements,
					slider 	= this.libs.slider,
					modal 	= this.AMObj.modal;

			this.AMObj.modalElements.state = 'editing';

			if ( toggle ) {
				modal.classList.remove( 'map--fetched--full' );
				modal.classList.add( 'map--fetched' );
			} else {
				modal.classList.add( 'map--fetched--full' );
				modal.classList.remove( 'map--fetched' );
			}

			this.putFormData( me.form, me.select, toggle );
		},

		switchTag: ( target ) => {
			let tagVal = target.dataset.value,
					me = this.AMObj.modalElements;
				
			_.each( target.parentNode.children, function( el ) {
				el.classList.remove('active');
			});

			_.each( me.select.children, function( opt ) {
				opt.removeAttribute('selected');
				if ( opt.value === target.dataset.value )
					opt.setAttribute('selected', 'selected');
			});
			
			target.classList.add('active');

			if ( me.state == "editing" ) {
				console.log( 'currently editing' );
				// update currentaddress with class of selected tag
			}

		}
	};


	this.putFormData = ( f, s, put = true ) => {
		_.each( this.AMObj.addressData.model, ( value, key ) => {
			let field = f.querySelector('input[name='+key+']');
			if ( field ) {
				if ( put )
					field.value = value;
				else
					field.value = '';
			}
			else {
				switch( key ) {

					case 'id':
						if ( put )
							f.setAttribute( 'action', this.AMObj.config.baseApi + '/' + value )
						else
							if ( this.AMObj.modalElements.state === 'adding' )
								f.setAttribute( 'action', this.AMObj.config.baseApi )
						break;

					case 'tag':
						_.each( s.children, function( n ) {
							n.removeAttribute('selected');
							if ( n.value === value && put )
								n.setAttribute('selected', 'selected');
						});

						let tTags = f.querySelectorAll('.address__tag');

						_.each( tTags, function(n) {
							n.classList.remove('active');
							if ( n.dataset.value == value && put )
								n.classList.add('active');
						});
						
						break;
				} //switch
			} // field
		}); 

		let submit = f.querySelector('input[type=submit]'),
				cancel = this.AMObj.modal.querySelector('.modal__cancel button');

		if ( ! submit || ! cancel ) {
			console.error( 'Form is broken.' );
			return;
		}

		submit.value = put ? 'Update' : 'Save';
		cancel.dataset.action = put ? 'cancel-edit' : 'cancel-add-new';
	};

	// modalForm object
	this.modalForm = {
		queryElements: () => {
			let m = this.AMObj.modal;
			return {
				form: 			m.querySelector('form.modal__form'),
				removeForm: m.querySelector('form.address__actions.remove'),
				select: 		m.querySelector('select.address__tags'),
				counter: 		m.querySelector('.address__counter .counter'),
				totalCounter: m.querySelector('.address__counter .total-counter'),
				state: 			'',
			};
		},

		getCurrentAddressData: () => {
			let form = this.AMObj.modalElements.form,
					modal = this.AMObj.modal;
			return {
				current: 	modal.querySelector('.swiper-slide-active address'),
				input: 		form.querySelector('#address'),
			}
		}
	};


	this.swiperInited = ( swiper, me ) => {
		if ( ! this.AMObj.addressData.current )
			this.AMObj.addressData = this.modalForm.getCurrentAddressData();
		
		this.updateModel();
    this.putFormData( me.form, me.select, true );
	};

	this.swiperChange = ( swiper, me ) => {
		let state = me.state;

		me.counter.textContent = swiper.activeIndex + 1;

		this.AMObj.addressData = this.modalForm.getCurrentAddressData();
		this.updateModel();
    
    if ( state !== "editing" )
    	this.putFormData( me.form, me.select, true );
	};


	this.updateModel = () => {
		this.AMObj.addressData.model = this.updateAFModel( this.AMObj.addressData.current );
	}


	this.fillInAddress = () => {
		window.dispatchEvent(new Event('addressUpdated'));
	  // Get the place details from the autocomplete object.
	  var place = mapObj.autocomplete.getPlace();

	  if ( ! place.geometry ) {
	    window.error( "Autocomplete's returned place contains no geometry" );
	    return;
	  }

	  for (var component in componentForm) {
	    document.getElementById(component).value = '';
	    document.getElementById(component).disabled = false;
	  }

	  // Get each component of the address from the place details
	  // and fill the corresponding field on the form.
	  for (var i = 0; i < place.address_components.length; i++) {
	    var addressType = place.address_components[i].types[0];
	    if (componentForm[addressType]) {
	      var val = place.address_components[i][componentForm[addressType]];
	      document.getElementById(addressType).value = val;
	    }
	  }

	  if (place.geometry.viewport) {
	    mapObj.fitBounds(place.geometry.viewport);
	  } else {
	    mapObj.setCenter(place.geometry.location);
	    mapObj.setZoom(8);
	  }

	  marker.setIcon(/** @type {google.maps.Icon} */({
	    url: place.icon,
	    size: new google.maps.Size(71, 71),
	    origin: new google.maps.Point(0, 0),
	    anchor: new google.maps.Point(17, 34),
	    scaledSize: new google.maps.Size(35, 35)
	  }));
	  marker.setPosition(place.geometry.location);
	  marker.setVisible(true);

	  var address = '';
	  if (place.address_components) {
	    address = [
	      (place.address_components[0] && place.address_components[0].short_name || ''),
	      (place.address_components[1] && place.address_components[1].short_name || ''),
	      (place.address_components[2] && place.address_components[2].short_name || '')
	    ].join(' ');
	  }

	  this.AMObj.map.infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
	  this.AMObj.map.infoWindow.open(mapObj, marker);
	}


	this.geolocate = () => {
	  if (navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      var geolocation = {
	        lat: position.coords.latitude,
	        lng: position.coords.longitude
	      };
	      var circle = new google.maps.Circle({
	        center: geolocation,
	        radius: position.coords.accuracy
	      });
	      mapObj.setBounds(circle.getBounds());
	    });
	  }
	}


	this.updateRemoveFormAction = ( f ) => {
		f.setAttribute( 'action', baseApi + '/' + addressFormModel.id )	;
	}

	this.updateAFModel = ( q ) => {
		let AFModel = {};
		if ( ! q )
			return AFModel;
		
		_.each( q.dataset, ( value, tag ) => {
	    AFModel[tag] = value;
	  });
	  AFModel.address = q.textContent;

	  if ( AFModel.id && AFModel.id.length > -1 )
	  	AFModel.id = AFModel.id.replace(/['"]+/g, '' );
		
		return AFModel;
	};

	this.initLibs = ( which ) => {
		_.each( which, ( func, name ) => {
			if ( typeof func === 'function' )
				this.name = func();
		});
	};

	this.clickEvents = ( which ) => {
		this.AMObj.modal.addEventListener( 'click', ( ev ) => {
			let target = ev.target;

			if ( target.tagName !== 'BUTTON' && target.dataset.action === undefined )
				return;

			_.each( which, ( func, action ) => {
				if ( target.dataset.action === action )
					func( target );
			});

		});
	};
};

module.exports = addressModal;
