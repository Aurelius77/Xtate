import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/SecureAuthContext';
import { useToast } from '@/hooks/use-toast';

export const useImpersonation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [impersonatedEstateId, setImpersonatedEstateId] = useState<string | null>(
    () => sessionStorage.getItem('impersonate_estate_id')
  );
  const [impersonatedEstateName, setImpersonatedEstateName] = useState<string | null>(
    () => sessionStorage.getItem('impersonate_estate_name')
  );

  const isSuperAdmin = user?.role === 'super_admin';

  const startImpersonation = useCallback((estateId: string, estateName: string) => {
    if (!isSuperAdmin) return;
    sessionStorage.setItem('impersonate_estate_id', estateId);
    sessionStorage.setItem('impersonate_estate_name', estateName);
    setImpersonatedEstateId(estateId);
    setImpersonatedEstateName(estateName);
    toast({ title: 'Impersonation Started', description: `Viewing as admin of ${estateName}` });
  }, [isSuperAdmin, toast]);

  const stopImpersonation = useCallback(() => {
    sessionStorage.removeItem('impersonate_estate_id');
    sessionStorage.removeItem('impersonate_estate_name');
    setImpersonatedEstateId(null);
    setImpersonatedEstateName(null);
    toast({ title: 'Impersonation Ended', description: 'Returned to Super Admin view' });
  }, [toast]);

  return {
    isImpersonating: isSuperAdmin && !!impersonatedEstateId,
    impersonatedEstateId,
    impersonatedEstateName,
    startImpersonation,
    stopImpersonation,
    isSuperAdmin,
  };
};
