var Homepage = {

	autocomplete:null,
	infoBox: InfoBox,
	timeline: Timeline,
	filterBox: FilterBox,
	boxWrapper: null,
	boxWrapperScrollbar:null,
	scrollApi: null,
	scrollPane: null,

	init: function() {
		var self = this;

		//init componets
		this.autoComplete = new AutoComplete( {autoCompleteId:"autoComplete"} );
		this.autoComplete.init();
		this.autoComplete.callbacks.onGeocodeResult = $.proxy( this.onGeocodeResult, this );

		InfoBox.init();
		
		Timeline.init();
		DateRange.init();
		DateModel.init();

		FilterBox.init();
		CrimeTypesBox.init();
		ContactForm.init();
		Legend.init();

		//init custom scroll
		this.boxWrapper = $( ".box-wrapper" );
		this.boxWrapper.show();

		this.boxWrapper.jScrollPane();
		this.scrollApi = this.boxWrapper.data( "jsp" );
		this.boxWrapperScrollbar = this.boxWrapper.find( ".jspVerticalBar" );

	},

	update: function( data ) {
		
		InfoBox.update( data );
		FilterBox.update( data );
		Legend.update( data );
		ContactForm.update( data );
	
	},

	updateLayout: function( height, target ) {
		
		if( target == InfoBox ){
			FilterBox.slideUp( height );
			Legend.slideUp( height );
		}
		else if( target == FilterBox ){
			Legend.slideUp( height );
		}

		if( FilterBox.collapsed || InfoBox.collapsed ) {
			this.hideScrollbar();
		} else {
			this.showScrollbar();
		}

	},

	updateZoomLevel: function( level ) {
	
		InfoBox.updateZoomLevel( level );
		FilterBox.updateZoomLevel( level );
		Legend.updateZoomLevel( level );
		ContactForm.updateZoomLevel( level );
		Legend.clearSelection();

	},

	onGeocodeResult: function( location, bounds ) {
		
		var param = bounds;
		//bylo pro misto nalezno i doporucene bounds ?
		if( typeof( bounds ) === "undefined" ) {
			
			//ne, pouzit defaultni level zoom
			param = 13;
		
		}

		Map.setViewPort( location, param );

	},

	isDisplayed: function() {
		return InfoBox.element.is( ":visible" );
	},

	resizeScrollbar: function() {
		this.scrollApi.reinitialise();
	},

	hideScrollbar: function() {
		this.boxWrapperScrollbar.hide();
	},

	showScrollbar: function() {
		this.boxWrapperScrollbar.show();
	}


}