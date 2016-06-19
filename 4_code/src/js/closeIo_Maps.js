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
	addMarker( address, name = '', ret = false ) {
	  let marker = new google.maps.Marker({
	    position: address,
	    label: name,
	    map: mapObj,
	  });

  	markers.push( marker );

	  marker.addListener( 'click', () => {
	  	let l = markers.length -1,
	 			i = markers.indexOf( marker ),
	 			index = l - i;
	  	
    	mapObj.setZoom( this.config.map.maxZoom );
    	mapObj.panTo( marker.getPosition() );

    	this.modal.dispatchEvent( new CustomEvent( 'markerClick', { detail: { index: index } } ) );
  	});

	  if ( ret )
	  	return marker;
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
				let position = new google.maps.LatLng( { lat: parseFloat( address.dataset.lat ), lng: parseFloat( address.dataset.lng ) } ),
						marker = this.addMarker( position, address.textContent, true );


				bounds.extend( marker.getPosition() );
			}
		});

		markers.reverse();

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
    	});
  	});

		modal.addEventListener( 'cancelAddNew' , ( e ) => {
			let l = markers.length;
			
			if ( ! l )
				return;

			markers[ l-1 ].setMap( null );
			markers.splice( l-1 ); 
		});

		modal.addEventListener( 'addressRemoved', ( e ) => {
			let i = e.detail.index + 1,
					l = markers.length,
					index = e.detail.lastslide ? l-(l-1)-1 : l-i;

			markers[ index ].setMap( null );
			markers.splice( index, 1 );
		});

		modal.addEventListener( 'addressSwiped', () => {
			let currentAddress = document.querySelector( '.swiper-slide-active address' );
			if ( ! currentAddress.dataset.lng || ! currentAddress.dataset.lat )
				return;

			let active = new google.maps.LatLng({ lat: parseFloat( currentAddress.dataset.lat ), lng: parseFloat( currentAddress.dataset.lng ) });
			mapObj.panTo( active );
			mapObj.setZoom( opts.zoom ); 
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

		if ( place.geometry.viewport ) {

			setTimeout( () => {
				window.dispatchEvent( new Event( 'resize' ) );
				mapObj.fitBounds( place.geometry.viewport );
				mapObj.setCenter( place.geometry.location );
			}, 150 );
			
			document.getElementById('lat').value = place.geometry.location.lat();
			document.getElementById('lng').value = place.geometry.location.lng();

			let marker = new google.maps.Marker({
				position: place.geometry.location,
				map: mapObj
			});

			markers.unshift( marker );
		}
		
		document.querySelector( '.modal__address' ).dispatchEvent( new Event( 'addressInserted' ) );
	}

	geolocate() {
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
			});
		}
	}
}