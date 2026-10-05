/**
 * Registry for the custom 3D icon family — a second, deliberately separate
 * registry from `icons` (registry.ts), not a union inside it.
 *
 * Why separate rather than merged into `IconName`: the two families render
 * through different components with incompatible rendering models.
 * `icons`/`IconName` back `<AppIcon>`, a `currentColor`-inheriting SVG glyph
 * that looks correct in any semantic/theme colour with zero extra assets.
 * `customIcons`/`CustomIconName` back `<CustomIcon>`, a fixed-palette,
 * lit/shadowed 3D render with real alpha transparency — it carries its own
 * colour and needs no `currentColor` support, but also can't take one. A
 * single `IconName` union spanning both would let `<AppIcon name="...">`
 * accept a custom-icon name that it has no idea how to render as an SVG
 * glyph (or vice versa for `<CustomIcon>`), which defeats the type safety
 * the split is for. Keeping them as two distinct types makes "which
 * rendering model does this name belong to" a compile-time fact, not a
 * runtime assumption.
 *
 * Each value is a locally-imported image module path, resolved to a URL by
 * Vite at build time exactly like the brand marks in Logo.tsx — never a
 * literal string typed in at the call site, and never a remote URL.
 *
 * All 17 entries below have real alpha transparency, verified with
 * scripts/verify-png-alpha.mjs — generated via Canva on a flat magenta
 * chroma-key background, then matted to genuine alpha locally (hue-based
 * chroma key, not brightness-distance, so magenta shadow gradients don't
 * get misclassified as opaque content — see docs/design/icon-system/
 * icon-integration-inventory.md for the dated history of this set).
 */
import regulatoryAuthority from "@/assets/icons/custom/icon-regulatory-authority.png";
import regulatoryDocument from "@/assets/icons/custom/icon-regulatory-document.png";
import documentProcessing from "@/assets/icons/custom/icon-document-processing.png";
import portfolioMarket from "@/assets/icons/custom/icon-portfolio-market.png";
import action from "@/assets/icons/custom/icon-action.png";
import obligation from "@/assets/icons/custom/icon-obligation.png";
import evidence from "@/assets/icons/custom/icon-evidence.png";
import control from "@/assets/icons/custom/icon-control.png";
import riskIndicator from "@/assets/icons/custom/icon-risk-indicator.png";
import registration from "@/assets/icons/custom/icon-registration.png";
import regulatoryChange from "@/assets/icons/custom/icon-regulatory-change.png";
import escalation from "@/assets/icons/custom/icon-escalation.png";
import portfolioProcess from "@/assets/icons/custom/icon-portfolio-process.png";
import humanReview from "@/assets/icons/custom/icon-human-review.png";
import auditTrail from "@/assets/icons/custom/icon-audit-trail.png";
import portfolioProduct from "@/assets/icons/custom/icon-portfolio-product.png";
import impactAssessment from "@/assets/icons/custom/icon-impact-assessment.png";

export const customIcons = {
  "regulatory-authority": regulatoryAuthority,
  "regulatory-document": regulatoryDocument,
  "document-processing": documentProcessing,
  "portfolio-market": portfolioMarket,
  action,
  obligation,
  evidence,
  control,
  "risk-indicator": riskIndicator,
  registration,
  "regulatory-change": regulatoryChange,
  escalation,
  "portfolio-process": portfolioProcess,
  "human-review": humanReview,
  "audit-trail": auditTrail,
  "portfolio-product": portfolioProduct,
  "impact-assessment": impactAssessment,
} as const satisfies Record<string, string>;

export type CustomIconName = keyof typeof customIcons;
