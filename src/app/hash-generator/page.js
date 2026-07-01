"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import CryptoJS from "crypto-js";
import CertificateModal from "../components/CertificateModal";

const ALGORITHMS = [
  { id: "sha256", label: "SHA-256", native: true, webCryptoName: "SHA-256" },
  { id: "sha512", label: "SHA-512", native: true, webCryptoName: "SHA-512" },
  { id: "sha1",   label: "SHA-1",   native: false },
  { id: "md5",    label: "MD5",     native: false },
];

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

async function hashFileNative(file, algoName) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest(algoName, buffer);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashFileCryptoJS(file, algoId) {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  if (algoId === "md5")  return CryptoJS.MD5(wordArray).toString();
  if (algoId === "sha1") return CryptoJS.SHA1(wordArray).toString();
  return null;
}

// ─── ALGORITHM DROPDOWN ───────────────────────────────────────────────────────
function AlgoDropdown({ selectedAlgos, onToggle, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const summary = selectedAlgos.length === 0
    ? "None selected"
    : selectedAlgos.map(id => ALGORITHMS.find(a => a.id === id)?.label).join(", ");

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
        Algorithms
      </div>
      <button
        onClick={() => !disabled && setOpen(v => !v)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "var(--bg)", border: "0.5px solid var(--border2)",
          borderRadius: "8px", padding: "8px 12px",
          fontSize: "13px", color: "var(--text)", cursor: disabled ? "not-allowed" : "pointer",
          minWidth: "220px", justifyContent: "space-between",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ color: selectedAlgos.length === 0 ? "var(--text3)" : "var(--text)" }}>{summary}</span>
        <span style={{ color: "var(--text3)", fontSize: "10px", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
      </button>

      {open && !disabled && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200,
          background: "var(--bg2)", border: "0.5px solid var(--border)",
          borderRadius: "8px", padding: "8px 0", minWidth: "220px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}>
          {ALGORITHMS.map(algo => (
            <label
              key={algo.id}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", cursor: "pointer", fontSize: "13px", color: "var(--text)", transition: "background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--active-bg)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <input type="checkbox" checked={selectedAlgos.includes(algo.id)} onChange={() => onToggle(algo.id)} style={{ accentColor: "var(--accent)" }} />
              <span>{algo.label}</span>
              {selectedAlgos.includes(algo.id) && <span style={{ marginLeft: "auto", color: "#1D9E75", fontSize: "11px" }}>✓</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DROP ZONE ────────────────────────────────────────────────────────────────
function DropZone({ onFiles, onFolderUnsupported }) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  };

  const handleFolderClick = () => {
    const test = document.createElement("input");
    test.type = "file";
    if (!("webkitdirectory" in test)) { onFolderUnsupported(); return; }
    folderInputRef.current?.click();
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `1.5px dashed ${dragging ? "var(--accent)" : "var(--border2)"}`,
        borderRadius: "12px", padding: "40px 24px", textAlign: "center",
        background: dragging ? "rgba(29,158,117,0.05)" : "var(--bg2)",
        transition: "all 0.15s", cursor: "default",
      }}
    >
      <div style={{ fontSize: "28px", marginBottom: "10px" }}>🔒</div>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
        Drag &amp; drop files or folders here
      </div>
      <div style={{ fontSize: "12px", color: "var(--text3)", marginBottom: "20px" }}>
        Evidence never leaves your device — all hashing is done locally in your browser
      </div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => fileInputRef.current?.click()} style={{ background: "var(--bg)", border: "0.5px solid var(--border2)", color: "var(--text)", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
          Add Files
        </button>
        <button onClick={handleFolderClick} style={{ background: "var(--bg)", border: "0.5px solid var(--border2)", color: "var(--text)", borderRadius: "8px", padding: "8px 18px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
          Add Folder
        </button>
      </div>
      <input ref={fileInputRef} type="file" multiple onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
      <input ref={folderInputRef} type="file" webkitdirectory="" directory="" multiple onChange={(e) => { if (e.target.files?.length) onFiles(e.target.files); e.target.value = ""; }} style={{ display: "none" }} />
    </div>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ currentAlgo, filesDone, filesTotal }) {
  const pct = filesTotal === 0 ? 0 : Math.round((filesDone / filesTotal) * 100);
  const algoLabel = ALGORITHMS.find(a => a.id === currentAlgo)?.label || currentAlgo?.toUpperCase() || "";
  return (
    <div style={{ padding: "12px 16px", background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", color: "var(--text2)", fontWeight: 500 }}>
          Generating {algoLabel}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text3)" }}>
          File {filesDone} of {filesTotal} &nbsp;·&nbsp; {pct}%
        </span>
      </div>
      <div style={{ height: "4px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", borderRadius: "99px", transition: "width 0.2s ease" }} />
      </div>
    </div>
  );
}

// ─── STATUS CHIP ──────────────────────────────────────────────────────────────
function StatusChip({ processing, certReady, hasFiles }) {
  if (!hasFiles) return null;
  if (processing) return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#BA7517", background: "rgba(186,117,23,0.1)", border: "0.5px solid rgba(186,117,23,0.3)", borderRadius: "99px", padding: "4px 10px" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#BA7517", display: "inline-block" }} />
      Generating hashes...
    </div>
  );
  if (certReady) return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#1D9E75", background: "rgba(29,158,117,0.1)", border: "0.5px solid rgba(29,158,117,0.3)", borderRadius: "99px", padding: "4px 10px" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#1D9E75", display: "inline-block" }} />
      Ready for certificate generation
    </div>
  );
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text3)", background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "99px", padding: "4px 10px" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--text3)", display: "inline-block" }} />
      Waiting for algorithm selection
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HashGeneratorPage() {
  const [files, setFiles] = useState([]);
  const [selectedAlgos, setSelectedAlgos] = useState(["sha256", "sha512"]);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progressState, setProgressState] = useState({ currentAlgo: null, filesDone: 0, filesTotal: 0 });
  const [folderUnsupported, setFolderUnsupported] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  // Queue ref — holds the next set of (files, algos) to process when the current run finishes
  const queuedWorkRef = useRef(null);
  const runningRef = useRef(false);

  // ── Core hashing engine ────────────────────────────────────────────────────
  // Takes a snapshot of files + algos and computes all missing hashes.
  const runHashingPass = useCallback(async (fileSnapshot, algoSnapshot) => {
    // Build work list: only entries missing at least one selected algo
    const workList = fileSnapshot.filter(f => algoSnapshot.some(a => !f.hashes[a]));
    if (workList.length === 0) return;

    setProcessing(true);

    // Process algo by algo so the progress label says "Generating SHA-256 · File 1 of 7"
    for (const algoId of algoSnapshot) {
      const algoObj = ALGORITHMS.find(a => a.id === algoId);
      const algoWorkList = fileSnapshot.filter(f => !f.hashes[algoId]);
      if (algoWorkList.length === 0) continue;

      setProgressState({ currentAlgo: algoId, filesDone: 0, filesTotal: algoWorkList.length });

      for (let i = 0; i < algoWorkList.length; i++) {
        const entry = algoWorkList[i];

        // Mark as hashing
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: "hashing" } : f));

        let hashValue;
        try {
          hashValue = algoObj.native
            ? await hashFileNative(entry.file, algoObj.webCryptoName)
            : await hashFileCryptoJS(entry.file, algoId);
        } catch (err) {
          console.error(`Hash error for ${entry.file.name} [${algoId}]:`, err);
          hashValue = "ERROR";
        }

        // Write hash back, and only mark "done" if ALL currently selected algos are present
        setFiles(prev => prev.map(f => {
          if (f.id !== entry.id) return f;
          const updatedHashes = { ...f.hashes, [algoId]: hashValue };
          // status = done only when every selected algo has a value
          const allPresent = algoSnapshot.every(a => updatedHashes[a]);
          return { ...f, hashes: updatedHashes, status: allPresent ? "done" : "hashing" };
        }));

        setProgressState(prev => ({ ...prev, filesDone: i + 1 }));
      }
    }

    setProcessing(false);
    setProgressState({ currentAlgo: null, filesDone: 0, filesTotal: 0 });
  }, []);

  // ── Queue / scheduler ──────────────────────────────────────────────────────
  // Called whenever files or selectedAlgos change.
  // If already running, just records the latest desired state so the next pass picks it up.
  const scheduleWork = useCallback((currentFiles, currentAlgos) => {
    if (runningRef.current) {
      // Something is already running — record latest desired state
      queuedWorkRef.current = { files: currentFiles, algos: currentAlgos };
      return;
    }

    const hasWork = currentFiles.some(f => currentAlgos.some(a => !f.hashes[a]));
    if (!hasWork) return;

    runningRef.current = true;

    runHashingPass(currentFiles, currentAlgos).then(() => {
      runningRef.current = false;
      // If something was queued while we ran, process it now
      if (queuedWorkRef.current) {
        const { files: qFiles, algos: qAlgos } = queuedWorkRef.current;
        queuedWorkRef.current = null;
        scheduleWork(qFiles, qAlgos);
      }
    });
  }, [runHashingPass]);

  // ── Invariant enforcer ─────────────────────────────────────────────────────
  // Fires whenever files or selectedAlgos change — checks if any work is needed.
  useEffect(() => {
    if (files.length === 0 || selectedAlgos.length === 0) return;
    scheduleWork(files, selectedAlgos);
  }, [files, selectedAlgos]); // eslint-disable-line react-hooks/exhaustive-deps

  const addFiles = (fileList) => {
    const newEntries = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      relativePath: file.webkitRelativePath || file.name,
      hashes: {},
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...newEntries]);
  };

  const toggleAlgo = (algoId) => {
    setSelectedAlgos((prev) =>
      prev.includes(algoId) ? prev.filter((a) => a !== algoId) : [...prev, algoId]
    );
  };

  const removeFile = (id) => setFiles((prev) => prev.filter((f) => f.id !== id));
  const clearAll = () => {
    setFiles([]);
    setProgressState({ currentAlgo: null, filesDone: 0, filesTotal: 0 });
  };

  const handleSaveAuditLog = async (logData) => {
    try {
      await fetch("/api/hash-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      });
    } catch (err) {
      console.error("Audit log save failed:", err);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const downloadHashFile = (entry) => {
    const lines = selectedAlgos
      .filter((a) => entry.hashes[a])
      .map((a) => `${ALGORITHMS.find((alg) => alg.id === a).label}: ${entry.hashes[a]}`);
    const content = `Filename: ${entry.file.name}\nSize: ${formatBytes(entry.file.size)}\n\n${lines.join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entry.file.name}.hash.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFiles = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter((f) =>
      f.file.name.toLowerCase().includes(q) ||
      f.relativePath.toLowerCase().includes(q) ||
      Object.values(f.hashes).some((h) => h && h.toLowerCase().includes(q))
    );
  }, [files, search]);

  const certReady = files.length > 0 && selectedAlgos.length > 0 &&
    files.every(f => selectedAlgos.every(a => f.hashes[a] && f.hashes[a] !== "ERROR"));
  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
          Hash Generator
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
          Digital Evidence Integrity &amp; Certification
        </p>
      </div>

      {/* Drop zone */}
      <DropZone onFiles={addFiles} onFolderUnsupported={() => setFolderUnsupported(true)} />

      {folderUnsupported && (
        <div style={{ background: "rgba(186,117,23,0.1)", border: "0.5px solid #BA7517", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#854F0B", marginTop: "12px" }}>
          ⚠ Folder upload isn't supported in this browser. Use Add Files instead, or switch to Chrome/Edge.
        </div>
      )}

      {/* Controls row */}
      {files.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap", marginTop: "20px", padding: "16px", background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
          <AlgoDropdown selectedAlgos={selectedAlgos} onToggle={toggleAlgo} disabled={processing} />

          <div style={{ flex: 1 }} />

          <StatusChip processing={processing} certReady={certReady} hasFiles={files.length > 0} />

          <button
            onClick={clearAll}
            style={{ background: "transparent", color: "#A32D2D", border: "0.5px solid #F09595", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", cursor: "pointer", alignSelf: "flex-end" }}
          >
            Clear All
          </button>

          <button
            onClick={() => setShowCertificateModal(true)}
            disabled={!certReady}
            style={{
              background: certReady ? "var(--accent)" : "var(--bg3)",
              color: certReady ? "var(--accent-text)" : "var(--text3)",
              border: "none", padding: "8px 20px", borderRadius: "8px",
              fontSize: "13px", fontWeight: 600,
              cursor: certReady ? "pointer" : "not-allowed",
              alignSelf: "flex-end", transition: "background 0.2s, color 0.2s",
            }}
            title={!certReady ? "Waiting for hashes to complete" : ""}
          >
            📜 Generate Certificate
          </button>
        </div>
      )}

      {/* Progress bar */}
      {processing && (
        <div style={{ marginTop: "12px" }}>
          <ProgressBar
            currentAlgo={progressState.currentAlgo}
            filesDone={progressState.filesDone}
            filesTotal={progressState.filesTotal}
          />
        </div>
      )}

      {/* Search + stats */}
      {files.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "16px", marginBottom: "12px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or hash..."
            style={{ flex: "0 0 280px" }}
          />
          <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "var(--text2)", flexWrap: "wrap" }}>
            <span>Files: <strong style={{ color: "var(--text)" }}>{files.length}</strong></span>
            <span>Size: <strong style={{ color: "var(--text)" }}>{formatBytes(totalSize)}</strong></span>
            <span>Algorithms: <strong style={{ color: "var(--text)" }}>
              {selectedAlgos.length === 0 ? "None" : selectedAlgos.map(id => ALGORITHMS.find(a => a.id === id)?.label).join(", ")}
            </strong></span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div style={{ border: "0.5px solid var(--border)", borderRadius: "12px", padding: "48px", textAlign: "center", marginTop: "16px" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>No evidence files yet</div>
          <div style={{ fontSize: "13px", color: "var(--text2)" }}>Upload files or a folder to begin generating integrity hashes</div>
        </div>
      )}

      {/* Table */}
      {files.length > 0 && (
        <div style={{ overflowX: "auto", border: "0.5px solid var(--border)", borderRadius: "12px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--bg2)", borderBottom: "0.5px solid var(--border)" }}>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Filename</th>
                <th style={thStyle}>Size</th>
                {ALGORITHMS.filter((a) => selectedAlgos.includes(a.id)).map((algo) => (
                  <th key={algo.id} style={thStyle}>{algo.label}</th>
                ))}
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((entry, index) => (
                <tr key={entry.id} style={{ borderBottom: "0.5px solid var(--border)" }}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 500, color: "var(--text)" }}>{entry.file.name}</td>
                  <td style={tdStyle}>{formatBytes(entry.file.size)}</td>
                  {ALGORITHMS.filter((a) => selectedAlgos.includes(a.id)).map((algo) => {
                    const hashValue = entry.hashes[algo.id];
                    const key = `${entry.id}-${algo.id}`;
                    return (
                      <td key={algo.id} style={{ ...tdStyle, fontFamily: "monospace", fontSize: "11px" }}>
                        {hashValue ? (
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "11px", whiteSpace: "pre-wrap", wordBreak: "break-all", overflowWrap: "anywhere", lineHeight: "1.4" }}>
                              {hashValue}
                            </span>
                            <button
                              onClick={() => copyToClipboard(hashValue, key)}
                              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: copiedKey === key ? "#1D9E75" : "var(--text3)" }}
                              title="Copy"
                            >
                              {copiedKey === key ? "✓" : "📋"}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--text3)" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                  <td style={tdStyle}>
                    {entry.status === "pending" && <span style={{ color: "var(--text3)" }}>Pending</span>}
                    {entry.status === "hashing" && <span style={{ color: "#BA7517" }}>⌛ Hashing</span>}
                    {entry.status === "done"    && <span style={{ color: "#1D9E75" }}>✓ Done</span>}
                    {entry.status === "error"   && <span style={{ color: "#A32D2D" }}>❌ Error</span>}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {entry.status === "done" && (
                        <button onClick={() => downloadHashFile(entry)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px" }} title="Download hash file">⬇</button>
                      )}
                      <button onClick={() => removeFile(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#A32D2D" }} title="Remove">✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCertificateModal && (
        <CertificateModal
          files={files}
          selectedAlgos={selectedAlgos}
          onClose={() => setShowCertificateModal(false)}
          onSaveAuditLog={handleSaveAuditLog}
        />
      )}
    </div>
  );
}

const thStyle = {
  padding: "10px 14px", textAlign: "left", fontSize: "11px",
  fontWeight: 500, color: "var(--text3)", textTransform: "uppercase",
  letterSpacing: "0.6px", whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 14px", color: "var(--text2)",
  whiteSpace: "nowrap", verticalAlign: "top",
};