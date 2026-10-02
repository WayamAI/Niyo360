import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AppIcon } from "@/components/icons";
import { useApp } from "@/context/AppContext";
import { PageBody, PageHeader } from "@/components/shared/Page";
import { Panel } from "@/components/shared/Panel";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { ThinkingDots } from "@/components/shared/Atoms";
import { PRODUCTS } from "@/data/mockData";

const CATEGORIES = ["CMC", "Label", "Safety", "Clinical", "Administrative"];
const CHANGE_TYPES = [
  "Manufacturing Site Transfer / Addition",
  "Excipient Specification Change",
  "Analytical Method Change",
  "Packaging Change",
  "Shelf Life Extension",
  "Specification Change",
];
const REGIONS = ["Global", "EU/EEA", "Americas", "Asia Pacific", "MEA", "Eastern Europe"];
const PRIORITIES = ["Standard", "Expedited", "Urgent"];

const INPUT_CLASS =
  "type-body-md h-8 w-full rounded-md border border-stroke-default bg-action px-2.5 text-fg-primary placeholder:text-fg-quaternary transition-colors duration-150 hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Read-only value rendered in the same slot shape as an input. */
const READONLY_CLASS =
  "type-body-md flex h-8 w-full items-center rounded-md border border-stroke-muted bg-raised px-2.5 text-fg-secondary";

export function NewChangeEntry() {
  const { navigateTo, showToast, logAudit, setSelectedChangeId } = useApp();
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>(["Global"]);
  const [ccdsImpacted, setCcdsImpacted] = useState(true);
  const [coreLabelImpacted, setCoreLabelImpacted] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [steps, setSteps] = useState<string[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const errorId = useId();

  // Without this, navigating away mid-simulation left four timers running that
  // called setState and navigateTo on an unmounted screen.
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function toggleRegion(region: string) {
    setRegions((current) =>
      current.includes(region) ? current.filter((item) => item !== region) : [...current, region],
    );
  }

  function run(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setTitleError("Enter a change title before running the simulation.");
      titleRef.current?.focus();
      return;
    }
    setTitleError(null);
    setSimulating(true);
    setSteps(["Indexing affected markets…"]);
    logAudit({
      actor: "Regulatory Operations",
      actorType: "user",
      pillar: "04",
      action: `Triggered simulation for new change: "${title}"`,
    });
    timers.current.push(
      window.setTimeout(
        () => setSteps((current) => [...current, "Classifying variation types by jurisdiction…"]),
        700,
      ),
      window.setTimeout(
        () => setSteps((current) => [...current, "Mapping CCDS-to-label cascade…"]),
        1500,
      ),
      window.setTimeout(() => {
        setSelectedChangeId("CHG-2025-0047");
        navigateTo("heatmap");
        logAudit({
          actor: "Cascade Agent",
          actorType: "agent",
          pillar: "04",
          action: "Cascade simulation complete. 47 markets mapped. Confidence 94%.",
        });
      }, 2800),
    );
  }

  return (
    <>
      <PageHeader
        title="New Change Entry"
        source="illustrative"
        description="Enter a proposed change to simulate its regulatory cascade across every registered market before authoring begins."
        breadcrumb={[
          { label: "Change Simulator", onClick: () => navigateTo("simulator") },
          { label: "New change" },
        ]}
        badges={<Badge variant="pillar-04">Pillar 04</Badge>}
        onBack={() => navigateTo("simulator")}
      />

      <PageBody>
        <form onSubmit={run} className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <Panel title="Change identification">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Change ID" hint="Auto-generated">
                <span className={`${READONLY_CLASS} font-mono`}>CHG-2025-0054</span>
              </FormField>
              <FormField label="Initiated by">
                <span className={READONLY_CLASS}>Regulatory Operations Team</span>
              </FormField>
              <FormField label="Change title" required full error={titleError} errorId={errorId}>
                <input
                  ref={titleRef}
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (titleError) setTitleError(null);
                  }}
                  aria-invalid={Boolean(titleError)}
                  aria-describedby={titleError ? errorId : undefined}
                  placeholder="e.g. Secondary API synthesis site addition"
                  className={`${INPUT_CLASS} ${titleError ? "border-error-icon" : ""}`}
                />
              </FormField>
              <FormField label="Date">
                <span className={`${READONLY_CLASS} tabular font-mono`}>22 May 2025</span>
              </FormField>
            </div>
          </Panel>

          <Panel title="Product and scope">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <FormField label="Product">
                <select className={INPUT_CLASS} defaultValue={PRODUCTS[0].name}>
                  {PRODUCTS.map((product) => (
                    <option key={product.id}>{product.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Change category">
                <select className={INPUT_CLASS} defaultValue={CATEGORIES[0]}>
                  {CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Change type" full>
                <select className={INPUT_CLASS} defaultValue={CHANGE_TYPES[0]}>
                  {CHANGE_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Description" full>
                <textarea
                  rows={4}
                  placeholder="Describe the proposed change"
                  className="type-body-md w-full rounded-md border border-stroke-default bg-action px-2.5 py-2 text-fg-primary placeholder:text-fg-quaternary transition-colors duration-150 hover:border-stroke-active focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                />
              </FormField>
            </div>

            {/* These were styled buttons with no state and no type, so the
                first one looked permanently selected and clicking any of them
                submitted nothing. They are now real multi-select toggles. */}
            <fieldset className="mt-3 min-w-0">
              <legend className="type-label-sm mb-1.5 text-fg-quaternary">Affected markets</legend>
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map((region) => {
                  const active = regions.includes(region);
                  return (
                    <button
                      key={region}
                      type="button"
                      onClick={() => toggleRegion(region)}
                      aria-pressed={active}
                      className={`type-body-md inline-flex h-7 items-center rounded-full border px-2.5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                        active
                          ? "border-transparent bg-action-primary text-on-action-primary"
                          : "border-stroke-default bg-action text-fg-tertiary hover:border-stroke-active hover:text-fg-secondary"
                      }`}
                    >
                      {region}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </Panel>

          <Panel title="Regulatory context">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Switch label="CCDS impacted" checked={ccdsImpacted} onChange={setCcdsImpacted} />
              <Switch
                label="Core label impacted"
                checked={coreLabelImpacted}
                onChange={setCoreLabelImpacted}
              />
              <FormField label="Submission history reference" full>
                <input placeholder="e.g. CHG-2024-0031" className={INPUT_CLASS} />
              </FormField>
            </div>

            <fieldset className="mt-3">
              <legend className="type-label-sm mb-1.5 text-fg-quaternary">Priority</legend>
              <div className="flex flex-wrap gap-4">
                {PRIORITIES.map((priority, index) => (
                  <label
                    key={priority}
                    className="type-body-md flex items-center gap-2 text-fg-primary"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={priority}
                      defaultChecked={index === 0}
                      className="accent-[color:var(--brand)]"
                    />
                    {priority}
                  </label>
                ))}
              </div>
            </fieldset>
          </Panel>

          {simulating && (
            <Panel>
              <div role="status" aria-live="polite">
                <div className="type-body-md mb-2 text-fg-tertiary">
                  Cascade simulation in progress…
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-action">
                  <div className="sim-bar h-full" style={{ background: "var(--pillar-04)" }} />
                </div>
                <ul className="mt-2.5 space-y-1">
                  {steps.map((step) => (
                    <li
                      key={step}
                      className="type-body-md event-enter flex gap-1.5 text-fg-primary"
                    >
                      <AppIcon
                        name="chevronRight"
                        size="xs"
                        className="mt-1 shrink-0 text-icon-quaternary"
                      />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => showToast("Change draft saved.", "success")}
            >
              Save as draft
            </Button>
            <Button type="submit" disabled={simulating}>
              {simulating ? (
                <>
                  <ThinkingDots /> Simulating
                </>
              ) : (
                <>
                  <AppIcon name="simulator" size="sm" /> Run impact simulation
                </>
              )}
            </Button>
          </div>
        </form>
      </PageBody>
    </>
  );
}

function FormField({
  label,
  hint,
  full,
  required,
  error,
  errorId,
  children,
}: {
  label: string;
  hint?: string;
  full?: boolean;
  required?: boolean;
  error?: string | null;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${full ? "md:col-span-2" : ""}`}>
      <span className="mb-1 flex items-center justify-between gap-2">
        <span className="type-label-sm text-fg-quaternary">
          {label}
          {required && (
            <span className="text-error-icon" aria-hidden="true">
              {" *"}
            </span>
          )}
        </span>
        {hint && (
          <span className="type-caption rounded bg-action px-1.5 py-0.5 text-fg-quaternary">
            {hint}
          </span>
        )}
      </span>
      {children}
      {error && (
        <span id={errorId} role="alert" className="type-body-sm mt-1 block text-error">
          {error}
        </span>
      )}
    </label>
  );
}

/** Real switch semantics: the previous version was an unlabelled <button>. */
function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex h-8 items-center justify-between gap-3 rounded-md border border-stroke-default bg-action px-2.5">
      <span className="type-body-md text-fg-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
          checked ? "bg-brand" : "bg-stroke-active"
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-0.5 block size-4 rounded-full bg-on-brand-surface transition-transform duration-150 ${
            checked ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
