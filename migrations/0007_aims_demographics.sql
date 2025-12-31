-- ABOUTME: Migration to add demographic columns for AIMS survey data.
-- ABOUTME: Adds age_group and gender columns to human_response_distributions.

-- Add new demographic columns for AIMS survey
-- (continent and education_level already exist from WVS)
ALTER TABLE human_response_distributions ADD COLUMN age_group TEXT;
ALTER TABLE human_response_distributions ADD COLUMN gender TEXT;
