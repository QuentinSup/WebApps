-- phpMyAdmin SQL Dump
-- version 4.6.4
-- https://www.phpmyadmin.net/
--
-- Client :  127.0.0.1
-- Généré le :  Mar 16 Mai 2017 à 09:38
-- Version du serveur :  5.7.14
-- Version de PHP :  5.6.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `myapi`
--

-- --------------------------------------------------------

--
-- Structure de la table `api`
--

CREATE TABLE `api` (
  `oid` bigint(20) NOT NULL,
  `id` varchar(32) NOT NULL,
  `contentType` varchar(40) NOT NULL,
  `user` varchar(25) NOT NULL,
  `category` varchar(25) NOT NULL,
  `data` text NOT NULL,
  `app` varchar(25) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `oid` int(11) NOT NULL,
  `name` varchar(25) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Index pour les tables exportées
--

--
-- Index pour la table `api`
--
ALTER TABLE `api`
  ADD PRIMARY KEY (`oid`),
  ADD UNIQUE KEY `id_3` (`id`,`user`,`category`,`app`),
  ADD KEY `id` (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `category` (`category`),
  ADD KEY `app` (`app`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`oid`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD KEY `name` (`name`);

--
-- AUTO_INCREMENT pour les tables exportées
--

--
-- AUTO_INCREMENT pour la table `api`
--
ALTER TABLE `api`
  MODIFY `oid` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;
--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `oid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
