-- Add toggle properties to main_banners table
ALTER TABLE main_banners 
ADD COLUMN show_title BOOLEAN DEFAULT true,
ADD COLUMN show_subtitle BOOLEAN DEFAULT true,
ADD COLUMN show_button BOOLEAN DEFAULT true; 