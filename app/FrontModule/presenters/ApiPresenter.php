<?php

/**
 * Api presenter.
 *
 * @author     Zdenek Hynek
 * @package    MapaKriminality.cz
 */

namespace FrontModule;

use Nette\Application\UI\Form;
use Nette\Diagnostics\Debugger;
use Nette\Application\Responses\JsonResponse;

class ApiPresenter extends BasePresenter
{

    /**
     * Presenter action Default.
     */
    
	public function actionDefault()
	{  
	}

	public function renderAreas( $code, $level ) 
	{

		if( isset( $code ) ) {
		
			$area = $this->models->CrimeData->getApiAreaDetail( $code )->fetch();
			$this->payload->area = $area;
		
		} else if( isset( $level ) ) {

			$areas = $this->models->CrimeData->getApiAreas( $level )->fetchAll();
			$this->payload->areas = $areas;

		} else {
			
			$areas = $this->models->CrimeData->getApiAreas()->fetchAll();
			$this->payload->areas = $areas;
		
		}

		$this->sendPayload();
		$this->terminate();

	}

	public function renderCrimeTypes( $code ) 
	{
		
		if( isset( $code ) ) {
		
			$crime = $this->models->CrimeData->getApiCrimeTypeDetail( $code )->fetch();
			$this->payload->crime = $crime;
		
		} else {
		
			$crimes = $this->models->CrimeData->getApiCrimeTypes()->fetchAll();
			$this->payload->crimes = $crimes;

		}
		
		$this->sendPayload();
		$this->terminate();

	}

	public function renderTimes( $id ) 
	{
		
		if( isset( $id ) ) {
		
			$time = $this->models->CrimeData->getApiTimeDetail( $id )->fetch();
			$this->payload->time = $time;
		
		} else {
		
			$times = $this->models->CrimeData->getApiTimes()->fetchAll();
			$this->payload->times = $times;

		}
		
		$this->sendPayload();
		$this->terminate();

	}

	public function renderCrimes( $areacode, $crimetypes, $timefrom, $timeto, $groupby, $full ) 
	{

		$timeFromId = -1;
		$timeToId = -1;

		//split 
		$timeFromArr = explode( "-", $timefrom );
		if( count($timeFromArr) > 1 ) $timeFromId = $this->getTimeIdForDate( $timeFromArr[0], $timeFromArr[1] );
		$timeToArr = explode( "-", $timeto );
		if( count($timeToArr) > 1 ) $timeToId = $this->getTimeIdForDate( $timeToArr[0], $timeToArr[1] );
		
		$crimes = $this->models->CrimeData->getApiCrimes( $areacode, $crimetypes, $timeFromId, $timeToId, $groupby, $full )->fetchAll();
		
		$this->payload->crimes = $crimes;
	
		$this->sendPayload();
		$this->terminate();

	}

	public function getTimeIdForDate( $month, $year )
	{
		$id = -1;

		//convert params to integer
		$month = intval( $month );
		$year = intval( $year );

		$startYear = 2003;
		$yearDiff = $year - $startYear;

		if( $yearDiff >= 0 ) {
			
			//get base id for year
			$id = 12 * $yearDiff;
			//add month
			$id += $month;
			//ids start with zero
			$id -= 1;
		}

		return $id;
	}

}
