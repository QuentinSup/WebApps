<?php

namespace keeply;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\accessors\ary;
use dw\accessors\session;

/**
 * @Mapping(value = 'account')
 */
class account extends dwBasicController
{

	/**
	 * @Mapping(method = "put", value = "connect", produces = 'application/json; charset=utf-8')
	 */
	public function connectAccount(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{	

		$db = dw::App() -> getConnector('db');
		$postdata = $request -> Body();
		$jsondata = json_decode($postdata, true);
		$data = array(
			"email" 	=> $jsondata["email"],
			"password" 	=> $jsondata["password"]
		);
		$doc = $db -> factory("account", $data);
		if($doc -> find()) {
			$user = $doc -> toArray();
			session::set('user', $user);
			$response -> statusCode = 200;
			$returnValue = $doc -> toArray();
			return json_encode($returnValue, JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 401;
		return;
	}
	
	/**
	 * @Mapping(method = "get", produces = 'application/json; charset=utf-8')
	 */
	public function getAccount(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$user = session::get('user');
		if(!$user) {
			$response -> statusCode = 403;
			return;
		}
		
		$db = dw::App() -> getConnector('db');
		$data = array('id' => $user['id']);
		$doc = $db -> factory("account", $data);
		if($doc -> find()) {
			$response -> statusCode = 200;
			$returnValue = $doc -> toArray();
			return json_encode($returnValue, JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 401;
		return;
	}
	
	/**
	 * @Mapping(method = "post", produces = 'application/json; charset=utf-8')
	 */
	public function ajoutAccount(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
		$db = dw::App() -> getConnector('db');
		$postdata = $request -> Body(); 
		$jsondata = json_decode($postdata, true);
		$doc = $db -> factory("account", $jsondata);
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
	public function majAccount(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$user = session::get('user');
		if(!$user) {
			$response -> statusCode = 403;
			return;
		}
		
		$db = dw::App() -> getConnector('db');
		$postdata = $request -> Body();
		$jsondata = json_decode($postdata, true);
		$jsondata['id'] = $user['id'];
		$doc = $db -> factory("account", $jsondata);
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