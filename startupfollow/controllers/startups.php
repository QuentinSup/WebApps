<?php

namespace startupfollow;

use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\enums\HttpStatus;
use dw\accessors\ary;
use dw\helpers\dwFile;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\adapters\template\dwSmartyTemplate;

include_once '../classes/StartupEntity.class.php';

/**
 * @Mapping(value = '/rest/startup')
 */
class startup extends dwBasicController {

	const EVENT_CREATE = 1;
	const EVENT_UPDATE_SETTINGS = 2;
	const EVENT_FOLLOW = 3;
	const EVENT_UNFOLLOW = 4;
	const EVENT_NEWSTORY = 5;
	
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
	 * @DatabaseEntity('user')
	 */
	public static $userEntity;
	
	/**
	 * @DatabaseEntity('startup_follower')
	 */
	public static $startupFollowerEntity;
	
	/**
	 * @DatabaseEntity('startup_event')
	 */
	public static $startupEventEntity;
	
	/**
	 * @DatabaseEntity('startup_story')
	 */
	public static $storyEntity;
	
	/**
	 * @DatabaseEntity('user_story_like')
	 */
	public static $userStoryLikeEntity;
	
	/**
	 * @Session()
	 */
	public static $session;
	
	/**
	 * Traitement de prérequête
	 *
	 * @param dwHttpRequest $request
	 * @param dwHttpResponse $response
	 * @param dwModel $model
	 * @return boolean
	 */
	public function startRequest(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {

		$method = strtolower($request -> getMethod());
		
		if($method == "post" 
		|| $method == "put"
		|| $method == "delete") {
			if(!self::$session -> has('user')) {
				$response -> statusCode = HttpStatus::FORBIDDEN;
				return false;
			}
		}
	
	}
	
	/**
	 * Charge les informations d'un compte startup
	 * @param unknown $uid
	 * @return unknown|NULL
	 */
	private function loadStartup($uid) {
		
		$startupE = new classes\StartupEntity(self::$startupEntity);
		return $startupE -> get($uid);

	}
	
	/**
	 * Vérifie si l'utilisateur connecté à les droits suffisants pour effectuer une opération
	 * @param unknown $uid
	 * @return unknown|NULL
	 */
	private function isCurrentUserAllowed($uid) {
	
		if(self::$session -> has('user')) {
			if(ary::exists(self::$session -> user -> memberOf, $uid)) {
				return true;
			}
		}
		return false;

	}
	
	/**
	 * @Mapping(method = "GET", value="/exists/:ref", consumes="application/json", produces="application/json")
	 */
	public function exists(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		$ref = $request -> Path('ref');
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Vérification de l'existence du compte pour la Startup '$ref'");
		}
		
		if($this -> loadStartup($ref)) {
			$response -> statusCode = HttpStatus::OK;
		} else {
			$response -> statusCode = HttpStatus::NOT_FOUND;
		}
		
		if(self::$log -> isDebugEnabled()) {
			self::$log -> debug("Existence du compte pour la Startup '$ref' : ".$response -> statusCode);
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
			return HttpStatus::NO_CONTENT;
		}

		return $data;
	
	}
	
	/**
	 * @Mapping(method = "GET", value=":ref", consumes="application/json", produces="application/json")
	 */
	public function get(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$p_ref = $request -> Path('ref');
		$p_norestrict = $request -> Param('norestrict');
		
		$startup = $this -> loadStartup($p_ref);
		
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}
		
		// List for members
		$memberDoc = self::$memberEntity -> factory();
		$memberDoc -> startup_uid = $startup -> uid;
			
		$members = array();
		if($memberDoc -> find()) {
			do {
				if(($p_norestrict || $memberDoc -> joined) && $memberDoc -> user_uid) {
					$member = &$members[];
					$member = $memberDoc -> toArray();
					$userDoc = self::$userEntity -> factory();
					$userDoc -> uid = $memberDoc -> user_uid;
					if($user = $userDoc -> get()) {
						$user -> password = null; // Clean password !!
						$member['user'] = $user -> toArray();
					} else {
						
						self::$log -> warn("User (uid=".$userDoc -> uid.") not found !");
						
					}
				}
			} while($memberDoc -> fetch());
		}
		
		$startup -> members = $members;
		
		// List for subscriptions
		$docSubscriptions = self::$startupFollowerEntity -> factory();
		$docSubscriptions -> startup_uid = $startup -> uid;
		$startup -> subscriptions = $docSubscriptions -> getAll();
		
		return $startup ->  toArray();
		
	}
	
	/**
	 * @Mapping(method = "post", consumes="application/json")
	 */
	public function create(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{

		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un compte Startup");
		}
		
		$jsonContent = $request -> Body();
		
		$ref = $this -> convertName($jsonContent -> name);
		
		$doc = self::$startupEntity -> factory();
		$doc -> name = $jsonContent -> name;
		$doc -> email = $jsonContent -> email;
		$doc -> image = @$jsonContent -> image;
		$doc -> ref = $ref;
		$doc -> punchLine = @$jsonContent -> punchLine;
		$doc -> link_website = @$jsonContent -> link_website;
		$doc -> link_twitter = @$jsonContent -> link_twitter;
		$doc -> link_facebook = @$jsonContent -> link_facebook;
	
		if($doc -> insert()) {
			$uid = $doc -> getLastInsertId();

			// Add event creation
			$this -> addEvent($uid, self::$session -> user -> uid, self::EVENT_CREATE, null);
			
			// Add current user as member founder
			$memberDoc = self::$memberEntity -> factory();
			$memberDoc -> startup_uid = $uid;
			$memberDoc -> user_uid = self::$session -> user -> uid;
			$memberDoc -> founder = 1;
			$memberDoc -> joined = 1;
			$memberDoc -> insert();
			
			// Add other member and send invitation to member with no account
			foreach($jsonContent -> members as $member) {
				$memberDoc = self::$memberEntity -> factory();
				$memberDoc -> startup_uid = $uid;
				$memberDoc -> user_uid = @$member -> user_uid;
				$memberDoc -> role = $member -> role;
				$memberDoc -> invitation_email = $member -> invitation_email;
				$memberDoc -> insert();
				
				if($memberDoc -> invitation_email) {
					// Send invitation email
					$mail_model = new dwObject();
					$userName = self::$session -> user -> name;
					$mail_model -> email = $memberDoc -> invitation_email;
					$mail_model -> founderName = $userName;
					$mail_model -> startupName = $doc -> name;
					$mail_model -> memberRole = $memberDoc -> role;
					$mail_model -> url = $request -> getBaseUri()."/startup/".$doc -> ref."/join/".$memberDoc -> getLastInsertId();
						
					if($this -> sendInvitationEmail($mail_model)) {
						$memberUpdateDoc = $memberDoc -> factory();
						$memberUpdateDoc -> uid = $memberDoc -> uid;
						$memberUpdateDoc -> invitationSentAt = $memberUpdateDoc -> castSQL('CURRENT_TIMESTAMP');
						$memberUpdateDoc -> update();
					}

				}
			}
			
			// Send welcome email
			$mail_model = new dwObject();
			$mail_model -> img_logo = dwFile::getBase64File('assets/img/logo.png');
			$mail_model -> projectName = $doc -> name;
			$mail_model -> url = $request -> getBaseUri()."/startup/".$doc -> ref;
			
			$str = dwSmartyTemplate::renderize("../emails/startupWelcome.html", $mail_model -> toArray());
			
			if(!self::$smtp -> send($doc -> email, null, null, "Bienvenue sur StartupFollow", $str)) {
				self::$log -> error("Error sending email to ".$doc -> email);
			}
			
		} else {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
		
	}
	
	/**
	 * convert a name onto a valid reference
	 * @param unknown $name
	 */
	private function convertName($name) {
		return StartupEntity::convertName($name);
	}
	
	/**
	 * @Mapping(method = "put", value=":uid", consumes="application/json")
	 */
	public function update(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_id = strtolower($request -> Path('uid'));
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Modification du compte '$p_id'");
		}
	
		$startup = $this -> loadStartup($p_id);
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}
		
		if(!$this -> isCurrentUserAllowed($startup -> uid)) {
			return HttpStatus::FORBIDDEN;
		}
		
		$jsonContent = $request -> Body();
		
		$ref = $this -> convertName($jsonContent -> name);
		
		$doc = self::$startupEntity -> factory();
		$doc -> uid = $startup -> uid;
		$doc -> name = $jsonContent -> name;
		$doc -> image = $jsonContent -> image;
		$doc -> email = $jsonContent -> email;
		$doc -> ref = $ref;
		$doc -> punchLine = $jsonContent -> punchLine;
		$doc -> link_website = @$jsonContent -> link_website;
		$doc -> link_twitter = @$jsonContent -> link_twitter;
		$doc -> link_facebook = @$jsonContent -> link_facebook;
	
		if($doc -> update()) {
		
			// Add event update
			$this -> addEvent($p_id, self::$session -> user -> uid, self::EVENT_UPDATE_SETTINGS, null);
			
			foreach($jsonContent -> members as $member) {
				
				$memberDoc = self::$memberEntity -> factory();
				$memberDoc -> uid 				= @$member -> uid;
				$memberDoc -> user_uid 			= @$member -> user_uid;
				$memberDoc -> startup_uid 		= $doc -> uid;
				$memberDoc -> role 				= $member -> role;
				$memberDoc -> invitation_email 	= @$member -> invitation_email;
				
				if($memberDoc -> uid) {
					
					if($member -> deleted == true) {
						$memberDoc -> delete();
					} else {
						$memberDoc -> update();
						$uid = $memberDoc -> uid;
					}
					
				} else {
					$memberDoc -> insert();
					$uid = $memberDoc -> getLastInsertId();
				}
				
				if($uid) {
					
					$memberDoc -> get(array('uid' => $uid));
					
					if(!$memberDoc -> joined && $memberDoc -> invitation_email && !$memberDoc -> invitationSentAt) {
						// Send invitation email
						$mail_model = new dwObject();
						$userName = self::$session -> user -> name;
						$mail_model -> email = $memberDoc -> invitation_email;
						$mail_model -> founderName = $userName;
						$mail_model -> startupName = $doc -> name;
						$mail_model -> memberRole  = $memberDoc -> role;
						$mail_model -> url = $request -> getBaseUri()."/startup/".$doc -> ref."/join/".$uid;
					
						if($this -> sendInvitationEmail($mail_model)) {
							$memberUpdateDoc = $memberDoc -> factory();
							$memberUpdateDoc -> uid = $memberDoc -> uid;
							$memberUpdateDoc -> invitationSentAt = $memberUpdateDoc -> castSQL('CURRENT_TIMESTAMP');
							$memberUpdateDoc -> update();
						}
					
					}
				}
				
			}
			
		} else {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
	
	}
	
	/**
	 * Send invitation email to member
	 * @param unknown $model
	 * @return boolean
	 */
	private function sendInvitationEmail($model) {
		
			// Send invitation email
			$mail_model = new dwObject();
			$mail_model -> img_logo = dwFile::getBase64File('assets/img/logo.png');
			$mail_model -> data = $model -> toArray();
					
			$str = dwSmartyTemplate::renderize("../emails/invitationMember.html", $mail_model -> toArray());
		
			if(!self::$smtp -> send($model -> email, null, null, "Rejoignez votre équipe sur StartupFollow", $str)) {
				self::$log -> error("Error sending invitation email to ".$model -> email);
				return false;
			}
			
			return true;
	}

	/**
	 * @Mapping(method = "post", value=":ref/event", consumes="application/json")
	 */
	public function postEvent(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_ref = $request -> Path('ref');
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un événement associé au compte Startup n°'$p_ref'");
		}
		
		$startup = $this -> loadStartup($p_ref);
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}

		$user_uid = self::$session -> user -> uid;
		$json = $request -> Body();
		
		if($this -> addEvent($startup -> uid, $user_uid, $json -> type, @$json -> data) == null) {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
	
	}
	
	/**
	 * 
	 */
	private function addEvent($startupUID, $userUID, $type, $data) {
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un événement associé au compte Startup n°'$startupUID'");
		}

		$doc = self::$startupEventEntity -> factory();
		$doc -> startup_uid = $startupUID;
		$doc -> user_uid = $userUID;
		$doc -> type = $type;
		$doc -> data = $data;
		
		if($doc -> insert()) {
			$uid = $doc -> getLastInsertId();
			return $uid;
		}
		
		return null;
	}
	
	/**
	 * 
	 * @param unknown $data
	 * @return unknown
	 */
	function __mapEvent($data) {
		
		static $users = array();
		
		$user_uid = $data['user_uid'];
		if($user_uid) {
			$user = ary::get($users, $user_uid);
			if(!$user) {
				
				if(self::$log -> isTraceEnabled()) {
					self::$log -> trace("Récupération des données de l'utilisateur '$user_uid' pour l'événement");
				}
				
				$docUser = self::$userEntity -> factory();
				$docUser -> uid = $user_uid;
				if($user = $docUser -> get()) {
					$user -> password = null;
					$users[$user_uid] = $user -> export("name") -> toArray();
				}
			}
			
			$data['user'] = $user;
			
		}
		return $data;
	}
	
	/**
	 * @Mapping(method = "get", value=":uid/event/all", consumes="application/json", produces="application/json")
	 */
	public function getAllEvents(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
			
		$p_startup_uid = $request -> Path('uid');
		$p_type = $request -> Param('type');
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Récupération des événements associés au compte Startup n°'$p_startup_uid'");
		}
	
		$doc = self::$startupEventEntity -> factory();
		$doc -> startup_uid = $p_startup_uid;
		$doc -> type = $p_type;

		if($doc -> plist('date DESC')) {
			return $doc -> fetchAll(array($this, "__mapEvent"));
		} else {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
	
	}

	/**
	 * @Mapping(method = "GET", value=":startup_uid/story/all", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function getAllStories(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	
		$p_startup_uid = $request -> Path('startup_uid');
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Récupération de l'ensemble des récits de la startup '$p_startup_uid'");
		}
	
		$data = array();
	
		$doc = self::$storyEntity -> factory();
		$doc -> startup_uid = $p_startup_uid;
		$list = [];
		if($doc -> plist('date DESC')) {
			while($doc -> fetch()) {
				$data = $doc -> toArray();
				$docLikes = self::$userStoryLikeEntity -> factory();
				$docLikes -> story_uid = $doc -> uid;
				$data['numberOfLikes'] = $docLikes -> count();
				$list[] = $data;
			}
		} else {
			$response -> statusCode = HttpStatus::NO_CONTENT;
		}
	
		return $list;
	
	}
	
	/**
	 * Broadcast messages to all followers
	 * @param unknown $storyUID
	 */
	private function broadcastNewStoryNotification($request, $storyUID) {
		
		$storyE = self::$storyEntity -> factory();
		$followerE = self::$startupFollowerEntity -> factory();
		$startupE = self::$startupEntity -> factory();
		
		if(($storyData = $storyE -> get(array("uid" => $storyUID))) == null) {
			self::$log -> error("Story n°$storyUID introuvable");
			return false;
		}
		
		$startupUID = $storyData -> startup_uid;
		
		if(($startupData = $startupE -> get(array("uid" => $startupUID))) == null) {
			self::$log -> error("Startup n°$startupUID introuvable");
			return false;
		}
		
		if($followerE -> find(array("startup_uid" => $startupUID))) {
			do {
				
				$userUID = $followerE -> user_uid;
				$userE = self::$userEntity -> factory();
				if(($userData = $userE -> get(array("uid" => $userUID))) == null) {
					self::$log -> error("Utilisateur n°$userUID introuvable");
				} else {
					$this -> sendNotificationStoryEmail($request, $storyData, $startupData, $userData);			
				}
				
				
			} while($followerE -> fetch());
		}
		
	}
	
	/**
	 * Send notification email to follower
	 * @param $startupData
	 * @param $userData
	 * @return boolean
	 */
	private function sendNotificationStoryEmail($request, $storyData, $startupData, $userData) {
	
		// Prepare model data
		$model = new dwObject();
		$model -> startupName = $startupData -> name;
		$model -> userName = $userData -> name;
		$model -> shortLine = $storyData -> shortLine;
		$model -> url = $request -> getBaseUri()."/startup/".$startupData -> ref;
		
		// Prepare email
		$mail_model = new dwObject();
		$mail_model -> img_logo = dwFile::getBase64File('assets/img/logo.png');
		$mail_model -> data = $model -> toArray();
			
		// Generate template body
		$str = dwSmartyTemplate::renderize("../emails/notificationStory.html", $mail_model -> toArray());
	
		// Send email
		if(!self::$smtp -> send($userData -> email, null, null, "Des nouvelles de ".$model -> startupName." sur StartupFollow", $str)) {
			self::$log -> error("Error sending invitation email to ".$userData -> email);
			return false;
		}
			
		return true;
	}
	
	/**
	 * @Mapping(method = "GET", value=":startup_uid/story/:uid", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function getStory(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
	
		$p_startup_uid = $request -> Path('startup_uid');
		$p_uid = $request -> Path('uid');
	
		$doc = self::$storyEntity -> factory();
		$doc -> startup_uid = $p_startup_uid;
		$doc -> uid = $p_uid;
		if($doc -> get()) {
			return $doc -> toArray();
		}
	
		$response -> statusCode = HttpStatus::NOT_FOUND;
	
	}
	
	/**
	 * @Mapping(method = "post", value=":ref/story", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function addStory(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$p_ref = $request -> Path('ref');
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un nouveau récit Startup '$p_ref'");
		}
	
		$startup = $this -> loadStartup($p_ref);
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}
		
		if(!$this -> isCurrentUserAllowed($startup -> uid)) {
			return HttpStatus::FORBIDDEN;
		}
		
		$jsonContent = $request -> Body();
	
		$doc = self::$storyEntity -> factory();
		$doc -> startup_uid = $startup -> uid;
		$doc -> shortLine = $jsonContent -> shortLine;
		$doc -> text = $jsonContent -> text;
		$doc -> date = @$jsonContent -> date?$jsonContent -> date:$doc -> castSQL('CURRENT_TIMESTAMP');
	
		if($doc -> insert()) {
			if($doc -> get(array('uid' => $doc -> getLastInsertId()))) {
				
				// Add event
				$wordwrap = wordwrap(strip_tags($doc -> text), 240, '|-|', true);
				$truncText = explode('|-|', html_entity_decode($wordwrap))[0];
				$this -> addEvent($p_startup_uid, self::$session -> user -> uid, self::EVENT_NEWSTORY, $truncText);
				
				// inform followers
				$this -> broadcastNewStoryNotification($request, $doc -> uid);
				
				return $doc -> toArray();
			}
		}
	
		return HttpStatus::INTERNAL_SERVER_ERROR;
	
	}
	
	/**
	 * @Mapping(method = "put", value=":ref/story/:uid", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function updateStory(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	
		$p_ref = $request -> Path('ref');
		$p_uid = $request -> Path('uid');
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Modification du récit '$p_ref'");
		}
	
		$startup = $this -> loadStartup($p_ref);
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}
		
		if(!$this -> isCurrentUserAllowed($startup -> uid)) {
			return HttpStatus::FORBIDDEN;
		}
		
		$jsonContent = $request -> Body();
	
		$doc = self::$storyEntity -> factory();
		$doc -> uid = $p_uid;
		$doc -> startup_uid = $startup -> uid;
		$doc -> shortLine = $jsonContent -> shortLine;
		$doc -> text = $jsonContent -> text;
		$doc -> date = $jsonContent -> date;
	
		if($doc -> update()) {
			$doc -> find();
			return $doc -> toArray();
		}
	
		return HttpStatus::INTERNAL_SERVER_ERROR;
	
	}
	

	/**
	 * @Mapping(method = "post", value=":ref/subscribe", consumes="application/json")
	 */
	public function addSubscription(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
	
		$p_ref = $request -> Path('ref');
		$p_uid = self::$session -> user -> uid;
	
		$startup = $this -> loadStartup($p_ref);
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un souscription au compte Startup");
		}
	
		$doc = self::$startupFollowerEntity -> factory();
		$doc -> startup_uid = $startup -> uid;
		$doc -> user_uid = $p_uid;
	
		if($doc -> insert()) {
	
			// Add event follow
			$this -> addEvent($startup -> uid, $p_uid, self::EVENT_FOLLOW, null);
	
			$uid = $doc -> getLastInsertId();
		} else {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
	
	}
	
	/**
	 * @Mapping(method = "delete", value=":ref/subscribe", consumes="application/json")
	 */
	public function removeSubscription(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	
		if(!self::$session -> has('user')) {
			return HttpStatus::FORBIDDEN;
		}
	
		$p_ref = $request -> Path('ref');
		$p_uid = self::$session -> user -> uid;
		
		$startup = $this -> loadStartup($p_ref);
		if(is_null($startup)) {
			return HttpStatus::NOT_FOUND;
		}
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Suppression d'une souscription au compte Startup");
		}
	
		$doc = self::$startupFollowerEntity -> factory();
		$doc -> startup_uid = $startup -> uid;
		$doc -> user_uid = $p_uid;
	
		if($doc -> delete()) {
			// Add event unfollow
			$this -> addEvent($startup -> uid, $p_uid, self::EVENT_UNFOLLOW, null);
		} else {
			$response -> statusCode = HttpStatus::INTERNAL_SERVER_ERROR;
		}
	}
	
	
}

?>