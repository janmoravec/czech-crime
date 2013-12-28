var Legend = {

	element:null,
	lis:null,
	val:null,
	selectedValue:0,
	ranges:null,

	init:function(){

		var self = this;

		self.element = $( ".homepageLegendMain" );
		self.lis = self.element.find( "li" );
		self.val = self.element.find( ".value" );

		self.lis.on("mouseover",function(){
			var $li = $(this);
			$li.addClass("active");
			var isLast = $li.hasClass( "last" );
			self.updateValueText( $li.text(), isLast );

		}).on("mouseout",function(){
			var $li = $(this);
			$li.removeClass("active");
			self.updateValueText( self.selectedValue );
		});

		//populate ranges array
		/*if( !self.ranges ){
			self.ranges = [];
			$.each( self.lis, function(i,v){
				self.ranges.push( $(v).text() );
			});
		}
		
		self.updateRanges( self.ranges );*/
	},

	update:function( data ){
		var self = this,
			index = self.getStepFromIndexValue( data.index );
	
		//remove previous highlight
		self.lis.removeClass("selected");

		//update new value
		self.selectedValue = self.lis.eq( index ).addClass( "selected" ).text();
		var isLastValue = ( index < self.lis.size() - 1 ) ? false : true;
		self.updateValueText( self.selectedValue, isLastValue );
	},

	updateValueText:function( value, isLastValue ){
		this.val.text( value );
	},

	updateRanges:function( ranges ){

		var self = this,
			i = 0;

		if( !self.lis ) return;

		var len = ranges.length - 1;
		
		var decimal = 10;

		//loop through all lis
		$.each( ranges, function( i, range ){
			
			var isLastValue = ( i < len ) ? false : true;
			var li = self.lis.eq( i );

			//process intervals
			if( range != 0 && range != "-") {
				var arr = range.split(" - ");
				arr[0] = Math.round( arr[ 0 ] * decimal ) / decimal;
				arr[1] = Math.round( arr[ 1 ] * decimal ) / decimal;

				if( arr[0] == arr[1] ) value = arr[ 0 ];
				else {
					//decrease first interval
					if( !isLastValue ) {
						var firstValue = arr[0];//Math.round( arr[0]*decimal ) / decimal;
						var secondValue = arr[1];//Math.round( parseFloat( arr[ 1 ] ) * decimal ) / decimal;
						if( secondValue > 0 ) secondValue = secondValue - .1;

						//round once more second value cause substracting .1 is buggy
						secondValue = Math.round( secondValue * decimal ) / decimal;

						//console.log( arr, firstValue, secondValue );

						value = ( firstValue != secondValue ) ? DataUtil.addSpaces( firstValue ) + " - " + DataUtil.addSpaces( secondValue ) : DataUtil.addSpaces( firstValue );
					}
					else value = DataUtil.addSpaces( Math.round( arr[0] * decimal ) / decimal ) + " - " + DataUtil.addSpaces( Math.round( parseFloat( arr[ 1 ] ) * decimal ) / decimal );
				}

				//update value of li
				li.text( value );
			} else {
				li.text( "-" );
			}

			li.data( "range", range );
		});

		//update value
		self.ranges = ranges;
	},

	getStepFromIndexValue:function( value ){
		var self = this,
			i = 0,
			foundIndex = -1,
			len = self.lis.length;
		
		//TODO - leave this here?
		value = DataUtil.formatIndex( value );

		if( value > 0 ) {

			for( i = 0; i < len; i++){

				var range = self.ranges[i],
					arr = String( range ).split(" - "),
					down = arr[0],
					up = arr[1];
				
				//check if not upper boundary with single number
				//var lastInterval = ( up == down ) ? true : false;
				var lastInterval = ( i+1 == len ) ? true : false;
				if( !lastInterval ) {
					if( down != up ) {
						if( value >= down && value < up ) {
							foundIndex = i;
							break;
						} 
					} else {
						//special case when interval is both
						if( value >= down && value <= up ) {
							foundIndex = i;
							break;
						} 
					}
					
				} else {
					if( value >= up ) {
						foundIndex = i;
						break;
					}
				}
			}
			
		} else {

			foundIndex = 0;

		}

		//console.log( 'getStepFromIndexValue', value, self.ranges, range, lastInterval, foundIndex );

		return foundIndex;
	},

	getColorFromIndexValue:function( value ){
		var index = this.getStepFromIndexValue( value );
		return this.lis.eq( index ).data( "color" );
	},

	slideUp:function( height ){
		var self = this;
		self.element.css("top","-=" + height);
	},

	updateZoomLevel: function( level ) {
		this.clearValues();
	},

	clearValues: function() {
		this.val.text( 0 );
	},

	clearSelection: function() {
		
		//remove previous highlight
		if( this.lis ) this.lis.removeClass("selected");

	}
}
