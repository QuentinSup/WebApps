<?php

namespace startupfollow;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\http\dwHttpSocket;
use dw\enums\HttpStatus;
use dw\classes\controllers\dwBasicController;

/**
 * @Mapping(value = '/')
 */
class main extends dwBasicController {

	/**
	 * @DatabaseEntity('request')
	 */
	public static $requestEntity;
	
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
		
		$doc = self::$requestEntity;
		
		$p_id = $request -> Path('id');
	
		$doc -> uid = $p_id;
		if($doc -> find()) {
			$model -> requestName = $doc -> name;
			$model -> requestEmail = $doc -> email;
		}
		
		return $this -> prepareModel($request, $model, 'startup_add') -> view();
	}
	

	/**
	 * @Mapping(method = "get", value= "startup/:id")
	 * @Mapping(method = "get", value= "follow/:id")
	 */
	public function landingPage(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_id = $request -> Path('id');
		$model -> id = $p_id;
			
		return $this -> prepareModel($request, $model, 'startup_landingPage') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value= "startup/edit/:name")
	 */
	public function startupEdit(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$pName = $request -> Path('name');
		$model -> name = $pName;
			
		return $this -> prepareModel($request, $model, 'startup_edit') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value= "startup/:name/story")
	 */
	public function startupStories(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$pName = $request -> Path('name');
		$model -> name = $pName;
			
		return $this -> prepareModel($request, $model, 'startup_stories') -> view();
	}
	
	
}

?>