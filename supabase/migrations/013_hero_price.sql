-- 013_hero_price.sql
-- Editable hero "starting price" stat (e.g. "From AED 149"), admin-entered
-- free text so copy stays flexible (currency, "From", ranges, etc).

ALTER TABLE generated_pages
  ADD COLUMN IF NOT EXISTS starting_price TEXT;
