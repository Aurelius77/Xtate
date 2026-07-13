import { supabase } from '@/integrations/supabase/client';

export interface ResidentProfileInfo {
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * residents.user_id and profiles.id both reference auth.users(id) independently —
 * there is no direct foreign key between residents and profiles, so PostgREST
 * cannot embed one under the other via `profiles!residents_user_id_fkey(...)`.
 * Fetch profiles separately and merge in JS instead (mirrors the working pattern
 * in SecurityDashboard.tsx's loadActive()).
 */
export const fetchProfilesByUserIds = async (
  userIds: string[],
): Promise<Record<string, ResidentProfileInfo>> => {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueIds.length === 0) return {};

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .in('id', uniqueIds);

  if (error) throw error;

  const map: Record<string, ResidentProfileInfo> = {};
  (data ?? []).forEach((row) => {
    map[row.id] = { full_name: row.full_name, email: row.email, phone: row.phone };
  });
  return map;
};
