<?php

use Nette\DI\Container;

final class ModelLoader
{
    /** @var Nette\DI\Container */
    private $modelContainer;

    /** @var array */
    private $models = array();

    public function __construct(Container $container)
    {
        $modelContainer = new Container;
        $modelContainer->addService('database', $container->database);
        $modelContainer->addService('cacheStorage', $container->cacheStorage);
        $modelContainer->addService('session', $container->session);
    //    $modelContainer->params = $container->params['models'];
        $modelContainer->freeze();
        $this->modelContainer = $modelContainer;
    }

    public function getModel($name)
    {
        $lname = strtolower($name);

        if (!isset($this->models[$lname])) {
            $class = 'Models\\' . ucfirst($name);

            if (!class_exists($class)) {
                throw new \InvalidArgumentException("Model '$class' not found");
            }

            $this->models[$lname] = new $class($this->modelContainer);
        }

        return $this->models[$lname];
    }

    public function __get($name)
    {
        return $this->getModel($name);
    }
}