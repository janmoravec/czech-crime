var AboutApplication = {

	results:null,
	title:"",
	clickedTabIndex:0,

	init:function( slug ){
		
		//load specific subpage
		var self = this;

		//determine url
		var url;
		switch( slug )
		{
			case "#oAplikaciMapa":
				url = "oAplikaci-mapaKriminality.html";
				self.title = texts["Mapa kriminality"];
				self.clickedTabIndex = 0;
				break;
			case "#oAplikaciData":
				url = "oAplikaci-data.html";
				self.title = texts["Data"];
				self.clickedTabIndex = 1;
				break;
			case "#oAplikaciUzivatele":
				url = "oAplikaci-uzivatele.html";
				self.title = texts["Uživatelé"];
				self.clickedTabIndex = 2;
				break;
			case "#oAplikaciAutori":
				url = "oAplikaci-autori.html";
				self.title = texts["Autoři"];
				self.clickedTabIndex = 3;
				break;
		}

		$.ajax({
			url:url,
			dataType:"html",
			success:function( results ){
				self.loadPage( self, results );
			}
		});
	},

	loadPage: function( self, results){
		self.results = results;
		self.displayLoadedPage();
	},

	displayLoadedPage: function(){
		
		var self = this;

		//remove previous pagecontent
		$(".insertedSubpageContent").remove();

		//display new
		var strippedString = $.trim( self.results );
		var html = $(strippedString);
		//inject class to schedule for replacement
		html.each( function(){
			$(this).addClass("insertedSubpageContent");
		});
		
		$("#oAplikaciPage").find(".subpageHolder").append( html );

		//get tabs
		var tabs = $("#oAplikaciPage").find(".header a");
		$.each( tabs, function(i,v){
			if( i != self.clickedTabIndex ) $(v).removeClass("active"); 
			else $(v).addClass( "active" );
		});
		
		$("#oAplikaciPage").find(".header h1").text( self.title );



	}
}