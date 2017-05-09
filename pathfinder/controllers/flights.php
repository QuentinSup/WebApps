<?php

namespace pathfinder;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwCacheFile;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;

/**
 * Gestion des vols
 * @Mapping(value = 'flights')
 */
class flights extends dwBasicController
{
	public $cache;
	
	public function __construct() {
		$this -> cache = new dwCacheFile();
	}
	
	/**
	 * Retourne un flux RSS des publications
	 * @Mapping(value = 'airports', method = "get", produces = 'application/json')
	 */
	public function airports(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		
		$cacheId = "flights/airports";
		$json =  $this -> cache -> getCache($cacheId);
		if(!$json) {
		
			$db = dw::App() -> getConnector('db');
			$items = array();
			$doc = $db -> query("SELECT * FROM airports WHERE apid IN (SELECT DISTINCT dst_apid FROM routes r)");
			//WHERE apid IN (SELECT DISTINCT a1.apid FROM airports a1, airports a2, routes r WHERE r.src_apid = a1.apid AND r.dst_apid = a2.apid AND a1.country <> a2.country)
			if($doc && $doc -> fetch()) {
				do {
					$data = [
						"id" 	=> $doc -> apid,
						"code"	=> $doc -> iata,
						"lat" 	=> $doc -> y,
						"lng" 	=> $doc -> x,
						"name"  => $doc -> name,
						"city"	=> $doc -> city
					];
					$data['routesTo'] 	= $this -> getRoutesTo($data['id']);
					$data['routesFrom'] = $this -> getRoutesFrom($data['id']);
					$items[]  = $data;
				} while($doc -> fetch());
			}
			
			$json = json_encode($items, JSON_UNESCAPED_UNICODE);
			$this -> cache -> setCache($cacheId, $json);
		}
		
		$response -> statusCode = 200;
		
		return $json;
		
	}
	
	/**
	 *
	 */
	private function getRoutesTo($apid) {
		$db = dw::App() -> getConnector('db');
		$items = array();
		$doc = $db -> query("SELECT DISTINCT src_apid FROM routes WHERE dst_apid = $apid AND src_apid IS NOT NULL");
		if($doc && $doc -> fetch()) {
			do {
				$items[]  = $doc -> src_apid;
			} while($doc -> fetch());
		}
		return $items;
	}
	
	private function getRoutesFrom($apid) {
		$db = dw::App() -> getConnector('db');
		$items = array();
		$doc = $db -> query("SELECT DISTINCT dst_apid FROM routes WHERE src_apid = $apid  AND dst_apid IS NOT NULL");
		if($doc && $doc -> fetch()) {
			do {
				$items[]  = $doc -> dst_apid;
			} while($doc -> fetch());
		}
		return $items;
	}
	
	/**
	 * Retourne les aéroports qui desservent l'aéroport
	 * @Mapping(value = 'routes/to/:apid', method = "get", produces = 'application/json')
	 */
	public function routesTo(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$response -> statusCode = 200;
		return json_encode($this -> getRoutesTo($request -> Path('apid')), JSON_UNESCAPED_UNICODE);
		
	}
	
	/**
	 * Retourne les destinations d'un aéroport
	 * @Mapping(value = 'routes/from/:apid', method = "get", produces = 'application/json')
	 */
	public function routesFrom(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$response -> statusCode = 200;
		return json_encode($this -> getRoutesFrom($request -> Path('apid')), JSON_UNESCAPED_UNICODE);
	}
	
	/**
	 * Retourne le prix pour un trajet en avion
	 * @Mapping(value = 'prices/:from/:to', method = "get", produces = 'application/json')
	 */
	public function getPrices(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) {
		$postData = [
			  "request" => [
				"slice" => [
				  [
					"origin" 		=>	$request -> Path('from'),
					"destination" 	=>  $request -> Path('to'),
					"date" 			=>  date("Y-m-d")
				  ]
				],
				"passengers" => [
				  "adultCount" => 1,
				  "infantInLapCount" => 0,
				  "infantInSeatCount" => 0,
				  "childCount" => 0,
				  "seniorCount" => 0
				],
				"solutions" => 1,
				"saleCountry" => "FR"
			  ]
		];
		
		// create a new cURL resource
		$ch = curl_init();
		
		$encodedData = json_encode($postData, JSON_UNESCAPED_UNICODE);
		
		// set URL and other appropriate options
		curl_setopt($ch, CURLOPT_URL, 'https://www.googleapis.com/qpxExpress/v1/trips/search?key=AIzaSyDSKfaFZfXZnCHBXEBQ-9ovhPF0z3MmroI');
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");// set post data to true
		curl_setopt($ch, CURLOPT_POSTFIELDS, $encodedData);// post data
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(                                                                          
			'Content-Type: application/json',                                                                                
			'Content-Length: ' . strlen($encodedData))                                                                       
		);

		// receive server response ...
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		
		// grab URL and pass it to the browser
		$responseData = curl_exec($ch);

		// close cURL resource, and free up system resources
		curl_close($ch);
		
		return $responseData;
	}

}
	
?>