-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Client :  127.0.0.1
-- Généré le :  Mer 28 Juin 2017 à 15:48
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
  `lastContactSentAt` datetime DEFAULT NULL,
  `lastStoryCreatedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `link_website` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_twitter` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `link_facebook` varchar(500) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `joined` tinyint(1) NOT NULL DEFAULT '0',
  `joinedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `visibility` tinyint(1) NOT NULL DEFAULT '1',
  `sharedAt` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT pour la table `startup_event`
--
ALTER TABLE `startup_event`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
--
-- AUTO_INCREMENT pour la table `startup_follower`
--
ALTER TABLE `startup_follower`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT pour la table `startup_member`
--
ALTER TABLE `startup_member`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
--
-- AUTO_INCREMENT pour la table `startup_request`
--
ALTER TABLE `startup_request`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT pour la table `startup_story`
--
ALTER TABLE `startup_story`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT pour la table `user_story_like`
--
ALTER TABLE `user_story_like`
  MODIFY `uid` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
