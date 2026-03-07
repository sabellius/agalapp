import { UpgradePrompt } from "./upgrade-prompt";

interface HoursLockedProps {
  featureName?: string;
}

export function HoursLocked({ featureName = "שעות פעילות" }: HoursLockedProps) {
  return <UpgradePrompt featureName={featureName} />;
}
