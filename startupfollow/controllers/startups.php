<?php

namespace startupfollow;

use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\http\dwHttpSocket;
use dw\enums\HttpStatus;
use dw\helpers\dwFile;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\adapters\template\dwSmartyTemplate;

/**
 * @Mapping(value = '/rest/startup')
 */
class startup extends dwBasicController {

	/**
	 * 
	 * @var unknown
	 * @Autowire(value='logger')
	 */
	public static $log;
	
	/**
	 *
	 * @var unknown
	 * @Autowire(value='connector', name='mail')
	 */
	public static $smtp;
	
	/**
	 * @DatabaseEntity('startup_member')
	 */
	public static $memberEntity;
	
	/**
	 * @DatabaseEntity('startup')
	 */
	public static $startupEntity;
	
	/**
	 * @Mapping(method = "GET", value="/exists/:name", consumes="application/json", produces="application/json")
	 */
	public function exists(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		$appName = strtolower($request -> Path('name'));
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Vérification de l'existence du compte pour la Startup '$appName'");
		}
		
		$doc = self::$startupEntity -> factory();
		$doc -> uri = $appName;
		if($doc -> find()) {
			$response -> statusCode = HttpStatus::OK;
		} else {
			$response -> statusCode = HttpStatus::NOT_FOUND;
		}
		
		if(self::$log -> isDebugEnabled()) {
			self::$log -> debug("Existence du compte pour la Startup '$appName' : ".$response -> statusCode);
		}

	}
	
	/**
	 * @Mapping(method = "GET", value="all", consumes="application/json", produces="application/json")
	 */
	public function getAll(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Récupération de l'ensemble des projets");
		}
	
		$data = array();
		
		$doc = self::$startupEntity -> factory();
		$doc -> setForEachRow(false);
		if($doc -> find()) {
			do {
				$data[] = $doc -> toArray();	
			} while($doc -> fetch());
		} else {
			$response -> statusCode = HttpStatus::NO_CONTENT;
		}

		return $data;
	
	}
	
	/**
	 * @Mapping(method = "GET", value=":name", consumes="application/json", produces="application/json")
	 */
	public function get(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$appName = strtolower($request -> Path('name'));
		
		$doc = self::$startupEntity -> factory();
		$doc -> uri = $appName;
		if($doc -> find()) {
			$data = new dwObject($doc -> toArray());
			
			$memberDoc = self::$memberEntity -> factory();
			$memberDoc -> startup_uid = $doc -> uid;
			$memberDoc -> find();
			$data -> members = $memberDoc -> fetchAll();
			
			
		} else {
			$response -> statusCode = HttpStatus::NOT_FOUND;
		}
		
		return $data ->  toArray();
		
	}
	
	/**
	 * @Mapping(method = "post", consumes="application/json")
	 */
	public function add(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un compte Startup");
		}
		
		$jsonContent = $request -> Body();
		
		$appId = strtolower($jsonContent -> name);
		
		$doc = self::$startupEntity -> factory();
		$doc -> name = $jsonContent -> name;
		$doc -> email = $jsonContent -> email;
		$doc -> uri = strtolower($jsonContent -> name);
		$doc -> punchLine = $jsonContent -> punchLine;
		$doc -> link_website = @$jsonContent -> link_website;
		$doc -> link_twitter = @$jsonContent -> link_twitter;
		$doc -> link_facebook = @$jsonContent -> link_facebook;
	
		if($doc -> insert()) {
			$uid = $doc -> getLastInsertId();

			foreach($jsonContent -> members as $member) {
				$memberDoc = self::$memberEntity -> factory();
				$memberDoc -> startup_uid = $uid;
				$memberDoc -> firstName = $member -> firstName;
				$memberDoc -> lastName = $member -> lastName;
				$memberDoc -> email = $member -> email;
				$memberDoc -> insert();
			}
			
			$mail_model = new dwObject();
			$mail_model -> img_logo = dwFile::getBase64File('assets/img/logo.png');
			$mail_model -> projectName = $doc -> name;
			$mail_model -> url = $request -> getBaseUri()."/startup/".$doc -> uri;
			
			$str = dwSmartyTemplate::renderize("../emails/startupWelcome.html", $mail_model -> toArray());
			
			if(!self::$smtp -> send($doc -> email, null, null, "Bienvenue sur StartupFollow", $str)) {
				self::$log -> error("Error sending email to ".$doc -> email);
			}
			
		} else {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
		
	}
	
	/**
	 * @Mapping(method = "put", value=":id", consumes="application/json")
	 */
	public function update(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		$p_id = strtolower($request -> Path('id'));
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Modification du compte '$p_id'");
		}
	
		$jsonContent = $request -> Body();

		$doc = self::$startupEntity -> factory();
		$doc -> uid = $p_id;
		$doc -> name = $jsonContent -> name;
		$doc -> email = $jsonContent -> email;
		$doc -> uri = strtolower($jsonContent -> name);
		$doc -> punchLine = $jsonContent -> punchLine;
		$doc -> link_website = @$jsonContent -> link_website;
		$doc -> link_twitter = @$jsonContent -> link_twitter;
		$doc -> link_facebook = @$jsonContent -> link_facebook;
	
		if($doc -> update()) {
		
			foreach($jsonContent -> members as $member) {
				$memberDoc = self::$memberEntity -> factory();
				$memberDoc -> uid = $member -> uid;
				$memberDoc -> startup_uid = $doc -> uid;
				$memberDoc -> firstName = $member -> firstName;
				$memberDoc -> lastName = $member -> lastName;
				$memberDoc -> email = $member -> email;
				$memberDoc -> indate();
			}
			
		} else {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
	
	}

}

?>