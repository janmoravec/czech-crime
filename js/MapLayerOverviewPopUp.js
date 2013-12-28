var MapLayerOverviewPopUp = {

	element: null,
	init: null,
	title: null,
	valueWrapper: null,
    value: null,
    indexWrapper: null,
    index: null,
    legend: null,
    lis: null,
    selectedValue: 0,
    ranges: null,
    preloader: null,
    currentId: null,

	init:function() {

		if( this.inited ) return;

		var self = this;
		this.inited = true;
		self.element = $(".mapOverviewPopup");
		self.element.hide();

		self.title = self.element.find("h1");
		self.valueWrapper = self.element.find( ".value" );
        self.value = self.element.find(".value dd");
        self.indexWrapper = self.element.find(".index" );
        self.index = self.element.find(".index dd");
        self.legend = self.element.find( ".homepageLegend" );

        self.preloader = $( "<p class='overviewPreloader'>" +texts["Nahrávání dat..."] + "</p>" );
        self.legend.after( self.preloader );

		self.elWidth = self.element.width(),
		self.elHeight = self.element.height();
                
        //populate ranges array
        self.lis = self.element.find( "li" );
		self.ranges = [];
		$.each( self.lis, function(i,v){
			self.ranges.push( $(v).text() );
		});
		
		self.clearContent();
	},

	show:function(){
		var self = this;
		if( self.element ) self.element.show();
	},

	hide:function(){
		var self = this;
		if( !self.element ) return;
		
		self.element.hide();
		self.clearContent();
	},

	clearContent: function() {
		this.legend.hide();
		this.indexWrapper.hide();
		this.valueWrapper.hide();
		this.preloader.show();
	},

	update:function( data, name, fillColor ){
		var self = this;

		//check if data current
		if( name == "Česká republika" && appLanguage == "en" ) name = "Czech republic";
		else if( this.title.text() != DataUtil.formatTitle( name ) ) return;

		//check for data not available
		if( isNaN( data.value ) ){
			//data not available
			self.element.addClass( "noData" );
		} else {
			//alright
			self.element.removeClass( "noData" );
		}

		//update displayed data
		self.value.text( DataUtil.addSpaces( data.value ) );
        self.index.text( DataUtil.addSpaces( DataUtil.formatIndex( data.index ) ) );
        
        self.lis.removeClass("selected");
        
        //var index = self.getStepFromIndexValue( data.index );
        var index = self.getStepFromFillColor( fillColor );

        self.selectedValue = self.lis.eq(index).addClass("selected").text();

        this.legend.show();
		this.indexWrapper.show();
		this.valueWrapper.show();
		this.preloader.hide();
	},

	updateName: function( name ){

		if( appLanguage == "en" && Application.zoomLevel == 0 ) name = "Czech republic";

		this.title.text( DataUtil.formatTitle( name ) );

		//check for long names
		/*if( this.title.height() > 22 ) {
			this.title.addClass( "smallLetters" );
		} else {
			this.title.removeClass( "smallLetters" );
		}*/
	},

	moveTo: function( position ) {
		//offset marker
		position.top -= this.elHeight - 55;
		position.left -= this.elWidth/2;
		this.element.css( { top:position.top, left:position.left } );
	},
    
	updateRanges:function( ranges ){

		var self = this,
			i = 0;

		self.ranges = ranges;

		if( !self.lis ) return;

		//loop through all lis
		$.each( ranges, function( i, range ){
			//update value of li
			self.lis.eq( i ).text( range );
		});
	},

    getStepFromIndexValue:function( value ){
		var self = this,
			i = 0,
			foundIndex = -1,
			len = self.lis.length;

		for( i = 0; i < len; i++){
			var range = self.ranges[i],
				arr = range.split("-"),
				down = parseFloat( arr[0] ),
				up = parseFloat( arr[1] );

			//normalize data
			value = Math.floor( value );
			up = Math.floor( up );
			down = Math.floor( down );

			//check if not upper boundary with single number
			var lastInterval = ( up == down ) ? true : false;
			if( !lastInterval ) {
				if( value >= down && value < up) {
					foundIndex = i;
					break;
				} 
			} else {
				if( value >= up ) {
					foundIndex = i;
					break;
				}
			}
		}

		return foundIndex;
	},

	getStepFromFillColor: function( fillColor ) {

		var index = -1
		switch( fillColor ) {
			case "#fadbde":
				index = 0;
				break;
			case "#f5a6ab":
				index = 1;
				break;
			case "#ee7079":
				index = 2;
				break;
			case "#e93a46":
				index = 3;
				break;
			case "#e20613":
				index = 4;
				break;
		}
		
		return index;
	}
}