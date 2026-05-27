import React from 'react';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import UpgradePrompt from './UpgradePrompt';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const FeatureGate = ({ feature, children, fallback, showUpgradePrompt = true }: FeatureGateProps) => {
  const { loading, hasFeature } = useFeatureFlags();

  if (loading) return null;
  if (hasFeature(feature)) return <>{children}</>;
  if (fallback) return <>{fallback}</>;
  if (showUpgradePrompt) return <UpgradePrompt feature={feature.replace(/[_-]/g, ' ')} />;

  return null;
};

export default FeatureGate;
