<?php

namespace myapi;

use dw\accessors\request;
use dw\classes\dwInterceptorInterface;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;

/**
 * API
 */
class accessControl implements dwInterceptorInterface
{

	public function __construct() {}
	
	public function init() {}
	
	public function prepareRequest(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
	
	}
	
	public function processRequest(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
		
	
		
	}
	
	public function terminateRequest(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
	}
	
}
	
?>