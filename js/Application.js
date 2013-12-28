/* Author:
	zdenek.hynek@gmail.com
*/

var Application = {
	
	screenWidth: 0,
	screenHeight: 0,
	zoomLevel: 3,
	selectedUnit: -1,
	secondSelectedUnit: "",
	timeFrom: 0,
	timeTo: 0,
	filters: null,
	defaultFilters: null,
	selectedCrimeType: "101-903",
	customCrime: null,

	init: function( config ) {
		
		var $window = $( window );
		this.screenWidth = $window.width();
		this.screenHeight = $window.height();

		//default selected unit
		this.timeFrom = timeFrom;
		this.timeTo = timeTo;

		//populate filters with start selection
		var self = this;
		this.filters = [];//[ '101-106', 201, 141, 131, 371, 372, 431, 433, 435 ];
		
		//save default filters, will be used to get data for area ( where we always need to display numbers for all values )		
		var defaultFilters = [];
		
		var $filterLis = $( ".homepageFilterBox" ).find( "li" );
		var filterListLen = $filterLis.length;
		this.defaultFilters = "";

		$.each( $filterLis, function( i, v ) {
			var $v = $( v );
			var $input = $v.find( "input" );
			var isChecked = $input.is( ":checked" );
			var crimeType = $v.data("crime-type").toString();
			if( isChecked ) {
				self.filters.push( crimeType );
			}
			
			if( crimeType == -1 ) self.defaultFilters += "'" + crimeType + "'";
			
			if( i < (filterListLen-1) ) self.defaultFilters += ",";
			
		} );

		//DataProxy.getGraphData( "001114" );
		//return;

		Preloader.init();

		//save default filters as string( can use in queries without modifications)
		//self.defaultFilters = defaultFilters.join(",");

		//default zoomLevel
		/*if( fusionTable == countryTable ) Application.zoomLevel = 0;
		else if( fusionTable == countyTable ) Application.zoomLevel = 1;
		else Application.zoomLevel = 2;
		*/

		Application.zoomLevel = 3;

		Application.timeFrom = timeFrom;
		Application.timeTo = timeTo;

		//init pages
		Homepage.init();
		
		//init map
		Map.init(Config.map);
		ZoomControl.init();
		Navigator.init();

		//initial call for data
		DataProxy.getNamesAndIndexes( Application.zoomLevel );

        var self = this;
		
		//central resize handler
		$( window ).on( "resize", function(){

			var $this = $( this );
			self.screenWidth = $this.width();
			self.screenHeight = $this.height();

			Porovnani.resize();
			Tabulky.resize();
		});

		$( window ).trigger( "resize" );
       
	},

	updateSelectedUnit: function( id, dataFromMap, openDetail ) {
		
		var self = this;
		
		function complete( data ) {
      	    var correctData = DataUtil.checkCorrectData( data );
      		if( !correctData ) {
      			//selected unit for which there are not qualified data
      			Preloader.hide();
      			return;
      		}

      	   	Homepage.update( data );
      	   	if( Homepage.isDisplayed() && ( dataFromMap || openDetail ) ) {
      	   		MapDetailOverlay.display( data, true );
      	   	}
	       	Porovnani.updateArea( Application.selectedUnit, data );
	       	Tabulky.updateArea( Application.selectedUnit, data );
	    	Preloader.hide();
	    }

   	    setTimeout( function() {
   	       	var data = DataProxy.getDataForArea( id, complete, Application.filtersString, dataFromMap );
		}, 50);

	    Application.selectedUnit = id;
		Preloader.show();
	},

   	updateSecondSelectedUnit: function( id ) {

   		function complete( data ) {
      	   	var correctData = DataUtil.checkCorrectData( data );
      		if( !correctData ) {
      			//selected unit for which there are not qualified data
      			Preloader.hide();
      			return;
      		}

      	   	//second selected unit applies only to Porovnani
      	   	Porovnani.updateSecondArea( Application.secondSelectedUnit, data );
      	   	Preloader.hide();
	    }

	    Preloader.show();
   		Application.secondSelectedUnit = id;

   		setTimeout( function() {
        	var data = DataProxy.getDataForArea( id, complete, Application.filtersString );
        }, 50);
   	}, 

	updateZoomLevel: function( zoomLevel, keepMapLayer ) {
		this.zoomLevel = zoomLevel;
		//clear selected unit
		Application.selectedUnit = ( this.zoomLevel != 0 ) ? -1 : 0 ;

		//close 
		if( MapDetailOverlay.isDisplayed ) MapDetailOverlay.close();

		//if calling when deselecting not existing unit in given time interval
		if( !keepMapLayer ) Map.clearMapLayer();

		var namesAndIndexes = DataProxy.getNamesAndIndexes( Application.zoomLevel );

		Homepage.updateZoomLevel( zoomLevel );
		Porovnani.updateZoomLevel( zoomLevel );
		Tabulky.updateZoomLevel( zoomLevel );

		if( this.zoomLevel == 0 ) {
			
			function complete( data ) {
				Homepage.update( data );
				if( Porovnani.isDisplayed() ) Porovnani.updateArea( 0, data );
				Tabulky.updateArea( 0, data );
			}

			//automatically select entire country
			DataProxy.getDataForArea( Application.selectedUnit, complete, Application.filtersString );
		} 
	},

	updatePeriod: function( timeFrom, timeTo ) {
		var that = this;

		Preloader.show();

		this.timeFrom = timeFrom;
		this.timeTo = timeTo;

		Application.selectedPeriod = timeFrom + "-" + timeTo;//this.firstDate.month + this.firstDate.year + this.secondDate.month + this.secondDate.year;
			
		setTimeout( function() {
			//need to update indexes
			var namesAndIndexes = DataProxy.getNamesAndIndexes( Application.zoomLevel );
			function complete( data ) {
				//check if rankvalue exist, if not, give selected unit does not exist in time
				data.rankValue = InfoBox.findRankById( data.id );
				if( data.rankValue == 0 ) {
					Application.updateZoomLevel( Application.zoomLevel, true );
					return;
				}

				Map.updateMapLayer();
				Homepage.update( data );
				if( Porovnani.isDisplayed() ) Porovnani.updatePeriodAndFilters( data, namesAndIndexes );
				Tabulky.updatePeriod( data );
				Preloader.hide();
			}

			if( Application.selectedUnit > -1 ) DataProxy.getDataForArea( Application.selectedUnit, complete, Application.filtersString );
			else {
				Map.updateMapLayer();
				//need to update rankings tabulky regardless of not selected unit
				Tabulky.updatePeriod( null );
				//update rankings in selectbox
				Porovnani.updatePeriodAndFilters( null, namesAndIndexes );
				Preloader.hide();
			}
		}, 50 );

	},

	updateFilters: function() {

	   Preloader.show();
       
       setTimeout( function() {

       		function complete( data ) {
				//Map.init( Config.map );

				Map.updateMapLayer();
				Homepage.update( data );

				if( Porovnani.isDisplayed() ) Porovnani.updatePeriodAndFilters( data, namesAndIndexes );
				Preloader.hide();
				Tabulky.updateFilters( namesAndIndexes );
			}


		   //temp commented so get names and indexes is called in the map 
	       var namesAndIndexes = DataProxy.getNamesAndIndexes( Application.zoomLevel );

	       //update timeline data
	       var timelineData = DataProxy.getTimeline();
	       Timeline.update( timelineData );
	       DateModel.init();

	       if( Application.selectedUnit > -1 ) DataProxy.getDataForArea( Application.selectedUnit, complete, Application.filtersString );
	       else {
			   Map.updateMapLayer();

			   //update rankings in selectbox
			   //temp hide tabulky
			   Porovnani.updatePeriodAndFilters( null, namesAndIndexes );
			   Preloader.hide();
			   Tabulky.updateFilters( namesAndIndexes );
		   } 
		}, 50 );
	},

	updateCustomCrime: function( crimeType, crimeName ) {

		this.customCrime = { "type": crimeType, "name": crimeName };

		FilterBox.updateCustomCrime( this.customCrime.type, this.customCrime.name );
		if( Porovnani.inited ) Porovnani.updateCustomCrime( this.customCrime.type, this.customCrime.name );
		if( Tabulky.inited ) Tabulky.updateCustomCrime( this.customCrime.type, this.customCrime.name );

	},

	currentKey:function() {
		return Application.zoomLevel + "," + Application.selectedPeriod + "," + Application.filtersString();
	},

	filtersString:function() {
		//return Application.filters.join( "," );

		var string = "";
			len = Application.filters.length,
			i = 0;

		for( i = 0; i < len; i++ ) {

			//check if filter is single number or multiple categories like so '234,237,523'
			var filter = Application.filters[ i ];
			var commaIndex = filter.indexOf( "," );
			string += "'" + filter + "'";				
			
			if( i < len - 1 ) string += ",";
		}

		//check if no fitler selected
		if( string == "" ) {
			string = "-999";
		}

		return string;
	}

};