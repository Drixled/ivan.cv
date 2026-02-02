import type { StoredStyles } from './types';

const STORAGE_KEY = 'inspector-styles';

export function loadStoredStyles(): StoredStyles {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function saveStyles(styles: StoredStyles): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
  } catch {
    console.error('Failed to save styles to localStorage');
  }
}

export function updateElementStyle(
  elementId: string,
  property: string,
  value: string
): StoredStyles {
  const styles = loadStoredStyles();
  if (!styles[elementId]) {
    styles[elementId] = {};
  }
  styles[elementId][property] = value;
  saveStyles(styles);
  return styles;
}

export function clearElementStyles(elementId: string): void {
  const styles = loadStoredStyles();
  delete styles[elementId];
  saveStyles(styles);
}
