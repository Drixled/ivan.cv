import type { StoredStyles, TokenChange } from './types';

const STORAGE_KEY = 'inspector-styles';
const CHANGES_KEY = 'inspector-changes';

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

export function loadStoredChanges(): TokenChange[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CHANGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveChanges(changes: TokenChange[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep only last 50 changes
    const trimmed = changes.slice(-50);
    localStorage.setItem(CHANGES_KEY, JSON.stringify(trimmed));
  } catch {
    console.error('Failed to save changes to localStorage');
  }
}
