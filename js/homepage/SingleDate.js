function SingleDate( element, dateChangeCallback ) {

	var self = this;
	this.element = element;
	this.dateChangeCallback = dateChangeCallback;
	this.months = this.element.find( ".month li" );
	this.years = this.element.find( ".year li" );

	this.years.on( "click", function() {
		self.onYearClick( this )
	} );
	this.months.on( "click", function() {
		self.onMonthClick( this )
	} );

	var lis = this.element.find( "li" );
	lis.on( "mouseover", this.onLiMouseOver )
	   .on( "mouseout", this.onLiMouseOut )
	   
}

SingleDate.prototype = {

	setDate: function( timeLookup ) {

		//find year
		var yearTime = timeLookup - ( timeLookup % 12 );
		var selectedYear = this.years.filter( "[data-time-lookup=" + yearTime + "]" );
		this.updateMonthsToYear( yearTime );
		
		var selectedMonth = this.months.filter( "[data-time-lookup=" + timeLookup + "]" );
		
		//remove old ones
		this.months.removeClass( "selected" );
		this.years.removeClass( "selected" );
		//update new one
		selectedMonth.addClass( "selected" );
		selectedYear.addClass( "selected" );

	},

	updateMonthsToYear: function( timeLookup ) {

		$.each( this.months, function( i,v ) {

			var $this = $( this );
			$this.attr( "data-time-lookup", timeLookup );
			
			//update unavailable
			if( timeLookup < minTime || timeLookup > maxTime ) {
				$this.addClass( "unavailable" );
			} else {
				$this.removeClass( "unavailable" );
			}

			timeLookup++;

		} );

	},

	onYearClick: function( clickedEl ) {

		var $li = $( clickedEl  );
		var date = $li.attr( "data-time-lookup" );
		this.updateMonthsToYear( date );

		var selectedMonth = this.months.filter( ".selected" );
		var monthDate = parseInt( selectedMonth.attr( "data-time-lookup" ) );
		//check if selected month is available
		if( monthDate < minTime ) monthDate = minTime;
		if( monthDate > maxTime ) monthDate = maxTime;
		
		this.dateChangeCallback( monthDate );

	},

	onMonthClick: function( clickedEl ){
		
		var $li = $( clickedEl  );
		if( !$li.hasClass( "unavailable" ) ) {
			var date = $li.attr( "data-time-lookup" );
			this.dateChangeCallback( date );
		}

	},

	onLiMouseOver: function(){
		
		var $this = $( this );
		if( !$this.hasClass( "unavailable" ) ) $this.addClass( "active" );
	
	},

	onLiMouseOut: function(){
		
		var $this = $( this );
		if( !$this.hasClass( "unavailable" ) ) $this.removeClass( "active" );
	
	}

	

}