<?php 
	
	class DbImporter {

		//number of rows to import at one insert
		public $rowsAtOnce = 1;

		private $dbConnection;
		
		//vars for handling databases
		private $dbHandle;
		private $dbSelected;

		public function __construct() {
		}

		public function setDbConnection( DbConnection $dbConnection ) {
			$this->dbConnection = $dbConnection;
			$this->connect();
		}

		public function importData( $tableName, array $data, array $columnNames = null ) {
			
			echo "importData<br />";
			echo "number of lines: " . count( $data );

			//loop through all data
			/*foreach( $data as $dataRow ) {
				
				var_dump( $dataRow );
				echo "<br /><br /><br />";

				$updateSql = "INSERT INTO CrimeData_new (FK_Time_Range,FK_Area_Lookup,FK_Crime_Lookup,Found,`Found-end`,`Found-total`,`Solved`,`Solved-perc`,`Solved-additionally`,`Commited-drugged`,`Commited-alcohol`,`Commited-recidivst`,`Commited-under-15`,`Comitted-15-17`,`Comitted-under-18`,`Charged-total`,`Charged-recidivist`,`Charged-under-15`,`Charged-15-17`,`Charged-women`,`Damage-total`,`Damage-found`)";
		    	$updateSql .= " VALUES (".$dataRow[0].",".$dataRow[1].",'".$dataRow[2]."',".$dataRow[3].",".$dataRow[4].",".$dataRow[5].",".$dataRow[6].",".$dataRow[7].",".$dataRow[8].",".$dataRow[9].",".$dataRow[10].",".$dataRow[11].",".$dataRow[12].",".$dataRow[13].",".$dataRow[14].",".$dataRow[15].",".$dataRow[16].",".$dataRow[17].",".$dataRow[18].",".$dataRow[19].",".$dataRow[20].",".$dataRow[21].")";
		    	$result = mysql_query($updateSql);

			    if (!$result) {
			    	die('Invalid query: ' . mysql_error());
				}
			}*/

			//generate query
			$headerSql = "INSERT INTO " . $tableName;
			$headerSql .= "(";

			//TODO - if not specified columns 
			//generate columns string
			$columnNamesLen = count( $columnNames );
			foreach( $columnNames as $columnNameIndex => $columnNameValue ) {
				$headerSql .= "`" . $columnNameValue . "`";
				//add comma if not the last one
				if( $columnNameIndex < ( $columnNamesLen - 1 ) ) {
					$headerSql .= ",";
				}
			}

			$headerSql .= ")";

			//add values
			foreach( $data as $dataRow ) {
				$dataRowLen = count( $dataRow );

				//compose sql part with values
				$valuesSql = "VALUES";
				$valuesSql .= " (";
				
				//
				foreach( $dataRow as $dataRowIndex => $dataRowValue ) {
					$valuesSql .= "'" . $dataRowValue . "'";
					//add comma if not the last one
					if( $dataRowIndex < ( $dataRowLen - 1 ) ) {
						$valuesSql .= ",";
					}
				}

				$valuesSql .= ")";
				
		    	//compose final sql
		    	$sql = $headerSql;
		    	$sql .= " ";
		    	$sql .= $valuesSql;

		    	//execute query
		    	$result = mysql_query($sql);

		    	echo "<br/><br/>";
		    	echo $sql; 
		    	echo "<br/><br/><br/><br/>";
		    	
			    if (!$result) {
			    	die('Invalid query: ' . mysql_error());
				}
			}

		}

		private function connect() {
			//TODO - drop old connection if exists

			//connection to the database
			$this->dbHandle = mysql_connect( $this->dbConnection->hostname, $this->dbConnection->username, $this->dbConnection->password ) 
			  or die( "Unable to connect to MySQL" );
			
			//select a database to work with
			$this->selected = mysql_select_db( $this->dbConnection->dbName, $this->dbHandle ) 
		  		or die("Could not select ".$this->dbConnection->dbName);
		}

		

	}

?>