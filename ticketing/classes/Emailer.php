<?php

namespace clevertech\classes;

use dw\classes\dwObject;
use dw\helpers\dwFile;
use dw\adapters\template\dwSmartyTemplate;

/**
 * 
 * @author ETP3433
 *
 */
class Emailer {	
	
	private $smtp;
	private $log;
	
	/**
	 * constructor
	 */
	public function __construct($log, $smtp) {
		$this -> log = $log;
		$this -> smtp = $smtp;
	}
	

	/**
	 * Return logo for base64 src image
	 * @return string
	 */
	private static function getLogoBase64Img() {
		return 'data:image/jpeg;base64,'.dwFile::getBase64File('assets/img/logo.jpg');
	}
	
	/**
	 * Send email signup
	 * @param unknown $user
	 * @return boolean
	 */
	public function sendSignUp($httpRequest, $user, $password) {
		
		$mail_model = new dwObject ();
		$mail_model->img_logo = self::getLogoBase64Img();
		$mail_model->userName = $user->name;
		$mail_model->userPassword = $password;
		$mail_model->url = $httpRequest->getBaseUri () . "login";
		
		$str = dwSmartyTemplate::renderize ( "../emails/signup.html", $mail_model->toArray () );
		
		if (!$this -> smtp ->send ( $user->email, null, null, "Bienvenue", $str )) {
			$this -> log ->error ( "Error sending email to " . $user->email );
			return false;
		}
		
		return true;
	}
	
	/**
	 * Send email with new password
	 * @param unknown $user
	 * @return boolean
	 */
	public function sendResetPassword($httpRequest, $user, $password) {
	
		$mail_model = new dwObject ();
		$mail_model->img_logo = self::getLogoBase64Img();
		$mail_model->userName = $user->name;
		$mail_model->userPassword = $password;
		$mail_model->url = $httpRequest->getBaseUri () . "login";
	
		$str = dwSmartyTemplate::renderize ( "../emails/resetPassword.html", $mail_model->toArray () );
	
		if (!$this -> smtp ->send ( $user->email, null, null, "Votre nouveau mot de passe", $str )) {
			$this -> log ->error ( "Error sending email to " . $user->email );
			return false;
		}
	
		return true;
	}
	
}