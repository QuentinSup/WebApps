<?php

namespace gfn;

use dw\dwFramework as dw;
use dw\accessors\request;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\http\dwHttpClient;
use dw\classes\dwCache;
use dw\classes\controllers\dwBasicController;


/**
 * Global Footprint Network
 * @Mapping(value = '/')
 */
class main extends dwBasicController
{
	/**
	 * @Autowire('logger')
	 * @var unknown
	 */
	public static $log;
	
	public function __construct() {

	}
	
	/**
	 * 
	 * @param unknown $uri
	 * @return unknown|boolean
	 */
	public function dataGet($uri) {
		
		if(self::$log -> isTraceEnabled()) {
			self::$log -> trace("Retrieve data from $uri");
		}
		
		$login 		= dw::App() -> getProperty('gfn:api:login');
		$password 	= dw::App() -> getProperty('gfn:api:password');
		$host		= dw::App() -> getProperty('gfn:api:uri');
		$proxy		= dw::App() -> getProperty('http:proxy');
		
		$opts = array("proxy" => $proxy);
		
		$url = $host.'/'.$uri;
		
		$cache = new dwCache($url, 86400); // 1day
		
		if($data = $cache -> get()) {
			return $data;
		}
		
		$http = new dwHttpClient();
		$http -> setHeaders(array("Authorization" => "Basic ".base64_encode($login.":".$password)));
		
		$response = $http -> Get($url, $opts);
		
		if($response !== FALSE && $response -> status_code == 200) {
			$data = $response -> body;
			$cache -> put($data);
			return $data;
		}
		
		return FALSE;
		
	}
	
	/**
	 *
	 * @Mapping(value = "api/data/earths/:year", method = "get", produces = "application/json")
	 */
	public function apiEarthsData(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {

		$year 	 = $request -> Path('year', 2013);

		$uri =  "v1/data/all/$year/earth";

		if($data = $this -> dataGet($uri)) {
			return 'text:'.$data;
		}
		
		return;
		
	}
	
	/**
	 *
	 * @Mapping(value = "api/data/country/:country/:year/:record?", method = "get", produces = "application/json")
	 */
	public function apiCountryData(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
	
		$country = $request -> Path('country', 'all');
		$year 	 = $request -> Path('year', 2013);
		$record  = $request -> Path('record', 'all');
	
		$uri =  "v1/data/$country/$year/$record";

		if($data = $this -> dataGet($uri)) {
			return 'text:'.$data;
		}
	
	}

	
	/**
	 * @Mapping(value = '/worldmap', method = "get")
	 */
	public function map(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$model -> appver = dw::App() -> getVersion();
		return 'view:views/map.html';
	}
	
	/**
	 *
	 * @Mapping(value = '/', method = "get")
	 * @Mapping(value = '/:lang', method = "get")
	 */
	public function day(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		$model -> appver = dw::App() -> getVersion();
		$model -> lang = $request -> Path('lang');
		
		return 'view:views/overshootday.html';
	}

}
	
?>