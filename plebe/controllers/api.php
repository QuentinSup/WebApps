<?php

namespace plebe;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\controllers\dwBasicController;
use dw\accessors\ary;
use dw\accessors\server;
use dw\helpers\dwString;
use dw\classes\dwTemplate;

/**
 *
 * @Mapping(value = 'api')
 */
class api extends dwBasicController
{
	public function __construct() {}
	
	/**
	 * @Mapping(value = 'article/:token', method = 'GET', produces = 'application/json; charset=utf-8')
	 */
	public function getArticle(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$db = dw::App() -> getConnector('db');
		
		$id = $request -> Path('token');
		if(!$id) {
			$response -> statusCode = 404;
			return;
		}
		$doc = $db -> factory("articles", array("token" => $id));
		if($doc -> find()) {
			$response -> statusCode = 200;
			return json_encode($doc -> toArray(), JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 404;
		return;
	}
	
	/**
	 *
	 * @Mapping(value = 'article/:ref/reads', method = 'PUT', produces = 'application/json; charset=utf-8')
	 */
	public function incrCounterOfReads(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$db = dw::App() -> getConnector('db');
		
		$doc = $db -> factory("articles");
		// incrèmente le compteur d'affichage
		$doc -> counter_reads = '@counter_reads + 1';
		
		$doc -> update(array("ref" => $request -> Path('ref')));
	}

	/**
	 *
	 * @Mapping(value = 'article/:token?', method = 'POST', produces = 'application/json; charset=utf-8')
	 */
	public function createOrUpdateArticle(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$isNew = false;
		$db = dw::App() -> getConnector('db');
		
		$token = $request -> Path('token');
		if($token) {
			$doc = $db -> factory("articles", array("token" => $token));
			if(!$doc -> find()) {
				$response -> statusCode = 401;
				return;
			}
		}
		
		$doc = $db -> factory("articles", $_REQUEST);

		if(strlen($doc -> shortTitle) == 0
		  	|| strlen($doc -> text) == 0) {
			$response -> statusCode = 402;
			return;
		}
						
		if(!$doc -> id) {
			$doc -> ref = dwString::generate(15);
			$doc -> token = dwString::generate(15);
			$doc -> contextual_link = dwString::f2link($doc -> shortTitle)."-".strtolower(dwString::generate(5));
			$doc -> remote_addr = $request -> getRemoteAddr();
			$doc -> client_ip = $request -> getClientIP();
			$isNew = true;
		} else {
			$doc -> ddm = "@CURRENT_TIMESTAMP"; 
		}
		
		$doc -> counter_words = str_word_count($doc -> shortTitle." ".$doc -> catchPhrase." ".$doc -> text);

		if($doc -> indate()) {
			$doc -> find(array( "id" => $isNew?$doc -> getLastInsertId():$doc -> id));
			
			if($doc -> email && !$doc -> email_last_sent) {
				$model -> setAttributes(array(
					"baseUri" => 'http://'.$request -> getHostName(),
					"data" => new dwModel($doc -> toArray())
				));
				if($model -> data -> contextual_link) {
					$model -> data -> ref = $model -> data -> contextual_link;
				}
				$template = dwTemplate::factory("emails/creation.html", $model -> toArray());
				$mailer = dw::App() -> getConnector('mail');
				if($mailer -> send($doc -> email, null, null, "Votre publication sur plebe.fr", $template)) {					
					$doc -> email_last_sent = "@CURRENT_TIMESTAMP";
					$doc -> update();
				}
			}
			
			$history = $db -> factory("articles_versions");
			$history -> article_id = $doc -> id;
			$history -> article_title = $doc -> shortTitle;
			$history -> article_text = $doc -> text;
			$history -> remote_addr = $request -> getRemoteAddr();
			$history -> client_ip = $request -> getClientIP();
			$history -> insert();
			
			$response -> statusCode = 200;
			
			return json_encode($doc -> toArray(), JSON_UNESCAPED_UNICODE);
		} else {
			$response -> statusCode = 403;
			return;
		}

	}
		
	/**
	 * @Mapping(value = 'template/token/:token', method = 'GET', produces = 'application/json; charset=utf-8')
	 */
	public function getTemplateByToken(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$db = dw::App() -> getConnector('db');
		
		$id = $request -> Path('token');
		if(!$id) {
			$response -> statusCode = 404;
			return;
		}
		$doc = $db -> factory("templates", array("token" => $id));
		if($doc -> find()) {
			$response -> statusCode = 200;
			return json_encode($doc -> toArray(), JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 404;
		return;
	}
	
	/**
	 * @Mapping(value = 'template/ref/:ref', method = 'GET', produces = 'application/json; charset=utf-8')
	 */
	public function getTemplateByRef(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$db = dw::App() -> getConnector('db');
		
		$id = $request -> Path('ref');
		if(!$id) {
			$response -> statusCode = 404;
			return;
		}
		$doc = $db -> factory("templates", array("ref" => $id));
		if($doc -> find()) {
			$response -> statusCode = 200;
			return json_encode($doc -> toArray(), JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 404;
		return;
	}
	
	/**
	 * @Mapping(value = 'template/:name', method = 'GET', produces = 'application/json; charset=utf-8')
	 * @Mapping(value = 'template/name/:name', method = 'GET', produces = 'application/json; charset=utf-8')
	 */
	public function getTemplateByName(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$db = dw::App() -> getConnector('db');
		
		$id = $request -> Path('name');
		if(!$id) {
			$response -> statusCode = 404;
			return;
		}
		$doc = $db -> factory("templates", array("name" => $id));
		if($doc -> find()) {
			$response -> statusCode = 200;
			return json_encode($doc -> toArray(), JSON_UNESCAPED_UNICODE);
		}
		$response -> statusCode = 404;
		return;
	}
			   
	/**
	 *
	 * @Mapping(value = 'template/:token?', method = 'POST', produces = 'application/json; charset=utf-8')
	 */
	public function createOrUpdateTemplate(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
		$isNew = false;
		$db = dw::App() -> getConnector('db');
		
		$token = $request -> Path('token');
		if($token) {
			$doc = $db -> factory("templates", array("token" => $token));
			if(!$doc -> find()) {
				$response -> statusCode = 401;
				return;
			}
		}
		
		$doc = $db -> factory("templates", $_REQUEST);

		if(strlen($doc -> shortTitle) == 0
		  	|| strlen($doc -> text) == 0) {
			$response -> statusCode = 402;
			return;
		}
						
		if(!$doc -> id) {
			$doc -> ref = dwString::generate(15);
			$doc -> token = dwString::generate(15);
			$doc -> name = dwString::f2link($doc -> shortTitle)."-".strtolower(dwString::generate(3));
			$isNew = true;
		} else {
			$doc -> ddm = "@CURRENT_TIMESTAMP"; 
		}
		
		if($doc -> indate()) {
			$doc -> find(array( "id" => $isNew?$doc -> getLastInsertId():$doc -> id));
			$response -> statusCode = 200;
			
			return json_encode($doc -> toArray(), JSON_UNESCAPED_UNICODE);
		} else {
			$response -> statusCode = 403;
			return;
		}

	}
	
}

?>