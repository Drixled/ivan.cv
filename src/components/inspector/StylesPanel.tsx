import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { selectedElement, clearSelection, addTokenChange } from '../../lib/inspector/store';
import { updateElementStyle } from '../../lib/inspector/storage';

export default function StylesPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useSignal(false);
  const dragOffset = useSignal({ x: 0, y: 0 });
  const position = useSignal({ x: 100, y: 100 });

  // Current style values
  const color = useSignal('#e8e8e8');
  const fontSize = useSignal('16');
  const fontWeight = useSignal('400');
  const lineHeight = useSignal('1.2');
  const letterSpacing = useSignal('0');

  // Get current element info directly from signal
  const currentElement = selectedElement.value?.element;
  const currentElementId = selectedElement.value?.elementId ?? '';
  const currentTagName = selectedElement.value?.tagName ?? '';

  // Update values when element changes
  useEffect(() => {
    if (currentElement) {
      const computed = window.getComputedStyle(currentElement);
      color.value = rgbToHex(computed.color);
      fontSize.value = parseInt(computed.fontSize).toString();
      fontWeight.value = computed.fontWeight;
      lineHeight.value = parseFloat(computed.lineHeight) / parseFloat(computed.fontSize)
        ? (parseFloat(computed.lineHeight) / parseFloat(computed.fontSize)).toFixed(2)
        : '1.2';
      letterSpacing.value = computed.letterSpacing === 'normal'
        ? '0'
        : parseFloat(computed.letterSpacing).toFixed(2);

      // Position panel near element
      const rect = selectedElement.value!.rect;
      const panelWidth = 280;
      const panelHeight = 320;

      let x = rect.right + 16;
      let y = rect.top;

      // Keep panel in viewport
      if (x + panelWidth > window.innerWidth - 16) {
        x = rect.left - panelWidth - 16;
      }
      if (x < 16) x = 16;
      if (y + panelHeight > window.innerHeight - 16) {
        y = window.innerHeight - panelHeight - 16;
      }
      if (y < 16) y = 16;

      position.value = { x, y };
    }
  }, [currentElement]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('[data-inspectable]')
      ) {
        clearSelection();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dragging handlers
  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.panel-header')) {
      isDragging.value = true;
      dragOffset.value = {
        x: e.clientX - position.value.x,
        y: e.clientY - position.value.y,
      };
    }
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDragging.value) {
        position.value = {
          x: e.clientX - dragOffset.value.x,
          y: e.clientY - dragOffset.value.y,
        };
      }
    }

    function handleMouseUp() {
      isDragging.value = false;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  function applyStyle(property: string, value: string) {
    const el = selectedElement.value?.element;
    const elId = selectedElement.value?.elementId;
    if (!el || !elId) return;

    const oldValue = el.style.getPropertyValue(property) ||
      window.getComputedStyle(el).getPropertyValue(property);

    el.style.setProperty(property, value);
    updateElementStyle(elId, property, value);

    addTokenChange({
      elementId: elId,
      property,
      oldValue,
      newValue: value,
    });
  }

  if (!currentElement) return null;

  return (
    <div
      ref={panelRef}
      class="styles-panel"
      style={{ left: `${position.value.x}px`, top: `${position.value.y}px` }}
      onMouseDown={handleMouseDown}
    >
      <style>{`
        .styles-panel {
          position: fixed;
          width: 280px;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          z-index: 9999;
          overflow: hidden;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
        }

        .styles-panel .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 0.8rem;
          background: #0d0d0d;
          border-bottom: 1px solid #1a1a1a;
          cursor: move;
        }

        .styles-panel .panel-title {
          font-size: 0.7rem;
          color: #888;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .styles-panel .element-tag {
          color: #d7ba7d;
        }

        .styles-panel .panel-close {
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0;
          transition: color 0.15s ease;
        }

        .styles-panel .panel-close:hover {
          color: #e8e8e8;
        }

        .styles-panel .panel-content {
          padding: 0.8rem;
        }

        .styles-panel .style-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.6rem;
          gap: 0.5rem;
        }

        .styles-panel .style-row:last-child {
          margin-bottom: 0;
        }

        .styles-panel .style-prop {
          color: #9cdcfe;
          font-size: 0.7rem;
          width: 75px;
          flex-shrink: 0;
        }

        .styles-panel .style-input {
          flex: 1;
          background: #0a0a0a;
          border: 1px solid #222;
          border-radius: 3px;
          padding: 0.4rem 0.5rem;
          color: #ce9178;
          font-family: inherit;
          font-size: 0.7rem;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .styles-panel .style-input:focus {
          border-color: #4a9eff;
        }

        .styles-panel .style-input:hover {
          border-color: #333;
        }

        .styles-panel .color-row {
          display: flex;
          gap: 0.4rem;
          flex: 1;
        }

        .styles-panel .style-color {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border: 1px solid #222;
          border-radius: 3px;
          background: transparent;
          cursor: pointer;
          padding: 0;
        }

        .styles-panel .style-color::-webkit-color-swatch-wrapper {
          padding: 3px;
        }

        .styles-panel .style-color::-webkit-color-swatch {
          border-radius: 2px;
          border: none;
        }

        .styles-panel .style-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: #222;
          border-radius: 2px;
          cursor: pointer;
        }

        .styles-panel .style-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #e8e8e8;
          border-radius: 50%;
          cursor: pointer;
          transition: transform 0.1s ease;
        }

        .styles-panel .style-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .styles-panel .style-value {
          color: #ce9178;
          font-size: 0.7rem;
          min-width: 28px;
          text-align: right;
        }
      `}</style>

      {/* Header */}
      <div class="panel-header">
        <span class="panel-title">
          Styles: <span class="element-tag">{currentTagName}</span>
        </span>
        <button class="panel-close" onClick={() => clearSelection()}>×</button>
      </div>

      {/* Controls */}
      <div class="panel-content">
        {/* Color */}
        <div class="style-row">
          <span class="style-prop">color</span>
          <div class="color-row">
            <input
              type="color"
              class="style-color"
              value={color.value}
              onInput={(e) => {
                const newColor = (e.target as HTMLInputElement).value;
                color.value = newColor;
                applyStyle('color', newColor);
              }}
            />
            <input
              type="text"
              class="style-input"
              value={color.value}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value;
                if (/^#[0-9a-f]{6}$/i.test(val)) {
                  color.value = val;
                  applyStyle('color', val);
                }
              }}
            />
          </div>
        </div>

        {/* Font Size */}
        <div class="style-row">
          <span class="style-prop">font-size</span>
          <input
            type="text"
            class="style-input"
            value={`${fontSize.value}px`}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              const num = parseInt(val);
              if (!isNaN(num) && num > 0) {
                fontSize.value = num.toString();
                applyStyle('font-size', `${num}px`);
              }
            }}
          />
        </div>

        {/* Font Weight */}
        <div class="style-row">
          <span class="style-prop">font-weight</span>
          <input
            type="range"
            class="style-slider"
            min="100"
            max="900"
            step="1"
            value={fontWeight.value}
            onInput={(e) => {
              fontWeight.value = (e.target as HTMLInputElement).value;
              applyStyle('font-weight', fontWeight.value);
            }}
          />
          <span class="style-value">{fontWeight.value}</span>
        </div>

        {/* Line Height */}
        <div class="style-row">
          <span class="style-prop">line-height</span>
          <input
            type="text"
            class="style-input"
            value={lineHeight.value}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              const num = parseFloat(val);
              if (!isNaN(num) && num > 0) {
                lineHeight.value = val;
                applyStyle('line-height', val);
              }
            }}
          />
        </div>

        {/* Letter Spacing */}
        <div class="style-row">
          <span class="style-prop">letter-spacing</span>
          <input
            type="text"
            class="style-input"
            value={`${letterSpacing.value}px`}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              const num = parseFloat(val);
              if (!isNaN(num)) {
                letterSpacing.value = num.toString();
                applyStyle('letter-spacing', `${num}px`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return rgb.startsWith('#') ? rgb : '#e8e8e8';

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}
