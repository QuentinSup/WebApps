<?php

namespace plebe;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\accessors\ary;

/**
 * @Mapping(value = '/')
 */
class index extends dwBasicController
{
	
	/**
	 * @Mapping(value = 'cgu')
	 */
	public function cgu(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		return "redirect:".dw::App() -> getProperty('cgu_uri');
	} 
	
	/**
	 * @Mapping(value = 'mentions-legales')
	 */
	public function mentions(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		return "redirect:".dw::App() -> getProperty('mentions_uri');
	} 
	
	
	protected function buildModel(dwHttpRequest &$request, dwModel &$model) {
				
		$model -> setAttributes(array(
			'baseUri' => $request -> getBaseUri(),
			'isAdmin' => false,
		));
		
		$model -> metas = new dwObject(array(
			'title' 		=> dw::App() -> getProperty('meta.title'),
			'description' 	=> dw::App() -> getProperty('meta.description'),
			'author' 		=> dw::App() -> getProperty('meta.author'),
			'keywords' 		=> dw::App() -> getProperty('meta.keywords')
		));
		
		$model -> metas -> cards = new dwObject(array());
		$model -> data = new dwObject(array());
		
	}
	
	/**
	 * @Mapping(value = ':page?', method = "get")
	 */
	public function index(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
		$this -> buildModel($request, $model);
		$pageId = $request -> Path('page');
		
		if(!$pageId) {
			$pageId = 'accueil';
		}
		
		$model -> pageId = $pageId;
				
		return 'view:index.tpl';
		
	}
	
	/**
	 * @Mapping(value = 'article/confirm/:token', method = "get")
	 * @Mapping(value = 'article/:ref', method = "get")
	 */
	public function article(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
		$this -> buildModel($request, $model);
		
		$ref = $request -> Path('ref');
		$token = $request -> Path('token');
		$data = &$model -> data;
		$cards = &$model -> metas -> cards;
		
		$this -> buildModel($request, $model);
	
		$cards -> setAttributes(array(
			'title' 		=> $model -> metas -> title,
			'description'	=> $model -> metas -> description,
			'uri' 			=> $model -> baseUri,
			'author'		=> $model -> metas -> author
		));
		
		$db = dw::App() -> getConnector('db');
		
		if($ref) {
			$doc = $db -> factory("articles");
			$doc -> optin_cgu = "1";
			if($doc -> select("ref = '".$doc -> escapeValue($ref)."' OR contextual_link = '".$doc -> escapeValue($ref)."'")) {
				$data -> setAttributes($doc -> toArray());
				$model -> metas -> setAttributes(self::getMetasFromDoc($doc));				
				$cards -> title 		= $model -> metas -> title;
				$cards -> author 		= $model -> metas -> author;
				$cards -> description 	= $model -> metas -> description;
				if($doc -> contextual_link) {
					$cards -> uri = $model -> baseUri.'?/article/'.$doc -> contextual_link;
				} else {
					$cards -> uri = $model -> baseUri.'?/article/'.$doc -> ref;
				}
				
				// incrèmente le compteur d'affichage
				$doc -> counter_views = '@counter_views + 1';
				$doc -> update();
			}
		}
		
		if($token) {
			$doc = $db -> factory("articles", array("token" => $token));
			$doc -> optin_cgu = "1";
			if($doc -> find()) {
				$data -> setAttributes($doc -> toArray());	
				$model -> isAdmin = true;
				$model -> metas -> setAttributes(self::getMetasFromDoc($doc));
			}
		}
		
		if(!$data -> isEmpty()) {
			if($data -> contextual_link) {
				$data -> userLink = $model -> baseUri.'?/article/'.$data -> contextual_link;
			} else {
				$data -> userLink = $model -> baseUri.'?/article/'.$data -> ref;
			}
			$data -> adminLink = $model -> baseUri."?/form/edit/".$data -> token;
			$data -> times2read = 0;
			if($data -> counter_words > 0) {
				$data -> times2read = $data -> counter_words / dw::App() -> getProperty('words_per_minutes');
			}
		}
		
		$model -> metas -> cards = $cards;
		$model -> data = $data;
		$model -> pageId = 'article';
				
		return 'view:index.tpl';
		
	}
	
	/**
	 * @Mapping(value = 'form', method = "get")
	 */
	public function showForm(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
			
		$templateRef = $request -> Param('ref');
		$this -> buildModel($request, $model);
		$model -> pageId = 'form';
		$model -> templateRef = $templateRef;
		
		return 'view:index.tpl';
		
	}
	
	/**
	 * @Mapping(value = 'form/edit/:token', method = "get")
	 */
	public function editForm(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
			
		$token = $request -> Path('token');
		$data = &$model -> data;

		$this -> buildModel($request, $model);

		$db = dw::App() -> getConnector('db');

		if($token) {
			$doc = $db -> factory("articles", array("token" => $token));
			if($doc -> find()) {
				$model -> isAdmin = true;
				$data -> setAttributes($doc -> toArray());	
				$model -> metas -> setAttributes(self::getMetasFromDoc($doc));
			}
		}

		$model -> pageId = 'form';
				
		return 'view:index.tpl';
		
	}
	
	
	/**
	 * @Mapping(value = 'template/edit/:token', method = "get")
	 */
	public function template(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
			
		$ref = $request -> Path('token');
		$data = new dwObject(array());

		$this -> buildModel($request, $model);

		$db = dw::App() -> getConnector('db');

		if($ref) {
			$doc = $db -> factory("templates", array("token" => $ref));
			if($doc -> find()) {
				$data -> setAttributes($doc -> toArray());	
				$model -> isAdmin = true;
			}
		}

		$model -> pageId = 'template';
		$model -> data = $data;
				
		return 'view:index.tpl';
		
	}
	
	/**
	 * Return metas from a record
	 */
	protected static function getMetasFromDoc($doc) {
		$metas = array();
		$metas['title'] 		= $doc -> shortTitle;		
		$metas['description'] 	= $doc -> catchPhrase;
		$metas['author'] 		= $doc -> author;
		if(strlen(trim($doc -> catchPhrase)) == 0) {
			
			$wordwrap = wordwrap(strip_tags($doc -> text), 240, '|-|', true);
			$metas['description'] = explode('|-|', html_entity_decode($wordwrap))[0];
		}
		return $metas;
	}

}

?>