import { signal } from '@preact/signals';
import type { ElementInfo } from './types';

export const selectedElement = signal<ElementInfo | null>(null);
export const hoveredElement = signal<ElementInfo | null>(null);

export function clearSelection(): void {
  selectedElement.value = null;
}
