var RankingsTable = {

	element:null,
	rows:null,
	note:null,
	ths:null,
	table:null,
	downloadBtn:null,
	buttons:null,
	graphButtons:null,
	selectBox:null,
	opts:null,
	hidden: true,
	cachedCrimeType:"",
	inited: false,

	init: function( opts ) {

		if( this.inited ) return;
		this.inited = true;

		var self = this;
		self.opts = opts;
		var tabulkyPage = $( "#tabulkyPage" );

		self.element = tabulkyPage.find( ".rankings" );
		self.table = self.element.find( "table" );
		
		//init rows
		self.rows = self.element.find( "tr" ).not(".header");
		
		//init selectbox
		var section = tabulkyPage.find( ".crimesSelect" );
		this.selectBox = new RankingSelectBox( section.find( "select.county" ), { onChange: self.selectChangeHandler } );

		//init sort
		fdTableSort.init();

		//init download button
		self.downloadBtn = self.element.find(".downloadBtn");
		self.downloadBtn.on( "click", function( evt ) {
			evt.preventDefault();
            getTable('rank');
            _gaq.push(["_trackEvent", "downloadDataRankingsTable", Application.currentKey() ]);
		});

		//init select 
		self.select = $("#tabulkyPage").find(".crimesSelect");
		self.note = $("#tabulkyPage").find(".crimesSelect").find(".note");
	},

	selectChangeHandler: function( crimeType ) {
		RankingsTable.updateToCrimeType( crimeType );
		Application.selectedCrimeType = crimeType;
	},

	updateToCrimeType: function( crimeType ) {
		
		if( typeof( crimeType ) == "undefined" ) {
			if( this.cachedCrimeType != "" ) {
				//has been crime type setted before
				crimeType = this.cachedCrimeType;
			} else {
				//set default crime type
				crimeType = "101-903";	
			}
		} 

		this.selectBox.setValue( crimeType );

		var self = this;
   		setTimeout( function() {

   			var data = DataProxy.getRankingsForCrimeType( crimeType );
			self.cachedCrimeType = crimeType;
			RankingsTable.update( crimeType, data );

   			Preloader.hide();

   		}, 50 );

		Preloader.show();
		
        _gaq.push(["_trackEvent", "updateToCrimeType", Application.currentKey(), crimeType ]);
	},

	update:function( crimeType, data ) {
		var self = this;
		self.selectBox.setValue( crimeType );

		//get rid of rows
		self.rows.remove();

		//update all rows
		var dataLen = data.length,
			rowsLen = self.rows.length,
			index = 0;

		var htmlString = "";
		for( index; index < dataLen; index++ ) {
			htmlString += this.addNewRow( index, data[index] );
		}
		self.table.append( $( htmlString ) );

		index = 0;
		
		//update rows selection
		self.rows = self.element.find( "tr" ).not(".header");
		self.rows.on( "mouseover", function() { 
			$tr = $( this );
			$tr.addClass("active");
		}).on( "mouseout", function() {
			$tr = $( this );
			$tr.removeClass("active");
		});
		rowsLen = self.rows.length,

		//update buttons listeners
		self.buttons = self.element.find(".displayTypesBtn");
		//remove all listeners first to avoid multification
		self.buttons.off( "click", self.displayCrimes );
		//add all listeners 
		self.buttons.on( "click", self.displayCrimes ); 
		
		self.graphButtons = self.element.find(".displayGraphBtn");
		//remove all listeners first to avoid multification
		self.graphButtons.off( "click", self.displayGraph );
		//add all listeners 
		self.graphButtons.on( "click", self.displayGraph );

		fdTableSort.init();
	},

	renumberRows: function(){
		var $trs = this.table.find( "tr" ).not(".header");
		
		$.each( $trs, function( i, row ) {
			var $tds = $( row ).find( "td" );
			$tds.eq( 0 ).text( i+1 );
		});
	},

	addNewRow: function( index, data ) {
		
		//var $tr = $( '<tr><td></td><td class="first"></td><td class="left"></td><td class="right"></td><td class="left"></td><td class="right"></td><td class="displayTypes"><a href="#" class="displayTypesBtn" title="'+texts["Zobrazit přehled"] +'"></a><a href="#" class="displayGraphBtn" title="'+texts["Zobrazit graf"] +'"></a></td></tr>' );
		//this.table.append( $tr );

		data.I = Math.max( 0, data.I );
		data.SolvedSum = Math.max( 0, data.SolvedSum );
		data.FoundSum = Math.max( 0, data.FoundSum );

		var indexStr = index + 1;
		var crimeIndex = Math.round( data.I * 10 ) / 10;
		var percent = Math.round( data.SolvedSum/data.FoundSum * 100 );
		//check for NaN
		if( isNaN( percent ) ) percent = "-";
		//check for infinity
		if( percent > 100*100 ) percent = "-";

		//check for units outside of order
		if( data.Name == "MOP Smíchovské nádraží" || 
			data.Name == "MOP Wilsonovo Nádraží" || 
			data.Name == "OŽP Masarykovo nádraží Praha I." ) {

			indexStr = "N/A";
		
		}

		return '<tr data-area-id="' + data.Code + '"><td>' + indexStr + '</td><td class="first">' + DataUtil.formatTitle( data.Name ) + '</td><td class="left">' 
		+ data.FoundSum + '</td><td class="right">'	+ crimeIndex + '</td><td class="left">'	
		+ data.SolvedSum + '</td><td class="right">' + percent + '</td><td class="displayTypes"><a href="#" class="displayTypesBtn" title="'
		+texts["Zobrazit přehled"] +'"></a><a href="#" class="displayGraphBtn" title="'+texts["Zobrazit graf"] +'"></a></td></tr>';
	},
	
	displayCrimes: function( evt ) {
		evt.preventDefault();
		
		var $btn = $( this );
		var $parentRow = $btn.parent().parent();
		var areaId = $parentRow.data( "area-id" );
		
		if( RankingsTable.opts.onDisplayCrimes ) RankingsTable.opts.onDisplayCrimes.apply( this, [ areaId ] );
	},

	displayGraph: function( evt ) {
		evt.preventDefault();
		
		var $btn = $( this );
		var $parentRow = $btn.parent().parent();
		var areaId = $parentRow.data( "area-id" );

		if( RankingsTable.opts.onDisplayGraph ) RankingsTable.opts.onDisplayGraph.apply( this, [ { area: areaId } ] );

		/*var $btn = $( this );
		var $parentRow = $btn.parent().parent();
		var areaId = $parentRow.data( "id" );
		
		if( RankingsTable.opts.onDisplayCrimes ) RankingsTable.opts.onDisplayCrimes.apply( this, [ areaId ] );
		*/
	},

	updateZoomLevel: function() {
		this.updateToCrimeType( Application.selectedCrimeType );

		//update note above crimebox
		/*var noteText = "Žebříček krajů podle:";
		if( Application.zoomLevel == 0 ) {
			noteText = "Údaje pro ČR pro trestné činy typu:";
		} else if( Application.zoomLevel == 2 ) {
			noteText = "Žebříček územních odborů podle:";
		}

		this.note.text( noteText );*/
   	},

	hide: function() {

		if( this.rows && this.element && this.select ) {

			this.rows.removeClass("active");
			this.element.hide();
			this.select.hide();

			this.hidden = true;

		}
		
	},

	show: function() {

		this.element.show();
		this.select.show();
	
		this.hidden = false;
	}
}

//sorting libarrycomplete callback
function sortCompleteCallbackrankingTable() {
        RankingsTable.renumberRows();
}
