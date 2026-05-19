"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/konto/actions";

export function ProfileForm({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [pending, startTransition] = useTransition();

  const dirty = name !== initialName || phone !== initialPhone;

  function save() {
    startTransition(async () => {
      const res = await updateProfile({ name, phone });
      if (res.ok) {
        toast.success("Profil gespeichert.");
      } else {
        toast.error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  return (
    <div className="grid gap-5 sm:max-w-md">
      <div className="grid gap-1.5">
        <Label htmlFor="pf-name">Name</Label>
        <Input
          id="pf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Vor- und Nachname"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="pf-phone">Telefon</Label>
        <Input
          id="pf-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          placeholder="z. B. 0151 23456789"
        />
      </div>
      <div className="grid gap-1.5">
        <Label>E-Mail</Label>
        <Input value={email} disabled readOnly />
        <p className="text-xs text-[var(--color-ink-mute)]">
          Die E-Mail-Adresse ist mit deinem Login verknüpft und kann nicht hier
          geändert werden — melde dich dafür bei uns.
        </p>
      </div>
      <Button onClick={save} disabled={pending || !dirty} className="justify-self-start">
        {pending ? "Speichert…" : "Speichern"}
      </Button>
    </div>
  );
}
