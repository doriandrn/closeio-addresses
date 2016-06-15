class CloseIo_Maps {
	
	constructor( settings  ) {
		// super();
		this.componentForm = {
			street_number: 	'short_name',
			route: 					'long_name',
			locality: 			'long_name',
			administrative_area_level_1: 'short_name',
			country: 				'long_name',
			postal_code: 		'short_name'
		};
	}

	init( activeIndex ) {
		let map = this.map;
		this.activeIndex = activeIndex + 1;

		if ( ! map ) {
			console.error( 'Map Container not found');
			return;
		}

		this.geolocate();
		this.makeMap();
		this.autocomplete();
	}

	get map() {
		return document.getElementById('map');
	} 

	geocodeAddress( address, counter ) {
		let geocoder = new google.maps.Geocoder();
		if ( ! geocoder ) {
			console.error( 'Geocoder failed to load.');
			return;
		}

		geocoder.geocode( { 'address': address }, ( results, status ) => {
			if ( status === 'OK' ) {
				if ( status != google.maps.GeocoderStatus.ZERO_RESULTS ) {
					if ( counter === this.activeIndex ) {
						console.log( 'am gasit vavr' );
						this.mapObj.setCenter( results[0].geometry.location );
					}

					let infowindow = new google.maps.InfoWindow({
						content: '<div class="place_details">' + address + '</div>',
						size: new google.maps.Size(150, 50)
					});

					let marker = new google.maps.Marker({
						position: results[0].geometry.location,
						map: this.mapObj,
						title: address
					});
					google.maps.event.addListener( marker, 'click', () => {
						infowindow.open( mapObj, marker) ;
					});

				} else {
					console.error( "Geocoder - No results found." );
				}
			} else {
				console.error( "Geocoder - Error: " + status );
			}
		});
	}

	// Map
	makeMap() {
		let mapObj,
				// addressInputVal = addressData.input.value,
				addresses = document.querySelectorAll( '.addresses address' ),
				locations = [],
				bounds = new google.maps.LatLngBounds(),
				maxZoom = 8,
				i = 0,
				opts = {
					zoom: maxZoom,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

		_.each( addresses, ( address ) => {
			let location = address.textContent;
			locations.push( { 'address': location } );
			i += 1;
			setTimeout( this.geocodeAddress( location, i ), 250 );
		});

		this.mapObj = new google.maps.Map( map, opts );
	}

	// AutoComplete
	autocomplete() {
		let autocomplete = new google.maps.places.Autocomplete( ( document.getElementById( 'address' ) ), {
			types: ['geocode'] 
		});

		autocomplete.bindTo( 'bounds', this.mapObj );
		autocomplete.addListener( 'place_changed', this.fillInAddress );
	}

	// FillInAddresss
	// ToDO: create additional marker
	fillInAddress() {
		window.dispatchEvent( new Event( 'addressUpdated' ) );

		let mapObj = this.mapObj;

		// Get the place details from the autocomplete object.
		let place = mapObj.autocomplete.getPlace();

		if ( ! place.geometry ) {
			console.error( "Autocomplete's returned place contains no geometry" );
			return;
		}

		for ( var component in super.model.componentForm ) {
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
			mapObj.fitBounds( place.geometry.viewport );
		} else {
			mapObj.setCenter( place.geometry.location );
			mapObj.setZoom( maxZoom );
		}

		marker.setIcon(/** @type {google.maps.Icon} */({
			url: place.icon,
			size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			scaledSize: new google.maps.Size(35, 35)
		}));
		marker.setPosition( place.geometry.location );
		marker.setVisible( true );

		let address = '';
		if ( place.address_components ) {
			address = [
				(place.address_components[0] && place.address_components[0].short_name || ''),
				(place.address_components[1] && place.address_components[1].short_name || ''),
				(place.address_components[2] && place.address_components[2].short_name || '')
			].join(' ');
		}

		addressmap.infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
		addressmap.infoWindow.open( mapObj, marker );
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
				// mapObj.setBounds(circle.getBounds());
			});
		}
	}
}

module.exports = CloseIo_Maps;