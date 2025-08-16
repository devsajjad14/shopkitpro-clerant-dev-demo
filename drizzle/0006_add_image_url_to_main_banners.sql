-- Migration: Add image_url field to main_banners table
-- Created: 2024-01-01

ALTER TABLE "main_banners" ADD COLUMN IF NOT EXISTS "image_url" text; 