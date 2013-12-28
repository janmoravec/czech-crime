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

    /**
     * Presenter action Default.
     */
    
	public function actionDefault()
	{  
		$this->template->crimeTypes = $this->models->CrimeData->getApiCrimeTypes();
		$this->template->areas = $this->models->CrimeData->getApiAreas();

		$timeRanges =  $this->models->CrimeData->findTimeRange()->fetch();
		$this->template->times = $this->models->CrimeData->getTimeRangesForMixMax( $timeRanges[ "Min" ], $timeRanges[ "Max" ] );
	}

	public function handleGetCrimes( $areacode, $crimetype, $timefrom, $timeto ) {
		
		$crimesByArea = $this->models->CrimeData->getApiCrimes( $areacode, $crimetype, $timefrom, $timeto, true )->fetchAll();
		$crimesByTime = $this->models->CrimeData->getApiCrimes( $areacode, $crimetype, $timefrom, $timeto, false )->fetchAll();
		
		$output = array();
		$output[ "crimesByArea" ] = $crimesByArea;
		$output[ "crimesByTime" ] = $crimesByTime;

		echo json_encode( $output );
		
		$this->terminate();

	}

}
