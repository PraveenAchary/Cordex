import { useState, useRef, useEffect, useCallback } from "react";
import {useNavigate} from "react-router-dom";
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #060a12;
    font-family: 'Space Grotesk', sans-serif;
  }

  .cx-root {
    font-family: 'Space Grotesk', sans-serif;
    background: #0a0e17;
    color: #c8d0e0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ── Topbar ── */
  .cx-topbar {
    background: #0d1220;
    border-bottom: 1px solid #1e2a3a;
    padding: 0 16px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .cx-logo { display: flex; align-items: center; gap: 10px; }

  .cx-logo-icon {
    width: 28px; height: 28px; border-radius: 6px;
    background: #00e5a0;
    display: flex; align-items: center; justify-content: center;
  }

  .cx-logo-text {
    font-size: 15px; font-weight: 600; color: #e8edf5; letter-spacing: 0.04em;
  }

  .cx-logo-version {
    font-size: 10px; font-family: 'JetBrains Mono', monospace;
    color: #00e5a0; background: #00e5a010;
    border: 1px solid #00e5a030; padding: 2px 6px; border-radius: 4px;
  }

  .cx-topbar-right { display: flex; align-items: center; gap: 12px; }

  .cx-roast-wrap {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 10px; border-radius: 6px;
    background: #111827; border: 1px solid #1e2a3a;
    cursor: pointer; transition: border-color 0.2s; user-select: none;
  }

  .cx-roast-wrap:hover { border-color: #ff6b6b40; }
  .cx-roast-wrap.active { border-color: #ff6b6b60; background: #ff6b6b08; }

  .cx-roast-label {
    font-size: 12px; font-weight: 500; color: #7a8ba0; letter-spacing: 0.03em;
  }

  .cx-roast-wrap.active .cx-roast-label { color: #ff6b6b; }

  .cx-toggle {
    width: 32px; height: 16px; border-radius: 8px;
    background: #1e2a3a; position: relative; transition: background 0.2s; flex-shrink: 0;
  }

  .cx-roast-wrap.active .cx-toggle { background: #ff6b6b40; }

  .cx-toggle-knob {
    width: 12px; height: 12px; border-radius: 50%;
    background: #3a4a60; position: absolute; top: 2px; left: 2px;
    transition: left 0.2s, background 0.2s;
  }

  .cx-roast-wrap.active .cx-toggle-knob { left: 18px; background: #ff6b6b; }

  /* ── Validate button ── */
  .cx-validate-btn {
    background: transparent;
    color: #5b9bd5;
    border: 1px solid #1e3a5a;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Space Grotesk', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
    letter-spacing: 0.02em;
  }

  .cx-validate-btn:hover {
    background: #5b9bd510;
    border-color: #5b9bd560;
    color: #7ab8f5;
  }

  .cx-validate-btn:active { transform: scale(0.97); }

  .cx-validate-btn:disabled {
    color: #2a3a50;
    border-color: #1a2a3a;
    cursor: not-allowed;
    background: transparent;
  }

  /* ── Run button ── */
  .cx-run-btn {
    background: #00e5a0; color: #051a10; border: none;
    padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 600;
    font-family: 'Space Grotesk', sans-serif; cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: background 0.15s, transform 0.1s; letter-spacing: 0.02em;
  }

  .cx-run-btn:hover { background: #00c98d; }
  .cx-run-btn:active { transform: scale(0.97); }
  .cx-run-btn:disabled { background: #0a6644; color: #0d3324; cursor: not-allowed; }

  /* ── Panels ── */
  .cx-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex: 1;
    min-height: 0;
    height: calc(100vh - 48px - 34px);
  }

  @media (max-width: 700px) {
    .cx-panels { grid-template-columns: 1fr; grid-template-rows: 1fr 1fr; }
    .cx-editor-pane { border-right: none; border-bottom: 1px solid #1e2a3a; }
  }

  .cx-editor-pane {
    display: flex; flex-direction: column; border-right: 1px solid #1e2a3a;
  }

  .cx-pane-header {
    background: #0d1220; border-bottom: 1px solid #1e2a3a;
    padding: 8px 14px; display: flex;
    align-items: center; justify-content: space-between; flex-shrink: 0;
  }

  .cx-pane-title {
    font-size: 11px; font-weight: 500; color: #4a5c72;
    letter-spacing: 0.08em; text-transform: uppercase;
  }

  .cx-file-tab {
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
    color: #7a8ba0; background: #111827;
    border: 1px solid #1e2a3a; padding: 3px 10px; border-radius: 4px;
  }

  .cx-editor-wrap { flex: 1; position: relative; overflow: hidden; }

  .cx-editor {
    flex: 1; background: #0a0e17;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; line-height: 1.7; color: #c8d0e0;
    border: none; outline: none; resize: none;
    padding: 16px 16px 16px 52px;
    width: 100%; height: 100%;
    tab-size: 2; white-space: pre; overflow: auto;
    background-image: repeating-linear-gradient(
      transparent,
      transparent calc(1.7em - 1px),
      #1e2a3a18 calc(1.7em - 1px),
      #1e2a3a18 1.7em
    );
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  }

  .cx-editor::selection { background: #00e5a020; }

  .cx-line-nums {
    position: absolute; top: 16px; left: 0; width: 40px;
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    line-height: 1.7; color: #2a3a4a; text-align: right;
    padding-right: 10px; pointer-events: none; user-select: none;
    z-index: 1;
  }

  /* ── Output ── */
  .cx-output-pane { display: flex; flex-direction: column; }

  .cx-output-body {
    flex: 1; padding: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; line-height: 1.7;
    overflow-y: auto;
  }

  .cx-output-empty { color: #2a3a4a; font-style: italic; margin-top: 8px; display: block; }

  .cx-output-line { display: block; color: #9ab0c8; margin: 1px 0; }
  .cx-output-line.error { color: #ff6b6b; }
  .cx-output-line.success { color: #00e5a0; }
  .cx-output-line.muted { color: #3a4a60; }
  .cx-output-line.roast {
    color: #ffb86c; border-left: 2px solid #ff6b6b50;
    padding-left: 10px; margin-top: 10px; font-style: italic;
  }
  .cx-output-line.valid { color: #5b9bd5; }

  /* ── Status bar ── */
  .cx-status-bar {
    background: #0d1220; border-top: 1px solid #1e2a3a;
    padding: 5px 14px; display: flex; align-items: center;
    justify-content: space-between; flex-shrink: 0; height: 34px;
  }

  .cx-status-left { display: flex; align-items: center; gap: 14px; }

  .cx-status-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #00e5a0;
  }
  .cx-status-dot.running { animation: pulse 1s infinite; }
  .cx-status-dot.error { background: #ff6b6b; animation: none; }
  .cx-status-dot.idle { background: #3a4a60; animation: none; }
  .cx-status-dot.done { background: #00e5a0; animation: none; }
  .cx-status-dot.validating { background: #5b9bd5; animation: pulse 1s infinite; }
  .cx-status-dot.valid { background: #5b9bd5; animation: none; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .cx-status-text {
    font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #3a4a60;
  }

  .cx-cursor-info {
    font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #2a3a4a;
  }

  .cx-clear-btn {
    background: transparent; border: none; color: #3a4a60;
    font-size: 11px; font-family: 'JetBrains Mono', monospace;
    cursor: pointer; padding: 2px 6px; border-radius: 3px; transition: color 0.15s;
  }

  .cx-clear-btn:hover { color: #ff6b6b; }

  .cx-spinner {
    display: inline-block; width: 10px; height: 10px;
    border: 2px solid #051a1040; border-top-color: #051a10;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }

  .cx-spinner-blue {
    display: inline-block; width: 10px; height: 10px;
    border: 2px solid #1e3a5a; border-top-color: #5b9bd5;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
`;

const DEFAULT_CODE =
`let name = "Cordex"
print("Welcome to Cordex!");
`;

// ── Point to Render backend via Vercel env variable ──
const API_BASE = import.meta.env.VITE_API_URL || "";

function RunIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor">
      <path d="M2 1.5L9 5.5L2 9.5V1.5Z" />
    </svg>
  );
}

function ValidateIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1.5,6 4,8.5 9.5,2.5" />
    </svg>
  );
}

function Spinner() {
  return <div className="cx-spinner" />;
}

function SpinnerBlue() {
  return <div className="cx-spinner-blue" />;
}

export default function Homepage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState(null);
  const [roastMode, setRoastMode] = useState(false);
  const [running, setRunning] = useState(false);
  const [validating, setValidating] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "ready" });
  const [cursor, setCursor] = useState({ ln: 1, col: 1 });
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const lineNumsRef = useRef(null);
  const outputBodyRef = useRef(null);

  useEffect(() => {
    const id = "cordex-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = STYLES;
      document.head.appendChild(style);
    }
  }, []);

  const syncScroll = useCallback(() => {
    if (!editorRef.current || !lineNumsRef.current) return;
    lineNumsRef.current.style.top = 16 - editorRef.current.scrollTop + "px";
  }, []);

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");

  function handleChange(e) {
    setCode(e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.target;
      const s = ta.selectionStart;
      const newVal = ta.value.substring(0, s) + "  " + ta.value.substring(ta.selectionEnd);
      setCode(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 2;
      });
    }
  }

  function handleKeyUp(e) {
    const ta = e.target;
    const lines = ta.value.substr(0, ta.selectionStart).split("\n");
    setCursor({ ln: lines.length, col: lines[lines.length - 1].length + 1 });
  }

  function handleClick(e) {
    const ta = e.target;
    const lines = ta.value.substr(0, ta.selectionStart).split("\n");
    setCursor({ ln: lines.length, col: lines[lines.length - 1].length + 1 });
  }

  function clearOutput() {
    setOutput(null);
    setStatus({ type: "idle", text: "ready" });
  }

  async function handleValidate() {
    const trimmed = code.trim();
    if (!trimmed) return;

    setValidating(true);
    setStatus({ type: "validating", text: "validating..." });
    setOutput([{ text: "$ cordex validate main.cdx", cls: "muted" }]);

    try {
      const res = await fetch(`${API_BASE}/Cordex/Interpreter/api/validate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: trimmed }),
      });

      const data = await res.json();
      const lines = [{ text: "$ cordex validate main.cdx", cls: "muted" }];

      if (data.value) {
        lines.push({ text: "✔ " + (data.message || "Syntax Looks Fine"), cls: "valid" });
        setStatus({ type: "valid", text: "valid" });
      } else {
        lines.push({ text: "✖ Validation failed", cls: "error" });
        if (data.message) {
          lines.push({ text: "  " + data.message, cls: "error" });
        }
        if (data.errors && data.errors.length > 0) {
          lines.push({ text: "", cls: "muted" });
          data.errors.forEach((err) => lines.push({ text: "  " + err, cls: "error" }));
        }
        if (data.stage) {
          lines.push({ text: "stage: " + data.stage, cls: "muted" });
        }
        setStatus({ type: "error", text: "validation failed" });
      }

      setOutput(lines);
    } catch (err) {
      console.error("Cordex validate error:", err);
      setOutput([
        { text: "$ cordex validate main.cdx", cls: "muted" },
        { text: "✖ Could not reach Cordex backend", cls: "error" },
        { text: `  Tried: ${API_BASE}/Cordex/Interpreter/api/validate/`, cls: "muted" },
      ]);
      setStatus({ type: "error", text: "connection failed" });
    } finally {
      setValidating(false);
    }
  }

  async function handleRun() {
    const trimmed = code.trim();
    if (!trimmed) return;

    setRunning(true);
    setStatus({ type: "running", text: "running..." });
    setOutput([{ text: "$ cordex run main.cdx", cls: "muted" }]);

    try {
      const res = await fetch(`${API_BASE}/Cordex/Interpreter/api/compile/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: trimmed, roast_mode: roastMode }),
      });

      const data = await res.json();
      const lines = [{ text: "$ cordex run main.cdx", cls: "muted" }];

      if (data.output) {
        const outputStr = Array.isArray(data.output)
          ? data.output.join("\n")
          : data.output;
        outputStr.split("\n").forEach((line) => {
          if (line.trim()) lines.push({ text: line, cls: "success" });
        });
      }

      if (data.has_error && data.error && data.error.length > 0) {
        lines.push({ text: "", cls: "muted" });
        data.error.forEach((err) => lines.push({ text: "✖ " + err, cls: "error" }));
        if (data.stage) lines.push({ text: "stage: " + data.stage, cls: "muted" });
        setStatus({ type: "error", text: "error in " + (data.stage || "execution") });
      } else {
        setStatus({ type: "done", text: "done" });
      }

      if (roastMode && data.roast) {
        lines.push({ text: "", cls: "muted" });
        lines.push({ text: "🔥 " + data.roast, cls: "roast" });
      }

      setOutput(lines);
    } catch (err) {
      console.error("Cordex error:", err);
      setOutput([
        { text: "$ cordex run main.cdx", cls: "muted" },
        { text: "✖ Could not reach Cordex backend", cls: "error" },
        { text: `  Tried: ${API_BASE}/Cordex/Interpreter/api/compile/`, cls: "muted" },
      ]);
      setStatus({ type: "error", text: "connection failed" });
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => {
    if (outputBodyRef.current) {
      outputBodyRef.current.scrollTop = outputBodyRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="cx-root">
      {/* Topbar */}
      <div className="cx-topbar">
        <div className="cx-logo">
          <div className="cx-logo-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8 L8 3 L13 8 L8 13 Z" fill="#051a10" />
              <path d="M6 8 L8 6 L10 8 L8 10 Z" fill="#00e5a0" opacity="0.7" />
            </svg>
          </div>
          <span className="cx-logo-text">Cordex</span>
          <span className="cx-logo-version">v0.1</span>
        </div>

        <div className="cx-topbar-right">
          <div
            className={`cx-roast-wrap${roastMode ? " active" : ""}`}
            onClick={() => setRoastMode((r) => !r)}
          >
            <span style={{ fontSize: 13 }}>🔥</span>
            <span className="cx-roast-label">Roast Mode</span>
            <div className="cx-toggle">
              <div className="cx-toggle-knob" />
            </div>
          </div>
          <button
            className="cx-validation-btn"
            onclick={()=>{navigate("/docs")}
            style = {{borderColor:"#6c63ff",color:"#a29bfe"}}
            >
            📘 Docs
          </button>
          <button
            className="cx-validate-btn"
            onClick={handleValidate}
            disabled={validating || running}
          >
            {validating ? <SpinnerBlue /> : <ValidateIcon />}
            {validating ? "Validating" : "Validate"}
          </button>

          <button className="cx-run-btn" onClick={handleRun} disabled={running || validating}>
            {running ? <Spinner /> : <RunIcon />}
            {running ? "Running" : "Run"}
          </button>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="cx-panels">
        {/* Editor */}
        <div className="cx-editor-pane">
          <div className="cx-pane-header">
            <span className="cx-pane-title">editor</span>
            <span className="cx-file-tab">main.cdx</span>
          </div>
          <div className="cx-editor-wrap">
            <div className="cx-line-nums" ref={lineNumsRef} style={{ whiteSpace: "pre" }}>
              {lineNumbers}
            </div>
            <textarea
              ref={editorRef}
              className="cx-editor"
              value={code}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onClick={handleClick}
              onScroll={syncScroll}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/* Output */}
        <div className="cx-output-pane">
          <div className="cx-pane-header">
            <span className="cx-pane-title">output</span>
            <button className="cx-clear-btn" onClick={clearOutput}>clear</button>
          </div>
          <div className="cx-output-body" ref={outputBodyRef}>
            {output === null ? (
              <span className="cx-output-empty"># run your code to see output</span>
            ) : (
              output.map((line, i) =>
                line.text === "" ? (
                  <br key={i} />
                ) : (
                  <span key={i} className={`cx-output-line ${line.cls || ""}`}>
                    {line.text}
                  </span>
                )
              )
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="cx-status-bar">
        <div className="cx-status-left">
          <div className={`cx-status-dot ${status.type}`} />
          <span className="cx-status-text">{status.text}</span>
        </div>
        <span className="cx-cursor-info">Ln {cursor.ln}, Col {cursor.col}</span>
      </div>
    </div>
  );
}
