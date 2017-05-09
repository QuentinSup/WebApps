<?php

namespace template;

use dw\dwFramework as dw;
use dw\connectors\dbi as dbi;
use dw\accessors\request;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;

/**
 * Gestion des vols
 * @Mapping(value = '/')
 */
class index extends dwBasicController
{
	
	public function __construct() {}
	
	/**
	 * Retourne les informations sur l'endroit géolocalisé
	 * @Mapping(value = '/', method = "get", produces = 'application/json')
	 */
	public function index(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
			$db = dw::App() -> getConnector('db');
			$items = array();
			$doc = $db -> factory("isbn");
			$db::setFEAR(false);
			if($doc -> find()) {
				do {
					$items[]  = $doc -> toArray();
				} while($doc -> fetch());
				$response -> statusCode = 200;
				return json_encode($items, JSON_UNESCAPED_UNICODE);
			}
			$response -> statusCode = 404;
			return;
	}

}
	
?>