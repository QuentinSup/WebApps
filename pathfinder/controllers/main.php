<?php

namespace pathfinder;

use dw\dwFramework as dw;
use dw\accessors\request;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\dwCacheFile;
use dw\classes\controllers\dwBasicController;

/**
 * Gestion des vols
 * @Mapping(value = '/')
 */
class main extends dwBasicController {
	
	/**
	 * Retourne la carte
	 * @Mapping(value = '/', method = "get")
	 */
	public function map(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {

		$model -> GMAP_API_KEY = dw::App() -> getProperty('GMAP_API_KEY');
		$model -> appver = dw::App() -> getVersion();
		return "view:map.html";
	}

}
	
?>