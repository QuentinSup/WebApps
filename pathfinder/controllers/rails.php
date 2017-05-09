<?php

namespace pathfinder;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\dwCacheFile;
use dw\classes\controllers\dwBasicController;

/**
 * Gestion des vols
 * @Mapping(value = 'rails')
 */
class rails extends dwBasicController
{
	
	public $cache;
	
	public function __construct() {
		$this -> cache = new dwCacheFile();
	}
	
	/**
	 * Retourne un flux RSS des publications
	 * @Mapping(value = 'stops', method = "get", produces = 'application/json')
	 */
	public function stops(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$cacheId = "rails/stops";
		$json =  $this -> cache -> getCache($cacheId);
		if(!$json) {
		
			$db = dw::App() -> getConnector('db');
			$items = array();
			$doc = $db -> query("SELECT * FROM rails_stops WHERE parent_station <> ''");

			if($doc && $doc -> fetch()) {
				do {
					$data = [
						"id" 	=> $doc -> stop_id,
						"code"	=> $doc -> stop_id,
						"lat" 	=> $doc -> stop_lat,
						"lng" 	=> $doc -> stop_lon,
						"name"  => $doc -> stop_name,
						"city"	=> ""
					];
					$items[]  = $data;
				} while($doc -> fetch());
			}
			
			$json = json_encode($items,JSON_UNESCAPED_UNICODE);
			
			$this -> cache -> setCache($cacheId, $json);
		}
		$response -> statusCode = 200;

		return $json;
		
	}

	/**
	 *
	 */
	private function getRoutesTo($id) {
		$db = dw::App() -> getConnector('db');
		$items = array();
		$doc = $db -> query("SELECT DISTINCT stop_id FROM rails_stops_times st WHERE trip_id IN (SELECT DISTINCT trip_id FROM rails_stops_times WHERE stop_id = '$id')");
		if($doc && $doc -> fetch()) {
			do {
				$items[]  = $doc -> stop_id;
			} while($doc -> fetch());
		}
		return $items;
	}
	
	private function getRoutesFrom($id) {
		$db = dw::App() -> getConnector('db');
		$items = array();
		$doc = $db -> query("SELECT DISTINCT stop_id FROM rails_stops_times st WHERE trip_id IN (SELECT DISTINCT trip_id FROM rails_stops_times WHERE stop_id = '$id')");
		if($doc && $doc -> fetch()) {
			do {
				$items[]  = $doc -> stop_id;
			} while($doc -> fetch());
		}
		return $items;
	}
	
	/**
	 * Retourne les aéroports qui desservent l'aéroport
	 * @Mapping(value = 'routes/to/:id', method = "get", produces = 'application/json')
	 */
	public function routesTo(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$response -> statusCode = 200;
		$cacheId = 'rails/routes/to/'.$request -> Path('id');
		$json = $this -> cache -> getCache($cacheId);
		if(!$json) {
			$json = json_encode($this -> getRoutesTo($request -> Path('id')), JSON_UNESCAPED_UNICODE);
			$this -> cache -> setCache($cacheId, $json);
		}
		return $json;
		
	}
	
	/**
	 * Retourne les destinations d'un aéroport
	 * @Mapping(value = 'routes/from/:id', method = "get", produces = 'application/json')
	 */
	public function routesFrom(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$response -> statusCode = 200;
		$cacheId = 'rails/routes/from/'.$request -> Path('id');
		$json = null; //$this -> cache -> getCache($cacheId);
		if(!$json) {
			$json = json_encode($this -> getRoutesFrom($request -> Path('id')), JSON_UNESCAPED_UNICODE);
			$this -> cache -> setCache($cacheId, $json);
		}
		return $json;
	}
	
}
	
?>