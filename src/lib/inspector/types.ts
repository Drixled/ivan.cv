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
