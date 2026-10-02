import { useMemo } from "react";
import {
  useAuthorities,
  useControls,
  useMarkets,
  useProcesses,
  useProducts,
  useRegistrations,
} from "@/hooks/useApiQueries";
import type {
  Authority,
  Control,
  EntityType,
  Market,
  Process,
  Product,
  Registration,
} from "@/services/api";

/**
 * Resolves a portfolio entity reference to the name a person would recognise.
 *
 * The impact engine records what it matched as `{ entity_type, entity_id }` —
 * a type and a UUID, because that is what a deterministic matcher needs to be
 * unambiguous. Rendering that verbatim turns the one screen that answers
 * "which parts of my portfolio are affected?" into a column of UUIDs.
 *
 * There is no backend endpoint that expands an impact item, and inventing a
 * name would be fabrication. So this joins against the portfolio collections
 * the API already serves, which the app already has typed clients and query
 * keys for. React Query de-duplicates the list requests, so a screen that
 * also renders one of those lists pays nothing extra for the join.
 *
 * Unresolved ids are reported as unresolved. They are real — an entity can be
 * deleted after an assessment was recorded — and a truthful "not in the
 * current portfolio" is the correct answer, not a blank or a guessed name.
 */

export type ResolvableEntityType = EntityType | "AUTHORITY";

export interface ResolvedEntity {
  /** Display name, or null when the id is not in the current portfolio. */
  name: string | null;
  /** Second line: product code, country, category — whatever the type offers. */
  detail: string | null;
}

export interface PortfolioNames {
  resolve: (type: ResolvableEntityType, id: string) => ResolvedEntity;
  /** True while any of the collections is still loading. */
  isLoading: boolean;
  /**
   * True when at least one collection failed. The caller still renders — the
   * impact data itself is fine, only the name join is degraded — but it can
   * say so rather than implying the entities are missing from the portfolio.
   */
  isPartial: boolean;
}

export const UNRESOLVED: ResolvedEntity = { name: null, detail: null };

export interface PortfolioIndexData {
  products?: Product[] | null;
  markets?: Market[] | null;
  processes?: Process[] | null;
  controls?: Control[] | null;
  registrations?: Registration[] | null;
  authorities?: Authority[] | null;
}

export function buildPortfolioIndex(data: PortfolioIndexData): Map<string, ResolvedEntity> {
  const map = new Map<string, ResolvedEntity>();
  const put = (type: ResolvableEntityType, id: string, entity: ResolvedEntity) =>
    map.set(`${type}:${id}`, entity);

  for (const p of data.products ?? []) {
    put("PRODUCT", p.id, {
      name: p.name,
      detail: [p.product_code, p.regulatory_class].filter(Boolean).join(" · ") || null,
    });
  }
  for (const m of data.markets ?? []) {
    put("MARKET", m.id, {
      name: m.name,
      detail: [m.country, m.regulatory_jurisdiction].filter(Boolean).join(" · ") || null,
    });
  }
  for (const p of data.processes ?? []) {
    put("PROCESS", p.id, { name: p.name, detail: p.category ?? null });
  }
  for (const c of data.controls ?? []) {
    put("CONTROL", c.id, {
      name: c.name,
      detail: [c.category, c.owner].filter(Boolean).join(" · ") || null,
    });
  }
  // Registrations have no name of their own; the registration number is what
  // a regulatory affairs specialist refers to them by.
  for (const r of data.registrations ?? []) {
    put("REGISTRATION", r.id, {
      name: r.registration_number ?? null,
      detail: r.status ?? null,
    });
  }
  for (const a of data.authorities ?? []) {
    put("AUTHORITY", a.id, {
      name: a.name,
      detail: [a.short_name, a.jurisdiction ?? a.country].filter(Boolean).join(" · ") || null,
    });
  }
  return map;
}

export function usePortfolioNames(): PortfolioNames {
  const products = useProducts();
  const markets = useMarkets();
  const processes = useProcesses();
  const controls = useControls();
  const registrations = useRegistrations();
  const authorities = useAuthorities();

  const index = useMemo(
    () =>
      buildPortfolioIndex({
        products: products.data,
        markets: markets.data,
        processes: processes.data,
        controls: controls.data,
        registrations: registrations.data,
        authorities: authorities.data,
      }),
    [
      products.data,
      markets.data,
      processes.data,
      controls.data,
      registrations.data,
      authorities.data,
    ],
  );

  const queries = [products, markets, processes, controls, registrations, authorities];

  return {
    resolve: (type, id) => index.get(`${type}:${id}`) ?? UNRESOLVED,
    isLoading: queries.some((q) => q.isLoading),
    isPartial: queries.some((q) => q.isError),
  };
}
