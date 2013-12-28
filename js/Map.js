/* Author:
	zdenek.hynek@gmail.com
*/

var Map = {
	
	CUSTOM_MAP_TYPE_NAME: "Mapa kriminality",
	MAX_ZOOM: 16,
	MIN_ZOOM: 6,

    INITIAL_ZOOM: 7,
    INITIAL_LOCATION: new google.maps.LatLng(49.667718,13.8),

	map: null,
    infoWindow: null,
    fussionTablesLayer: null,
    isMapLayerActive: true,
      
	init:function( config ){
	   
		var self = this;
        var styles = [{
                    featureType: "all",
                    elementType: null,
                    stylers: [
                        { lightness: 30 },
                        { saturation:-100 }
                    ]
                }];
        var styledMapOptions = {
		                 name: self.CUSTOM_MAP_TYPE_NAME,
		                 alt: self.CUSTOM_MAP_TYPE_NAME
		              }
        var grayMapType = new google.maps.StyledMapType(styles, styledMapOptions);
			
		var myOptions = {
            center: self.INITIAL_LOCATION,
            zoom: self.INITIAL_ZOOM,
            panControl: false,
            zoomControl: false,
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            minZoom: self.MIN_ZOOM,
            maxZoom: self.MAX_ZOOM,
           // scrollwheel: false,
            mapTypeControlOptions: {
                mapTypeIds: []
            }
        };
        
        self.map = new google.maps.Map( document.getElementById(config.wrapperId), myOptions );
        self.map.mapTypes.set(self.CUSTOM_MAP_TYPE_NAME, grayMapType);
        self.map.setMapTypeId(self.CUSTOM_MAP_TYPE_NAME);

        self.infoWindow = new google.maps.InfoWindow();
       
        google.maps.event.addListener( self.map, "mouseout", function( evt ){
            MapLayerOverviewPopUp.hide();
        });

        google.maps.event.addListener( self.map, "dragstart", function( evt ){
            MapLayerOverviewPopUp.hide();
        });

        google.maps.event.addListener( self.map, "zoom_changed", function( evt ){
            ZoomControl.updateToMap( self.map.getZoom() );
        });

        google.maps.event.addListenerOnce( self.map, "tilesloaded", function( evt ) {
            $( "#mapWrapper" ).find( ".gmnoprint" ).eq( 0 ).css( "bottom", "35px" );
        });

        MapLayerOverviewPopUp.init();
        
        //temp
        self.updateMapLayer();
        
        MapLayer.init( self.map );

	},
    
    updateMapLayer:function() {

        var self = this;
        //console.log( "updateMapLayer" );
        var styleValues = DataProxy.loadMapStyles( Application.zoomLevel );
        var styles = self.writeStyle( styleValues );
        
        //var styles = self.writeStyle( styleValues["styles"] );
      
        //using polygons layer
        var notFirstLoad = MapLayer.updateLayerStyles( styles );
        if( notFirstLoad ) Preloader.hide();
    },

    handleClick:function( event ) {

        //check for correct value
        
        //update app model
        Application.updateSelectedUnit( event, null, true );

        //prevent default
        Map.infoWindow.close();
        
        _gaq.push(["_trackEvent", "mapClick", Application.currentKey() ]);
    },

    writeStyle: function( data ) {
        
        var self = this;
        
        //loop through everything to scope data
        var values = [];
        $.each( data, function( i, v ){
            values.push( Math.round( v.I * 10 ) / 10 );
        });

        var ranges = DynamicRange.classifyJenks( values, 5, data.maxValue );
        Legend.updateRanges( ranges );
        MapLayerOverviewPopUp.updateRanges( ranges );
        
        //loop to sort unit ids to ranges
        var colors = [];
        $.each( data, function( i, v ){
            //console.log( v );
            var color = Legend.getColorFromIndexValue( v.I );
            //polygon layer
            colors[ v.Code ] = { 
                id: v.Code, 
                fillColor: color, 
                fillOpacity: .6, 
                strokeColor: "#333333",
                strokeOpacity: .5 
            }
        } );

        return colors;
    },

    zoomIn:function(){
		var self = this,	
			zoom = self.map.getZoom();
		
                if(zoom < self.MAX_ZOOM) {
                    zoom++;
                    self.map.setZoom(zoom);
                    return true;
                }
                else {
                    return false;
                }
	},

	zoomOut:function(){
		var self = this,	
			zoom = self.map.getZoom();


		if(zoom > self.MIN_ZOOM)
                {
                    zoom--;
                    self.map.setZoom(zoom);
                    return true;
                }
                else
                {
                    return false;
                }
	},

    setViewPort: function( location, param ) {

        if( param instanceof google.maps.LatLngBounds ) {
      
            //using bounds
            this.map.fitBounds( param );
      
        } else {
      
            //using zoom level
            this.map.setZoom( param );
            this.map.setCenter( location ); 
           
        }

    },

    clearMapLayer: function() {
       MapLayer.clear();
    },

    resetMap: function() {

        if( this.map ) {

            this.map.setCenter( this.INITIAL_LOCATION );
            this.map.setZoom( this.INITIAL_ZOOM );

        }

    }
}
