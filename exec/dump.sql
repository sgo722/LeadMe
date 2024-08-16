mysqldump: [Warning] Using a password on the command line interface can be insecure.
-- MySQL dump 10.13  Distrib 9.0.1, for Linux (x86_64)
--
-- Host: localhost    Database: leadme
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `challenge`
--

DROP TABLE IF EXISTS `challenge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenge` (
  `challenge_id` bigint NOT NULL AUTO_INCREMENT,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  `thumbnail_path` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `youtube_id` varchar(255) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `original_fps` int NOT NULL,
  PRIMARY KEY (`challenge_id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challenge`
--

LOCK TABLES `challenge` WRITE;
/*!40000 ALTER TABLE `challenge` DISABLE KEYS */;
INSERT INTO `challenge` VALUES (1,NULL,'2024-08-10 20:33:01.875309',NULL,'2024-08-12 16:41:13.807349','/home/ubuntu/python/video/challenge/thumbnail/qqlNol5nMIk.png','하체운동 하지마세요?이거 하나면 충분합니다 #구구단챌린지','https://www.youtube.com/shorts/qqlNol5nMIk','qqlNol5nMIk','https://i.ytimg.com/vi/qqlNol5nMIk/hqdefault.jpg',30),(2,'6','2024-08-15 18:26:35.039438',NULL,'2024-08-15 18:26:35.039438',NULL,'삐끼삐끼 챌린지','https://www.youtube.com/shorts/kskKDMBdI9E','kskKDMBdI9E','https://i.ytimg.com/vi/kskKDMBdI9E/hqdefault.jpg',30),(7,NULL,'2024-08-10 20:36:26.688108',NULL,'2024-08-12 16:41:13.816349','/home/ubuntu/python/video/challenge/thumbnail/COwRJMCCWL0.png','마라탕후루 사줄 선배 구합니다❤️','https://www.youtube.com/shorts/COwRJMCCWL0','COwRJMCCWL0','https://i.ytimg.com/vi/COwRJMCCWL0/hqdefault.jpg',30),(8,NULL,'2024-08-10 20:37:01.675556',NULL,'2024-08-12 16:41:13.816349','/home/ubuntu/python/video/challenge/thumbnail/Fpmqa_ldQS0.png','킥드베 막차 탑승?','https://www.youtube.com/shorts/Fpmqa_ldQS0','Fpmqa_ldQS0','https://i.ytimg.com/vi/Fpmqa_ldQS0/hqdefault.jpg',30),(9,NULL,'2024-08-10 20:37:08.729725',NULL,'2024-08-12 16:41:13.816349','/home/ubuntu/python/video/challenge/thumbnail/YnxG7YENLWg.png','[아이브 가을] 키가 자란 가을선배...? (feat. 새삥)','https://www.youtube.com/shorts/YnxG7YENLWg','YnxG7YENLWg','https://i.ytimg.com/vi/YnxG7YENLWg/hqdefault.jpg',30),(10,NULL,'2024-08-10 20:37:29.806795',NULL,'2024-08-12 16:41:13.816349','/home/ubuntu/python/video/challenge/thumbnail/-Z2TrmiOORg.png','Hip hop dance basic teaching','https://www.youtube.com/shorts/-Z2TrmiOORg','-Z2TrmiOORg','https://i.ytimg.com/vi/-Z2TrmiOORg/hqdefault.jpg',30),(11,NULL,'2024-08-10 20:37:39.992354',NULL,'2024-08-12 16:41:13.817349','/home/ubuntu/python/video/challenge/thumbnail/hDDOuyTmSR4.png','리정 제니 solo 리믹스 댄스브레이크 안무','https://www.youtube.com/shorts/hDDOuyTmSR4','hDDOuyTmSR4','https://i.ytimg.com/vi/hDDOuyTmSR4/hqdefault.jpg',30),(12,NULL,'2024-08-10 20:37:53.956855',NULL,'2024-08-12 16:41:13.817349','/home/ubuntu/python/video/challenge/thumbnail/xGTnut1nKBM.png','포철고 챌린지 짱먹으러 왔수다','https://www.youtube.com/shorts/xGTnut1nKBM','xGTnut1nKBM','https://i.ytimg.com/vi/xGTnut1nKBM/hqdefault.jpg',30),(13,NULL,'2024-08-16 09:09:13.376244',NULL,'2024-08-16 09:09:13.376244',NULL,'뉴진스 하니 챌린지','https://www.youtube.com/shorts/CwNuyCifsos','CwNuyCifsos','https://i.ytimg.com/vi/CwNuyCifsos/hqdefault.jpg',30),(14,NULL,'2024-08-10 20:38:24.400196',NULL,'2024-08-12 16:41:13.817349','/home/ubuntu/python/video/challenge/thumbnail/3Vav_mvFceU.png','[리정 LEEJUNG] 핑크베놈 댄스 브레이크 choreo by LEEJUNG LEE','https://www.youtube.com/shorts/3Vav_mvFceU','3Vav_mvFceU','https://i.ytimg.com/vi/3Vav_mvFceU/hqdefault.jpg',30),(15,NULL,'2024-08-10 20:39:04.452967',NULL,'2024-08-12 16:41:13.817349','/home/ubuntu/python/video/challenge/thumbnail/lMJrKWj16oY.png','인스타 릴스 300만 찍은 RockStar 챌린지','https://www.youtube.com/shorts/lMJrKWj16oY','lMJrKWj16oY','https://i.ytimg.com/vi/lMJrKWj16oY/hqdefault.jpg',30),(16,NULL,'2024-08-10 20:39:08.624432',NULL,'2024-08-12 16:41:13.817349','/home/ubuntu/python/video/challenge/thumbnail/Y1cRXSGrqxk.png','한림예고 체육대회는 깐병?','https://www.youtube.com/shorts/Y1cRXSGrqxk','Y1cRXSGrqxk','https://i.ytimg.com/vi/Y1cRXSGrqxk/hqdefault.jpg',30),(17,NULL,'2024-08-10 20:39:55.102933',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/74f587PwZlI.png','classic reappearance','https://www.youtube.com/shorts/74f587PwZlI','74f587PwZlI','https://i.ytimg.com/vi/74f587PwZlI/hqdefault.jpg',30),(18,NULL,'2024-08-10 20:39:59.675199',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/7n1kJvwXqt8.png','또 레전드 찍은 NCT 지성 블루체크 챌린지','https://www.youtube.com/shorts/7n1kJvwXqt8','7n1kJvwXqt8','https://i.ytimg.com/vi/7n1kJvwXqt8/hqdefault.jpg',30),(19,NULL,'2024-08-10 20:40:36.683333',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/NmmuRSlTVfc.png','return of the king！！/Alexander A','https://www.youtube.com/shorts/NmmuRSlTVfc','NmmuRSlTVfc','https://i.ytimg.com/vi/NmmuRSlTVfc/hqdefault.jpg',30),(20,NULL,'2024-08-10 20:40:42.166235',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/5rHxqoJZG60.png','아이키 smoke 챌린지 (우동먹다가)','https://www.youtube.com/shorts/5rHxqoJZG60','5rHxqoJZG60','https://i.ytimg.com/vi/5rHxqoJZG60/hqdefault.jpg',30),(21,NULL,'2024-08-10 20:41:11.202625',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/DAsoD9eQ03g.png','나이트댄서 춤 락킹댄스 버전 ? | 가사,발음,해석포함','https://www.youtube.com/shorts/DAsoD9eQ03g','DAsoD9eQ03g','https://i.ytimg.com/vi/DAsoD9eQ03g/hqdefault.jpg',30),(22,NULL,'2024-08-16 09:22:27.380239',NULL,'2024-08-16 09:22:27.380239',NULL,'아이브 Baddie 챌린지','https://www.youtube.com/shorts/EueWx2mi5PY','EueWx2mi5PY','https://i.ytimg.com/vi/EueWx2mi5PY/hqdefault.jpg',30),(23,NULL,'2024-08-10 20:41:24.829329',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/EPNouYo8bh0.png','10초 락킹댄스','https://www.youtube.com/shorts/EPNouYo8bh0','EPNouYo8bh0','https://i.ytimg.com/vi/EPNouYo8bh0/hqdefault.jpg',30),(24,NULL,'2024-08-10 20:41:55.241520',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/69JObcw_lS4.png','30초 로봇춤','https://www.youtube.com/shorts/69JObcw_lS4','69JObcw_lS4','https://i.ytimg.com/vi/69JObcw_lS4/hqdefault.jpg',30),(25,NULL,'2024-08-10 20:42:42.231751',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/TcnHT-Msia0.png','roar like me','https://www.youtube.com/shorts/TcnHT-Msia0','TcnHT-Msia0','https://i.ytimg.com/vi/TcnHT-Msia0/hqdefault.jpg',30),(26,NULL,'2024-08-10 20:42:44.896179',NULL,'2024-08-12 16:41:13.818348','/home/ubuntu/python/video/challenge/thumbnail/y7mmUrlYCOM.png','Newjeans가 말아주는 newjackswing?','https://www.youtube.com/shorts/y7mmUrlYCOM','y7mmUrlYCOM','https://i.ytimg.com/vi/y7mmUrlYCOM/hqdefault.jpg',30),(27,NULL,'2024-08-10 20:43:22.022143',NULL,'2024-08-12 16:41:13.819348','/home/ubuntu/python/video/challenge/thumbnail/uaOI__Rrmj0.png','The macho man is coming','https://www.youtube.com/shorts/uaOI__Rrmj0','uaOI__Rrmj0','https://i.ytimg.com/vi/uaOI__Rrmj0/hqdefault.jpg',30),(28,NULL,'2024-08-10 20:44:03.257793',NULL,'2024-08-12 16:41:13.819348','/home/ubuntu/python/video/challenge/thumbnail/LdrXAOVZoTw.png','에스파 슈퍼노바 안무 이거보고 외워❗️aespa - Supernova Dancebreak cover Mirrored ×0.75 (에스파 슈퍼노바 안무 거울모드)','https://www.youtube.com/shorts/LdrXAOVZoTw','LdrXAOVZoTw','https://i.ytimg.com/vi/LdrXAOVZoTw/hqdefault.jpg',30),(32,NULL,'2024-08-10 20:33:46.517825',NULL,'2024-08-12 16:41:13.816349','/home/ubuntu/python/video/challenge/thumbnail/yoeduVglPUQ.png','태권롤라 챌린쥐','https://www.youtube.com/shorts/yoeduVglPUQ','yoeduVglPUQ','https://i.ytimg.com/vi/yoeduVglPUQ/hqdefault.jpg',30),(33,NULL,'2024-08-16 09:18:53.712049',NULL,'2024-08-16 09:18:53.712049',NULL,'BLUE CHECK 챌린지','https://www.youtube.com/shorts/axCSAd6NWAc','axCSAd6NWAc','https://i.ytimg.com/vi/axCSAd6NWAc/hqdefault.jpg',30),(34,NULL,'2024-08-10 20:35:29.876545',NULL,'2024-08-12 16:41:13.816349','/home/ubuntu/python/video/challenge/thumbnail/BWR4jwe0DiM.png','새삥','https://www.youtube.com/shorts/BWR4jwe0DiM','BWR4jwe0DiM','https://i.ytimg.com/vi/BWR4jwe0DiM/hqdefault.jpg',30),(35,NULL,'2024-08-10 20:35:42.847493',NULL,'2024-08-12 16:41:13.816349','/home/ubuntu/python/video/challenge/thumbnail/wTWtNcrIkt0.png','구구단 외우는법!','https://www.youtube.com/shorts/wTWtNcrIkt0','wTWtNcrIkt0','https://i.ytimg.com/vi/wTWtNcrIkt0/hqdefault.jpg',30);
/*!40000 ALTER TABLE `challenge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `challenge_hash_tag`
--

DROP TABLE IF EXISTS `challenge_hash_tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `challenge_hash_tag` (
  `challenge_hashtag_id` bigint NOT NULL AUTO_INCREMENT,
  `challenge_id` bigint DEFAULT NULL,
  `hashtag_id` bigint DEFAULT NULL,
  PRIMARY KEY (`challenge_hashtag_id`),
  KEY `FK1f35bonngukb6ylqlcyq9ae18` (`challenge_id`),
  KEY `FK7mkrkr8sfk0ljukjgkypbjxf0` (`hashtag_id`),
  CONSTRAINT `FK1f35bonngukb6ylqlcyq9ae18` FOREIGN KEY (`challenge_id`) REFERENCES `challenge` (`challenge_id`),
  CONSTRAINT `FK7mkrkr8sfk0ljukjgkypbjxf0` FOREIGN KEY (`hashtag_id`) REFERENCES `hashtag` (`hashtag_id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `challenge_hash_tag`
--

LOCK TABLES `challenge_hash_tag` WRITE;
/*!40000 ALTER TABLE `challenge_hash_tag` DISABLE KEYS */;
INSERT INTO `challenge_hash_tag` VALUES (1,1,1),(2,32,2),(3,32,3),(4,32,4),(5,32,5),(6,32,6),(7,32,7),(8,32,8),(9,32,9),(16,7,15),(17,7,16),(18,8,17),(19,8,18),(20,8,19),(21,8,15),(22,8,20),(23,8,21),(24,8,1),(25,8,9),(26,12,22),(27,14,23),(28,14,24),(29,14,25),(30,16,26),(31,16,27),(32,16,28),(33,20,29),(34,20,30),(35,20,31),(36,23,32),(37,23,33),(38,26,34),(39,26,35),(40,26,36),(41,28,37),(42,28,38),(43,28,39),(48,34,43),(49,2,1),(50,2,12),(51,2,14),(52,34,1),(53,10,1),(54,11,1),(55,12,1),(57,14,1),(58,15,1),(59,16,1),(60,17,1),(61,9,1),(62,9,16),(63,18,16),(64,18,1),(65,19,1),(66,19,21),(67,19,9),(68,21,21),(69,21,16),(72,24,21),(73,24,16),(74,25,1),(75,25,21),(76,27,1),(77,27,16),(78,27,1),(80,35,1),(81,35,16),(82,13,48),(83,13,1),(84,33,49),(85,22,51);
/*!40000 ALTER TABLE `challenge_hash_tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_room`
--

DROP TABLE IF EXISTS `chat_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_room` (
  `chat_room_id` bigint NOT NULL AUTO_INCREMENT,
  `partner_leave_time` datetime(6) DEFAULT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `user_leave_time` datetime(6) DEFAULT NULL,
  `partner_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`chat_room_id`),
  KEY `fk_chatroom_partner` (`partner_id`),
  KEY `fk_chatroom_user` (`user_id`),
  CONSTRAINT `fk_chatroom_partner` FOREIGN KEY (`partner_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_chatroom_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_room`
--

LOCK TABLES `chat_room` WRITE;
/*!40000 ALTER TABLE `chat_room` DISABLE KEYS */;
INSERT INTO `chat_room` VALUES (1,NULL,'1-1',NULL,1,1),(2,NULL,'1-4',NULL,4,1),(3,NULL,'4-2',NULL,2,4),(4,NULL,'5-2',NULL,2,5),(5,NULL,'4-4',NULL,4,4),(6,NULL,'11-1',NULL,1,11),(7,NULL,'1-6',NULL,6,1),(8,NULL,'21-7',NULL,7,21),(9,NULL,'6-21',NULL,21,6),(10,NULL,'28-11',NULL,11,28),(11,NULL,'29-1',NULL,1,29),(12,NULL,'29-11',NULL,11,29),(13,NULL,'1-12',NULL,12,1),(14,NULL,'11-12',NULL,12,11),(15,NULL,'23-4',NULL,4,23),(16,NULL,'23-12',NULL,12,23),(17,NULL,'12-7',NULL,7,12),(18,NULL,'4-7',NULL,7,4),(19,NULL,'6-4',NULL,4,6),(20,NULL,'15-4',NULL,4,15),(21,NULL,'7-6',NULL,6,7),(22,NULL,'5-1',NULL,1,5),(23,NULL,'32-12',NULL,12,32),(24,NULL,'11-5',NULL,5,11),(25,NULL,'7-14',NULL,14,7),(26,NULL,'7-11',NULL,11,7),(27,NULL,'4-11',NULL,11,4);
/*!40000 ALTER TABLE `chat_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `comment_id` bigint NOT NULL AUTO_INCREMENT,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  `content` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT NULL,
  `users_id` bigint DEFAULT NULL,
  `user_challenge_id` bigint DEFAULT NULL,
  PRIMARY KEY (`comment_id`),
  KEY `FKmea7pyuw3c1i7w8y0wljw1sy7` (`users_id`),
  KEY `FKdepgdo6e5kxoj9u6rtbmmini5` (`user_challenge_id`),
  CONSTRAINT `FKdepgdo6e5kxoj9u6rtbmmini5` FOREIGN KEY (`user_challenge_id`) REFERENCES `user_challenge` (`user_challenge_id`),
  CONSTRAINT `FKmea7pyuw3c1i7w8y0wljw1sy7` FOREIGN KEY (`users_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment_like`
--

DROP TABLE IF EXISTS `comment_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_like` (
  `comment_like_id` bigint NOT NULL AUTO_INCREMENT,
  `comment_id` bigint DEFAULT NULL,
  `users_id` bigint DEFAULT NULL,
  PRIMARY KEY (`comment_like_id`),
  KEY `FKqlv8phl1ibeh0efv4dbn3720p` (`comment_id`),
  KEY `FKcm3v3g5n230g8dorw2copi95s` (`users_id`),
  CONSTRAINT `FKcm3v3g5n230g8dorw2copi95s` FOREIGN KEY (`users_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKqlv8phl1ibeh0efv4dbn3720p` FOREIGN KEY (`comment_id`) REFERENCES `comment` (`comment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_like`
--

LOCK TABLES `comment_like` WRITE;
/*!40000 ALTER TABLE `comment_like` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `competition`
--

DROP TABLE IF EXISTS `competition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition` (
  `competition_id` bigint NOT NULL AUTO_INCREMENT,
  `created_date` datetime(6) DEFAULT NULL,
  `is_public` bit(1) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `room_name` varchar(255) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `status` enum('CLOSED','OPEN') DEFAULT NULL,
  `create_user_id` bigint DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`competition_id`),
  KEY `FKiegard3gwen7foffp5b25x92j` (`create_user_id`),
  CONSTRAINT `FKiegard3gwen7foffp5b25x92j` FOREIGN KEY (`create_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `competition`
--

LOCK TABLES `competition` WRITE;
/*!40000 ALTER TABLE `competition` DISABLE KEYS */;
INSERT INTO `competition` VALUES (62,'2024-08-16 18:09:16.845763',_binary '\0','6e686f3131','들어오지 마','ses_VLvMzqfPnQ','CLOSED',6,NULL,NULL,'2024-08-16 09:16:39.863469'),(63,'2024-08-16 18:09:35.013581',_binary '','','이건 들어와','ses_XQk5bq9ZEN','CLOSED',7,NULL,NULL,'2024-08-16 09:16:59.853995');
/*!40000 ALTER TABLE `competition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follow`
--

DROP TABLE IF EXISTS `follow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follow` (
  `follow_id` bigint NOT NULL AUTO_INCREMENT,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  `from_users_id` bigint DEFAULT NULL,
  `to_users_id` bigint DEFAULT NULL,
  PRIMARY KEY (`follow_id`),
  KEY `fk_follow_from_user` (`from_users_id`),
  KEY `fk_follow_to_user` (`to_users_id`),
  CONSTRAINT `fk_follow_from_user` FOREIGN KEY (`from_users_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_follow_to_user` FOREIGN KEY (`to_users_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follow`
--

LOCK TABLES `follow` WRITE;
/*!40000 ALTER TABLE `follow` DISABLE KEYS */;
INSERT INTO `follow` VALUES (2,NULL,'2024-08-12 11:00:21.420032',NULL,'2024-08-12 11:00:21.420032',1,2),(4,NULL,'2024-08-12 11:56:02.053191',NULL,'2024-08-12 11:56:02.053191',1,5),(5,NULL,'2024-08-13 20:27:14.833134',NULL,'2024-08-13 20:27:14.833134',22,17),(6,NULL,'2024-08-13 20:27:21.614565',NULL,'2024-08-13 20:27:21.614565',22,2),(9,NULL,'2024-08-13 20:44:18.983001',NULL,'2024-08-13 20:44:18.983001',6,22),(12,NULL,'2024-08-14 13:29:03.639993',NULL,'2024-08-14 13:29:03.639993',29,1),(13,NULL,'2024-08-14 13:29:53.543768',NULL,'2024-08-14 13:29:53.543768',29,11),(14,NULL,'2024-08-15 12:38:31.244556',NULL,'2024-08-15 12:38:31.244556',6,37),(15,NULL,'2024-08-15 16:31:39.974500',NULL,'2024-08-15 16:31:39.974500',23,4),(16,NULL,'2024-08-15 16:35:09.740511',NULL,'2024-08-15 16:35:09.740511',23,12),(17,NULL,'2024-08-15 19:24:44.086084',NULL,'2024-08-15 19:24:44.086084',7,6),(18,NULL,'2024-08-15 22:19:58.256809',NULL,'2024-08-15 22:19:58.256809',5,2),(19,NULL,'2024-08-15 22:20:04.112475',NULL,'2024-08-15 22:20:04.112475',5,1),(20,NULL,'2024-08-15 22:20:11.636771',NULL,'2024-08-15 22:20:11.636771',5,7),(21,NULL,'2024-08-15 22:20:14.156532',NULL,'2024-08-15 22:20:14.156532',5,10),(22,NULL,'2024-08-15 22:20:16.438056',NULL,'2024-08-15 22:20:16.438056',5,6),(23,NULL,'2024-08-15 22:20:19.550540',NULL,'2024-08-15 22:20:19.550540',5,12),(24,NULL,'2024-08-15 22:20:21.962037',NULL,'2024-08-15 22:20:21.962037',5,4),(26,NULL,'2024-08-16 03:15:28.319986',NULL,'2024-08-16 03:15:28.319986',6,1),(27,NULL,'2024-08-16 03:15:31.093495',NULL,'2024-08-16 03:15:31.093495',6,5),(28,NULL,'2024-08-16 03:15:37.937227',NULL,'2024-08-16 03:15:37.937227',6,2),(29,NULL,'2024-08-16 08:51:01.792373',NULL,'2024-08-16 08:51:01.792373',7,1),(30,NULL,'2024-08-16 08:51:04.252170',NULL,'2024-08-16 08:51:04.252170',7,5),(31,NULL,'2024-08-16 08:51:10.384846',NULL,'2024-08-16 08:51:10.384846',7,2);
/*!40000 ALTER TABLE `follow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hashtag`
--

DROP TABLE IF EXISTS `hashtag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hashtag` (
  `hashtag_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`hashtag_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hashtag`
--

LOCK TABLES `hashtag` WRITE;
/*!40000 ALTER TABLE `hashtag` DISABLE KEYS */;
INSERT INTO `hashtag` VALUES (1,'#춤'),(2,'#쥐롤'),(3,'#킹키부츠'),(4,'#롤라'),(5,'#이호광'),(6,'#뮤지컬스타'),(7,'#빵송국'),(8,'#짱호'),(9,'#챌린지'),(10,'#백프로'),(11,'#backpro'),(12,'#삐끼삐끼'),(13,'#삐끼삐끼아웃송'),(14,'#댄스챌린지'),(15,'#dance'),(16,'#short'),(17,'#킥드럼베이스'),(18,'#kickdrum'),(19,'#chellenge'),(20,'#trending'),(21,'#댄스'),(22,'#포철고챌린지'),(23,'#리정'),(24,'#PIINKVENO'),(25,'#BLACKPINK'),(26,'#한림예고'),(27,'#깐병'),(28,'#체육대회'),(29,'#스모크챌린지'),(30,'#스우파2'),(31,'#smokechallenge'),(32,'#locking'),(33,'#락킹'),(34,'#newjeans'),(35,'#supernatural'),(36,'#challenge'),(37,'#aespa'),(38,'#애스파'),(39,'#에스파'),(40,'#카리나'),(41,'#윈터'),(42,'#아이키'),(43,'#새삥'),(48,'#하니'),(49,'#blue check'),(50,'#Baddie'),(51,'#Baddie');
/*!40000 ALTER TABLE `hashtag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rank`
--

DROP TABLE IF EXISTS `rank`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rank` (
  `rank_id` bigint NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`rank_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rank`
--

LOCK TABLES `rank` WRITE;
/*!40000 ALTER TABLE `rank` DISABLE KEYS */;
/*!40000 ALTER TABLE `rank` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_token`
--

DROP TABLE IF EXISTS `refresh_token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_token` (
  `refresh_token_id` bigint NOT NULL AUTO_INCREMENT,
  `refresh_token` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`refresh_token_id`),
  UNIQUE KEY `UKf95ixxe7pa48ryn1awmh2evt7` (`user_id`),
  CONSTRAINT `FKjtx87i0jvq2svedphegvdwcuy` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_token`
--

LOCK TABLES `refresh_token` WRITE;
/*!40000 ALTER TABLE `refresh_token` DISABLE KEYS */;
/*!40000 ALTER TABLE `refresh_token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_challenge`
--

DROP TABLE IF EXISTS `user_challenge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_challenge` (
  `user_challenge_id` bigint NOT NULL AUTO_INCREMENT,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  `access` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `likes` int DEFAULT NULL,
  `thumbnail_path` varchar(255) DEFAULT NULL,
  `uuid` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `challenge_id` bigint DEFAULT NULL,
  `users_id` bigint DEFAULT NULL,
  PRIMARY KEY (`user_challenge_id`),
  KEY `FKhda3k82arbp1u2vi0puav0qxs` (`challenge_id`),
  KEY `FKrdq8ab1sxrusup4r4s206emoh` (`users_id`),
  CONSTRAINT `FKhda3k82arbp1u2vi0puav0qxs` FOREIGN KEY (`challenge_id`) REFERENCES `challenge` (`challenge_id`),
  CONSTRAINT `FKrdq8ab1sxrusup4r4s206emoh` FOREIGN KEY (`users_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_challenge`
--

LOCK TABLES `user_challenge` WRITE;
/*!40000 ALTER TABLE `user_challenge` DISABLE KEYS */;
INSERT INTO `user_challenge` VALUES (39,NULL,'2024-08-14 16:47:06.721453',NULL,'2024-08-14 16:47:06.721453','public','리드미 처음 올린날',0,'/home/ubuntu/python/video/temporary/thumbnail/89739959-ac06-4d42-94f4-b8d55193d6db.png','89739959-ac06-4d42-94f4-b8d55193d6db','/home/ubuntu/python/video/user/파이썬으로 이관 후 썸네일 테스트_16:48.mp4',23,5),(40,NULL,'2024-08-14 17:35:12.214947',NULL,'2024-08-15 23:44:30.074051','public','춤 연습',0,'/home/ubuntu/python/video/temporary/thumbnail/a451a721-8511-49c6-a181-bf7680541b99.png','a451a721-8511-49c6-a181-bf7680541b99','/home/ubuntu/python/video/user/춤 연습.mp4',23,1),(47,NULL,'2024-08-15 16:30:34.493338',NULL,'2024-08-15 16:30:44.821864','public','서정빈코치 테스트',1,'/home/ubuntu/python/video/temporary/thumbnail/5e4b74b0-5dbc-4094-865f-7d415e400948.png','5e4b74b0-5dbc-4094-865f-7d415e400948','/home/ubuntu/python/video/user/서정빈코치 테스트.mp4',23,23),(48,NULL,'2024-08-15 16:44:13.642726',NULL,'2024-08-16 00:42:17.860533','public','나 서정빈인데 내 춤 멋지지',1,'/home/ubuntu/python/video/temporary/thumbnail/0be30f39-5ea6-4be9-86fc-9ac06ac92a12.png','0be30f39-5ea6-4be9-86fc-9ac06ac92a12','/home/ubuntu/python/video/user/나 서정빈인데 내 춤 멋지지.mp4',23,23),(49,NULL,'2024-08-15 16:49:48.657756',NULL,'2024-08-15 23:44:17.290071','public','엔젤에서 플젝 마무리 중',0,'/home/ubuntu/python/video/temporary/thumbnail/ecf7b2c4-bfa2-4955-919d-ceedc15555bc.png','ecf7b2c4-bfa2-4955-919d-ceedc15555bc','/home/ubuntu/python/video/user/엔젤에서 플젝 마무리 중.mp4',1,6),(50,NULL,'2024-08-15 17:12:33.700469',NULL,'2024-08-16 00:42:12.870583','public','춤 연습',3,'/home/ubuntu/python/video/temporary/thumbnail/4fc8d6ab-3cfc-4170-a07d-8fc4b436706b.png','4fc8d6ab-3cfc-4170-a07d-8fc4b436706b','/home/ubuntu/python/video/user/test.mp4',1,1),(52,NULL,'2024-08-15 21:15:44.800637',NULL,'2024-08-16 00:42:11.617978','public','앉아서 댄스',5,'/home/ubuntu/python/video/temporary/thumbnail/999d9e27-9494-4679-9444-5bdb8fd2136c.png','999d9e27-9494-4679-9444-5bdb8fd2136c','/home/ubuntu/python/video/user/09시15분 시연.mp4',32,5),(53,NULL,'2024-08-15 21:33:55.821836',NULL,'2024-08-15 21:33:55.821836','public','쥐롤라 맹연습',0,'/home/ubuntu/python/video/temporary/thumbnail/ef6f3ffb-5ad6-42f4-9a05-c178f875106e.png','ef6f3ffb-5ad6-42f4-9a05-c178f875106e','/home/ubuntu/python/video/user/시연 테스트.mp4',32,5),(54,NULL,'2024-08-15 21:50:21.604857',NULL,'2024-08-16 00:42:09.906390','public','정끼빈끼',5,'/home/ubuntu/python/video/temporary/thumbnail/fe296831-4a02-4ccd-9639-c12fe397feb1.png','fe296831-4a02-4ccd-9639-c12fe397feb1','/home/ubuntu/python/video/user/정끼빈끼.mp4',2,1),(55,NULL,'2024-08-15 22:51:53.064071',NULL,'2024-08-16 00:42:06.984867','public','실력 느는것 같은데?',6,'/home/ubuntu/python/video/temporary/thumbnail/dd410862-c7b8-4370-acf8-7bdfe0fdb494.png','dd410862-c7b8-4370-acf8-7bdfe0fdb494','/home/ubuntu/python/video/user/나 좀 잘추는듯?.mp4',32,5),(57,NULL,'2024-08-16 00:10:36.061175',NULL,'2024-08-16 01:57:47.244607','public','삐끼삐끼 71점 ㅎㅎ ',3,'/home/ubuntu/python/video/temporary/thumbnail/699fe5cf-8fcd-427f-9074-2142f1f90cdf.png','699fe5cf-8fcd-427f-9074-2142f1f90cdf','/home/ubuntu/python/video/user/삐끼삐끼 71점 ㅎㅎ .mp4',2,11),(58,NULL,'2024-08-16 00:29:45.516998',NULL,'2024-08-16 00:42:03.380516','public','지인한테 추천해봄 ㅎ',3,'/home/ubuntu/python/video/temporary/thumbnail/1b4ca56e-1dbf-43ba-99e8-7640207fda56.png','1b4ca56e-1dbf-43ba-99e8-7640207fda56','/home/ubuntu/python/video/user/나 좀 잘추는듯? ㅋㅋ.mp4',32,5),(60,NULL,'2024-08-16 02:05:41.543351',NULL,'2024-08-16 02:05:41.543351','public','진우삐끼',0,'/home/ubuntu/python/video/temporary/thumbnail/a0a8aeb4-ffe8-4c4c-85aa-21c702735ad5.png','a0a8aeb4-ffe8-4c4c-85aa-21c702735ad5','/home/ubuntu/python/video/user/진우삐끼.mp4',2,2),(61,NULL,'2024-08-16 02:11:14.480047',NULL,'2024-08-16 02:11:14.480047','public','진로라',0,'/home/ubuntu/python/video/temporary/thumbnail/01e34ea9-9b40-47cf-96fd-2e99c3431bf5.png','01e34ea9-9b40-47cf-96fd-2e99c3431bf5','/home/ubuntu/python/video/user/진로라.mp4',32,2),(62,NULL,'2024-08-16 02:12:31.342944',NULL,'2024-08-16 03:32:12.058353','public','성롤라',1,'/home/ubuntu/python/video/temporary/thumbnail/49280b03-cda3-423b-90f6-a4efbc595ea1.png','49280b03-cda3-423b-90f6-a4efbc595ea1','/home/ubuntu/python/video/user/성롤라.mp4',32,2),(63,NULL,'2024-08-16 02:22:35.499258',NULL,'2024-08-16 02:22:35.499258','public','챌린지 도전!',0,'/home/ubuntu/python/video/temporary/thumbnail/6aa0d98c-6063-4fb3-becf-9c507da5ccbb.png','6aa0d98c-6063-4fb3-becf-9c507da5ccbb','/home/ubuntu/python/video/user/챌린지 도전!.mp4',15,11),(65,NULL,'2024-08-16 03:41:31.854493',NULL,'2024-08-16 07:23:33.234323','public','76점!',1,'/home/ubuntu/python/video/temporary/thumbnail/504ea127-c85c-4e5d-9b35-997d6456981d.png','504ea127-c85c-4e5d-9b35-997d6456981d','/home/ubuntu/python/video/user/76점!.mp4',2,4);
/*!40000 ALTER TABLE `user_challenge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_challenge_like`
--

DROP TABLE IF EXISTS `user_challenge_like`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_challenge_like` (
  `user_challenge_like_id` bigint NOT NULL AUTO_INCREMENT,
  `is_like` bit(1) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `user_challenge_id` bigint DEFAULT NULL,
  PRIMARY KEY (`user_challenge_like_id`),
  KEY `fk_user_challenge_like_user` (`user_id`),
  KEY `fk_user_challenge_like_user_challenge` (`user_challenge_id`),
  CONSTRAINT `fk_user_challenge_like_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_user_challenge_like_user_challenge` FOREIGN KEY (`user_challenge_id`) REFERENCES `user_challenge` (`user_challenge_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_challenge_like`
--

LOCK TABLES `user_challenge_like` WRITE;
/*!40000 ALTER TABLE `user_challenge_like` DISABLE KEYS */;
INSERT INTO `user_challenge_like` VALUES (1,_binary '\0',6,48),(2,_binary '',11,55),(3,_binary '\0',11,52),(4,_binary '\0',5,57),(5,_binary '\0',5,55),(6,_binary '\0',5,54),(7,_binary '\0',7,58),(8,_binary '',6,58),(9,_binary '\0',6,57),(10,_binary '',6,55),(11,_binary '\0',6,54),(12,_binary '\0',6,52),(13,_binary '\0',6,50),(14,_binary '\0',4,57),(15,_binary '\0',6,62),(16,_binary '\0',2,65);
/*!40000 ALTER TABLE `user_challenge_like` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `created_by` varchar(255) DEFAULT NULL,
  `created_date` datetime(6) DEFAULT NULL,
  `last_modified_by` varchar(255) DEFAULT NULL,
  `last_modified_date` datetime(6) DEFAULT NULL,
  `age` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `login_date_time` datetime(6) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_comment` varchar(255) DEFAULT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `role_type` enum('ADMIN','USER') DEFAULT NULL,
  `user_like_cnt` bigint DEFAULT NULL,
  `user_status` enum('ACTIVE','DELETED','INACTIVE') DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UK2ty1xmrrgtn89xt7kyxx6ta7h` (`nickname`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'2024-08-10 20:24:18.642520',NULL,'2024-08-14 16:19:50.379980',NULL,'nbo5548@naver.com',NULL,NULL,'보우','코코',NULL,'','http://k.kakaocdn.net/dn/bAJRpa/btsGjM1qi1U/8446diBV8myModZagKNdl1/img_640x640.jpg','USER',41,'ACTIVE'),(2,NULL,'2024-08-10 20:24:59.427361',NULL,'2024-08-12 15:33:39.218505',NULL,'dlawnsdlekd@naver.com',NULL,NULL,'임준희','준희짱',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',4,'ACTIVE'),(4,NULL,'2024-08-10 20:25:37.634927',NULL,'2024-08-10 20:25:37.634927',NULL,'zvzv9808@gmail.com',NULL,NULL,'박진우','남보우사생팬',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocKvs0JGrrxO40R4mUFXIKZFBmss_vLrCPgLpbQ_szwBQ6uZSHGJ=s96-c','USER',16,'ACTIVE'),(5,NULL,'2024-08-10 22:00:37.727948',NULL,'2024-08-13 11:29:29.629767',NULL,'sgo722@naver.com',NULL,NULL,'양준영','준영2',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',51,'ACTIVE'),(6,NULL,'2024-08-11 14:28:32.183812',NULL,'2024-08-15 12:38:08.561271',NULL,'yhy5049@naver.com',NULL,NULL,'윤하연','yunhayeon',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',25,'ACTIVE'),(7,NULL,'2024-08-11 17:36:22.377524',NULL,'2024-08-15 19:24:24.771572',NULL,'yhy5049@gmail.com',NULL,NULL,'윤하연','윤하연',NULL,'','https://lh3.googleusercontent.com/a/ACg8ocKjRdXUWN1aOTj1YAED3WL9A3xpbX87W-FoDzAvqh3Kq531Fw=s96-c','USER',23,'ACTIVE'),(10,NULL,'2024-08-11 22:19:14.294617',NULL,'2024-08-11 22:19:14.294617',NULL,'wefhio1985@gmail.com',NULL,NULL,'zze zze','0ed0ef3c22',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocIPdAZjWuWgA6QswlbCJjAG7HZllQBLl-YbvZpMLf1wySmOOQ=s96-c','USER',14,'ACTIVE'),(11,NULL,'2024-08-11 22:46:32.638967',NULL,'2024-08-16 00:11:38.808442',NULL,'ajsjdlwj0123@naver.com',NULL,NULL,'박준엽','춤신춤왕ㅋ',NULL,'덤벼','http://k.kakaocdn.net/dn/bSBSx2/btsGks17ptB/Aqx3R4Ofj7DslSsgH5DFI0/img_640x640.jpg','USER',25,'ACTIVE'),(12,NULL,'2024-08-12 11:45:48.073437',NULL,'2024-08-12 11:45:48.073437',NULL,'ssafy.coach003@gmail.com',NULL,NULL,'ssafy','7232beec24',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocIC2lMIcijnjpaj9ZlEroP1x92F_pM49f9KT2D97ot43avmfw=s96-c','USER',0,'ACTIVE'),(14,NULL,'2024-08-12 22:31:47.259536',NULL,'2024-08-12 22:31:47.259536',NULL,'bowoonam8@gmail.com',NULL,NULL,'Bowoo Nam','e303e0b901',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocJxamTm6mWV0b25_u4zzJ7i1YLFyuNg8yXPLxAKU37-j5-Udw=s96-c','USER',5,'ACTIVE'),(15,NULL,'2024-08-13 00:39:48.778031',NULL,'2024-08-13 00:39:48.778031',NULL,'zvzv9808@naver.com',NULL,NULL,'박진우','임준희대리기사',NULL,NULL,'http://k.kakaocdn.net/dn/bPWfqa/btr3Xz0nXJK/IbPqKiu04ctKTGhGJ02ix0/img_640x640.jpg','USER',0,'ACTIVE'),(17,NULL,'2024-08-13 11:07:37.699709',NULL,'2024-08-13 11:07:58.624032',NULL,'limjunhee4575@gmail.com',NULL,NULL,'임준희','준희',NULL,'','https://lh3.googleusercontent.com/a/ACg8ocL9vSroEP_NxjgPkSkPGppBrXOabIMXjX41dRAr7TyiQBOAXjI=s96-c','USER',0,'ACTIVE'),(18,NULL,'2024-08-13 11:35:25.814929',NULL,'2024-08-14 16:07:26.340403',NULL,'dldlswns890@gmail.com',NULL,NULL,'이인준[광주_2반_c211_팀원]','이인준',NULL,'','https://lh3.googleusercontent.com/a/ACg8ocKSpvaPSGolZ1rlQkTuj4fDakphFVcYe4bhnenFBOUfu_BGNtks=s96-c','USER',0,'ACTIVE'),(19,NULL,'2024-08-13 11:38:01.975717',NULL,'2024-08-13 11:38:01.975717',NULL,'poj4639@ajou.ac.kr',NULL,NULL,'[광주_2반_C207_박범수]','53a849110f',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocLs3VI9NZK8_Lc5nKCMU3o-4ZMHzqbAYaA7OSwsDbrHSb19yg=s96-c','USER',0,'ACTIVE'),(20,NULL,'2024-08-13 11:42:06.270569',NULL,'2024-08-13 11:42:06.270569',NULL,'thswltjr11@gmail.com',NULL,NULL,'[광주_2반_C209_손지석]','390323f4ba',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocJuwYg3ta6qG3WTNq95_7AOCusTNgWDkH0RJ9V-yyJyeiQstQ=s96-c','USER',0,'ACTIVE'),(21,NULL,'2024-08-13 20:24:26.402656',NULL,'2024-08-13 20:24:45.106121',NULL,'greap1002@daum.net',NULL,NULL,'김도영','도영',NULL,'한 줄 소개','http://k.kakaocdn.net/dn/bgJE0N/btsHb4trRuT/DFV7MQWhuRafN2UB9cdL0K/img_640x640.jpg','USER',0,'ACTIVE'),(22,NULL,'2024-08-13 20:26:53.052981',NULL,'2024-08-13 20:27:04.610225',NULL,'hoo4053@naver.com',NULL,NULL,'이호영','호영공주',NULL,'힝','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(23,NULL,'2024-08-14 10:02:35.806102',NULL,'2024-08-14 10:02:35.806102',NULL,'jeongb9716@kakao.com',NULL,NULL,'서정빈','1afe078130',NULL,NULL,'http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(24,NULL,'2024-08-14 11:40:53.936089',NULL,'2024-08-14 11:40:53.936089',NULL,'souffle1903@gmail.com',NULL,NULL,'하림','0ff7fa424e',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocKXv_xPv_9_qeP0965zmE1wnP33tcyXPi3_x-RAXhi7NwsfLw=s96-c','USER',0,'ACTIVE'),(25,NULL,'2024-08-14 11:47:37.705745',NULL,'2024-08-14 11:50:50.051094',NULL,'ellka02@naver.com',NULL,NULL,'정유진','유잔',NULL,'오늘 점심은 삼계탕','http://k.kakaocdn.net/dn/So5aZ/btsHa2vI6t7/tcXztGERYBUQItY421V7qk/img_640x640.jpg','USER',0,'ACTIVE'),(26,NULL,'2024-08-14 11:49:33.237837',NULL,'2024-08-14 11:49:33.237837',NULL,'lovejh429@gmail.com',NULL,NULL,'이정하','60a6cb9d53',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocLcUKcYtPPsbHGhdOdYmN3tOiuHOt8WimlZxXpVlQhfQSvjxw=s96-c','USER',0,'ACTIVE'),(27,NULL,'2024-08-14 11:49:42.963586',NULL,'2024-08-14 11:49:42.963586',NULL,'m3040@g.skku.edu',NULL,NULL,'경영학과/송준혁','f2960f08bb',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocKv4H2odyvltYosaI_JNaLwkhBdGktwJPkbtNHbYHRSHKwJgM7RDg=s96-c','USER',0,'ACTIVE'),(28,NULL,'2024-08-14 11:52:20.327340',NULL,'2024-08-14 11:52:20.327340',NULL,'sunsuking@gmail.com',NULL,NULL,'준수','8f219829b4',NULL,NULL,'http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(29,NULL,'2024-08-14 11:57:09.970420',NULL,'2024-08-14 11:57:09.970420',NULL,'psh56750855@gmail.com',NULL,NULL,'박선홍','25338a8c6d',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocIFDw1FoYAAxXRLNE5Qf7lo6xrnAwq0HERSaf9cvSavKzGncw=s96-c','USER',0,'ACTIVE'),(30,NULL,'2024-08-14 11:58:30.939252',NULL,'2024-08-14 16:09:50.939273',NULL,'koho1047@naver.com',NULL,NULL,'고민호','고민호',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(31,NULL,'2024-08-14 11:59:25.373562',NULL,'2024-08-14 11:59:25.373562',NULL,'beomsu4639@gmail.com',NULL,NULL,'박범수','c9bb94bbaa',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocJ-DWcpCZ6MjWbffVFtr38dMoF0MNgebLnPdx7mo7iB0tvxbxM=s96-c','USER',0,'ACTIVE'),(32,NULL,'2024-08-14 12:03:22.037195',NULL,'2024-08-14 12:03:22.037195',NULL,'gnsals0904@kakao.com',NULL,NULL,'김훈민','f4f94fde28',NULL,NULL,'http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(33,NULL,'2024-08-14 12:06:38.401260',NULL,'2024-08-14 12:06:38.401260',NULL,'kys1651@kakao.com',NULL,NULL,'김용수','5df60bc713',NULL,NULL,'http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(34,NULL,'2024-08-14 15:52:31.490543',NULL,'2024-08-14 15:52:41.159864',NULL,'zzezzee@naver.com',NULL,NULL,'최재원','최재원',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(35,NULL,'2024-08-14 16:03:09.710870',NULL,'2024-08-14 16:03:43.936931',NULL,'qq211qq@naver.com',NULL,NULL,'황성민','황성민',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(36,NULL,'2024-08-14 16:08:58.299552',NULL,'2024-08-14 16:09:06.148028',NULL,'thswltjr11@naver.com',NULL,NULL,'손지석','손지석',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE'),(37,NULL,'2024-08-14 16:11:58.265856',NULL,'2024-08-14 16:12:17.210264',NULL,'chakkerly@kakao.com',NULL,NULL,'가람','가람김',NULL,'','http://k.kakaocdn.net/dn/P9iSX/btsIkqClhgF/9RwoJFX9pgfK4ABU3WcYO0/img_640x640.jpg','USER',0,'ACTIVE'),(38,NULL,'2024-08-14 16:15:02.049929',NULL,'2024-08-14 16:15:30.770787',NULL,'bellajooh@gmail.com',NULL,NULL,'김희주','김희주',NULL,'','http://k.kakaocdn.net/dn/Z6mPR/btsplpicVM9/Dc70DgsSWZptX4H6O1H0uK/img_640x640.jpg','USER',0,'ACTIVE'),(39,NULL,'2024-08-14 16:20:59.830668',NULL,'2024-08-14 16:21:14.838776',NULL,'blackhaze529@naver.com',NULL,NULL,'지예찬','지예찬',NULL,'','http://k.kakaocdn.net/dn/GUoAj/btsF5BzbOFj/2GuHVydBMBAgabk0sVcCHk/img_640x640.jpg','USER',0,'ACTIVE'),(40,NULL,'2024-08-14 16:21:30.567041',NULL,'2024-08-14 16:22:24.433221',NULL,'asdf1916@naver.com',NULL,NULL,'황우성','황우성',NULL,'','http://t1.kakaocdn.net/account_images/default_profile.jpeg.twg.thumb.R640x640','USER',0,'ACTIVE');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-16  0:41:36
