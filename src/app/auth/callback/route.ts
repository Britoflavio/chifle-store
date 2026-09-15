import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login?error=missing_code", requestUrl.origin));

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin));

  await supabase.rpc("claim_profile");
  const { data: profile } = await supabase.from("profiles").select("role").single<{ role: string }>();
  return NextResponse.redirect(new URL(profile?.role === "admin" ? "/admin" : "/", requestUrl.origin));
}
