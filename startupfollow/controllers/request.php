<?php

namespace colaunch;

use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\enums\HttpStatus;
use dw\classes\controllers\dwBasicController;
use colaunch\classes\Emailer;

/**
 * @Mapping(value = '/rest/request')
 */
class request extends dwBasicController {
	
	/**
	 *
	 * @var unknown @Autowire(value='logger')
	 */
	public static $log;
	
	/**
	 *
	 * @var unknown @Autowire(value='connector', name='mail')
	 */
	public static $smtp;
	
	/**
	 * @Database
	 */
	public static $db;
	
	/**
	 * @DatabaseEntity('startup_request')
	 */
	public static $requestEntity;
	
	/**
	 * @Mapping(method = "post", consumes="application/json", produces="application/json")
	 */
	public function add(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if (self::$log->isTraceEnabled ()) {
			self::$log->trace ( "Creation et envoi d'une requête d'ajout à une Startup" );
		}
		
		$json = $request->Body ();
		
		$doc = self::$requestEntity;
		
		$doc->name = $json->name;
		$doc->email = $json->email;
		
		if (!$doc->insert()) {
			$response->statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
			return;
		}
		
		$response->statusCode = HttpStatus::CREATED;
		
		$p_id = $doc->getLastInsertId ();
		
		$doc -> find(array("uid" => $p_id));
		
		// Send email
		$emailer = new classes\Emailer(self::$log, self::$smtp);
		$emailer -> sendRequestEmail($request, $doc);
		
		return $doc->toArray ();
	}
}

?>