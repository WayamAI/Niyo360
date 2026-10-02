import { describe, expect, it } from "vitest";
import { buildPortfolioIndex, UNRESOLVED } from "./usePortfolioNames";
import type { Authority, Market, Product, Registration } from "@/services/api";

describe("buildPortfolioIndex", () => {
  const dummyProduct: Product = {
    id: "prod-1",
    organization_id: "org-1",
    name: "CardioPulse Pacemaker",
    product_code: "CPP-01",
    regulatory_class: "Class III",
    description: null,
    category: null,
    sub_category: null,
    keywords: null,
    status: "ACTIVE",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
  };

  const dummyMarket: Market = {
    id: "mkt-1",
    organization_id: "org-1",
    name: "United States",
    country: "USA",
    region: null,
    regulatory_jurisdiction: "FDA",
    status: "ACTIVE",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
  };

  const dummyAuthority: Authority = {
    id: "auth-1",
    name: "Food and Drug Administration",
    short_name: "FDA",
    jurisdiction: "Federal",
    country: "USA",
    website: "https://fda.gov",
    description: null,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
  };

  const dummyRegistration: Registration = {
    id: "reg-1",
    registration_number: "PMA-12345",
    product_id: "prod-1",
    market_id: "mkt-1",
    authority_id: "auth-1",
    status: "ACTIVE",
    valid_from: "2023-01-01T00:00:00Z",
    valid_until: null,
    metadata: null,
    organization_id: "org-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
  };

  it("resolves product names and details successfully", () => {
    const index = buildPortfolioIndex({ products: [dummyProduct] });
    const resolved = index.get("PRODUCT:prod-1");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("CardioPulse Pacemaker");
    expect(resolved?.detail).toBe("CPP-01 · Class III");
  });

  it("resolves market names and details successfully", () => {
    const index = buildPortfolioIndex({ markets: [dummyMarket] });
    const resolved = index.get("MARKET:mkt-1");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("United States");
    expect(resolved?.detail).toBe("USA · FDA");
  });

  it("resolves authority names and short names successfully", () => {
    const index = buildPortfolioIndex({ authorities: [dummyAuthority] });
    const resolved = index.get("AUTHORITY:auth-1");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("Food and Drug Administration");
    expect(resolved?.detail).toBe("FDA · Federal");
  });

  it("resolves registration numbers as the display name", () => {
    const index = buildPortfolioIndex({ registrations: [dummyRegistration] });
    const resolved = index.get("REGISTRATION:reg-1");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("PMA-12345");
    expect(resolved?.detail).toBe("ACTIVE");
  });

  it("gracefully returns undefined for missing or unknown ids", () => {
    const index = buildPortfolioIndex({
      products: [dummyProduct],
      markets: [dummyMarket],
    });

    expect(index.get("PRODUCT:non-existent")).toBeUndefined();
    expect(index.get("MARKET:non-existent")).toBeUndefined();
    expect(index.get("AUTHORITY:non-existent")).toBeUndefined();
  });

  it("handles null and empty collections without throwing", () => {
    const index = buildPortfolioIndex({});
    expect(index.size).toBe(0);
    expect(index.get("PRODUCT:any") ?? UNRESOLVED).toEqual(UNRESOLVED);
  });
});
