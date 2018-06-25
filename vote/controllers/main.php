<?php

namespace template;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\controllers\dwBasicController;

/**
 * @Mapping(value = '/')
 */
class mainController extends dwBasicController {

    private function prepareModel(dwHttpRequest $request, dwModel $model, $pageId) {
        $model -> title = "Clevertech";
        $model -> pageId = $pageId;
        $model -> version = "1.0.0";
        $model -> host = $request -> getBaseUri();
        return $this;
    }
    
    
    private function view() {
        return 'view:./resources/index.html';
    }
    
	/**
	 * @Mapping(method = "get")
	 */
	public function root(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{				
	    return $this -> prepareModel($request, $model, 'main') -> view();
	}

}

?>