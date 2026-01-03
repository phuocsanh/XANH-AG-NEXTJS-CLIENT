'use client';

import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';

/**
 * Component wrapper để sử dụng pull-to-refresh hook
 * Phải là client component vì hook sử dụng useEffect
 */
export default function PullToRefreshProvider() {
  usePullToRefresh();
  return null;
}
