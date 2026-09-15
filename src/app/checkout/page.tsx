"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CheckoutData = { name: string; email: string; phone: string; delivery: string; address: string; zip: string; city: string; province: string };
const initialData: CheckoutData = { name: "", email: "", phone: "", delivery: "andreani", address: "", zip: "", city: "Córdoba", province: "Córdoba" };

export default function CheckoutPage() {
  const [data, setData] = useState(initialData);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function loadSavedData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setSignedIn(true);
      const [{ data: profile }, { data: address }] = await Promise.all([
        supabase.from("profiles").select("full_name,email,phone").eq("id", user.id).maybeSingle<{ full_name: string | null; email: string; phone: string | null }>(),
        supabase.from("addresses").select("street,street_number,apartment,city,province,postal_code").eq("user_id", user.id).eq("is_default", true).maybeSingle<{ street: string; street_number: string; apartment: string | null; city: string; province: string; postal_code: string }>(),
      ]);
      setData((current) => ({ ...current, name: profile?.full_name || user.user_metadata.full_name || user.user_metadata.name || "", email: profile?.email || user.email || "", phone: profile?.phone || "", address: address ? `${address.street} ${address.street_number}${address.apartment ? `, ${address.apartment}` : ""}` : "", zip: address?.postal_code || "", city: address?.city || current.city, province: address?.province || current.province }));
    }
    void loadSavedData();
  }, []);

  const update = (field: keyof CheckoutData, value: string) => setData((current) => ({ ...current, [field]: value }));
  return <main className="admin"><header className="admin-head"><Link className="brand" href="/"><Image src="/LOGO.jpeg" alt="" width={35} height={35} /> chifle.</Link><Link className="text-link" href="/">Volver al shop</Link></header><div style={{ maxWidth: 720 }}><span className="eyebrow">Paso 01 / Entrega</span><h1>Completá tu pedido.</h1><p style={{ color: "var(--muted)", lineHeight: 1.6 }}>{signedIn ? "Cargamos tus datos guardados. Revisalos antes de continuar." : "Podés comprar como invitado o ingresar para guardar tus datos."}</p>{!signedIn && <Link className="text-link checkout-login" href="/login?next=/checkout">Ingresar para completar más rápido</Link>}<form className="checkout-form"><label>Nombre completo<input required name="name" autoComplete="name" value={data.name} onChange={(event) => update("name", event.target.value)} placeholder="Tu nombre" /></label><label>Email<input required type="email" name="email" autoComplete="email" value={data.email} onChange={(event) => update("email", event.target.value)} placeholder="vos@mail.com" /></label><label>WhatsApp<input required type="tel" name="phone" autoComplete="tel" value={data.phone} onChange={(event) => update("phone", event.target.value)} placeholder="351 ..." /></label><label>Modalidad de entrega<select name="delivery" value={data.delivery} onChange={(event) => update("delivery", event.target.value)}><option value="andreani">Andreani · cotizar según destino</option><option value="cadeteria">Cadetería · Córdoba Capital</option><option value="pickup">Retiro local · Córdoba Capital</option></select></label><label>Dirección<input required={data.delivery !== "pickup"} name="address" autoComplete="street-address" value={data.address} onChange={(event) => update("address", event.target.value)} placeholder="Solo si elegís envío" /></label><div className="form-row"><label>Código postal<input required={data.delivery !== "pickup"} name="zip" inputMode="numeric" value={data.zip} onChange={(event) => update("zip", event.target.value)} placeholder="5012" /></label><label>Localidad<input required={data.delivery !== "pickup"} name="city" value={data.city} onChange={(event) => update("city", event.target.value)} placeholder="Córdoba" /></label></div><label>Provincia<input required={data.delivery !== "pickup"} name="province" value={data.province} onChange={(event) => update("province", event.target.value)} /></label><button className="button-dark full-button" type="button">Continuar a Mercado Pago</button></form><p className="form-note">El pago se procesa de forma segura en Mercado Pago. No guardamos datos de tarjeta.</p></div></main>;
}
