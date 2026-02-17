import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

const STORAGE_KEY = "portfolio-mode-seen";

export default function ModeChoice() {
  const visible = useSignal(false);
  const closing = useSignal(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Only show if user hasn't seen it before
    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage unavailable, skip modal
      return;
    }

    // Small delay so modal animates in
    const timer = setTimeout(() => {
      visible.value = true;
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Focus trap + keyboard handling
  useEffect(() => {
    if (!visible.value) return;

    // Focus first card when modal appears
    firstCardRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        choose("full");
      }

      // Focus trap within modal
      if (e.key === "Tab" && overlayRef.current) {
        const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [visible.value]);

  function choose(mode: "full" | "tldr") {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // ignore
    }

    closing.value = true;

    setTimeout(() => {
      visible.value = false;
      closing.value = false;

      if (mode === "tldr") {
        window.location.href = "/tldr/";
      }
    }, 300);
  }

  if (!visible.value && !closing.value) return null;

  return (
    <div
      ref={overlayRef}
      class={`mode-choice-overlay ${closing.value ? "mode-choice-overlay--closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Choose how you'd like to browse this portfolio"
    >
      <div class="mode-choice-container">
        <p class="mode-choice-heading">How much time do you have?</p>

        <div class="mode-choice-cards">
          <button
            ref={firstCardRef}
            class="mode-choice-card"
            onClick={() => choose("full")}
            type="button"
          >
            <span class="mode-choice-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span class="mode-choice-label">I have time</span>
            <span class="mode-choice-desc">Full portfolio experience</span>
          </button>

          <button
            class="mode-choice-card"
            onClick={() => choose("tldr")}
            type="button"
          >
            <span class="mode-choice-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <span class="mode-choice-label">I don't have time</span>
            <span class="mode-choice-desc">The 60-second version</span>
          </button>
        </div>
      </div>
    </div>
  );
}
