-- Split "Maintenance" out from general Complaints without a new table: residents
-- already submit tickets through a single "Maintenance & Support" form, so a
-- category on the same complaints row is enough to route general grievances
-- vs. physical repair requests to two separate admin queues.
ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general'
  CHECK (category IN ('general', 'maintenance'));
