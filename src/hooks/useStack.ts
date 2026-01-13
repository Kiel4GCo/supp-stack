import { useState, useEffect, useCallback } from 'react';
import type { Supplement, StackItem } from '@/types/supplement';

const STACK_STORAGE_KEY = 'supplement-stack';

export function useStack() {
  const [stack, setStack] = useState<StackItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STACK_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStack(parsed.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        })));
      } catch (e) {
        console.error('Failed to parse saved stack:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STACK_STORAGE_KEY, JSON.stringify(stack));
  }, [stack]);

  const addToStack = useCallback((supplement: Supplement) => {
    setStack(prev => {
      // Check if already in stack
      if (prev.some(item => item.supplement.id === supplement.id)) {
        return prev;
      }
      return [...prev, { supplement, addedAt: new Date() }];
    });
  }, []);

  const removeFromStack = useCallback((supplementId: string) => {
    setStack(prev => prev.filter(item => item.supplement.id !== supplementId));
  }, []);

  const clearStack = useCallback(() => {
    setStack([]);
  }, []);

  const isInStack = useCallback((supplementId: string) => {
    return stack.some(item => item.supplement.id === supplementId);
  }, [stack]);

  return {
    stack,
    addToStack,
    removeFromStack,
    clearStack,
    isInStack,
  };
}
