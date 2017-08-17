<?php

namespace keepintouch;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\http\dwHttpClient;
use dw\enums\HttpStatus;
use dw\classes\controllers\dwBasicController;

/**
 * @Mapping(value = '/')
 */
class main extends dwBasicController {

	private function prepareModel($request, $model, $pageId) {
		$model -> title = "Keep In Touch";
		$model -> pageId = $pageId;
		$model -> version = "1.0.0";
		$model -> host = $request -> getBaseUri();
		return $this;
	}
	
	
	private function view() {
		return 'view:./views/index.html';
	}
	
	/**
	 * @Mapping(method = "get")
	 */
	public function root(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{			
		return $this -> prepareModel($request, $model, 'main') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value= "request/:id")
	 */
	public function requests(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_id = $request -> Path('id');
		
		$resp = dwHttpClient::request('GET', "http://localhost:8080/myapi/api/QuentinSup/keepintouch/request/$p_id", null, array("Content-Type" => "application/json; charset=utf8"));
		
		$json = json_decode($resp -> body);

		if($resp -> status_code == HttpStatus::OK) {
			$model -> sender_name = $json -> from -> name;
			$model -> name = $json -> to -> name;
			$model -> message = $json -> from -> message;
			$model -> request_id = $p_id;
			$model -> request_content = $resp -> body;
		}
				
		return $this -> prepareModel($request, $model, 'request') -> view();
	}
	
}

?>