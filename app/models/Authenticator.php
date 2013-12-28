<?php

namespace Models;

use Nette\Security as NS;

/**
 * Users authenticator.
 *
 * @author     John Doe
 * @package    MyApplication
 */
class Authenticator extends BaseModel implements NS\IAuthenticator
{



	/**
	 * Performs an authentication
	 * @param  array
	 * @return Nette\Security\Identity
	 * @throws Nette\Security\AuthenticationException
	 */
	public function authenticate(array $credentials)
	{
		list($username, $password) = $credentials;
		$row = $this->getDatabase()->select('*')->from('users')->where('email=%s',$username)->fetch();

		if (!$row) {
			throw new NS\AuthenticationException("Uživatel '$username' neexistuje.", self::IDENTITY_NOT_FOUND);
		}

		if ($row->password !== $this->calculateHash($password)) {
			throw new NS\AuthenticationException("Neplatné heslo.", self::INVALID_CREDENTIAL);
		}

                $this->getDatabase()->update('users', array('date_last_login'=>date('Y-m-d H:i:s')))->where('id=%i',$row->id)->execute();
		unset($row->password);
		return new NS\Identity($row->id,NULL, $row->toArray());
	}





}
