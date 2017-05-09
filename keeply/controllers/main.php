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
 * @Mapping(value = '/')
 */
class main extends dwBasicController {
	
	/**
	 * @Mapping(method = "get", value = "/")
	 * @Mapping(method = "get", value = "pages/:pageId?")
	 */
	public function page(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
		$user = session::get('user');
		$model -> host = $request -> getBaseUri();
		$model -> pageId = $request -> Path('pageId', 'root');
		$model -> pageSrc = $model -> host.'resources/pages/'.$model -> pageId."/";
		$model -> user = $user;
		$model -> userId = $user?$user['id']:'';
		return 'view:resources/index.html';
		
	}
	
	/**
	 * Disconnect user
	 * @param dwHttpRequest $request
	 * @param dwHttpResponse $response
	 * @param dwModel $model
	 * @return string
	 *  @Mapping(method = "get", value = "/disconnect")
	 */
	public function disconnect(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		session::kill('user');
		return $this -> page($request, $response, $model);
	}

}

?>