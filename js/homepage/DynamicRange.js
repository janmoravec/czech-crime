var DynamicRange = {

	ranges:null,

	classifyJenks:function( items, numClasses, maxValue ){

		//go thru parameters, assing default values
		if( items === "undefined") return;
		if( typeof numClasses === 'undefined' ) numClasses = 5;
		
		//empty previous data
		this.ranges = [];

		//console.log( "items.length", items.length, maxValue );
		if( items.length > 1 ) {

			//is there minimum amount of items to fill all classes
			if( maxValue >= 1 ) {
				
				//create geostats object
				var stats = new geostats();
				//set data
				stats.setSerie( items );
				
				//classify data using selected method
				var a;
				//empirically found out eqintervals for smaller datasets
				if( maxValue > 20 ) {
					var statsParam = getURLParameter( "stats");
					if( statsParam == "jenks" ) {
						a = stats.getJenks( numClasses );
					} else {
						a = stats.getQuantile( numClasses );
					}
					
				} else {
					a = stats.getEqInterval( numClasses );
				}

				//turn string ranges to arrays
				var len = stats.ranges.length;

				for( var i = 0; i < len; i++)
				{
					var range = stats.ranges[ i ];
					var arr = range.split("-");
					this.ranges.push( arr );
				}

				//store values
				this.ranges = stats.ranges;
			
			} else {

				var len = items.length;
				this.ranges.push( "0 - 0" );
				this.ranges.push( maxValue + " - "+ maxValue );

				for( var i = 2; i < numClasses; i++ ) {
					
					this.ranges.push( "-" );

				}

			}
		} else {

			//special case for the czech republic
			this.ranges.push( "0 - 0" );
			this.ranges.push( maxValue + " - "+ maxValue );

			for( var i = 2; i < numClasses; i++ ) {
				
				this.ranges.push( "-" );

			}

		}
		
		//console.log( "ranges", this.ranges );

		return this.ranges;
	}

}