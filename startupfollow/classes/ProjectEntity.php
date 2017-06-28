<?php

namespace colaunch\classes;

use dw\helpers\dwString;

class ProjectEntity {
	
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
	

	/**
	 * 
	 */
	public static function getAgeInDays($date)
	{
		$diff = abs(time() - strtotime($date));
		$retour = array();
	
		$tmp = $diff;
		$retour['second'] = $tmp % 60;
	
		$tmp = floor( ($tmp - $retour['second']) /60 );
		$retour['minute'] = $tmp % 60;
	
		$tmp = floor( ($tmp - $retour['minute'])/60 );
		$retour['hour'] = $tmp % 24;
	
		$tmp = floor( ($tmp - $retour['hour']) /24 );
		$retour['day'] = $tmp;
	
		return $retour['day'];
	}
	
}

?>