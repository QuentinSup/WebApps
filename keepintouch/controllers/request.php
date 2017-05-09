<?php

namespace keepintouch;

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
 * @Mapping(value = '/request')
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
	 * @Mapping(method = "post")
	 */
	public function push(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'une requête");
		}
		
		$content = $request -> getRequestBody();

		$resp = dwHttpSocket::request('POST', 'http://localhost:8080/myapi/api/QuentinSup/keepintouch/request', $content, array("Content-Type" => "application/json; charset=utf8"));
		
		$response -> statusCode = $resp -> status_code;

		if(self::$log -> isDebugEnabled()) {
			self::$log -> debug("Code retour de la création de requête : ".$resp -> status_code);
		}
		
		$p_id = null;
		
		if($resp -> status_code == HttpStatus::CREATED) {

			$p_id = $resp -> body;
	
			$json = json_decode($content);

			$mail_model = new dwObject();
			$mail_model -> img_logo = dwFile::getBase64File('assets/images/logo.png');
			$mail_model -> send_name = $json -> from -> name;
			$mail_model -> name = $json -> to -> name;
			$mail_model -> url = $request -> getBaseUri()."/request/".$p_id;

			$str = dwSmartyTemplate::renderize("../emails/creation.html", $mail_model -> toArray());
		
			if(!self::$smtp -> send($json -> to -> email, null, null, "Demande de confirmation de coordonnées", $str)) {
				self::$log -> error("Error sending email to ".$json -> from -> email);
			}

		}
		
		
		
		return $p_id;
		
	}
	
	/**
	 * @Mapping(method = "patch", value="/:id")
	 */
	public function put(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_id = $request -> Path('id');
		$content = $request -> getRequestBody();
		
		$resp = dwHttpSocket::request('PUT', "http://localhost:8080/myapi/api/QuentinSup/keepintouch/request/$p_id", $content, array("Content-Type" => "application/json; charset=utf8"));

		if($resp -> status_code == HttpStatus::OK) {
			
			$json = json_decode($content);

			$mail_model = new dwObject();
			$mail_model -> img_logo = dwFile::getBase64File('assets/images/logo.png');
			$mail_model -> send_name = $json -> from -> name;
			$mail_model -> name = $json -> to -> name;
			$mail_model -> url = $request -> getBaseUri()."/request/".$p_id."?consult=1";

			$str = dwSmartyTemplate::renderize("../emails/confirmation.html", $mail_model -> toArray());
			
			self::$smtp -> setFrom($json -> to -> email);
			
			if(!self::$smtp -> send($json -> from -> reply_email, null, null, "Confirmation de coordonnées", $str)) {
				self::$log -> error("Error sending email to ".$json -> from -> email);
			}
			
		}
		
		$response -> statusCode = $resp -> status_code;
		
		return null;
	
	}

}

?>