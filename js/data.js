var $apiForm = $( "#api-form" );
var $selects = $apiForm.find( "select" );
var $crimeTypeSelect = $apiForm.find( "#crime-type-select" );
var $areaSelect = $apiForm.find( "#area-select" );
var $timeFromSelect = $apiForm.find( "#time-from-select" );
var $timeToSelect = $apiForm.find( "#time-to-select" );

var $downloadBtn = $( "#download-csv-btn" );

var $dataPreloader = $( ".data-preloader" );

var $resultTable = $( "#result-table" );
var $result2Table = $( "#result2-table" );
resetTables();

$selects.on( "change", function() {

	//update link
	var area = $areaSelect.val();
	var crimeType = $crimeTypeSelect.val();
	var timeFrom = $timeFromSelect.val();
	var timeTo = $timeToSelect.val();

	var url = $downloadBtn.attr( "href" );
	url = url.substr( 0, url.indexOf( "?" ) );
	var suffix = "?areacode=" + area + "&crimetype=" + crimeType + "&timefrom=" + timeFrom + "&timeto=" + timeTo;
	url = url + suffix;

	console.log( url );
	$downloadBtn.attr( "href", url );

});

//init chosen
$( "#crime-type-select" ).chosen();
$( "#area-select" ).chosen();
$( "#time-from-select" ).chosen();
$( "#time-to-select" ).chosen();

$apiForm.on( "submit", function( evt ) {
	
	evt.preventDefault();
	resetTables();
	$dataPreloader.show();

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
			
			$dataPreloader.hide();

			if( data.crimesByArea ) {
				populateResultTable( $resultTable, data.crimesByArea );
			}

			if( data.crimesByTime ) {
				populateResultTable( $result2Table, data.crimesByTime );
			}

			//appear download btn
			$downloadBtn.show();

		},
		error: function( xhr ) {
			console.error( "ajax error", xhr );
		}

	} );

}

function populateResultTable( $table, data ) {

	console.log( "populateResultTable" );

	//get rid of all data
	var $tableBody = $table.find( "tbody" );
	$tableBody.empty();

	var fields = [ "Code", "Name", "Population", "CrimeRate", "Found", "Solved",
	 "Solved-additionally", "Committed-drugged", "Committed-alcohol", "Committed-recidivst",
	 "Committed-under-15", "Committed-15-17", "Committed-under-18", "Charged-total", "Charged-recidivist",
	 "Charged-under-15", "Charged-15-17", "Charged-women", "Damage-total", "Damage-found" ];

	//for individual results add fk_time_lookup
	if( $table == $result2Table ) {
		fields.unshift( "TimePeriod" );
	}

	//loop through data
	$.each( data, function( i,v ) {


		var string = "<tr>";

		$.each( fields, function( index, value ) {
			console.log( value, v[value] );
			string += "<td>" + v[value] + "</td>";
		}	);

		string += "</tr>";


		var $tr = $( string );
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