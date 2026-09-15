"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const [name, setName] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSignedIn(true);
        const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle<{ full_name: string | null }>();
        setName(profile?.full_name || user.user_metadata.full_name || user.user_metadata.name || user.email?.split("@")[0] || "cliente");
      }
      setLoading(false);
    }
    void loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => void loadUser());
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!signedIn) return <Link className="nav-action" href="/login">Ingresar</Link>;
  return <Link className="nav-action user-greeting" href="/perfil">Hola, {name}</Link>;
}
