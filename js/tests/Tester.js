var Tester = {

	tests:[],

	/*sampleTimePeriods: [ 
						 { firstDate: { month: "Březen", year:2010 }, secondDate: { month: "Duben", year:2011 } },  
						 { firstDate: { month: "Prosinec", year:2010}, secondDate: {month: "Prosinec", year:2010 } }
					   ],

	sampleFilters: [ 
						 [ { name:"moral", index:2 } ],  
						 [ { name:"moral", index:2 }, { name:"violent", index:1 } ]
					   ],*/
				   

	init: function() {
		
		HomepageTester.init();

		$.ajax( {
			//async: false,
			url: "?do=getAreas",
			type: "POST",
			dataType: 'json',
			data: { 
				zoomLevel: 3
			},
			success: function( d ) {
				var len = d.length;
				console.log( "init homepagetest", len );
				
				for( var i = 0; i < len; i++ ) {
					var obj = d[i];
					//console.log( "obj", d[i] );
					Tester.addTest( { type: "getArea", id1: obj["Code"], id2: null, zoomLevel:3, timeFrom:120, timeTo:129, interval: 2500 } );
				}

				Tester.runTests();
			},
			error: function( xhr ) {
				console.error( "error" );
				console.error( xhr );
			}
		})
		
		/*if( window.location.href.indexOf( "test1") > -1 ) {
			//first test case		
			Tester.addTest( { type: "getArea", id1: 2, id2: 4, zoomLevel:2, timePeriod: Tester.sampleTimePeriods[ 0 ], interval: 2500 } );
			Tester.addTest( { type: "getArea", id1: 18, id2: 22, zoomLevel:2, filters: Tester.sampleFilters[ 0 ], timePeriod: Tester.sampleTimePeriods[ 1 ], interval: 2500 } );
		} else if( window.location.href.indexOf( "test2") > -1 ) {
			//second test case
			Tester.addTest( { type: "porovnaniGetArea", id1:2, id:12 } );
		} else if( window.location.href.indexOf( "test3") > -1 ) {
			//third test case
			Tester.addTest( { type: "porovnaniSecondGetArea", zoomLevel:2, timePeriod: Tester.sampleTimePeriods[ 0 ], interval: 2500, id1:2, id2:70 } );
			Tester.addTest( { type: "porovnaniGetArea", zoomLevel:2, timePeriod: Tester.sampleTimePeriods[ 1 ], filters: Tester.sampleFilters[ 0 ], interval: 2500, id1:2, id2:80 } );
		} else if( window.location.href.indexOf( "test4") > -1 ) {
			//fourth test case
			Tester.addTest( { type: "porovnaniSwitchFromMapa", zoomLevel:2, timePeriod: Tester.sampleTimePeriods[ 1 ], filters: Tester.sampleFilters[ 0 ], interval: 2500, id1:2, id2:80 } );
		} else if( window.location.href.indexOf( "test5") > -1 ) {
			//fifth test case
			Tester.addTest( { type: "tabulkyGetArea", zoomLevel:2, timePeriod: Tester.sampleTimePeriods[ 1 ], interval: 2500, id1:2, id2:80 } );
		} else {
			//sixth test case
			Tester.addTest( { type: "tabulkyGetCrimeType", zoomLevel:2, timePeriod: Tester.sampleTimePeriods[ 1 ], interval: 2500, crimeTypes: [ "moral", "violent" ] } );
		} */
		
		//Tester.runTests();
	},
	
	setSelectedUnit: function( areaId ) {

		Application.updateSelectedUnit( areaId );

	},

	setZoomLevel: function( zoomLevel ) {
		switch( zoomLevel ) {
			case 0:
				showCountry();
				break;
			case 1:
				showCounty();
				break;
			case 2:
				showDistrict();
				break;
		}
	},

	setTimePeriod: function( firstDate, secondDate ){
		DateRange.currentFirstDate = firstDate;
		DateRange.currentSecondDate = secondDate;
		DateRange.saveNewDate();
	},

	setFilters: function( array ){
		Application.filters = array;
		Application.updateFilters();
	},

	switchToPorovnani: function() {

		switchToPorovnani( this, Application.selectedUnit );

	},

	switchToTabulky: function() {

		switchToTabulky();

	},

	addTest: function( opts ) {
		this.tests.push( new Test( opts ) );
	},

	runTests: function() {

		var self = this;
		var testIndex = 0;
		var testLen = this.tests.length;

		function runTests( index, callback ) {
			Tester.log( "running test: " + index+1 + " from: " + testLen );
			if( index < testLen ) {
				self.tests[ index ].run( callback );
			} else {
				Tester.log( "all tests complete" );
			}
		}

		runTests( testIndex, function() { 
								console.log( "run next test" );
								testIndex++; 
								runTests( testIndex ); 
							} );
	},

	log: function( msg ) {

		console.log( "tester log: " , msg );
	}

}

function Test( opts ) {

	this.type = ( opts.type ) ? opts.type : "getArea";
	this.zoomLevel = ( opts.zoomLevel ) ? opts.zoomLevel : null;
	this.timeFrom = ( opts.timeFrom ) ? opts.timeFrom : null;
	this.timeTo = ( opts.timeTo ) ? opts.timeTo : null;
	this.filters = ( opts.filters ) ? opts.filters : null;
	this.id1 = ( opts.id1 ) ? opts.id1 : "";
	this.id2 = ( opts.id2 ) ? opts.id2 : "";
	this.interval = ( opts.interval ) ? opts.interval : 1000;
	this.crimeTypes = ( opts.crimeTypes ) ? opts.crimeTypes : null;

	this.completeCallback = opts.completeCallback;
}

Test.prototype.run = function( completeCallback ){

	var self = this;

	function setZoomLevel(){
		log( "setZoomLevel" );
		//set initial zoom
		var zoomChanged = false;
		log( self.zoomLevel );
		if( self.zoomLevel ) {
			zoomChange = true;
			Tester.setZoomLevel( self.zoomLevel );
		}

		if( zoomChanged ) setTimeout( setTimePeriod, self.interval );
		else setTimePeriod();
	}

	function setTimePeriod() {
		log( "setTimePeriod" );
		//set time periods
		var timePeriodChanged = false;
		if( self.timePeriod ) {
			timePeriodChanged = true;
			Tester.setTimePeriod( self.timePeriod.firstDate, self.timePeriod.secondDate );
		}

		if( timePeriodChanged ) setTimeout( setFilters, self.interval );
		else setFilters();
	}

	function setFilters() {
		log( "setFilters" );
		var filtersChanged = false;
		if( self.filters ) {
			filtersChanged = true;
			Tester.setFilters( self.filters );
		}

		if( filtersChanged ) setTimeout( runTest, self.interval );
		else runTest();
	}	

	function runTest() {
		log( "runTest", self.type, self.zoomLevel, self.timeFrom, self.timeTo, self.filters, self.id1, self.id2, self.crimeTypes );
		if( self.type == "getArea" ) {
			console.log( "runTest2", completeCallback );
			HomepageTester.testSelectUnits( self.id1, self.id2, self.timeFrom, self.timeTo, completeCallback );
			//if( self.zoomLevel != 2 )	HomepageTester.testSelectUnits( self.id1, self.id2, completeCallback );//, krajeComplete );
			//else HomepageTester.testSelectUnits( self.id1, self.id2, completeCallback, Tester.BLACKLISTED_DISTRICT_IDS );
		
		} else if( self.type == "porovnaniGetArea" ) {
			Tester.switchToPorovnani();
			setTimeout( function(){
				if( self.zoomLevel != 2 ) PorovnaniTester.testSelectUnits( self.id1, self.id2, completeCallback );
				else PorovnaniTester.testSelectUnits( self.id1, self.id2, completeCallback, Tester.BLACKLISTED_DISTRICT_IDS	 );
			}, 1000 );
		} else if( self.type == "porovnaniSecondGetArea" ) {
			Tester.switchToPorovnani();
			setTimeout( function(){
				if( self.zoomLevel != 2 ) PorovnaniTester.testSecondSelectUnits( self.id1, self.id2, completeCallback );
				else PorovnaniTester.testSecondSelectUnits( self.id1, self.id2, completeCallback, Tester.BLACKLISTED_DISTRICT_IDS );
			}, 1000 );
		} else if( self.type == "porovnaniSwitchFromMapa" ) {
			Tester.setSelectedUnit( self.id1 );
			setTimeout( function() {

				Tester.switchToPorovnani();

				setTimeout( function() { 
					PorovnaniTester.takeSnapshotOfPorovnani();
				}, self.interval );

			}, self.interval );
		} else if( self.type == "tabulkyGetArea" ) {
			
			Tester.switchToTabulky();

			setTimeout( function(){
				if( self.zoomLevel != 2 ) TabulkyTester.testSelectUnits( self.id1, self.id2, completeCallback );
				else TabulkyTester.testSelectUnits( self.id1, self.id2, completeCallback, Tester.BLACKLISTED_DISTRICT_IDS );
			}, self.interval );
		} else if( self.type == "tabulkyGetArea" ) {
			
			Tester.switchToTabulky();

			setTimeout( function(){
				if( self.zoomLevel != 2 ) TabulkyTester.testSelectUnits( self.id1, self.id2, completeCallback );
				else TabulkyTester.testSelectUnits( self.id1, self.id2, completeCallback, Tester.BLACKLISTED_DISTRICT_IDS );
			}, self.interval );
		} else if( self.type == "tabulkyGetCrimeType" ) {
			
			Tester.switchToTabulky();

			setTimeout( function(){
				TabulkyTester.testSelectCrimeTypes( self.crimeTypes, completeCallback );
			}, self.interval );
		}

		
	}

	//setZoomLevel();
	runTest();

}

var HomepageTester = {

	init: function() {


		function krajeComplete() {
			Tester.log( "complete testing select unit");

			//test uzemni odbory
			//Application.updateZoomLevel( 2 );
		}

		//test kraje
		//HomepageTester.testSelectUnits( 2, 16, krajeComplete );


		//test uzemni obdbory
		/*showDistrict();
		setTimeout( function() { 
			HomepageTester.testSelectUnits( 1, 87, undefined, [5,45,52,53,60,79] );
		}, 2000 );*/


		//test uzemni odbory and different data
		/*showDistrict();
		var firstDate =  {month: "Březen",year:2010};
		var secondDate = {month: "Duben",year:2012};
		firstDate =  {month: "Září",year:2010};
		secondDate = {month: "Září",year:2010};
		firstDate =  {month: "Prosinec",year:2010};
		secondDate = {month: "Prosinec",year:2010};
		Tester.setTimePeriod( firstDate, secondDate );
		setTimeout( function() { 
			HomepageTester.testSelectUnits( 1, 87, timeTestComplete, [5,45,52,53,60,79] );
		}, 1000 ); */
		


		//test uzemni odbory with filters
		/*showDistrict();

		setTimeout( function() { Tester.setFilters( [ { name:"moral", index:2 } ] ); }, 1000 );
		setTimeout( function() { HomepageTester.testSelectUnits( 1, 87, undefined, [5,45,52,53,60,79] ); }, 2000 );*/
	},

	testSelectUnits: function( id1, id2, timeFrom, timeTo, completeCallback, blacklistedIds ){
		Tester.log( 'testing update selected unit' );
		
		//Application.updateSelectedUnit( 3 );

		//test all selected units in kraje
		var currentIndex = id1; 
		var timeInterval = 1500;
	
		function testSingleUnit( areaId ) {
			
			Tester.log( 'testing select unit with id: ' + areaId );
			Application.updateSelectedUnit( areaId );

			setTimeout( HomepageTester.takeSnapshotOfHomepage, timeInterval - 100 );
			 
		}

		function runNextTest() {
			testSingleUnit( currentIndex );
			//currentIndex++;

			//if( currentIndex == id2 ) {
				clearInterval( interval );
				if( completeCallback ) setTimeout( completeCallback, 2000 );
			//}
		}

		var interval = setInterval( runNextTest, timeInterval );

	},

	takeSnapshotOfHomepage: function() {

		//infobox
		Tester.log("infobox values: " + InfoBox.title.text() + ", " +  InfoBox.index.text() + ", " + InfoBox.total.text() + ", " + InfoBox.officers.text() + ", " +  InfoBox.damage.text() + ", " + InfoBox.rank.text() );
		
		//filter box
		var $spans = FilterBox.element.find("span.val");
		var filterMsg = "";
		$.each( $spans, function(i,v) {
			filterMsg += $( v ).text();
			filterMsg += ", ";
		});
		Tester.log("filterbox values: " + filterMsg );
		
		//legend
		Tester.log("infobox values: " + Legend.ranges );
	}


}

var PorovnaniTester = {

	testSelectUnits: function( id1, id2, completeCallback, blacklistedIds ){
		Tester.log( 'porovnani testing update selected unit' );
		
		//test all selected units in kraje
		var currentIndex = id1; 
		var timeInterval = 1500;
	
		function testSingleUnit( areaId ) {
			var blackPos = $.inArray( areaId, blacklistedIds );
			if( blackPos == -1 ) {
				//skip this id
				Tester.log( 'testing select unit with id: ' + areaId );
				Application.updateSelectedUnit( areaId );

				setTimeout( PorovnaniTester.takeSnapshotOfPorovnani, timeInterval - 100 );

			} else {
				//skip this id
				Tester.log( 'skipping blacklisted id ' + areaId );
			}
			 
		}

		function runNextTest() {
			testSingleUnit( currentIndex );
			currentIndex++;

			if( currentIndex == id2 ) {
				clearInterval( interval );
				if( completeCallback ) setTimeout( completeCallback, 2000 );
			}
		}

		var interval = setInterval( runNextTest, timeInterval );

	},

	testSecondSelectUnits: function( id1, id2, completeCallback, blacklistedIds ){
		Tester.log( 'porovnani testing second selected unit' );
		log( completeCallback );
		
		//test all selected units in kraje
		var currentIndex = id1; 
		var timeInterval = 1500;
	
		function testSingleUnit( areaId ) {
			var blackPos = $.inArray( areaId, blacklistedIds );
			if( blackPos == -1 ) {
				//skip this id
				Tester.log( 'testing select unit with id: ' + areaId );
				Application.updateSecondSelectedUnit( areaId );

				setTimeout( PorovnaniTester.takeSnapshotOfPorovnani, timeInterval - 100 );

			} else {
				//skip this id
				Tester.log( 'skipping blacklisted id ' + areaId );
			}
			 
		}

		function runNextTest() {
			testSingleUnit( currentIndex );
			currentIndex++;

			if( currentIndex == id2 ) {
				clearInterval( interval );
				if( completeCallback ) setTimeout( completeCallback, 2000 );
			}
		}

		var interval = setInterval( runNextTest, timeInterval );

	},

	takeSnapshotOfPorovnani: function() {

		log( "takeSnapshotOfPorovnani" );
 
		//first table
		var firstTable = Porovnani.firstTable; 
		var totalValues = "total values: " + firstTable.element.find( "td.first" ).text() + ", " + firstTable.element.find( "td.second" ).text() + ", " + firstTable.element.find( "td.third" ).text();
		
		var $staticTds = firstTable.element.find(".staticData").find(".total").find("td");
		var staticValues = "static values:  ";
		staticValues += $staticTds.eq( 0 ).text() + ", ";
		staticValues += $staticTds.eq( 1 ).text() + ", ";

		var rowValues = "rowValues:";
		$.each( firstTable.rows, function( i , v ) {
			var $row = $( v );

			rowValues += $row.find("td.first").text() + ", "; 
			rowValues += $row.find("td.second").text() + ", "; 
			rowValues += $row.find("td.third").text() + ", ";
			rowValues += $row.find("td.bar .value").text() + ", ";

		} );

		Tester.log( "porovnani left table - " + totalValues + staticValues  + rowValues + ", maxIndexValue: " + firstTable.maxIndexValue );

		var secondTable = Porovnani.secondTable; 
		totalValues = "total values: " + secondTable.element.find( "td.first" ).text() + ", " + secondTable.element.find( "td.second" ).text() + ", " + secondTable.element.find( "td.third" ).text();
		
		var $staticTds = secondTable.element.find(".staticData").find(".total").find("td");
		var staticValues = "static values:  ";
		staticValues += $staticTds.eq( 0 ).text() + ", ";
		staticValues += $staticTds.eq( 1 ).text() + ", ";

		var rowValues = "rowValues:";
		$.each( secondTable.rows, function( i , v ) {
			var $row = $( v );

			rowValues += $row.find("td.first").text() + ", "; 
			rowValues += $row.find("td.second").text() + ", "; 
			rowValues += $row.find("td.third").text() + ", ";
			rowValues += $row.find("td.bar .value").text() + ", ";

		} );

		Tester.log( "porovnani right table - " + totalValues + staticValues  + rowValues + ", maxIndexValue: " + firstTable.maxIndexValue );
	}

}


var TabulkyTester = {

	testSelectUnits: function( id1, id2, completeCallback, blacklistedIds ){
		Tester.log( 'tabulky testing update selected unit' );
		
		//test all selected units in kraje
		var currentIndex = id1; 
		var timeInterval = 1500;
	
		function testSingleUnit( areaId ) {
			var blackPos = $.inArray( areaId, blacklistedIds );
			if( blackPos == -1 ) {
				//skip this id
				Tester.log( 'testing select unit with id: ' + areaId );
				Application.updateSelectedUnit( areaId );

				setTimeout( TabulkyTester.takeSnapshotOfTabulky, timeInterval - 100 );

			} else {
				//skip this id
				Tester.log( 'skipping blacklisted id ' + areaId );
			}
			 
		}

		function runNextTest() {
			testSingleUnit( currentIndex );
			currentIndex++;

			if( currentIndex == id2 ) {
				clearInterval( interval );
				if( completeCallback ) setTimeout( completeCallback, 2000 );
			}
		}

		var interval = setInterval( runNextTest, timeInterval );

	},

	testSelectCrimeTypes: function( crimeTypes, completeCallback ){
		Tester.log( 'tabulky testing select crime type: ' );
		log( crimeTypes );
		
		//test all selected units in kraje
		var currentIndex = 0; 
		var typesLen = crimeTypes.length;
		var timeInterval = 1500;
	
		function testSingleUnit( crimeType ) {
			Tester.log( 'testing crimetype: ' + crimeType );
			Tabulky.displayRankings( crimeType );

			setTimeout( TabulkyTester.takeSnapshotOfRankingsTable, timeInterval - 100 );
		}

		function runNextTest() {
			testSingleUnit( currentIndex );
			currentIndex++;

			if( currentIndex == typesLen ) {
				clearInterval( interval );
				if( completeCallback ) setTimeout( completeCallback, 2000 );
			}
		}

		var interval = setInterval( runNextTest, timeInterval );

	},

	takeSnapshotOfTypesTable: function() {

		log( "takeSnapshotOfTypesTable" );
 
		//types table
		var totalValues = "total values: " ;
		totalValues += TypesTable.totalTds.eq( 1 ).text() + ", ";
	    totalValues += TypesTable.totalTds.eq( 2 ).text() + ", ";
	    totalValues += TypesTable.totalTds.eq( 3 ).text() + ", ";
	    totalValues += TypesTable.totalTds.eq( 4 ).text() + ", ";

		var rowValues = "rowValues: ";
		$.each( TypesTable.rows, function( i , v ) {
			var $row = $( v );
			var $tds = $row.find( "td" );
			rowValues += $tds.eq( 1 ).text() + ", "; 
			rowValues += $tds.eq( 2 ).text() + ", "; 
			rowValues += $tds.eq( 3 ).text() + ", ";
			rowValues += $tds.eq( 4 ).text() + ", ";
		} );

		var generalValues = "generalValue: ";
		generalValues += TypesTable.generalTds.eq( 0 ).text() + ", ";
		generalValues += TypesTable.generalTds.eq( 1 ).text() + ", ";
	    generalValues += TypesTable.generalTds.eq( 2 ).text() + ", ";
	    generalValues += TypesTable.generalTds.eq( 3 ).text() + ", ";
	   
		Tester.log( "tabulky types table - " + totalValues + rowValues + generalValues );
	},

	takeSnapshotOfRankingsTable: function() {

		log( "takeSnapshotOfRankingsTable" );
 
		var rowValues = "rowValues: ";
		$.each(RankingsTable.rows, function( i , v ) {
			var $row = $( v );
			var $tds = $row.find( "td" );
			rowValues += $tds.eq( 0 ).text() + ", "; 
			rowValues += $tds.eq( 1 ).text() + ", "; 
			rowValues += $tds.eq( 2 ).text() + ", "; 
			rowValues += $tds.eq( 3 ).text() + ", ";
			rowValues += $tds.eq( 4 ).text() + ", ";
		} );

		Tester.log( "tabulky rankings table - " + rowValues );
	}

}
