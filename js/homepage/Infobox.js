var InfoBox = {
	
	dummyData: {title:"title",content:"content"},

	selector: ".homepageInfoBox",
	headerUnit:null,
	index:null,
	damage:null,
	damageValue:null,
	title:null,
	rank:null,
	total:null,
	officers:null,
	element: null,
	origHeight:null,
	collapsed:false,

	init: function(){
		
		var self = this;
		self.element = $(self.selector);
		self.origHeight = self.element.find(".content").outerHeight();

		self.headerUnit = self.element.find(".headerWrapper").find("h1");
		self.title = self.element.find( "#county" );
        self.index = self.element.find( "#ic" );
        self.total = self.element.find( "#totalcrime" );
        self.officers = self.element.find( "#officers" );
        self.damage = self.element.find( "#damage" );
        self.rank = self.element.find( ".rank" );

		//bind events
		self.element.find(".hideBtn").on("click",function(){
			var $this = $(this);
			self.element.find(".content").slideToggle( 300 );
			$('.contact').hide();
			$this.toggleClass("hideBtnDown");
			$this.parent().toggleClass("noBorder");

			var contHeight = self.origHeight;
			var offset = $this.hasClass("hideBtnDown") ? contHeight : -contHeight;

			self.collapsed = ( offset > 0 ) ? true : false; 

			Homepage.updateLayout( offset, self );
		});

		self.element.find( ".contactBtn").on("click",function(){
			ContactForm.show();
			MapDetailOverlay.close();

			 _gaq.push(["_trackEvent", "contactBtn", Application.currentKey() ]);
		});
                
        /* RESTORING SELECTED AREA */
        if(area != "") {
     
          Application.updateSelectedUnit( area );
     
        }
       
	},

	update: function( data ){
		
		var self = this;
		//console.log( "data", data );

		if( appLanguage == "en" && Application.zoomLevel == 0 ) self.title.html( "Czech republic");
		else self.title.html( DataUtil.shortenText( DataUtil.formatTitle( data.name ), "...", 18 ) );
       
        /*if( self.title.width() > 200 ) self.title.addClass( "smallLetters" );
        else self.title.removeClass( "smallLetters" );*/

        var index = data.index;
        //check for data not available
        if( isNaN( index ) ){
          //data not available
          self.index.addClass( "noData" );
        } else {
          //alright
          self.index.removeClass( "noData" );
        }
        self.index.html( DataUtil.addSpaces( DataUtil.formatIndex( index ) ) );
        self.total.html( DataUtil.addSpaces( data.foundSum ) );

        //console.log( "Application.filters:", Application.filters );

        //check if we should display damage
        var displayDamage = true;
        var lowerBound = 300;
        var upperBound = 500;
        var filtersLen = Application.filters.length;

        for( var i = 0; i < len; i++ ) {

        	var filter = Application.filters[ i ];
        	//console.log( "filter", filter, filter < lowerBound, filter < upperBound, ( filter < lowerBound || filter > upperBound ) );
        	if( filter != "373,373" 
        		&& filter != "433,434" 
        		&& ( filter < lowerBound || filter > upperBound ) ) {
        		displayDamage = false;
        		break;
        	}

        	if( filter == "101-106" ||
        		filter == "131,132" ||
        		filter == "141,142,143,151,161,171,173,181,611,612,614" ||
        		filter == "635,641,642,643" ) {
        		
        		displayDamage = false;
        		break;

        	}
        
        }

        //data.damage
        if( displayDamage ) {
        	var damage = DataUtil.addSpaces( data.damage ) + " Kč" ;
        	this.damage.html( damage );
        	this.damage.removeClass( "noData" );
        } else {
        	this.damage.html( texts["Data nejsou k dispozici"] );
			this.damage.addClass( "noData" );
        }
        
        /*if( self.damage.height() > 40 ) self.damage.addClass( "smallLetters" );
        else self.damage.removeClass( "smallLetters" );

        if( data.officers ) self.officers.html( addSpaces( data.officers ) );
        else self.officers.html( 0 );*/

        //get index data 
        var rankValue = 1;
        if( Application.zoomLevel > 0 ) {
        	//different level than Cela CR, need to find actual index value
        	//rankValue = ( data.rankValue ) ? data.rankValue : self.findRankById( data.id );
        	rankValue = self.findRankById( data.id );
        	
        	//adjust styling if necessary
	        if( rankValue > 99) self.rank.addClass( "longRank" );
	        else self.rank.removeClass( "longRank" );
	    }
        
        self.rank.html( DataUtil.addSpaces( rankValue ) );

	},

	findRankById: function( id ) {

		var data = DataProxy.getCachedData( DataProxy.NAMES_INDEXES_KEYWORD );
        if( data && data.array ) {
        	var rank = 0;
	        $.each( data.array, function( i, v) {
	        	if( v.Code == id ) {
	        		rank = v.Rank;
	        		return false;
	        	}
	        } );

	    	return rank;
		} else {

			return 0;
		
		}
        

        
	},

	toggleNaNForDamage: function( display ) {
		
		if( display ) {
			this.damage.html( texts["Data nejsou k dispozici"] );
			this.damage.addClass( "noData" );
		} else {
			this.damage.html( this.damageValue );
			this.damage.removeClass( "noData" );
		}
	},

	updateZoomLevel: function( level ) {
			
		//update title
		var title = "";
		if( level == 0 ) title = texts["ČR"];
		else if( level == 1 ) title = texts["KRAJ"];
		else if( level == 2 ) title = texts["ÚZEMNÍ ODBOR"];
		else if( level == 3 ) title = texts["OBVODNÍ ODDĚLENÍ"];

		this.headerUnit.text( title );

		this.clearValues( level );
	},

	clearValues: function( level ) {
		var self = this,
			symbol = "-",
			titleMsg = "";

		if( level == 1 ) titleMsg = texts["Vyber kraj v mapě"];
		else if( level == 2 ) titleMsg = texts["Vyber odbor v mapě"]; 
		else if( level == 3 ) titleMsg = texts["Vyber oddělení v mapě"]; 

		self.title.html( titleMsg );
		self.index.html( symbol );
        self.total.html( symbol );
        //self.officers.html( symbol );
        
        self.damage.html( symbol );
        
		//store value
		//self.damageValue = damage;

        self.rank.removeClass("longRank");
        self.rank.html( 0 );
	}

}