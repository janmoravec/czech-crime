var $apiForm = $( "#api-form" );
var $crimeTypeSelect = $apiForm.find( "#crime-type-select" );
var $areaSelect = $apiForm.find( "#area-select" );
var $timeFromSelect = $apiForm.find( "#time-from-select" );
var $timeToSelect = $apiForm.find( "#time-to-select" );

var $resultTable = $( "#result-table" );
var $result2Table = $( "#result2-table" );
resetTables();


$apiForm.on( "submit", function( evt ) {
	
	evt.preventDefault();
	resetTables();

	var area = $areaSelect.val();
	var crimeType = $crimeTypeSelect.val();
	var timeFrom = $timeFromSelect.val();
	var timeTo = $timeToSelect.val();

	callAjax( area, crimeType, timeFrom, timeTo );

} );

function callAjax( area, crimeType, timeFrom, timeTo ) {

	var url = "?do=getCrimes";

	$.ajax( {

		url: url,
		dataType: "json",
		data: { areacode:area, crimetype: crimeType, timefrom: timeFrom, timeto: timeTo },
		success: function( data ) {
			
			if( data.crimesByArea ) {
				populateResultTable( $resultTable, data.crimesByArea );
			}

			if( data.crimesByTime ) {
				populateResultTable( $result2Table, data.crimesByTime );
			}

		},
		error: function( xhr ) {
			console.error( "ajax error", xhr );
		}

	} );

}

function populateResultTable( $table, data ) {

	//get rid of all data
	var $tableBody = $table.find( "tbody" );
	$tableBody.empty();

	//loop through data
	$.each( data, function( i,v ) {

		console.log("data2", v);
		var $tr = $( "<tr><td>" + v.Code + 
						"</td><td>" + v.Name + 
						"</td><td>" + v.CriminalityIndex + 
						"</td><td>" + v.FoundSum + 
						"</td><td>" + v.SolvedSum + 
						"</td><td>" + v.Population + "</tr>" );
		$tableBody.append( $tr );

	} );

	$table.show();
}

function resetTables() {

	var $tableBody = $resultTable.find( "tbody" );
	$tableBody.empty();
	$resultTable.hide();

	$tableBody = $result2Table.find( "tbody" );
	$tableBody.empty();
	$result2Table.hide();

}