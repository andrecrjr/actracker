import { pluginManager } from '@/ac-components/lib/plugins';
import type { Habit } from '@/ac-components/types/habits';
// FILE: src/ac-components/hooks/usePluginContent.ts
import { useCallback, useEffect, useState } from 'react';

export const usePluginContent = (habit: Habit, dateStr: string) => {
  const [pluginContent, setPluginContent] = useState<JSX.Element[]>([]);

  const loadPluginContent = useCallback(async () => {
    try {
      await pluginManager.ensureReady();
      const content = await pluginManager.executeHook<JSX.Element>(
        'RenderHabitCard',
        habit,
        new Date(dateStr),
      );
      setPluginContent(content);
    } catch (error) {
      console.error('Error loading plugin content:', error);
      setPluginContent([]);
    }
  }, [habit, dateStr]); // Dependências explicitamente declaradas

  useEffect(() => {
    loadPluginContent();
  }, [loadPluginContent]); // Executa apenas quando a função muda

  return pluginContent;
};
