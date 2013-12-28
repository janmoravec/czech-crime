var ZoomControl = {

	SLIDER_POSITION_HEIGHT:5,
	SLIDER_MIN_OFFSET:-95,
	SLIDER_MAX_OFFSET:-5,

	wrapper:null,
	element:null,
	slider:null,
	layerBtns:null,
	step:null,
	activeLayerBtn:null,
	slider:null,

	init:function(){

		var self = this;
                
		self.element = $( ".zoomControl" );
          
        switch( Application.zoomLevel ) {
        	case 0:
        		self.element.find("li.country div").addClass("selected");
        		break;
        	case 1:
        		self.element.find("li.county div").addClass("selected");
        		break;
        	case 2:
        		self.element.find("li.district div").addClass("selected");
        		break;
        	case 3:
        		self.element.find("li.department div").addClass("selected");
        		break;
        }       
       
                
		self.layerBtns = self.element.find("li");
		self.layerBtns.on("mouseover",function(){
			$(this).find("div").addClass("active");
		}).on("mouseout",function(){
			$(this).find("div").removeClass("active");
		});

		self.slider = self.element.find( ".btn" );
	},

	updateToMap: function( mapZoomLevel ) {
		var top = this.getSliderPositionForZoomLevel( mapZoomLevel );
		this.slider.css( "top", top );
	},

	getSliderPositionForZoomLevel: function( mapZoomLevel ) {

		var top = 0;

		switch( mapZoomLevel ) {
			case 8:
				top = "-15px";
				break;
			case 9:
				top = "-26px";
				break;
			case 10:
				top = "-37px";
				break;
			case 11:
				top = "-48px";
				break;
			case 12:
				top = "-59px";
				break;
			case 13:
				top = "-70px";
				break;
			case 14:
				top = "-81px";
				break;
			case 15:
				top = "-92px";
				break;
			case 16:
				top = "-103px";
				break;
		}

		return top;
	},

	switchToTabulky:function() {
		this.element.addClass( "tabulky" );
	},

	switchToNormal:function() {
		this.element.removeClass( "tabulky" );
	}
}