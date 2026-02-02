function initFadeStagger(): void {
  document.querySelectorAll<HTMLElement>('.fade-stagger').forEach((el) => {
    const index = parseInt(el.dataset.stagger || '0', 10);
    const delay = index * 40;
    const duration = 350 + index * 40;

    el.style.transitionDelay = `${delay}ms`;
    el.style.transitionDuration = `${duration}ms`;

    // Trigger animation after a brief moment to ensure styles are applied
    setTimeout(() => {
      el.classList.add('visible');
    }, 10 + delay);
  });
}

function fadeOutStagger(): Promise<void> {
  return new Promise((resolve) => {
    const elements = document.querySelectorAll<HTMLElement>('.fade-stagger.visible');
    const count = elements.length;

    if (count === 0) {
      resolve();
      return;
    }

    // Reverse the stagger order for fade-out (last in, first out)
    elements.forEach((el) => {
      const index = parseInt(el.dataset.stagger || '0', 10);
      const reverseIndex = count - 1 - index;
      const delay = reverseIndex * 20;
      const duration = 200;

      el.style.transitionDelay = `${delay}ms`;
      el.style.transitionDuration = `${duration}ms`;
      el.classList.remove('visible');
    });

    // Wait for all animations to complete
    const maxDelay = (count - 1) * 20 + 200;
    setTimeout(resolve, maxDelay);
  });
}

// Initialize on page load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFadeStagger);
  } else {
    initFadeStagger();
  }

  // Handle View Transitions
  document.addEventListener('astro:page-load', initFadeStagger);

  // Fade out before page swap
  document.addEventListener('astro:before-preparation', async (event) => {
    const originalLoader = event.loader;
    event.loader = async function () {
      await fadeOutStagger();
      await originalLoader();
    };
  });
}

export { initFadeStagger, fadeOutStagger };
