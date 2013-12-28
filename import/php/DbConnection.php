<?php
	class DbConnection {

		public $hostname;
		public $username;
		public $password;
		public $dbName;

		public function __construct( $hostname, $username, $password, $dbName ) {

			$this->hostname = $hostname;
			$this->username = $username;
			$this->password = $password;
			$this->dbName = $dbName;

		}

	}
?>