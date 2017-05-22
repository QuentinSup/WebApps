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
	 * @DatabaseEntity('startup_user_subscription')
	 */
	public static $startupUserSubscriptionEntity;
	
	/**
	 * @Mapping(method = "get", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function get(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
		
		$p_uid = self::$session -> user -> uid;
		
		$doc = self::$userEntity->factory ();
		$doc->uid = $p_uid;
		if ($doc->find ()) {
			$data = $doc->toArray ();
			
			$docSubscriptions = self::$startupUserSubscriptionEntity -> factory();
			$docSubscriptions -> user_uid = $doc -> uid;
			$data['subscriptions'] = $docSubscriptions -> getAll();
			
			return $data;
		}
		
		$response->statusCode = HttpStatus::NOT_FOUND;
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
		
		if ($doc->find ()) {
			self::$session->start ();
			$data = $doc->toArray ();
			self::$session->user = new dwObject($data);
			return $data;
		}
		
		self::$session->destroy ();
		return HttpStatus::NOT_FOUND;
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
		
		$jsonContent = $request->Body ();
		
		$doc = self::$userEntity->factory ();
		$doc->uid = $p_uid;
		$doc->firstName = $json->firstName;
		$doc->lastName = $json->lastName;
		$doc->email = $json->email;
		if ($json->has ( 'password' )) {
			$doc->password = md5 ( $json->password );
		}
		
		if ($doc->update ()) {
			$doc->find ();
			return $doc->toArray ();
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