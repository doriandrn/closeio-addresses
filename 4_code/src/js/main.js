let  _ = require('lodash'),
		swiper = require('swiper'),
		addressModal = require( './addressModal' );

document.addEventListener( 'DOMContentLoaded', ( ev ) => {
	let closeio_addresses = new addressModal( '', ev );
	closeio_addresses.init();
});






// document.addEventListener( 'DOMContentLoaded', ( event ) => {
// 	modal 	= event.target.querySelector('.modal__address');

// 	addressModal.init();

// 	let form 		= modal.querySelector('form.modal__form'),
// 			select 	= form.querySelector('select.address__tags'),
// 			removeForm = modal.querySelector('form.address__actions.remove');

// 	if ( ! modal ) {
// 		console.error( 'Something is really wrong here. Address Modal could not be located.' );
// 		return;
// 	}

// 	addressesEl = modal.querySelector('.addresses');
// 	currentAddress = modal.querySelector('.address__current');
// 	addressInput = document.getElementById('address');

// 	let counter = modal.querySelector('.address__counter .counter'),
// 			totalCounter = modal.querySelector('.address__counter .total-counter');
	
// 	// let defaultState = currentAddress.textContent;

// 	initTags( modal );
// 	initAutocomplete();

// 	let Slider = new Swiper('.swiper-container', {
//     direction: 'horizontal',
//     loop: false,
//     pagination: '.swiper-pagination',
//     nextButton: '.swiper-button-next',
//     prevButton: '.swiper-button-prev',
//     a11y: true,
//     onInit: ( swiper ) => {
//     	addressFormModel = updateAFModel( modal );
//     },
//     onSlideChangeStart: function( swiper ) {
//     	counter.textContent = swiper.activeIndex + 1;
//     	addressFormModel = updateAFModel( modal );
//     	if ( state == "editing" )
//     		putFormData( form, select );

//     },
//     onSlideChangeEnd: function( swiper ) {
//     	updateRemoveFormAction( removeForm );
//     	// update map -- move to marker
//     }
//   });

// 	modal.addEventListener( 'click', ( event ) => {

// 		if ( event.target.tagName !== 'BUTTON' && event.target.dataset.action === undefined )
// 			return;

// 		// event.preventDefault();

// 		let button = event.target,
// 				buttonAction = button.dataset.action,
// 				backupClass = 'none';

// 		switch( buttonAction ) {
// 			case 'dismiss_modal':
// 				console.log('Modal should have closed...');
// 				break;

// 			case 'add-new':
// 				if ( ! addressInput )
// 					break;

// 				totalCounter.textContent = parseInt( totalCounter.textContent ) + 1;
// 				Slider.prependSlide([
// 					'<div class="swiper-slide"><address>Adding New</address></div>'
// 				]);
// 				Slider.slideTo(0);
				
// 				modal.classList.remove( 'map--fetched', 'map--fetched--full' );

// 				if ( ! modal.classList.contains( 'not-empty' ) )
// 					modal.classList.add( 'not-empty' );
				

// 				setTimeout( function() { addressInput.focus(); }, 100 );
// 				addressInput.onFocus = geolocate();
// 				break;
			
// 			case 'cancel-add-new':
// 				modal.classList.remove( 'not-empty', 'map--fetched' );
// 				Slider.removeSlide(0);
// 				Slider.slideTo(0);

// 				totalCounter.textContent = parseInt( totalCounter.textContent ) - 1;
// 				addressInput.value = '';
// 				break;

// 			case 'edit':

// 				state = 'editing';

// 				modal.classList.remove( 'map--fetched--full' );
// 				modal.classList.add( 'map--fetched' );
				
// 				putFormData( form, select );

// 				break;

// 			case 'remove':
// 				break;

// 			case 'cancel-edit':
// 				modal.classList.add( 'map--fetched--full' );
// 				modal.classList.remove( 'map--fetched' );

// 				clearFormData( form, select );
// 				break;

			
// 			case 'switch--tag':
// 				let butVal = button.dataset.value;
// 				_.each( button.parentNode.children, function(n) {
// 					n.classList.remove('active');
// 				});
// 				_.each( select.children, function( n ) {
// 					n.removeAttribute('selected');
// 					if ( n.value == button.dataset.value )
// 						n.setAttribute('selected', 'selected');
// 				});
// 				button.classList.add('active');

// 				if ( state == "editing" ) {
// 					// update currentaddress with class of selected tag
// 				}
				
// 				break;

// 			case 'save':
// 				console.dir( componentForm );
// 				break;
// 		}
// 	});


// 	window.addEventListener( 'addressUpdated', (e) => {
// 		// update map, don't bubble
// 		window.dispatchEvent(new Event('resize'));
// 		modal.classList.add('map--fetched');
// 		currentAddress.classList.remove('none');
// 		currentAddress.textContent = addressInput.value;
// 	});
// });

// function initTags( el ) {
// 	if ( ! el )
// 		return;

// 	let tagSelect = el.querySelector('select.address__tags'),
// 			tags = {};

// 	if ( ! tagSelect ) {
// 		console.error( 'No tags select found.' );
// 		return;
// 	}

// 	let getTags = tagSelect.children;
// 	let tagsParent = tagSelect.parentNode;

// 	let makeUl = document.createElement("ul");
// 	makeUl.classList.add('address__tags');
// 	tagsParent.insertBefore( makeUl, tagSelect );

// 	for ( let i = 0; i < getTags.length; i+=1 ) {

// 		let tagLi = document.createElement('li');
		
// 		tagLi.classList.add('address__tag', 'tag--' + getTags[i].value );
// 		tagLi.textContent = getTags[i].textContent;
// 		tagLi.dataset.value = getTags[i].value;
// 		tagLi.dataset.action = 'switch--tag';

// 		if ( getTags[i].selected ) {
// 			tagLi.classList.add('active');
// 		}

// 		let tag = makeUl.appendChild( tagLi );
// 	}
	
// 	tagSelect.style.display = 'none';
// }

// function initAutocomplete() {
//   let geocoder = new google.maps.Geocoder(),
//   		initialState = false,
//   		addressInputVal = addressInput.value;

//   if ( addressInputVal.length > 1 ) {
//   	geocoder.geocode({ address: addressInputVal }, (results, status) => {
//   		if ( status === 'OK' ) {
//   			// console.log( results );
//  				// initialState = new google.maps.LatLng( results[0].geometry.location.lat(), results[0].geometry.location.lng() )
//  				initialState = results[0].geometry.location;
//  				console.log( initialState );
//   		}
//   	});
//   }

//   let	map = document.getElementById('map'),
//   		maxZoom = 8,
//   		opts = {
//     		zoom: maxZoom,
//     		center: initialState[0],
//     		mapTypeId: google.maps.MapTypeId.ROADMAP
//   		};

//   console.dir( opts );

//   autocomplete = new google.maps.places.Autocomplete( ( document.getElementById( 'address' ) ), {types: ['geocode'] } );

//   console.log( addressInputVal );

//   map = new google.maps.Map( map, opts );


//   let bounds = new google.maps.LatLngBounds();

//   autocomplete.bindTo('bounds', map);

//   infowindow = new google.maps.InfoWindow();
//   marker = new google.maps.Marker({
//     map: map,
//     anchorPoint: new google.maps.Point(0, -29)
//   });
  
//   autocomplete.addListener('place_changed', fillInAddress);
// }


// function fillInAddress() {
// 	window.dispatchEvent(new Event('addressUpdated'));
//   // Get the place details from the autocomplete object.
//   var place = autocomplete.getPlace();

//   if (!place.geometry) {
//     window.error("Autocomplete's returned place contains no geometry");
//     return;
//   }

//   for (var component in componentForm) {
//     document.getElementById(component).value = '';
//     document.getElementById(component).disabled = false;
//   }

//   // Get each component of the address from the place details
//   // and fill the corresponding field on the form.
//   for (var i = 0; i < place.address_components.length; i++) {
//     var addressType = place.address_components[i].types[0];
//     if (componentForm[addressType]) {
//       var val = place.address_components[i][componentForm[addressType]];
//       document.getElementById(addressType).value = val;
//     }
//   }

//   if (place.geometry.viewport) {
//     map.fitBounds(place.geometry.viewport);
//   } else {
//     map.setCenter(place.geometry.location);
//     map.setZoom(8);
//   }

//   marker.setIcon(/** @type {google.maps.Icon} */({
//     url: place.icon,
//     size: new google.maps.Size(71, 71),
//     origin: new google.maps.Point(0, 0),
//     anchor: new google.maps.Point(17, 34),
//     scaledSize: new google.maps.Size(35, 35)
//   }));
//   marker.setPosition(place.geometry.location);
//   marker.setVisible(true);

//   var address = '';
//   if (place.address_components) {
//     address = [
//       (place.address_components[0] && place.address_components[0].short_name || ''),
//       (place.address_components[1] && place.address_components[1].short_name || ''),
//       (place.address_components[2] && place.address_components[2].short_name || '')
//     ].join(' ');
//   }

//   infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
//   infowindow.open(map, marker);
// }


// function geolocate() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(function(position) {
//       var geolocation = {
//         lat: position.coords.latitude,
//         lng: position.coords.longitude
//       };
//       var circle = new google.maps.Circle({
//         center: geolocation,
//         radius: position.coords.accuracy
//       });
//       autocomplete.setBounds(circle.getBounds());
//     });
//   }
// }

// function updateAFModel( q ) {
// 	let AFModel = {};
// 	let selector = q.querySelector('.swiper-slide-active address');
// 	if ( ! selector )
// 		return {};
	
// 	_.each( selector.dataset, ( value, tag ) => {
//     AFModel[tag] = value;
//   });
//   AFModel.address = selector.textContent;

//   // console.log( AFModel );

//   if ( AFModel.id && AFModel.id.length > -1 )
//   	AFModel.id = AFModel.id.replace(/['"]+/g, '' );
	
// 	return AFModel;
// }



// function putFormData( f, s ) {		
// 	// put in form data from the model
// 	_.each( addressFormModel, ( value, key ) => {
// 		let field = f.querySelector('input[name='+key+']');
// 		if ( field )
// 			field.value = value;
// 		else {
// 			switch( key ) {

// 				case 'id':
// 					f.setAttribute( 'action', baseApi + '/' + value )
// 					break;
				

// 				case 'tag':
// 					_.each( s.children, function( n ) {
// 						n.removeAttribute('selected');
// 						if ( n.value == value )
// 							n.setAttribute('selected', 'selected');
// 					});

// 					let tTags = f.querySelectorAll('.address__tag');

// 					_.each( tTags, function(n) {
// 						n.classList.remove('active');
// 						if ( n.dataset.value == value )
// 							n.classList.add('active');
// 					});
					
// 					break;
// 			}
// 		}
// 	});

// 	let submit = f.querySelector('input[type=submit]');
// 	let cancel = modal.querySelector('.modal__cancel button');

// 	if ( submit )
// 		submit.value = "Update";

// 	if ( cancel )
// 		cancel.dataset.action = 'cancel-edit';
// }

// function clearFormData( f, s ) {
		
// 	// put in form data from the model
// 	_.each( addressFormModel, ( value, key ) => {
// 		let field = f.querySelector('input[name='+key+']');
// 		if ( field )
// 			field.value = '';
// 		else {
// 			switch( key ) {
// 				case 'id':
// 					f.setAttribute( 'action', baseApi );
// 					break;
				
// 				case 'tag':
// 					_.each( s.children, function( n ) {
// 						n.removeAttribute('selected');
// 					});

// 					let tTags = f.querySelectorAll('.address__tag');

// 					_.each( tTags, function(n) {
// 						n.classList.remove('active');
// 					});
					
// 					break;
// 			}
// 		}
// 	});

// 	let submit = f.querySelector('input[type=submit]');
// 	let cancel = modal.querySelector('.modal__cancel button');

// 	if ( submit )
// 		submit.value = "Save";

// 	if ( cancel )
// 		cancel.dataset.action = 'cancel-add-new';
// }

// function updateRemoveFormAction( f ) {
// 	f.setAttribute( 'action', baseApi + '/' + addressFormModel.id )	;
// }

require('../style.scss');