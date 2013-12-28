function PorovnaniSelectBox( element, opts ) {
	
	this.element = element;
	this.options = this.element.find("option");
	this.rankStepper = null;
	this.selectedId = -1;

	var self = this;
	
	this.element.on("change", function() {
		var name = $(this).val();
        selectedOption = self.options.filter("[value='" + name + "']" );
       
        self.rankStepper.setValue ( selectedOption.data("rank") );
        self.selectedId = selectedOption.data( "area" );
        if( opts.onChange ) opts.onChange.apply( self, [ self.selectedId ] );
    });
}

PorovnaniSelectBox.prototype.setValue = function( id ){
	//set rankStepper value
	var selectedOption = this.options.filter("[data-area='" + id + "']" );
	selectedOption.attr('selected','selected');
	selectedOption.trigger("chosen:updated");

    this.rankStepper.setValue( selectedOption.data( "rank" ) );
    this.selectedId = selectedOption.data( "area" );
}

PorovnaniSelectBox.prototype.setValueByRank = function( rank ){
	//set rankStepper value
	var selectedOption = this.options.filter("[data-rank='" + rank + "']" );
	selectedOption.attr('selected','selected');
	selectedOption.trigger("chosen:updated");

    this.selectedId = selectedOption.data( "area" );
}

PorovnaniSelectBox.prototype.updateValues = function( values, keepSelected ){
	//log( values );
	var self = this;
		
	//store possible selected value
	var selectedOption = this.options.filter( ":selected" );
	
	self.element.empty();
	self.element.append( "<option data-rank='0' data-area='-1'></option>" );

	$.each( values, function( i, value ) {
		self.element.append( "<option data-rank='" + value.Rank + "' data-area='" + value.Code + "'>" + $.trim( value.Name ) + "</option>" );
	});

	self.element.trigger( "chosen:updated" );
	//update values
	self.options = this.element.find("option");

	//should we select again the unit ?
	if( keepSelected ) {
		if( selectedOption ) {
			self.selectedId = selectedOption.data("area");
			
			//reselect in the newly created list
			selectedOption = self.options.filter("[data-area='" + self.selectedId + "']" );
			selectedOption.attr('selected','selected');
			selectedOption.trigger("chosen:updated");
		}
	} else {
		self.selectedId = -1;
		
		var selectText = texts["Vyber kraj"];
		if( Application.zoomLevel == 2 ) selectText = texts["Vyber územní odbor"];
		else if( Application.zoomLevel == 3 ) selectText = texts["Vyber obvodní oddělení"];

		//update text hard way, no way to do it with chosen plugin
		self.element.next().find("span").text( selectText );
	}
}

PorovnaniSelectBox.prototype.getSelectedRank = function(){
	var selectedOption = this.options.filter("[data-area='" + this.selectedId + "']" );
	return ( selectedOption ) ? selectedOption.data( "rank" ) : 0;
}
