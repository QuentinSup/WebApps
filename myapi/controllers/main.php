<?php

namespace myapi;

use dw\accessors\request;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\controllers\dwBasicController;


/**
 * API
 * @Mapping(value = '/')
 */
class main extends dwBasicController
{
	/**
	 * @Autowire('logger')
	 * @var unknown
	 */
	public static $log;
	
	/**
	 * 
	 * @var unknown
	 * @DatabaseEntity('api');
	 */
	public static $apiEntity;
	
	public function __construct() {}
	
	/**
	 * Retourne e contenu d'une API
	 * @Mapping(value = '/', method = "get")
	 */
	public function index(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
				
		return 'API';
	}
	
	/**
	 * Retourne e contenu d'une API
	 * @Mapping(value = '/:user', method = "get", produces = "text/html")
	 */
	public function search(dwHttpRequest $request, dwHttpResponse $response, dwModel $model) {
		
		$doc = self::$apiEntity;
		
		$p_user = $request -> Path('user');
		
		$doc -> user = $p_user;
		
		/*
		if($doc -> find()) {
			return json_encode($doc -> fetchAll());
		}
		*/
		
		
		$model -> documentation = <<<EOT
		{
  "name": "My API name",
  "modified": "2015-12-12 12:00:00",
  "version": "1.0.0",
  "build": "",
  "default": "pages~Welcome",
  "api":
  [
    {
        "group": "Group",
        "name": "REST",
        "description": "Markdown (GFM) __syntax highlighting__.",
        "types":
        [
            {
                "name": "Users: list of users",
                "description": "Markdown (GFM) __syntax highlighting__.",
                "method": "GET",
                "output": "{\"success\":true}",
                "url": "http://blablabla.com/users/{id}/",
                "return": "JSON",
                "headers":
                [
                    "Content-Type: application/json",
                    "X-Token: 24953f1f8df2f84b8fe1"
                ],
                "params":
                [
                    {
                        "name": "search",
                        "type": "String",
                        "description": "Search phrase (markdown is not supported)",
                        "options": ["optional"]
                    },
                    {
                        "name": "page",
                        "type": "Number",
                        "description": "Listing.",
                        "options": ["!important"]
                    },
                    {
                        "name": "page",
                        "type": "Number",
                        "description": "Listing."
                    }
                ]
            }
        ]
    }
  ],
  "pages":
  [
    {
      "name": "Welcome",
      "body": "Markdown (GFM) __syntax highlighting__."
    },
    {
      "name": "Contact",
      "body": "Markdown (GFM) __syntax highlighting__."
    }
  ],
  "links":
  [
    {
      "name": "Homepage",
      "url": "http://www.totaljs.com"
    },
    {
      "name": "GitHub",
      "url": "https://github.com/petersirka/MyAPI"
    }
  ]
}
EOT;
		
		return 'view:./views/api.html';
	}
	
}
	
?>