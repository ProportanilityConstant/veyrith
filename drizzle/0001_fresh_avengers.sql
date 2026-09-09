CREATE TABLE `api_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`endpoint` varchar(128) NOT NULL,
	`statusCode` int NOT NULL,
	`latencyMs` int NOT NULL,
	`generated` enum('yes','no') NOT NULL,
	`keyFingerprint` varchar(16) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_usage_id` PRIMARY KEY(`id`)
);
