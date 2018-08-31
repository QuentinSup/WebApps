<?php

namespace clevertech;

use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\enums\HttpStatus;
use dw\accessors\ary;
use dw\classes\controllers\dwBasicController;
use clevertech\classes\ContractEntity;
use clevertech\classes\Emailer;

/**
 * @Mapping(value = '/rest/contract')
 */
class contract extends dwBasicController {

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
	 * @DatabaseEntity('contract')
	 */
	public static $contractEntity;
	
	/**
	 * @DatabaseEntity('user')
	 */
	public static $userEntity;
	
	/**
	 * @Session()
	 */
	public static $session;
	
	/**
	 * Constructor
	 */
	public function __construct() {
		
	}
	
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
		
		$startupE = new ProjectEntity(self::$contractEntity);
		$startup = $startupE -> get($uid);
		if($startup) {
			$startup -> lastActivityInDays = @$startup -> lastStoryCreatedAt?ProjectEntity::getAgeInDays($startup -> lastStoryCreatedAt):-1;
		}
		return $startup;
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
		$uid = $request -> Param('ref');
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Vérification de l'existence du contrat '$ref'");
		}
		
		if($startup = $this -> loadStartup($ref)) {
			if($startup -> uid == $uid) {
				$response -> statusCode = HttpStatus::NOT_FOUND;
			} else {
				$response -> statusCode = HttpStatus::OK;
			}
		} else {
			$response -> statusCode = HttpStatus::NOT_FOUND;
		}
		
		if(self::$log -> isDebugEnabled()) {
			self::$log -> debug("Existence du contrat '$ref' : ".$response -> statusCode);
		}

	}
	
	/**
	 * @Mapping(method = "GET", value="all", consumes="application/json", produces="application/json")
	 */
	public function getAll(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Récupération de l'ensemble des contrats");
		}
	
		$data = array();
		
		$doc = self::$contractEntity -> factory();
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
				if(($p_norestrict || $memberDoc -> joined)) {
					$member = &$members[];
					$member = $memberDoc -> toArray();
					if($memberDoc -> user_uid) {
						$userDoc = self::$userEntity -> factory();
						$userDoc -> uid = $memberDoc -> user_uid;
						if($user = $userDoc -> get()) {
							$user -> password = null; // Clean password !!
							$member['user'] = $user -> toArray();
						} else {
							
							self::$log -> warn("User (uid=".$userDoc -> uid.") not found !");
							
						}
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
	 * @Mapping(method = "post", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function create(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{

		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un contrat");
		}
		
		$jsonContent = $request -> Body();
		
		$ref = $this -> convertName($jsonContent -> name);
		
		$doc = self::$contractEntity -> factory();
		$doc -> name = $jsonContent -> name;
		$doc -> email = $jsonContent -> email;
		$doc -> image = @$jsonContent -> image;
		$doc -> startedMonth = @$jsonContent -> startedMonth;
		$doc -> startedYear = @$jsonContent -> startedYear;
		$doc -> ref = $ref;
		$doc -> punchLine = isset($jsonContent -> punchLine)?$jsonContent -> punchLine:'';
		$doc -> link_website = @$jsonContent -> link_website;
		$doc -> link_twitter = @$jsonContent -> link_twitter;
		$doc -> link_facebook = @$jsonContent -> link_facebook;
	
		if($doc -> insert()) {
			$uid = $doc -> getLastInsertId();

			// Flag user data as deprecated
			self::$session -> user -> deprecated = true;
			
			// Add event creation
			$this -> addEvent($uid, self::$session -> user -> uid, Events::EVENT_CREATE, null);

			// Add other member and send invitation to member with no account
			foreach($jsonContent -> members as $member) {
				
				if(@$member -> user_uid || $member -> invitation_email) {
				
					$memberDoc = self::$memberEntity -> factory();
					$memberDoc -> startup_uid = $uid;
					$memberDoc -> user_uid = @$member -> user_uid;
					$memberDoc -> role = @$member -> role;
					$memberDoc -> founder = @$member -> founder?1:0;
					$memberDoc -> joined = @$member -> joined?1:0;
					$memberDoc -> invitation_email = $member -> invitation_email;
					$memberDoc -> insert();
					
					if($memberDoc -> invitation_email && ($memberDoc -> joined == 0)) {
					
						// Send invitation email
						$emailer = new Emailer(self::$log, self::$smtp);
						
						if($emailer -> sendInvitationEmail($request, self::$session -> user, $doc, $memberDoc)) {
							$memberUpdateDoc = $memberDoc -> factory();
							$memberUpdateDoc -> uid = $memberDoc -> getLastInsertId();
							$memberUpdateDoc -> invitationSentAt = $memberUpdateDoc -> castSQL('CURRENT_TIMESTAMP');
							$memberUpdateDoc -> update();
						}
	
					}
				}
			}
			
			// Send welcome email
			$emailer = new Emailer(self::$log, self::$smtp);
			$emailer -> sendWelcome($request, $doc);

			return $doc -> toArray();
			
		}
		
		return HttpStatus::INTERNAL_SERVER_ERROR;
		
	}
	
	/**
	 * convert a name onto a valid reference
	 * @param unknown $name
	 */
	private function convertName($name) {
		return ProjectEntity::convertName($name);
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
		
		$doc = self::$contractEntity -> factory();
		$doc -> uid = $startup -> uid;
		$doc -> name = $jsonContent -> name;
		$doc -> image = $jsonContent -> image;
		$doc -> email = $jsonContent -> email;
		$doc -> startedMonth = @$jsonContent -> startedMonth;
		$doc -> startedYear = @$jsonContent -> startedYear;
		$doc -> ref = $ref;
		$doc -> punchLine = $jsonContent -> punchLine;
		$doc -> link_website = @$jsonContent -> link_website;
		$doc -> link_twitter = @$jsonContent -> link_twitter;
		$doc -> link_facebook = @$jsonContent -> link_facebook;

		if($doc -> update()) {
		
			// Add event update
			$this -> addEvent($p_id, self::$session -> user -> uid, Events::EVENT_UPDATE_SETTINGS, null);
			
			foreach($jsonContent -> members as $member) {
				
				if(@$member -> user_uid || @$member -> invitation_email) {
				
					$memberDoc = self::$memberEntity -> factory();
					$memberDoc -> uid 				= @$member -> uid;
					$memberDoc -> user_uid 			= @$member -> user_uid;
					$memberDoc -> startup_uid 		= $doc -> uid;
					$memberDoc -> role 				= @$member -> role;
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
							$emailer = new Emailer(self::$log, self::$smtp);
							if($emailer -> sendInvitationEmail($request, self::$session -> user, $doc, $memberDoc)) {
								$memberUpdateDoc = $memberDoc -> factory();
								$memberUpdateDoc -> uid = $memberDoc -> uid;
								$memberUpdateDoc -> invitationSentAt = $memberUpdateDoc -> castSQL('CURRENT_TIMESTAMP');
								$memberUpdateDoc -> update();
							}
						
						}
					}
				}
				
			}
			
			return HttpStatus::NO_CONTENT;
			
		}
		
		return HttpStatus::INTERNAL_SERVER_ERROR;
	
	}

}