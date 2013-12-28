function PorovnaniTable( element ){

	this.element = element;
	this.rows = this.element.find("section.table table tr");
	this.data = null;
	this.index = 0;
	this.maxIndexValue = 0;
	this.customRow = this.rows.last();

	//hide by default
	this.customRow.hide();
}

PorovnaniTable.prototype.update = function( data ){

	if( !data ) return;

	var self = this;
    this.index = data.index;
    this.data = data;
    var graphCrimes = data.graphCrimes;
  	var maxWidth = self.maxBarWidth();
	var logBase = .1;
	
	//update static values
	//self.updateStaticValues( filterData.damage, data.officers );
	
	if( !graphCrimes ) return;

	//update data in all rows
	$.each( this.rows, function(i,v){
		var $row = $(v),
			crimeType = $row.data("crime-type");

		//treat className for singularity
        var	rowData = graphCrimes[ crimeType ];
        if( rowData ) {

        	comValue = parseInt( rowData.FoundSum ),
			solvValue = parseInt(  rowData.SolvedSum ),
			percent = Math.round( ( solvValue / comValue ) * 100 );
		
			//check for NaN
			if( isNaN( percent ) ) percent = "-";
			//check for infinity
			if( percent > 100*100 ) percent = "-";

			var isDataSane = DataUtil.checkDataSanity( rowData );
				
			$row.find("td.title").text( rowData.name ); 
			$row.find("td.first").text( DataUtil.addSpaces( comValue ) ); 
			$row.find("td.second").text( DataUtil.addSpaces( solvValue ) ); 
			$row.find("td.third").text( percent );
			$row.find("td.bar .value").text( DataUtil.addSpaces( Math.round( rowData.index*10 )/10 ) );

			var width = 0;
			if( rowData.index > 0 ) {
				width = ( Math.sqrt( rowData.index, logBase ) / Math.sqrt( self.maxIndexValue, logBase )  ) * maxWidth;
			}

			$row.find("td.bar div.graph").width( width );

        } else {

        	var symbol = ( crimeType == - 1 ) ? "-" : "0";

        	//no data for given crime type
        	$row.find("td.first").text( symbol ); 
			$row.find("td.second").text( symbol ); 
			$row.find("td.third").text( symbol );
			$row.find("td.bar .value").text( symbol );

        }
			
	});
        
    self.element.find("h2").html( Math.round( self.index*10 )/10 );

    var width = ( Math.sqrt( self.index, logBase ) / Math.sqrt( self.maxIndexValue, logBase ) ) * maxWidth;
    //log( "max width" );
    //log( width, self.index, self.maxIndexValue, maxWidth );
    self.element.find( ".index div.graph" ).width( width );
	self.computeVisibleValues();
 
}

PorovnaniTable.prototype.updateTotalValues = function( totalCom, totalSolv ){
	//update total values
   	var $totalTableValues = this.element.find(".total").find(".values");
  	$totalTableValues.find(".first").html( DataUtil.addSpaces( totalCom ) );
  	$totalTableValues.find(".second").html( DataUtil.addSpaces( totalSolv ) );
  	var totalPercentage = Math.round( ( totalSolv / totalCom ) * 100 );
  	//check for NaN
	if( isNaN( totalPercentage ) ) totalPercentage = "-";
  	$totalTableValues.find(".third").html( totalPercentage );
}

PorovnaniTable.prototype.updateCustomCrime = function( crimeType, crimeName ) {

	console.log( "porovnani table update cusotm crime" );
	console.log( crimeType, crimeName );
	console.log( this.customRow );

	this.customRow.attr( "data-crime-type", crimeType );
	var $title = this.customRow.find( ".title" );
	$title.html( crimeName );

	this.customRow.show();

}

PorovnaniTable.prototype.updateStaticValues = function( damage, officers ){
	//update static values
   	var $staticTableValues = this.element.find(".staticData").find(".total");
   	var $tds = $staticTableValues.find( "td" );
   	
   	if( damage && damage != "NaN" ) {
   		$tds.eq(0).html( DataUtil.addSpaces( damage ) + " Kč" );
   		$tds.eq(0).removeClass( "noData" );
  	} else {
  		$tds.eq(0).html( texts["Data nejsou k dispozici"] );
  		$tds.eq(0).addClass( "noData" );
  	}
  	
  	$tds.eq(1).html( officers );
}

PorovnaniTable.prototype.computeVisibleValues = function(){

	var self = this,
		visibleRows = this.rows.filter(":visible"),
		totalCom = 0,
		totalSolv = 0;

	if( !self.data ) return;

	$.each( visibleRows, function(i,v){
		var $row = $(v),
			crimeType = $row.data("crime-type");
            	 
		var	rowData = self.data.graphCrimes[ crimeType ];
		if( rowData ) {
			comValue = rowData.FoundSum;
			solvValue = rowData.SolvedSum;
			totalCom += comValue;
			totalSolv += solvValue;
		}
			
	});

	this.updateTotalValues( totalCom, totalSolv );
}

PorovnaniTable.prototype.maxBarWidth = function() {
	var offset = ( Application.screenWidth > 1200 ) ? 440 : 360;

	return Application.screenWidth / 2 - offset;
}

PorovnaniTable.prototype.resize = function() {

	this.update( this.data );
}

PorovnaniTable.prototype.clearValues = function() {
	var symbol = "-";
	this.element.find( "td.first" ).text( symbol );
	this.element.find( "td.second" ).text( symbol );
	this.element.find( "td.third" ).text( symbol );

	//clear static data 
	var $staticTableValues = this.element.find(".staticData").find(".total");
   	var $tds = $staticTableValues.find( "td" );
   	$tds.text( symbol );

   	//clear index value
   	this.element.find("h2").text( symbol );

   	//clear bars
   	this.rows.find("td.bar div.graph").width( 0 );
   	this.rows.find("td.bar div.value").text( "" );
   	this.element.find( ".index div.graph" ).width( 0 );
}


/**
* @function Math.logx
* @purpose: To provide the logarithm for any base desired. Default base is 10.
* @returns a number.
*/
Math.logx = function(x,base) {
    return (Math.log(x)) / (Math.log(base | 10 ));
}