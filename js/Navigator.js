var Navigator = {
	
	TIMEOUT_DELAY: 50,

	countryZoomBtn:null,
	countryZoomBtnDiv:null,
	countyZoomBtn:null,
	countyZoomBtnDiv:null,
	districtZoomBtn:null,
	districtZoomBtnDiv:null,
	departmentZoomBtn:null,
	departmentZoomBtnDiv:null,

	init: function() {

		var self = this;

		//main menu btns
		this.mapaBtn = $( "#map" );
      	this.mapaBtns = $( "#map, .logo" );
      	this.logoBtn = $( ".logo" );
      	this.compareBtn = $( "#compare" );
      	this.tableBtn = $( "#table" );
      	
      	//page wrappers
      	this.porovnaniPage = $( "#porovnaniPage" );
      	this.tabulkyPage = $( "#tabulkyPage" );
      	
      	//caching other dom elements
      	this.autocomplete = $( ".autoCompleteBox" );
      	this.homepageTimeline = $( ".homepageTimeline" );
      	this.homepageLegendMain = $( ".homepageLegendMain" );
      	this.homepageInfoBox = $( ".homepageInfoBox" );
      	this.boxWrapper = $( ".box-wrapper" );

		//zoomlevel btns
		this.countryZoomBtn = $( ".country" );
		this.countryZoomBtnDiv = this.countryZoomBtn.find( "div" );
		
		this.countyZoomBtn = $( ".county" );
		this.countyZoomBtnDiv = this.countyZoomBtn.find( "div" );
		
		this.districtZoomBtn = $( ".district" );
		this.districtZoomBtnDiv = this.districtZoomBtn.find( "div" );
		
		this.departmentZoomBtn = $( ".department" );
		this.departmentZoomBtnDiv = this.departmentZoomBtn.find( "div" );

	    //switch zoomlevel
	    this.countryZoomBtn.on( "click", $.proxy( this.showCountry, this ) );
	    this.countyZoomBtn.on( "click", $.proxy( this.showCounty, this ) );
	    this.districtZoomBtn.on( "click", $.proxy( this.showDistrict, this ) );
	    this.departmentZoomBtn.on( "click", $.proxy( this.showDepartment, this ) );

	    /* SWITCH TO PAGE ACCORDING TO HASH */
	    if( window.location.hash == texts["#porovnani"] ) {
	        this.switchToPorovnani( this, Application.selectedUnit );
	    } else if ( window.location.hash == texts["#tabulky"] ) {
	        this.switchToTabulky();
	    } else if ( window.location.hash == texts["#mapa"] ) {
	        this.switchToMapa();
	    } 

	    this.compareBtn.on( "click", function( evt ) {
	    
	       self.switchToPorovnani( this, Application.selectedUnit );
	       _gaq.push(["_trackEvent", "mainMenuCompareBtn", "",Application.currentKey()]);
	    
	    });

	    this.mapaBtns.on( "click", function( evt ) {
	    
	        self.switchToMapa();
	        _gaq.push(["_trackEvent", "mainMenuMapBtn", "",Application.currentKey() ]);
	    
	    });

	    this.tableBtn.on( "click", function( evt ) {
	    
	        self.switchToTabulky();
	        _gaq.push(["_trackEvent", "mainMenuTableBtn", "", Application.currentKey() ]);
	    
	    });

	    this.logoBtn.on( "click", function( evt ) {

	    	Map.resetMap();
	    	_gaq.push(["_trackEvent", "logoClick", "", Application.currentKey() ]);

	    });

    	$('.contactBtn').click( function(){ ContactForm.show(); });

	    //bind "Porovnat s jinym" button
	    $(".homepageInfoBox .compareBtn").on( "click", function() {
	    
	        self.switchToPorovnani( self.compareBtn, Application.selectedUnit );
	        _gaq.push(["_trackEvent", "compareBtnHomepage", Application.currentKey() ]);
	    
	    });

	    //zoom
	    $(".zoomIn").on("click",function( evt ){
	  		
	  		evt.preventDefault();
			var zoomed = Map.zoomIn();
	  		if( zoomed ) ZoomControl.updateToMap( Map.map.getZoom() );

	       _gaq.push(["_trackEvent", "mapZoomIn", Application.currentKey() ]);
	  	
	  	});

	  	$(".zoomOut").on("click",function( evt ){
	  		
	  		evt.preventDefault();
	      	var zoomed = Map.zoomOut();
			if( zoomed ) ZoomControl.updateToMap( Map.map.getZoom() );

			_gaq.push(["_trackEvent", "mapZoomOut", Application.currentKey() ]);
	  	
	  	});

	},

	showCountry: function( evt ){

		evt.preventDefault();
		this.showUnit( 0 );

	},

	showCounty: function( evt ) {

		evt.preventDefault();
		this.showUnit( 1 );

	},


	showDistrict: function( evt ) {

		evt.preventDefault();
		this.showUnit( 2 );

	},


	showDepartment: function( evt ) {

		evt.preventDefault();
		this.showUnit( 3 );

	},

	showUnit: function( zoomLevel ) {

		var self = this;
		Preloader.show();
		
		setTimeout( function() {

		 	Application.updateZoomLevel( zoomLevel );
      		
		    if( zoomLevel != 0 ) self.countryZoomBtnDiv.removeClass( 'selected' );
		    else self.countryZoomBtnDiv.addClass( 'selected' );

		    if( zoomLevel != 1 ) self.countyZoomBtnDiv.removeClass( 'selected' );
		    else self.countyZoomBtnDiv.addClass( 'selected' );
		    
		    if( zoomLevel != 2 ) self.districtZoomBtnDiv.removeClass( 'selected' );
		    else self.districtZoomBtnDiv.addClass( 'selected' );
		    
		    if( zoomLevel != 3 ) self.departmentZoomBtnDiv.removeClass( 'selected' );
		    else self.departmentZoomBtnDiv.addClass( 'selected' );
		    
		    Map.init(Config.map);

		}, this.TIMEOUT_DELAY );

	},
	
	switchToPorovnani: function( btn, selectedUnit ) {

		MapDetailOverlay.close();

		this.autocomplete.hide();
		this.homepageLegendMain.hide();
		this.homepageInfoBox.hide();
		this.homepageTimeline.show();
		this.homepageTimeline.addClass('porovnaniTimeline');

		ContactForm.hide();

		FilterBox.switchToPorovnani();
		ZoomControl.switchToNormal();

		this.boxWrapper.show();

		this.porovnaniPage.show();
		Tabulky.hide();

		Porovnani.init( selectedUnit );
		this.boxWrapper.addClass("porovnani");

		if( this.mapaBtn.hasClass( "active" ) ) this.mapaBtn.toggleClass("active");
		if( !this.compareBtn.hasClass( "active" ) ) this.compareBtn.toggleClass("active");
		if( this.tableBtn.hasClass( "active" ) ) this.tableBtn.toggleClass("active");
	},

	switchToMapa: function( btn, selectedUnit ){
  	
  		this.autocomplete.show();
		this.homepageLegendMain.show();
		this.homepageInfoBox.show();
		this.homepageTimeline.show();
		this.homepageTimeline.removeClass('porovnaniTimeline');

		ContactForm.hide();
		FilterBox.switchToMapa();
		ZoomControl.switchToNormal();

		this.boxWrapper.show();

		this.porovnaniPage.hide();
		this.boxWrapper.removeClass("porovnani");
		Tabulky.hide();

		if( this.compareBtn.hasClass( "active" ) ) this.compareBtn.toggleClass("active");
		if( !this.mapaBtn.hasClass( "active" ) ) this.mapaBtn.toggleClass("active");
		if( this.tableBtn.hasClass( "active" ) ) this.tableBtn.toggleClass("active");

		if( Application.selectedUnit < 1 ) return;

	},

    switchToTabulky: function() {
      
	    MapDetailOverlay.close();
	    
	    this.autocomplete.hide();
	    this.homepageLegendMain.hide();
	    this.homepageInfoBox.hide();
	    this.homepageTimeline.addClass( 'porovnaniTimeline' );

	    ContactForm.hide();
	    CrimeTypesBox.hide();
	    
	    FilterBox.switchToTabulky();
	    ZoomControl.switchToTabulky();

	    this.porovnaniPage.hide();
	    this.boxWrapper.removeClass("porovnani");
	    this.boxWrapper.hide();

	    Tabulky.init();
	    Tabulky.show();

	    if( this.mapaBtn.hasClass( "active" ) ) this.mapaBtn.toggleClass("active");
	    if( this.compareBtn.hasClass( "active" ) ) this.compareBtn.toggleClass("active");
	    if( !this.tableBtn.hasClass( "active" ) ) this.tableBtn.toggleClass("active");
	}

}