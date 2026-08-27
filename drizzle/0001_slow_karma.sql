CREATE TABLE `assistant_messages` (
	`id` varchar(64) NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` text NOT NULL,
	`model` varchar(160),
	`status` enum('queued','generating','completed','error') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistant_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assistant_sessions` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`summary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assistant_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_records` (
	`id` varchar(64) NOT NULL,
	`title` varchar(160) NOT NULL,
	`category` varchar(80) NOT NULL,
	`difficulty` int NOT NULL,
	`platforms` text NOT NULL,
	`releaseOrder` int NOT NULL,
	`status` enum('planned','in_progress','validated','released') NOT NULL DEFAULT 'planned',
	`summary` text NOT NULL,
	`prerequisites` text NOT NULL,
	`validationCriteria` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_tasks` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(64),
	`title` varchar(240) NOT NULL,
	`description` text,
	`status` enum('todo','in_progress','completed') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `assistant_messages` ADD CONSTRAINT `assistant_messages_sessionId_assistant_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `assistant_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `assistant_sessions` ADD CONSTRAINT `assistant_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_tasks` ADD CONSTRAINT `user_tasks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_tasks` ADD CONSTRAINT `user_tasks_sessionId_assistant_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `assistant_sessions`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `assistant_messages_session_created_idx` ON `assistant_messages` (`sessionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `assistant_sessions_user_activity_idx` ON `assistant_sessions` (`userId`,`lastActivityAt`);--> statement-breakpoint
CREATE INDEX `project_records_release_order_idx` ON `project_records` (`releaseOrder`);--> statement-breakpoint
CREATE INDEX `project_records_status_idx` ON `project_records` (`status`);--> statement-breakpoint
CREATE INDEX `user_tasks_user_status_idx` ON `user_tasks` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `user_tasks_session_idx` ON `user_tasks` (`sessionId`);