/**
 * Match evidence carried on an impact item.
 *
 * The backend records why the deterministic matcher fired as a JSON *string*
 * in `ImpactItem.evidence` — not as a typed object — so the served OpenAPI
 * document types it as `string | null` and `schema.d.ts` cannot describe its
 * shape. This module is the one place that parses it.
 *
 * It is parsed defensively on purpose. The field is free-form as far as the
 * contract is concerned, and the correct behaviour when it does not match the
 * shape below is to show nothing rather than to crash the screen or to invent
 * a signal that the engine did not record.
 */

/** One reason the matcher fired: a regulatory field that met a portfolio field. */
export interface MatchSignal {
  match_type: string | null;
  axis: string | null;
  regulatory_field: string | null;
  regulatory_value: string | null;
  portfolio_field: string | null;
  portfolio_value: string | null;
  obligation_id: string | null;
}

export interface MatchEvidence {
  /** The engine's own label for the entity, e.g. "Product 'Asterion PulseSense' (APS-001)". */
  entity_label: string | null;
  match_types: string[];
  signals: MatchSignal[];
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toSignal(value: unknown): MatchSignal | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const signal: MatchSignal = {
    match_type: str(raw.match_type),
    axis: str(raw.axis),
    regulatory_field: str(raw.regulatory_field),
    regulatory_value: str(raw.regulatory_value),
    portfolio_field: str(raw.portfolio_field),
    portfolio_value: str(raw.portfolio_value),
    obligation_id: str(raw.obligation_id),
  };
  // A signal with nothing on either side of the comparison says nothing.
  return signal.regulatory_value || signal.portfolio_value || signal.match_type ? signal : null;
}

/**
 * Parses `ImpactItem.evidence`. Returns null when the field is absent, is not
 * JSON, or carries no usable signal — never a partially invented record.
 */
export function parseEvidence(evidence: string | null | undefined): MatchEvidence | null {
  if (!evidence) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(evidence);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;

  const raw = parsed as Record<string, unknown>;
  const signals = Array.isArray(raw.signals)
    ? raw.signals.map(toSignal).filter((s): s is MatchSignal => s !== null)
    : [];
  const matchTypes = Array.isArray(raw.match_types)
    ? raw.match_types.filter((t): t is string => typeof t === "string")
    : [];
  const label = str(raw.entity_label);

  if (!signals.length && !matchTypes.length && !label) return null;
  return { entity_label: label, match_types: matchTypes, signals };
}
