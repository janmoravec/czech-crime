var $apiForm = $( "#api-form" );
var $crimeTypeSelect = $apiForm.find( "#crime-type-select" );
var $areaSelect = $apiForm.find( "#area-select" );
var $timeFromSelect = $apiForm.find( "#time-from-select" );
var $timeToSelect = $apiForm.find( "#time-to-select" );

var $dataPreloader = $( ".data-preloader" );

var $resultTable = $( "#result-table" );
var $result2Table = $( "#result2-table" );
resetTables();


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

	var fields = [ "Code", "Name", "Population", "CriminalityIndex", "FoundSum", "FoundSum",
	 "SolvedAdditionallySum", "CommittedDruggedSum", "CommittedAlcoholSum", "CommittedRecidivstSum",
	 "CommittedUnder15Sum", "Commited1517Sum", "CommittedUnder18Sum", "ChargedTotalSum", "ChargedRecidivistSum",
	 "ChargedUnder15Sum", "ChargedUnder15Sum", "Charged1517Sum", "ChargedWomenSum", "DamageTotalSum", "DamageFoundSum" ];

	//loop through data
	$.each( data, function( i,v ) {


		//for individual results add fk_time_lookup
		if( $table == $result2Table ) {
			fields.unshift( "FK_Time_Lookup" );
		}

		var string = "<tr>";

		$.each( fields, function( index, value ) {
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