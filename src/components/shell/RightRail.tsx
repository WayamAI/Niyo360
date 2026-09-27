import { useEffect, useState } from "react";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { Badge, badgeForStatus } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/States";
import { ESCALATIONS, MESSAGES } from "@/data/mockData";

type Tab = "audit" | "escalations" | "messages";

const TABS: { id: Tab; label: string }[] = [
  { id: "audit", label: "Activity" },
  { id: "escalations", label: "Escalations" },
  { id: "messages", label: "Messages" },
];

/**
 * Contextual side panel: what just happened, what is escalated, and who said
 * what. Inline at xl and above, an overlay below that — 320px of permanent
 * chrome is not affordable on a laptop, let alone a phone, and the previous
 * version kept it pinned at every width with the main region pushed by an
 * inline `right: 320` on <main>.
 */
export function RightRail() {
  const { isRailOpen, toggleRail, auditLog, resolvedEscalations, showToast, navigateTo } = useApp();
  const [tab, setTab] = useState<Tab>("audit");

  // The panel overlays content below xl, so Escape should dismiss it there.
  useEffect(() => {
    if (!isRailOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && window.innerWidth < 1280) toggleRail();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isRailOpen, toggleRail]);

  const openEscalations = ESCALATIONS.filter((e) => !resolvedEscalations.has(e.id));

  return (
    <>
      {/* Handle. Sits against the panel edge when open, the viewport edge when
          closed, and is hidden on phones where a 20px tab is not a target. */}
      <button
        type="button"
        onClick={toggleRail}
        aria-label={isRailOpen ? "Collapse context panel" : "Expand context panel"}
        aria-expanded={isRailOpen}
        className={`fixed top-1/2 z-40 hidden h-12 w-5 -translate-y-1/2 place-items-center rounded-l-md border border-r-0 border-stroke-muted bg-action text-icon-tertiary transition-colors duration-150 hover:bg-raised hover:text-icon-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:grid ${
          isRailOpen ? "right-[320px]" : "right-0"
        }`}
      >
        <AppIcon name={isRailOpen ? "chevronRight" : "chevronLeft"} size="sm" />
      </button>

      {isRailOpen && (
        <button
          type="button"
          aria-label="Close context panel"
          onClick={toggleRail}
          className="fixed inset-0 z-40 bg-scrim xl:hidden"
        />
      )}

      <aside
        aria-label="Context"
        aria-hidden={!isRailOpen}
        className={`fixed inset-y-0 right-0 z-40 flex w-[320px] max-w-full shrink-0 flex-col border-l border-stroke-muted bg-container transition-transform duration-200 ease-out xl:relative xl:inset-auto xl:z-auto ${
          isRailOpen ? "translate-x-0" : "pointer-events-none translate-x-full xl:hidden"
        }`}
      >
        <div
          role="tablist"
          aria-label="Context panel sections"
          className="flex h-11 shrink-0 border-b border-stroke-muted"
        >
          {TABS.map((item) => {
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={`type-label-md flex-1 border-b-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none ${
                  selected
                    ? "border-brand text-fg-primary"
                    : "border-transparent text-fg-tertiary hover:text-fg-secondary"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto" role="tabpanel">
          {tab === "audit" &&
            (auditLog.length === 0 ? (
              <EmptyState title="No activity yet" detail="Agent and user actions appear here." />
            ) : (
              <ul>
                {auditLog.slice(0, 50).map((event, index) => {
                  const dot =
                    event.actorType === "user"
                      ? "var(--feedback-success-icon)"
                      : event.actorType === "agent"
                        ? "var(--pillar-02)"
                        : "var(--feedback-info-icon)";
                  return (
                    <li
                      key={event.id}
                      className={`border-b border-stroke-muted px-3 py-2.5 transition-colors duration-150 hover:bg-raised ${
                        index === 0 ? "event-enter" : ""
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: dot }}
                          aria-hidden="true"
                        />
                        <span className="type-body-md min-w-0 flex-1 truncate font-medium text-fg-primary">
                          {event.actor}
                        </span>
                        <span className="type-caption tabular shrink-0 font-mono text-fg-quaternary">
                          {event.timestamp.split(" ")[1] || event.timestamp}
                        </span>
                      </div>
                      <p className="type-body-sm line-clamp-2 pl-4 text-fg-tertiary">
                        {event.action}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === "escalations" &&
            (openEscalations.length === 0 ? (
              <EmptyState
                title="No open escalations"
                detail="Everything raised has been resolved."
                icon="success"
              />
            ) : (
              <ul className="space-y-2 p-3">
                {openEscalations.map((item) => {
                  const severity =
                    item.severity === "Critical"
                      ? "var(--feedback-error-icon)"
                      : item.severity === "High"
                        ? "var(--feedback-warning-icon)"
                        : "var(--feedback-info-icon)";
                  return (
                    <li
                      key={item.id}
                      className="rounded-md border border-stroke-muted bg-raised p-3"
                      style={{ borderLeft: `2px solid ${severity}` }}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="type-caption font-mono text-fg-quaternary">{item.id}</span>
                        <Badge variant={badgeForStatus(item.status)}>{item.status}</Badge>
                      </div>
                      <div className="type-body-md font-medium text-fg-primary">
                        {item.productName}
                      </div>
                      <div className="type-caption text-fg-quaternary">{item.market}</div>
                      <p className="type-body-sm mt-1 line-clamp-2 text-fg-tertiary">
                        {item.issue}
                      </p>
                      <div className="mt-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigateTo("escalations")}
                        >
                          Open in Escalations
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === "messages" &&
            (MESSAGES.length === 0 ? (
              <EmptyState title="No messages" />
            ) : (
              <ul>
                {MESSAGES.map((message) => (
                  <li
                    key={message.id}
                    className="flex gap-3 border-b border-stroke-muted px-3 py-2.5 transition-colors duration-150 hover:bg-raised"
                  >
                    <span
                      className="type-caption grid size-7 shrink-0 place-items-center rounded-full font-medium text-brand"
                      style={{ background: "color-mix(in oklab, var(--brand) 14%, transparent)" }}
                      aria-hidden="true"
                    >
                      {message.senderInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="type-body-md truncate font-medium text-fg-primary">
                          {message.senderName}
                        </span>
                        <span className="type-caption tabular shrink-0 font-mono text-fg-quaternary">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="type-body-sm mt-0.5 line-clamp-2 text-fg-tertiary">
                        {message.preview}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </aside>
    </>
  );
}
