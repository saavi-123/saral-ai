"use client";

import { useState, useRef, useMemo } from "react";
import CryptoJS from "crypto-js";
import CertificateModal from "../components/CertificateModal";

const ALGORITHMS = [
  { id: "sha256", label: "SHA-256", native: true, webCryptoName: "SHA-256" },
  { id: "sha512", label: "SHA-512", native: true, webCryptoName: "SHA-512" },
  { id: "sha1", label: "SHA-1", native: false },
  { id: "md5", label: "MD5", native: false },
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
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashFileCryptoJS(file, algoId) {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  if (algoId === "md5") return CryptoJS.MD5(wordArray).toString();
  if (algoId === "sha1") return CryptoJS.SHA1(wordArray).toString();
  return null;
}

export default function HashGeneratorPage() {
  const [files, setFiles] = useState([]); // { id, file, relativePath, hashes: {}, status }
  const [selectedAlgos, setSelectedAlgos] = useState(["sha256", "sha512"]);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [folderUnsupported, setFolderUnsupported] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const toggleAlgo = (algoId) => {
    setSelectedAlgos((prev) =>
      prev.includes(algoId) ? prev.filter((a) => a !== algoId) : [...prev, algoId]
    );
  };

  const handleFolderClick = () => {
    // Feature detection for webkitdirectory
    const testInput = document.createElement("input");
    testInput.type = "file";
    if (!("webkitdirectory" in testInput)) {
      setFolderUnsupported(true);
      return;
    }
    setFolderUnsupported(false);
    folderInputRef.current?.click();
  };

  const addFiles = (fileList) => {
    const newEntries = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      relativePath: file.webkitRelativePath || file.name,
      hashes: {},
      status: "pending", // pending | hashing | done | error
    }));
    setFiles((prev) => [...prev, ...newEntries]);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleFolderInput = (e) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.target.value = "";
  };

  const computeHashesForEntry = async (entry, algos) => {
    const hashes = { ...entry.hashes };

    for (const algoId of algos) {
      if (hashes[algoId]) continue; // already computed, e.g. algo selection changed

      const algo = ALGORITHMS.find((a) => a.id === algoId);
      try {
        if (algo.native) {
          hashes[algoId] = await hashFileNative(entry.file, algo.webCryptoName);
        } else {
          hashes[algoId] = await hashFileCryptoJS(entry.file, algoId);
        }
      } catch (err) {
        console.error(`Hash error for ${entry.file.name} [${algoId}]:`, err);
        hashes[algoId] = "ERROR";
      }
    }

    return hashes;
  };

  const generateHashes = async () => {
    if (files.length === 0 || selectedAlgos.length === 0) return;

    setProcessing(true);
    const pending = files.filter((f) => f.status !== "done" || selectedAlgos.some((a) => !f.hashes[a]));
    setProgress({ done: 0, total: pending.length });

    // Process sequentially to avoid freezing the tab on large batches
    for (let i = 0; i < files.length; i++) {
      const entry = files[i];
      const needsWork = selectedAlgos.some((a) => !entry.hashes[a]);
      if (!needsWork) continue;

      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, status: "hashing" } : f))
      );

      const hashes = await computeHashesForEntry(entry, selectedAlgos);

      setFiles((prev) =>
        prev.map((f) => (f.id === entry.id ? { ...f, hashes, status: "done" } : f))
      );

      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    setProcessing(false);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setProgress({ done: 0, total: 0 });
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
      // Non-fatal — certificate already downloaded, just log the failure
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
    return files.filter((f) => {
      if (f.file.name.toLowerCase().includes(q)) return true;
      if (f.relativePath.toLowerCase().includes(q)) return true;
      return Object.values(f.hashes).some(
        (h) => h && h.toLowerCase().includes(q)
      );
    });
  }, [files, search]);

  const allDone = files.length > 0 && files.every((f) => f.status === "done");

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
          Hash Generator
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text2)", marginTop: "4px" }}>
          Digital Evidence Integrity &amp; Certification
        </p>
      </div>

      {/* Top toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          margin: "24px 0",
          padding: "16px",
          background: "var(--bg2)",
          borderRadius: "12px",
          border: "0.5px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "9px 18px", borderRadius: "8px",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            📄 Upload Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            style={{ display: "none" }}
          />

          <button
            onClick={handleFolderClick}
            style={{
              background: "transparent", color: "var(--text2)",
              border: "0.5px solid var(--border2)", padding: "9px 18px", borderRadius: "8px",
              fontSize: "13px", fontWeight: 500, cursor: "pointer",
            }}
          >
            📁 Upload Folder
          </button>
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            onChange={handleFolderInput}
            style={{ display: "none" }}
          />

          {files.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: "transparent", color: "#A32D2D",
                border: "0.5px solid #F09595", padding: "9px 18px", borderRadius: "8px",
                fontSize: "13px", fontWeight: 500, cursor: "pointer",
              }}
            >
              Clear All
            </button>
          )}
          {files.length > 0 && (
            <button
                onClick={() => setShowCertificateModal(true)}
                style={{
                background: "transparent", color: "var(--text2)",
                border: "0.5px solid var(--border2)", padding: "9px 18px", borderRadius: "8px",
                fontSize: "13px", fontWeight: 500, cursor: "pointer",
                }}
            >
                📜 Generate Certificate
            </button>
            )}
        </div>

        {/* Algorithm selector */}
        <div>
          <div style={{ fontSize: "11px", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "8px" }}>
            Hash Algorithms
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {ALGORITHMS.map((algo) => (
              <label
                key={algo.id}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  fontSize: "13px", color: "var(--text)", cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedAlgos.includes(algo.id)}
                  onChange={() => toggleAlgo(algo.id)}
                />
                {algo.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {folderUnsupported && (
        <div
          style={{
            background: "rgba(186,117,23,0.1)", border: "0.5px solid #BA7517",
            borderRadius: "8px", padding: "12px 16px",
            fontSize: "13px", color: "#854F0B", marginBottom: "20px",
          }}
        >
          ⚠ Folder upload isn't supported in this browser. Please use Upload Files instead, or
          switch to Chrome/Edge for folder support.
        </div>
      )}

      {/* Generate button + progress */}
      {files.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <button
            onClick={generateHashes}
            disabled={processing || selectedAlgos.length === 0}
            style={{
              background: "var(--accent)", color: "var(--accent-text)",
              border: "none", padding: "10px 24px", borderRadius: "8px",
              fontSize: "14px", fontWeight: 500, cursor: "pointer",
              opacity: processing || selectedAlgos.length === 0 ? 0.5 : 1,
            }}
          >
            {processing ? "Generating..." : "Generate Hashes"}
          </button>

          {processing && (
            <div style={{ fontSize: "13px", color: "var(--text2)" }}>
              Processing {progress.done} / {progress.total} files...
            </div>
          )}

          {!processing && allDone && (
            <div style={{ fontSize: "13px", color: "#1D9E75" }}>
              ✓ All hashes generated
            </div>
          )}
        </div>
      )}

      {/* Search */}
      {files.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search filename or hash..."
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>
      )}

      {/* Stats */}
      {files.length > 0 && (
        <div style={{ display: "flex", gap: "24px", marginBottom: "16px", fontSize: "13px", color: "var(--text2)" }}>
          <div>Total Files: <strong style={{ color: "var(--text)" }}>{files.length}</strong></div>
          <div>Algorithms: <strong style={{ color: "var(--text)" }}>{selectedAlgos.length}</strong></div>
          <div>Total Size: <strong style={{ color: "var(--text)" }}>
            {formatBytes(files.reduce((sum, f) => sum + f.file.size, 0))}
          </strong></div>
        </div>
      )}

      {/* Table */}
      {files.length === 0 ? (
        <div
          style={{
            border: "0.5px solid var(--border)", borderRadius: "12px",
            padding: "48px", textAlign: "center",
          }}
        >
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔒</div>
          <div style={{ fontWeight: 500, fontSize: "16px", color: "var(--text)", marginBottom: "8px" }}>
            No evidence files yet
          </div>
          <div style={{ fontSize: "13px", color: "var(--text2)" }}>
            Upload files or a folder to begin generating integrity hashes
          </div>
        </div>
      ) : (
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
                            <span style={{fontFamily: "monospace", fontSize: "11px", whiteSpace: "pre-wrap", wordBreak: "break-all", overflowWrap: "anywhere", lineHeight: "1.4",}}
                            >
                              {hashValue}
                            </span>
                            <button
                              onClick={() => copyToClipboard(hashValue, key)}
                              style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: "12px", color: copiedKey === key ? "#1D9E75" : "var(--text3)",
                              }}
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
                    {entry.status === "done" && <span style={{ color: "#1D9E75" }}>✓ Done</span>}
                    {entry.status === "error" && <span style={{ color: "#A32D2D" }}>❌ Error</span>}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {entry.status === "done" && (
                        <button
                          onClick={() => downloadHashFile(entry)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px" }}
                          title="Download hash file"
                        >
                          ⬇
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(entry.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "#A32D2D" }}
                        title="Remove"
                      >
                        ✕
                      </button>
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
  padding: "10px 14px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--text3)",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "10px 14px",
  color: "var(--text2)",
  whiteSpace: "nowrap",
  verticalAlign: "top",
};