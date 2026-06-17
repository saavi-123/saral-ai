
// ─── Single source of truth for all icons across Cyber AI Agent ──────────────
// Usage:
//   import { CATEGORY_ICONS, TOOL_ICONS, ICON_SIZES } from "@/lib/icons";
//   const Icon = TOOL_ICONS["Saral AI"];
//   <Icon size={ICON_SIZES.card} />

import {
  Brain,
  RadioTower,
  Landmark,
  MapPinned,
  BadgeCheck,
  Database,
  ShieldCheck,
  Network,
  MessageSquareWarning,
  Phone,
  Smartphone,
  Search,
  TowerControl,
  ScanSearch,
  ContactRound,
  Globe,
  Cpu,
  MessageSquare,
  Wallet,
  GitBranch,
  Receipt,
  Car,
  SearchCode,
  FileText,
  Fingerprint,
  Building,
  Building2,
  Users,
  FileStack,
  Map,
  Route,
  GlobeLock,
} from "lucide-react";

// ─── Category icons ───────────────────────────────────────────────────────────

export const CATEGORY_ICONS = {
  "Collaboration & AI":           Brain,
  "Mobile & Device Intelligence": RadioTower,
  "Financial Investigation":      Landmark,
  "Location & Movement":          MapPinned,
  "Identity & Verification":      BadgeCheck,
  "Database & Directory":         Database,
  "Corporate Security":           ShieldCheck,
};

// ─── Individual tool icons ────────────────────────────────────────────────────

export const TOOL_ICONS = {
  "Saral AI":             Brain,
  "iC Connect":           Network,
  "Tip Line Analysis":    MessageSquareWarning,
  "CDR Processor":        Phone,
  "IMEI Lookup":          Smartphone,
  "CEIR Tracer":          Search,
  "Cell Spyder":          TowerControl,
  "MNI Analysis":         ScanSearch,
  "TSP Lookup":           ContactRound,
  "MCC-MNC Lookup":       Globe,
  "MAC Lookup":           Cpu,
  "SMS Header Intel":     MessageSquare,
  "BSA":                  Landmark,
  "PhonePe Analyzer":     Wallet,
  "NCCRP Graph":          GitBranch,
  "TSDP":                 Receipt,
  "ATM Lookup":           Building2,
  "IFSC Lookup":          Building,
  "Geolocation Tracking": MapPinned,
  "Lat Long Mapper":      Map,
  "Sugam Route":          Route,
  "Toll Plaza":           Car,
  "IPDR Analysis":        Network,
  "Google Analyzer":      SearchCode,
  "Aadhaar Validator":    BadgeCheck,
  "CAF Summarizer":       FileText,
  "IP Intelligence":      GlobeLock,
  "Hash Generator":       Fingerprint,
  "PS Lookup":            Building,
  "Nodal Officers":       Users,
  "LEA Templates":        FileStack,
  "Email Security":       ShieldCheck,
};

// ─── Standard sizes ───────────────────────────────────────────────────────────

export const ICON_SIZES = {
  sidebar:   18,
  card:      20,
  category:  18,
  featured:  20,
  button:    16,
};
