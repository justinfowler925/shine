/**
 * shadcn form-app — authored reference for the `form` screen (Operate form-app).
 *
 * shadcn ships no composed form block. Kit form-element pages show controls; this
 * is one entity create with a single primary submit. Region map: shadcn-form.md.
 */
"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Values = {
  name: string;
  account: string;
  owner: string;
  closeDate: string;
  notes: string;
};

const EMPTY: Values = { name: "", account: "", owner: "", closeDate: "", notes: "" };
const REQUIRED: (keyof Values)[] = ["name", "account", "owner", "closeDate"];
const LABELS: Record<keyof Values, string> = {
  name: "Opportunity name",
  account: "Account",
  owner: "Owner",
  closeDate: "Expected close",
  notes: "Notes",
};

function FieldRow({
  id, label, helper, required, error, children,
}: {
  id: string; label: string; helper: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:items-start sm:gap-6">
      <div>
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? <span className="text-muted-foreground"> · Required</span> : null}
        </Label>
        <p className="mt-0.5 text-sm text-muted-foreground">{helper}</p>
      </div>
      <div className="min-w-0 space-y-1">
        {children}
        {error ? <p className="text-sm text-destructive" id={`${id}-error`}>{error}</p> : null}
      </div>
    </div>
  );
}

export default function FormAppPage() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [blocked, setBlocked] = useState<(keyof Values)[]>([]);
  const [status, setStatus] = useState("No changes saved yet.");

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setBlocked((prev) => prev.filter((k) => k !== key));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const missing = REQUIRED.filter((key) => !String(values[key]).trim());
    if (missing.length) {
      setBlocked(missing);
      setStatus("Fix the highlighted fields, then create the opportunity.");
      return;
    }
    setBlocked([]);
    setStatus("Opportunity created. You can edit it from the record.");
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-8" data-cite="shadcn-form" data-region="form-app">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Create opportunity</h1>
        <p className="text-sm text-muted-foreground">
          Saves a new opportunity on the account and opens its record.
        </p>
      </header>

      <form className="mt-8 space-y-8" onSubmit={submit} noValidate>
        {blocked.length ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Could not create yet</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {blocked.map((key) => (
                  <li key={key}>
                    <a href={`#field-${key}`} className="underline underline-offset-2">{LABELS[key]}</a>
                    {" "}is required.
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        <section aria-labelledby="basics-heading" className="divide-y divide-border">
          <h2 id="basics-heading" className="pb-2 text-lg font-semibold">Basics</h2>
          <FieldRow
            id="field-name"
            label={LABELS.name}
            helper="The name the team will search for."
            required
            error={blocked.includes("name") ? "Enter an opportunity name." : undefined}
          >
            <Input
              id="field-name"
              name="name"
              value={values.name}
              aria-required="true"
              aria-invalid={blocked.includes("name") || undefined}
              aria-describedby={blocked.includes("name") ? "field-name-error" : undefined}
              onChange={(e) => set("name", e.target.value)}
            />
          </FieldRow>
          <FieldRow
            id="field-account"
            label={LABELS.account}
            helper="Which customer this opportunity belongs to."
            required
            error={blocked.includes("account") ? "Choose an account." : undefined}
          >
            <Select value={values.account || undefined} onValueChange={(v) => set("account", v)}>
              <SelectTrigger id="field-account" aria-required="true" aria-invalid={blocked.includes("account") || undefined}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zurich">Zurich — UK claims</SelectItem>
                <SelectItem value="northwind">Northwind Logistics</SelectItem>
                <SelectItem value="contoso">Contoso Retail</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </section>

        <section aria-labelledby="owner-heading" className="divide-y divide-border">
          <h2 id="owner-heading" className="pb-2 text-lg font-semibold">Owner &amp; timing</h2>
          <FieldRow
            id="field-owner"
            label={LABELS.owner}
            helper="Who is accountable for the next step."
            required
            error={blocked.includes("owner") ? "Choose an owner." : undefined}
          >
            <Select value={values.owner || undefined} onValueChange={(v) => set("owner", v)}>
              <SelectTrigger id="field-owner" aria-required="true" aria-invalid={blocked.includes("owner") || undefined}>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morgan">Morgan Lee</SelectItem>
                <SelectItem value="jordan">Jordan Ng</SelectItem>
                <SelectItem value="riley">Riley Cho</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow
            id="field-closeDate"
            label={LABELS.closeDate}
            helper="Target date for a decision, not a forecast lock."
            required
            error={blocked.includes("closeDate") ? "Enter an expected close date." : undefined}
          >
            <Input
              id="field-closeDate"
              name="closeDate"
              type="date"
              value={values.closeDate}
              aria-required="true"
              aria-invalid={blocked.includes("closeDate") || undefined}
              onChange={(e) => set("closeDate", e.target.value)}
            />
          </FieldRow>
        </section>

        <section aria-labelledby="notes-heading" className="divide-y divide-border">
          <h2 id="notes-heading" className="pb-2 text-lg font-semibold">Notes</h2>
          <FieldRow id="field-notes" label={LABELS.notes} helper="Optional context for the next owner.">
            <Textarea
              id="field-notes"
              name="notes"
              rows={3}
              value={values.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </FieldRow>
        </section>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button type="submit">Create opportunity</Button>
          <Button type="button" variant="outline" onClick={() => { setValues(EMPTY); setBlocked([]); setStatus("Form cleared. Nothing saved."); }}>
            Cancel
          </Button>
          <p className="text-sm text-muted-foreground" role="status">{status}</p>
        </div>
      </form>
    </main>
  );
}
