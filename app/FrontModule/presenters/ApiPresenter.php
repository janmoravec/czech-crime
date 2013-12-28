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

	public function renderCrimes( $areacode, $crimetypes, $timefrom, $timeto) 
	{
		
		$crimes = $this->models->CrimeData->getApiCrimes( $areacode, $crimetypes, $timefrom, $timeto )->fetchAll();
		$this->payload->crimes = $crimes;
	
		$this->sendPayload();
		$this->terminate();

	}

}
