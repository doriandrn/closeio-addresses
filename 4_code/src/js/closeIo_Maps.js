let mapObj,
		autocomplete,
		autocMarker,
		markers = [],
		infowindow,
		componentForm = {
			street_number: 								'short_name',
			route: 												'long_name',
			locality: 										'long_name',
			administrative_area_level_1: 	'short_name',
			country: 											'long_name',
			postal_code: 									'short_name'
		};

export default class CloseIo_Maps {
	constructor( config ) {
		this.config = config;
		this.modal = document.querySelector( '.modal__address' );
	}

	init( activeIndex ) {
		this.geocoder = new google.maps.Geocoder();
		this.activeIndex = activeIndex + 1;
		this.geolocate();
		this.makeMap();
		this.autocomplete();
	}

	get map() {
		return document.getElementById( 'map' );
	}

	// Adds a marker to the map and push to the array.
	addMarker( address, name = '', push = false ) {
	  let marker = new google.maps.Marker({
	    animation: google.maps.Animation.DROP,
	    position: address,
	    label: name,
	    map: mapObj,
	  });

	  if ( push )
	  	markers.push( marker );
	  else
  		markers.unshift( marker );

	  marker.addListener( 'click', () => {
	  	let
	 			i = markers.indexOf( marker );

	 		if ( this.modal.classList.contains( 'map' ) )
	 			return;

    	mapObj.setZoom( this.config.map.maxZoom );
    	mapObj.panTo( marker.getPosition() );

    	this.toggleBounce( i );
    	this.modal.dispatchEvent( new CustomEvent( 'markerClick', { detail: { index: i } } ) );
  	});
	}

	toggleBounce( index ) {
	  if ( markers[ index ].getAnimation() !== null ) {
	    markers[ index ].setAnimation( null );
	  } else {
	    markers[ index ].setAnimation( google.maps.Animation.BOUNCE );
	    setTimeout( () => {
	    	markers[ index ].setAnimation( null );
	    }, 500 );
	  }
	}

	// Sets the map on all markers in the array.
	setMapOnAll() {
	  _.each( markers, ( marker ) => {
	    marker.setMap( mapObj );
	  });
	}

	// Removes the markers from the map, but keeps them in the array.
	clearMarkers() {
	  this.setMapOnAll( null );
	}

	// Shows any markers currently in the array.
	showMarkers() {
	  this.setMapOnAll( mapObj );
	}

	// Deletes all markers in the array by removing references to them.
	deleteMarkers() {
	  this.clearMarkers();
	  markers = [];
	}

	codeLatLng( lat, lng, callback ) {
	  this.geocoder.geocode({
	    'latLng': new google.maps.LatLng( lat, lng ),
	  }, ( results, status ) => {
	    if ( status === google.maps.GeocoderStatus.OK )
	      callback( results[0] );
	    else
	      callback( null );
	  });
	}

	gotData( geocodeData ) {
		if ( ! geocodeData )
			return 'Could not geocode address'

		return geocodeData;
	}

	geocodeAddress( address, counter ) {
		if ( ! address || address.classList.contains('none') )
			return;

		if ( ! this.geocoder ) {
			console.error( 'Geocoder failed to load.');
			return;
		}

		this.geocoder.geocode( { 'address': address.textContent }, ( results, status ) => {
			if ( status === 'OK' ) {
				if ( status != google.maps.GeocoderStatus.ZERO_RESULTS ) {
					if ( counter === this.activeIndex ) {
						mapObj.setCenter( results[0].geometry.location );
					}

					address.dataset.lng = results[0].geometry.location.lng();
					address.dataset.lat = results[0].geometry.location.lat();
					this.addMarker( results[0].geometry.location, address.textContent );

				} else {
					console.info( "Geocoder - No results found." );
				}
			} else {
				console.error( "Geocoder - Error: " + status );
			}
		});
	}

	// Map
	makeMap() {
		let 
				modal = this.modal,
				addresses = modal.querySelectorAll( '.addresses address' ),
				current = modal.querySelector( '.swiper-slide-active address' ),
				bounds = new google.maps.LatLngBounds(),
				infowindow = new google.maps.InfoWindow(),
				backupMarker,
				i = 0,
				opts = {
					zoom: this.config.map.maxZoom,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};


		mapObj = new google.maps.Map( this.map, opts );
		
		// add markers or geocode them if no lat lng specified for addresss
		_.each( addresses, ( address ) => {
			i += 1;
			if ( ! address.dataset.lat || ! address.dataset.lng ) {
				setTimeout( this.geocodeAddress( address, i ), 250 );
			} else {
				let position = new google.maps.LatLng( { lat: parseFloat( address.dataset.lat ), lng: parseFloat( address.dataset.lng ) } );
						
				this.addMarker( position, address.textContent, true );
			}
		});


		if ( current.dataset.lat && current.dataset.lng )
			mapObj.setCenter( new google.maps.LatLng( { lat: parseFloat( current.dataset.lat ), lng: parseFloat( current.dataset.lng ) } ) );
		else {
			mapObj.fitBounds( bounds );
			mapObj.setCenter( bounds.getCenter() );
		}
			
		mapObj.setZoom( opts.zoom ); 

		mapObj.addListener( 'click', ( e ) => {
    	if ( this.modal.classList.contains( 'map' ) )
    		return;

    	this.addMarker( e.latLng );
    	
    	let lat = e.latLng.lat(),
    			lng = e.latLng.lng();
    			
    	this.codeLatLng( lat, lng, ( res ) => {
    		let	results = res ? res : 'Address not geocoded.' ;

		    modal.dispatchEvent( new CustomEvent( 'addNew', {
		    	detail: {
			    	lat: lat,
			    	lng: lng,
			    	results: results,
			    }
		    }));

		    this.modal.dispatchEvent( new CustomEvent( 'dragMarker', { detail: { index: 0 } } ) );
    	});
  	});

		modal.addEventListener( 'cancelAddNew' , ( e ) => {
			console.log( 'cancelled' );

			markers[ 0 ].setMap( null );
			markers.splice( 0, 1 ); 

			console.log( 'after cancel', markers );
		});

		modal.addEventListener( 'markerDragged', ( e ) => {
			let i = e.detail.index;
			console.log( i );
			markers[ i ].setDraggable( false );
		});

		modal.addEventListener( 'updateMarker', ( e ) => {
			let
					index = e.detail.index,
					pos 	= e.detail.position || {},
					cancel = e.detail.cancel;

			if ( ! cancel && pos ) {
				console.log( 'yayo' );
				backupMarker = {
					lat: markers[ index ].position.lat(),
					lng: markers[ index ].position.lng()
				}
				markers[ index ].setPosition( pos );
			}
			else {
				markers[ index ].setPosition( backupMarker );
			}
			
			markers[ index ].setDraggable( false );
		});

		modal.addEventListener( 'dragMarker', ( e ) => {
			let i = e.detail.index;

			markers[i].setDraggable( true );

			backupMarker = markers[i].getPosition();

			markers[i].addListener( 'dragstart', () => {
				modal.classList.add( 'adding' );
			});

			markers[i].addListener( 'dragend', () => {
				let pos = markers[i].getPosition(),
						lat = pos.lat(),
						lng = pos.lng();

				this.codeLatLng( lat, lng, ( res ) => {
	    		let	results = res ? res : 'Address not geocoded.' ;

			    modal.dispatchEvent( new CustomEvent( 'markerPosUpdated', {
			    	detail: {
				    	results: results,
				    	lat: lat,
				    	lng: lng
				    }
			    }));
	    	});
			});

		});

		modal.addEventListener( 'addMarker', ( e ) => {
			let pos = e.detail.position || {},
					cancel = e.detail.cancel;

			if ( ! pos )
				return;

			if ( ! cancel ) {
				this.addMarker( pos );
			} else {
				modal.dispatchEvent( new CustomEvent( 'cancelAddNew' ) );
			}
		});

		modal.addEventListener( 'addressRemoved', ( e ) => {
			let i = e.detail.index;

			markers[ i ].setMap( null );
			markers.splice( i, 1 );
		});

		modal.addEventListener( 'addressSwiped', ( e ) => {
			let currentAddress = document.querySelector( '.swiper-slide-active address' ),
					i = e.detail.index;
			
			if ( ! currentAddress.dataset.lng || ! currentAddress.dataset.lat )
				return;

			this.toggleBounce( i );
			let active = new google.maps.LatLng({ lat: parseFloat( currentAddress.dataset.lat ), lng: parseFloat( currentAddress.dataset.lng ) });
			mapObj.panTo( active );
			mapObj.setZoom( opts.zoom ); 
		});

		modal.addEventListener( 'panTo', ( e ) => {
			if ( ! e.detail )
				return;

			mapObj.panTo( new google.maps.LatLng( e.detail ) );
		});
	}

	// AutoComplete
	autocomplete() {
		if ( ! mapObj ) {
			console.error( 'No map object in autocomplete' );
			return;
		}

		autocomplete = new google.maps.places.Autocomplete( ( document.getElementById( 'address' ) ), { types: ['geocode'] }),

		autocomplete.bindTo( 'bounds', mapObj );
		autocomplete.addListener( 'place_changed', this.fillInAddress );
	}

	// FillInAddresss
	fillInAddress() {
		if ( ! mapObj ) {
			console.error( 'No map object in fillInAddress' );
			return;
		}

		// Get the place details from the autocomplete object.
		let place = autocomplete.getPlace();

		if ( ! place.geometry ) {
			console.error( "Autocomplete's returned place contains no geometry" );
			return;
		}

		for ( let component in componentForm ) {
			document.getElementById(component).value = '';
			document.getElementById(component).disabled = false;
		}

		// Get each component of the address from the place details
		// and fill the corresponding field on the form.
		for ( var i = 0; i < place.address_components.length; i++ ) {
			let addressType = place.address_components[i].types[0];
			if ( componentForm[ addressType ] ) {
				var val = place.address_components[i][componentForm[addressType]];
				document.getElementById(addressType).value = val;
			}
		}

		if ( place.geometry.location ) {
			setTimeout( () => {
				window.dispatchEvent( new Event( 'resize' ) );

				if ( place.geometry.viewport )
					mapObj.fitBounds( place.geometry.viewport );
				
				mapObj.setCenter( place.geometry.location );
			}, 150 );
			
			document.getElementById('lat').value = place.geometry.location.lat();
			document.getElementById('lng').value = place.geometry.location.lng();

			document.querySelector( '.modal__address' ).dispatchEvent( new CustomEvent( 'addressInserted', {
				detail: {
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng()
				}
			}));
		} else {
			console.error( 'Invalid address supplied.' );
		}
	}

	geolocate() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition( ( position ) => {
				var geolocation = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				var circle = new google.maps.Circle({
					center: geolocation,
					radius: position.coords.accuracy
				});
			});
		}
	}
}