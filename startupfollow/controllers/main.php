<?php

namespace startupfollow;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\http\dwHttpSocket;
use dw\enums\HttpStatus;
use dw\classes\controllers\dwBasicController;

/**
 * @Mapping(value = '/')
 */
class main extends dwBasicController {

	private function prepareModel($request, $model, $pageId) {
		$model -> title = "StartupFollow";
		$model -> pageId = $pageId;
		$model -> version = "1.0.0";
		$model -> host = $request -> getBaseUri();
		return $this;
	}
	
	
	private function view() {
		return 'view:./resources/index.html';
	}
	
	/**
	 * @Mapping(method = "get")
	 */
	public function root(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{			
		return $this -> prepareModel($request, $model, 'main') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value="/:pageid")
	 */
	public function page(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		return $this -> prepareModel($request, $model, $request -> Path('pageid')) -> view();
	}
	
	/**
	 * @Mapping(method = "get", value= "request/:id")
	 * @Mapping(method = "get", value= "get-started/:id")
	 */
	public function requests(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_id = $request -> Path('id');
	
		$resp = dwHttpSocket::request('GET', "http://localhost:8080/myapi/api/QuentinSup/startupfollow/request/$p_id", null, array("Content-Type" => "application/json; charset=utf8"));
	
		$json = json_decode($resp -> body);
	
		if($resp -> status_code == HttpStatus::OK) {
			$model -> requestName = $json -> name;
			$model -> requestEmail = $json -> email;
		}
	
		return $this -> prepareModel($request, $model, 'request') -> view();
	}
	
	
}

?>