<?php

namespace plebe;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;

/**
 * Gestion des feeds
 */
class feeds extends dwBasicController
{
	public function __construct() {}
	
	/**
	 * Retourne un flux RSS des publications
	 * @Mapping(value = 'feeds/rss', method = "get", produces = 'application/rss+xml')
	 * @Mapping(value = 'admin/feeds/rss/:optin/:moderated', method = "get", produces = 'application/rss+xml')
	 */
	public function rss(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$db = dw::App() -> getConnector('db');
		$items = array();
		$doc = $db -> factory("articles");
		$doc -> state = "1"; // showed
		$doc -> optin_cgu = "1";
		$doc -> moderated = $request -> Path('moderated', "1");
		$doc -> optin_global_publication = $request -> Path('optin', "1");
		if($doc -> select(null, null, dw::App() -> getProperty("rss_limit", 50), "ddc DESC")) {
			do {
				$item = new dwObject($doc -> toArray());
				$item -> pubDate = date(DATE_RSS, strtotime($doc -> ddc));
				$item -> link = 'http://'.$request -> getHostName()."/?/article/".($doc -> contextual_link?$doc -> contextual_link:$doc -> ref);
				$items[]  = $item -> toArray();
			} while($doc -> fetch());
		}
		
		$model -> baseUri = 'http://'.$request -> getHostName();
		$model -> title = "Les dernières publications sur plebe.fr";
		$model -> description = "";
		$model -> link = 'http://'.$request -> getHostName().'/?/feeds/rss';
		$model -> pubDate = date(DATE_RSS, time());
		$model -> items = $items;
		
		$response -> statusCode = 200;
		
		return "view:feeds/rss.xml";
		
	}

}
	
?>