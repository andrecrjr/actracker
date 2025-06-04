import { PluginFeed } from '../PluginFeed';

interface DailyPluginViewProps {
  currentDate: Date;
}

export function DailyPluginView({ currentDate }: DailyPluginViewProps) {
  return <PluginFeed currentDate={currentDate} />;
}
