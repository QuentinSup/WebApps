<?php

namespace colaunch;

use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\enums\HttpStatus;
use dw\helpers\dwString;
use dw\classes\controllers\dwBasicController;
use colaunch\classes\Emailer;
use colaunch\classes\Events;
use colaunch\classes\ProjectEntity;

/**
 * @Mapping(value = '/rest/user')
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
	 * @DatabaseEntity('startup')
	 */
	public static $startupEntity;
	
	/**
	 * @DatabaseEntity('user_story_like')
	 */
	public static $storyLikeEntity;
	
	/**
	 * @DatabaseEntity('startup_follower')
	 */
	public static $startupUserSubscriptionEntity;
	
	/**
	 * @DatabaseEntity('startup_member')
	 */
	public static $memberEntity;
	
	/**
	 * @DatabaseEntity('startup_follower')
	 */
	public static $startupFollowerEntity;
	
	/**
	 * @DatabaseEntity('startup_event')
	 */
	public static $startupEventEntity;
	
	/**
	 * Events manager
	 * @var unknown
	 */
	private $eventsManager;
	
	/**
	 * Constructor
	 */
	public function __construct() {
		$this -> eventsManager = new Events(self::$log, self::$startupEventEntity);
	}
	
	
	/**
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
	 * @Mapping(method = "delete", value="auth", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function logout(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		self::$session->destroy ();
	}
	
	/**
	 * @Mapping(method = "post", value="auth", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function login(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$json = $request->Body ();
		
		$doc = self::$userEntity->factory ();
		$doc->name = strtolower($json->name);
		$doc->password = md5 ( $json->password );
		
		if ($user = $doc->get()) {
			
			self::$session->start();
			
			// Update date of connection
			$docUpdate = self::$userEntity->factory ();
			$docUpdate -> uid = $user -> uid;
			$docUpdate -> lastConnection = $docUpdate -> castSQL('CURRENT_TIMESTAMP');
			$docUpdate -> update();
			
			if($this -> updateUserDataSession($user -> uid)) {
				return self::$session -> user -> toArray();
			}

		}
		
		self::$session->destroy ();
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
				
			$doc = self::$userEntity->factory ();
			$doc -> uid = $user -> uid;
			$doc->password = md5 ( $password = dwString::generate ( "5" ) );
			
				
			if(!$doc -> update()) {
				return HttpStatus::INTERNAL_SERVER_ERROR;
			}
			
			// Send email
			$emailer = new classes\Emailer(self::$log, self::$smtp);
			if(!$emailer -> sendResetPassword($request, $user, $password)) {
				return HttpStatus::INTERNAL_SERVER_ERROR;
			}
			
			return HttpStatus::OK;
	
		}
	
		return HttpStatus::NOT_FOUND;
	}
	
	/**
	 * Update data user into session
	 * @param unknown $uid
	 */
	private function updateUserDataSession($uid) {
		
		$doc = self::$userEntity->factory ();
		$doc-> uid = $uid;
		
		if ($doc->find()) {
				
			$user = $doc-> export();
			$user -> password = null; // Hide password !
		
			// Look for member teams
			$docMemberTeam = self::$memberEntity->factory ();
			$docMemberTeam -> user_uid = $user -> uid;
			$memberOf = array();
			$teams = array();
			if($docMemberTeam -> find()) {
				do {
					$docStartup = self::$startupEntity -> factory();
					if($startup = $docStartup -> get(array("uid" => $docMemberTeam -> startup_uid))) {
						$startup -> role = $docMemberTeam -> role;
						$startup -> lastActivityInDays = @$startup -> lastStoryCreatedAt?ProjectEntity::getAgeInDays($startup -> lastStoryCreatedAt):-1;
						$memberOf[] = $startup -> uid;
						$teams[] = $startup -> toArray();
					}
				} while($docMemberTeam -> fetch());
			}
			$user -> memberOf = $memberOf;
			$user -> teams = $teams;
				
			// List for subscriptions
			$subscriptions = array();
			$projects = array();
			$docSubscriptions = self::$startupUserSubscriptionEntity -> factory();
			$docSubscriptions -> user_uid = $doc -> uid;
			if($docSubscriptions -> find()) {
				do {
					$subscriptions[] = $docSubscriptions -> toArray();
					$docStartup = self::$startupEntity -> factory();
					if($startup = $docStartup -> get(array("uid" => $docSubscriptions -> startup_uid))) {
						$projects[] = $startup -> toArray();
					}
				} while($docSubscriptions -> fetch());
			}
			$user -> subscriptions = $subscriptions;
			$user -> projects = $projects;
		
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
	
		$doc = self::$userEntity->factory ();

		$doc->name = strtolower($p_userName);

		
		
		if (!$doc->get ()) {
			return array("OK");
		}
		
		return HttpStatus::FORBIDDEN;
		
	}
	
	/**
	 * @Mapping(method = "get", value="email/:email", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function checkUserEmail(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
	
		$p_userEmail = $request -> Path('email');
	
		$doc = self::$userEntity->factory ();
		$doc->email = strtolower($p_userEmail);
	
		if (!$doc->get ()) {
			return array("OK");
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
	 * @Mapping(method = "put", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function update(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
		
		$p_uid = self::$session -> user -> uid;
		
		
		if (self::$log->isTraceEnabled ()) {
			self::$log->trace ( "Modification du compte utilisateur n$p_uid" );
		}
		
		$json = $request->Body ();
		
		$doc = self::$userEntity->factory ();
		$doc->uid = $p_uid;
		$doc->firstName = @$json->firstName;
		$doc->lastName = @$json->lastName;
		$doc->email = $json->email;
		$doc->image = @$json->image;
		$doc->link_twitter = @$json->link_twitter;
		$doc->link_website = @$json->link_website;
		$doc->link_facebook =@$json->link_facebook;
		if (@$json -> password) {
			$doc->password = md5 ( $json->password );
		}
		
		if ($doc->update()) {
			if($this -> updateUserDataSession($p_uid)) {
				return self::$session -> user -> toArray();
			}
		}
		
		return HttpStatus::INTERNAL_SERVER_ERROR;
	}
	
	/**
	 * @Mapping(method = "post", value="story/:story_uid/like", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function likeStory(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
		
		$p_uid = self::$session -> user -> uid;
		$p_story_uid = $request->Path ( 'story_uid' );
		
		if (self::$log->isTraceEnabled ()) {
			self::$log->trace ( "Ajout d'un 'like' au récit '$p_uid'" );
		}
		
		$jsonContent = $request->Body ();
		
		$doc = self::$storyLikeEntity->factory ();
		$doc->user_uid = $p_uid;
		$doc->story_uid = $p_story_uid;
		
		if (! $doc->insert ()) {
			return HttpStatus::INTERNAL_SERVER_ERROR;
		}
	}
	
	
}

?>