<?php
function monthCZ($month)
{
  $months = array ("01", "02", "03", "04", "05", "06", "07","08","09","10","11","12");
  $names = array ("leden", "únor", "březen", "duben", "květen", "červen", "červenec","srpen","září","říjen","listopad","prosinec");
  
  return str_replace ($months, $names, $month);
}
/**
 * My Application bootstrap file.
 */
use Nette\Application\Routers\Route;
use Nette\Diagnostics\Debugger;

// Load Nette Framework
require LIBS_DIR . '/Nette/loader.php';


// Configure application
$configurator = new Nette\Config\Configurator;

// Enable Nette Debugger for error visualisation & logging
//$configurator->setDebugMode($configurator::AUTO);
//Debugger::enable(Debugger::PRODUCTION);
$configurator->enableDebugger(__DIR__ . '/../log');
// Enable RobotLoader - this will load all classes automatically
$configurator->setTempDirectory(__DIR__ . '/../temp');
$configurator->createRobotLoader()
	->addDirectory(APP_DIR)
	->addDirectory(LIBS_DIR)
	->register();

// Create Dependency Injection container from config.neon file
$configurator->addConfig(__DIR__ . '/config/config.neon');
$container = $configurator->createContainer();

// Setup router
$router = $container->router;

$router[] = new Route('index.php', array(
            'module' => 'Front',
            'presenter' => 'Mapa',
            'action' => 'default'
), Route::ONE_WAY);

$router[] = new Route('<presenter>/<action>', array(
            'module'    => 'Front',
            'presenter' => 'Mapa',
            'action' => 'default',
));

$router[] = new Route('api/crimes ? areacode=<areacode> timefrom=<timefrom> timeto=<timeto> crimetypes=<crimetypes>', 'Front:Api:crimes' );
$router[] = new Route('api/areas ? level=<level>', 'Front:Api:areas' );
$router[] = new Route('api/times/<id=>', 'Front:Api:times' );

$router[] = new Route('api/<action>/<code=>', array(
            'module'    => 'Front',
            'presenter' => 'Api',
            'action' => 'default',
            'code' => '0'
));


// Configure and run the application!
$container->application->run();


