var TrendGraphPopups = {

	init: function( $wrapper ) {
		this.$valuePopup = $wrapper.find( ".value" );
		this.$valueSolvPopup = $wrapper.find( ".value-solv" );
		this.$datePopup = $wrapper.find( ".date" );
	},

	appear: function( sum, sumSolv, date, valuePoint, valueSolvPoint, datesPoint ) {
		//compute difference between points
		var verDiff = valueSolvPoint[0] - valuePoint[0];
		var verDiffTreshold = 40;

		//update value popup
		this.$valuePopup.show();
		this.$valuePopup.find("p").text( sum );
		this.$valuePopup.css( { "top" : valuePoint[0] - this.$valuePopup.height(), "left" : valuePoint[1]  - this.$valuePopup.width()/2 } );

		//update value solv popup
		if( sumSolv != sum ) {
			this.$valueSolvPopup.show();
			this.$valueSolvPopup.find("p").text( sumSolv );
			
			if( verDiff >= verDiffTreshold ) {
				//show label up
				this.$valueSolvPopup.removeClass( "down" );
				this.$valueSolvPopup.css( { "top" : valueSolvPoint[0] - this.$valueSolvPopup.height(), "left" : valueSolvPoint[1]  - this.$valueSolvPopup.width()/2 } );
				//this.$valueSolvPopup.css( { "top" : valueSolvPoint[0] - this.$valueSolvPopup.height(), "left" : valueSolvPoint[1]  - this.$valueSolvPopup.width()/2 } );
			} else {
				//show label down
				this.$valueSolvPopup.addClass( "down" );
				this.$valueSolvPopup.css( { "top" : valueSolvPoint[0] + this.$valueSolvPopup.height()/2, "left" : valueSolvPoint[1]  - this.$valueSolvPopup.width()/2 } );
				//this.$valueSolvPopup.css( { "top" : valueSolvPoint[0] - this.$valueSolvPopup.height(), "left" : valueSolvPoint[1]  - this.$valueSolvPopup.width()/2 } );
			}  
		} else {
			//solve popup is not necessary
			this.$valueSolvPopup.hide();
		}

		//update date popup
		this.$datePopup.show();	
		var dateText = this.parseDateText( date );
		this.$datePopup.find("p").text( dateText );
		this.$datePopup.css( { "top" : datesPoint[0] + this.$valuePopup.height() - 10, "left" : datesPoint[1] - this.$datePopup.width()/2} );
	},

	parseDateText: function( date ) {
		var delim = "-";
		var arr = date.split( delim );
		var monthIndex = parseInt( arr[ 0 ] );
		var month = DataUtil.getMonthFromIndex( monthIndex );
		var year = parseInt( arr[ 1 ] );
		
		var finalText = month + " " + year;
		return finalText;
	},

	hide: function() {
		this.$datePopup.hide();
		this.$valuePopup.hide();
		this.$valueSolvPopup.hide();
	}

}