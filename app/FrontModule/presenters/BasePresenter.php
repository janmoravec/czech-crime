<?php

/**
 * Base class for all application presenters.
 *
 * @author     Petr Velký
 * @package    MapaKriminality.cz
 */

namespace FrontModule;

use Nette\Application\UI\Form;
use Nette\Caching\Cache;
use Nette\Diagnostics\Debugger;

abstract class BasePresenter extends \Nette\Application\UI\Presenter
{
    
    /** @var string $restCrimeCode 
    */
    public $restCrimeCode = '-999';

    /** @var string $defaultFiltersArr
    */
    public $defaultFiltersArr = array( '101-106','201','141,142,143,151,161,171,173,181,611,612,614','131,132','371,373','372','431','433,434','435','635,641,642,643','771' );
    
    /** @var string $totalCrimeCode
    */
    public $totalCrimeCode =  "101-903";

    /** @var string $emailFrom 
    */
    public $emailFrom = 'noreply@mapakriminality.cz';
    
    /** @var string $googleAppKey  */
    public $googleAppKey;
    
    /** @var string $countryTable  */
    public $countryTable;
    /** @var string $countyTable  */
    public $countyTable;
    /** @var string $districtTable  */
    public $districtTable;
    /** @var string $departmentTable  */
    public $departmentTable;
     /** @var array $crimeTypes  */
    public $crimeTypes;
    
    /** @var $cache */
    public $cache;
    
    public function startup() {
        
        //ini_set('memory_limit', '64M');

        parent::startup();

        $storage = new \Nette\Caching\Storages\FileStorage( 'temp/cache' );
        $this->cache = new Cache( $storage );

        $this->template->appVersion = "2.12";
        $this->template->googleAppKey = $this->googleAppKey = $this->context->parameters['GoogleAppKey'];
        $this->template->countryTable = $this->countryTable = $this->context->parameters['CountryTable'];
        $this->template->countyTable = $this->countyTable = $this->context->parameters['CountyTable'];
        $this->template->districtTable = $this->districtTable = $this->context->parameters['DistrictTable'];
        $this->template->departmentTable = $this->departmentTable = $this->context->parameters['DepartmentTable'];
        
        $this->template->crimeTypes = $this->crimeTypes = $this->models->CrimeData->getDisplayableCrimeTypes();
    }
        
	/**
	 * Sign in form component factory.
         * 
	 * @return Nette\Application\UI\Form
	 */
    
	protected function createComponentSignInForm()
	{
		$form = new Form;
		$form->addText('email', 'email')
			->setRequired('Zadejte prosím Váš e-mail.')
                        ->setAttribute('placeholder', 'e-mail');

		$form->addPassword('password', 'heslo')
			->setRequired('Zadejte prosím Vaše heslo.')
                        ->setAttribute('placeholder', 'heslo');

		//$form->addCheckbox('remember', 'Remember me on this computer');

		$form->addSubmit('login', 'PŘIHLÁSIT SE');

		$form->onSuccess[] = callback($this, 'signInFormSubmitted');
		return $form;
	}
        
        /**
         * Sign in form submit handler.
         * 
         * @param \Nette\Application\UI\Form $form
         */

	public function signInFormSubmitted(Form $form)
	{
		try {
			$values = $form->getValues();
		//	if ($values->remember) {
		//		$this->getUser()->setExpiration('+ 14 days', FALSE);
		//	} else {
				$this->getUser()->setExpiration('+ 60 minutes', TRUE);
		//	}
			$this->getUser()->login($values->email, $values->password);
			       

		} catch (\Nette\Security\AuthenticationException $e) {
			$this->flashMessage($e->getMessage(),'error');
		}
         $this->redirect('Mapa:');
	}
        
        /**
         * Registration form factory.
         * 
         * @return \Nette\Application\UI\Form
         */
        
        protected function createComponentRegistrationForm()
        {
            $form = new Form();
            
            $form->addText('email', 'email')
                    ->setRequired('Zadejte prosím Váš e-mail.')
                    ->setAttribute('placeholder', 'e-mail');
            $form->addPassword('password', 'heslo')
                    ->setRequired('Zadejte prosím Vaše heslo.')
                    ->setAttribute('placeholder', 'heslo');
            $form->addPassword('pswdCheck','potvrďte heslo')
                    ->setRequired('Potvrďte prosím Vaše heslo.')
                    ->setAttribute('placeholder', ' potvrďte heslo')
                    ->addConditionOn($form['pswdCheck'], \Nette\Application\UI\Form::FILLED)
                    ->addRule(\Nette\Application\UI\Form::EQUAL, 'Potvrdil(a) jste chybné heslo!', $form['password']);
            
            $form->addSelect('sector','sektor',$this->models->Sectors->findAll()->orderBy('name')->fetchPairs('id','name'))->setPrompt('Vyberte sektor')->setRequired('Vyberte prosím sektor.');
            
            $form->addCheckbox('newsletter','Informujte mě o aktualizacích');
            $form->addSubmit('register','REGISTROVAT');

            $form->onSuccess[] = callback($this, 'registrationSubmitted');

            return $form;
        }
        
        /**
         * Registration form submit handler.
         * 
         * @param \Nette\Application\UI\Form $form
         */

        
        public function registrationSubmitted(Form $form)
        {
            $values = $form->getValues();
            unset($values['pswdCheck']);
            $values['date_last_login'] = date('Y-m-d H:i:s');
            $values['password'] = $this->models->Users->calculateHash($values['password']);
            $this->models->Users->insert($values);
            
            $this->flashMessage('Registrace byla dokončena.','success');
            $this->redirect('Mapa:');
            
        }
        
        /**
         * Userinfo form factory.
         * 
         * @return \Nette\Application\UI\Form
         */
        
        protected function createComponentUserInfoForm()
        {
            $form = new Form();
            $form->addText('email', 'email')->setDisabled();
            $form->addPassword('password', 'heslo')
                    ->setAttribute('placeholder', 'heslo');
            $form->addPassword('checkPassword', 'potvrdit')
                                ->setAttribute('placeholder', 'potvrdit heslo')
                    ->addConditionOn($form['checkPassword'], Form::FILLED)
					->addRule(Form::EQUAL, 'Potvrdil(a) jste chybné heslo!', $form['password']);
            $form->addSelect('sector','sektor',$this->models->Sectors->findAll()->orderBy('name')->fetchPairs('id','name'))->setPrompt('Vyberte');
            
            $form->addCheckbox('newsletter','Informujte mě o aktualizacích');
            $form->addSubmit('save','ULOŽIT ZMĚNY');

            $form->onSuccess[] = callback($this, 'userInfoSubmitted');
            
            if($this->user->isLoggedIn())
                $form->setDefaults($this->models->Users->find($this->user->getId())->fetch());
            
            
            
            return $form;
        }

        /**
         * Userinfo form submit handler.
         * 
         * @param \Nette\Application\UI\Form $form
         */
        
        public function userInfoSubmitted(Form $form)
        {
            
            $values = $form->getValues();
            unset($values['email']);
            unset($values['checkPassword']);
            if(empty($values['password']))
                unset($values['password']);
            else
                $values['password'] = $this->models->Users->calculateHash($values['password']);
            $this->models->Users->update($values,$this->user->getId());
          
            $this->flashMessage('Vaše údaje byly upraveny.','success');
            $this->redirect('Mapa:');
        }
        
        
        /**
         * Forget password form factory.
         * 
         * @return \Nette\Application\UI\Form
         */

        protected function createComponentForgetPassForm()
        {
            $form = new Form();
            
            $form->addText('email','Váš e-mail zadaný při registraci');
            $form->addSubmit('submit','Odeslat');
            $form->onSuccess[] = callback($this,'forgetPassSubmitted');
            return $form;
        }
        
        /**
         * Forget password form submit handler.
         * 
         * @param \Nette\Application\UI\Form $form
         */
        
        public function forgetPassSubmitted(Form $form)
        {
            $values = $form->getValues();
            
            $row = $this->models->Users->findEmail($values['email'])->fetch();
            
            if($row)
            {
                $newPass = \Nette\Utils\Strings::random(5);
                $this->models->Users->update(array('password'=>$this->models->Users->calculateHash($newPass)),$row->id);
                
                $mail = new \Nette\Mail\Message();
                $mail->setFrom($this->emailFrom);

                $mail->addTo($values['email']);
                $mail->setSubject('MapaKriminality.cz - Nové heslo');
                $mail->setHtmlBody("<p>Dobrý den,</p><p>k Vašemu účtu ".$values['email']." Vám bylo vygerenováno nové heslo: ".$newPass."</p>");
                try{
                    $mail->send();
                }
                catch(Exception $e)
                {
                    error_log($e->getMessage());
                }
                
                $this->flashMessage('Byl Vám odeslán e-mail s novým heslem.','success');
            }
            else
            {
                $this->flashMessage('Účet s tímto e-mailem nebyl dosud registrován.','error');
            }
            $this->redirect('this');
        }
        
        /**
         * Model loader.
         * 
         * @return \ModelLoader
         */
        
        
        final public function getModels()
        {
            return $this->context->modelLoader;
        }
        
        
        
        public function handleImportCrime()
        {
            $filename = WWW_DIR. '/crimedata.csv';
            $file_handle = fopen($filename,'r');
            $i = 0;
            while (!feof($file_handle) ) 
            {  
                $data = fgetcsv($file_handle,5096,',');
                if($i !=0)
                {
                    $row = array(
                        'Id'=>\Nette\Utils\Strings::normalize($data[0]), 
                        'Vykazovane_zjisteno_mvcr'=>\Nette\Utils\Strings::normalize($data[1]), 
                        'Vykazovane_objasneno_mvcr'=>\Nette\Utils\Strings::normalize($data[2]), 
                        'FK_Crime_Lookup'=>\Nette\Utils\Strings::normalize($data[3]), 
                        'FK_Area_Lookup'=>\Nette\Utils\Strings::normalize($data[4]), 
                        'FK_Time_Range'=>\Nette\Utils\Strings::normalize($data[5]), 
                        'Vykazovane_zjisteno_mesic'=>\Nette\Utils\Strings::normalize($data[6]), 
                        'Vykazovane_objasneno_mesic'=>\Nette\Utils\Strings::normalize($data[7]),                   
                        'FK_District_Lookup' => \Nette\Utils\Strings::normalize($data[8]),
                    );
                    $this->models->CrimeData->insert($row);
                }
                $i++;
                //Debugger::log("i," . $i);
            }
        }
        
                
        
        public function handleImportDamage()
        {
           $filename = WWW_DIR. '/damagedata.csv';
                $file_handle = fopen($filename,'r');
                $row = 1;
                while (!feof($file_handle) ) 
                {   
                    $data = fgetcsv($file_handle,5096,',');
                    if(!empty($data[1]))
                    {
                        $row = array(
                            'Id'=>$data[0],
                            'Vykazovane_celkem_mvcr'=>$data[1],
                            'Vykazovane_odcizeno_mvcr'=>$data[2],
                            'Vykazovane_zajisteno_mvcr'=>$data[3],
                            'Vykazovane_celkem_mesic'=>$data[4],
                            'Vykazovane_odcizeno_mesic'=>$data[5],
                            'Vykazovane_zajisteno_mesic'=>$data[6],
                            'FK_Crime_Lookup'=>$data[7],
                            'FK_Area_Lookup'=>$data[8],
                            'FK_Time_Range'=>$data[9],
                        );
                        
                        $this->models->DamageData->insert($row);
                        $row++;
                    }

            }
                        
        }
                     
        /**
         * Handler or retreive data for timeline.
         */
        
        public function handleGetTimeline( $crimeTypes, $minTime, $maxTime )
        {

            $key = "handleGetTimeline:" . $crimeTypes . "-" .$minTime. "-" .$maxTime;
            $value = $this->cache->load( $key );
            if( $value !== NULL ) {
                //value in cache already
                echo json_encode( $value );
                $this->terminate();

            }

            $crimeTypesArr = str_getcsv( $crimeTypes, ",", "'" );
            $defaultFiltersMissingArr = array();
            $customFiltersArr = array();

            //Debugger::log( "handleFindNamesIndexesForIdsRange" );
            //Debugger::log( $crimeTypes );
            //Debugger::log( var_export( $crimeTypesArr, true ) );

            //find which default filters are missing to substract them from
            foreach( $this->defaultFiltersArr as $defaultFilter ) {

                if( !in_array( $defaultFilter, $crimeTypesArr ) ) {
                    //Debugger::log( "missing default filter", $defaultFilter );
                    array_push( $defaultFiltersMissingArr, $defaultFilter );
                }

            }

            //find which custom filter is extra
            foreach( $crimeTypesArr as $crimeType ) {

                if( !in_array( $crimeType, $this->defaultFiltersArr ) && $crimeType != $this->restCrimeCode ) {
                    //Debugger::log( "custom crimeType", $crimeType );
                    array_push( $customFiltersArr, $crimeType );
                }

            }

            $missingFiltersCount = count( $defaultFiltersMissingArr );
            $output = array();

            //is rest of the crimes turned on 
            if( in_array( $this->restCrimeCode, $crimeTypesArr )  ) {
                
                //the rest of crimes is on
                //get total FoundSum for all crime types
                $totalsData = $this->models->CrimeData->getTimeline( "'" . $this->totalCrimeCode . "'" )->fetchAssoc( "FK_Time_Lookup" );
                //is there some turned off filters that needs to be substracted
                if( $missingFiltersCount > 0 ) {
                    //http://stackoverflow.com/questions/6102398/php-implode-101-with-quotes
                    $defaultFiltersMissingString = implode( "','", $defaultFiltersMissingArr );
                    $defaultFiltersMissingString = "'" .$defaultFiltersMissingString. "'";
                    //Debugger::log( "getting data for missing types" );
                    $missingTypesData = $this->models->CrimeData->getTimeline( $defaultFiltersMissingString )->fetchAssoc( "FK_Time_Lookup" );
                
                    //get data for custom type
                    if( count( $customFiltersArr ) > 0 ) {
                        $customFiltersString = implode( "','", $customFiltersArr );
                        $customFiltersString = "'" .$customFiltersString. "'";
                        //Debugger::log( "getting data for custom filters string" );
                        $customFiltersData = $this->models->CrimeData->getTimeline( $customFiltersString )->fetchAssoc( "FK_Time_Lookup" );
                    }
                }
                
                //go through all required years to make sure we have data for everything
                for( $i = $minTime; $i <= $maxTime; $i++ ) {

                    $totalsDataKey = $i;
                    //are there data in database for this year?
                    if( array_key_exists( $totalsDataKey, $totalsData ) ) {
                        $totalsDataValue = $totalsData[ $totalsDataKey ];
                        //foreach( $totalsData as $totalsDataKey=>$totalsDataValue ) {
                          
                            //substract missing filters?
                            if( $missingFiltersCount > 0 ) {
                                
                                if( array_key_exists( $totalsDataKey, $missingTypesData ) ) {
                                    $missingTypesValue = $missingTypesData[ $totalsDataKey ];
                                    //substract turned off default filters
                                    $totalsDataValue[ "FoundSum" ] -= $missingTypesValue[ "FoundSum" ];
                                }
                                
                                //add turned on custom filters
                                if( count( $customFiltersArr ) > 0 && array_key_exists( $totalsDataKey, $customFiltersData ) ) {
                                    $customFilter = $customFiltersData[ $totalsDataKey ];
                                    $totalsDataValue[ "FoundSum" ] += $customFilter[ "FoundSum" ];
                                }
                            }
                
                    } else {

                        //no data, needs to get from database at least year 
                        $totalsDataValue = $this->models->CrimeData->getTimeById( $totalsDataKey )->fetch();
                        //added dummy foundSum
                        $totalsDataValue[ 'FoundSum' ] = 0;
                      
                    }

                    array_push( $output, array('Date'=>\Nette\Utils\Strings::firstUpper(monthCZ(sprintf("%02s", $totalsDataValue->Month))).' '.$totalsDataValue->Year,'FoundSum'=>$totalsDataValue->FoundSum,'FK_Time_Lookup'=>$totalsDataValue->FK_Time_Lookup ) );
                    
                }

            } else {
                //the rest of crimes is off - can just do 
                //get crime
                $crimeTypesData = $this->models->CrimeData->getTimeline( $crimeTypes )->fetchAssoc( "FK_Time_Lookup" );

                //go through all required years to make sure we have data for everything
                for( $i = $minTime; $i <= $maxTime; $i++ ) {
                //foreach( $crimeTypesData as $crimeTypesKey=>$crimeTypesValue ) {
                    
                    $crimeTypesKey = $i;

                    //are there data in database for this year?
                    if( array_key_exists( $crimeTypesKey, $crimeTypesData ) ) {

                        $crimeTypesValue = $crimeTypesData[ $crimeTypesKey ];
                    
                    } else {

                        //no data, needs to get from database at least year 
                        $crimeTypesValue = $this->models->CrimeData->getTimeById( $crimeTypesKey )->fetch();
                        //added dummy foundSum
                        $crimeTypesValue[ 'FoundSum' ] = 0;
                    }

                    array_push( $output, array('Date'=>\Nette\Utils\Strings::firstUpper(monthCZ(sprintf("%02s", $crimeTypesValue->Month))).' '.$crimeTypesValue->Year,'FoundSum'=>$crimeTypesValue->FoundSum,'FK_Time_Lookup'=>$crimeTypesValue->FK_Time_Lookup ) );
                    
                }
            }

            echo json_encode($output);

            //store to cache
            $this->cache->save( $key, $output );

            $this->terminate();
        }
        
        /**
         * 
         * 
         * @param type $zoomLevel
         * @param type $yearFrom
         * @param string $monthFrom
         * @param type $yearTo
         * @param string $monthTo
         */

        public function handleGetDataForArea( $area, $timeFrom, $timeTo, $crimeTypes, $isPrint )
        {
            //Debugger::log( "handleGetDataForArea " );
            //Debugger::log( $crimeTypes );

            $key = "handleGetDataForArea:" . $area . "-" .$timeFrom. "-" .$timeTo. "-" .$crimeTypes;
            $value = $this->cache->load( $key );
            if( $value !== NULL ) {
                //value in cache already
                if( !$isPrint ) {
                   echo json_encode( $value );
                } else {
                    return $value;
                }
                $this->terminate();

            }

            //http://stackoverflow.com/questions/5132533/php-how-can-i-explode-a-string-by-commas-but-not-wheres-the-commas-are-within
            $crimeTypesArr = str_getcsv( $crimeTypes, ",", "'" );
            $defaultFiltersMissingArr = array();
            $customFiltersArr = array();

            //need to get individual counts for all default filters ( for filter box ) and any custom filters
            $filterBoxFiltersArr = $crimeTypesArr;
            //add any default filter that might be missing
            foreach( $this->defaultFiltersArr as $defaultFilter ) {

                if( !in_array( $defaultFilter, $filterBoxFiltersArr ) ) {
                    array_push( $filterBoxFiltersArr, $defaultFilter );
                }

            }

            //find which default filters are missing to substract them from
            foreach( $this->defaultFiltersArr as $defaultFilter ) {

                if( !in_array( $defaultFilter, $crimeTypesArr ) ) {
                    array_push( $defaultFiltersMissingArr, $defaultFilter );
                }

            }

            //TODO - ?? add "allCrimes filter code" to array, so we don't have to ask for it extra and can begin substracting straight away
            //array_push( $filterBoxFilters, '101-903' );

            $output = array();
            $index = 0;
            $population = 0;
            $name = "";
            $foundSum = 0;
            $solvedSum = 0;

            //find default sum
            $defaultFoundSum = 0;
            $defaultSolvedSum = 0;
            $defaultDamage = 0;

            $filterBoxCrimes = array();
            $graphCrimes = array();

            //get data
            $filterBoxFiltersString = implode( "','", $filterBoxFiltersArr );
            $filterBoxFiltersString = "'" .$filterBoxFiltersString. "'";
                    
            $areaCrimes = $this->models->CrimeData->getAreaCrimes( $area, $timeFrom, $timeTo, $filterBoxFiltersString )->fetchAll();
            $totalValues = $this->models->CrimeData->getAreaCrimes( $area, $timeFrom, $timeTo, "'" . $this->totalCrimeCode ."'" )->fetch();

            //check if no crime at all
            if( !$totalValues ) {
                
                //special case when there's no data, need to get just basic info for unit
                $areaDetail = $this->models->CrimeData->getAreaByCode( $area )->fetch();
                $totalValues = $areaDetail;

                //fill in missing data
                $totalValues[ "FoundSum" ] = 0;
                $totalValues[ "SolvedSum" ] = 0;
                $totalValues[ "Damage-total" ] = 0;

            }
           
            $damage = 0;
            $population = $totalValues[ "Population" ];
            $name = $totalValues[ "Name" ]; 

            foreach( $areaCrimes as $crimeKey=>$crimeValue ) {

                //store for filterbox
                $crimeCode = $crimeValue[ "FK_Crime_Lookup" ];
                $crimeValue[ "index" ] = $this->computeCrimeIndex( $crimeValue[ "FoundSum" ], $population );
                $filterBoxCrimes[ $crimeCode ] = $crimeValue;

                //is turned on crime type 
                if( in_array( $crimeCode, $crimeTypesArr ) ) {
                    $foundSum += $crimeValue[ "FoundSum" ];
                    $solvedSum += $crimeValue[ "SolvedSum" ]; 
                    $damage += $crimeValue[ "Damage-total" ];
                    $graphCrimes[ $crimeCode ] = $crimeValue;
                }

                //is default filter
                if( in_array( $crimeCode, $this->defaultFiltersArr ) ) {
                    $defaultFoundSum += $crimeValue[ "FoundSum" ];
                    $defaultSolvedSum += $crimeValue[ "SolvedSum" ]; 
                    $defaultDamage += $crimeValue[ "Damage-total" ];
                }

            }
            
            //add rest
            //placeholder for computed value of rest crime type
            $restCrimes = array();
            $restFoundSum = $totalValues[ "FoundSum" ] - $defaultFoundSum;
            $restSolvedSum = $totalValues[ "SolvedSum" ] - $defaultSolvedSum;
            $restDamage = $totalValues[ "Damage-total" ] - $defaultDamage;
            $restCrimeCode = "-999";

            $restCrimes = array( 
                "CrimeName" => "Všechny zbývající činy",
                "CrimeName_en" => "Remaining crimes",
                "FoundSum" => $restFoundSum, 
                "SolvedSum" => $restSolvedSum, 
                "FK_Crime_Lookup" => $restCrimeCode,
                "index" => $this->computeCrimeIndex( $restFoundSum, $population )
            );

            $filterBoxCrimes[ $restCrimeCode ] = $restCrimes;

            //should rest crime type be added to, is it on?
            if( in_array( $restCrimeCode, $crimeTypesArr ) ) {
                $foundSum += $restFoundSum;
                $solvedSum += $restSolvedSum;
                $damage += $restDamage;
               
                //added to default sum for TypesTable as well
                $defaultFoundSum += $restFoundSum;
                $defaultSolvedSum += $restSolvedSum;

                $graphCrimes[ $restCrimeCode ] = $restCrimes;
            }

            //TODO - add it to found sum, so the index is computed with it
            $index = $this->computeCrimeIndex( $foundSum, $population );
            $defaultIndex = $this->computeCrimeIndex( $defaultFoundSum, $population );

            //start building response
            $output[ "id" ] = $area;
            $output[ "index" ] = $index;
            $output[ "name" ] = $name;
            $output[ "population" ] = $population;
            $output[ "foundSum" ] = $foundSum;
            $output[ "solvedSum" ] = $solvedSum;
            $output[ "filterBoxCrimes" ] = $filterBoxCrimes;
            
            //for Types Tables
            $output[ "defaultFoundSum" ] = $defaultFoundSum;
            $output[ "defaultSolvedSum" ] = $defaultSolvedSum;
            $output[ "defaultIndex" ] = $defaultIndex;

            $output[ "graphCrimes" ] = $graphCrimes;
            $output[ "damage" ] = $damage * 1000;
               
            $output[ "area" ] = $totalValues[ "Area" ];

            //contacts
            $output[ "contact_address" ] = ( array_key_exists( "Contact_address", $totalValues ) ) ? $totalValues[ "Contact_address" ] : "";
            $output[ "contact_phone" ] = ( array_key_exists( "Contact_phone", $totalValues ) ) ? $totalValues[ "Contact_phone" ] : "";
            $output[ "contact_fax" ] = ( array_key_exists( "Contact_fax", $totalValues ) ) ? $totalValues[ "Contact_fax" ] : "";
            $output[ "contact_mail" ] = ( array_key_exists( "Contact_mail", $totalValues ) ) ? $totalValues[ "Contact_mail" ] : "";
            
            if( !$isPrint ) {
                echo json_encode( $output );
            } else {
                return $output;
            }
               
            //store to cache
            $this->cache->save( $key, $output );

            $this->terminate();

        }

        public function handleGetAreaGeometry( $zoomLevel )
        {   
            $key = "handleGetAreaGeometry:" .$zoomLevel;
            $value = $this->cache->load( $key );
            if( $value !== NULL ) {
                //value in cache already
                echo json_encode( $value );
                $this->terminate();

            }

            $data = $this->models->CrimeData->getAreaGeometry( $zoomLevel )->fetchAll();
            echo json_encode($data);

            //store to cache
            $this->cache->save( $key, $data );

            $this->terminate();
        }

         /**
         * 
         * 
         * @param type $zoomLevel
         * @param type $yearFrom
         * @param string $monthFrom
         * @param type $yearTo
         * @param string $monthTo
         */
        public function handleGetAllCrimeTypesForArea( $area, $timeFrom, $timeTo, $isPrint ) {

            $key = "handleGetAllCrimeTypesForArea:" .$area. "-" .$timeFrom. "-" .$timeTo;
            $value = $this->cache->load( $key );
            if( $value !== NULL ) {
                //value in cache already
                if( !$isPrint ) {
                echo json_encode( $value );
                } else {
                    return $value;
                }
                $this->terminate();
            }

            $areaInfo = $this->models->CrimeData->getAreaByCode( $area )->fetch();
            $crimeTypes = $this->models->CrimeData->getCrimes()->fetchAssoc( "Code" );
            $crimes = $this->models->CrimeData->getAllCrimeTypesForArea( $area, $timeFrom, $timeTo )->fetchAssoc( "FK_Crime_Lookup" );

            $output = array();
            $output[ "Area" ] = $areaInfo[ "Area" ];
            $output[ "Population" ] = $areaInfo[ "Population" ];
            $crimeTypesData = array();

            foreach( $crimeTypes as $crimeTypeKey=>$crimeTypeValue ) {

                //skip "General criminality level"
                if( $crimeTypeKey == "101-690" ) {
                    continue;
                }

                if( array_key_exists( $crimeTypeKey, $crimes ) ) {

                    $crime = $crimes[ $crimeTypeKey ];
                    $crime->Index = $this->computeCrimeIndex( $crime->FoundSum, $crime->Population );

                } else {

                    //create empty crime for missing crime type here
                    $crime = array( "CrimeName" => $crimeTypeValue[ "Name" ],
                                    "CrimeName_en" => $crimeTypeValue[ "Name_en" ],
                                    "FK_Crime_Lookup" => $crimeTypeKey,
                                    "Damage-total" => 0,
                                    "FoundSum" => 0,
                                    "SolvedSum" => 0,
                                    "Index" => 0
                                     );

                }

                //add indicator for visual styling
                $crime[ "IsMainCategory" ] = $crimeTypeValue[ "IsMainCategory" ];

                //check if it is total data
                if( $crimeTypeKey !== $this->totalCrimeCode ) {

                    array_push( $crimeTypesData, $crime );
                
                } else {
                    
                    //it's total data, put them on a side extra
                    $output[ "total" ] = $crime;

                }
               
            }

            $output[ "crimeTypesData" ] = $crimeTypesData;

            if( !$isPrint ) {
                echo json_encode( $output );
            } else {
                return $output;
            }

            //store to cache
            $this->cache->save( $key, $output );

            $this->terminate();

        }


        /**
         * 
         * 
         * @param type $zoomLevel
         * @param type $yearFrom
         * @param string $monthFrom
         * @param type $yearTo
         * @param string $monthTo
         */

        public function handleFindNamesIndexesForIdsRange( $zoomLevel, $timeFrom, $timeTo, $crimeTypes )
        {
            //check cache first
            $key = "handleFindNamesIndexesForIdsRange:" . $zoomLevel . "-" .$timeFrom. "-" .$timeTo. "-" .$crimeTypes;
            $value = $this->cache->load( $key );
            if( $value !== NULL ) {
                //value in cache already
                echo json_encode( $value );
                $this->terminate();

            }

            //http://stackoverflow.com/questions/5132533/php-how-can-i-explode-a-string-by-commas-but-not-wheres-the-commas-are-within
            $crimeTypesArr = str_getcsv( $crimeTypes, ",", "'" );

            $defaultFiltersMissingArr = array();
            $customFiltersArr = array();

            //Debugger::log( "handleFindNamesIndexesForIdsRange" );
            //Debugger::log( $crimeTypes );
            //Debugger::log( var_export( $crimeTypesArr, true ) );

            //find which default filters are missing to substract them from
            foreach( $this->defaultFiltersArr as $defaultFilter ) {

                if( !in_array( $defaultFilter, $crimeTypesArr ) ) {
                    //Debugger::log( "missing default filter", $defaultFilter );
                    array_push( $defaultFiltersMissingArr, $defaultFilter );
                }

            }

            //find which custom filter is extra
            foreach( $crimeTypesArr as $crimeType ) {

                if( !in_array( $crimeType, $this->defaultFiltersArr ) && $crimeType != $this->restCrimeCode ) {
                    //Debugger::log( "custom crimeType", $crimeType );
                    array_push( $customFiltersArr, $crimeType );
                }

            }

            $missingFiltersCount = count( $defaultFiltersMissingArr );
            $areas = $this->models->CrimeData->getAreasForZoomLevel( $zoomLevel )->fetchAssoc( "Code" );
            $output = array();

            //is rest of the crimes turned on 
            if( in_array( $this->restCrimeCode, $crimeTypesArr )  ) {
                
                //the rest of crimes is on
                //get total FoundSum for all crime types
                $totalsData = $this->models->CrimeData->getAreasTotal( $zoomLevel, $timeFrom, $timeTo )->fetchAssoc( "FK_Area_Lookup" );
                
                //is there some turned off filters that needs to be substracted
                if( $missingFiltersCount > 0 ) {
                    //http://stackoverflow.com/questions/6102398/php-implode-101-with-quotes
                    $defaultFiltersMissingString = implode( "','", $defaultFiltersMissingArr );
                    $defaultFiltersMissingString = "'" .$defaultFiltersMissingString. "'";
                    //Debugger::log( "getting data for missing types" );
                    $missingTypesData = $this->models->CrimeData->getAreasTotalForCrimeTypes( $zoomLevel, $timeFrom, $timeTo, $defaultFiltersMissingString )->fetchAssoc( "FK_Area_Lookup" );
                    
                    //get data for custom type
                    if( count( $customFiltersArr ) > 0 ) {
                        $customFiltersString = implode( "','", $customFiltersArr );
                        $customFiltersString = "'" .$customFiltersString. "'";
                        //Debugger::log( "getting data for custom filters string" );
                        $customFiltersData = $this->models->CrimeData->getAreasTotalForCrimeTypes( $zoomLevel, $timeFrom, $timeTo, $customFiltersString )->fetchAssoc( "FK_Area_Lookup" );
                    }
                }
                
                foreach( $areas as $areaKey=>$areaValue ) {

                    $areaData = array();
                    $areaData[ "Code" ] = $areaKey;
                    $areaData[ "Name" ] = $areaValue[ "Name" ];
                    $areaData[ "Population" ] = $areaValue[ "Population" ];
                    
                    //is area in retrieved data
                    if( array_key_exists( $areaKey, $totalsData ) ) {

                        $totalAreaData = $totalsData[ $areaKey ];
                        $areaData[ "FK_Area_Lookup" ] = $totalAreaData[ "FK_Area_Lookup" ];
                        $areaData[ "FoundSum" ] = $totalAreaData[ "FoundSum" ];

                    } else {

                        $areaData[ "FK_Area_Lookup" ] = $areaKey; 
                        $areaData[ "FoundSum" ] = 0;

                    }

                    //foreach( $totalsData as $totalsDataKey=>$totalsDataValue ) {
                   
                    //substract missing filters?
                    if( $missingFiltersCount > 0 ) {
                        
                        if( array_key_exists( $areaKey, $missingTypesData ) ) {
                            $missingTypesValue = $missingTypesData[ $areaKey ];
                            //substract turned off default filters
                            $areaData[ "FoundSum" ] -= $missingTypesValue[ "FoundSum" ];
                        }
                        
                        //add turned on custom filters
                        if( count( $customFiltersArr ) > 0 && array_key_exists( $areaKey, $customFiltersData ) ) {
                            $customFilter = $customFiltersData[ $areaKey ];
                            $areaData[ "FoundSum" ] += $customFilter[ "FoundSum" ];
                        }
                    }
                    
                    $areaData[ "I" ] = $this->computeCrimeIndex( $areaData[ "FoundSum"], $areaData[ "Population" ] );
                    //$totalsDataValue[ "I" ] = $this->computeCrimeIndex( $totalsDataValue[ "FoundSum"], $totalsDataValue[ "Population" ] );
                    array_push( $output, $areaData );
                
                }

            } else {
                
                //the rest of crimes is off - can just do 
                //get crime
                $crimeTypesData = $this->models->CrimeData->getAreasTotalForCrimeTypes( $zoomLevel, $timeFrom, $timeTo, $crimeTypes )->fetchAssoc( "FK_Area_Lookup" );

                foreach( $areas as $areaKey=>$areaValue ) {
                //foreach( $crimeTypesData as $crimeTypesKey=>$crimeTypesValue ) {
                    
                    $areaData = array();
                    $areaData[ "Code" ] = $areaKey;
                    $areaData[ "Name" ] = $areaValue[ "Name" ];
                    $areaData[ "Population" ] = $areaValue[ "Population" ];
                    
                    //is area in retrieved data
                    if( array_key_exists( $areaKey, $crimeTypesData ) ) {

                        $crimeAreaData = $crimeTypesData[ $areaKey ];
                        $areaData[ "FK_Area_Lookup" ] = $crimeAreaData[ "FK_Area_Lookup" ];
                        $areaData[ "FoundSum" ] = $crimeAreaData[ "FoundSum" ];
                        $areaData[ "I" ] = $this->computeCrimeIndex( $areaData[ "FoundSum"], $areaData[ "Population" ] );
                    
                    } else {

                        $areaData[ "FK_Area_Lookup" ] = $areaKey; 
                        $areaData[ "FoundSum" ] = 0;
                        $areaData[ "I" ] = 0;

                    }

                    array_push( $output, $areaData );
                
                }
            }

            echo json_encode( $output );

            //store to cache
            $this->cache->save( $key, $output );

            $this->terminate();
        }
        
        /**
         * 
         * @param type $zoomLevel
         * @param type $crimeTypeId
         * @param type $yearFrom
         * @param string $monthFrom
         * @param type $yearTo
         * @param string $monthTo
         */

        public function handleGetRankingsForCrimeType( $zoomLevel, $crimeType, $timeFrom, $timeTo, $isPrint )
        {
            $key = "handleGetRankingsForCrimeType:" .$zoomLevel. "-" .$crimeType. "-" .$timeFrom. "-" .$timeTo;
            $value = $this->cache->load( $key );
            if( $value !== NULL ) {
                //value in cache already
                echo json_encode( $value );
                $this->terminate();

            }

            //get all areas first
            $areas = $this->models->CrimeData->getAreasForZoomLevel( $zoomLevel )->fetchAssoc( "Code" );
            $data = $this->models->CrimeData->getRankingsForCrimeType( $zoomLevel, $crimeType, $timeFrom, $timeTo )->fetchAssoc( "Code" );
            
            $output = array();
            foreach( $areas as $areaData ) {

                $code = $areaData[ "Code" ];
                
                $singleOutput = array();
                $singleOutput[ "Code" ] = $areaData[ "Code" ];
                $singleOutput[ "Name" ] = $areaData[ "Name" ];
                
                if( array_key_exists( $code, $data ) ) {

                    $singleData = $data[ $code ];
                    $singleOutput[ "FoundSum" ] = $singleData[ "FoundSum" ];
                    $singleOutput[ "SolvedSum" ] = $singleData[ "SolvedSum" ];
                    $singleOutput[ "I" ] = $this->computeCrimeIndex( $singleData[ "FoundSum" ], $singleData[ "Population" ] );

                } else {

                    $singleOutput[ "FoundSum" ] = $singleOutput[ "SolvedSum" ] = $singleOutput[ "I" ] = 0;

                }

                array_push( $output, $singleOutput );

            }

            //store to cache
            $this->cache->save( $key, $output );

            if( !$isPrint ) {
                echo json_encode( $output );
            } else {
                return $output;
            }
            
            $this->terminate();
        }

        public function handleGetGraphData( $area, $timeFrom, $timeTo, $crimeTypes, $minTime, $maxTime )
        {
            $key = "handleGetGraphData:" . $area . "-" .$timeFrom. "-" .$timeTo. "-" .$crimeTypes. "-" .$minTime. "-" .$maxTime;
            $value = $this->cache->load( $key );
            if( $value !== NULL ) {
                //value in cache already
                echo json_encode( $value );
                $this->terminate();

            }

            $crimeTypesArr = str_getcsv( $crimeTypes, ",", "'" );
            //store original crime types arr that supposed to be sent
            $outputCrimesArr = $crimeTypesArr;
            $defaultFiltersMissingArr = array();
            $customFiltersArr = array();
         
            //find which default filters are missing to substract them from
            foreach( $this->defaultFiltersArr as $defaultFilter ) {

                if( !in_array( $defaultFilter, $crimeTypesArr ) ) {
                    //Debugger::log( "missing default filter", $defaultFilter );
                    array_push( $defaultFiltersMissingArr, $defaultFilter );
                    array_push( $crimeTypesArr, $defaultFilter );
                    $crimeTypes .= ", '" .$defaultFilter. "'";
                }

            }
   
            //find which custom filter is extra
            foreach( $crimeTypesArr as $crimeType ) {

                if( !in_array( $crimeType, $this->defaultFiltersArr ) && $crimeType != $this->restCrimeCode ) {
                    //Debugger::log( "custom crimeType", $crimeType );
                    array_push( $customFiltersArr, $crimeType );
                    array_push( $crimeTypesArr, $crimeType );
                    $crimeTypes .= ", '" .$crimeType. "'";
                }

            }
            
            //add total crime to array
            array_push( $crimeTypesArr, $this->totalCrimeCode );
            $crimeTypes .= ",'" . $this->totalCrimeCode ."'";

            $data = $this->models->CrimeData->getGraphData( $area, $minTime, $maxTime, $crimeTypes)->fetchAll();
            //$data = $this->models->CrimeData->getGraphData( $area, $timeFrom, $timeTo, $crimeTypes)->fetchAll();
            //$totalData = $this->models->CrimeData->getGraphData( $area, $timeFrom, $timeTo, "'101-903'" )->fetchAll();
            
            $timeRanges = $this->models->CrimeData->getTimeRangesForMixMax( $minTime, $maxTime )->fetchAssoc( "Id" );
            //$timeRanges = $this->models->CrimeData->getTimeRangesForMixMax( $timeFrom, $timeTo )->fetchAssoc( "Id" );
            
            $output = array();
            
            foreach( $data as $singleCrimeData ) {

                $fkCrimeLookup = $singleCrimeData["FK_Crime_Lookup"];
                if( !array_key_exists( $fkCrimeLookup, $output ) ) {
                 
                    $output[ $fkCrimeLookup ] = array();
                
                }

                //go through times in specific crime types
                $crimeArray = $output[ $fkCrimeLookup ];
                $fkTimeLookup = $singleCrimeData["FK_Time_Lookup"];

                $crimeArray[ $fkTimeLookup ] = $singleCrimeData;
                $output[ $fkCrimeLookup ] = $crimeArray;

                //array_push( $crimeArray[ $fkTimeLookup ], $singleCrimeData );
            
            }

            foreach( $crimeTypesArr as $crimeType ) {
             
                if( !array_key_exists( $crimeType, $output ) ) {
                   $output[ $crimeType ] = array( "FK_Crime_Lookup" => $crimeType );
                }

            }
            
            $output2 = array();
            $data = array();
            $foundValues = array();
            $default = array();
            
            //go through all keys of output array and fill missing time values
            foreach( $output as $singleCrimeKey=>$singleCrimeDataArr ) {

                $crimeArray = array();
                $isInDefault = in_array( $singleCrimeKey, $this->defaultFiltersArr );
                $isInOutput = in_array( $singleCrimeKey, $outputCrimesArr );

                //for( $i = $minTime; $i <= $maxTime; $i++ ) {
                for( $i = $minTime; $i <= $maxTime; $i++ ) {

                    if( !array_key_exists( $i, $singleCrimeDataArr ) ) {
                        
                        //time doens't exist in given crimetype
                        $singleCrimeData = array(
                            "FK_Crime_Lookup"=>$singleCrimeKey,
                            "FK_Time_Lookup"=>(int) $i,
                            "Found"=>0,
                            "Solved"=>0
                         );

                        $timeRange = $timeRanges[ $singleCrimeData["FK_Time_Lookup"] ];
                        $singleCrimeData["Year"] = $timeRange->Year;
                        $singleCrimeData["Month"] = $timeRange->Month;

                    } else {
                        
                        $singleCrimeData = $singleCrimeDataArr[ $i ];

                    }

                    //add to default array, that will be substracted from total
                    if( !array_key_exists( $i, $default ) ) {
                        $default[ $i ] = array(
                                "Found"=>0,
                                "Solved"=>0
                            );
                    }

                    if( $singleCrimeKey != $this->totalCrimeCode ) {

                        //is default?
                        if( $isInDefault ) {

                            //it is, add to sum 
                            $default[$i][ "Found" ] = $default[$i][ "Found" ] + $singleCrimeData[ "Found" ];
                            $default[$i][ "Solved" ] = $default[$i][ "Solved" ] + $singleCrimeData[ "Solved" ];

                        }
                        //do not add at the moment
                        /* else {

                            //it is not, it's custom added, remove it from sum
                            $default[$i][ "Found" ] = $default[$i][ "Found" ] - $singleCrimeData[ "Found" ];
                            $default[$i][ "Solved" ] = $default[$i][ "Solved" ] - $singleCrimeData[ "Solved" ];

                        } */
                            
                    }

                    //constraint values
                    if( $singleCrimeData[ "Found" ] < 0 ) $singleCrimeData[ "Found" ] = 0;
                    if( $singleCrimeData[ "Solved" ] < 0 ) $singleCrimeData[ "Solved" ] = 0;
                    if( $singleCrimeData[ "Solved" ] > $singleCrimeData[ "Found" ] ) {
                        //Debugger::log( "constraining something" );
                        $singleCrimeData[ "Found" ] = $singleCrimeData[ "Solved" ];
                    }

                    array_push( $crimeArray, $singleCrimeData );

                    //store found values for computing max and mins 
                    if( $isInOutput ) array_push( $foundValues, $singleCrimeData[ "Found" ] );

                }

                if( $isInOutput || $singleCrimeKey == $this->totalCrimeCode ) {
                    $data[ $singleCrimeKey ] = $crimeArray;
                }
                
            }
          
            //compute rest crime
            $restData = array();
            $isRestInArray = in_array( $this->restCrimeCode, $outputCrimesArr );
            $totalData = $data[ $this->totalCrimeCode ];

            foreach( $totalData as $key=>$singleTotalData ) {

                //create new entry
                $fkTimeLookup = $singleTotalData[ "FK_Time_Lookup" ];
                $singleRestData = array(
                    "FK_Crime_Lookup" => $this->restCrimeCode,
                    "FK_Time_Lookup" => $fkTimeLookup,
                    "Found" => 0,
                    "Solved" => 0
                );

                $timeRange = $timeRanges[ $fkTimeLookup ];
                $singleRestData[ "Year" ] = $timeRange->Year;
                $singleRestData[ "Month" ] = $timeRange->Month;

                $singleDefaultData = $default[ $fkTimeLookup ];

                $singleRestData[ "Found" ] = $singleTotalData[ "Found" ] - $singleDefaultData[ "Found" ];
                $singleRestData[ "Solved" ] = $singleTotalData[ "Solved" ] - $singleDefaultData[ "Solved" ];

                array_push( $restData, $singleRestData );

                if( $isRestInArray ) array_push( $foundValues, $singleRestData[ "Found" ] );
            }

            //delete the total crime
            unset( $data[ $this->totalCrimeCode ] );

            //add the rest crime 
            if( $isRestInArray  ) {
                $data[ $this->restCrimeCode ] = $restData;
            }
            
            $output2[ "crimes"] = $data;
            $output2[ "minValue" ] = min( $foundValues );
            $output2[ "maxValue" ] = max( $foundValues );
            $output2[ "periodLen" ] = $maxTime - $minTime;

            //temp - add to output just for debug
            $output2[ "totalData" ] = $totalData; 
            $output2[ "singleDefaultData" ] = $default; 

            echo json_encode( $output2 );

            //store to cache
            $this->cache->save( $key, $output2 );

            $this->terminate();
        }

        public function computeCrimeIndex( $crimesCount, $population ) 
        {   
            if( $population > 0 ) return ( $crimesCount / $population ) * 10000;
            else return 0;
        }

        /**
        * for tester 
        */

        public function handleGetAreas( $zoomLevel ) {
            
            $data = $this->models->CrimeData->getAreasForZoomLevel( $zoomLevel )->fetchAll();
            echo json_encode( $data );
            $this->terminate();

        }

}
