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
 * @Mapping(value = '/rest/startup/:startup_uid/story')
 */
class story extends dwBasicController {

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
	 * @DatabaseEntity('startup_story')
	 */
	public static $storyEntity;
	
	/**
	 * @Mapping(method = "GET", value="all", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function getAll(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		$p_startup_uid = $request -> Path('startup_uid');
	
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Récupération de l'ensemble des récits de la startup '$p_uid'");
		}
	
		$data = array();
		
		$doc = self::$storyEntity -> factory();
		$doc -> startup_uid = $p_startup_uid;
		if($doc -> plist('date DESC')) {
			$data = $doc -> fetchAll();
		} else {
			$response -> statusCode = HttpStatus::NO_CONTENT;
		}

		return $data;
	
	}
	
	/**
	 * @Mapping(method = "GET", value=":uid", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function get(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$p_startup_uid = $request -> Path('startup_uid');
		$p_uid = $request -> Path('uid');
		
		$doc = self::$storyEntity -> factory();
		$doc -> startup_uid = $p_startup_uid;
		$doc -> uid = $p_uid;
		if($doc -> find()) {
			return $doc -> toArray();
		}
		
		$response -> statusCode = HttpStatus::NOT_FOUND;

	}
	
	/**
	 * @Mapping(method = "post", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function add(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$p_startup_uid = $request -> Path('startup_uid');
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Creation d'un nouveau récit Startup");
		}
		
		$jsonContent = $request -> Body();

		$doc = self::$storyEntity -> factory();
		$doc -> startup_uid = $p_startup_uid;
		$doc -> shortLine = $jsonContent -> shortLine;
		$doc -> text = $jsonContent -> text;
		$doc -> date = @$jsonContent -> date?$jsonContent -> date:$doc -> castSQL('CURRENT_TIMESTAMP');

		if($doc -> insert()) {
			$doc -> find(array('uid' => $doc -> getLastInsertId()));
			return $doc -> toArray();
		}
		
		return HttpStatus::INTERNAL_SERVER_ERROR;
		
	}
	
	/**
	 * @Mapping(method = "put", value=":uid", consumes="application/json", produces="application/json; charset=utf-8")
	 */
	public function update(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		
		$p_startup_uid = $request -> Path('startup_uid');
		$p_uid = $request -> Path('uid');
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Modification du récit '$p_uid'");
		}
		
		$jsonContent = $request -> Body();
		
		$doc = self::$storyEntity -> factory();
		$doc -> uid = $p_uid;
		$doc -> startup_uid = $p_startup_uid;
		$doc -> shortLine = $jsonContent -> shortLine;
		$doc -> text = $jsonContent -> text;
		$doc -> date = $jsonContent -> date;
		
		if($doc -> update()) {
			$doc -> find(array('uid' => getLastInsertId()));
			return $doc -> toArray();
		}
		
		return HttpStatus::INTERNAL_SERVER_ERROR;
	
	}

}

?>