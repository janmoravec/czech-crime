<?php
namespace FrontModule;
use Nette\Application\UI,
	Nette\Security as NS;


/**
 * Sign in/out presenters.
 *
 * @author     John Doe
 * @package    MyApplication
 */
class SignPresenter extends BasePresenter
{



	public function actionOut()
	{
		$this->getUser()->logout();
		$this->flashMessage('Byl(a) jste odhlášen(a).');
		$this->redirect('Mapa:');
	}

}
