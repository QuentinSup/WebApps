<?php

namespace clevertech;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\accessors\ary;
use dw\classes\dwObject;
use dw\helpers\dwFile;
use dw\classes\dwSession;
use dw\enums\HttpStatus;
use dw\classes\controllers\dwBasicController;
use clevertech\classes\ContractEntity;

/**
 * @Mapping(value = '/')
 */
class main extends dwBasicController {

	
	/**
	 * @DatabaseEntity('contract')
	 */
	public static $contractEntity;
	
	
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
		$model -> title = "Maintenance";
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
	    if(self::$session -> has('user')) {
		  return $this -> prepareModel($request, $model, 'main') -> view();
	    }
	    return "redirect:/login";
	}
	
	/**
	 * @Mapping(method = "get", value = "login")
	 */
	public function login(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		return $this -> prepareModel($request, $model, 'log-in') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value = "sign-up")
	 * @Mapping(method = "get", value = "signup")
	 */
	public function signup(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		if(self::$session -> has('user')) {
			return self::account($request, $response, $model);
		}
		
		return $this -> prepareModel($request, $model, 'sign-up') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value = "account")
	 */
	public function account(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		if(!self::$session -> has('user')) {
			self::$session -> origin = $request -> getOrigin();
			return self::login($request, $response, $model);
		}
		
		return $this -> prepareModel($request, $model, 'user-edit') -> view();
	}

	/**
	 * @Mapping(method = "get", value = "admin")
	 */
	public function admin(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	    if(!self::$session -> has('user')) {
	        self::$session -> origin = $request -> getOrigin();
	        return self::login($request, $response, $model);
	    }
	    
	    return $this -> prepareModel($request, $model, 'admin') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value="/:pageid")
	 */
	public function page(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		return HttpStatus::NOT_FOUND;
	}
	
	/**
	 * @Mapping(method = "get", value="session")
	 */
	public function session(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {

		print_r(self::$session);
		
		return HttpStatus::OK;
	}
	
}