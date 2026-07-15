import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MAX_DAYS = 5;
const STORE = "s8-booking-2";
const DAY_FMT = new Intl.DateTimeFormat("da-DK", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Copenhagen" });
const TIME_FMT = new Intl.DateTimeFormat("da-DK", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Copenhagen" });

type Slot = { start: string; end: string };
type Booking = { companyId: string; contactId: string };
type Step = "form" | "slots" | "confirm" | "done";

let slotCache: Promise<Slot[] | null> | null = null;
function warmSlots(): Promise<Slot[] | null> {
  if (!slotCache) {
    const to = new Date(Date.now() + 14 * 86_400_000).toISOString();
    slotCache = fetch(`/api/availability?to=${encodeURIComponent(to)}`)
      .then((r) => { if (!r.ok) throw new Error("availability"); return r.json(); })
      .then((d) => (d?.slots as Slot[]) ?? [])
      .catch(() => { slotCache = null; return null; });
  }
  return slotCache;
}

function normalizeWebsite(v: string): string {
  v = (v || "").trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try { const u = new URL(v); if (u.hostname.includes(".")) return u.href; } catch { /* ignore */ }
  return "";
}
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function BookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [step, setStep] = useState<Step>("form");
  const [status, setStatus] = useState<{ msg: string; error: boolean }>({ msg: "", error: false });
  const [busy, setBusy] = useState(false);
  const [slots, setSlots] = useState<Slot[] | null | "loading">(null);
  const [when, setWhen] = useState<string>("");
  const [f, setF] = useState({ navn: "", virksomhed: "", hjemmeside: "", email: "", note: "", nyhedsbrev: false, samtykke: false });
  const booking = useRef<Booking | null>(null);

  useEffect(() => {
    try { const s = sessionStorage.getItem(STORE); if (s) booking.current = JSON.parse(s); } catch { /* ignore */ }
  }, []);
  useEffect(() => { if (open) warmSlots(); }, [open]);

  const loadSlots = useCallback(() => {
    setStep("slots"); setSlots("loading");
    warmSlots().then((s) => setSlots(s));
  }, []);

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!f.samtykke) { setStatus({ msg: "Sæt flueben i samtykke, så vi må kontakte dig.", error: true }); return; }
    if (booking.current) { loadSlots(); return; }
    if (!f.navn.trim() || !f.virksomhed.trim() || !emailOk(f.email.trim())) {
      setStatus({ msg: "Udfyld navn, virksomhed og en gyldig e-mail.", error: true }); return;
    }
    setBusy(true); setStatus({ msg: "Opretter ...", error: false });
    const payload: Record<string, unknown> = {
      company: { name: f.virksomhed.trim(), ...(normalizeWebsite(f.hjemmeside) ? { website: normalizeWebsite(f.hjemmeside) } : {}) },
      contact: { name: f.navn.trim(), email: f.email.trim() },
      newsletter: f.nyhedsbrev, consent: true,
      ...(f.note.trim() ? { note: f.note.trim() } : {}),
    };
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("lead");
      const data = await res.json();
      booking.current = { companyId: data.companyId, contactId: data.contactId };
      try { sessionStorage.setItem(STORE, JSON.stringify(booking.current)); } catch { /* ignore */ }
      setStatus({ msg: "", error: false }); loadSlots();
    } catch {
      setStatus({ msg: "Noget gik galt. Prøv igen, eller skriv til os direkte.", error: true });
    } finally { setBusy(false); }
  }

  async function confirmBooking() {
    if (!booking.current) return;
    setStatus({ msg: `Booker ${TIME_FMT.format(new Date(when))} ...`, error: false });
    try {
      const res = await fetch("/api/meeting", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: booking.current.companyId, contactId: booking.current.contactId, when, durationMinutes: 30 }),
      });
      if (res.status === 409) { setStatus({ msg: "Tidspunktet blev lige taget. Vælg venligst et andet.", error: true }); slotCache = null; loadSlots(); return; }
      if (!res.ok) throw new Error("meeting");
      const data = await res.json();
      if (data?.meetingStatus && data.meetingStatus !== "booked") { setStatus({ msg: "Tidspunktet kunne ikke bookes. Vælg venligst et andet.", error: true }); slotCache = null; loadSlots(); return; }
      try { sessionStorage.removeItem(STORE); } catch { /* ignore */ }
      booking.current = null; setStatus({ msg: "", error: false }); setStep("done");
    } catch { setStatus({ msg: "Booking mislykkedes. Vælg venligst et andet tidspunkt.", error: true }); slotCache = null; loadSlots(); }
  }

  // group slots by day, cap MAX_DAYS
  const groups: { label: string; items: Slot[] }[] = [];
  if (Array.isArray(slots)) {
    const byKey: Record<string, { label: string; items: Slot[] }> = {};
    for (const s of slots) { const k = DAY_FMT.format(new Date(s.start)); if (!byKey[k]) { byKey[k] = { label: k, items: [] }; groups.push(byKey[k]); } byKey[k].items.push(s); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card text-foreground">
        <DialogHeader><DialogTitle className="font-display">Book et 30-min sparringsmøde</DialogTitle><DialogDescription>Vælg et tidspunkt der passer dig. 30 min., online.</DialogDescription></DialogHeader>

        {step === "form" && (
          <form onSubmit={submitLead} className="space-y-3">
            <input className="booking-input" placeholder="Navn" value={f.navn} onChange={(e) => setF({ ...f, navn: e.target.value })} aria-label="Navn" />
            <input className="booking-input" placeholder="Virksomhed" value={f.virksomhed} onChange={(e) => setF({ ...f, virksomhed: e.target.value })} aria-label="Virksomhed" />
            <input className="booking-input" placeholder="Hjemmeside (valgfri)" value={f.hjemmeside} onChange={(e) => setF({ ...f, hjemmeside: e.target.value })} aria-label="Hjemmeside" />
            <input className="booking-input" type="email" placeholder="E-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-label="E-mail" />
            <textarea className="booking-input" rows={2} placeholder="Note (valgfri)" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} aria-label="Note" />
            <label className="flex gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={f.nyhedsbrev} onChange={(e) => setF({ ...f, nyhedsbrev: e.target.checked })} /><span>Ja tak, hold mig opdateret om AI i danske virksomheder. Afmeld når som helst.</span></label>
            <label className="flex gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={f.samtykke} onChange={(e) => setF({ ...f, samtykke: e.target.checked })} /><span>Jeg accepterer, at SOLUTION8 behandler mine oplysninger for at kunne kontakte mig, jf. <a href="https://solution8.ai/privatliv.html" target="_blank" rel="noopener noreferrer" className="underline">privatlivspolitikken</a>.</span></label>
            <button type="submit" disabled={busy} className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60">Vælg tidspunkt</button>
          </form>
        )}

        {step === "slots" && (
          <div className="space-y-4">
            {slots === "loading" && <p className="font-mono text-xs text-muted-foreground">Henter ledige tider ...</p>}
            {slots === null && <button className="text-sm underline" onClick={() => { slotCache = null; loadSlots(); }}>Kunne ikke hente tider. Prøv igen</button>}
            {Array.isArray(slots) && groups.length === 0 && <p className="text-sm text-muted-foreground">Ingen ledige tider i perioden. Skriv til os, så finder vi et tidspunkt.</p>}
            {groups.slice(0, MAX_DAYS).map((g) => (
              <div key={g.label}>
                <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">{g.label}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <button key={s.start} className="rounded border border-border px-3 py-1 text-sm hover:border-primary" onClick={() => { setWhen(s.start); setStep("confirm"); }}>{TIME_FMT.format(new Date(s.start))}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">Bekræft dit tidspunkt</p>
            <p className="text-lg font-display">{DAY_FMT.format(new Date(when))} kl. {TIME_FMT.format(new Date(when))}</p>
            <p className="text-sm text-muted-foreground">30 min., online. Du får en mødeindkaldelse på mail.</p>
            <div className="flex gap-2">
              <button className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground" onClick={confirmBooking}>Bekræft booking</button>
              <button className="rounded-md border border-border px-5 py-2 text-sm" onClick={loadSlots}>Vælg et andet tidspunkt</button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-2">
            <p className="text-lg font-display">Tak, vi ses.</p>
            <p className="text-sm text-muted-foreground">Du har booket {DAY_FMT.format(new Date(when))} kl. {TIME_FMT.format(new Date(when))}. Du får en mødeindkaldelse på mail med et Teams-link.</p>
          </div>
        )}

        <p className={`text-sm ${status.error ? "text-danger" : "text-muted-foreground"}`} aria-live="polite">{status.msg}</p>
      </DialogContent>
    </Dialog>
  );
}
