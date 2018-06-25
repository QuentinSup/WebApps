<?php

namespace template;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;

/**
 * @Mapping(value = '/api/user')
 */
class userController extends dwBasicController {

    /**
     * @DatabaseEntity('user')
     */
    public static $userEntity;
    
	/**
	 * @Mapping(method = "get", produces="application/json")
	 */
	public function getEntities(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{				
	    $entity = self::$userEntity;
	    if($entity -> all()) {
	        return $entity -> fetchAll();
	    }
	    
	    return HttpStatus::NOT_FOUND;
	    
	}
	
	/**
	 * @Mapping(method = "get", value=":id", produces="application/json")
	 */
	public function getEntity(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	    $entity = self::$userEntity;
	    $entity -> id = $request -> Path('id');
	    if($do = $entity -> get()) {
	        return $do -> toArray();
	    }
	    
	    return HttpStatus::NOT_FOUND;
	    
	}
	
	/**
	 * @Mapping(method = "post", consumes="application/json", produces="application/json")
	 */
	public function createEntity(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	    $entity = self::$userEntity;
	    $json = $request -> Body();

	    $entity -> setFrom($json);
	    if($entity -> insert()) {
	        return  $entity -> get() -> toArray();
	    }
	    
	    return HttpStatus::INTERNAL_SERVER_ERROR;
	    
	}
	
	
	/**
	 * @Mapping(method = "delete", value=":id", produces="application/json")
	 */
	public function removeEntity(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model)
	{
	    $entity = self::$userEntity;
	    $entity -> id = $request -> Path('id');
	    return $entity -> deleteN() > 0;
	}

}

?>