var Timeline = {
	
	dummyData: {title:"title",content:"content"},
	
	element: null,
	lis:null,
	dataView: null,
	data: null,
	range: null,
	leftArrow: null,
	rightArrow: null,
	detailBox:null,
	widthForBar:null,

	//save dates for resize purposes
	firstDate: null,
	secondDate: null,

	init: function(){
		
		var self = this;
		self.element = $( ".homepageTimeline" );
		self.dataView = self.element.find( ".dataView" );
		self.leftArrow = self.element.find( ".leftArrow" );
		self.rightArrow = self.element.find( ".rightArrow" );
		
		//bind events
		self.leftArrow.on( "click", function(){ self.handleArrows( "forward") } );
		self.rightArrow.on( "click", function(){ self.handleArrows( "backward" ) } );
       	
        data = DataProxy.getTimeline();
        self.update( data );

		self.detailBox = $("<div class='detailBox'><div class='content'><h2>jmeno</h2><p>test</p></div><div class='bottom'></div></div>");
		self.element.append( self.detailBox );

		var rightBound = self.dataView.find(".data").width() - self.leftArrow.width() - self.rightArrow.width() + 5;
		TimelineActiveArea.init( 20, self.leftArrow.width(), rightBound );

		$( window ).on( "resize", self.resize );

		self.element.on( "mouseover", TimelineActiveArea.show ).on( "mouseout", TimelineActiveArea.hide );
    
		self.dataView.show();
    },

	update: function( data ){
		
		//console.log( "timeline update", data );

		var self = this; 
		self.data = data;

		//remove all previous children
		var olContainer = self.dataView.find("ol").empty();

		//get data range
		var range = self.getRange( self.data, "FoundSum" ),
			rangeDiff = range[1] - range[0],
			minHeight = 25,
			//temp smaller difference
			//minHeight = 12,
			maxHeight = 35,
			heightDiff = maxHeight - minHeight,
			len = data.length;
         
        //put dummy function for ie
        var heightScale;
        if( typeof d3 != "undefined" ) heightScale = d3.scale.linear().domain( [ range[0], range[1]] ).range( [minHeight, maxHeight] );
        else heightScale = function() { return 1; }

		var widthAvailable = self.getAvailableWidth();
		
		$.each( data, function( i, v){
			
			var dateStringInLang = self.convertMonthsToLanguage( v.Date );
			v.date = dateStringInLang;

			var $bar = $( "<li data-time-lookup='" + v.FK_Time_Lookup + "'><div class='fill'></div><div class='value'></div></li>" );
			var $valueBar = $bar.find( ".value" );
			var $fillBar = $bar.find( ".fill" );

			self.dataView.find("ol").append( $bar );
			
			var height = minHeight,
				data = v.FoundSum,
				dataAboveMin = data - range[0],
				portionAboveMin = dataAboveMin/rangeDiff;
			
			height += portionAboveMin * heightDiff;
			var valueBarHeight = maxHeight - heightScale( v.FoundSum );
			$valueBar.css( { height:height } );
			$fillBar.css( { height:valueBarHeight } );
			
			$bar.css( { marginTop: 0 } );

			$bar.data( "values", v );
			$bar.on("mouseover", self.displayBox ).on("mouseout", self.hideBox ).on( "click", self.chooseSingleMonth );
		});

		self.lis = self.dataView.find("li");
		self.sizeBarsToWidth( widthAvailable );
	},

	setDates: function( timeFrom, timeTo ){
		//console.log( "setDates", timeFrom, timeTo );

		var self = this,
			startLeft = 100*100*100,
			endRight = 0,
			position;

		//cache dates for resize purposes
		self.timeFrom = timeFrom;
		self.timeTo = timeTo;

		self.lis.removeClass("active");

		//update all values
		$.each( self.lis, function(i,v){
			var $li = $(v),
				values = $li.data("values");
			
			position = $li.position().left;

			if( !values ) return;
						
			var timeLookup = values[ "FK_Time_Lookup" ];
			if( timeLookup >= timeFrom && timeLookup <= timeTo ) {
				$li.addClass("active");

				//store begin of active area
				startLeft = Math.min( position, startLeft);
				endRight = Math.max( position + $li.width(), endRight );
			} else {
				$li.removeClass("active");
			}

		});

		//need to add width of left arrow
		startLeft += self.leftArrow.width();
		endRight += self.leftArrow.width();
		TimelineActiveArea.update( startLeft, endRight - startLeft );
	},
	
	chooseSingleMonth: function( ) { 
		var $li = $( this ),
			values = $li.data( "values" ),
			timeLookup = values[ "FK_Time_Lookup" ];
		
		DateModel.setDate( timeLookup, timeLookup );
	},

	handleArrows: function( dir ){
		
		var self = this;
		if( dir == "forward" )
		{
		
		}
		else if( dir == "backward" )
		{
		
		}
	},

	displayBox:function( evt, dragging){
		var self = Timeline,
			$li = $( evt.target ).parent();

		//check if have proper target
		if( $li.prop( "tagName" ) != "LI" ) $li = $( evt.target ).parent();
		
		var	data = $li.data( "values" );
		if( data == null ) return;

		self.detailBox.show();
		self.detailBox.find("h2").text( data.date );
		self.detailBox.find("p").text( DataUtil.addSpaces(data.FoundSum) + texts[" trestných činů"] );

		if( !dragging )
		{
			//highlight
			$li.addClass( "highlight" );

			if(!$li.hasClass("active")) self.detailBox.find(".content").addClass("inactive");
			else self.detailBox.find(".content").removeClass("inactive");
		}
		else
		{
			self.detailBox.find(".content").removeClass("inactive");
		}

		//position correctly
		var liOffset = $li.offset();
		var elOffset = self.element.offset();
		self.detailBox.css( { top: elOffset.top - 146, left:liOffset.left - 45 + Timeline.widthForBar/2} );
	},

	displayBoxWhileDragging:function( x ){
		var self = this,
			len = self.lis.length,
			offset = self.dataView.offset();

		for( var i = 0; i < len; i++) {
			var $li = $( self.lis[i] ),
				left = $li.offset().left - offset.left + $li.width();
			if( left > x ){
				self.displayBox( { target: $li.find("div").eq(0) }, true );
				break;
			} 
		}
	},

	hideBox:function( evt ){
		var self = Timeline,
			$li = $( evt.target ).parent();
		
		$li.removeClass("highlight");
		self.detailBox.hide();
	},

	getRange:function( array, sortOn ){
		var min = 100*100*100,
			max = 0;

		$.each( array, function(i,v){
			var value = v[sortOn];
			
			min = Math.min( min, value);
			max = Math.max( max, value);
		});

		return [min,max];
	},

	sliderMoved:function( leftValue, width, dir ){
		
		var self = this,
			len = self.lis.length,
			firstDate, secondDate;
		
		//hide dragging box
		self.detailBox.hide();

		for( var i = 0; i < len; i++)
		{
			var $li = self.lis.eq(i),
				values = $li.data("values"),
				timeLookup = values[ "FK_Time_Lookup" ];
				/*values = $li.data("values"),
				date = values.date,
				arr = date.split(" ");*/
			
			position = $li.position().left + self.leftArrow.width() + Timeline.widthForBar/2;
			
			if( dir == "left"){
				if( position >= leftValue && !firstDate){
					//firstDate = { month:arr[0], year:arr[1] };
					DateModel.setDate( timeLookup );
					return;
				} 
			}
			else if( dir == "right" ) {
				if( position >= ( leftValue + width - $li.width() ) || i == len  - 1) {
					/*var date = values.date,
						arr = date.split(" ");
					secondDate = { month:arr[0], year:arr[1] };*/
					DateModel.setDate( null, timeLookup );
					return;
				}
			}
		}	
	},

	compareDates:function( firstDate, secondDate ){

		var result = 0;

		//compare years
		if( firstDate.year > secondDate.year ) result = 1;
		else if( firstDate.year < secondDate.year)  result = -1;
		else{
			//same year, need to compare months
			if( firstDate.month > secondDate.month ) result = 1;
			else if( firstDate.month < secondDate.month )  result = -1;
		}

		//log( "compareDates: " + firstDate.month + "." + firstDate.year + ", " + secondDate.month + "." + secondDate.year + "," + result );

		return result;
	},

	getIndexForMonth:function( month ){
		var index = -1;

		switch( month ){
			case texts["Leden"]:
				index = 0;
				break;
			case texts["Únor"]:
				index = 1;
				break;
			case texts["Březen"]:
				index = 2;
				break;
			case texts["Duben"]:
				index = 3;
				break;
			case texts["Květen"]:
				index = 4;
				break;
			case texts["Červen"]:
				index = 5;
				break;
			case texts["Červenec"]:
				index = 6;
				break;
			case texts["Srpen"]:
				index = 7;
				break;
			case texts["Září"]:
				index = 8;
				break;
			case texts["Říjen"]:
				index = 9;
				break;
			case texts["Listopad"]:
				index = 10;
				break;
	       	case texts["Prosinec"]:
	       		index = 11;
	       		break;
		}

		return index;
	},

	convertMonthsToLanguage: function( dateString ) {

		var arr = dateString.split( " " );
		var month = arr[0];
		var monthInLang = texts[month];

		return monthInLang + " "  + arr[1];

	},

	getAvailableWidth:function(){
		//compute width available for dataview
		var self = this,
			screenWidth = parseInt( $( document ).width() ),
			left = parseInt( self.dataView.css( "left" ) ),
			right = parseInt( self.dataView.css( "right" ) );

		return screenWidth - left - right - self.leftArrow.width() - self.rightArrow.width();
	},

	sizeBarsToWidth:function( widthAvailable ){
		var self = this,
			barMargin = 2,
			len = self.lis.length;

		self.widthForBar = Math.floor( ( widthAvailable/len ) - 2 ); 
		
		$.each( self.lis, function( i, v){
			$(v).css( { width: self.widthForBar } );
		})
	},

	resize: function() {
		var self = Timeline;
		self.sizeBarsToWidth( self.getAvailableWidth() );
		
		//position handlers
		self.setDates( self.timeFrom, self.timeTo );
	}



}