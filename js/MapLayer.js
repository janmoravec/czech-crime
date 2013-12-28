var MapLayer = {

	DEFAULT_STYLE: { "strokeColor": "#333333",
	       			 "strokeOpacity": 0.5,
	       			 "fillColor": "#fadbde",
	       			 "fillOpacity": 0.6 },

	FTresponse: null,

	query: "",
	gpolygons: [],
	dummyOverlay: null,

	map: null,
	styles: null,

	geoXml: null,
	
	inited: false,

	init: function( map ){
		var self = this;
		self.map = map;
	
		//create dummy overlay for conversions
		this.dummyOverlay = new google.maps.OverlayView(); 
        this.dummyOverlay.draw = function() {}; 
        this.dummyOverlay.setMap( self.map );
		
		var self = this;
		
		this.geoXml = new geoXML3.parser( {
                map: self.map,
				zoom: false,
				suppressInfoWindows: true
            } );

		function complete( areaGeometry ) {
			
			//Preloader.show();
			
			var timeout = 5;
			var index = 0;
			var numRows = areaGeometry.length;
			
			if( areaGeometry ) {
				
				var numRows = areaGeometry.length;
				//for(var i = numRows - 1; i > -1; i--) {
				for( var i = 0; i < numRows; i++ ) {
					self.parseKml( i, areaGeometry[ i ] );
				}

			}
			Preloader.hide();

			/*function processGeo() {

				self.parseKml( areaGeometry[ index ] );
				index++;

				if( index < numRows ) setTimeout( processGeo, timeout );
				else Preloader.hide();
			}

			processGeo();
			//Preloader.hide();*/
		}

		/*var kmlUrl = "",
			codeColumn = "";

		switch( Application.zoomLevel ) {
			case 0:
				kmlUrl = "data/CR_2000.kml";
				break;
			case 1:
				kmlUrl = "data/KRAJE_2000.kml";
				codeColumn = "FIRST_FIRS";
				nameColumn = "FIRST_FI_2";
				break;
			case 2:
				kmlUrl = "data/UO_2000.kml";
				codeColumn = "FIRST_FIRS";
				nameColumn = "FIRST_DI_1";
				break;
			case 3:
				kmlUrl = "data/OOP_2000.kml";
				codeColumn = "FIRST_OOP_";
				nameColumn = "OOP_NAZEV";
				break;
		}

		$.ajax( {
			url: kmlUrl,
			type: "GET",
			dataType: "xml",
			success: function( d ) {

				var $xml = $( d );
				var $placemarks = $xml.find( "Placemark" );
				//console.log( $placemarks );
				var placeLen = $placemarks.length;
				
				for( var i = 0; i < placeLen; i++ ) {

					var $placemark = $( $placemarks[ i ] );
					var $extendedData = $placemark.find( "ExtendedData" );
					
					var name = $extendedData.find( "SimpleData[name='" + nameColumn + "']" ).text();
					if( Application.zoomLevel == 0 ) name = "Česká republika";

					var code = $extendedData.find( "SimpleData[name='" + codeColumn + "']" ).text();
					code = self.normalizeCode( Application.zoomLevel, code );
					
					//special case for Smichov which has multigeometry
					var geometry;
					if( code != "001213" ) {
						geometry = "<Polygon>" + $placemark.find( "Polygon" ).get(0).innerHTML + "</Polygon>";
					} else {
						geometry = "<MultiGeometry>" + $placemark.find( "MultiGeometry" ).get(0).innerHTML + "</MultiGeometry>";
					}
				
					var row = {
						"Code": code,
						"Name": name,
						"Geometry": geometry
					}

					self.parseKml( i, row );

					/*var name = $extendedData.find( "SimpleData:not[name='']" );
					console.log( $extendedData, name );*/
			
				/*}

				Preloader.hide();
				
			},
			error: function( xhr ) {
				console.log( "error" );
				console.log( xhr );
			}
		});*/


		//async call only for first load
		var async = ( this.inited ) ? false : true;
		DataProxy.getAreaGeometry( complete, async );
		this.inited = true;
		
	},

	normalizeCode: function( zoomLevel, code ) {

		if( zoomLevel == 3 ) {
		
			if( code < 10000 ) {
				code = "00" + parseInt( code );
			} else if ( code < 100000 ) {
				code = "0" + parseInt( code );
			} else {
				code = parseInt( code );
			}
		
		} else if ( zoomLevel == 2 ) {

			if( code < 100 ) {
				code = "00" + parseInt( code );
			} else if( code < 1000 ) {
				code = "0" + parseInt( code );
			} else {
				code = parseInt( code );
			}

		} else if( zoomLevel == 1 ) {

			if( code < 10 ) {
				code = "0" + parseInt( code ) + "00";
			} else if( code < 1000 ) {
				code = "0" + parseInt( code );
			} else {
				code = parseInt( code );
			}

		} else if( zoomLevel == 0 ) {
			code = "0";
		}

		//console.log( "code", code );
		return code;

	},

	clear: function() {
		if( this.gpolygons && this.gpolygons.length > 0 ) {
			for( var polygonId in this.gpolygons ) {
			//	this.gpolygons[ polygonId ].setMap( null );
			}	
			//log( this.gpolygons[ polygonId ] );
		}
		this.gpolygons = [];
	},

	parseKml: function( kmlIndex, row ) {
	    
	    var self = this;
	    var gpolygons = this.gpolygons;
	    var infoWindow = null;
	   
	    var id = row.Code;
	    
	    //if ( !gpolygons[ id ] ) {
		    
		    var name = row.Name;
		    var kml = row.Geometry;

		    // create a geoXml3 parser for the click handlers
		    /*var geoXml = new geoXML3.parser( {
                map: self.map,
				zoom: false,
				suppressInfoWindows: true,
                infoWindow: infoWindow,
                singleInfoWindow: true
            } );*/

	        this.geoXml.parseKmlString( "<Placemark><name>" + name + "</name><description><![CDATA[]]></description>" + kml + "</Placemark>" );
		    var gpolygon = {};
		    //gpolygons[ id ] = new Object();
		   
		    if ( this.geoXml.docs[ kmlIndex ].placemarks[ 0 ].Polygon ) {
		    
		       this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ].setMap( self.map );
		       gpolygon.id = id;
		       gpolygon.polygon = this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ];
		       gpolygon.position = this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ].bounds.getCenter();
		       gpolygon.bounds = this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ].bounds;

		       //set style
		       var polygon = gpolygon.polygon;
		       var style = this.styles[ id ];
		       this.setPolygonStyle( id, polygon, style );
				
			   //setup events			   
			   google.maps.event.addListener( this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ], "mouseover", function( evt ) {
			   		
			   		//get all polygons
			   		var polygons = self.gpolygons[ id ];
			   		if( polygons ) {
			   			var polyLen = polygons.length;
			   			for( var i = 0; i < polyLen; i++ ) {
			   				polygons[i].polygon.setOptions( { strokeColor: "#000", strokeWeight: 2, strokeOpacity: .6 } );
						}
			   		}
			   		
			   		var point = self.dummyOverlay.getProjection().fromLatLngToContainerPixel( evt.latLng );
                    
                    MapLayerOverviewPopUp.show();
                    MapLayerOverviewPopUp.moveTo( { top: point.y, left: point.x } );
                    self.updateOverviewPopup( id, name, this.fillColor );

			   	} );
			    google.maps.event.addListener( this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ], "mousemove", function( evt ) {
			   		var point = self.dummyOverlay.getProjection().fromLatLngToContainerPixel( evt.latLng );
                    MapLayerOverviewPopUp.moveTo( { top: point.y, left: point.x } );
			   	} );

			   google.maps.event.addListener( this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ], "mouseout", function() {
			   		
			   		//get all polygons
			   		var polygons = self.gpolygons[ id ];
			   		if( polygons ) {
			   			var polyLen = polygons.length;
			   			for( var i = 0; i < polyLen; i++ ) {
			   				if( style ) polygons[i].polygon.setOptions( { strokeColor: style.strokeColor, strokeWeight: 1, strokeOpacity: style.strokeOpacity } );
						}
			   		}

			   		MapLayerOverviewPopUp.hide();
			   		
			   	} );
				
				google.maps.event.addListener( this.geoXml.docs[ kmlIndex ].gpolygons[ 0 ], "click", function() {
			   		Map.handleClick( id );
			   	} );
		    } 
		    
		    gpolygon.name = name;

		    //exists already polygon with given id?
		    if( !gpolygons[ id ] ) {
		    	gpolygons[ id ] = [];
		    }
		    gpolygons[ id ].push( gpolygon );

		//}	
	},

	updateOverviewPopup: function( id, name, fillColor ) {
        
		function complete( data ) {
			MapLayerOverviewPopUp.update( data, name, fillColor );
		}

		MapLayerOverviewPopUp.updateName( name );
        var data = DataProxy.getDataForAreaOverview( id, complete, Application.filters );
    },

	updateLayerStyles: function( styles ) {
		this.styles = styles;

		for( var polygonId in this.gpolygons ) {
			
			var style = this.styles[ polygonId ];
			var polygons = this.gpolygons[ polygonId ];
			
			if( polygons ) {

				var polyLen = polygons.length;
				for( var i = 0; i < polyLen; i++ ) {

					var polygon = polygons[ i ];
					this.setPolygonStyle( polygonId, polygon.polygon, style );
			
				}
				
			}
		}

		//decide whether to hide preloader or not
		return ( this.gpolygons.length > 0 ) ? true : false;

	},

	setPolygonStyle: function( id, polygon, style ) {
		
		polygon.setVisible( true );
			
		if( style ) {
			polygon.setOptions( { 
       			strokeColor: style.strokeColor,
       			strokeOpacity: style.strokeOpacity,
       			fillColor: style.fillColor,
       			fillOpacity: style.fillOpacity
			} );
		} else {
			//no style, apply default
			//console.log( "default style", id );
			polygon.setOptions( this.DEFAULT_STYLE );
		}	
		
	}


}