<?php

namespace myapi;

use dw\accessors\request;
use dw\helpers\dwString;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\controllers\dwBasicController;
use dw\enums\HttpStatus;
use dw\connectors\dbi\dbi;

/**
 * API
 * @Mapping(value = 'api/:userName/:appName/')
 */
class index extends dwBasicController {
	
	/**
	 * @Autowire('logger')
	 */
	public static $log;
	
	/**
	 * @Database
	 */
	public static $db;
	
	/**
	 * @DatabaseEntity('api')
	 */
	public static $apiEntity;
	
	/**
	 * @DatabaseEntity('user')
	 */
	public static $userEntity;
	public function __construct() {
	}
	
	/**
	 * Contrôle
	 * 
	 * @param dwHttpRequest $request        	
	 * @param dwHttpResponse $response        	
	 * @param dwModel $model        	
	 * @return boolean
	 */
	public function startRequest(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$userName = $request->Path ( 'userName' );
		
		$doc = self::$userEntity;
		$doc->name = $userName;
		
		if (! $doc->find ()) {
			$response->statusCode = HttpStatus::UNAUTHORIZED;
			return false;
		}
	}
	
	/**
	 * Retourne contenu d'une API
	 * @Mapping(value = ':categoryName/:id', method = "get")
	 */
	public function getFromAPI(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$doc = self::$apiEntity;
		$p_userName = $request->Path ( 'userName' );
		$p_appName = $request->Path ( 'appName' );
		$p_categoryName = $request->Path ( 'categoryName' );
		$p_id = $request->Path ( 'id' );
		
		$doc->user = $p_userName;
		$doc->app = $p_appName;
		$doc->category = $p_categoryName;
		$doc->id = $p_id;
		
		if (! $doc->find ()) {
			$response->statusCode = HttpStatus::NOT_FOUND;
		}
		
		if ($doc->contentType) {
			$response->contentType = $doc->contentType;
		}
		
		return "text:".$doc->data;
	}
	
	/**
	 * Retourne tout le contenu d'une API
	 * @Mapping(value = ':categoryName/all', method = "get", produces = 'application/json; charset=utf8')
	 */
	public function getAllFromAPI(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$doc = self::$apiEntity;
		$p_userName = $request->Path ( 'userName' );
		$p_appName = $request->Path ( 'appName' );
		$p_categoryName = $request->Path ( 'categoryName' );
		$p_id = $request->Path ( 'id' );
		
		$limit = $request -> Header("X-API-Limit");
		$offset = $request -> Header("X-API-Offset");
		$page = $request -> Header("X-API-Page");
				
		$doc->user = $p_userName;
		$doc->app = $p_appName;
		$doc->category = $p_categoryName;
		
		$items = array ();
		
		if($limit) {
			$totalRecords = $doc -> count();
			if($page) {
				$offset = ($page - 1) * $limit;
			}
				
			$response -> Header('X-API-Request-Limit', $limit);
			$response -> Header('X-API-Request-Offset', $offset);
			$response -> Header('X-API-Request-Page', $page);
			
		}

		if ($doc->lfind($limit, $offset)) {
			do {
				$items [] = array (
						"id" => $doc->id,
						"data" => $doc->data,
						"contentType" => $doc->contentType 
				);
			} while ( $doc->fetch () );
		} else {
			$response->statusCode = HttpStatus::NOT_FOUND;
		}
		
		$nbrows = $doc -> N();
		$response -> Header('X-API-ReturnRows', $nbrows);
		
		if($limit) {
			$nbpages = ceil($totalRecords / $limit);
			$newoffset = $offset + $nbrows;
			if($newoffset < $totalRecords) {
				$response -> Header('X-API-NextOffset', $offset + $nbrows);
			}
			$currentpage = floor(($limit + $offset) / $limit);
			$response -> Header('X-API-TotalRecords', $totalRecords);
			if($page) {
				$response -> Header('X-API-TotalPages', $nbpages);
				$response -> Header('X-API-CurrentPage',  $currentpage);
			}
		}
		
		return $items;
	}
	
	/**
	 * Ajoute du contenu à une API
	 * @Mapping(value = ':categoryName/:id?', method = "post", produces = 'text/html; charset=utf8')
	 */
	public function postToAPI(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$doc = self::$apiEntity;
		
		$p_userName = $request->Path ( 'userName' );
		$p_appName = $request->Path ( 'appName' );
		$p_categoryName = $request->Path ( 'categoryName' );
		$p_id = $request->Path ( 'id', dwString::generate ( 32 ) );
		
		$doc->user = $p_userName;
		$doc->app = $p_appName;
		$doc->category = $p_categoryName;
		$doc->data = $request->getRequestBody ();
		$doc->id = $p_id;
		$doc->contentType = $request->getContentType ();
		
		$ods = $doc->insert ();
		
		if (! $ods) {
			$response->statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
			return;
		}
		
		if ($ods->getAffectedRows () == 0) {
			$response->statusCode = HttpStatus::NO_CONTENT;
			return;
		}
		
		$response->statusCode = HttpStatus::CREATED;
		
		return $doc->id;
	}
	
	/**
	 * Modifie entièrement le contenu d'une API
	 * @Mapping(value = ':categoryName/:id', method = "put", produces = 'text/html; charset=utf8')
	 */
	public function putAPI(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$doc = self::$apiEntity;
		$p_userName = $request->Path ( 'userName' );
		$p_appName = $request->Path ( 'appName' );
		$p_categoryName = $request->Path ( 'categoryName' );
		$p_id = $request->Path ( 'id');
	
		$doc->user = $p_userName;
		$doc->app = $p_appName;
		$doc->category = $p_categoryName;
		$doc->id = $p_id;
			
		$doc -> setPrimaryKeys(array("user", "app", "category", "id"));
		
		$doc->data = $request->getRequestBody ();
		
		$ods = $doc->update ();
	
		if (! $ods) {
			$response->statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
			return;
		}
	
		if ($ods->getAffectedRows () == 0) {
			$response->statusCode = HttpStatus::NO_CONTENT;
			return;
		}
	
		$response->statusCode = HttpStatus::OK;
	
		return null;
	}
	
	/**
	 * Supprimer du contenu à une API
	 * @Mapping(value = ':categoryName/:id', method = "delete", produces = 'text/html; charset=utf8')
	 */
	public function deleteFromAPI(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$doc = self::$apiEntity;
		$p_userName = $request->Path ( 'userName' );
		$p_appName = $request->Path ( 'appName' );
		$p_categoryName = $request->Path ( 'categoryName' );
		$p_id = $request->Path ( 'id' );
		
		$doc->user = $p_userName;
		$doc->app = $p_appName;
		$doc->category = $p_categoryName;
		$doc->id = $p_id;
		
		$ods = $doc->delete ();
		
		if (! $ods) {
			$response->statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
			return;
		}
		
		if ($ods->getAffectedRows () == 0) {
			$response->statusCode = HttpStatus::NOT_FOUND;
			return;
		}
		
		return null;
	}
}

?>