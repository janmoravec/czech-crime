var DateRange = {

	HIDE_BOTTOM_VALUE:"-296px",

	firstDate:null,
	secondDate:null,

	element:null,
	list:null,
	firstDateItems:null,
	firstDateMonthItems:null,
	secondDateItems:null,
	secondDateMonthItems:null,
	spans:null,
	appeared:null,
	currentFirstDate:null,
	currentSecondDate:null,
	cachedTimeFrom:null,
	cachedTimeTo:null,

	init:function(){
		
		var self = this;
		self.element = $(".dateRange");
		self.firstDate = new SingleDate( self.element.find( ".firstDate" ), self.onFirstDateChange );
		self.secondDate = new SingleDate( self.element.find( ".secondDate" ), self.onSecondDateChange );

		//parse first date items
		/*self.firstDateItems = [];
		var lis = self.element.find(".firstDate li");
		var len = lis.length;
		var checkSequence = false;

		for(var i = 0; i < len; i++)
		{
			var $li = lis.eq(i); 
			self.firstDateItems[$li.text()] = $li;
			$li.on("mouseover", self.onLiOver )
			   .on("mouseout", self.onLiOut )
			   .on("click", self.onLiClick );
		}

		self.firstDateMonthItems = self.element.find( ".firstDate .month li" );

		//parse first date items
		self.secondDateItems = [];
		lis = self.element.find(".secondDate li");
		len = lis.length;
		
		for(var i = 0; i < len; i++)
		{
			var $li = lis.eq(i); 
			self.secondDateItems[$li.text()] = $li;

			$li.on("mouseover", self.onLiOver )
			   .on("mouseout", self.onLiOut )
			   .on("click", self.onLiClick );
		}

		self.secondDateMonthItems = self.element.find( ".secondDate .month li" );

		self.lis = self.element.find("li");*/
		
		self.spans = self.element.find("span");

		self.element.find("header").click("on",function(){
			if( !self.appeared ) self.appear();
			else self.hide();
		})

		self.element.find(".ok").click("on",function(){
			self.saveNewDate( true );
		});

		self.element.find(".cancel").click("on",function(){
			self.cancelNewDate();
		});

		self.element.show();
		
		//populate vars from model
		//self.updateToModel();
		
		//debug
		//self.appeared = true;
	},

	onLiOver: function(){
		$(this).addClass("active");
	},

	onLiOut: function(){
		$(this).removeClass("active");
	},

	onLiClick: function(){
		//console.log( "onLiClick" );
	},

	updateMonths: function() {
		//based on the selected year, update value of date attributes
		console.log( "updateMonths" );
	},

	update:function( timeFrom, timeTo ){

		//check if dates are not
		var self = this;
		self.firstDate.setDate( timeFrom );
		self.secondDate.setDate( timeTo );

        var firstDate = self.getDateForId( timeFrom );
        var secondDate = self.getDateForId( timeTo );

        //update dom
		self.spans.eq(0).text( firstDate.month );
		self.spans.eq(1).text( firstDate.year );

		self.spans.eq(3).text( secondDate.month );
		self.spans.eq(4).text( secondDate.year );

	},


	onFirstDateChange: function( time ) {
		
		DateModel.setDate( time, null );

	},

	onSecondDateChange: function( time ) {

		DateModel.setDate( null, time );

	},

	displayErrorSequence: function() {
		//alert( "Datum od musí být dřivější než datum do." );
		alert( texts["Datum od musí být dřivější než datum do."] );
	},

	saveNewDate:function( hide ){
		var self = this;
		if( hide ) self.hide();
	}, 

	cancelNewDate:function(){
		var self = this;

		if( Application.timeFrom != self.cachedTimeFrom 
			|| Application.timeTo != self.cachedTimeTo ) {
			
			DateModel.setDate( self.cachedTimeFrom, self.cachedTimeTo );

		}

		self.hide();
	},

	appear:function(){
		var self = this;
		if( !self.appeared ){
			self.appeared = true;
			self.element.animate( { bottom: 0 });

			//cache values
			self.cachedTimeFrom = Application.timeFrom;
			self.cachedTimeTo = Application.timeTo;
		}
	},

	hide:function(){
		var self = this;
		if( self.appeared ){
			self.appeared = false;
			self.element.animate( { bottom: self.HIDE_BOTTOM_VALUE });
		}
	},

	updateToModel:function(){
		var self = this,
			dates = DateModel.getDates();

		//self.currentFirstDate = { year:dates.first.year, month:dates.first.month };
		//self.currentSecondDate = { year:dates.second.year, month:dates.second.month };
	},

	getDateForId: function( id ) {

		var months = [ texts["Leden"], texts["Únor"], texts["Březen"], texts["Duben"], texts["Květen"], texts["Červen"], 
		texts["Červenec"], texts["Srpen"], texts["Září"], texts["Říjen"], texts["Listopad"], texts["Prosinec"] ];

		var firstYear = 2003;
		var yearIndex = Math.floor( id / 12 );
		var monthIndex = id % 12;

		var year = firstYear + yearIndex;
		var month = months[ monthIndex ];

		return { month: month, year: year };

	}
}