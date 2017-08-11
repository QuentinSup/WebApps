<?php /* Smarty version Smarty-3.1.18, created on 2017-08-11 15:01:51
         compiled from "views\overshootday.html" */ ?>
<?php /*%%SmartyHeaderCode:6471598ca4f41be3e7-80510452%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    '238e5139fb2951952d25e417641cc5e1ee220f61' => 
    array (
      0 => 'views\\overshootday.html',
      1 => 1502456492,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '6471598ca4f41be3e7-80510452',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.18',
  'unifunc' => 'content_598ca4f41e1677_35065488',
  'variables' => 
  array (
    'lang' => 0,
  ),
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_598ca4f41e1677_35065488')) {function content_598ca4f41e1677_35065488($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<title>The Overshoot Day Page</title>
<meta charset="utf-8" />
<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
<link rel="icon" href="favicon.ico" />
<link type="text/css" rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:400,700,900|Open+Sans:400,700,900|Lato:400,700,900" />
<link type="text/css" rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css" />
<link type="text/css" rel="stylesheet" href="assets/css/animate.css" />
<link type="text/css" rel="stylesheet" href="assets/css/overshootday.css" />
<link type="text/css" rel="stylesheet" href="assets/jssocial/jssocials.css" />
<link type="text/css" rel="stylesheet" href="assets/jssocial/jssocials-theme-flat.css" />
</head>
<body>
	<div id="preloader"></div>
	<div id="loading"></div>

	<div id="view">
		<video autoplay loop>
			<source src="assets/mp4/earth.mp4" type="video/mp4" spellcheck="false" />
		</video>

		<div id="globalOvershootDay">
			<span data-bind="text: globalOvershootDayString"></span>
		</div>

		<div id="shareit"></div>

		<!-- ko if: region -->
		<div id="regions_detail">
			<div class="dialog">
				<div class="dialog-head">
					<div class="dialog-head-title text-center">
						<div class="col-xs-12 col-sm-8 col-sm-offset-2">
							<img data-bind="attr: { 'src' : 'assets/images/flags/' + region().iso.toLowerCase() + '.png' }" />&nbsp;
							<div id="country-search-area">
								<div class="search-area">
									<div class="search-input">
										<input type="text" data-bind="value: countrySearch, valueUpdate: 'input'" />
									</div>
								</div>
								<div id="countries" data-bind="visible: countrySearch() && countrySearch().toUpperCase() != region().countryName.toUpperCase()">
									<ul class="text-left">
										<!-- ko foreach: countries() -->
										<!-- ko if: !$parent.countrySearch() || value.toUpperCase().startsWith($parent.countrySearch().toUpperCase()) -->
										<li><a class="clickable"
											data-bind="css: { 'selected': $parent.selectedCountry() == key }, click: function() { $parent.selectedCountry(key) }"> <img
												data-bind="attr: { 'src' : 'assets/images/flags/' + key.toLowerCase() + '.png' }" />&nbsp;<span data-bind="text: value"></span>
										</a></li>
										<!-- /ko -->
										<!-- /ko -->
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="dialog-body" data-bind="with: region">
					<div class="dialog-body-content col-sm-12 col-md-6 col-md-offset-3">
						<!-- ko if: isDataLoaded() -->
						<!-- ko with: data() -->
						<div class="line animated counter" data-animation="fadeInDown" data-delay="1000">
							<div class="text-center">
								<span>Overshoot day</span>
								<a class="twitter-share-button smaller"
											data-bind="attr: { 'href': 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(countryName + ' overshoot day is ' + overshootDayString + ' ! #overshootday #wakeup #GlobalFootprintNetwork http://overshoot-day.com') + '&via=QuentinSup' }"
											target="twitter">Share it now !</a>
							</div>
							<div class="text-center">
								<span class="bigger" data-bind="text: overshootDayString"></span>
							</div>
						</div>
						<div class="row">
							<div class="col-sm-12 col-md-4">
								<div class="line animated counter" data-animation="fadeInDown" data-delay="1400">
									<div class="box">
										<div class="text-center">
											<span>Number of earths</span>
										</div>
										<div class="text-center">
											<div class="bigger value" data-from="0" data-decimals="1" data-to="" data-bind="attr: { 'data-to': numberOfEarths }"></div>
											<div class="earth-prog" data-bind="attr: { 'style': 'width:' + (numberOfEarths * 30) + 'px' }"></div>
										</div>
									</div>
								</div>
							</div>
							<div class="col-sm-12 col-md-4">
								<div class="line animated counter" data-animation="fadeInDown" data-delay="1800">
									<div class="box">
										<div class="text-center">
											<span>Ecological Footprint</span>
										</div>
										<div class="text-center">
											<span class="bigger value" data-from="0" data-decimals="1" data-to="" data-bind="attr: { 'data-to': EFConsPerCap }"></span><br /> <span
												class="smaller">gha / h</span>
										</div>
									</div>
								</div>
							</div>

							<div class="col-sm-12 col-md-4">
								<div class="line animated counter" data-animation="fadeInDown" data-delay="2100">
									<div class="box">
										<div class="text-center">
											<span>Biocapacity</span>
										</div>
										<div class="text-center">
											<span class="bigger value" data-from="0" data-decimals="1" data-to="" data-bind="attr: { 'data-to': BiocapPerCap }"></span><br /> <span
												class="smaller">gha / h</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<!-- /ko -->
						<!-- /ko -->
						<p class="box">
							<a href="worldmap">Show the world map</a> | Data based on <a href="http://data.footprintnetwork.org">Global Footprint Network API</a> | Made with <span class="ico-heart"></span> by @QuentinSup | 2017
						</p>
					</div>
				</div>
			</div>
		</div>
		<!-- /ko -->

	</div>

	<script>
	
		window.forcedLang = '<?php echo $_smarty_tpl->tpl_vars['lang']->value;?>
';
	</script>

	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.2/knockout-min.js"></script>
	<script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="
		crossorigin="anonymous"></script>
	<script type="text/javascript" src="assets/js/jquery/jquery.appear.min.js"></script>
	<script type="text/javascript" src="assets/js/jquery/jquery.countTo.min.js"></script>
	<script type="text/javascript" src="assets/jssocial/jssocials.min.js"></script>
	<script type="text/javascript" src="assets/js/commons.js"></script>
	<script type="text/javascript" src="assets/js/overshootday.js"></script>

	<script>
		
		$("#shareit").jsSocials({
            shares: ["twitter", "facebook", "googleplus", "linkedin", "whatsapp"]
        });
		
	</script>

</body>
</html><?php }} ?>
