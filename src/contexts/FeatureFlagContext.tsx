import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

type Plan = 'free' | 'standard' | 'custom' | 'basic' | 'pro' | 'enterprise';

type FeatureRow = {
  feature_key: string;
  enabled: boolean;
  limit_value: number | null;
};

type FeatureFlagContextValue = {
  plan: Plan;
  loading: boolean;
  features: Record<string, boolean>;
  limits: { maxResidents: number; maxAdmins: number };
  hasFeature: (feature: string) => boolean;
  refreshFeatures: () => Promise<void>;
};

type FeatureQuery = {
  select(columns: string): {
    eq(column: string, value: string): Promise<{ data: FeatureRow[] | null; error: { message: string } | null }>;
  };
};

type FeatureSupabaseClient = {
  from(table: 'tenant_features'): FeatureQuery;
};

const PLAN_FEATURES: Record<Plan, string[]> = {
  free: ['residents', 'dues', 'complaints', 'meetings', 'documents', 'access_codes', 'broadcast'],
  basic: ['residents', 'dues', 'complaints', 'meetings', 'documents', 'access_codes', 'broadcast'],
  standard: [
    'residents', 'dues', 'complaints', 'meetings', 'documents', 'access_codes', 'broadcast',
    'expenses', 'data_import', 'security_management', 'audit_logs', 'white_label', 'no_ads',
  ],
  pro: [
    'residents', 'dues', 'complaints', 'meetings', 'documents', 'access_codes', 'broadcast',
    'expenses', 'data_import', 'security_management', 'audit_logs', 'white_label', 'no_ads',
  ],
  custom: [
    'residents', 'dues', 'complaints', 'meetings', 'documents', 'access_codes', 'broadcast',
    'expenses', 'data_import', 'security_management', 'audit_logs', 'white_label', 'custom_domain',
    'wallet', 'marketplace', 'forum', 'technicians', 'advanced_analytics', 'no_ads', 'api_access',
  ],
  enterprise: [
    'residents', 'dues', 'complaints', 'meetings', 'documents', 'access_codes', 'broadcast',
    'expenses', 'data_import', 'security_management', 'audit_logs', 'white_label', 'custom_domain',
    'wallet', 'marketplace', 'forum', 'technicians', 'advanced_analytics', 'no_ads', 'api_access',
  ],
};

const PLAN_LIMITS: Record<Plan, { maxResidents: number; maxAdmins: number }> = {
  free: { maxResidents: 50, maxAdmins: 1 },
  basic: { maxResidents: 50, maxAdmins: 1 },
  standard: { maxResidents: 200, maxAdmins: 5 },
  pro: { maxResidents: 200, maxAdmins: 5 },
  custom: { maxResidents: Infinity, maxAdmins: Infinity },
  enterprise: { maxResidents: Infinity, maxAdmins: Infinity },
};

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

const featureClient = supabase as unknown as FeatureSupabaseClient;

const normalizeFeatureKey = (feature: string) => feature.replace(/-/g, '_');

const getFallbackFeatures = (plan: Plan) =>
  PLAN_FEATURES[plan].reduce<Record<string, boolean>>((acc, feature) => {
    acc[feature] = true;
    return acc;
  }, {});

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const { tenantId, plan: tenantPlan, isLoading: tenantLoading } = useTenant();
  const plan = (tenantPlan || 'basic') as Plan;
  const [features, setFeatures] = useState<Record<string, boolean>>(() => getFallbackFeatures(plan));
  const [loading, setLoading] = useState(true);

  const refreshFeatures = useCallback(async () => {
    if (tenantLoading) return;

    setLoading(true);
    try {
      if (!tenantId) {
        setFeatures(getFallbackFeatures(plan));
        return;
      }

      const { data, error } = await featureClient
        .from('tenant_features')
        .select('feature_key, enabled, limit_value')
        .eq('tenant_id', tenantId);

      if (error) throw new Error(error.message);

      if (!data || data.length === 0) {
        setFeatures(getFallbackFeatures(plan));
        return;
      }

      const nextFeatures = data.reduce<Record<string, boolean>>((acc, row) => {
        acc[normalizeFeatureKey(row.feature_key)] = row.enabled;
        return acc;
      }, {});

      setFeatures(nextFeatures);
    } catch (error) {
      console.error('Failed to load tenant feature flags:', error);
      setFeatures(getFallbackFeatures(plan));
    } finally {
      setLoading(false);
    }
  }, [plan, tenantId, tenantLoading]);

  useEffect(() => {
    void refreshFeatures();
  }, [refreshFeatures]);

  const hasFeature = useCallback((feature: string) => {
    const key = normalizeFeatureKey(feature);
    return features[key] ?? false;
  }, [features]);

  const value = useMemo<FeatureFlagContextValue>(() => ({
    plan,
    loading,
    features,
    limits: PLAN_LIMITS[plan],
    hasFeature,
    refreshFeatures,
  }), [features, hasFeature, loading, plan, refreshFeatures]);

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};
