class CloseIo_Actions extends CloseIo_Addresses {
	constructor() {
		super();
	}
	// DISMISS MODAL
	dismissModal() {
		console.log( 'Modal should have closed...' );
	}

	// ADD NEW
	addNew( toggle = true ) {
	
		if ( ! typeof addressData.input === 'object' )
			return;

		modalElements.state = 'adding';

		// quick debug
		toggle ? console.log( 'Adding new...' ) : console.log( 'Cancelled Add New...' );
		let tc = parseInt( totalCounter.textContent );

		totalCounter.textContent = toggle ? tc + 1 : tc - 1;

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

			// Focus on address input - wait for animation 1.5sec
			setTimeout( () => { 
				addressData.input.focus(); 
			}, 1500 );

		} else {
			modal.classList.remove( 'not-empty', 'map--fetched' );
			slider.removeSlide(0);
			slider.slideTo(0); // SHOULD BE ACIVE INDEX WHEN TOGGLE TRIGGERED

			addressData.input.value = '';
		}

		this.putFormData( form, select, false );
	}

	// EDIT ADDRESS
	edit( toggle = true ) {
		modalElements.state = 'editing';

		if ( toggle ) {
			modal.classList.remove( 'map--fetched--full' );
			modal.classList.add( 'map--fetched' );
		} else {
			modal.classList.add( 'map--fetched--full' );
			modal.classList.remove( 'map--fetched' );
		}

		this.putFormData( form, select, toggle );
	}

	switchTag( target ) {
		let tagVal = target.dataset.value;
			
		_.each( target.parentNode.children, function( el ) {
			el.classList.remove('active');
		});

		// 'option' refers to HTML <option> tag
		_.each( modalElements.select.children, function( option ) {
			option.removeAttribute('selected');
			if ( option.value === target.dataset.value )
				option.setAttribute('selected', 'selected');
		});
		
		target.classList.add('active');

		if ( modalElements.state == "editing" ) {
			console.log( 'currently editing' );
			// ToDO: update currentaddress with class of selected tag
		}
	}

	putFormData( f, s, put = true ) {
		_.each( addressData.model, ( value, key ) => {
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
							f.setAttribute( 'action', model.config.baseApi + '/' + value )
						else
							if ( modalElements.state === 'adding' )
								f.setAttribute( 'action', model.config.baseApi )
						break;

					case 'tag':
						_.each( s.children, function( n ) {
							n.removeAttribute( 'selected' );
							if ( n.value === value && put )
								n.setAttribute( 'selected', true );
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
				cancel = modal.querySelector('.modal__cancel button');

		if ( ! submit || ! cancel ) {
			console.error( 'Form is broken.' );
			return;
		}

		submit.value = put ? 'Update' : 'Save';
		cancel.dataset.action = put ? 'cancel-edit' : 'cancel-add-new';
	}

	swiperInited( swiper, me ) {
		if ( ! addressData.current )
			addressData = this.modalForm.getCurrentAddressData();
		
		this.updateModel();
		this.putFormData( me.form, me.select, true );
	}

	swiperChange( swiper, me ) {
		let state = me.state;

		me.counter.textContent = swiper.activeIndex + 1;

		addressData = this.modalForm.getCurrentAddressData();
		this.updateModel();
		
		if ( state === "editing" )
			this.putFormData( me.form, me.select, true );
	};


	updateModel() {
		addressData.model = this.updateAFModel( addressData.current );
	}

	updateRemoveFormAction( f ) {
		f.setAttribute( 'action', model.config.baseApi + '/' + addressFormModel.id )	;
	}

	updateAFModel( q ) {
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
}

module.exports = CloseIo_Actions;