var LogIn = {

	forgetPasContent:null,

	show: function(){

		var self = this;

		//get remote document, cannot use load, cause it replace html content straight away
		$.ajax({
			url:"autorizace.html",
			dataType:"html",
			success:function(results){
				self.displayPage( self, results);
			}
		});
		
		//$("#main").append("<div>content</div>");
		//$("#pageContent").load(url,self.displayPage);
	},

	hide: function(){
		//remove previous pagecontent
		$(".insertedLogInContent").remove();
	},

	displayPage: function(self,results){
		
		var self = this;

		//remove previous pagecontent
		$(".insertedLogInContent").remove();

		//display new
		var strippedString = $.trim(results);
		var html = $(strippedString);
		//inject class to schedule for replacement
		html.each(function()
		{
			$(this).addClass("insertedLogInContent");
		});
		$("#main").append( html );
		html.css( {position:"absolute",top:"10px",right:"10px"} );

		self.forgetPasContent = html.find(".forgetPasContent");

		html.find(".lostPass").on("click",function(){
			log("lost pass click");
			self.forgetPasContent.toggle();
		});
	}

}
