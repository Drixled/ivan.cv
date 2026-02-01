export interface TokenChange {
  id: string;
  timestamp: number;
  elementId: string;
  property: string;
  oldValue: string;
  newValue: string;
}

export interface StoredStyles {
  [elementId: string]: {
    [property: string]: string;
  };
}

export interface ElementInfo {
  element: HTMLElement;
  elementId: string;
  tagName: string;
  rect: DOMRect;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced';
