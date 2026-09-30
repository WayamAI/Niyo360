import { describe, expect, it } from "vitest";
import { parseEvidence } from "./matchEvidence";

/**
 * The evidence field is a JSON *string* the OpenAPI document does not describe,
 * so these tests pin the shape the UI relies on and — more importantly — pin
 * that malformed input degrades to null instead of throwing inside a render.
 *
 * The payload below is a verbatim item from a live assessment, so the happy
 * path is asserted against what the engine actually writes rather than against
 * a shape invented here.
 */

const REAL = JSON.stringify({
  entity_label: "Product 'Asterion PulseSense' (APS-001)",
  match_types: ["JURISDICTION_MATCH", "PRODUCT_CATEGORY_MATCH"],
  match_score: 0.7,
  confidence: 0.75,
  signals: [
    {
      match_type: "JURISDICTION_MATCH",
      axis: "product_market:57aa2be1-6998-4e30-b6dd-e1eb95e74c5b",
      regulatory_field: "resolved market",
      regulatory_value: "United States",
      portfolio_field: "product_market.market_id",
      portfolio_value: "57aa2be1-6998-4e30-b6dd-e1eb95e74c5b",
      obligation_id: null,
    },
    {
      match_type: "PRODUCT_CATEGORY_MATCH",
      axis: "term:diagnostic",
      regulatory_field: "change/obligation text",
      regulatory_value: "diagnostic",
      portfolio_field: "product.category",
      portfolio_value: "Diagnostic",
      obligation_id: null,
    },
  ],
});

describe("parseEvidence", () => {
  it("reads a real engine payload", () => {
    const evidence = parseEvidence(REAL);
    expect(evidence).not.toBeNull();
    expect(evidence!.entity_label).toBe("Product 'Asterion PulseSense' (APS-001)");
    expect(evidence!.match_types).toEqual(["JURISDICTION_MATCH", "PRODUCT_CATEGORY_MATCH"]);
    expect(evidence!.signals).toHaveLength(2);
    expect(evidence!.signals[0].regulatory_value).toBe("United States");
    expect(evidence!.signals[1].portfolio_field).toBe("product.category");
  });

  it("returns null for an absent field", () => {
    expect(parseEvidence(null)).toBeNull();
    expect(parseEvidence(undefined)).toBeNull();
    expect(parseEvidence("")).toBeNull();
  });

  it("returns null rather than throwing on malformed JSON", () => {
    expect(parseEvidence("{not json")).toBeNull();
    // Valid JSON of the wrong shape carries no evidence, so it reads as none.
    expect(parseEvidence("[1,2,3]")).toBeNull();
    expect(parseEvidence('"a string"')).toBeNull();
  });

  it("returns null when the object carries no usable evidence", () => {
    expect(parseEvidence(JSON.stringify({ unrelated: true }))).toBeNull();
    expect(parseEvidence(JSON.stringify({ signals: [] }))).toBeNull();
  });

  it("drops signal entries that compare nothing", () => {
    const evidence = parseEvidence(
      JSON.stringify({
        entity_label: "Market 'United States'",
        signals: [{ obligation_id: null }, { match_type: "MARKET_MATCH" }, "nonsense", null],
      }),
    );
    expect(evidence!.signals).toHaveLength(1);
    expect(evidence!.signals[0].match_type).toBe("MARKET_MATCH");
  });
});
