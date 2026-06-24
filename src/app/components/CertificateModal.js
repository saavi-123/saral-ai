"use client";

import { useState } from "react";

// ─── ACROFORM FIELD MAP ───────────────────────────────────────────────────────
// All 56 field names extracted from the AcroForm PDF template.
// Checkboxes: on_state = "Yes", off_state = "Off" (confirmed from PDF).

const FIELDS = {
  // ── PART A ──────────────────────────────────────────────────────────────────
  a_name:          "Text-Ny1XGsXvdi",
  a_relation:      "Text-DQ_iZhgVto",
  a_address:       "Text-Eeq-ERFReZ",
  a_device_other:  "Text-Hk8O8p5DoS",
  a_make_model:    "Text-SH6iXK1wbf",
  a_color:         "Text-kiWt7CAmAk",
  a_serial:        "Text-6S_OIOaUNF",
  a_imei:          "Text-lNVNodC-Xn",
  a_other_info:    "Text-GDI-Z4Wo4_",
  a_hash_value:    "Text-klEwEGrslS",   // AUTO
  a_other_algo:    "Text-kxoV4GTRci",
  a_date:          "Date-mBWkGHDb9Q",   // AUTO
  a_time:          "Text-POddwFFiAd",   // AUTO
  a_place:         "Text-xED8v1p2lL",
  // device checkboxes
  a_cb_computer:   "CheckBox-SlBtTvn7nx",
  a_cb_dvr:        "CheckBox-V8Ese-8-ox",
  a_cb_mobile:     "CheckBox-gTGfjfgzW3",
  a_cb_flashdrive: "CheckBox-do1ugJu39w",
  a_cb_cddvd:      "CheckBox-DprWsrWCjZ",
  a_cb_server:     "CheckBox-ABu1Vu7FUp",
  a_cb_cloud:      "CheckBox-w3heCMMtpP",
  a_cb_other:      "CheckBox-KasuqPfTvj",
  // control type checkboxes
  a_cb_owned:      "CheckBox-oGZP4vGdTb",
  a_cb_maintained: "CheckBox-dl9HWo8AnE",
  a_cb_managed:    "CheckBox-vNa_iAbyQG",
  a_cb_operated:   "CheckBox-C2oQrCG_Sa",
  // algorithm checkboxes (AUTO based on selectedAlgos)
  a_cb_sha1:       "CheckBox-Zk3K1DPthT",
  a_cb_sha256:     "CheckBox-sItG_XqTwN",
  a_cb_md5:        "CheckBox-27X-DRkIP2",
  a_cb_other_algo: "CheckBox-D52tQXqAMh",

  // ── PART B ──────────────────────────────────────────────────────────────────
  b_name:          "Text-REI0dM0nw_",
  b_relation:      "Text-enDjeNSaTL",
  b_address:       "Text-Sy4YM4btlk",
  b_device_other:  "Text-2pnAxF5ez_",
  b_make_model:    "Text-OMR1yylHbO",
  b_color:         "Text-vFd6T-uoeR",
  b_serial:        "Text-SdS92cHIRr",
  b_imei:          "Text-5Cjcu1WW8x",
  b_other_info:    "Text-RZRJLKJkYF",
  b_hash_value:    "Text-sLUL7D7Lip",   // AUTO
  b_other_algo:    "Text-AlZB26zhYB",
  b_date:          "Date-pCI02uFtl0",   // AUTO
  b_place:          "Text-Lu51ULw_xe",   // AUTO
  b_time:         "Text-DI9lXE-oxu",   
  // device checkboxes
  b_cb_computer:   "CheckBox-BdqY9dVH1x",
  b_cb_dvr:        "CheckBox-pD65VfmhgR",
  b_cb_mobile:     "CheckBox-wDf6_vOmwo",
  b_cb_flashdrive: "CheckBox-oZkV90mvF4",
  b_cb_cddvd:      "CheckBox-p9-sOi-azm",
  b_cb_server:     "CheckBox-S_kAU2nWe3",
  b_cb_cloud:      "CheckBox-Tac0dZADiN",
  b_cb_other:      "CheckBox-z0iBij8fiy",
  // algorithm checkboxes (AUTO)
  b_cb_sha1:       "CheckBox-tbD8Zc1VyT",
  b_cb_sha256:     "CheckBox-o38rjllPuy",
  b_cb_md5:        "CheckBox-CTCPe2QwL6",
  b_cb_other_algo: "CheckBox-6V07LxWi9H",
};

const DEVICE_OPTIONS = [
  { label: "Computer / Storage Media", keyA: "a_cb_computer",   keyB: "b_cb_computer"   },
  { label: "DVR",                       keyA: "a_cb_dvr",        keyB: "b_cb_dvr"        },
  { label: "Mobile",                    keyA: "a_cb_mobile",     keyB: "b_cb_mobile"     },
  { label: "Flash Drive",               keyA: "a_cb_flashdrive", keyB: "b_cb_flashdrive" },
  { label: "CD/DVD",                    keyA: "a_cb_cddvd",      keyB: "b_cb_cddvd"      },
  { label: "Server",                    keyA: "a_cb_server",     keyB: "b_cb_server"     },
  { label: "Cloud",                     keyA: "a_cb_cloud",      keyB: "b_cb_cloud"      },
  { label: "Other",                     keyA: "a_cb_other",      keyB: "b_cb_other"      },
];

const CONTROL_OPTIONS = [
  { label: "Owned",      key: "a_cb_owned"      },
  { label: "Maintained", key: "a_cb_maintained" },
  { label: "Managed",    key: "a_cb_managed"    },
  { label: "Operated",   key: "a_cb_operated"   },
];

function emptyForm() {
  return {
    a_name: "", a_relation: "", a_address: "",
    a_device_other: "", a_make_model: "", a_color: "",
    a_serial: "", a_imei: "", a_other_info: "",
    a_other_algo: "", a_place: "",
    a_cb_computer: false, a_cb_dvr: false, a_cb_mobile: false,
    a_cb_flashdrive: false, a_cb_cddvd: false, a_cb_server: false,
    a_cb_cloud: false, a_cb_other: false,
    a_cb_owned: false, a_cb_maintained: false,
    a_cb_managed: false, a_cb_operated: false,
    a_cb_other_algo: false,

    b_name: "", b_relation: "", b_address: "",
    b_device_other: "", b_make_model: "", b_color: "",
    b_serial: "", b_imei: "", b_other_info: "",
    b_other_algo: "", b_place: "",
    b_cb_computer: false, b_cb_dvr: false, b_cb_mobile: false,
    b_cb_flashdrive: false, b_cb_cddvd: false, b_cb_server: false,
    b_cb_cloud: false, b_cb_other: false,
    b_cb_other_algo: false,
  };
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

// ─── PDF GENERATION ───────────────────────────────────────────────────────────
async function generateCertificatePDF({ templateBytes, form, selectedFiles, selectedAlgos, hashLineValue, caseNumber, policeStation, investigatingOfficer }) {
  const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,"0")}/${String(now.getMonth()+1).padStart(2,"0")}/${now.getFullYear()}`;
  const timeStr = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  // 1. Load AcroForm template
  const pdfDoc = await PDFDocument.load(templateBytes);
  const pdfForm = pdfDoc.getForm();

  // Helper to safely set a text field
  const setText = (fieldName, value) => {
    if (!value) return;
    try {
      const field = pdfForm.getTextField(fieldName);
      field.setText(String(value));
    } catch (e) {
      console.warn(`Could not set field ${fieldName}:`, e.message);
    }
  };

  // Helper to safely check a checkbox
  const setCheck = (fieldName, checked) => {
    try {
      const field = pdfForm.getCheckBox(fieldName);
      if (checked) field.check();
      else field.uncheck();
    } catch (e) {
      console.warn(`Could not set checkbox ${fieldName}:`, e.message);
    }
  };

  // 2. Populate Part A text fields
  setText(FIELDS.a_name,         form.a_name);
  setText(FIELDS.a_relation,     form.a_relation);
  setText(FIELDS.a_address,      form.a_address);
  setText(FIELDS.a_device_other, form.a_device_other);
  setText(FIELDS.a_make_model,   form.a_make_model);
  setText(FIELDS.a_color,        form.a_color);
  setText(FIELDS.a_serial,       form.a_serial);
  setText(FIELDS.a_imei,         form.a_imei);
  setText(FIELDS.a_other_info,   form.a_other_info);
  setText(FIELDS.a_other_algo,   form.a_other_algo);
  setText(FIELDS.a_place,        form.a_place);
  setText(FIELDS.a_hash_value,   hashLineValue);     // AUTO
  setText(FIELDS.a_date,         dateStr);            // AUTO
  setText(FIELDS.a_time,         timeStr);            // AUTO

  // Part A device checkboxes
  setCheck(FIELDS.a_cb_computer,   form.a_cb_computer);
  setCheck(FIELDS.a_cb_dvr,        form.a_cb_dvr);
  setCheck(FIELDS.a_cb_mobile,     form.a_cb_mobile);
  setCheck(FIELDS.a_cb_flashdrive, form.a_cb_flashdrive);
  setCheck(FIELDS.a_cb_cddvd,      form.a_cb_cddvd);
  setCheck(FIELDS.a_cb_server,     form.a_cb_server);
  setCheck(FIELDS.a_cb_cloud,      form.a_cb_cloud);
  setCheck(FIELDS.a_cb_other,      form.a_cb_other);

  // Part A control type checkboxes
  setCheck(FIELDS.a_cb_owned,      form.a_cb_owned);
  setCheck(FIELDS.a_cb_maintained, form.a_cb_maintained);
  setCheck(FIELDS.a_cb_managed,    form.a_cb_managed);
  setCheck(FIELDS.a_cb_operated,   form.a_cb_operated);

  // Part A algorithm checkboxes (AUTO from selectedAlgos)
  setCheck(FIELDS.a_cb_sha1,       selectedAlgos.includes("sha1"));
  setCheck(FIELDS.a_cb_sha256,     selectedAlgos.includes("sha256"));
  setCheck(FIELDS.a_cb_md5,        selectedAlgos.includes("md5"));
  setCheck(FIELDS.a_cb_other_algo, form.a_cb_other_algo);

  // 3. Populate Part B text fields
  setText(FIELDS.b_name,         form.b_name);
  setText(FIELDS.b_relation,     form.b_relation);
  setText(FIELDS.b_address,      form.b_address);
  setText(FIELDS.b_device_other, form.b_device_other);
  setText(FIELDS.b_make_model,   form.b_make_model);
  setText(FIELDS.b_color,        form.b_color);
  setText(FIELDS.b_serial,       form.b_serial);
  setText(FIELDS.b_imei,         form.b_imei);
  setText(FIELDS.b_other_info,   form.b_other_info);
  setText(FIELDS.b_other_algo,   form.b_other_algo);
  setText(FIELDS.b_place,        form.b_place);
  setText(FIELDS.b_hash_value,   hashLineValue);     // AUTO
  setText(FIELDS.b_date,         dateStr);            // AUTO
  setText(FIELDS.b_time,         timeStr);            // AUTO

  // Part B device checkboxes
  setCheck(FIELDS.b_cb_computer,   form.b_cb_computer);
  setCheck(FIELDS.b_cb_dvr,        form.b_cb_dvr);
  setCheck(FIELDS.b_cb_mobile,     form.b_cb_mobile);
  setCheck(FIELDS.b_cb_flashdrive, form.b_cb_flashdrive);
  setCheck(FIELDS.b_cb_cddvd,      form.b_cb_cddvd);
  setCheck(FIELDS.b_cb_server,     form.b_cb_server);
  setCheck(FIELDS.b_cb_cloud,      form.b_cb_cloud);
  setCheck(FIELDS.b_cb_other,      form.b_cb_other);

  // Part B algorithm checkboxes (AUTO)
  setCheck(FIELDS.b_cb_sha1,       selectedAlgos.includes("sha1"));
  setCheck(FIELDS.b_cb_sha256,     selectedAlgos.includes("sha256"));
  setCheck(FIELDS.b_cb_md5,        selectedAlgos.includes("md5"));
  setCheck(FIELDS.b_cb_other_algo, form.b_cb_other_algo);

  // 4. Flatten — makes fields non-editable for court submission
  pdfForm.flatten();

  // 5. Append Hash Report as page 3
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

  const ALGO_LABELS = { sha256: "SHA-256", sha512: "SHA-512", sha1: "SHA-1", md5: "MD5" };
  const PAGE_W = 595.32;
  const PAGE_H = 841.92;
  const MARGIN = 56;
  const COL_WIDTHS = { no: 28, filename: 160, size: 55 };
  // Remaining width split evenly among selected algorithms

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const drawText = (text, x, yPos, opts = {}) => {
    page.drawText(String(text || ""), {
      x, y: yPos,
      size: opts.size || 9,
      font: opts.bold ? helveticaBold : helvetica,
      color: opts.color || rgb(0, 0, 0),
      maxWidth: opts.maxWidth,
    });
  };

  const newPage = () => {
    page = pdfDoc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;
  };

  // Header
  drawText("CERTIFICATE ANNEXURE — HASH REPORT", MARGIN, y, { size: 13, bold: true });
  y -= 18;
  drawText(`Generated: ${dateStr} at ${timeStr} IST`, MARGIN, y, { size: 9, color: rgb(0.4, 0.4, 0.4) });
  y -= 12;

  if (caseNumber)       { drawText(`Case No: ${caseNumber}`, MARGIN, y, { size: 9 }); y -= 12; }
  if (policeStation)    { drawText(`Police Station: ${policeStation}`, MARGIN, y, { size: 9 }); y -= 12; }
  if (investigatingOfficer) { drawText(`Investigating Officer: ${investigatingOfficer}`, MARGIN, y, { size: 9 }); y -= 12; }

  y -= 8;

  // Divider line
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  y -= 16;

  // Table header

  const headerY = y;
  let x = MARGIN;

  drawText("No", x, headerY, {
    size: 8,
    bold: true,
  });
  x += COL_WIDTHS.no;

  drawText("Filename", x, headerY, {
    size: 8,
    bold: true,
  });
  x += COL_WIDTHS.filename;

  drawText("Size", x, headerY, {
    size: 8,
    bold: true,
  });
  x += COL_WIDTHS.size;

  drawText("Algorithm", x, headerY, {
    size: 8,
    bold: true,
  });
  x += 60;

  drawText("Hash Value", x, headerY, {
    size: 8,
    bold: true,
  });
  y-=12;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0, 0, 0) });
  y -= 14;

  // Helper to wrap long hashes
const wrapHash = (hash, chunk = 32) => {
  if (!hash) return ["—"];

  const lines = [];
  for (let i = 0; i < hash.length; i += chunk) {
    lines.push(hash.slice(i, i + chunk));
  }
  return lines;
};

// Table rows
for (let i = 0; i < selectedFiles.length; i++) {
  const f = selectedFiles[i];
  const filename = f.file.name;
  const size = formatBytes(f.file.size);
  const rowStartY = y;
  let firstAlgo = true;
  for (const algo of selectedAlgos) {
    const hash = f.hashes[algo] || "—";
    const wrapped = wrapHash(hash);
    const rowHeight = Math.max(18, wrapped.length * 8 + 6);
    if (y < MARGIN + rowHeight + 30) {
      newPage();
    }
    let x = MARGIN;

    // Only draw file details once
    if (firstAlgo) {
      drawText(String(i + 1), x, y, { size: 8 });
      x += COL_WIDTHS.no;
      drawText(filename, x, y, { size: 8 });
      x += COL_WIDTHS.filename;
      drawText(size, x, y, { size: 8 });
      x += COL_WIDTHS.size;
      firstAlgo = false;
    } else {
      x += COL_WIDTHS.no;
      x += COL_WIDTHS.filename;
      x += COL_WIDTHS.size;
    }

    drawText(ALGO_LABELS[algo] || algo.toUpperCase(), x, y, {
      size: 8,
      bold: true,
    });
    x += 60;

    // Draw wrapped hash
    wrapped.forEach((line, idx) => {
      drawText(line, x, y - idx * 8, {
        size: 7,
        font: courierFont,
      });
    });
    y -= rowHeight;
  }

  page.drawLine({
    start: { x: MARGIN, y: y + 6 },
    end: { x: PAGE_W - MARGIN, y: y + 6 },
    thickness: 0.25,
    color: rgb(0.85,0.85,0.85),
  });

  y -= 8;

}

  y -= 12;

  // Footer summary
  if (y < MARGIN + 60) newPage();
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
  y -= 14;
  drawText(`Total Files: ${selectedFiles.length}`, MARGIN, y, { size: 8, bold: true });
  drawText(`Total Size: ${formatBytes(selectedFiles.reduce((s, f) => s + f.file.size, 0))}`, MARGIN + 100, y, { size: 8 });
  drawText(`Algorithms: ${selectedAlgos.map(a => ALGO_LABELS[a] || a).join(", ")}`, MARGIN + 220, y, { size: 8 });
  y -= 14;
  drawText("This hash report is an Annexure to the Section 65B Certificate generated using Cyber AI Agent (Hash Generator).", MARGIN, y, { size: 7, color: rgb(0.5, 0.5, 0.5) });

  // 6. Save and return bytes
  return await pdfDoc.save();
}

// ─── TXT EXPORT ───────────────────────────────────────────────────────────────
function generateTXT(selectedFiles, selectedAlgos, hashLineValue) {
  const ALGO_LABELS = { sha256: "SHA-256", sha512: "SHA-512", sha1: "SHA-1", md5: "MD5" };
  const now = new Date();
  const lines = [
    "HASH REPORT — CYBER AI AGENT",
    "Section 65B Certificate Annexure",
    `Generated: ${now.toLocaleString("en-IN")}`,
    "",
    `Files: ${selectedFiles.length}`,
    `Algorithms: ${selectedAlgos.map(a => ALGO_LABELS[a] || a).join(", ")}`,
    `Summary Hash Value: ${hashLineValue}`,
    "",
    "─".repeat(80),
    "",
  ];

  selectedFiles.forEach((f, i) => {
    lines.push(`[${i + 1}] ${f.file.name}`);
    lines.push(`    Path: ${f.relativePath || f.file.name}`);
    lines.push(`    Size: ${formatBytes(f.file.size)}`);
    for (const algo of selectedAlgos) {
      lines.push(`    ${(ALGO_LABELS[algo] || algo).padEnd(8)}: ${f.hashes[algo] || "—"}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}

// ─── CSV EXPORT ───────────────────────────────────────────────────────────────
function generateCSV(selectedFiles, selectedAlgos) {
  const ALGO_LABELS = { sha256: "SHA-256", sha512: "SHA-512", sha1: "SHA-1", md5: "MD5" };
  const headers = ["No", "Filename", "Relative Path", "Size (bytes)", ...selectedAlgos.map(a => ALGO_LABELS[a] || a)];
  const rows = selectedFiles.map((f, i) => [
    i + 1,
    `"${f.file.name.replace(/"/g, '""')}"`,
    `"${(f.relativePath || f.file.name).replace(/"/g, '""')}"`,
    f.file.size,
    ...selectedAlgos.map(a => f.hashes[a] || ""),
  ]);
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────
async function generateExcel(selectedFiles, selectedAlgos) {
  const XLSX = await import("xlsx");
  const ALGO_LABELS = { sha256: "SHA-256", sha512: "SHA-512", sha1: "SHA-1", md5: "MD5" };
  const headers = ["No", "Filename", "Relative Path", "Size (bytes)", ...selectedAlgos.map(a => ALGO_LABELS[a] || a)];
  const rows = selectedFiles.map((f, i) => [
    i + 1,
    f.file.name,
    f.relativePath || f.file.name,
    f.file.size,
    ...selectedAlgos.map(a => f.hashes[a] || ""),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hash Report");
  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

// ─── DOWNLOAD HELPER ──────────────────────────────────────────────────────────
function downloadBlob(data, filename, mimeType) {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── UI HELPERS ───────────────────────────────────────────────────────────────
const label = { fontSize: "11px", fontWeight: 500, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: "6px" };

function Field({ label: lbl, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label style={label}>{lbl}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>{children}</div>;
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "0.5px solid var(--border)" }}>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "12px" }}>{title}</div>
      {children}
    </div>
  );
}

function CheckRow({ options, values, onChange }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
      {options.map(opt => (
        <label key={opt.key || opt.label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text2)", cursor: "pointer" }}>
          <input type="checkbox" checked={!!values[opt.key || opt.label]} onChange={e => onChange(opt.key || opt.label, e.target.checked)} />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────
export default function CertificateModal({ files, selectedAlgos, onClose, onSaveAuditLog }) {
  const [selectedFileIds, setSelectedFileIds] = useState(() => files.map(f => f.id));
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [activePage, setActivePage] = useState("A");
  const [form, setForm] = useState(emptyForm());
  const [caseNumber, setCaseNumber] = useState("");
  const [policeStation, setPoliceStation] = useState("");
  const [investigatingOfficer, setInvestigatingOfficer] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exportType, setExportType] = useState(null); // "pdf"|"txt"|"csv"|"xlsx"

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const selectedFiles = files.filter(f => selectedFileIds.includes(f.id));
  const allHashed = selectedFiles.length > 0 && selectedFiles.every(f => selectedAlgos.every(a => f.hashes[a]));

  const hashLineValue =
    selectedFiles.length === 1
      ? selectedAlgos.filter(a => selectedFiles[0].hashes[a]).map(a => selectedFiles[0].hashes[a]).join(" / ")
      : selectedFiles.length > 1
      ? "See attached Hash Report (Annexure)"
      : "";

  const validate = () => {
    if (selectedFiles.length === 0) return "Select at least one file.";
    if (!allHashed) return "Some selected files are missing hashes. Generate hashes first.";
    if (!form.a_name.trim()) return "Part A: Name is required.";
    if (!form.b_name.trim()) return "Part B: Name is required.";
    return null;
  };

  const handleGenerate = async (type) => {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setGenerating(true);
    setExportType(type);

    try {
      const now = new Date();
      const datePart = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
      const certId = `HASH-${datePart}-${Math.floor(10000 + Math.random() * 90000)}`;

      if (type === "pdf") {
        const templateRes = await fetch("/certificate-template.pdf");
        if (!templateRes.ok) throw new Error("Could not load certificate-template.pdf from /public/. Make sure the file is placed there.");
        const templateBytes = await templateRes.arrayBuffer();

        const pdfBytes = await generateCertificatePDF({
          templateBytes,
          form,
          selectedFiles,
          selectedAlgos,
          hashLineValue,
          caseNumber,
          policeStation,
          investigatingOfficer,
        });

        downloadBlob(pdfBytes, `65B_Certificate_${datePart}.pdf`, "application/pdf");

      } else if (type === "txt") {
        const txt = generateTXT(selectedFiles, selectedAlgos, hashLineValue);
        downloadBlob(txt, `hash_report_${datePart}.txt`, "text/plain");

      } else if (type === "csv") {
        const csv = generateCSV(selectedFiles, selectedAlgos);
        downloadBlob(csv, `hash_report_${datePart}.csv`, "text/csv");

      } else if (type === "xlsx") {
        const xlsxData = await generateExcel(selectedFiles, selectedAlgos);
        downloadBlob(xlsxData, `hash_report_${datePart}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      }

      // Save audit log to server (fire-and-forget)
      if (onSaveAuditLog) {
        onSaveAuditLog({
          certificate_id: certId,
          case_number: caseNumber,
          police_station: policeStation,
          investigating_officer: investigatingOfficer,
          algorithms_used: selectedAlgos,
          file_count: selectedFiles.length,
          total_size_bytes: selectedFiles.reduce((s, f) => s + f.file.size, 0),
          evidence_summary: selectedFiles.map(f => ({
            filename: f.file.name,
            relative_path: f.relativePath,
            size: f.file.size,
            hashes: Object.fromEntries(selectedAlgos.map(a => [a, f.hashes[a] || ""])),
          })),
        });
      }

    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message || "Generation failed. Check the console for details.");
    } finally {
      setGenerating(false);
      setExportType(null);
    }
  };

  // Device checkboxes: both Part A and B share device/checkbox state (shared device)
  const deviceValues = {
    a_cb_computer: form.a_cb_computer, a_cb_dvr: form.a_cb_dvr,
    a_cb_mobile: form.a_cb_mobile, a_cb_flashdrive: form.a_cb_flashdrive,
    a_cb_cddvd: form.a_cb_cddvd, a_cb_server: form.a_cb_server,
    a_cb_cloud: form.a_cb_cloud, a_cb_other: form.a_cb_other,
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", maxHeight: "92vh", width: "min(720px, 95vw)" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["A", "B"].map(p => (
              <button key={p} onClick={() => setActivePage(p)} style={{ background: activePage === p ? "#fff" : "rgba(255,255,255,0.12)", color: activePage === p ? "#111" : "#fff", border: "none", padding: "7px 18px", borderRadius: "6px 6px 0 0", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
                Part {p}
              </button>
            ))}
            <button onClick={() => setShowFileSelector(v => !v)} style={{ background: "rgba(167,139,250,0.2)", color: "#a78bfa", border: "none", padding: "7px 14px", borderRadius: "6px 6px 0 0", fontSize: "13px", cursor: "pointer" }}>
              Files ({selectedFileIds.length}/{files.length})
            </button>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", borderRadius: "6px", width: "28px", height: "28px", cursor: "pointer", fontSize: "16px" }}>×</button>
        </div>

        {/* Internal case reference */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
          <input value={caseNumber} onChange={e => setCaseNumber(e.target.value)} placeholder="Case Number (internal log only)" style={{ flex: 1, minWidth: "140px", fontSize: "12px" }} />
          <input value={policeStation} onChange={e => setPoliceStation(e.target.value)} placeholder="Police Station (internal)" style={{ flex: 1, minWidth: "140px", fontSize: "12px" }} />
          <input value={investigatingOfficer} onChange={e => setInvestigatingOfficer(e.target.value)} placeholder="Investigating Officer (internal)" style={{ flex: 1, minWidth: "160px", fontSize: "12px" }} />
        </div>

        {error && <div style={{ background: "#A32D2D", color: "#fff", borderRadius: "6px", padding: "8px 12px", fontSize: "13px", marginBottom: "8px" }}>{error}</div>}

        {/* File selector */}
        {showFileSelector && (
          <div style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "10px", marginBottom: "8px", maxHeight: "130px", overflowY: "auto" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text2)", marginBottom: "6px" }}>
              <input type="checkbox" checked={selectedFileIds.length === files.length} onChange={() => setSelectedFileIds(selectedFileIds.length === files.length ? [] : files.map(f => f.id))} />
              Select All
            </label>
            {files.map(f => (
              <label key={f.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--text2)", padding: "2px 0" }}>
                <input type="checkbox" checked={selectedFileIds.includes(f.id)} onChange={() => setSelectedFileIds(p => p.includes(f.id) ? p.filter(x => x !== f.id) : [...p, f.id])} />
                {f.file.name}
                {!selectedAlgos.every(a => f.hashes[a]) && <span style={{ color: "#BA7517", fontSize: "11px" }}>(hashes missing)</span>}
              </label>
            ))}
          </div>
        )}

        {/* Form body */}
        <div style={{ overflowY: "auto", background: "var(--bg)", border: "0.5px solid var(--border)", borderRadius: "0 8px 8px 8px", padding: "20px" }}>

          {activePage === "A" ? (
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
                Part A — To be filled by the Party
              </div>

              <Section title="Personal Details">
                <Row>
                  <Field label="Name" value={form.a_name} onChange={v => set("a_name", v)} />
                  <Field label="Son/Daughter/Spouse of" value={form.a_relation} onChange={v => set("a_relation", v)} />
                </Row>
                <Field label="Residing/Employed at" value={form.a_address} onChange={v => set("a_address", v)} />
              </Section>

              <Section title="Device / Digital Record Source">
                <div style={{ marginBottom: "10px" }}>
                  <label style={label}>Type (tick mark)</label>
                  <CheckRow
                    options={DEVICE_OPTIONS.map(d => ({ key: d.keyA, label: d.label }))}
                    values={form}
                    onChange={(k, v) => set(k, v)}
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <Field label="Other (specify)" value={form.a_device_other} onChange={v => set("a_device_other", v)} />
                </div>
                <Row>
                  <Field label="Make & Model" value={form.a_make_model} onChange={v => set("a_make_model", v)} />
                  <Field label="Color" value={form.a_color} onChange={v => set("a_color", v)} />
                </Row>
                <Row>
                  <Field label="Serial Number" value={form.a_serial} onChange={v => set("a_serial", v)} />
                  <Field label="IMEI/UIN/UID/MAC/Cloud ID" value={form.a_imei} onChange={v => set("a_imei", v)} />
                </Row>
                <Field label="Other relevant information" value={form.a_other_info} onChange={v => set("a_other_info", v)} />
              </Section>

              <Section title="Device Control">
                <label style={label}>The device is (select as applicable)</label>
                <CheckRow
                  options={CONTROL_OPTIONS}
                  values={form}
                  onChange={(k, v) => set(k, v)}
                />
              </Section>

              <Section title="Hash Value & Algorithm">
                <div style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Auto-filled Hash Value</div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1D9E75", wordBreak: "break-all" }}>{hashLineValue || "—"}</div>
                  <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "4px" }}>
                    Algorithms auto-checked: {selectedAlgos.map(a => a.toUpperCase()).join(", ")}
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <Field label="Other algorithm (if any)" value={form.a_other_algo} onChange={v => set("a_other_algo", v)} placeholder="e.g. SHA-384" />
                </div>
                {form.a_other_algo && (
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text2)" }}>
                    <input type="checkbox" checked={form.a_cb_other_algo} onChange={e => set("a_cb_other_algo", e.target.checked)} />
                    Tick "Other" checkbox on certificate
                  </label>
                )}
              </Section>

              <Section title="Signature Details">
                <Field label="Place" value={form.a_place} onChange={v => set("a_place", v)} />
                <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "8px" }}>
                  Date &amp; Time will be auto-filled from generation timestamp.
                </div>
              </Section>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "16px" }}>
                Part B — To be filled by the Expert
              </div>

              <Section title="Personal Details">
                <Row>
                  <Field label="Name" value={form.b_name} onChange={v => set("b_name", v)} />
                  <Field label="Son/Daughter/Spouse of" value={form.b_relation} onChange={v => set("b_relation", v)} />
                </Row>
                <Field label="Residing/Employed at" value={form.b_address} onChange={v => set("b_address", v)} />
              </Section>

              <Section title="Device / Digital Record Source">
                <div style={{ marginBottom: "10px" }}>
                  <label style={label}>Type (tick mark)</label>
                  <CheckRow
                    options={DEVICE_OPTIONS.map(d => ({ key: d.keyB, label: d.label }))}
                    values={form}
                    onChange={(k, v) => set(k, v)}
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <Field label="Other (specify)" value={form.b_device_other} onChange={v => set("b_device_other", v)} />
                </div>
                <Row>
                  <Field label="Make & Model" value={form.b_make_model} onChange={v => set("b_make_model", v)} />
                  <Field label="Color" value={form.b_color} onChange={v => set("b_color", v)} />
                </Row>
                <Row>
                  <Field label="Serial Number" value={form.b_serial} onChange={v => set("b_serial", v)} />
                  <Field label="IMEI/UIN/UID/MAC/Cloud ID" value={form.b_imei} onChange={v => set("b_imei", v)} />
                </Row>
                <Field label="Other relevant information" value={form.b_other_info} onChange={v => set("b_other_info", v)} />
              </Section>

              <Section title="Hash Value & Algorithm">
                <div style={{ background: "var(--bg2)", border: "0.5px solid var(--border)", borderRadius: "8px", padding: "12px", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.8px" }}>Auto-filled Hash Value</div>
                  <div style={{ fontFamily: "monospace", fontSize: "12px", color: "#1D9E75", wordBreak: "break-all" }}>{hashLineValue || "—"}</div>
                  <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "4px" }}>
                    Algorithms auto-checked: {selectedAlgos.map(a => a.toUpperCase()).join(", ")}
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <Field label="Other algorithm (if any)" value={form.b_other_algo} onChange={v => set("b_other_algo", v)} placeholder="e.g. SHA-384" />
                </div>
                {form.b_other_algo && (
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text2)" }}>
                    <input type="checkbox" checked={form.b_cb_other_algo} onChange={e => set("b_cb_other_algo", e.target.checked)} />
                    Tick "Other" checkbox on certificate
                  </label>
                )}
              </Section>

              <Section title="Signature Details">
                <Field label="Place" value={form.b_place} onChange={v => set("b_place", v)} />
                <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "8px" }}>
                  Date &amp; Time will be auto-filled from generation timestamp.
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleGenerate("pdf")}
            disabled={generating}
            style={{ background: "var(--accent)", color: "var(--accent-text)", border: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", opacity: generating ? 0.6 : 1 }}
          >
            {generating && exportType === "pdf" ? "Generating..." : "📄 Download Certificate PDF"}
          </button>
          <button
            onClick={() => handleGenerate("txt")}
            disabled={generating}
            style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#fff", cursor: "pointer", opacity: generating ? 0.6 : 1 }}
          >
            {generating && exportType === "txt" ? "..." : "TXT"}
          </button>
          <button
            onClick={() => handleGenerate("csv")}
            disabled={generating}
            style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#fff", cursor: "pointer", opacity: generating ? 0.6 : 1 }}
          >
            {generating && exportType === "csv" ? "..." : "CSV"}
          </button>
          <button
            onClick={() => handleGenerate("xlsx")}
            disabled={generating}
            style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#fff", cursor: "pointer", opacity: generating ? 0.6 : 1 }}
          >
            {generating && exportType === "xlsx" ? "..." : "Excel"}
          </button>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "rgba(255,255,255,0.6)", cursor: "pointer", marginLeft: "auto" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}