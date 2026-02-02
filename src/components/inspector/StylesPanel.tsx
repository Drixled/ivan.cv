import { useSignal } from '@preact/signals';
import { useEffect, useRef } from 'preact/hooks';
import { selectedElement, clearSelection } from '../../lib/inspector/store';
import { updateElementStyle, clearElementStyles } from '../../lib/inspector/storage';

interface StylesPanelProps {
  preview?: boolean;
}

export default function StylesPanel({ preview = false }: StylesPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Get current element info directly from signal
  const currentElement = preview ? null : selectedElement.value?.element;
  const currentTagName = preview ? 'h1' : (selectedElement.value?.tagName ?? '');
  const elementRect = preview ? null : selectedElement.value?.rect;

  // Calculate initial position to the right of the element
  const gap = 16;
  const initialPos = elementRect
    ? { top: elementRect.top, left: elementRect.right + gap }
    : { top: 100, left: 100 };

  // Dragging state
  const position = useSignal(initialPos);
  const isDragging = useSignal(false);
  const dragOffset = useSignal({ x: 0, y: 0 });

  // Current style values
  const color = useSignal('#e8e8e8');
  const fontWeight = useSignal('400');
  const lineHeight = useSignal('1.2');
  const letterSpacing = useSignal('0');
  const slant = useSignal('0');
  const opticalSize = useSignal('16');
  const softness = useSignal('0');
  const wonk = useSignal('0');
  const isVariableFont = useSignal(false);

  // Original style values (before any modifications)
  const originalStyles = useRef<{
    color: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
    slant: string;
    opticalSize: string;
    softness: string;
    wonk: string;
  } | null>(null);

  // Update style values when element changes
  useEffect(() => {
    if (currentElement) {
      // First, remove any inline styles to get the true original computed values
      const inlineColor = currentElement.style.color;
      const inlineFontWeight = currentElement.style.fontWeight;
      const inlineLineHeight = currentElement.style.lineHeight;
      const inlineLetterSpacing = currentElement.style.letterSpacing;
      const inlineFontStyle = currentElement.style.fontStyle;

      currentElement.style.color = '';
      currentElement.style.fontWeight = '';
      currentElement.style.lineHeight = '';
      currentElement.style.letterSpacing = '';
      currentElement.style.fontStyle = '';

      const computed = window.getComputedStyle(currentElement);
      const origFontSize = parseFloat(computed.fontSize);
      const origTagName = currentElement.tagName.toLowerCase();

      // Compute original variable font axis values
      let origOpticalSize: string;
      let origWonk: string;
      if (origTagName === 'h1' && origFontSize >= 48) {
        origOpticalSize = '72';
        origWonk = '1';
      } else if (origTagName === 'h2' && origFontSize >= 16) {
        origOpticalSize = '24';
        origWonk = '0';
      } else {
        origOpticalSize = String(Math.min(144, Math.max(9, Math.round(origFontSize))));
        origWonk = '0';
      }

      // Store original values
      originalStyles.current = {
        color: rgbToHex(computed.color),
        fontWeight: computed.fontWeight,
        lineHeight: parseFloat(computed.lineHeight) / parseFloat(computed.fontSize)
          ? (parseFloat(computed.lineHeight) / parseFloat(computed.fontSize)).toFixed(2)
          : '1.2',
        letterSpacing: computed.letterSpacing === 'normal'
          ? '0'
          : parseFloat(computed.letterSpacing).toFixed(2),
        slant: computed.fontStyle === 'italic' ? '1' : '0',
        opticalSize: origOpticalSize,
        softness: '0',
        wonk: origWonk,
      };

      // Restore inline styles
      currentElement.style.color = inlineColor;
      currentElement.style.fontWeight = inlineFontWeight;
      currentElement.style.lineHeight = inlineLineHeight;
      currentElement.style.letterSpacing = inlineLetterSpacing;
      currentElement.style.fontStyle = inlineFontStyle;

      // Now get current values (with inline styles applied)
      const currentComputed = window.getComputedStyle(currentElement);
      color.value = rgbToHex(currentComputed.color);
      fontWeight.value = currentComputed.fontWeight;
      lineHeight.value = parseFloat(currentComputed.lineHeight) / parseFloat(currentComputed.fontSize)
        ? (parseFloat(currentComputed.lineHeight) / parseFloat(currentComputed.fontSize)).toFixed(2)
        : '1.2';
      letterSpacing.value = currentComputed.letterSpacing === 'normal'
        ? '0'
        : parseFloat(currentComputed.letterSpacing).toFixed(2);
      slant.value = currentComputed.fontStyle === 'italic' ? '1' : '0';

      // Check if element uses Fraunces (variable font)
      const fontFamily = currentComputed.fontFamily.toLowerCase();
      isVariableFont.value = fontFamily.includes('fraunces');

      // Set variable font axes defaults only for Fraunces
      if (isVariableFont.value) {
        const fontSize = parseFloat(currentComputed.fontSize);
        if (fontSize >= 48) {
          opticalSize.value = '72';
          wonk.value = '1';
        } else {
          opticalSize.value = String(Math.min(144, Math.max(9, Math.round(fontSize))));
          wonk.value = '0';
        }
        softness.value = '0';
      }

      // Update position when element changes
      position.value = {
        top: selectedElement.value!.rect.top,
        left: selectedElement.value!.rect.right + gap,
      };
    }
  }, [currentElement]);

  // Dragging handlers
  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.panel-header')) {
      isDragging.value = true;
      dragOffset.value = {
        x: e.clientX - position.value.left,
        y: e.clientY - position.value.top,
      };
    }
  }

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDragging.value) {
        position.value = {
          left: e.clientX - dragOffset.value.x,
          top: e.clientY - dragOffset.value.y,
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

  function applyStyle(property: string, value: string) {
    const el = selectedElement.value?.element;
    const elId = selectedElement.value?.elementId;
    if (!el || !elId) return;

    el.style.setProperty(property, value);
    updateElementStyle(elId, property, value);
  }

  function applyVariationSettings() {
    const el = selectedElement.value?.element;
    const elId = selectedElement.value?.elementId;
    if (!el || !elId) return;

    const value = `'opsz' ${opticalSize.value}, 'SOFT' ${softness.value}, 'WONK' ${wonk.value}`;
    el.style.fontVariationSettings = value;
    updateElementStyle(elId, 'font-variation-settings', value);
  }

  function resetStyles() {
    const el = selectedElement.value?.element;
    const elId = selectedElement.value?.elementId;
    if (!el || !elId || !originalStyles.current) return;

    // Remove inline styles
    el.style.color = '';
    el.style.fontWeight = '';
    el.style.lineHeight = '';
    el.style.letterSpacing = '';
    el.style.fontStyle = '';
    el.style.fontVariationSettings = '';

    // Clear from storage
    clearElementStyles(elId);

    // Reset signal values to originals
    color.value = originalStyles.current.color;
    fontWeight.value = originalStyles.current.fontWeight;
    lineHeight.value = originalStyles.current.lineHeight;
    letterSpacing.value = originalStyles.current.letterSpacing;
    slant.value = originalStyles.current.slant;
    opticalSize.value = originalStyles.current.opticalSize;
    softness.value = originalStyles.current.softness;
    wonk.value = originalStyles.current.wonk;
  }

  if (!preview && !currentElement) return null;

  return (
    <div
      ref={panelRef}
      class={`styles-panel ${preview ? 'styles-panel--preview' : ''}`}
      style={preview ? {} : { top: `${position.value.top}px`, left: `${position.value.left}px` }}
      onMouseDown={preview ? undefined : handleMouseDown}
    >
      <style>{`
        .styles-panel {
          position: fixed;
          width: 280px;
          background: #111;
          border: 1px solid #222;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          font-family: 'Hanken Grotesk', sans-serif;
          z-index: 9999;
        }

        .styles-panel--preview {
          position: static;
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
          font-size: 0.8rem;
          color: #888;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .styles-panel .element-tag {
          color: #d7ba7d;
          text-transform: uppercase;
        }

        .styles-panel .panel-close {
          background: none;
          border: none;
          color: #555;
          cursor: pointer;
          font-size: 1.35rem;
          line-height: 1;
          padding: 0.35rem;
          margin: -0.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
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
          font-size: 0.8rem;
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
          font-size: 0.8rem;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .styles-panel .style-input:focus {
          border-color: #4a9eff;
        }

        .styles-panel .style-input:hover {
          border-color: #333;
        }

        .styles-panel .color-swatches {
          display: flex;
          gap: 0.5rem;
          margin-left: auto;
        }

        .styles-panel .color-swatch {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .styles-panel .color-swatch:hover {
          transform: scale(1.15);
        }

        .styles-panel .color-swatch--active {
          border-color: #fff;
        }

        .styles-panel .slider-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 99px;
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.6rem;
        }

        .styles-panel .slider-label {
          color: #888;
          font-size: 0.8rem;
          flex-shrink: 0;
        }

        .styles-panel .style-slider {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 1px;
          background: #444;
          border-radius: 1px;
          cursor: pointer;
        }

        .styles-panel .style-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          background: #A6ABA4;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .styles-panel .style-slider::-webkit-slider-thumb:hover {
          background: #c8cdc6;
        }

        .styles-panel .slider-value {
          color: #888;
          font-size: 0.8rem;
          min-width: 28px;
          text-align: right;
        }

        .styles-panel .toggle-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 99px;
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.6rem;
        }

        .styles-panel .toggle-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
        }

        .styles-panel .toggle-item {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 99px;
          padding: 0.5rem 0.75rem;
        }

        .styles-panel .toggle-label {
          color: #888;
          font-size: 0.8rem;
        }

        .styles-panel .toggle-btn {
          width: 36px;
          height: 20px;
          background: #333;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          position: relative;
          transition: background-color 0.15s ease;
        }

        .styles-panel .toggle-btn--active {
          background: #A6ABA4;
        }

        .styles-panel .toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 14px;
          height: 14px;
          background: #888;
          border-radius: 50%;
          transition: transform 0.15s ease, background-color 0.15s ease;
          pointer-events: none;
        }

        .styles-panel .toggle-btn--active .toggle-knob {
          transform: translateX(16px);
          background: #111;
        }

        .styles-panel .style-value {
          color: #888;
          font-size: 0.8rem;
          min-width: 32px;
          text-align: right;
        }

        .styles-panel .panel-footer {
          padding: 0 0.8rem 0.8rem;
        }

        .styles-panel .reset-btn {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border: none;
          border-radius: 99px;
          color: #888;
          font-family: inherit;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .styles-panel .reset-btn:hover {
          background: rgba(0, 0, 0, 0.35);
          color: #aaa;
        }
      `}</style>

      {/* Header */}
      <div class="panel-header">
        <span class="panel-title">
          Styles: <span class="element-tag">{currentTagName}</span>
        </span>
        <button class="panel-close" onClick={preview ? undefined : () => clearSelection()}>×</button>
      </div>

      {/* Controls */}
      <div class="panel-content">
        {/* Color Swatches */}
        <div class="slider-wrapper">
          <span class="slider-label">Color</span>
          <div class="color-swatches">
            {['#A6ABA4', '#6B7468', '#FFFFFF', '#FF5500', '#4a9eff'].map((swatchColor) => (
              <button
                key={swatchColor}
                type="button"
                class={`color-swatch ${color.value.toLowerCase() === swatchColor.toLowerCase() ? 'color-swatch--active' : ''}`}
                style={{ backgroundColor: swatchColor }}
                onClick={() => {
                  color.value = swatchColor;
                  applyStyle('color', swatchColor);
                }}
              />
            ))}
          </div>
        </div>

        {/* Font Weight */}
        <div class="slider-wrapper">
          <span class="slider-label">Weight</span>
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
          <span class="slider-value">{fontWeight.value}</span>
        </div>

        {/* Line Height - commented out for now
        <div class="slider-wrapper">
          <span class="slider-label">Leading</span>
          <input
            type="range"
            class="style-slider"
            min="0.8"
            max="2.5"
            step="0.05"
            value={lineHeight.value}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              lineHeight.value = val;
              applyStyle('line-height', val);
            }}
          />
          <span class="slider-value">{lineHeight.value}</span>
        </div>
        */}

        {/* Letter Spacing - commented out for now
        <div class="slider-wrapper">
          <span class="slider-label">Spacing</span>
          <input
            type="range"
            class="style-slider"
            min="-2"
            max="10"
            step="0.5"
            value={letterSpacing.value}
            onInput={(e) => {
              const val = (e.target as HTMLInputElement).value;
              letterSpacing.value = val;
              applyStyle('letter-spacing', `${val}px`);
            }}
          />
          <span class="slider-value">{letterSpacing.value}</span>
        </div>
        */}

        {/* Variable font controls - only for Fraunces */}
        {isVariableFont.value && (
          <>
            {/* Optical Size */}
            <div class="slider-wrapper">
              <span class="slider-label">Optical</span>
              <input
                type="range"
                class="style-slider"
                min="9"
                max="144"
                step="1"
                value={opticalSize.value}
                onInput={(e) => {
                  opticalSize.value = (e.target as HTMLInputElement).value;
                  applyVariationSettings();
                }}
              />
              <span class="slider-value">{opticalSize.value}</span>
            </div>

            {/* Softness */}
            <div class="slider-wrapper">
              <span class="slider-label">Soft</span>
              <input
                type="range"
                class="style-slider"
                min="0"
                max="100"
                step="1"
                value={softness.value}
                onInput={(e) => {
                  softness.value = (e.target as HTMLInputElement).value;
                  applyVariationSettings();
                }}
              />
              <span class="slider-value">{softness.value}</span>
            </div>
          </>
        )}

        {/* Wonk & Italic (Wonk only for variable fonts) */}
        <div class="toggle-row">
          {isVariableFont.value && (
            <div class="toggle-item">
              <span class="toggle-label">Wonk</span>
              <button
                type="button"
                class={`toggle-btn ${wonk.value === '1' ? 'toggle-btn--active' : ''}`}
                onClick={() => {
                  wonk.value = wonk.value === '0' ? '1' : '0';
                  applyVariationSettings();
                }}
              >
                <span class="toggle-knob" />
              </button>
            </div>
          )}
          <div class="toggle-item">
            <span class="toggle-label">Italic</span>
            <button
              type="button"
              class={`toggle-btn ${slant.value === '1' ? 'toggle-btn--active' : ''}`}
              onClick={() => {
                slant.value = slant.value === '0' ? '1' : '0';
                applyStyle('font-style', slant.value === '1' ? 'italic' : 'normal');
              }}
            >
              <span class="toggle-knob" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div class="panel-footer">
        <button class="reset-btn" onClick={resetStyles}>
          Reset
        </button>
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
