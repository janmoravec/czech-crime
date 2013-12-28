var FilterBox = {
	selector: ".homepageFilterBox",
	content:null,
	firstClick:true,
	lis:null,
	customLi:null,
	customLiInput:null,
	hideBtn:null,
	forcedTurnedOff:null,
	inputs:null,
	element: null,
	data:null,
	origHeight:null,
	allChecked:true,
	oneChecked:false,
	activeType:null,
	collapsed:false,

	init: function(){                
                
		var self = this;
		self.element = $(self.selector);
		self.content = self.element.find( ".content" );

		self.data = DummyData;
		self.origHeight = self.element.find(".content").outerHeight();

		//bind events
		self.hideBtn = self.element.find(".hideBtn");
		self.hideBtn.on("click",function(){
			var $this = $(this);
			self.content.slideToggle( 300 );
			$this.toggleClass("hideBtnDown");
			$this.parent().toggleClass("noBorder");
			
			var contHeight = self.origHeight;
			var offset = $this.hasClass("hideBtnDown") ? contHeight : -contHeight;

			self.collapsed = ( offset > 0 ) ? true : false; 

			Homepage.updateLayout( offset, self );
		});

		self.lis = self.element.find( "li" );
		self.lis.on( "mouseover", self.onLiMouseover );
		self.lis.on( "mouseout", self.onLiMouseout );

		self.customLi = self.lis.filter( ".custom" );
		self.customLiInput = self.customLi.find( "input" );
		var customP = self.customLi.find( "p" );
		customP.on( "click", function() {
			CrimeTypesBox.toggleVisibility();
		});

		//store filters turned off due to collision, needs to have link to turn them on later on
		self.forcedTurnedOff = [];

		self.inputs = self.element.find("input");
		self.inputs.checkbox( {empty: 'images/empty.png' } );

		self.inputs.on("change", self.handleInput );
	},

	handleInput: function() {

		var self = FilterBox;
		
		//if "this" refers to FilterBox, them handle called from displayCustomCategory
		var clickedInput = ( this != FilterBox ) ? $( this ) : self.customLiInput;
		var clickedLi = clickedInput.parent();
		var clickedCrimeType = clickedLi.data( "crime-type" );
		var clickedInputChecked = clickedInput.attr( "checked" );

		//if custom filter has no selected crimetype, open crimetypesbox instead 
		if( clickedCrimeType == -1 ) {
			CrimeTypesBox.show();
			clickedInput.attr( "checked", false );
			return;
		}

		//disable all inputs if every type turned on
		var clickedInput = $( this );
		if( self.allChecked ) {

			//turn off all checkboxes
			$.each( self.inputs, function( i, v ){
				var input = $(v),
					inputCrimeType = input.parent().data( "crime-type" );
				if( clickedCrimeType != inputCrimeType ) {
				
					input.attr("checked",false);
				
				}
				else {
					
					input.attr("checked",true);
				
				}
			});
		} else if( self.oneChecked && !clickedInput.attr("checked") ) {
			//user turned off last filter, turn on all checkboxes
			$.each( self.inputs, function( i, v ) {

				var input = $(v),
					inputCrimeType = input.parent().data( "crime-type" );

				if( inputCrimeType != "-1" ) {
					input.attr( "checked", true );
					Porovnani.toggleTableRowVisibility( inputCrimeType, true);
				}
				
			});
		}

		_gaq.push(["_trackEvent", "filters", Application.currentKey() ]);
		
		//update filters
		Application.filters = new Array();
		var defaultChecked = 0;
		var numChecked = 0;
			
		$.each( self.inputs, function( i,v ) {
			
			var input = $(v),
				$li = input.parent(),
				crimeType = $li.data( "crime-type" ).toString();

			//check that it's not the clicked input
			if( crimeType != clickedCrimeType ) {

				if( clickedInputChecked ) {

					var collision = self.checkFilterCollision( crimeType.toString(), clickedCrimeType.toString() );
					
					if( collision ) {
						
						//take action only if filter turn on
						if( input.attr( "checked" ) ) {
							input.attr( "checked", false );
							//store crimetype as forcedly turned off so we can turn it on later
							self.forcedTurnedOff.push( crimeType );
						}
						
					} 
					//removed automatically turning on back forcedturned off cause it was messing things up
					/*else {

						var forcedIndex = $.inArray( crimeType, self.forcedTurnedOff );
						//check if it hasn't been previously stored 
						if( forcedIndex > -1 ) {
							self.forcedTurnedOff.splice( forcedIndex, 1 );
							input.attr( "checked", true );
						}

					}*/

				} else {

					var collision = self.checkFilterCollision( crimeType.toString(), clickedCrimeType.toString() );
					if( collision ) {
						//filter collides with the one that has been turned off
						//check if it has been forcedly turned of
						var forcedIndex = $.inArray( crimeType, self.forcedTurnedOff );
						if( forcedIndex > -1 ) {
							self.forcedTurnedOff.splice( forcedIndex, 1 );
							input.attr( "checked", true );
						}
					}
				}

			} 

			if( input.attr('checked') ){
                Application.filters.push( crimeType );
				input.parent().removeClass( "inactive" );
				//Porovnani.toggleTableRowVisibility( crimeType, true);
				
				//avoid adding custom crime type to computation
				if( !input.parent().hasClass( "custom" ) ) defaultChecked++;
				numChecked++;
			} else {
				input.parent().addClass( "inactive" );
				input.parent().removeClass( "active" );
				
				//Porovnani.toggleTableRowVisibility( crimeType, false);
			}
		});
	
		self.allChecked = ( defaultChecked == self.inputs.length-1 ) ? true : false;
		self.oneChecked = ( numChecked == 1 ) ? true : false;

		/*if( !self.allChecked ) {
			InfoBox.toggleNaNForDamage( true );
		} else {
			InfoBox.toggleNaNForDamage( false );
		}*/

		Application.updateFilters();
		//Porovnani.toggleTableRowVisibility( 
	},

	checkFilterCollision: function( crimeType1, crimeType2 ) {
		
		var collision = false;
		var compoundString = "101-106";

		//check for every default filter
		if( crimeType1 != compoundString && crimeType2 != compoundString ) {
			
			if( crimeType1.indexOf( crimeType2 ) >= 0 || crimeType2.indexOf( crimeType1 ) >= 0 ) {
				//need to turn this filter off as it overlaps with custom one 
				collision = true;
			}	

		} else {
			
			//special check for "101-106"
			var compoundType = ( crimeType1 == compoundString ) ? crimeType1 : crimeType2;
			var notCompoundType = ( crimeType1 == compoundType ) ? crimeType2 : crimeType1;
			var typesArr = compoundType.split( "-" );
			var lowBound = parseInt( typesArr[0] );
			var highBound = parseInt( typesArr[1] );
			var customInt = parseInt( notCompoundType );

			//is code within boundaries
			if( customInt >= lowBound && customInt <= highBound ) {
				collision = true;
			}

		}

		return collision;
	},

	update: function( data ){
		var self = this,
			filterBoxData = data.filterBoxCrimes;

		/*$.each( self.inputs, function( i, v){
			var $input = $(v),
				$span = $(v).parent().find("span.val"),
				attrName = $input.attr("name");

			if( $input.attr('checked') ) {
				data.graph.data[ attrName ] = data.filterData[ attrName ];
			} 

			$span.text( addSpaces( branchData[ attrName ].com.val ) );
		});*/
		
		if( filterBoxData ) {
			$.each( self.lis, function( i, v ){
				var $li = $(v);
					$span = $li.find("span.val"),
					crimeType = $li.data("crime-type");

				//check if not unselected custom filter
				if( crimeType != -1 ) {
					
					if( filterBoxData.hasOwnProperty( crimeType ) ) {
						var crimeTypeData = filterBoxData[ crimeType ];
						self.updateSpan( $span, crimeTypeData[ "FoundSum" ] );
					} else {
						//crime type not available for selected area
						self.updateSpan( $span, 0 );
					}
				}
				
			});
		}

        if( MapDetailOverlay.isDisplayed() ) MapDetailOverlay.display( data );
	},

	updateSpan: function( $span, data ) {
		if( $span ) {
			$span.text( DataUtil.addSpaces( Math.max( 0, data ) ) );

			//check if not custom filter we need to get rid of arrow because has value
			if( $span.hasClass( "with-back" ) ) {
				$span.removeClass( "with-back" );
			}
		}
	},

	slideUp:function( height ){
		var self = this;
		self.element.css("top","-=" + height);
	},

	getUncheckedFilters: function(){

		var self = this,
			filters = [];

		$.each( self.inputs, function( i, v) {
			var input = $( v );
			if( !input.attr('checked') ) filters.push( input.attr('name') );
		});

		return filters;
	},

	switchToPorovnani: function() {
		Navigator.boxWrapper.show();
		Navigator.boxWrapper.removeClass( "trend-box-wrapper" );
		
		this.element.show();
		this.element.addClass('porovnaniFilterBox');
		this.element.removeClass('trendFilterBox');

		this.toggleHideBtn( false );

		setTimeout( function() {
			Homepage.resizeScrollbar();
		}, 250 );
	},

	switchToMapa: function() {
		Navigator.boxWrapper.removeClass( "trend-box-wrapper" );
		Navigator.boxWrapper.show();
		
		this.element.show();
		this.element.removeClass('porovnaniFilterBox');
		this.element.removeClass('trendFilterBox');

		this.toggleHideBtn( true );
		
		setTimeout( function() {
			Homepage.resizeScrollbar();
		}, 50 );
	},

	switchToTabulky: function() {
		Navigator.boxWrapper.removeClass( "trend-box-wrapper" );
		Navigator.boxWrapper.hide();
		
		this.element.hide();
		this.element.removeClass('removeFilterBox');
	},

	switchToTrend: function() {

		Navigator.boxWrapper.show();
		Navigator.boxWrapper.addClass( "trend-box-wrapper" );

		this.element.show();
		this.element.removeClass('porovnaniFilterBox');
		this.element.addClass('trendFilterBox');

		this.toggleHideBtn( false );
		setTimeout( function() {
			Homepage.resizeScrollbar();
		}, 50 );
	},

	updateZoomLevel: function( level ) {
		//log("filterbox update zoomlevel");
		this.clearValues();
	},

	clearValues: function() {
		//insert hypnes instead of crime values
		var symbol = "-";
		this.element.find( "span.val" ).text( symbol );
	},

	highlightType: function( type ) {
		this.activeType = this.lis.filter( "[data-crime-type='" + type + "']" );
		this.activeType.addClass( "active" );
	},

	dehighlightType: function( type ) {
		if( this.activeType ) {
			this.activeType.removeClass( "active" );
		}	
	},

	onLiMouseover: function() {
		var $li = $( this );
		
		//is li active
		if( $li.hasClass( "inactive" ) ) {
			return;
		}

		//make sure everything is dehighlightes
		FilterBox.lis.removeClass( "active" );

		$li.addClass( "active" );
		
		var crimeType = $li.data( "crimeType" );
		Trend.highlightType( crimeType );
	},

	onLiMouseout: function() {
		var $li = $( this );
		
		//is li active
		if( $li.hasClass( "inactive" ) ) {
			return;
		}

		if( !Trend.singleTypeMode || !Trend.singleTypeModeEnabled ) {
			$li.removeClass( "active" );
			var crimeType = $li.data( "crimeType" );
			Trend.dehighlightType( crimeType );
		}
		
	},

	enableForTrend: function() {
		this.lis.on( "mouseover", self.onLiMouseover );
		this.lis.on( "mouseout", self.onLiMouseout );
	},

	disableForTrend: function() {
		this.lis.off( "mouseover", this.onLiMouseover );
		this.lis.off( "mouseout", this.onLiMouseout );
	},

	updateCustomCrime: function( code, name ) {

		this.customLi.data( "crime-type", code );
		var $p = this.customLi.find( "p" );
		$p.text( DataUtil.shortenText( name, "...", 35 ) );

		//turn on newly selected crimetype
		if( !this.customLiInput.attr( "checked" ) ) {
			this.customLiInput.attr( "checked", true )
		}

		//trigger update - get correct argument
		var input = this.customLi.find( "input" ).get(0);
		this.handleInput.apply( input );
		//this.handleInput();
	},

	toggleHideBtn:function( visible ) {

		if( visible ) this.hideBtn.show();
		else this.hideBtn.hide();

	}
}