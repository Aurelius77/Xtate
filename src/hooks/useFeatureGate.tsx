import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEstateId } from './useEstateId';

type Plan = 'basic' | 'pro' | 'enterprise';

// Define which features are available per plan
const PLAN_FEATURES: Record<Plan, string[]> = {
  basic: [
    'residents', 'dues', 'complaints', 'meetings', 'documents',
    'access-codes', 'broadcast',
  ],
  pro: [
    'residents', 'dues', 'complaints', 'meetings', 'documents',
    'access-codes', 'broadcast', 'expenses', 'data-import',
    'security-management', 'audit-logs',
  ],
  enterprise: [
    'residents', 'dues', 'complaints', 'meetings', 'documents',
    'access-codes', 'broadcast', 'expenses', 'data-import',
    'security-management', 'audit-logs', 'white-label', 'custom-domain',
    'api-access',
  ],
};

const PLAN_LIMITS: Record<Plan, { maxResidents: number; maxAdmins: number }> = {
  basic: { maxResidents: 50, maxAdmins: 1 },
  pro: { maxResidents: 200, maxAdmins: 5 },
  enterprise: { maxResidents: Infinity, maxAdmins: Infinity },
};

export const useFeatureGate = () => {
  const estateId = useEstateId();
  const [plan, setPlan] = useState<Plan>('basic');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!estateId) { setLoading(false); return; }

    const fetchPlan = async () => {
      const { data } = await supabase
        .from('estates')
        .select('subscription_plan')
        .eq('id', estateId)
        .single();
      if (data) setPlan(data.subscription_plan as Plan);
      setLoading(false);
    };
    fetchPlan();
  }, [estateId]);

  const hasFeature = (feature: string): boolean => {
    return PLAN_FEATURES[plan]?.includes(feature) ?? false;
  };

  const limits = PLAN_LIMITS[plan];

  return { plan, hasFeature, limits, loading };
};
