CREATE TABLE `approval_histories` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_request_id` text NOT NULL,
	`actor_user_id` text NOT NULL,
	`kind` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`comment` text,
	FOREIGN KEY (`purchase_request_id`) REFERENCES `purchase_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `approval_histories_purchase_request_idx` ON `approval_histories` (`purchase_request_id`);--> statement-breakpoint
CREATE INDEX `approval_histories_occurred_at_idx` ON `approval_histories` (`occurred_at`);--> statement-breakpoint
CREATE TABLE `child_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_category_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`parent_category_id`) REFERENCES `parent_categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `child_categories_parent_name_unq` ON `child_categories` (`parent_category_id`,`name`);--> statement-breakpoint
CREATE INDEX `child_categories_parent_idx` ON `child_categories` (`parent_category_id`);--> statement-breakpoint
CREATE TABLE `parent_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parent_categories_name_unique` ON `parent_categories` (`name`);--> statement-breakpoint
CREATE TABLE `purchase_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`applicant_user_id` text NOT NULL,
	`title` text NOT NULL,
	`amount_yen` integer NOT NULL,
	`child_category_id` text NOT NULL,
	`desired_purchase_date` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`applicant_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`child_category_id`) REFERENCES `child_categories`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `purchase_requests_applicant_idx` ON `purchase_requests` (`applicant_user_id`);--> statement-breakpoint
CREATE INDEX `purchase_requests_status_idx` ON `purchase_requests` (`status`);--> statement-breakpoint
CREATE INDEX `purchase_requests_created_at_idx` ON `purchase_requests` (`created_at`);--> statement-breakpoint
CREATE INDEX `purchase_requests_child_category_idx` ON `purchase_requests` (`child_category_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`department` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
