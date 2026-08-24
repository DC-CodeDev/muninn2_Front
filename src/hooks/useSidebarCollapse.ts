import { useState } from 'react';

interface UseSidebarCollapseResult {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
}

export function useSidebarCollapse(): UseSidebarCollapseResult {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return {
    leftCollapsed,
    rightCollapsed,
    toggleLeft: () => setLeftCollapsed((prev) => !prev),
    toggleRight: () => setRightCollapsed((prev) => !prev),
  };
}