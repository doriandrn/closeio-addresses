let 
	placeSearch, 
	autocomplete,
	map,
	marker,
	infowindow,
	addressesEl,
	addressInput,
	currentAddress,
	componentForm = {
	  street_number: 'short_name',
	  route: 'long_name',
	  locality: 'long_name',
	  administrative_area_level_1: 'short_name',
	  country: 'long_name',
	  postal_code: 'short_name'
	},
	_ = require('lodash'),
	swiper = require('swiper');


class CloseIo {
	constructor( settings = {} ) {

	}
	static get map() {

	}
	static get modal() {
	}
}


document.addEventListener( 'DOMContentLoaded', ( event ) => {
	let modal = event.target.querySelector('.modal__address');

	if ( ! modal ) {
		console.error( 'Something is really wrong here. Address Modal could not be located.' );
		return;
	}

	addressesEl = modal.querySelector('.addresses');
	currentAddress = modal.querySelector('.address__current');
	addressInput = document.getElementById('address');

	let defaultState = currentAddress.textContent;

	initTags( modal );
	initAutocomplete();

	let Slider = new Swiper('.swiper-container', {
    // Optional parameters
    direction: 'horizontal',
    loop: false,
    
    // If we need pagination
    pagination: '.swiper-pagination',
    
    // Navigation arrows
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',

    a11y: true,

    onSlideChangeEnd: function( swiper ) {
    	console.log( swiper.activeIndex );
    }

  });

  console.log( Slider.activeIndex );


	modal.addEventListener( 'click', ( event ) => {

		if ( event.target.tagName !== 'BUTTON' && event.target.dataset.action === undefined )
			return;

		// event.preventDefault();

		let button = event.target,
				buttonAction = button.dataset.action,
				backupClass = 'none';

		switch( buttonAction ) {
			case 'dismiss_modal':
				console.log('Modal should have closed...');
				break;

			case 'add-new':
				if ( ! addressInput )
					break;

				modal.classList.remove( 'map--fetched', 'map--fetched--full' );

				if ( ! modal.classList.contains( 'not-empty' ) )
					modal.classList.add( 'not-empty' );
				
				if ( currentAddress.classList.length > 0 ) {
					_.each( currentAddress.classList, function(n) {
						if ( typeof n == 'string' && n.indexOf('tag--') > -1 ) {
							backupClass = n;
							currentAddress.classList.remove(n);
						}
					});
				}

				currentAddress.textContent = "Adding New...";

				setTimeout( function() { addressInput.focus(); }, 100 );
				addressInput.onFocus = geolocate();
				break;
			
			case 'cancel-add-new':
				modal.classList.remove( 'not-empty', 'map--fetched' );
				addressInput.value = '';
				currentAddress.classList.add( backupClass );
				currentAddress.textContent = defaultState;
				break;

			case 'edit':
				modal.classList.remove( 'map--fetched--full' );
				modal.classList.add( 'map--fetched' );
				break;

			case 'remove':
				event.preventDefault();
				let confirmRemove = confirm('Are you sure you want to remove this address?');
				
				break;

			case 'switch--tag':
				let butVal = button.dataset.value,
						select = modal.querySelector('select.address__tags');
				_.each( button.parentNode.children, function(n) {
					n.classList.remove('active');
				});
				_.each( select.children, function( n ) {
					n.removeAttribute('selected');
					if ( n.value == button.dataset.value )
						n.setAttribute('selected', 'selected');
				});
				button.classList.add('active');
				
				break;

			case 'save':
				console.dir( componentForm );
				break;
		}
	});


	window.addEventListener( 'addressUpdated', (e) => {
		// update map, don't bubble
		window.dispatchEvent(new Event('resize'));
		modal.classList.add('map--fetched');
		currentAddress.classList.remove('none');
		currentAddress.textContent = addressInput.value;
	});
});

function initTags( el ) {
	if ( ! el )
		return;

	let tagSelect = el.querySelector('select.address__tags'),
			tags = {};

	if ( ! tagSelect ) {
		console.error( 'No tags select found.' );
		return;
	}

	let getTags = tagSelect.children;
	let tagsParent = tagSelect.parentNode;

	let makeUl = document.createElement("ul");
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
}

function initAutocomplete() {
  let geocoder = new google.maps.Geocoder(),
  		initialState = false,
  		addressInputVal = addressInput.value;

  if ( addressInputVal.length > 1 ) {
  	geocoder.geocode({ address: addressInputVal }, (results, status) => {
  		if ( status === 'OK' ) {
  			// console.log( results );
 				// initialState = new google.maps.LatLng( results[0].geometry.location.lat(), results[0].geometry.location.lng() )
 				initialState = results[0].geometry.location;
 				console.log( initialState );
  		}
  	});
  }

  let	map = document.getElementById('map'),
  		maxZoom = 8,
  		opts = {
    		zoom: maxZoom,
    		center: initialState[0],
    		mapTypeId: google.maps.MapTypeId.ROADMAP
  		};

  console.dir( opts );

  autocomplete = new google.maps.places.Autocomplete( ( document.getElementById( 'address' ) ), {types: ['geocode'] } );

  console.log( addressInputVal );

  map = new google.maps.Map( map, opts );


  let bounds = new google.maps.LatLngBounds();

  autocomplete.bindTo('bounds', map);

  infowindow = new google.maps.InfoWindow();
  marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  
  autocomplete.addListener('place_changed', fillInAddress);
}


function fillInAddress() {
	window.dispatchEvent(new Event('addressUpdated'));
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  if (!place.geometry) {
    window.error("Autocomplete's returned place contains no geometry");
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
    map.fitBounds(place.geometry.viewport);
  } else {
    map.setCenter(place.geometry.location);
    map.setZoom(8);
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

  infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
  infowindow.open(map, marker);
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
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
      autocomplete.setBounds(circle.getBounds());
    });
  }
}

require('./style.scss');