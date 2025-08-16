-- Migration: Add main_banners table
-- Created: 2024-01-01

CREATE TABLE IF NOT EXISTS "main_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft',
	"priority" integer DEFAULT 1,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS "main_banners_status_idx" ON "main_banners" ("status");
CREATE INDEX IF NOT EXISTS "main_banners_priority_idx" ON "main_banners" ("priority");
CREATE INDEX IF NOT EXISTS "main_banners_created_at_idx" ON "main_banners" ("created_at"); 