var DataProxy = {

	NAMES_INDEXES_KEYWORD:"namesAndIndexes",

	cachedData:[],

	//cache data for overview
	areasTotalData: [],

	//load data for select box at porovnani
	getNamesAndIndexes:function( zoomLevel ){
		
		var self = this;
		
		var cachedData = this.getCachedData( this.NAMES_INDEXES_KEYWORD );
        if( cachedData ) {
        	//console.log("getNamesAndIndexes data already exists!!!")
        	//console.log( cachedData.array );

        	//update this.areasTotalData
        	this.areasTotalData = cachedData.namesAssocArray;
        	//return normal array
        	return cachedData.array;
        }

        var data = this.callAjax( { name: "findNamesIndexesForIdsRange" }, false );
        var dataById = [];

        //clone array
		var tempArr = data.slice(0);
			
		tempArr.sort( function( a, b ) {
			return b.I - a.I;
		});

		//clone everything into array
		var nameArray = [];
		var len = tempArr.length;
		
		for( var i = 0; i < len; i++ ) {
			var row = tempArr[ i ];
			nameArray[ row.Name ] = i;
		}

		//reset cached values for area overview
		this.areasTotalData = [];

		//append to original array
		for( var q = 0; q < len; q++ ) {
			row = data[ q ];
			rank = nameArray[ row.Name ] + 1;
			data[ q ].Rank = rank;
			
			//trim the whitespace and format 
			data[ q ].Name = DataUtil.formatTitle( $.trim( data[ q ].Name ) );

			//save maximum value
			if( rank == 1 ) {
				var maxValue = data[ q ].I;
				data.maxValue = maxValue;
			}

			//check for minuses and put them to zeros
			if( data[q].I < 0 ) {
				data[q].I = 0;
			}

			//store to 
			this.areasTotalData[ data[q].Code ] = data[q];
		}
		
		//console.log( "Dataproxy getNamesAndIndexes success: ", data );

		//store value, store normal array, and created assocarray for mapLayerOverview
		self.storeCachedData( self.NAMES_INDEXES_KEYWORD, { array:data, namesAssocArray: this.areasTotalData } );
        
        //temp
        return data;
	},

	getDataForArea: function( area, callback  ) {
		
		//get all crimes
        var self = this;

        //store current keystring
        var keyString = Application.currentKey();

        //check if stored data exist
        var cachedData = this.getCachedData( area );
        if( cachedData ) {
        	callback.apply( this, [ cachedData ] );
        	Preloader.hide();
        	return;
        }

        var data = this.callAjax( { name: "getDataForArea", area: area } , false )
        //console.log( "getDataForArea", data );

        /*if( !total ) {
    		//TODO calling error reoper
    		Preloader.hide();
    		Popup.show("Error getting data for area "  + area );
    		return;
    	}*/

    	callback.apply( this, [ data ] );

	    self.storeCachedData( area, data, keyString );
	    Preloader.hide();

	},

	getAllCrimeTypesForArea: function( area, callback  ) {
		
		//get all crimes
        var self = this;

        //store current keystring
        var keyString = Application.currentKey();

        //check if stored data exist
        var cachedData = this.getCachedData( "getAllCrimeTypesForArea-" + area );
        if( cachedData ) {
        	callback.apply( this, [ cachedData ] );
        	Preloader.hide();
        	return;
        }

        var data = this.callAjax( { name: "getAllCrimeTypesForArea", area: area } , false )
        //console.log( "getDataForArea", data );

        /*if( !total ) {
    		//TODO calling error reoper
    		Preloader.hide();
    		Popup.show("Error getting data for area "  + area );
    		return;
    	}*/

    	callback.apply( this, [ data ] );

	    self.storeCachedData( "getAllCrimeTypesForArea-" + area, data, keyString );
	    Preloader.hide();

	},

	getDataForAreaOverview: function( area, callback ) {

		//can get from 
		var areaTotalData = this.areasTotalData[ area ];

		//check if data exists
		if( !areaTotalData ) {
			areaTotalData = { "FoundSum": 0, "I": 0 };
		}

		callback.apply( this, [ { value: areaTotalData["FoundSum"], index: areaTotalData["I"] } ] );
    	
    },

   	getRankingsForCrimeType: function( crimeType ) {
   		
   		var data = this.callAjax( { name: "getRankingsForCrimeType", crimeType: crimeType }, false );
   		return data;
   		
	},

	getGraphData: function( area, callback ) {
		var data = this.callAjax( { name: "getGraphData", area: area, minTime: minTime, maxTime: maxTime }, false );
   		callback.apply( Trend, [data] );

		/*var data = getGraphData( area );
		callback.apply( area, [ data ] );*/
	},

	storeCachedData: function( key, data, currentKey ) {
		
		if( !currentKey ) currentKey = Application.currentKey();

		if( !this.cachedData[ currentKey ] ) this.cachedData[ currentKey ] = [];
		this.cachedData[ currentKey ] [ key ] = data;
	},

	loadMapStyles: function( zoomLevel ) {
		var self = this;
	
        var data = this.getNamesAndIndexes();
        return data;

	},	

	getTimeline: function() {
		var data = this.callAjax( { name:"getTimeline", minTime: minTime, maxTime: maxTime }, false );//loadTimeline();
		
		/*var startTime = 11;
		var startValue = 11094;
		
		var fakeData = [];
		var len = 101;
		for( var i = 0; i < len; i++ ) {
			
			var fakeSingleData = { 
								"Date": "Květen 2013",
						   		"FK_Time_Lookup": startTime,
						   		"FoundSum": startValue,
						   		"date": "Květen 2013"
						 	};
			
			fakeSingleData.FoundSum = startValue * Math.random();
			fakeSingleData.FK_Time_Lookup = startTime + i;
			
			fakeData.push( fakeSingleData );
		}

		console.log( data );
		console.log( fakeData );*/

		return data;
	},

	loadDamage: function() {
		//so far no data for uzemni odbory
		if( Application.zoomLevel == 2) {
			return "NaN";
		}

		var data = loadDamage( Application.selectedUnit );

		//format data
		var damageNumber = parseFloat( data );

		damageNumber = Math.round( damageNumber / 1000 ) * 1000;
		damageNumber /= 1000000;
		
		//replace dot with comma
		var formattedNumber = String( damageNumber ).replace( ".", "," );

		return formattedNumber;
	},

	getAreaGeometry: function( completeCallback, async ) {
		
		if( async ) {
			
			this.callAjax( { name:"getAreaGeometry", complete: completeCallback }, async );
		
		} else {
		
			var data = this.callAjax( {name:"getAreaGeometry" }, async );
			completeCallback.apply( MapLayer, [data] );
	
		}
	},

	getCachedData: function( key ) {
		//console.log("retrieving cache data: ", Application.currentKey(), key );

		return ( this.cachedData[ Application.currentKey() ] && this.cachedData[ Application.currentKey() ] [ key ] ) ? this.cachedData[ Application.currentKey() ] [ key ] : null;
	},

	callAjax: function( opts, async ) {
		
		var queryurl = "?do=" + opts.name;
    	
	    var self = this,
	    	data;

	    $.ajax( {
	        async: async,
	        type: 'GET',
	        dataType: 'json',
	        data: { area: opts.area, 
	        		zoomLevel: Application.zoomLevel, 
	        		timeFrom: Application.timeFrom, 
	        		timeTo: Application.timeTo, 
	        		language: appLanguage,
	        		minTime: ( opts.minTime ) ? opts.minTime : null, 
	        		maxTime: ( opts.maxTime ) ? opts.maxTime : null, 
	        		crimeTypes: ( opts.filters ) ? opts.filters : Application.filtersString(), 
	        		crimeType: ( opts.crimeType ) ? opts.crimeType : null },
	        url: queryurl,
	        success: function(d) {
	            console.log( "success", queryurl, d );
	            data = d;

	            if( !data ) {
	            	alert( texts["Máme problém s načtením dat, zkuste prosím zvolit jiné období nebo územní jednotku." ] );
	          		Preloader.hide();
	            }
	           	
	            if( opts.complete ) {
	            	opts.complete.apply(self, [ data ] );
	            }
	        },
	        error: function(xhr) {
	          console.log( "error: " + queryurl );
	          console.log( xhr );
	          alert( texts["Máme problém s načtením dat, zkuste prosím zvolit jiné období nebo územní jednotku." ] );
	          Preloader.hide();
	        },
	        progress: function() { console.log("standard progress callback"); }
	    });
	    
	    if( !async ) {
	    	return data;
	    }
	    
	}
}