import { useState, useEffect, useCallback } from 'react';
import { barStylesService, BarStyleRule, BarStyle } from '../services/barStylesService';

interface UseBarStylesProps {
  enabled?: boolean;
  projectId: string;
}

interface UseBarStylesReturn {
  applyStylesToDOM: () => void;
  getBarStyleForTask: (task: any) => BarStyle | null;
  loading: boolean;
  refreshRules: () => Promise<void>;
  rules: BarStyleRule[];
}

export const useBarStyles = ({ projectId, enabled = true }: UseBarStylesProps): UseBarStylesReturn => {
  const [rules, setRules] = useState<BarStyleRule[]>([]);
  const [loading, setLoading] = useState(false);

  // Load bar style rules
  const loadRules = useCallback(async () => {
    if (!enabled || !projectId) return;

    try {
      setLoading(true);
      const projectRules = await barStylesService.getBarStyleRules(projectId);
      setRules(projectRules);
    } catch (error) {
      console.error('Error loading bar style rules:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, enabled]);

  // Get bar style for a specific task
  const getBarStyleForTask = useCallback((task: any): BarStyle | null => {
    if (!enabled || rules.length === 0) return null;
    return barStylesService.getBarStyleForTask(task, rules);
  }, [rules, enabled]);

  // Refresh rules from database
  const refreshRules = useCallback(async () => {
    await loadRules();
  }, [loadRules]);

  // Apply styles to DOM
  const applyStylesToDOM = useCallback(() => {
    if (!enabled) return;
    barStylesService.applyBarStyles(rules);
  }, [rules, enabled]);

  // Load rules on mount and when dependencies change
  useEffect(() => {
    loadRules();
  }, [loadRules]);

  // Apply styles to DOM when rules change
  useEffect(() => {
    if (enabled && rules.length > 0) {
      applyStylesToDOM();
    }
  }, [rules, enabled, applyStylesToDOM]);

  return {
    rules,
    loading,
    getBarStyleForTask,
    refreshRules,
    applyStylesToDOM
  };
}; 