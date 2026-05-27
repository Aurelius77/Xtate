import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Tenant } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SecureAuthContext';

type TenantBranding = {
  name: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  currency?: string;
  timezone?: string;
  address?: string;
};

type TenantContextValue = {
  tenant: Tenant | null;
  tenantId: string | null;
  tenantSlug: string | null;
  plan: Tenant['plan'] | null;
  branding: TenantBranding | null;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
};

type TenantQuery = {
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<{ data: Tenant | null; error: { message: string } | null }>;
    };
  };
};

type TenantSupabaseClient = {
  from(table: 'tenants'): TenantQuery;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

const TENANT_COLUMNS = [
  'id',
  'estate_id',
  'name',
  'slug',
  'status',
  'plan',
  'logo_url',
  'primary_color',
  'secondary_color',
  'custom_domain',
  'currency',
  'timezone',
  'address',
  'metadata',
  'created_at',
  'updated_at',
].join(',');

const RESERVED_SUBDOMAINS = new Set(['app', 'www', 'admin', 'api', 'localhost']);

const getTenantSlugFromLocation = () => {
  if (typeof window === 'undefined') return null;

  const queryTenant = new URLSearchParams(window.location.search).get('tenant');
  if (queryTenant?.trim()) return queryTenant.trim().toLowerCase();

  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1') return null;

  const parts = hostname.split('.');
  if (parts.length < 3) return null;

  const subdomain = parts[0];
  return RESERVED_SUBDOMAINS.has(subdomain) ? null : subdomain;
};

const tenantClient = supabase as unknown as TenantSupabaseClient;

const hexToHSL = (hex: string): string | null => {
  try {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return null;
  }
};

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTenant = useCallback(async () => {
    if (authLoading) return;

    setIsLoading(true);
    try {
      const slug = getTenantSlugFromLocation();

      if (slug) {
        const { data, error } = await tenantClient
          .from('tenants')
          .select(TENANT_COLUMNS)
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw new Error(error.message);
        setTenant(data);
        return;
      }

      if (user?.estate_id) {
        const { data, error } = await tenantClient
          .from('tenants')
          .select(TENANT_COLUMNS)
          .eq('estate_id', user.estate_id)
          .maybeSingle();

        if (error) throw new Error(error.message);
        setTenant(data);
        return;
      }

      setTenant(null);
    } catch (error) {
      console.error('Failed to load tenant:', error);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, user?.estate_id]);

  useEffect(() => {
    void fetchTenant();
  }, [fetchTenant]);

  const branding = useMemo<TenantBranding | null>(() => {
    if (!tenant) return null;

    return {
      name: tenant.name,
      logoUrl: tenant.logo_url || undefined,
      primaryColor: tenant.primary_color || undefined,
      secondaryColor: tenant.secondary_color || undefined,
      currency: tenant.currency,
      timezone: tenant.timezone,
      address: tenant.address || undefined,
    };
  }, [tenant]);

  useEffect(() => {
    if (!branding) {
      document.title = 'XTATE - Estate Management Platform';
      return;
    }

    document.title = `${branding.name} | XTATE`;

    const root = document.documentElement;
    if (branding.primaryColor) {
      const hsl = hexToHSL(branding.primaryColor);
      if (hsl) root.style.setProperty('--primary', hsl);
    }
    if (branding.secondaryColor) {
      const hsl = hexToHSL(branding.secondaryColor);
      if (hsl) root.style.setProperty('--secondary', hsl);
    }
  }, [branding]);

  const value = useMemo<TenantContextValue>(() => ({
    tenant,
    tenantId: tenant?.id ?? null,
    tenantSlug: tenant?.slug ?? getTenantSlugFromLocation(),
    plan: tenant?.plan ?? null,
    branding,
    isLoading,
    refreshTenant: fetchTenant,
  }), [branding, fetchTenant, isLoading, tenant]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
