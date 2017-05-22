<?php

namespace startupfollow;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\dwSession;
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

	/**
	 * @Session()
	 */
	public static $session;
	
	/**
	 * Traitement de prérequête
	 *
	 * @param dwHttpRequest $request
	 * @param dwHttpResponse $response
	 * @param dwModel $model
	 * @return boolean
	 */
	public function startRequest(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
		if(self::$session -> has('user')) {
			$model -> userName = self::$session -> user -> name;
			$model -> user = self::$session -> user;
		}

	}
	
	private function prepareModel(dwHttpRequest $request, dwModel $model, $pageId) {
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
	 * @Mapping(method = "get", value = "login")
	 */
	public function login(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		return $this -> prepareModel($request, $model, 'log-in') -> view();
	}
		
	/**
	 * @Mapping(method = "get", value= "request/:id")
	 * @Mapping(method = "get", value= "get-started")
	 */
	public function requests(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		if(!self::$session -> has('user')) {
			$model -> redirectTo = $request -> getUri();
			return self::login($request, $response, $model);
		}
		
		$doc = self::$requestEntity;
		
		$p_id = $request -> Path('id');
	
		if($p_id) {
			$doc -> uid = $p_id;
			if($doc -> find()) {
				$model -> requestName = $doc -> name;
				$model -> requestEmail = $doc -> email;
			}
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
		if(!self::$session -> has('user')) {
			$model -> redirectTo = $request -> getUri();
			return self::login($request, $response, $model);
		}
		
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
	
	/**
	 * @Mapping(method = "get", value="/:pageid")
	 */
	public function page(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		return HttpStatus::NOT_FOUND;
	}
	
}

?>