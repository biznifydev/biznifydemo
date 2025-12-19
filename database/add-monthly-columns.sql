-- Migration: Add monthly amount columns to existing budget_items table
-- This script adds the monthly amount fields to the existing budget_items table

-- Add monthly amount columns to budget_items table
ALTER TABLE budget_items 
ADD COLUMN jan_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN feb_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN mar_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN apr_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN may_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN jun_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN jul_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN aug_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN sep_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN oct_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN nov_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
ADD COLUMN dec_amount DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Update existing records to distribute the current amount across months
-- This assumes the current amount should be evenly distributed across all months
UPDATE budget_items 
SET 
  jan_amount = amount / 12,
  feb_amount = amount / 12,
  mar_amount = amount / 12,
  apr_amount = amount / 12,
  may_amount = amount / 12,
  jun_amount = amount / 12,
  jul_amount = amount / 12,
  aug_amount = amount / 12,
  sep_amount = amount / 12,
  oct_amount = amount / 12,
  nov_amount = amount / 12,
  dec_amount = amount / 12
WHERE amount > 0;

-- Add a comment to document the change
COMMENT ON TABLE budget_items IS 'Budget items with monthly breakdown amounts'; 