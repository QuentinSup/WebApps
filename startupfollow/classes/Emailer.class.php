<?php

namespace colaunch\classes;

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
		
		if (!$this -> smtp ->send ( $user->email, null, null, "Bienvenue sur StartupFollow", $str )) {
			$this -> log ->error ( "Error sending email to " . $user->email );
			return false;
		}
		
		return true;
	}
	
	/**
	 * Send welcome for project
	 * @param unknown $startup
	 * @return boolean
	 */
	public function sendWelcome($httpRequest, $startup) {
		
		$mail_model = new dwObject();
		$mail_model -> img_logo = self::getLogoBase64Img();
		$mail_model -> projectName = $startup -> name;
		$mail_model -> url = $httpRequest -> getBaseUri()."/startup/".$startup -> ref;
			
		$str = dwSmartyTemplate::renderize("../emails/startupWelcome.html", $mail_model -> toArray());
			
		if(!$this -> smtp -> send($doc -> email, null, null, "Bienvenue sur StartupFollow", $str)) {
			$this -> log -> error("Error sending email to ".$startup -> email);
			return false;
		}
		
		return true;
		
	}
	
	/**
	 * Send invitation email to member
	 * @param unknown $invitation
	 * @return boolean
	 */
	public function sendInvitationEmail($httpRequest, $user, $startup, $invitation) {
	
		$model = new dwObject();
		$userName = $user -> name;
		$model -> email = $invitation -> invitation_email;
		$model -> founderName = $userName;
		$model -> startupName = $startup -> name;
		$model -> memberRole  = isset($invitation -> role)?$invitation -> role:'membre';
		$model -> url = $httpRequest -> getBaseUri()."/startup/".$startup -> ref."/join/".$invitation -> uid;
		
		// Send invitation email
		$mail_model = new dwObject();
		$mail_model -> img_logo = self::getLogoBase64Img();
		$mail_model -> data = $model -> toArray();
			
		$str = dwSmartyTemplate::renderize("../emails/invitationMember.html", $mail_model -> toArray());
	
		if(!$this -> smtp -> send($invitation -> invitation_email, null, null, "Rejoignez votre équipe sur StartupFollow", $str)) {
			$this -> log -> error("Error sending invitation email to ".$invitation -> invitation_email);
			return false;
		}
			
		return true;
	}
	
	/**
	 * Send notification email to follower
	 * @param $startupData
	 * @param $userData
	 * @return boolean
	 */
	public function sendNotificationStoryEmail($httpRequest, $storyData, $startupData, $userData) {
	
		// Prepare model data
		$model = new dwObject();
		$model -> startupName = $startupData -> name;
		$model -> siteName = "Colaunch Flows";
		$model -> userName = $userData -> name;
		$model -> shortLine = $storyData -> shortLine;
		$model -> url = $httpRequest -> getBaseUri()."/startup/".$startupData -> ref;
	
		// Prepare email
		$mail_model = new dwObject();
		$mail_model -> img_logo = self::getLogoBase64Img();
		$mail_model -> data = $model -> toArray();
			
		// Generate template body
		$str = dwSmartyTemplate::renderize("../emails/notificationStory.html", $mail_model -> toArray());
	
		// Send email
		if(!$this -> smtp -> send($userData -> email, null, null, "Des nouvelles de ".$model -> startupName." sur StartupFollow", $str)) {
			$this -> log -> error("Error sending invitation email to ".$userData -> email);
			return false;
		}
			
		return true;
	}

	/**
	 * Send request email
	 * @param unknown $httpRequest
	 * @param unknown $request
	 * @return boolean
	 */
	public function sendRequestEmail($httpRequest, $request) {
		$mail_model = new dwObject ();
		$mail_model->img_logo = self::getLogoBase64Img();
		$mail_model->projectName = $request->name;
		$mail_model->url = $httpRequest->getBaseUri () . "/request/" . $request -> uid;
		
		$str = dwSmartyTemplate::renderize ( "../emails/startupRequest.html", $mail_model->toArray () );
		
		if (! $this -> smtp->send ( $request->email, null, null, "Des amis souhaitent vous suivre sur StartupFollow", $str )) {
			$this -> log->error ( "Error sending email to " . $request->email );
			return false;
		}
		
		return true;
	}
	
}

?>