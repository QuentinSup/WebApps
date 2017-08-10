<?php

namespace gfn;

use dw\dwFramework as dw;
use dw\accessors\request;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\http\dwHttpSocket;
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
	 * @Mapping(value = "api/data/earths/:year", method = "get", produces = "application/json")
	 */
	public function apiEarthsData(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {

		$year 	 = $request -> Path('year', 2013);
		
		$login 		= dw::App() -> getProperty('gfn:api:login');
		$password 	= dw::App() -> getProperty('gfn:api:password');
		$uri		= dw::App() -> getProperty('gfn:api:uri');
		
		$url =  "$uri/v1/data/all/$year/earth";
		$opts = array("proxy" => "http://muz11-wbsswsg.ca-technologies.fr:8080");
		
		$http = new dwHttpSocket();
		$http -> setHeaders(array("Authorization" => "Basic ".base64_encode($login.":".$password)));

		$response = $http -> Get($url, $opts);
		
		if($response !== FALSE && $response -> status_code == 200) {
			return "text:".$response -> body;
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
	
		$login 		= dw::App() -> getProperty('gfn:api:login');
		$password 	= dw::App() -> getProperty('gfn:api:password');
		$uri		= dw::App() -> getProperty('gfn:api:uri');
	
		$url =  "$uri/v1/data/$country/$year/$record";
		$opts = array("proxy" => "http://muz11-wbsswsg.ca-technologies.fr:8080");
	
		$http = new dwHttpSocket();
		$http -> setHeaders(array("Authorization" => "Basic ".base64_encode($login.":".$password)));
	
		$response = $http -> Get($url, $opts);
	
		if($response !== FALSE && $response -> status_code == 200) {
			return "text:".$response -> body;
		}
	
		return;
	
	}

	
	/**
	 * 
	 * @Mapping(value = '/', method = "get")
	 * @Mapping(value = '/map', method = "get")
	 */
	public function map(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
				
		return 'view:views/map.html';
	}
	
	/**
	 *
	 * @Mapping(value = '/day', method = "get")
	 */
	public function day(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
	
		return 'view:views/overshootday.html';
	}

}
	
?>