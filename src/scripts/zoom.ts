import mediumZoom, { type Zoom } from 'medium-zoom';

let zoom: Zoom | null = null;
let pendingInit: number | null = null;

function initZoom(): void {
  // Cancel any pending initialization
  if (pendingInit) {
    clearTimeout(pendingInit);
    pendingInit = null;
  }

  // Only init if we're on a project page
  const projectContent = document.querySelector('.project-content');
  if (!projectContent) {
    // Clean up zoom if navigating away from project page
    if (zoom) {
      zoom.detach();
      zoom = null;
    }
    return;
  }

  // Detach previous instance to prevent duplicates
  if (zoom) {
    zoom.detach();
    zoom = null;
  }

  // Wait for stagger animations to settle and images to be in DOM
  pendingInit = window.setTimeout(() => {
    const images = document.querySelectorAll('.project-content img');
    if (images.length === 0) return;

    zoom = mediumZoom('.project-content img', {
      background: 'rgba(0, 0, 0, 0.9)',
      margin: 24,
    });
    pendingInit = null;
  }, 100);
}

// Clean up before page swap to prevent stuck zoomed images
function cleanup(): void {
  if (pendingInit) {
    clearTimeout(pendingInit);
    pendingInit = null;
  }
  if (zoom) {
    zoom.close();
    zoom.detach();
    zoom = null;
  }
}

if (typeof document !== 'undefined') {
  // Initialize immediately for pages without ClientRouter
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initZoom);
  } else {
    initZoom();
  }

  // Handle View Transitions (if ClientRouter is added later)
  document.addEventListener('astro:page-load', initZoom);
  document.addEventListener('astro:before-swap', cleanup);
}

export { initZoom, cleanup };
