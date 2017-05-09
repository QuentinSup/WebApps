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
 * @Mapping(value = '/i18n')
 */
class i18n extends dwBasicController
{

	/**
	 * @Mapping(value = ':device/:app/:page/:lang', method = "get", produces = "application/json; charset=utf8")
	 */
	public function locale(dwHttpRequest &$request, dwHttpResponse &$response, dwModel &$model) 
	{
		$locale = parse_ini_file("./resources/i18n/".$request -> Path('page').".properties");
		return json_encode($locale);
	}

}

?>