import { selectedElement, hoveredElement, clearSelection } from '../lib/inspector/store';
import type { ElementInfo } from '../lib/inspector/types';

let demoCursor: HTMLDivElement | null = null;
let demoLabel: HTMLDivElement | null = null;
let replayButton: HTMLButtonElement | null = null;
let isRunning = false;
let aborted = false;

const STORAGE_KEY = 'inspectorDemoPlayed';

function createDemoElements(): void {
  // Cursor
  demoCursor = document.createElement('div');
  demoCursor.id = 'demoCursor';
  demoCursor.className = 'demo-cursor';
  demoCursor.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.85a.5.5 0 0 0-.85.36Z" fill="#fff" stroke="#000" stroke-width="1.5"/>
    </svg>
  `;
  document.body.appendChild(demoCursor);

  // Label
  demoLabel = document.createElement('div');
  demoLabel.id = 'demoLabel';
  demoLabel.className = 'demo-label';
  document.body.appendChild(demoLabel);
}

function removeDemoElements(): void {
  demoCursor?.remove();
  demoLabel?.remove();
  demoCursor = null;
  demoLabel = null;
}

function createReplayButton(): void {
  if (replayButton) return;

  replayButton = document.createElement('button');
  replayButton.id = 'demoReplayBtn';
  replayButton.className = 'demo-replay-btn';
  replayButton.setAttribute('aria-label', 'Replay inspector demo');
  replayButton.setAttribute('title', 'Replay demo');
  replayButton.innerHTML = `
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
      <path d="M2 8a6 6 0 1 1 1.5 3.96" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M2 12V8h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  replayButton.addEventListener('click', handleReplayClick);
  document.body.appendChild(replayButton);

  // Fade in after a short delay
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      replayButton?.classList.add('visible');
    });
  });
}

function removeReplayButton(): void {
  replayButton?.remove();
  replayButton = null;
}

function hideReplayButton(): void {
  replayButton?.classList.remove('visible');
}

function showReplayButton(): void {
  if (!replayButton) {
    createReplayButton();
  } else {
    replayButton.classList.add('visible');
  }
}

function handleReplayClick(): void {
  if (isRunning) return;

  // Reset state
  aborted = false;
  sessionStorage.removeItem(STORAGE_KEY);

  // Hide button during demo
  hideReplayButton();

  // Re-add interaction listeners
  document.addEventListener('mousedown', handleUserInteraction, true);
  document.addEventListener('touchstart', handleUserInteraction, true);

  // Run demo
  runDemo();
}

function moveCursor(x: number, y: number): void {
  if (!demoCursor) return;
  demoCursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function showCursor(): void {
  demoCursor?.classList.add('visible');
}

function hideCursor(): void {
  demoCursor?.classList.remove('visible');
}

function showLabel(text: string, x: number, y: number): void {
  if (!demoLabel) return;
  demoLabel.textContent = text;
  demoLabel.style.transform = `translate3d(${x + 28}px, ${y + 8}px, 0)`;
  demoLabel.classList.add('visible');
}

function hideLabel(): void {
  demoLabel?.classList.remove('visible');
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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

function triggerHover(element: HTMLElement): void {
  const info = getElementInfo(element);
  if (info) {
    hoveredElement.value = info;
    // Trigger overlay update via the inspector
    const overlay = document.getElementById('inspector-overlay');
    if (overlay) {
      overlay.style.opacity = '1';
      overlay.style.top = `${info.rect.top}px`;
      overlay.style.left = `${info.rect.left}px`;
      overlay.style.width = `${info.rect.width}px`;
      overlay.style.height = `${info.rect.height}px`;
      const tagLabel = overlay.querySelector('div:first-child') as HTMLElement;
      const dimLabel = overlay.querySelector('div:last-child') as HTMLElement;
      if (tagLabel) tagLabel.textContent = info.tagName.toUpperCase();
      if (dimLabel) dimLabel.textContent = `${Math.round(info.rect.width)} × ${Math.round(info.rect.height)}`;
    }
  }
}

function triggerSelect(element: HTMLElement): void {
  const info = getElementInfo(element);
  if (info) {
    selectedElement.value = info;
    hoveredElement.value = null;
    // Update overlay to selected state
    const overlay = document.getElementById('inspector-overlay');
    if (overlay) {
      overlay.style.borderColor = '#4a9eff';
      overlay.style.background = 'rgba(74, 158, 255, 0.1)';
    }
  }
}

function clearInspectorState(): void {
  clearSelection();
  hoveredElement.value = null;
  const overlay = document.getElementById('inspector-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.borderColor = '#4a9eff';
    overlay.style.background = 'rgba(74, 158, 255, 0.05)';
  }
}

async function runDemo(): Promise<void> {
  if (isRunning || aborted) return;
  isRunning = true;

  createDemoElements();

  const heroTitle = document.querySelector('[data-element="hero.title"]') as HTMLElement;
  if (!heroTitle || !demoCursor) {
    cleanup();
    return;
  }

  const titleRect = heroTitle.getBoundingClientRect();
  const titleCenterX = titleRect.left + titleRect.width / 2;
  const titleCenterY = titleRect.top + titleRect.height / 2;

  // Step 1: Wait 500ms after load
  await wait(500);
  if (aborted) return cleanup();

  // Step 2: Show cursor off-screen, fade in, move to hero H1
  moveCursor(-50, window.innerHeight / 2);
  showCursor();
  await wait(100);
  if (aborted) return cleanup();

  moveCursor(titleCenterX, titleCenterY);
  await wait(600);
  if (aborted) return cleanup();

  // Step 3: Trigger hover state, show label
  triggerHover(heroTitle);
  showLabel('Hover and click to inspect', titleCenterX, titleCenterY);
  await wait(1200);
  if (aborted) return cleanup();

  // Step 4: Trigger click/panel open
  hideLabel();
  triggerSelect(heroTitle);
  await wait(500);
  if (aborted) return cleanup();

  const panel = document.querySelector('.styles-panel') as HTMLElement;
  if (panel) {
    // Target the text-primary color swatch (#A6ABA4)
    const colorSwatches = panel.querySelectorAll('.color-swatch');
    const primarySwatch = colorSwatches[0] as HTMLElement;

    if (primarySwatch) {
      const swatchRect = primarySwatch.getBoundingClientRect();
      const swatchX = swatchRect.left + swatchRect.width / 2;
      const swatchY = swatchRect.top + swatchRect.height / 2;

      moveCursor(swatchX, swatchY);
      await wait(500);
      if (aborted) return cleanup();

      // Click the swatch to change color
      if (heroTitle) {
        // Simulate click on swatch
        primarySwatch.click();

        await wait(300);
        if (aborted) return cleanup();

        showLabel('Play with the styles', swatchX, swatchY);

        await wait(1500);
        if (aborted) {
          return cleanup();
        }
      }
    }
  }

  await wait(300);
  if (aborted) return cleanup();

  // Step 6: Cursor exits screen
  hideLabel();
  moveCursor(window.innerWidth + 50, window.innerHeight / 2);
  await wait(600);
  if (aborted) return cleanup();

  hideCursor();

  // Step 7: Close panel, restore default state
  await wait(200);
  clearInspectorState();

  // Mark as completed
  sessionStorage.setItem(STORAGE_KEY, 'true');

  cleanup();

  // Show replay button after demo completes
  showReplayButton();
}

function cleanup(): void {
  isRunning = false;
  removeDemoElements();
}

function abort(): void {
  if (!isRunning) return;
  aborted = true;
  clearInspectorState();
  cleanup();
  // Show replay button when user aborts
  showReplayButton();
}

function handleUserInteraction(e: Event): void {
  // Only abort if user interacts with inspectable elements or the panel
  const target = e.target as HTMLElement;
  if (
    target.closest('[data-inspectable]') ||
    target.closest('.styles-panel') ||
    target.closest('#inspector-overlay')
  ) {
    abort();
    // Remove listeners after abort
    document.removeEventListener('mousedown', handleUserInteraction, true);
    document.removeEventListener('touchstart', handleUserInteraction, true);
  }
}

function isValidContext(): boolean {
  // Don't run on mobile (touch devices)
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return false;
  }

  // Only run on homepage
  if (window.location.pathname !== '/') {
    return false;
  }

  return true;
}

function shouldRunDemo(): boolean {
  if (!isValidContext()) return false;

  // Don't run if already played this session
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    return false;
  }

  return true;
}

function init(): void {
  if (!isValidContext()) return;

  // If demo was already played, just show replay button
  if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
    showReplayButton();
    return;
  }

  // Listen for user interaction to abort demo
  document.addEventListener('mousedown', handleUserInteraction, true);
  document.addEventListener('touchstart', handleUserInteraction, true);

  // Start demo
  runDemo();
}

// Initialize on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure inspector is initialized
    setTimeout(init, 100);
  }

  // Handle View Transitions - reset for new page loads on homepage
  document.addEventListener('astro:page-load', () => {
    // Clean up from previous page
    removeReplayButton();
    aborted = false;
    isRunning = false;
    init();
  });

  // Clean up before page swap
  document.addEventListener('astro:before-swap', () => {
    removeReplayButton();
    if (isRunning) {
      aborted = true;
      removeDemoElements();
    }
  });
}

export { init, abort };
