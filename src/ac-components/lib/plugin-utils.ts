import { formatDate } from '@/ac-components/lib/date-utils';
import type { DailyPluginState } from '@/ac-components/types/plugin';

export function normalizeDate(date: string | Date): string {
  return typeof date === 'string' ? date : formatDate(new Date(date));
}

export function initializeDayState(): DailyPluginState[string] {
  return {
    activePlugins: [],
    pluginData: {},
    stackOrder: { left: [], center: [], right: [] },
  };
}

export function removePluginFromStacks(
  stackOrder: DailyPluginState[string]['stackOrder'],
  pluginId: string,
): DailyPluginState[string]['stackOrder'] {
  return {
    left: stackOrder.left.filter(id => id !== pluginId),
    center: stackOrder.center.filter(id => id !== pluginId),
    right: stackOrder.right.filter(id => id !== pluginId),
  };
}

export function addPluginToStack(
  stackOrder: DailyPluginState[string]['stackOrder'],
  pluginId: string,
  stackId: 'left' | 'center' | 'right',
): DailyPluginState[string]['stackOrder'] {
  const newStackOrder = removePluginFromStacks(stackOrder, pluginId);
  newStackOrder[stackId].push(pluginId);
  return newStackOrder;
}
