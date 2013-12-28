function RankStepper( element, selectBox, opts ) {

	this.element = element;
	this.selectBox = selectBox;
	this.arrowUp = null;
	this.arrowDown = null;
	this.p = null;
	this.min = 1;
	this.max = 10;
	this.opts = opts;

	var self = this;
	
	self.p = self.element.find( "p" );

	self.arrowUp = self.element.find(".rankUp");
	self.arrowDown = self.element.find(".rankDown");
	
	self.arrowUp.on("click",function( evt ){
		evt.preventDefault();
		self.update( "up" );
	});

	self.arrowDown.on("click",function( evt ){
		evt.preventDefault();
		self.update( "down" );
	});
}

RankStepper.prototype.updateRange = function( min, max){
	this.min = min;
	this.max = max;

	//reset values
	this.p.text( 0 );
}

RankStepper.prototype.update = function( dir ){
	var self = this,
		value = parseInt( this.p.text() );
	if( dir == "up"){
		if( value > self.min ) value--;
		else return;
	}
	else if( dir == "down"){
		if( value < self.max ) value++;
		else return;
	}

	//update selected option
	this.setValue( String( value ) );
	this.selectBox.setValueByRank( value ); 

	console.log( "update rank sterper", value );

    //trigger update
    if( this.opts.onChange ) this.opts.onChange.apply( this.selectBox, [ this.selectBox.selectedId ] );	
}

RankStepper.prototype.setValue = function( value ) {
	this.p.text( value );

	if( value > 99 ) this.p.addClass( "smallLetters" );
	else this.p.removeClass( "smallLetters" );
}

