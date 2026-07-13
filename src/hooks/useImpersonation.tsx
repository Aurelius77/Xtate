import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';
import { logAuditEvent } from '@/lib/auditLog';

interface ImpersonationContextValue {
  isImpersonating: boolean;
  impersonatedEstateId: string | null;
  impersonatedEstateName: string | null;
  startImpersonation: (estateId: string, estateName: string, tenantId?: string) => void;
  stopImpersonation: () => void;
  isSuperAdmin: boolean;
}

const ImpersonationContext = createContext<ImpersonationContextValue | undefined>(undefined);

export const ImpersonationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [impersonatedEstateId, setImpersonatedEstateId] = useState<string | null>(
    () => sessionStorage.getItem('impersonate_estate_id')
  );
  const [impersonatedEstateName, setImpersonatedEstateName] = useState<string | null>(
    () => sessionStorage.getItem('impersonate_estate_name')
  );

  const isSuperAdmin = user?.role === 'super_admin';

  const startImpersonation = useCallback((estateId: string, estateName: string, tenantId?: string) => {
    if (!isSuperAdmin) return;
    sessionStorage.setItem('impersonate_estate_id', estateId);
    sessionStorage.setItem('impersonate_estate_name', estateName);
    if (tenantId) sessionStorage.setItem('impersonate_tenant_id', tenantId);
    setImpersonatedEstateId(estateId);
    setImpersonatedEstateName(estateName);
    toast({ title: 'Impersonation Started', description: `Viewing as admin of ${estateName}` });
    if (user && tenantId) {
      void logAuditEvent(user.id, tenantId, 'impersonation_started', 'tenant', tenantId, { estateId, estateName });
    }
  }, [isSuperAdmin, toast, user]);

  const stopImpersonation = useCallback(() => {
    const tenantId = sessionStorage.getItem('impersonate_tenant_id');
    const estateName = impersonatedEstateName;
    sessionStorage.removeItem('impersonate_estate_id');
    sessionStorage.removeItem('impersonate_estate_name');
    sessionStorage.removeItem('impersonate_tenant_id');
    setImpersonatedEstateId(null);
    setImpersonatedEstateName(null);
    toast({ title: 'Impersonation Ended', description: 'Returned to Super Admin view' });
    if (user && tenantId) {
      void logAuditEvent(user.id, tenantId, 'impersonation_ended', 'tenant', tenantId, { estateName });
    }
  }, [toast, user, impersonatedEstateName]);

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating: isSuperAdmin && !!impersonatedEstateId,
        impersonatedEstateId,
        impersonatedEstateName,
        startImpersonation,
        stopImpersonation,
        isSuperAdmin,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
};

export const useImpersonation = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};
