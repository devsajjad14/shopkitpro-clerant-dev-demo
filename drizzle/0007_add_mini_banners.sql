-- Migration: Add mini_banners table
-- Created: 2024-06-09

CREATE TABLE IF NOT EXISTS "mini_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft',
	"priority" integer DEFAULT 1,
	"start_date" timestamp,
	"end_date" timestamp,
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS "mini_banners_status_idx" ON "mini_banners" ("status");
CREATE INDEX IF NOT EXISTS "mini_banners_priority_idx" ON "mini_banners" ("priority");
CREATE INDEX IF NOT EXISTS "mini_banners_created_at_idx" ON "mini_banners" ("created_at"); 