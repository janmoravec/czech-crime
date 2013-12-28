<?php 
	echo "start";
	$fileToProcess = "generated/crimeData-2013:11.csv";

	if( isset($_GET["file"]) ) {
		$fileToProcess = $_GET["file"];
	}
	echo "start1";
	//pimp up the execution limit
	set_time_limit(3000);
	ini_set('memory_limit', '-1');
	ini_set('display_errors',1); 
 	error_reporting(E_ALL);
	
	require_once("php/DbConnection.php");
	require_once("php/DbImporter.php");
	require_once("connection.php");

	$dbConnection = new DBConnection( $hostname, $username, $password, $dbname );
	
	$dbImporter = new DbImporter();
	//setup connection
	$dbImporter->setDbConnection( $dbConnection );

  	//list files in directories
  	$directory = "generated";
  	$files = array();
  	$arrayIndex = 0;

  	//for logging purposes
  	$dataInsertedIndex = 0;

  	foreach (new DirectoryIterator($directory) as $fn) {
     	array_push( $files, $directory . "/" . $fn->getFilename() );
 	}

 	$filesLen = count( $files );

 	function nextFile() {
 		global $arrayIndex,$files;
 		processFile( $files[$arrayIndex] );
 		complete();
 	}

 	function processFile($url) {

 		//process only required files
 		global $fileToProcess;
 		echo "processFile: " .$url. ", " .$fileToProcess. "<br />";

 		//TODO - fix this
 		//cannot compare string for some reason obtainer form getFilename()
 		//$url = substr( $url, 0, strpos( $url, "." ) );
 		//echo $url . "<br />";

 		echo ( $url == $fileToProcess ) ? "true" : "false";
 		echo "<br />";
 		//echo $identical . "<br />";

 		if( $url != $fileToProcess) return;
 		
 		#$rows = file($url);
 		$handle = fopen($url, 'r');
		
 		echo "= processing new file: " .$url . " =";
 		
 		$rows = array();
 		
 		while (($row = fgetcsv($handle)) !== false) {

 			//got rid of first and last entry, blank placehbolder for auto-increment id and currenttimestamp inserted at
 			array_shift( $row );
 			array_pop( $row );

			array_push( $rows, $row );
			echo "pushing</br>";
		
		} 
		
		echo "closing handler";
		fclose($handle);

		//
		global $dbImporter;
		$columnNames = array("FK_Time_Lookup","FK_Area_Lookup","FK_Crime_Lookup","Found","Found-end","Found-checked","Solved","Solved-perc","Solved-additionally","Committed-drugged","Committed-alcohol","Committed-recidivst","Committed-under-15","Committed-15-17","Committed-under-18","Charged-total","Charged-recidivist","Charged-under-15","Charged-15-17","Charged-women","Damage-total","Damage-found");
		$dbImporter->importData( "CrimeData", $rows, $columnNames );
 	}

 	function complete() {
 		global $arrayIndex, $filesLen, $dbhandle;
 		$arrayIndex++;

 		if( $arrayIndex < $filesLen ) {
 			nextFile();
 		} else {
 			echo "finish!!!";
 			global $dataInsertedIndex;
 			echo "There should be " .$dataInsertedIndex. " of lines in database.";
 			mysql_close($dbhandle);
 		}
 	}

 	//nextFile();
 	processFile( $fileToProcess );

?>