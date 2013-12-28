var Porovnani = {

	MIN_TOP: 263,
	OFFSET: 100,

	inited:false,
	cachedFilters: "",

	element:null,
	inputs:null,
	tableRows:null,

	firstCol:null,
	secondCol:null,
	
	firstTable:null,
	firstSelectBox:null,
	firstRankStepper:null,
	
	secondTable:null,
	secondSelectBox:null,
	secondRankStepper:null,

	compareNotice:null,

	init:function(){

		var self = this;
		
		if( !self.inited ) {
			self.inited = true;
			
			self.element = $("#porovnaniPage");
			self.firstCol = self.element.find(".firstCol");
			self.secondCol = self.element.find(".secondCol");	
		
			self.element.find(".chosen-select").chosen( { no_results_text:texts["Nic nenalezeno pro: "] }); 
			//self.element.find(".chosen-select-deselect").chosen( { allow_single_deselect:true } );
			
			var	firstRank = $("#porovnaniPage .firstCol .rank"),
				secondRank = $("#porovnaniPage .secondCol .rank");

			self.firstSelectBox = new PorovnaniSelectBox( self.firstCol.find(".firstSelect"), { onChange: self.handleSelectChange } );
			self.secondSelectBox = new PorovnaniSelectBox( self.secondCol.find(".secondSelect"), { onChange: self.handleSelectChange } );
			
			self.firstRankStepper = new RankStepper( firstRank, self.firstSelectBox, { onChange: self.handleRankChange } );
			self.secondRankStepper = new RankStepper( secondRank, self.secondSelectBox, { onChange: self.handleRankChange } );

			self.closeBtn = self.element.find(".closeBtn");
			self.closeBtn.on( "click", function() {
				Navigator.switchToMapa();
			});

			//populate selectboxes rankstepper property
			self.firstSelectBox.rankStepper = self.firstRankStepper;
			self.secondSelectBox.rankStepper = self.secondRankStepper;

			self.firstTable = new PorovnaniTable( self.firstCol );
			self.secondTable = new PorovnaniTable( self.secondCol );

			self.tableRows = self.element.find("section.table table tr");
			self.tableRows.on( "mouseover" , function() {
				var $this = $(this),
					classes = $this.attr( "class" ).split(" ");
				var classRows = self.tableRows.filter( "." + classes[0] );
				classRows.addClass( "hover" );	
			} ).on( "mouseout" , function() {
				var $this = $(this),
					classes = $this.attr( "class" ).split(" ");
				var classRows = self.tableRows.filter( "." + classes[0] );
				classRows.removeClass( "hover" );
			} );

			self.compareNotice = self.element.find( ".compareNotice" );
			self.compareNotice.find( ".county" ).on( "click", function() {
				showCounty();
			});
			self.compareNotice.find( ".district" ).on( "click", function() {
				showDistrict();
			});
		}

		self.updateZoomLevel( Application.zoomLevel ) ;
		
		//check if porovnani was initialized 
		if( Application.selectedUnit > -1 ) {
			function firstComplete( data ) {
				Porovnani.updateArea( Application.selectedUnit, data );
	        }
			var firstData = DataProxy.getDataForArea( Application.selectedUnit, firstComplete, Application.filtersString );
		}

		if( Application.secondSelectedUnit > 0 ) {
			function secondComplete( data ) {
				Porovnani.updateSecondArea( Application.secondSelectedUnit, data );
	        }
			var secondData = DataProxy.getDataForArea( Application.secondSelectedUnit, secondComplete, Application.filtersString );
		}
		//else self.update();
		
		//update current switched filters
		var filters = FilterBox.getUncheckedFilters();
		$.each( filters, function( i,v ) {
			var className = v,
				classRows = self.tableRows.filter( "." + className );	
			classRows.hide();
		});

		if( Application.filters != this.cachedFilters ) {
			this.cachedFilters = Application.filters;
			this.toggleTableRowVisibility( this.cachedFilters );
		}

		self.firstTable.computeVisibleValues();
		self.secondTable.computeVisibleValues();

		if( Application.customCrime ) this.updateCustomCrime( Application.customCrime.type, Application.customCrime.name );

		self.updateLayout( true );

	},

   	updateZoomLevel:function( value ){

   		var self = this;
   		if( !self.secondCol ) return;

   		//populate select boxes
   		var data = DataProxy.getNamesAndIndexes( Application.zoomLevel );

   		if( value == 0) {
   			//switch right side of comparison
   			self.secondCol.hide();
   			self.compareNotice.show();
   		}
   		else {
   			self.secondCol.show();
   			self.compareNotice.hide();
   		}

   		self.firstSelectBox.updateValues( data );
   		self.secondSelectBox.updateValues( data );
   		   		
   		self.firstRankStepper.updateRange( 1, self.firstSelectBox.element.find("option").length - 1 );
   		self.secondRankStepper.updateRange( 1, self.secondSelectBox.element.find("option").length - 1 );

   		//update graphics for correct display of max values
   		self.firstTable.maxIndexValue = data.maxValue;
   		self.secondTable.maxIndexValue = data.maxValue;

   		self.firstTable.clearValues();
   		self.secondTable.clearValues();
   	}, 

	toggleTableRowVisibility:function( filters ){
		
		if( !this.tableRows ) return;

	   	//hide all rows first
   		this.tableRows.hide();

   		var len = filters.length;
   		for( var i = 0 ; i < len; i++ ) {
   			var filter = filters[ i ];
 			var classRows = this.tableRows.filter("[data-crime-type='" + filter + "']" );	
  			classRows.show();
   		}

		this.updateLayout();

		//update total values
		this.firstTable.computeVisibleValues();
		this.secondTable.computeVisibleValues();
	},

	updateLayout:function( jump ){
		
		var self = this,
			newTop = Application.screenHeight - self.firstCol.height() - self.OFFSET;
		
		//enforce minimum height
		newTop = Math.max( self.MIN_TOP, newTop );

		self.element.css("top", newTop );

		if( !jump && !self.element.hasClass("anim") ) {
			//enable animation
			self.element.addClass( "anim" );
		}
	},

	resize:function(){
		if( this.firstCol ) {
			this.updateLayout();
			this.firstTable.resize();
			this.secondTable.resize();
		} 
	},

	handleSelectChange: function( selectedId ) {
		if( this == Porovnani.firstSelectBox ) { 
			Application.updateSelectedUnit( selectedId );
			_gaq.push(["_trackEvent", "porovnaniFirstSelect", Application.currentKey() ]);
		} else {
			Application.updateSecondSelectedUnit( selectedId );
			_gaq.push(["_trackEvent", "porovnaniSecondSelect", Application.currentKey() ]);
		}
	},

	handleRankChange: function( selectedId ) {
		if( this == Porovnani.firstSelectBox ) { 
			Application.updateSelectedUnit( selectedId );
			_gaq.push(["_trackEvent", "porovnaniFirstRankStepper", Application.currentKey() ]);
		} else {
			Application.updateSecondSelectedUnit( selectedId );
			console.log( 'selectedId' );
			_gaq.push(["_trackEvent", "porovnaniSecondRankStepper", Application.currentKey() ]);
		}
	},

	updateArea:function( area, data ) {
		if( !this.inited ) return;

		//update first area
		this.firstTable.update( data );
		//make sure the selectbox is sync
		this.firstSelectBox.setValue( area );
	},

	updateSecondArea:function( area, data ) {
		if( !this.inited ) return;
		//update second area
		this.secondTable.update( data );
		//make sure the selectbox is sync
		this.secondSelectBox.setValue( area );
	},

	updatePeriodAndFilters: function( data, namesAndIndexes ) {

		console.log( "Porovnani updatePeriodAndFilters" );
		if( !this.inited ) return;

		//update maxvalue
		this.firstTable.maxIndexValue = namesAndIndexes.maxValue;
   		this.secondTable.maxIndexValue = namesAndIndexes.maxValue;

   		//update indexes in selected boxes
   		this.firstSelectBox.updateValues( namesAndIndexes, true );
   		this.secondSelectBox.updateValues( namesAndIndexes, true );

   		//update rank stepper to select box
   		this.firstRankStepper.setValue( this.firstSelectBox.getSelectedRank() );
   		this.secondRankStepper.setValue( this.secondSelectBox.getSelectedRank() );

   		//update data
   		this.firstTable.update( data ); 	

		//this.update( this.firstSelectBox );
		//this.update( this.secondSelectBox );

		//update rows
		this.toggleTableRowVisibility( Application.filters, true );

		//get data for second area
		if( Application.secondSelectedUnit > 0 ) { 
			function secondComplete( data ) {
				Porovnani.updateSecondArea( Application.secondSelectedUnit, data );
	        }
			
			var secondData = DataProxy.getDataForArea( Application.secondSelectedUnit, secondComplete, Application.filtersString );
		}
   },

   updateCustomCrime: function( crimeType, crimeName ) {
   		
   		if( this.firstTable ) this.firstTable.updateCustomCrime( crimeType, crimeName );
   		if( this.secondTable ) this.secondTable.updateCustomCrime( crimeType, crimeName );
   		
   		this.toggleTableRowVisibility( Application.filters, true );
   },

    isDisplayed: function() {
		var self = this;
			displayed = false;

		if( self.element && self.element.css("display") != "none") displayed = true;
		return displayed;
	}

}