<?php

namespace startupfollow\classes;

use dw\helpers\dwString;

class StartupEntity {
	
	private $entity;
	
	/**
	 * constructor
	 * @param unknown $entity
	 */
	public function __construct($entity) {
		$this -> entity = $entity;
	}
	

	/**
	 * convert a name onto a valid reference
	 * @param unknown $name
	 */
	public static function convertName($name) {
		return strtolower(dwString::f2link($name));
	}
	
	/**
	 * Load end return data
	 * @param unknown $uid
	 * @return unknown|NULL
	 */
	public function get($uid) {
		
		if($uid) {
	
			$doc = $this -> entity -> factory();
	
			if(is_numeric($uid)) {
				$doc -> uid = $uid;
			} else {
				$ref = self::convertName($uid);
				$doc -> ref = $ref;
			}
	
			if($startup = $doc -> get()) {
				return $startup;
			}
	
		}
	
		return null;
		
	}
	
}

?>