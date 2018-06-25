-- MySQL dump 10.13  Distrib 5.7.12, for Win32 (AMD64)
--
-- Host: localhost    Database: vote
-- ------------------------------------------------------
-- Server version	5.7.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chamber`
--

DROP TABLE IF EXISTS `chamber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chamber` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(150) CHARACTER SET latin1 NOT NULL,
  `date` date NOT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chamber`
--

LOCK TABLES `chamber` WRITE;
/*!40000 ALTER TABLE `chamber` DISABLE KEYS */;
/*!40000 ALTER TABLE `chamber` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chamber_question`
--

DROP TABLE IF EXISTS `chamber_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chamber_question` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `chamber_id` int(10) unsigned NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `label` varchar(500) CHARACTER SET latin1 NOT NULL,
  `timeout` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_chamber_question_chamber_id_idx` (`chamber_id`),
  CONSTRAINT `fk_chamber_question_chamber_id` FOREIGN KEY (`chamber_id`) REFERENCES `chamber` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chamber_question`
--

LOCK TABLES `chamber_question` WRITE;
/*!40000 ALTER TABLE `chamber_question` DISABLE KEYS */;
/*!40000 ALTER TABLE `chamber_question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chamber_question_chain`
--

DROP TABLE IF EXISTS `chamber_question_chain`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chamber_question_chain` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `chamber_question_id` int(10) unsigned NOT NULL,
  `startedAt` datetime DEFAULT NULL,
  `endedAt` datetime DEFAULT NULL,
  `jeton` varchar(32) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chamber_question_id_UNIQUE` (`chamber_question_id`),
  UNIQUE KEY `jeton_UNIQUE` (`jeton`),
  CONSTRAINT `fk_chamber_question_chain_chamber_question_id` FOREIGN KEY (`chamber_question_id`) REFERENCES `chamber_question` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chamber_question_chain`
--

LOCK TABLES `chamber_question_chain` WRITE;
/*!40000 ALTER TABLE `chamber_question_chain` DISABLE KEYS */;
/*!40000 ALTER TABLE `chamber_question_chain` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chamber_question_chain_answer`
--

DROP TABLE IF EXISTS `chamber_question_chain_answer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chamber_question_chain_answer` (
  `chamber_question_chain_id` int(10) unsigned NOT NULL,
  `entity_subscriber_id` int(10) unsigned NOT NULL,
  `jeton` varchar(32) CHARACTER SET latin1 NOT NULL,
  `value` varchar(15) CHARACTER SET latin1 DEFAULT NULL,
  UNIQUE KEY `jeton_UNIQUE` (`jeton`),
  KEY `fk_chamber_question_answer_entity_subscriber_id_idx` (`entity_subscriber_id`),
  KEY `fk_chamber_question_anwer_chamber_question_id_idx` (`chamber_question_chain_id`),
  CONSTRAINT `fk_chamber_question_chain_answer_chamber_question_chain_id` FOREIGN KEY (`chamber_question_chain_id`) REFERENCES `chamber_question_chain` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_chamber_question_chain_answer_entity_subscriber_id` FOREIGN KEY (`entity_subscriber_id`) REFERENCES `entity_subscriber` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chamber_question_chain_answer`
--

LOCK TABLES `chamber_question_chain_answer` WRITE;
/*!40000 ALTER TABLE `chamber_question_chain_answer` DISABLE KEYS */;
/*!40000 ALTER TABLE `chamber_question_chain_answer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chamber_question_response`
--

DROP TABLE IF EXISTS `chamber_question_response`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chamber_question_response` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `chamber_question_id` int(10) unsigned NOT NULL,
  `label` varchar(150) CHARACTER SET latin1 NOT NULL,
  `value` varchar(10) CHARACTER SET latin1 NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_chamber_question_answer_chamber_question_id_idx` (`chamber_question_id`),
  CONSTRAINT `fk_chamber_question_answer_chamber_question_id` FOREIGN KEY (`chamber_question_id`) REFERENCES `chamber_question` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chamber_question_response`
--

LOCK TABLES `chamber_question_response` WRITE;
/*!40000 ALTER TABLE `chamber_question_response` DISABLE KEYS */;
/*!40000 ALTER TABLE `chamber_question_response` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entity`
--

DROP TABLE IF EXISTS `entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `entity` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET latin1 NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `description` text CHARACTER SET latin1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entity`
--

LOCK TABLES `entity` WRITE;
/*!40000 ALTER TABLE `entity` DISABLE KEYS */;
/*!40000 ALTER TABLE `entity` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entity_subscriber`
--

DROP TABLE IF EXISTS `entity_subscriber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `entity_subscriber` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) CHARACTER SET latin1 NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT '0',
  `firstName` varchar(100) CHARACTER SET latin1 NOT NULL,
  `lastName` varchar(100) CHARACTER SET latin1 NOT NULL,
  `society` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `phoneNumber` varchar(15) CHARACTER SET latin1 DEFAULT NULL,
  `email` varchar(150) CHARACTER SET latin1 DEFAULT NULL,
  `countryCode` char(2) CHARACTER SET latin1 DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL,
  `entity_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_entity_subscriber_entity_id_idx` (`entity_id`),
  CONSTRAINT `fk_entity_subscriber_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `entity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entity_subscriber`
--

LOCK TABLES `entity_subscriber` WRITE;
/*!40000 ALTER TABLE `entity_subscriber` DISABLE KEYS */;
/*!40000 ALTER TABLE `entity_subscriber` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) CHARACTER SET latin1 NOT NULL,
  `firstName` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `lastName` varchar(100) CHARACTER SET latin1 DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `email` varchar(150) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'QuentinSup',NULL,NULL,'2018-06-25 16:28:16',NULL,'qsupernant@gmail.com'),(6,'QuentinSup2',NULL,NULL,'2018-06-25 16:31:17',NULL,'qsupernant2@gmail.com'),(7,'QuentinSup3',NULL,NULL,'2018-06-25 16:33:14',NULL,'qsupernant3@gmail.com'),(8,'QuentinSup4',NULL,NULL,'2018-06-25 16:34:05',NULL,'qsupernant4@gmail.com'),(10,'QuentinSup5',NULL,NULL,'2018-06-25 16:41:17',NULL,'qsupernant5@gmail.com'),(11,'QuentinSup6',NULL,NULL,'2018-06-25 16:42:25',NULL,'qsupernant6@gmail.com'),(12,'QuentinSup7',NULL,NULL,'2018-06-25 16:43:23',NULL,'qsupernant7@gmail.com'),(13,'QuentinSup8',NULL,NULL,'2018-06-25 16:50:01',NULL,'qsupernant8@gmail.com'),(14,'QuentinSup9',NULL,NULL,'2018-06-25 16:52:09',NULL,'qsupernant9@gmail.com'),(15,'QuentinSup10',NULL,NULL,'2018-06-25 16:52:34',NULL,'qsupernant10@gmail.com'),(16,'QuentinSup11',NULL,NULL,'2018-06-25 16:53:32',NULL,'qsupernant11@gmail.com'),(19,'QuentinSup12',NULL,NULL,'2018-06-25 16:58:00',NULL,'qsupernant12@gmail.com'),(20,'QuentinSup13',NULL,NULL,'2018-06-25 16:58:33',NULL,'qsupernant13@gmail.com');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_entity`
--

DROP TABLE IF EXISTS `user_entity`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_entity` (
  `user_id` int(10) unsigned NOT NULL,
  `entity_id` int(10) unsigned NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`entity_id`),
  KEY `fk_user_entity_entity_id_idx` (`entity_id`),
  CONSTRAINT `fk_user_entity_entity_id` FOREIGN KEY (`entity_id`) REFERENCES `entity` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_user_entity_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_entity`
--

LOCK TABLES `user_entity` WRITE;
/*!40000 ALTER TABLE `user_entity` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_entity` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-06-25 17:30:21
