<?php

/**
 * Mapa presenter.
 *
 * @author     Petr Velký
 * @package    MapaKriminality.cz
 */

namespace FrontModule;

use Nette\Application\UI\Form;
use Nette\Diagnostics\Debugger;

class MapaPresenter extends BasePresenter
{

        /**
         * Presenter action Default.
         */
        
    	public function actionDefault()
    	{          
                //set default area
                $this->template->area = null;
                //set default filters
                $this->template->filters = null;

                //get the newest fk_time_lookup
                $timeRange = $this->models->CrimeData->findTimeRange()->fetch();
                //$timeRange = $this->models->CrimeData->findTimeRange();
                $minTime = $timeRange["Min"];
                $maxTime = $timeRange["Max"];
                $timeTo = $maxTime;
                
                //start 12 month ago
                $timeFrom = ( ( $timeTo - 12 ) >= $minTime ) ? $timeTo - 12 : $minTime ;
            
                //get all time rows for selected time
                $times = $this->models->CrimeData->getTimeRangesForMixMax( $minTime, $maxTime )->fetchAll();
               
                //store unique year values
                $years = array();
                $timesIds = array();
                //$timeStamps = array();

                $firstYear = 0;
                $secondYear = 0;
                
                foreach( $times as $time ) {
                    /*if( $time->Month == 1 || $minTime == $maxTime) {
                        array_push( $years, $time );
                    }*/

                    $yearString = (string) $time->Year;
                    $monthString = (string) $time->Month;

                    if( !array_key_exists( $yearString, $timesIds ) ) {
                        $timesIds[ $yearString ] = array();
                        array_push( $years, $time );
                    }
                    
                    array_push( $timesIds[ $yearString ], $time->Id );
                    
                    if( $time->Id == $minTime ) {
                        $firstYear = $time->Year;
                    } 
                    if( $time->Id == $maxTime ) {
                        $secondYear = $time->Year;
                    } 
                
                }

                $this->template->minTime = $minTime;
                $this->template->maxTime = $maxTime;

                $this->template->timeTo = $timeTo;
                $this->template->timeFrom = $timeFrom;
                
                $this->template->years = $years;
                $this->template->firstYearId = $timesIds[$firstYear][0];
                $this->template->secondYearId = $timesIds[$secondYear][0];
                //$this->template->timesIds = $timesIds;

                //get all crimes for ranktable
                $this->template->crimes = $this->models->CrimeData->getCrimes(); 
                $this->template->crimesForOverview = $this->models->CrimeData->getCrimesForOverview(); 
                
        }
        
        /**
         * Contact form factory.
         * 
         * @return \Nette\Application\UI\Form
         */
        
        
        protected function createComponentContactForm()
        {
            $form = new Form();
            $form->getElementPrototype()->setClass('contactForm');
            $form->addText('name','Jméno')->setAttribute('placeholder','Jméno');
            $form->addText('email','E-mail')->setAttribute('placeHolder','E-mail')->setRequired('Zadejte prosím Váš e-mail.');
            $form->addHidden('emailTo');
            $form->addTextarea('message')->setAttribute('placeholder','Zpráva');
            $form->addSubmit('send','ODESLAT')->getControlPrototype()->setClass('web');
            
            //$form->onSuccess[] = callback($this, 'contactSubmitted');
            
            return $form;
        }
        
        /**
         * Contact form handler.
         * 
         * @param \Nette\Application\UI\Form $form
         */
        
        public function handleSubmitContact( $name, $emailTo, $message )
        {
            Debugger::log( "handleSubmitContact" );
            $mail = new \Nette\Mail\Message();
            //$mail->setFrom( $emailFrom );

            $mail->addTo( $emailTo );
            $mail->setSubject('Nová zpráva z portálu mapakriminality.cz od uživatele: ' . $name );
            $mail->setBody( $message );
            
            try{
                $mail->send();
                echo "success";
            }
            catch(\Nette\InvalidStateException $e)
            {
                error_log($e->getMessage());
                echo "error:" .$e->getMessage();
            }

            $this->terminate();
            //$this->flashMessage('Vaše zpráva byla odeslána.','success');
        }
        
        /**
         * Handler for timelane setup storage into sessions.
         * 
         * @param string $yearFrom
         * @param string $monthFrom
         * @param string $yearTo
         * @param string $monthTo
         */
        
        
        public function handleStoreDate($yearFrom,$monthFrom,$yearTo,$monthTo)
        {
            $session = $this->session->getSection('map');
            
            $session->dateFrom = array('Year'=>$yearFrom,'Month'=>$monthFrom);
            $session->dateTo = array('Year'=>$yearTo,'Month'=>$monthTo);
                        
            $this->terminate();
        }
        
        /**
         * Handler for storing selected table type into sessions.
         * 
         * @param string $table
         */
        
        public function handleStoreTable($table)
        {
            $session = $this->session->getSection('map');
            $session->table = $table;
            
            $this->terminate();
        }
        
        /**
         * Handler for storing selected area.
         * 
         * @param int $area
         */
        
        public function handleStoreArea($area)
        {
            $session = $this->session->getSection('map');
            $session->area = $area;
            
            $this->terminate();
        }
        
        /**
         * Handler for storing filters.
         * 
         * @param string $filters
         */
        
        public function handleStoreFilters($filters)
        {
            $session = $this->session->getSection('map');
            $session->filters = $filters;
            
            $this->terminate();
        }
        
        /**
         * Handler for table pdf.
         * 
         * @param type $zoom
         * @param type $unit
         */
        
        public function handleGetTable( $printType, $zoomLevel, $area, $timeFrom, $timeTo, $crimeTypes, $selectedCrimeType, $language )
        {
            $table = new \Table();
            $table->setTable( $printType );
            
            $firstDate = $this->models->CrimeData->getTimeById( $timeFrom )->fetch();
            $secondDate = $this->models->CrimeData->getTimeById( $timeTo )->fetch();
            $areaData = $this->models->CrimeData->getAreaByCode( $area )->fetch();
            
            $firstDateStr = $firstDate[ "Month" ] .'/'. $firstDate[ "Year" ] ;
            $secondDateStr = $secondDate[ "Month" ] .'/'. $secondDate[ "Year" ];
            $table->setFirstDate( $firstDateStr );
            $table->setSecondDate( $secondDateStr );
            
            //types table
            if( $printType == 'types' ) {

                //$data = $this->handleGetDataForArea( $area, $timeFrom, $timeTo, $crimeTypes, true );
                $data = $this->handleGetAllCrimeTypesForArea( $area, $timeFrom, $timeTo, true );
              
                $table->setFilename('tableTypes-'.$areaData["Name"].'-'.$firstDateStr.'-'.$secondDateStr.'.pdf');
                $table->setArea( $areaData );
                $table->setData( $data );
            
            }
            
            //rank table
            elseif( $printType == 'rank' ) {

                $table->setFilename('tableRank-'.$areaData["Name"].'-'.$firstDateStr.'-'.$secondDateStr.'.pdf');
                $data = $this->handleGetRankingsForCrimeType( $zoomLevel, $selectedCrimeType, $timeFrom, $timeTo, true );
                $table->setData( $data );

            }
            
            
            //$table->isDistrict = $isDistrict;
            header('Content-type: application/pdf');
            $table->generate( $language );
            
            $this->terminate();
        }


        
}
