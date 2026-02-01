import { hoveredElement, selectedElement, clearSelection } from '../lib/inspector/store';
import { loadStoredStyles } from '../lib/inspector/storage';
import type { ElementInfo } from '../lib/inspector/types';

let overlay: HTMLDivElement | null = null;
let dimensionLabel: HTMLDivElement | null = null;
let tagLabel: HTMLDivElement | null = null;

function createOverlay(): void {
  if (overlay) return;

  overlay = document.createElement('div');
  overlay.id = 'inspector-overlay';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    border: 1px solid #4a9eff;
    background: rgba(74, 158, 255, 0.05);
    z-index: 9998;
    transition: all 0.1s ease-out;
    opacity: 0;
  `;

  // Tag label (top-left, shows element tag like h1, p)
  tagLabel = document.createElement('div');
  tagLabel.style.cssText = `
    position: absolute;
    top: -22px;
    left: 0;
    background: #4a9eff;
    color: #000;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 0.65rem;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    white-space: nowrap;
  `;
  overlay.appendChild(tagLabel);

  // Dimension label (bottom-center, shows width × height)
  dimensionLabel = document.createElement('div');
  dimensionLabel.style.cssText = `
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4a9eff;
    color: #000;
    padding: 2px 4px;
    border-radius: 2px;
    font-size: 0.6rem;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    white-space: nowrap;
  `;
  overlay.appendChild(dimensionLabel);

  document.body.appendChild(overlay);
}

function updateOverlay(rect: DOMRect | null, tagName?: string): void {
  if (!overlay || !dimensionLabel || !tagLabel) return;

  if (!rect) {
    overlay.style.opacity = '0';
    return;
  }

  overlay.style.opacity = '1';
  overlay.style.top = `${rect.top}px`;
  overlay.style.left = `${rect.left}px`;
  overlay.style.width = `${rect.width}px`;
  overlay.style.height = `${rect.height}px`;
  dimensionLabel.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
  if (tagName) {
    tagLabel.textContent = tagName;
  }
}

function getElementInfo(element: HTMLElement): ElementInfo | null {
  const elementId = element.dataset.element;
  if (!elementId) return null;

  return {
    element,
    elementId,
    tagName: element.tagName.toLowerCase(),
    rect: element.getBoundingClientRect(),
  };
}

function handleMouseMove(e: MouseEvent): void {
  const target = (e.target as HTMLElement).closest('[data-inspectable]') as HTMLElement | null;

  if (target && target !== selectedElement.value?.element) {
    const info = getElementInfo(target);
    if (info) {
      hoveredElement.value = info;
      updateOverlay(info.rect, info.tagName);
    }
  } else if (!target) {
    hoveredElement.value = null;
    if (!selectedElement.value) {
      updateOverlay(null);
    }
  }
}

function handleClick(e: MouseEvent): void {
  const target = (e.target as HTMLElement).closest('[data-inspectable]') as HTMLElement | null;

  if (target) {
    e.preventDefault();
    e.stopPropagation();

    const info = getElementInfo(target);
    if (info) {
      selectedElement.value = info;
      hoveredElement.value = null;
      // Update overlay to show selected state
      overlay!.style.borderColor = '#4a9eff';
      overlay!.style.background = 'rgba(74, 158, 255, 0.1)';
      updateOverlay(info.rect, info.tagName);
    }
  }
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && selectedElement.value) {
    clearSelection();
    overlay!.style.borderColor = '#4a9eff';
    overlay!.style.background = 'rgba(74, 158, 255, 0.05)';
    updateOverlay(null);
  }
}

function applyStoredStyles(): void {
  const styles = loadStoredStyles();

  Object.entries(styles).forEach(([elementId, properties]) => {
    const element = document.querySelector(`[data-element="${elementId}"]`) as HTMLElement;
    if (element) {
      Object.entries(properties).forEach(([property, value]) => {
        element.style.setProperty(property, value);
      });
    }
  });
}

function init(): void {
  createOverlay();
  applyStoredStyles();

  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown);

  // Update overlay position on scroll/resize
  window.addEventListener('scroll', () => {
    if (selectedElement.value) {
      updateOverlay(selectedElement.value.element.getBoundingClientRect(), selectedElement.value.tagName);
    } else if (hoveredElement.value) {
      updateOverlay(hoveredElement.value.element.getBoundingClientRect(), hoveredElement.value.tagName);
    }
  });

  window.addEventListener('resize', () => {
    if (selectedElement.value) {
      updateOverlay(selectedElement.value.element.getBoundingClientRect(), selectedElement.value.tagName);
    } else if (hoveredElement.value) {
      updateOverlay(hoveredElement.value.element.getBoundingClientRect(), hoveredElement.value.tagName);
    }
  });
}

function cleanup(): void {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('click', handleClick, true);
  document.removeEventListener('keydown', handleKeyDown);

  if (overlay) {
    overlay.remove();
    overlay = null;
    dimensionLabel = null;
    tagLabel = null;
  }

  // Reset state
  selectedElement.value = null;
  hoveredElement.value = null;
}

// Initialize on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle View Transitions
  document.addEventListener('astro:page-load', () => {
    cleanup();
    init();
  });

  document.addEventListener('astro:before-swap', cleanup);
}

export { init, cleanup, applyStoredStyles };
