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
	 * @var unknown @Autowire(value='logger')
	 */
	public static $log;
	
	/**
	 *
	 * @var unknown @Autowire(value='connector', name='mail')
	 */
	public static $smtp;
	
	/**
	 * @Database
	 */
	public static $db;
	
	/**
	 * @DatabaseEntity('request')
	 */
	public static $requestEntity;
	
	/**
	 * @Mapping(method = "post", consumes="application/json", produces="application/json")
	 */
	public function add(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		if (self::$log->isTraceEnabled ()) {
			self::$log->trace ( "Creation et envoi d'une requête d'ajout à une Startup" );
		}
		
		$json = $request->Body ();
		
		$doc = self::$requestEntity;
		
		$doc->name = $json->name;
		$doc->email = $json->email;
		
		if (! $doc->insert ()) {
			$response->statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
			return;
		}
		
		$response->statusCode = HttpStatus::CREATED;
		
		$p_id = $doc->getLastInsertId ();
		
		$doc -> find(array("uid" => $p_id));
		
		$mail_model = new dwObject ();
		$mail_model->img_logo = dwFile::getBase64File ( 'assets/img/logo.png' );
		$mail_model->projectName = $doc->name;
		$mail_model->url = $request->getBaseUri () . "/get-started/" . $p_id;
		
		$str = dwSmartyTemplate::renderize ( "../emails/startupRequest.html", $mail_model->toArray () );
		
		if (! self::$smtp->send ( $doc->email, null, null, "Des amis souhaitent vous suivre sur StartupFollow", $str )) {
			self::$log->error ( "Error sending email to " . $doc->email );
		}
		
		return $doc->toArray ();
	}
}

?>