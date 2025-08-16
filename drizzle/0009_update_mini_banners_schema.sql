-- Migration: Update mini_banners table with missing columns
-- Created: 2024-12-19

-- Add toggle states
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "show_title" boolean DEFAULT true;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "show_subtitle" boolean DEFAULT true;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "show_button" boolean DEFAULT true;

-- Add position data (JSON objects)
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_position" jsonb;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_position" jsonb;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "cta_position" jsonb;

-- Add custom font sizes
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_custom_font_size" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_custom_font_size" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "cta_custom_font_size" integer;

-- Add margin and padding data
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_margin_top" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_margin_right" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_margin_bottom" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_margin_left" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_padding_top" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_padding_right" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_padding_bottom" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "title_padding_left" integer;

ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_margin_top" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_margin_right" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_margin_bottom" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_margin_left" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_padding_top" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_padding_right" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_padding_bottom" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "subtitle_padding_left" integer;

ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_margin_top" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_margin_right" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_margin_bottom" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_margin_left" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_padding_top" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_padding_right" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_padding_bottom" integer;
ALTER TABLE "mini_banners" ADD COLUMN IF NOT EXISTS "button_padding_left" integer; 