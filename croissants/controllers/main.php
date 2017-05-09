<?php

namespace babylifeshare;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\accessors\ary;

/**
 * @Mapping(value = '/')
 */
class main extends dwBasicController
{

	/**
	 * @Mapping(method = "get")
	 */
	public function root(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
		$model -> host = $request -> getBaseUri();

				
		return 'view:resources/index.tpl';
		
	}

}

?>