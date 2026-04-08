import { useAuth } from '@/contexts/SecureAuthContext';

/**
 * Returns the effective estate_id for data queries.
 * In impersonation mode (super admin viewing an estate), returns the impersonated estate_id.
 * Otherwise returns the user's own estate_id.
 */
export const useEstateId = (): string | undefined => {
  const { user } = useAuth();
  
  // Check for impersonation
  const impersonatedEstateId = sessionStorage.getItem('impersonate_estate_id');
  if (user?.role === 'super_admin' && impersonatedEstateId) {
    return impersonatedEstateId;
  }
  
  return user?.estate_id;
};
