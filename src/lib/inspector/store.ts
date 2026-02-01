import { signal } from '@preact/signals';
import type { ElementInfo, TokenChange, SyncStatus } from './types';
import { loadStoredChanges, saveChanges } from './storage';

export const selectedElement = signal<ElementInfo | null>(null);
export const hoveredElement = signal<ElementInfo | null>(null);
export const tokenChanges = signal<TokenChange[]>(loadStoredChanges());
export const syncStatus = signal<SyncStatus>('idle');

export function addTokenChange(change: Omit<TokenChange, 'id' | 'timestamp'>): void {
  const newChange: TokenChange = {
    ...change,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  tokenChanges.value = [...tokenChanges.value, newChange];
  saveChanges(tokenChanges.value);

  // Simulate sync status
  syncStatus.value = 'syncing';
  setTimeout(() => {
    syncStatus.value = 'synced';
    setTimeout(() => {
      syncStatus.value = 'idle';
    }, 1500);
  }, 300);
}

export function clearSelection(): void {
  selectedElement.value = null;
}
