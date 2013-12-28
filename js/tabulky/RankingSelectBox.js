function RankingSelectBox( element, opts ) {
	
	this.element = element;
	this.options = this.element.find("option");
	this.selectedType = null;
	this.opts = opts;
	
	var self = this;
	
	this.element.on("change", function() {
		self.changeHandler( this );
	});
}

RankingSelectBox.prototype.changeHandler = function( btn ) {
	var name = $( btn ).val();
   
    if( this.opts.onChange ) this.opts.onChange.apply( this, [ name ] );
}

RankingSelectBox.prototype.setValue = function( type ){
	
	//set rankStepper value
	var selectedOption = this.element.val( type );
	//var selectedOption = this.options.filter("[data-type='" +type + "']" );
	selectedOption.attr('selected','selected');
	selectedOption.trigger("chosen:updated");

    this.selectedType = type;//selectedOption.data( "area" );

}

