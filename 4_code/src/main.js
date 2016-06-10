require('./style.scss');
// let backbone = require('backbone');

document.addEventListener( 'DOMContentLoaded', ( event ) => {
	let modal = event.target.querySelector('.modal__address');

	if ( ! modal ) {
		console.error( 'Something is really wrong here. Address Modal could not be located.' );
		return;
	}

	initTags( modal );

	modal.addEventListener( 'click', ( event ) => {
		// console.dir( event.target );

		if ( event.target.tagName !== 'BUTTON' )
			return;

		let button = event.target;
		let buttonAction = button.dataset.action;

		switch( buttonAction ) {
			case 'add-new':
				modal.classList.add( 'not-empty' );
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

	console.log( 'tags running' );

	let tagSelect = el.querySelector('.address__tags');

	if ( ! tagSelect ) {
		console.error( 'No tags select found.' );
		return;
	}

	let tags = tagSelect.querySelectorAll( 'option' );

	console.log( tags.value );

}