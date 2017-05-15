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
	 * @Mapping(method = "GET", value=":id", consumes="application/json")
	 */
	public function exists(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		$appId = strtolower($request -> Path('id'));
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Vérification de l'existence du compte pour la Startup '$appId'");
		}

		$resp = dwHttpSocket::request('GET', "http://localhost:8080/myapi/api/QuentinSup/startupfollow/startup/$appId", null, array("Content-Type" => "application/json; charset=utf8"));
		
		if(self::$log -> isDebugEnabled()) {
			self::$log -> debug("Existence du compte pour la Startup '$appId' : ".$resp -> status_code);
		}
		
		$response -> statusCode = $resp -> status_code;
		
	}
	
	/**
	 * @Mapping(method = "post", consumes="application/json")
	 */
	public function add(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un compte Startup");
		}
		
		$content = $request -> getRequestBody();
		$jsonContent = $request -> Body();
		
		$appId = strtolower($jsonContent -> name);
		
		$resp = dwHttpSocket::request('POST', "http://localhost:8080/myapi/api/QuentinSup/startupfollow/startup/$appId", $content, array("Content-Type" => "application/json; charset=utf8"));
		
		$response -> statusCode = $resp -> status_code;
		
		if(self::$log -> isDebugEnabled()) {
			self::$log -> debug("Code retour de requête de création : ".$resp -> status_code);
		}
		
		$p_id = null;
		
		if($resp -> status_code == HttpStatus::CREATED) {
		
			$p_id = $resp -> body;

			$json = json_decode($content);
		
			$mail_model = new dwObject();
			$mail_model -> img_logo = dwFile::getBase64File('assets/img/logo.png');
			$mail_model -> projectName = $json -> name;
			$mail_model -> url = $request -> getBaseUri()."/startup/".$p_id;
		
			$str = dwSmartyTemplate::renderize("../emails/startupWelcome.html", $mail_model -> toArray());
		
			if(!self::$smtp -> send($json -> email, null, null, "Bienvenue sur StartupFollow", $str)) {
				self::$log -> error("Error sending email to ".$json -> to -> email);
			}
		
		}

		
		return $p_id;
		
	}

}

?>