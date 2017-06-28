<?php

namespace colaunch;

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
use colaunch\classes\ProjectEntity;

/**
 * @Mapping(value = '/')
 */
class main extends dwBasicController {

	/**
	 * @DatabaseEntity('startup_request')
	 */
	public static $requestEntity;

	/**
	 * @DatabaseEntity('startup_member')
	 */
	public static $memberEntity;
	
	/**
	 * @DatabaseEntity('startup')
	 */
	public static $startupEntity;
	
	
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
	 * @Mapping(method = "get", value = "sign-up")
	 * @Mapping(method = "get", value = "signup")
	 */
	public function signup(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		return $this -> prepareModel($request, $model, 'sign-up') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value = "account")
	 */
	public function account(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		if(!self::$session -> has('user')) {
			$model -> redirectTo = $request -> getUri();
			return self::login($request, $response, $model);
		}
		
		return $this -> prepareModel($request, $model, 'user-edit') -> view();
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
		
		return $this -> prepareModel($request, $model, 'project-create') -> view();
	}
	

	/**
	 * @Mapping(method = "get", value= "startup/:ref")
	 * @Mapping(method = "get", value= "project/:ref")
	 * @Mapping(method = "get", value= "follow/:ref")
	 */
	public function landingPage(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$ref = $request -> Path('ref');
		$model -> ref = $ref;
			
		return $this -> prepareModel($request, $model, 'startup-landingPage') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value= "startup/:ref/join/:uid")
	 * @Mapping(method = "get", value= "project/:ref/join/:uid")
	 */
	public function joinTeam(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		if(!self::$session -> has('user')) {
			$model -> redirectTo = $request -> getUri();
			return self::login($request, $response, $model);
		}
		
		$user = self::$session -> user;
		
		$ref = $request -> Path('ref');
		$uid = $request -> Path('uid');
		
		$memberE = self::$memberEntity -> factory();
		$memberE -> uid = $uid;
		if($member = $memberE -> get()) {
			
			if(!$member -> joined) {
				
				if(!$member -> user_uid || $member -> user_uid == $user -> uid) {
					$memberE -> user_uid = $user -> uid;
					$memberE -> joined = 1;
					$memberE -> joinedAt = $memberE -> castSQL('CURRENT_TIMESTAMP');
					if(!$memberE -> update()) {
						// Error during update !
						return HttpStatus::INTERNAL_SERVER_ERROR;
					}
					
				} else {
					// The current user do not match with the selected user id !
					return HttpStatus::INTERNAL_SERVER_ERROR;
				}
			} elseif($member -> user_uid != $user -> uid) {
				// The member already joined, bu is not the current connected user !
				return HttpStatus::INTERNAL_SERVER_ERROR;
			}
			
			return "redirect:/project/".$member -> startup_uid;
			
		}
		
		// No member uid found !
		return HttpStatus::INTERNAL_SERVER_ERROR;
		
		//return $this -> prepareModel($request, $model, 'startup-join') -> view();
	}
	
	/**
	 * @Mapping(method = "get", value= "startup/edit/:ref")
	 * @Mapping(method = "get", value= "project/edit/:ref")
	 */
	public function projectEdit(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_ref = $request -> Path('ref');
		
		if(!self::$session -> has('user')) {
			$model -> redirectTo = $request -> getUri();
			return self::login($request, $response, $model);
		}
		
		$startupE = new classes\ProjectEntity(self::$startupEntity);
		$startup = $startupE -> get($p_ref);
		
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}
		
		if(!ary::exists(self::$session -> user -> memberOf, $startup -> uid)) {
			$model -> redirectTo = $request -> getUri();
			return self::login($request, $response, $model);
		}
		
		$model -> ref = $startup -> uid;
			
		return $this -> prepareModel($request, $model, 'project-edit') -> view();
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