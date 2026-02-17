import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

const STORAGE_KEY = "portfolio-mode-seen";

export default function ModeToggle() {
  const show = useSignal(false);
  const isTldr = useSignal(false);

  useEffect(() => {
    // Only show toggle if user has already made a choice
    try {
      if (!localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      return;
    }

    isTldr.value = window.location.pathname.startsWith("/tldr");
    show.value = true;
  }, []);

  if (!show.value) return null;

  function handleToggle() {
    if (isTldr.value) {
      window.location.href = "/";
    } else {
      window.location.href = "/tldr/";
    }
  }

  return (
    <button
      class="mode-toggle"
      onClick={handleToggle}
      role="switch"
      aria-checked={isTldr.value}
      aria-label={`Switch to ${isTldr.value ? "full portfolio" : "TL;DR"} mode`}
      type="button"
    >
      <span
        class={`mode-toggle-option ${!isTldr.value ? "mode-toggle-option--active" : ""}`}
      >
        Full
      </span>
      <span
        class={`mode-toggle-option ${isTldr.value ? "mode-toggle-option--active" : ""}`}
      >
        TL;DR
      </span>
      <span
        class="mode-toggle-indicator"
        style={{ transform: isTldr.value ? "translateX(100%)" : "translateX(0)" }}
      />
    </button>
  );
}
