"use client";
import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCustomer } from "@/app/studio/actions/customers";

interface Customer {
  id: string;
  displayName: string;
  companyName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  address: string | null;
  notes: string | null;
}

export function CustomerDetailEditor({ customer }: { customer: Customer }) {
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    displayName: customer.displayName,
    companyName: customer.companyName ?? "",
    primaryEmail: customer.primaryEmail ?? "",
    primaryPhone: customer.primaryPhone ?? "",
    address: customer.address ?? "",
    notes: customer.notes ?? "",
  });

  const save = () => {
    startTransition(async () => {
      await updateCustomer({
        customerId: customer.id,
        patch: {
          displayName: form.displayName,
          companyName: form.companyName || null,
          primaryEmail: form.primaryEmail || null,
          primaryPhone: form.primaryPhone || null,
          address: form.address || null,
          notes: form.notes || null,
        },
      });
      toast.success("Gespeichert");
    });
  };

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold mb-4">Stammdaten</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5 sm:col-span-2">
          <Label mono>Anzeigename</Label>
          <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label mono>Firma</Label>
          <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label mono>E-Mail</Label>
          <Input type="email" value={form.primaryEmail} onChange={(e) => setForm({ ...form, primaryEmail: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label mono>Telefon</Label>
          <Input type="tel" value={form.primaryPhone} onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label mono>Adresse</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label mono>Notizen</Label>
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={save} disabled={pending}>
          <Save className="h-4 w-4" />
          Speichern
        </Button>
      </div>
    </Card>
  );
}
