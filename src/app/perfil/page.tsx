"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = { id: string; email: string; full_name: string | null; phone: string | null; dni: string | null; avatar_url: string | null };
type Address = { id: string; label: string; recipient_name: string; street: string; street_number: string; apartment: string | null; city: string; province: string; postal_code: string; notes: string | null; is_default: boolean };

const emptyAddress = { label: "Casa", recipient_name: "", street: "", street_number: "", apartment: "", city: "Córdoba", province: "Córdoba", postal_code: "", notes: "", is_default: true };

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [address, setAddress] = useState<Address | typeof emptyAddress>(emptyAddress);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?next=/perfil"; return; }
      await supabase.rpc("claim_profile");
      const [{ data: profileData }, { data: addressData }] = await Promise.all([
        supabase.from("profiles").select("id,email,full_name,phone,dni,avatar_url").eq("id", user.id).single<Profile>(),
        supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).limit(1).maybeSingle<Address>(),
      ]);
      setProfile(profileData);
      if (addressData) setAddress(addressData);
      setLoading(false);
    }
    void load();
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    setMessage(""); setError("");
    const supabase = createClient();
    const { error: profileError } = await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone, dni: profile.dni }).eq("id", profile.id);
    if (profileError) { setError("No pudimos guardar tus datos."); return; }
    const { id: addressId, ...addressValues } = address as Address;
    const addressPayload = { ...addressValues, user_id: profile.id };
    const result = addressId ? await supabase.from("addresses").update(addressPayload).eq("id", addressId) : await supabase.from("addresses").insert(addressPayload);
    if (result.error) { setError("Guardamos el perfil, pero no la dirección."); return; }
    setMessage("Perfil actualizado.");
  }

  async function signOut() { await createClient().auth.signOut(); window.location.href = "/"; }
  if (loading) return <main className="profile-page"><p>Cargando tu perfil...</p></main>;
  if (!profile) return null;

  return <main className="profile-page"><header className="profile-head"><Link className="brand" href="/"><Image src="/LOGO.jpeg" alt="" width={35} height={35} /> chifle.</Link><div><Link className="text-link" href="/">Volver a la tienda</Link><button className="text-button" type="button" onClick={signOut}>Cerrar sesión</button></div></header><div className="profile-layout"><aside className="profile-intro"><span className="eyebrow">Tu cuenta</span><h1>Hola, {profile.full_name || "cliente"}.</h1><p>Guardá tus datos para comprar más rápido y recibir tus pedidos sin volver a completar todo.</p></aside><form className="profile-form" onSubmit={save}><section><span className="eyebrow">Datos personales</span><h2>Sobre vos</h2><label>Nombre completo<input value={profile.full_name || ""} onChange={(event) => setProfile({ ...profile, full_name: event.target.value })} required /></label><label>Email<input value={profile.email} disabled /></label><label>WhatsApp<input value={profile.phone || ""} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} placeholder="351 ..." /></label><label>DNI<input value={profile.dni || ""} onChange={(event) => setProfile({ ...profile, dni: event.target.value })} inputMode="numeric" placeholder="Opcional" /></label></section><section><span className="eyebrow">Entrega</span><h2>Tu dirección principal</h2><div className="form-row"><label>Destinatario<input value={address.recipient_name} onChange={(event) => setAddress({ ...address, recipient_name: event.target.value })} required /></label><label>Etiqueta<input value={address.label} onChange={(event) => setAddress({ ...address, label: event.target.value })} required /></label></div><div className="form-row"><label>Calle<input value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} required /></label><label>Número<input value={address.street_number} onChange={(event) => setAddress({ ...address, street_number: event.target.value })} required /></label></div><label>Piso o departamento<input value={address.apartment || ""} onChange={(event) => setAddress({ ...address, apartment: event.target.value })} placeholder="Opcional" /></label><div className="form-row"><label>Localidad<input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required /></label><label>Código postal<input value={address.postal_code} onChange={(event) => setAddress({ ...address, postal_code: event.target.value })} required /></label></div><label>Provincia<input value={address.province} onChange={(event) => setAddress({ ...address, province: event.target.value })} required /></label><label>Referencias<input value={address.notes || ""} onChange={(event) => setAddress({ ...address, notes: event.target.value })} placeholder="Opcional" /></label></section><button className="button-dark" type="submit">Guardar perfil</button>{message && <p className="saved-message" role="status">{message}</p>}{error && <p className="auth-error" role="alert">{error}</p>}</form></div></main>;
}
