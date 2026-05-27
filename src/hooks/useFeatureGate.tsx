import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

export const useFeatureGate = () => {
  return useFeatureFlags();
};
