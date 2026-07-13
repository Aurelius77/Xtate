import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export const logAuditEvent = async (
  actorUserId: string,
  tenantId: string,
  action: string,
  entity: string,
  entityId?: string | null,
  metadata: Json = {},
) => {
  const { error } = await supabase.from('platform_audit_log').insert({
    actor_user_id: actorUserId,
    tenant_id: tenantId,
    action,
    entity,
    entity_id: entityId ?? null,
    metadata,
  });

  if (error) {
    console.error('logAuditEvent failed', { action, entity, error });
  }
};
