import { useMemo, useState } from "react";
import { Field, PageBody, PageHeader, recordCrumb } from "@/components/shared/Page";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { FilterBar, FilterSelect } from "@/components/shared/Filters";
import { ApiCount, ApiRefresh, ApiState } from "@/components/shared/ApiState";
import { Drawer } from "@/components/shared/Drawer";
import { useApp } from "@/context/AppContext";
import { useAuditEvents, useAuditEventTypes } from "@/hooks/useApiQueries";
import type { AuditEvent } from "@/services/api";
import { entityLabel, eventLabel, humanise, knownEventTypes, stamp } from "./auditFormat";

/**
 * The audit trail, from GET /api/v1/audit/.
 *
 * Answers one question in five parts: who did what, to which entity, when, and
 * what changed. Every row is a record the backend wrote as a side effect of a
 * real change — the endpoint is read-only and refuses writes, so nothing here
 * was put here by a client.
 *
 * This screen also accepts `?screen=audit&id=<entity id>`, which filters to one
 * record's history. That is how every detail screen links to its own
 * provenance.
 */

/**
 * Events that record a decision or a state move get a visible badge; the rest
 * read as plain text. Colouring every row would make none of them stand out.
 */
const EVENT_VARIANT: Record<string, "complete" | "in-progress" | "open" | "agent"> = {
  REVIEW_FILED: "complete",
  ACTION_STATUS_CHANGED: "in-progress",
  ACTION_CREATED: "open",
  EVIDENCE_ATTACHED: "agent",
};

/**
 * Before/after, when the payload carries one.
 *
 * Two shapes exist: a review records `previous_state`/`new_state`, an action
 * status change records `from`/`to`. Both are read rather than normalised in
 * the backend, because each names its own domain accurately.
 */
function transition(payload: AuditEvent["payload"]): { from: string; to: string } | null {
  if (!payload) return null;
  const from = payload.previous_state ?? payload.from;
  const to = payload.new_state ?? payload.to;
  if (typeof from === "string" && typeof to === "string") return { from, to };
  return null;
}

const ENTITY_FILTER = [
  "All",
  "IMPACT_ASSESSMENT",
  "ACTION",
  "REGULATORY_DOCUMENT",
  "IMPACT_REPORT",
  "USER",
] as const;
type EntityFilter = (typeof ENTITY_FILTER)[number];

export function AuditTrailScreen() {
  const { selectedRecordId, navigateTo } = useApp();
  const [entityType, setEntityType] = useState<EntityFilter>("All");
  const [eventType, setEventType] = useState<string>("All");
  const [open, setOpen] = useState<AuditEvent | null>(null);

  // A deep link carries the entity whose history was asked for. It is applied
  // as a backend filter, so the header count is the real size of that history.
  const scopedToRecord = Boolean(selectedRecordId);

  const query = useAuditEvents({
    ...(selectedRecordId ? { entity_id: selectedRecordId } : {}),
    ...(entityType === "All" ? {} : { entity_type: entityType }),
    ...(eventType === "All" ? {} : { event_type: eventType }),
  });

  // The filter's options come from the backend rather than from the labels this
  // repo knows, so a newly emitted event type is filterable the day it ships.
  const vocabulary = useAuditEventTypes();
  const eventOptions = useMemo(
    () => ["All", ...(vocabulary.data?.event_types ?? knownEventTypes)],
    [vocabulary.data],
  );

  const columns: Column<AuditEvent>[] = [
    {
      key: "created_at",
      header: "When",
      card: "meta",
      value: (row) => row.created_at ?? null,
      render: (row) => (
        <span className="tabular font-mono text-fg-tertiary">{stamp(row.created_at)}</span>
      ),
    },
    {
      key: "actor",
      header: "Who",
      card: "title",
      value: (row) => row.actor_name ?? row.actor_email ?? row.actor_id ?? null,
      render: (row) =>
        row.actor_name || row.actor_email ? (
          <span className="text-fg-primary">{row.actor_name ?? row.actor_email}</span>
        ) : (
          // Not every event has an attributable user — a background job has
          // none. Saying so is better than showing a blank cell.
          <span className="text-fg-quaternary">System</span>
        ),
    },
    {
      key: "event_type",
      header: "Did what",
      card: "meta",
      value: (row) => row.event_type,
      render: (row) => {
        const variant = EVENT_VARIANT[row.event_type];
        return variant ? (
          <Badge variant={variant}>{eventLabel(row.event_type)}</Badge>
        ) : (
          <span className="text-fg-secondary">{eventLabel(row.event_type)}</span>
        );
      },
    },
    {
      key: "entity_type",
      header: "To what",
      card: "field",
      value: (row) => row.entity_type ?? null,
      render: (row) => <span className="text-fg-tertiary">{entityLabel(row.entity_type)}</span>,
    },
    {
      key: "entity_id",
      header: "Record",
      hide: "lg",
      card: "field",
      value: (row) => row.entity_id ?? null,
      render: (row) =>
        row.entity_id ? (
          <span className="font-mono text-fg-quaternary">{recordCrumb(row.entity_id)}</span>
        ) : (
          <span className="text-fg-quaternary">—</span>
        ),
    },
    {
      key: "change",
      header: "What changed",
      hide: "md",
      card: "field",
      value: (row) => {
        const move = transition(row.payload);
        return move ? `${move.from} → ${move.to}` : null;
      },
      render: (row) => {
        const move = transition(row.payload);
        if (!move) return <span className="text-fg-quaternary">—</span>;
        return (
          <span className="type-body-sm text-fg-tertiary">
            <span className="font-mono">{move.from.replace(/_/g, " ")}</span>
            <span className="mx-1 text-fg-quaternary">→</span>
            <span className="font-mono text-fg-secondary">{move.to.replace(/_/g, " ")}</span>
          </span>
        );
      },
    },
  ];

  const activeFilters =
    (entityType === "All" ? 0 : 1) + (eventType === "All" ? 0 : 1) + (scopedToRecord ? 1 : 0);

  return (
    <>
      <PageHeader
        title="Audit Trail"
        description="Every recorded change: who did what, to which record, when, and what changed. Written by the backend as changes happen — this view cannot add to it."
        breadcrumb={[{ label: "Governance" }, { label: "Audit Trail" }]}
        actions={
          <>
            <ApiCount query={query} />
            <ApiRefresh query={query} />
          </>
        }
      >
        <FilterBar
          activeCount={activeFilters}
          onClear={
            activeFilters > 0
              ? () => {
                  setEntityType("All");
                  setEventType("All");
                  // Clearing the record scope means dropping the `id` deep link.
                  if (scopedToRecord) navigateTo("audit");
                }
              : undefined
          }
        >
          <FilterSelect
            label="Record type"
            value={entityType}
            onChange={setEntityType}
            options={ENTITY_FILTER}
            optionLabel={(option) => (option === "All" ? "All" : entityLabel(option))}
          />
          <FilterSelect
            label="Event"
            value={eventType}
            onChange={setEventType}
            options={eventOptions}
            optionLabel={(option) => (option === "All" ? "All" : eventLabel(option))}
          />
          {scopedToRecord && (
            <span className="type-body-sm inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-stroke-secondary px-2.5 text-fg-tertiary">
              History of <span className="font-mono">{recordCrumb(selectedRecordId)}</span>
            </span>
          )}
        </FilterBar>
      </PageHeader>

      <PageBody>
        <ApiState
          query={query}
          emptyTitle={
            scopedToRecord ? "No recorded history for this record" : "No audit events yet"
          }
          emptyDetail={
            scopedToRecord
              ? "Nothing has happened to this record since the audit trail began recording."
              : "Events appear as work happens — a document uploaded, an impact analysed, a decision filed, an action moved."
          }
        >
          {(rows) => (
            <DataTable
              rows={rows}
              columns={columns}
              rowKey={(row) => row.id}
              onRowOpen={setOpen}
              isRowActive={(row) => row.id === open?.id}
              defaultSort={{ key: "created_at", dir: "desc" }}
              searchPlaceholder="Search the trail by actor, event or record"
              getSearchText={(row) =>
                `${row.actor_name ?? ""} ${row.actor_email ?? ""} ${eventLabel(row.event_type)} ${
                  row.entity_type ?? ""
                } ${row.entity_id ?? ""}`
              }
              exportName="parivart-audit-trail"
              emptyTitle="No events match this search"
            />
          )}
        </ApiState>
      </PageBody>

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        width={580}
        title={open ? eventLabel(open.event_type) : "Audit event"}
        subtitle={open ? stamp(open.created_at) : undefined}
        footer={
          open?.entity_id && (
            <div className="flex w-full flex-wrap items-center gap-2">
              <span className="type-body-sm mr-auto text-fg-tertiary">
                {entityLabel(open.entity_type)} · {recordCrumb(open.entity_id)}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setOpen(null);
                  setEntityType("All");
                  setEventType("All");
                  navigateTo("audit");
                }}
                disabled={!scopedToRecord}
              >
                Clear record filter
              </Button>
            </div>
          )
        }
      >
        {open && <AuditEventDetail event={open} />}
      </Drawer>
    </>
  );
}

/**
 * One event in full: the five questions, then whatever else the payload carries.
 *
 * The payload is rendered generically because its keys differ per event type,
 * and enumerating them here would mean this screen needed changing every time
 * the backend recorded something new.
 */
function AuditEventDetail({ event }: { event: AuditEvent }) {
  const move = transition(event.payload);

  // Keys already shown above, so they are not repeated in the raw detail.
  const shown = new Set(["previous_state", "new_state", "from", "to"]);
  const extra = Object.entries(event.payload ?? {}).filter(([key]) => !shown.has(key));

  return (
    <>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Who">
          {event.actor_name ?? event.actor_email ?? "System (no attributable user)"}
        </Field>
        <Field label="When">{stamp(event.created_at)}</Field>
        <Field label="Did what">{eventLabel(event.event_type)}</Field>
        <Field label="To what">{entityLabel(event.entity_type)}</Field>
      </dl>

      {event.actor_email && event.actor_name && (
        <div>
          <h3 className="type-label-sm text-fg-quaternary">Actor</h3>
          <p className="type-body-md mt-1 text-fg-secondary">{event.actor_email}</p>
        </div>
      )}

      <div>
        <h3 className="type-label-sm text-fg-quaternary">Record</h3>
        <p className="type-body-md mt-1 font-mono break-all text-fg-tertiary">
          {event.entity_id ?? "Not tied to a single record"}
        </p>
      </div>

      {move && (
        <div>
          <h3 className="type-label-sm text-fg-quaternary">What changed</h3>
          <p className="type-body-md mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="neutral">{move.from.replace(/_/g, " ")}</Badge>
            <span className="text-fg-quaternary">→</span>
            <Badge variant="complete">{move.to.replace(/_/g, " ")}</Badge>
          </p>
        </div>
      )}

      <div>
        <h3 className="type-label-sm text-fg-quaternary">Detail</h3>
        {extra.length === 0 ? (
          <p className="type-body-md mt-1 text-fg-quaternary">
            This event carries no further detail.
          </p>
        ) : (
          <dl className="mt-1 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {extra.map(([key, value]) => (
              <Field key={key} label={humanise(key)}>
                {value === null || value === undefined ? (
                  <span className="text-fg-quaternary">—</span>
                ) : typeof value === "boolean" ? (
                  value ? (
                    "Yes"
                  ) : (
                    "No"
                  )
                ) : Array.isArray(value) ? (
                  value.length === 0 ? (
                    <span className="text-fg-quaternary">—</span>
                  ) : (
                    value.map((entry) => humanise(String(entry))).join(", ")
                  )
                ) : (
                  <span className="font-mono break-all">{String(value)}</span>
                )}
              </Field>
            ))}
          </dl>
        )}
      </div>

      <p className="type-body-sm text-fg-quaternary">
        Audit events are written by the backend as part of the change they describe. They cannot be
        added, edited or removed through the API.
      </p>
    </>
  );
}
