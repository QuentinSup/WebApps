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
 * @Mapping(value = 'gmap')
 */
class gmap extends dwBasicController
{
	
	public $cache;
	
	public function __construct() {
		$this -> cache = new dwCacheFile();
	}
	
	/**
	 * Retourne les informations sur l'endroit géolocalisé
	 * @Mapping(value = 'geoloc/:lat/:lng', method = "get", produces = 'application/json')
	 */
	public function geoloc(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$precision = request::get('precision', "country");

		$responseData = file_get_contents('https://maps.googleapis.com/maps/api/geocode/json?result_type='.$precision.'&latlng='.$request -> Path('lat').','.$request -> Path('lng').'&key=AIzaSyDSKfaFZfXZnCHBXEBQ-9ovhPF0z3MmroI');
		return $responseData;
	}

}
	
?>