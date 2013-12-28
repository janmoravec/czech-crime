var TypesTable = {

	element:null,
	rows:null,
	downloadBtn:null,
	buttons:null,
	graphButtons:null,
	rankStepper:null,
	selectBox:null,
	totalTds:null,
	generalTds:null,
	opts:null,
	hidden: false,

	cachedCustomCrimeType: "",
	cachedTimeFrom: -1,
	cachedTimeTo: -1,
	cachedSelectedUnit: -1,

	init: function( opts ) {

		var self = this;
		self.opts = opts;

		var tabulkyPage = $( "#tabulkyPage" );
		self.element = $("#tabulkyPage").find( ".crimes" );
		self.typesTable = self.element.find( ".types" );
		self.rows = self.typesTable .find( "tr" );
		self.customRow = self.rows.last();

		//add first row from total table
		//self.rows = self.rows.add( self.element.find( ".total" ).find( "tr" ).eq( 1 ) );
		//init rows
		self.rows = self.typesTable .find( "tr" );
		self.rows.on( "mouseover", function() { 
			$tr = $( this );
			$tr.addClass("active");
		}).on( "mouseout", function() {
			$tr = $( this );
			$tr.removeClass("active");
		});

		//init buttons
		self.buttons = self.element.find(".displayRankBtn");
		self.buttons.on( "click", function( evt ) {
			evt.preventDefault();
			self.displayRanking( this );
		});

		self.graphButtons = self.element.find(".displayGraphBtn");
		self.graphButtons.on( "click", function( evt ) {
			evt.preventDefault();
			self.displayGraph( this );
		});
		
		var section = tabulkyPage.find( ".unitsSelect" );
		var firstRank =  section.find( ".rank" );
		self.selectBox = new PorovnaniSelectBox( section.find( "select.county" ), { onChange: self.handleSelectChange } );
		self.rankStepper = new RankStepper( firstRank, self.selectBox, { onChange: self.handleRankChange } );
		
		//populate selectboxes rankstepper property
		self.selectBox.rankStepper = self.rankStepper;
			
		//init download button
		self.downloadBtn = self.element.find(".downloadBtn");
		self.downloadBtn.on( "click", function( evt ) {
			evt.preventDefault();
            getTable('types');
            _gaq.push(["_trackEvent", "downloadDataTypesTable", Application.currentKey() ]);
		});

		self.generalTds = self.element.find( ".general" ).find( "tr td.left" );
		self.totalTds = self.element.find( ".total" ).find( "tr" ).eq( 1 ).find( "td" );

		//init select 
		self.select = tabulkyPage.find(".unitsSelect");
	},

	handleSelectChange:function( selectedId ) {
		if( TypesTable.opts.onAreaSelect ) { 
			TypesTable.opts.onAreaSelect.apply( this, [ selectedId ] );
			_gaq.push(["_trackEvent", "handleSelectChangeTypesTable", Application.currentKey() ]);
		}
	},

	handleRankChange:function( selectedId ) {
		//update app-wise data
		Application.updateSelectedUnit( selectedId );
        _gaq.push(["_trackEvent", "handleRankChangeTypesTable", Application.currentKey() ]);
	},

	displayRanking: function( btn ) {
		
		var $btn = $( btn );
		var $parentRow = $btn.parent().parent();
		var crimeType = $parentRow.data( "crime-type" );
		
		if( this.opts.onDisplayRank ) this.opts.onDisplayRank.apply( this, [ crimeType ] );
	
	},

	displayGraph: function( btn ) {

		var $btn = $( btn );
		var $parentRow = $btn.parent().parent();
		var crimeType = $parentRow.data( "crime-type" );
		
		if( this.opts.onDisplayGraph ) this.opts.onDisplayGraph.apply( this, [ { crimeType: crimeType } ] );
	
	},

	updateToArea: function( area ) {
		
		//re-cache data
		this.cachedSelectedUnit = area;
		this.cachedTimeFrom = Application.timeFrom;
		this.cachedTimeTo = Application.timeTo;

		this.selectBox.setValue( area );
		
		/*if( data ) {

			TypesTable.update( data );
	
		} else {*/

			function complete( data ) {
				TypesTable.update( data );
			}

			//unit changed when off types table, need to update
			var data = DataProxy.getAllCrimeTypesForArea( area, complete );

		//}
		
	},

	setValue: function( selectedUnit ) {
		this.selectBox.setValue( selectedUnit );
		this.updateSelectedUnit( selectedUnit );
	},

	updateZoomLevel: function( data ) {
		this.selectBox.updateValues( data );
		this.rankStepper.updateRange( 1, this.selectBox.element.find("option").length - 1 );
		this.clearValues();
   	},

   	update: function( data ) {
   		if( !data ) return;

		var self = this;
	    /*this.index = Math.max( 0, data.index );
	    this.data = data;
	  	
	    this.defaultFoundSum = Math.max( 0, this.defaultFoundSum );
	    this.defaultSolvedSum = Math.max( 0, this.defaultSolvedSum );
	    this.defaultIndex = Math.max( 0, this.defaultIndex );*/

	    if( data.total ) {
	    	
	    	//update totals 
		    var total = data.total;
		   	var portion = ( total.FoundSum > 0 ) ? Math.round( total.SolvedSum / total.FoundSum * 100 ) : "-" ;
			
		   	//check for smaller size
		   	var indexFormatted =  DataUtil.addSpaces( Math.round( total.Index*10 )/10 );
			if( indexFormatted.length > 6 ) {
				self.totalTds.eq( 2 ).addClass( "smallLetters" );
			} else {
				self.totalTds.eq( 2 ).removeClass( "smallLetters" );
			}

		    self.totalTds.eq( 1 ).text( DataUtil.addSpaces( total.FoundSum ) );
		    self.totalTds.eq( 2 ).text( indexFormatted );
		    self.totalTds.eq( 3 ).text( DataUtil.addSpaces( total.SolvedSum ) );
		    self.totalTds.eq( 4 ).text( portion );

	    }
	    
		//get rid of rows for all 
		self.rows.remove();

		var htmlString = "";
		$.each( data.crimeTypesData, function( i, v ) {

			 var rowData = v;
			 htmlString += self.addNewRow( rowData );

		}	);

		self.typesTable.append( $( htmlString ) );

		self.rows = self.typesTable .find( "tr" );
		self.rows.on( "mouseover", function() { 
			$tr = $( this );
			$tr.addClass("active");
		}).on( "mouseout", function() {
			$tr = $( this );
			$tr.removeClass("active");
		});

		//init buttons
		self.buttons = self.element.find(".displayRankBtn");
		self.buttons.on( "click", function( evt ) {
			evt.preventDefault();
			self.displayRanking( this );
		});

		self.graphButtons = self.element.find(".displayGraphBtn");
		self.graphButtons.on( "click", function( evt ) {
			evt.preventDefault();
			self.displayGraph( this );
		});

		//update general
		if( data.Population ) self.generalTds.eq( 0 ).text( DataUtil.addSpaces( data.Population ) );
		if( data.Officers ) self.generalTds.eq( 1 ).text( DataUtil.addSpaces( data.Officers ) );
		if( data.Area ) self.generalTds.eq( 2 ).html( DataUtil.addSpaces( Math.round( data.Area ) + " km<sup>2</sup>" ) );
		if( data.total && data.total.Index ) self.generalTds.eq( 3 ).text( DataUtil.addSpaces( Math.round( data.total.Index*10 )/10 ) );

   	},

   	addNewRow: function( data ) {
		
   		data.index = Math.max( 0, data.Index );
		data.SolvedSum = Math.max( 0, data.SolvedSum );
		data.FoundSum = Math.max( 0, data.FoundSum );

		var crimeIndex = Math.round( data.Index * 10 ) / 10;
		var percent = Math.round( data.SolvedSum/data.FoundSum * 100 );
		var crimeName = ( appLanguage == "en") ? data.CrimeName_en : data.CrimeName ;

		var className = ( data.IsMainCategory ) ? "mainCategory" : "";

		//check for NaN
		if( isNaN( percent ) ) percent = "-";
		//check for infinity
		if( percent > 100*100 ) percent = "-";

		return '<tr data-crime-type="' + data.FK_Crime_Lookup + '" class="' + className + '"><td class="first">' + crimeName + '</td><td class="left">' + data.FoundSum + '</td><td class="right">' + crimeIndex + '</td><td class="left">'	+ data.SolvedSum + '</td><td class="right">' + percent + '</td><td class="displayRank"><a href="#" class="displayRankBtn" title="' +texts["Zobrazit žebříček"] + '"></a><a href="#" class="displayGraphBtn" title="' + texts["Zobrazit graf"] + '"></a></td></tr>';
	},

   	updateCustomCrime: function( crimeType, crimeName ) {
   		
   		this.cachedCustomCrime = crimeType;

   		this.customRow.attr( "data-crime-type", crimeType );
		var $title = this.customRow.find( ".first" );
		$title.html( crimeName );
   	
   	},

   	clearValues:function() {
   		var symbol = "-";
		this.element.find( "td.left" ).text( symbol );
		this.element.find( "td.right" ).text( symbol );
   	},

	hide: function() {
		
		if( this.rows && this.element && this.select ) {
			this.rows.removeClass("active");
			this.element.hide();
			this.select.hide();
			this.hidden = true;
		}
		
	},

	show: function() {
		this.element.show();
		this.select.show();
		this.hidden = false;

		//check for changed state of app - custom crime type
		/*if( Application.customCrime ) {
			
			if( Application.customCrime.type != this.cachedCustomCrimeType ) {

				this.cachedCustomCrimeType = Application.customCrime.type 
				this.updateCustomCrime( Application.customCrime.type, Application.customCrime.name );
			
			}
			
		}*/

		//check for changed state of app - selected unit and time
		if( Application.selectedUnit != this.cachedSelectedUnit 
			|| Application.timeFrom != this.cachedTimeFrom 
			|| Application.timeTo != this.cachedTimeTo ) {

			//need to update to changed unit or time
			if( Application.selectedUnit != -1 ) this.updateToArea( Application.selectedUnit );
		
		}
	}

}