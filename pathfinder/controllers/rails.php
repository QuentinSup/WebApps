<?php

namespace pathfinder;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwCache;
use dw\classes\controllers\dwBasicController;

/**
 * Gestion des vols
 * @Mapping(value = 'rails')
 */
class rails extends dwBasicController
{
	
	/**
	 * Retourne un flux RSS des publications
	 * @Mapping(value = 'stops', method = "get", produces = 'application/json; charset=utf8')
	 */
	public function stops(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$cacheId = "rails/stops";
		
		$cache = new dwCache($cacheId, 86400); // 1day
		
		$items = $cache -> get();

		if(!$items) {
		
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
			
			$cache-> put($items);
		}

		return $items;
		
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
		$cacheId = 'rails/routes/to/'.$request -> Path('id');
		$cache = new dwCache($cacheId, 86400); // 1day
		$items= $cache-> get();
		if(!$items) {
			$items = $this -> getRoutesTo($request -> Path('id'));
			$cache-> put($items);
		}
		return $items;
		
	}
	
	/**
	 * Retourne les destinations d'un aéroport
	 * @Mapping(value = 'routes/from/:id', method = "get", produces = 'application/json')
	 */
	public function routesFrom(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$response -> statusCode = 200;
		$cacheId = 'rails/routes/from/'.$request -> Path('id');
		$cache = new dwCache($cacheId, 86400); // 1day
		$items= $cache-> get();
		if(!$items) {
			$items= $this -> getRoutesFrom($request -> Path('id'));
			$cache-> put($items);
		}
		return $json;
	}
	
}
	
?>