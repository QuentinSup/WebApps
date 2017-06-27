<?php

namespace colaunch;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\http\dwHttpSocket;
use dw\enums\HttpStatus;
use dw\classes\controllers\dwBasicController;

/**
 * @Mapping(value = 'api')
 */
class api extends dwBasicController {

	
	/**
	 * @Mapping(method = "post", value="image", produces="application/json")
	 */
	public function image(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{			
		$file = $request -> File(0);

		if($file -> save('./assets/upload_images') === FALSE) {
			return HttpStatus::INTERNAL_SERVER_ERROR;
		}
		
		return array('location' => $request -> getBaseUri().'assets/upload_images/'.$file -> getName());
	}
}

?>