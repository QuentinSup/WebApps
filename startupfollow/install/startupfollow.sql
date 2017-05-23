-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Client :  127.0.0.1
-- Généré le :  Mar 23 Mai 2017 à 17:17
-- Version du serveur :  5.7.14
-- Version de PHP :  5.6.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `startupfollow`
--

-- --------------------------------------------------------

--
-- Structure de la table `startup`
--

CREATE TABLE `startup` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `ref` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `punchLine` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `image` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `link_website` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_twitter` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_facebook` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `startup`
--

INSERT INTO `startup` (`uid`, `name`, `ref`, `email`, `punchLine`, `description`, `image`, `createdAt`, `updatedAt`, `link_website`, `link_twitter`, `link_facebook`) VALUES
(1, 'Colaunch', 'colaunch', 'contact@colaunch.fr', 'Donnez une chance Ã  vos idÃ©es !', NULL, 'http://localhost:8080/startupfollow/assets/upload_images/14440629_1898954453665463_4749651812181855416_n.jpg', '2017-05-16 12:03:26', '2017-05-22 14:47:52', 'http://colaunch.fr', '@colaunchingre', 'https://www.facebook.com/colaunch'),
(2, 'Loha', 'loha', 'qsupernant@gmail.com', 'Vivez de votre passion', NULL, NULL, '2017-05-16 14:04:55', NULL, NULL, NULL, NULL),
(5, 'Co\'fret', 'cofret', 'qsupernant@gmail.com', 'Service de livraison de nourriture', NULL, 'http://localhost:8080/startupfollow/assets/upload_images/cofret.png', '2017-05-23 10:16:04', NULL, ' http://cofret.fr/', '@getcofret', 'https://www.facebook.com/getcofret/');

-- --------------------------------------------------------

--
-- Structure de la table `startup_event`
--

CREATE TABLE `startup_event` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `startup_uid` bigint(20) NOT NULL,
  `type` tinyint(1) NOT NULL,
  `user_uid` bigint(20) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data` text COLLATE utf8_unicode_ci,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `startup_event`
--

INSERT INTO `startup_event` (`uid`, `startup_uid`, `type`, `user_uid`, `date`, `data`, `createdAt`, `updatedAt`) VALUES
(1, 1, 3, 1, '2017-05-23 19:01:06', NULL, '2017-05-23 17:01:06', NULL),
(2, 1, 4, 1, '2017-05-23 19:01:17', NULL, '2017-05-23 17:01:17', NULL),
(3, 1, 3, 1, '2017-05-23 19:01:24', NULL, '2017-05-23 17:01:24', NULL),
(4, 1, 4, 1, '2017-05-23 19:01:25', NULL, '2017-05-23 17:01:25', NULL),
(5, 1, 3, 1, '2017-05-23 19:01:26', NULL, '2017-05-23 17:01:26', NULL),
(6, 1, 4, 1, '2017-05-23 19:01:27', NULL, '2017-05-23 17:01:27', NULL),
(7, 1, 3, 1, '2017-05-23 19:01:28', NULL, '2017-05-23 17:01:28', NULL),
(8, 1, 5, 1, '2017-05-23 19:14:22', 'Si votre idÃ©e ne tient pas en quelques lignes, c\'est que vous avez perdu de vu l\'essentiel.Prenez exemple sur le cahier des charges de la 2CV :â€œUne voiture pouvant transporter deux cultivateurs en sabots, cinquante kilos de pommes de', '2017-05-23 17:14:22', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `startup_follower`
--

CREATE TABLE `startup_follower` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `user_uid` bigint(20) NOT NULL,
  `startup_uid` bigint(20) NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `startup_follower`
--

INSERT INTO `startup_follower` (`uid`, `user_uid`, `startup_uid`, `createAt`) VALUES
(14, 1, 1, '2017-05-23 17:01:28'),
(10, 1, 5, '2017-05-23 16:57:11');

-- --------------------------------------------------------

--
-- Structure de la table `startup_member`
--

CREATE TABLE `startup_member` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `startup_uid` bigint(20) UNSIGNED NOT NULL,
  `user_uid` bigint(20) UNSIGNED DEFAULT NULL,
  `invitation_email` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL,
  `role` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `founder` tinyint(1) UNSIGNED NOT NULL DEFAULT '0',
  `invitationSentAt` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `startup_member`
--

INSERT INTO `startup_member` (`uid`, `startup_uid`, `user_uid`, `invitation_email`, `role`, `founder`, `invitationSentAt`, `createdAt`, `updatedAt`) VALUES
(1, 2, NULL, 'qsupernant@gmail.com', NULL, 0, NULL, '2017-05-16 15:39:24', '2017-05-17 09:48:51'),
(3, 1, NULL, 'qsupernant@gmail.com', 'CEO', 0, '2017-05-23 10:59:42', '2017-05-23 08:31:13', '2017-05-23 08:59:42'),
(4, 5, 1, NULL, 'CEO', 1, NULL, '2017-05-23 10:16:04', '2017-05-23 10:45:11');

-- --------------------------------------------------------

--
-- Structure de la table `startup_request`
--

CREATE TABLE `startup_request` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT '1',
  `email` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `startup_request`
--

INSERT INTO `startup_request` (`uid`, `type`, `email`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:01:38', NULL),
(2, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:02:07', NULL),
(3, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:02:49', NULL),
(4, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:03:51', NULL),
(5, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:06:00', NULL),
(6, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:07:06', NULL),
(7, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:09:36', NULL),
(8, 1, 'qsupernant@gmail.com', 'Colaunch', '2017-05-16 10:12:45', NULL),
(9, 1, 'qsupernant@gmail.com', 'Loha', '2017-05-16 14:02:30', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `startup_story`
--

CREATE TABLE `startup_story` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `startup_uid` bigint(20) UNSIGNED NOT NULL,
  `text` text COLLATE utf8_unicode_ci NOT NULL,
  `shortLine` varchar(150) COLLATE utf8_unicode_ci NOT NULL,
  `date` datetime NOT NULL,
  `numberOfLikes` int(10) UNSIGNED NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `startup_story`
--

INSERT INTO `startup_story` (`uid`, `startup_uid`, `text`, `shortLine`, `date`, `numberOfLikes`, `createdAt`, `updateAt`) VALUES
(1, 2, '<p><strong>Welcome team !</strong></p><p>Du nouveau sous les tropiques : nous venons de finaliser notre premiÃ¨re levÃ©e de fond !</p><p>La suite dans <a data-mce-href="http://google.fr" href="http://google.fr">quelques jours</a>... :)</p>', 'PremiÃ¨re levÃ©e de fond !', '2017-05-17 00:00:00', 0, '2017-05-17 11:58:34', NULL),
(2, 2, '<p><strong>Welcome team !</strong></p><p>Du nouveau sous les tropiques : nous venons de finaliser notre premiÃ¨re levÃ©e de fond !</p><p>La suite dans <a data-mce-href="http://google.fr" href="http://google.fr">quelques jours</a>... :)</p>', 'PremiÃ¨re levÃ©e de fond !', '2017-05-17 13:59:45', 0, '2017-05-17 11:59:45', NULL),
(3, 2, '<blockquote><p>Hello team ;)</p></blockquote>', 'Startup...weekend !', '2017-05-17 14:15:07', 0, '2017-05-17 12:15:07', NULL),
(4, 2, '<blockquote><p>Hello team ;)</p><p><br data-mce-bogus="1"></p></blockquote><p>Des news depuis la plage oÃ¹ on vous fait de gros bisous !</p>', 'Startup...weekend !', '2017-05-17 17:14:45', 0, '2017-05-17 15:14:45', NULL),
(5, 2, '<blockquote><p>Hello team ;)</p><p><br data-mce-bogus="1"></p></blockquote><p>Des news depuis la plage oÃ¹ on vous fait de gros bisous !</p>', 'Startup...weekend2 !', '2017-05-17 17:20:40', 0, '2017-05-17 15:20:40', NULL),
(6, 2, '<blockquote><p>Hello team ;)<br data-mce-bogus="1"></p></blockquote><p>Des news depuis la plage oÃ¹ on vous fait de gros bisous !</p>', 'Startup...weekend10 !', '2017-05-17 17:35:05', 0, '2017-05-17 15:35:05', '2017-05-17 15:39:31'),
(7, 2, '<blockquote><p>Hello team ;)<br data-mce-bogus="1"></p></blockquote><p>Des news depuis la plage oÃ¹ on vous fait de gros bisous !</p>', 'Startup...weekend3 !', '2017-05-17 17:38:18', 1, '2017-05-17 15:38:18', '2017-05-22 14:41:34'),
(8, 1, '<p>Le 14 avril aura lieu la prochaine soirÃ©e Colaunch !</p><p>On vous prÃ©sente Carole qui souhaite partager son projet : Â« Mes courses en <a href="https://l.facebook.com/l.php?u=http%3A%2F%2Fvrac.com%2F&amp;h=ATNdJGF68oQT3htuHxyNIDlI_6mkDHp3l155Inm5f_7GdKsFYZWL9H6Hn3Ro9ymD2c1hLZU3DCjgombwqPL6MjaLxEUajZf6oLc2kUFn66yuCo4Sg_rb8X43_h1rdSsfPBeRWnKH3QYR3zFfCRwxww&amp;enc=AZMYjy1VD66Z2WjUUjTgEFwuI2N5OZERnd0ifqt4hDgxU2rrLillLjIqUKFPASeM859P9m-7NpaOKEVIttQCBtYE9yZH0C4Zxl3_ZOesTOW1mTW7NmejniZ9pTmz8aQnMDhKlDCYHAv_uaqaBRbg13AdfhE0_kF7Ji5jd-UlkJHn57O88emiwh636T4HYBqjvI6rUOsh_WkSnf0bUmLh1nWt&amp;s=1" target="_blank" rel="nofollow noopener noreferrer" data-mce-href="https://l.facebook.com/l.php?u=http%3A%2F%2Fvrac.com%2F&amp;h=ATNdJGF68oQT3htuHxyNIDlI_6mkDHp3l155Inm5f_7GdKsFYZWL9H6Hn3Ro9ymD2c1hLZU3DCjgombwqPL6MjaLxEUajZf6oLc2kUFn66yuCo4Sg_rb8X43_h1rdSsfPBeRWnKH3QYR3zFfCRwxww&amp;enc=AZMYjy1VD66Z2WjUUjTgEFwuI2N5OZERnd0ifqt4hDgxU2rrLillLjIqUKFPASeM859P9m-7NpaOKEVIttQCBtYE9yZH0C4Zxl3_ZOesTOW1mTW7NmejniZ9pTmz8aQnMDhKlDCYHAv_uaqaBRbg13AdfhE0_kF7Ji5jd-UlkJHn57O88emiwh636T4HYBqjvI6rUOsh_WkSnf0bUmLh1nWt&amp;s=1">vrac.com</a> : mon Ã©picerie zero dÃ©chet en ligne Â».</p><div class="text_exposed_show"><blockquote><p>Jâ€™adore le Qinoa, je suis fan de limonade artisanale et je ne jure que par les petits boui-boui â€œhyper authentiiiiquesâ€ Ã  lâ€™Ã©tranger. Alors bon, je suis pâ€™tâ€™Ãªtre un peu boboâ€¦Mais tout Ã§a câ€™est rÃ©cent ! Je ne sais pas quand et comment Ã§a a commencÃ© mais maintenant Ã§a mâ€™obsÃ¨de : il faut consommer autrement, mieux, moins, ralentir, prendre le temps, â€œÃªtre plutÃ´t quâ€™avoirâ€ tout Ã§a tout Ã§a... Et pour moi, changer le monde (rien que Ã§a) passe par lâ€™adoption dâ€™une sorte dâ€™Ã©co-lifestyle. Alors voilÃ , jâ€™ai tout plaquÃ© et je me suis lancÃ©e dans la crÃ©ation dâ€™une Ã©picerie en ligne Ã  la fois bio, locale et surtout, sans dÃ©chet."</p><p>Le pitch de mon projet c\'est "<a href="http://mescoursesenvrac.com/" target="_blank" rel="nofollow noopener noreferrer" data-mce-href="http://mescoursesenvrac.com/">Mescoursesenvrac.com"</a> : la premiÃ¨re Ã©picerie en ligne 100% zero dÃ©chet. On y trouve tout le nÃ©cessaire pour notre quotidien : cosmÃ©tiques, alimentaire, entretien de la maison et mÃªme de la dÃ©co. Du zÃ©ro dÃ©chet en livraison ? Et oui, grÃ¢ce Ã  un systÃ¨me dâ€™emballage innovant, tout est consignÃ© ! Tous les emballages reÃ§us sont renvoyÃ©s Ã  lâ€™expÃ©diteur, qui les rÃ©-utilisent</p></blockquote><p>Pour l\'aider Ã  avancer sur son projet, nul besoin d\'Ãªtre expert ! Il suffit de vous inscrire et rÃ©pondre prÃ©sent pour la soirÃ©e du 14 avril :<a href="https://www.weezevent.com/colaunch-15" target="_blank" rel="nofollow noopener noreferrer" data-mce-href="https://www.weezevent.com/colaunch-15">https://www.weezevent.com/colaunch-15</a></p><p>&nbsp;</p><p><img src="http://localhost:8080/startupfollow/assets/upload_images/mceu3sj2t8spmm1m9tk7spo50oi13rklxj.jpg" data-mce-src="../../assets/upload_images/mceu3sj2t8spmm1m9tk7spo50oi13rklxj.jpg" style="display: block; margin-left: auto; margin-right: auto;" data-mce-style="display: block; margin-left: auto; margin-right: auto;"></p></div>', 'Colaunch revient le 14 avril !', '2017-05-17 18:36:48', 24, '2017-05-17 16:36:48', '2017-05-18 09:44:05'),
(9, 1, '<p>Si votre idÃ©e ne tient pas en quelques lignes, c\'est que vous avez perdu de vu l\'essentiel.</p><p>Prenez exemple sur le cahier des charges de la 2CV :</p><p>â€œUne voiture pouvant transporter deux cultivateurs en sabots, cinquante kilos de pommes de terre ou un tonnelet Ã  une vitesse maximum de 60 km/h pour une consommation de trois litres dâ€™essence aux cent. En outre, ce vÃ©hicule doit pouvoir passer dans les plus mauvais chemins, il doit Ãªtre suffisamment lÃ©ger pour Ãªtre maniÃ© sans probl<span class="text_exposed_show">Ã¨mes par une conductrice dÃ©butante. Son confort doit Ãªtre irrÃ©prochable car les paniers dâ€™oeufs transportÃ©s Ã  lâ€™arriÃ¨re doivent arriver intacts. Son prix devra Ãªtre bien infÃ©rieur Ã  celui de notre Traction Avantâ€</span></p><div class="text_exposed_show"><p>Simple, efficace.</p><p>Si vous n\'y arrivez pas tout seul, contactez-nous, et on vous aidera Ã  vous recentrer sur l\'essentiel !</p></div>', 'La philosophie de Colaunch', '2017-05-17 18:38:27', 11, '2017-05-17 16:38:27', '2017-05-18 09:43:57'),
(10, 5, '<p>Voici les nouvelles !</p>', 'Test', '2017-05-23 16:01:14', 0, '2017-05-23 14:01:14', NULL),
(11, 5, '<p>DEs news !</p>', 'Nouvelle info', '2017-05-23 16:03:21', 0, '2017-05-23 14:03:21', NULL),
(12, 5, '<p>Merci de nous suivre !</p>', 'Welcome', '2017-05-23 16:05:44', 0, '2017-05-23 14:05:44', NULL),
(13, 5, '<p>Merci de nous suivre !</p>', 'Bienvenue', '2017-05-23 16:08:08', 0, '2017-05-23 14:08:08', NULL),
(14, 5, '<p>Merci de nous suivre !</p>', 'Bienvenue', '2017-05-23 16:13:07', 0, '2017-05-23 14:13:07', NULL),
(15, 5, '<p>Merci de nous suivre !</p>', 'Salut Ã  tous !', '2017-05-23 16:17:07', 0, '2017-05-23 14:17:07', '2017-05-23 15:12:08'),
(16, 1, '<p>Si votre idÃ©e ne tient pas en quelques lignes, c\'est que vous avez perdu de vu l\'essentiel.</p><p>Prenez exemple sur le cahier des charges de la 2CV :</p><p>â€œUne voiture pouvant transporter deux cultivateurs en sabots, cinquante kilos de pommes de terre ou un tonnelet Ã  une vitesse maximum de 60 km/h pour une consommation de trois litres dâ€™essence aux cent. En outre, ce vÃ©hicule doit pouvoir passer dans les plus mauvais chemins, il doit Ãªtre suffisamment lÃ©ger pour Ãªtre maniÃ© sans probl<span class="text_exposed_show">Ã¨mes par une conductrice dÃ©butante. Son confort doit Ãªtre irrÃ©prochable car les paniers dâ€™oeufs transportÃ©s Ã  lâ€™arriÃ¨re doivent arriver intacts. Son prix devra Ãªtre bien infÃ©rieur Ã  celui de notre Traction Avantâ€</span></p><div class="text_exposed_show"><p>Simple, efficace.</p><p>Si vous n\'y arrivez pas tout seul, contactez-nous, et on vous aidera Ã  vous recentrer sur l\'essentiel !</p></div>', 'Un nouvel article !', '2017-05-23 19:14:22', 0, '2017-05-23 17:14:22', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `firstName` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastName` varchar(150) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(250) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(32) COLLATE utf8_unicode_ci NOT NULL,
  `image` varchar(250) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_website` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_twitter` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_facebook` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastConnection` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `user`
--

INSERT INTO `user` (`uid`, `firstName`, `lastName`, `email`, `name`, `password`, `image`, `link_website`, `link_twitter`, `link_facebook`, `lastConnection`, `createdAt`, `updatedAt`) VALUES
(1, 'Quentin', 'Supernant', 'qsupernant@gmail.com', 'QuentinSup', '1b36c7c696cdf7311a3fd6fdbd75f619', 'http://localhost:8080/startupfollow/assets/upload_images/carolelymer.jpg', NULL, '@QuentinSup', NULL, '2017-05-23 09:21:22', '2017-05-18 15:36:46', '2017-05-23 16:51:36');

-- --------------------------------------------------------

--
-- Structure de la table `user_story_like`
--

CREATE TABLE `user_story_like` (
  `uid` bigint(20) UNSIGNED NOT NULL,
  `story_uid` bigint(20) UNSIGNED NOT NULL,
  `user_uid` bigint(20) UNSIGNED NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Contenu de la table `user_story_like`
--

INSERT INTO `user_story_like` (`uid`, `story_uid`, `user_uid`, `createAt`) VALUES
(1, 9, 1, '2017-05-22 15:17:23'),
(2, 8, 1, '2017-05-22 15:27:00'),
(3, 15, 1, '2017-05-23 15:03:26');

--
-- Index pour les tables exportées
--

--
-- Index pour la table `startup`
--
ALTER TABLE `startup`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `name` (`name`) USING BTREE,
  ADD UNIQUE KEY `uri` (`ref`) USING BTREE,
  ADD KEY `email` (`email`);

--
-- Index pour la table `startup_event`
--
ALTER TABLE `startup_event`
  ADD PRIMARY KEY (`uid`),
  ADD KEY `type` (`type`),
  ADD KEY `user_uid` (`user_uid`),
  ADD KEY `startup_uid` (`startup_uid`);

--
-- Index pour la table `startup_follower`
--
ALTER TABLE `startup_follower`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `user_uid` (`user_uid`,`startup_uid`);

--
-- Index pour la table `startup_member`
--
ALTER TABLE `startup_member`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `startup_uid_3` (`startup_uid`),
  ADD UNIQUE KEY `startup_uid_2` (`startup_uid`,`invitation_email`),
  ADD KEY `startup_uid` (`startup_uid`),
  ADD KEY `user_uid` (`user_uid`);

--
-- Index pour la table `startup_request`
--
ALTER TABLE `startup_request`
  ADD PRIMARY KEY (`uid`),
  ADD KEY `name` (`name`);

--
-- Index pour la table `startup_story`
--
ALTER TABLE `startup_story`
  ADD PRIMARY KEY (`uid`),
  ADD KEY `startup_uid` (`startup_uid`),
  ADD KEY `date` (`date`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `user_story_like`
--
ALTER TABLE `user_story_like`
  ADD PRIMARY KEY (`uid`),
  ADD UNIQUE KEY `story_uid_2` (`story_uid`,`user_uid`),
  ADD KEY `story_uid` (`story_uid`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `startup`
--
ALTER TABLE `startup`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT pour la table `startup_event`
--
ALTER TABLE `startup_event`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
--
-- AUTO_INCREMENT pour la table `startup_follower`
--
ALTER TABLE `startup_follower`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
--
-- AUTO_INCREMENT pour la table `startup_member`
--
ALTER TABLE `startup_member`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT pour la table `startup_request`
--
ALTER TABLE `startup_request`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT pour la table `startup_story`
--
ALTER TABLE `startup_story`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT pour la table `user_story_like`
--
ALTER TABLE `user_story_like`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
