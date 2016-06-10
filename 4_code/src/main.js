require('./style.scss');

let 
	placeSearch, 
	autocomplete,
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
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('address')),
      {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

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