-- The New Estate Wizard writes tenants.plan values ('free'/'standard'/'custom')
-- into both estates.subscription_plan and subscriptions.plan, but those two
-- columns' CHECK constraints only ever allowed the older 'basic'/'pro'/
-- 'enterprise' set — so estate creation failed the constraint on the first
-- insert it touched. Widen both to match the set tenants.plan already accepts.
ALTER TABLE public.estates DROP CONSTRAINT IF EXISTS estates_subscription_plan_check;
ALTER TABLE public.estates ADD CONSTRAINT estates_subscription_plan_check
  CHECK (subscription_plan IN ('free', 'standard', 'custom', 'basic', 'pro', 'enterprise'));

ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'standard', 'custom', 'basic', 'pro', 'enterprise'));
