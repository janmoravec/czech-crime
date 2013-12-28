var DateModel = {

	timeFrom:null,
	timeTo:null,

	init:function(){
		
		var self = this;
		
		//display init data
        self.timeFrom = Application.timeFrom;
        self.timeTo = Application.timeTo;
        
        //timeline date will be set from resize trigger handler  
		Timeline.setDates( self.timeFrom, self.timeTo );
		DateRange.update( self.timeFrom, self.timeTo );
	},

	setDate:function( timeFrom, timeTo ){
		
		var self = this;
		if( timeFrom != null ) {
			self.timeFrom = parseInt( timeFrom );
        } else {
        	self.timeFrom = Application.timeFrom;
        }
		if( timeTo != null ) {
            self.timeTo = parseInt( timeTo );
        } else {
        	self.timeTo = Application.timeTo;
        }

        //check time constraints
        if( self.timeFrom > self.timeTo ) {
        	
        	//wrong time constraints, check which data has been changed and act accordingly
        	if( timeTo ) self.timeFrom = self.timeTo;
        	else if( timeFrom ) self.timeTo = self.timeFrom;

        } 

        Application.updatePeriod( self.timeFrom, self.timeTo );
        MapDetailOverlay.close();
        
        Timeline.setDates( self.timeFrom, self.timeTo );
		DateRange.update( self.timeFrom, self.timeTo );
        
        Preloader.show();

	},

	getDates:function(){
		var self = this;
		return { first: self.firstDate, second: self.secondDate };
	}

}