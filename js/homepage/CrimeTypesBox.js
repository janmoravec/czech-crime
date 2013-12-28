var CrimeTypesBox = {

	selector: ".homepageCrimeTypesBox",
	content: null,
	element: null,
	jScrollApi: null,
	wasReinitialized:false,

	init: function(){  
		
		var self = this;
		self.element = $(self.selector);
		self.content = self.element.find( ".content" );
		self.lis = self.content.find( "li" );
		self.lis.on( "click", self.onLiClick );
		
		self.element.find( ".hideBtn" ).on("click", $.proxy( self.onHideBtnClick, this ) );
		self.element.find( ".chosen-select" ).chosen( { no_results_text:"Nic nenalezeno pro: " }); 
		
		self.input = self.element.find( ".crime-types-search" );
		self.input.on( "change keyup paste", function( evt ) { self.onCrimeSearch( this ); } );

		self.searchStyle = document.getElementById( "search_style" );

		self.content.jScrollPane();
		self.jScrollApi = this.content.data( "jsp" );
		self.jScrollApi.reinitialise();
		
	},

	onLiClick: function() {
		
		var $this = $( this );
		var crimeName = $this.text();
		var crimeType = $( this ).data( "crime-type" );
		
		if( !$this.hasClass( "unselectable" ) ) {
			Application.updateCustomCrime( crimeType, crimeName );
			CrimeTypesBox.hide();
		}
	},

	onCrimeSearch: function( input ) {

		var $input = $( input );
		var val = $input.val();
		if( val == "" ) {
			this.searchStyle.innerHTML = "";
		} else {
			this.searchStyle.innerHTML = ".searchable:not([data-search-name*=\"" + $input.val().toLowerCase() + "\"]) { display: none; }";
		}
		this.jScrollApi.reinitialise();

	},

	onHideBtnClick: function() {
		this.hide();
	},

	hide: function() {
		this.element.hide();
	},

	show: function() {
		this.element.show();
	},

	toggleVisibility: function() {
		
		if( this.element.is( ":visible" ) ) this.element.hide();
		else {
			this.element.show();
			
			if( !this.wasReinitialized ) {
				this.wasReinitialized = true;
				this.jScrollApi.reinitialise();
			}
		
		}
	}
}              
                