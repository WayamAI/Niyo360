/**
 * Icon registry — the single icon language for the app.
 *
 * One semantic concept resolves to exactly one glyph, everywhere. Components
 * must never import a glyph directly; they reference a semantic name through
 * <AppIcon> / <IconButton>, so swapping the underlying glyph (or the whole
 * icon library) is a one-line change here.
 *
 * Backed by lucide — a thin, uniform-weight outline set, matching the
 * design system's "thin/outline, consistent visual weight, not filled" rule.
 */
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Cog,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileSearch,
  FileText,
  Filter,
  Flag,
  Gauge,
  Home,
  Inbox,
  Info,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  Moon,
  Menu,
  MoreHorizontal,
  Pause,
  PenLine,
  Play,
  Radio,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  TrendingDown,
  TrendingUp,
  User,
  UserPlus,
  X,
  Zap,
} from "lucide-react";

export const icons = {
  // ── navigation ─────────────────────────────────────────────────────────
  dashboard: LayoutDashboard,
  home: Home,
  feed: Radio,
  deltaReport: FileSearch,
  agent: Sparkles,
  haqDraft: PenLine,
  variationDraft: FileText,
  validator: ShieldCheck,
  validationReport: ClipboardCheck,
  simulator: Zap,
  map: Map,
  calendar: CalendarDays,
  audit: ListChecks,
  escalation: AlertTriangle,

  // ── actions ────────────────────────────────────────────────────────────
  search: Search,
  filter: Filter,
  refresh: RefreshCw,
  download: Download,
  copy: Copy,
  edit: Edit3,
  share: Share2,
  send: Send,
  close: X,
  external: ExternalLink,
  view: Eye,
  flag: Flag,
  assign: UserPlus,
  play: Play,
  pause: Pause,
  menu: Menu,
  more: MoreHorizontal,

  // ── direction ──────────────────────────────────────────────────────────
  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  trendUp: TrendingUp,
  trendDown: TrendingDown,

  // ── system ─────────────────────────────────────────────────────────────
  settings: Cog,
  notification: Bell,
  user: User,
  organisation: Building2,
  signOut: LogOut,
  themeLight: Sun,
  themeDark: Moon,
  inbox: Inbox,
  clock: Clock,
  timer: Timer,
  bot: Bot,

  // ── domain / data ──────────────────────────────────────────────────────
  document: FileText,
  chart: BarChart3,
  activity: Activity,
  gauge: Gauge,
  layers: Layers,
  risk: ShieldAlert,

  // ── feedback ───────────────────────────────────────────────────────────
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
} as const;

export type IconName = keyof typeof icons;
