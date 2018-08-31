<?php

namespace clevertech;

use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\enums\HttpStatus;
use dw\helpers\dwString;
use dw\classes\controllers\dwBasicController;
use clevertech\classes\Emailer;
use clevertech\classes\Events;

/**
 * @Mapping(value = '/rest/user')
 * POST /
 * PUT /
 * GET /
 * GET /search
 * GET /username/:name
 * GET /email/:email
 * POST /auth
 * DELETE /auth
 * DELETE /password
 * PUT /password
 */
class user extends dwBasicController {
	
	/**
	 *
	 * @var unknown @Autowire(value='logger')
	 */
	public static $log;
	
	/**
	 *
	 * @var unknown @Autowire(value='connector', name='mail')
	 */
	public static $smtp;
	
	/**
	 * @Session()
	 */
	public static $session;
	
	/**
	 * @DatabaseEntity('user')
	 */
	public static $userEntity;
	
	/**
	 * Constructor
	 */
	public function __construct() {
		
	}
	
	
	/**
	 * Return current user info
	 * @Mapping(method = "get", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function get(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
		
		if(@self::$session -> user -> deprecated == true) {
			// update data
			$this -> updateUserDataSession(self::$session -> user -> uid);
		}
		
		return self::$session -> user -> toArray();

	}
	
	/**
	 * Return all users
	 * @Mapping(method = "get", value="all", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function getAll(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
	    
	    if(!self::$session -> has('user')) {
	        return HttpStatus::FORBIDDEN;
	    }
	    
	    $doc = self::$userEntity->factory();
	    
	    if (!$doc->all()) {
	        return HttpStatus::INTERNAL_SERVER_ERROR;
	    }
	    
	    $data = array();
	    while($doc -> fetch()) {
	        $data[] = $doc -> export("uid name email image firstName lastName") -> toArray();
	    }
	    
	    return $data;
	    
	}
	
	/**
	 * Search
	 * @Mapping(method = "get", value="search", consumes="application/x-www-form-urlencoded", produces="application/json; charset=utf-8")
	 */
	public function search(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
	
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}

		$doc = self::$userEntity->factory ();

		$doc -> email 		= $request -> Param('email');
		$doc -> name 		= $request -> Param('name');
		$doc -> firstName 	= $request -> Param('firstName');
		$doc -> lastName 	= $request -> Param('lastName');
				
		if ($doc->find ()) {
			
			$data = array();
			do {
				$data[] = $doc -> export("uid name email image firstName lastName") -> toArray();
			} while($doc -> fetch());

			return $data;
		}
	
		$response -> status(HttpStatus::NOT_FOUND);
	}
	
	/**
	 * Disconnect current user
	 * @Mapping(method = "delete", value="auth", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function logout(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		self::$session->destroy ();
	}
	
	/**
	 * Create new user
	 * @Mapping(method = "post", value="auth", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function login(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$json = $request->Body ();
		
		$doc = self::$userEntity->factory ();
		$doc->name = strtolower($json->name);
		$doc->password = md5 ( $json->password );
		
		if ($user = $doc->get()) {
			
			// get origin uri
			$origin = self::$session -> origin;
			
			self::$session->start();
			
			// Update date of connection
			$docUpdate = self::$userEntity->factory ();
			$docUpdate -> uid = $user -> uid;
			$docUpdate -> lastConnection = $docUpdate -> castSQL('CURRENT_TIMESTAMP');
			$docUpdate -> update();
			
			if($this -> updateUserDataSession($user -> uid)) {
				return array("user" => self::$session -> user -> toArray(), "redirect" => $origin);
			}

		}
		
		self::$session-> user = null;
		
		return HttpStatus::NOT_FOUND;
	}
	
	/**
	 * @Mapping(method = "delete", value="password", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function resetPassword(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$json = $request->Body ();
	
		$doc = self::$userEntity->factory ();
		$doc->email = strtolower($json->email);
	
		if ($user = $doc->get()) {
				
			if(!$this -> changePassword($request, $user, dwString::generate ( "5" ))) {
				return HttpStatus::INTERNAL_SERVER_ERROR;
			}
		
			return HttpStatus::OK;
	
		}
	
		return HttpStatus::NOT_FOUND;
	}
	
	/**
	 * Update user password
	 */
	private function changePassword($request, $user, $password) {
		$doc = self::$userEntity->factory ();
		$doc -> uid = $user -> uid;
		$doc->password = md5 ($password);
			
		if(!$doc -> update()) {
			return false;
		}
		
		// Send email
		$emailer = new Emailer(self::$log, self::$smtp);
		if(!$emailer -> sendResetPassword($request, $user, $password)) {
			return false;
		}
		
		return true;
	}
	
	/**
	 * Update data user into session
	 * @param unknown $uid
	 */
	private function updateUserDataSession($uid) {
		
		$doc = self::$userEntity->factory ();
		$doc-> uid = $uid;
		
		if ($user = $doc->get()) {
				
			$user -> password = null; // Hide password !
			self::$session->user = $user;
			
			return true;
		}
		
		return false;
		
	}
	
	/**
	 * @Mapping(method = "get", value="username/:name", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function checkUserName(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$p_userName = $request -> Path('name');
		$uid = $request -> Param('ref');
	
		$doc = self::$userEntity->factory ();

		if ($doc->select("LOWER(name) = LOWER('".$doc -> escapeValue($p_userName)."')".($uid?" AND uid <> $uid":"")) == 0) {
			return HttpStatus::OK;
		}
		
		return HttpStatus::FORBIDDEN;
		
	}
	
	/**
	 * @Mapping(method = "get", value="email/:email", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function checkUserEmail(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
	
		$p_userEmail = $request -> Path('email');
		$uid = $request -> Param('ref');
		
		$doc = self::$userEntity->factory ();
		$doc->email = strtolower($p_userEmail);
	
		if ($user = $doc->get()) {
			if($user -> uid == $uid) {
				return HttpStatus::OK;
			}
			return HttpStatus::NOT_FOUND;
		} else {
			return HttpStatus::OK;
		}
		
		return HttpStatus::FORBIDDEN;
	
	}
	
	/**
	 * @Mapping(method = "post", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function add(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if (self::$log->isTraceEnabled ()) {
			self::$log->trace ( "Creation d'un nouveau compte utilisateur" );
		}
		
		$json = $request->Body ();
		
		$doc = self::$userEntity->factory ();
		
		$doc->email = strtolower($json->email);
		$doc->name = $json->name;
		
		$password = @$json->password;
		
		if (!$password) {
			$doc->password = md5 ( $password = dwString::generate ( "5" ) );
		}
		
		if (! $doc->insert ()) {
			return HttpStatus::INTERNAL_SERVER_ERROR;
		}
		
		$doc->find ( array (
				'uid' => $doc->getLastInsertId () 
		) );
		
		// Send welcome email
		$emailer = new classes\Emailer(self::$log, self::$smtp);
		$emailer -> sendSignUp($request, $doc, $password);
		
		return $doc->toArray ();
	}
	
	/**
	 * @Mapping(method = "put", value=":uid?", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function update(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
		
		$p_uid = $request -> Path('uid', self::$session -> user -> uid);
		
		
		if (self::$log->isTraceEnabled ()) {
			self::$log->trace ( "Modification du compte utilisateur n$p_uid" );
		}
		
		$json = $request->Body ();
		
		$doc = self::$userEntity->factory ();
		$doc->uid = $p_uid;
		$doc->firstName = @$json->firstName;
		$doc->lastName = @$json->lastName;
		$doc->email = isset($json->email)?strtolower($json -> email):null;
		$doc->name = @$json->name;
		$doc->image = @$json->image;
		$doc->link_twitter = @$json->link_twitter;
		$doc->link_website = @$json->link_website;
		$doc->link_facebook =@$json->link_facebook;
		
		if ($doc->update()) {
			if($this -> updateUserDataSession($p_uid)) {
				return self::$session -> user -> toArray();
			}
		}
		
		return HttpStatus::INTERNAL_SERVER_ERROR;
	}
	
	/**
	 * @Mapping(method = "put", value="password/:uid?", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function updatePassword(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
	
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
	
		$p_uid = $request -> Path('uid', self::$session -> user -> uid);
	
		if (self::$log->isTraceEnabled ()) {
			self::$log->trace ( "Modification du mot de passe utilisateur n$p_uid" );
		}
		
		// Get password from body
		$json = $request->Body ();
		if(!isset($json -> password)) {
			return HttpStatus::BAD_REQUEST;
		}
		
		// Do change password shared treatment
		if(!$this -> changePassword($request, self::$session -> user, $json -> password)) {
			return HttpStatus::INTERNAL_SERVER_ERROR;
		}

		return HttpStatus::OK;
	}

	
}