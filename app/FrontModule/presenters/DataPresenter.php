<?php

/**
 * Data presenter.
 *
 * @author     Zdenek Hynek
 * @package    MapaKriminality.cz
 */

namespace FrontModule;

use Nette\Application\UI\Form;
use Nette\Diagnostics\Debugger;
use Nette\Application\Responses\JsonResponse;

class DataPresenter extends BasePresenter
{
	/** @var string $lang  */
    public $lang;

    public function startup() {
       
        parent::startup();
        
        $this->lang = "cz";

		//determine which language version
		if( $_SERVER && $_SERVER["SERVER_NAME"] ) {
			$serverName = $_SERVER["SERVER_NAME"];
			if( strrpos( $serverName, "czechcrime" ) == 0 ) {
				$this->lang = "en";
			}
		}

    }

    /**
     * Presenter action Default.
     */
    
	public function actionDefault()
	{  
		$this->template->crimeTypes = $this->models->CrimeData->getApiCrimeTypes();
		$this->template->areas = $this->models->CrimeData->getApiAreas();

		$timeRanges =  $this->models->CrimeData->findTimeRange()->fetch();
		$this->template->timeMin = $timeRanges[ "Min" ];
		$this->template->timeMax = $timeRanges[ "Max" ];
		$this->template->times = $this->models->CrimeData->getTimeRangesForMixMax( $timeRanges[ "Min" ], $timeRanges[ "Max" ] );
	}

	public function renderCsv( $areacode, $crimetype, $timefrom, $timeto ) 
	{	
		
		$areaCrimes = $this->models->CrimeData->getDataAreaInfo( $areacode, $timefrom, $timeto, $crimetype )->fetch();
		$crimesByArea = $this->models->CrimeData->getApiCrimes( $areacode, $crimetype, $timefrom, $timeto, "area", true )->fetchAll();
		$crimesByTime = $this->models->CrimeData->getApiCrimes( $areacode, $crimetype, $timefrom, $timeto, "time", true )->fetchAll();
		
		foreach( $crimesByArea as $crime ) {
			$crime["Code"] = $areaCrimes["Code"];
			$crime["Name"] = $areaCrimes["Name"];
			$crime["Population"] = $areaCrimes["Population"];
		}

		foreach( $crimesByTime as $crime ) {
			$crime["Code"] = $areaCrimes["Code"];
			$crime["Name"] = $areaCrimes["Name"];
			$crime["Population"] = $areaCrimes["Population"];
		}

		$output = array();
		
		Debugger::log( "lang1" );
		Debugger::log( $this->lang );

		//go through all fields and map them to czech titles and skip unwanted properties
		$blackListedProperties = array( "Found-checked", "Found-end", "Solved-perc" );
		foreach( $crimesByTime as $crimeKey=>$crimeValue ) {
			
			$output[ $crimeKey ] = array();
			foreach( $crime as $crimeTypeKey => $crimeTypeValue ) {

				//check if not blacklisted property
				if( !in_array( $crimeTypeKey, $blackListedProperties) ) {
					
					Debugger::log( "lang2" );
					Debugger::log( $this->lang );
		
					//need to translate property name?
					$propertyName = ( $this->lang == "cz" ) ? $this->mapProperties( $crimeTypeKey ) : $crimeTypeKey ;
					$output[ $crimeKey ][ $propertyName ] = $crimeTypeValue; 
				}
				
			}

		}


		$this->sendResponse( new \CsvResponse( $output, "crimes-" .$areacode . "-" . $crimetype . "-" . $timefrom . "-" . $timeto .".csv") );

		$this->terminate();
	}

	public function handleGetCrimes( $areacode, $crimetype, $timefrom, $timeto ) {
		
		$areaCrimes = $this->models->CrimeData->getDataAreaInfo( $areacode, $timefrom, $timeto, $crimetype )->fetch();
		$crimesByArea = $this->models->CrimeData->getApiCrimes( $areacode, $crimetype, $timefrom, $timeto, "area", true )->fetchAll();
		$crimesByTime = $this->models->CrimeData->getApiCrimes( $areacode, $crimetype, $timefrom, $timeto, "time", true )->fetchAll();
		
		foreach( $crimesByArea as $crime ) {
			$crime["Code"] = $areaCrimes["Code"];
			$crime["Name"] = $areaCrimes["Name"];
			$crime["Population"] = $areaCrimes["Population"];
		}

		foreach( $crimesByTime as $crime ) {
			$crime["Code"] = $areaCrimes["Code"];
			$crime["Name"] = $areaCrimes["Name"];
			$crime["Population"] = $areaCrimes["Population"];
		}

		$output = array();
		$output[ "crimesByArea" ] = $crimesByArea;
		$output[ "crimesByTime" ] = $crimesByTime;

		echo json_encode( $output );
		
		$this->terminate();

	}

	public function mapProperties( $enName ) {

		$czName = "";
		switch( $enName ) {
			case "CrimeRate":
				$czName = "Index kriminality";
				break;
			case "Found":
				$czName = "Zjištěno"; 
				break;
			case "Solved":
				$czName = "Objasněno- Počet";
				break;
			case "Solved-additionally":
				$czName = "Objasněno- Dodatečně";
				break;
			case "Population":
				$czName = "Počet obyv. úz. jednotky";
				break;
			case "Name":
				$czName = "Název úz.jednotky";
				break;
			case "Code":
				$czName = "Kód úz.jednotky";
				break;
			case "TimePeriod":
				$czName = "Časová jednotka";
				break;
			case "Charged-15-17":
				$czName = "Stíháno, vyšetřováno osob - Mladiství 15-17 let";
				break;
			case "Charged-recidivist":
				$czName = "Stíháno, vyšetřováno osob - Recidivisté";
				break;
			case "Charged-total":
				$czName = "Stíháno, vyšetřováno osob - Celkem";
				break;
			case "Charged-under-15":
				$czName = "Stíháno, vyšetřováno osob - Nezletilí 1-14 let";
				break;
			case "Charged-women":
				$czName = "Stíháno, vyšetřováno osob - Ženy";
				break;
			case "Committed-15-17":
				$czName = "Spácháno skutků - Mladiství 15-17 let";
				break;
			case "Committed-alcohol":
				$czName = "Spácháno skutků - Z toho alkohol";
				break;
			case "Committed-drugged":
				$czName = "Spácháno skutků - Pod vlivem";
				break;
			case "Committed-recidivst":
				$czName = "Spácháno skutků - Recidivisté";
				break;
			case "Committed-under-15":
				$czName = "Spácháno skutků - Nezletilí 1-14 let";
				break;
			case "Committed-under-18":
				$czName = "Spácháno skutků - Mladiství 15-17 let";
				break;
			case "Committed-under-15":
				$czName = "Spácháno skutků - Nezletilí 1-14 let";
				break;
			case "Committed-under-15":
				$czName = "Spácháno skutků - Nezletilí 1-14 let";
				break;
			case "Damage-found":
				$czName = "Škody v tis. Kč - Zajištěno";
				break;
			case "Damage-total":
				$czName = "Škody v tis. Kč - Celkem";
				break;
			default:
				$czName = $enName;
				break;
  		}

		return $czName;

	}

}
