"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = { id: string; name: string; slug: string; parent_id: string | null; is_active: boolean; sort_order: number };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function load() { const { data } = await createClient().from("categories").select("id,name,slug,parent_id,is_active,sort_order").order("sort_order").order("name"); setCategories(data || []); }
  useEffect(() => { void load(); }, []);
  async function createCategory(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setError("");
    const slug = name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!slug) { setError("Ingresá un nombre válido."); return; }
    const { error: insertError } = await createClient().from("categories").insert({ name: name.trim(), slug, parent_id: parentId || null });
    if (insertError) { setError(insertError.message.includes("duplicate") ? "Ya existe una categoría con ese nombre o slug." : "No pudimos crear la categoría."); return; }
    setName(""); setParentId(""); setMessage("Categoría creada."); await load();
  }
  async function toggle(category: Category) { await createClient().from("categories").update({ is_active: !category.is_active }).eq("id", category.id); await load(); }
  return <main className="admin"><header className="admin-head"><div className="admin-brand"><Link className="brand" href="/"><Image src="/LOGO.jpeg" alt="" width={35} height={35} /> chifle.</Link><div><span className="eyebrow">Catálogo</span><h1>Categorías.</h1></div></div><Link className="text-link" href="/admin">Volver al panel</Link></header><nav className="admin-nav" aria-label="Secciones del panel"><Link href="/admin">Pedidos</Link><Link href="/admin/envios">Envíos</Link><Link href="/admin/productos">Productos</Link><Link className="active" href="/admin/categorias">Categorías</Link></nav><div className="catalog-layout"><section className="settings-section"><span className="eyebrow">Nueva categoría</span><h2>Sumá un rubro.</h2><p className="settings-help">Las categorías pueden tener subcategorías y los productos pueden pertenecer a varias.</p><form className="catalog-form" onSubmit={createCategory}><label>Nombre<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Accesorios" required /></label><label>Categoría padre<select value={parentId} onChange={(event) => setParentId(event.target.value)}><option value="">Sin categoría padre</option>{categories.filter((category) => !category.parent_id).map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><button className="button-dark" type="submit">Crear categoría</button>{message && <span className="saved-message" role="status">{message}</span>}{error && <span className="auth-error" role="alert">{error}</span>}</form></section><section className="settings-section"><div className="panel-title-row"><div><span className="eyebrow">Estructura actual</span><h2>{categories.length} categorías.</h2></div><Link className="text-link" href="/admin/productos">Ver productos</Link></div><div className="category-list">{categories.map((category) => <div className={`category-row ${!category.is_active ? "is-muted" : ""}`} key={category.id}><div><strong>{category.parent_id ? "↳ " : ""}{category.name}</strong><small>/{category.slug}</small></div><button className="clear-filters" type="button" onClick={() => toggle(category)}>{category.is_active ? "Desactivar" : "Activar"}</button></div>)}</div></section></div></main>;
}
