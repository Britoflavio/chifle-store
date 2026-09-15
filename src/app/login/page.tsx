"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loginWithGoogle() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: authError } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (authError) throw authError;
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "No pudimos iniciar sesión.");
      setLoading(false);
    }
  }

  return <main className="auth-page"><div className="auth-card"><Link className="brand" href="/"><Image src="/LOGO.jpeg" alt="" width={35} height={35} /> chifle.</Link><span className="eyebrow">Acceso a Chifle</span><h1>Entrá a tu cuenta.</h1><p>Usá Google para administrar pedidos o consultar tus compras.</p><button className="google-button" type="button" onClick={loginWithGoogle} disabled={loading}>{loading ? "Conectando..." : "Continuar con Google"}</button>{error && <p className="auth-error" role="alert">{error}</p>}<Link className="text-link" href="/">Volver a la tienda</Link></div></main>;
}
