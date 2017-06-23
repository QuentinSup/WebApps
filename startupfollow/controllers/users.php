<?php

namespace startupfollow;

use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\http\dwHttpSocket;
use dw\enums\HttpStatus;
use dw\helpers\dwFile;
use dw\classes\dwSession;
use dw\helpers\dwString;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\adapters\template\dwSmartyTemplate;

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
	 * @Mapping(method = "get", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function get(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
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
			if($docMemberTeam -> find()) {
				do {
					$memberOf[] = $docMemberTeam -> startup_uid;
				} while($docMemberTeam -> fetch());
			}
			$user -> memberOf = $memberOf;
				
			// List for subscriptions
			$docSubscriptions = self::$startupUserSubscriptionEntity -> factory();
			$docSubscriptions -> user_uid = $doc -> uid;
			$user -> subscriptions = $docSubscriptions -> getAll();
		
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
		
		$mail_model = new dwObject ();
		$mail_model->img_logo = dwFile::getBase64File ( 'assets/img/logo.png' );
		$mail_model->userName = $doc->name;
		$mail_model->userPassword = $password;
		$mail_model->url = $request->getBaseUri () . "login";
		
		$str = dwSmartyTemplate::renderize ( "../emails/signup.html", $mail_model->toArray () );
		
		if (! self::$smtp->send ( $doc->email, null, null, "Bienvenue sur StartupFollow", $str )) {
			self::$log->error ( "Error sending email to " . $doc->email );
		}
		
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
			self::$log->trace ( "Modification du compte utilisateur n°$p_uid" );
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
			if($this -> updateUserDataSession($user -> uid)) {
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