import { useEffect, useRef } from 'preact/hooks';
import { tokenChanges, syncStatus } from '../../lib/inspector/store';

export default function TokensConsole() {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tokenChanges.value.length]);

  const status = syncStatus.value;

  function getTime() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  return (
    <div class="tokens-console">
      <style>{`
        .tokens-console {
          position: fixed;
          bottom: 1.5rem;
          left: 1.5rem;
          width: 320px;
          background: #0d0d0d;
          border: 1px solid #1a1a1a;
          border-radius: 6px;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 0.65rem;
          overflow: hidden;
          z-index: 9997;
        }

        .tokens-console .console-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0.6rem;
          background: #111;
          border-bottom: 1px solid #1a1a1a;
          color: #555;
        }

        .tokens-console .console-tabs {
          display: flex;
          gap: 0.8rem;
        }

        .tokens-console .console-tab {
          color: #444;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .tokens-console .console-tab:hover {
          color: #666;
        }

        .tokens-console .console-tab.active {
          color: #888;
        }

        .tokens-console .build-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .tokens-console .build-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4caf50;
        }

        .tokens-console .build-dot.building {
          background: #f9a825;
          animation: pulse 0.5s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .tokens-console .console-body {
          height: 100px;
          overflow-y: auto;
          padding: 0.5rem 0;
        }

        .tokens-console .console-line {
          padding: 0.2rem 0.6rem;
          display: flex;
          gap: 0.6rem;
          opacity: 0;
          animation: fadeIn 0.2s ease forwards;
        }

        @keyframes fadeIn {
          to { opacity: 1; }
        }

        .tokens-console .console-line .time {
          color: #333;
          flex-shrink: 0;
        }

        .tokens-console .console-line .method {
          flex-shrink: 0;
          padding: 0.1rem 0.3rem;
          border-radius: 2px;
          font-size: 0.6rem;
        }

        .tokens-console .console-line .method.patch {
          background: #3a3a1a;
          color: #f9a825;
        }

        .tokens-console .console-line .method.sync {
          background: #1a2a3a;
          color: #4a9eff;
        }

        .tokens-console .console-line .endpoint {
          color: #888;
        }

        .tokens-console .console-line .token {
          color: #9cdcfe;
        }

        .tokens-console .console-line .value {
          color: #ce9178;
          margin-left: auto;
          flex-shrink: 0;
        }

        .tokens-console .empty-state {
          color: #333;
          text-align: center;
          padding: 1rem;
        }
      `}</style>

      {/* Header */}
      <div class="console-header">
        <div class="console-tabs">
          <span class="console-tab active">Tokens API</span>
        </div>
        <div class="build-status">
          <div class={`build-dot ${status === 'syncing' ? 'building' : ''}`} />
          <span>
            {status === 'idle' && 'Ready'}
            {status === 'syncing' && 'Syncing...'}
            {status === 'synced' && 'Synced'}
          </span>
        </div>
      </div>

      {/* Log entries */}
      <div ref={scrollRef} class="console-body">
        {tokenChanges.value.length === 0 ? (
          <div class="empty-state">Click an element to start editing</div>
        ) : (
          tokenChanges.value.map((change) => (
            <div key={change.id} class="console-line">
              <span class="time">{new Date(change.timestamp).toTimeString().split(' ')[0]}</span>
              <span class="method patch">PATCH</span>
              <span class="endpoint">/tokens/<span class="token">{change.elementId}</span>.{formatProperty(change.property)}</span>
              <span class="value">{change.newValue}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatProperty(property: string): string {
  // Convert CSS property like 'font-size' to 'fontSize'
  return property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
