<?php

namespace keeply;

use dw\dwFramework as dw;
use dw\classes\dwHttpRequest;
use dw\classes\dwHttpResponse;
use dw\classes\dwModel;
use dw\classes\dwObject;
use dw\classes\controllers\dwBasicController;
use dw\accessors\ary;

dw_require("vendors/spyc/Spyc");

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
		$locale = \Spyc::YAMLLoad("./resources/i18n/".$request -> Path('page').".yaml");
		return json_encode($locale);
	}

}

?>