import { api } from "./client";
import type {
  Control,
  ControlCreate,
  ControlUpdate,
  Market,
  MarketCreate,
  MarketStatus,
  MarketUpdate,
  Process,
  ProcessCreate,
  ProcessUpdate,
  Product,
  ProductCreate,
  ProductStatus,
  ProductUpdate,
  Registration,
  RegistrationCreate,
  RegistrationUpdate,
} from "./types";

/**
 * Portfolio endpoints.
 *
 * All five collections page with `skip`/`limit` and return a bare JSON array —
 * there is no {items, total, page} envelope, despite the backend's own
 * contract document describing one. Typed from the served schema.
 *
 * Note the trailing slashes: the backend registers these routes as
 * `/products/` etc. Omitting the slash produces a 307 redirect that drops the
 * Authorization header on some clients, so they are kept exact.
 */

export interface PageParams {
  skip?: number;
  limit?: number;
}

export const portfolioApi = {
  products: {
    list: (params: PageParams & { status?: ProductStatus } = {}) =>
      api.get<Product[]>("/api/v1/portfolio/products/", { query: { ...params } }),
    get: (id: string) => api.get<Product>(`/api/v1/portfolio/products/${id}`),
    create: (body: ProductCreate) =>
      api.post<Product>("/api/v1/portfolio/products/", { json: body }),
    update: (id: string, body: ProductUpdate) =>
      api.patch<Product>(`/api/v1/portfolio/products/${id}`, { json: body }),
    remove: (id: string) => api.delete<void>(`/api/v1/portfolio/products/${id}`),
  },

  markets: {
    list: (params: PageParams & { status?: MarketStatus } = {}) =>
      api.get<Market[]>("/api/v1/portfolio/markets/", { query: { ...params } }),
    get: (id: string) => api.get<Market>(`/api/v1/portfolio/markets/${id}`),
    create: (body: MarketCreate) => api.post<Market>("/api/v1/portfolio/markets/", { json: body }),
    update: (id: string, body: MarketUpdate) =>
      api.patch<Market>(`/api/v1/portfolio/markets/${id}`, { json: body }),
    remove: (id: string) => api.delete<void>(`/api/v1/portfolio/markets/${id}`),
  },

  processes: {
    list: (params: PageParams = {}) =>
      api.get<Process[]>("/api/v1/portfolio/processes/", { query: { ...params } }),
    get: (id: string) => api.get<Process>(`/api/v1/portfolio/processes/${id}`),
    create: (body: ProcessCreate) =>
      api.post<Process>("/api/v1/portfolio/processes/", { json: body }),
    update: (id: string, body: ProcessUpdate) =>
      api.patch<Process>(`/api/v1/portfolio/processes/${id}`, { json: body }),
    remove: (id: string) => api.delete<void>(`/api/v1/portfolio/processes/${id}`),
  },

  controls: {
    list: (params: PageParams = {}) =>
      api.get<Control[]>("/api/v1/portfolio/controls/", { query: { ...params } }),
    get: (id: string) => api.get<Control>(`/api/v1/portfolio/controls/${id}`),
    create: (body: ControlCreate) =>
      api.post<Control>("/api/v1/portfolio/controls/", { json: body }),
    update: (id: string, body: ControlUpdate) =>
      api.patch<Control>(`/api/v1/portfolio/controls/${id}`, { json: body }),
    remove: (id: string) => api.delete<void>(`/api/v1/portfolio/controls/${id}`),
  },

  registrations: {
    list: (params: PageParams = {}) =>
      api.get<Registration[]>("/api/v1/portfolio/registrations/", { query: { ...params } }),
    get: (id: string) => api.get<Registration>(`/api/v1/portfolio/registrations/${id}`),
    create: (body: RegistrationCreate) =>
      api.post<Registration>("/api/v1/portfolio/registrations/", { json: body }),
    update: (id: string, body: RegistrationUpdate) =>
      api.patch<Registration>(`/api/v1/portfolio/registrations/${id}`, { json: body }),
    remove: (id: string) => api.delete<void>(`/api/v1/portfolio/registrations/${id}`),
  },
};
