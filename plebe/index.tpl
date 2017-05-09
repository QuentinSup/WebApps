<!doctype html>
<html lang="fr">
<head>

  <meta charset="utf-8">
  <!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
  <title>{$metas.title|escape}</title>
  <meta name="description" content="{$metas.description|escape}">
  <meta name="author" content="{$metas.author|escape}">
  <meta name="keywords" content="{$metas.keywords|escape}">
  
	{if $metas.cards}
	
	<!-- Twitter Card data -->
	<meta name="twitter:card" value="summary">
	<!-- <meta name="twitter:site" content="@" /> -->
	<meta name="twitter:title" content="{$metas.cards.title|escape}" />
	<meta name="twitter:description" content="{$metas.cards.description|escape}" />
	<meta name="twitter:image" content="{$baseUri}/assets/img/plebe_cardx.png" />
	
	<!-- Open Graph data -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content="{$metas.cards.title|escape}" />
	<meta property="og:url" content="{$metas.cards.uri}" />
	<meta property="og:description" content="{$metas.cards.description|escape}" />
	<meta property="og:site_name" content="Plebe.fr" />
	<meta property="og:image" content="{$baseUri}/assets/img/plebe_cardx.png" />
	
	<meta property="article:author" content="{$metas.cards.author|escape}" />
	<!-- 
	<meta property="article:published_time" content="" />
	<meta property="article:modified_time" content="" />
	<meta property="article:section" content="" />
	<meta property="article:tag" content="" />
	-->

	<!-- Schema.org markup for Google+ -->
	<meta itemprop="name" content="{$metas.cards.title|escape}">
	<meta itemprop="description" content="{$metas.cards.description|escape}">
	<meta itemprop="image" content="{$baseUri}/assets/img/plebe_cardx.png">
	
	{/if}

  <link rel="alternate" type="application/rss+xml" title="Les dernières publications sur Plebe.fr" href="{$baseUri}/?/feeds/rss" />

  <link rel="shortcut icon" href="assets/img/favicon.ico">

  <link href='http://fonts.googleapis.com/css?family=Ubuntu:700' rel='stylesheet' type='text/css'>
  <link href='https://fonts.googleapis.com/css?family=Oxygen' rel='stylesheet' type='text/css'>
  <link href='https://fonts.googleapis.com/css?family=Andada' rel='stylesheet' type='text/css'>
  <link href='https://fonts.googleapis.com/css?family=Titillium+Web:400,700' rel='stylesheet' type='text/css'>

  <link rel="stylesheet" href="assets/css/bootstrap.min.css" type="text/css" media="all" />
  <link rel="stylesheet" href="assets/css/animate.css" type="text/css" media="all" />
  <link rel="stylesheet" href="assets/css/font-awesome.min.css" type="text/css" media="all" />
  <link rel="stylesheet" href="assets/css/font-lineicons.css" type="text/css" media="all" />
  <link rel="stylesheet" href="assets/css/jquery.fancybox.css" type="text/css" media="all" />
  <link rel="stylesheet" href="assets/css/style-green.css" id="mainstyle" type="text/css" media="all" />
  <link rel="stylesheet" href="assets/css/jquery.hideshare.css" type="text/css" media="all" />
  <link rel="stylesheet" href="assets/css/verbatim.css" type="text/css" media="all" />
  
	<!--[if lt IE 9]>
    <script src="./assets/js/html5.js"></script>
    <script src="./assets/js/respond.min.js"></script>
    <![endif]-->
        
    <!--[if lt IE 9]>
    <script type="text/javascript" src="assets/js/jquery-1.11.0.min.js?ver=1"></script>
    <![endif]-->  
    <!--[if (gte IE 9) | (!IE)]><!-->  
    <script type="text/javascript" src="assets/js/jquery-2.1.0.min.js?ver=1"></script>
    <!--<![endif]-->  
    <script type="text/javascript" src="assets/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="assets/js/jquery.nav.js"></script>
    <script type="text/javascript" src="assets/js/jquery.appear.js"></script>
    <script type="text/javascript" src="assets/js/jquery.countTo.js"></script>
    <script type="text/javascript" src="assets/js/waypoints.min.js"></script>
    <script type="text/javascript" src="assets/js/waypoints-sticky.min.js"></script>
    <script type="text/javascript" src="assets/js/jquery.fancybox.js"></script>
    <script type="text/javascript" src="assets/js/verbatim.js"></script>    
	<script type="text/javascript" src="assets/js/jquery.hideshare.min.js"></script>
		
</head>
<body id="index">
	<!-- Preloader -->
	<div id="mask">
		<div id="loader"><img src="assets/img/preloader.gif" alt="preloader" /></div>
	</div>
	<header id="mobileheader" class="navigation-bar-header visible-xs"></header>
	<!-- Header -->
	<header id="header" class="navigation-bar-header hidden-xs">
			<nav class="navigation">
				<div class="navigation-txt light visible-xs" data-toggle="dropdown">Plebe.fr</div>
				<button class="navigation-toggle visible-xs" type="button" data-toggle="dropdown">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<ul class="navigation-bar navigation-bar-left">
					<li><a href="?"><strong>Plebe</strong></a></li>
					<li><a href="?form"><strong></strong>Ecrire</a></li>
				</ul>
			</nav>   
	</header>

	<div class="bg-warning" style="padding: 2em;">
		<div class="container">
			<b>Attention</b> : Vous êtes sur une version <span class="hightlight">développement</span> de plebe.fr.<br />
			La base de données peut être réinitialisée à tout moment sans avertissement au préalable : par conséquent tous les liens partagés pourront ne plus être disponible.<br />
			Attendez la version bêta si vous souhaitez publier du contenu de manière pérenne.
		</div>
	</div>

	<!-- End Header -->
    <!-- About Section -->
		
	{include file="pages/$pageId.html"}
	
	<!-- End Map Section -->
	<br />
	<footer id="footer" class="text-center">
	<a href="{$baseUri}/?/mentions-legales" target="plebe_mentions">Mentions légales</a> |
	<a href="{$baseUri}/?/cgu" target="plebe_cgu">Conditions d'utilisation</a>
	</footer>
	<br />

	<div class="back-to-top"><i class="fa fa-angle-up fa-3x"></i></div>
	<script type="text/javascript" src="assets/js/scripts.js"></script>

</body>
</html>