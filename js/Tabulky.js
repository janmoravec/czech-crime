var Tabulky = {

	element:null,
	inited:false,
	unitsTab:null,
	crimesTab:null,
	activeTab: TypesTable,
	secondCol:null,

	init: function(){
		
		var self = this;

		if( !self.inited ) {
			self.inited = true;
		
			self.element = $( "#tabulkyPage" );
			self.secondCol = self.element.find( ".secondCol" );
			self.documentsSections = self.secondCol.find( "section" );

			//init chosen select box
			self.element.find(".chosen-select").chosen( { no_results_text:texts["Nic nenalezeno pro: "] } ); 
			//self.element.find(".chosen-select-deselect").chosen( { allow_single_deselect:true } );

			TypesTable.init( { onDisplayRank: self.handleDisplayRank, onAreaSelect: self.handleAreaSelect, onDisplayGraph: self.handleDisplayGraph } );
			
			//update references for select box in different tabs
			Trend.selectBox = TypesTable.selectBox;
			Trend.rankStepper = TypesTable.rankStepper;

			RankingsTable.init( { onDisplayCrimes: self.handleDisplayCrimes, onDisplayGraph: self.handleDisplayGraph } );
			//Trend.init();

			//$( ".chosen-select" ).attr( "data-placeholder", "+ 911" );
			//self.element.find(".chosen-select").chosen( { no_results_text:texts["Nic nenalezeno pro: "] } ); 
			
			$.each( self.documentsSections, function( i, section ){
				var $section = $( section );
				var $header = $section.find( ".headerWrapper" );
				var $content = $section.find( ".articleContent" );
				var $hideBtn = $section.find( ".hideBtn" );

				//hide by default
				$content.hide();
				$hideBtn.toggleClass( "hideBtnDown" );

				//bind events
				$header.on( "click" , function() { 
					var $this = $(this);
					$content.slideToggle();
					//rotate 
					$hideBtn.toggleClass( "hideBtnDown" );
				});
			});

			self.downloadSection = self.element.find( )

			self.unitsTab = self.element.find( ".unitsTab" );
			self.crimesTab = self.element.find( ".crimesTab" );
			self.trendTab = self.element.find( ".trendTab" );

			self.unitsTab.on( "click",  function( evt ) {
				evt.preventDefault();
				
				Tabulky.displayCrimes();
				self.unitsTab.addClass( "active" );
				self.crimesTab.removeClass( "active" );
				self.trendTab.removeClass( "active" );

				FilterBox.switchToTabulky();
			});

			self.crimesTab.on( "click", function( evt ) {
				evt.preventDefault();
				
				Tabulky.displayRankings();
				self.crimesTab.addClass( "active" );
				self.unitsTab.removeClass( "active" );
				self.trendTab.removeClass( "active" );

				FilterBox.switchToTabulky();
			});

			self.trendTab.on( "click", function( evt ) {
				evt.preventDefault();
				
				Tabulky.displayTrend();
				self.crimesTab.removeClass( "active" );
				self.unitsTab.removeClass( "active" );
				self.trendTab.addClass( "active" );

				FilterBox.switchToTrend();
			});

			//choose by default
			self.unitsTab.addClass( "active" );

		}

		self.updateZoomLevel();
		
		//set value
		var data;
		if( Application.selectedUnit > 0 ) {
			function complete( data ) {
				Tabulky.updateArea( Application.selectedUnit, data );
	        }
			data = DataProxy.getDataForArea( Application.selectedUnit, complete, Application.filtersString );
		} 
	
	},

	updateZoomLevel:function() {
		if( !this.inited ) return;
		
		var data = DataProxy.getNamesAndIndexes( Application.zoomLevel );
		TypesTable.updateZoomLevel( data );
		//RankingsTable.updateZoomLevel();
		Trend.updateZoomLevel( data );
	},

	updatePeriod:function( data ) {
		if( !this.inited ) return;

		//update data in both tables
		if( !TypesTable.hidden ) TypesTable.updateToArea( Application.selectedUnit );	
		if( !RankingsTable.hidden ) RankingsTable.updateToCrimeType( Application.selectedCrimeType );

		//update graph
		if( !Trend.hidden ) Trend.updatePeriod();
	},

	updateArea:function( area, data ) {

		if( !this.inited ) return;
		if( !TypesTable.hidden ) TypesTable.updateToArea( area );
		if( !Trend.hidden ) Trend.updateToArea( area );

	},

	updateFilters: function( data ) {

		if( !this.inited ) return;
		TypesTable.selectBox.updateValues( data, true );
		TypesTable.rankStepper.setValue( TypesTable.selectBox.getSelectedRank() );

		if( !Trend.hidden ) Trend.updateFilters();

	},

	handleDisplayRank: function( crimeType ) {
		Tabulky.displayRankings( crimeType );
	},

	handleDisplayCrimes: function( area ) {
		Tabulky.displayCrimes( area );
	},

	handleDisplayGraph: function( params ) {
		
		if( params.hasOwnProperty( "area" ) ) {
			if( !isNaN( area ) ) Application.updateSelectedUnit( params.area );
		}

		Tabulky.displayTrend( Application.selectedUnit );
	},

	handleAreaSelect: function( area ) {
		Application.updateSelectedUnit( area );
	},

	displayRankings: function ( crimeType ) {
		
		this.activeTab = RankingsTable;

		if( !RankingsTable.inited ) RankingsTable.init( { onDisplayCrimes: self.handleDisplayCrimes, onDisplayGraph: self.handleDisplayGraph } );
		
		RankingsTable.updateToCrimeType( crimeType );
		TypesTable.hide();
		Trend.hide();
		RankingsTable.show();
		
		//appear document
		this.secondCol.show();

		Tabulky.crimesTab.addClass( "active" );
		Tabulky.unitsTab.removeClass( "active" );
		Tabulky.trendTab.removeClass( "active" );

		FilterBox.switchToTabulky();

		_gaq.push(["_trackEvent", "displayRank", Application.currentKey() ]);

		//store values
		if( crimeType ) Application.selectedCrimeType = crimeType;
	},

	displayCrimes: function ( area ) {

		this.activeTab = TypesTable;

		RankingsTable.hide();
		Trend.hide();
		TypesTable.show();
		
		//appear document
		this.secondCol.show();

		Tabulky.crimesTab.removeClass( "active" );
		Tabulky.unitsTab.addClass( "active" );
		Tabulky.trendTab.removeClass( "active" );

		FilterBox.switchToTabulky();

		if( !isNaN( area ) ) Application.updateSelectedUnit( area );

		_gaq.push(["_trackEvent", "displayCrimes", Application.currentKey() ]);
	
	},

	displayTrend: function ( area ) {

		this.activeTab = Trend;

		RankingsTable.hide();
		TypesTable.hide();
		Trend.show();

		Tabulky.unitsTab.removeClass( "active" );
		Tabulky.crimesTab.removeClass( "active" );
		Tabulky.trendTab.addClass( "active" );

		FilterBox.switchToTrend();

		_gaq.push(["_trackEvent", "displayGraph", Application.currentKey() ]);
		
		//hide documents
		this.secondCol.hide();

		//if( !isNaN( area ) ) Application.updateSelectedUnit( area );
	},

	updateCustomCrime: function( crimeType, crimeName ) {
   		
   		if( !TypesTable.hidden ) TypesTable.updateCustomCrime( crimeType, crimeName );
   
   	},

	resize: function() {
		Trend.resize();
	},

	hide: function() {

		if( this.element ) {

			this.element.hide();
			TypesTable.hide();
			RankingsTable.hide();
			Trend.hide();

		}
		
	},

	show: function() {

		if( this.element ) {

			this.element.show();

			//decide which tab to choose
			if( this.activeTab ) {
				switch( this.activeTab ) {
					case TypesTable:
						this.displayCrimes();
						break;
					case RankingsTable:
						this.displayRankings();
						break;
					case Trend:
						this.displayTrend();
						break;
				}
			} else {
				//something not right, go for default
				displayCrimes();
			}
			

		}

	}

}