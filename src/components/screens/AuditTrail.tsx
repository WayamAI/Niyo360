import { Fragment, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Card, Eyebrow } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";

export function AuditTrail() {
  const { auditLog, showToast } = useApp();
  const [typeFilter, setTypeFilter] = useState("All");
  const [pillarFilter, setPillarFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      auditLog.filter(
        (e) =>
          (typeFilter === "All" || e.actorType === typeFilter.toLowerCase()) &&
          (pillarFilter === "All" || e.pillar === pillarFilter) &&
          (search === "" ||
            e.action.toLowerCase().includes(search.toLowerCase()) ||
            e.actor.toLowerCase().includes(search.toLowerCase())),
      ),
    [auditLog, typeFilter, pillarFilter, search],
  );

  return (
    <div className="page-enter space-y-5">
      <div>
        <h1 className="type-display-page text-fg-primary">Audit Trail</h1>
        <p className="text-sm text-fg-tertiary mt-1">
          End-to-end traceability across all four capability pillars. Every agent action, user
          action, and system event is logged with timestamp and entity reference.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { l: "TOTAL EVENTS LOGGED", v: "847" },
          {
            l: "EVENTS TODAY",
            v: String(auditLog.filter((e) => e.timestamp.startsWith("2025-05-22")).length || 15),
          },
          { l: "PILLARS ACTIVE", v: "4" },
        ].map((k) => (
          <Card key={k.l}>
            <div className="text-2xs uppercase tracking-wider text-fg-tertiary mb-2">{k.l}</div>
            <div className="type-display-metric-md text-fg-primary">{k.v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md bg-action border border-stroke-default px-3 text-xs"
          >
            {["All", "User", "Agent", "System"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select
            value={pillarFilter}
            onChange={(e) => setPillarFilter(e.target.value)}
            className="h-9 rounded-md bg-action border border-stroke-default px-3 text-xs"
          >
            {["All", "01", "02", "03", "04"].map((p) => (
              <option key={p} value={p}>
                Pillar: {p}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="flex-1 min-w-[200px] h-9 rounded-md bg-action border border-stroke-default px-3 text-xs"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => showToast("Audit report exported.", "success")}
          >
            Export Audit Report
          </Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-action text-fg-quaternary type-label-md sticky top-0 z-10">
                {["Timestamp", "Type", "Pillar", "Actor", "Action", "Change ID"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <Fragment key={e.id}>
                  <tr
                    className="border-t border-stroke-muted transition-colors duration-200 hover:bg-raised-2 cursor-pointer"
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  >
                    <td className="px-4 py-3 font-mono text-fg-tertiary">{e.timestamp}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          e.actorType === "agent"
                            ? "agent"
                            : e.actorType === "user"
                              ? "complete"
                              : "open"
                        }
                      >
                        {e.actorType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {e.pillar ? (
                        <Badge variant={`pillar-0${e.pillar.slice(-1)}` as any}>{e.pillar}</Badge>
                      ) : (
                        <span className="text-fg-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-fg-primary font-medium">{e.actor}</td>
                    <td className="px-4 py-3 text-fg-tertiary max-w-[500px]">
                      <span className="line-clamp-2">{e.action}</span>
                    </td>
                    <td
                      className="px-4 py-3 font-mono"
                      style={{ color: e.changeId ? "var(--brand)" : "var(--fg-tertiary)" }}
                    >
                      {e.changeId || "—"}
                    </td>
                  </tr>
                  {expanded === e.id && (
                    <tr className="bg-action/40">
                      <td colSpan={6} className="px-4 py-3 text-xs text-fg-primary">
                        <div>
                          <strong>Full action:</strong> {e.action}
                        </div>
                        {e.changeId && (
                          <div className="mt-1 text-fg-tertiary">
                            Linked change: <span className="font-mono">{e.changeId}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <Eyebrow>Traceability Chain, CHG-2025-0047</Eyebrow>
        <div className="flex flex-wrap items-center gap-2">
          {[
            "Change Entered",
            "Simulation Complete",
            "Classification",
            "Validation",
            "Filing Prepared",
          ].map((step, i, arr) => (
            <Fragment key={step}>
              <div className="rounded-md border border-stroke-default bg-action px-3 py-2">
                <div className="text-2xs text-fg-tertiary">Step {i + 1}</div>
                <div className="text-xs text-fg-primary font-medium">{step}</div>
              </div>
              {i < arr.length - 1 && <span className="text-fg-tertiary">→</span>}
            </Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}
