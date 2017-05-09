<?php

namespace keeply;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\accessors\ary;
use dw\accessors\session as session;

/**
 * @Mapping(value = 'ufo')
 */
class ufo extends dwBasicController
{

	/**
	 * @Mapping(method = "get", produces = 'application/json; charset=utf-8')
	 */
	public function getUfo(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$user = session::get('user');
		if(!$user) {
			$response -> statusCode = 403;
			return;
		}
	
		$db = dw::App() -> getConnector('db');
		$data = array('user_id' => $user['id']);
		$doc = $db -> factory("ufo", $data);
		if($doc -> find()) {
			$response -> statusCode = 200;
			$returnValue = $doc -> toArray();
			return json_encode($returnValue, JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 401;
		return;
	}
	
	/**
	 * @Mapping(method = "get", value = "profil", produces = 'application/json; charset=utf-8')
	 */
	public function getProfil(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$user = session::get('user');
		if(!$user) {
			$response -> statusCode = 403;
			return;
		}
	
		$db = dw::App() -> getConnector('db');
		$data = array('user_id' => $user['id']);
		$doc = $db -> factory("ufo", $data);
		if($doc -> find()) {
			$response -> statusCode = 200;
			$returnValue = $doc -> toArray();
			$returnValue['firstName'] 	= $user['firstName'];
			$returnValue['name'] 		= $user['name'];
			$returnValue['email'] 		= $user['email'];
			return json_encode($returnValue, JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 401;
		return;
	}
	
	/**
	 * @Mapping(method = "post", produces = 'application/json; charset=utf-8')
	 */
	public function ajoutUfo(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
		$user = session::get('user');
		if(!$user) {
			$response -> statusCode = 403;
			return;	
		}
		
		$db = dw::App() -> getConnector('db');
		$postdata = $request -> Body(); 
		$jsondata = json_decode($postdata, true);
		$jsondata['user_id'] = $user['id'];
		$doc = $db -> factory("ufo", $jsondata);
		if($doc -> insert()) {
			$response -> statusCode = 200;
			$returnValue = $doc -> toArray();
			$returnValue['id'] = $doc -> getLastInsertId();
			return json_encode($returnValue, JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 401;
		return;
	}
	
	/**
	 * @Mapping(method = "put", produces = 'application/json; charset=utf-8')
	 */
	public function majUfo(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$user = session::get('user');
		if(!$user) {
			$response -> statusCode = 403;
			return;
		}
		
		$db = dw::App() -> getConnector('db');
		$postdata = $request -> Body();
		$jsondata = json_decode($postdata, true);
		$jsondata['user_id'] = $user['id'];
		$doc = $db -> factory("ufo", $jsondata);
		if($doc -> update()) {
			$response -> statusCode = 200;
			$returnValue = $doc -> toArray();
			return json_encode($returnValue, JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 401;
		return;
	}

}

?>