<?php

namespace myapi;

use dw\accessors\request;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\enums\HttpStatus;

/**
 * User
 * @Mapping(value = 'user')
 */
class user extends dwBasicController {
	
	/**
	 * @Autowire('logger')
	 */
	public static $log;
	
	/**
	 * @Autowire(value = 'connector', name = 'db')
	 */
	public static $db;
	
	/**
	 * @DatabaseEntity(value = 'user', dbname = 'db')
	 */
	public static $userEntity;
	
	public function __construct() {
	}
	
	/**
	 * Contrôle
	 * @param dwHttpRequest $request
	 * @param dwHttpResponse $response
	 * @param dwModel $model
	 * @return boolean
	 */
	public function startRequest(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
	
	}
	
	/**
	 * Retourne un utilisateur
	 * @Mapping(value = ':userName', method = "get", produces = "application/json;charset=utf8")
	 */
	public function getUser(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
		$doc = self::$userEntity;
		
		$p_userName = $request->Path ( 'userName' );
		
		$doc->name = $p_userName;

		if (! $doc->find ()) {
			$response->statusCode = HttpStatus.NOT_FOUND;
		}
	
		return $doc->data;
	}
	
	/**
	 * Ajoute du contenu à une API
	 * @Mapping(value = '/', method = "post", consumes = "application/json; charset=utf8", produces = "text/html; charset=utf8")
	 */
	public function postUser(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
		$doc = self::$userEntity;
		
		$p_userName = $request->Path ( 'userName' );
		
		$json = $request -> Body();
						
		$doc->name = $json -> name;

		$ods = $doc->insert ();
		
		if (! $ods) {
			$response->statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			return;
		}
		
		if($ods -> getAffectedRows() == 0) {
			$response->statusCode = HttpStatus.NOT_MODIFIED;
			return;
		}
		
		$response->statusCode = HttpStatus.CREATED;
		
		return (string)$doc->getLastInsertId();
	}
	
	/**
	 * Met à jour les données d'un utilisateur
	 * @Mapping(value = ':userName', method = "patch", consumes = "application/json; charset=utf8", produces = "text/html; charset=utf8")
	 */
	public function patchUser(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
		$doc = self::$userEntity;
		
		$p_userName = $request->Path ( 'userName' );
	
		$json = $request -> Body();

		
		$doc->name = $p_userName;
		
		$doc -> setFrom(new dwObject($json));
	
		$ods = $doc->update (array("name" => $p_userName));

		if (!$ods) {
			$response->statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
			return;
		}
		
		if($ods -> getAffectedRows() == 0) {
			$response->statusCode = HttpStatus::NO_CONTENT;
		}
	
	}
	
	/**
	 * Supprime un utilisateur
	 * @Mapping(value = ':userName', method = "delete", produces = "text/html; charset=utf8")
	 */
	public function deleteUser(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
		$doc = self::$userEntity;
		
		$p_userName = $request->Path ( 'userName' );
	
		$doc->name = $p_userName;

		$ods = $doc->delete();
		
		if (!$ods) {
			$response->statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			return;
		}
		
		if ($ods->getAffectedRows () == 0) {
			$response->statusCode = HttpStatus.NOT_FOUND;
		}
		
		return null;
	}
}

?>