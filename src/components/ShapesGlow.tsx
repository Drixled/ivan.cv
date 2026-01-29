import { useEffect, useRef } from 'preact/hooks';

// Store rotation state outside component to persist across re-renders and navigations
let globalRotation = 0;
let globalLastTime = 0;

export default function ShapesGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize time if first run
    if (globalLastTime === 0) {
      globalLastTime = performance.now();
    }

    const ROTATION_SPEED = 360 / 60000; // 360 degrees per 60 seconds

    function animate(currentTime: number) {
      const deltaTime = currentTime - globalLastTime;
      globalLastTime = currentTime;

      globalRotation = (globalRotation + ROTATION_SPEED * deltaTime) % 360;

      if (container) {
        container.style.transform = `translateX(-50%) rotate(${globalRotation}deg)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      class="absolute left-1/2 -top-[320px] w-[500px] h-[500px] pointer-events-none select-none"
    >
      <img
        src="/shapes.svg"
        alt=""
        class="w-full h-full"
      />
    </div>
  );
}
