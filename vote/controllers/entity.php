<?php

namespace template;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\controllers\dwBasicController;

/**
 * @Mapping(value = '/api/entity')
 */
class entityController extends dwBasicController {

    /**
     * @DatabaseEntity('entity')
     */
    public static $entityEntity;
    
	/**
	 * @Mapping(method = "get", value=":id", produces="application/json")
	 */
	public function getEntity(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{				
	    $entity = self::entityEntity;
	    $entity -> id = $request -> Path('id');
	    if($do = $entity -> get()) {
	        return $do -> toArray();
	    }
	    
	    return 404;
	    
	}

}

?>