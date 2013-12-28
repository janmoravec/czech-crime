var Trend = {
	
	hidden: true,
	inited: false,
	selectBox: null,

	cachedFilterString: "",
	cachedTimeFrom: -1,
	cachedTimeTo: -1,
	cachedSelectedUnit: -1,

	init: function() {
		
		if( this.inited ) return;
		this.inited = true;

		//check for old browsers
		if( !Modernizr.svg ) {
			return;
		}

		this.updateSize();

		this.$element = $( ".trend" );
		this.$chooseAreaNotice = this.$element.find( ".trend-notice" );
		this.$legendY = this.$element.find( ".legendY" );
		this.$legendX = this.$element.find( ".legendX" );
		this.$graphPopup = this.$element.find( ".graphPopup" );
		
		//store paths by crimetype as key to retrieve when highlighting from filterbox
		this.paths = [];

		//padding for x and y tick values
		var padding = 50;
		this.vis = d3.select( "#svgHolder" )
				.append( "svg:svg" )
				.attr( "width", this.canvasWidth + padding )
				.attr( "height", this.canvasHeight + padding );
		
		this.$svg = this.$element.find( "svg" );
		
		//popups div
		TrendGraphPopups.init( this.$element.find( ".popups" ) );
	
		var $tabulkyPage = $( "#tabulkyPage" );//, $section = $tabulkyPage.find( ".unitsSelect" );
		this.$select = $tabulkyPage.find(".unitsSelect");

		//setup contrained so solved are always max 
		this.constraint = true;
	},

	updateToArea: function( area ) {

		//re-cache data
		this.cachedSelectedUnit = area;
		this.cachedTimeFrom = timeFrom;
		this.cachedTimeTo = timeTo;
		this.cachedFilterString = Application.filtersString();

		if( this.selectBox ) this.selectBox.setValue( area );

		this.area = area;
		this.updateData();
	},

	updatePeriod: function( ) {
		//empty the dates
		this.dates = [];
		this.updateData();
	},

	updateFilters: function() {
		this.updateData();
	},

	updateZoomLevel: function( data ) {
	
		//this.updateData();
		this.selectBox.updateValues( data );
		this.rankStepper.updateRange( 1, this.selectBox.element.find("option").length - 1 );
		
		this.clearGraph();
		if( this.$chooseAreaNotice ) {
			this.$chooseAreaNotice.show();
			
			var noticeText = "";
			switch( Application.zoomLevel ) {
				case 1:
					noticeText = texts["Pro zobrazení grafu vyber kraj."];
					break;
				case 2:
					noticeText = texts["Pro zobrazení grafu vyber územní odbor."];
					break;
				case 3:
					noticeText = texts["Pro zobrazení grafu vyber obvodní oddělení."];
					break;
			}

			this.$chooseAreaNotice.text( noticeText );
			
		}

		if( Application.zoomLevel == 0 ) {
			this.rankStepper.setValue( "1" );
		}
	},

	updateData: function() {
		if( Application.selectedUnit > -1 ) { 
			DataProxy.getGraphData( Application.selectedUnit, $.proxy( this.doUpdate, this ) );
		}
	},

	doUpdate: function( data ) {

		//console.log( "doUpdate", data );
		
		//check for old browsers
		if( !Modernizr.svg ) {
			return;
		}
		
		var that = this;

		//padding so that upper y axis labels won't get cut off
		var padding = 20;

		var isDisplayingGraph = ( Application.selectedUnit > -1 ) ? true : false;

		if( isDisplayingGraph ) {
			//remove notice of need to select data
			this.$chooseAreaNotice.hide();
		} else {
			//position notice to middle of graph
			var topOffset = 150, 
				leftOffset = 35,
				chooseAreaNoticeWidth = 254;
			this.$chooseAreaNotice.css( { top : that.canvasHeight / 2 + topOffset, left : ( that.canvasWidth / 2 ) - ( chooseAreaNoticeWidth / 2 ) + leftOffset } );
		}

		//remove old data
		this.clearGraph();

		//parse everthing into array with crime types as keys
		var len = data.length, singleData,
		crimeType, crimeArr, maxValue = 0, minValue = 0, 
		maxDate, minDate, xValues, yValues;

		this.totalCircles = [];
		this.solvCircles = [];
		this.crimes = [];
		this.dates;
		
		var typeLen = data.length;
		this.crimes = data.crimes;
		this.periodLen = data.periodLen;
		minValue = data.minValue;
		maxValue = data.maxValue;

		//var typeLen = 0;

		/*for( var i = 0; i < len; i++ ) {
			singleData = data[ i ];	
			crimeType = singleData[ "FK_Crime_Lookup" ];
			
			if( !this.crimes[ crimeType ] ) {
				this.crimes[ crimeType ] = [];
				typeLen++;
			}
			this.crimes[ crimeType ].push( singleData );

			//if actually selected unit
			if( Application.selectedUnit > -1 ) {
				//constraint data
				singleData[ "Found" ] = Math.max( singleData[ "Found" ], 0 );
				if( this.constraint ) {
					singleData[ "Solved" ] = Math.min( singleData[ "Solved" ], singleData[ "Found" ] );
				}
				
				//get minimum and maximum value in set
				var sum = singleData[ "Found" ];
				minValue = Math.min( minValue, sum );
				maxValue = Math.max( maxValue, sum );
			}
		}*/

		//TODO - make better selection of crimes
		//this.periodLen = this.crimes[ crimeType ].length - 1;

		var	y = d3.scale.linear().domain( [ 0, maxValue ] ).range( [ this.canvasHeight, 0 ] ),
			x = d3.scale.linear().domain( [ 0, this.periodLen ] ).range( [ 0, this.canvasWidth ] );

		//create y-axis
		var tickDiff =  y.domain()[1] - y.domain()[0];
		var numTicks = 3;
		var ticksGap = tickDiff / numTicks;
		var tickValue = 0;
		var tickValues = [];
		for( var i = 0; i <= numTicks; i++ ) {
			tickValues.push( tickValue );
			tickValue += ticksGap;
		}

		var graphWrapper = this.vis.append( "g" ).attr( "class", "graphWrapper" );
		graphWrapper.attr( "transform", "translate( 0," + padding + ")");

		var yAxis = d3.svg.axis().scale( y ).tickValues( tickValues ).orient( "right" );
		//right axis with labels
		var yRightAxisGroup = graphWrapper.append( "g" ).attr( "class", "axis" )
													.call( yAxis.tickSize( 0 ) )
													.attr( "transform", "translate(" + this.canvasWidth + ", 0)");
		//left axis without labels
		var yLeftAxisGroup = graphWrapper.append( "g" ).attr( "class", "axis" ).call( yAxis.tickSize( 0 ).tickFormat("") );
		
		//grid
		var xGridAxisScale = d3.svg.axis().scale( x ).tickFormat( "" );
		var xGridAxis = graphWrapper.append( "g" ).attr( "class", "grid" ).call( xGridAxisScale.tickSize( this.canvasHeight ) );
		var g = graphWrapper.append( "g" ).attr( "class", "graph" );
		
		var line = d3.svg.line()
			.x( function( d,i ) { return x(i); } )
			.y( function( d ) { return y( d[ "Found"] ); } );

		for( var key in this.crimes ) {

			var crimesData = this.crimes[ key ];
			if( Application.selectedUnit > -1 ) {
				var pathG = g.append( "svg:g" );

				var height = 500;
				var area = d3.svg.area()
					.x( function( d,i ) { return x(i); } )
					.y0( that.canvasHeight )
			    	.y1( function( d ) { return y( d[ "Found" ] ); });
				
			    var areaSolv = d3.svg.area()
			    	.x( function( d,i ) { return x(i); } )
					.y0( that.canvasHeight )
			    	.y1( function( d ) { return y( d[ "Solved" ] ); });

			    //total circles
			    pathG.selectAll( "table" ).data( crimesData )
					.enter().append( "svg:circle" )
					.attr( "class", "circle-total" )
					.attr( "stroke", "black" )
					.attr( "fill", function( d, i ) { return "black"; } )
					.attr( "cx", function( d,i ) { return x(i); } )
					.attr( "cy", function( d,i ) { return y( d["Found"] ); } )
					.attr( "r", function( d,i ) { return 0; } );
				
				//solved circles
				pathG.selectAll( "table" ).data( crimesData )
					.enter().append( "svg:circle" )
					.attr( "class", "circle-solv" )
					.attr( "stroke", "black" )
					.attr( "fill", function( d, i ) { return "black"; } )
					.attr( "cx", function( d,i ) { return x(i); } )
					.attr( "cy", function( d,i ) { return y( d[ "Solved" ] ); } )
					.attr( "r", function( d,i ) { return 0; } );

				//store all data
				var totalCircles = pathG.selectAll( "circle.circle-total" );
				this.totalCircles[ key ] = totalCircles;
				var solvCircles = pathG.selectAll( "circle.circle-solv" );
				this.solvCircles[ key ] = solvCircles;

				var colors = DataUtil.getColorForCrimeType( key );
				
				pathG.append( "path" )
			    	.datum( crimesData )
			    	.attr( "class", "area" )
			    	.attr( "d", area )
			    	.style( { "fill": colors[0] } );

			    pathG.append( "path" )
			    	.datum( crimesData )
			    	.attr( "class", "area-solv" )
			    	.attr( "d", areaSolv )
			    	.style( { "fill": colors[1] } );

				pathG.append( "svg:path" )
					.attr( "d", line( crimesData ) )
					.attr( "class", "stroke" );
					
				pathG.append( "svg:path" )
					.attr( "d", line( crimesData ) )
					.attr( "class", "buffer" )
					.attr( "circles", totalCircles )
					.on( "mousemove", that.mousemove )
					.attr( "crime-type", key )
					.on( "mouseover", that.mouseover )
					.on( "mouseout", that.mouseout );

				//pathG.attr( "class", "crimeType-" + key );
				pathG.style( { "stroke": colors[0] } );

				this.paths[ key ] = pathG;
			}

			if( !this.dates || this.dates.length == 0) {
				//store dates
				this.dates = [];
				for( var i = 0; i < crimesData.length; i++ ) {
					var key = crimesData[i]["Month"] + "-" + crimesData[i]["Year"];
					this.dates.push( key );
				}
			}
		}
		
		//create x-axis after this.dates is populated
		var xAxis = d3.svg.axis().scale( x ).tickValues( x.domain() ).tickFormat( Trend.parseDateText );

		//grid
		var xAxisGroup = graphWrapper.append( "g" ).attr( "class", "axis x-axis" ).call( xAxis ).attr( "transform", "translate( 0," + this.canvasHeight + ")");
		
		//change text-anchors of labels
		var $xAxisTextLabels = this.$element.find( ".x-axis" ).find( "text" );
		$xAxisTextLabels.eq( 0 ).css( "text-anchor", "start" );
		$xAxisTextLabels.eq( 1 ).css( "text-anchor", "end" );
	},

	mousemove: function( d, i ) {
		
		var that = Trend;

		var path = d3.select( this );
		var mouse = d3.mouse( this );
		
		var crimeType = path.attr( "crime-type" );
		var crimeData = that.crimes[ crimeType ];
		
		var proportion = mouse[0] / that.canvasWidth;
		var dataIndex = Math.round( proportion * that.periodLen );
		var data = crimeData[ dataIndex ];

		//get node circle for given index
		var totalCircles = that.totalCircles[ crimeType ][0];
		var selectedTotalCircle = totalCircles[ dataIndex ];
		var solvCircles = that.solvCircles[ crimeType ][0];
		var selectedSolvCircle = solvCircles[ dataIndex ];

		var localPoint = [ selectedTotalCircle.getAttribute( "cx" ), selectedTotalCircle.getAttribute( "cy" ) ];
		var valuePoint = that.canvasToGlobal( localPoint );
		localPoint = [ selectedSolvCircle.getAttribute( "cx" ), selectedSolvCircle.getAttribute( "cy" ) ];
		var valueSolvPoint = that.canvasToGlobal( localPoint );
		localPoint = [ selectedSolvCircle.getAttribute( "cx" ), that.canvasHeight ];
		var datePoint = that.canvasToGlobal( localPoint );
		
		TrendGraphPopups.appear( data[ "Found" ], data[ "Solved" ], that.dates[ dataIndex ], valuePoint, valueSolvPoint, datePoint );
	
	},

	mouseover: function( d ) {
	
		d3.select( this.parentNode ).classed( "hover", true );
		
		//put line on top of else
		var g = this.parentNode;
		var graph = g.parentNode;
		graph.appendChild( g );

		FilterBox.highlightType( d3.select( this ).attr( "crime-type" ) );
	},

	mouseout: function( d, i ) {
		d3.select( this.parentNode ).classed( "hover", false );
		FilterBox.dehighlightType( d3.select( this ).attr( "crime-type" ) );
	
		TrendGraphPopups.hide();
	},

	canvasToGlobal : function( point ) {
		//get padding of svg element
		var topOffset = 157;
		var leftOffset = 35;

		return [ topOffset + parseInt( point[1] ),  leftOffset + parseInt( point[0] ) ];
		//return [ parseInt( offset.top ) + parseInt( point[1] ), parseInt( offset.left ) + parseInt( point[0] ) ];
		//return [ parseInt( offset.top ) + parseInt( point[1] ), parseInt( offset.left ) + parseInt( point[0] ) ];
		//return [ parseInt( offset.top ) + parseInt( point[1] ) - 36, parseInt( offset.left ) + parseInt( point[0] ) + 5 ];
	},

	selectChangeHandler: function() {
		console.log( "selectChangeHandler" );
	},

	handleRankChange:function( selectedId ) {
		//update app-wise data
		Application.updateSelectedUnit( selectedId );
        //_gaq.push(["_trackEvent", "handleRankChangeTypesTable", Application.currentKey() ]);
	},

	show: function() {

		if( !this.inited ) this.init();

		this.$element.show();
		this.$select.show();

		FilterBox.enableForTrend();
		CrimeTypesBox.element.addClass( "trendCrimeType" );
		this.hidden = false;

		//check for changed state of app - selected unit and time
		if( Application.selectedUnit != this.cachedSelectedUnit 
			|| Application.timeFrom != this.cachedTimeFrom 
			|| Application.timeTo != this.cachedTimeTo
			|| Application.filtersString() != this.cachedFilterString ) {

			//need to update to changed unit or time
			if( Application.selectedUnit != -1 ) this.updateToArea( Application.selectedUnit );
			else {
				//remove old data
				this.clearGraph();
				if( this.$chooseAreaNotice ) this.$chooseAreaNotice.show();
			}
		}
	
	},

	hide: function() {

		if( this.$element && this.$select ) {

			this.$element.hide();
			this.$select.hide();

			FilterBox.disableForTrend();
			CrimeTypesBox.element.removeClass( "trendCrimeType" );
			this.hidden = true;
		
		}
		
	},

	parseDateText: function( dateIndex ) {
		var delim = "-";
		var date = Trend.dates[ dateIndex ];
		var arr = date.split( delim );
		var monthIndex = parseInt( arr[ 0 ] );
		var month = DataUtil.getMonthFromIndex( monthIndex );
		var year = parseInt( arr[ 1 ] );
		
		var finalText = month + " " + year;
		return finalText;
	},

	highlightType: function( type ) {
		if( this.paths && this.paths[ type ] &&  this.paths[ type ][ 0 ] &&  this.paths[ type ][ 0 ][ 0 ] ) {
			var g = this.paths[ type ][ 0 ][ 0 ];
			if( g ) {
				var path = g.getElementsByTagName( "path" )[ 0 ].parentNode;
				var oldClass = path.getAttribute( "class" ); 
				path.setAttribute( "class", oldClass + " hover" );

				//var g = this.parentNode;
				var graph = path.parentNode;
				graph.appendChild( g );
			}
		}
	},

	dehighlightType: function( type ) {
		if( this.paths && this.paths[ type ] &&  this.paths[ type ][ 0 ] &&  this.paths[ type ][ 0 ][ 0 ] ) {
			var g = this.paths[ type ][ 0 ][ 0 ];
			if( g ) {
				var path = g.getElementsByTagName( "path" )[ 0 ].parentNode;
				var classesString = path.getAttribute( "class" );
				if( classesString ) {
					var arrClasses = classesString.split( " " );
					if( arrClasses ) path.setAttribute( "class", arrClasses[ 0 ] );
				}
			}
		}
	},

	updateSize: function() {
		this.canvasWidth = Application.screenWidth * .7;
		this.canvasHeight = Application.screenHeight * .5;
	},

	clearGraph: function( ){
		if( this.vis ) this.vis.selectAll( "g" ).remove();
	},

	resize: function() {
		//if inited
		if( this.$element ) {
			//recreate graph
			this.updateSize();
			this.updateData();
		}
	}

}

function getURLParameter(name) {
    return decodeURIComponent(
        (location.search.match(RegExp("[?|&]"+name+'=(.+?)(&|$)'))||[,null])[1]
    );  
}

function getHash() {
  var hash = window.location.hash;
  return hash.substring(1); // remove #
}