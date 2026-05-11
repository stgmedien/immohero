"use client";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCustomer } from "@/app/studio/actions/customers";

export function CreateCustomerDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    displayName: "",
    kind: "person" as "person" | "company",
    companyName: "",
    primaryEmail: "",
    primaryPhone: "",
    address: "",
    notes: "",
  });

  const submit = () => {
    startTransition(async () => {
      try {
        const customer = await createCustomer(form);
        toast.success("Kunde angelegt");
        setOpen(false);
        if (customer) router.push(`/studio/kunden/${customer.id}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Fehler");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Neuer Kunde
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Kunde</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label mono>Typ</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as "person" | "company" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="person">Privatperson</SelectItem>
                <SelectItem value="company">Firma</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Name / Anzeigename *</Label>
            <Input
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder={form.kind === "company" ? "Müller Immobilien GmbH" : "Anja Schäfer"}
              autoFocus
            />
          </div>
          {form.kind === "person" && (
            <div className="grid gap-1.5">
              <Label mono>Firmenname (optional)</Label>
              <Input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label mono>E-Mail</Label>
              <Input
                type="email"
                value={form.primaryEmail}
                onChange={(e) => setForm({ ...form, primaryEmail: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label mono>Telefon</Label>
              <Input
                type="tel"
                value={form.primaryPhone}
                onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label mono>Adresse</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label mono>Notizen</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button onClick={submit} disabled={pending || !form.displayName}>
            Anlegen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
