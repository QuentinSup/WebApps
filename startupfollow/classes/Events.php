<?php

namespace colaunch\classes;

/**
 * 
 * @author ETP3433
 *
 */
class Events {	
	
	const EVENT_CREATE = 1;
	const EVENT_UPDATE_SETTINGS = 2;
	const EVENT_FOLLOW = 3;
	const EVENT_UNFOLLOW = 4;
	const EVENT_NEWSTORY = 5;
	const EVENT_GETINTOUCH = 6;
	
	private $log;
	private $entity;
	
	/**
	 * constructor
	 */
	public function __construct($log, $entity) {
		$this -> log = $log;
		$this -> entity = $entity;
	}
	
	/**
	 *
	 */
	public function addEvent($startupUID, $userUID, $type, $data) {
	
		if($this -> log -> isTraceEnabled()) {
			$this -> log -> trace("Creation d'un événement associé au compte Startup n°'$startupUID'");
		}
	
		$doc = $this -> entity -> factory();
		$doc -> startup_uid = $startupUID;
		$doc -> user_uid = $userUID;
		$doc -> type = $type;
		$doc -> data = $data;
	
		if($doc -> insert()) {
			$uid = $doc -> getLastInsertId();
			return $uid;
		}
	
		return null;
	}
		
}

?>