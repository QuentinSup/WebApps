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
 * @Mapping(value = '/rest/request')
 */
class request extends dwBasicController {

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
	 * @Mapping(method = "post", consumes="application/json")
	 */
	public function add(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation et envoi d'une requête d'ajout à une Startup");
		}
		
		$content = $request -> getRequestBody();
		
		$resp = dwHttpSocket::request('POST', 'http://localhost:8080/myapi/api/QuentinSup/startupfollow/request', $content, array("Content-Type" => "application/json; charset=utf8"));
		
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
			$mail_model -> url = $request -> getBaseUri()."/get-started/".$p_id;
		
			$str = dwSmartyTemplate::renderize("../emails/startupRequest.html", $mail_model -> toArray());
		
			if(!self::$smtp -> send($json -> email, null, null, "Des fans souhaitent vous suivre sur StartupFollow", $str)) {
				self::$log -> error("Error sending email to ".$json -> to -> email);
			}
		
		}
		
		
		
		return $p_id;
		
	}

}

?>