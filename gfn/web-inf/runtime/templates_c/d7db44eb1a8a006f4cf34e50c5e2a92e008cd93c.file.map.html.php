<?php /* Smarty version Smarty-3.1.18, created on 2017-08-10 22:43:05
         compiled from "views\map.html" */ ?>
<?php /*%%SmartyHeaderCode:21663598ca4520c7195-29447025%%*/if(!defined('SMARTY_DIR')) exit('no direct access allowed');
$_valid = $_smarty_tpl->decodeProperties(array (
  'file_dependency' => 
  array (
    'd7db44eb1a8a006f4cf34e50c5e2a92e008cd93c' => 
    array (
      0 => 'views\\map.html',
      1 => 1502397784,
      2 => 'file',
    ),
  ),
  'nocache_hash' => '21663598ca4520c7195-29447025',
  'function' => 
  array (
  ),
  'version' => 'Smarty-3.1.18',
  'unifunc' => 'content_598ca4520ee296_42760279',
  'has_nocache_code' => false,
),false); /*/%%SmartyHeaderCode%%*/?>
<?php if ($_valid && !is_callable('content_598ca4520ee296_42760279')) {function content_598ca4520ee296_42760279($_smarty_tpl) {?><!DOCTYPE html>
<html>
<head>
<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
<title>The Overshoot Day</title>
<meta charset="utf-8" />
<link type="text/css" rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:400,700,900|Open+Sans:400,700,900|Lato:400,700,900" />
<link type="text/css" rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css" />
<link type="text/css" rel="stylesheet" href="assets/css/animate.css" />
<link type="text/css" rel="stylesheet" href="assets/css/map.css" />
<link type="text/css" rel="stylesheet" href="assets/jssocial/jssocials.css" />
<link type="text/css" rel="stylesheet" href="assets/jssocial/jssocials-theme-flat.css" />
</head>
<body>

	<div id="preloader"></div>
	<div id="loading"></div>
	
	<div id="regions_div"></div>
	
	
	<div id="shareit">
		<div id="twitter" data-url="http://overshoot-day.com" data-text="See the ecological footprint by country" data-title="Tweet"></div>
  		<div id="facebook" data-url="http://overshoot-day.com" data-text="See the ecological footprint by country" data-title="Like"></div>
  		<div id="googleplus" data-url="http://overshoot-day.com" data-text="See the ecological footprint by country" data-title="+1"></div>
	</div>
	
	<div id="view">
		<!-- ko if: globalOvershootDay() -->
			<div id="globalOvershootDay">
				<span>Mondial Overshoot Day : </span><span data-bind="text: globalOvershootDayString"></span>
			</div>
		<!-- /ko -->
		<!-- ko if: region -->
		<div id="regions_detail" data-bind="with: region">
			<div class="dialog">
			<div class="dialog-head">
				<div class="dialog-head-title">
					<img data-bind="attr: { 'src' : 'assets/images/flags/' + (iso || '').toLowerCase() + '.png' }" />&nbsp;<span data-bind="text: countryName"></span>
				</div>
			</div>
			<div class="dialog-body">
				<div class="dialog-body-content">
					<div class="col-sm-12 col-md-7">
						<!-- ko if: isDataLoaded() -->
						<!-- ko with: data() -->
						<div class="line animated counter" data-animation="fadeInDown" data-delay="1000">
						<div class="row">
							<div class="col-sm-12 col-md-5">
								<div class="text-center">
									<span class="bigger" data-bind="text: overshootDayString"></span>
								</div>
							</div>
							<div class="col-sm-12 col-md-5">
								Overshoot day
								<a class="twitter-share-button smaller" data-bind="attr: { 'href': 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(countryName + ' overshoot day is ' + overshootDayString + ' ! #overshootday #wakeup #GlobalFootprintNetwork http://overshoot-day.com') + '&via=QuentinSup' }" target="twitter">Share it now !</a>
								<p>
								The day when all the resources that the earth can produce would have been consumed, if every countries consume like this country. 
								</p>	
							</div>
						</div>
						</div>
						<div class="line animated counter" data-animation="fadeInDown" data-delay="1400">
						<div class="row">
							<div class="col-sm-12 col-md-5">
								<div class="text-center">
									<div class="bigger value" data-from="0" data-decimals="1" data-to="" data-bind="attr: { 'data-to': numberOfEarths }"></div>
									<div class="earth-prog" data-bind="attr: { 'style': 'width:' + (numberOfEarths * 30) + 'px' }"></div>
								</div>
							</div>
							<div class="col-sm-12 col-md-7">
								Number of earths
								<p>
								The number of earths that humanity would needed if every countries consume like this country.
								</p>	
							</div>
						</div>
						</div>
						<div class="line animated counter" data-animation="fadeInDown" data-delay="1800">
						<div class="row">
							<div class="col-sm-12 col-md-5">
								<div class="text-center">
									<span class="bigger value" data-from="0" data-decimals="1" data-to="" data-bind="attr: { 'data-to': EFConsPerCap }"></span><br />
									<span class="smaller">gha / h</span>
								</div>
							</div>
							<div class="col-sm-12 col-md-7">
								Ecological Footprint (of consumption)
								<p>
								A measure of how much area of biologically productive land and water an individual, population, or activity requires to produce all the resources it consumes and to absorb the waste it generates, using prevailing technology and resource management practices.
								</p>	
							</div>
						</div>
						</div>
						<div class="line animated counter" data-animation="fadeInDown" data-delay="2100">
						<div class="row">
							<div class="col-sm-12 col-md-5">
								<div class="text-center">
									<span class="bigger value" data-from="0" data-decimals="1" data-to="" data-bind="attr: { 'data-to': BiocapPerCap }"></span><br />
									<span class="smaller">gha / h</span>
								</div>
							</div>
							<div class="col-sm-12 col-md-7">
								Biocapacity
								<p>
								The biocapacity of a surface represents its ability to renew what people demand.
								Biocapacity can change from year to year due to climate, management, and proportion considered useful inputs to the human economy. 
								</p>
							</div>
						</div>
						</div>
						<!-- /ko -->
						<!-- /ko -->
					</div>
					<div class="col-sm-12 col-md-5">
						Evolution in times
						<div id="regions_detail_records"></div>
						<br />
						<p>
						Data are based on Global Footprint Network API.<br />
						More info at <a href="http://www.footprintnetwork.org" target="_blank">http://www.footprintnetwork.org</a>
						</p>
					</div>
				</div>
			</div>
			</div>
		</div>
		<!-- /ko -->
	</div>
	
	<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/knockout/3.4.2/knockout-min.js"></script>
	<script type="text/javascript" src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
	<script type="text/javascript" src="assets/js/jquery/jquery.appear.min.js"></script>
	<script type="text/javascript" src="assets/js/jquery/jquery.countTo.min.js"></script>
	<script type="text/javascript" src="assets/jssocial/jssocials.min.js"></script>
	<script type="text/javascript" src="assets/js/commons.js"></script>
	<script type="text/javascript" src="assets/js/map.js"></script>

	<script>
		
		$("#shareit").jsSocials({
            shares: ["twitter", "facebook", "googleplus", "linkedin", "whatsapp"]
        });
		
	</script>

</body>
</html><?php }} ?>
