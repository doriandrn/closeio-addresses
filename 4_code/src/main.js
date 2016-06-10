require('./style.scss');

let 
	placeSearch, 
	autocomplete,
	map,
	marker,
	infowindow,
	componentForm = {
	  street_number: 'short_name',
	  route: 'long_name',
	  locality: 'long_name',
	  administrative_area_level_1: 'short_name',
	  country: 'long_name',
	  postal_code: 'short_name'
	};

document.addEventListener( 'DOMContentLoaded', ( event ) => {
	let modal = event.target.querySelector('.modal__address');

	if ( ! modal ) {
		console.error( 'Something is really wrong here. Address Modal could not be located.' );
		return;
	}

	initTags( modal );
	initAutocomplete();

	modal.addEventListener( 'click', ( event ) => {

		if ( event.target.tagName !== 'BUTTON' )
			return;

		let button = event.target;
		let buttonAction = button.dataset.action;

		switch( buttonAction ) {
			case 'add-new':
				modal.classList.add( 'not-empty' );
				let textarea = document.getElementById('address');

				if ( ! textarea )
					break;

				setTimeout( function() { textarea.focus(); }, 100 );
				textarea.onFocus = geolocate();

				break;
			
			case 'cancel-add-new':
				modal.classList.remove( 'not-empty' );
				break;

		}
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
		tags[getTags[i].value] = getTags[i].dataset.color !== undefined ? getTags[i].dataset.color : '#000000';
		
		let tagLi = document.createElement('li');
		
		tagLi.classList.add('address__tag');
		tagLi.textContent = getTags[i].value;
		tagLi.dataset.value = getTags[i].textContent;
		tagLi.style.color = getTags[i].dataset.color;
		tagLi.style.backgroundColor = convertHex( getTags[i].dataset.color, 10 );

		if ( getTags[i].selected ) {
			tagLi.classList.add('active');
		}

		let tag = makeUl.appendChild( tagLi );
	}

	console.log( tags );
	
	tagSelect.remove();
}

function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
      (document.getElementById('address')),
      {types: ['geocode']});

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -33.8688, lng: 151.2195},
    zoom: 13
  });

  autocomplete.bindTo('bounds', map);

  infowindow = new google.maps.InfoWindow();
  marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  
  autocomplete.addListener('place_changed', fillInAddress);
}




function fillInAddress() {
	window.dispatchEvent(new Event('resize'));
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  if (!place.geometry) {
    window.alert("Autocomplete's returned place contains no geometry");
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
    map.setZoom(17);  // Why 17? Because it looks good.
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

function convertHex(hex,opacity) {
		if ( ! hex )
			return;

    hex = hex.replace('#','');
    let r = parseInt(hex.substring(0,2), 16);
    let g = parseInt(hex.substring(2,4), 16);
    let b = parseInt(hex.substring(4,6), 16);
    return 'rgba('+r+','+g+','+b+','+opacity/100+')';
}