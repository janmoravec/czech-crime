var MapDetailOverlay = {
	
	CIRCLE_RADIUS: 113,
	//CIRCLE_RADIUS: 80,
	CIRCLE_GAP: 7,
	ARC_WIDTH: 54,
	//ARC_WIDTH: 34,
	ARC_GAP: 2,
	X_ORIENTATION: -90,
	MARGIN_LEFT: 100,
	//MARGIN_LEFT: 0,
	MARGIN_TOP: 50,

	paper:null,
	$domWrapper:null,
	detailBox:null,
	graph:null,
	graphArc:null,
	$centerText:null,
	data:null,
	animated:null,
	$svg:null,
	darkOverlay:null,
	isDetailDisplayed:false,
	crimeTypes: [],

	display:function(data, animated){
		
		//reset stored values
		this.crimeTypes = [];
   		var crimeTypes = data.graphCrimes;

		//set 
		var isCompetitionBanner = Homepage.boxWrapper.hasClass( "competition-notice" );
		//based whether there is a banner, set text offset
		var centerTextOffset = ( isCompetitionBanner ) ? -15 : 25;
		if( Application.screenWidth < 600 ) {
			this.CIRCLE_RADIUS = 80;
			this.ARC_WIDTH = 34;
			this.MARGIN_LEFT = 0;
			centerTextOffset = 70;
		}

		//debug
		$('.contact').hide();

		var self = this,
			width = $(window).width(),
			height = $(window).height(),
			cx = width/2 + self.MARGIN_LEFT,
			cy = height/2 - self.MARGIN_TOP,
            pathObject = null, 
			totalCount = 0, 
			totalPieces = 0, 
			startAngle = 0;

		if( !self.darkOverlay ) {
			self.darkOverlay = $( ".mapDetailOverlayBack" );
		}

		self.darkOverlay.show();

		self.data = data;
		self.animated = animated;	

		if(!self.paper){
			//init raphael
			//self.paper = Raphael( 0, 0, width, height );
			self.paper = Raphael( "mapDetailOverlayHolder", width, height );

			//dislaying for the first time, init things once
			self.$domWrapper = $( "#mapDetailOverlayHolder" ); 

			//bind resize handler
			$(window).resize( function(){ self.resize(); } );
		}
		else{
			if( self.$centerText ) self.$centerText.remove();
			if( self.paper ) self.paper.clear();
		}

		self.$domWrapper.show();
		
		var callback = function(evt){
				self.close.apply(self);
			};

		self.$domWrapper.click( callback );

		//draw circle

		//adjust size of overlay to for markers width
		self.graph = self.paper.set();
		var circleRadius = ( animated ) ? 0 : self.CIRCLE_RADIUS;
		var circle = self.paper.set();
		
		//bug in raphael.js, need to overaly bit the arcs to avoid gap
		var graphicsOverlay = .3; 

		//check for more solved than found
		if( data.solvedSum > data.foundSum ) {
			data.foundSum = data.solvedSum;
		}

		var fullCircle = 360,
			solved = data.solvedSum,
			unsolved = data.foundSum - data.solvedSum,
			solvedArc = ( solved/data.foundSum ) * fullCircle,
			unsolvedArc = ( unsolved/data.foundSum ) * fullCircle;

		//check data for sanity
		if( unsolved < 0 ) {
			//wrong data
			//var errorText = self.paper.text(cx, cy, "Chyba v datech,\n více objasněných než spáchaných.").attr('font-size', '30px'); ;
			alert( texts["Máme problém s načtením dat, zkuste prosím zvolit jiné období nebo územní jednotku." ] );
	        Preloader.hide();
			return;
		}
		
		//if fullCircle, don't use graphics overlay
		if( fullCircle == 360 ) graphicsOverlay = 0;
		else graphicsOverlay = .3;

		//check for full 360
		solvedArc = Math.min( solvedArc, 359.99);
		unsolvedArc = Math.min( unsolvedArc, 359.99);

		var totalDataId = "101-903";
		var circleData = { index: data.index, 
						   FK_Crime_Lookup: totalDataId, 
						   FoundSum: data.foundSum, 
						   SolvedSum: data.solvedSum, 
						   CrimeName: "TRESTNÉ ČINY CELKEM",
						   CrimeName_en: "ALL CRIMES"  };
		self.crimeTypes[ totalDataId ] = circleData;

		var circleRadiusArc1 = self.drawPieChartArc( cx, cy, self.CIRCLE_RADIUS, 0, solvedArc, {"fill":"#333333","stroke-width":0});//self.paper.circle( cx, cy, circleRadius);
		var circleRadiusArc2 = self.drawPieChartArc( cx, cy, self.CIRCLE_RADIUS, solvedArc - graphicsOverlay , solvedArc+unsolvedArc,{"fill":"#555555","stroke-width":0});
		circleRadiusArc1.node.id = totalDataId;
		circleRadiusArc2.node.id = totalDataId;

		circle.push( circleRadiusArc1 );
		circle.push( circleRadiusArc2 );
		circle.rotate( -90, cx, cy );
		circle.scale( 1, -1, cx, cy );

		circle.click(callback);
		self.graph.push(circle);
		
		callback = function(evt){

			self.handleArc.apply( self,[ evt ] );
		};

		circle.mouseover( callback )
			  .mouseout( callback )
			  .mousemove( callback );
		
		//display values
		$.each(crimeTypes,function(i,v){
			//check for data sanity
			var valueToAdd = ( v["FoundSum"] > v["SolvedSum"] ) ? v["FoundSum"] : v["SolvedSum"];
			//var valueToAdd = ( v[2] > v[3] ) ? v[2] : v[3];
			totalCount += valueToAdd;
			totalPieces++;
		});

		self.graphArcs = self.paper.set();

		//flag if graph has children
		var hasChildren = false,
			hasData = false;

		//test 
		var fullCircleCount = 0;

		//log( "data.graph.data" , data.graph.data );

		var fullCircle = ( totalPieces > 1 ) ? 360 - ( ( self.ARC_GAP - graphicsOverlay ) * totalPieces) : 360;
		//if fullCircle, don't use graphics overlay
		if( fullCircle == 360 ) graphicsOverlay = 0;
		else graphicsOverlay = .3;

		//copy array
		var crimeTypesArray = Application.filters.slice(0);
		$.each( crimeTypes, function( i,v ) {
			
			var crimeCode = v[ "FK_Crime_Lookup" ];
			if( $.inArray( crimeCode, crimeTypesArray ) == -1 ) {
				//adding custom filter
				crimeTypesArray.push( crimeCode );
			}

		} );

		var typesLen = crimeTypesArray.length;
		//$.each(crimeTypes,function(i,v){
		for( var i = 0; i < typesLen; i++ ) {

			//it's overlay, graph gonna be displayed
			hasChildren = true;
			var v = crimeTypes[ crimeTypesArray[ i ] ];

			//check if given type exists 
			if( !v ) {
				continue;
			}

			var crimeCode = v["FK_Crime_Lookup"];

			//calculate angle to divide between pieces, need to substract gaps
			//var fullCircle = ( totalPieces > 1 ) ? 360 - ( ( self.ARC_GAP - graphicsOverlay ) * totalPieces) : 360;
			
			//start with 359, to clear Jesenik's case
			//log( totalPieces, graphicsOverlay, self.ARC_GAP );
			
			var	solved = v["SolvedSum"];
			var found = v["FoundSum"];
			var	unsolved = found - solved;

			//log( fullCircle, solved, unsolved );
			//check data sanity
			if( unsolved < 0 ) unsolved = 0;

			//sometimes, weird dat with more solved than commite
		
			var	solvedArc = (solved/totalCount) * fullCircle,
				unsolvedArc = (unsolved/totalCount) * fullCircle;

			fullCircleCount += fullCircle;

			//check if comitted crimes are not zero
			if( found != 0 ) hasData = true;

			//enforce minimun angles on arcs
			var minimum = .75;
			if( solvedArc < minimum && unsolvedArc < 360 ) {
				solvedArc = minimum;
				startAngle -= minimum;
			}
			if ( unsolvedArc < minimum && solvedArc < 360) {
				unsolvedArc = minimum;
				endAngle += minimum;
			}	

			var groupArc = self.paper.set();
			
			//get colors 
			var arcColors = DataUtil.getColorForCrimeType( crimeCode );
			
			//draw solved arc, push overlay
			if( solvedArc == 360 ) solvedArc = 359.99; 
			var endAngle = startAngle + solvedArc;
			var arc2 = self.drawArc( cx, cy, startAngle, endAngle );
			arc2.attr( { "stroke-width":self.ARC_WIDTH, "stroke": arcColors[0] });
			arc2.node.id = crimeCode;

			//draw unsolved arc
			if( unsolvedArc == 360 ) unsolvedArc = 359.99; 
			startAngle = endAngle - graphicsOverlay;
			endAngle = startAngle + unsolvedArc;
			var arc1 = self.drawArc( cx, cy, startAngle, endAngle );
			arc1.attr( { "stroke-width":self.ARC_WIDTH, "stroke": arcColors[1] });
			arc1.node.id = crimeCode;

			//store value for mouseover
			self.crimeTypes[ crimeCode ] = v;

			callback = function(evt){
				self.handleArc.apply(self,[evt]);
			};

			groupArc.push( arc1, arc2);
			groupArc.mouseover( callback )
				   .mouseout( callback )
				   .mousemove( callback );

			startAngle = endAngle + self.ARC_GAP;

			//self._graph.push(groupArc);
			self.graphArcs.push(groupArc);
		}

		self.graph.push( self._graphArcs );

		//is graph to be displayed
		if( !hasChildren || !hasData ){
			//nothing to display, hide graph
			self.paper.clear();
			self.close();
			return;
		}
		
		//append center html text
		self.$centerText = $("<div class='graphText'><span class='indexName'>" + texts["index kriminality"] + "</span><span class='indexValue'> </span><span class='country'> </span></div>");
		
		//self.$svg.after(self.$centerText);
		self.$domWrapper.append( self.$centerText );

		self.$centerText.find("span").css({display:"block"});
		self.$centerText.find("span.country").text( DataUtil.formatTitle( data.name ) );
		self.$centerText.find("span.indexValue").text( DataUtil.addSpaces( DataUtil.formatIndex( data.index ) ) );
		//self.$centerText.find("span.indexName").text(data.graph.index.name);

		//center text
		self.$centerText.css({position:"absolute"});
		var elWidth = self.$centerText.width(),
			elHeight = self.$centerText.height();
		self.$centerText.css({left:width/2 + self.MARGIN_LEFT - elWidth/2,top:height/2 - elHeight/2 - centerTextOffset});

		//load box
		//create wrapper
		if( !self.detailBox ) {
			self.detailBox = $("<div></div>");
			self.detailBox.load(templateDir + texts["/mapDetailOverlayBox.html"]);
			self.detailBox.css({position:"absolute", zIndex:10});
			self.detailBox.css("pointer-events", "none");
			self.$centerText.after(self.detailBox);
			self.detailBox.hide();
		}

		self.$centerText.find("a").on("click", function(){
			self.close();
		});
		
		self.isDetailDisplayed = true;

		//appear everything
		if( animated ) {
			circle.animate( {scale:5 },1000);
			//groupArc.hide();
			self.$centerText.hide();
			self.graphArcs.hide();
			self.graph.attr( {opacity:0} );
			self.graph.animate({opacity: 1}, 300);
			setTimeout( self.appear, 300 );

			MapLayerOverviewPopUp.hide();
		}
		else 
		{
			//no animation
			self.appear();
		}
	},

	appear:function(){
		var self = MapDetailOverlay;
		self.$centerText.show();

		var len = self.graphArcs.length;
		var i = 0;
		
		function appearArc() {

			var graphArc = self.graphArcs[ i ];
			graphArc.show();
			
			graphArc.attr( { "stroke-opacity": 0 } );
    		graphArc.animate({ "stroke-opacity": 1}, 25, 'linear', function(){});

			i++;

			if( i < len ) setTimeout( appearArc, 50 );

		}

		//appear first arc
		appearArc();

		//self.graphArcs.show();
	},

	drawArc:function( cx, cy, startAngle, endAngle){
		
		var self = this;
			arcRadius = self.CIRCLE_RADIUS + self.CIRCLE_GAP + self.ARC_WIDTH/2;

		var callback = function(evt){
			self.handleArc.apply(self,[evt]);
		};

		return self.paper.path( Arc.draw( cx, cy, startAngle, endAngle, arcRadius, self.X_ORIENTATION ) );
	},

	handleArc:function(evt){
		
		var self = this;
		var offsetY = 0;
		var offsetX = -4;
		
		var data = self.crimeTypes[ evt.target.id ];

		switch(evt.type){
			case "mouseover":
				self.displayDetailBox( data );
				self.moveBoxToPosition( evt.clientX - offsetX, evt.clientY - offsetY );
				break;
			case "mouseout":
				self.detailBox.hide();
				break;
			case "mousemove":
				self.moveBoxToPosition( evt.clientX - offsetX, evt.clientY - offsetY );
				break;		
		}
		
	},

	drawPieChartArc: function(cx, cy, r, startAngle, endAngle, params) {
        var self= this,
        	rad = Math.PI / 180,
			x1 = cx + r * Math.cos(-startAngle * rad),
            x2 = cx + r * Math.cos(-endAngle * rad),
            y1 = cy + r * Math.sin(-startAngle * rad),
            y2 = cy + r * Math.sin(-endAngle * rad);
        return self.paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
    },

	displayDetailBox:function(data){
		
		var self = this;
		//make it visible
		self.detailBox.show();
		
		//update data	
		if( appLanguage == "cz" ) self.detailBox.find("h2").text( data[ "CrimeName" ] );
		else self.detailBox.find("h2").text( data[ "CrimeName_en" ] );

		var found = data[ "FoundSum" ];
		var solved = data[ "SolvedSum" ];
		var unsolved = found - solved;

		//check if unsolved are not more than solved
		//if( unsolved < 0 ) unsolved = 0;

		self.detailBox.find(".first td").eq(2).text( DataUtil.addSpaces( Math.max( 0, solved ) ) );
		self.detailBox.find(".second td").eq(2).text( DataUtil.addSpaces( Math.max( 0, unsolved ) ) );
		
		var colors = DataUtil.getColorForCrimeType( data[ "FK_Crime_Lookup" ] );
		
		if( colors && colors.length == 2 ) {
			self.detailBox.find(".first .legend").css( "backgroundColor", colors[ 0 ] );
			self.detailBox.find(".second .legend").css( "backgroundColor", colors[ 1 ] );
		}
		
		var percentage = Math.round( ( solved / found ) * 100 );
		//check for NaN
		if( isNaN( percentage ) ) percentage = "0";
		
		//check data for sanity 
		//if( percentage > 100 ) percentage = "100";
		if( percentage > 100*100 ) percentage = "-";
		
		if( percentage != "-" ) self.detailBox.find(".percentage .value").text(  Math.min( 100, percentage ) + " %" );
		else self.detailBox.find(".percentage .value").text(  percentage + " %" );
	},

	moveBoxToPosition:function(x,y){
		this.detailBox.css( { left:x - this.detailBox.width()/2 + 10 , top:y - this.detailBox.height()} );
	},

	resize:function(width, height){

		var self = this;

		if( !self.$centerText ) return;
		
		if( self.isDisplayed() ) self.display( self.data, false );
	},

	close:function(){
		
		var self = this;
		self.isDetailDisplayed = false;

		if( !self.graphArcs ) return;

		self.graphArcs.hide();
		self.graph.attr( {opacity:1} );
		self.graph.animate({opacity: 0}, 300);
		if( self.$centerText ) self.$centerText.remove();

		if( self.detailBox ) self.detailBox.hide();

		setTimeout( function(){
			self.doClose(); }, 300 );
	},

	doClose:function(){
		var self = this;
		self.$domWrapper.hide();
		self.darkOverlay.fadeOut();
	},

	isDisplayed:function(){
		return this.isDetailDisplayed;
	}


}